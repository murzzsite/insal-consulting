const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/N8DJHF787M';

(() => {
  window.__ok = true;
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const el = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)).replace(/ /g, ' ');
  const POLICY_VERSION = '2026-10-30';

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== intro =====
  const start = () => root.classList.add('go');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(start));
  } else start();

  // ===== header / menu =====
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  const mq = window.matchMedia('(max-width: 1100px)');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    header.classList.toggle('hide', y > lastY + 6 && y > 600 && !nav.classList.contains('is-open'));
    if (y < lastY - 4) header.classList.remove('hide');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const syncNav = () => { nav.inert = mq.matches && !nav.classList.contains('is-open'); };
  const setMenu = (on, back) => {
    burger.classList.toggle('is-open', on);
    nav.classList.toggle('is-open', on);
    burger.setAttribute('aria-expanded', String(on));
    document.body.style.overflow = on ? 'hidden' : '';
    syncNav();
    if (on) { const a = $('a', nav); if (a) setTimeout(() => a.focus(), 50); }
    else if (back) burger.focus();
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open'), true));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true); });
  mq.addEventListener('change', () => { if (!mq.matches) setMenu(false); syncNav(); });
  syncNav();

  // ===== anchors =====
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      const topic = a.dataset.topic;
      if (topic) el('f-topic').value = topic;
      const top = target.getBoundingClientRect().top + window.scrollY - (href === '#top' ? 0 : 56);
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      history.pushState(null, '', href);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // ===== reveal =====
  const revealSel = [
    '.head', '.lead', '.note', '.state__side', '.calc__in', '.calc__out',
    '.plist__r', '.price__row', '.q', '.contact__l > *', '.form > *', '.foot__row', '.credits', '.foot__logo', '.band__cap'
  ].join(',');
  const rvEls = $$(revealSel);
  rvEls.forEach(e => e.classList.add('rv'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const t = en.target;
      const sibs = t.parentElement ? [...t.parentElement.children].filter(c => c.classList.contains('rv')) : [t];
      t.style.setProperty('--d', Math.min(sibs.indexOf(t), 6) * 0.07 + 's');
      t.classList.add('in');
      io.unobserve(t);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  rvEls.forEach(e => io.observe(e));

  const own = [$('#pblock'), $('.contact__pic')].filter(Boolean);
  const io2 = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io2.unobserve(en.target); } });
  }, { threshold: 0.5 });
  own.forEach(e => io2.observe(e));

  // ===== shutter band + statement word fill =====
  const band = $('#band');
  const bandWin = $('#bandWin');
  const bandImg = $('#bandImg');
  const stateEl = $('#statement');
  const words = [];
  if (stateEl) {
    [...stateEl.childNodes].forEach(n => {
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = part;
        frag.appendChild(s);
        words.push(s);
      });
      n.replaceWith(frag);
    });
  }
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;
    if (band && !reduce) {
      const r = band.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.95), 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      bandWin.style.setProperty('--sx', ((1 - e) * 22).toFixed(2) + '%');
      bandWin.style.setProperty('--sy', ((1 - e) * 16).toFixed(2) + '%');
      bandImg.style.setProperty('--sc', (1.14 - e * 0.14 + clamp(-r.top / vh, 0, 1) * 0.06).toFixed(4));
      bandImg.style.objectPosition = '50% ' + (62 - clamp(-r.top / vh, 0, 1) * 18).toFixed(1) + '%';
    }
    if (stateEl && words.length) {
      const r = stateEl.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.28), 0, 1);
      const upto = p * words.length * 1.08;
      words.forEach((w, i) => { w.style.opacity = reduce ? 1 : (0.2 + 0.8 * clamp(upto - i, 0, 1)).toFixed(2); });
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();

  // ===== calculator =====
  const turnR = el('c-turn');
  const turnN = el('c-turn-n');
  // returns {v} number, {empty:true}, or {bad:true}
  const read = id => {
    const raw = el(id).value.trim().replace(/\s/g, '').replace(',', '.');
    if (raw === '') return { empty: true };
    if (!/^\d+(\.\d+)?$/.test(raw)) return { bad: true };
    const v = Number(raw);
    return Number.isFinite(v) ? { v } : { bad: true };
  };
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n)) + ' ₽';
  const money = n => (n < 0 ? '−' : '') + fmt(Math.abs(n));
  let state = null;

  const calc = () => {
    const errs = [];
    const mark = (id, bad) => el(id).setAttribute('aria-invalid', bad ? 'true' : 'false');
    const sales = read('c-turn-n');
    let salesV = 0;
    if (sales.empty || sales.bad || sales.v <= 0 || sales.v > 1e9) { errs.push('Продажи: введите положительное число'); mark('c-turn-n', true); }
    else { salesV = sales.v; mark('c-turn-n', false); }
    const pct = {};
    [['c-com', 'Комиссия'], ['c-ad', 'Реклама'], ['c-log', 'Логистика и платежи']].forEach(([id, name]) => {
      ['0', '1'].forEach(k => {
        const r = read(id + k);
        const bad = r.empty || r.bad || r.v > 100;
        mark(id + k, bad);
        if (bad) errs.push(`${name}: введите процент от 0 до 100`);
        else pct[id + k] = r.v;
      });
    });
    const money1 = (id, name, optional) => {
      const r = read(id);
      if (r.empty) { mark(id, false); return optional ? null : 0; }
      if (r.bad || r.v > 1e9) { mark(id, true); errs.push(`${name}: введите сумму в рублях`); return undefined; }
      mark(id, false);
      return r.v;
    };
    const tax0 = money1('c-tax0', 'Налоги сейчас', true);
    const tax1 = money1('c-tax1', 'Налоги в новой модели', true);
    const srv = money1('c-srv', 'Обслуживание', false);
    const once = money1('c-once', 'Разовые расходы', true);

    const err = [...new Set(errs)];
    el('calcErr').textContent = err.length ? 'Проверьте поля: ' + err.join('; ') + '.' : '';
    el('calcGo').disabled = err.length > 0;
    if (err.length) {
      state = null;
      el('outNum').textContent = '—';
      el('outYear').textContent = '';
      el('outVerdict').textContent = 'Результат появится, когда все поля заполнены корректно.';
      el('outPay').textContent = '';
      return;
    }
    const dCom = salesV * (pct['c-com0'] - pct['c-com1']) / 100;
    const dAd = salesV * (pct['c-ad0'] - pct['c-ad1']) / 100;
    const dLog = salesV * (pct['c-log0'] - pct['c-log1']) / 100;
    const taxKnown = tax0 != null && tax1 != null;
    const dTax = taxKnown ? tax0 - tax1 : 0;
    const diff = dCom + dAd + dLog + dTax - srv;
    state = { salesV, pct, tax0, tax1, srv, once, diff, taxKnown };

    el('outNum').textContent = money(diff);
    el('outLabel').textContent = diff < 0 ? 'Расходы в новой модели выше за месяц' : diff > 0 ? 'Расходы в новой модели ниже за месяц' : 'Изменение расходов за месяц';
    el('outYear').textContent = 'За 12 месяцев при тех же значениях: ' + money(diff * 12) + ' ₽';
    el('d-com').textContent = sign(dCom);
    el('d-ad').textContent = sign(dAd);
    el('d-log').textContent = sign(dLog);
    el('d-tax').textContent = taxKnown ? sign(dTax) : 'не учтены';
    el('d-srv').textContent = srv ? '−' + fmt(srv) + ' ₽' : '0 ₽';
    let v = diff > 0
      ? 'При этих допущениях расходы в новой модели ниже. Это не прибыль: выручку и себестоимость калькулятор не считает.'
      : diff === 0
        ? 'При этих допущениях разницы в расходах нет.'
        : 'При этих допущениях новая модель дороже. Выгода появляется, только если у вас реально снижаются ставки или налоги.';
    if (!taxKnown) v += ' Налоги не учтены: укажите их суммы из расчёта вашего бухгалтера.';
    el('outVerdict').textContent = v;
    if (once && diff > 0) {
      el('outPay').textContent = `Разовые расходы ${fmt(once)} ₽ вернутся примерно за ${(Math.round(once / diff * 10) / 10).toString().replace('.', ',')} мес. Сценарий: показатели постоянны, без сезонности и оборотного капитала.`;
    } else if (once) {
      el('outPay').textContent = 'Окупаемость не рассчитана: дополнительный ежемесячный результат не положителен.';
    } else {
      el('outPay').textContent = 'Разовые расходы не указаны, окупаемость не рассчитана.';
    }
  };

  const syncFromRange = () => { turnN.value = turnR.value; calc(); };
  const syncFromNum = () => {
    const r = read('c-turn-n');
    if (!r.empty && !r.bad) turnR.value = clamp(r.v, +turnR.min, +turnR.max);
    calc();
  };
  turnR.addEventListener('input', syncFromRange);
  turnN.addEventListener('input', syncFromNum);
  $$('#calcForm .pairs input').forEach(i => i.addEventListener('input', calc));
  calc();

  el('calcGo').addEventListener('click', () => {
    if (!state) return;
    const p = state.pct;
    const taxTxt = state.taxKnown ? `${fmt(state.tax0)}→${fmt(state.tax1)} ₽` : 'не указаны';
    el('f-topic').value = `Предварительный расчёт (калькулятор v2): продажи ${fmt(state.salesV)} ₽/мес; комиссия ${p['c-com0']}%→${p['c-com1']}%; реклама ${p['c-ad0']}%→${p['c-ad1']}%; логистика и платежи ${p['c-log0']}%→${p['c-log1']}%; налоги ${taxTxt}; обслуживание ${fmt(state.srv)} ₽/мес; разовые ${state.once ? fmt(state.once) + ' ₽' : 'не указаны'}; изменение расходов ${money(state.diff)} ₽/мес`;
    const top = el('contact').getBoundingClientRect().top + window.scrollY - 56;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    history.pushState(null, '', '#contact');
    showTopic();
  });

  // ===== stages =====
  const range = el('stageRange');
  const clauseTxt = el('clauseText');
  const clauseList = ['Сначала считаем вашу экономику', 'Затем проверяем модель на деле', 'Потом регистрируем компанию', 'И ведём её дальше'];
  const frags = $$('.frag');
  const stops = $$('#stops button');
  const names = ['Расчёт', 'Тест', 'Регистрация', 'Сопровождение'];
  let clauseT = 0;
  const setStage = (i, announce) => {
    i = clamp(i, 0, 3);
    range.value = i;
    range.setAttribute('aria-valuetext', names[i]);
    el('trackFill').style.width = (i / 3 * 100) + '%';
    if (clauseTxt.textContent !== clauseList[i]) {
      clearTimeout(clauseT);
      clauseTxt.classList.add('out');
      clauseT = setTimeout(() => { clauseTxt.textContent = clauseList[i]; clauseTxt.classList.remove('out'); }, reduce ? 0 : 220);
    }
    frags.forEach(f => {
      const on = +f.dataset.i === i;
      f.classList.toggle('is-on', on);
      f.inert = !on;
      f.setAttribute('aria-hidden', String(!on));
    });
    stops.forEach(s => {
      const on = +s.dataset.i === i;
      s.classList.toggle('is-on', on);
      s.setAttribute('aria-pressed', String(on));
    });
    el('stageLive').textContent = announce ? clauseList[i] : '';
  };
  range.addEventListener('input', () => setStage(+range.value, true));
  stops.forEach(s => s.addEventListener('click', () => setStage(+s.dataset.i, true)));
  setStage(0);

  // ===== form =====
  const form = el('leadForm');
  const st = el('formSt');
  const topicInput = el('f-topic');
  const showTopic = () => { /* topic is sent with the request; see summary below */
    let box = el('topicBox');
    if (!box) {
      box = document.createElement('p');
      box.id = 'topicBox';
      box.className = 'note topic';
      form.insertBefore(box, form.querySelector('.agree'));
    }
    box.textContent = topicInput.value ? 'К заявке будет приложено: ' + topicInput.value : '';
    box.hidden = !topicInput.value;
  };
  $$('a[data-topic]').forEach(a => a.addEventListener('click', showTopic));

  const validContact = v => {
    v = v.trim();
    if (/^@[A-Za-z0-9_]{4,32}$/.test(v)) return true;
    if (/^(https?:\/\/)?(t\.me|telegram\.me)\/[A-Za-z0-9_]{4,32}\/?$/i.test(v)) return true;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return true;
    const digits = v.replace(/\D/g, '');
    return /^\+?[\d\s()\-]+$/.test(v) && digits.length >= 7 && digits.length <= 15;
  };
  const fail = (id, msg) => {
    st.textContent = msg;
    st.className = 'form__st err';
    el(id).setAttribute('aria-invalid', 'true');
    el(id).focus();
  };
  const requestId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
  let pendingId = null;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    st.className = 'form__st';
    ['f-name', 'f-contact', 'f-agree'].forEach(id => el(id).setAttribute('aria-invalid', 'false'));
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn__t');
    const orig = label.textContent;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name.trim()) return fail('f-name', 'Укажите, как к вам обращаться.');
    if (!validContact(payload.contact)) return fail('f-contact', 'Укажите телефон с кодом, @ник в Telegram или e-mail.');
    if (!el('f-agree').checked) return fail('f-agree', 'Отметьте согласие на обработку данных.');

    pendingId = pendingId || requestId();
    const out = {
      name: payload.name.trim(),
      phone: payload.contact.trim(),
      contact: payload.contact.trim(),
      comment: [payload.comment.trim(), payload.topic].filter(Boolean).join('\n\n'),
      consent: true,
      policy_version: POLICY_VERSION,
      source: location.href.split('#')[0],
      request_id: pendingId,
    };
    btn.disabled = true;
    label.textContent = 'Отправляем…';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out), signal: ctrl.signal });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      label.textContent = 'Заявка отправлена';
      st.textContent = 'Спасибо! Свяжемся с вами и разберём цифры.';
      form.reset();
      topicInput.value = '';
      showTopic();
      pendingId = null;
    } catch (err) {
      console.error(err);
      label.textContent = 'Не отправилось';
      st.innerHTML = 'Не получилось отправить, ваши данные в форме сохранены, попробуйте ещё раз. Или напишите нам: <a href="https://t.me/insal_tovary_kitai" target="_blank" rel="noopener">Telegram</a>.';
      st.classList.add('err');
    } finally {
      clearTimeout(timer);
      setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 3000);
    }
  });
})();
