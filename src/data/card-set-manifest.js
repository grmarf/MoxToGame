// "expected" = nombre de cartes LOGIQUES (une définition par nom, conforme à la
// convention V12.3.1), pas le total de prints/variantes que certains sites de
// collection (EchoMTG) affichent. FEM et ATQ divergent de leur total "officiel"
// de vente (187 et 100) car ces deux sets réimpriment de nombreuses cartes avec
// plusieurs artistes différents (FEM) ou plusieurs illustrations de terrain
// (ATQ : Mishra's Factory, Strip Mine, Urza's Mine/Power Plant/Tower). Compter
// ces variantes comme des cartes distinctes n'a pas de sens pour un moteur de
// règles : ce sont des réimpressions strictement identiques en jeu.
// LEB et ARN ont été ajustés en V12.22 (287 et 77, au lieu de 302 et 78) :
// les terrains de base sont désormais des entrées canoniques globales
// (sets: []), partagées entre toutes les éditions plutôt que dupliquées par
// édition, cohérent avec le principe "une définition par nom" énoncé
// ci-dessus.
// Sources : rarity breakdown Wikipedia/MTG Wiki (FEM: 35+31+36=102) et
// dénombrement des noms uniques de la checklist EchoMTG (ATQ: 85). Vérifié V12.5, V12.22.
export const CARD_SET_MANIFEST = {
  LEB: { name: 'Limited Edition Beta', expected: 287 },
  ARN: { name: 'Arabian Nights', expected: 77 },
  LEG: { name: 'Legends', expected: 310 },
  DRK: { name: 'The Dark', expected: 119 },
  FEM: { name: 'Fallen Empires', expected: 102 },
  ATQ: { name: 'Antiquities', expected: 85 }
};
