import { notFound } from 'next/navigation'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton, Analytics } from '../../site-shared'
import { getPostBySlug, getPostSlugs } from '@/lib/blog'

export function generateStaticParams() {
  return getPostSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: { absolute: post.metaTitle },
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      images: [{ url: post.ogImage }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.ogImage],
    },
  }
}

const CSS = `
  ${SITE_CSS}

  .post-meta { display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-bottom:8px; }
  .post-meta-item { font-size:12px; letter-spacing:1px; color:var(--muted); text-transform:uppercase; }

  .post-content { max-width:680px; margin:0 auto; }
  .post-content h2 { font-family:var(--display); font-size:clamp(26px,3vw,34px); letter-spacing:1px; color:var(--text); margin:48px 0 18px; line-height:1.15; }
  .post-content h3 { font-family:var(--display); font-size:22px; letter-spacing:1px; color:var(--text); margin:36px 0 14px; }
  .post-content p { font-size:16px; color:#ccc; line-height:1.85; margin-bottom:20px; }
  .post-content strong { color:var(--text); font-weight:700; }
  .post-content a { color:var(--orange); text-decoration:underline; }
  .post-content a:hover { color:var(--text); }
  .post-content ul, .post-content ol { margin:0 0 20px 22px; color:#ccc; font-size:16px; line-height:1.85; }
  .post-content li { margin-bottom:8px; }
  .post-content li::marker { color:var(--orange); }

  .post-cta {
    max-width:680px; margin:56px auto 0; background:var(--dark2); border:1px solid rgba(212,168,87,0.25);
    padding:32px 36px; text-align:center;
  }
  .post-cta-title { font-family:var(--display); font-size:22px; letter-spacing:1px; color:var(--text); margin-bottom:10px; }
  .post-cta-text { font-size:14px; color:var(--muted); margin-bottom:22px; }
  .post-cta-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

  @media (max-width: 600px) {
    .post-content h2 { font-size:24px; }
    .post-cta { padding:28px 22px; }
  }
`

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    image: post.ogImage,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FloatButton />
      <SiteNav active="Blog" />

      <section className="page-hero" style={{ paddingBottom: 40 }}>
        <div className="page-hero-eyebrow">{post.category}</div>
        <h1 className="page-hero-title" style={{ fontSize: 'clamp(34px,5vw,56px)' }}>{post.title}</h1>
        <div className="post-meta" style={{ justifyContent: 'center' }}>
          <span className="post-meta-item">{post.author}</span>
          {post.date && <span className="post-meta-item">{new Date(post.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          {post.readingTime && <span className="post-meta-item">{post.readingTime} leestijd</span>}
        </div>
      </section>

      <section>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.html }} />

        <div className="post-cta">
          <div className="post-cta-title">Klaar voor een traject op maat?</div>
          <p className="post-cta-text">Ontdek het GV Performance Systeem en bekijk welk pakket bij jou past.</p>
          <div className="post-cta-actions">
            <a href="/methode" className="btn-secondary">Meer over de methode</a>
            <a href="/pakketten" className="btn-primary">Bekijk pakketten</a>
          </div>
        </div>
      </section>

      <SiteFooter />
      <Analytics />
    </>
  )
}
