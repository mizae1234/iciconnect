import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { prisma } from "./lib/prisma";

const PUBLIC_PATHS = ["/forbidden", "/api-docs"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Handle CORS preflight for APIs
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, cf-access-authenticated-user-email",
            },
        });
    }

    // Allow public paths, API routes (for Swagger testing), and static files
    if (
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/logo") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const email = (await headers()).get("cf-access-authenticated-user-email");

    if (!email) {

        return NextResponse.redirect(new URL("/forbidden", request.url));
    } else {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user || !user.is_active) {
            return NextResponse.redirect(new URL("/forbidden", request.url));
        }

    }

    return NextResponse.next(); 
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
