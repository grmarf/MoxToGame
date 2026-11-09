// @ts-check
/** M2 — Combat engine: legal attackers/blockers, evasion, first/double strike, trample and damage. */
import { gameEvents } from './event-bus.js';
import { tapPermanent } from './permanent-tap.js';
import { keywordsOf, normalizeKeyword } from './keywords.js';
import { payMana } from './costs/mana-cost.js';
import { applyContinuousEffects, effectiveKeywords, calculateCharacteristics, effectiveTypes, hasProtectionFromColors } from './continuous-effects.js';
export const CombatPhase = Object.freeze({ BEGIN_COMBAT:'beginCombat', DECLARE_ATTACKERS:'declareAttackers', DECLARE_BLOCKERS:'declareBlockers', COMBAT_DAMAGE:'combatDamage', END_COMBAT:'endCombat' });
export class CombatService {
constructor({ state, sba = null, replacements = null }) { this.getState = state; this.sba = sba; this.replacements = replacements; this.combat = null; }
get isActive(){ return !!this.combat; }
get currentPhase(){ return this.combat?.phase ?? null; }
begin(){ this.combat={phase:CombatPhase.BEGIN_COMBAT, attackers:[], blockers:{}, bands:[], attackingSide:null, defendingSide:null, damageStep:0, combatDamageAssigned:false}; return this.combat; }
toDeclareAttackers(attackers=[], side=null, bands=[]){
if(!this.combat) this.begin();
const state=this.getState(); const attackingSide=side || state.activePlayer;
if(state.activePlayer!==attackingSide) throw new Error('Seul le joueur actif peut déclarer les attaquants.');
this.combat.phase=CombatPhase.DECLARE_ATTACKERS; this.combat.attackingSide=attackingSide; this.combat.defendingSide=attackingSide==='player'?'ai':'player';
const legal=this.#payAttackTaxes(attackers.filter(a=>this.#canAttack(a,attackingSide)),attackingSide); const required=this.getState()[attackingSide].battlefield.filter(a=>this.#canAttack(a,attackingSide)&&this.#mustAttack(a)); const maxA=this.#limit('attackLimit'); if(legal.length>maxA) throw new Error(`Pas plus de ${maxA} créatures ne peuvent attaquer à chaque combat.`); if(legal.length<maxA && required.some(r=>!legal.some(a=>a.uid===r.uid))) throw new Error('Une créature qui doit attaquer n’a pas été déclarée.'); this.combat.attackers=legal; for(const a of legal){ a.attackedTurn=this.getState().turnNumber; a.attackedFlag=true; } // attackedFlag : « a attaqué lors du dernier tour de son contrôleur » (Tangle Kelp), remis à zéro à SON étape de dégagement // V12.76 (G29) : « a attaqué ce tour-ci » (Berserk, Siren's Call)
this.combat.bands=this.#validateBands(bands);
return this.combat;
}
confirmAttackers(attackers, side=null, bands=[]){
this.toDeclareAttackers(attackers,side,bands);
for(const a of this.combat.attackers){ a.lastAttackedTurn=this.getState().turnNumber; if(!this.#hasKeyword(a,'vigilance')) tapPermanent(this.getState(),a,{reason:'attack',side:this.combat.attackingSide}); }
this.combat.phase=CombatPhase.DECLARE_BLOCKERS;
gameEvents.emit({type:'attackersDeclared',attackers:this.combat.attackers,attackingSide:this.combat.attackingSide});
return this.combat;
}
assignBlockers(blockerMap){
if(!this.combat || this.combat.phase!==CombatPhase.DECLARE_BLOCKERS) throw new Error('Déclaration des bloqueurs invalide.');
const state=this.getState(), defending=this.combat.defendingSide; const used=new Map(); this.combat.blockers={};
for(const [attackerUid, blockerUids] of Object.entries(blockerMap||{})){
const attacker=this.combat.attackers.find(a=>a.uid===attackerUid); if(!attacker) continue;
const blockers=(blockerUids||[]).map(uid=>this.#findBlocker(uid,defending)).filter(Boolean);
if(this.#hasKeyword(attacker,'menace') && blockers.length===1) throw new Error('Une créature avec menace doit être bloquée par au moins deux créatures.');
for(const b of blockers){ const blocksNow=(used.get(b.uid)||0)+1; if(blocksNow>1+this.#extraBlocks(b)) throw new Error('Une créature ne peut bloquer qu’un seul attaquant.'); used.set(b.uid,blocksNow); if(!this.#canBlock(b,attacker,defending)) throw new Error(`Blocage illégal par ${b.name}.`); }
this.combat.blockers[attackerUid]=blockers;
const rampageKw=this.#keywords(attacker).find(k=>/^rampage\d+$/.test(k));
if(rampageKw && blockers.length>1){
const n=parseInt(rampageKw.replace('rampage',''),10);
const bonus=n*(blockers.length-1);
if(!attacker.tempBuffs) attacker.tempBuffs=[];
attacker.tempBuffs.push({power:bonus,toughness:bonus});
}
}
/* V12.76 : l'obligation « bloquée par toutes les créatures qui peuvent » (Blaze of Glory, Lure) n'était vérifiée que pour les attaquants PRÉSENTS dans la déclaration : ne déclarer aucun blocage la contournait. On vérifie maintenant chaque attaquant concerné, une fois toutes les affectations connues (une créature déjà employée ailleurs est exemptée). */
for(const attacker of this.combat.attackers){ if(!(attacker.mustBeBlocked || this.#keywords(attacker).includes('lure'))) continue; const mine=this.combat.blockers[attacker.uid]||[]; const candidates=this.getState()[defending].battlefield.filter(b=>this.#canBlock(b,attacker,defending)&&!mine.some(x=>x.uid===b.uid)&&(used.get(b.uid)||0)<1+this.#extraBlocks(b)); if(candidates.length) throw new Error(`${attacker.name} doit être bloquée par toutes les créatures qui peuvent la bloquer.`); }
const maxB=this.#limit('blockLimit'); if(used.size>maxB) throw new Error(`Pas plus de ${maxB} créatures ne peuvent bloquer à chaque combat.`);
for(const band of (this.combat.bands||[])){
const union=[]; const seenUids=new Set();
for(const uid of band){
for(const b of (this.combat.blockers[uid]||[])){
if(!seenUids.has(b.uid)){ seenUids.add(b.uid); union.push(b); }
}
}
if(union.length>0){ for(const uid of band){ this.combat.blockers[uid]=union.slice(); } }
}
this.combat.phase=CombatPhase.COMBAT_DAMAGE; this.combat.damageStep=0; gameEvents.emit({type:'blockersDeclared',blockers:this.combat.blockers,attackers:this.combat.attackers});
// V12.76 (G28) : un événement par paire (attaquant, bloqueur) et un par attaquant NON bloqué (Venom, Infinite Authority, Farrel's Mantle).
{ const st=this.getState(); const all=[...st.player.battlefield,...st.ai.battlefield]; const byUid=(x)=>(x&&typeof x==='object')?x:all.find(p=>p.uid===x);
  for(const at of this.combat.attackers){ const bl=(this.combat.blockers[at.uid]||[]).map(byUid).filter(Boolean);
    if(!bl.length) gameEvents.emit({type:'attackerUnblocked',attacker:at,attackingSide:this.combat.attackingSide,side:this.combat.attackingSide});
    else for(const b of bl) gameEvents.emit({type:'creatureBlocked',attacker:at,blocker:b,attackingSide:this.combat.attackingSide,side:this.combat.attackingSide}); } }
return this.combat;
}
confirmBlockers(map){ if(map) this.assignBlockers(map); if(!this.combat) return null; this.combat.phase=CombatPhase.COMBAT_DAMAGE; return this.combat; }
resolveDamage(blockerDamageSplit={}){
if(!this.combat || this.combat.phase!==CombatPhase.COMBAT_DAMAGE) throw new Error('Les blessures ne peuvent être résolues hors de la phase de blessures.');
// V12.75 : Fog / Holy Day / Darkness posent state.fogActive, mais RIEN ne le lisait : ces sorts (Fog était déjà
// certifié) ne prévenaient aucun dégât. Toutes les blessures de combat de ce tour sont prévenues.
if(this.getState().fogActive){ this.combat.combatDamageAssigned=true; this.combat.damageStep=2; return []; }
const all=[]; const first=this.#resolveDamageStep(true,blockerDamageSplit); all.push(...first);
if(this.sba) this.sba.check(this.getState());
all.push(...this.#resolveDamageStep(false,blockerDamageSplit));
if(this.sba) this.sba.check(this.getState());
for (const event of all) gameEvents.emit(event); this.combat.combatDamageAssigned=true; this.combat.damageStep=2; return all;
}
end(){ const s=this.combat?{...this.combat}:null; this.combat=null; return s; }
getValidAttackers(side){ return this.getState()[side].battlefield.filter(p=>this.#canAttack(p,side)); }
getValidBlockers(side,attacker=null){ return this.getState()[side].battlefield.filter(p=>this.#canBlock(p,attacker,side)); }
#validateBands(bands){
const attackerUids=new Set(this.combat.attackers.map(a=>a.uid));
const seen=new Set();
const validated=[];
for(const band of (bands||[])){
const members=Array.isArray(band)?[...band]:[];
for(const uid of members){ if(!attackerUids.has(uid)) throw new Error(`Regroupement : la créature ${uid} n'est pas une attaquante déclarée.`); }
for(const uid of members){ if(seen.has(uid)) throw new Error(`Regroupement : la créature ${uid} appartient à plusieurs groupes.`); seen.add(uid); }
let withoutBanding=0;
for(const uid of members){ const creature=this.combat.attackers.find(a=>a.uid===uid); if(!this.#keywords(creature).includes('banding')) withoutBanding++; }
if(withoutBanding>1) throw new Error('Regroupement : un groupe ne peut contenir qu’au maximum une créature sans le mot-clé banding.');
if(members.length>0 && withoutBanding===members.length) throw new Error('Regroupement : un groupe doit contenir au moins une créature avec le mot-clé banding (702.22c).');
validated.push(members);
}
return validated;
}
#resolveDamageStep(firstStrike, blockerDamageSplit={}){
const events=[]; const state=this.getState();
if(firstStrike) for(const a of this.combat.attackers) a._firstStrikeDealt=false;
const blockedAttackersByBlocker=new Map();
for(const attacker of [...this.combat.attackers]){
for(const blocker of this.combat.blockers[attacker.uid]||[]){
if(!blockedAttackersByBlocker.has(blocker)) blockedAttackersByBlocker.set(blocker,[]);
blockedAttackersByBlocker.get(blocker).push(attacker);
}
}
for(const [blocker, blockedAttackers] of blockedAttackersByBlocker){
if(blockedAttackers.length<2) continue;
if(!this.getState()[this.combat.defendingSide].battlefield.some(p => p.uid === blocker.uid)) continue;
if(!this.#hasDamageAbility(blocker,firstStrike)) continue;
const split=(blockerDamageSplit||{})[blocker.uid];
if(!split) throw new Error(`Regroupement : le bloqueur ${blocker.name||blocker.uid} bloque ${blockedAttackers.length} attaquants ; la répartition de ses blessures doit être fournie dans blockerDamageSplit.`);
let total=0;
for(const attacker of blockedAttackers){
const amount=split[attacker.uid];
if(typeof amount!=='number') throw new Error(`Regroupement : la répartition des blessures de ${blocker.name||blocker.uid} doit fournir un montant pour l'attaquant ${attacker.name||attacker.uid}.`);
total+=amount;
}
const effectivePower=this.#effectivePT(blocker).power;
if(total!==effectivePower) throw new Error(`Regroupement : la somme de la répartition des blessures de ${blocker.name||blocker.uid} (${total}) ne correspond pas à sa force effective (${effectivePower}).`);
}
for(const attacker of [...this.combat.attackers]){
if(!this.getState()[this.combat.attackingSide].battlefield.some(p => p.uid === attacker.uid)) continue;
if(!this.#hasDamageAbility(attacker,firstStrike)) continue;
const blockers=this.combat.blockers[attacker.uid]||[]; const atk=this.#effectivePT(attacker).power;
if(blockers.length===0){ if(atk>0){ const r=this.#prevent(atk, this.combat.defendingSide, attacker, {targetType:'player',targetController:this.combat.defendingSide,combat:true}); if(r.remaining>0){ if(this.replacements?.applyDamageToPlayer) this.replacements.applyDamageToPlayer(this.combat.defendingSide,r.remaining,{color:attacker?.color?.[0]||null,source:attacker,meta:{combat:true}}); else { const life=this.replacements?.replaceDamageLifeLoss?this.replacements.replaceDamageLifeLoss(this.combat.defendingSide,r.remaining,{source:attacker,combat:true}):{loss:r.remaining}; state[this.combat.defendingSide].life-=life.loss; } } if(r.prevented>0) events.push({type:'combatDamagePrevented',source:attacker,target:this.combat.defendingSide,amount:r.prevented,damageKind:'combat'}); if(r.remaining>0) events.push({type:'combatDamageToPlayer',source:attacker,sourceId:attacker.uid,target:this.combat.defendingSide,amount:r.remaining,damageKind:'combat'}); } continue; }
let remaining=Math.max(0,atk); const ordered=blockers.slice();
for(const [bi,blocker] of ordered.entries()){ if(remaining<=0) break; const lethal=Math.max(0,this.#effectivePT(blocker).toughness-(blocker.damageMarked||0)); /* V12.75 (règle 510.1c) : sans piétinement, l'attaquant assigne TOUTES ses blessures aux bloqueurs ; le surplus va au DERNIER bloqueur. L'ancien code n'assignait que le létal et perdait le reste, ce qui faussait tout effet lié aux blessures réellement infligées (Spirit Link). */ const assigned=(bi===ordered.length-1 && !this.#hasKeyword(attacker,'trample'))?remaining:Math.min(remaining,lethal); const r=this.#prevent(assigned, this.combat.defendingSide, attacker, {targetType:'permanent',targetController:this.combat.defendingSide,combat:true,target:blocker}); blocker.damageMarked=(blocker.damageMarked||0)+r.remaining; this.replacements?.spiritLinkGain?.(attacker,r.remaining); /* V12.75 Spirit Link */ remaining-=assigned; if(r.prevented>0) events.push({type:'combatDamagePrevented',source:attacker,target:blocker,amount:r.prevented,damageKind:'combat'}); if(r.remaining) events.push({type:'combatDamageToCreature',source:attacker,sourceId:attacker.uid,target:blocker,targetId:blocker.uid,amount:r.remaining,damageKind:'combat'}); }
if(remaining>0 && this.#hasKeyword(attacker,'trample')){ const r=this.#prevent(remaining,this.combat.defendingSide,attacker,{targetType:'player',targetController:this.combat.defendingSide,combat:true}); if(r.remaining){ if(this.replacements?.applyDamageToPlayer) this.replacements.applyDamageToPlayer(this.combat.defendingSide,r.remaining,{color:attacker?.color?.[0]||null,source:attacker,meta:{combat:true}}); else { const life=this.replacements?.replaceDamageLifeLoss?this.replacements.replaceDamageLifeLoss(this.combat.defendingSide,r.remaining,{source:attacker,combat:true}):{loss:r.remaining}; state[this.combat.defendingSide].life-=life.loss; } } if(r.prevented) events.push({type:'combatDamagePrevented',source:attacker,target:this.combat.defendingSide,amount:r.prevented,damageKind:'combat'}); if(r.remaining) events.push({type:'combatDamageToPlayer',source:attacker,sourceId:attacker.uid,target:this.combat.defendingSide,amount:r.remaining,damageKind:'combat',excess:true}); }
}
if(firstStrike) for(const a of this.combat.attackers){ const kw=this.#keywords(a); if((kw.includes('first strike')||kw.includes('firststrike')||kw.includes('double strike')||kw.includes('doublestrike')) && this.getState()[this.combat.attackingSide].battlefield.some(p=>p.uid===a.uid)) a._firstStrikeDealt=true; }
for(const [blocker, blockedAttackers] of blockedAttackersByBlocker){
if(!this.getState()[this.combat.defendingSide].battlefield.some(p => p.uid === blocker.uid)) continue;
if(!this.#hasDamageAbility(blocker,firstStrike)) continue;
if(blockedAttackers.length===1){
const attacker=blockedAttackers[0]; const power=this.#effectivePT(blocker).power;
if(power>0){ const r=this.#prevent(power,this.combat.attackingSide,blocker,{targetType:'permanent',targetController:this.combat.attackingSide,combat:true,target:attacker}); attacker.damageMarked=(attacker.damageMarked||0)+r.remaining; this.replacements?.spiritLinkGain?.(blocker,r.remaining); /* V12.75 Spirit Link */ if(r.prevented) events.push({type:'combatDamagePrevented',source:blocker,target:attacker,amount:r.prevented,damageKind:'combat'}); if(r.remaining) events.push({type:'combatDamageToCreature',source:blocker,sourceId:blocker.uid,target:attacker,targetId:attacker.uid,amount:r.remaining,damageKind:'combat'}); }
} else {
const split=(blockerDamageSplit||{})[blocker.uid];
for(const attacker of blockedAttackers){
const amount=split[attacker.uid];
if(amount>0){ const r=this.#prevent(amount,this.combat.attackingSide,blocker,{targetType:'permanent',targetController:this.combat.attackingSide,combat:true,target:attacker}); attacker.damageMarked=(attacker.damageMarked||0)+r.remaining; this.replacements?.spiritLinkGain?.(blocker,r.remaining); /* V12.75 Spirit Link */ if(r.prevented) events.push({type:'combatDamagePrevented',source:blocker,target:attacker,amount:r.prevented,damageKind:'combat'}); if(r.remaining) events.push({type:'combatDamageToCreature',source:blocker,sourceId:blocker.uid,target:attacker,targetId:attacker.uid,amount:r.remaining,damageKind:'combat'}); }
}
}
}
return events;
}
#prevent(amount, side, source, meta){
const target=meta?.targetType==='permanent' ? meta.target : null;
// V12.76 (G26) : Gaseous Form / Demonic Torment (blessures de combat INFLIGÉES ou SUBIES par la créature enchantée) et Artifact Ward (protection contre les artefacts).
if(meta?.combat){ if(source && source.noCombatDamageTurn!=null && source.noCombatDamageTurn===this.getState().turnNumber) return {prevented:amount,remaining:0}; /* V12.76 (G28) Farrel's Mantle */ if(source && this.#keywords(source).includes('nocombatdamagedealt')) return {prevented:amount,remaining:0}; if(target && this.#keywords(target).includes('nocombatdamagereceived')) return {prevented:amount,remaining:0}; }
if(target && source && this.#keywords(target).includes('protectionartifacts') && /Artifact/.test(String(effectiveTypes(this.getState(),source).type||''))) return {prevented:amount,remaining:0};
if(target && hasProtectionFromColors(this.getState(), target, effectiveTypes(this.getState(), source).color)) return {prevented:amount,remaining:0};
return this.replacements?.preventDamage(side, amount, source?.color?.[0] || null, source, meta) || {prevented:0,remaining:amount};
}
#hasDamageAbility(p,first){ const kw=this.#keywords(p); const firstKw=kw.includes('first strike')||kw.includes('firststrike'); const doubleKw=kw.includes('double strike')||kw.includes('doublestrike'); if(first) return firstKw||doubleKw; return !firstKw && (!p._firstStrikeDealt || doubleKw); }
// V12.75 : la célérité ACCORDÉE (Concordant Crossroads...) lève le mal d'invocation, pas seulement celle imprimée.
#canAttack(p,side){ if(!p||!this.getState()[side].battlefield.includes(p)) return false; const c=calculateCharacteristics(this.getState(),p); const kw=c.keywords; return /Creature/.test(String(c.type||''))&&!p.tapped&&(!p.summoningSickness||kw.includes('haste'))&&!p.cantAttack&&!p.attacksDisabled&&!kw.includes('defender')&&!kw.includes('cantattack')&&!this.#attackRestricted(p,kw,side)&&!(this.#attackTax(kw)>this.#manaTotal(side))&&!(/Land/.test(String(c.type||''))&&p.enteredTurn!=null&&p.enteredTurn>=this.getState().turnNumber&&!kw.includes('haste'))&&/* V12.76 : un terrain devenu créature (Living Lands...) arrivé CE tour-ci ne peut pas attaquer */(!p.mustAttack || true); }
#canBlock(b,a,side){ if(!b||!this.getState()[side].battlefield.includes(b)) return false; if(!/Creature/.test(String(b.type||''))||b.tapped||b.cantBlock||b.cantBlockThisTurn) return false; if(a){ const ak=this.#keywords(a), bk=this.#keywords(b); const ac=this.#effectivePT(a); if([].concat(b.static||[]).some(e=>e&&e.type==='cantBlockPowerAtLeast'&&ac.power>=Number(e.power))) return false; /* V12.76 Ironclaw Orcs */ const only=[].concat(a.static||[]).find(e=>e&&e.type==='blockableOnlyBy'); if(only){ const bsub=String(effectiveTypes(this.getState(),b).subtype||'').toLowerCase().split(/\s+/); const okKw=(only.keywords||[]).some(k=>bk.includes(k)); const okSub=(only.subtypes||[]).some(t=>bsub.includes(String(t).toLowerCase())); if(!okKw&&!okSub) return false; } /* V12.76 Elven Riders */ /* V12.75 : `mustBeBlocked` (Blaze of Glory : « doit être bloquée par TOUTES les créatures qui peuvent ») n'est PAS une interdiction de blocage. L'ancienne ligne ici rendait l'attaquant imblocable pour toute créature sans `mustBlock`, ce qui rendait aussi vide le contrôle « toutes doivent bloquer » d'assignBlockers. */ if(ak.includes('flying')&&!bk.includes('flying')&&!bk.includes('reach')) return false; if(ak.includes('unblockable')) return false; if([].concat(a.static||[]).some(e=>e&&e.type==='cantBeBlockedBySubtype'&&String(effectiveTypes(this.getState(),b).subtype||'').toLowerCase().split(/\s+/).includes(String(e.subtype||'').toLowerCase()))) return false; /* V12.75 : Juggernaut / murs */ if(ac.power<=1 && this.#hasStaticUnblockableIfLowPower(a)) return false; if(ak.includes('fear') && !this.#isArtifactOrBlack(b)) return false; if([].concat(a.static||[]).some(e=>e&&e.type==='cantBeBlockedByPowerAtLeast'&&this.#effectivePT(b).power>=e.power)) return false; /* V12.76 (G32) Amrou Kithkin */ if(ak.includes('blockablebywallsonly')&&!String(b.subtype||'').toLowerCase().split(/\s+/).includes('wall')) return false; /* Invisibility */ if(ak.includes('seekerevasion') && !(String(b.type||'').includes('Artifact')||(effectiveTypes(this.getState(),b).color||[]).includes('W'))) return false; /* V12.76 (G26) Seeker */ if(ak.includes('protectionartifacts') && String(effectiveTypes(this.getState(),b).type||'').includes('Artifact')) return false; /* Artifact Ward : pas bloquée par une créature-artefact */ if(ak.includes('intimidate') && !this.#isArtifactOrColored(b)) return false; if(ak.includes('swampwalk') && !this.#walkNegated('swampwalk') && this.#hasBasicLandType(this.combat.defendingSide,'Swamp')) return false; if(ak.includes('islandwalk') && !this.#walkNegated('islandwalk') && this.#hasBasicLandType(this.combat.defendingSide,'Island')) return false; if(ak.includes('mountainwalk') && !this.#walkNegated('mountainwalk') && this.#hasBasicLandType(this.combat.defendingSide,'Mountain')) return false; if(ak.includes('forestwalk') && !this.#walkNegated('forestwalk') && this.#hasBasicLandType(this.combat.defendingSide,'Forest')) return false; if(ak.includes('plainswalk') && !this.#walkNegated('plainswalk') && this.#hasBasicLandType(this.combat.defendingSide,'Plains')) return false; if(ak.includes('desertwalk') && this.#hasBasicLandType(this.combat.defendingSide,'Desert')) return false; // V12.75 : la protection de l'ATTAQUANT interdit le blocage par une créature de cette
// couleur (702.16). Le code précédent testait la protection du BLOQUEUR contre la couleur de
// l'attaquant : Wall of Light / White Knight ne pouvaient pas bloquer une créature noire, et
// Mountain Yeti / Black Knight pouvaient être bloqués par la couleur dont ils sont protégés.
const blockerColors=effectiveTypes(this.getState(),b).color; if(this.#hasProtection(a,blockerColors)) return false; } return true; }
#findBlocker(uid,side){ return this.getState()[side].battlefield.find(p=>p.uid===uid)||null; }
#keywords(p){ return effectiveKeywords(this.getState(), p); }
// BUG D (audit v12.66) : déléguait à hasKeyword(p,k) de keywords.js, qui ne
// lit que p.keywords/p.tempKeywords sans jamais recevoir `state` -- donc
// aveugle aux mots-clés accordés par un effet statique ou une Aura
// (addKeyword/unblockable/protection). #keywords(p) ci-dessus utilise déjà
// le pipeline state-aware correct (effectiveKeywords/calculateCharacteristics)
// et sert de référence unique : vigilance/menace/trample doivent voir
// exactement les mêmes mots-clés que le blocage (#canBlock).
#hasKeyword(p,k){ return this.#keywords(p).includes(normalizeKeyword(k)); }
#isArtifactOrBlack(p){ return String(p.type||'').includes('Artifact') || (p.color||[]).includes('B'); }
#isArtifactOrColored(p){ return String(p.type||'').includes('Artifact') || (p.color||[]).length>0; }
#hasStaticUnblockableIfLowPower(a){ const all=[...(this.getState().player.battlefield||[]),...(this.getState().ai.battlefield||[])]; return all.some(s=>[].concat(s.static||[]).some(e=>e&&e.type==='unblockableIfPowerAtMost' && this.#sourceAppliesTo(a,s,e))); }
#sourceAppliesTo(target,source,e){ return (e.controller==='all'||e.controllerFilter==='any') && target && source; }
#isMandatoryBlocker(b){ return !!(b && (b.keywords?.includes('mustBlock') || b.mustBlock || b.mustBlockThisTurn)); }
// V12.75 : Great Wall / Undertow / Quagmire / Crevasse / Deadfall — les créatures avec ce passage peuvent être
// bloquées comme si elles ne l'avaient pas, quel que soit le contrôleur de l'enchantement.
#walkNegated(kw){ const st=this.getState(); return [...st.player.battlefield,...st.ai.battlefield].some(p => [].concat(p.static||[]).some(e => e && e.type==='ignoreLandwalk' && e.landwalk===kw)); }
// V12.75 : obligation d'attaquer = capacité statique (Juggernaut, Erg Raiders : `static: {type:'mustAttack'}`) OU
// drapeau posé par un effet (Siren's Call, Nettling Imp) valable pour CE tour seulement. L'ancien code ne lisait
// que le drapeau `mustAttack`, jamais la capacité statique, et ce drapeau n'expirait jamais.
/** V12.76 (lot G15) : accès public à l'obligation d'attaquer (Juggernaut, Erg Raiders…) pour que l'IA les déclare TOUJOURS (règle, pas stratégie). */
isRequiredToAttack(p){ return this.#mustAttack(p); }
#mustAttack(p){ if([].concat(p.static||[]).some(e=>e&&e.type==='mustAttack')) return true; return !!p.mustAttack && (p.mustAttackTurn==null || p.mustAttackTurn===this.getState().turnNumber); }
// V12.76 (lot G2) : restrictions d'attaque / de blocage lues sur les `static` des permanents en jeu.
#statics(){ const st=this.getState(); return [...st.player.battlefield,...st.ai.battlefield].flatMap(p=>[].concat(p.static||[]).filter(Boolean).map(e=>({p,e}))); }
#limit(type){ const l=this.#statics().filter(x=>x.e.type===type).map(x=>Number(x.e.count)); return l.length?Math.min(...l):Infinity; }
#extraBlocks(b){ return [].concat(b.static||[]).filter(e=>e&&e.type==='extraBlocks').reduce((n,e)=>n+Number(e.count||1),0); }
#attackTax(kw){ const k=(kw||[]).find(x=>/^attacktax\d+$/.test(x)); return k?Number(k.slice(9)):0; } // V12.76 (G26) Brainwash : « ne peut pas attaquer à moins que son contrôleur ne paie {N} »
#manaTotal(side){ return Object.values(this.getState()[side]?.mana||{}).reduce((a,b)=>a+(Number(b)||0),0); }
#payAttackTaxes(legal,side){ let budget=this.#manaTotal(side); const kept=[]; let total=0; for(const a of legal){ const t=this.#attackTax(this.#keywords(a)); if(t>budget) continue; budget-=t; total+=t; kept.push(a); } if(total>0) payMana(this.getState()[side],'{'+total+'}'); return kept; }
#attackRestricted(p,kw,side){ const unless=[].concat(p.static||[]).find(e=>e&&e.type==='cantAttackUnlessDefenderControls'); if(unless&&side){ const def=side==='player'?'ai':'player'; if(!this.getState()[def].battlefield.some(q=>String(calculateCharacteristics(this.getState(),q).subtype||'').split(/\s+/).includes(unless.subtype))) return true; } /* V12.76 : Pirate Ship */ if(this.#statics().some(({e})=>e.type==='cantAttackUnlessKeyword'&&!kw.includes(normalizeKeyword(e.keyword)))) return true; /* Moat */ if([].concat(p.static||[]).some(e=>e&&e.type==='cantAttackIfAttackedLastTurn') && p.lastAttackedTurn===this.getState().turnNumber-2) return true; /* Giant Turtle */ return false; }
attackLimit(){ return this.#limit('attackLimit'); }
blockLimit(){ return this.#limit('blockLimit'); }
#hasBasicLandType(side, subtype){ return this.getState()[side].battlefield.some(p => String(p.type||'').includes('Land') && String(p.subtype||'').split(/\s+/).includes(subtype)); }
#hasProtection(p,colors){ return hasProtectionFromColors(this.getState(), p, colors); }
#effectivePT(p){ const state=this.getState(); const c=applyContinuousEffects(state,p); return {power:c.power,toughness:c.toughness}; }
}
