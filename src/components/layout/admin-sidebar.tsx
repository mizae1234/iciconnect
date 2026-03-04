"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    Users,
    AppWindow,
    Megaphone,
    LogOut,
    Menu,
    Home,
} from "lucide-react";
import { ROLE_LABELS, type RoleType } from "@/lib/constants";

const NAV_ITEMS = [
    { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/admin/users", label: "จัดการผู้ใช้", icon: Users },
    { href: "/admin/applications", label: "จัดการแอปพลิเคชัน", icon: AppWindow },
    { href: "/admin/announcements", label: "จัดการประกาศ", icon: Megaphone },
];

interface AdminSidebarProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

function SidebarContent({
    user,
    pathname,
}: AdminSidebarProps & { pathname: string }) {
    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="p-4 border-b border-border/50">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="iCare Insurance"
                        width={120}
                        height={40}
                        className="h-8 w-auto"
                    />
                </Link>
                <p className="text-xs text-muted-foreground mt-2">ระบบจัดการหลังบ้าน</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="my-4 border-t border-border/50" />

                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
                >
                    <Home className="h-4 w-4" />
                    กลับหน้าแรก
                </Link>
            </nav>

            {/* User */}
            <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                            {user.name[0]}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {ROLE_LABELS[user.role as RoleType]}
                        </Badge>
                    </div>
                </div>
                <form action={logoutAction}>
                    <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl gap-2"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        ออกจากระบบ
                    </Button>
                </form>
            </div>
        </div>
    );
}

export function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-card sticky top-0 h-screen overflow-y-auto">
                <SidebarContent user={user} pathname={pathname} />
            </aside>

            {/* Mobile */}
            <div className="lg:hidden fixed top-4 left-4 z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl shadow-md">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SidebarContent user={user} pathname={pathname} />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
