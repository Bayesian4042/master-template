import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/constants/demo-auth.constants";

export async function POST() {
	const cookieStore = await cookies();
	cookieStore.set(DEMO_SESSION_COOKIE, "1", {
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
		sameSite: "lax",
		httpOnly: true,
	});

	return NextResponse.json({ ok: true });
}

export async function DELETE() {
	const cookieStore = await cookies();
	cookieStore.delete(DEMO_SESSION_COOKIE);

	return NextResponse.json({ ok: true });
}
