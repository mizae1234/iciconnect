import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";
import { employeeSchema } from "@/lib/constants";

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = 10;
        const search = searchParams.get("search") || "";
        const department_id = searchParams.get("department_id") || "";
        const position_id = searchParams.get("position_id") || "";
        const employment_status = searchParams.get("employment_status") || "";

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
                { nickname: { contains: search, mode: "insensitive" } },
                { employee_code: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }
        if (department_id) where.department_id = department_id;
        if (position_id) where.position_id = position_id;
        if (employment_status) where.employment_status = employment_status;

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    department: { select: { id: true, name: true, code: true } },
                    position: { select: { id: true, name: true, code: true } },
                    supervisor: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
                    user: { select: { id: true, name: true, email: true, role: true, is_active: true } },
                },
            }),
            prisma.employee.count({ where }),
        ]);

        return apiResponse({
            employees,
            total,
            totalPages: Math.ceil(total / pageSize),
            page,
        });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = employeeSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const existing = await prisma.employee.findUnique({
            where: { employee_code: parsed.data.employee_code },
        });
        if (existing) {
            return apiError("รหัสพนักงานนี้มีอยู่แล้ว", 400);
        }

        const newEmployee = await prisma.employee.create({
            data: {
                employee_code: parsed.data.employee_code,
                first_name: parsed.data.first_name,
                last_name: parsed.data.last_name,
                nickname: parsed.data.nickname || null,
                phone: parsed.data.phone || null,
                extension: parsed.data.extension || null,
                avatar_url: parsed.data.avatar_url || null,
                hire_date: parsed.data.hire_date ? new Date(parsed.data.hire_date) : null,
                employment_status: parsed.data.employment_status,
                user_id: parsed.data.user_id || null,
                department_id: parsed.data.department_id || null,
                position_id: parsed.data.position_id || null,
                supervisor_id: parsed.data.supervisor_id || null,
            },
            include: {
                department: true,
                position: true,
            },
        });

        return apiResponse(newEmployee, 201);
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
