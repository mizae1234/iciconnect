import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, handleOptions } from "@/lib/api-helper";
import { employeeSchema } from "@/lib/constants";

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                department: true,
                position: true,
                supervisor: true,
                user: true,
            },
        });

        if (!employee) return apiError("ไม่พบข้อมูลพนักงาน", 404);
        return apiResponse(employee);
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = employeeSchema.safeParse(body);
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, 400);
        }

        const updated = await prisma.employee.update({
            where: { id },
            data: {
                employee_code: parsed.data.employee_code,
                first_name: parsed.data.first_name,
                last_name: parsed.data.last_name,
                nickname: parsed.data.nickname || null,
                phone: parsed.data.phone || null,
                extension: parsed.data.extension || null,
                avatar_url: parsed.data.avatar_url || null,
                hire_date: parsed.data.hire_date ? new Date(parsed.data.hire_date) : null,
                employment_status: parsed.data.employment_status,
                user_id: parsed.data.user_id || null,
                department_id: parsed.data.department_id || null,
                position_id: parsed.data.position_id || null,
                supervisor_id: parsed.data.supervisor_id || null,
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

        const subordinateCount = await prisma.employee.count({
            where: { supervisor_id: id },
        });
        if (subordinateCount > 0) {
            return apiError(`ไม่สามารถลบได้ — เป็นหัวหน้าของพนักงาน ${subordinateCount} คน`, 400);
        }

        const headOf = await prisma.department.findFirst({
            where: { head_id: id },
        });
        if (headOf) {
            return apiError(`ไม่สามารถลบได้ — เป็นหัวหน้าแผนก "${headOf.name}"`, 400);
        }

        await prisma.employee.delete({ where: { id } });
        return apiResponse({ message: "ลบพนักงานสำเร็จ" });
    } catch (err: unknown) {
        return apiError(err instanceof Error ? err.message : "Internal Server Error", 500);
    }
}
