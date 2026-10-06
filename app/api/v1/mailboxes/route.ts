import { randomUUID } from "crypto";
import { db } from "@/db";
import { mailboxes } from "@/db/schema";

export async function POST() {
    const localPart = `mbx_${randomUUID()}`;
    const address = `${localPart}@intraba.resend.app`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    const [mailbox] = await db
        .insert(mailboxes)
        .values({
            address,
            expiresAt,
        })
        .returning();

    // const event = {
    //     address,
    //     expiresAt,
    // }

    return Response.json(mailbox, { status: 201 });
}