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

    await prisma.user.createMany({
        data: [
            {
                name: "พรทิพย์ วงศ์สวัสดิ์",
                email: "hr@icare.com",
                password_hash: passwordHash,
                role: "HR",
            },
            {
                name: "ธนกร เทคโนโลยี",
                email: "it@icare.com",
                password_hash: passwordHash,
                role: "IT",
            },
            {
                name: "ประวิทย์ ผู้จัดการ",
                email: "manager@icare.com",
                password_hash: passwordHash,
                role: "MANAGER",
            },
            {
                name: "สมชาย ใจดี",
                email: "somchai@icare.com",
                password_hash: passwordHash,
                role: "EMPLOYEE",
            },
            {
                name: "สมหญิง รักงาน",
                email: "somying@icare.com",
                password_hash: passwordHash,
                role: "EMPLOYEE",
            },
        ],
    });

    console.log("✅ สร้างผู้ใช้แล้ว (7 คน, รหัสผ่าน: Password123)");

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
