"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
    createUser,
    updateUser,
    toggleUserActive,
    deleteUser,
} from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { ROLES, ROLE_LABELS, type RoleType } from "@/lib/constants";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: Date | string;
}

interface UsersClientProps {
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
    currentSearch: string;
    currentRole: string;
}

export function UsersClient({
    users,
    total,
    totalPages,
    currentPage,
    currentSearch,
    currentRole,
}: UsersClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState(currentSearch);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isPending, startTransition] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const [formName, setFormName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formRole, setFormRole] = useState<string>("EMPLOYEE");
    const [formActive, setFormActive] = useState(true);
    const [formError, setFormError] = useState("");

    function updateSearch(newSearch: string) {
        const params = new URLSearchParams();
        if (newSearch) params.set("search", newSearch);
        if (currentRole) params.set("role", currentRole);
        router.push(`/admin/users?${params.toString()}`);
    }

    function updateRole(newRole: string) {
        const params = new URLSearchParams();
        if (currentSearch) params.set("search", currentSearch);
        if (newRole && newRole !== "ALL") params.set("role", newRole);
        router.push(`/admin/users?${params.toString()}`);
    }

    function goToPage(page: number) {
        const params = new URLSearchParams();
        if (currentSearch) params.set("search", currentSearch);
        if (currentRole) params.set("role", currentRole);
        params.set("page", page.toString());
        router.push(`/admin/users?${params.toString()}`);
    }

    function openCreate() {
        setEditingUser(null);
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormRole("EMPLOYEE");
        setFormActive(true);
        setFormError("");
        setDialogOpen(true);
    }

    function openEdit(user: User) {
        setEditingUser(user);
        setFormName(user.name);
        setFormEmail(user.email);
        setFormPassword("");
        setFormRole(user.role);
        setFormActive(user.is_active);
        setFormError("");
        setDialogOpen(true);
    }

    async function handleSubmit() {
        setFormError("");
        const data = {
            name: formName,
            email: formEmail,
            password: formPassword || undefined,
            role: formRole,
            is_active: formActive,
        };

        startTransition(async () => {
            const result = editingUser
                ? await updateUser(editingUser.id, data)
                : await createUser(data);

            if (result.error) {
                setFormError(result.error);
            } else {
                setDialogOpen(false);
                router.refresh();
            }
        });
    }

    async function handleToggle(id: string) {
        startTransition(async () => {
            await toggleUserActive(id);
            router.refresh();
        });
    }

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        startTransition(async () => {
            await deleteUser(deleteTarget);
            setDeleteTarget(null);
            router.refresh();
        });
    }

    return (
        <div className="space-y-4">
            <Card className="p-4 rounded-2xl border-border/50">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาผู้ใช้..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && updateSearch(search)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                    <Select value={currentRole || "ALL"} onValueChange={updateRole}>
                        <SelectTrigger className="w-full sm:w-44 rounded-xl">
                            <SelectValue placeholder="กรองตามบทบาท" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">ทุกบทบาท</SelectItem>
                            {ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                    {ROLE_LABELS[role]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl" onClick={openCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                เพิ่มผู้ใช้
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {formError && (
                                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                                        {formError}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>ชื่อ</Label>
                                    <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>อีเมล</Label>
                                    <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        รหัสผ่าน{" "}
                                        {editingUser && <span className="text-muted-foreground">(เว้นว่างเพื่อคงเดิม)</span>}
                                    </Label>
                                    <Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>บทบาท</Label>
                                    <Select value={formRole} onValueChange={setFormRole}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>เปิดใช้งาน</Label>
                                    <Switch checked={formActive} onCheckedChange={setFormActive} />
                                </div>
                                <Button className="w-full rounded-xl" onClick={handleSubmit} disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingUser ? "อัปเดต" : "สร้าง"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </Card>

            <Card className="rounded-2xl border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อ</TableHead>
                            <TableHead>อีเมล</TableHead>
                            <TableHead>บทบาท</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead>สร้างเมื่อ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    ไม่พบผู้ใช้
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {ROLE_LABELS[user.role as RoleType]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={user.is_active} onCheckedChange={() => handleToggle(user.id)} disabled={isPending} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(user.created_at), "d MMM yyyy", { locale: th })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(user.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        แสดง {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, total)} จากทั้งหมด {total} รายการ
                    </p>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="ยืนยันการลบผู้ใช้"
                description="คุณต้องการลบผู้ใช้นี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
                confirmLabel="ลบ"
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
