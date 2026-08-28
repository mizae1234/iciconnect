import { getPersonnel, getNextEmployeeCode } from "@/lib/actions/personnel";
import { getDepartmentsList } from "@/lib/actions/departments";
import { getPositionsList } from "@/lib/actions/positions";
import { getEmployeesList } from "@/lib/actions/employees";
import { PersonnelClient } from "@/components/admin/personnel-client";

interface Props {
    searchParams: Promise<{
        page?: string;
        search?: string;
        department_id?: string;
        position_id?: string;
        employment_status?: string;
    }>;
}

export default async function PersonnelPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const department_id = params.department_id || "";
    const position_id = params.position_id || "";
    const employment_status = params.employment_status || "";

    const [result, departmentsList, positionsList, employeesList, nextCode] =
        await Promise.all([
            getPersonnel({ page, search, department_id, position_id, employment_status }),
            getDepartmentsList(),
            getPositionsList(),
            getEmployeesList(),
            getNextEmployeeCode(),
        ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">จัดการบุคลากร</h1>
                <p className="text-muted-foreground mt-1">
                    จัดการข้อมูลพนักงานและบัญชีเข้าระบบรวมในที่เดียว
                </p>
            </div>

            <PersonnelClient
                personnel={result.personnel}
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
                nextEmployeeCode={nextCode}
            />
        </div>
    );
}
