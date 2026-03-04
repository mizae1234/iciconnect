import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || "https://space-workflow-dev.sgp1.digitaloceanspaces.com",
    region: process.env.S3_REGION || "sgp1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: false,
});

const BUCKET = process.env.S3_BUCKET || "space-workflow-dev";
const CDN_ENDPOINT =
    process.env.S3_CDN_ENDPOINT ||
    process.env.S3_ENDPOINT ||
    "https://space-workflow-dev.sgp1.digitaloceanspaces.com";

/**
 * Upload a file to S3 under ictconnect/{folder}/{filename}
 */
export async function uploadToS3(
    file: Buffer,
    folder: string,
    filename: string,
    contentType: string
): Promise<string> {
    // Sanitize folder name (remove special chars, keep Thai + alphanumeric)
    const safeFolder = folder
        .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s\-_]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);

    const key = `ictconnect/${safeFolder}/${filename}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file,
            ContentType: contentType,
            ACL: "public-read",
        })
    );

    return `${CDN_ENDPOINT}/${BUCKET}/${key}`;
}

/**
 * Delete a file from S3 by its full URL
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
    try {
        const urlObj = new URL(fileUrl);
        // Extract key from URL: /{bucket}/{key} → key
        const pathParts = urlObj.pathname.split("/");
        // Remove empty first element and bucket name
        const key = pathParts.slice(2).join("/");

        if (key) {
            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                })
            );
        }
    } catch (error) {
        console.error("Failed to delete from S3:", error);
    }
}

/**
 * Generate a safe filename with timestamp
 */
export function generateSafeFilename(originalName: string): string {
    const ext = originalName.split(".").pop()?.toLowerCase() || "bin";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}.${ext}`;
}

/**
 * Check if a file type is allowed
 */
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
];

const ALLOWED_DOC_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function isImageType(contentType: string): boolean {
    return ALLOWED_IMAGE_TYPES.includes(contentType);
}

export function getFileTypeLabel(contentType: string): string {
    if (ALLOWED_IMAGE_TYPES.includes(contentType)) return "รูปภาพ";
    if (contentType === "application/pdf") return "PDF";
    if (contentType.includes("word")) return "Word";
    if (contentType.includes("excel") || contentType.includes("spreadsheet")) return "Excel";
    if (contentType.includes("powerpoint") || contentType.includes("presentation")) return "PowerPoint";
    return "เอกสาร";
}
