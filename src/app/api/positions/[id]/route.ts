import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";
import { positionSchema } from "@/lib/constants";

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
        const parsed = positionSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const updated = await prisma.position.update({
            where: { id },
            data: {
                code: parsed.data.code,
                name: parsed.data.name,
                level: parsed.data.level ?? 0,
                is_active: parsed.data.is_active ?? true,
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

        const employeeCount = await prisma.employee.count({ where: { position_id: id } });
        if (employeeCount > 0) {
            return apiError(`ไม่สามารถลบได้ — มีพนักงานในตำแหน่งนี้ ${employeeCount} คน`, 400);
        }

        await prisma.position.delete({ where: { id } });
        return apiResponse({ message: "ลบตำแหน่งสำเร็จ" });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
