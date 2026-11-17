import { prisma } from "@/lib/prisma";

async function main() {
    const all = await prisma.employee.findMany({
        select: { employeeId: true, first_name: true, last_name: true, employment_status: true },
        orderBy: { employeeId: "asc" },
    });
    console.log("Total:", all.length);
    all.forEach((e) =>
        console.log(e.employeeId, e.first_name, e.last_name, e.employment_status)
    );
    await prisma.$disconnect();
}

main();
