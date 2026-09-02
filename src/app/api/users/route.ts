import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";
import { userSchema } from "@/lib/constants";
import bcrypt from "bcryptjs";

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = 10;
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) where.role = role;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    is_active: true,
                    created_at: true,
                    employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
                },
            }),
            prisma.user.count({ where }),
        ]);

        return apiResponse({ users, total, totalPages: Math.ceil(total / pageSize), page });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = userSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const existing = await prisma.user.findUnique({
            where: { email: parsed.data.email },
        });
        if (existing) {
            return apiError("อีเมลนี้มีอยู่ในระบบแล้ว", 400);
        }

        const password_hash = await bcrypt.hash(parsed.data.password || "Password123", 12);

        const newUser = await prisma.user.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                password_hash,
                role: parsed.data.role,
                is_active: parsed.data.is_active ?? true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_active: true,
                created_at: true,
            },
        });

        return apiResponse(newUser, 201);
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
