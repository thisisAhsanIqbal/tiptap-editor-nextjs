import { Metadata } from "next";
import postService from "@/lib/supabase/post";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Handle both Promise and direct params (Next.js 15+ uses Promise)
  const resolvedParams = params instanceof Promise ? await params : params;
  const slugOrId = resolvedParams.slug;
  
  try {
    console.log('generateMetadata: Fetching post with slug/id:', slugOrId);
    const post = await postService.get(slugOrId);
    console.log('generateMetadata: Post fetched:', post ? { id: post.id, title: post.title, slug: post.slug } : 'null');
    
    if (!post) {
      console.warn('generateMetadata: Post not found for slug/id:', slugOrId);
      return {
        title: "Post Not Found",
        description: "The requested post could not be found.",
      };
    }

    // Use meta title/description if available, otherwise fallback to title and excerpt
    const metaTitle = post.metaTitle?.trim() || post.title;
    const metaDescription = post.metaDescription?.trim() || 
      (post.html ? post.html.replace(/<[^>]*>/g, "").substring(0, 160).trim() + "..." : "Read this article");

    // Debug logging (remove in production)
    console.log('Generated metadata for post:', {
      slug: slugOrId,
      metaTitle,
      metaDescription,
      hasMetaTitle: !!post.metaTitle,
      hasMetaDescription: !!post.metaDescription,
    });

    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tiptap-editor-iota-nine.vercel.app";
    const postUrl = `${baseUrl}/posts/${post.slug || post.id}`;
    const coverImage = post.cover || `${baseUrl}/opengraph-image.jpg`;

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: postUrl,
        siteName: "Next Tiptap Editor",
        images: [
          {
            url: coverImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: "en_US",
        type: "article",
        publishedTime: post.createdAt,
        authors: [post.author],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: [coverImage],
      },
      alternates: {
        canonical: postUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Post",
      description: "Read this article",
    };
  }
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
