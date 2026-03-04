import { getUsers } from "@/lib/actions/users";
import { UsersClient } from "@/components/admin/users-client";

interface Props {
    searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const role = params.role || "";

    const result = await getUsers({ page, search, role });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">จัดการผู้ใช้</h1>
                <p className="text-muted-foreground mt-1">
                    เพิ่ม แก้ไข และจัดการบัญชีผู้ใช้ทั้งหมด
                </p>
            </div>

            <UsersClient
                users={result.users}
                total={result.total}
                totalPages={result.totalPages}
                currentPage={page}
                currentSearch={search}
                currentRole={role}
            />
        </div>
    );
}
