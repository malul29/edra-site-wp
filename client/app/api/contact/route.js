import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, service, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required." },
                { status: 400 }
            );
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        // Log to server console (always, for visibility)
        console.log("=== NEW CONTACT SUBMISSION ===");
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Service: ${service || "-"}`);
        console.log(`Message: ${message}`);
        console.log("==============================");

        // Optional: Forward to WordPress Contact Form 7 (if plugin is installed)
        // Uncomment and set NEXT_PUBLIC_WORDPRESS_URL env var + CF7 form ID to enable.
        //
        const wpBase = (process.env.NEXT_PUBLIC_WORDPRESS_URL || "").replace(/\/$/, "");
        const cf7FormId = process.env.CF7_FORM_ID || "";
        if (wpBase && cf7FormId) {
            const formData = new FormData();
            formData.append("_wpcf7_unit_tag", `wpcf7-f${cf7FormId}-p0-o1`);
            formData.append("your-name", name);
            formData.append("your-email", email);
            formData.append("your-subject", service || "General Inquiry");
            formData.append("your-message", message);
            const cf7Res = await fetch(
                `${wpBase}/wp-json/contact-form-7/v1/contact-forms/${cf7FormId}/feedback`,
                { method: "POST", body: formData }
            );
            
            const contentType = cf7Res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const cf7Data = await cf7Res.json();
                if (cf7Data.status !== "mail_sent") {
                    console.warn("[contact] CF7 warning:", cf7Data.message || cf7Data);
                }
            } else {
                const text = await cf7Res.text();
                console.error(`[contact] WordPress returned non-JSON response (${cf7Res.status}):`, text.substring(0, 200));
            }
        }


        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
