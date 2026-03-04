import { getDashboardStats } from "@/lib/actions/dashboard";
import { Card } from "@/components/ui/card";
import { Users, AppWindow, Megaphone } from "lucide-react";
import { ROLE_LABELS, type RoleType } from "@/lib/constants";

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
                <p className="text-muted-foreground mt-1">
                    ภาพรวมระบบ ICI Connect
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-6 rounded-2xl border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ผู้ใช้ทั้งหมด</p>
                            <p className="text-3xl font-bold">{stats.totalUsers}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 rounded-2xl border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <AppWindow className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">แอปพลิเคชัน</p>
                            <p className="text-3xl font-bold">{stats.totalApps}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 rounded-2xl border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Megaphone className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ประกาศ</p>
                            <p className="text-3xl font-bold">{stats.totalAnnouncements}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Role Breakdown */}
            <Card className="p-6 rounded-2xl border-border/50">
                <h2 className="text-lg font-semibold mb-4">สัดส่วนตามบทบาท</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.roleBreakdown.map((item) => (
                        <div
                            key={item.role}
                            className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                        >
                            <span className="text-sm font-medium">
                                {ROLE_LABELS[item.role as RoleType]}
                            </span>
                            <span className="text-sm font-bold">{item.count} คน</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
