"use client";

import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { getIconComponent } from "@/components/shared/icon-picker";

interface AppCardProps {
    application: {
        id: string;
        name: string;
        description: string;
        icon_url: string;
        link_url: string;
        open_type: string;
    };
}

export function AppCard({ application }: AppCardProps) {
    const IconComponent = getIconComponent(application.icon_url);

    return (
        <a
            href={application.link_url}
            target={application.open_type === "new_tab" ? "_blank" : "_self"}
            rel={application.open_type === "new_tab" ? "noopener noreferrer" : undefined}
            className="block group"
        >
            <Card className="p-5 rounded-2xl border-border/50 transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                        {IconComponent ? (
                            <IconComponent className="h-6 w-6 text-primary" />
                        ) : application.icon_url && application.icon_url.startsWith("http") ? (
                            <img
                                src={application.icon_url}
                                alt=""
                                className="w-7 h-7 object-contain"
                            />
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {application.name[0]}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">
                                {application.name}
                            </h3>
                            {application.open_type === "new_tab" && (
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {application.description}
                        </p>
                    </div>
                </div>
            </Card>
        </a>
    );
}
