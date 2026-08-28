import { getEmployees, getEmployeesList, getUnlinkedUsers, getNextEmployeeCode } from "@/lib/actions/employees";
import { getDepartmentsList } from "@/lib/actions/departments";
import { getPositionsList } from "@/lib/actions/positions";
import { EmployeesClient } from "@/components/admin/employees-client";

interface Props {
    searchParams: Promise<{
        page?: string;
        search?: string;
        department_id?: string;
        position_id?: string;
        employment_status?: string;
    }>;
}

export default async function EmployeesPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const department_id = params.department_id || "";
    const position_id = params.position_id || "";
    const employment_status = params.employment_status || "";

    const [result, departmentsList, positionsList, employeesList, unlinkedUsers, nextCode] =
        await Promise.all([
            getEmployees({ page, search, department_id, position_id, employment_status }),
            getDepartmentsList(),
            getPositionsList(),
            getEmployeesList(),
            getUnlinkedUsers(),
            getNextEmployeeCode(),
        ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">จัดการพนักงาน</h1>
                <p className="text-muted-foreground mt-1">
                    เพิ่ม แก้ไข และจัดการข้อมูลพนักงานทั้งหมด
                </p>
            </div>

            <EmployeesClient
                employees={result.employees}
                total={result.total}
                totalPages={result.totalPages}
                currentPage={page}
                currentSearch={search}
                currentDepartmentId={department_id}
                currentPositionId={position_id}
                currentEmploymentStatus={employment_status}
                departmentsList={departmentsList}
                positionsList={positionsList}
                employeesList={employeesList}
                unlinkedUsers={unlinkedUsers}
                nextEmployeeCode={nextCode}
            />
        </div>
    );
}
