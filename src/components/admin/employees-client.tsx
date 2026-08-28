"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from "@/lib/actions/employees";
import {
    EMPLOYMENT_STATUS_LABELS,
    EMPLOYMENT_STATUS_COLORS,
    EMPLOYMENT_STATUSES,
    type EmploymentStatusType,
} from "@/lib/constants";
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
    Link2,
    Building2,
    Briefcase,
    Filter,
} from "lucide-react";

interface Employee {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    nickname: string | null;
    phone: string | null;
    extension: string | null;
    avatar_url: string | null;
    hire_date: Date | null;
    employment_status: string;
    user_id: string | null;
    department_id: string | null;
    position_id: string | null;
    supervisor_id: string | null;
    department: { id: string; name: string; code: string } | null;
    position: { id: string; name: string; code: string } | null;
    supervisor: {
        id: string;
        first_name: string;
        last_name: string;
        employee_code: string;
    } | null;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        is_active: boolean;
    } | null;
}

interface DeptOption {
    id: string;
    name: string;
    code: string;
}

interface PosOption {
    id: string;
    name: string;
    code: string;
    level: number;
}

interface EmpOption {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
}

interface UserOption {
    id: string;
    name: string;
    email: string;
}

interface Props {
    employees: Employee[];
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
    unlinkedUsers: UserOption[];
    nextEmployeeCode: string;
}

const EMPTY_FORM = {
    employee_code: "",
    first_name: "",
    last_name: "",
    nickname: "",
    phone: "",
    extension: "",
    avatar_url: "",
    hire_date: "",
    employment_status: "ACTIVE" as string,
    user_id: "",
    department_id: "",
    position_id: "",
    supervisor_id: "",
};

export function EmployeesClient({
    employees,
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
    unlinkedUsers,
    nextEmployeeCode,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(currentSearch);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
    const [showFilters, setShowFilters] = useState(
        !!(currentDepartmentId || currentPositionId || currentEmploymentStatus)
    );

    function navigate(params: Record<string, string>) {
        const sp = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([k, v]) => {
            if (v) sp.set(k, v);
            else sp.delete(k);
        });
        router.push(`/admin/employees?${sp.toString()}`);
    }

    function handleSearch() {
        navigate({ search, page: "" });
    }

    function openCreate() {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, employee_code: nextEmployeeCode });
        setError("");
        setDialogOpen(true);
    }

    function openEdit(emp: Employee) {
        setEditingId(emp.id);
        setForm({
            employee_code: emp.employee_code,
            first_name: emp.first_name,
            last_name: emp.last_name,
            nickname: emp.nickname || "",
            phone: emp.phone || "",
            extension: emp.extension || "",
            avatar_url: emp.avatar_url || "",
            hire_date: emp.hire_date ? new Date(emp.hire_date).toISOString().split("T")[0] : "",
            employment_status: emp.employment_status,
            user_id: emp.user_id || "",
            department_id: emp.department_id || "",
            position_id: emp.position_id || "",
            supervisor_id: emp.supervisor_id || "",
        });
        setError("");
        setDialogOpen(true);
    }

    // When editing, show current linked user in the dropdown too
    function getUserOptions() {
        const editingEmployee = editingId
            ? employees.find((e) => e.id === editingId)
            : null;
        const options = [...unlinkedUsers];
        if (editingEmployee?.user) {
            const alreadyInList = options.some((u) => u.id === editingEmployee.user!.id);
            if (!alreadyInList) {
                options.unshift({
                    id: editingEmployee.user.id,
                    name: editingEmployee.user.name,
                    email: editingEmployee.user.email,
                });
            }
        }
        return options;
    }

    async function handleSubmit() {
        setError("");
        startTransition(async () => {
            const submitData = {
                ...form,
                nickname: form.nickname || null,
                phone: form.phone || null,
                extension: form.extension || null,
                avatar_url: form.avatar_url || null,
                hire_date: form.hire_date || null,
                user_id: form.user_id || null,
                department_id: form.department_id || null,
                position_id: form.position_id || null,
                supervisor_id: form.supervisor_id || null,
            };

            const result = editingId
                ? await updateEmployee(editingId, submitData)
                : await createEmployee(submitData);

            if (result.error) {
                setError(result.error);
            } else {
                setDialogOpen(false);
            }
        });
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        startTransition(async () => {
            const result = await deleteEmployee(deleteTarget.id);
            if (result.error) {
                setError(result.error);
                setDeleteTarget(null);
            } else {
                setDeleteTarget(null);
            }
        });
    }

    return (
        <>
            {/* Toolbar */}
            <Card className="p-4 rounded-2xl border-border/50 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="ค้นหาพนักงาน (ชื่อ, รหัส, เบอร์โทร)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="rounded-xl"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl shrink-0"
                            onClick={handleSearch}
                        >
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
                        เพิ่มพนักงาน
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <Select
                            value={currentDepartmentId || "_all"}
                            onValueChange={(v) =>
                                navigate({ department_id: v === "_all" ? "" : v, page: "" })
                            }
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
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={currentPositionId || "_all"}
                            onValueChange={(v) =>
                                navigate({ position_id: v === "_all" ? "" : v, page: "" })
                            }
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
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={currentEmploymentStatus || "_all"}
                            onValueChange={(v) =>
                                navigate({ employment_status: v === "_all" ? "" : v, page: "" })
                            }
                        >
                            <SelectTrigger className="rounded-xl sm:w-48">
                                <SelectValue placeholder="ทุกสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">ทุกสถานะ</SelectItem>
                                {EMPLOYMENT_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {EMPLOYMENT_STATUS_LABELS[s]}
                                    </SelectItem>
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
                            <TableHead>หัวหน้า</TableHead>
                            <TableHead className="text-center w-24">สถานะ</TableHead>
                            <TableHead className="text-center w-20">บัญชี</TableHead>
                            <TableHead className="text-right w-28">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                    <UserCog className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    ไม่พบข้อมูลพนักงาน
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell>
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                            {emp.employee_code}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {emp.first_name} {emp.last_name}
                                            </p>
                                            {emp.nickname && (
                                                <p className="text-xs text-muted-foreground">
                                                    ({emp.nickname})
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {emp.department ? (
                                            <span className="text-sm">{emp.department.name}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {emp.position ? (
                                            <span className="text-sm">{emp.position.name}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {emp.supervisor ? (
                                            <span className="text-sm">
                                                {emp.supervisor.first_name} {emp.supervisor.last_name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] ${EMPLOYMENT_STATUS_COLORS[emp.employment_status as EmploymentStatusType] || ""}`}
                                        >
                                            {EMPLOYMENT_STATUS_LABELS[emp.employment_status as EmploymentStatusType] || emp.employment_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {emp.user ? (
                                            <Link2 className="h-4 w-4 mx-auto text-green-600" />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => openEdit(emp)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(emp)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                            ทั้งหมด {total} คน
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                disabled={currentPage <= 1}
                                onClick={() =>
                                    navigate({ page: String(currentPage - 1) })
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    navigate({ page: String(currentPage + 1) })
                                }
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
                            {editingId ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-2">
                        {error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                                {error}
                            </p>
                        )}

                        {/* ข้อมูลส่วนตัว */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                ข้อมูลส่วนตัว
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>รหัสพนักงาน *</Label>
                                    <Input
                                        placeholder="ICI-0001"
                                        value={form.employee_code}
                                        onChange={(e) =>
                                            setForm({ ...form, employee_code: e.target.value })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>ชื่อเล่น</Label>
                                    <Input
                                        placeholder="เช่น ชาย"
                                        value={form.nickname}
                                        onChange={(e) =>
                                            setForm({ ...form, nickname: e.target.value })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>ชื่อ *</Label>
                                    <Input
                                        placeholder="ชื่อจริง"
                                        value={form.first_name}
                                        onChange={(e) =>
                                            setForm({ ...form, first_name: e.target.value })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>นามสกุล *</Label>
                                    <Input
                                        placeholder="นามสกุล"
                                        value={form.last_name}
                                        onChange={(e) =>
                                            setForm({ ...form, last_name: e.target.value })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>เบอร์โทร</Label>
                                    <Input
                                        placeholder="081-xxx-xxxx"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({ ...form, phone: e.target.value })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>เบอร์ภายใน</Label>
                                    <Input
                                        placeholder="1234"
                                        value={form.extension}
                                        onChange={(e) =>
                                            setForm({ ...form, extension: e.target.value })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>วันเริ่มงาน</Label>
                                    <Input
                                        type="date"
                                        value={form.hire_date}
                                        onChange={(e) =>
                                            setForm({ ...form, hire_date: e.target.value })
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>สถานะการจ้าง *</Label>
                                    <Select
                                        value={form.employment_status}
                                        onValueChange={(v) =>
                                            setForm({ ...form, employment_status: v })
                                        }
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EMPLOYMENT_STATUSES.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {EMPLOYMENT_STATUS_LABELS[s]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* ข้อมูลองค์กร */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                ข้อมูลองค์กร
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>แผนก</Label>
                                    <Select
                                        value={form.department_id || "_none"}
                                        onValueChange={(v) =>
                                            setForm({ ...form, department_id: v === "_none" ? "" : v })
                                        }
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="เลือกแผนก" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none">— ไม่ระบุ —</SelectItem>
                                            {departmentsList.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>ตำแหน่ง</Label>
                                    <Select
                                        value={form.position_id || "_none"}
                                        onValueChange={(v) =>
                                            setForm({ ...form, position_id: v === "_none" ? "" : v })
                                        }
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="เลือกตำแหน่ง" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none">— ไม่ระบุ —</SelectItem>
                                            {positionsList.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>หัวหน้าโดยตรง</Label>
                                    <Select
                                        value={form.supervisor_id || "_none"}
                                        onValueChange={(v) =>
                                            setForm({ ...form, supervisor_id: v === "_none" ? "" : v })
                                        }
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="เลือกหัวหน้า" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none">— ไม่ระบุ —</SelectItem>
                                            {employeesList
                                                .filter((e) => e.id !== editingId)
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

                        {/* เชื่อมบัญชีผู้ใช้ */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                เชื่อมบัญชีผู้ใช้ (Login Account)
                            </h3>
                            <Select
                                value={form.user_id || "_none"}
                                onValueChange={(v) =>
                                    setForm({ ...form, user_id: v === "_none" ? "" : v })
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="เลือกบัญชีผู้ใช้" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">— ไม่เชื่อม —</SelectItem>
                                    {getUserOptions().map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                เลือกบัญชี User ที่ยังไม่ถูกเชื่อมกับพนักงานอื่น
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setDialogOpen(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                className="rounded-xl"
                                onClick={handleSubmit}
                                disabled={isPending}
                            >
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
                description={`คุณต้องการลบพนักงาน "${deleteTarget?.first_name} ${deleteTarget?.last_name}" (${deleteTarget?.employee_code}) หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
                onConfirm={handleDelete}
            />
        </>
    );
}
