import { getAnnouncements } from "@/lib/actions/announcements";
import { AnnouncementsClient } from "@/components/admin/announcements-client";

interface Props {
    searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const category = params.category || "";

    const result = await getAnnouncements({ page, search, category });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">จัดการประกาศ</h1>
                <p className="text-muted-foreground mt-1">
                    เพิ่ม แก้ไข และจัดการประกาศทั้งหมด
                </p>
            </div>

            <AnnouncementsClient
                announcements={result.announcements}
                total={result.total}
                totalPages={result.totalPages}
                currentPage={page}
                currentSearch={search}
                currentCategory={category}
            />
        </div>
    );
}
