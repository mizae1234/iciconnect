import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getEmployees, getEmployeesList, getUnlinkedUsers, getNextEmployeeCode } from "@/lib/actions/employees";
import { getDepartments, getDepartmentsList } from "@/lib/actions/departments";
import { getPositions, getPositionsList } from "@/lib/actions/positions";
import { EmployeesClient } from "@/components/admin/employees-client";
import { DepartmentsClient } from "@/components/admin/departments-client";
import { PositionsClient } from "@/components/admin/positions-client";
import { EmployeeTabs } from "@/components/admin/employee-tabs";
import { Card } from "@/components/ui/card";
import { UserCog, Building2, Briefcase } from "lucide-react";

interface Props {
    searchParams: Promise<{
        tab?: string;
        page?: string;
        search?: string;
        department_id?: string;
        position_id?: string;
        employment_status?: string;
    }>;
}

export default async function EmployeeModulePage({ searchParams }: Props) {
    await requireAdmin();
    const params = await searchParams;
    const tab = (params.tab === "departments" || params.tab === "positions") ? params.tab : "employees";
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const department_id = params.department_id || "";
    const position_id = params.position_id || "";
    const employment_status = params.employment_status || "";

    // Always fetch total counts for top badges/stats
    const [totalEmployeesCount, totalDepartmentsCount, totalPositionsCount] = await Promise.all([
        prisma.employee.count(),
        prisma.department.count(),
        prisma.position.count(),
    ]);

    return (
        <div className="space-y-6">
            {/* Module Header */}
            <div>
                <h1 className="text-3xl font-bold">จัดการข้อมูลพนักงานและองค์กร</h1>
                <p className="text-muted-foreground mt-1">
                    ศูนย์กลางจัดการข้อมูลพนักงาน โครงสร้างแผนก และตำแหน่งงานในระบบ
                </p>
            </div>

            {/* Quick KPI Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 rounded-2xl border-border/50 bg-gradient-to-br from-teal-500/5 to-teal-500/10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600">
                            <UserCog className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">พนักงานทั้งหมด</p>
                            <p className="text-2xl font-bold text-foreground">{totalEmployeesCount} คน</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-border/50 bg-gradient-to-br from-indigo-500/5 to-indigo-500/10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">แผนก/ฝ่าย</p>
                            <p className="text-2xl font-bold text-foreground">{totalDepartmentsCount} แผนก</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-border/50 bg-gradient-to-br from-violet-500/5 to-violet-500/10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-600">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">ตำแหน่งงาน</p>
                            <p className="text-2xl font-bold text-foreground">{totalPositionsCount} ตำแหน่ง</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <EmployeeTabs
                activeTab={tab}
                totalEmployees={totalEmployeesCount}
                totalDepartments={totalDepartmentsCount}
                totalPositions={totalPositionsCount}
            />

            {/* Tab Contents */}
            {tab === "departments" && (
                <DepartmentTabContent page={page} search={search} />
            )}

            {tab === "positions" && (
                <PositionTabContent page={page} search={search} />
            )}

            {tab === "employees" && (
                <EmployeeTabContent
                    page={page}
                    search={search}
                    department_id={department_id}
                    position_id={position_id}
                    employment_status={employment_status}
                />
            )}
        </div>
    );
}

// Subcomponents for fetching data specific to each tab

async function EmployeeTabContent({
    page,
    search,
    department_id,
    position_id,
    employment_status,
}: {
    page: number;
    search: string;
    department_id: string;
    position_id: string;
    employment_status: string;
}) {
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
    );
}

async function DepartmentTabContent({
    page,
    search,
}: {
    page: number;
    search: string;
}) {
    const [result, employeesList] = await Promise.all([
        getDepartments({ page, search }),
        getEmployeesList(),
    ]);

    return (
        <DepartmentsClient
            departments={result.departments}
            total={result.total}
            totalPages={result.totalPages}
            currentPage={page}
            currentSearch={search}
            employeesList={employeesList}
        />
    );
}

async function PositionTabContent({
    page,
    search,
}: {
    page: number;
    search: string;
}) {
    const result = await getPositions({ page, search });

    return (
        <PositionsClient
            positions={result.positions}
            total={result.total}
            totalPages={result.totalPages}
            currentPage={page}
            currentSearch={search}
        />
    );
}
