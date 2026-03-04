"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "default";
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title = "ยืนยันการดำเนินการ",
    description,
    confirmLabel = "ยืนยัน",
    cancelLabel = "ยกเลิก",
    onConfirm,
    variant = "danger",
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md rounded-2xl">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === "danger" && (
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                        )}
                        {variant === "warning" && (
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                        )}
                        <div>
                            <AlertDialogTitle>{title}</AlertDialogTitle>
                            <AlertDialogDescription className="mt-1">
                                {description}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel className="rounded-xl">
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={`rounded-xl ${variant === "danger"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                            }`}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
