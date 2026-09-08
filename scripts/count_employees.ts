import { prisma } from "@/lib/prisma";

async function main() {
    const all = await prisma.employee.findMany({
        select: { employee_code: true, first_name: true, last_name: true, employment_status: true },
        orderBy: { employee_code: "asc" },
    });
    console.log("Total:", all.length);
    all.forEach((e) =>
        console.log(e.employee_code, e.first_name, e.last_name, e.employment_status)
    );
    await prisma.$disconnect();
}

main();
