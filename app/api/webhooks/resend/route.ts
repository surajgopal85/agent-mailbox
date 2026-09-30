import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const payload = await request.text();

    // console.log("📨 Incoming webhook:");
    // console.log(payload);

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Missing RESEND_WEBHOOK_SECRET");

        return NextResponse.json(
            { error: "Server configuration error"},
            { status: 500 }
        );
    }

    try {
        const event = resend.webhooks.verify({
            payload,
            headers: {
                id: request.headers.get("svix-id") ?? "",
                timestamp: request.headers.get("svix-timestamp") ?? "",
                signature: request.headers.get("svix-signature") ?? "",
            },
            webhookSecret,
        });

        console.log("✅ Verified Resend webhook");
        console.log(event);

        return NextResponse.json({ received: true });
    } catch (error){
        console.warn("❌ Invalid Resend webhook", error);

        return NextResponse.json(
            { error: "Invalid webhook" },
            { status: 400 }
        );
    }
}