"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserCog, Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmployeeTabsProps {
    activeTab: "employees" | "departments" | "positions";
    totalEmployees: number;
    totalDepartments: number;
    totalPositions: number;
}

export function EmployeeTabs({
    activeTab,
    totalEmployees,
    totalDepartments,
    totalPositions,
}: EmployeeTabsProps) {
    const searchParams = useSearchParams();

    const tabs = [
        {
            id: "employees" as const,
            label: "รายชื่อพนักงาน",
            icon: UserCog,
            count: totalEmployees,
            href: "/admin/employees?tab=employees",
        },
        {
            id: "departments" as const,
            label: "แผนกและฝ่าย",
            icon: Building2,
            count: totalDepartments,
            href: "/admin/employees?tab=departments",
        },
        {
            id: "positions" as const,
            label: "ตำแหน่งงาน",
            icon: Briefcase,
            count: totalPositions,
            href: "/admin/employees?tab=positions",
        },
    ];

    return (
        <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-2xl w-fit border border-border/50">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? "bg-background text-foreground shadow-sm font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        }`}
                    >
                        <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                        <span>{tab.label}</span>
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={`text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center rounded-full font-normal ${
                                isActive ? "bg-primary text-primary-foreground" : ""
                            }`}
                        >
                            {tab.count}
                        </Badge>
                    </Link>
                );
            })}
        </div>
    );
}
