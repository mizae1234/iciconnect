"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { applicationSchema } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/client";

export async function getApplications(params: {
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
            { description: { contains: params.search, mode: "insensitive" } },
        ];
    }

    const [applications, total] = await Promise.all([
        prisma.application.findMany({
            where,
            orderBy: { display_order: "asc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.application.count({ where }),
    ]);

    return {
        applications,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
    };
}

export async function createApplication(data: {
    name: string;
    description: string;
    icon_url: string;
    link_url: string;
    open_type: string;
    display_order: number;
    is_active: boolean;
    allowed_roles: string[];
}) {
    await requireAdmin();

    const parsed = applicationSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    await prisma.application.create({
        data: {
            name: parsed.data.name,
            description: parsed.data.description,
            icon_url: parsed.data.icon_url,
            link_url: parsed.data.link_url,
            open_type: parsed.data.open_type,
            display_order: parsed.data.display_order,
            is_active: parsed.data.is_active,
            allowed_roles: parsed.data.allowed_roles as Role[],
        },
    });

    revalidatePath("/admin/applications");
    revalidatePath("/");
    return { success: true };
}

export async function updateApplication(
    id: string,
    data: {
        name: string;
        description: string;
        icon_url: string;
        link_url: string;
        open_type: string;
        display_order: number;
        is_active: boolean;
        allowed_roles: string[];
    }
) {
    await requireAdmin();

    const parsed = applicationSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    await prisma.application.update({
        where: { id },
        data: {
            name: parsed.data.name,
            description: parsed.data.description,
            icon_url: parsed.data.icon_url,
            link_url: parsed.data.link_url,
            open_type: parsed.data.open_type,
            display_order: parsed.data.display_order,
            is_active: parsed.data.is_active,
            allowed_roles: parsed.data.allowed_roles as Role[],
        },
    });

    revalidatePath("/admin/applications");
    revalidatePath("/");
    return { success: true };
}

export async function toggleApplicationActive(id: string) {
    await requireAdmin();
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return { error: "Application not found" };

    await prisma.application.update({
        where: { id },
        data: { is_active: !app.is_active },
    });

    revalidatePath("/admin/applications");
    revalidatePath("/");
    return { success: true };
}

export async function deleteApplication(id: string) {
    await requireAdmin();
    await prisma.application.delete({ where: { id } });
    revalidatePath("/admin/applications");
    revalidatePath("/");
    return { success: true };
}

export async function getActiveApplicationsForRole(role: string) {
    const apps = await prisma.application.findMany({
        where: {
            is_active: true,
            allowed_roles: { has: role as Role },
        },
        orderBy: { display_order: "asc" },
    });
    return apps;
}
