import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";
import { departmentSchema } from "@/lib/constants";

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
                { name_en: { contains: search, mode: "insensitive" } },
            ];
        }

        const departments = await prisma.department.findMany({
            where,
            orderBy: { created_at: "asc" },
            include: {
                head: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
                parent: { select: { id: true, name: true, code: true } },
                _count: { select: { employees: true, children: true } },
            },
        });

        return apiResponse({ departments, total: departments.length });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = departmentSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const existing = await prisma.department.findUnique({
            where: { code: parsed.data.code },
        });
        if (existing) {
            return apiError("รหัสแผนกนี้มีอยู่แล้ว", 400);
        }

        const newDept = await prisma.department.create({
            data: {
                code: parsed.data.code,
                name: parsed.data.name,
                name_en: parsed.data.name_en || null,
                parent_id: parsed.data.parent_id || null,
                head_id: parsed.data.head_id || null,
                is_active: parsed.data.is_active ?? true,
            },
        });

        return apiResponse(newDept, 201);
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
