import Image from "next/image";
import { getPublicAnnouncements, getPublicApplications } from "@/lib/actions/public";
import { AnnouncementCard } from "@/components/shared/announcement-card";
import { AppCard } from "@/components/shared/app-card";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
    Megaphone,
    LayoutGrid,
    CalendarDays,
} from "lucide-react";

export default async function HomePage() {
    const [announcements, applications] = await Promise.all([
        getPublicAnnouncements(),
        getPublicApplications(),
    ]);

    return (
        <div className="space-y-0">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMEgydjRoMzR6TTIgMjR2MmgzNHYtMkgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm mb-6">
                                <CalendarDays className="h-4 w-4" />
                                {format(new Date(), "วันEEEEที่ d MMMM yyyy", { locale: th })}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                ยินดีต้อนรับสู่
                                <br />
                                <span className="text-white/90">ICI Connect</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 max-w-lg">
                                ศูนย์กลางข่าวสาร แอปพลิเคชัน และทรัพยากรต่างๆ ของบริษัท iCare Insurance
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/10">
                                <Image
                                    src="/logo.png"
                                    alt="iCare Insurance"
                                    width={280}
                                    height={100}
                                    className="h-20 md:h-24 w-auto"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                {/* Section 2: Announcements */}
                <section id="announcements">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                            <Megaphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">ประกาศ</h2>
                            <p className="text-sm text-muted-foreground">
                                ข่าวสารและประกาศสำคัญล่าสุด
                            </p>
                        </div>
                    </div>

                    {announcements.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-border/50">
                            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-lg">ยังไม่มีประกาศ</p>
                            <p className="text-sm mt-1">กลับมาตรวจสอบภายหลัง</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {announcements.map((ann) => (
                                <AnnouncementCard key={ann.id} announcement={ann} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Section 3: Application Grid */}
                <section id="applications">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">แอปพลิเคชัน</h2>
                            <p className="text-sm text-muted-foreground">
                                เข้าถึงเครื่องมือและบริการต่างๆ ได้อย่างรวดเร็ว
                            </p>
                        </div>
                    </div>

                    {applications.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-border/50">
                            <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-lg">ยังไม่มีแอปพลิเคชัน</p>
                            <p className="text-sm mt-1">แอปพลิเคชันจะแสดงที่นี่เมื่อถูกเพิ่ม</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {applications.map((app) => (
                                <AppCard key={app.id} application={app} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="border-t border-border/50 pt-8 pb-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo.png"
                                alt="iCare Insurance"
                                width={120}
                                height={40}
                                className="h-8 w-auto opacity-60"
                            />
                            <span className="text-sm text-muted-foreground">
                                ICI Connect — ระบบอินทราเน็ตบริษัท
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} iCare Insurance สงวนลิขสิทธิ์
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
