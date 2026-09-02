"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { departmentSchema } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function getDepartments(params: {
    page?: number;
    search?: string;
}) {
    await requireAdmin();
    const page = params.page || 1;
    const pageSize = 10;

    const where: Record<string, unknown> = {};
    if (params.search) {
        where.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { code: { contains: params.search, mode: "insensitive" } },
            { name_en: { contains: params.search, mode: "insensitive" } },
        ];
    }

    const [departments, total] = await Promise.all([
        prisma.department.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                head: {
                    select: { id: true, first_name: true, last_name: true, employee_code: true },
                },
                parent: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: { employees: true, children: true },
                },
            },
        }),
        prisma.department.count({ where }),
    ]);

    return {
        departments,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
    };
}

export async function getDepartmentsList() {
    await requireAdmin();
    return prisma.department.findMany({
        where: { is_active: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
    });
}

export async function createDepartment(data: {
    code: string;
    name: string;
    name_en?: string | null;
    description?: string | null;
    parent_id?: string | null;
    head_id?: string | null;
    is_active: boolean;
}) {
    await requireAdmin();

    const parsed = departmentSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const existing = await prisma.department.findUnique({
        where: { code: parsed.data.code },
    });
    if (existing) {
        return { error: "รหัสแผนกนี้มีอยู่แล้ว" };
    }

    await prisma.department.create({
        data: {
            code: parsed.data.code,
            name: parsed.data.name,
            name_en: parsed.data.name_en || null,
            description: parsed.data.description || null,
            parent_id: parsed.data.parent_id || null,
            head_id: parsed.data.head_id || null,
            is_active: parsed.data.is_active,
        },
    });

    revalidatePath("/admin/departments");
    revalidatePath("/admin/employees");
    return { success: true };
}

export async function updateDepartment(
    id: string,
    data: {
        code: string;
        name: string;
        name_en?: string | null;
        description?: string | null;
        parent_id?: string | null;
        head_id?: string | null;
        is_active: boolean;
    }
) {
    await requireAdmin();

    const parsed = departmentSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Check unique code (exclude self)
    const existing = await prisma.department.findFirst({
        where: { code: parsed.data.code, id: { not: id } },
    });
    if (existing) {
        return { error: "รหัสแผนกนี้มีอยู่แล้ว" };
    }

    await prisma.department.update({
        where: { id },
        data: {
            code: parsed.data.code,
            name: parsed.data.name,
            name_en: parsed.data.name_en || null,
            description: parsed.data.description || null,
            parent_id: parsed.data.parent_id || null,
            head_id: parsed.data.head_id || null,
            is_active: parsed.data.is_active,
        },
    });

    revalidatePath("/admin/departments");
    revalidatePath("/admin/employees");
    return { success: true };
}

export async function deleteDepartment(id: string) {
    await requireAdmin();

    // Check if department has employees
    const employeeCount = await prisma.employee.count({
        where: { department_id: id },
    });
    if (employeeCount > 0) {
        return { error: `ไม่สามารถลบได้ — มีพนักงานในแผนกนี้ ${employeeCount} คน` };
    }

    // Check if department has children
    const childCount = await prisma.department.count({
        where: { parent_id: id },
    });
    if (childCount > 0) {
        return { error: `ไม่สามารถลบได้ — มีแผนกย่อย ${childCount} แผนก` };
    }

    await prisma.department.delete({ where: { id } });

    revalidatePath("/admin/departments");
    revalidatePath("/admin/employees");
    return { success: true };
}
