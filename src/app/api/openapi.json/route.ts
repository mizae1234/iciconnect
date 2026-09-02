import { NextResponse } from "next/server";
import { CORS_HEADERS } from "@/lib/api-helper";

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
    const openapiSpec = {
        openapi: "3.0.0",
        info: {
            title: "ICI Connect API",
            description: "ระบบ Intranet และบริหารจัดการข้อมูลองค์กร iCare Insurance (ICI Connect)",
            version: "1.0.0",
            contact: {
                name: "IT Department - iCare Insurance",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local Development Server",
            },
        ],
        tags: [
            { name: "Employees", description: "จัดการข้อมูลพนักงาน (Employee Management)" },
            { name: "Departments", description: "จัดการแผนกและฝ่าย (Department Management)" },
            { name: "Positions", description: "จัดการตำแหน่งงาน (Position Management)" },
            { name: "Users", description: "จัดการผู้ใช้งานและสิทธิ์ (User & Role Management)" },
            { name: "Applications", description: "จัดการแอปพลิเคชันภายใน (Application Catalog)" },
            { name: "Announcements", description: "จัดการข่าวสารและประกาศ (Announcements)" },
            { name: "Upload", description: "อัปโหลดไฟล์และรูปภาพ (File Upload)" },
        ],
        paths: {
            "/api/employees": {
                get: {
                    tags: ["Employees"],
                    summary: "ดึงรายชื่อพนักงานทั้งหมด (พร้อม Pagination & Filter)",
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "หน้า" },
                        { name: "search", in: "query", schema: { type: "string" }, description: "ค้นหาตามชื่อ/รหัส/เบอร์โทร" },
                        { name: "department_id", in: "query", schema: { type: "string" }, description: "กรองตามแผนก" },
                        { name: "position_id", in: "query", schema: { type: "string" }, description: "กรองตามตำแหน่ง" },
                        { name: "employment_status", in: "query", schema: { type: "string", enum: ["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED"] }, description: "กรองตามสถานะการจ้าง" },
                    ],
                    responses: {
                        200: {
                            description: "ดึงข้อมูลสำเร็จ",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            employees: { type: "array", items: { $ref: "#/components/schemas/Employee" } },
                                            total: { type: "integer" },
                                            totalPages: { type: "integer" },
                                            page: { type: "integer" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Employees"],
                    summary: "เพิ่มพนักงานใหม่",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreateEmployeeInput" },
                            },
                        },
                    },
                    responses: {
                        201: { description: "สร้างสำเร็จ", content: { "application/json": { schema: { $ref: "#/components/schemas/Employee" } } } },
                        400: { description: "ข้อมูลไม่ถูกต้อง" },
                    },
                },
            },
            "/api/employees/{id}": {
                get: {
                    tags: ["Employees"],
                    summary: "ดึงข้อมูลพนักงานรายบุคคล",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: {
                        200: { description: "พบข้อมูล", content: { "application/json": { schema: { $ref: "#/components/schemas/Employee" } } } },
                        404: { description: "ไม่พบข้อมูล" },
                    },
                },
                put: {
                    tags: ["Employees"],
                    summary: "แก้ไขข้อมูลพนักงาน",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateEmployeeInput" } } },
                    },
                    responses: {
                        200: { description: "แก้ไขสำเร็จ" },
                        400: { description: "ข้อมูลไม่ถูกต้อง" },
                    },
                },
                delete: {
                    tags: ["Employees"],
                    summary: "ลบพนักงาน",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: {
                        200: { description: "ลบสำเร็จ" },
                        400: { description: "ไม่สามารถลบได้ (มีลูกน้องหรือเป็นหัวหน้าแผนก)" },
                    },
                },
            },
            "/api/departments": {
                get: {
                    tags: ["Departments"],
                    summary: "ดึงรายชื่อแผนกทั้งหมด",
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                        { name: "search", in: "query", schema: { type: "string" } },
                    ],
                    responses: {
                        200: {
                            description: "สำเร็จ",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            departments: { type: "array", items: { $ref: "#/components/schemas/Department" } },
                                            total: { type: "integer" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Departments"],
                    summary: "เพิ่มแผนกใหม่",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["code", "name"],
                                    properties: {
                                        code: { type: "string", example: "MKT" },
                                        name: { type: "string", example: "ฝ่ายการตลาด" },
                                        name_en: { type: "string", example: "Marketing Department" },
                                        parent_id: { type: "string", nullable: true },
                                        head_id: { type: "string", nullable: true },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "สร้างสำเร็จ" } },
                },
            },
            "/api/departments/{id}": {
                put: {
                    tags: ["Departments"],
                    summary: "แก้ไขแผนก",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["code", "name"],
                                    properties: {
                                        code: { type: "string" },
                                        name: { type: "string" },
                                        name_en: { type: "string" },
                                        parent_id: { type: "string" },
                                        head_id: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "แก้ไขสำเร็จ" } },
                },
                delete: {
                    tags: ["Departments"],
                    summary: "ลบแผนก",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "ลบสำเร็จ" } },
                },
            },
            "/api/positions": {
                get: {
                    tags: ["Positions"],
                    summary: "ดึงรายชื่อตำแหน่งงานทั้งหมด",
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                        { name: "search", in: "query", schema: { type: "string" } },
                    ],
                    responses: { 200: { description: "สำเร็จ" } },
                },
                post: {
                    tags: ["Positions"],
                    summary: "เพิ่มตำแหน่งใหม่",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["code", "name"],
                                    properties: {
                                        code: { type: "string", example: "DEV" },
                                        name: { type: "string", example: "นักพัฒนาระบบ" },
                                        level: { type: "integer", default: 3 },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "สร้างสำเร็จ" } },
                },
            },
            "/api/positions/{id}": {
                put: {
                    tags: ["Positions"],
                    summary: "แก้ไขตำแหน่ง",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        code: { type: "string" },
                                        name: { type: "string" },
                                        level: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "แก้ไขสำเร็จ" } },
                },
                delete: {
                    tags: ["Positions"],
                    summary: "ลบตำแหน่ง",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "ลบสำเร็จ" } },
                },
            },
            "/api/users": {
                get: {
                    tags: ["Users"],
                    summary: "ดึงรายชื่อผู้ใช้ทั้งหมด",
                    parameters: [
                        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                        { name: "search", in: "query", schema: { type: "string" } },
                        { name: "role", in: "query", schema: { type: "string", enum: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"] } },
                    ],
                    responses: { 200: { description: "สำเร็จ" } },
                },
                post: {
                    tags: ["Users"],
                    summary: "สร้างบัญชีผู้ใช้ใหม่",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["name", "email", "password"],
                                    properties: {
                                        name: { type: "string", example: "ทดสอบ ผู้ใช้" },
                                        email: { type: "string", example: "test@icare.com" },
                                        password: { type: "string", example: "Password123" },
                                        role: { type: "string", enum: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"], default: "EMPLOYEE" },
                                        is_active: { type: "boolean", default: true },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "สร้างสำเร็จ" } },
                },
            },
            "/api/users/{id}": {
                put: {
                    tags: ["Users"],
                    summary: "แก้ไขข้อมูลผู้ใช้",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        email: { type: "string" },
                                        password: { type: "string" },
                                        role: { type: "string" },
                                        is_active: { type: "boolean" },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "แก้ไขสำเร็จ" } },
                },
                delete: {
                    tags: ["Users"],
                    summary: "ลบผู้ใช้",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "ลบสำเร็จ" } },
                },
            },
            "/api/applications": {
                get: {
                    tags: ["Applications"],
                    summary: "ดึงรายการแอปพลิเคชันภายใน",
                    responses: { 200: { description: "สำเร็จ" } },
                },
            },
            "/api/announcements": {
                get: {
                    tags: ["Announcements"],
                    summary: "ดึงรายการประกาศและข่าวสาร",
                    responses: { 200: { description: "สำเร็จ" } },
                },
            },
            "/api/upload": {
                post: {
                    tags: ["Upload"],
                    summary: "อัปโหลดไฟล์/รูปภาพไปยัง S3 Storage",
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        files: { type: "string", format: "binary" },
                                        folder: { type: "string", default: "general" },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "อัปโหลดสำเร็จ" } },
                },
            },
        },
        components: {
            schemas: {
                Employee: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        employee_code: { type: "string", example: "ICI-0001" },
                        first_name: { type: "string", example: "วิชัย" },
                        last_name: { type: "string", example: "สุขสมบูรณ์" },
                        nickname: { type: "string", example: "ชัย" },
                        phone: { type: "string", example: "081-111-1111" },
                        extension: { type: "string", example: "1001" },
                        hire_date: { type: "string", format: "date" },
                        employment_status: { type: "string", enum: ["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED"] },
                        department: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } },
                        position: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } },
                        user: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, role: { type: "string" } } },
                    },
                },
                CreateEmployeeInput: {
                    type: "object",
                    required: ["employee_code", "first_name", "last_name", "employment_status"],
                    properties: {
                        employee_code: { type: "string", example: "ICI-0008" },
                        first_name: { type: "string", example: "สมศักดิ์" },
                        last_name: { type: "string", example: "มั่งคั่ง" },
                        nickname: { type: "string", example: "ศักดิ์" },
                        phone: { type: "string", example: "089-999-9999" },
                        extension: { type: "string", example: "3002" },
                        hire_date: { type: "string", format: "date", example: "2026-03-01" },
                        employment_status: { type: "string", enum: ["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED"], default: "ACTIVE" },
                        department_id: { type: "string", nullable: true },
                        position_id: { type: "string", nullable: true },
                        supervisor_id: { type: "string", nullable: true },
                        user_id: { type: "string", nullable: true },
                    },
                },
                UpdateEmployeeInput: {
                    type: "object",
                    required: ["employee_code", "first_name", "last_name", "employment_status"],
                    properties: {
                        employee_code: { type: "string" },
                        first_name: { type: "string" },
                        last_name: { type: "string" },
                        nickname: { type: "string" },
                        phone: { type: "string" },
                        extension: { type: "string" },
                        hire_date: { type: "string", format: "date" },
                        employment_status: { type: "string", enum: ["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED"] },
                        department_id: { type: "string" },
                        position_id: { type: "string" },
                        supervisor_id: { type: "string" },
                        user_id: { type: "string" },
                    },
                },
                Department: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        code: { type: "string", example: "HR" },
                        name: { type: "string", example: "ฝ่ายบุคคล" },
                        name_en: { type: "string", example: "Human Resources" },
                    },
                },
            },
        },
    };

    return NextResponse.json(openapiSpec, {
        headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
        },
    });
}
