export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
                    <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Loading SeoProbe.ai...</p>
            </div>
        </div>
    );
}
