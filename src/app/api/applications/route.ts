import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");

        const where: Record<string, unknown> = {};
        if (role) {
            where.allowed_roles = { has: role };
            where.is_active = true;
        }

        const applications = await prisma.application.findMany({
            where,
            orderBy: { display_order: "asc" },
        });

        return apiResponse({ applications, total: applications.length });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
