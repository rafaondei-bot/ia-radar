/**
 * slide-renderer.js
 * Função pura que retorna o HTML completo de um slide do carrossel,
 * usável tanto em Node (generate-carousels.js) quanto no browser (editor do dashboard).
 *
 * Uso:
 *   const html = renderSlideHTML(carousel, slide, slideNum, totalSlides, overrides?)
 *
 * `overrides` é opcional e permite custom de:
 *   - texts: { eyebrow, title, highlight, body, stat, stat_label, theme }
 *   - colors: { laranja, amarelo, verde, preto }
 *   - fontSize: 'small' | 'medium' | 'large'
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SlideRenderer = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  const KIND_LABELS = {
    capa: "ARRASTA →",
    dado: "O DADO",
    contexto: "O QUE ROLOU",
    virada: "A VIRADA",
    mecanismo: "COMO FUNCIONA",
    impacto: "PRA QUEM IMPORTA",
    insight: "O INSIGHT",
    cta: "BORA?",
  };

  // V1 (paleta global) e V2 (por elemento) — ambos são aceitos via overrides.colors
  const DEFAULT_COLORS = {
    // paleta global (legado v1)
    laranja: "#ea580c",
    amarelo: "#facc15",
    verde: "#16a34a",
    preto: "#0a0a0a",
    // cores por elemento (v2 — preferido)
    title: "#fafafa",
    body: "#d4d4d8",
    eyebrow: "#facc15",
    stat: "#facc15",
    stat_label: "#fafafa",
    highlight: "#ea580c",
    background: "#0a0a0a",
    badge: null,        // null = usa amarelo (capa/cta) ou verde-claro (outros)
    cta_button: "#facc15",
    cta_button_text: "#0a0a0a",
    handle: "#22c55e",
    theme_tag: "#22c55e",
  };

  const FONT_SIZE_PRESETS = {
    small:  { titleCapa: "96px",  titleNormal: "76px", titleLong: "64px" },
    medium: { titleCapa: "118px", titleNormal: "92px", titleLong: "78px" },
    large:  { titleCapa: "138px", titleNormal: "108px", titleLong: "92px" },
  };

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function renderTitle(title, highlight) {
    if (!title) return "";
    if (!highlight) return escHtml(title);
    var safeTitle = escHtml(title);
    var safeHl = escHtml(highlight);
    var idx = safeTitle.toLowerCase().indexOf(safeHl.toLowerCase());
    if (idx === -1) return safeTitle;
    return (
      safeTitle.slice(0, idx) +
      '<span class="highlight">' + safeTitle.slice(idx, idx + safeHl.length) + '</span>' +
      safeTitle.slice(idx + safeHl.length)
    );
  }

  function renderSlideHTML(carousel, slide, slideNum, totalSlides, overrides) {
    overrides = overrides || {};
    var texts = overrides.texts || {};
    var colors = Object.assign({}, DEFAULT_COLORS, overrides.colors || {});
    var sizePreset = FONT_SIZE_PRESETS[overrides.fontSize] || FONT_SIZE_PRESETS.medium;

    // Se a v1 (laranja/amarelo/verde/preto) foi usada, propaga pros papéis equivalentes da v2
    // — só sobrescreve se a chave v2 não foi definida explicitamente nos overrides.
    var ovColors = overrides.colors || {};
    if (ovColors.laranja && !ovColors.highlight) colors.highlight = ovColors.laranja;
    if (ovColors.amarelo && !ovColors.eyebrow) colors.eyebrow = ovColors.amarelo;
    if (ovColors.amarelo && !ovColors.stat) colors.stat = ovColors.amarelo;
    if (ovColors.amarelo && !ovColors.cta_button) colors.cta_button = ovColors.amarelo;
    if (ovColors.verde && !ovColors.handle) colors.handle = ovColors.verde;
    if (ovColors.verde && !ovColors.theme_tag) colors.theme_tag = ovColors.verde;
    if (ovColors.preto && !ovColors.background) colors.background = ovColors.preto;

    var kind = slide.kind || "contexto";
    var label = KIND_LABELS[kind] || kind.toUpperCase();
    var isCapa = kind === "capa" || slideNum === 1;
    var isCta = kind === "cta" || slideNum === totalSlides;
    var isFeatured = !!slide.featured && !isCapa && !isCta;

    var title = texts.title != null ? texts.title : (slide.title || "");
    var highlight = texts.highlight != null ? texts.highlight : (slide.highlight || "");
    var body = texts.body != null ? texts.body : (slide.body || "");
    var stat = texts.stat != null ? texts.stat : (slide.stat || "");
    var statLabel = texts.stat_label != null ? texts.stat_label : (slide.stat_label || "");
    var eyebrow = texts.eyebrow != null ? texts.eyebrow : (slide.eyebrow || "");
    var themeText = texts.theme != null ? texts.theme : (carousel.theme || "");

    var titleHtml = renderTitle(title, highlight);
    var bodyEsc = escHtml(body);
    var statEsc = escHtml(stat);
    var statLabelEsc = escHtml(statLabel);
    var eyebrowEsc = escHtml(eyebrow);
    var themeEsc = escHtml(themeText);

    var titleSizeClass = "";
    if (title.length > 38) titleSizeClass = "x-long";
    else if (title.length > 26) titleSizeClass = "long";

    var titleFontSize = isCapa ? sizePreset.titleCapa : sizePreset.titleNormal;
    if (titleSizeClass === "long") titleFontSize = sizePreset.titleNormal;
    if (titleSizeClass === "x-long") titleFontSize = sizePreset.titleLong;

    return [
      '<!DOCTYPE html>',
      '<html lang="pt-BR"><head><meta charset="UTF-8" />',
      '<link rel="preconnect" href="https://fonts.googleapis.com" />',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />',
      '<style>',
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      ':root { --laranja: ' + colors.laranja + '; --amarelo: ' + colors.amarelo + '; --verde: ' + colors.verde + '; --preto: ' + colors.background + '; --verde-claro: #22c55e; --branco: #fafafa; --cinza-300: #d4d4d8; --cinza-400: #a1a1aa; --c-title: ' + colors.title + '; --c-body: ' + colors.body + '; --c-eyebrow: ' + colors.eyebrow + '; --c-stat: ' + colors.stat + '; --c-stat-label: ' + colors.stat_label + '; --c-highlight: ' + colors.highlight + '; --c-handle: ' + colors.handle + '; --c-theme-tag: ' + colors.theme_tag + '; --c-cta-bg: ' + colors.cta_button + '; --c-cta-text: ' + colors.cta_button_text + '; }',
      'html, body { width: 1080px; height: 1350px; background: var(--preto); font-family: \'Inter\', sans-serif; color: var(--branco); overflow: hidden; }',
      '.slide { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: ' + (isCapa ? 'linear-gradient(160deg, ' + colors.background + ' 0%, ' + colors.background + ' 100%), radial-gradient(ellipse at 30% 0%, rgba(22,163,74,0.15), transparent 60%)' : isFeatured ? 'linear-gradient(180deg, ' + colors.background + ' 0%, ' + colors.background + ' 100%)' : colors.background) + '; }',
      '.bg-glow { position: absolute; inset: 0; background: ' + (isFeatured ? 'radial-gradient(ellipse at 50% 50%, rgba(22,163,74,0.22) 0%, rgba(10,10,10,0) 65%)' : 'radial-gradient(ellipse at 50% 30%, rgba(22,163,74,0.15) 0%, rgba(10,10,10,0) 60%)') + '; z-index: 0; }',
      isFeatured ? [
        '.slide::after { content: \'\'; position: absolute; inset: 18px; border: 1.5px solid rgba(22,163,74,0.4); border-radius: 28px; pointer-events: none; z-index: 1; }',
        '.slide-corner { position: absolute; width: 36px; height: 36px; border-color: var(--verde-claro); pointer-events: none; z-index: 2; }',
        '.slide-corner.tl { top: 18px; left: 18px; border-top: 3px solid; border-left: 3px solid; border-top-left-radius: 28px; }',
        '.slide-corner.tr { top: 18px; right: 18px; border-top: 3px solid; border-right: 3px solid; border-top-right-radius: 28px; }',
        '.slide-corner.bl { bottom: 18px; left: 18px; border-bottom: 3px solid; border-left: 3px solid; border-bottom-left-radius: 28px; }',
        '.slide-corner.br { bottom: 18px; right: 18px; border-bottom: 3px solid; border-right: 3px solid; border-bottom-right-radius: 28px; }',
        '.featured-tag { position: absolute; top: 96px; left: 50%; transform: translateX(-50%); background: var(--verde); color: var(--branco); font-size: 13px; font-weight: 800; letter-spacing: 0.32em; text-transform: uppercase; padding: 6px 16px; border-radius: 100px; z-index: 4; box-shadow: 0 6px 20px rgba(22,163,74,0.4); }'
      ].join('\n') : '',
      '.badge { position: absolute; top: 56px; left: 56px; font-size: 18px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: ' + (isCapa || isCta ? 'var(--amarelo)' : 'var(--verde-claro)') + '; display: flex; align-items: center; gap: 14px; z-index: 3; }',
      '.badge::before { content: \'\'; width: 32px; height: 2px; background: ' + (isCapa || isCta ? 'var(--amarelo)' : 'var(--verde-claro)') + '; display: inline-block; }',
      '.slide-num { position: absolute; top: 56px; right: 56px; font-family: \'JetBrains Mono\', monospace; font-size: 16px; font-weight: 600; color: var(--cinza-400); opacity: 0.7; letter-spacing: 0.14em; z-index: 3; }',
      '.content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 150px 64px 170px; z-index: 2; text-align: ' + (isCapa || isCta ? 'center' : 'left') + '; }',
      '.eyebrow { font-size: 22px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: var(--c-eyebrow); margin-bottom: 24px; }',
      'h1 { font-size: ' + titleFontSize + '; font-weight: 900; line-height: 0.95; letter-spacing: -0.035em; text-transform: uppercase; color: var(--c-title); margin-bottom: ' + (body || stat ? '36px' : '0') + '; }',
      'h1 .highlight { color: var(--c-highlight); }',
      '.stat-block { text-align: center; margin: 28px 0 32px; }',
      '.stat-block .stat-number { font-size: 220px; font-weight: 900; color: var(--c-stat); line-height: 0.9; letter-spacing: -0.04em; text-shadow: 0 16px 60px rgba(250,204,21,0.18); }',
      '.stat-block .stat-label { font-size: 28px; font-weight: 700; color: var(--c-stat-label); margin-top: 12px; text-transform: uppercase; letter-spacing: 0.12em; }',
      '.body-text { font-size: 28px; font-weight: 500; line-height: 1.55; color: var(--c-body); max-width: 920px; ' + (isCapa || isCta ? 'margin: 0 auto;' : '') + ' }',
      '.body-text strong { color: var(--c-title); font-weight: 700; }',
      '.body-text em { color: var(--c-highlight); font-style: normal; font-weight: 700; }',
      '.theme-tag { display: inline-block; background: rgba(22,163,74,0.15); color: var(--c-theme-tag); border: 1px solid rgba(22,163,74,0.4); padding: 8px 18px; border-radius: 100px; font-size: 18px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 28px; }',
      '.cta-button { display: inline-block; background: var(--c-cta-bg); color: var(--c-cta-text); font-size: 38px; font-weight: 900; padding: 22px 44px; border-radius: 100px; letter-spacing: 0.04em; text-transform: uppercase; margin-top: 32px; box-shadow: 0 18px 40px rgba(250,204,21,0.25); }',
      '.handle { font-size: 26px; font-weight: 700; color: var(--c-handle); margin-top: 24px; letter-spacing: 0.1em; }',
      '.footer { position: absolute; bottom: 56px; left: 56px; right: 56px; display: flex; justify-content: space-between; align-items: flex-end; z-index: 3; }',
      '.brand { font-size: 18px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--branco); opacity: 0.85; line-height: 1.5; }',
      '.brand .accent { color: var(--verde-claro); font-weight: 800; }',
      '.arrasta { font-size: 20px; font-weight: 800; color: var(--preto); background: var(--amarelo); padding: 12px 20px; border-radius: 100px; display: inline-flex; align-items: center; gap: 8px; letter-spacing: 0.04em; text-transform: uppercase; }',
      '</style></head><body>',
      '<div class="slide">',
      '  <div class="bg-glow"></div>',
      isFeatured ? '  <div class="slide-corner tl"></div><div class="slide-corner tr"></div><div class="slide-corner bl"></div><div class="slide-corner br"></div><div class="featured-tag">★ Destaque</div>' : '',
      '  <div class="badge">' + escHtml(label) + '</div>',
      '  <div class="slide-num">' + String(slideNum).padStart(2, '0') + ' / ' + String(totalSlides).padStart(2, '0') + '</div>',
      '  <div class="content">',
      isCapa && themeEsc ? '    <span class="theme-tag">' + themeEsc + '</span>' : '',
      eyebrowEsc ? '    <div class="eyebrow">' + eyebrowEsc + '</div>' : '',
      statEsc ? '    <div class="stat-block"><div class="stat-number">' + statEsc + '</div>' + (statLabelEsc ? '<div class="stat-label">' + statLabelEsc + '</div>' : '') + '</div>' : '',
      title ? '    <h1>' + titleHtml + '</h1>' : '',
      bodyEsc ? '    <p class="body-text">' + bodyEsc.replace(/\n/g, '<br>') + '</p>' : '',
      isCta ? '    <div class="cta-button">SALVA + SEGUE →</div><div class="handle">@rafaondei</div>' : '',
      '  </div>',
      '  <div class="footer">',
      '    <div class="brand"><span class="accent">IA Radar</span><br>Rafael Ondei</div>',
      !isCta ? '    <div class="arrasta">Arrasta →</div>' : '    <div></div>',
      '  </div>',
      '</div></body></html>'
    ].join('\n');
  }

  return { renderSlideHTML: renderSlideHTML, KIND_LABELS: KIND_LABELS, DEFAULT_COLORS: DEFAULT_COLORS };
});
