import { LandingNavbar } from "@/components/layout/landing-navbar";
import { getSession } from "@/lib/auth";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();
    
    return (
        <div className="min-h-screen bg-background">
            <LandingNavbar user={user} />
            <main>{children}</main>
        </div>
    );
}

