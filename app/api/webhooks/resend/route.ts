import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const payload = await request.json();

    console.log("📨 Incoming webhook:");
    console.log(payload);

    return NextResponse.json({
        received: true,
    });
}