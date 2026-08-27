"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Menu, 
    LogIn, 
    LogOut, 
    Home, 
    Megaphone, 
    LayoutGrid, 
    LayoutDashboard, 
    ChevronDown 
} from "lucide-react";
import { type SessionUser } from "@/lib/auth";
import { ROLE_LABELS, ADMIN_ROLES } from "@/lib/constants";

interface LandingNavbarProps {
    user: SessionUser | null;
}

export function LandingNavbar({ user }: LandingNavbarProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 sm:h-16 items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-3">
                        <Sheet>
                            <SheetTrigger asChild className="sm:hidden">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0 flex flex-col h-full">
                                <SheetHeader className="p-5 pb-4 border-b border-border/50">
                                    <SheetTitle className="sr-only">เมนูนำทาง</SheetTitle>
                                    <Image
                                        src="/logo.png"
                                        alt="iCare Insurance"
                                        width={120}
                                        height={40}
                                        className="h-8 w-auto object-contain"
                                    />
                                </SheetHeader>
                                <nav className="p-4 space-y-1">
                                    <SheetClose asChild>
                                        <Link
                                            href="/"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                                        >
                                            <Home className="h-4 w-4 text-muted-foreground" />
                                            หน้าแรก
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link
                                            href="#announcements"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                                        >
                                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                                            ประกาศ
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link
                                            href="#applications"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                                        >
                                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                                            แอปพลิเคชัน
                                        </Link>
                                    </SheetClose>
                                </nav>

                                {/* Mobile bottom section */}
                                {user ? (
                                    <div className="p-4 mt-auto border-t border-border/50 space-y-2.5 bg-muted/20">
                                        <div className="flex items-center gap-3 px-2 py-1">
                                            <Avatar className="h-9 w-9 rounded-xl border border-border bg-background">
                                                <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold text-sm">
                                                    {user.name ? user.name.slice(0, 2) : user.email.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-foreground truncate">
                                                    {user.name || user.email}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {ROLE_LABELS[user.role] || user.role}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {ADMIN_ROLES.includes(user.role) && (
                                            <SheetClose asChild>
                                                <Link href="/admin" className="block w-full">
                                                    <Button variant="outline" size="sm" className="w-full h-10 rounded-xl gap-2 text-sm font-medium">
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        หน้าระบบแอดมิน
                                                    </Button>
                                                </Link>
                                            </SheetClose>
                                        )}
                                        
                                        <a href="/cdn-cgi/access/logout" className="block w-full">
                                            <Button variant="ghost" size="sm" className="w-full h-10 rounded-xl gap-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/5 font-medium">
                                                <LogOut className="h-4 w-4" />
                                                ออกจากระบบ
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="p-4 mt-auto border-t border-border/50">
                                        <SheetClose asChild>
                                            <Link href="/admin" className="block w-full">
                                                <Button variant="outline" className="w-full h-10 rounded-xl gap-2 text-sm font-medium">
                                                    <LogIn className="h-4 w-4" />
                                                    เข้าสู่ระบบผู้ดูแล
                                                </Button>
                                            </Link>
                                        </SheetClose>
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="flex items-center gap-2.5">
                            <Image
                                src="/logo.png"
                                alt="iCare Insurance"
                                width={160}
                                height={54}
                                className="h-8 sm:h-10 w-auto"
                                priority
                            />
                        </Link>

                        <nav className="hidden sm:flex items-center gap-1 ml-6">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="text-sm">หน้าแรก</Button>
                            </Link>
                            <Link href="#announcements">
                                <Button variant="ghost" size="sm" className="text-sm">ประกาศ</Button>
                            </Link>
                            <Link href="#applications">
                                <Button variant="ghost" size="sm" className="text-sm">แอปพลิเคชัน</Button>
                            </Link>
                        </nav>
                    </div>

                    {/* Right side login/dropdown */}
                    <div className="flex items-center">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 cursor-pointer text-left focus:outline-none select-none">
                                        <Avatar className="h-8 w-8 rounded-xl border border-border/50">
                                            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold text-xs">
                                                {user.name ? user.name.slice(0, 2) : user.email.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:flex flex-col pr-1 min-w-[120px] max-w-[180px]">
                                            <span className="text-[11px] font-bold text-foreground truncate leading-tight">
                                                {user.email}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight mt-0.5">
                                                {ROLE_LABELS[user.role] || user.role}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-xl mt-1" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold text-foreground leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground truncate mt-1">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    
                                    {ADMIN_ROLES.includes(user.role) && (
                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg gap-2 p-2.5">
                                            <Link href="/admin" className="flex items-center w-full">
                                                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">หน้าระบบแอดมิน</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-destructive focus:text-destructive gap-2 p-2.5">
                                        <a href="/cdn-cgi/access/logout" className="flex items-center w-full">
                                            <LogOut className="h-4 w-4" />
                                            <span className="text-sm font-semibold">ออกจากระบบ</span>
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/admin">
                                <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9">
                                    <LogIn className="h-4 w-4" />
                                    <span className="hidden sm:inline text-xs font-semibold">เข้าสู่ระบบผู้ดูแล</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
