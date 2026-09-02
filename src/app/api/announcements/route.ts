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

        const now = new Date();
        const where: Record<string, unknown> = {};

        if (role) {
            where.is_active = true;
            where.target_roles = { has: role };
            where.start_at = { lte: now };
            where.OR = [{ expire_at: null }, { expire_at: { gte: now } }];
        }

        const announcements = await prisma.announcement.findMany({
            where,
            orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
            include: {
                creator: { select: { id: true, name: true, email: true } },
            },
        });

        return apiResponse({ announcements, total: announcements.length });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
