// V12.3 — C8.8 closure pass for the last annotated card definitions.
// Definitions already covered by canonical handlers in C6/C7/C8.1/C8.6 are removed.
import { gameEvents } from '../event-bus.js';
import { calculateCharacteristics } from '../continuous-effects.js';

const sides=['player','ai'];
const opp=s=>s==='player'?'ai':'player';
const find=(state,ref)=>{const id=ref?.uid||ref?.objectId||ref?.id||ref;return sides.flatMap(s=>state[s]?.battlefield||[]).find(p=>p.uid===id||p.objectId===id)||null;};
const isCreature=p=>/Creature/i.test(String(p?.type||''));
const isLand=p=>/Land/i.test(String(p?.type||''));
const isArtifact=p=>/Artifact/i.test(String(p?.type||''));
const reg=(r,t,f)=>r.has(t)?r.register(t,f,{replace:true}):r.register(t,f);

export function registerC88Effects(registry){
  // V12.3: all C8.8 effect types are now registered by earlier C6/C7/C8 modules.
  // This function is kept for forward compatibility but currently registers nothing new.
  const reg=(t,f)=>{if(!registry.has(t))registry.register(t,f);};
  // artifactDamage is handled inline by extended-effects or atomic-effects
  // BUG F (audit v12.66) : StackController#pushTrigger fixe toujours
  // item.target=null pour un déclencheur -- donc ctx.targetInfo est
  // toujours null ici, jamais utilisable. De plus le handler cherchait à
  // infliger des dégâts à un PERMANENT (via damageMarked), alors que le
  // texte réel de Warp Artifact inflige les dégâts AU JOUEUR contrôlant
  // l'artefact enchanté. La cible réelle se retrouve via
  // ctx.sourceCard.attachedTo (Warp Artifact est une Aura, sourceCard =
  // trigger.source = le permanent Warp Artifact lui-même), puis on
  // applique la perte de vie au contrôleur de cet artefact via le chemin
  // canonique (applyDamageToPlayer, respecte remplacements/prévention),
  // le même que le handler 'damage' générique d'atomic-effects.js.
  reg('artifactDamage',(ctx,e)=>{
    const enchanted=find(ctx.state,ctx.sourceCard?.attachedTo);
    if(!enchanted)return;
    const side=sides.find(s=>ctx.state[s]?.battlefield?.includes(enchanted));
    if(!side)return;
    const amount=Number(e.amount||1);
    const result=ctx.api?.applyDamageToPlayer?ctx.api.applyDamageToPlayer(side,amount,{color:ctx.sourceCard?.color?.[0]||null,source:ctx.sourceCard}):null;
    if(!result){ctx.state[side].life-=amount;}
  });
}

export function installC88EventRules(){
  // V12.3: event rules consolidated in C6/C7/C8.6 install functions.
  // Kept as no-op hook for future expansion.
}
