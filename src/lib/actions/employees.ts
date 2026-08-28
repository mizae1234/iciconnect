"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { employeeSchema } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function getEmployees(params: {
    page?: number;
    search?: string;
    department_id?: string;
    position_id?: string;
    employment_status?: string;
}) {
    await requireAdmin();
    const page = params.page || 1;
    const pageSize = 10;

    const where: Record<string, unknown> = {};
    if (params.search) {
        where.OR = [
            { first_name: { contains: params.search, mode: "insensitive" } },
            { last_name: { contains: params.search, mode: "insensitive" } },
            { nickname: { contains: params.search, mode: "insensitive" } },
            { employee_code: { contains: params.search, mode: "insensitive" } },
            { phone: { contains: params.search, mode: "insensitive" } },
        ];
    }
    if (params.department_id) {
        where.department_id = params.department_id;
    }
    if (params.position_id) {
        where.position_id = params.position_id;
    }
    if (params.employment_status) {
        where.employment_status = params.employment_status;
    }

    const [employees, total] = await Promise.all([
        prisma.employee.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                department: {
                    select: { id: true, name: true, code: true },
                },
                position: {
                    select: { id: true, name: true, code: true },
                },
                supervisor: {
                    select: { id: true, first_name: true, last_name: true, employee_code: true },
                },
                user: {
                    select: { id: true, name: true, email: true, role: true, is_active: true },
                },
            },
        }),
        prisma.employee.count({ where }),
    ]);

    return {
        employees,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
    };
}

export async function getEmployeesList() {
    await requireAdmin();
    return prisma.employee.findMany({
        where: { employment_status: "ACTIVE" },
        select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
        },
        orderBy: { first_name: "asc" },
    });
}

export async function getUnlinkedUsers() {
    await requireAdmin();
    return prisma.user.findMany({
        where: {
            employee: null,
            is_active: true,
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
    });
}

export async function getNextEmployeeCode() {
    await requireAdmin();
    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { employee_code: "desc" },
        select: { employee_code: true },
    });

    if (!lastEmployee) {
        return "ICI-0001";
    }

    const match = lastEmployee.employee_code.match(/ICI-(\d+)/);
    if (!match) {
        return "ICI-0001";
    }

    const nextNum = parseInt(match[1]) + 1;
    return `ICI-${String(nextNum).padStart(4, "0")}`;
}

export async function createEmployee(data: {
    employee_code: string;
    first_name: string;
    last_name: string;
    nickname?: string | null;
    phone?: string | null;
    extension?: string | null;
    avatar_url?: string | null;
    hire_date?: string | null;
    employment_status: string;
    user_id?: string | null;
    department_id?: string | null;
    position_id?: string | null;
    supervisor_id?: string | null;
}) {
    await requireAdmin();

    const parsed = employeeSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Check unique employee code
    const existing = await prisma.employee.findUnique({
        where: { employee_code: parsed.data.employee_code },
    });
    if (existing) {
        return { error: "รหัสพนักงานนี้มีอยู่แล้ว" };
    }

    // Check if user is already linked
    if (parsed.data.user_id) {
        const linkedEmployee = await prisma.employee.findUnique({
            where: { user_id: parsed.data.user_id },
        });
        if (linkedEmployee) {
            return { error: "บัญชีผู้ใช้นี้ถูกเชื่อมกับพนักงานอื่นแล้ว" };
        }
    }

    await prisma.employee.create({
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
    });

    revalidatePath("/admin/employees");
    return { success: true };
}

export async function updateEmployee(
    id: string,
    data: {
        employee_code: string;
        first_name: string;
        last_name: string;
        nickname?: string | null;
        phone?: string | null;
        extension?: string | null;
        avatar_url?: string | null;
        hire_date?: string | null;
        employment_status: string;
        user_id?: string | null;
        department_id?: string | null;
        position_id?: string | null;
        supervisor_id?: string | null;
    }
) {
    await requireAdmin();

    const parsed = employeeSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Check unique employee code (exclude self)
    const existing = await prisma.employee.findFirst({
        where: { employee_code: parsed.data.employee_code, id: { not: id } },
    });
    if (existing) {
        return { error: "รหัสพนักงานนี้มีอยู่แล้ว" };
    }

    // Check user link (exclude self)
    if (parsed.data.user_id) {
        const linkedEmployee = await prisma.employee.findFirst({
            where: { user_id: parsed.data.user_id, id: { not: id } },
        });
        if (linkedEmployee) {
            return { error: "บัญชีผู้ใช้นี้ถูกเชื่อมกับพนักงานอื่นแล้ว" };
        }
    }

    // Prevent self as supervisor
    if (parsed.data.supervisor_id === id) {
        return { error: "ไม่สามารถกำหนดตัวเองเป็นหัวหน้าได้" };
    }

    await prisma.employee.update({
        where: { id },
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
    });

    revalidatePath("/admin/employees");
    return { success: true };
}

export async function deleteEmployee(id: string) {
    await requireAdmin();

    // Check if this employee is a supervisor
    const subordinateCount = await prisma.employee.count({
        where: { supervisor_id: id },
    });
    if (subordinateCount > 0) {
        return { error: `ไม่สามารถลบได้ — เป็นหัวหน้าของพนักงาน ${subordinateCount} คน` };
    }

    // Check if this employee is a department head
    const headOf = await prisma.department.findFirst({
        where: { head_id: id },
    });
    if (headOf) {
        return { error: `ไม่สามารถลบได้ — เป็นหัวหน้าแผนก "${headOf.name}"` };
    }

    await prisma.employee.delete({ where: { id } });

    revalidatePath("/admin/employees");
    return { success: true };
}
