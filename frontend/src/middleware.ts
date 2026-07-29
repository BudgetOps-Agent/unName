import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const accessToken = request.cookies.get("accessToken");

    return NextResponse.redirect(
      new URL(accessToken ? "/teams" : "/auth/signin", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};