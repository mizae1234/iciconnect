"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock } from "lucide-react";

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, null);

    return (
        <form action={formAction} className="space-y-5">
            {state?.error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20">
                    {state.error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">อีเมล</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        className="pl-10 h-11 rounded-xl"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">รหัสผ่าน</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 rounded-xl"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-11 rounded-xl text-base font-medium"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลังเข้าสู่ระบบ...
                    </>
                ) : (
                    "เข้าสู่ระบบ"
                )}
            </Button>
        </form>
    );
}
