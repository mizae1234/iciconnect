"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { announcementSchema } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { Role, AnnouncementCategory } from "@/generated/prisma/client";

export async function getAnnouncements(params: {
    page?: number;
    search?: string;
    category?: string;
}) {
    await requireAdmin();
    const page = params.page || 1;
    const pageSize = 10;

    const where: Record<string, unknown> = {};
    if (params.search) {
        where.OR = [
            { title: { contains: params.search, mode: "insensitive" } },
            { content: { contains: params.search, mode: "insensitive" } },
        ];
    }
    if (params.category) {
        where.category = params.category;
    }

    const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
            where,
            include: { creator: { select: { name: true } } },
            orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.announcement.count({ where }),
    ]);

    return {
        announcements,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
    };
}

export async function createAnnouncement(
    data: {
        title: string;
        content: string;
        category: string;
        is_pinned: boolean;
        start_at: string;
        expire_at?: string | null;
        is_active: boolean;
        target_roles: string[];
        attachment_url?: string | null;
    },
    userId?: string
) {
    const session = await requireAdmin();
    const creatorId = userId || session.id;

    const parsed = announcementSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    await prisma.announcement.create({
        data: {
            title: parsed.data.title,
            content: parsed.data.content,
            category: parsed.data.category as AnnouncementCategory,
            is_pinned: parsed.data.is_pinned,
            start_at: new Date(parsed.data.start_at),
            expire_at: parsed.data.expire_at ? new Date(parsed.data.expire_at) : null,
            is_active: parsed.data.is_active,
            target_roles: parsed.data.target_roles as Role[],
            attachment_url: parsed.data.attachment_url || null,
            created_by: creatorId,
        },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true };
}

export async function updateAnnouncement(
    id: string,
    data: {
        title: string;
        content: string;
        category: string;
        is_pinned: boolean;
        start_at: string;
        expire_at?: string | null;
        is_active: boolean;
        target_roles: string[];
        attachment_url?: string | null;
    }
) {
    await requireAdmin();

    const parsed = announcementSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    await prisma.announcement.update({
        where: { id },
        data: {
            title: parsed.data.title,
            content: parsed.data.content,
            category: parsed.data.category as AnnouncementCategory,
            is_pinned: parsed.data.is_pinned,
            start_at: new Date(parsed.data.start_at),
            expire_at: parsed.data.expire_at ? new Date(parsed.data.expire_at) : null,
            is_active: parsed.data.is_active,
            target_roles: parsed.data.target_roles as Role[],
            attachment_url: parsed.data.attachment_url || null,
        },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true };
}

export async function toggleAnnouncementActive(id: string) {
    await requireAdmin();
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) return { error: "Announcement not found" };

    await prisma.announcement.update({
        where: { id },
        data: { is_active: !ann.is_active },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true };
}

export async function deleteAnnouncement(id: string) {
    await requireAdmin();
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true };
}

export async function getActiveAnnouncementsForRole(role: string) {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
        where: {
            is_active: true,
            start_at: { lte: now },
            target_roles: { has: role as Role },
            OR: [{ expire_at: null }, { expire_at: { gt: now } }],
        },
        include: { creator: { select: { name: true } } },
        orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
    });
    return announcements;
}
