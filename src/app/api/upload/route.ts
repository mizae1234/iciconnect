import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
    uploadToS3,
    generateSafeFilename,
    ALLOWED_TYPES,
    MAX_FILE_SIZE,
} from "@/lib/s3";

export async function POST(request: NextRequest) {
    // Auth check
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const folder = (formData.get("folder") as string) || "general";

        if (!files.length) {
            return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
        }

        const results: { url: string; name: string; type: string; size: number }[] = [];

        for (const file of files) {
            // Validate type
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    {
                        error: `ไม่รองรับไฟล์ประเภท ${file.type}`,
                    },
                    { status: 400 }
                );
            }

            // Validate size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    {
                        error: `ไฟล์ ${file.name} มีขนาดเกิน 10MB`,
                    },
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const safeFilename = generateSafeFilename(file.name);
            const url = await uploadToS3(buffer, folder, safeFilename, file.type);

            results.push({
                url,
                name: file.name,
                type: file.type,
                size: file.size,
            });
        }

        return NextResponse.json({ files: results });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "อัปโหลดไฟล์ล้มเหลว" },
            { status: 500 }
        );
    }
}
