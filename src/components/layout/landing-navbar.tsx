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
import { Menu, LogIn, Home, Megaphone, LayoutGrid } from "lucide-react";

export function LandingNavbar() {
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
                            <SheetContent side="left" className="w-72 p-0">
                                <SheetHeader className="p-5 pb-4 border-b border-border/50">
                                    <SheetTitle className="sr-only">เมนูนำทาง</SheetTitle>
                                    <Image
                                        src="/logo.png"
                                        alt="iCare Insurance"
                                        width={140}
                                        height={48}
                                        className="h-9 w-auto"
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
                                <div className="p-4 mt-auto border-t border-border/50">
                                    <SheetClose asChild>
                                        <Link href="/login" className="block">
                                            <Button variant="outline" className="w-full rounded-xl gap-2">
                                                <LogIn className="h-4 w-4" />
                                                เข้าสู่ระบบผู้ดูแล
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                </div>
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

                    <Link href="/login">
                        <Button variant="outline" size="sm" className="rounded-xl gap-2">
                            <LogIn className="h-4 w-4" />
                            <span className="hidden sm:inline">เข้าสู่ระบบผู้ดูแล</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
