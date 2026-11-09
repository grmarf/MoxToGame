// V12.3 — C8.1: choices, search, randomisation, copying and token helpers.
// createToken removed (unified in c8-token-historical.js).
// setBasePT migrated to continuous static effect (Layer 7b).
import { gameEvents } from '../event-bus.js';
import { rngClock } from '../rng-clock-service.js';

const sides = ['player','ai'];
const other = s => s === 'player' ? 'ai' : 'player';
const findPermanent = (state, ref) => {
  const id = ref?.uid || ref?.objectId || ref?.id || ref;
  return sides.flatMap(s => state[s]?.battlefield || []).find(p => p.uid === id || p.objectId === id) || null;
};

function register(registry, type, fn) { if (!registry.has(type)) registry.register(type, fn); }

export function registerC81Effects(registry) {
  register(registry, 'randomDiscard', (ctx, effect) => {
    const side = effect.target === 'opponent' ? other(ctx.controllerKey) : (effect.side || ctx.controllerKey);
    const hand = ctx.state[side]?.hand || [];
    const count = Math.min(Number(effect.amount || 1), hand.length);
    for (let i=0;i<count;i++) {
      const index = Math.floor(rngClock.random() * ctx.state[side].hand.length);
      ctx.api.discardCard(side, index);
    }
  });

  register(registry, 'chooseNumber', (ctx, effect) => {
    const min = Number.isInteger(effect.min) ? effect.min : 0;
    const max = Number.isInteger(effect.max) ? effect.max : min;
    if (max < min) return null;
    const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const applyChoice = (chosen, resumeCtx = ctx) => {
      if (!Number.isInteger(chosen) || chosen < min || chosen > max) return null;
      if (resumeCtx.sourceCard) resumeCtx.sourceCard.chosenNumber = chosen;
      return chosen;
    };
    const chosen = ctx.api.choose({
      type: 'number',
      controller: ctx.controllerKey,
      options,
      min: 1,
      max: 1,
      prompt: effect.prompt || `Choisissez un nombre entre ${min} et ${max}.`,
      defaultValue: min,
    }, applyChoice);
    if (chosen != null) return applyChoice(chosen);
    return null;
  });

  register(registry, 'chooseColor', (ctx, effect) => {
    const colors = Array.isArray(effect.options) && effect.options.length ? effect.options : ['W','U','B','R','G'];
    const applyChoice = (chosen, resumeCtx = ctx) => {
      if (!colors.includes(chosen)) return null;
      if (resumeCtx.sourceCard) resumeCtx.sourceCard.chosenColor = chosen;
      if (effect.target) {
        const target = findPermanent(resumeCtx.state, resumeCtx.targetInfo);
        if (target) target.chosenColor = chosen;
      }
      return chosen;
    };
    const chosen = ctx.api.choose(
      { type:'color', controller:ctx.controllerKey, options:colors, prompt:effect.prompt || 'Choisissez une couleur.', defaultValue:colors[0] },
      applyChoice
    );
    // When a synchronous chooser is configured, ChoiceService returns the value
    // directly and does not invoke the continuation. Apply it here. Human/UI
    // choices return null and are resumed by the stack continuation.
    if (chosen != null) return applyChoice(chosen);
    return null;
  });

  register(registry, 'searchLibrary', (ctx, effect) => {
    const side = effect.side || ctx.controllerKey;
    const library = ctx.state[side]?.library || [];
    if (!library.length) return null;
    const candidates = library.filter(card => {
      if (effect.cardType && !String(card.type || '').includes(effect.cardType)) return false;
      if (effect.subtype && !String(card.subtype || '').toLowerCase().includes(String(effect.subtype).toLowerCase())) return false;
      if (effect.name && card.name !== effect.name) return false;
      if (effect.basicLand && !(card.isBasic || /\bBasic\b/i.test(String(card.type || '')))) return false; // V12.75 : Untamed Wilds
      return true;
    });
    if (!candidates.length) { ctx.api.shuffle(library); return null; }

    const chosenKey = card => card?.uid ?? card?.objectId ?? card?.id ?? null;
    const resumeSearch = (chosen, resumeCtx = ctx) => {
      const currentLibrary = resumeCtx.state[side]?.library || [];
      const key = chosenKey(chosen);
      const card = currentLibrary.find(candidate => {
        const candidateKey = chosenKey(candidate);
        return key != null && candidateKey != null && candidateKey === key;
      });
      if (!card) return null;

      const index = currentLibrary.indexOf(card);
      if (index < 0) return null;
      // v12.72 : ne PAS retirer la carte avant zones.move (il la retrouve dans sa zone d'origine ;
      // le retrait préalable provoquait « Objet introuvable » et la carte disparaissait du jeu).
      // V12.75 : `destination: 'battlefield'` (Untamed Wilds) met la carte directement en jeu.
      const dest = effect.destination === 'battlefield' ? 'battlefield' : 'hand';
      if (resumeCtx.api.zones) resumeCtx.api.zones.move(card,dest,{toSide:side,controller:side,reason:'searchLibrary'});
      else { currentLibrary.splice(index, 1); resumeCtx.state[side][dest].push({...card,zone:dest}); }
      resumeCtx.api.shuffle(currentLibrary);
      gameEvents.emit({type:'librarySearched', side, card});
      return card;
    };

    const chosen = ctx.api.choose(
      { type:'libraryCard', controller:side, options:candidates, min:1, max:1, prompt:effect.prompt || 'Choisissez une carte.', defaultValue:candidates[0] },
      resumeSearch
    );
    // v12.72 : avec un chooser synchrone (IA), ChoiceService renvoie la valeur SANS appeler la
    // continuation : il faut l'appliquer ici (patron des autres handlers), sinon la recherche
    // ne déplaçait rien. Un choix humain renvoie null et reprend par la continuation.
    if (chosen != null) return resumeSearch(chosen);
    return null;
  });

  register(registry, 'lookTop', (ctx, effect) => {
    const side = effect.side || ctx.controllerKey;
    const n = Math.min(Number(effect.amount || 1), ctx.state[side].library.length);
    const cards = ctx.state[side].library.slice(-n).reverse();
    ctx.api.choose({ type:'lookTop', controller:side, options:cards, min:0, max:0, prompt:effect.prompt || `Regardez les ${n} cartes du dessus.` });
    ctx.state[side].lookedAt = cards.map(c => c.uid || c.objectId || c.id);
    return cards;
  });

  // V12.75 : Natural Selection — « Regardez les trois cartes du dessus d'UNE bibliothèque (celle d'un joueur ciblé).
  // Vous pouvez en mettre une au fond. » Avant : aucune cible, et le choix `min:0,max:0` interdisait de rien déplacer.
  register(registry, 'lookTopTarget', (ctx, effect) => {
    const t = ctx.targetInfo; const side = t?.kind === 'player' ? t.side : ctx.controllerKey;
    const n = Math.min(Number(effect.amount || 3), ctx.state[side].library.length);
    if (n === 0) return null;
    const cards = ctx.state[side].library.slice(-n).reverse();
    const apply = (chosen) => {
      const pick = Array.isArray(chosen) ? chosen[0] : chosen; if (!pick) return null;
      const lib = ctx.state[side].library; const i = lib.findIndex((c) => c.uid === pick.uid);
      if (i < 0) return null; const [card] = lib.splice(i, 1); lib.unshift(card);
      ctx.api.log?.(`${ctx.sourceCard?.name || 'Effet'} : une carte est mise au fond de la bibliothèque.`, ctx.controllerKey);
      return card;
    };
    ctx.state[side].lookedAt = cards.map((c) => c.uid || c.objectId || c.id);
    const chosen = ctx.api.choose({ type: 'lookTopBottom', controller: ctx.controllerKey, options: cards, min: 0, max: 1, prompt: `Regardez les ${n} cartes du dessus : vous pouvez en mettre une au fond.` }, apply);
    if (chosen != null) return apply(chosen);
    return null;
  });

  register(registry, 'putTopCardBottom', (ctx, effect) => {
    const side = effect.side || ctx.controllerKey;
    const lib = ctx.state[side].library;
    if (!lib.length) return;
    const top = lib.pop(); lib.unshift(top);
  });

  register(registry, 'copySpell', (ctx, effect) => {
    const item = ctx.api.findStackItem?.(ctx.targetInfo?.id || ctx.targetInfo);
    if (!item || !['spell','copy'].includes(item.type)) return null;
    const target = effect.chooseNewTargets ? ctx.api.chooseNewTargets?.(item, ctx.controllerKey) : item.target;
    return ctx.api.pushSpellCopy?.(item, ctx.controllerKey, target) || null;
  });

  // V12.3 — setBasePT migrated from direct mutation to continuous static effect.
  // This makes it properly interact with layers and removable when the source leaves.
  register(registry, 'setBasePT', (ctx, effect) => {
    const target = findPermanent(ctx.state, ctx.targetInfo);
    if (!target) return;
    // Apply as a continuous effect on the target itself so it layers correctly
    target.static = Array.isArray(target.static) ? target.static : (target.static ? [target.static] : []);
    target.static.push({
      type: 'setPowerToughness',
      power: Number(effect.power ?? 0),
      toughness: Number(effect.toughness ?? 0),
      selfOnly: true,
      duration: effect.duration || 'permanent'
    });
  });

  // Mind Bomb (Oracle) : « Each player may discard up to three cards.
  // Mind Bomb deals damage to each player equal to 3 minus the number of
  // cards they discarded this way. » — deux choix indépendants (un par
  // joueur), enchaînés via continuation : le premier suspend en attendant
  // le joueur humain, sa continuation demande ensuite le choix de l'IA
  // (suspension imbriquée, supportée depuis la correction de
  // StackController#resumeChoice), puis les blessures sont appliquées aux
  // deux joueurs une fois les deux choix connus.
  register(registry, 'mindBombDiscard', (ctx, effect) => {
    const cap = Number.isInteger(effect.maxDiscard) ? effect.maxDiscard : 3;

    const discardChosen = (side, chosenCards, resumeCtx) => {
      const hand = resumeCtx.state[side].hand;
      let count = 0;
      // Un choix à une seule option (main d'une carte) peut revenir comme objet seul : on normalise.
      const chosenList = Array.isArray(chosenCards) ? chosenCards : (chosenCards ? [chosenCards] : []);
      for (const chosen of chosenList) {
        const key = chosen?.uid ?? chosen?.objectId ?? chosen?.id ?? null;
        const idx = hand.findIndex(c => (c.uid ?? c.objectId ?? c.id) === key);
        if (idx < 0) continue;
        // v12.72 : idem — zones.move doit voir la carte dans la main (plus de splice préalable).
        const card = hand[idx];
        if (resumeCtx.api.zones) resumeCtx.api.zones.move(card, 'graveyard', { toSide: side, reason: 'mindBombDiscard' });
        else { hand.splice(idx, 1); resumeCtx.state[side].graveyard.push({ ...card, zone: 'graveyard' }); }
        count++;
      }
      return count;
    };

    const dealDamage = (discardCounts, resumeCtx) => {
      for (const side of sides) {
        const discarded = discardCounts[side] || 0;
        const dmg = Math.max(0, cap - discarded);
        if (dmg <= 0) continue;
        const opts = { color: resumeCtx.sourceCard?.color?.[0] || null, source: resumeCtx.sourceCard };
        if (resumeCtx.api.applyDamageToPlayer) resumeCtx.api.applyDamageToPlayer(side, dmg, opts);
        else resumeCtx.state[side].life -= dmg;
        resumeCtx.api.log(`${resumeCtx.sourceCard.name} inflige ${dmg} blessure(s) à ${side === 'player' ? 'vous' : "l'IA"}.`, resumeCtx.controllerKey);
      }
      gameEvents.emit({ type: 'mindBombResolved', discardCounts });
      return discardCounts;
    };

    const askSide = (side, discardCounts, resumeCtx, isLast) => {
      const hand = resumeCtx.state[side].hand;
      const applyForSide = (chosenCards, innerResumeCtx = resumeCtx) => {
        const count = discardChosen(side, chosenCards, innerResumeCtx);
        const nextCounts = { ...discardCounts, [side]: count };
        if (isLast) return dealDamage(nextCounts, innerResumeCtx);
        return askSide(other(side), nextCounts, innerResumeCtx, true);
      };
      const localCap = Math.min(cap, hand.length);
      const chosen = resumeCtx.api.choose(
        { type: 'handCards', controller: side, options: [...hand], min: 0, max: localCap,
          prompt: effect.prompt || `Défaussez jusqu'à ${localCap} carte(s) pour réduire les blessures de Mind Bomb.`,
          defaultValue: [] },
        applyForSide
      );
      if (chosen != null) return applyForSide(chosen, resumeCtx);
      return null;
    };

    return askSide('player', {}, ctx, false);
  });

  register(registry, 'coinFlip', (ctx, effect) => {
    const heads = rngClock.random() < 0.5;
    const branch = heads ? effect.heads : effect.tails;
    if (branch) ctx.api.resolveInlineEffect?.(branch, { controllerKey:ctx.controllerKey, sourceCard:ctx.sourceCard, targetInfo:ctx.targetInfo, xValue:ctx.xValue });
    gameEvents.emit({type:'coinFlipped', side:ctx.controllerKey, heads});
    return heads;
  });

  // V12.3 — createToken removed; unified in c8-token-historical.js registerC86C87Effects.
  // If any card references type:'createToken' from C8.1, it will resolve via C8.6/C8.7.
}
