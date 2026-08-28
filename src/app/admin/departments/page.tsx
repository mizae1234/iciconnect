import { getDepartments } from "@/lib/actions/departments";
import { getEmployeesList } from "@/lib/actions/employees";
import { DepartmentsClient } from "@/components/admin/departments-client";

interface Props {
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function DepartmentsPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";

    const [result, employeesList] = await Promise.all([
        getDepartments({ page, search }),
        getEmployeesList(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">จัดการแผนก</h1>
                <p className="text-muted-foreground mt-1">
                    เพิ่ม แก้ไข และจัดการแผนก/ฝ่ายงานทั้งหมด
                </p>
            </div>

            <DepartmentsClient
                departments={result.departments}
                total={result.total}
                totalPages={result.totalPages}
                currentPage={page}
                currentSearch={search}
                employeesList={employeesList}
            />
        </div>
    );
}
