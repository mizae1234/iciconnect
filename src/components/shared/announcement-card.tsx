"use client";

import { CATEGORY_COLORS, type AnnouncementCategoryType, CATEGORY_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pin, Clock, Paperclip, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { th } from "date-fns/locale";

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
        creator: { name: string };
        created_at: Date | string;
    };
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const expireAt = announcement.expire_at
        ? new Date(announcement.expire_at)
        : null;
    const now = new Date();
    const hoursUntilExpiry = expireAt
        ? differenceInHours(expireAt, now)
        : null;
    const isExpiringSoon =
        hoursUntilExpiry !== null && hoursUntilExpiry > 0 && hoursUntilExpiry <= 48;

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
                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                            <Pin className="h-3 w-3 mr-1" />
                            ปักหมุด
                        </Badge>
                    )}
                    <Badge variant="outline" className={CATEGORY_COLORS[announcement.category]}>
                        {CATEGORY_LABELS[announcement.category]}
                    </Badge>
                    {isExpiringSoon && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            หมดอายุใน {expireAt ? formatDistanceToNow(expireAt, { addSuffix: false, locale: th }) : ""}
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
                {announcement.attachment_url && (
                    <a
                        href={announcement.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                    >
                        <Paperclip className="h-3 w-3" />
                        ไฟล์แนบ
                    </a>
                )}
            </div>
        </Card>
    );
}
