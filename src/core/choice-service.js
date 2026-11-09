// V9.3 — unified choice service (M4). UI and AI can provide the same chooser contract.
export class ChoiceService {
  constructor({ state, chooser = null, events = null } = {}) { this.getState = state; this.chooser = chooser; this.events = events; this.pending = null; this.seq = 0; this.afterResolve = null; }
  setChooser(chooser) { this.chooser = chooser; return this; }
  setEvents(events) { this.events = events; return this; }
  getPending() { return this.pending; }
  request(spec = {}, continuation = null) {
    const options = Array.isArray(spec.options) ? spec.options : [];
    if (!options.length) return spec.defaultValue ?? null;
    const choice = { id:`choice_${++this.seq}`, type:spec.type || 'choice', controller:spec.controller || 'player', prompt:spec.prompt || 'Choisissez.', options, min:spec.min ?? 1, max:spec.max ?? 1, defaultValue:spec.defaultValue ?? options[0], _continuation: typeof continuation === 'function' ? continuation : null };
    const chosen = this.chooser ? this.chooser(choice, this.getState?.()) : null;
    if (chosen != null) return this.validate(choice, chosen) ? chosen : choice.defaultValue;
    this.pending = choice;
    this.events?.emit?.({ type:'choiceRequested', choice });
    return null;
  }
  validate(choice, value) {
    const sameOption = (x, v) => {
      if (x === v) return true;
      if (x == null || v == null) return false;
      if (typeof x !== 'object' || typeof v !== 'object') return false;
      if (x.uid != null || v.uid != null) return x.uid != null && v.uid != null && x.uid === v.uid;
      if (x.id != null || v.id != null) return x.id != null && v.id != null && x.id === v.id;
      return false;
    };
    // v12.72 : un choix « 0 ou 1 carte » (max 1, min 0) doit pouvoir se répondre par [] (rien) ou
    // [carte] comme les choix multiples ; sinon Mind Bomb ne permettait pas de ne rien défausser (ou
    // de défausser sa seule carte) avec une main d'une carte.
    if (choice.max === 1 && Array.isArray(value)) {
      if (value.length === 0) return choice.min === 0;
      if (value.length === 1) return choice.options.some(x => sameOption(x, value[0]));
      return false;
    }
    if (choice.max === 1) return choice.options.some(x => sameOption(x, value));
    if (!Array.isArray(value) || value.length < choice.min || value.length > choice.max) return false;
    return value.every(v => choice.options.some(x => sameOption(x, v)));
  }
  resolve(value) {
    if (!this.pending) throw new Error('Aucun choix en attente.');
    const c=this.pending;
    if(!this.validate(c,value)) throw new Error('Choix invalide.');
    this.pending=null;
    this.events?.emit?.({ type:'choiceResolved', choice:c, value });
    let result = value;
    try {
      if (typeof c._continuation === 'function') result = c._continuation(value);
    } finally {
      // V12.75 : la continuation d'un choix (Mind Bomb, tuteurs, défausses...) modifie l'état hors de
      // dispatch() ; sans ce crochet, un joueur à 0 PV ou une créature létalement blessée restait en jeu.
      if (typeof this.afterResolve === 'function') this.afterResolve(c);
    }
    return result;
  }
  clear(reason = 'cancelled') {
    const choice = this.pending;
    this.pending=null;
    if (choice) this.events?.emit?.({ type:'choiceCleared', choice, reason });
  }
}
