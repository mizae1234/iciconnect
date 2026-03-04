"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    createApplication,
    updateApplication,
    toggleApplicationActive,
    deleteApplication,
} from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
    ExternalLink,
} from "lucide-react";
import { ROLES, ROLE_LABELS, type RoleType } from "@/lib/constants";

interface Application {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    link_url: string;
    open_type: string;
    display_order: number;
    is_active: boolean;
    allowed_roles: string[];
    created_at: Date | string;
}

interface ApplicationsClientProps {
    applications: Application[];
    total: number;
    totalPages: number;
    currentPage: number;
    currentSearch: string;
}

export function ApplicationsClient({
    applications,
    total,
    totalPages,
    currentPage,
    currentSearch,
}: ApplicationsClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState(currentSearch);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [isPending, startTransition] = useTransition();

    const [formName, setFormName] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formIcon, setFormIcon] = useState("");
    const [formLink, setFormLink] = useState("");
    const [formOpenType, setFormOpenType] = useState("new_tab");
    const [formOrder, setFormOrder] = useState(0);
    const [formActive, setFormActive] = useState(true);
    const [formRoles, setFormRoles] = useState<string[]>([...ROLES]);
    const [formError, setFormError] = useState("");

    function updateSearch(newSearch: string) {
        const params = new URLSearchParams();
        if (newSearch) params.set("search", newSearch);
        router.push(`/admin/applications?${params.toString()}`);
    }

    function goToPage(page: number) {
        const params = new URLSearchParams();
        if (currentSearch) params.set("search", currentSearch);
        params.set("page", page.toString());
        router.push(`/admin/applications?${params.toString()}`);
    }

    function openCreate() {
        setEditingApp(null);
        setFormName("");
        setFormDesc("");
        setFormIcon("");
        setFormLink("");
        setFormOpenType("new_tab");
        setFormOrder(0);
        setFormActive(true);
        setFormRoles([...ROLES]);
        setFormError("");
        setDialogOpen(true);
    }

    function openEdit(app: Application) {
        setEditingApp(app);
        setFormName(app.name);
        setFormDesc(app.description);
        setFormIcon(app.icon_url);
        setFormLink(app.link_url);
        setFormOpenType(app.open_type);
        setFormOrder(app.display_order);
        setFormActive(app.is_active);
        setFormRoles([...app.allowed_roles]);
        setFormError("");
        setDialogOpen(true);
    }

    function toggleRole(role: string) {
        setFormRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    }

    async function handleSubmit() {
        setFormError("");
        const data = {
            name: formName,
            description: formDesc,
            icon_url: formIcon,
            link_url: formLink,
            open_type: formOpenType,
            display_order: formOrder,
            is_active: formActive,
            allowed_roles: formRoles,
        };

        startTransition(async () => {
            const result = editingApp
                ? await updateApplication(editingApp.id, data)
                : await createApplication(data);

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
            await toggleApplicationActive(id);
            router.refresh();
        });
    }

    async function handleDelete(id: string) {
        if (!confirm("คุณต้องการลบแอปพลิเคชันนี้หรือไม่?")) return;
        startTransition(async () => {
            await deleteApplication(id);
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
                            placeholder="ค้นหาแอปพลิเคชัน..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && updateSearch(search)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl" onClick={openCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                เพิ่มแอปพลิเคชัน
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingApp ? "แก้ไขแอปพลิเคชัน" : "เพิ่มแอปพลิเคชันใหม่"}
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
                                    <Label>รายละเอียด</Label>
                                    <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="rounded-xl" rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL ไอคอน</Label>
                                    <Input value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="https://example.com/icon.png" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL ลิงก์</Label>
                                    <Input value={formLink} onChange={(e) => setFormLink(e.target.value)} placeholder="https://example.com" className="rounded-xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>รูปแบบการเปิด</Label>
                                        <Select value={formOpenType} onValueChange={setFormOpenType}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="same_tab">แท็บเดิม</SelectItem>
                                                <SelectItem value="new_tab">แท็บใหม่</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ลำดับการแสดง</Label>
                                        <Input type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)} className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>สิทธิ์การเข้าถึง</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ROLES.map((role) => (
                                            <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <Checkbox checked={formRoles.includes(role)} onCheckedChange={() => toggleRole(role)} />
                                                {ROLE_LABELS[role]}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>เปิดใช้งาน</Label>
                                    <Switch checked={formActive} onCheckedChange={setFormActive} />
                                </div>
                                <Button className="w-full rounded-xl" onClick={handleSubmit} disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingApp ? "อัปเดต" : "สร้าง"}
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
                            <TableHead>ลำดับ</TableHead>
                            <TableHead>ชื่อ</TableHead>
                            <TableHead>ลิงก์</TableHead>
                            <TableHead>เปิดแบบ</TableHead>
                            <TableHead>สิทธิ์</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    ไม่พบแอปพลิเคชัน
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-mono text-sm">{app.display_order}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                {app.icon_url ? (
                                                    <img src={app.icon_url} alt="" className="w-5 h-5 object-contain" />
                                                ) : (
                                                    <span className="text-xs font-bold text-primary">{app.name[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{app.name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{app.description}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <a href={app.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                            <ExternalLink className="h-3 w-3" />
                                            ลิงก์
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {app.open_type === "new_tab" ? "แท็บใหม่" : "แท็บเดิม"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {app.allowed_roles.length === ROLES.length ? (
                                                <Badge variant="secondary" className="text-xs">ทั้งหมด</Badge>
                                            ) : (
                                                app.allowed_roles.slice(0, 2).map((role) => (
                                                    <Badge key={role} variant="secondary" className="text-xs">
                                                        {ROLE_LABELS[role as RoleType]}
                                                    </Badge>
                                                ))
                                            )}
                                            {app.allowed_roles.length > 2 && app.allowed_roles.length < ROLES.length && (
                                                <Badge variant="secondary" className="text-xs">+{app.allowed_roles.length - 2}</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={app.is_active} onCheckedChange={() => handleToggle(app.id)} disabled={isPending} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(app)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(app.id)}>
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
        </div>
    );
}
