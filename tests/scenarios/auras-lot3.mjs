// Scénarios déclaratifs — auras « devient engagé » (G16) : Psychic Venom, Blight.
const tap = (id) => ({ tapMana: id });
export const SCENARIOS = [
  { card: 'Psychic Venom', contract: { host: 'Plains', hostKind: 'land' }, runs: [
    // Le terrain d'un ADVERSAIRE : quand LUI l'engage, c'est LUI qui subit 2 blessures (« le contrôleur de ce terrain »), pas le lanceur de l'Aura.
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land' }] } },
      when: [{ cast: 'Psychic Venom', on: 'land', as: 'aura' }, { expect: { life: ['ai', 20] } }, tap('land'), { settle: true }],
      then: [{ life: ['ai', 18] }, { life: ['player', 20] }, { tapped: ['land', true] }] },
    // Sur MON terrain : c'est moi qui subis 2 blessures.
    { given: { player: { battlefield: [{ name: 'Swamp', id: 'land' }] } },
      when: [{ cast: 'Psychic Venom', on: 'land', as: 'aura' }, tap('land'), { settle: true }], then: [{ life: ['player', 18] }, { life: ['ai', 20] }] },
    // Un AUTRE terrain engagé ne déclenche rien ; le terrain enchanté arrivé engagé non plus (« devient » ≠ « arrive »).
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land' }, { name: 'Island', id: 'other' }] } },
      when: [{ cast: 'Psychic Venom', on: 'land', as: 'aura' }, tap('other'), { settle: true }], then: [{ life: ['ai', 20] }] },
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land', tapped: true }] } },
      when: [{ cast: 'Psychic Venom', on: 'land', as: 'aura' }, { settle: true }], then: [{ life: ['ai', 20] }] },
    // Après le départ de l'Aura : plus aucun effet.
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land' }] } },
      when: [{ cast: 'Psychic Venom', on: 'land', as: 'aura' }, { remove: 'aura' }, tap('land'), { settle: true }], then: [{ life: ['ai', 20] }] },
    // Engagé par un EFFET (Twiddle : « engagez ou dégagez un terrain ») : l'événement part aussi.
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land' }] }, player: { battlefield: [] } },
      when: [{ cast: 'Psychic Venom', on: 'land', as: 'aura' }, { cast: 'Twiddle', on: 'land' }, { settle: true }], then: [{ tapped: ['land', true] }, { life: ['ai', 18] }] },
  ] },
  { card: 'Blight', contract: { host: 'Plains', hostKind: 'land' }, runs: [
    // Engager le terrain enchanté le DÉTRUIT (le mana est tout de même produit : le coût est payé, le déclencheur passe ensuite sur la pile).
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land' }] } },
      when: [{ cast: 'Blight', on: 'land', as: 'aura' }, { expect: { zone: ['Island', 'battlefield', 'ai'] } }, tap('land'), { settle: true }],
      then: [{ zone: ['Island', 'graveyard', 'ai'] }, { zone: ['Blight', 'graveyard', 'player'] }, { pool: ['ai', { U: 1 }] }] },
    // Un autre terrain n'est pas touché ; le terrain enchanté non engagé non plus.
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land' }, { name: 'Island', id: 'other' }] } },
      when: [{ cast: 'Blight', on: 'land', as: 'aura' }, tap('other'), { settle: true }], then: [{ zone: ['Island', 'battlefield', 'ai'] }, { attached: ['aura', 'land'] }] },
    // Sans l'Aura (détruite avant), le terrain s'engage sans risque.
    { given: { ai: { battlefield: [{ name: 'Island', id: 'land' }] } },
      when: [{ cast: 'Blight', on: 'land', as: 'aura' }, { remove: 'aura' }, tap('land'), { settle: true }], then: [{ zone: ['Island', 'battlefield', 'ai'] }, { tapped: ['land', true] }] },
  ] },
];
