import { LandingNavbar } from "@/components/layout/landing-navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <LandingNavbar />
            <main>{children}</main>
        </div>
    );
}
