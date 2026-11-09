// V12.1 — canonical replacement/prevention service.
import { effectiveTypes, hasProtectionFromColors } from './continuous-effects.js';
// Replacements are applied as event transformations. The service keeps the
// older convenience methods for compatibility, but all complex callers can
// use replaceEvent() to re-evaluate after each transformation.
function sameObjectIdentity(a, b) {
  if (a === b) return true;
  const aIds = [a?.uid, a?.objectId, a?.id].filter(Boolean);
  const bIds = [b?.uid, b?.objectId, b?.id].filter(Boolean);
  return aIds.some(id => bIds.includes(id));
}

export class ReplacementService {
  constructor({state, choiceService = null}){this.getState=state; this.choiceService=choiceService; this.maxIterations=16;}
  addPreventionShield(side,shield){const s=this.getState()[side];s.prevention=Array.isArray(s.prevention)?s.prevention:[];s.prevention.push({amount:Number(shield.amount||0),color:shield.color||null,source:shield.source||null,sourceType:shield.sourceType||null,scope:shield.scope||'controller',nonFlyingOnly:!!shield.nonFlyingOnly,combatOnly:!!shield.combatOnly,until:shield.until||'nextMatchingDamage',persistent:!!shield.persistent,gainLife:!!shield.gainLife,once:!!shield.once,requireSource:!!shield.requireSource,target:shield.target||null,leave:shield.leave??null}); /* V12.76 (G31) : `target` (bouclier sur UN permanent) et `leave` (« tout sauf N ») étaient PERDUS par cette liste fixe de champs */}
  replaceDamageLifeLoss(side, amount, meta = {}) {
    const state = this.getState(), player = state[side], n = Math.max(0, Number(amount || 0));
    if (!player || n <= 0) return { replaced:false, loss:n, prevented:0 };
    const hasAli=(player.battlefield||[]).some(p=>p.name==='Ali from Cairo'&&p.controller===side);
    if (!hasAli || player.life-n>=1) return { replaced:false, loss:n, prevented:0 };
    const loss=Math.max(0,player.life-1);
    return { replaced:true, loss, prevented:n-loss, source:'Ali from Cairo' };
  }
  preventDamage(side,amount,color=null,source=null,meta={}){
    const state=this.getState(), s=state[side]; let remaining=Math.max(0,Number(amount||0));
    const shields=Array.isArray(s?.prevention)?s.prevention:[];
    // V12.76 (G32) : Desert Nomads — « prévenez toutes les blessures que lui infligent les Déserts » (mot-clé de la carte ; la source est un permanent de sous-type Desert).
    if(meta?.targetType==='permanent'&&meta.target&&[].concat(meta.target.static||[]).some(e=>e&&e.type==='preventDamageFromSubtype'&&source&&String(source.subtype||'').toLowerCase().split(/\s+/).includes(String(e.sourceSubtype).toLowerCase()))) return {prevented:remaining,remaining:0};
    for(const sh of shields){
      if(remaining<=0)break;
      if(sh.color&&sh.color!==color)continue;
      if(sh.source&&source&&!sameObjectIdentity(sh.source,source))continue;
      // V12.75 (Reverse Damage) : un bouclier à source CHOISIE ne s'applique jamais à une blessure de source inconnue, ni aux permanents.
      if(sh.requireSource&&(!source||!sh.source))continue;
      if(sh.scope==='playerOnly'&&meta.targetType==='permanent')continue;
      if(sh.sourceType&&!String(source?.type||'').includes(sh.sourceType))continue;
      if(sh.nonFlyingOnly&&(meta.combat!==true||!source||!String(source.type||'').includes('Creature')||source.flying||source.keywords?.flying))continue;
      if(sh.combatOnly&&meta.combat!==true)continue;
      // BUG (audit v12.69, Samite Healer) : un bouclier de prévention peut être
      // ciblé sur UN permanent précis (sh.target), pas sur tout le côté --
      // sans ce filtre, un bouclier posé sur une créature protégerait aussi
      // le joueur et toute autre créature du même côté.
      if(sh.target&&meta.target&&sh.target!==meta.target)continue;
      if(sh.scope==='controllerAndCreatures'&&meta.targetType==='permanent'&&meta.targetController!==side)continue;
      // V12.76 (G31) : `leave: N` = « prévenez toutes ces blessures SAUF N » (Forcefield) ; sinon prévention de `amount` blessures au plus.
      const used=sh.leave!=null ? Math.max(0,remaining-Math.max(0,Number(sh.leave))) : Math.min(remaining,Math.max(0,Number(sh.amount||0)));
      if(sh.leave==null) sh.amount-=used; remaining-=used;
      if(sh.gainLife)s.life+=used;
      if(sh.once&&(used>0||sh.leave!=null))sh.amount=0; // « la PROCHAINE fois » : un seul événement de blessures (même si « tout sauf N » n'a rien retiré)
    }
    // V12.76 (G31) : un bouclier n'est retiré que s'il est ÉPUISÉ (ou `once` après usage). L'ancien filtre retirait tout bouclier `nextMatchingDamage` à CHAQUE événement de
    // blessures du même camp, même sans correspondance : un bouclier posé sur une créature disparaissait dès qu'une AUTRE créature était blessée. L'expiration « ce tour-ci »
    // est assurée par le nettoyage (turn-manager.js).
    s.prevention=shields.filter(x=>x.amount>0);
    return {prevented:Number(amount||0)-remaining,remaining};
  }
  replaceZoneChange({object,from,to,fromSide,toSide,reason}){
    const state=this.getState();
    for(const side of ['player','ai']) for(const p of state[side].battlefield||[]){
      const reps=p.replacementEffects||(p.replacement?[p.replacement]:[]);
      for(const effect of reps){
        if(effect.event!=='zoneChange'&&effect.type!=='zoneChange')continue;
        if(effect.from&&effect.from!==from)continue; if(effect.to&&effect.to!==to)continue;
        if(effect.selfOnly&&p.uid!==object.uid)continue;
        if(effect.action==='exile'&&to!=='exile')return{replaced:true,zone:'exile',reason:reason+':replacement',source:p};
        if(effect.action==='hand'&&to!=='hand')return{replaced:true,zone:'hand',reason:reason+':replacement',source:p};
      }
    }
    return {replaced:false};
  }

  /** V12.2 canonical damage application. All player damage now flows through
   * the replacement/prevention pipeline exactly once. */
  applyDamageToPlayer(side, amount, { color=null, source=null, meta={} } = {}) {
    const state=this.getState(), player=state?.[side];
    if(!player) return {amount:0, prevented:0, loss:0, event:null};
    const raw=Math.max(0, Number(amount||0));
    if(raw<=0) return {amount:0, prevented:0, loss:0, event:null};
    const result=this.replaceEvent({
      kind:'damage', targetType:'player', targetSide:side, amount:raw,
      color, source, meta:{...meta, targetType:'player', targetController:side}
    });
    const finalAmount=Math.max(0, Number(result.event?.amount||0));
    player.life-=finalAmount;
    this.#spiritLink(source, finalAmount);
    return { amount:finalAmount, prevented:Math.max(0,raw-finalAmount), loss:finalAmount, event:result.event, applied:result.applied };
  }

  /**
   * V12.75 — Spirit Link : « à chaque fois que la créature enchantée inflige des blessures, vous gagnez autant de PV ».
   * Le gain va au CONTRÔLEUR DE L'AURA, calculé à partir des blessures réellement infligées (après prévention), à chaque
   * événement de blessures. Dynamique : si l'Aura quitte le jeu, plus de gain. (L'ancien code posait un drapeau sur la
   * créature que personne ne lisait.)
   */
  spiritLinkGain(source, dealt){ this.#spiritLink(source, dealt); }
  #spiritLink(source, dealt){
    if(!source||!(dealt>0)||!source.uid) return;
    const st=this.getState();
    for(const sd of ['player','ai']) for(const aura of (st?.[sd]?.battlefield||[])){
      if(aura.attachedTo===source.uid && (aura.auraEffect?.type==='spiritLink' || aura.effect?.type==='spiritLink')) st[aura.controller||sd].life+=dealt;
    }
  }

  /** V12.2 canonical damage marker for permanents. */
  applyDamageToPermanent(target, amount, { color=null, source=null, meta={} } = {}) {
    if(!target) return {amount:0, prevented:0, event:null};
    const side=this.getState().player?.battlefield?.includes(target)?'player':
      (this.getState().ai?.battlefield?.includes(target)?'ai':target.controller);
    const raw=Math.max(0,Number(amount||0));
    if (hasProtectionFromColors(this.getState(), target, color ? [color] : effectiveTypes(this.getState(), source).color)) {
      return {amount:0,prevented:raw,event:{kind:'damage',targetType:'permanent',target:target.uid,amount:0}};
    }
    const prevented=this.preventDamage(side,raw,color,source,{...meta,targetType:'permanent',targetController:target.controller||side,target});
    target.damageMarked=(target.damageMarked||0)+Math.max(0,prevented.remaining);
    this.#spiritLink(source, Math.max(0,prevented.remaining));
    return {amount:Math.max(0,prevented.remaining),prevented:Math.max(0,prevented.prevented),event:{kind:'damage',targetType:'permanent',target:target.uid,amount:Math.max(0,prevented.remaining)}};
  }

  /** Apply event replacements repeatedly until no replacement applies. */
  replaceEvent(event={}){
    let current={...event}; let changed=false; const applied=[]; const usedReplacements=new Set();
    for(let i=0;i<this.maxIterations;i++){
      let next=null;
      if(current.kind==='damage' && current.targetType==='player'){
        const prevented=this.preventDamage(current.targetSide,current.amount,current.color,current.source,current.meta||{});
        if(prevented.prevented>0){ next={...current,amount:prevented.remaining,prevented:(current.prevented||0)+prevented.prevented}; }
        else next=current;
        if(next.amount>0){ const r=this.replaceDamageLifeLoss(current.targetSide,next.amount,current.meta||{}); if(r.replaced){ next={...next,amount:r.loss,prevented:(next.prevented||0)+r.prevented,lifeLossReplaced:true}; } }
        if(next!==current){changed=true; applied.push('damage'); current=next; if(current.amount<=0)break; continue;}
      }
      const candidates=[];
      for(const side of ['player','ai']) for(const p of this.getState()[side]?.battlefield||[]){
        for(const [index, r] of (p.replacementEffects||[]).entries()) if((r.event===current.kind||r.event==='any') && !usedReplacements.has(`${p.uid||p.objectId||p.id||p.name||side}:${index}`)) candidates.push({source:p,effect:r,index, key:`${p.uid||p.objectId||p.id||p.name||side}:${index}`});
      }
      const applicable=candidates.filter(({effect})=>!effect.condition||effect.condition(current));
      if(!applicable.length) break;

      // CR 616.1 / 616.2: when several replacement effects can modify the
      // same event, the affected player chooses which applicable replacement
      // to apply first. The choice service is deliberately optional so the
      // low-level service remains usable in tests/headless mode; without a
      // chooser we retain a stable fallback order.
      applicable.sort((a,b)=>String(a.source.uid||a.source.objectId||a.source.id||'').localeCompare(String(b.source.uid||b.source.objectId||b.source.id||'')));
      let hit=applicable[0];
      if(applicable.length>1 && this.choiceService?.request){
        const controller=current.targetSide || current.controller || applicable[0].source?.controller || 'player';
        const chosen=this.choiceService.request({
          type:'replacement-order',
          controller,
          prompt:'Choisissez quel effet de remplacement appliquer en premier.',
          options:applicable.map(x=>x.source),
          min:1,
          max:1,
          defaultValue:applicable[0].source,
        });
        if(chosen) { const selectedId = chosen?.uid || chosen?.objectId || chosen?.id; hit=applicable.find(x=>x.source===chosen || (selectedId && (x.source?.uid===selectedId || x.source?.objectId===selectedId || x.source?.id===selectedId))) || hit; }
      }
      const r=hit.effect.transform ? hit.effect.transform(current,hit.source,this.getState()) : null;
      if(!r)break;
      usedReplacements.add(hit.key);
      current={...current,...r}; applied.push(hit.source?.name||'replacement'); changed=true;
    }
    return {event:current,changed,applied,iterations:applied.length};
  }
}
