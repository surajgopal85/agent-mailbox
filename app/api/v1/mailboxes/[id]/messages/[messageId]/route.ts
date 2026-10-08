import { db } from "@/db";
import { mailboxes, messages } from "@/db/schema";
import { and, eq, isNull, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

function isValidUUID(str: string) {
  const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return regex.test(str);
}

export async function GET(
    _request: Request,
    context: { params: Promise<{ id: string; messageId: string }>}
) {
    const { id, messageId } = await context.params;

    if (!isValidUUID(id) || !isValidUUID(messageId)) {
        return NextResponse.json(
            { error: "bad request" },
            { status: 400 }
        );
    }

    const now = new Date();

    const [activeMailbox] =
        await db
            .select()
            .from(mailboxes)
            .where(
                and(
                    eq(mailboxes.id, id),
                    isNull(mailboxes.deletedAt),
                    gt(mailboxes.expiresAt, now),
                )
            )
            .limit(1);

    if(!activeMailbox) {
        return NextResponse.json(
            { error: "Mailbox not found"}, 
            { status: 404 },
        )
    }

    const [mailboxMessage] = 
        await db
            .select()
            .from(messages)
            .where(
                and(
                    eq(messages.id, messageId),
                    eq(messages.mailboxId, activeMailbox.id)
                )
            )
            .limit(1);

    if(!mailboxMessage) {
        return NextResponse.json(
            { error: "Message not found"},
            { status: 404 },
        )
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.receiving.get(mailboxMessage.providerEmailId);
    
        if (error || !data) {
            console.error("Resend retrieval failed", {
                providerEmailId: mailboxMessage.providerEmailId,
                error,
            });
    
            return NextResponse.json(
                { error: "Unable to retrieve message content" },
                { status: 502 }
            );
        }
        return Response.json({
            message: mailboxMessage,
            content: {
                subject: data.subject,
                text: data.text,
                html: data.html
            }
        });
    } catch (error) {
        console.error("Resend request failed", error);

        return NextResponse.json(
            { error: "Unable to retrieve message content" },
            { status: 502 }
        );
    }
}