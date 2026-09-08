import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, apiCatchError, handleOptions } from "@/lib/api-helper";
import { positionSchema } from "@/lib/constants";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(request: NextRequest) {
    try {
        await requireAuth();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
            ];
        }

        const positions = await prisma.position.findMany({
            where,
            orderBy: { level: "asc" },
            include: {
                _count: { select: { employees: true } },
            },
        });

        return apiResponse({ positions, total: positions.length });
    } catch (err: unknown) {
        return apiCatchError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const parsed = positionSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const existing = await prisma.position.findUnique({
            where: { code: parsed.data.code },
        });
        if (existing) {
            return apiError("รหัสตำแหน่งนี้มีอยู่แล้ว", 400);
        }

        const newPos = await prisma.position.create({
            data: {
                code: parsed.data.code,
                name: parsed.data.name,
                level: parsed.data.level ?? 0,
                is_active: parsed.data.is_active ?? true,
            },
        });

        return apiResponse(newPos, 201);
    } catch (err: unknown) {
        return apiCatchError(err);
    }
}
