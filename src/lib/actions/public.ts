"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicAnnouncements() {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
        where: {
            is_active: true,
            start_at: { lte: now },
            OR: [{ expire_at: null }, { expire_at: { gt: now } }],
        },
        include: { creator: { select: { name: true } } },
        orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
        take: 10,
    });
    return announcements;
}

export async function getPublicApplications() {
    const apps = await prisma.application.findMany({
        where: { is_active: true },
        orderBy: { display_order: "asc" },
    });
    return apps;
}
