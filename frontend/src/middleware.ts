import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    console.log("미들웨어 실행 pathname:", request.nextUrl.pathname);
    const { pathname } = request.nextUrl;

    if (pathname === "/") {
        const accessToken = request.cookies.get("accessToken");

        if (accessToken) {
            return NextResponse.redirect(new URL("/teams", request.url));
        } else {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/",
};