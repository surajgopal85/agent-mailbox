import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/db";
import { mailboxes, messages } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";

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
        
        if (event.type !== "email.received") {
            return NextResponse.json({ received: true });
        }
        
        const address = event.data.received_for[0];
        const now = new Date();

        const [mailbox] = await db
            .select()
            .from(mailboxes)
            .where(
                and(
                    eq(mailboxes.address, address),
                    isNull(mailboxes.deletedAt),
                    gt(mailboxes.expiresAt, now))
                )
            .limit(1);

        if(!mailbox) {
            console.log("📭 No active mailbox for:", address);

            return NextResponse.json({ received: true });
        }

        await db
            .insert(messages)
            .values({
                mailboxId: mailbox.id,
                providerEmailId: event.data.email_id,
                fromAddress: event.data.from,
                subject: event.data.subject,
                receivedAt: new Date(event.data.created_at),
            })
            .onConflictDoNothing({
                target: messages.providerEmailId,
            });

        console.log("📬 Persisted message for mailbox:", mailbox.id);

        return NextResponse.json({ received: true });

    } catch (error){
        console.warn("❌ Invalid Resend webhook", error);

        return NextResponse.json(
            { error: "Invalid webhook" },
            { status: 400 }
        );
    }
}