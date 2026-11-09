// V9.4 — Canonical cost system (M5).
// Costs are validated first, then paid atomically. Supports mana, tap,
// sacrifice/discard/exile, life payments and structured future costs.
import { canPayMana, payMana, manaCostToPool } from './mana-cost.js';
import { tapPermanent } from '../permanent-tap.js';

export function normalizeCost(raw = '', context = {}) {
  if (typeof raw === 'string') return { mana: raw, tap: !!context.tap };
  if (!raw || typeof raw !== 'object') return { mana: '', tap: !!context.tap };
  return {
    mana: raw.mana ?? raw.cost ?? '',
    tap: !!(raw.tap ?? context.tap),
    untap: !!raw.untap,
    life: Number(raw.life ?? 0),
    // V12.76 : `sacrifice: true` signifiait « le premier permanent du champ de bataille » (candidates[0]) : Basal Thrull ou Black Lotus
    // pouvaient sacrifier une AUTRE carte. `true` veut dire « cette carte-ci » : 'self'.
    sacrifice: raw.sacrifice === true ? 'self' : (raw.sacrifice ?? null),
    discard: raw.discard ?? 0,
    exile: raw.exile ?? null,
    returnToHand: raw.returnToHand ?? null,
    pay: raw.pay ?? null,
    choose: raw.choose ?? null,
  };
}

function sideFor(state, controller) {
  const side = state?.[controller];
  if (!side) throw new Error(`Joueur inconnu: ${controller}`);
  return side;
}

function findPermanent(side, ref) {
  if (!ref) return null;
  return side.battlefield.find(p => p === ref || p.uid === ref.uid || p.uid === ref) || null;
}

function countRequirement(req) {
  if (req === true) return 1;
  if (typeof req === 'number') return Math.max(0, req);
  if (req && typeof req === 'object') return Math.max(0, Number(req.amount ?? 1));
  return 0;
}

export class CostService {
  constructor({ getState, choose = null, zones = null } = {}) {
    this.getState = getState;
    this.choose = choose;
    this.zones = zones;
  }

  normalize(raw, context = {}) { return normalizeCost(raw, context); }

  /**
   * V12.75 : surcoût générique d'un SORT dû aux permanents en jeu (Gloom : sorts blancs +{3} ; Lifeforce : sorts noirs +{2}).
   * Les capacités activées (context.permanent) ne sont pas des sorts : aucun surcoût. `spellCostIncrease` n'était lu nulle part :
   * les deux cartes ne faisaient rien. Il s'applique à TOUS les joueurs et se cumule.
   */
  spellSurcharge(context = {}) {
    const card = context.card; if (!card || context.permanent) return 0;
    const state = this.getState(); const colors = Array.isArray(card.color) ? card.color : (card.color ? [card.color] : []);
    let extra = 0;
    for (const sd of ['player', 'ai']) for (const p of (state?.[sd]?.battlefield || [])) {
      for (const e of (Array.isArray(p.static) ? p.static : (p.static ? [p.static] : []))) {
        if (e?.type !== 'spellCostIncrease') continue;
        if (e.filterColor && !colors.includes(e.filterColor)) continue;
        extra += Number(e.amount || 0);
      }
    }
    return extra;
  }

  canPay(controller, raw, context = {}) {
    const state = this.getState();
    const side = sideFor(state, controller);
    const cost = normalizeCost(raw, context);
    const surcharge = this.spellSurcharge(context); if (surcharge > 0) cost.mana = `${cost.mana || ''}{${surcharge}}`;
    const xValue = Number(context.xValue ?? 0);
    if (!canPayMana(side, cost.mana || '', xValue)) return false;
    if (cost.tap && context.permanent?.tapped) return false;
    if (cost.untap && !context.permanent?.tapped) return false;
    if (cost.life > 0 && side.life < cost.life) return false;
    if (countRequirement(cost.discard) > side.hand.length) return false;
    if (cost.sacrifice && !this.#hasSacrificeTarget(side, cost.sacrifice, context)) return false;
    if (cost.exile && !(this.#isTypedPermanentReq(cost.exile) ? !!this.#choosePermanent(side, cost.exile, context, 'exile', true) : this.#hasZoneTarget(side, cost.exile, 'exile'))) return false; // V12.76 (G22) : City of Shadows
    if (cost.returnToHand && !this.#hasZoneTarget(side, cost.returnToHand, 'returnToHand')) return false;
    return true;
  }

  pay(controller, raw, context = {}) {
    const state = this.getState();
    const side = sideFor(state, controller);
    const cost = normalizeCost(raw, context);
    const surcharge = this.spellSurcharge(context); // canPay(cost) ajoute le même surcoût sur sa propre copie
    const xValue = Number(context.xValue ?? 0);
    if (!this.canPay(controller, cost, context)) throw new Error('Coût impossible à payer.');
    if (surcharge > 0) cost.mana = `${cost.mana || ''}{${surcharge}}`;

    // Resolve choices/references before mutating anything.
    const sacrifice = this.#choosePermanent(side, cost.sacrifice, context, 'sacrifice');
    const exile = this.#isTypedPermanentReq(cost.exile) ? this.#choosePermanent(side, cost.exile, context, 'exile') : this.#chooseZoneCard(side, cost.exile, context, 'exile');
    const returnToHand = this.#chooseZoneCard(side, cost.returnToHand, context, 'returnToHand');
    const discardCount = countRequirement(cost.discard);
    const discardCards = discardCount ? this.#chooseDiscard(side, discardCount, context) : [];

    if (!payMana(side, cost.mana || '', xValue)) throw new Error('Paiement de mana impossible.');
    if (cost.tap) tapPermanent(state, context.permanent, { reason: 'cost', side: controller });
    if (cost.untap) context.permanent.tapped = false;
    if (cost.life > 0) side.life -= cost.life;

    if (sacrifice) this.#movePermanent(side, sacrifice, 'graveyard');
    for (const card of discardCards) this.#removeFromHand(side, card, 'graveyard');
    if (exile) this.#removeFromZone(side, exile, 'graveyard', 'exile');
    if (returnToHand) this.#removeFromZone(side, returnToHand, 'graveyard', 'hand');

    return { cost, xValue, sacrifice, discard: discardCards, exile, returnToHand };
  }

  // V12.76 (G22) : `exile: { type, choose }` = un permanent du champ de bataille d'un type donné (types EFFECTIFS via context.typeOf), comme `sacrifice`.
  #isTypedPermanentReq(req) { return !!req && typeof req === 'object' && !!req.type && !req.uid; }
  #hasSacrificeTarget(side, req, context) {
    if (req === 'self') return !!context?.permanent && side.battlefield.includes(context.permanent);
    return !!this.#choosePermanent(side, req, context, 'sacrifice', true);
  }
  #hasZoneTarget(side, req) {
    if (req === true || req === 'self') return side.battlefield.length > 0;
    if (req === 'card') return side.hand.length > 0;
    return true;
  }
  #choosePermanent(side, req, context, kind, validateOnly = false) {
    if (!req) return null;
    if (req === 'self') {
      return context?.permanent && side.battlefield.includes(context.permanent)
        ? context.permanent
        : null;
    }
    const candidates = side.battlefield.filter(p => !context.permanent || p.uid !== context.permanent.uid || req !== 'self');
    if (!candidates.length) return null;
    if (req === true || typeof req === 'number') return candidates[0];
    if (typeof req === 'object' && req.type && !req.uid) { // V12.76 : « sacrifiez un artefact » -> { type: 'Artifact' }
      // `type` : un type de carte OU un sous-type, ou une liste (« OU » : un Orc ou un Gobelin) ; `other` : pas la carte qui paie (« un AUTRE »).
      const res = [].concat(req.type).map(t => new RegExp('\\b' + t + '\\b', 'i'));
      // V12.76 (G13) : types EFFECTIFS (un terrain animé est aussi un artefact) quand le moteur fournit `typeOf`.
      const matches = p => res.some(re => re.test(String(context?.typeOf ? context.typeOf(p) : (p.type || '')) + ' ' + String(p.subtype || ''))) && !(req.other && context?.permanent && p.uid === context.permanent.uid);
      // V12.76 (G13) : « sacrifiez un artefact » (Priest of Yawgmoth) : `choose: true` -> la carte choisie par le joueur (context.sacrificeUid), pas la première.
      if (req.choose && context?.sacrificeUid) { const picked = candidates.find(p => p.uid === context.sacrificeUid); return picked && matches(picked) ? picked : null; }
      return candidates.find(matches) || null;
    }
    if (typeof req === 'object' && req.uid) return findPermanent(side, req);
    if (typeof req === 'string') {
      const found = candidates.find(p => p.uid === req || p.subtype === req || p.name === req);
      return found || candidates[0];
    }
    return validateOnly ? candidates[0] : candidates[0];
  }
  #chooseZoneCard(side, req) {
    if (!req) return null;
    if (req && typeof req === 'object' && req.uid) return [...side.hand, ...side.battlefield, ...side.graveyard].find(c => c.uid === req.uid) || null;
    if (req === true || req === 'card') return side.hand[0] || side.battlefield[0] || null;
    return null;
  }
  #chooseDiscard(side, count, context) {
    if (this.choose) {
      const chosen = this.choose({ type:'discard', controller:context.controller, options:[...side.hand], min:count, max:count });
      if (Array.isArray(chosen) && chosen.length === count) return chosen;
    }
    return side.hand.slice(0, count);
  }
  #movePermanent(side, permanent, zone) {
    if (this.zones) { this.zones.moveToGraveyard(permanent, { toSide: permanent.owner || side, reason: 'sacrifice' }); return; }
    const i = side.battlefield.indexOf(permanent); if (i >= 0) { side.battlefield.splice(i,1); side[zone].push(permanent); }
  }
  #removeFromHand(side, card, zone) {
    if (this.zones) { this.zones.move(card, zone, { toSide: card.owner || side, reason: 'discard' }); return; }
    const i = side.hand.indexOf(card); if (i >= 0) { side.hand.splice(i,1); side[zone].push(card); }
  }
  #removeFromZone(side, card, from, to) {
    if (this.zones) { this.zones.move(card, to, { toSide: card.owner || side, reason: 'cost' }); return; }
    for (const z of ['hand','battlefield','graveyard','exile']) { const i = side[z].indexOf(card); if (i >= 0) { side[z].splice(i,1); side[to].push(card); return; } }
  }
}

export { canPayMana, payMana, manaCostToPool };
