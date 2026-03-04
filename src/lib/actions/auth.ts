"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema } from "@/lib/constants";
import { redirect } from "next/navigation";

export async function loginAction(
    _prevState: { error?: string } | null,
    formData: FormData
) {
    const raw = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const result = await signIn(parsed.data.email, parsed.data.password);
    if (!result.success) {
        return { error: result.error };
    }

    redirect("/admin");
}

export async function logoutAction() {
    await signOut();
    redirect("/login");
}
