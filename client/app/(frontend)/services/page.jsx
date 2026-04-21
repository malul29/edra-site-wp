// Server Component — Services page (static data, no CMS dependency)
import { fallbackServices } from "@/lib/fallbackData";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Our Services — EDRA Arsitek Indonesia",
    description: "Architecture design, interior design, project management and construction services by PT. EDRA Arsitek Indonesia.",
};

export default async function ServicesPage() {
    return <ServicesClient services={fallbackServices} />;
}
