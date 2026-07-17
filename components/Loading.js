export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-5">
                {/* Animated logo pulse */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 animate-pulse shadow-lg shadow-primary/20" />
                    <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 animate-ping opacity-20" />
                </div>

                {/* Animated dots */}
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
}
