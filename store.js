/* Pure static: config.js adalah satu-satunya sumber data publik. */
'use strict';
window.WeddingStore = (() => {
  const defaults = () => JSON.parse(JSON.stringify(window.WEDDING_DEFAULTS));
  function merge(value) {
    const d = defaults();
    if (value) {
      for (const k of Object.keys(d)) if (Object.hasOwn(value,k)) d[k]=value[k];
      d.rsvp = {whatsapp: String(value.rsvp?.whatsapp || ''), maxGuests: Number(value.rsvp?.maxGuests || 5)};
    }
    return d;
  }
  async function loadPublic() {
    if (new URLSearchParams(location.search).get('preview') === '1') {
      try { if (parent !== window && parent.WEDDING_PREVIEW_CONFIG) return merge(JSON.parse(parent.WEDDING_PREVIEW_CONFIG)); } catch (e) { console.warn(e); }
    }
    return defaults();
  }
  // JSON.stringify keeps quotes/newlines in user data safely escaped in the JS file.
  function source(config) { return '/* Restu & Ruslan — public wedding configuration */\nwindow.WEDDING_DEFAULTS = '+JSON.stringify(config,null,2)+';\n'; }
  return {defaults,merge,loadPublic,source};
})();
