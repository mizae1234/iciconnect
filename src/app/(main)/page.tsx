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
            <section className="relative overflow-hidden bg-gradient-to-b from-[#eef9f7] via-[#f4fbfa] to-white">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-[10%] w-3 h-3 rounded-full bg-[#3B9E96]/20 hero-float" />
                    <div className="absolute top-32 right-[15%] w-5 h-5 rounded-full bg-[#3B9E96]/15 hero-float" style={{ animationDelay: "1s" }} />
                    <div className="absolute bottom-24 left-[20%] w-4 h-4 rounded-full bg-[#7ECEC5]/25 hero-float" style={{ animationDelay: "2s" }} />
                    <div className="absolute top-16 left-[45%] w-2 h-2 rounded-full bg-[#3B9E96]/30 hero-float" style={{ animationDelay: "3s" }} />
                    <div className="absolute bottom-32 right-[25%] w-3 h-3 rounded-full bg-[#B8E5DF]/40 hero-float" style={{ animationDelay: "1.5s" }} />
                    {/* Large decorative circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#3B9E96]/10 hero-glow-1" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#3B9E96]/5 hero-glow-2" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                        {/* Text side */}
                        <div className="flex-1 text-center md:text-left z-10">
                            <div className="hero-animate-badge inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#3B9E96]/20 rounded-full px-4 py-1.5 text-[#3B9E96] text-sm mb-6 shadow-sm">
                                <CalendarDays className="h-4 w-4" />
                                {format(new Date(), "วันEEEEที่ d MMMM yyyy", { locale: th })}
                            </div>
                            <h1 className="hero-animate-title text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 leading-tight">
                                ยินดีต้อนรับสู่
                                <br />
                                <span className="text-[#3B9E96]">ICI Connect</span>
                            </h1>
                            <p className="hero-animate-subtitle text-lg md:text-xl text-gray-500 max-w-lg">
                                ศูนย์กลางข่าวสาร แอปพลิเคชัน และทรัพยากรต่างๆ ของบริษัท iCare Insurance
                            </p>
                        </div>

                        {/* Illustration side */}
                        <div className="relative flex-shrink-0 hero-animate-logo z-10">
                            {/* Floating badges */}
                            <div className="absolute -top-4 -right-4 md:-right-8 bg-white rounded-xl px-4 py-2 shadow-lg shadow-black/5 border border-gray-100 flex items-center gap-2 hero-float z-20" style={{ animationDelay: "0.5s" }}>
                                <div className="w-7 h-7 rounded-lg bg-[#3B9E96]/15 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#3B9E96]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">ปลอดภัย</span>
                            </div>

                            <div className="absolute -bottom-4 -left-4 md:-left-10 bg-white rounded-xl px-4 py-2 shadow-lg shadow-black/5 border border-gray-100 flex items-center gap-2 hero-float z-20" style={{ animationDelay: "1.5s" }}>
                                <div className="w-7 h-7 rounded-lg bg-[#3B9E96]/15 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#3B9E96]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">เชื่อมต่อ</span>
                            </div>

                            {/* Main illustration card */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-3 shadow-xl shadow-[#3B9E96]/5 border border-white/80">
                                <Image
                                    src="/hero-illustration.png"
                                    alt="ICI Connect"
                                    width={400}
                                    height={400}
                                    className="w-72 md:w-80 lg:w-96 h-auto rounded-2xl"
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
