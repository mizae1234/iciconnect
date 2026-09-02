import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";
import { departmentSchema } from "@/lib/constants";

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
        const parsed = departmentSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const updated = await prisma.department.update({
            where: { id },
            data: {
                code: parsed.data.code,
                name: parsed.data.name,
                name_en: parsed.data.name_en || null,
                parent_id: parsed.data.parent_id || null,
                head_id: parsed.data.head_id || null,
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

        const employeeCount = await prisma.employee.count({ where: { department_id: id } });
        if (employeeCount > 0) {
            return apiError(`ไม่สามารถลบได้ — มีพนักงานสังกัดแผนกนี้ ${employeeCount} คน`, 400);
        }

        await prisma.department.delete({ where: { id } });
        return apiResponse({ message: "ลบแผนกสำเร็จ" });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
