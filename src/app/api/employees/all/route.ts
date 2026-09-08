import { prisma } from "@/lib/prisma";
import { apiResponse, apiCatchError, handleOptions } from "@/lib/api-helper";
import { requireApiKey } from "@/lib/auth";

export async function OPTIONS() {
    return handleOptions();
}

/**
 * GET /api/employees/all
 * Returns all active employees (no pagination).
 * Auth: Bearer API Key (server-to-server)
 *
 * Query params:
 *   - status: filter by employment_status (default: all)
 *   - department_id: filter by department
 *   - include: comma-separated relations to include (department,position,supervisor)
 */
export async function GET(request: Request) {
    try {
        await requireApiKey();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "";
        const departmentId = searchParams.get("department_id") || "";
        const includeParam = searchParams.get("include") || "";

        const where: Record<string, unknown> = {};
        if (status) {
            where.employment_status = status;
        }
        if (departmentId) {
            where.department_id = departmentId;
        }

        // Build dynamic includes based on query param
        const includeFields = includeParam.split(",").map((s) => s.trim()).filter(Boolean);
        const include: Record<string, unknown> = {};
        if (includeFields.includes("department")) {
            include.department = { select: { id: true, name: true, name_en: true, code: true } };
        }
        if (includeFields.includes("position")) {
            include.position = { select: { id: true, name: true, code: true, level: true } };
        }
        if (includeFields.includes("supervisor")) {
            include.supervisor = { select: { id: true, first_name: true, last_name: true, nickname: true, employee_code: true } };
        }

        const employees = await prisma.employee.findMany({
            where,
            orderBy: { employee_code: "asc" },
            select: {
                id: true,
                employee_code: true,
                first_name: true,
                last_name: true,
                nickname: true,
                phone: true,
                extension: true,
                avatar_url: true,
                hire_date: true,
                employment_status: true,
                department_id: true,
                position_id: true,
                supervisor_id: true,
                created_at: true,
                updated_at: true,
                ...include,
            },
        });

        return apiResponse({
            employees,
            total: employees.length,
        });
    } catch (err: unknown) {
        return apiCatchError(err);
    }
}
