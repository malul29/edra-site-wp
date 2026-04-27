// Server Component
import { getPortfolioBySlug } from "@/lib/wordpress";
import ProjectDetailClient from "./ProjectDetailClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const project = await getPortfolioBySlug(id);

    if (!project) {
        return { title: "Project Not Found" };
    }

    return {
        title: `${project.title} — EDRA Arsitek Indonesia`,
        description: project.description?.substring(0, 160) || `Detail project ${project.title}`,
        openGraph: {
            images: [project.image || project.imageFull],
        },
    };
}

export default async function ProjectDetailPage({ params }) {
    const { id } = await params;
    const project = await getPortfolioBySlug(id);

    if (!project) {
        // Return Next.js 404 page
        return notFound();
    }

    return <ProjectDetailClient project={project} />;
}
 