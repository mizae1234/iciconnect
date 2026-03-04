import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@/lib/constants";

const SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "fallback-secret-change-me"
);

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: RoleType;
}

// ─── JWT Helpers ─────────────────────────────────────

async function createToken(user: SessionUser): Promise<string> {
    return new SignJWT({ ...user })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("8h")
        .sign(SECRET);
}

async function verifyToken(token: string): Promise<SessionUser | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as unknown as SessionUser;
    } catch {
        return null;
    }
}

// ─── Auth Actions ────────────────────────────────────

export async function signIn(
    email: string,
    password: string
): Promise<{ success: boolean; error?: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.is_active) {
        return { success: false, error: "Invalid credentials or account disabled" };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        return { success: false, error: "Invalid credentials" };
    }

    const sessionUser: SessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as RoleType,
    };

    const token = await createToken(sessionUser);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
    });

    return { success: true };
}

export async function signOut(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function requireAuth(): Promise<SessionUser> {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function requireAdmin(): Promise<SessionUser> {
    const session = await requireAuth();
    if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
        throw new Error("Forbidden");
    }
    return session;
}

export { bcrypt };
