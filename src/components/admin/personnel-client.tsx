"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createPersonnel,
    updatePersonnel,
    deletePersonnel,
} from "@/lib/actions/personnel";
import {
    EMPLOYMENT_STATUS_LABELS,
    EMPLOYMENT_STATUS_COLORS,
    EMPLOYMENT_STATUSES,
    ROLES,
    ROLE_LABELS,
    type EmploymentStatusType,
    type RoleType,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    UserCog,
    ChevronLeft,
    ChevronRight,
    Building2,
    Briefcase,
    Filter,
    KeyRound,
    UserCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────

interface PersonnelRow {
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
}

interface DeptOption { id: string; name: string; code: string }
interface PosOption { id: string; name: string; code: string; level: number }
interface EmpOption { id: string; employee_code: string; first_name: string; last_name: string }

interface Props {
    personnel: PersonnelRow[];
    total: number;
    totalPages: number;
    currentPage: number;
    currentSearch: string;
    currentDepartmentId: string;
    currentPositionId: string;
    currentEmploymentStatus: string;
    departmentsList: DeptOption[];
    positionsList: PosOption[];
    employeesList: EmpOption[];
    nextEmployeeCode: string;
}

// ─── Form State ───────────────────────────────────────────

const EMPTY_FORM = {
    employee_code: "",
    first_name: "",
    last_name: "",
    nickname: "",
    phone: "",
    extension: "",
    hire_date: "",
    employment_status: "ACTIVE",
    department_id: "",
    position_id: "",
    supervisor_id: "",
    // User fields
    create_account: true,
    email: "",
    password: "",
    role: "EMPLOYEE",
    user_is_active: true,
};

// ─── Component ────────────────────────────────────────────

export function PersonnelClient({
    personnel,
    total,
    totalPages,
    currentPage,
    currentSearch,
    currentDepartmentId,
    currentPositionId,
    currentEmploymentStatus,
    departmentsList,
    positionsList,
    employeesList,
    nextEmployeeCode,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(currentSearch);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<PersonnelRow | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<PersonnelRow | null>(null);
    const [showFilters, setShowFilters] = useState(
        !!(currentDepartmentId || currentPositionId || currentEmploymentStatus)
    );

    function navigate(params: Record<string, string>) {
        const sp = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([k, v]) => {
            if (v) sp.set(k, v);
            else sp.delete(k);
        });
        router.push(`/admin/personnel?${sp.toString()}`);
    }

    function handleSearch() {
        navigate({ search, page: "" });
    }

    function openCreate() {
        setEditingRow(null);
        setForm({ ...EMPTY_FORM, employee_code: nextEmployeeCode });
        setError("");
        setDialogOpen(true);
    }

    function openEdit(row: PersonnelRow) {
        setEditingRow(row);
        if (row.type === "user_only") {
            setForm({
                ...EMPTY_FORM,
                first_name: row.first_name,
                last_name: "",
                create_account: true,
                email: row.user_email || "",
                role: row.user_role || "EMPLOYEE",
                user_is_active: row.user_is_active ?? true,
            });
        } else {
            setForm({
                employee_code: row.employee_code || "",
                first_name: row.first_name,
                last_name: row.last_name,
                nickname: row.nickname || "",
                phone: row.phone || "",
                extension: row.extension || "",
                hire_date: row.hire_date ? new Date(row.hire_date).toISOString().split("T")[0] : "",
                employment_status: row.employment_status || "ACTIVE",
                department_id: row.department_id || "",
                position_id: row.position_id || "",
                supervisor_id: row.supervisor_id || "",
                create_account: !!row.user_id,
                email: row.user_email || "",
                password: "",
                role: row.user_role || "EMPLOYEE",
                user_is_active: row.user_is_active ?? true,
            });
        }
        setError("");
        setDialogOpen(true);
    }

    async function handleSubmit() {
        setError("");
        startTransition(async () => {
            if (editingRow) {
                // UPDATE
                const result = await updatePersonnel(editingRow.id, editingRow.type, {
                    employee_code: form.employee_code || undefined,
                    first_name: form.first_name,
                    last_name: form.last_name,
                    nickname: form.nickname || null,
                    phone: form.phone || null,
                    extension: form.extension || null,
                    hire_date: form.hire_date || null,
                    employment_status: form.employment_status,
                    department_id: form.department_id || null,
                    position_id: form.position_id || null,
                    supervisor_id: form.supervisor_id || null,
                    user_id: editingRow.user_id,
                    email: form.email || null,
                    password: form.password || null,
                    role: form.role || null,
                    user_is_active: form.user_is_active,
                });
                if (result.error) {
                    setError(result.error);
                } else {
                    setDialogOpen(false);
                }
            } else {
                // CREATE
                const result = await createPersonnel({
                    employee_code: form.employee_code,
                    first_name: form.first_name,
                    last_name: form.last_name,
                    nickname: form.nickname || null,
                    phone: form.phone || null,
                    extension: form.extension || null,
                    hire_date: form.hire_date || null,
                    employment_status: form.employment_status,
                    department_id: form.department_id || null,
                    position_id: form.position_id || null,
                    supervisor_id: form.supervisor_id || null,
                    create_account: form.create_account,
                    email: form.email || null,
                    password: form.password || null,
                    role: form.role || null,
                });
                if (result.error) {
                    setError(result.error);
                } else {
                    setDialogOpen(false);
                }
            }
        });
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        startTransition(async () => {
            const result = await deletePersonnel(deleteTarget.id, deleteTarget.type);
            if (result.error) {
                setError(result.error);
                setDeleteTarget(null);
            } else {
                setDeleteTarget(null);
            }
        });
    }

    const isUserOnly = editingRow?.type === "user_only";

    return (
        <>
            {/* Toolbar */}
            <Card className="p-4 rounded-2xl border-border/50 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="ค้นหา (ชื่อ, รหัส, อีเมล, เบอร์โทร)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="rounded-xl"
                        />
                        <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={handleSearch}>
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            size="icon"
                            className="rounded-xl shrink-0"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button className="rounded-xl gap-2" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        เพิ่มบุคลากร
                    </Button>
                </div>

                {showFilters && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <Select
                            value={currentDepartmentId || "_all"}
                            onValueChange={(v) => navigate({ department_id: v === "_all" ? "" : v, page: "" })}
                        >
                            <SelectTrigger className="rounded-xl sm:w-48">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="ทุกแผนก" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">ทุกแผนก</SelectItem>
                                {departmentsList.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={currentPositionId || "_all"}
                            onValueChange={(v) => navigate({ position_id: v === "_all" ? "" : v, page: "" })}
                        >
                            <SelectTrigger className="rounded-xl sm:w-48">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="ทุกตำแหน่ง" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">ทุกตำแหน่ง</SelectItem>
                                {positionsList.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={currentEmploymentStatus || "_all"}
                            onValueChange={(v) => navigate({ employment_status: v === "_all" ? "" : v, page: "" })}
                        >
                            <SelectTrigger className="rounded-xl sm:w-48">
                                <SelectValue placeholder="ทุกสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">ทุกสถานะ</SelectItem>
                                {EMPLOYMENT_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>{EMPLOYMENT_STATUS_LABELS[s]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </Card>

            {/* Table */}
            <Card className="rounded-2xl border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-28">รหัส</TableHead>
                            <TableHead>ชื่อ-นามสกุล</TableHead>
                            <TableHead>แผนก</TableHead>
                            <TableHead>ตำแหน่ง</TableHead>
                            <TableHead>อีเมล</TableHead>
                            <TableHead className="text-center w-24">Role</TableHead>
                            <TableHead className="text-center w-24">สถานะ</TableHead>
                            <TableHead className="text-right w-28">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {personnel.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                    <UserCog className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    ไม่พบข้อมูลบุคลากร
                                </TableCell>
                            </TableRow>
                        ) : (
                            personnel.map((row) => (
                                <TableRow key={`${row.type}-${row.id}`} className={row.type === "user_only" ? "bg-muted/30" : ""}>
                                    <TableCell>
                                        {row.employee_code ? (
                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.employee_code}</code>
                                        ) : (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <KeyRound className="h-3 w-3" />
                                                User only
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {row.first_name} {row.last_name}
                                            </p>
                                            {row.nickname && (
                                                <p className="text-xs text-muted-foreground">({row.nickname})</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {row.department ? (
                                            <span className="text-sm">{row.department.name}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.position ? (
                                            <span className="text-sm">{row.position.name}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.user_email ? (
                                            <span className="text-sm text-muted-foreground">{row.user_email}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">ไม่มีบัญชี</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {row.user_role ? (
                                            <Badge variant="secondary" className="text-[10px]">
                                                {ROLE_LABELS[row.user_role as RoleType] || row.user_role}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {row.employment_status ? (
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${EMPLOYMENT_STATUS_COLORS[row.employment_status as EmploymentStatusType] || ""}`}
                                            >
                                                {EMPLOYMENT_STATUS_LABELS[row.employment_status as EmploymentStatusType] || row.employment_status}
                                            </Badge>
                                        ) : row.user_is_active !== null ? (
                                            <Badge variant={row.user_is_active ? "default" : "secondary"} className="text-[10px]">
                                                {row.user_is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(row)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(row)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">ทั้งหมด {total} คน</p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline" size="sm" className="rounded-lg"
                                disabled={currentPage <= 1}
                                onClick={() => navigate({ page: String(currentPage - 1) })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">{currentPage} / {totalPages}</span>
                            <Button
                                variant="outline" size="sm" className="rounded-lg"
                                disabled={currentPage >= totalPages}
                                onClick={() => navigate({ page: String(currentPage + 1) })}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRow
                                ? isUserOnly ? "แก้ไขบัญชีผู้ใช้" : "แก้ไขข้อมูลบุคลากร"
                                : "เพิ่มบุคลากรใหม่"
                            }
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-2">
                        {error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</p>
                        )}

                        {/* ข้อมูลพนักงาน — ซ่อนเมื่อ user_only */}
                        {!isUserOnly && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                    <UserCircle className="h-4 w-4" />
                                    ข้อมูลพนักงาน
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>รหัสพนักงาน *</Label>
                                        <Input
                                            placeholder="ICI-0001"
                                            value={form.employee_code}
                                            onChange={(e) => setForm({ ...form, employee_code: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ชื่อเล่น</Label>
                                        <Input
                                            value={form.nickname}
                                            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ชื่อ *</Label>
                                        <Input
                                            value={form.first_name}
                                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>นามสกุล *</Label>
                                        <Input
                                            value={form.last_name}
                                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>เบอร์โทร</Label>
                                        <Input
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>เบอร์ภายใน</Label>
                                        <Input
                                            value={form.extension}
                                            onChange={(e) => setForm({ ...form, extension: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>วันเริ่มงาน</Label>
                                        <Input
                                            type="date"
                                            value={form.hire_date}
                                            onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>สถานะการจ้าง *</Label>
                                        <Select value={form.employment_status} onValueChange={(v) => setForm({ ...form, employment_status: v })}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {EMPLOYMENT_STATUSES.map((s) => (
                                                    <SelectItem key={s} value={s}>{EMPLOYMENT_STATUS_LABELS[s]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>แผนก</Label>
                                        <Select value={form.department_id || "_none"} onValueChange={(v) => setForm({ ...form, department_id: v === "_none" ? "" : v })}>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="เลือกแผนก" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">— ไม่ระบุ —</SelectItem>
                                                {departmentsList.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ตำแหน่ง</Label>
                                        <Select value={form.position_id || "_none"} onValueChange={(v) => setForm({ ...form, position_id: v === "_none" ? "" : v })}>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="เลือกตำแหน่ง" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">— ไม่ระบุ —</SelectItem>
                                                {positionsList.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>หัวหน้าโดยตรง</Label>
                                        <Select value={form.supervisor_id || "_none"} onValueChange={(v) => setForm({ ...form, supervisor_id: v === "_none" ? "" : v })}>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="เลือกหัวหน้า" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">— ไม่ระบุ —</SelectItem>
                                                {employeesList
                                                    .filter((e) => e.id !== editingRow?.id)
                                                    .map((e) => (
                                                        <SelectItem key={e.id} value={e.id}>
                                                            {e.first_name} {e.last_name} ({e.employee_code})
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* บัญชีเข้าระบบ */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <KeyRound className="h-4 w-4" />
                                    บัญชีเข้าระบบ
                                </h3>
                                {!editingRow && (
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="create_account"
                                            checked={form.create_account}
                                            onCheckedChange={(v) => setForm({ ...form, create_account: !!v })}
                                        />
                                        <Label htmlFor="create_account" className="text-sm cursor-pointer">
                                            สร้างบัญชี
                                        </Label>
                                    </div>
                                )}
                            </div>

                            {(form.create_account || editingRow?.user_id || isUserOnly) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {isUserOnly && (
                                        <div className="space-y-2 col-span-2">
                                            <Label>ชื่อ *</Label>
                                            <Input
                                                value={form.first_name}
                                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>อีเมล *</Label>
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            รหัสผ่าน{" "}
                                            {editingRow && <span className="text-muted-foreground">(เว้นว่าง = คงเดิม)</span>}
                                        </Label>
                                        <Input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            placeholder={editingRow ? "••••••" : "Password123"}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>บทบาท</Label>
                                        <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {ROLES.map((r) => (
                                                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>เปิดใช้งานบัญชี</Label>
                                        <Switch
                                            checked={form.user_is_active}
                                            onCheckedChange={(v) => setForm({ ...form, user_is_active: v })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button className="rounded-xl" onClick={handleSubmit} disabled={isPending}>
                                {isPending ? "กำลังบันทึก..." : "บันทึก"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="ยืนยันการลบ"
                description={
                    deleteTarget?.type === "user_only"
                        ? `คุณต้องการลบบัญชี "${deleteTarget?.first_name}" (${deleteTarget?.user_email}) หรือไม่?`
                        : `คุณต้องการลบบุคลากร "${deleteTarget?.first_name} ${deleteTarget?.last_name}" (${deleteTarget?.employee_code}) หรือไม่? ${deleteTarget?.user_id ? "บัญชีเข้าระบบจะถูกลบด้วย" : ""}`
                }
                onConfirm={handleDelete}
            />
        </>
    );
}
