// Saca de cada página descargada: título, descripción, contenido limpio (HTML simple) e imágenes.
const { chromium } = require('playwright'); const fs = require('fs');
const BASE = 'https://www.ferjusanz-frutas-verduras.es';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.route('**/*', r => r.abort());
  const urls = fs.readFileSync('web/urls.txt', 'utf8').trim().split('\n');
  const out = [];
  for (const u of urls) {
    let path = u.replace(BASE, '').replace('/./', '/');
    const f = 'web/raw/' + (path.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'index') + '.html';
    await p.setContent(fs.readFileSync(f, 'utf8'));
    const d = await p.evaluate(([BASE, path]) => {
      const meta = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.getAttribute('content') || '';
      const isPost = path.startsWith('/blog/') && path !== '/blog/';
      let root = isPost ? document.querySelector('.entry-content') : document.querySelector('#main-content');
      root = root.cloneNode(true);
      root.querySelectorAll('noscript,script,style,form,iframe,.wpcf7,.et_pb_contact_form_container,#sidebar,#comment-wrap,.et_pb_blog_grid,.et_pb_posts').forEach(e => e.remove());
      // quitar el bloque repetido del pie (teléfono/email/dirección + lista de servicios): lo pone la plantilla nueva
      root.querySelectorAll('.et_pb_section').forEach(s => { if (/Ferjusanz le ofrece servicios de/.test(s.innerText)) s.remove(); });
      const imgs = new Set();
      const fix = h => { if (!h) return h; h = h.replace(BASE, '').replace('/./', '/'); return h; };
      const KEEP = { H1:1,H2:1,H3:1,H4:1,H5:1,P:1,UL:1,OL:1,LI:1,STRONG:1,B:1,EM:1,I:1,A:1,IMG:1,BR:1,TABLE:1,TR:1,TD:1,TH:1,TBODY:1,THEAD:1,BLOCKQUOTE:1 };
      const conv = n => {
        if (n.nodeType === 3) return n.textContent.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
        if (n.nodeType !== 1) return '';
        const inner = [...n.childNodes].map(conv).join('');
        const t = n.tagName;
        if (t === 'IMG') {
          const s = n.getAttribute('data-src') || n.getAttribute('src');
          if (!s || s.startsWith('data:')) return '';
          imgs.add(s);
          return `<img src="${fix(s)}" alt="${(n.getAttribute('alt') || '').replace(/"/g, '&quot;')}" loading="lazy">`;
        }
        if (!KEEP[t]) return /^(DIV|SECTION)$/.test(t) ? '\n' + inner + '\n' : inner;
        if (t === 'A') { const h = n.getAttribute('href'); return h ? `<a href="${fix(h)}">${inner}</a>` : inner; }
        if (t === 'BR') return '<br>';
        if (!inner.trim() && !/^(TD|TH)$/.test(t)) return '';
        const tag = t === 'B' ? 'strong' : t === 'I' ? 'em' : t.toLowerCase();
        return `<${tag}>${inner}</${tag}>`;
      };
      let html = conv(root).replace(/\n\s*\n+/g, '\n').replace(/[ \t]+/g, ' ').trim();
      // imágenes de fondo de las secciones
      const bgs = [...document.documentElement.innerHTML.matchAll(/background-image:\s*url\(([^)]+)\)/g)].map(m => m[1].replace(/['"]/g, '')).filter(s => s.includes('/uploads/'));
      const og = meta('og:image');
      return { path, isPost, title: document.title, description: meta('description'), ogImage: og ? fix(og) : '',
        date: meta('article:published_time'), h1: document.querySelector('h1')?.innerText.trim() || '',
        html, imgs: [...imgs, ...(og ? [og] : [])], bgs };
    }, [BASE, path]);
    out.push(d);
  }
  fs.writeFileSync('web/paginas.json', JSON.stringify(out, null, 1));
  await b.close();
  console.log(out.length, 'páginas');
})();
