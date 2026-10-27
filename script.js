const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/N8DJHF787M';

(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)).replace(/ /g, ' ');

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== intro =====
  const start = () => root.classList.add('go');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(start));
  } else start();

  // ===== header =====
  const header = $('#header');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    const open = $('#nav').classList.contains('is-open');
    header.classList.toggle('hide', y > lastY + 6 && y > 600 && !open);
    if (y < lastY - 4) header.classList.remove('hide');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = on => {
    burger.classList.toggle('is-open', on);
    nav.classList.toggle('is-open', on);
    burger.setAttribute('aria-expanded', String(on));
    document.body.style.overflow = on ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // ===== smooth anchors =====
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (href === '#top' ? 0 : 56);
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      const topic = a.dataset.topic;
      if (topic) $('#f-topic').value = topic;
    });
  });

  // ===== reveal (classes are added here, never hard-coded in the html) =====
  const revealSel = [
    '.head', '.lead', '.note', '.state__side', '.calc__in', '.calc__out',
    '.plist__r', '.price__row', '.q', '.contact__l > *', '.form > *', '.foot__row', '.credits', '.foot__logo', '.band__cap'
  ].join(',');
  const rvEls = $$(revealSel);
  rvEls.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('rv')) : [el];
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 0.07 + 's');
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  rvEls.forEach(el => io.observe(el));

  // generic "in" for pieces with own animation
  const own = [$('#pblock'), $('.contact__pic')].filter(Boolean);
  const io2 = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io2.unobserve(en.target); } });
  }, { threshold: 0.5 });
  own.forEach(el => io2.observe(el));

  // ===== shutter band + statement word fill (scroll-linked) =====
  const band = $('#band');
  const bandWin = $('#bandWin');
  const bandImg = $('#bandImg');
  const stateEl = $('#statement');

  // wrap words of the statement, leave pictures alone
  const words = [];
  if (stateEl) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
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
        }
      });
    };
    walk(stateEl);
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
      bandImg.style.setProperty('--sc', (1.14 - e * 0.14 - clamp(-r.top / vh, 0, 1) * -0.06).toFixed(4));
      bandImg.style.objectPosition = '50% ' + (62 - clamp(-r.top / vh, 0, 1) * 18).toFixed(1) + '%';
    }
    if (stateEl && words.length) {
      const r = stateEl.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.28), 0, 1);
      const upto = p * words.length * 1.08;
      words.forEach((w, i) => {
        w.style.opacity = reduce ? 1 : (0.2 + 0.8 * clamp(upto - i, 0, 1)).toFixed(2);
      });
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();

  // ===== calculator =====
  const el = id => document.getElementById(id);
  const turn = el('c-turn');
  const num = id => Math.max(0, parseFloat(String(el(id).value).replace(',', '.')) || 0);
  let shown = 0, target = 0, raf = 0;
  const tween = () => {
    shown += (target - shown) * 0.18;
    if (Math.abs(target - shown) < 1) shown = target;
    el('outNum').textContent = fmt(shown);
    if (shown !== target) raf = requestAnimationFrame(tween);
  };
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n)) + ' ₽';
  const calc = () => {
    const t = parseFloat(turn.value);
    el('o-turn').textContent = fmt(t) + ' ₽';
    const dCom = t * (num('c-com0') - num('c-com1')) / 100;
    const dTax = t * (num('c-tax0') - num('c-tax1')) / 100;
    const dLog = t * (num('c-log0') - num('c-log1')) / 100;
    const srv = num('c-srv');
    const diff = dCom + dTax + dLog - srv;
    target = diff;
    cancelAnimationFrame(raf);
    if (reduce) { shown = target; el('outNum').textContent = fmt(shown); } else raf = requestAnimationFrame(tween);
    const neg = diff < 0;
    el('outLabel').textContent = neg ? 'Разница в месяц: в минус' : 'Разница в месяц';
    el('outYear').textContent = 'За год: ' + (neg ? '−' : '') + fmt(Math.abs(diff) * 12) + ' ₽';
    el('d-com').textContent = sign(dCom);
    el('d-tax').textContent = sign(dTax);
    el('d-log').textContent = sign(dLog);
    el('d-srv').textContent = srv ? '−' + fmt(srv) + ' ₽' : '0 ₽';
    el('outVerdict').textContent = neg
      ? 'При таких допущениях модель не окупается. Так тоже бывает, и лучше узнать это до регистрации.'
      : diff === 0
        ? 'При таких допущениях разницы нет.'
        : 'При таких допущениях модель окупается.';
    el('calcOut').classList.toggle('is-neg', neg);
    const p = (t - turn.min) / (turn.max - turn.min) * 100;
    turn.style.setProperty('--p', p + '%');
  };
  $$('#calcForm input').forEach(i => i.addEventListener('input', calc));
  calc();
  shown = target;
  el('outNum').textContent = fmt(shown);

  el('calcGo').addEventListener('click', () => {
    const t = fmt(turn.value);
    const diff = fmt(Math.abs(target)) + ' ₽ в месяц' + (target < 0 ? ' в минус' : '');
    el('f-topic').value = `Калькулятор: оборот ${t} ₽/мес; комиссии ${num('c-com0')}%→${num('c-com1')}%; налоги ${num('c-tax0')}%→${num('c-tax1')}%; логистика ${num('c-log0')}%→${num('c-log1')}%; обслуживание ${fmt(num('c-srv'))} ₽; разница ${diff}`;
    const top = el('contact').getBoundingClientRect().top + window.scrollY - 56;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  });

  // ===== stages slider =====
  const range = el('stageRange');
  const clauseTxt = el('clauseText');
  const clauseList = ['Сначала считаем вашу экономику', 'Затем проверяем модель на деле', 'Потом регистрируем компанию', 'И ведём её дальше'];
  let clauseT = 0;
  const frags = $$('.frag');
  const stops = $$('#stops button');
  const names = ['Расчёт', 'Тест', 'Регистрация', 'Сопровождение'];
  let touched = false;
  const setStage = (i, byUser) => {
    if (byUser) touched = true;
    i = clamp(i, 0, 3);
    range.value = i;
    range.setAttribute('aria-valuetext', names[i]);
    el('trackFill').style.width = (i / 3 * 100) + '%';
    if (clauseTxt.textContent !== clauseList[i]) {
      clearTimeout(clauseT);
      clauseTxt.classList.add('out');
      clauseT = setTimeout(() => { clauseTxt.textContent = clauseList[i]; clauseTxt.classList.remove('out'); }, reduce ? 0 : 220);
    }
    frags.forEach(f => f.classList.toggle('is-on', +f.dataset.i === i));
    stops.forEach(s => s.classList.toggle('is-on', +s.dataset.i === i));
    el('stageLive').textContent = byUser ? clauseList[i] : '';
  };
  range.addEventListener('input', () => setStage(+range.value, true));
  stops.forEach(s => s.addEventListener('click', () => setStage(+s.dataset.i, true)));
  setStage(0);
  // thumb sits inside the track: compensate fill so it meets the thumb centre
  const stagesEl = $('#stages');
  let auto = null, seen = false;
  const sio = new IntersectionObserver(es => {
    es.forEach(en => {
      if (en.isIntersecting && !seen && !reduce) {
        seen = true;
        auto = setInterval(() => {
          if (touched) { clearInterval(auto); return; }
          setStage((+range.value + 1) % 4);
        }, 3600);
      }
      if (!en.isIntersecting && auto) { clearInterval(auto); auto = null; seen = false; }
    });
  }, { threshold: 0.5 });
  sio.observe(stagesEl);

  // ===== phone mask is not used: field accepts phone or @nick =====

  // ===== form -> worker -> telegram =====
  const form = el('leadForm');
  const st = el('formSt');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    st.className = 'form__st';
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn__t');
    const orig = label.textContent;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name.trim() || !payload.contact.trim()) {
      st.textContent = 'Заполните имя и контакт, чтобы мы могли связаться.';
      st.classList.add('err');
      return;
    }
    if (!el('f-agree').checked) {
      st.textContent = 'Отметьте согласие на обработку данных.';
      st.classList.add('err');
      return;
    }
    delete payload._gotcha;
    payload.phone = payload.contact;
    if (payload.topic) payload.comment = (payload.comment ? payload.comment + '\n\n' : '') + payload.topic;
    delete payload.topic;
    btn.disabled = true;
    label.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      label.textContent = 'Заявка отправлена';
      st.textContent = 'Спасибо! Свяжемся с вами и разберём цифры.';
      form.reset();
    } catch (err) {
      console.error(err);
      label.textContent = 'Не отправилось';
      st.textContent = 'Не получилось отправить. Напишите нам в Telegram: t.me/insal_tovary_kitai';
      st.classList.add('err');
    } finally {
      setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 3500);
    }
  });
})();
