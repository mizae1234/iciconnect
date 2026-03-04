"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { userSchema } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers(params: {
    page?: number;
    search?: string;
    role?: string;
}) {
    await requireAdmin();
    const page = params.page || 1;
    const pageSize = 10;

    const where: Record<string, unknown> = {};
    if (params.search) {
        where.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } },
        ];
    }
    if (params.role) {
        where.role = params.role;
    }

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
            },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
    };
}

export async function createUser(data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    is_active: boolean;
}) {
    await requireAdmin();

    const parsed = userSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const existing = await prisma.user.findUnique({
        where: { email: parsed.data.email },
    });
    if (existing) {
        return { error: "Email already exists" };
    }

    const password_hash = await bcrypt.hash(
        parsed.data.password || "Password123",
        12
    );

    await prisma.user.create({
        data: {
            name: parsed.data.name,
            email: parsed.data.email,
            password_hash,
            role: parsed.data.role,
            is_active: parsed.data.is_active,
        },
    });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function updateUser(
    id: string,
    data: {
        name: string;
        email: string;
        password?: string;
        role: string;
        is_active: boolean;
    }
) {
    await requireAdmin();

    const parsed = userSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const updateData: Record<string, unknown> = {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        is_active: parsed.data.is_active,
    };

    if (parsed.data.password) {
        updateData.password_hash = await bcrypt.hash(parsed.data.password, 12);
    }

    await prisma.user.update({ where: { id }, data: updateData });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function toggleUserActive(id: string) {
    await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { error: "User not found" };

    await prisma.user.update({
        where: { id },
        data: { is_active: !user.is_active },
    });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(id: string) {
    await requireAdmin();
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
}
