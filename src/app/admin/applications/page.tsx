import { getApplications } from "@/lib/actions/applications";
import { ApplicationsClient } from "@/components/admin/applications-client";

interface Props {
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ApplicationsPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";

    const result = await getApplications({ page, search });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">จัดการแอปพลิเคชัน</h1>
                <p className="text-muted-foreground mt-1">
                    เพิ่ม แก้ไข และจัดการแอปพลิเคชันทั้งหมด
                </p>
            </div>

            <ApplicationsClient
                applications={result.applications}
                total={result.total}
                totalPages={result.totalPages}
                currentPage={page}
                currentSearch={search}
            />
        </div>
    );
}
