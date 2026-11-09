// V12.3 — C8.6/C8.7: token runtime + historical card rules.
// animateArtifacts / animateLands now emit static continuous effects
// instead of mutating type/power/toughness directly.
import { gameEvents } from '../event-bus.js';
import { createPermanent } from '../card-runtime.js';
import { calculateCharacteristics } from '../continuous-effects.js';

const SIDES = ['player','ai'];
const opponent = s => s === 'player' ? 'ai' : 'player';
const reg = (registry, type, fn) => registry.has(type) ? registry.register(type, fn, {replace:true}) : registry.register(type, fn);
const find = (state, ref) => {
  const id = ref?.uid || ref?.objectId || ref?.id || ref;
  return SIDES.flatMap(s => state[s]?.battlefield || []).find(p => p?.uid === id || p?.objectId === id) || null;
};

function tokenFrom(effect, side, state) {
  const base = {
    name: effect.name || 'Token',
    // V12.75 : `effect.type` est le TYPE D'EFFET (« createToken »), jamais un type de carte : tous les jetons étaient typés « createToken »,
    // donc ni créatures, ni capables d'attaquer ou de bloquer (Icatian Town, Tetravus...). Le type de carte vient de `tokenType`.
    type: effect.tokenType || 'Creature',
    subtype: effect.subtype || '',
    color: Array.isArray(effect.color) ? [...effect.color] : (effect.color ? [effect.color] : []),
    keywords: Array.isArray(effect.keywords) ? [...effect.keywords] : [],
    power: Number(effect.power ?? 0), toughness: Number(effect.toughness ?? 0),
    token: true, owner: side, controller: side, zone: 'battlefield'
  };
  const token = createPermanent(base);
  token.token = true;
  token.owner = side; token.controller = side;
  token.enteredTurn = state.turnNumber || 1;
  token.summoningSickness = token.isCreature && !token.keywords.some(k => String(k).toLowerCase() === 'haste');
  token.tokenSource = effect.sourceCardName || null;
  return token;
}

export function registerC86C87Effects(registry) {
  reg(registry, 'createToken', (ctx, effect) => {
    // BUG G (audit v12.66) : ce handler poussait directement le token dans
    // ctx.state[side].battlefield, contournant le ZoneManager
    // (ctx.api.zones.enterBattlefield) utilisé par tous les autres
    // changements de zone du moteur. Effet de bord réel : 'permanentEntered'
    // était émis manuellement en plus (payload légèrement différent de
    // celui du ZoneManager), ce qui aurait DOUBLÉ le déclenchement de tout
    // "quand cette créature entre sur le champ de bataille" côté triggers
    // (trigger-collector.js écoute 'permanentEntered'). On route donc par
    // enterBattlefield, qui gère identité + emission canonique en un seul
    // endroit, et on ne garde que l'émission propre à createToken
    // ('tokenCreated').
    const side = effect.controller || ctx.controllerKey;
    const count = Math.max(1, Number(effect.amount || 1));
    const created = [];
    for (let i=0; i<count; i++) {
      const draft = tokenFrom({...effect, sourceCardName:ctx.sourceCard?.name}, side, ctx.state);
      const token = ctx.api?.zones
        ? ctx.api.zones.enterBattlefield(draft, side, { controller: side, reason: 'createToken' })
        : (ctx.state[side].battlefield.push(draft), gameEvents.emit({type:'permanentEntered', permanent:draft, side, controller:side, source:ctx.sourceCard || draft}), draft);
      created.push(token);
      gameEvents.emit({type:'tokenCreated', token, side, source:ctx.sourceCard || null});
    }
    return created;
  });

  reg(registry, 'sacrificeOrDamage', (ctx, effect) => {
    const creatures = (ctx.state[ctx.controllerKey].battlefield || []).filter(p => /Creature/i.test(String(p.type||'')));
    if (creatures.length) ctx.api.destroyPermanent(creatures[0]);
    else ctx.state[ctx.controllerKey].life -= Number(effect.damage || 0);
  });

  reg(registry, 'skipUntap', (ctx) => { ctx.state[ctx.controllerKey].skipUntap = true; });
  reg(registry, 'skipDraw', (ctx) => { ctx.state[ctx.controllerKey].skipDraw = true; });

  // V12.3 — animateArtifacts / animateLands now add static effects to the
  // source permanent instead of mutating every artifact/land directly.
  // This makes them proper continuous effects removable when the source leaves.
  reg(registry, 'animateArtifacts', (ctx, effect) => {
    const source = ctx.sourceCard;
    if (!source) return;
    source.static = Array.isArray(source.static) ? source.static : (source.static ? [source.static] : []);
    // Remove any previous animateArtifacts static from this source to avoid stacking
    source.static = source.static.filter(s => s.sourceType !== 'animateArtifacts');
    source.static.push({
      type: 'changeType',
      newType: 'Artifact Creature',
      filterType: 'Artifact',
      controllerFilter: 'all',
      sourceType: 'animateArtifacts'
    });
    // Also push a setPowerToughness effect for Layer 7b
    source.static.push({
      type: 'setPowerToughness',
      power: Number(effect.power ?? 4),
      toughness: Number(effect.toughness ?? 4),
      filterType: 'Artifact',
      controllerFilter: 'all',
      sourceType: 'animateArtifacts'
    });
  });

  reg(registry, 'animateLands', (ctx, effect) => {
    const source = ctx.sourceCard;
    if (!source) return;
    source.static = Array.isArray(source.static) ? source.static : (source.static ? [source.static] : []);
    source.static = source.static.filter(s => s.sourceType !== 'animateLands');
    const subtypeFilter = effect.subtype ? String(effect.subtype).toLowerCase() : null;
    source.static.push({
      type: 'changeType',
      newType: 'Land Creature',
      filterType: 'Land',
      controllerFilter: 'all',
      sourceType: 'animateLands',
      subtypeFilter: subtypeFilter
    });
    source.static.push({
      type: 'setPowerToughness',
      power: Number(effect.power ?? 2),
      toughness: Number(effect.toughness ?? 3),
      filterType: 'Land',
      controllerFilter: 'all',
      sourceType: 'animateLands',
      subtypeFilter: subtypeFilter
    });
  });

  reg(registry, 'spiritLink', (ctx) => { ctx.sourceCard.spiritLink = true; });
  reg(registry, 'lifeLossPerSwamp', (ctx) => {
    const side = ctx.controllerKey === 'player' ? 'ai' : 'player';
    const n = (ctx.state[side].battlefield || []).filter(p => /Land/i.test(String(p.type||'')) && /Swamp/i.test(String(p.subtype||p.name||''))).length;
    ctx.state[ctx.controllerKey].life -= n;
  });
}

let installed = false;
export function installC86C87EventRules() {
  if (installed) return; installed = true;
  gameEvents.on('permanentEntered', ({state, permanent, side}) => {
    if (!state || !permanent) return;
    permanent.isTokenPermanent = !!permanent.token;
  });
  gameEvents.on('creatureDied', ({state, permanent}) => {
    if (!state || !permanent) return;
    if (permanent.token) {
      for (const side of SIDES) {
        state[side].graveyard = (state[side].graveyard || []).filter(x => x !== permanent && x.uid !== permanent.uid);
        state[side].exile = (state[side].exile || []).filter(x => x !== permanent && x.uid !== permanent.uid);
      }
    }
  });
}
