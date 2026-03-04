import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/constants";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                <AdminSidebar user={session} />
                <main className="flex-1 min-w-0">
                    <div className="p-6 lg:p-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
