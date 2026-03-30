import type { MetadataRoute } from 'next'

const BASE_URL = 'https://openagora.cc'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/private/'],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/docs/sitemap.xml`,
    ],
  }
}
