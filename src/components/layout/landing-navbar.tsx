"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn } from "lucide-react";

export function LandingNavbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild className="sm:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72">
                                <div className="flex items-center gap-3 mb-8 mt-4">
                                    <Image
                                        src="/logo.png"
                                        alt="iCare Insurance"
                                        width={140}
                                        height={48}
                                        className="h-10 w-auto"
                                    />
                                </div>
                                <nav className="space-y-4">
                                    <Link href="/" className="block text-sm font-medium hover:text-primary transition-colors">
                                        หน้าแรก
                                    </Link>
                                    <Link href="#announcements" className="block text-sm font-medium hover:text-primary transition-colors">
                                        ประกาศ
                                    </Link>
                                    <Link href="#applications" className="block text-sm font-medium hover:text-primary transition-colors">
                                        แอปพลิเคชัน
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="flex items-center gap-2.5">
                            <Image
                                src="/logo.png"
                                alt="iCare Insurance"
                                width={160}
                                height={54}
                                className="h-10 w-auto"
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
