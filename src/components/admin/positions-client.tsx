"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createPosition,
    updatePosition,
    deletePosition,
} from "@/lib/actions/positions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Briefcase,
    Users,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface Position {
    id: string;
    code: string;
    name: string;
    level: number;
    is_active: boolean;
    _count: {
        employees: number;
    };
}

interface Props {
    positions: Position[];
    total: number;
    totalPages: number;
    currentPage: number;
    currentSearch: string;
}

const EMPTY_FORM = {
    code: "",
    name: "",
    level: 0,
    is_active: true,
};

export function PositionsClient({
    positions,
    total,
    totalPages,
    currentPage,
    currentSearch,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(currentSearch);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);

    function navigate(params: Record<string, string>) {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("tab", "positions");
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

    function openEdit(pos: Position) {
        setEditingId(pos.id);
        setForm({
            code: pos.code,
            name: pos.name,
            level: pos.level,
            is_active: pos.is_active,
        });
        setError("");
        setDialogOpen(true);
    }

    async function handleSubmit() {
        setError("");
        startTransition(async () => {
            const result = editingId
                ? await updatePosition(editingId, form)
                : await createPosition(form);

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
            const result = await deletePosition(deleteTarget.id);
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
                            placeholder="ค้นหาตำแหน่ง..."
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
                        เพิ่มตำแหน่ง
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">รหัส</TableHead>
                            <TableHead>ชื่อตำแหน่ง</TableHead>
                            <TableHead className="text-center w-24">ระดับ</TableHead>
                            <TableHead className="text-center w-24">พนักงาน</TableHead>
                            <TableHead className="text-center w-24">สถานะ</TableHead>
                            <TableHead className="text-right w-28">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {positions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    ไม่พบข้อมูลตำแหน่ง
                                </TableCell>
                            </TableRow>
                        ) : (
                            positions.map((pos) => (
                                <TableRow key={pos.id}>
                                    <TableCell>
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                            {pos.code}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{pos.name}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-[10px]">
                                            Lv.{pos.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-sm">{pos._count.employees}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={pos.is_active ? "default" : "secondary"}
                                            className="text-[10px]"
                                        >
                                            {pos.is_active ? "ใช้งาน" : "ปิด"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => openEdit(pos)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(pos)}
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
                            ทั้งหมด {total} ตำแหน่ง
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
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่งใหม่"}
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
                                <Label>รหัสตำแหน่ง *</Label>
                                <Input
                                    placeholder="เช่น MGR"
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm({ ...form, code: e.target.value.toUpperCase() })
                                    }
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>ระดับ</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.level}
                                    onChange={(e) =>
                                        setForm({ ...form, level: parseInt(e.target.value) || 0 })
                                    }
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>ชื่อตำแหน่ง *</Label>
                            <Input
                                placeholder="เช่น ผู้จัดการแผนก"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="rounded-xl"
                            />
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
                description={`คุณต้องการลบตำแหน่ง "${deleteTarget?.name}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
                onConfirm={handleDelete}
            />
        </>
    );
}
