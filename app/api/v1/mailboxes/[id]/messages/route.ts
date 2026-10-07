import { db } from "@/db";
import { mailboxes, messages } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    context: { params: Promise<{ id: string}> }
) {
    const{ id } = await context.params;

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

    const mailboxMessages =
        await db
            .select()
            .from(messages)
            .where(
                eq(messages.mailboxId, id)
            );

    return Response.json({ 
        messages: mailboxMessages
     });
}