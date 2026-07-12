export default function Loading() {
    return (
        <div className="relative min-h-screen flex overflow-hidden animate-pulse p-2 bg-slate-50">
            {/* Left side visual block */}
            <div className="hidden lg:flex w-[55%] shrink-0 h-[calc(100vh-16px)] bg-slate-900/90 rounded-2xl p-10 flex-col justify-between">
                <div className="h-4 bg-white/20 rounded w-24"></div>
                <div className="space-y-4">
                    <div className="h-8 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                </div>
            </div>

            {/* Right side form block */}
            <div className="flex-1 min-h-[calc(100vh-16px)] bg-white rounded-2xl flex flex-col items-center justify-center p-12">
                <div className="w-full max-w-[380px] space-y-8">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="h-8 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-100 rounded w-64"></div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                </div>
            </div>
        </div>
    );
}
