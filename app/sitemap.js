import { getAllPosts } from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gvperformance.nl'

const STATIC_PAGES = [
  '', 'methode', 'resultaten', 'pakketten', 'blog', 'testimonials',
  'expertise', 'faq', 'gratis-krachttest', 'privacy',
]

export default function sitemap() {
  const staticEntries = STATIC_PAGES.map(slug => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
  }))

  const postEntries = getAllPosts().map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
  }))

  return [...staticEntries, ...postEntries]
}
