import * as XLSX from "xlsx";

export interface DeptOption {
    id: string;
    name: string;
    name_en?: string | null;
    code: string;
}

export interface PosOption {
    id: string;
    name: string;
    code: string;
}

export interface ParsedEmployeeRow {
    rowIndex: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    nickname: string;
    email: string;
    phone: string;
    department_raw: string;
    position_raw: string;
    hire_date: string;
    employment_status: string;
    user_role: string;
    isValid: boolean;
    errors: string[];
}

/**
 * Download a nicely formatted Excel template (.xlsx) with sample data
 * and a reference sheet containing current departments, positions, and statuses.
 */
export function downloadEmployeeTemplate(
    departments: DeptOption[],
    positions: PosOption[]
) {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Template data with sample rows ────────────────────────
    const sampleHeaders = [
        "รหัสพนักงาน (เว้นว่างเพื่อสร้างอัตโนมัติ)",
        "ชื่อจริง *",
        "นามสกุล *",
        "ชื่อเล่น",
        "อีเมล",
        "เบอร์โทรศัพท์",
        "แผนก (รหัสหรือชื่อ)",
        "ตำแหน่ง (รหัสหรือชื่อ)",
        "วันที่เริ่มงาน (YYYY-MM-DD)",
        "สถานะ (ACTIVE/PROBATION)",
    ];

    const sampleRow1 = [
        "ICI-9001",
        "สมชาย",
        "ใจดี",
        "ชาย",
        "somchai.j@example.com",
        "0812345678",
        departments[0]?.code || "IT",
        positions[0]?.code || "Developer",
        "2024-01-15",
        "ACTIVE",
    ];

    const sampleRow2 = [
        "", // Blank code to test auto-generation
        "สมหญิง",
        "รักสงบ",
        "หญิง",
        "somying.r@example.com",
        "0898765432",
        departments[1]?.code || departments[0]?.code || "HR",
        positions[1]?.code || positions[0]?.code || "Staff",
        "2024-02-01",
        "PROBATION",
    ];

    const wsData = [sampleHeaders, sampleRow1, sampleRow2];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws["!cols"] = [
        { wch: 30 }, // รหัสพนักงาน
        { wch: 20 }, // ชื่อจริง
        { wch: 20 }, // นามสกุล
        { wch: 15 }, // ชื่อเล่น
        { wch: 28 }, // อีเมล
        { wch: 18 }, // เบอร์โทร
        { wch: 24 }, // แผนก
        { wch: 24 }, // ตำแหน่ง
        { wch: 24 }, // วันที่เริ่มงาน
        { wch: 24 }, // สถานะ
    ];

    XLSX.utils.book_append_sheet(wb, ws, "ข้อมูลพนักงาน");

    // ── Sheet 2: Reference data (Departments & Positions in the system) ─
    const deptRows = [
        ["=== แผนกและฝ่ายในระบบ (สามารถใช้รหัสหรือชื่อแผนกได้) ===", "", ""],
        ["รหัสแผนก", "ชื่อแผนก (ไทย)", "ชื่อแผนก (อังกฤษ)"],
        ...departments.map((d) => [d.code, d.name, d.name_en || ""]),
        ["", "", ""],
        ["=== ตำแหน่งงานในระบบ ===", ""],
        ["รหัสตำแหน่ง", "ชื่อตำแหน่ง"],
        ...positions.map((p) => [p.code, p.name]),
        ["", "", ""],
        ["=== สถานะการทำงานที่รองรับ ===", ""],
        ["ค่าที่พิมพ์ได้", "ความหมาย"],
        ["ACTIVE หรือ ทำงานปกติ", "ทำงานปกติ"],
        ["PROBATION หรือ ทดลองงาน", "ทดลองงาน"],
        ["RESIGNED หรือ ลาออก", "ลาออก"],
        ["TERMINATED หรือ พ้นสภาพ", "พ้นสภาพ"],
    ];

    const wsRef = XLSX.utils.aoa_to_sheet(deptRows);
    wsRef["!cols"] = [{ wch: 26 }, { wch: 36 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsRef, "ข้อมูลอ้างอิง");

    // Trigger download in browser
    XLSX.writeFile(wb, "แบบฟอร์มนำเข้าข้อมูลพนักงาน.xlsx");
}

/**
 * Normalizes header string to match standard field name
 */
function normalizeHeader(header: string): string {
    const clean = header.trim().toLowerCase().replace(/[\*\(\)\s_-]/g, "");

    // employee_code
    if (
        clean.includes("รหัสพนักงาน") ||
        clean.includes("employeecode") ||
        clean === "code" ||
        clean === "รหัส"
    ) {
        return "employee_code";
    }

    // first_name
    if (
        clean.includes("ชื่อจริง") ||
        clean.includes("firstname") ||
        clean.includes("fname") ||
        clean === "ชื่อ"
    ) {
        return "first_name";
    }

    // last_name
    if (
        clean.includes("นามสกุล") ||
        clean.includes("lastname") ||
        clean.includes("lname")
    ) {
        return "last_name";
    }

    // nickname
    if (clean.includes("ชื่อเล่น") || clean.includes("nickname")) {
        return "nickname";
    }

    // email
    if (
        clean.includes("อีเมล") ||
        clean.includes("อีเมล์") ||
        clean.includes("email") ||
        clean.includes("mail")
    ) {
        return "email";
    }

    // phone
    if (
        clean.includes("โทร") ||
        clean.includes("phone") ||
        clean.includes("mobile") ||
        clean.includes("tel")
    ) {
        return "phone";
    }

    // department
    if (
        clean.includes("แผนก") ||
        clean.includes("ฝ่าย") ||
        clean.includes("department") ||
        clean.includes("dept")
    ) {
        return "department_raw";
    }

    // position
    if (
        clean.includes("ตำแหน่ง") ||
        clean.includes("position") ||
        clean.includes("pos")
    ) {
        return "position_raw";
    }

    // hire_date
    if (
        clean.includes("เริ่มงาน") ||
        clean.includes("เข้าทำงาน") ||
        clean.includes("hiredate") ||
        clean.includes("startdate")
    ) {
        return "hire_date";
    }

    // employment_status
    if (
        clean.includes("สถานะ") ||
        clean.includes("status") ||
        clean.includes("employmentstatus")
    ) {
        return "employment_status";
    }

    // role
    if (
        clean.includes("สิทธิ์") ||
        clean.includes("บทบาท") ||
        clean.includes("role")
    ) {
        return "user_role";
    }

    return header;
}

/**
 * Format date values from Excel (handles Excel serial numbers, Date objects, and strings)
 */
function parseExcelDate(val: unknown): string {
    if (!val) return "";
    if (val instanceof Date) {
        return val.toISOString().split("T")[0];
    }
    if (typeof val === "number") {
        // Excel serial date to JS Date
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
        }
    }
    const str = String(val).trim();
    // Check if DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
    if (ddmmyyyy) {
        let year = parseInt(ddmmyyyy[3], 10);
        // If Buddhist era (BE) > 2400, subtract 543
        if (year > 2400) year -= 543;
        const month = String(ddmmyyyy[2]).padStart(2, "0");
        const day = String(ddmmyyyy[1]).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    // Check YYYY-MM-DD
    const yyyymmdd = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
    if (yyyymmdd) {
        let year = parseInt(yyyymmdd[1], 10);
        if (year > 2400) year -= 543;
        const month = String(yyyymmdd[2]).padStart(2, "0");
        const day = String(yyyymmdd[3]).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    return str;
}

/**
 * Parse an Excel file (ArrayBuffer) into structured row items with validation
 */
export function parseExcelFile(
    data: ArrayBuffer
): { rows: ParsedEmployeeRow[]; error?: string } {
    try {
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return { rows: [], error: "ไม่พบ Sheet ข้อมูลในไฟล์" };
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawJson: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            blankrows: false,
        });

        if (rawJson.length < 2) {
            return {
                rows: [],
                error: "ไฟล์ไม่มีข้อมูลพนักงาน (ต้องมีแถวหัวตารางและแถวข้อมูลอย่างน้อย 1 แถว)",
            };
        }

        // Header row
        const rawHeaders: string[] = (rawJson[0] || []).map((h: unknown) =>
            String(h ?? "")
        );
        const normalizedHeaders = rawHeaders.map((h) => normalizeHeader(h));

        const rows: ParsedEmployeeRow[] = [];

        for (let i = 1; i < rawJson.length; i++) {
            const rawRow = rawJson[i];
            if (!rawRow || !Array.isArray(rawRow)) continue;

            // Check if entire row is empty
            const isAllEmpty = rawRow.every(
                (cell: unknown) =>
                    cell === undefined ||
                    cell === null ||
                    String(cell).trim() === ""
            );
            if (isAllEmpty) continue;

            const rowData: Record<string, string> = {
                employee_code: "",
                first_name: "",
                last_name: "",
                nickname: "",
                email: "",
                phone: "",
                department_raw: "",
                position_raw: "",
                hire_date: "",
                employment_status: "ACTIVE",
                user_role: "EMPLOYEE",
            };

            rawRow.forEach((cell: unknown, colIdx: number) => {
                const headerKey = normalizedHeaders[colIdx];
                if (headerKey && headerKey in rowData) {
                    if (headerKey === "hire_date") {
                        rowData[headerKey] = parseExcelDate(cell);
                    } else {
                        rowData[headerKey] =
                            cell !== undefined && cell !== null
                                ? String(cell).trim()
                                : "";
                    }
                }
            });

            // Validation per row
            const errors: string[] = [];
            if (!rowData.first_name) {
                errors.push("ขาดชื่อจริง");
            }
            if (!rowData.last_name) {
                errors.push("ขาดนามสกุล");
            }

            if (rowData.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(rowData.email)) {
                    errors.push("รูปแบบอีเมลไม่ถูกต้อง");
                }
            }

            rows.push({
                rowIndex: i + 1,
                employee_code: rowData.employee_code,
                first_name: rowData.first_name,
                last_name: rowData.last_name,
                nickname: rowData.nickname,
                email: rowData.email,
                phone: rowData.phone,
                department_raw: rowData.department_raw,
                position_raw: rowData.position_raw,
                hire_date: rowData.hire_date,
                employment_status: rowData.employment_status || "ACTIVE",
                user_role: rowData.user_role || "EMPLOYEE",
                isValid: errors.length === 0,
                errors,
            });
        }

        return { rows };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "รูปแบบไฟล์ไม่ถูกต้อง";
        return {
            rows: [],
            error: `ไม่สามารถอ่านไฟล์ได้: ${message}`,
        };
    }
}
