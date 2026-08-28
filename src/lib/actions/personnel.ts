"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { employeeSchema } from "@/lib/constants";

// ─── GET: ดึงข้อมูลรวม Employee + User-only ──────────────

export async function getPersonnel(params: {
    page?: number;
    search?: string;
    department_id?: string;
    position_id?: string;
    employment_status?: string;
}) {
    await requireAdmin();
    const page = params.page || 1;
    const pageSize = 10;

    // 1) Query employees (พร้อม user ที่เชื่อมอยู่)
    const empWhere: Record<string, unknown> = {};
    if (params.search) {
        empWhere.OR = [
            { first_name: { contains: params.search, mode: "insensitive" } },
            { last_name: { contains: params.search, mode: "insensitive" } },
            { nickname: { contains: params.search, mode: "insensitive" } },
            { employee_code: { contains: params.search, mode: "insensitive" } },
            { phone: { contains: params.search, mode: "insensitive" } },
            { user: { email: { contains: params.search, mode: "insensitive" } } },
        ];
    }
    if (params.department_id) empWhere.department_id = params.department_id;
    if (params.position_id) empWhere.position_id = params.position_id;
    if (params.employment_status) empWhere.employment_status = params.employment_status;

    // 2) Query users ที่ไม่มี Employee (User-only)
    const userOnlyWhere: Record<string, unknown> = { employee: null };
    if (params.search) {
        userOnlyWhere.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } },
        ];
    }
    // ถ้ากรองด้วย department/position/status → ไม่แสดง user-only (เพราะไม่มีข้อมูลเหล่านั้น)
    const showUserOnly = !params.department_id && !params.position_id && !params.employment_status;

    const [employees, empTotal, userOnlyList, userOnlyTotal] = await Promise.all([
        prisma.employee.findMany({
            where: empWhere,
            orderBy: { created_at: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                department: { select: { id: true, name: true, code: true } },
                position: { select: { id: true, name: true, code: true } },
                supervisor: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
                user: { select: { id: true, name: true, email: true, role: true, is_active: true } },
            },
        }),
        prisma.employee.count({ where: empWhere }),
        showUserOnly
            ? prisma.user.findMany({
                  where: userOnlyWhere,
                  orderBy: { created_at: "desc" },
                  select: { id: true, name: true, email: true, role: true, is_active: true, created_at: true },
              })
            : Promise.resolve([]),
        showUserOnly ? prisma.user.count({ where: userOnlyWhere }) : Promise.resolve(0),
    ]);

    // 3) รวมเป็น unified list
    type PersonnelRow = {
        type: "employee" | "user_only";
        id: string;
        employee_code: string | null;
        first_name: string;
        last_name: string;
        nickname: string | null;
        phone: string | null;
        extension: string | null;
        hire_date: Date | null;
        employment_status: string | null;
        department: { id: string; name: string; code: string } | null;
        position: { id: string; name: string; code: string } | null;
        supervisor: { id: string; first_name: string; last_name: string; employee_code: string } | null;
        user_id: string | null;
        user_email: string | null;
        user_role: string | null;
        user_is_active: boolean | null;
        user_name: string | null;
        department_id: string | null;
        position_id: string | null;
        supervisor_id: string | null;
        avatar_url: string | null;
    };

    const personnel: PersonnelRow[] = [];

    for (const emp of employees) {
        personnel.push({
            type: "employee",
            id: emp.id,
            employee_code: emp.employee_code,
            first_name: emp.first_name,
            last_name: emp.last_name,
            nickname: emp.nickname,
            phone: emp.phone,
            extension: emp.extension,
            hire_date: emp.hire_date,
            employment_status: emp.employment_status,
            department: emp.department,
            position: emp.position,
            supervisor: emp.supervisor,
            user_id: emp.user_id,
            user_email: emp.user?.email ?? null,
            user_role: emp.user?.role ?? null,
            user_is_active: emp.user?.is_active ?? null,
            user_name: emp.user?.name ?? null,
            department_id: emp.department_id,
            position_id: emp.position_id,
            supervisor_id: emp.supervisor_id,
            avatar_url: emp.avatar_url,
        });
    }

    // Append user-only records (only on page 1 or when there's room)
    if (showUserOnly) {
        for (const u of userOnlyList) {
            personnel.push({
                type: "user_only",
                id: u.id, // user id
                employee_code: null,
                first_name: u.name,
                last_name: "",
                nickname: null,
                phone: null,
                extension: null,
                hire_date: null,
                employment_status: null,
                department: null,
                position: null,
                supervisor: null,
                user_id: u.id,
                user_email: u.email,
                user_role: u.role,
                user_is_active: u.is_active,
                user_name: u.name,
                department_id: null,
                position_id: null,
                supervisor_id: null,
                avatar_url: null,
            });
        }
    }

    const total = empTotal + userOnlyTotal;

    return {
        personnel,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
        page,
    };
}

// ─── CREATE: สร้างพนักงาน + บัญชี (optional) ─────────────

export async function createPersonnel(data: {
    employee_code: string;
    first_name: string;
    last_name: string;
    nickname?: string | null;
    phone?: string | null;
    extension?: string | null;
    avatar_url?: string | null;
    hire_date?: string | null;
    employment_status: string;
    department_id?: string | null;
    position_id?: string | null;
    supervisor_id?: string | null;
    // User fields
    create_account: boolean;
    email?: string | null;
    password?: string | null;
    role?: string | null;
}) {
    await requireAdmin();

    const parsed = employeeSchema.safeParse(data);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Check unique employee code
    const existingEmp = await prisma.employee.findUnique({
        where: { employee_code: parsed.data.employee_code },
    });
    if (existingEmp) {
        return { error: "รหัสพนักงานนี้มีอยู่แล้ว" };
    }

    let userId: string | null = null;

    // Create user account if requested
    if (data.create_account) {
        if (!data.email) {
            return { error: "กรุณากรอกอีเมลสำหรับบัญชีเข้าระบบ" };
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            return { error: "อีเมลนี้มีอยู่ในระบบแล้ว" };
        }

        const password_hash = await bcrypt.hash(data.password || "Password123", 12);
        const user = await prisma.user.create({
            data: {
                name: `${parsed.data.first_name} ${parsed.data.last_name}`,
                email: data.email,
                password_hash,
                role: (data.role as "SUPER_ADMIN" | "ADMIN" | "HR" | "IT" | "MANAGER" | "EMPLOYEE") || "EMPLOYEE",
                is_active: true,
            },
        });
        userId = user.id;
    }

    await prisma.employee.create({
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
            user_id: userId,
            department_id: parsed.data.department_id || null,
            position_id: parsed.data.position_id || null,
            supervisor_id: parsed.data.supervisor_id || null,
        },
    });

    revalidatePath("/admin/personnel");
    return { success: true };
}

// ─── UPDATE: แก้ไขพนักงาน + บัญชี ────────────────────────

export async function updatePersonnel(
    id: string,
    type: "employee" | "user_only",
    data: {
        employee_code?: string;
        first_name: string;
        last_name: string;
        nickname?: string | null;
        phone?: string | null;
        extension?: string | null;
        avatar_url?: string | null;
        hire_date?: string | null;
        employment_status?: string;
        department_id?: string | null;
        position_id?: string | null;
        supervisor_id?: string | null;
        // User fields
        user_id?: string | null;
        email?: string | null;
        password?: string | null;
        role?: string | null;
        user_is_active?: boolean;
    }
) {
    await requireAdmin();

    if (type === "user_only") {
        // Only update user
        if (!data.email) return { error: "กรุณากรอกอีเมล" };

        const existingEmail = await prisma.user.findFirst({
            where: { email: data.email, id: { not: id } },
        });
        if (existingEmail) return { error: "อีเมลนี้มีอยู่ในระบบแล้ว" };

        const updateData: Record<string, unknown> = {
            name: data.first_name,
            email: data.email,
            role: data.role || "EMPLOYEE",
            is_active: data.user_is_active ?? true,
        };
        if (data.password) {
            updateData.password_hash = await bcrypt.hash(data.password, 12);
        }

        await prisma.user.update({ where: { id }, data: updateData });
        revalidatePath("/admin/personnel");
        return { success: true };
    }

    // type === "employee"
    if (!data.employee_code) return { error: "กรุณากรอกรหัสพนักงาน" };

    // Check unique employee code
    const existingEmp = await prisma.employee.findFirst({
        where: { employee_code: data.employee_code, id: { not: id } },
    });
    if (existingEmp) return { error: "รหัสพนักงานนี้มีอยู่แล้ว" };

    // Prevent self as supervisor
    if (data.supervisor_id === id) return { error: "ไม่สามารถกำหนดตัวเองเป็นหัวหน้าได้" };

    // Update employee
    await prisma.employee.update({
        where: { id },
        data: {
            employee_code: data.employee_code,
            first_name: data.first_name,
            last_name: data.last_name,
            nickname: data.nickname || null,
            phone: data.phone || null,
            extension: data.extension || null,
            avatar_url: data.avatar_url || null,
            hire_date: data.hire_date ? new Date(data.hire_date) : null,
            employment_status: (data.employment_status || "ACTIVE") as "ACTIVE" | "PROBATION" | "RESIGNED" | "TERMINATED",
            department_id: data.department_id || null,
            position_id: data.position_id || null,
            supervisor_id: data.supervisor_id || null,
        },
    });

    // Update linked user if exists
    if (data.user_id) {
        const updateData: Record<string, unknown> = {
            name: `${data.first_name} ${data.last_name}`,
        };
        if (data.email) {
            const existingEmail = await prisma.user.findFirst({
                where: { email: data.email, id: { not: data.user_id } },
            });
            if (existingEmail) return { error: "อีเมลนี้มีอยู่ในระบบแล้ว" };
            updateData.email = data.email;
        }
        if (data.role) updateData.role = data.role;
        if (data.user_is_active !== undefined) updateData.is_active = data.user_is_active;
        if (data.password) {
            updateData.password_hash = await bcrypt.hash(data.password, 12);
        }

        await prisma.user.update({ where: { id: data.user_id }, data: updateData });
    }

    revalidatePath("/admin/personnel");
    return { success: true };
}

// ─── DELETE: ลบพนักงาน (+ User ถ้ามี) ────────────────────

export async function deletePersonnel(id: string, type: "employee" | "user_only") {
    await requireAdmin();

    if (type === "user_only") {
        // Check if user has announcements
        const announcementCount = await prisma.announcement.count({
            where: { created_by: id },
        });
        if (announcementCount > 0) {
            return { error: `ไม่สามารถลบได้ — เป็นผู้สร้างประกาศ ${announcementCount} รายการ` };
        }

        await prisma.user.delete({ where: { id } });
        revalidatePath("/admin/personnel");
        return { success: true };
    }

    // type === "employee"
    // Check dependencies
    const subordinateCount = await prisma.employee.count({
        where: { supervisor_id: id },
    });
    if (subordinateCount > 0) {
        return { error: `ไม่สามารถลบได้ — เป็นหัวหน้าของพนักงาน ${subordinateCount} คน` };
    }

    const headOf = await prisma.department.findFirst({
        where: { head_id: id },
    });
    if (headOf) {
        return { error: `ไม่สามารถลบได้ — เป็นหัวหน้าแผนก "${headOf.name}"` };
    }

    // Get employee to check user link
    const employee = await prisma.employee.findUnique({
        where: { id },
        select: { user_id: true },
    });

    // Delete employee first (remove FK), then user
    await prisma.employee.delete({ where: { id } });

    if (employee?.user_id) {
        // Check if user has other dependencies
        const announcementCount = await prisma.announcement.count({
            where: { created_by: employee.user_id },
        });
        if (announcementCount === 0) {
            await prisma.user.delete({ where: { id: employee.user_id } });
        }
        // If has announcements, keep user but it's now unlinked
    }

    revalidatePath("/admin/personnel");
    return { success: true };
}

// ─── Helpers ──────────────────────────────────────────────

export async function getNextEmployeeCode() {
    await requireAdmin();
    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { employee_code: "desc" },
        select: { employee_code: true },
    });

    if (!lastEmployee) return "ICI-0001";

    const match = lastEmployee.employee_code.match(/ICI-(\d+)/);
    if (!match) return "ICI-0001";

    const nextNum = parseInt(match[1]) + 1;
    return `ICI-${String(nextNum).padStart(4, "0")}`;
}
