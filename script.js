  // Each flower: [x %, bloom top from top, base height, size, brightness]; back row first
  const flowers = [
    [20.5, 10.3, 37.3, .30, .32],
    [42, 9.2, 38.4, .28, .28],
    [57.5, 10.8, 36.4, .30, .32],
    [75.5, 12.1, 32.3, .32, .38],
    [15, 22.2, 15.1, .42, .55],
    [36, 19.7, 29, .32, .45],
    [49, 20, 21.2, .38, .50],
    [64, 19.6, 26.2, .35, .48],
    [85, 24.9, 0, .53, .75],
    [30, 34.75, -6, .62, 1],
  ];

  // HERO grows first while zoomed in; REVEAL is when the zoom-out starts
  const HERO = 6, REVEAL = 1.4, ZOOM_END = (REVEAL + 1.8) * 1000;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Hard-coded start times (seconds after zoom-out) so the others grow in a scattered order
  const starts = [1.05, 2.7, 1.85, 0, 2.45, .25, 0, 1.75, .9, 3.5].map(s => ZOOM_END / 1000 + s);

  // Builds one flower: grass, stem, leaves, bloom petals, core and pollen dots
  const make = ([x, top, base, size, brightness], i) => {
    const d = i === HERO || reduced ? 0 : starts[i];
    const height = (62.5 - top - base) / size;
    const el = document.createElement('div');
    el.className = 'flower';
    el.style.cssText = `--x:${x}%;--b:${base};--k:${size};--h:${height};--o:${brightness};--d:${d}s;--tilt:20deg;--tz:0deg`;
    const grass = [[4, 10, 1], [6, 8, 1], [4, 10, -1], [6, 8, -1]]
      .map(([w, bh, dir]) => `<div class="flower-grass" style="--w:${w};--bh:${bh};--dir:${dir}"></div>`).join('');
    const leaves = Array.from({ length: 8 }, (_, n) => {
      const top = 100 - (32 + Math.floor(n / 2) * 13);
      return `<div class="flower-petal flower-petal_${n + 1}" style="--n:${n};top:${top}%;left:${n % 2 ? -4 : 48}%"></div>`;
    }).join('');
    const bloom = Array.from({ length: 8 }, (_, i) =>
      `<div class="flower-bloom" style="--r:${i * 45}deg;--i:${i}"></div>`).join('');
    el.innerHTML = grass + '<div class="flower-stem"></div>' +
      `<div class="flower-petals">${leaves}</div>` +
      `<div class="flower-head">${bloom}<div class="flower-core"></div></div>` +
      `<div style="position:absolute;left:0;bottom:calc(var(--h) * var(--u))">${['#ffe4a0', '#ff6236', '#ffe4a0', '#ff6236', '#ffe4a0', '#ff6236']
        .map(c => `<div class="pollen" style="position:absolute;width:.5cqi;aspect-ratio:1;border-radius:50%;opacity:0;background:${c};box-shadow:0 0 .5cqi ${c},0 0 1.5cqi ${c},0 0 3cqi ${c}80"></div>`).join('')}</div>`;
    return el;
  };
  // Adds the garden, zooms out from the centre flower and starts the pollen
  const start = () => {
  const garden = document.createElement('div');
  garden.style.cssText = 'position:absolute;inset:0;transform-origin:49% 46%;will-change:transform';
  garden.append(...flowers.map(make));
  document.getElementById('scene').append(garden);

  if (!reduced) {
    garden.animate([
      { transform: 'scale(2)' },
      { transform: 'scale(2)', offset: REVEAL / (REVEAL + 1.8) },
      { transform: 'scale(1)' },
    ], { duration: ZOOM_END, easing: 'ease-in-out', fill: 'forwards' });

    // Pollen drifts upward on a wobbly path; farther flowers get smaller, shorter pollen
    document.querySelectorAll('.pollen').forEach((dot, i) => {
      const k = +dot.closest('.flower').style.getPropertyValue('--k');
      const s = k * 1.6, rise = (10 + Math.random() * 15) * k * 1.6;
      const at = (p, size) => `translate(calc(-50% + ${(Math.random() - .5) * 10 * k * p}cqi), calc(-50% - ${rise * p}cqi)) scale(${size})`;
      dot.animate([
        { opacity: 0, transform: at(0, s) },
        { opacity: 1, transform: at(.15, s), offset: .15 },
        { transform: at(.4, s * .9), offset: .4 },
        { transform: at(.7, s * .8), offset: .7 },
        { opacity: 0, transform: at(1, s * .6) },
      ], { duration: 3000 + Math.random() * 3000, delay: (Math.max(...starts) + 1.8) * 1000 + Math.random() * 1000, iterations: Infinity, easing: 'ease-in-out' });
    });
  }

  };

  // Browsers block sound until the user interacts, so show a Play button if autoplay fails
  const music = document.getElementById('music');
  music.play().then(start, () => {
    const button = document.createElement('button');
    button.textContent = 'Play';
    button.style.cssText = 'position:fixed;inset:0;z-index:1;margin:auto;width:fit-content;height:fit-content;padding:1em 2em;font:600 clamp(1rem,4vmin,2rem) Poppins,system-ui,sans-serif;color:#ffd27a;background:#1a0a04cc;border:2px solid #ff9a3c;border-radius:999px;box-shadow:0 0 1em #ff8a1f;cursor:pointer';
    button.onclick = () => { button.remove(); music.play(); start(); };
    document.getElementById('scene').append(button);
    button.focus();
  });
