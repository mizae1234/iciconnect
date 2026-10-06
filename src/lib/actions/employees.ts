"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { employeeSchema } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getEmployees(params: {
    page?: number;
    search?: string;
    department_id?: string;
    position_id?: string;
    employment_status?: string;
}) {
    await requireAdmin();
    const page = params.page || 1;
    const pageSize = 10;

    const where: Record<string, unknown> = {};
    if (params.search) {
        where.OR = [
            { first_name: { contains: params.search, mode: "insensitive" } },
            { last_name: { contains: params.search, mode: "insensitive" } },
            { nickname: { contains: params.search, mode: "insensitive" } },
            { employee_code: { contains: params.search, mode: "insensitive" } },
            { phone: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } },
        ];
    }
    if (params.department_id) {
        where.department_id = params.department_id;
    }
    if (params.position_id) {
        where.position_id = params.position_id;
    }
    if (params.employment_status) {
        where.employment_status = params.employment_status;
    }

    const [employees, total] = await Promise.all([
        prisma.employee.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                department: {
                    select: { id: true, name: true, name_en: true, code: true },
                },
                position: {
                    select: { id: true, name: true, code: true },
                },
                supervisor: {
                    select: { id: true, first_name: true, last_name: true, nickname: true, employee_code: true },
                },
                user: {
                    select: { id: true, name: true, email: true, role: true, is_active: true },
                },
            },
        }),
        prisma.employee.count({ where }),
    ]);

    return {
        employees,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
    };
}

export async function getEmployeesList() {
    await requireAdmin();
    return prisma.employee.findMany({
        where: { employment_status: "ACTIVE" },
        select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            nickname: true,
        },
        orderBy: { first_name: "asc" },
    });
}

export async function getUnlinkedUsers() {
    await requireAdmin();
    return prisma.user.findMany({
        where: {
            employee: null,
            is_active: true,
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
    });
}

export async function getNextEmployeeCode() {
    await requireAdmin();
    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { employee_code: "desc" },
        select: { employee_code: true },
    });

    if (!lastEmployee) {
        return "ICI-0001";
    }

    const match = lastEmployee.employee_code.match(/ICI-(\d+)/);
    if (!match) {
        return "ICI-0001";
    }

    const nextNum = parseInt(match[1]) + 1;
    return `ICI-${String(nextNum).padStart(4, "0")}`;
}

export async function createEmployee(data: {
    employee_code: string;
    first_name: string;
    last_name: string;
    nickname?: string | null;
    phone?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    hire_date?: string | null;
    employment_status: string;
    user_id?: string | null;
    department_id?: string | null;
    position_id?: string | null;
    supervisor_id?: string | null;
    create_new_user?: boolean;
    user_email?: string | null;
    user_password?: string | null;
    user_role?: string | null;
}) {
    await requireAdmin();

    const parsed = employeeSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Check unique employee code
    const existing = await prisma.employee.findUnique({
        where: { employee_code: parsed.data.employee_code },
    });
    if (existing) {
        return { error: "รหัสพนักงานนี้มีอยู่แล้ว" };
    }

    let finalUserId = parsed.data.user_id || null;

    // Handle auto user creation
    if (parsed.data.create_new_user) {
        const email = parsed.data.user_email?.trim().toLowerCase();
        if (!email) {
            return { error: "กรุณาระบุอีเมลสำหรับเข้าสู่ระบบ" };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { error: "รูปแบบอีเมลไม่ถูกต้อง" };
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return { error: `อีเมล ${email} มีผู้ใช้งานในระบบแล้ว` };
        }

        const rawPassword = parsed.data.user_password?.trim() || "Password123";
        if (rawPassword.length < 6) {
            return { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" };
        }

        const password_hash = await bcrypt.hash(rawPassword, 12);
        const fullName = `${parsed.data.first_name} ${parsed.data.last_name}`;

        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                email,
                password_hash,
                role: (parsed.data.user_role as any) || "EMPLOYEE",
                is_active: true,
            },
        });
        finalUserId = newUser.id;
    } else if (finalUserId) {
        // Check if user is already linked
        const linkedEmployee = await prisma.employee.findUnique({
            where: { user_id: finalUserId },
        });
        if (linkedEmployee) {
            return { error: "บัญชีผู้ใช้นี้ถูกเชื่อมกับพนักงานอื่นแล้ว" };
        }
    }

    await prisma.employee.create({
        data: {
            employee_code: parsed.data.employee_code,
            first_name: parsed.data.first_name,
            last_name: parsed.data.last_name,
            nickname: parsed.data.nickname || null,
            phone: parsed.data.phone || null,
            email: parsed.data.email || null,
            avatar_url: parsed.data.avatar_url || null,
            hire_date: parsed.data.hire_date ? new Date(parsed.data.hire_date) : null,
            employment_status: parsed.data.employment_status,
            user_id: finalUserId,
            department_id: parsed.data.department_id || null,
            position_id: parsed.data.position_id || null,
            supervisor_id: parsed.data.supervisor_id || null,
        },
    });

    revalidatePath("/admin/employees");
    return { success: true };
}

export async function updateEmployee(
    id: string,
    data: {
        employee_code: string;
        first_name: string;
        last_name: string;
        nickname?: string | null;
        phone?: string | null;
        email?: string | null;
        avatar_url?: string | null;
        hire_date?: string | null;
        employment_status: string;
        user_id?: string | null;
        department_id?: string | null;
        position_id?: string | null;
        supervisor_id?: string | null;
        create_new_user?: boolean;
        user_email?: string | null;
        user_password?: string | null;
        user_role?: string | null;
    }
) {
    await requireAdmin();

    const parsed = employeeSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Check unique employee code (exclude self)
    const existing = await prisma.employee.findFirst({
        where: { employee_code: parsed.data.employee_code, id: { not: id } },
    });
    if (existing) {
        return { error: "รหัสพนักงานนี้มีอยู่แล้ว" };
    }

    let finalUserId = parsed.data.user_id || null;

    // Handle auto user creation when editing
    if (parsed.data.create_new_user) {
        const email = parsed.data.user_email?.trim().toLowerCase();
        if (!email) {
            return { error: "กรุณาระบุอีเมลสำหรับเข้าสู่ระบบ" };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { error: "รูปแบบอีเมลไม่ถูกต้อง" };
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return { error: `อีเมล ${email} มีผู้ใช้งานในระบบแล้ว` };
        }

        const rawPassword = parsed.data.user_password?.trim() || "Password123";
        if (rawPassword.length < 6) {
            return { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" };
        }

        const password_hash = await bcrypt.hash(rawPassword, 12);
        const fullName = `${parsed.data.first_name} ${parsed.data.last_name}`;

        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                email,
                password_hash,
                role: (parsed.data.user_role as any) || "EMPLOYEE",
                is_active: true,
            },
        });
        finalUserId = newUser.id;
    } else if (finalUserId) {
        // Check user link (exclude self)
        const linkedEmployee = await prisma.employee.findFirst({
            where: { user_id: finalUserId, id: { not: id } },
        });
        if (linkedEmployee) {
            return { error: "บัญชีผู้ใช้นี้ถูกเชื่อมกับพนักงานอื่นแล้ว" };
        }
    }

    // Prevent self as supervisor
    if (parsed.data.supervisor_id === id) {
        return { error: "ไม่สามารถกำหนดตัวเองเป็นหัวหน้าได้" };
    }

    await prisma.employee.update({
        where: { id },
        data: {
            employee_code: parsed.data.employee_code,
            first_name: parsed.data.first_name,
            last_name: parsed.data.last_name,
            nickname: parsed.data.nickname || null,
            phone: parsed.data.phone || null,
            email: parsed.data.email || null,
            avatar_url: parsed.data.avatar_url || null,
            hire_date: parsed.data.hire_date ? new Date(parsed.data.hire_date) : null,
            employment_status: parsed.data.employment_status,
            user_id: finalUserId,
            department_id: parsed.data.department_id || null,
            position_id: parsed.data.position_id || null,
            supervisor_id: parsed.data.supervisor_id || null,
        },
    });

    revalidatePath("/admin/employees");
    return { success: true };
}

export async function deleteEmployee(id: string) {
    await requireAdmin();

    try {
        await prisma.$transaction([
            // ถอดหัวหน้าแผนก (ถ้ามี)
            prisma.department.updateMany({ where: { head_id: id }, data: { head_id: null } }),
            // ถอดหัวหน้าของลูกน้อง (ถ้ามี)
            prisma.employee.updateMany({ where: { supervisor_id: id }, data: { supervisor_id: null } }),
            // ลบพนักงาน
            prisma.employee.delete({ where: { id } }),
        ]);
    } catch {
        return { error: "ไม่สามารถลบพนักงานได้ — กรุณาลองใหม่อีกครั้ง" };
    }

    revalidatePath("/admin/employees");
    return { success: true };
}

export interface ImportEmployeeItem {
    employee_code?: string | null;
    first_name: string;
    last_name: string;
    nickname?: string | null;
    email?: string | null;
    phone?: string | null;
    department_raw?: string | null;
    position_raw?: string | null;
    hire_date?: string | null;
    employment_status?: string | null;
    user_role?: string | null;
}

export interface ImportEmployeesResult {
    success: boolean;
    total: number;
    importedCount: number;
    createdUsersCount: number;
    errors: Array<{
        row?: number;
        code?: string;
        name: string;
        reason: string;
    }>;
}

export async function importEmployees(
    items: ImportEmployeeItem[],
    options?: {
        createAccounts?: boolean;
        defaultPassword?: string;
    }
): Promise<ImportEmployeesResult> {
    await requireAdmin();

    const [departments, positions, existingEmployees, existingUsers] = await Promise.all([
        prisma.department.findMany({
            select: { id: true, code: true, name: true, name_en: true },
        }),
        prisma.position.findMany({
            select: { id: true, code: true, name: true },
        }),
        prisma.employee.findMany({
            select: { id: true, employee_code: true, email: true },
        }),
        prisma.user.findMany({
            select: { id: true, email: true, employee: { select: { id: true } } },
        }),
    ]);

    // Build lookup maps
    const usedCodes = new Set(
        existingEmployees.map((e) => e.employee_code.toLowerCase().trim())
    );

    let maxCodeNum = 0;
    for (const emp of existingEmployees) {
        const m = emp.employee_code.match(/ICI-(\d+)/i);
        if (m) {
            const num = parseInt(m[1], 10);
            if (!isNaN(num) && num > maxCodeNum) {
                maxCodeNum = num;
            }
        }
    }

    // Department matchers
    const deptMap = new Map<string, string>();
    for (const d of departments) {
        deptMap.set(d.code.toLowerCase().trim(), d.id);
        deptMap.set(d.name.toLowerCase().trim(), d.id);
        if (d.name_en) {
            deptMap.set(d.name_en.toLowerCase().trim(), d.id);
        }
    }

    // Position matchers
    const posMap = new Map<string, string>();
    for (const p of positions) {
        posMap.set(p.code.toLowerCase().trim(), p.id);
        posMap.set(p.name.toLowerCase().trim(), p.id);
    }

    // User email matchers
    const userEmailMap = new Map<
        string,
        { id: string; hasEmployee: boolean }
    >();
    for (const u of existingUsers) {
        userEmailMap.set(u.email.toLowerCase().trim(), {
            id: u.id,
            hasEmployee: Boolean(u.employee),
        });
    }

    const defaultPassword = options?.defaultPassword?.trim() || "Password123";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    function mapStatus(raw?: string | null): "ACTIVE" | "PROBATION" | "RESIGNED" | "TERMINATED" {
        if (!raw) return "ACTIVE";
        const s = raw.trim().toUpperCase();
        if (s === "PROBATION" || s.includes("ทดลองงาน")) return "PROBATION";
        if (s === "RESIGNED" || s.includes("ลาออก")) return "RESIGNED";
        if (s === "TERMINATED" || s.includes("พ้นสภาพ")) return "TERMINATED";
        return "ACTIVE";
    }

    function mapRole(raw?: string | null): "SUPER_ADMIN" | "ADMIN" | "HR" | "IT" | "MANAGER" | "EMPLOYEE" {
        if (!raw) return "EMPLOYEE";
        const r = raw.trim().toUpperCase();
        if (r.includes("SUPER_ADMIN") || r.includes("สูงสุด")) return "SUPER_ADMIN";
        if (r.includes("ADMIN") || r.includes("ผู้ดูแลระบบ")) return "ADMIN";
        if (r.includes("HR") || r.includes("บุคคล")) return "HR";
        if (r.includes("IT") || r.includes("ไอที")) return "IT";
        if (r.includes("MANAGER") || r.includes("ผู้จัดการ")) return "MANAGER";
        return "EMPLOYEE";
    }

    let importedCount = 0;
    let createdUsersCount = 0;
    const errors: Array<{ row?: number; code?: string; name: string; reason: string }> = [];

    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const rowNumber = index + 1;
        const fullName = `${item.first_name || ""} ${item.last_name || ""}`.trim() || `แถวที่ ${rowNumber}`;

        if (!item.first_name?.trim() || !item.last_name?.trim()) {
            errors.push({
                row: rowNumber,
                name: fullName,
                reason: "ข้อมูลไม่ครบถ้วน (ต้องมีชื่อและนามสกุล)",
            });
            continue;
        }

        // Determine employee_code
        let code = item.employee_code?.trim() || "";
        if (code) {
            if (usedCodes.has(code.toLowerCase())) {
                errors.push({
                    row: rowNumber,
                    code,
                    name: fullName,
                    reason: `รหัสพนักงาน ${code} มีอยู่ในระบบแล้ว`,
                });
                continue;
            }
            usedCodes.add(code.toLowerCase());
        } else {
            // Auto generate next code
            do {
                maxCodeNum++;
                code = `ICI-${String(maxCodeNum).padStart(4, "0")}`;
            } while (usedCodes.has(code.toLowerCase()));
            usedCodes.add(code.toLowerCase());
        }

        // Find department
        let departmentId: string | null = null;
        if (item.department_raw?.trim()) {
            const raw = item.department_raw.trim().toLowerCase();
            departmentId = deptMap.get(raw) || null;
            if (!departmentId) {
                // Try fuzzy/partial matching if exact match not found
                for (const d of departments) {
                    if (
                        d.name.toLowerCase().includes(raw) ||
                        raw.includes(d.name.toLowerCase()) ||
                        (d.name_en && (d.name_en.toLowerCase().includes(raw) || raw.includes(d.name_en.toLowerCase())))
                    ) {
                        departmentId = d.id;
                        break;
                    }
                }
            }
        }

        // Find position
        let positionId: string | null = null;
        if (item.position_raw?.trim()) {
            const raw = item.position_raw.trim().toLowerCase();
            positionId = posMap.get(raw) || null;
            if (!positionId) {
                for (const p of positions) {
                    if (p.name.toLowerCase().includes(raw) || raw.includes(p.name.toLowerCase())) {
                        positionId = p.id;
                        break;
                    }
                }
            }
        }

        // Parse hire_date
        let hireDate: Date | null = null;
        if (item.hire_date?.trim()) {
            const parsed = new Date(item.hire_date.trim());
            if (!isNaN(parsed.getTime())) {
                hireDate = parsed;
            }
        }

        const cleanEmail = item.email?.trim().toLowerCase() || null;
        let finalUserId: string | null = null;

        // Auto create user account
        if (options?.createAccounts && cleanEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(cleanEmail)) {
                const existingUser = userEmailMap.get(cleanEmail);
                if (!existingUser) {
                    try {
                        const newUser = await prisma.user.create({
                            data: {
                                name: fullName,
                                email: cleanEmail,
                                password_hash: passwordHash,
                                role: mapRole(item.user_role),
                                is_active: true,
                            },
                        });
                        finalUserId = newUser.id;
                        userEmailMap.set(cleanEmail, { id: newUser.id, hasEmployee: true });
                        createdUsersCount++;
                    } catch (e: unknown) {
                        console.error("Failed to create user account for", cleanEmail, e);
                    }
                } else if (!existingUser.hasEmployee) {
                    finalUserId = existingUser.id;
                    existingUser.hasEmployee = true;
                }
            }
        }

        try {
            await prisma.employee.create({
                data: {
                    employee_code: code,
                    first_name: item.first_name.trim(),
                    last_name: item.last_name.trim(),
                    nickname: item.nickname?.trim() || null,
                    phone: item.phone?.trim() || null,
                    email: cleanEmail,
                    hire_date: hireDate,
                    employment_status: mapStatus(item.employment_status),
                    department_id: departmentId,
                    position_id: positionId,
                    user_id: finalUserId,
                },
            });
            importedCount++;
        } catch (err: unknown) {
            const reason = err instanceof Error ? err.message : "ไม่สามารถบันทึกลงฐานข้อมูลได้";
            errors.push({
                row: rowNumber,
                code,
                name: fullName,
                reason,
            });
        }
    }

    revalidatePath("/admin/employees");
    return {
        success: importedCount > 0,
        total: items.length,
        importedCount,
        createdUsersCount,
        errors,
    };
}

