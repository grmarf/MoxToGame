// V10.7 / C9.1 — behavioral reference effects.
export function registerC91Effects(registry) {
  const reg=(type,fn)=>registry.has(type)?registry.register(type,fn,{replace:true}):registry.register(type,fn);
  reg('startSubgame',(ctx)=>{
    if(!ctx.api.startSubgame) throw new Error('SubgameManager unavailable');
    return ctx.api.startSubgame(ctx.controllerKey, ctx.sourceCard);
  });
  reg('setLifeMinimum',(ctx,e)=>{
    const side=ctx.targetInfo?.side || ctx.controllerKey;
    const min=Number(e.minimum ?? 1);
    if(ctx.state[side] && ctx.state[side].life<min) ctx.state[side].life=min;
  });
}
