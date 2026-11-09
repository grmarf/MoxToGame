// Scénarios déclaratifs des auras du lot pilote (attendus tirés de l'Oracle). Chaque entrée : { card, contract:{…}, runs:[ {given, when, then}… ] }.
const BEARS = 'Grizzly Bears';
const upkeepOf = (side) => [{ phase: 'upkeep', turn: side }, { settle: true }];
const curse = (card, hostName, hostKind) => ({
  card, contract: { host: hostName, hostKind },
  runs: [
    { given: { ai: { battlefield: [{ name: hostName, id: 'host' }] } },
      when: [{ cast: card, on: 'host', as: 'aura' }, ...upkeepOf('ai'), { expect: { life: ['ai', 19] } }, { expect: { life: ['player', 20] } }, ...upkeepOf('player'), { expect: { life: ['player', 20] } }, ...upkeepOf('ai')],
      then: [{ life: ['ai', 18] }, { life: ['player', 20] }] },  // seul le CONTRÔLEUR de l'hôte souffre, à SON entretien
    { given: { player: { battlefield: [{ name: hostName, id: 'host' }] } },
      when: [{ cast: card, on: 'host', as: 'aura' }, ...upkeepOf('player')], then: [{ life: ['player', 19] }, { life: ['ai', 20] }] },
  ],
});
export const SCENARIOS = [
  { card: 'Fishliver Oil', contract: { then: [{ kw: ['host', 'islandwalk', true] }] }, runs: [
    { given: { player: { battlefield: [{ name: BEARS, id: 'host' }] }, ai: { battlefield: ['Island', { name: 'Hill Giant', id: 'blk' }] } },
      when: [{ cast: 'Fishliver Oil', on: 'host' }, { attack: ['host'] }, { block: { host: ['blk'] }, illegal: /./ }], then: [] },          // l'adversaire contrôle une Île : imblocable
    { given: { player: { battlefield: [{ name: BEARS, id: 'host' }] }, ai: { battlefield: [{ name: 'Hill Giant', id: 'blk' }] } },
      when: [{ cast: 'Fishliver Oil', on: 'host' }, { attack: ['host'] }, { block: { host: ['blk'] } }], then: [] },                      // sans Île : bloquable
    { given: { player: { battlefield: [{ name: BEARS, id: 'host' }] }, ai: { battlefield: ['Island', { name: 'Hill Giant', id: 'blk' }] } },
      when: [{ attack: ['host'] }, { block: { host: ['blk'] } }], then: [] },                                                                // sans l'aura : bloquable
  ] },
  { card: 'Animate Wall', contract: { host: 'Wall of Stone' }, runs: [
    { given: { player: { battlefield: [{ name: 'Wall of Stone', id: 'wall' }, { name: BEARS, id: 'bear' }] } },
      when: [{ attack: ['wall'], illegal: true }, { main: true }, { cast: 'Animate Wall', on: 'bear', illegal: /./ }, { cast: 'Animate Wall', on: 'wall', as: 'aura' }, { expect: { kw: ['wall', 'defender', false] } }, { attack: ['wall'] }],
      then: [{ kw: ['wall', 'defender', false] }] },
  ] },
  curse('Wanderlust', BEARS, 'creature'), curse('Cursed Land', 'Plains', 'land'), curse('Erosion', 'Island', 'land'), curse('Feedback', 'Circle of Protection: Red', 'enchantment'),
  { card: 'Holy Armor', contract: { when: [], then: [{ stats: ['host', 2, 4] }] }, runs: [
    { given: { ai: { battlefield: [{ name: BEARS, id: 'host' }] } },
      when: [{ cast: 'Holy Armor', on: 'host', as: 'aura' }, { expect: { stats: ['host', 2, 4] } }, { pool: { side: 'player', mana: {} } }, { activate: 'aura', side: 'player', illegal: /./ },
        { pool: { side: 'player', mana: { W: 1 } } }, { activate: 'aura', side: 'player' }, { expect: { stats: ['host', 2, 5] } },
        { pool: { side: 'player', mana: { W: 1 } } }, { activate: 'aura', side: 'player' }, { expect: { stats: ['host', 2, 6] } }, { nextTurn: true }],
      then: [{ stats: ['host', 2, 4] }] },                                                                                                   // le +0/+1 s'efface en fin de tour, le +0/+2 reste
  ] },
  { card: 'Blessing', contract: {}, runs: [
    { given: { ai: { battlefield: [{ name: BEARS, id: 'host' }] } },
      when: [{ cast: 'Blessing', on: 'host', as: 'aura' }, { expect: { stats: ['host', 2, 2] } }, { pool: { side: 'player', mana: {} } }, { activate: 'aura', side: 'player', illegal: /./ },
        { pool: { side: 'player', mana: { W: 1 } } }, { activate: 'aura', side: 'player' }, { expect: { stats: ['host', 3, 3] } },
        { pool: { side: 'player', mana: { W: 1 } } }, { activate: 'aura', side: 'player' }, { expect: { stats: ['host', 4, 4] } }, { nextTurn: true }],
      then: [{ stats: ['host', 2, 2] }] },
  ] },
  { card: 'The Brute', contract: { then: [{ stats: ['host', 3, 2] }] }, runs: [
    { given: { ai: { battlefield: [{ name: BEARS, id: 'host' }] } },
      when: [{ cast: 'The Brute', on: 'host', as: 'aura' }, { expect: { stats: ['host', 3, 2] } }, { pool: { side: 'player', mana: { R: 2 } } }, { activate: 'aura', side: 'player', illegal: /./ },
        { pool: { side: 'player', mana: { R: 3 } } }, { activate: 'aura', side: 'player' }, { lethal: 'host' }],
      then: [{ zone: ['host', 'battlefield'] }, { tapped: ['host', true] }] },                                                              // régénéré : survit, engagé
    { given: { ai: { battlefield: [{ name: BEARS, id: 'host' }] } }, when: [{ cast: 'The Brute', on: 'host', as: 'aura' }, { lethal: 'host' }], then: [{ zone: [BEARS, 'graveyard', 'ai'] }] },   // sans bouclier : meurt
  ] },
  { card: 'Regeneration', contract: { then: [{ stats: ['host', 2, 2] }] }, runs: [
    { given: { ai: { battlefield: [{ name: BEARS, id: 'host' }] } },
      when: [{ cast: 'Regeneration', on: 'host', as: 'aura' }, { pool: { side: 'player', mana: { G: 1 } } }, { activate: 'aura', side: 'player' }, { lethal: 'host' }, { expect: { zone: ['host', 'battlefield'] } }, { lethal: 'host' }],
      then: [{ zone: [BEARS, 'graveyard', 'ai'] }] },                                                                                        // un seul bouclier : la 2e fois, la créature meurt
  ] },
  { card: 'Unstable Mutation', contract: { then: [{ stats: ['host', 5, 5] }] }, runs: [
    { given: { ai: { battlefield: [{ name: BEARS, id: 'host' }] } },
      when: [{ cast: 'Unstable Mutation', on: 'host', as: 'aura' }, { expect: { stats: ['host', 5, 5] } }, ...upkeepOf('ai'), { expect: { stats: ['host', 4, 4] } }, ...upkeepOf('player'), { expect: { stats: ['host', 4, 4] } }, ...upkeepOf('ai')],
      then: [{ stats: ['host', 3, 3] }, { counter: ['host', '-1/-1', 2] }] },                                                                  // un marqueur -1/-1 par entretien de SON contrôleur
  ] },
];
