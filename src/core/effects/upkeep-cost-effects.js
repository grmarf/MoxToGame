/** V8.9 — Composable upkeep replacement costs. */
import { canPayMana, payMana } from '../costs/mana-cost.js';

const sideState = (ctx) => ctx.api.state[ctx.controllerKey];

const ownCreatures = (ctx) =>
  sideState(ctx).battlefield.filter((p) =>
    String(p.type || '').includes('Creature')
  );

const lands = (ctx) =>
  [
    ...ctx.api.state.player.battlefield,
    ...ctx.api.state.ai.battlefield,
  ].filter((p) => String(p.type || '').includes('Land'));

function removePermanent(ctx, p) {
  const side = ctx.api.findPermSide(p);
  if (side == null) return false;
  if (ctx.api.zones) { ctx.api.zones.moveToGraveyard(p, { toSide: p.owner || side, reason: 'upkeepCost' }); return true; }
  ctx.api.state[side].battlefield = ctx.api.state[side].battlefield.filter(
    (x) => x !== p
  );
  ctx.api.state[side].graveyard.push(p);
  return true;
}

function damage(ctx, n) {
  // v12.72 : les « blessures d'entretien » sont des dégâts : chemin canonique
  // (prévention, remplacements). Repli direct seulement sans ReplacementService.
  if (ctx.api.applyDamageToPlayer) {
    ctx.api.applyDamageToPlayer(ctx.controllerKey, n, {
      color: ctx.sourceCard?.color?.[0] || null,
      source: ctx.sourceCard,
      meta: { effect: 'upkeepDamage' },
    });
  } else {
    ctx.api.state[ctx.controllerKey].life -= n;
  }
  ctx.api.log(
    `${ctx.sourceCard.name} : ${n} blessures d'entretien.`,
    ctx.controllerKey
  );
}

const isSwamp = (p) => String(p.type || '').includes('Land') && /Swamp/i.test(String(p.subtype || p.name || ''));

// Blessures infligées par une source de l'entretien à un joueur PRÉCIS (pas forcément le contrôleur).
function damageSide(ctx, side, n, effect) {
  if (!(n > 0)) return;
  const opts = { color: ctx.sourceCard?.color?.[0] || null, source: ctx.sourceCard, meta: { effect } };
  if (ctx.api.applyDamageToPlayer) ctx.api.applyDamageToPlayer(side, n, opts);
  else ctx.api.state[side].life -= n;
}

export function registerUpkeepCostEffects(registry) {
  // Karma : au début de l'entretien de CHAQUE joueur, blessures = marais que ce joueur contrôle.
  registry.register('upkeepDamageBySwamps', (ctx) => {
    const side = ctx.triggerEvent?.side || ctx.triggerEvent?.activePlayer;
    if (!side || !ctx.api.state[side]) return;
    const swamps = ctx.api.state[side].battlefield.filter(isSwamp).length;
    damageSide(ctx, side, swamps, 'upkeepDamageBySwamps');
  });
  // Black Vise : à l'entretien de l'adversaire (le déclencheur est filtré par controllerUpkeep:false),
  // blessures = cartes en main - seuil (4), jamais négatif.
  registry.register('upkeepDamageByHand', (ctx, e) => {
    const side = ctx.triggerEvent?.side || ctx.triggerEvent?.activePlayer;
    if (!side || !ctx.api.state[side]) return;
    const x = Math.max(0, (ctx.api.state[side].hand?.length || 0) - Number(e?.threshold ?? 4));
    damageSide(ctx, side, x, 'upkeepDamageByHand');
  });
  // V12.75 — The Rack : « X blessures à ce joueur, X étant 3 moins le nombre de cartes dans sa main » (jamais négatif).
  registry.register('upkeepDamageByHandDeficit', (ctx, e) => {
    const side = ctx.triggerEvent?.side || ctx.triggerEvent?.activePlayer;
    if (!side || !ctx.api.state[side]) return;
    damageSide(ctx, side, Math.max(0, Number(e?.base ?? 3) - (ctx.api.state[side].hand?.length || 0)), 'upkeepDamageByHandDeficit');
  });
  // V12.75 — Ivory Tower : « vous gagnez X PV, X étant le nombre de cartes dans votre main moins 4 » (jamais négatif).
  registry.register('upkeepGainByHand', (ctx, e) => {
    const side = ctx.controllerKey;
    const x = Math.max(0, (ctx.api.state[side].hand?.length || 0) - Number(e?.threshold ?? 4));
    if (x > 0) { ctx.api.state[side].life += x; ctx.api.log?.(`${ctx.sourceCard?.name || 'Effet'} : vous gagnez ${x} PV.`, side); }
  });
  registry.register('payOrDamage', (ctx, e) => {
    const applyChoice = (chosen, resumeCtx = ctx) => {
      const p = sideState(resumeCtx);
      const can = canPayMana(p, e.cost);
      if (chosen === 'pay' && can) {
        payMana(p, e.cost);
        resumeCtx.api.log(
          `${resumeCtx.sourceCard.name} : coût d'entretien payé (${e.cost}).`,
          resumeCtx.controllerKey
        );
        return { choice: 'pay', paid: true };
      }
      damage(resumeCtx, e.damage);
      return { choice: 'damage', paid: false };
    };

    const p = sideState(ctx);
    const can = canPayMana(p, e.cost);
    const options = can ? ['pay', 'damage'] : ['damage'];
    const chosen = ctx.api.choose({
      type: 'upkeepCost',
      controller: ctx.controllerKey,
      options,
      prompt: can
        ? `${ctx.sourceCard.name} : payez ${e.cost} ou subissez ${e.damage} blessures.`
        : `${ctx.sourceCard.name} : vous ne pouvez pas payer ; subissez ${e.damage} blessures.`,
      defaultValue: options[0],
    }, applyChoice);
    if (chosen != null) return applyChoice(chosen);
    return null;
  });

  // NB : ce handler est actuellement écrasé par la version de
  // token-historical-effects.js (registerC86C87Effects, enregistrée avec
  // {replace:true} après celui-ci) pour Lord of the Pit — comportement
  // inchangé pour cette carte. Il est corrigé ici pour ne plus dépendre de
  // l'API inexistante ctx.api.decisions, au cas où il redeviendrait actif un
  // jour (carte future utilisant ce type sans passer par l'override).
  registry.register('sacrificeOrDamage', (ctx, e) => {
    const applyCreatureChoice = (chosen, resumeCtx = ctx) => {
      const cs = ownCreatures(resumeCtx);
      const s = chosen && typeof chosen === 'object'
        ? cs.find(c => c.uid === chosen.uid || c.objectId === chosen.objectId)
        : null;
      if (s && removePermanent(resumeCtx, s)) {
        resumeCtx.api.log(`${resumeCtx.sourceCard.name} : ${s.name} est sacrifiée.`, resumeCtx.controllerKey);
        return { choice: 'sacrifice', sacrificed: s };
      }
      damage(resumeCtx, e.damage);
      return { choice: 'damage', sacrificed: null };
    };

    const applyTopChoice = (chosen, resumeCtx = ctx) => {
      const cs = ownCreatures(resumeCtx);
      if (chosen === 'sacrifice' && cs.length) {
        const creatureChosen = resumeCtx.api.choose({
          type: 'chooseCreatureToSacrifice',
          controller: resumeCtx.controllerKey,
          options: cs,
          prompt: `${resumeCtx.sourceCard.name} : choisissez la créature à sacrifier.`,
          defaultValue: cs[0],
        }, applyCreatureChoice);
        if (creatureChosen != null) return applyCreatureChoice(creatureChosen, resumeCtx);
        return null;
      }
      damage(resumeCtx, e.damage);
      return { choice: 'damage', sacrificed: null };
    };

    const cs = ownCreatures(ctx);
    const opts = cs.length ? ['sacrifice', 'damage'] : ['damage'];
    const chosen = ctx.api.choose({
      type: 'sacrificeOrDamage',
      controller: ctx.controllerKey,
      options: opts,
      prompt: cs.length
        ? `${ctx.sourceCard.name} : sacrifiez une créature ou subissez ${e.damage} blessure(s).`
        : `${ctx.sourceCard.name} : ${e.damage} blessure(s).`,
      defaultValue: opts[0],
    }, applyTopChoice);
    if (chosen != null) return applyTopChoice(chosen, ctx);
    return null;
  });

  registry.register('payOrSacrifice', (ctx, e) => {
    const applyChoice = (chosen, resumeCtx = ctx) => {
      const p = sideState(resumeCtx);
      const can = canPayMana(p, e.cost);
      if (chosen === 'pay' && can) {
        payMana(p, e.cost);
        resumeCtx.api.log(
          `${resumeCtx.sourceCard.name} : coût d'entretien payé (${e.cost}).`,
          resumeCtx.controllerKey
        );
        return { choice: 'pay', paid: true };
      }
      const s = resumeCtx.sourceCard;
      if (removePermanent(resumeCtx, s)) {
        resumeCtx.api.log(`${s.name} est sacrifiée.`, resumeCtx.controllerKey);
        return { choice: 'sacrifice', sacrificed: s };
      }
      return { choice: 'none', paid: false };
    };

    const p = sideState(ctx);
    const can = canPayMana(p, e.cost);
    const options = can ? ['pay', 'sacrifice'] : ['sacrifice'];
    const chosen = ctx.api.choose({
      type: 'upkeepCost',
      controller: ctx.controllerKey,
      options,
      prompt: can
        ? `${ctx.sourceCard.name} : payez ${e.cost} ou sacrifiez-la.`
        : `${ctx.sourceCard.name} : sacrifiez ${ctx.sourceCard.name}.`,
      defaultValue: options[0],
    }, applyChoice);
    if (chosen != null) return applyChoice(chosen);
    return null;
  });

  registry.register('destroyLandOrPay', (ctx, e) => {
    const applyChoice = (chosen, resumeCtx = ctx) => {
      const p = sideState(resumeCtx);
      const can = canPayMana(p, e.cost);
      const ls = lands(resumeCtx);
      if (chosen && typeof chosen === 'object') {
        const current = ls.find(l => l.uid === chosen.uid || l.objectId === chosen.objectId);
        if (current && removePermanent(resumeCtx, current)) {
          resumeCtx.api.log(
            `${resumeCtx.sourceCard.name} : ${current.name} est détruit.`,
            resumeCtx.controllerKey
          );
          return { choice: 'destroyLand', destroyed: current };
        }
      }
      if (chosen === 'pay' && can) {
        payMana(p, e.cost);
        resumeCtx.api.log(
          `${resumeCtx.sourceCard.name} : coût d'entretien payé (${e.cost}).`,
          resumeCtx.controllerKey
        );
        return { choice: 'pay', paid: true };
      }
      if (!can && ls.length) {
        const current = ls[0];
        if (removePermanent(resumeCtx, current)) {
          resumeCtx.api.log(
            `${resumeCtx.sourceCard.name} : ${current.name} est détruit.`,
            resumeCtx.controllerKey
          );
          return { choice: 'destroyLand', destroyed: current };
        }
      }
      return { choice: 'none', paid: false };
    };

    const p = sideState(ctx);
    const can = canPayMana(p, e.cost);
    const ls = lands(ctx);
    const options = can ? (ls.length ? ['pay', ...ls] : ['pay']) : ls;
    if (!options.length) return { choice: 'none', paid: false };
    const chosen = ctx.api.choose({
      type: 'upkeepCost',
      controller: ctx.controllerKey,
      options,
      prompt: can
        ? `${ctx.sourceCard.name} : payez ${e.cost} ou détruisez un terrain.`
        : `${ctx.sourceCard.name} : détruisez un terrain.`,
      defaultValue: options[0],
    }, applyChoice);
    if (chosen != null) return applyChoice(chosen);
    return null;
  });

  // BUG A (audit v12.66) : Mana Vault -- "vous pouvez payer {4}. Si vous
  // faites ainsi, dégagez [ce permanent]." Contrairement à payOrDamage
  // (payer OU subir un coût), il n'y a ici ni pénalité au refus ni cible :
  // la source du déclencheur (ctx.sourceCard) EST le permanent à dégager,
  // retrouvé en direct sur le champ de bataille (référence live, comme pour
  // tout déclencheur -- cf. bug F).
  // V12.76 (G27) : Farmstead — « le terrain enchanté a : à VOTRE entretien (celui de son contrôleur), vous pouvez payer {W}{W} ; si vous le faites, vous gagnez 1 PV ».
  // Le payeur, le choix et le gain de PV reviennent au contrôleur du terrain ENCHANTÉ (pas à celui de l'Aura).
  registry.register('payToGainLife', (ctx, e) => {
    const aura = ctx.sourceCard; const host = aura?.attachedTo ? ctx.api.findPermanent(aura.attachedTo) : null; const hostSide = host ? ctx.api.findPermSide(host) : (aura?.attachedTo ? null : ctx.controllerKey);
    if (!hostSide) return null; // Aura : contrôleur du permanent enchanté (Farmstead) ; sans Aura : contrôleur de la source (Iron Star & sœurs, V12.76 G32)
    const amount = Number(e.amount ?? 1);
    const applyChoice = (chosen, resumeCtx = ctx) => {
      const p = resumeCtx.api.state[hostSide];
      if (chosen === 'pay' && canPayMana(p, e.cost)) { payMana(p, e.cost); p.life += amount; resumeCtx.api.log(`${aura.name} : ${e.cost} payé, ${amount} PV gagné(s).`, hostSide); return { choice: 'pay', paid: true }; }
      return { choice: 'decline', paid: false };
    };
    const can = canPayMana(ctx.api.state[hostSide], e.cost);
    const chosen = ctx.api.choose({ type: 'payToGainLife', controller: hostSide, options: can ? ['pay', 'decline'] : ['decline'],
      prompt: can ? `${aura.name} : payez ${e.cost} pour gagner ${amount} PV ?` : `${aura.name} : vous ne pouvez pas payer ${e.cost}.`, defaultValue: 'decline' }, applyChoice);
    return chosen != null ? applyChoice(Array.isArray(chosen) ? chosen[0] : chosen) : null;
  });

  registry.register('payToUntap', (ctx, e) => {
    const perm = ctx.api.findPermanent(ctx.sourceCard?.uid) || ctx.sourceCard;
    if (!perm || !perm.tapped) return null;
    const applyChoice = (chosen, resumeCtx = ctx) => {
      const p = sideState(resumeCtx);
      const can = canPayMana(p, e.cost);
      if (chosen === 'pay' && can) {
        payMana(p, e.cost);
        perm.tapped = false;
        resumeCtx.api.log(`${perm.name} : ${e.cost} payé, dégagé.`, resumeCtx.controllerKey);
        return { choice: 'pay', paid: true };
      }
      return { choice: 'decline', paid: false };
    };
    const p = sideState(ctx);
    const can = canPayMana(p, e.cost);
    const options = can ? ['pay', 'decline'] : ['decline'];
    const chosen = ctx.api.choose({
      type: 'payToUntap',
      controller: ctx.controllerKey,
      options,
      prompt: can
        ? `${perm.name} est engagé : payez ${e.cost} pour le dégager ?`
        : `${perm.name} : vous ne pouvez pas payer ${e.cost}.`,
      defaultValue: 'decline',
    }, applyChoice);
    if (chosen != null) return applyChoice(chosen);
    return null;
  });
;
}
