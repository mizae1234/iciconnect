import Image from "next/image";
import { LogOut } from "lucide-react";

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
            {/* Logo Circle */}
            <div className="relative w-24 h-24 mb-6 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50/30">
                <Image
                    src="/icon.png"
                    alt="iCare Logo"
                    width={96}
                    height={96}
                    className="object-contain p-3.5"
                    priority
                />
            </div>

            {/* Error Message */}
            <h1 className="text-[32px] font-bold text-[#0f0f0f] tracking-tight mb-2">
                Forbidden (403)
            </h1>
            <p className="text-[15px] text-[#606060] mb-8">
                Sorry, you cannot access this page
            </p>
        </div>
    );
}