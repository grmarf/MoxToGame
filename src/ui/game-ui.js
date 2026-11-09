// @ts-check
import { mulliganSide, putOnBottom, autoMulligan } from '../core/mulligan.js';
import { canPayMana, manaCostToPool } from '../core/costs/mana-cost.js';
import { rngClock } from '../core/rng-clock-service.js';
import { isCardPlayable } from '../core/card-playability.js';
import { buildRandomPlayableDeck, validateDeck } from '../core/deck-builder.js';
import { findTargetByKey, targetKey } from './target-selection.js';

export class GameUI {
  constructor({ cards, game, root = document.body }) {
    this.cards = cards;
    this.game = game;
    this.root = root;
    this.deck = [];
    this.started = false;
    this.showPlayableOnly = false;
    // V11.0 — état de sélection pour le combat (attaquants/bloqueurs)
    this.selectedAttackers = new Set();
    this.selectedAttackerForBlock = null;
    this.blockerAssignments = {}; // { attackerUid: [blockerUid, ...] }
    // V11.1 — état du mulligan (côté joueur humain uniquement, l'IA se gère seule)
    this.playerMulliganCount = 0;
    this.mulliganStage = 'deciding'; // 'deciding' | 'selectingBottom'
    this.mulliganBottomSelection = new Set();
    // V12.30 — ciblage humain : on conserve uniquement une clé stable,
    // jamais une référence figée vers un objet runtime.
    this.pendingTargetSelection = null;
    this.pendingAbilitySelection = null;
    // V12.31 — choix génériques : l'UI ne conserve que l'identité des options
    // et laisse ChoiceService valider la valeur finale.
    this.pendingChoiceSelection = null;
    this.#bind();
    this.render(this.game.state);
  }

  #bind() {
    const search = document.getElementById('card-search');
    search?.addEventListener('input', () => this.renderCardCatalog(search.value));
    document.getElementById('playable-only')?.addEventListener('change', (e) => {
      this.showPlayableOnly = !!e.target.checked;
      this.renderCardCatalog(search?.value || '');
    });
    document.getElementById('add-random')?.addEventListener('click', () => this.addRandomDeck());
    document.getElementById('clear-deck')?.addEventListener('click', () => { this.deck = []; this.renderDeck(); });
    document.getElementById('start-game')?.addEventListener('click', () => this.startGame());
    document.getElementById('next-phase')?.addEventListener('click', () => this.dispatch('nextPhase'));
    document.getElementById('resolve-stack')?.addEventListener('click', () => this.dispatch('passPriority'));
    document.getElementById('pass-priority')?.addEventListener('click', () => this.dispatch('passPriority'));
    this.game.choices?.setEvents?.(this.game.choices.events);
    // ChoiceService est la seule autorité : l'UI observe ses événements.
    this.game.choices?.events?.on?.('choiceRequested', ({ choice }) => {
      if (choice?.controller === 'player') {
        this.pendingChoiceSelection = { id: choice.id, selected: choice.max === 1 ? null : [] };
        this.#renderChoiceModal();
      }
    });
    this.game.choices?.events?.on?.('choiceResolved', () => {
      this.pendingChoiceSelection = null;
      this.#renderChoiceModal();
      this.render(this.game.state);
    });
    this.game.choices?.events?.on?.('choiceCleared', () => {
      this.pendingChoiceSelection = null;
      this.#renderChoiceModal();
    });

    document.getElementById('concede')?.addEventListener('click', () => {
      if (this.#isGameOver()) return;
      this.game.state.player.life = 0;
      this.game.state.player.hasLost = true;
      this.render(this.game.state);
    });
  }

  /** V11.1 — vrai dès qu'un des deux joueurs a perdu. */
  #isGameOver() {
    const s = this.game.state;
    return !!(s && (s.player?.hasLost || s.ai?.hasLost));
  }

  dispatch(action, data = {}) {
    if (this.#isGameOver()) { this.log('La partie est terminée.', 'system'); return; }
    try { this.game.dispatch(action, data); }
    catch (e) { this.log(e.message, 'system'); }
    this.render(this.game.state);
  }

  addRandomDeck() {
    try {
      this.deck = buildRandomPlayableDeck(this.cards, {
        size: 60,
        basicCount: 24,
        rng: () => rngClock.random(),
      });
      this.log('Deck aléatoire généré uniquement avec des cartes jouables.', 'system');
      this.renderDeck();
    } catch (e) {
      this.log(e.message, 'system');
    }
  }

  // ─────────────────────────────────────────────
  // V11.1 — Mulligan (règle de Londres simplifiée)
  // ─────────────────────────────────────────────

  startGame() {
    const validation = validateDeck(this.deck, { minSize: 40, maxSize: 60 });
    if (!validation.valid) {
      validation.errors.forEach(message => this.log(`❌ ${message}`, 'system'));
      return;
    }
    this.game.engine.loadDeck('player', this.deck);
    this.game.engine.loadDeck('ai', this.deck);
    this.playerMulliganCount = 0;
    this.mulliganStage = 'deciding';
    this.mulliganBottomSelection = new Set();
    // V12.30 — ciblage humain : on conserve uniquement une clé stable,
    // jamais une référence figée vers un objet runtime.
    this.pendingTargetSelection = null;
    this.pendingAbilitySelection = null;
    // V12.31 — choix génériques : l'UI ne conserve que l'identité des options
    // et laisse ChoiceService valider la valeur finale.
    this.pendingChoiceSelection = null;
    this.#aiResolveMulligan();
    document.getElementById('pre-game')?.classList.add('hidden');
    document.getElementById('mulligan-screen')?.classList.remove('hidden');
    this.#renderMulliganScreen();
  }

  /** L'IA décide seule si elle garde sa main (2 à 5 terrains sur 7, sinon mulligan, 2 max). */
  #aiResolveMulligan() {
    // v12.74 : logique partagée avec le banc d'auto-jeu (core/mulligan.js#autoMulligan).
    const mulligans = autoMulligan(this.game, 'ai', { cmcOf: (c) => this.#cmc(c) });
    if (mulligans > 0) this.log(`🤖 L'IA a fait ${mulligans} mulligan(s).`, 'ai');
  }

  mulliganPlayer() {
    mulliganSide(this.game, 'player');   // v12.73 : chemin unique (ZoneManager + PRNG du moteur)
    this.playerMulliganCount += 1;
    this.mulliganBottomSelection = new Set();
    // V12.30 — ciblage humain : on conserve uniquement une clé stable,
    // jamais une référence figée vers un objet runtime.
    this.pendingTargetSelection = null;
    this.pendingAbilitySelection = null;
    // V12.31 — choix génériques : l'UI ne conserve que l'identité des options
    // et laisse ChoiceService valider la valeur finale.
    this.pendingChoiceSelection = null;
    this.#renderMulliganScreen();
  }

  keepPlayerHand() {
    if (!this.playerMulliganCount) { this.#finalizeStart(); return; }
    this.mulliganStage = 'selectingBottom';
    this.#renderMulliganScreen();
  }

  confirmMulliganBottom() {
    const n = this.playerMulliganCount;
    if (this.mulliganBottomSelection.size !== n) return;
    const toBottom = this.game.state.player.hand.filter(c => this.mulliganBottomSelection.has(c.uid));
    putOnBottom(this.game, 'player', toBottom);   // v12.73 : chemin unique (règle de Londres)
    this.mulliganBottomSelection = new Set();
    // V12.30 — ciblage humain : on conserve uniquement une clé stable,
    // jamais une référence figée vers un objet runtime.
    this.pendingTargetSelection = null;
    this.pendingAbilitySelection = null;
    // V12.31 — choix génériques : l'UI ne conserve que l'identité des options
    // et laisse ChoiceService valider la valeur finale.
    this.pendingChoiceSelection = null;
    this.mulliganStage = 'deciding';
    this.#finalizeStart();
  }

  #finalizeStart() {
    this.started = true;
    document.getElementById('mulligan-screen')?.classList.add('hidden');
    document.getElementById('game-board')?.classList.remove('hidden');
    this.render(this.game.state);
    const suffix = this.playerMulliganCount ? ` (après ${this.playerMulliganCount} mulligan(s))` : '';
    this.log(`Partie lancée. Vous gardez une main de ${this.game.state.player.hand.length} carte(s)${suffix}.`, 'system');
  }

  #renderMulliganScreen() {
    const el = document.getElementById('mulligan-screen');
    if (!el) return;
    const hand = this.game.state.player.hand;

    if (this.mulliganStage === 'selectingBottom') {
      const n = this.playerMulliganCount;
      const ready = this.mulliganBottomSelection.size === n;
      el.innerHTML = `
        <div class="section-title">Renvoyez ${n} carte(s) au fond de votre bibliothèque</div>
        <div class="hint">Cliquez sur ${n} carte(s) de votre main pour les renvoyer, puis validez.</div>
        <div id="mulligan-hand" class="card-list"></div>
        <div class="hint">Sélectionnées : <strong>${this.mulliganBottomSelection.size}</strong>/${n}</div>
        <button class="btn btn-success" id="mulligan-confirm-bottom" ${ready ? '' : 'disabled'} style="width:100%; margin-top:8px;">✅ Valider</button>
      `;
      const handEl = document.getElementById('mulligan-hand');
      handEl.innerHTML = hand.map(c => {
        const sel = this.mulliganBottomSelection.has(c.uid);
        return `<button class="card-item${sel ? ' selected' : ''}" data-uid="${c.uid}">${this.#esc(c.name)} <small>${this.#esc(c.cost || '')}</small>${sel ? ' ↩️' : ''}</button>`;
      }).join('');
      handEl.querySelectorAll('.card-item').forEach(b => b.onclick = () => {
        const uid = b.dataset.uid;
        if (this.mulliganBottomSelection.has(uid)) this.mulliganBottomSelection.delete(uid);
        else if (this.mulliganBottomSelection.size < n) this.mulliganBottomSelection.add(uid);
        this.#renderMulliganScreen();
      });
      document.getElementById('mulligan-confirm-bottom')?.addEventListener('click', () => this.confirmMulliganBottom());
      return;
    }

    el.innerHTML = `
      <div class="section-title">Votre main de départ${this.playerMulliganCount ? ` — mulligan n°${this.playerMulliganCount}` : ''}</div>
      <div id="mulligan-hand" class="card-list"></div>
      <div class="hint">${this.playerMulliganCount
        ? `Vous devrez renvoyer ${this.playerMulliganCount} carte(s) au fond de la bibliothèque si vous gardez cette main (règle de Londres).`
        : 'Gardez cette main, ou faites un mulligan pour repiocher 7 nouvelles cartes.'}</div>
      <div style="display:flex; gap:6px; margin-top:10px;">
        <button class="btn btn-primary" id="mulligan-keep" style="flex:1;">✅ Garder ma main</button>
        <button class="btn btn-info" id="mulligan-again" style="flex:1;">🔄 Mulligan</button>
      </div>
    `;
    const handEl = document.getElementById('mulligan-hand');
    handEl.innerHTML = hand.map(c => `<div class="card-item">${this.#esc(c.name)} <small>${this.#esc(c.cost || '')}</small></div>`).join('');
    document.getElementById('mulligan-keep').onclick = () => this.keepPlayerHand();
    document.getElementById('mulligan-again').onclick = () => this.mulliganPlayer();
  }


  #cmc(card) {
    const pool = manaCostToPool(card?.cost || '');
    return Object.values(pool).reduce((a, b) => a + (Number(b) || 0), 0);
  }

  render(state) {
    if (!state) return;
    this.renderCardCatalog(document.getElementById('card-search')?.value || '');
    this.renderDeck();
    this.#text('player-life', state.player.life); this.#text('ai-life', state.ai.life);
    this.#text('player-hand-count', state.player.hand.length); this.#text('ai-hand-count', state.ai.hand.length);
    this.#text('player-lib-count', state.player.library.length); this.#text('ai-lib-count', state.ai.library.length);
    this.#text('player-mana-display', this.mana(state.player.mana)); this.#text('ai-mana-display', this.mana(state.ai.mana));
    this.#text('phase-indicator', `${this.game.turnManager.phase} — tour ${this.game.turnManager.turnNumber} — actif : ${this.game.turnManager.activePlayer}`);
    const combatMode = this.#combatMode();
    this.#renderZone('player-hand', state.player.hand, false);
    this.#renderZone('ai-hand', state.ai.hand, true);
    this.#renderBattlefield('player-battlefield', state.player.battlefield, 'player', combatMode);
    this.#renderBattlefield('ai-battlefield', state.ai.battlefield, 'ai', combatMode);
    this.#renderStack();
    this.#renderCombatPanel(combatMode);
    this.#renderGameOver(state);
    this.#renderChoiceModal();
  }

  renderCardCatalog(query = '') {
    const q = query.toLowerCase();
    const matches = this.cards.filter(c => `${c.name} ${c.type} ${c.text_fr || ''}`.toLowerCase().includes(q));
    const list = (this.showPlayableOnly ? matches.filter(isCardPlayable) : matches).slice(0, 80);
    const el = document.getElementById('card-list'); if (!el) return;
    el.innerHTML = list.map(c => {
      const playable = isCardPlayable(c);
      const status = playable ? 'Jouable' : 'Non jouable actuellement';
      const disabled = !playable || this.deck.length >= 60 ? 'disabled' : '';
      return `<button class="card-item${playable ? '' : ' unavailable'}" data-name="${this.#esc(c.name)}" ${disabled} title="${status}">${this.#esc(c.name)} <small>${this.#esc(c.cost || '')} · ${status}</small></button>`;
    }).join('');
    el.querySelectorAll('.card-item').forEach(b => b.onclick = () => {
      if (b.disabled) return;
      const c=this.cards.find(x=>x.name===b.dataset.name);
      if (!c || !isCardPlayable(c)) {
        this.log('Cette carte n’est pas certifiée jouable.', 'system');
        return;
      }
      if (this.deck.length >= 60) {
        this.log('Le deck est limité à 60 cartes dans le constructeur actuel.', 'system');
        return;
      }
      this.deck.push({...c});
      this.renderDeck();
      this.renderCardCatalog(query);
    });
  }

  renderDeck() {
    this.#text('deck-count', `Cartes : ${this.deck.length}/60`);
    const el=document.getElementById('current-deck-list'); if(!el)return;
    const counts={}; this.deck.forEach(c=>counts[c.name]=(counts[c.name]||0)+1);
    el.innerHTML=Object.entries(counts).map(([n,nr])=>`<div>${this.#esc(n)} ×${nr}</div>`).join('');
  }

  #renderZone(id, cards, hidden) {
    const el=document.getElementById(id); if(!el)return;
    el.innerHTML=cards.map((c,i)=>`<button class="card-slot" data-i="${i}">${hidden?'Carte face cachée':this.#esc(c.name)}${hidden?'':`<small>${this.#esc(c.cost||'')}</small>`}</button>`).join('');
    if(!hidden) el.querySelectorAll('.card-slot').forEach(b=>b.onclick=()=>this.cardAction(cards[Number(b.dataset.i)]));
  }

  // ─────────────────────────────────────────────
  // V11.0 — Combat : détection du mode d'interaction courant
  // ─────────────────────────────────────────────

  /** @returns {{mode:'attack'|'block'|null, validAttackerUids:Set<string>, validBlockerUids:Set<string>, attackers:Object[]}} */
  #combatMode() {
    const tm = this.game.turnManager;
    const combat = this.game.combat;
    if (!tm || !combat || this.#isGameOver()) return { mode: null, validAttackerUids: new Set(), validBlockerUids: new Set(), attackers: [] };

    if (tm.phase === 'declareAttackers' && tm.activePlayer === 'player' && !tm.combatDeclared) {
      const valid = combat.getValidAttackers('player');
      return { mode: 'attack', validAttackerUids: new Set(valid.map(p=>p.uid)), validBlockerUids: new Set(), attackers: [] };
    }
    if (tm.phase === 'declareBlockers' && tm.activePlayer === 'ai' && !tm.blockersDeclared) {
      const attackers = combat.combat?.attackers || [];
      // Un bloqueur n'est réellement légal que contre un attaquant précis
      // (vol, protection couleur, terrain de passage, etc.). Tant qu'aucun
      // attaquant n'est sélectionné on ne fait qu'indiquer les créatures
      // capables de bloquer AU MOINS un des attaquants, pour ne pas figer
      // l'affichage ; la légalité fine est revérifiée par attaquant précis
      // au clic (voir #renderBattlefield) et à nouveau par le moteur.
      const selectedAttacker = this.selectedAttackerForBlock ? attackers.find(a=>a.uid===this.selectedAttackerForBlock) : null;
      const validBlockerUids = new Set();
      if (selectedAttacker) {
        combat.getValidBlockers('player', selectedAttacker).forEach(p=>validBlockerUids.add(p.uid));
      } else {
        for (const a of attackers) combat.getValidBlockers('player', a).forEach(p=>validBlockerUids.add(p.uid));
      }
      return { mode: 'block', validAttackerUids: new Set(), validBlockerUids, attackers };
    }
    // Hors de ces deux fenêtres : on nettoie les sélections en cours.
    if (this.selectedAttackers.size || this.selectedAttackerForBlock || Object.keys(this.blockerAssignments).length) {
      this.selectedAttackers = new Set();
      this.selectedAttackerForBlock = null;
      this.blockerAssignments = {};
    }
    return { mode: null, validAttackerUids: new Set(), validBlockerUids: new Set(), attackers: [] };
  }

  #renderBattlefield(id, perms, side, combatMode) {
    const el=document.getElementById(id); if(!el)return;
    const assignedBlockerUids = new Set(Object.values(this.blockerAssignments).flat());
    el.innerHTML=perms.map(p=>{
      const classes=['permanent-slot','permanent-card'];
      if (p.tapped) classes.push('tapped');
      if (combatMode.mode==='attack' && side==='player' && this.selectedAttackers.has(p.uid)) classes.push('selected','attacking');
      if (combatMode.mode==='block' && side==='ai' && combatMode.attackers.some(a=>a.uid===p.uid)) {
        classes.push('attacking');
        if (this.selectedAttackerForBlock===p.uid) classes.push('selected');
      }
      if (combatMode.mode==='block' && side==='player' && assignedBlockerUids.has(p.uid)) classes.push('blocking','selected');
      const abilities = side === 'player' && combatMode.mode === null && this.started ? this.game.getAbilityOptions?.(p, 'player') || [] : [];
      const abilityHint = abilities.length ? `<small>⚙️ ${abilities.length} capacité(s)</small>` : '';
      return `<button class="${classes.join(' ')}" data-uid="${p.uid}">${this.#esc(p.name)}<small>${p.power!==undefined?`${p.power}/${p.toughness}`:''}</small>${abilityHint}</button>`;
    }).join('');
    el.querySelectorAll('.permanent-slot').forEach(b=>b.onclick=()=>{
      if (this.#isGameOver()) return;
      const p=perms.find(x=>x.uid===b.dataset.uid);
      if (!p) return;

      if (combatMode.mode==='attack' && side==='player') {
        if (!combatMode.validAttackerUids.has(p.uid)) return; // créature engagée / malade d'invocation / etc.
        if (this.selectedAttackers.has(p.uid)) this.selectedAttackers.delete(p.uid);
        else this.selectedAttackers.add(p.uid);
        this.render(this.game.state);
        return;
      }

      if (combatMode.mode==='block') {
        if (side==='ai') {
          // Sélectionner l'attaquant que l'on veut bloquer.
          if (!combatMode.attackers.some(a=>a.uid===p.uid)) return;
          this.selectedAttackerForBlock = (this.selectedAttackerForBlock===p.uid) ? null : p.uid;
          this.render(this.game.state);
          return;
        }
        if (side==='player') {
          if (!combatMode.validBlockerUids.has(p.uid)) return;
          if (!this.selectedAttackerForBlock) { this.log('Choisissez d’abord la créature adverse à bloquer.', 'system'); return; }
          const atkUid = this.selectedAttackerForBlock;
          const list = this.blockerAssignments[atkUid] || (this.blockerAssignments[atkUid] = []);
          const alreadyAssignedElsewhere = Object.entries(this.blockerAssignments).some(([uid,arr]) => uid!==atkUid && arr.includes(p.uid));
          if (alreadyAssignedElsewhere) { this.log('Cette créature bloque déjà un autre attaquant.', 'system'); return; }
          const idx = list.indexOf(p.uid);
          if (idx>-1) list.splice(idx,1); else list.push(p.uid);
          if (list.length===0) delete this.blockerAssignments[atkUid];
          this.render(this.game.state);
          return;
        }
      }

      // Hors combat, un clic sur un permanent joueur ouvre ses capacités activées.
      if (side==='player' && this.started) {
        const abilities = this.game.getAbilityOptions?.(p, 'player') || [];
        if (abilities.length) { this.#renderAbilitySelection(p); return; }
        if (String(p.type || '').includes('Land')) this.dispatch('action',{action:'tapMana',data:{permanent:p,controller:'player'}});
      }
    });
  }

  #renderCombatPanel(combatMode) {
    const el = document.getElementById('combat-panel');
    if (!el) return;
    if (combatMode.mode==='attack') {
      el.classList.remove('hidden');
      const n = this.selectedAttackers.size;
      el.innerHTML = `
        <div class="notice">⚔️ Déclarez vos attaquants : cliquez sur vos créatures aptes à attaquer, puis validez.</div>
        <div>Attaquants sélectionnés : <strong>${n}</strong></div>
        <button class="btn btn-success btn-small" id="confirm-attackers">✅ Confirmer les attaquants</button>
      `;
      document.getElementById('confirm-attackers').onclick = () => {
        const state = this.game.state;
        const attackers = state.player.battlefield.filter(p => this.selectedAttackers.has(p.uid));
        this.dispatch('declareAttackers', { attackers });
        this.selectedAttackers = new Set();
      };
      return;
    }
    if (combatMode.mode==='block') {
      el.classList.remove('hidden');
      const attackersHtml = combatMode.attackers.map(a => {
        const blockers = this.blockerAssignments[a.uid] || [];
        const label = blockers.length ? `bloqué par ${blockers.length}` : 'non bloqué';
        const cls = this.selectedAttackerForBlock===a.uid ? 'notice' : '';
        return `<div class="${cls}">${this.#esc(a.name)} (${a.power}/${a.toughness}) — ${label}</div>`;
      }).join('') || '<div>Aucun attaquant.</div>';
      el.innerHTML = `
        <div class="notice">🛡️ L'IA attaque ! Cliquez sur une créature adverse ci-dessus pour la cibler, puis sur vos créatures pour les assigner au blocage.</div>
        ${attackersHtml}
        <button class="btn btn-success btn-small" id="confirm-blockers">✅ Confirmer les bloqueurs</button>
      `;
      document.getElementById('confirm-blockers').onclick = () => {
        this.dispatch('declareBlockers', { blockers: { ...this.blockerAssignments } });
        this.selectedAttackerForBlock = null;
        this.blockerAssignments = {};
      };
      return;
    }
    el.classList.add('hidden');
    el.innerHTML = '';
  }

  // ─────────────────────────────────────────────
  // V11.1 — Fin de partie
  // ─────────────────────────────────────────────

  #choiceOptionKey(option) {
    if (option && typeof option === 'object') return String(option.uid || option.objectId || option.id || option.name || '');
    return String(option);
  }

  #choiceOptionLabel(option) {
    if (option && typeof option === 'object') return option.name || option.text_fr || option.label || option.id || option.uid || 'Option';
    const labels = { W:'Blanc', U:'Bleu', B:'Noir', R:'Rouge', G:'Vert', C:'Incolore', pay:'Payer', decline:'Ne pas payer' };
    return labels[option] || String(option);
  }

  #renderChoiceModal() {
    const choice = this.game.choices?.getPending?.();
    let modal = document.getElementById('choice-modal');
    if (!choice || choice.controller !== 'player') {
      if (modal) modal.classList.remove('show');
      return;
    }
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'choice-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    const state = this.pendingChoiceSelection || { id:choice.id, selected:choice.max === 1 ? null : [] };
    if (state.id !== choice.id) { this.pendingChoiceSelection = { id:choice.id, selected:choice.max === 1 ? null : [] }; return this.#renderChoiceModal(); }
    const selected = state.selected;
    const isMulti = choice.max !== 1;
    const selectedKeys = isMulti ? selected.map(v => this.#choiceOptionKey(v)) : [];
    const options = choice.options.map(option => {
      const key = this.#choiceOptionKey(option);
      const on = isMulti ? selectedKeys.includes(key) : selected && this.#choiceOptionKey(selected) === key;
      return `<button class="card-item choice-option${on ? ' selected' : ''}" data-choice-key="${this.#esc(key)}">${this.#esc(this.#choiceOptionLabel(option))}${on ? ' ✓' : ''}</button>`;
    }).join('');
    const count = isMulti ? selected.length : (selected ? 1 : 0);
    const ready = count >= choice.min && count <= choice.max;
    modal.classList.add('show');
    modal.innerHTML = `<div class="modal-content"><h3>Choix</h3><div class="hint">${this.#esc(choice.prompt)}</div><div class="hint">${isMulti ? `Sélection : ${count}/${choice.min === choice.max ? choice.max : `${choice.min}–${choice.max}`}` : 'Choisissez une option.'}</div><div id="choice-options" class="card-list">${options}</div><div style="display:flex;gap:6px;margin-top:12px;"><button id="choice-cancel" class="btn btn-danger" style="flex:1;">Annuler</button><button id="choice-confirm" class="btn btn-success" style="flex:1;" ${ready ? '' : 'disabled'}>✅ Confirmer</button></div></div>`;
    modal.querySelectorAll('[data-choice-key]').forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.choiceKey;
      const fresh = this.game.choices.getPending();
      const option = fresh?.options?.find(o => this.#choiceOptionKey(o) === key);
      if (option == null) return;
      if (isMulti) {
        const i = selectedKeys.indexOf(key);
        if (i >= 0) selected.splice(i,1); else if (selected.length < choice.max) selected.push(option);
      } else state.selected = option;
      this.pendingChoiceSelection = state;
      this.#renderChoiceModal();
    }));
    modal.querySelector('#choice-cancel')?.addEventListener('click', () => this.game.choices.clear('player-cancel'));
    modal.querySelector('#choice-confirm')?.addEventListener('click', () => {
      const fresh = this.game.choices.getPending();
      if (!fresh) return;
      const value = isMulti ? [...state.selected] : state.selected;
      try { this.game.choices.resolve(value); }
      catch (e) { this.log(e.message, 'system'); }
    });
  }

  #renderGameOver(state) {
    const el = document.getElementById('game-over-modal');
    if (!el) return;
    const playerLost = !!state.player.hasLost;
    const aiLost = !!state.ai.hasLost;
    if (!playerLost && !aiLost) { el.classList.remove('show'); el.innerHTML = ''; return; }
    const youWon = aiLost && !playerLost;
    el.classList.add('show');
    el.innerHTML = `
      <div class="modal-content" style="text-align:center;">
        <h3>${youWon ? '🏆 Victoire !' : '💀 Défaite...'}</h3>
        <div class="hint">${youWon ? 'L’IA a été vaincue.' : 'Vous avez perdu la partie.'}</div>
        <button class="btn btn-primary" id="game-over-restart" style="margin-top:12px;">🔄 Nouvelle partie</button>
      </div>
    `;
    document.getElementById('game-over-restart').onclick = () => location.reload();
  }

  #renderAbilitySelection(permanent) {
    const abilities = this.game.getAbilityOptions?.(permanent, 'player') || [];
    if (!abilities.length) return;
    let modal = document.getElementById('ability-selection-modal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'ability-selection-modal'; modal.className = 'modal'; document.body.appendChild(modal); }
    modal.classList.add('show');
    modal.innerHTML = `<div class="modal-content"><h3>⚙️ Capacité de ${this.#esc(permanent.name)}</h3><div id="ability-options" class="card-list">${abilities.map((a,i)=>`<button class="card-item" data-ability-index="${i}">⚙️ ${this.#esc(a.description || this.#abilityLabel(a))}<small>${this.#esc(a.cost || (a.manaAbility ? 'Mana' : ''))}${a.tap ? ' · Taper' : ''}</small></button>`).join('')}</div><button id="ability-cancel" class="btn btn-danger" style="width:100%;margin-top:12px;">Annuler</button></div>`;
    modal.querySelectorAll('[data-ability-index]').forEach(b => b.addEventListener('click', () => {
      const index = Number(b.dataset.abilityIndex);
      const fresh = this.game.state.player.battlefield.find(x => x.uid === permanent.uid);
      const freshAbilities = fresh ? (this.game.getAbilityOptions?.(fresh, 'player') || []) : [];
      const ability = freshAbilities[index];
      if (!fresh || !ability) { this.log('Cette capacité n’est plus légale.', 'system'); this.#closeAbilitySelection(); return; }
      this.pendingAbilitySelection = { permanentUid: fresh.uid, abilityIndex: index };
      this.#closeAbilitySelection();
      const effectType = ability.effect?.type || ability.effects?.[0]?.type;
      if (effectType && this.game.targeting?.needsTarget(effectType)) {
        const targets = this.game.targeting.validTargets(effectType, 'player');
        if (!targets.length) { this.log(`Aucune cible légale pour la capacité de ${fresh.name}.`, 'system'); this.pendingAbilitySelection = null; return; }
        this.pendingTargetSelection = { abilityPermanentUid: fresh.uid, abilityIndex: index, effectType, targets: targets.map(t=>targetKey(t)).filter(Boolean), selectedKey: null };
        this.#renderTargetSelection(); return;
      }
      this.#activateSelectedAbility(null);
    }));
    modal.querySelector('#ability-cancel')?.addEventListener('click', () => this.#closeAbilitySelection());
  }

  #abilityLabel(a) { if (a.manaAbility) return 'Produire du mana'; if (a.effect?.type) return String(a.effect.type); if (a.effects?.length) return a.effects.map(e=>e.type).join(' puis '); return 'Activer la capacité'; }
  #closeAbilitySelection() { const modal=document.getElementById('ability-selection-modal'); if(modal){modal.classList.remove('show');modal.innerHTML='';} this.pendingAbilitySelection=null; }
  #activateSelectedAbility(target) {
    const pending=this.pendingAbilitySelection; if(!pending) return;
    const permanent=this.game.state.player.battlefield.find(p=>p.uid===pending.permanentUid);
    if(!permanent){this.log('Le permanent n’existe plus.','system');this.pendingAbilitySelection=null;return;}
    this.pendingAbilitySelection=null;
    this.dispatch('activateAbility',{permanent,abilityIndex:pending.abilityIndex,target:target||null});
  }

  cardAction(card) {
    if (this.#isGameOver()) return;
    if (String(card.type||'').includes('Land')) {
      this.dispatch('action',{action:'playLand',data:{card,controller:'player'}});
      return;
    }

    const effectType = card.effect?.type;
    const targeting = this.game.targeting;
    if (targeting?.needsTarget(effectType)) {
      const targets = targeting.validTargets(effectType, 'player');
      if (!targets.length) {
        this.log(`Aucune cible légale pour ${card.name}.`, 'system');
        return;
      }
      this.pendingTargetSelection = { card, effectType, targets: targets.map(target => targetKey(target)).filter(Boolean), selectedKey: null };
      this.#renderTargetSelection();
      return;
    }

    this.dispatch('castSpell',{card,target:null});
  }

  #targetLabel(target) {
    if (target?.kind === 'player') return target.side === 'player' ? '👤 Vous' : '🤖 IA';
    if (target?.kind === 'permanent') return `🃏 ${target.name || target.perm?.name || 'Permanent'}`;
    if (target?.kind === 'stackItem') return `📚 ${target.name || target.source?.name || 'Sort sur la pile'}`;
    if (target?.type === 'self') return '👤 Vous';
    if (target?.type === 'opponent') return '🤖 IA';
    return target?.name || target?.type || 'Cible';
  }

  #renderTargetSelection() {
    const pending = this.pendingTargetSelection;
    let modal = document.getElementById('target-selection-modal');
    if (!pending) {
      modal?.classList.remove('show');
      if (modal) modal.innerHTML = '';
      return;
    }
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'target-selection-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }

    // Rebuild from the engine's current state so the UI never trusts a stale
    // target object captured before another action changed the game.
    const currentTargets = this.game.targeting.validTargets(pending.effectType, 'player');
    const allowed = currentTargets.filter(t => pending.targets.includes(targetKey(t)));
    if (!allowed.length) {
      this.pendingTargetSelection = null;
    this.pendingAbilitySelection = null;
    // V12.31 — choix génériques : l'UI ne conserve que l'identité des options
    // et laisse ChoiceService valider la valeur finale.
    this.pendingChoiceSelection = null;
      modal.classList.remove('show');
      modal.innerHTML = '';
      this.log('Les cibles précédemment disponibles ne sont plus légales.', 'system');
      return;
    }

    const options = allowed.map(t => {
      const key = targetKey(t);
      const selected = key === pending.selectedKey;
      return `<button class="card-item${selected ? ' selected' : ''}" data-target-key="${this.#esc(key)}">${this.#esc(this.#targetLabel(t))}${selected ? ' ✓' : ''}</button>`;
    }).join('');

    modal.classList.add('show');
    modal.innerHTML = `
      <div class="modal-content">
        <h3>🎯 Choisir une cible</h3>
        <div class="hint" style="margin-bottom:10px;">${this.#esc(pending.card.name)}</div>
        <div id="target-options" class="card-list">${options}</div>
        <div style="display:flex;gap:6px;margin-top:12px;">
          <button id="target-cancel" class="btn btn-danger" style="flex:1;">Annuler</button>
          <button id="target-confirm" class="btn btn-success" style="flex:1;" ${pending.selectedKey ? '' : 'disabled'}>✅ Confirmer</button>
        </div>
      </div>`;

    modal.querySelectorAll('[data-target-key]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.targetKey;
        if (!key) return;
        pending.selectedKey = key;
        this.#renderTargetSelection();
      });
    });
    modal.querySelector('#target-cancel')?.addEventListener('click', () => {
      this.pendingTargetSelection = null;
    this.pendingAbilitySelection = null;
    // V12.31 — choix génériques : l'UI ne conserve que l'identité des options
    // et laisse ChoiceService valider la valeur finale.
    this.pendingChoiceSelection = null;
      this.#renderTargetSelection();
    });
    modal.querySelector('#target-confirm')?.addEventListener('click', () => this.#confirmTargetSelection());
  }

  #confirmTargetSelection() {
    const pending = this.pendingTargetSelection;
    if (!pending?.selectedKey) return;
    const currentTargets = this.game.targeting.validTargets(pending.effectType, 'player');
    const target = findTargetByKey(currentTargets, pending.selectedKey);
    if (!target || !this.game.targeting.isLegal(pending.effectType, target, 'player')) {
      this.log('Cette cible n’est plus légale.', 'system');
      pending.selectedKey = null;
      this.#renderTargetSelection();
      return;
    }
    const abilityPending = pending.abilityPermanentUid ? { ...pending } : null;
    const card = pending.card;
    this.pendingTargetSelection = null;
    this.pendingAbilitySelection = null;
    // V12.31 — choix génériques : l'UI ne conserve que l'identité des options
    // et laisse ChoiceService valider la valeur finale.
    this.pendingChoiceSelection = null;
    this.#renderTargetSelection();
    if (abilityPending) {
      this.pendingAbilitySelection = { permanentUid: abilityPending.abilityPermanentUid, abilityIndex: abilityPending.abilityIndex };
      this.#activateSelectedAbility(target);
    } else {
      this.dispatch('castSpell', { card, target });
    }
  }

  #renderStack() {
    const el=document.getElementById('stack-items'); if(!el)return;
    el.innerHTML=this.game.stack.items.slice().reverse().map(x=>`<div>${this.#esc(x.source?.name||x.type)} — ${x.controller}</div>`).join('');
    const btn=document.getElementById('resolve-stack'); if(btn) { btn.disabled=this.game.state.priorityHolder !== 'player'; btn.textContent=this.game.stack.isEmpty ? '↔️ Passer la priorité' : '↔️ Passer la priorité'; }
  }

  #text(id,v){const e=document.getElementById(id);if(e)e.textContent=String(v);}
  mana(m){return ['W','U','B','R','G','C'].filter(c=>m[c]>0).map(c=>`${c}:${m[c]}`).join(' ')||'0';}
  log(msg,type='system'){const e=document.getElementById('game-log');if(!e)return;const d=document.createElement('div');d.className=`log-${type}`;d.textContent=msg;e.appendChild(d);e.scrollTop=e.scrollHeight;}
  #esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
}
export function createGameUI(opts) { return new GameUI(opts); }
