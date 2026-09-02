import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";
import { userSchema } from "@/lib/constants";
import bcrypt from "bcryptjs";

export async function OPTIONS() {
    return handleOptions();
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = userSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const updateData: Record<string, unknown> = {
            name: parsed.data.name,
            email: parsed.data.email,
            role: parsed.data.role,
            is_active: parsed.data.is_active ?? true,
        };

        if (parsed.data.password) {
            updateData.password_hash = await bcrypt.hash(parsed.data.password, 12);
        }

        const updated = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_active: true,
                created_at: true,
            },
        });

        return apiResponse(updated);
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const announcementCount = await prisma.announcement.count({ where: { created_by: id } });
        if (announcementCount > 0) {
            return apiError(`ไม่สามารถลบได้ — เป็นผู้สร้างประกาศ ${announcementCount} รายการ`, 400);
        }

        await prisma.user.delete({ where: { id } });
        return apiResponse({ message: "ลบผู้ใช้สำเร็จ" });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
