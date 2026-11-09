/**
 * V12.76 (lot G7) — effets de la famille « destruction / exil » : Tormod's Crypt.
 */
export function registerC93Effects(registry) {
  const reg = (type, fn) => (registry.has(type) ? registry.register(type, fn, { replace: true }) : registry.register(type, fn));

  // Tormod's Crypt : « retirez de la partie le cimetière du joueur ciblé ».
  reg('exileGraveyard', (ctx) => {
    const t = ctx.targetInfo;
    const side = t?.kind === 'player' ? t.side : null;
    if (!side || !ctx.api.state?.[side]) return;
    const cards = [...(ctx.api.state[side].graveyard || [])];
    for (const card of cards) {
      if (ctx.api.zones) ctx.api.zones.move(card, 'exile', { toSide: card.owner || side, reason: 'effectExile' });
    }
    ctx.api.log?.(`${ctx.sourceCard?.name} : ${cards.length} carte(s) du cimetière ${side === 'player' ? 'de vous' : "de l'adversaire"} retirée(s) de la partie.`, ctx.controllerKey);
  });
}
