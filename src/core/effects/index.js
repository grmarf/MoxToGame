import { registerAtomicEffects } from './atomic-effects.js';
import { registerUpkeepCostEffects } from './upkeep-cost-effects.js';
import { registerExtendedEffects, registerC123Effects } from './extended-effects.js';
import { registerC7Effects, installC7EventRules } from './complex-effects.js';
import { registerC6Effects, installC6EventRules } from './replacement-card-effects.js';
import { registerC81Effects } from './choice-effects.js';
import { registerC83Effects } from '../layers/copy-effects.js';
import { registerC84C85Effects } from './search-aura-effects.js';
import { registerC86C87Effects, installC86C87EventRules } from './token-historical-effects.js';
import { registerC88Effects, installC88EventRules } from './final-pass-effects.js';
import { registerC91Effects } from './behavioral-effects.js';
import { registerC92Effects } from './damage-family-effects.js';
import { registerC93Effects } from './destruction-effects.js';

export function installEffectDomains(registry, host = window) {
  registerAtomicEffects(registry);
  registerUpkeepCostEffects(registry);
  registerC7Effects(registry);
  registerC6Effects(registry);
  registerC81Effects(registry);
  registerC83Effects(registry);
  registerC84C85Effects(registry);
  registerC86C87Effects(registry);
  registerC88Effects(registry);
  registerC91Effects(registry);
  registerC92Effects(registry);
  registerC93Effects(registry);
  registerExtendedEffects(registry);
  registerC123Effects(registry);
  installC7EventRules();
  installC6EventRules();
  installC86C87EventRules();
  installC88EventRules();
  host.__MTG8_EFFECT_REGISTRY = registry;
  return registry;
}

export function installEffects(registry, host = window) {
  return installEffectDomains(registry, host);
}
