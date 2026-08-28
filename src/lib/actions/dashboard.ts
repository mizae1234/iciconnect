"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getDashboardStats() {
    await requireAdmin();

    const [totalUsers, activeUsers, totalApps, activeApps, totalAnnouncements, activeAnnouncements, totalEmployees, totalDepartments, totalPositions] =
        await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { is_active: true } }),
            prisma.application.count(),
            prisma.application.count({ where: { is_active: true } }),
            prisma.announcement.count(),
            prisma.announcement.count({ where: { is_active: true } }),
            prisma.employee.count({ where: { employment_status: "ACTIVE" } }),
            prisma.department.count({ where: { is_active: true } }),
            prisma.position.count({ where: { is_active: true } }),
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
        totalEmployees,
        totalDepartments,
        totalPositions,
        roleBreakdown: roleBreakdown.map((r) => ({
            role: r.role,
            count: r._count.role,
        })),
    };
}

