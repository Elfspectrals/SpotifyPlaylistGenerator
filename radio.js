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
    eraDecade: null,
    era: { from: 1990, to: 2025 },
    fusion: { a: '', b: '', ratio: 50 },
    vibePrompt: '',
    journey: false,
    countries: [],  // artist origin (nationality / scene)
    languages: [], // lyrics / singing language (can differ from origin)
  };

  function reset() {
    state.energy = 50; state.popularity = 50; state.surprise = 50;
    state.mood = null; state.duration = null;
    state.eraEnabled = false; state.eraDecade = null; state.era = { from: 1990, to: 2025 };
    state.fusion = { a: '', b: '', ratio: 50 };
    state.vibePrompt = ''; state.journey = false;
    state.countries = [];
    state.languages = [];
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
    if (state.languages.length) opts.languages = state.languages.slice();
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

  // ---- Expandable Radio card (Random / Discovery) -------------------------
  // config: { icon, title, description, accent, popLabel, popInverse,
  //           defaults:{count,energy,pop,surprise}, actionLabel, onSpin(knobs) }
  function buildRadioCard(config) {
    const {
      icon = '🎲', title = 'Radio', description = '',
      accent = 'primary', popLabel = 'Popularity', popInverse = false,
      defaults = {}, actionLabel = 'Spin', onSpin,
    } = config || {};

    const local = {
      count: defaults.count || 3,
      energy: defaults.energy != null ? defaults.energy : 50,
      pop: defaults.pop != null ? defaults.pop : 50,
      surprise: defaults.surprise != null ? defaults.surprise : 50,
      mood: defaults.mood || null,
    };

    const body = el('div', { className: 'spg-radiocard__body spg-radiocard__body--collapsed' });

    // Genre count pills
    const countRow = el('div', { className: 'spg-pillrow' });
    [2, 3, 4, 5].forEach((n) => {
      const b = el('button', {
        className: 'spg-pill' + (local.count === n ? ' spg-pill--active' : ''),
        text: String(n),
        attrs: { type: 'button' },
        on: {
          click: () => {
            local.count = n;
            countRow.querySelectorAll('.spg-pill').forEach((x) => x.classList.remove('spg-pill--active'));
            b.classList.add('spg-pill--active');
          },
        },
      });
      countRow.appendChild(b);
    });

    const action = el('button', {
      className: 'spg-btn spg-btn--' + accent + ' spg-btn--block',
      html: `<span>${icon}</span><span>${actionLabel}</span>`,
      attrs: { type: 'button' },
      on: {
        click: () => {
          const popularity = popInverse ? (100 - local.pop) : local.pop;
          if (typeof onSpin === 'function') {
            onSpin({ count: local.count, energy: local.energy, popularity, surprise: local.surprise, mood: local.mood });
          }
        },
      },
    });

    body.appendChild(el('label', { className: 'spg-field__label', text: 'Genres to pick' }));
    body.appendChild(countRow);
    body.appendChild(el('div', { className: 'spg-field__hint', text: 'Fine-tune vibe on the next step' }));
    body.appendChild(action);

    const header = el('button', {
      className: 'spg-radiocard__header',
      attrs: { type: 'button' },
      html: `<span class="spg-radiocard__icon">${icon}</span>`
        + `<span class="spg-radiocard__text"><span class="spg-radiocard__title">${title}</span>`
        + `<span class="spg-radiocard__desc">${description}</span></span>`
        + `<span class="spg-radiocard__chev">▾</span>`,
      on: {
        click: () => {
          const collapsed = body.classList.toggle('spg-radiocard__body--collapsed');
          header.classList.toggle('spg-radiocard__header--open', !collapsed);
        },
      },
    });

    return el('div', { className: 'spg-radiocard', children: [header, body] });
  }

  // ---- Vibe presets + roulette (Step 1 helpers) ---------------------------
  // ctx: { onSetGenres(arr), getSelectedGenres(), allSubgenres: [], onSettingsChanged() }
  function buildQuickPanel(ctx) {
    const wrap = el('div', { className: 'spg-radio' });

    // Built-in + user-saved presets
    const presets = (window.CONFIG && CONFIG.VIBE_PRESETS) || [];
    const CUSTOM_KEY = (window.CONFIG && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.CUSTOM_PRESETS) || 'spgCustomVibePresets';
    const presetGrid = el('div', { className: 'spg-preset-grid' });

    function loadCustom() {
      try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; } catch (e) { return []; }
    }
    function saveCustom(list) {
      try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); } catch (e) { /* ignore quota */ }
    }

    function applyPreset(p) {
      if (typeof ctx.onSetGenres === 'function' && Array.isArray(p.genres)) ctx.onSetGenres(p.genres.slice());
      if (p.energy != null) state.energy = p.energy;
      if (p.popularity != null) state.popularity = p.popularity;
      if (p.surprise != null) state.surprise = p.surprise;
      if (p.mood !== undefined) state.mood = p.mood || null;
      if (typeof ctx.onSettingsChanged === 'function') ctx.onSettingsChanged();
    }

    function presetButton(p, isCustom) {
      const btn = el('button', {
        className: 'spg-preset' + (isCustom ? ' spg-preset--custom' : ''),
        attrs: { type: 'button', title: (p.genres || []).join(', ') },
        html: `<span class="spg-preset__icon">${p.icon || '🎵'}</span><span class="spg-preset__label">${p.label}</span>`,
        on: { click: () => applyPreset(p) },
      });
      if (isCustom) {
        btn.appendChild(el('span', {
          className: 'spg-preset__del',
          text: '×',
          attrs: { title: 'Delete preset' },
          on: {
            click: (e) => {
              e.stopPropagation();
              saveCustom(loadCustom().filter((x) => x.label !== p.label));
              renderPresets();
            },
          },
        }));
      }
      return btn;
    }

    function renderPresets() {
      presetGrid.innerHTML = '';
      presets.forEach((p) => presetGrid.appendChild(presetButton(p, false)));
      loadCustom().forEach((p) => presetGrid.appendChild(presetButton(p, true)));
    }
    renderPresets();

    // Save the current genre selection + knobs as a reusable custom preset
    const nameInput = el('input', {
      className: 'spg-input',
      attrs: { type: 'text', placeholder: 'Save current pick as a preset…', maxlength: '24' },
    });
    const saveBtn = el('button', {
      className: 'spg-btn spg-btn--secondary',
      html: '<span>💾</span><span>Save</span>',
      attrs: { type: 'button' },
      on: {
        click: () => {
          const name = (nameInput.value || '').trim();
          const genres = typeof ctx.getSelectedGenres === 'function' ? ctx.getSelectedGenres() : [];
          if (!name) {
            if (window.spgNotify) window.spgNotify({ type: 'error', title: 'Name your preset first' });
            return;
          }
          if (!genres.length) {
            if (window.spgNotify) window.spgNotify({ type: 'error', title: 'Pick some genres first' });
            return;
          }
          const list = loadCustom();
          const preset = {
            label: name, icon: '⭐', genres: genres.slice(),
            energy: state.energy, popularity: state.popularity, surprise: state.surprise, mood: state.mood || null,
          };
          const idx = list.findIndex((x) => x.label === name);
          if (idx >= 0) list[idx] = preset; else list.push(preset);
          saveCustom(list);
          nameInput.value = '';
          renderPresets();
          if (window.spgNotify) window.spgNotify({ type: 'success', title: 'Preset saved', body: name });
        },
      },
    });
    const saveRow = el('div', { className: 'spg-preset-save', children: [nameInput, saveBtn] });

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

    wrap.appendChild(el('div', { className: 'spg-radio__title', text: '🎚️ Vibe Presets' }));
    wrap.appendChild(presetGrid);
    wrap.appendChild(saveRow);
    wrap.appendChild(el('div', { className: 'spg-radio__row', children: [rouletteBtn] }));
    return wrap;
  }

  function settingsCard(title, children) {
    return el('section', {
      className: 'spg-settings__card',
      children: [
        el('h3', { className: 'spg-settings__head', text: title }),
        el('div', { className: 'spg-settings__body', children: children.filter(Boolean) }),
      ],
    });
  }

  function decadeToRange(decadeValue) {
    const y = parseInt(String(decadeValue), 10);
    if (Number.isNaN(y)) return { from: 1990, to: 2025 };
    return { from: y, to: Math.min(y + 9, 2025) };
  }

  // ---- Step 2 — single settings surface (no duplicates from Step 1) ------
  function buildSettingsPanel(ctx) {
    const wrap = el('div', { className: 'spg-settings' });
    const moods = (window.CONFIG && CONFIG.MOODS) || [];
    const durations = (window.CONFIG && CONFIG.DURATIONS) || [];
    const decades = (window.CONFIG && CONFIG.DECADES) || [];

    const slidersBox = el('div', { className: 'spg-settings__sliders' });
    const moodBox = el('div', {});
    const durationBox = el('div', {});
    const eraBox = el('div', { className: 'spg-era-pills' });
    const customEraBox = el('div', { className: 'spg-year-range spg-year-range--hidden' });

    function renderSliders() {
      slidersBox.innerHTML = '';
      slidersBox.appendChild(slider({ label: '⚡ Energy', hint: 'Calm → explosive', value: state.energy, onInput: (v) => { state.energy = v; } }));
      slidersBox.appendChild(slider({ label: '🌍 Popularity', hint: 'Underground → mainstream', value: state.popularity, onInput: (v) => { state.popularity = v; } }));
      slidersBox.appendChild(slider({ label: '🎲 Surprise', hint: 'Familiar → surprise me', value: state.surprise, onInput: (v) => { state.surprise = v; } }));
    }

    function renderMood() {
      moodBox.innerHTML = '';
      moodBox.appendChild(pillSelect({
        label: '😌 Mood',
        options: moods.map((m) => ({ label: m.label, value: m.value, icon: m.icon })),
        getValue: () => state.mood,
        onPick: (v) => { state.mood = v; },
      }));
    }

    function renderDuration() {
      durationBox.innerHTML = '';
      durationBox.appendChild(pillSelect({
        label: '⏱️ Playlist length',
        options: durations.map((d) => ({ label: d.label, value: d.value, icon: d.icon })),
        getValue: () => state.duration,
        onPick: (v) => {
          state.duration = v;
          if (ctx && typeof ctx.onDurationPick === 'function') ctx.onDurationPick(v);
        },
      }));
    }

    function syncCustomEraVisibility() {
      const show = state.eraEnabled && !state.eraDecade;
      customEraBox.classList.toggle('spg-year-range--hidden', !show);
    }

    function renderEra() {
      eraBox.innerHTML = '';
      const row = el('div', { className: 'spg-pillrow' });

      function pickEra(mode, decadeValue) {
        if (mode === 'any') {
          state.eraEnabled = false;
          state.eraDecade = null;
        } else if (mode === 'decade') {
          state.eraEnabled = true;
          state.eraDecade = decadeValue;
          Object.assign(state.era, decadeToRange(decadeValue));
        } else {
          state.eraEnabled = true;
          state.eraDecade = null;
        }
        renderEra();
        syncCustomEraVisibility();
      }

      const anyActive = !state.eraEnabled;
      row.appendChild(el('button', {
        className: 'spg-pill' + (anyActive ? ' spg-pill--active' : ''),
        text: '🌍 Any era',
        attrs: { type: 'button' },
        on: { click: () => pickEra('any') },
      }));

      decades.forEach((d) => {
        const short = d.value.replace('s', 's').slice(-3);
        const active = state.eraEnabled && state.eraDecade === d.value;
        row.appendChild(el('button', {
          className: 'spg-pill' + (active ? ' spg-pill--active' : ''),
          text: (d.icon ? d.icon + ' ' : '') + short,
          attrs: { type: 'button', title: d.label },
          on: { click: () => pickEra('decade', d.value) },
        }));
      });

      const customActive = state.eraEnabled && !state.eraDecade;
      row.appendChild(el('button', {
        className: 'spg-pill' + (customActive ? ' spg-pill--active' : ''),
        text: '✏️ Custom',
        attrs: { type: 'button' },
        on: { click: () => pickEra('custom') },
      }));

      eraBox.appendChild(row);
    }

    function renderCustomEra() {
      customEraBox.innerHTML = '';
      const fromInput = el('input', {
        className: 'spg-input spg-input--year',
        attrs: { type: 'number', min: '1950', max: '2025', value: String(state.era.from) },
        on: {
          change: (e) => {
            const v = Math.max(1950, Math.min(2025, parseInt(e.target.value, 10) || 1950));
            state.era.from = Math.min(v, state.era.to);
            e.target.value = String(state.era.from);
          },
        },
      });
      const toInput = el('input', {
        className: 'spg-input spg-input--year',
        attrs: { type: 'number', min: '1950', max: '2025', value: String(state.era.to) },
        on: {
          change: (e) => {
            const v = Math.max(1950, Math.min(2025, parseInt(e.target.value, 10) || 2025));
            state.era.to = Math.max(v, state.era.from);
            e.target.value = String(state.era.to);
          },
        },
      });
      customEraBox.appendChild(el('span', { className: 'spg-year-range__label', text: 'From' }));
      customEraBox.appendChild(fromInput);
      customEraBox.appendChild(el('span', { className: 'spg-year-range__sep', text: '→' }));
      customEraBox.appendChild(el('span', { className: 'spg-year-range__label', text: 'To' }));
      customEraBox.appendChild(toInput);
    }

    function refreshAll() {
      renderSliders();
      renderMood();
      renderDuration();
      renderEra();
      renderCustomEra();
      syncCustomEraVisibility();
      if (promptArea) promptArea.value = state.vibePrompt;
      if (journeyInput) journeyInput.checked = state.journey;
    }

    renderSliders();
    renderMood();
    renderDuration();
    renderEra();
    renderCustomEra();
    syncCustomEraVisibility();

    if (ctx) {
      ctx.refreshSliders = renderSliders;
      ctx.refreshSettings = refreshAll;
    }

    const journeyInput = el('input', {
      attrs: { type: 'checkbox' },
      on: { change: (e) => { state.journey = e.target.checked; } },
    });
    journeyInput.checked = state.journey;

    const promptArea = el('textarea', {
      className: 'spg-textarea',
      attrs: { placeholder: 'Optional: describe the vibe… e.g. "rainy night drive, synth-heavy, nostalgic"', rows: '2' },
      on: { input: (e) => { state.vibePrompt = e.target.value; } },
    });
    promptArea.value = state.vibePrompt;

    wrap.appendChild(settingsCard('⚡ Vibe', [slidersBox, moodBox]));
    wrap.appendChild(settingsCard('⏱️ Playlist', [durationBox]));
    wrap.appendChild(settingsCard('🕰️ Era', [
      eraBox,
      customEraBox,
      el('div', { className: 'spg-field__hint', text: 'Pick a decade or set a custom year range' }),
    ]));
    wrap.appendChild(settingsCard('🌗 Extras', [
      el('label', {
        className: 'spg-toggle',
        children: [journeyInput, el('span', { text: 'Mood journey — emotional arc across the playlist' })],
      }),
      el('label', { className: 'spg-field__label', text: '✨ Vibe prompt' }),
      promptArea,
    ]));
    return wrap;
  }

  // ---- Generic multi-select picker (countries, languages, …) ---------------
  function buildMultiPicker({ items, selected, label, hint, emptyText, searchPlaceholder }) {
    const wrap = el('div', { className: 'spg-country' });
    const chips = el('div', { className: 'spg-country__chips' });
    const search = el('input', {
      className: 'spg-input',
      attrs: { type: 'text', placeholder: searchPlaceholder || '🔎 Search…' },
      on: { input: () => renderList(search.value) },
    });
    const list = el('div', { className: 'spg-country__list' });

    function renderChips() {
      chips.innerHTML = '';
      if (!selected.length) {
        chips.appendChild(el('span', { className: 'spg-country__empty', text: emptyText }));
        return;
      }
      selected.forEach((val) => {
        const item = items.find((x) => x.value === val);
        chips.appendChild(el('span', {
          className: 'spg-chip',
          children: [
            el('span', { text: (item ? item.flag + ' ' : '') + (item ? item.label : val) }),
            el('button', { className: 'spg-chip__remove', text: '×', attrs: { type: 'button' }, on: { click: () => toggle(val) } }),
          ],
        }));
      });
    }

    function toggle(val) {
      const i = selected.indexOf(val);
      if (i >= 0) selected.splice(i, 1);
      else selected.push(val);
      renderChips();
      renderList(search.value);
    }

    function renderList(query) {
      list.innerHTML = '';
      const q = (query || '').trim().toLowerCase();
      const groups = {};
      items.forEach((item) => {
        if (q && !item.label.toLowerCase().includes(q) && !item.value.toLowerCase().includes(q)) return;
        (groups[item.region] = groups[item.region] || []).push(item);
      });
      Object.keys(groups).forEach((region) => {
        list.appendChild(el('div', { className: 'spg-country__group', text: region }));
        const grid = el('div', { className: 'spg-country__grid' });
        groups[region].forEach((item) => {
          const active = selected.includes(item.value);
          grid.appendChild(el('button', {
            className: 'spg-country__item' + (active ? ' spg-country__item--active' : ''),
            html: `<span>${item.flag}</span><span>${item.label}</span>`,
            attrs: { type: 'button' },
            on: { click: () => toggle(item.value) },
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
    wrap.appendChild(el('label', { className: 'spg-field__label', text: label }));
    if (hint) wrap.appendChild(el('div', { className: 'spg-field__hint', text: hint }));
    wrap.appendChild(chips);
    wrap.appendChild(search);
    wrap.appendChild(list);
    return wrap;
  }

  function buildCountrySelector() {
    return buildMultiPicker({
      items: (window.CONFIG && CONFIG.COUNTRIES) || [],
      selected: state.countries,
      label: '🌍 Artist origin',
      hint: 'Where artists come from (nationality / scene) — optional',
      emptyText: '🌍 Any origin (global mix)',
      searchPlaceholder: '🔎 Search a country…',
    });
  }

  function buildLanguageSelector() {
    return buildMultiPicker({
      items: (window.CONFIG && CONFIG.LANGUAGES) || [],
      selected: state.languages,
      label: '🗣️ Singing language',
      hint: 'Language of the lyrics — can differ from origin (e.g. French artist → English lyrics)',
      emptyText: '🗣️ Any language',
      searchPlaceholder: '🔎 Search a language…',
    });
  }

  function buildLocalePanel() {
    return el('section', {
      className: 'spg-settings__card spg-locale',
      children: [
        el('h3', { className: 'spg-settings__head', text: '🌍 Origin & Language' }),
        el('div', { className: 'spg-settings__body', children: [buildCountrySelector(), buildLanguageSelector()] }),
      ],
    });
  }

  window.SPG_RADIO = {
    state,
    reset,
    getOptions,
    buildRadioCard,
    buildQuickPanel,
    buildSettingsPanel,
    buildCountrySelector,
    buildLanguageSelector,
    buildLocalePanel,
  };
})();
