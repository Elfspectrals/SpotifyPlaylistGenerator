// Radio engine — holds the rich generation settings and builds the UI controls
// (sliders, vibe presets, genre fusion, roulette, free prompt, time machine,
// multi-country selector). Reads window.SPG_UI (ui.js) and window.CONFIG.

(function () {
  const el = (window.SPG_UI && window.SPG_UI.el) || function (tag, o = {}) {
    const n = document.createElement(tag);
    if (o.className) n.className = o.className;
    if (o.text != null) n.textContent = o.text;
    if (o.html != null) n.innerHTML = o.html;
    if (o.attrs) Object.entries(o.attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (o.style) n.style.cssText = o.style;
    if (o.on) Object.entries(o.on).forEach(([e, f]) => n.addEventListener(e, f));
    if (o.children) o.children.filter(Boolean).forEach((c) => n.appendChild(c));
    return n;
  };

  // ---- Shared state -------------------------------------------------------
  const state = {
    energy: 50,
    popularity: 50,
    surprise: 50,
    mood: null,
    duration: null,
    eraEnabled: false,
    era: { from: 1990, to: 2025 },
    fusion: { a: '', b: '', ratio: 50 },
    vibePrompt: '',
    journey: false,
    countries: [], // array of country names (values)
  };

  function reset() {
    state.energy = 50; state.popularity = 50; state.surprise = 50;
    state.mood = null; state.duration = null;
    state.eraEnabled = false; state.era = { from: 1990, to: 2025 };
    state.fusion = { a: '', b: '', ratio: 50 };
    state.vibePrompt = ''; state.journey = false;
    state.countries = [];
  }

  // Build the payload sent to the backend (omit empty optionals).
  function getOptions() {
    const opts = {
      energy: state.energy,
      popularity: state.popularity,
      surprise: state.surprise,
    };
    if (state.mood) opts.mood = state.mood;
    if (state.duration) opts.duration = state.duration;
    if (state.eraEnabled) opts.era = { from: state.era.from, to: state.era.to };
    if (state.fusion.a && state.fusion.b) {
      opts.fusion = { a: state.fusion.a, b: state.fusion.b, ratio: state.fusion.ratio };
    }
    if (state.vibePrompt && state.vibePrompt.trim()) opts.vibePrompt = state.vibePrompt.trim();
    if (state.journey) opts.journey = true;
    if (state.countries.length) opts.countries = state.countries.slice();
    return opts;
  }

  // ---- Small UI builders --------------------------------------------------
  function slider({ label, hint, value, onInput }) {
    const valueBadge = el('span', { className: 'spg-field__value', text: String(value) });
    const input = el('input', {
      className: 'spg-slider',
      attrs: { type: 'range', min: '0', max: '100', step: '1', value: String(value) },
      on: {
        input: (e) => {
          const v = parseInt(e.target.value, 10);
          valueBadge.textContent = String(v);
          onInput(v);
        },
      },
    });
    return el('div', {
      className: 'spg-field',
      children: [
        el('div', {
          className: 'spg-field__head',
          children: [
            el('label', { className: 'spg-field__label', text: label }),
            valueBadge,
          ],
        }),
        input,
        hint ? el('div', { className: 'spg-field__hint', text: hint }) : null,
      ],
    });
  }

  function pillSelect({ label, options, getValue, onPick }) {
    const row = el('div', { className: 'spg-pillrow' });
    function render() {
      row.innerHTML = '';
      options.forEach((opt) => {
        const active = getValue() === opt.value;
        row.appendChild(el('button', {
          className: 'spg-pill' + (active ? ' spg-pill--active' : ''),
          text: (opt.icon ? opt.icon + ' ' : '') + opt.label,
          attrs: { type: 'button' },
          on: { click: () => { onPick(active ? null : opt.value); render(); } },
        }));
      });
    }
    render();
    return el('div', {
      className: 'spg-field',
      children: [el('label', { className: 'spg-field__label', text: label }), row],
    });
  }

  // ---- Vibe presets + roulette + fusion (Step 1 helpers) ------------------
  // ctx: { onSetGenres(arr), allSubgenres: [] }
  function buildQuickPanel(ctx) {
    const wrap = el('div', { className: 'spg-radio' });

    // Presets
    const presets = (window.CONFIG && CONFIG.VIBE_PRESETS) || [];
    const presetGrid = el('div', { className: 'spg-preset-grid' });
    presets.forEach((p) => {
      presetGrid.appendChild(el('button', {
        className: 'spg-preset',
        attrs: { type: 'button', title: p.genres.join(', ') },
        html: `<span class="spg-preset__icon">${p.icon || '🎵'}</span><span class="spg-preset__label">${p.label}</span>`,
        on: {
          click: () => {
            if (typeof ctx.onSetGenres === 'function') ctx.onSetGenres(p.genres.slice());
            if (p.energy != null) { state.energy = p.energy; }
            if (p.popularity != null) { state.popularity = p.popularity; }
            if (p.surprise != null) { state.surprise = p.surprise; }
            if (p.mood) { state.mood = p.mood; }
            // re-render the radio panel sliders to reflect preset values
            if (typeof ctx.onSettingsChanged === 'function') ctx.onSettingsChanged();
          },
        },
      }));
    });

    // Roulette
    const rouletteBtn = el('button', {
      className: 'spg-btn spg-btn--accent',
      html: '<span>🎰</span><span>Genre Roulette</span>',
      attrs: { type: 'button' },
      on: {
        click: () => {
          const pool = ctx.allSubgenres && ctx.allSubgenres.length ? ctx.allSubgenres : [];
          if (!pool.length) return;
          const spins = 12;
          let i = 0;
          rouletteBtn.disabled = true;
          const timer = setInterval(() => {
            const picks = [];
            const n = 2 + Math.floor(Math.random() * 2);
            while (picks.length < n) {
              const g = pool[Math.floor(Math.random() * pool.length)];
              if (!picks.includes(g)) picks.push(g);
            }
            if (typeof ctx.onSetGenres === 'function') ctx.onSetGenres(picks);
            i++;
            if (i >= spins) { clearInterval(timer); rouletteBtn.disabled = false; }
          }, 70);
        },
      },
    });

    // Genre fusion
    const genreList = el('datalist', { attrs: { id: 'spg-genre-list' } });
    (ctx.allSubgenres || []).forEach((g) => genreList.appendChild(el('option', { attrs: { value: g } })));
    const inputA = el('input', {
      className: 'spg-input', attrs: { type: 'text', placeholder: 'Genre A', list: 'spg-genre-list', value: state.fusion.a },
      on: { input: (e) => { state.fusion.a = e.target.value; } },
    });
    const inputB = el('input', {
      className: 'spg-input', attrs: { type: 'text', placeholder: 'Genre B', list: 'spg-genre-list', value: state.fusion.b },
      on: { input: (e) => { state.fusion.b = e.target.value; } },
    });
    const ratioBadge = el('span', { className: 'spg-field__value', text: state.fusion.ratio + '%' });
    const ratio = el('input', {
      className: 'spg-slider',
      attrs: { type: 'range', min: '0', max: '100', step: '5', value: String(state.fusion.ratio) },
      on: { input: (e) => { state.fusion.ratio = parseInt(e.target.value, 10); ratioBadge.textContent = state.fusion.ratio + '%'; } },
    });
    const fusion = el('div', {
      className: 'spg-fusion',
      children: [
        el('div', { className: 'spg-fusion__row', children: [inputA, el('span', { className: 'spg-fusion__x', text: '×' }), inputB] }),
        el('div', { className: 'spg-field__head', children: [el('label', { className: 'spg-field__label', text: 'Fusion ratio (A / B)' }), ratioBadge] }),
        ratio,
        genreList,
      ],
    });

    wrap.appendChild(el('div', { className: 'spg-radio__title', text: '🎚️ Vibe Presets' }));
    wrap.appendChild(presetGrid);
    wrap.appendChild(el('div', { className: 'spg-radio__row', children: [rouletteBtn] }));
    wrap.appendChild(el('div', { className: 'spg-radio__title', text: '🧬 Genre Fusion' }));
    wrap.appendChild(fusion);
    return wrap;
  }

  // ---- Radio sliders panel (Step 2) --------------------------------------
  function buildSettingsPanel(ctx) {
    const wrap = el('div', { className: 'spg-radio' });

    function renderSliders() {
      slidersBox.innerHTML = '';
      slidersBox.appendChild(slider({ label: '⚡ Energy', hint: 'Calm → explosive', value: state.energy, onInput: (v) => { state.energy = v; } }));
      slidersBox.appendChild(slider({ label: '🌍 Popularity', hint: 'Underground → mainstream', value: state.popularity, onInput: (v) => { state.popularity = v; } }));
      slidersBox.appendChild(slider({ label: '🎲 Surprise', hint: 'Familiar → surprise me', value: state.surprise, onInput: (v) => { state.surprise = v; } }));
    }
    const slidersBox = el('div', {});
    renderSliders();
    // allow presets to refresh slider positions
    if (ctx) ctx.refreshSliders = renderSliders;

    // Mood + duration
    const moods = (window.CONFIG && CONFIG.MOODS) || [];
    const durations = (window.CONFIG && CONFIG.DURATIONS) || [];
    const moodSelect = pillSelect({
      label: '😌 Mood',
      options: moods.map((m) => ({ label: m.label, value: m.value, icon: m.icon })),
      getValue: () => state.mood,
      onPick: (v) => { state.mood = v; },
    });
    const durationSelect = pillSelect({
      label: '⏱️ Track length',
      options: durations.map((d) => ({ label: d.label, value: d.value, icon: d.icon })),
      getValue: () => state.duration,
      onPick: (v) => { state.duration = v; },
    });

    // Time machine
    const fromBadge = el('span', { className: 'spg-field__value', text: String(state.era.from) });
    const toBadge = el('span', { className: 'spg-field__value', text: String(state.era.to) });
    const fromInput = el('input', {
      className: 'spg-slider', attrs: { type: 'range', min: '1950', max: '2025', step: '1', value: String(state.era.from) },
      on: { input: (e) => { state.era.from = Math.min(parseInt(e.target.value, 10), state.era.to); fromBadge.textContent = String(state.era.from); e.target.value = state.era.from; } },
    });
    const toInput = el('input', {
      className: 'spg-slider', attrs: { type: 'range', min: '1950', max: '2025', step: '1', value: String(state.era.to) },
      on: { input: (e) => { state.era.to = Math.max(parseInt(e.target.value, 10), state.era.from); toBadge.textContent = String(state.era.to); e.target.value = state.era.to; } },
    });
    const eraControls = el('div', {
      className: 'spg-era' + (state.eraEnabled ? '' : ' spg-era--disabled'),
      children: [
        el('div', { className: 'spg-field__head', children: [el('label', { className: 'spg-field__label', text: 'From' }), fromBadge] }), fromInput,
        el('div', { className: 'spg-field__head', children: [el('label', { className: 'spg-field__label', text: 'To' }), toBadge] }), toInput,
      ],
    });
    const eraToggle = el('label', {
      className: 'spg-toggle',
      children: [
        el('input', { attrs: { type: 'checkbox' }, on: { change: (e) => { state.eraEnabled = e.target.checked; eraControls.classList.toggle('spg-era--disabled', !state.eraEnabled); } } }),
        el('span', { text: '🕰️ Time Machine (limit era)' }),
      ],
    });

    // Mood journey
    const journeyToggle = el('label', {
      className: 'spg-toggle',
      children: [
        el('input', { attrs: { type: 'checkbox' }, on: { change: (e) => { state.journey = e.target.checked; } } }),
        el('span', { text: '🌗 Mood Journey (emotional arc)' }),
      ],
    });

    // Free prompt
    const promptArea = el('textarea', {
      className: 'spg-textarea',
      attrs: { placeholder: 'Describe your vibe… e.g. "rainy night coding session, introspective but driving"', rows: '2' },
      on: { input: (e) => { state.vibePrompt = e.target.value; } },
    });
    promptArea.value = state.vibePrompt;

    wrap.appendChild(el('div', { className: 'spg-radio__title', text: '🎛️ Radio Controls' }));
    wrap.appendChild(slidersBox);
    wrap.appendChild(moodSelect);
    wrap.appendChild(durationSelect);
    wrap.appendChild(el('div', { className: 'spg-radio__title', text: '🕰️ Era & Journey' }));
    wrap.appendChild(eraToggle);
    wrap.appendChild(eraControls);
    wrap.appendChild(journeyToggle);
    wrap.appendChild(el('div', { className: 'spg-radio__title', text: '🤖 Describe your vibe' }));
    wrap.appendChild(promptArea);
    return wrap;
  }

  // ---- Country multi-select with search ----------------------------------
  function buildCountrySelector() {
    const countries = (window.CONFIG && CONFIG.COUNTRIES) || [];
    const wrap = el('div', { className: 'spg-country' });

    const chips = el('div', { className: 'spg-country__chips' });
    const search = el('input', {
      className: 'spg-input', attrs: { type: 'text', placeholder: '🔎 Search a country…' },
      on: { input: () => renderList(search.value) },
    });
    const list = el('div', { className: 'spg-country__list' });

    function renderChips() {
      chips.innerHTML = '';
      if (!state.countries.length) {
        chips.appendChild(el('span', { className: 'spg-country__empty', text: '🌍 Any country (global mix)' }));
        return;
      }
      state.countries.forEach((val) => {
        const c = countries.find((x) => x.value === val);
        chips.appendChild(el('span', {
          className: 'spg-chip',
          children: [
            el('span', { text: (c ? c.flag + ' ' : '') + (c ? c.label : val) }),
            el('button', { className: 'spg-chip__remove', text: '×', attrs: { type: 'button' }, on: { click: () => { toggle(val); } } }),
          ],
        }));
      });
    }

    function toggle(val) {
      const i = state.countries.indexOf(val);
      if (i >= 0) state.countries.splice(i, 1);
      else state.countries.push(val);
      renderChips();
      renderList(search.value);
    }

    function renderList(query) {
      list.innerHTML = '';
      const q = (query || '').trim().toLowerCase();
      const groups = {};
      countries.forEach((c) => {
        if (q && !c.label.toLowerCase().includes(q)) return;
        (groups[c.region] = groups[c.region] || []).push(c);
      });
      Object.keys(groups).forEach((region) => {
        list.appendChild(el('div', { className: 'spg-country__group', text: region }));
        const grid = el('div', { className: 'spg-country__grid' });
        groups[region].forEach((c) => {
          const active = state.countries.includes(c.value);
          grid.appendChild(el('button', {
            className: 'spg-country__item' + (active ? ' spg-country__item--active' : ''),
            html: `<span>${c.flag}</span><span>${c.label}</span>`,
            attrs: { type: 'button' },
            on: { click: () => toggle(c.value) },
          }));
        });
        list.appendChild(grid);
      });
      if (!list.children.length) {
        list.appendChild(el('div', { className: 'spg-country__empty', text: 'No match' }));
      }
    }

    renderChips();
    renderList('');
    wrap.appendChild(el('label', { className: 'spg-field__label', text: '🌍 Countries (multi-select)' }));
    wrap.appendChild(chips);
    wrap.appendChild(search);
    wrap.appendChild(list);
    return wrap;
  }

  window.SPG_RADIO = {
    state,
    reset,
    getOptions,
    buildQuickPanel,
    buildSettingsPanel,
    buildCountrySelector,
  };
})();
