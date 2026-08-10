import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isAuthed = req.cookies.get("bpd_auth")?.value === "1";

  if (!isAuthed) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
