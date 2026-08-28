import { getPositions } from "@/lib/actions/positions";
import { PositionsClient } from "@/components/admin/positions-client";

interface Props {
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function PositionsPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";

    const result = await getPositions({ page, search });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">จัดการตำแหน่ง</h1>
                <p className="text-muted-foreground mt-1">
                    เพิ่ม แก้ไข และจัดการตำแหน่งงานทั้งหมด
                </p>
            </div>

            <PositionsClient
                positions={result.positions}
                total={result.total}
                totalPages={result.totalPages}
                currentPage={page}
                currentSearch={search}
            />
        </div>
    );
}
