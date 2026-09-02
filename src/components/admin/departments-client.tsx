"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "@/lib/actions/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
    Building2,
    Users,
    ChevronLeft,
    ChevronRight,
    Crown,
} from "lucide-react";

interface Department {
    id: string;
    code: string;
    name: string;
    name_en: string | null;
    description: string | null;
    is_active: boolean;
    parent_id: string | null;
    head_id: string | null;
    head: {
        id: string;
        first_name: string;
        last_name: string;
        employee_code: string;
    } | null;
    parent: {
        id: string;
        name: string;
        code: string;
    } | null;
    _count: {
        employees: number;
        children: number;
    };
}

interface EmployeeOption {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
}

interface Props {
    departments: Department[];
    total: number;
    totalPages: number;
    currentPage: number;
    currentSearch: string;
    employeesList: EmployeeOption[];
}

const EMPTY_FORM = {
    code: "",
    name: "",
    name_en: "",
    description: "",
    parent_id: "",
    head_id: "",
    is_active: true,
};

export function DepartmentsClient({
    departments,
    total,
    totalPages,
    currentPage,
    currentSearch,
    employeesList,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(currentSearch);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

    function navigate(params: Record<string, string>) {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("tab", "departments");
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
        setForm(EMPTY_FORM);
        setError("");
        setDialogOpen(true);
    }

    function openEdit(dept: Department) {
        setEditingId(dept.id);
        setForm({
            code: dept.code,
            name: dept.name,
            name_en: dept.name_en || "",
            description: dept.description || "",
            parent_id: dept.parent_id || "",
            head_id: dept.head_id || "",
            is_active: dept.is_active,
        });
        setError("");
        setDialogOpen(true);
    }

    async function handleSubmit() {
        setError("");
        startTransition(async () => {
            const submitData = {
                ...form,
                name_en: form.name_en || null,
                description: form.description || null,
                parent_id: form.parent_id || null,
                head_id: form.head_id || null,
            };

            const result = editingId
                ? await updateDepartment(editingId, submitData)
                : await createDepartment(submitData);

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
            const result = await deleteDepartment(deleteTarget.id);
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
            <Card className="p-4 rounded-2xl border-border/50">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="ค้นหาแผนก..."
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
                    </div>
                    <Button className="rounded-xl gap-2" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        เพิ่มแผนก
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">รหัส</TableHead>
                            <TableHead>ชื่อแผนก</TableHead>
                            <TableHead>หัวหน้าแผนก</TableHead>
                            <TableHead className="text-center w-24">สมาชิก</TableHead>
                            <TableHead className="text-center w-24">สถานะ</TableHead>
                            <TableHead className="text-right w-28">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <Building2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    ไม่พบข้อมูลแผนก
                                </TableCell>
                            </TableRow>
                        ) : (
                            departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell>
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                            {dept.code}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{dept.name}</p>
                                            {dept.name_en && (
                                                <p className="text-xs text-muted-foreground">
                                                    {dept.name_en}
                                                </p>
                                            )}
                                            {dept.parent && (
                                                <p className="text-xs text-muted-foreground">
                                                    สังกัด: {dept.parent.name}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {dept.head ? (
                                            <div className="flex items-center gap-2">
                                                <Crown className="h-3.5 w-3.5 text-amber-500" />
                                                <span className="text-sm">
                                                    {dept.head.first_name} {dept.head.last_name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                ยังไม่กำหนด
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-sm">{dept._count.employees}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={dept.is_active ? "default" : "secondary"}
                                            className="text-[10px]"
                                        >
                                            {dept.is_active ? "ใช้งาน" : "ปิด"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => openEdit(dept)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(dept)}
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
                            ทั้งหมด {total} แผนก
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
                <DialogContent className="sm:max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "แก้ไขแผนก" : "เพิ่มแผนกใหม่"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        {error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                                {error}
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>รหัสแผนก *</Label>
                                <Input
                                    placeholder="เช่น HR, IT"
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm({ ...form, code: e.target.value.toUpperCase() })
                                    }
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>ชื่อแผนก *</Label>
                                <Input
                                    placeholder="เช่น ฝ่ายบุคคล"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>ชื่อภาษาอังกฤษ</Label>
                            <Input
                                placeholder="เช่น Human Resources"
                                value={form.name_en}
                                onChange={(e) =>
                                    setForm({ ...form, name_en: e.target.value })
                                }
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>รายละเอียด</Label>
                            <Textarea
                                placeholder="อธิบายหน้าที่ของแผนก..."
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                                className="rounded-xl"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>หัวหน้าแผนก</Label>
                            <Select
                                value={form.head_id}
                                onValueChange={(v) =>
                                    setForm({ ...form, head_id: v === "_none" ? "" : v })
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="เลือกหัวหน้าแผนก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">— ไม่กำหนด —</SelectItem>
                                    {employeesList.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name} ({emp.employee_code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>เปิดใช้งาน</Label>
                            <Switch
                                checked={form.is_active}
                                onCheckedChange={(v) =>
                                    setForm({ ...form, is_active: v })
                                }
                            />
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
                description={`คุณต้องการลบแผนก "${deleteTarget?.name}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
                onConfirm={handleDelete}
            />
        </>
    );
}
