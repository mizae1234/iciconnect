import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 กำลัง Seed ข้อมูล...");

    // ─── ลบข้อมูลเดิม ──────────────────────────────────
    await prisma.announcement.deleteMany();
    await prisma.application.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.department.deleteMany();
    await prisma.position.deleteMany();
    await prisma.user.deleteMany();

    // ─── ผู้ใช้ ─────────────────────────────────────────
    const passwordHash = await bcrypt.hash("Password123", 12);

    const superAdmin = await prisma.user.create({
        data: {
            name: "วิชัย สุขสมบูรณ์",
            email: "superadmin@icare.com",
            password_hash: passwordHash,
            role: "SUPER_ADMIN",
        },
    });

    const admin = await prisma.user.create({
        data: {
            name: "สมศักดิ์ รัตนพล",
            email: "admin@icare.com",
            password_hash: passwordHash,
            role: "ADMIN",
        },
    });

    const hrUser = await prisma.user.create({
        data: {
            name: "พรทิพย์ วงศ์สวัสดิ์",
            email: "hr@icare.com",
            password_hash: passwordHash,
            role: "HR",
        },
    });

    const itUser = await prisma.user.create({
        data: {
            name: "ธนกร เทคโนโลยี",
            email: "it@icare.com",
            password_hash: passwordHash,
            role: "IT",
        },
    });

    const mgrUser = await prisma.user.create({
        data: {
            name: "ประวิทย์ ผู้จัดการ",
            email: "manager@icare.com",
            password_hash: passwordHash,
            role: "MANAGER",
        },
    });

    const empUser1 = await prisma.user.create({
        data: {
            name: "สมชาย ใจดี",
            email: "somchai@icare.com",
            password_hash: passwordHash,
            role: "EMPLOYEE",
        },
    });

    const empUser2 = await prisma.user.create({
        data: {
            name: "สมหญิง รักงาน",
            email: "somying@icare.com",
            password_hash: passwordHash,
            role: "EMPLOYEE",
        },
    });

    console.log("✅ สร้างผู้ใช้แล้ว (7 คน, รหัสผ่าน: Password123)");

    // ─── ตำแหน่ง ─────────────────────────────────────────
    const posCEO = await prisma.position.create({
        data: { code: "CEO", name: "กรรมการผู้จัดการ", level: 1 },
    });
    const posMGR = await prisma.position.create({
        data: { code: "MGR", name: "ผู้จัดการแผนก", level: 2 },
    });
    const posLEAD = await prisma.position.create({
        data: { code: "LEAD", name: "หัวหน้าทีม", level: 3 },
    });
    const posSR = await prisma.position.create({
        data: { code: "SR", name: "เจ้าหน้าที่อาวุโส", level: 4 },
    });
    const posSTAFF = await prisma.position.create({
        data: { code: "STAFF", name: "เจ้าหน้าที่", level: 5 },
    });

    console.log("✅ สร้างตำแหน่งแล้ว (5 ตำแหน่ง)");

    // ─── แผนก ─────────────────────────────────────────────
    const deptExec = await prisma.department.create({
        data: { code: "EXEC", name: "ผู้บริหาร", name_en: "Executive" },
    });
    const deptHR = await prisma.department.create({
        data: { code: "HR", name: "ฝ่ายบุคคล", name_en: "Human Resources" },
    });
    const deptIT = await prisma.department.create({
        data: { code: "IT", name: "ฝ่ายไอที", name_en: "Information Technology" },
    });
    const deptFIN = await prisma.department.create({
        data: { code: "FIN", name: "ฝ่ายการเงิน", name_en: "Finance" },
    });

    console.log("✅ สร้างแผนกแล้ว (4 แผนก)");

    // ─── พนักงาน ──────────────────────────────────────────
    const empCEO = await prisma.employee.create({
        data: {
            employee_code: "ICI-0001",
            first_name: "วิชัย",
            last_name: "สุขสมบูรณ์",
            nickname: "ชัย",
            phone: "081-111-1111",
            hire_date: new Date("2020-01-01"),
            employment_status: "ACTIVE",
            user_id: superAdmin.id,
            department_id: deptExec.id,
            position_id: posCEO.id,
        },
    });

    const empAdmin = await prisma.employee.create({
        data: {
            employee_code: "ICI-0002",
            first_name: "สมศักดิ์",
            last_name: "รัตนพล",
            nickname: "ศักดิ์",
            phone: "081-222-2222",
            hire_date: new Date("2020-03-15"),
            employment_status: "ACTIVE",
            user_id: admin.id,
            department_id: deptExec.id,
            position_id: posMGR.id,
            supervisor_id: empCEO.id,
        },
    });

    const empHR = await prisma.employee.create({
        data: {
            employee_code: "ICI-0003",
            first_name: "พรทิพย์",
            last_name: "วงศ์สวัสดิ์",
            nickname: "ทิพย์",
            phone: "081-333-3333",
            extension: "1001",
            hire_date: new Date("2021-06-01"),
            employment_status: "ACTIVE",
            user_id: hrUser.id,
            department_id: deptHR.id,
            position_id: posMGR.id,
            supervisor_id: empCEO.id,
        },
    });

    const empIT = await prisma.employee.create({
        data: {
            employee_code: "ICI-0004",
            first_name: "ธนกร",
            last_name: "เทคโนโลยี",
            nickname: "กร",
            phone: "081-444-4444",
            extension: "2001",
            hire_date: new Date("2021-08-15"),
            employment_status: "ACTIVE",
            user_id: itUser.id,
            department_id: deptIT.id,
            position_id: posLEAD.id,
            supervisor_id: empCEO.id,
        },
    });

    const empMgr = await prisma.employee.create({
        data: {
            employee_code: "ICI-0005",
            first_name: "ประวิทย์",
            last_name: "ผู้จัดการ",
            nickname: "วิทย์",
            phone: "081-555-5555",
            extension: "3001",
            hire_date: new Date("2022-01-10"),
            employment_status: "ACTIVE",
            user_id: mgrUser.id,
            department_id: deptFIN.id,
            position_id: posMGR.id,
            supervisor_id: empCEO.id,
        },
    });

    await prisma.employee.create({
        data: {
            employee_code: "ICI-0006",
            first_name: "สมชาย",
            last_name: "ใจดี",
            nickname: "ชาย",
            phone: "081-666-6666",
            extension: "1002",
            hire_date: new Date("2023-03-01"),
            employment_status: "ACTIVE",
            user_id: empUser1.id,
            department_id: deptHR.id,
            position_id: posSTAFF.id,
            supervisor_id: empHR.id,
        },
    });

    await prisma.employee.create({
        data: {
            employee_code: "ICI-0007",
            first_name: "สมหญิง",
            last_name: "รักงาน",
            nickname: "หญิง",
            phone: "081-777-7777",
            extension: "2002",
            hire_date: new Date("2023-06-15"),
            employment_status: "PROBATION",
            user_id: empUser2.id,
            department_id: deptIT.id,
            position_id: posSTAFF.id,
            supervisor_id: empIT.id,
        },
    });

    console.log("✅ สร้างพนักงานแล้ว (7 คน)");

    // ─── กำหนดหัวหน้าแผนก ─────────────────────────────────
    await prisma.department.update({
        where: { id: deptExec.id },
        data: { head_id: empCEO.id },
    });
    await prisma.department.update({
        where: { id: deptHR.id },
        data: { head_id: empHR.id },
    });
    await prisma.department.update({
        where: { id: deptIT.id },
        data: { head_id: empIT.id },
    });
    await prisma.department.update({
        where: { id: deptFIN.id },
        data: { head_id: empMgr.id },
    });

    console.log("✅ กำหนดหัวหน้าแผนกแล้ว");

    // ─── แอปพลิเคชัน ───────────────────────────────────
    await prisma.application.createMany({
        data: [
            {
                name: "อีเมล (Outlook)",
                description: "ระบบอีเมลบริษัท — Microsoft Outlook Web",
                icon_url: "mail",
                link_url: "https://outlook.office365.com",
                open_type: "new_tab",
                display_order: 1,
                allowed_roles: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"],
            },
            {
                name: "ระบบ HR",
                description: "ลาหยุด, เช็คเวลาเข้างาน, บริการตนเอง HR",
                icon_url: "users",
                link_url: "https://hr.icare.com",
                open_type: "new_tab",
                display_order: 2,
                allowed_roles: ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER", "EMPLOYEE"],
            },
            {
                name: "แจ้งซ่อม IT",
                description: "แจ้งปัญหา IT และติดตามสถานะการซ่อม",
                icon_url: "headphones",
                link_url: "https://helpdesk.icare.com",
                open_type: "new_tab",
                display_order: 3,
                allowed_roles: ["SUPER_ADMIN", "ADMIN", "IT", "MANAGER", "EMPLOYEE"],
            },
            {
                name: "คลังเอกสาร",
                description: "เอกสาร, นโยบาย, คู่มือปฏิบัติงาน (SOP)",
                icon_url: "folder-open",
                link_url: "https://docs.icare.com",
                open_type: "new_tab",
                display_order: 4,
                allowed_roles: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"],
            },
            {
                name: "ระบบ CRM ประกันภัย",
                description: "ระบบจัดการลูกค้าสำหรับตัวแทนประกันภัย",
                icon_url: "shield",
                link_url: "https://crm.icare.com",
                open_type: "new_tab",
                display_order: 5,
                allowed_roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
            },
            {
                name: "ศูนย์อบรม",
                description: "คอร์สออนไลน์, ใบรับรอง, สื่อการเรียนรู้",
                icon_url: "book-open",
                link_url: "https://training.icare.com",
                open_type: "new_tab",
                display_order: 6,
                allowed_roles: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"],
            },
        ],
    });

    console.log("✅ สร้างแอปพลิเคชันแล้ว (6 รายการ)");

    // ─── ประกาศ ─────────────────────────────────────────
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.announcement.createMany({
        data: [
            {
                title: "ยินดีต้อนรับสู่ ICI Connect!",
                content:
                    "บริษัทได้เปิดตัวระบบอินทราเน็ตใหม่ — ICI Connect เพื่อรวบรวมเครื่องมือ ประกาศ และทรัพยากรต่างๆ ของบริษัทไว้ในที่เดียว กรุณาสำรวจและส่งความคิดเห็นมาที่ฝ่าย IT ได้เลยครับ",
                category: "GENERAL",
                is_pinned: true,
                start_at: yesterday,
                is_active: true,
                target_roles: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"],
                created_by: superAdmin.id,
            },
            {
                title: "แจ้งปิดปรับปรุงระบบ — วันเสาร์ที่ 8 มี.ค.",
                content:
                    "ฝ่าย IT จะทำการปิดปรับปรุงระบบภายในทั้งหมดในวันเสาร์นี้ ตั้งแต่เวลา 22:00 - 02:00 น. กรุณาบันทึกงานก่อนเวลา 22:00 น. หากมีข้อสงสัยกรุณาติดต่อฝ่าย IT",
                category: "IT",
                is_pinned: false,
                start_at: yesterday,
                expire_at: nextWeek,
                is_active: true,
                target_roles: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"],
                created_by: admin.id,
            },
            {
                title: "อัปเดตนโยบายการลาประจำปี 2569",
                content:
                    "กรุณาตรวจสอบนโยบายการลาพักร้อนและลาป่วยฉบับปรับปรุงใหม่ มีผลบังคับใช้ตั้งแต่วันที่ 1 เมษายน 2569 การเปลี่ยนแปลงสำคัญ: เพิ่มวันลากิจจาก 3 วันเป็น 5 วันต่อปี เอกสารฉบับเต็มดูได้ที่คลังเอกสาร",
                category: "HR",
                is_pinned: false,
                start_at: yesterday,
                is_active: true,
                target_roles: ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER", "EMPLOYEE"],
                created_by: admin.id,
            },
            {
                title: "ด่วน: กรุณาเปลี่ยนรหัสผ่าน",
                content:
                    "จากการตรวจสอบความปลอดภัยล่าสุด พนักงานทุกท่านต้องเปลี่ยนรหัสผ่านภายในสัปดาห์นี้ สามารถแจ้งผ่านระบบแจ้งซ่อม IT หรือทำตามขั้นตอนในอีเมลที่ส่งไปแล้ว",
                category: "URGENT",
                is_pinned: true,
                start_at: yesterday,
                expire_at: nextWeek,
                is_active: true,
                target_roles: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"],
                created_by: superAdmin.id,
            },
            {
                title: "ประชุม Town Hall ไตรมาส 1",
                content:
                    "ขอเชิญพนักงานทุกท่านร่วมประชุม Town Hall ไตรมาส 1 ในวันศุกร์หน้า เวลา 14:00 น. ที่ห้องประชุมใหญ่ (หรือผ่าน Zoom) CEO จะแจ้งข่าวสารบริษัทและผลประกอบการไตรมาส 1",
                category: "GENERAL",
                is_pinned: false,
                start_at: yesterday,
                expire_at: nextMonth,
                is_active: true,
                target_roles: ["SUPER_ADMIN", "ADMIN", "HR", "IT", "MANAGER", "EMPLOYEE"],
                created_by: admin.id,
            },
        ],
    });

    console.log("✅ สร้างประกาศแล้ว (5 รายการ)");

    console.log("\n✨ Seed เสร็จเรียบร้อย!");
    console.log("───────────────────────────────────────");
    console.log("ข้อมูลล็อกอิน (ทุกบัญชี):");
    console.log("  รหัสผ่าน: Password123");
    console.log("");
    console.log("  superadmin@icare.com  (ผู้ดูแลระบบสูงสุด)");
    console.log("  admin@icare.com       (ผู้ดูแลระบบ)");
    console.log("  hr@icare.com          (ฝ่ายบุคคล)");
    console.log("  it@icare.com          (ฝ่ายไอที)");
    console.log("  manager@icare.com     (ผู้จัดการ)");
    console.log("  somchai@icare.com     (พนักงาน)");
    console.log("  somying@icare.com     (พนักงาน)");
    console.log("");
    console.log("📦 Employee Module:");
    console.log("  แผนก: 4 (ผู้บริหาร, ฝ่ายบุคคล, ฝ่ายไอที, ฝ่ายการเงิน)");
    console.log("  ตำแหน่ง: 5 (CEO, ผู้จัดการแผนก, หัวหน้าทีม, อาวุโส, เจ้าหน้าที่)");
    console.log("  พนักงาน: 7 คน (เชื่อมกับ User ทั้งหมด)");
    console.log("───────────────────────────────────────");
}

main()
    .catch((e) => {
        console.error("❌ Seed ล้มเหลว:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
