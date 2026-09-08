"use client";

import { useEffect, useRef } from "react";

export default function ApiDocsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load Swagger UI stylesheet
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css";
        document.head.appendChild(link);

        // Load Swagger UI Bundle script
        const script = document.createElement("script");
        script.src = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js";
        script.async = true;
        script.onload = () => {
            if ((window as unknown as { SwaggerUIBundle: Function }).SwaggerUIBundle && containerRef.current) {
                (window as unknown as { SwaggerUIBundle: Function }).SwaggerUIBundle({
                    url: "/api/openapi.json",
                    domNode: containerRef.current,
                    deepLinking: true,
                    presets: [
                        (window as any).SwaggerUIBundle.presets.apis,
                    ],
                    layout: "BaseLayout",
                    docExpansion: "list",
                    defaultModelsExpandDepth: 1,
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                        ICI
                    </div>
                    <div>
                        <h1 className="font-bold text-base tracking-tight leading-tight">ICI Connect API Documentation</h1>
                        <p className="text-xs text-slate-400">OpenAPI 3.0 Interactive Testing Console</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/api/openapi.json"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-slate-700 transition"
                    >
                        openapi.json ↗
                    </a>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div ref={containerRef} className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 min-h-[600px]" />
            </main>
        </div>
    );
}
