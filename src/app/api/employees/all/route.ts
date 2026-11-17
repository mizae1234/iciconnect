import { prisma } from "@/lib/prisma";
import { apiResponse, apiCatchError, handleOptions } from "@/lib/api-helper";
import { requireApiKey } from "@/lib/auth";

export async function OPTIONS() {
    return handleOptions();
}

/**
 * GET /api/employees/all
 * Returns all employees (no pagination) without internal UUIDs.
 * Auth: Bearer API Key (server-to-server)
 *
 * Query params:
 *   - status: filter by employment_status (ACTIVE, PROBATION, RESIGNED, TERMINATED)
 *   - department_code (or department): filter by department code (e.g. IT) or name
 *   - position_code (or position): filter by position code (e.g. STAFF) or name
 *   - employee_code: filter by employee code (e.g. ICI96)
 *   - include: comma-separated relations to include (department,position,supervisor)
 */
export async function GET(request: Request) {
    try {
        await requireApiKey();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status")?.trim() || "";
        const departmentCode =
            (searchParams.get("department_code") || searchParams.get("department"))?.trim() || "";
        const positionCode =
            (searchParams.get("position_code") || searchParams.get("position"))?.trim() || "";
        const employeeCode = searchParams.get("employee_code")?.trim() || "";
        const includeParam = searchParams.get("include") || "";

        const where: Record<string, unknown> = {};
        if (status) {
            where.employment_status = status.toUpperCase();
        }
        if (employeeCode) {
            where.employee_code = { equals: employeeCode, mode: "insensitive" };
        }
        if (departmentCode) {
            where.department = {
                OR: [
                    { code: { equals: departmentCode, mode: "insensitive" } },
                    { name: { contains: departmentCode, mode: "insensitive" } },
                    { name_en: { contains: departmentCode, mode: "insensitive" } },
                ],
            };
        }
        if (positionCode) {
            where.position = {
                OR: [
                    { code: { equals: positionCode, mode: "insensitive" } },
                    { name: { contains: positionCode, mode: "insensitive" } },
                ],
            };
        }

        // Build dynamic includes based on query param (defaults to all relations if not specified)
        const includeFields = includeParam
            ? includeParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
            : ["department", "position", "supervisor"];

        const include: Record<string, unknown> = {};
        if (includeFields.includes("department")) {
            include.department = {
                select: {
                    code: true,
                    name: true,
                    name_en: true,
                    head: {
                        select: {
                            employee_code: true,
                            first_name: true,
                            last_name: true,
                            nickname: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            };
        }
        if (includeFields.includes("position")) {
            include.position = { select: { code: true, name: true } };
        }
        if (includeFields.includes("supervisor")) {
            include.supervisor = {
                select: {
                    employee_code: true,
                    first_name: true,
                    last_name: true,
                    nickname: true,
                    email: true,
                    phone: true,
                },
            };
        }

        const employees = await prisma.employee.findMany({
            where,
            orderBy: { employee_code: "asc" },
            select: {
                employee_code: true,
                first_name: true,
                last_name: true,
                nickname: true,
                phone: true,
                email: true,
                avatar_url: true,
                hire_date: true,
                employment_status: true,
                roomReservable: true,
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
