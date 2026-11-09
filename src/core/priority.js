/** Priority domain. Kept independent from rendering and AI. */
export class PriorityController {
  constructor({ state, give, pass }) {
    this.state = state;
    this.giveLegacy = give;
    this.passLegacy = pass;
  }
  get holder() { return this.state()?.priorityHolder ?? null; }
  give(side) { if (!['player','ai'].includes(side)) throw new Error('Joueur de priorité invalide.'); return this.giveLegacy(side); }
  pass(side) { if (!this.isHeldBy(side)) throw new Error('Ce joueur n’a pas la priorité.'); return this.passLegacy(side); }
  reset(side = this.state()?.activePlayer || 'player') { return this.give(side); }
  isHeldBy(side) { return this.holder === side; }
}
