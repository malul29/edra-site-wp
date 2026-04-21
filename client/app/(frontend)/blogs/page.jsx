// Server Component — fetches all blog posts from WordPress REST API
import BlogsClient from "./BlogsClient";
import { getBlogPosts } from "@/lib/wordpress";

export const metadata = {
    title: "Blog — EDRA Arsitek Indonesia",
    description: "Design thinking, project process, and architecture insights from PT. EDRA Arsitek Indonesia.",
};

export default async function BlogsPage() {
    let blogs = [];
    try {
        blogs = await getBlogPosts({ limit: 50 });
    } catch (err) {
        console.error("[BlogsPage] Failed to load CMS data from WordPress:", err?.message);
    }
    return <BlogsClient initialBlogs={blogs} />;
}
