import { redirect } from "next/navigation";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DepartmentsPage({ searchParams }: Props) {
    const params = await searchParams;
    const sp = new URLSearchParams();
    sp.set("tab", "departments");
    for (const [k, v] of Object.entries(params)) {
        if (typeof v === "string" && k !== "tab") {
            sp.set(k, v);
        }
    }
    redirect(`/admin/employees?${sp.toString()}`);
}
