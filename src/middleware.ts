import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "fallback-secret-change-me"
);

const PUBLIC_PATHS = ["/", "/login", "/api/auth"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths and static files
    if (
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/logo") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get("session")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const role = payload.role as string;

        // Admin routes: only SUPER_ADMIN and ADMIN
        if (pathname.startsWith("/admin")) {
            if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
                return NextResponse.redirect(new URL("/", request.url));
            }
        }

        return NextResponse.next();
    } catch {
        // Invalid token — redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("session");
        return response;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
