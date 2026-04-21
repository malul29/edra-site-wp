// Server Component — fetches all portfolio data from WordPress REST API
import ProjectsClient from "./ProjectsClient";
import { getPortfolioProjects } from "@/lib/wordpress";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
    title: "Projects — EDRA Arsitek Indonesia",
    description: "Explore our portfolio of architecture, interior design, and construction projects across Indonesia.",
};

export default async function ProjectsPage() {
    let projects = [];
    try {
        projects = await getPortfolioProjects({ limit: 200 });
    } catch (err) {
        console.error("[ProjectsPage] Failed to load CMS data from WordPress:", err?.message);
    }
    return <ProjectsClient initialData={projects} />;
}
