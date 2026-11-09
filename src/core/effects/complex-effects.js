import { tapPermanent } from '../permanent-tap.js';
import { ZoneManager } from '../zone-manager.js';
// V12.3 — C7 complex / historical card mechanics.
// All damage paths now flow through ReplacementService.applyDamageToPlayer /
// applyDamageToPermanent. Characteristic mutations are kept as markers read
// by calculateCharacteristics where a continuous-effect equivalent exists.
import { gameEvents } from '../event-bus.js';
import { rngClock } from '../rng-clock-service.js';
import { calculateCharacteristics } from '../continuous-effects.js';

const sides = ['player', 'ai'];
const opponent = s => s === 'player' ? 'ai' : 'player';
const isCreature = p => /(^|\s|—)Creature\b/i.test(String(p?.type || ''));
const isLand = p => /(^|\s|—)Land\b/i.test(String(p?.type || ''));
const isBasicLand = p => /Basic/i.test(String(p?.type || '')) || ['Plains','Island','Swamp','Mountain','Forest'].some(x => String(p?.subtype || '').includes(x));
const shuffle = a => rngClock.shuffle(a);

function findPermanent(state, ref) {
  const uid = ref?.uid || ref?.id || ref;
  return sides.flatMap(s => state[s]?.battlefield || []).find(p => p.uid === uid || p.objectId === uid) || null;
}
function moveToGrave(state, side, obj, zones=null) {
  const i = state[side].battlefield.indexOf(obj); if(i<0)return false;
  if(zones){zones.moveToGraveyard(obj,{toSide:obj.owner||side,reason:'effectDestroy'});return true;}
  state[side].battlefield.splice(i,1); state[side].graveyard.push({...obj, zone:'graveyard', objectId:rngClock.uuid('obj')}); return true;
}
function log(ctx,msg,side='system'){ ctx.api?.log?.(msg,side); }

export function registerC7Effects(registry) {
  const reg=(type,fn)=>{ if(!registry.has(type)) registry.register(type,fn); };

  // ── Control effects ──
  // V12.3: stealCreatureUntilEnd still mutates controller directly because
  // control change is not a zone change. The turn-end cleanup is handled
  // by the turn manager scanning for `stolenUntilEnd` markers.
  reg('stealCreatureUntilEnd',(ctx,effect)=>{
    const t=findPermanent(ctx.state,ctx.targetInfo); if(!t)return;
    const from=ctx.api.findPermSide(t), to=ctx.controllerKey; if(from===to)return;
    t.stolenUntilEnd=true; t.summoningSickness=false;
    if(ctx.api?.zones) ctx.api.zones.changeController(t,to,{reason:'stealCreatureUntilEnd'});
    else { ctx.state[from].battlefield.splice(ctx.state[from].battlefield.indexOf(t),1); t.controller=to; ctx.state[to].battlefield.push(t); }
    log(ctx,`${t.name} change de contrôleur jusqu'à la fin du tour.`,to);
  });

  reg('stealArtifact',(ctx)=>{
    const t=findPermanent(ctx.state,ctx.targetInfo); if(!t || !/Artifact/i.test(t.type))return;
    const from=ctx.api.findPermSide(t),to=ctx.controllerKey; if(from===to)return;
    ctx.sourceCard._controlGrantTargetUid = t.uid;
    ctx.sourceCard._controlGrantOriginalController = t.controller || t.owner || from;
    t._controlGrantedByAuraPending = true;
    t._controlGrantOriginalController = t.controller || t.owner || from;
    if(ctx.api?.zones) ctx.api.zones.changeController(t,to,{reason:'stealArtifact'});
    else { ctx.state[from].battlefield.splice(ctx.state[from].battlefield.indexOf(t),1); t.controller=to; ctx.state[to].battlefield.push(t); }
  });

  // ── Combat restrictions (kept as markers; read by combat engine) ──
  reg('forceAttack',(ctx)=>{ const t=findPermanent(ctx.state,ctx.targetInfo); if(t){t.mustAttack=true;t.mustAttackTurn=ctx.state.turnNumber;} });
  // V12.75 : Siren's Call — TOUTES les créatures adverses présentes à la résolution doivent attaquer ce tour si elles le peuvent.
  reg('forceAttackAll',(ctx)=>{ const opp=opponent(ctx.controllerKey); let n=0; for(const p of ctx.state[opp].battlefield){ if(/\bCreature\b/i.test(String(p.type||''))){p.mustAttack=true;p.mustAttackTurn=ctx.state.turnNumber;n++;} } ctx.api.log?.(`${ctx.sourceCard?.name||'Effet'} : ${n} créature(s) adverse(s) doivent attaquer ce tour.`,ctx.controllerKey); });
  reg('mustBeBlocked',(ctx,effect)=>{ const t=findPermanent(ctx.state,ctx.targetInfo); if(t){t.mustBeBlocked=true;t.tempBuffs=[...(t.tempBuffs||[]),{power:Number(effect.power||0),toughness:Number(effect.toughness||0)}];} });
  reg('paralyze',(ctx)=>{const t=findPermanent(ctx.state,ctx.targetInfo);if(t){tapPermanent(ctx.state,t,{reason:'effect'});t.cantUntap=true;t.paralyze=true;}});

  // ── Characteristic changes (V12.3: kept as direct markers for now;
  // full continuous-effect migration is Phase-2 work for aura cleanup) ──
  reg('changeColor',(ctx,effect)=>{const t=findPermanent(ctx.state,ctx.targetInfo);if(t)t.chosenColor=effect.color||null;});
  reg('colorChange',(ctx,effect)=>{const t=findPermanent(ctx.state,ctx.targetInfo);if(t)t.chosenColor=effect.color||null;});
  reg('changeType',(ctx,effect)=>{const t=findPermanent(ctx.state,ctx.targetInfo);if(t){if(effect.subtype)t.subtype=effect.subtype;if(effect.newType)t.type=effect.newType;}});

  reg('flash',(ctx)=>{ctx.sourceCard.flash=true;});
  // V12.75 : Drain Power — « Ajoutez tout le mana non utilisé de l'adversaire » : il passe, couleur par couleur, dans VOTRE
  // réserve (l'ancienne version le détruisait sans rien vous donner).
  reg('drainMana',(ctx)=>{const me=ctx.state[ctx.controllerKey],s=ctx.state[opponent(ctx.controllerKey)];let n=0;for(const c of Object.keys(s.mana)){const v=Number(s.mana[c]||0);if(v>0){me.mana[c]=Number(me.mana[c]||0)+v;n+=v;}s.mana[c]=0;}ctx.api.log?.(`${ctx.sourceCard?.name||'Effet'} : ${n} mana adverse passe dans votre réserve.`,ctx.controllerKey);});
  reg('gainLifePerCardInGraveyard',(ctx,e)=>{const s=ctx.state[opponent(ctx.controllerKey)];ctx.state[ctx.controllerKey].life+=s.graveyard.length*Number(e.multiplier||1);});
  // V12.60 (fix découvert en corrigeant BUG-04) : 'drawOnDeath' était
  // enregistré ici comme effet de RÉSOLUTION IMMÉDIATE, mais Creature Bond
  // (seule carte à utiliser ce type, via son champ `effect`) est une Aura
  // dont le champ `effect` ne représente pas un effet de sort à résoudre au
  // lancer -- resolveTop() (stack.js) voit `item.effect.type==='drawOnDeath'`
  // enregistré et l'exécute immédiatement au moment du lancer, avant même
  // l'attachement de l'aura, ce qui ne correspond à aucun Oracle réel de la
  // carte. Le véritable comportement ("piochez une carte si la créature
  // enchantée meurt") est correctement géré par le système de trigger
  // moderne via `c.triggers` (TriggerCollector, condition enchantedSource,
  // corrigé et testé en V12.59). Ne pas ré-enregistrer 'drawOnDeath' comme
  // effet de résolution de sort.
  reg('gainLifeOnDeath',(ctx)=>{if(ctx.state[ctx.controllerKey].mana.C>0||Object.values(ctx.state[ctx.controllerKey].mana).some(v=>v>0)){ctx.api.payGenericFromPool(ctx.state[ctx.controllerKey],1);ctx.state[ctx.controllerKey].life++;}});

  // ── Damage paths — V12.3 canonical pipeline ──
  // damageAndScry: damage then scry-like library manipulation
  reg('damageAndScry',(ctx,e)=>{
    const n=Number(e.amount||0);
    const t=findPermanent(ctx.state,ctx.targetInfo);
    if(t){
      // V12.3: canonical damage to permanent
      ctx.api.applyDamageToPermanent(t,n,{color:ctx.sourceCard?.color?.[0]||null,source:ctx.sourceCard,meta:{effect:'damageAndScry'}});
    }else if(ctx.targetInfo?.kind==='player'){
      // V12.3: canonical damage to player (prevention + Ali + replacements)
      ctx.api.applyDamageToPlayer(ctx.targetInfo.side,n,{color:ctx.sourceCard?.color?.[0]||null,source:ctx.sourceCard,meta:{effect:'damageAndScry'}});
    }
    const s=ctx.state[ctx.controllerKey];
    if(s.library.length>1){const top=s.library.pop();s.library.push(top);}
    ctx.api.checkStateBasedDeaths();
  });

  // fling: sacrifice source, deal damage equal to its power
  reg('fling',(ctx)=>{
    const t=findPermanent(ctx.state,ctx.targetInfo);
    if(!t)return;
    const power=calculateCharacteristics(ctx.state,t).power;
    const target=ctx.targetInfo?.kind==='player'?null:findPermanent(ctx.state,ctx.targetInfo);
    if(ctx.targetInfo?.kind==='player'){
      // V12.3: canonical damage to player
      ctx.api.applyDamageToPlayer(ctx.targetInfo.side,power,{color:ctx.sourceCard?.color?.[0]||null,source:ctx.sourceCard,meta:{effect:'fling'}});
    }else if(target){
      // V12.3: canonical damage to permanent
      ctx.api.applyDamageToPermanent(target,power,{color:ctx.sourceCard?.color?.[0]||null,source:ctx.sourceCard,meta:{effect:'fling'}});
    }
    ctx.api.destroyPermanent(t);
    ctx.api.checkStateBasedDeaths();
  });

  // V12.3: reverseDamage removed from C7 — it is registered by C6 (canonical shield).
  // Legacy callers in cards-database that use type:'reverseDamage' will resolve via C6.

  reg('pox',(ctx)=>{
    for(const s of sides){
      const st=ctx.state[s];
      st.life-=Math.floor(st.life/3);
      const disc=Math.floor(st.hand.length/3);
      for(let i=0;i<disc;i++)ctx.api.discardCard(s,0);
      const creatures=st.battlefield.filter(isCreature);
      const lands=st.battlefield.filter(isLand);
      for(const p of creatures.slice(0,Math.floor(creatures.length/3)))ctx.api.destroyPermanent(p);
      for(const p of lands.slice(0,Math.floor(lands.length/3)))ctx.api.destroyPermanent(p);
    }
  });

  reg('addManaAbility',(ctx,e)=>{const t=findPermanent(ctx.state,ctx.targetInfo);if(t){t.grantedManaAbility={produces:e.produces||'C',gainLife:Number(e.gainLife||0)};}});

  reg('noop',()=>{});
}

let installed=false;
export function installC7EventRules() {
  if(installed)return; installed=true;
  // (v12.73) L'ancien écouteur 'upkeepStarted' / static 'blackViseLands' a été supprimé : aucune carte
  // n'avait ce static, et Karma / Black Vise sont désormais de vrais déclencheurs (pile, prévention).
  gameEvents.on('permanentEntered',({state,permanent,side,controller})=>{
    if(!state||!permanent)return;
    for(const s of sides){
      const bf=state[s].battlefield||[];
      if(bf.some(p=>p.static?.type==='lifeLossAndManaOnCreatureEnter') && isCreature(permanent)){state[controller||side].life--;state[controller||side].mana.B++;}
      if(bf.some(p=>p.static?.type==='drawOnEnchantmentCast')){/* handled on spellCast */}
      if(bf.some(p=>p.static?.type==='gainLifeOnDeath')){/* handled on death */}
    }
  });
  gameEvents.on('spellCast',({state,card,controller})=>{
    if(!state||!card)return;
    if(/Enchantment/i.test(String(card.type||''))){for(const s of sides){for(const p of state[s].battlefield||[]){if(p.static?.type==='drawOnEnchantmentCast' && p.controller===s && controller===s /* V12.75 : « à chaque fois que VOUS jouez un enchantement » */){if(state[s].library.length){ /* V12.75 : pioche par le chemin canonique des zones (l'ancien push direct laissait la carte marquée « library » alors qu'elle est en main : violation I3 du banc) */ const top=state[s].library[state[s].library.length-1]; new ZoneManager({state:()=>state}).move(top,'hand',{toSide:s,reason:'draw'}); }}}}}
  });
  gameEvents.on('creatureDied',({state,permanent})=>{
    if(!state)return;
    for(const s of sides){for(const p of state[s].battlefield||[]){if(p.static?.type==='gainLifeOnDeath' && p.controller===s){if(Object.values(state[s].mana).some(v=>v>0)){for(const c of ['C','W','U','B','R','G'])if(state[s].mana[c]>0){state[s].mana[c]--;break;}state[s].life++;}}}}
    // V12.60 (fix découvert en corrigeant BUG-04) : la branche
    // `p.effect?.type==='drawOnDeath'` a été retirée d'ici. Elle piochait
    // pour le contrôleur de TOUT permanent portant ce type d'effet dès
    // qu'UNE créature quelconque mourait, sans vérifier laquelle ni le lien
    // d'enchantement (seule Creature Bond utilise ce type). C'était un
    // second mécanisme concurrent au système de trigger moderne
    // (TriggerCollector, condition enchantedSource, corrigé en V12.59), qui
    // est désormais la seule source de vérité pour ce comportement.
  });
  gameEvents.on('manaAdded',({state,side,permanent,amount})=>{
    if(!state||!permanent)return;
    for(const p of state[side].battlefield||[]){if(p.static?.type==='manaFlare' && isLand(permanent)){state[side].mana.C=(state[side].mana.C||0)+Number(amount||1);}}
  });
  gameEvents.on('permanentTapped',({state,permanent,side})=>{
    if(!state||!permanent||!isLand(permanent))return;
    if(!isBasicLand(permanent))for(const s of sides)for(const p of state[s].battlefield||[]){if(p.static?.type==='burnOnNonBasicLandTap')state[side].life--;}
  });
}
