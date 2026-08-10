import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return NextResponse.json(
      { error: "Server is missing ADMIN_USERNAME / ADMIN_PASSWORD env vars." },
      { status: 500 }
    );
  }

  if (username === validUsername && password === validPassword) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("bpd_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
}
