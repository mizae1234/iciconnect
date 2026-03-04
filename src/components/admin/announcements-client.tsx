"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncementActive,
    deleteAnnouncement,
} from "@/lib/actions/announcements";
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
    Pin,
} from "lucide-react";
import {
    ROLES,
    ROLE_LABELS,
    ANNOUNCEMENT_CATEGORIES,
    CATEGORY_COLORS,
    CATEGORY_LABELS,
    type AnnouncementCategoryType,
} from "@/lib/constants";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    is_pinned: boolean;
    start_at: Date | string;
    expire_at: Date | string | null;
    is_active: boolean;
    target_roles: string[];
    attachment_url: string | null;
    created_by: string;
    creator: { name: string };
    created_at: Date | string;
}

interface AnnouncementsClientProps {
    announcements: Announcement[];
    total: number;
    totalPages: number;
    currentPage: number;
    currentSearch: string;
    currentCategory: string;
}

export function AnnouncementsClient({
    announcements,
    total,
    totalPages,
    currentPage,
    currentSearch,
    currentCategory,
}: AnnouncementsClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState(currentSearch);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
    const [isPending, startTransition] = useTransition();

    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formCategory, setFormCategory] = useState("GENERAL");
    const [formPinned, setFormPinned] = useState(false);
    const [formStartAt, setFormStartAt] = useState("");
    const [formExpireAt, setFormExpireAt] = useState("");
    const [formActive, setFormActive] = useState(true);
    const [formRoles, setFormRoles] = useState<string[]>([...ROLES]);
    const [formAttachment, setFormAttachment] = useState("");
    const [formError, setFormError] = useState("");

    function updateSearch(newSearch: string) {
        const params = new URLSearchParams();
        if (newSearch) params.set("search", newSearch);
        if (currentCategory) params.set("category", currentCategory);
        router.push(`/admin/announcements?${params.toString()}`);
    }

    function updateCategory(newCat: string) {
        const params = new URLSearchParams();
        if (currentSearch) params.set("search", currentSearch);
        if (newCat && newCat !== "ALL") params.set("category", newCat);
        router.push(`/admin/announcements?${params.toString()}`);
    }

    function goToPage(page: number) {
        const params = new URLSearchParams();
        if (currentSearch) params.set("search", currentSearch);
        if (currentCategory) params.set("category", currentCategory);
        params.set("page", page.toString());
        router.push(`/admin/announcements?${params.toString()}`);
    }

    function openCreate() {
        setEditingAnn(null);
        setFormTitle("");
        setFormContent("");
        setFormCategory("GENERAL");
        setFormPinned(false);
        setFormStartAt(new Date().toISOString().slice(0, 16));
        setFormExpireAt("");
        setFormActive(true);
        setFormRoles([...ROLES]);
        setFormAttachment("");
        setFormError("");
        setDialogOpen(true);
    }

    function openEdit(ann: Announcement) {
        setEditingAnn(ann);
        setFormTitle(ann.title);
        setFormContent(ann.content);
        setFormCategory(ann.category);
        setFormPinned(ann.is_pinned);
        setFormStartAt(new Date(ann.start_at).toISOString().slice(0, 16));
        setFormExpireAt(ann.expire_at ? new Date(ann.expire_at).toISOString().slice(0, 16) : "");
        setFormActive(ann.is_active);
        setFormRoles([...ann.target_roles]);
        setFormAttachment(ann.attachment_url || "");
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
            title: formTitle,
            content: formContent,
            category: formCategory,
            is_pinned: formPinned,
            start_at: formStartAt,
            expire_at: formExpireAt || null,
            is_active: formActive,
            target_roles: formRoles,
            attachment_url: formAttachment || null,
        };

        startTransition(async () => {
            const result = editingAnn
                ? await updateAnnouncement(editingAnn.id, data)
                : await createAnnouncement(data);

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
            await toggleAnnouncementActive(id);
            router.refresh();
        });
    }

    async function handleDelete(id: string) {
        if (!confirm("คุณต้องการลบประกาศนี้หรือไม่?")) return;
        startTransition(async () => {
            await deleteAnnouncement(id);
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
                            placeholder="ค้นหาประกาศ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && updateSearch(search)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                    <Select value={currentCategory || "ALL"} onValueChange={updateCategory}>
                        <SelectTrigger className="w-full sm:w-40 rounded-xl">
                            <SelectValue placeholder="หมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">ทุกหมวดหมู่</SelectItem>
                            {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl" onClick={openCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                เพิ่มประกาศ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAnn ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {formError && (
                                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                                        {formError}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>หัวข้อ</Label>
                                    <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>เนื้อหา</Label>
                                    <Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} className="rounded-xl" rows={5} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>หมวดหมู่</Label>
                                        <Select value={formCategory} onValueChange={setFormCategory}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {CATEGORY_LABELS[cat]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-end">
                                        <div className="flex items-center justify-between">
                                            <Label>ปักหมุด</Label>
                                            <Switch checked={formPinned} onCheckedChange={setFormPinned} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>เริ่มแสดง</Label>
                                        <Input type="datetime-local" value={formStartAt} onChange={(e) => setFormStartAt(e.target.value)} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>หมดอายุ <span className="text-muted-foreground">(ไม่บังคับ)</span></Label>
                                        <Input type="datetime-local" value={formExpireAt} onChange={(e) => setFormExpireAt(e.target.value)} className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>URL ไฟล์แนบ <span className="text-muted-foreground">(ไม่บังคับ)</span></Label>
                                    <Input value={formAttachment} onChange={(e) => setFormAttachment(e.target.value)} placeholder="https://example.com/file.pdf" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>กลุ่มเป้าหมาย</Label>
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
                                    {editingAnn ? "อัปเดต" : "สร้าง"}
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
                            <TableHead>หัวข้อ</TableHead>
                            <TableHead>หมวดหมู่</TableHead>
                            <TableHead>กำหนดเวลา</TableHead>
                            <TableHead>ปักหมุด</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {announcements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    ไม่พบประกาศ
                                </TableCell>
                            </TableRow>
                        ) : (
                            announcements.map((ann) => (
                                <TableRow key={ann.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{ann.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{ann.content}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={CATEGORY_COLORS[ann.category as AnnouncementCategoryType]}>
                                            {CATEGORY_LABELS[ann.category as AnnouncementCategoryType]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        <div>{format(new Date(ann.start_at), "d MMM yyyy HH:mm", { locale: th })}</div>
                                        {ann.expire_at && (
                                            <div className="text-amber-600">
                                                → {format(new Date(ann.expire_at), "d MMM yyyy HH:mm", { locale: th })}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {ann.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={ann.is_active} onCheckedChange={() => handleToggle(ann.id)} disabled={isPending} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ann)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(ann.id)}>
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
