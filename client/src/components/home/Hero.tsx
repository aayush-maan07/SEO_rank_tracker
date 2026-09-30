import { SearchIcon, ArrowRightIcon, SparklesIcon, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeWave } from "../../assets/assets";

const TRUST_ITEMS = ["AI-Powered Analysis", "Real Browser Rendering", "Daily Rank Updates"];

export default function Hero() {
    const [url, setUrl] = useState("");
    const navigate = useNavigate();

    const handleQuickAnalyze = (e: React.SubmitEvent) => {
        e.preventDefault();
        navigate(`/analyze?url=${encodeURIComponent(url)}`);
    };

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-32 overflow-hidden hero-bg">
            {/* Background grid */}
            <div className="bg-grid-pattern absolute inset-0 -z-1 opacity-60" />

            {/* Glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/6 rounded-full blur-3xl pointer-events-none -z-1" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-1" />

            <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 section-label mb-8">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute bg-primary size-2 rounded-full animate-ping opacity-60" />
                        <div className="bg-primary size-1.5 rounded-full" />
                    </div>
                    Powered by BrowserBase & Gemini AI
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight text-foreground">
                    Analyze & Boost Your{" "}
                    <span className="gradient-text dm-serif italic inline-block pr-2">SEO Rankings</span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                    Get instant AI-powered SEO audits for any website. Uncover hidden issues, optimize performance, and outrank your competition.
                </p>

                {/* URL Input Bar */}
                <form onSubmit={handleQuickAnalyze} className="max-w-2xl mx-auto mb-8">
                    <div className="bg-card border border-border rounded-2xl p-2 flex items-center gap-2 shadow-lg shadow-primary/5">
                        <div className="flex items-center gap-3 flex-1 px-3">
                            <SearchIcon size={18} className="text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter website URL (e.g., example.com)"
                                className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-base py-2.5"
                                id="hero-url-input"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary px-6 py-3 rounded-xl shrink-0"
                            id="hero-analyze-btn"
                        >
                            <SparklesIcon size={15} />
                            Analyze Free
                            <ArrowRightIcon size={14} />
                        </button>
                    </div>
                </form>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    {TRUST_ITEMS.map((item) => (
                        <div key={item} className="flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-success" />
                            {item}
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-success" />
                        Free • 5 analyses/day
                    </div>
                </div>
            </div>

            {/* Animated Wave */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none -z-1">
                <HomeWave />
            </div>
        </section>
    );
}
