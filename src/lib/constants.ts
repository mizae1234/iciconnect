import { z } from "zod";

// ─── Roles ───────────────────────────────────────────

export const ROLES = [
    "SUPER_ADMIN",
    "ADMIN",
    "HR",
    "IT",
    "MANAGER",
    "EMPLOYEE",
] as const;

export type RoleType = (typeof ROLES)[number];

export const ROLE_LABELS: Record<RoleType, string> = {
    SUPER_ADMIN: "ผู้ดูแลระบบสูงสุด",
    ADMIN: "ผู้ดูแลระบบ",
    HR: "ฝ่ายบุคคล",
    IT: "ฝ่ายไอที",
    MANAGER: "ผู้จัดการ",
    EMPLOYEE: "พนักงาน",
};

export const ADMIN_ROLES: RoleType[] = ["SUPER_ADMIN", "ADMIN"];

// ─── Announcement Categories ─────────────────────────

export const ANNOUNCEMENT_CATEGORIES = [
    "GENERAL",
    "HR",
    "IT",
    "URGENT",
] as const;

export type AnnouncementCategoryType =
    (typeof ANNOUNCEMENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AnnouncementCategoryType, string> = {
    GENERAL: "ทั่วไป",
    HR: "ฝ่ายบุคคล",
    IT: "ฝ่ายไอที",
    URGENT: "ด่วน",
};

export const CATEGORY_COLORS: Record<AnnouncementCategoryType, string> = {
    GENERAL: "bg-blue-100 text-blue-800 border-blue-200",
    HR: "bg-purple-100 text-purple-800 border-purple-200",
    IT: "bg-cyan-100 text-cyan-800 border-cyan-200",
    URGENT: "bg-red-100 text-red-800 border-red-200",
};

// ─── Open Types ──────────────────────────────────────

export const OPEN_TYPES = ["same_tab", "new_tab"] as const;

export type OpenTypeValue = (typeof OPEN_TYPES)[number];

// ─── Employment Status ───────────────────────────────

export const EMPLOYMENT_STATUSES = [
    "ACTIVE",
    "PROBATION",
    "RESIGNED",
    "TERMINATED",
] as const;

export type EmploymentStatusType = (typeof EMPLOYMENT_STATUSES)[number];

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatusType, string> = {
    ACTIVE: "ทำงานปกติ",
    PROBATION: "ทดลองงาน",
    RESIGNED: "ลาออก",
    TERMINATED: "พ้นสภาพ",
};

export const EMPLOYMENT_STATUS_COLORS: Record<EmploymentStatusType, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    PROBATION: "bg-yellow-100 text-yellow-800 border-yellow-200",
    RESIGNED: "bg-gray-100 text-gray-800 border-gray-200",
    TERMINATED: "bg-red-100 text-red-800 border-red-200",
};

// ─── Validation Schemas ──────────────────────────────

export const loginSchema = z.object({
    email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const userSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อ"),
    email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").optional(),
    role: z.enum(ROLES),
    is_active: z.boolean().default(true),
});

export const applicationSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อ"),
    description: z.string().min(1, "กรุณากรอกรายละเอียด"),
    icon_url: z.string().default(""),
    link_url: z.string().url("กรุณากรอก URL ให้ถูกต้อง"),
    open_type: z.enum(OPEN_TYPES),
    display_order: z.coerce.number().int().min(0),
    is_active: z.boolean().default(true),
    allowed_roles: z.array(z.enum(ROLES)).min(1, "เลือกอย่างน้อย 1 สิทธิ์"),
});

export const announcementSchema = z.object({
    title: z.string().min(1, "กรุณากรอกหัวข้อ"),
    content: z.string().min(1, "กรุณากรอกเนื้อหา"),
    category: z.enum(ANNOUNCEMENT_CATEGORIES),
    is_pinned: z.boolean().default(false),
    start_at: z.string().min(1, "กรุณาระบุวันเริ่มต้น"),
    expire_at: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    target_roles: z.array(z.enum(ROLES)).min(1, "เลือกอย่างน้อย 1 กลุ่มเป้าหมาย"),
    attachment_url: z.string().optional().nullable(),
});

export const departmentSchema = z.object({
    code: z.string().min(1, "กรุณากรอกรหัสแผนก"),
    name: z.string().min(1, "กรุณากรอกชื่อแผนก"),
    name_en: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    parent_id: z.string().optional().nullable(),
    head_id: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
});

export const positionSchema = z.object({
    code: z.string().min(1, "กรุณากรอกรหัสตำแหน่ง"),
    name: z.string().min(1, "กรุณากรอกชื่อตำแหน่ง"),
    level: z.coerce.number().int().min(0),
    is_active: z.boolean().default(true),
});

export const employeeSchema = z.object({
    employee_code: z.string().min(1, "กรุณากรอกรหัสพนักงาน"),
    first_name: z.string().min(1, "กรุณากรอกชื่อ"),
    last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
    nickname: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    extension: z.string().optional().nullable(),
    avatar_url: z.string().optional().nullable(),
    hire_date: z.string().optional().nullable(),
    employment_status: z.enum(EMPLOYMENT_STATUSES),
    user_id: z.string().optional().nullable(),
    department_id: z.string().optional().nullable(),
    position_id: z.string().optional().nullable(),
    supervisor_id: z.string().optional().nullable(),
});

// ─── Types ───────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type PositionInput = z.infer<typeof positionSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
