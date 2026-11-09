import assert from 'node:assert/strict';
import { normalizeCard } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

// Audit v12.69 : verrouille le bilan "cartes silencieuses" établi cette
// session (278 cartes basculées de statut absent à "unimplemented"). Ce test
// échoue si une carte future (sort/éphémère sans effet, ou permanent sans
// aucun comportement moteur ET avec du texte de règles réel) réapparaît sans
// statut honnête -- ce qui est exactement le problème que l'utilisateur avait
// repéré (classement "fonctionne / ne fonctionne pas" pas fiable).

const isSpell = c => /Instant|Sorcery|Interrupt/.test(c.type);
const hasBehavior = (n) => !!(n.effect || n.triggers?.length || n.static || n.tapAbility || n.produces || n.activated?.length || n.abilities?.length || n.replacementEffects || n.keywords?.length);
const meaningfulText = (raw) => raw.text_fr && raw.text_fr.replace(/\([^)]*\)/g, '').trim().length > 3;

const silentSpells = CARDS.filter(raw => isSpell(raw) && !normalizeCard(raw).effect && raw.effectStatus !== 'unimplemented');
const silentPerms = CARDS.filter(raw => {
  if (isSpell(raw)) return false;
  const n = normalizeCard(raw);
  if (n.isLand || hasBehavior(n)) return false;
  if (raw.effectStatus === 'unimplemented') return false;
  return meaningfulText(raw);
});

assert.deepEqual(silentSpells.map(c => c.name), [], `Sorts/éphémères sans effet ET sans statut unimplemented : ${silentSpells.map(c => c.name).join(', ')}`);
assert.deepEqual(silentPerms.map(c => c.name), [], `Permanents avec du texte de règles, sans comportement moteur, sans statut unimplemented : ${silentPerms.map(c => c.name).join(', ')}`);
console.log('OK V12.83: aucune carte avec du texte de règles réel ne se fait passer pour jouable sans l\'être (ni ne reste silencieuse sans le dire).');
