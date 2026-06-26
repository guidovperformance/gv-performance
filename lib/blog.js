import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog')

function readPostFile(filename) {
  const filePath = path.join(POSTS_DIR, filename)
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  return {
    title: data.title,
    slug: data.slug || filename.replace(/\.md$/, ''),
    category: data.category || 'Methode',
    excerpt: data.excerpt || '',
    author: data.author || 'Guido Vols',
    date: data.date || null,
    readingTime: data.readingTime || null,
    metaTitle: data.metaTitle || data.title,
    metaDescription: data.metaDescription || data.excerpt || '',
    ogImage: data.ogImage || '/hero.jpg',
    published: data.published !== false,
    content,
  }
}

export function getAllPosts() {
  if (!fs.existsSync(POSTS_DIR)) return []
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
  return files
    .map(readPostFile)
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

export function getPostBySlug(slug) {
  const post = getAllPosts().find(p => p.slug === slug)
  if (!post) return null
  return { ...post, html: marked.parse(post.content) }
}

export function getPostSlugs() {
  return getAllPosts().map(p => p.slug)
}
