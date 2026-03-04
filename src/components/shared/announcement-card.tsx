"use client";

import {
    CATEGORY_COLORS,
    type AnnouncementCategoryType,
    CATEGORY_LABELS,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Pin,
    Clock,
    Paperclip,
    AlertTriangle,
    FileText,
    Download,
    ImageIcon,
} from "lucide-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { th } from "date-fns/locale";

function isImageUrl(url: string) {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

function getFileName(url: string) {
    try {
        const parts = url.split("/");
        const file = parts[parts.length - 1];
        return decodeURIComponent(file.split("?")[0]);
    } catch {
        return "ไฟล์แนบ";
    }
}

interface AnnouncementCardProps {
    announcement: {
        id: string;
        title: string;
        content: string;
        category: AnnouncementCategoryType;
        is_pinned: boolean;
        start_at: Date | string;
        expire_at: Date | string | null;
        attachment_url: string | null;
        attachments?: string[];
        creator: { name: string };
        created_at: Date | string;
    };
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const expireAt = announcement.expire_at
        ? new Date(announcement.expire_at)
        : null;
    const now = new Date();
    const hoursUntilExpiry = expireAt ? differenceInHours(expireAt, now) : null;
    const isExpiringSoon =
        hoursUntilExpiry !== null && hoursUntilExpiry > 0 && hoursUntilExpiry <= 48;

    // Merge attachments
    const allFiles: string[] = [...(announcement.attachments || [])];
    if (
        announcement.attachment_url &&
        !allFiles.includes(announcement.attachment_url)
    ) {
        allFiles.unshift(announcement.attachment_url);
    }

    const images = allFiles.filter(isImageUrl);
    const docs = allFiles.filter((f) => !isImageUrl(f));

    return (
        <Card
            className={`p-5 rounded-2xl transition-all duration-200 hover:shadow-md ${announcement.is_pinned
                    ? "border-primary/30 bg-primary/[0.02] shadow-sm"
                    : "border-border/50"
                }`}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {announcement.is_pinned && (
                        <Badge
                            variant="outline"
                            className="text-primary border-primary/30 bg-primary/5"
                        >
                            <Pin className="h-3 w-3 mr-1" />
                            ปักหมุด
                        </Badge>
                    )}
                    <Badge
                        variant="outline"
                        className={CATEGORY_COLORS[announcement.category]}
                    >
                        {CATEGORY_LABELS[announcement.category]}
                    </Badge>
                    {isExpiringSoon && (
                        <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                        >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            หมดอายุใน{" "}
                            {expireAt
                                ? formatDistanceToNow(expireAt, {
                                    addSuffix: false,
                                    locale: th,
                                })
                                : ""}
                        </Badge>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
                {announcement.title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                {announcement.content}
            </p>

            {/* Image attachments */}
            {images.length > 0 && (
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {images.map((url, idx) => (
                        <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl overflow-hidden border border-border/50 hover:border-primary/40 transition-colors"
                        >
                            <img
                                src={url}
                                alt={`แนบ ${idx + 1}`}
                                className="w-full h-28 object-cover"
                            />
                        </a>
                    ))}
                </div>
            )}

            {/* Document attachments */}
            {docs.length > 0 && (
                <div className="mb-4 space-y-1.5">
                    {docs.map((url, idx) => (
                        <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm flex-1 truncate text-foreground">
                                {getFileName(url)}
                            </span>
                            <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                    <span>โดย {announcement.creator.name}</span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(announcement.created_at), {
                            addSuffix: true,
                            locale: th,
                        })}
                    </span>
                </div>
                {allFiles.length > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                        <Paperclip className="h-3 w-3" />
                        {allFiles.length} ไฟล์แนบ
                    </span>
                )}
            </div>
        </Card>
    );
}
