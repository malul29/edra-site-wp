import { Archivo } from "next/font/google";
import "../globals.css";
import BodyWrapper from "../../components/BodyWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";

const archivo = Archivo({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
    variable: "--font-archivo",
});

export const metadata = {
    metadataBase: new URL("https://edraarsitek.co.id"),
    title: "Edra Arsitek Indonesia",
    description: "Edra Arsitek Indonesia - Architecture & Interior Design",
    icons: {
        icon: "/favivon.png",
        shortcut: "/favivon.png",
        apple: "/favivon.png",
    },
};

export const revalidate = 60;

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={archivo.variable}>
            <body>
                <BodyWrapper>{children}</BodyWrapper>
                <SpeedInsights />
            </body>
        </html>
    );
}
