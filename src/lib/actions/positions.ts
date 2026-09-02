"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { positionSchema } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function getPositions(params: {
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
        ];
    }

    const [positions, total] = await Promise.all([
        prisma.position.findMany({
            where,
            orderBy: { level: "asc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        }),
        prisma.position.count({ where }),
    ]);

    return {
        positions,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
    };
}

export async function getPositionsList() {
    await requireAdmin();
    return prisma.position.findMany({
        where: { is_active: true },
        select: { id: true, name: true, code: true, level: true },
        orderBy: { level: "asc" },
    });
}

export async function createPosition(data: {
    code: string;
    name: string;
    level: number;
    is_active: boolean;
}) {
    await requireAdmin();

    const parsed = positionSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const existing = await prisma.position.findUnique({
        where: { code: parsed.data.code },
    });
    if (existing) {
        return { error: "รหัสตำแหน่งนี้มีอยู่แล้ว" };
    }

    await prisma.position.create({
        data: {
            code: parsed.data.code,
            name: parsed.data.name,
            level: parsed.data.level,
            is_active: parsed.data.is_active,
        },
    });

    revalidatePath("/admin/positions");
    revalidatePath("/admin/employees");
    return { success: true };
}

export async function updatePosition(
    id: string,
    data: {
        code: string;
        name: string;
        level: number;
        is_active: boolean;
    }
) {
    await requireAdmin();

    const parsed = positionSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const existing = await prisma.position.findFirst({
        where: { code: parsed.data.code, id: { not: id } },
    });
    if (existing) {
        return { error: "รหัสตำแหน่งนี้มีอยู่แล้ว" };
    }

    await prisma.position.update({
        where: { id },
        data: {
            code: parsed.data.code,
            name: parsed.data.name,
            level: parsed.data.level,
            is_active: parsed.data.is_active,
        },
    });

    revalidatePath("/admin/positions");
    revalidatePath("/admin/employees");
    return { success: true };
}

export async function deletePosition(id: string) {
    await requireAdmin();

    const employeeCount = await prisma.employee.count({
        where: { position_id: id },
    });
    if (employeeCount > 0) {
        return { error: `ไม่สามารถลบได้ — มีพนักงานในตำแหน่งนี้ ${employeeCount} คน` };
    }

    await prisma.position.delete({ where: { id } });

    revalidatePath("/admin/positions");
    revalidatePath("/admin/employees");
    return { success: true };
}
