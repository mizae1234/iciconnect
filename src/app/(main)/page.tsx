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
            <section className="relative overflow-hidden bg-gradient-to-br from-[#2d8a82] via-[#3B9E96] to-[#4db8af]">
                {/* Animated background particles */}
                <div className="absolute inset-0">
                    <div className="absolute top-12 left-[8%] w-4 h-4 rounded-full bg-white/20 hero-float" />
                    <div className="absolute top-28 right-[12%] w-6 h-6 rounded-full bg-white/10 hero-float" style={{ animationDelay: "1s" }} />
                    <div className="absolute bottom-20 left-[18%] w-5 h-5 rounded-full bg-white/15 hero-float" style={{ animationDelay: "2s" }} />
                    <div className="absolute top-20 left-[50%] w-3 h-3 rounded-full bg-white/25 hero-float" style={{ animationDelay: "3s" }} />
                    <div className="absolute bottom-28 right-[20%] w-4 h-4 rounded-full bg-white/10 hero-float" style={{ animationDelay: "1.5s" }} />
                    <div className="absolute top-[60%] left-[5%] w-2 h-2 rounded-full bg-white/30 hero-float" style={{ animationDelay: "0.5s" }} />
                    {/* Glow circles */}
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl hero-glow-1" />
                    <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl hero-glow-2" />
                    {/* Ring decorations */}
                    <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/10 hero-glow-1" />
                    <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 hero-glow-2" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                        {/* Text side */}
                        <div className="flex-1 text-center md:text-left z-10">
                            <div className="hero-animate-badge inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm mb-6">
                                <CalendarDays className="h-4 w-4" />
                                {format(new Date(), "วันEEEEที่ d MMMM yyyy", { locale: th })}
                            </div>
                            <h1 className="hero-animate-title text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                ยินดีต้อนรับสู่
                                <br />
                                <span className="text-white/90">ICI Connect</span>
                            </h1>
                            <p className="hero-animate-subtitle text-base md:text-lg text-white/70 max-w-md">
                                ศูนย์รวมประกาศ ข่าวสาร ประชาสัมพันธ์
                                และแอปพลิเคชันสำหรับพนักงาน iCare Insurance
                            </p>
                        </div>

                        {/* Illustration side */}
                        <div className="relative flex-shrink-0 hero-animate-logo z-10">
                            {/* Floating badges */}
                            <div className="absolute -top-3 -right-3 md:-right-12 bg-white rounded-xl px-3.5 py-2 shadow-lg shadow-black/10 flex items-center gap-2 hero-float z-20" style={{ animationDelay: "0.5s" }}>
                                <Megaphone className="h-4 w-4 text-[#3B9E96]" />
                                <span className="text-sm font-medium text-gray-700">ข่าวสาร</span>
                            </div>

                            <div className="absolute top-1/2 -left-6 md:-left-16 -translate-y-1/2 bg-white rounded-xl px-3.5 py-2 shadow-lg shadow-black/10 flex items-center gap-2 hero-float z-20" style={{ animationDelay: "2s" }}>
                                <LayoutGrid className="h-4 w-4 text-[#3B9E96]" />
                                <span className="text-sm font-medium text-gray-700">ศูนย์รวม</span>
                            </div>

                            <div className="absolute -bottom-3 -right-2 md:-right-6 bg-white rounded-xl px-3.5 py-2 shadow-lg shadow-black/10 flex items-center gap-2 hero-float z-20" style={{ animationDelay: "3.5s" }}>
                                <CalendarDays className="h-4 w-4 text-[#3B9E96]" />
                                <span className="text-sm font-medium text-gray-700">ประชาสัมพันธ์</span>
                            </div>

                            {/* Main illustration card */}
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-3 shadow-xl shadow-black/10 border border-white/30">
                                <Image
                                    src="/hero-illustration.png"
                                    alt="ICI Connect"
                                    width={400}
                                    height={400}
                                    className="w-52 md:w-60 lg:w-64 h-auto rounded-2xl"
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
