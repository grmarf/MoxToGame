// V9.6 — canonical zone/object manager (M8).
import { gameEvents } from './event-bus.js';
let sequence = 0;
import { rngClock } from './rng-clock-service.js';
function nextId(prefix='obj') { sequence += 1; return `${prefix}_${rngClock.now().toString(36)}_${sequence.toString(36)}`; }
export const ZONES = Object.freeze(['library','hand','battlefield','graveyard','exile']);
export class ZoneManager {
  constructor({ state, replacements = null } = {}) { this.getState = state; this.replacements = replacements; }
  ensureIdentity(obj, { owner=null, controller=null }={}) {
    if (!obj) return obj;
    if (!obj.objectId) obj.objectId=nextId('obj'); if (!obj.uid) obj.uid=nextId('card');
    if (owner && !obj.owner) obj.owner=owner; if (controller) obj.controller=controller; return obj;
  }
  find(ref) { if (!ref) return null; const id=typeof ref==='object'?(ref.uid||ref.objectId||ref.id):ref; if(!id) return null; const state=this.getState(); for(const side of ['player','ai']) for(const zone of ZONES){ const o=(state[side]?.[zone]||[]).find(x=>x?.uid===id||x?.objectId===id); if(o) return {object:o,side,zone}; } return null; }
  ownerOf(obj){ const f=this.find(obj); return obj?.owner||f?.object?.owner||f?.side||null; }
  controllerOf(obj){ const f=this.find(obj); return obj?.controller||f?.object?.controller||(f?.zone==='battlefield'?f.side:null); }
  remove(obj){ const f=this.find(obj); if(!f) return null; const a=this.getState()[f.side][f.zone],i=a.indexOf(f.object); if(i>=0)a.splice(i,1); return f; }
  move(obj,toZone,{toSide=null,controller=null,owner=null,reason='zoneChange',position='top'}={}) {
    if(!ZONES.includes(toZone)) throw new Error(`Zone inconnue: ${toZone}`);
    const before=this.find(obj); if(!before) throw new Error('Objet introuvable pour changement de zone.');
    const state=this.getState(), destinationSide=toSide||owner||before.side; if(!state[destinationSide]) throw new Error('Joueur de destination invalide.');
    if(this.replacements){ const r=this.replacements.replaceZoneChange({object:before.object,from:before.zone,to:toZone,fromSide:before.side,toSide:destinationSide,reason}); if(r?.replaced){toZone=r.zone;reason=r.reason;} }
    this.remove(before.object); const next={...before.object};
    next.zone=toZone; next.owner=next.owner||owner||before.side; next.controller=controller||(toZone==='battlefield'?(next.controller||destinationSide):next.controller);
    next.previousUid=before.object.uid || null; next.previousObjectId=before.object.objectId || null; next.zoneChangeId=nextId('zci'); next.objectId=nextId('obj'); next.uid=nextId(toZone==='battlefield'?'perm':'card'); next.zoneHistory=Array.isArray(before.object.zoneHistory)?[...before.object.zoneHistory]:[]; next.zoneHistory.push({zoneChangeId:next.zoneChangeId,from:before.zone,to:toZone,oldUid:before.object.uid||null,oldObjectId:before.object.objectId||null});
    if(toZone==='battlefield'){ next.enteredTurn=state.turnNumber||1; next.enterSeq=(state.enterSeq=(state.enterSeq||0)+1); next.damageMarked=0; next.destroyed=false; next.attacking=false; next.blocking=false; next.attachedTo=next.attachedTo||null; }
    // position:'bottom' (bibliothèque, règle de Londres) : la pioche se fait par la FIN du tableau.
    if(position==='bottom') state[destinationSide][toZone].unshift(next); else state[destinationSide][toZone].push(next);
    // Bug 10 : préserver attachedTo et mettre à jour les références externes
    next.attachedTo = before.object.attachedTo || null;
    for (const s of ['player', 'ai']) {
        for (const perm of state[s].battlefield) {
            if (perm.attachedTo === before.object.uid || perm.attachedTo === before.object.objectId) {
                perm.attachedTo = next.uid;
            }
        }
    }
    gameEvents.emit({type:'zoneChanged',object:next,from:before.zone,to:toZone,fromSide:before.side,toSide:destinationSide,reason,oldObjectId:before.object.objectId,zoneChangeId:next.zoneChangeId});
    if(before.zone==='battlefield'&&toZone!=='battlefield') gameEvents.emit({type:'permanentLeft',permanent:next,side:before.side,to:toZone,reason,oldObjectId:before.object.objectId}); // V12.76 (G27) : « quand cet permanent quitte le champ de bataille » (Goblin Shrine)
    return next;
  }
  enterBattlefield(card,side,{controller=side,reason='enterBattlefield'}={}) { const f=this.find(card); if(f){ const moved=this.move(card,'battlefield',{toSide:side,controller,reason}); moved.damageMarked=moved.damageMarked||0; if(moved.entersTapped||card.entersTapped) moved.tapped=true; /* V12.76 : « arrive engagé » */ return moved; } const copy=this.ensureIdentity({...card},{owner:card.owner||side,controller}); copy.zone='battlefield'; copy.enteredTurn=this.getState().turnNumber||1; copy.enterSeq=(this.getState().enterSeq=(this.getState().enterSeq||0)+1); copy.damageMarked=0; if(copy.entersTapped) copy.tapped=true; /* V12.76 : « arrive engagé » */ this.getState()[side].battlefield.push(copy); copy._enterEmitted=true; /* V12.75 : l'appelant (pile) ne ré-émet pas */ gameEvents.emit({type:'permanentEntered',permanent:copy,side,controller,source:card}); return copy; }
  /**
   * v12.73 — Mélange la bibliothèque d'un joueur EN PLACE par le PRNG du moteur (reproductible à graine
   * fixe). Chemin unique pour réordonner une zone ; l'UI ne doit plus manipuler library directement.
   */
  shuffleLibrary(side) {
    const lib=this.getState()[side]?.library; if(!lib) throw new Error('Joueur invalide pour mélange.');
    const shuffled=rngClock.shuffle(lib); lib.splice(0,lib.length,...shuffled);
    gameEvents.emit({type:'libraryShuffled',side});
    return lib;
  }
  /**
   * v12.72 — Chemin unique pour un objet qui n'est dans AUCUNE zone suivie (sort sur la pile,
   * copie...). Un sort résolu/contrecarré/annulé n'a pas d'entrée dans state[side][zone] : move()
   * échouait (« Objet introuvable ») et les appelants poussaient directement dans le cimetière,
   * sans identité canonique, sans remplacement de changement de zone ni événement. place() pose
   * l'objet dans la zone de destination avec le même traitement que move() et émet 'zoneChanged'
   * (from:'stack'). Si l'objet est en fait déjà suivi, on délègue à move().
   */
  place(obj,toZone,{toSide=null,controller=null,owner=null,reason='zoneChange',from='stack'}={}) {
    if(!ZONES.includes(toZone)) throw new Error(`Zone inconnue: ${toZone}`);
    if(!obj) throw new Error('Objet manquant pour placement de zone.');
    if(this.find(obj)) return this.move(obj,toZone,{toSide,controller,owner,reason});
    const state=this.getState(), ownerSide=owner||obj.owner||obj.controller||'player';
    const destinationSide=toSide||ownerSide; if(!state[destinationSide]) throw new Error('Joueur de destination invalide.');
    if(this.replacements){ const r=this.replacements.replaceZoneChange({object:obj,from,to:toZone,fromSide:ownerSide,toSide:destinationSide,reason}); if(r?.replaced){toZone=r.zone;reason=r.reason;} }
    const next={...obj};
    next.zone=toZone; next.owner=next.owner||ownerSide; next.controller=controller||(toZone==='battlefield'?(next.controller||destinationSide):next.controller);
    // Le sort sur la pile EST la carte (même objet) : uid/objectId sont conservés (générés s'ils manquent) ;
    // seul le changement de zone reçoit un nouvel identifiant (zoneChangeId).
    next.previousUid=obj.uid||null; next.previousObjectId=obj.objectId||null; next.zoneChangeId=nextId('zci'); next.objectId=obj.objectId||nextId('obj'); next.uid=obj.uid||nextId(toZone==='battlefield'?'perm':'card');
    next.zoneHistory=Array.isArray(obj.zoneHistory)?[...obj.zoneHistory]:[]; next.zoneHistory.push({zoneChangeId:next.zoneChangeId,from,to:toZone,oldUid:obj.uid||null,oldObjectId:obj.objectId||null});
    if(toZone==='battlefield'){ next.enteredTurn=state.turnNumber||1; next.enterSeq=(state.enterSeq=(state.enterSeq||0)+1); next.damageMarked=0; next.destroyed=false; next.attacking=false; next.blocking=false; next.attachedTo=next.attachedTo||null; }
    state[destinationSide][toZone].push(next);
    gameEvents.emit({type:'zoneChanged',object:next,from,to:toZone,fromSide:ownerSide,toSide:destinationSide,reason,oldObjectId:obj.objectId||null,zoneChangeId:next.zoneChangeId});
    if(from==='battlefield'&&toZone!=='battlefield') gameEvents.emit({type:'permanentLeft',permanent:next,side:ownerSide,to:toZone,reason,oldObjectId:obj.objectId||null}); // V12.76 (G27)
    return next;
  }
  /**
   * v12.72 — Chemin unique pour un changement de CONTRÔLE (Control Magic, Steal Artifact...).
   * Ce n'est pas un changement de zone : l'objet garde uid/objectId ; seul son tableau de
   * contrôleur change. Émet 'controlChanged'.
   */
  changeController(perm,toSide,{reason='controlChange'}={}) {
    const f=this.find(perm); if(!f||f.zone!=='battlefield') throw new Error('Permanent introuvable pour changement de contrôle.');
    const state=this.getState(); if(!state[toSide]) throw new Error('Joueur de destination invalide.');
    const obj=f.object, from=f.side;
    if(from!==toSide){ this.remove(obj); state[toSide].battlefield.push(obj); obj.controlChangedTurn=state.turnNumber; } // V12.76 (G30) : Erg Raiders (« passé sous votre contrôle ce tour-ci »)
    obj.controller=toSide;
    gameEvents.emit({type:'controlChanged',permanent:obj,from,to:toSide,reason});
    return obj;
  }
  moveToGraveyard(obj,o={}){return this.move(obj,'graveyard',{...o,reason:o.reason||'putIntoGraveyard'});}
  exile(obj,o={}){return this.move(obj,'exile',{...o,reason:o.reason||'exile'});}
  returnToHand(obj,o={}){return this.move(obj,'hand',{...o,reason:o.reason||'returnToHand'});}
}
