"use client";

import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Menu,
    LogOut,
    Settings,
    Shield,
    Zap,
} from "lucide-react";
import { ADMIN_ROLES, ROLE_LABELS, type RoleType } from "@/lib/constants";

interface NavbarProps {
    user: {
        name: string;
        email: string;
        role: RoleType;
    };
}

export function MainNavbar({ user }: NavbarProps) {
    const isAdmin = ADMIN_ROLES.includes(user.role);
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Logo + Nav */}
                    <div className="flex items-center gap-4">
                        {/* Mobile menu */}
                        <Sheet>
                            <SheetTrigger asChild className="sm:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72">
                                <div className="mt-6 space-y-4">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                                    >
                                        Home
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                                        >
                                            <Shield className="h-4 w-4" />
                                            Admin Panel
                                        </Link>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Brand */}
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-lg font-bold tracking-tight">
                                    ICI Connect
                                </span>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden sm:flex items-center gap-1 ml-6">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="text-sm">
                                    Home
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="text-sm">
                                        <Shield className="h-4 w-4 mr-1" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Right: User Menu */}
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="hidden sm:flex text-xs">
                            {ROLE_LABELS[user.role]}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-9 w-9 rounded-full"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem
                                    onClick={() => logoutAction()}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
