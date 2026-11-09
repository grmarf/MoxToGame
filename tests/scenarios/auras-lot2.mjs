// Scénarios déclaratifs — auras, lot 2 (Curse Artifact, Divine Transformation, Wild Growth).
const upkeep = (side) => [{ phase: 'upkeep', turn: side }];
export const SCENARIOS = [
  { card: 'Curse Artifact', contract: { host: 'Sol Ring', hostKind: 'artifact' }, runs: [
    // L'artefact de l'ADVERSAIRE : à SON entretien, C'EST LUI qui choisit ; subir 2 blessures, l'artefact reste.
    { given: { ai: { battlefield: [{ name: 'Sol Ring', id: 'art' }] } },
      when: [{ cast: 'Curse Artifact', on: 'art', as: 'aura' },
        ...upkeep('ai'), { pass: true }, { expect: { pending: ['sacrificeOrDamage', ['sacrifice', 'damage'], 'ai'] } }, { choose: 'foo', illegal: /invalide/i }, { choose: 'damage' }, { settle: true },
        { expect: { life: ['ai', 18] } }, ...upkeep('player'), { pass: true }, { expect: { noPending: true } }],                          // mon entretien : rien (ce n'est pas MON artefact)
      then: [{ life: ['ai', 18] }, { life: ['player', 20] }, { zone: ['art', 'battlefield'] }, { attached: ['aura', 'art'] }] },
    // Il préfère sacrifier l'artefact : pas de blessure, l'artefact au cimetière, et l'Aura le suit.
    { given: { ai: { battlefield: [{ name: 'Sol Ring', id: 'art' }] } },
      when: [{ cast: 'Curse Artifact', on: 'art', as: 'aura' }, ...upkeep('ai'), { pass: true }, { choose: 'sacrifice' }, { settle: true }],
      then: [{ life: ['ai', 20] }, { zone: ['Sol Ring', 'graveyard', 'ai'] }, { zone: ['Curse Artifact', 'graveyard', 'player'] }] },
    // Sur MON propre artefact : c'est moi qu'on interroge, à mon entretien.
    { given: { player: { battlefield: [{ name: 'Sol Ring', id: 'art' }] } },
      when: [{ cast: 'Curse Artifact', on: 'art', as: 'aura' }, ...upkeep('ai'), { pass: true }, { expect: { noPending: true } }, ...upkeep('player'), { pass: true },
        { expect: { pending: ['sacrificeOrDamage', ['sacrifice', 'damage'], 'player'] } }, { choose: 'damage' }],
      then: [{ life: ['player', 18] }, { life: ['ai', 20] }] },
  ] },
  { card: 'Divine Transformation', contract: { then: [{ stats: ['host', 5, 5] }] }, runs: [
    { given: { ai: { battlefield: [{ name: 'Grizzly Bears', id: 'host' }] } },
      when: [{ cast: 'Divine Transformation', on: 'host', as: 'aura' }, { expect: { stats: ['host', 5, 5] } }, { nextTurn: true }, { nextTurn: true }], then: [{ stats: ['host', 5, 5] }] },   // permanent, pas « jusqu'à la fin du tour »
    { given: { ai: { battlefield: [{ name: 'Hill Giant', id: 'host' }] } }, when: [{ cast: 'Divine Transformation', on: 'host', as: 'aura' }], then: [{ stats: ['host', 6, 6] }] },
  ] },
  { card: 'Wild Growth', contract: { host: 'Forest' }, runs: [
    { given: { player: { battlefield: [{ name: 'Forest', id: 'land' }] } },
      when: [{ cast: 'Wild Growth', on: 'land', as: 'aura' }, { pool: { side: 'player', mana: {} } }, { tapMana: 'land' }], then: [{ pool: ['player', { G: 2 }] }] },          // {G} de la Forêt + {G} de l'Aura
    { given: { player: { battlefield: [{ name: 'Plains', id: 'land' }] } },
      when: [{ cast: 'Wild Growth', on: 'land', as: 'aura' }, { pool: { side: 'player', mana: {} } }, { tapMana: 'land' }], then: [{ pool: ['player', { W: 1, G: 1 }] }] },   // +{G} quel que soit le terrain
    { given: { player: { battlefield: [{ name: 'Forest', id: 'land' }] } },
      when: [{ cast: 'Wild Growth', on: 'land', as: 'aura' }, { remove: 'aura' }, { pool: { side: 'player', mana: {} } }, { tapMana: 'land' }], then: [{ pool: ['player', { G: 1 }] }] },   // l'Aura partie : plus de bonus
    { given: { ai: { battlefield: [{ name: 'Forest', id: 'land' }] } },
      when: [{ cast: 'Wild Growth', on: 'land', as: 'aura' }, { pool: { side: 'ai', mana: {} } }, { pool: { side: 'player', mana: {} } }, { tapMana: 'land' }], then: [{ pool: ['ai', { G: 2 }] }, { pool: ['player', {}] }] },     // le bonus va au CONTRÔLEUR du terrain
    { given: { player: { battlefield: [{ name: 'City of Brass', id: 'land' }] } },
      when: [{ cast: 'Wild Growth', on: 'land', as: 'aura' }, { pool: { side: 'player', mana: {} } }, { activate: 'land', ability: 0, side: 'player' }, { choose: 'W' }], then: [{ pool: ['player', { W: 1, G: 1 }] }, { life: ['player', 19] }] },  // aussi pour une capacité de mana « activated »
  ] },
];
