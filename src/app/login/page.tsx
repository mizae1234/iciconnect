import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default async function LoginPage() {
    const session = await getSession();
    if (session) redirect("/admin");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block mb-4">
                        <Image
                            src="/logo.png"
                            alt="iCare Insurance"
                            width={200}
                            height={70}
                            className="h-16 w-auto"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        ICI Connect
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        เข้าสู่ระบบผู้ดูแล
                    </p>
                </div>

                <div className="bg-card rounded-2xl shadow-xl shadow-black/5 border border-border/50 p-8">
                    <h2 className="text-xl font-semibold text-center mb-6">
                        ลงชื่อเข้าใช้งาน
                    </h2>
                    <LoginForm />
                </div>

                <div className="text-center mt-6">
                    <a href="/" className="text-sm text-primary hover:underline">
                        ← กลับหน้าแรก
                    </a>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    © {new Date().getFullYear()} iCare Insurance สงวนลิขสิทธิ์
                </p>
            </div>
        </div>
    );
}
