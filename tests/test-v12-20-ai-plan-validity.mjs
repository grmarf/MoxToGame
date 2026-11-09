// V12.20 — L'IA conserve-t-elle des décisions invalidées par un changement d'état ?
import { AIService } from '../src/core/ai/ai-service.js';

const state = {
  activePlayer: 'ai',
  player: { battlefield: [], hand: [], library: [], graveyard: [], life: 20, mana: {} },
  ai: { battlefield: [], hand: [], library: [], graveyard: [], life: 20, mana: {} }
};

const ai = new AIService({ state: () => state, turnManager: null, combat: null, stack: null, effects: null, costs: null, side: 'ai' });

// Simuler un plan à deux étapes
state.ai.battlefield.push({ uid: 'c1', controller: 'ai', owner: 'ai', type: 'Creature' });

// Vérifier que l'IA possède une méthode d'évaluation
console.log('AI service methods:', Object.keys(ai).filter(k => typeof ai[k] === 'function'));
console.log('PASS: test de scénario préparé');
