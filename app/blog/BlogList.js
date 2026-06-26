'use client'
import React from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { CATEGORIES } from '@/lib/blog-categories'
import { EmptyState } from '../site-shared'

export default function BlogList({ posts }) {
  const [activeCat, setActiveCat] = React.useState('Alle')

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [activeCat])

  const filtered = activeCat === 'Alle' ? posts : posts.filter(p => p.category === activeCat)

  return (
    <section>
      <div className="blog-cat-tabs">
        {['Alle', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`blog-cat-tab ${activeCat === cat ? 'active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState Icon={FileText} text="Nog geen posts in deze categorie." />
      ) : (
        <div className="blog-grid">
          {filtered.map((p, i) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className={`blog-card fade-in delay-${(i % 3) + 1}`}>
              <div className="blog-img"><span className="blog-img-label">Afbeelding volgt</span></div>
              <div className="blog-body">
                <div className="blog-cat">{p.category}</div>
                <h2 className="blog-title">{p.title}</h2>
                <p className="blog-excerpt">{p.excerpt}</p>
                <span className="blog-read">Lees meer ›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
