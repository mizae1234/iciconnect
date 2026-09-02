import { NextResponse } from "next/server";

export const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, cf-access-authenticated-user-email",
};

export function apiResponse(data: unknown, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: CORS_HEADERS,
    });
}

export function apiError(message: string, status = 400) {
    return NextResponse.json(
        { error: message },
        {
            status,
            headers: CORS_HEADERS,
        }
    );
}

export function handleOptions() {
    return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}
