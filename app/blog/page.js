import { SiteNav, SiteFooter, FloatButton, Analytics } from '../site-shared'
import { SITE_CSS } from '../site-css'
import { getAllPosts } from '@/lib/blog'
import BlogList from './BlogList'

export const metadata = {
  title: 'Blog & Kennis',
  description: 'Praktische inzichten over periodisering, tactical selectie, resultaten en training — gebaseerd op tien jaar ervaring als topsporter, Marinier en coach.',
}

const CSS = `
  ${SITE_CSS}

  .blog-cat-tabs { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:40px; }
  .blog-cat-tab {
    background:none; border:1px solid var(--dark4); color:var(--muted);
    font-family:var(--body); font-size:12px; letter-spacing:1px; text-transform:uppercase;
    padding:9px 18px; cursor:pointer; transition:border-color .2s, color .2s;
  }
  .blog-cat-tab:hover { color:var(--text); border-color:var(--muted2); }
  .blog-cat-tab.active { background:var(--orange); color:#000; border-color:var(--orange); font-weight:700; }

  .blog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; border:2px solid var(--dark3); }
  .blog-card { background:var(--dark2); padding:0; border:1px solid transparent; transition: border-color .25s, transform .25s; display:flex; flex-direction:column; text-decoration:none; }
  .blog-card:hover { border-color: var(--warm-border); transform: translateY(-6px); }
  .blog-img { aspect-ratio:16/10; background:var(--dark3); display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--dark4); }
  .blog-img-label { font-size:11px; letter-spacing:2px; color:var(--muted2); text-transform:uppercase; }
  .blog-body { padding:26px 28px; flex:1; display:flex; flex-direction:column; }
  .blog-cat { font-size:10px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-bottom:10px; }
  .blog-title { font-family:var(--display); font-size:22px; letter-spacing:1px; color:var(--text); margin-bottom:10px; line-height:1.1; }
  .blog-excerpt { font-size:14px; color:var(--muted); line-height:1.6; flex:1; }
  .blog-read { font-size:11px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-top:18px; display:inline-flex; align-items:center; gap:6px; }

  @media (max-width: 768px) { .blog-grid { grid-template-columns:1fr; } }
`

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <FloatButton />
      <SiteNav active="Blog" />

      <section className="page-hero">
        <div className="page-hero-eyebrow">Blog &amp; Kennis</div>
        <h1 className="page-hero-title">KENNIS DIE <span>WERKT</span></h1>
        <p className="page-hero-desc">
          Praktische inzichten over methode, tactical selectie, resultaten en training — gebaseerd op tien jaar ervaring als topsporter, Marinier en coach.
        </p>
      </section>

      <BlogList posts={posts} />

      <SiteFooter />
      <Analytics />
    </>
  )
}
