"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    downloadEmployeeTemplate,
    parseExcelFile,
    type ParsedEmployeeRow,
    type DeptOption,
    type PosOption,
} from "@/lib/excel-template";
import {
    importEmployees,
    type ImportEmployeesResult,
} from "@/lib/actions/employees";
import {
    FileSpreadsheet,
    Download,
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Loader2,
    RefreshCw,
    Users,
    KeyRound,
    FileCheck,
    ArrowRight,
    Sparkles,
} from "lucide-react";

interface ImportEmployeesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    departmentsList: DeptOption[];
    positionsList: PosOption[];
    onSuccess?: () => void;
}

export function ImportEmployeesDialog({
    open,
    onOpenChange,
    departmentsList,
    positionsList,
    onSuccess,
}: ImportEmployeesDialogProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Options
    const [createAccounts, setCreateAccounts] = useState(true);
    const [defaultPassword, setDefaultPassword] = useState("Password123");

    // Execution state
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<ImportEmployeesResult | null>(null);
    const [showOnlyErrors, setShowOnlyErrors] = useState(false);

    const handleFileProcess = async (selectedFile: File) => {
        setParseError(null);
        setResult(null);
        setFile(selectedFile);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const { rows, error } = parseExcelFile(buffer);
            if (error) {
                setParseError(error);
                setParsedRows([]);
            } else {
                setParsedRows(rows);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "ไม่ทราบสาเหตุ";
            setParseError(`เกิดข้อผิดพลาดในการเปิดไฟล์: ${message}`);
            setParsedRows([]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleReset = () => {
        setFile(null);
        setParsedRows([]);
        setParseError(null);
        setResult(null);
        setShowOnlyErrors(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validRows = parsedRows.filter((r) => r.isValid);
    const invalidRows = parsedRows.filter((r) => !r.isValid);
    const displayedRows = showOnlyErrors ? invalidRows : parsedRows;

    const handleConfirmImport = () => {
        if (validRows.length === 0) return;

        startTransition(async () => {
            const payload = validRows.map((r) => ({
                employee_code: r.employee_code || null,
                first_name: r.first_name,
                last_name: r.last_name,
                nickname: r.nickname || null,
                email: r.email || null,
                phone: r.phone || null,
                department_raw: r.department_raw || null,
                position_raw: r.position_raw || null,
                hire_date: r.hire_date || null,
                employment_status: r.employment_status || "ACTIVE",
                user_role: r.user_role || "EMPLOYEE",
            }));

            const res = await importEmployees(payload, {
                createAccounts,
                defaultPassword,
            });

            setResult(res);
            if (res.success) {
                router.refresh();
                if (onSuccess) onSuccess();
            }
        });
    };

    const handleClose = () => {
        if (isPending) return;
        handleReset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className={`w-[95vw] ${
                    parsedRows.length > 0 ? "sm:max-w-4xl" : "sm:max-w-2xl"
                } max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl border-border/60 shadow-2xl transition-all duration-200`}
            >
                {/* Header */}
                <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
                    <div className="flex items-center gap-3.5 pr-8">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-xs">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                                นำเข้าพนักงานด้วยไฟล์ Excel
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                เพิ่มรายชื่อพนักงานเข้าสู่ระบบอย่างรวดเร็วผ่านการอัปโหลดไฟล์ตาราง
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                    {/* View 1: Success Results View */}
                    {result ? (
                        <div className="space-y-4 py-2">
                            <Card className="p-6 rounded-2xl border-emerald-500/30 bg-emerald-500/5 space-y-4 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl text-foreground">
                                            นำเข้าข้อมูลเสร็จสมบูรณ์!
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            เพิ่มข้อมูลพนักงานสำเร็จแล้ว{" "}
                                            <span className="font-bold text-emerald-600 text-base">
                                                {result.importedCount}
                                            </span>{" "}
                                            จากทั้งหมด {result.total} รายการ
                                        </p>
                                    </div>
                                </div>

                                {result.createdUsersCount > 0 && (
                                    <div className="mt-2 p-3 rounded-xl bg-background/80 border border-border/50 text-xs flex items-center gap-2.5">
                                        <KeyRound className="h-4 w-4 text-indigo-500 shrink-0" />
                                        <span>
                                            สร้างบัญชีผู้ใช้เข้าสู่ระบบสำเร็จ{" "}
                                            <strong className="text-foreground">
                                                {result.createdUsersCount} บัญชี
                                            </strong>{" "}
                                            (รหัสผ่านเริ่มต้น:{" "}
                                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-medium">
                                                {defaultPassword}
                                            </code>
                                            )
                                        </span>
                                    </div>
                                )}
                            </Card>

                            {/* Any errors */}
                            {result.errors.length > 0 && (
                                <Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-500/5 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <span>
                                            มีบางรายการที่ไม่สามารถนำเข้าได้ ({result.errors.length} รายการ):
                                        </span>
                                    </div>
                                    <ul className="text-xs space-y-1 text-muted-foreground pl-6 list-disc">
                                        {result.errors.map((err, i) => (
                                            <li key={i}>
                                                {err.row && `แถวที่ ${err.row}: `}
                                                <strong className="text-foreground">{err.name}</strong>
                                                {err.code && ` (${err.code})`} — {err.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button className="rounded-xl px-6" onClick={handleClose}>
                                    เสร็จสิ้น
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* View 2: Initial Step 1 + Step 2 layout (No file selected yet) */}
                            {!file ? (
                                <div className="space-y-4">
                                    {/* Step 1: Download Template Card */}
                                    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Download className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                        ขั้นตอนที่ 1
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        • แนะนำ
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-foreground text-sm sm:text-base mt-0.5">
                                                    ดาวน์โหลดแบบฟอร์ม Excel ตัวอย่าง
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                    มีหัวคอลัมน์มาตรฐาน และข้อมูลแผนก/ตำแหน่งปัจจุบันของระบบให้อ้างอิง
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl shrink-0 gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:text-emerald-300 dark:hover:bg-emerald-600 transition-colors"
                                            onClick={() =>
                                                downloadEmployeeTemplate(departmentsList, positionsList)
                                            }
                                        >
                                            <Download className="h-4 w-4" />
                                            ดาวน์โหลด Template (.xlsx)
                                        </Button>
                                    </div>

                                    {/* Step 2: Upload Dropzone Card */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                                ขั้นตอนที่ 2
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                • อัปโหลดไฟล์ข้อมูล
                                            </span>
                                        </div>
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3.5 ${
                                                isDragging
                                                    ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
                                                    : "border-border/80 hover:border-emerald-500/60 hover:bg-emerald-500/5 bg-muted/15"
                                            }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx, .xls, .csv"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFileProcess(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                                                <UploadCloud className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-foreground text-sm sm:text-base">
                                                    คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    รองรับไฟล์นามสกุล{" "}
                                                    <span className="font-medium text-foreground">.xlsx</span>,{" "}
                                                    <span className="font-medium text-foreground">.xls</span> หรือ{" "}
                                                    <span className="font-medium text-foreground">.csv</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] rounded-md font-mono"
                                                >
                                                    XLSX
                                                </Badge>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] rounded-md font-mono"
                                                >
                                                    XLS
                                                </Badge>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] rounded-md font-mono"
                                                >
                                                    CSV
                                                </Badge>
                                                <span className="text-[11px] text-muted-foreground ml-1">
                                                    ขนาดสูงสุด 10MB
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* View 3: File is selected -> Preview & Configure Options */
                                <div className="space-y-4">
                                    {/* File Header Bar */}
                                    <Card className="p-3.5 sm:p-4 rounded-2xl border-border/60 bg-muted/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <FileCheck className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-foreground truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(1)} KB • พบข้อมูล{" "}
                                                    <strong className="text-foreground font-semibold">
                                                        {parsedRows.length}
                                                    </strong>{" "}
                                                    รายการ
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                                            onClick={handleReset}
                                            disabled={isPending}
                                        >
                                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                            เปลี่ยนไฟล์
                                        </Button>
                                    </Card>

                                    {/* Parse error if any */}
                                    {parseError && (
                                        <Card className="p-4 rounded-2xl border-red-500/30 bg-red-500/5 text-red-600 text-sm flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <span>{parseError}</span>
                                        </Card>
                                    )}

                                    {/* Options Setting Card */}
                                    {parsedRows.length > 0 && (
                                        <Card className="p-4 rounded-2xl border-border/50 bg-gradient-to-r from-muted/30 via-muted/15 to-transparent space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-start gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        id="createAccounts"
                                                        checked={createAccounts}
                                                        onChange={(e) =>
                                                            setCreateAccounts(e.target.checked)
                                                        }
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <div>
                                                        <Label
                                                            htmlFor="createAccounts"
                                                            className="font-medium text-sm cursor-pointer"
                                                        >
                                                            สร้างบัญชีผู้ใช้งาน (User Login) ให้อัตโนมัติ
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            สร้างบัญชีเข้าสู่ระบบสำหรับพนักงานที่มีอีเมลระบุไว้ในไฟล์
                                                        </p>
                                                    </div>
                                                </div>

                                                {createAccounts && (
                                                    <div className="flex items-center gap-2 shrink-0 sm:w-64 pl-6 sm:pl-0">
                                                        <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <div className="flex-1">
                                                            <Input
                                                                size={1}
                                                                value={defaultPassword}
                                                                onChange={(e) =>
                                                                    setDefaultPassword(e.target.value)
                                                                }
                                                                placeholder="รหัสผ่านเริ่มต้น"
                                                                className="h-8 text-xs rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    )}

                                    {/* Stats & Filter Bar */}
                                    {parsedRows.length > 0 && (
                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 px-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-lg gap-1.5 px-2.5 py-1 text-xs"
                                                >
                                                    <Users className="h-3.5 w-3.5" />
                                                    ทั้งหมด {parsedRows.length} รายการ
                                                </Badge>
                                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 rounded-lg gap-1.5 px-2.5 py-1 text-xs">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    พร้อมนำเข้า {validRows.length}
                                                </Badge>
                                                {invalidRows.length > 0 && (
                                                    <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/20 border-red-500/20 rounded-lg gap-1.5 px-2.5 py-1 text-xs">
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                        ข้อมูลไม่ครบ {invalidRows.length}
                                                    </Badge>
                                                )}
                                            </div>

                                            {invalidRows.length > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs rounded-lg text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowOnlyErrors(!showOnlyErrors)}
                                                >
                                                    {showOnlyErrors
                                                        ? "แสดงทั้งหมด"
                                                        : `แสดงเฉพาะแถวที่มีปัญหา (${invalidRows.length})`}
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* Preview Table */}
                                    {parsedRows.length > 0 && (
                                        <div className="rounded-2xl border border-border/50 overflow-hidden max-h-72 overflow-y-auto bg-card">
                                            <Table>
                                                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                                                    <TableRow>
                                                        <TableHead className="w-12 text-center text-xs">
                                                            #
                                                        </TableHead>
                                                        <TableHead className="text-xs">รหัส</TableHead>
                                                        <TableHead className="text-xs">
                                                            ชื่อ-นามสกุล
                                                        </TableHead>
                                                        <TableHead className="text-xs">อีเมล</TableHead>
                                                        <TableHead className="text-xs">แผนก</TableHead>
                                                        <TableHead className="text-xs">ตำแหน่ง</TableHead>
                                                        <TableHead className="text-xs">สถานะ</TableHead>
                                                        <TableHead className="text-xs text-right">
                                                            ผลการตรวจ
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {displayedRows.map((row) => (
                                                        <TableRow
                                                            key={row.rowIndex}
                                                            className={
                                                                !row.isValid
                                                                    ? "bg-red-500/5 hover:bg-red-500/10"
                                                                    : undefined
                                                            }
                                                        >
                                                            <TableCell className="text-center text-xs text-muted-foreground font-mono">
                                                                {row.rowIndex}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-mono">
                                                                {row.employee_code ? (
                                                                    <code>{row.employee_code}</code>
                                                                ) : (
                                                                    <span className="text-muted-foreground italic">
                                                                        (อัตโนมัติ)
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-medium">
                                                                {row.first_name} {row.last_name}
                                                                {row.nickname && (
                                                                    <span className="text-muted-foreground ml-1 font-normal">
                                                                        ({row.nickname})
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {row.email || "-"}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {row.department_raw ? (
                                                                    <span className="truncate max-w-[120px] inline-block">
                                                                        {row.department_raw}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {row.position_raw ? (
                                                                    <span className="truncate max-w-[100px] inline-block">
                                                                        {row.position_raw}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] py-0 px-1.5"
                                                                >
                                                                    {row.employment_status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-right">
                                                                {row.isValid ? (
                                                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0">
                                                                        พร้อมนำเข้า
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20 text-[10px] py-0">
                                                                        {row.errors[0] || "ข้อมูลไม่ครบ"}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                {!result && (
                    <div className="p-4 px-6 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                        {!file ? (
                            <>
                                <p className="text-xs text-muted-foreground hidden sm:block">
                                    * กรุณาใช้ไฟล์ .xlsx หรือ .csv ตามโครงสร้างคอลัมน์มาตรฐาน
                                </p>
                                <Button
                                    variant="outline"
                                    className="rounded-xl px-5 ml-auto"
                                    onClick={handleClose}
                                >
                                    ยกเลิก
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={handleClose}
                                    disabled={isPending}
                                >
                                    ยกเลิก
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Button
                                        className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                        onClick={handleConfirmImport}
                                        disabled={isPending || validRows.length === 0}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                กำลังนำเข้าข้อมูล...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                ยืนยันนำเข้า ({validRows.length} รายการ)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
