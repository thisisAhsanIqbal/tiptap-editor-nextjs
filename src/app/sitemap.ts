import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://tiptap-editor-iota-nine.vercel.app`,
      lastModified: new Date(),
      priority: 1
    },
    {
      url: `https://tiptap-editor-iota-nine.vercel.app/post`,
      lastModified: new Date(),
      priority: 0.8
    }
  ];
}
