import { calculateCharacteristics } from '../continuous-effects.js';
import { canPayMana, payMana } from '../costs/mana-cost.js';
/**
 * V12.76 (lot G4) — effets de la famille « blessures » : Haunting Wind, Inquisition.
 */
function damagePlayer(ctx, side, n, effect) {
  if (!ctx.api.state?.[side] || !(n > 0)) return 0;
  const opts = { color: ctx.sourceCard?.color?.[0] || null, source: ctx.sourceCard, meta: { effect } };
  if (ctx.api.applyDamageToPlayer) ctx.api.applyDamageToPlayer(side, n, opts); else ctx.api.state[side].life -= n;
  return n;
}

export function registerC92Effects(registry) {
  const reg = (type, fn) => (registry.has(type) ? registry.register(type, fn, { replace: true }) : registry.register(type, fn));

  // Bottle of Suleiman (face perdante) : « vous inflige 5 blessures » = blessures au CONTRÔLEUR de la source, par le chemin canonique
  // (prévention / remplacement respectés). `damage` avec target:'self' ne faisait rien : ce handler ne lit qu'une cible explicite.
  reg('damageController', (ctx, effect) => {
    const n = Number(effect.amount ?? 0);
    damagePlayer(ctx, ctx.controllerKey, n, 'damageController');
    ctx.api.log?.(`${ctx.sourceCard?.name} : ${n} blessures à ${ctx.controllerKey === 'player' ? 'vous' : "l'adversaire"}.`, ctx.controllerKey);
  });

  // V12.76 (lot G15) : Curse Artifact — « cette Aura inflige 2 blessures à ce joueur, sauf s'il sacrifie cet artefact ». « Ce joueur » = le
  // contrôleur de l'artefact ENCHANTÉ (il peut différer du contrôleur de l'Aura) ; c'est LUI qui choisit : sacrifier l'artefact ou subir.
  reg('damageUnlessSacrificeEnchanted', (ctx, effect) => {
    const aura = ctx.sourceCard; const host = aura?.attachedTo ? ctx.api.findPermanent(aura.attachedTo) : null; if (!host) return null;
    const side = host.controller; const n = Number(effect.amount ?? 1);
    const apply = (picked) => {
      const c = Array.isArray(picked) ? picked[0] : picked;
      if (c === 'sacrifice') { ctx.api.zones.moveToGraveyard(host, { toSide: host.owner, reason: 'sacrifice' }); ctx.api.log?.(`${host.name} est sacrifié (${aura.name}).`, side); }
      else { damagePlayer(ctx, side, n, 'damageUnlessSacrificeEnchanted'); ctx.api.log?.(`${aura.name} : ${n} blessures à ${side === 'player' ? 'vous' : "l'adversaire"}.`, side); }
      return c;
    };
    const chosen = ctx.api.choose({ type: 'sacrificeOrDamage', controller: side, options: ['sacrifice', 'damage'], min: 1, max: 1, prompt: `Sacrifiez ${host.name} ou subissez ${n} blessures.`, defaultValue: 'damage' }, apply);
    return chosen != null ? apply(chosen) : null;
  });

  // V12.76 (G24) : Relic Bind — « choisissez l'un : 1 blessure au joueur ciblé ; ou le joueur ciblé gagne 1 PV ». Le contrôleur de l'AURA choisit le mode ET le
  // joueur : les 4 combinaisons sont proposées en un seul vrai choix (défaut : 1 blessure à l'adversaire).
  reg('chooseDamageOrGain', (ctx, effect) => {
    const n = Number(effect.amount ?? 1); const me = ctx.controllerKey; const opp = me === 'player' ? 'ai' : 'player';
    const apply = (picked) => {
      const c = Array.isArray(picked) ? picked[0] : picked; const [mode, who] = String(c || 'damage-opponent').split('-'); const side = who === 'self' ? me : opp;
      if (mode === 'gain') { ctx.api.state[side].life += n; ctx.api.log?.(`${ctx.sourceCard?.name} : ${side === 'player' ? 'vous gagnez' : "l'adversaire gagne"} ${n} PV.`, me); }
      else { damagePlayer(ctx, side, n, 'chooseDamageOrGain'); ctx.api.log?.(`${ctx.sourceCard?.name} : ${n} blessure(s) à ${side === 'player' ? 'vous' : "l'adversaire"}.`, me); }
      return c;
    };
    const chosen = ctx.api.choose({ type: 'damageOrGain', controller: me, options: ['damage-opponent', 'damage-self', 'gain-self', 'gain-opponent'], min: 1, max: 1,
      prompt: `${ctx.sourceCard?.name} : ${n} blessure à l'adversaire, ${n} blessure à vous, ${n} PV pour vous ou ${n} PV pour l'adversaire ?`, defaultValue: 'damage-opponent' }, apply);
    return chosen != null ? apply(chosen) : null;
  });

  // V12.76 (G27) : Goblin Shrine — « elle inflige 1 blessure à chaque créature Gobelin » (toutes les créatures du sous-type, des deux camps ; la source est l'Aura qui vient de partir).
  reg('damageEachMatching', (ctx, effect) => {
    const n = Number(effect.amount ?? 1); const color = ctx.sourceCard?.color?.[0] || null; const sub = String(effect.subtype || '').toLowerCase();
    for (const p of ctx.api.allPermanents().filter((x) => /\bCreature\b/i.test(String(x.type || '')) && String(x.subtype || '').toLowerCase().split(/\s+/).includes(sub))) {
      if (ctx.api.applyDamageToPermanent) ctx.api.applyDamageToPermanent(p, n, { color, source: ctx.sourceCard, meta: { effect: 'damageEachMatching' } });
      else p.damageMarked = (p.damageMarked || 0) + n;
    }
    ctx.api.log?.(`${ctx.sourceCard?.name} : ${n} blessure à chaque créature ${effect.subtype}.`, ctx.controllerKey);
    ctx.api.checkStateBasedDeaths();
  });

  // V12.76 (G28) : Venom / Infinite Authority — « détruisez l'autre créature à la fin du combat » : effet DIFFÉRÉ (`state.delayedEffects`, exécuté par le
  // TurnManager à l'étape de fin de combat). `thenCounter` : « au début de la prochaine étape finale, si elle a été détruite ainsi, +1/+1 sur la 1re créature ».
  reg('destroyOtherAtEndOfCombat', (ctx, effect) => {
    const aura = ctx.sourceCard; const ev = ctx.triggerEvent || {}; const hostUid = aura?.attachedTo; if (!hostUid) return;
    const other = ev.attacker?.uid === hostUid ? ev.blocker : (ev.blocker?.uid === hostUid ? ev.attacker : null); if (!other?.uid) return;
    const st = ctx.api.state; st.delayedEffects = st.delayedEffects || [];
    st.delayedEffects.push({ at: 'endOfCombat', kind: 'destroy', targetUid: other.uid, thenCounterOn: effect.thenCounter ? hostUid : null, sourceName: aura.name });
  });

  // V12.76 (G28) : Farrel's Mantle — « si la créature enchantée attaque et n'est pas bloquée, son contrôleur peut lui faire infliger (force + 2) à une AUTRE
  // créature ciblée ; dans ce cas elle n'assigne aucune blessure de combat ce tour ». La cible est choisie à la résolution (approximation : pas au moment du déclenchement).
  reg('farrelStrike', (ctx, effect) => {
    const aura = ctx.sourceCard; const host = ctx.api.findPermanent(aura?.attachedTo); if (!host) return null; const hostSide = ctx.api.findPermSide(host);
    const others = ctx.api.allPermanents().filter((p) => p.uid !== host.uid && /\bCreature\b/i.test(String(p.type || '')));
    const apply = (picked) => {
      const c = Array.isArray(picked) ? picked[0] : picked; if (!c || c === 'decline') return { choice: 'decline' };
      const target = ctx.api.findPermanent(c); if (!target) return { choice: 'decline' };
      const power = calculateCharacteristics(ctx.api.state, host).power + Number(effect.bonus ?? 2);
      ctx.api.applyDamageToPermanent(target, power, { color: host.color?.[0] || null, source: host, meta: { effect: 'farrelStrike' } });
      host.noCombatDamageTurn = ctx.api.state.turnNumber; // « n'assigne aucune blessure de combat ce tour »
      ctx.api.log?.(`${aura.name} : ${host.name} inflige ${power} blessures à ${target.name}.`, hostSide); ctx.api.checkStateBasedDeaths();
      return { choice: c };
    };
    const chosen = ctx.api.choose({ type: 'farrelStrike', controller: hostSide, options: ['decline', ...others.map((p) => p.uid)], min: 1, max: 1,
      prompt: `${aura.name} : ${host.name} inflige sa force + ${effect.bonus ?? 2} à une autre créature (puis n'assigne aucune blessure de combat) ?`, defaultValue: 'decline' }, apply);
    return chosen != null ? apply(chosen) : null;
  });

  // V12.76 (G28) : Backfire — « chaque fois que la créature enchantée vous inflige des blessures, Backfire en inflige autant au contrôleur de cette créature ».
  reg('reflectDamage', (ctx) => {
    const ev = ctx.triggerEvent || {}; const n = Number(ev.amount || 0); if (!(n > 0)) return;
    const src = ev.source ? ctx.api.findPermanent(ev.source.uid) : null; const side = src ? ctx.api.findPermSide(src) : null; if (!side) return;
    damagePlayer(ctx, side, n, 'reflectDamage'); ctx.api.log?.(`${ctx.sourceCard?.name} : ${n} blessure(s) renvoyée(s) à ${side === 'player' ? 'vous' : "l'adversaire"}.`, side);
  });

  // V12.76 (G28) : Power Leak — « à l'entretien du contrôleur de l'enchantement enchanté, ce joueur peut payer n'importe quel montant de mana ; l'Aura lui inflige 2 blessures ;
  // prévenez-en X, X = mana payé ». Choix 0..min(2, mana disponible) : au-delà de 2, payer ne préviendrait rien de plus.
  reg('payAnyAmountOrDamage', (ctx, effect) => {
    const aura = ctx.sourceCard; const host = ctx.api.findPermanent(aura?.attachedTo); const hostSide = host ? ctx.api.findPermSide(host) : null; if (!hostSide) return null;
    const dmg = Number(effect.damage ?? 2); const p = ctx.api.state[hostSide]; const total = Object.values(p.mana || {}).reduce((a, b) => a + (Number(b) || 0), 0); const max = Math.min(dmg, total);
    const apply = (picked) => {
      const x = Math.max(0, Math.min(max, Number(Array.isArray(picked) ? picked[0] : picked) || 0));
      if (x > 0 && canPayMana(p, `{${x}}`)) payMana(p, `{${x}}`);
      damagePlayer(ctx, hostSide, dmg - x, 'payAnyAmountOrDamage'); ctx.api.log?.(`${aura.name} : ${x} mana payé, ${dmg - x} blessure(s).`, hostSide); return x;
    };
    const chosen = ctx.api.choose({ type: 'payAnyAmount', controller: hostSide, options: Array.from({ length: max + 1 }, (_, i) => String(i)), min: 1, max: 1,
      prompt: `${aura.name} : combien de mana payer pour prévenir ses ${dmg} blessures ?`, defaultValue: '0' }, apply);
    return chosen != null ? apply(chosen) : null;
  });

  // V12.76 (G32) : Tangle Kelp — « à l'arrivée de cette Aura, engagez la créature enchantée ».
  reg('tapEnchanted', (ctx) => { const h = ctx.api.findPermanent(ctx.sourceCard?.attachedTo); if (h) { h.tapped = true; ctx.api.log?.(`${ctx.sourceCard.name} : ${h.name} est engagée.`, ctx.controllerKey); } });

  // V12.76 (G29) : Reset — « dégagez tous les terrains que vous contrôlez ».
  reg('untapAllLands', (ctx) => { let n = 0; for (const p of ctx.api.state[ctx.controllerKey].battlefield) if (/\bLand\b/i.test(String(p.type || '')) && p.tapped) { p.tapped = false; n++; } ctx.api.log?.(`${ctx.sourceCard?.name} : ${n} terrain(s) dégagé(s).`, ctx.controllerKey); });

  // Rapid Fire — « la créature ciblée gagne l'initiative jusqu'à la fin du tour ; si elle n'a pas la sauvagerie, elle gagne la sauvagerie 2 ».
  reg('rapidFire', (ctx) => {
    const t = ctx.api.findPermanent(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo); if (!t) return;
    const have = calculateCharacteristics(ctx.api.state, t).keywords.some((k) => /^rampage\d+$/.test(k));
    t.tempKeywords = [...new Set([...(t.tempKeywords || []), 'first strike', ...(have ? [] : ['rampage2'])])];
    ctx.api.log?.(`${t.name} gagne l'initiative${have ? '' : ' et la sauvagerie 2'} jusqu'à la fin du tour.`, ctx.controllerKey);
  });

  // Berserk — « piétinement et +X/+0 jusqu'à la fin du tour, X = sa force ; à la prochaine étape finale, détruisez-la si elle a attaqué ce tour-ci ».
  reg('berserk', (ctx) => {
    const t = ctx.api.findPermanent(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo); if (!t) return;
    const x = calculateCharacteristics(ctx.api.state, t).power; t.tempBuffs = [...(t.tempBuffs || []), { power: x, toughness: 0 }];
    t.tempKeywords = [...new Set([...(t.tempKeywords || []), 'trample'])];
    const st = ctx.api.state; st.delayedEffects = st.delayedEffects || []; st.delayedEffects.push({ at: 'nextEndStep', kind: 'destroyIfAttacked', targetUid: t.uid, turnNumber: st.turnNumber, sourceName: ctx.sourceCard?.name });
    ctx.api.log?.(`${t.name} gagne le piétinement et +${x}/+0 jusqu'à la fin du tour.`, ctx.controllerKey);
  });

  // V12.76 (G30) : Nettling Imp — « la créature ciblée attaque ce tour si possible ; détruisez-la au début de la prochaine étape de fin si elle n'a pas attaqué ».
  // Effet DIFFÉRÉ indépendant du Diablotin (ruling 2004 : s'il part, la créature est quand même détruite ; une créature qui ne PEUT pas attaquer est détruite aussi).
  reg('nettlingImp', (ctx) => {
    const t = ctx.api.findPermanent(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo); if (!t) return;
    const st = ctx.api.state; t.mustAttack = true; t.mustAttackTurn = st.turnNumber;
    st.delayedEffects = st.delayedEffects || []; st.delayedEffects.push({ at: 'nextEndStep', kind: 'destroyIfNotAttacked', targetUid: t.uid, turnNumber: st.turnNumber, sourceName: ctx.sourceCard?.name });
    ctx.api.log?.(`${ctx.sourceCard?.name} : ${t.name} doit attaquer ce tour, sinon il sera détruit.`, ctx.controllerKey);
  });

  // Siren's Call — « les créatures du joueur actif attaquent ce tour si possible ; à la prochaine étape finale, détruisez les créatures non-Mur qu'il contrôle qui n'ont pas
  // attaqué ; ignorez celles qu'il ne contrôlait pas depuis le début du tour ». Instantané pris à la résolution.
  reg('sirenCall', (ctx) => {
    const st = ctx.api.state; const opp = ctx.controllerKey === 'player' ? 'ai' : 'player'; const uids = [];
    for (const p of st[opp].battlefield) {
      if (!/\bCreature\b/i.test(String(p.type || ''))) continue;
      p.mustAttack = true; p.mustAttackTurn = st.turnNumber;
      const continuous = p.enteredTurn == null || p.enteredTurn < st.turnNumber; const wall = String(p.subtype || '').toLowerCase().split(/\s+/).includes('wall');
      if (continuous && !wall) uids.push(p.uid);
    }
    st.delayedEffects = st.delayedEffects || []; st.delayedEffects.push({ at: 'nextEndStep', kind: 'destroyNonWallsNotAttacked', side: opp, uids, turnNumber: st.turnNumber, sourceName: ctx.sourceCard?.name });
    ctx.api.log?.(`${ctx.sourceCard?.name} : les créatures adverses doivent attaquer ce tour.`, ctx.controllerKey);
  });

  // Haunting Wind : « chaque fois qu'un artefact devient la source d'une capacité activée, inflige 3 blessures à son contrôleur ».
  // Le joueur touché est celui qui a ACTIVÉ la capacité (événement `artifactAbilityActivated`), pas le contrôleur de Haunting Wind.
  reg('damageEventPlayer', (ctx, effect) => {
    const side = ctx.triggerEvent?.controller || ctx.triggerEvent?.side;
    if (!side) return;
    const n = effect.amountFrom === 'eventToughness' ? Math.max(0, Number(ctx.triggerEvent?.toughness ?? 0)) : Number(effect.amount ?? 1); // V12.76 (G20) : Creature Bond (blessures = endurance de la créature morte)
    damagePlayer(ctx, side, n, 'damageEventPlayer');
    ctx.api.log?.(`${ctx.sourceCard?.name} : ${n} blessures à ${side === 'player' ? 'vous' : "l'adversaire"}.`, ctx.controllerKey);
  });

  // Inquisition : la main du joueur ciblé est révélée ; blessures = nombre de cartes de la couleur indiquée qu'elle contient.
  reg('damagePerColorInHand', (ctx, effect) => {
    const t = ctx.targetInfo;
    const side = t?.kind === 'player' ? t.side : null;
    if (!side || !ctx.api.state?.[side]) return;
    const color = String(effect.color || 'W').toUpperCase();
    const hand = ctx.api.state[side].hand || [];
    ctx.api.log?.(`${ctx.sourceCard?.name} : main révélée de ${side === 'player' ? 'vous' : "l'adversaire"} — ${hand.map((c) => c.name).join(', ') || '(vide)'}.`, ctx.controllerKey);
    const n = hand.filter((c) => [].concat(c.color || []).map((x) => String(x).toUpperCase()).includes(color)).length;
    damagePlayer(ctx, side, n, 'damagePerColorInHand');
  });
}
