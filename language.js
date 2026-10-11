(() => {
  const valid = value => value === 'ko' || value === 'en';
  const resolve = ({query, saved, primary} = {}) => valid(query) ? query : valid(saved) ? saved : /^ko(?:-|$)/i.test(primary || '') ? 'ko' : 'en';
  globalThis.MailtodoLanguage = {resolve};
  let saved;
  try { saved = localStorage.getItem('mailtodo-language'); } catch {}
  const url = new URL(location.href);
  const language = resolve({query:url.searchParams.get('lang'), saved, primary:navigator.languages?.[0] || navigator.language});
  if (/\/(?:index\.html)?$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/(?:index\.html)?$/, language + '.html');
    url.searchParams.delete('lang');
    location.replace(url.href);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language]').forEach(link => {
      const target = new URL(link.href);
      target.hash = location.hash;
      link.href = target.href;
      if (link.dataset.language === document.documentElement.lang) link.setAttribute('aria-current', 'page');
      link.addEventListener('click', () => {
        const target = new URL(link.href);target.hash = location.hash;link.href = target.href;
        try { localStorage.setItem('mailtodo-language', link.dataset.language); } catch {}
      });
    });
  });
})();
