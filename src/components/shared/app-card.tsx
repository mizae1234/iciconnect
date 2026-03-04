"use client";

import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface AppCardProps {
    application: {
        id: string;
        name: string;
        description: string;
        icon_url: string;
        link_url: string;
        open_type: "same_tab" | "new_tab";
    };
}

export function AppCard({ application }: AppCardProps) {
    const isExternal = application.open_type === "new_tab";

    return (
        <a
            href={application.link_url}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="group block"
        >
            <Card className="p-6 rounded-2xl border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 cursor-pointer h-full">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        {application.icon_url ? (
                            <img
                                src={application.icon_url}
                                alt={application.name}
                                className="w-7 h-7 object-contain"
                            />
                        ) : (
                            <span className="text-xl font-bold text-primary">
                                {application.name[0]}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {application.name}
                            </h3>
                            {isExternal && (
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
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
