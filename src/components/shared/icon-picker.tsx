"use client";

import { useState } from "react";
import {
    Mail, Globe, FileText, Users, HeadphonesIcon, BookOpen,
    Shield, BarChart3, Calendar, Clock, CreditCard, Database,
    FolderOpen, HardDrive, Headphones, Heart, Home, Image,
    Key, Laptop, Layout, Link, Lock, MapPin, MessageSquare,
    Monitor, Phone, Printer, Search, Settings, ShoppingCart,
    Star, Target, TrendingUp, Upload, Video, Wifi, Zap,
    Building2, Briefcase, Calculator, ClipboardList, Cloud,
    Code, Cpu, DollarSign, Gift, Megaphone, Package, PieChart,
    Send, Server, Truck, UserCheck, Wrench, Activity, Archive,
    Bell, Bookmark, Camera, CheckCircle, Compass, Edit,
    ExternalLink, Eye, Flag, HelpCircle, Info, Layers, List,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface IconOption {
    name: string;
    label: string;
    icon: LucideIcon;
    category: string;
}

export const ICON_OPTIONS: IconOption[] = [
    // สื่อสาร
    { name: "mail", label: "อีเมล", icon: Mail, category: "สื่อสาร" },
    { name: "message-square", label: "แชท", icon: MessageSquare, category: "สื่อสาร" },
    { name: "phone", label: "โทรศัพท์", icon: Phone, category: "สื่อสาร" },
    { name: "send", label: "ส่ง", icon: Send, category: "สื่อสาร" },
    { name: "megaphone", label: "ประกาศ", icon: Megaphone, category: "สื่อสาร" },
    { name: "bell", label: "แจ้งเตือน", icon: Bell, category: "สื่อสาร" },
    { name: "video", label: "วิดีโอ", icon: Video, category: "สื่อสาร" },

    // ธุรกิจ
    { name: "building2", label: "อาคาร", icon: Building2, category: "ธุรกิจ" },
    { name: "briefcase", label: "กระเป๋างาน", icon: Briefcase, category: "ธุรกิจ" },
    { name: "bar-chart-3", label: "กราฟ", icon: BarChart3, category: "ธุรกิจ" },
    { name: "pie-chart", label: "วงกลม", icon: PieChart, category: "ธุรกิจ" },
    { name: "trending-up", label: "แนวโน้ม", icon: TrendingUp, category: "ธุรกิจ" },
    { name: "target", label: "เป้าหมาย", icon: Target, category: "ธุรกิจ" },
    { name: "dollar-sign", label: "เงิน", icon: DollarSign, category: "ธุรกิจ" },
    { name: "credit-card", label: "บัตรเครดิต", icon: CreditCard, category: "ธุรกิจ" },
    { name: "calculator", label: "เครื่องคิดเลข", icon: Calculator, category: "ธุรกิจ" },
    { name: "shopping-cart", label: "ตะกร้า", icon: ShoppingCart, category: "ธุรกิจ" },

    // บุคคล
    { name: "users", label: "กลุ่มคน", icon: Users, category: "บุคคล" },
    { name: "user-check", label: "ยืนยันผู้ใช้", icon: UserCheck, category: "บุคคล" },
    { name: "heart", label: "สุขภาพ", icon: Heart, category: "บุคคล" },
    { name: "shield", label: "ประกัน", icon: Shield, category: "บุคคล" },
    { name: "activity", label: "กิจกรรม", icon: Activity, category: "บุคคล" },

    // เอกสาร
    { name: "file-text", label: "เอกสาร", icon: FileText, category: "เอกสาร" },
    { name: "folder-open", label: "โฟลเดอร์", icon: FolderOpen, category: "เอกสาร" },
    { name: "clipboard-list", label: "รายการ", icon: ClipboardList, category: "เอกสาร" },
    { name: "archive", label: "จัดเก็บ", icon: Archive, category: "เอกสาร" },
    { name: "bookmark", label: "บุ๊คมาร์ค", icon: Bookmark, category: "เอกสาร" },
    { name: "list", label: "ลิสต์", icon: List, category: "เอกสาร" },
    { name: "edit", label: "แก้ไข", icon: Edit, category: "เอกสาร" },

    // เทคโนโลยี
    { name: "globe", label: "เว็บไซต์", icon: Globe, category: "เทคโนโลยี" },
    { name: "monitor", label: "จอคอม", icon: Monitor, category: "เทคโนโลยี" },
    { name: "laptop", label: "แล็ปท็อป", icon: Laptop, category: "เทคโนโลยี" },
    { name: "headphones", label: "ซัพพอร์ต", icon: Headphones, category: "เทคโนโลยี" },
    { name: "server", label: "เซิร์ฟเวอร์", icon: Server, category: "เทคโนโลยี" },
    { name: "database", label: "ฐานข้อมูล", icon: Database, category: "เทคโนโลยี" },
    { name: "cloud", label: "คลาวด์", icon: Cloud, category: "เทคโนโลยี" },
    { name: "cpu", label: "ซีพียู", icon: Cpu, category: "เทคโนโลยี" },
    { name: "hard-drive", label: "ฮาร์ดไดรฟ์", icon: HardDrive, category: "เทคโนโลยี" },
    { name: "wifi", label: "ไวไฟ", icon: Wifi, category: "เทคโนโลยี" },
    { name: "code", label: "โค้ด", icon: Code, category: "เทคโนโลยี" },
    { name: "wrench", label: "เครื่องมือ", icon: Wrench, category: "เทคโนโลยี" },
    { name: "settings", label: "ตั้งค่า", icon: Settings, category: "เทคโนโลยี" },

    // ทั่วไป
    { name: "home", label: "หน้าแรก", icon: Home, category: "ทั่วไป" },
    { name: "calendar", label: "ปฏิทิน", icon: Calendar, category: "ทั่วไป" },
    { name: "clock", label: "นาฬิกา", icon: Clock, category: "ทั่วไป" },
    { name: "search", label: "ค้นหา", icon: Search, category: "ทั่วไป" },
    { name: "star", label: "ดาว", icon: Star, category: "ทั่วไป" },
    { name: "zap", label: "สายฟ้า", icon: Zap, category: "ทั่วไป" },
    { name: "key", label: "กุญแจ", icon: Key, category: "ทั่วไป" },
    { name: "lock", label: "ล็อค", icon: Lock, category: "ทั่วไป" },
    { name: "map-pin", label: "สถานที่", icon: MapPin, category: "ทั่วไป" },
    { name: "compass", label: "เข็มทิศ", icon: Compass, category: "ทั่วไป" },
    { name: "flag", label: "ธง", icon: Flag, category: "ทั่วไป" },
    { name: "gift", label: "ของขวัญ", icon: Gift, category: "ทั่วไป" },
    { name: "camera", label: "กล้อง", icon: Camera, category: "ทั่วไป" },
    { name: "image", label: "รูปภาพ", icon: Image, category: "ทั่วไป" },
    { name: "printer", label: "ปริ้นเตอร์", icon: Printer, category: "ทั่วไป" },
    { name: "upload", label: "อัปโหลด", icon: Upload, category: "ทั่วไป" },
    { name: "link", label: "ลิงก์", icon: Link, category: "ทั่วไป" },
    { name: "external-link", label: "ลิงก์นอก", icon: ExternalLink, category: "ทั่วไป" },
    { name: "eye", label: "ดู", icon: Eye, category: "ทั่วไป" },
    { name: "check-circle", label: "สำเร็จ", icon: CheckCircle, category: "ทั่วไป" },
    { name: "info", label: "ข้อมูล", icon: Info, category: "ทั่วไป" },
    { name: "help-circle", label: "ช่วยเหลือ", icon: HelpCircle, category: "ทั่วไป" },
    { name: "layers", label: "เลเยอร์", icon: Layers, category: "ทั่วไป" },
    { name: "layout", label: "เลย์เอาต์", icon: Layout, category: "ทั่วไป" },
    { name: "package", label: "แพ็คเกจ", icon: Package, category: "ทั่วไป" },
    { name: "truck", label: "รถขนส่ง", icon: Truck, category: "ทั่วไป" },
    { name: "book-open", label: "หนังสือ", icon: BookOpen, category: "ทั่วไป" },
];

// Map icon name to component for rendering
const ICON_MAP: Record<string, LucideIcon> = {};
ICON_OPTIONS.forEach((opt) => {
    ICON_MAP[opt.name] = opt.icon;
});

export function getIconComponent(name: string): LucideIcon | null {
    return ICON_MAP[name] || null;
}

// Group by category
const CATEGORIES = [...new Set(ICON_OPTIONS.map((o) => o.category))];

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedIcon = ICON_OPTIONS.find((o) => o.name === value);
    const SelectedComponent = selectedIcon?.icon;

    const filtered = searchQuery
        ? ICON_OPTIONS.filter(
            (o) =>
                o.label.includes(searchQuery) ||
                o.name.includes(searchQuery.toLowerCase()) ||
                o.category.includes(searchQuery)
        )
        : ICON_OPTIONS;

    const groupedFiltered = CATEGORIES.map((cat) => ({
        category: cat,
        icons: filtered.filter((o) => o.category === cat),
    })).filter((g) => g.icons.length > 0);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-10 rounded-xl"
                >
                    {SelectedComponent ? (
                        <>
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <SelectedComponent className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm">{selectedIcon.label}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground text-sm">เลือกไอคอน...</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 border-b border-border/50">
                    <Input
                        placeholder="ค้นหาไอคอน..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 rounded-lg text-sm"
                    />
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                    {groupedFiltered.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            ไม่พบไอคอน
                        </p>
                    ) : (
                        groupedFiltered.map((group) => (
                            <div key={group.category} className="mb-3">
                                <p className="text-xs font-semibold text-muted-foreground px-2 mb-1.5">
                                    {group.category}
                                </p>
                                <div className="grid grid-cols-6 gap-1">
                                    {group.icons.map((opt) => {
                                        const IconComp = opt.icon;
                                        const isSelected = value === opt.name;
                                        return (
                                            <button
                                                key={opt.name}
                                                type="button"
                                                title={opt.label}
                                                onClick={() => {
                                                    onChange(opt.name);
                                                    setOpen(false);
                                                    setSearchQuery("");
                                                }}
                                                className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <IconComp className="h-4.5 w-4.5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
