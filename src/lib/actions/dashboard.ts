"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getDashboardStats() {
    await requireAdmin();

    const [totalUsers, activeUsers, totalApps, activeApps, totalAnnouncements, activeAnnouncements] =
        await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { is_active: true } }),
            prisma.application.count(),
            prisma.application.count({ where: { is_active: true } }),
            prisma.announcement.count(),
            prisma.announcement.count({ where: { is_active: true } }),
        ]);

    // Role breakdown
    const roleBreakdown = await prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
    });

    return {
        totalUsers,
        activeUsers,
        totalApps,
        activeApps,
        totalAnnouncements,
        activeAnnouncements,
        roleBreakdown: roleBreakdown.map((r) => ({
            role: r.role,
            count: r._count.role,
        })),
    };
}
