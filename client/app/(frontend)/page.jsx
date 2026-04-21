// Server Component — fetches portfolio data from WordPress REST API
import HomeClient from "./HomeClient";
import { fallbackServices } from "@/lib/fallbackData";
import { getPortfolioProjects } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Edra Arsitek Indonesia",
    description: "Edra Arsitek Indonesia - Innovative & Inspiring Design Solutions",
    openGraph: {
        title: "Edra Arsitek Indonesia",
        description: "Edra Arsitek Indonesia - Innovative & Inspiring Design Solutions",
        url: "https://edraarsitek.co.id",
        siteName: "Edra Arsitek Indonesia",
        images: [
            {
                url: "/hero.jpg",
                width: 1200,
                height: 630,
                alt: "Edra Arsitek Indonesia",
            },
        ],
        locale: "id_ID",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Edra Arsitek Indonesia",
        description: "Edra Arsitek Indonesia - Innovative & Inspiring Design Solutions",
        images: ["/hero.jpg"],
    },
};

export default async function Home() {
    let portfolio = [];
    const services = fallbackServices;
    try {
        portfolio = await getPortfolioProjects({ limit: 24 });
    } catch (err) {
        console.error("[Home] Failed to load CMS data from WordPress:", err?.message);
    }
    return <HomeClient initialPortfolio={portfolio} initialServices={services} />;
}
