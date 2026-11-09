/** Targeting service: legality belongs to the engine, presentation does not. */
export class TargetingService {
  constructor({ getValidTargets, needsTarget }) {
    this._getValidTargets = getValidTargets;
    this._needsTarget = needsTarget;
  }
  needsTarget(effect) { return !!this._needsTarget?.(effect); }
  /**
   * @param {string} effect type d'effet
   * @param {string} controller côté qui cible
   * @param {string[]} [colors]
   * @param {object|null} [cardEffect] v12.74 : définition d'effet de la carte (card.effect). Quand elle est
   *   fournie, seules les cibles que le lancement ACCEPTERAIT sont renvoyées (restrictions de type, de
   *   couleur, de zone...). Sans elle : liste large par type d'effet (comportement historique).
   */
  validTargets(effect, controller, colors = [], cardEffect = null, sourceCard = null) {
    // V12.76 (G28) : `sourceCard` (carte lancée / permanent activé) : sans elle, l'IA et l'UI se voyaient proposer des cibles que le lancement refuse
    // (Consecrate Land : aucune autre Aura ; Artifact Ward : aucune capacité d'artefact).
    return this._getValidTargets?.(effect, controller, colors, cardEffect, sourceCard) ?? [];
  }
  choose(effect, controller, colors = [], predicate = () => true, chooser = null) {
    const options = this.validTargets(effect, controller, colors).filter(predicate);
    if (!options.length) return null;
    if (chooser) return chooser({type:'target', controller, options, min:1, max:1});
    return options[0];
  }
  isLegal(effect, target, controller, colors = []) {
    if (!target) return !this.needsTarget(effect);
    const uid = target.uid || target.id || target;
    return this.validTargets(effect, controller, colors).some(x => x === target || x.uid === uid || x.id === uid);
  }
}
