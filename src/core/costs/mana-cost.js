/** V9.4 — Mana parsing/payment with X support and deterministic generic payment. */
const COLORS = ['W','U','B','R','G','C'];
export function parseManaCost(value = '') {
  if (typeof value !== 'string') return [];
  const clean = value.replace(/[{}]/g, '').toUpperCase();
  return clean.match(/X|[WUBRGC]|\d+/g) || [];
}
export function manaCostToPool(value = '', xValue = 0) {
  const pool = {W:0,U:0,B:0,R:0,G:0,C:0,generic:0};
  for (const token of parseManaCost(value)) {
    if (token === 'X') pool.generic += Math.max(0, Number(xValue) || 0);
    else if (/^\d+$/.test(token)) pool.generic += Number(token);
    else if (COLORS.includes(token)) pool[token]++;
  }
  return pool;
}
export function canPayMana(player, cost, xValue = 0) {
  const need = manaCostToPool(cost, xValue), mana = player?.mana || {};
  for (const c of COLORS) if ((mana[c]||0) < need[c]) return false;
  const remaining = COLORS.reduce((n,c)=>n+Math.max(0,(mana[c]||0)-need[c]),0);
  return remaining >= need.generic;
}
export function payMana(player, cost, xValue = 0) {
  if (!canPayMana(player,cost,xValue)) return false;
  const need = manaCostToPool(cost,xValue);
  for (const c of COLORS) player.mana[c]=(player.mana[c]||0)-need[c];
  let generic=need.generic;
  for (const c of COLORS) { const n=Math.min(generic,player.mana[c]||0); player.mana[c]-=n; generic-=n; if(!generic) break; }
  return generic===0;
}
export const manaColors = Object.freeze([...COLORS]);
