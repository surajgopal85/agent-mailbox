import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const mailboxes = pgTable("mailboxes",{
    id: uuid("id").defaultRandom().primaryKey(),

    address: text("address").notNull().unique(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true })
        .notNull(),

    deletedAt: timestamp("deleted_at", { withTimezone: true}),
});

export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),

    mailboxId: uuid("mailbox_id").notNull().references(() => mailboxes.id),

    providerEmailId: text("provider_email_id").notNull().unique(),

    fromAddress: text("from_address").notNull(),

    subject: text("subject"),

    receivedAt: timestamp("received_at", { withTimezone: true })
        .notNull(),
});

