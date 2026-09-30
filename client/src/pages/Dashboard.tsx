import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon, ArrowRightIcon, BarChart3Icon, GlobeIcon, TrendingUpIcon, Zap, History, Target } from "lucide-react";
import AnalysesCard from "../components/AnalysesCard";
import { useApp } from "../context/AppContext";

interface AnalysisSummary {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
}

export default function Dashboard() {
    const { user, api } = useApp();
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecent = async () => {
        try {
            const res = await api.get("/api/analysis/list?limit=6");
            if (res.data.success) {
                setAnalyses(res.data.analyses);
            }
        } catch (err) {
            console.error("Failed to fetch analyses:", err);
        }
        setLoading(false);
    };

    const handleAnalyze = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (url.trim()) {
            navigate(`/analyze?url=${encodeURIComponent(url)}`);
        }
    };

    const completedAnalyses = analyses.filter((a) => a.status === "completed");
    const avgScore = completedAnalyses.length
        ? Math.round(completedAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / completedAnalyses.length)
        : 0;

    const getScoreClass = (s: number) => {
        if (s >= 80) return "score-good";
        if (s >= 50) return "score-medium";
        return "score-poor";
    };

    const getScoreBg = (s: number) => {
        if (s >= 80) return "bg-success/10 border-success/20";
        if (s >= 50) return "bg-warning/10 border-warning/20";
        return "bg-danger/10 border-danger/20";
    };

    useEffect(() => {
        (async () => await fetchRecent())();
    }, []);

    return (
        <div className="min-h-screen pt-16 md:pt-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Page Header */}
                <div className="mb-8 animate-fade-in-up">
                    <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Welcome back,{" "}
                        <span className="gradient-text">{user?.name}</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1.5">
                        Analyze websites and boost your SEO performance.
                    </p>
                </div>

                {/* Quick Analyze Bar */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
                    <form onSubmit={handleAnalyze}>
                        <div className="bg-card border border-border rounded-2xl p-2 flex items-center gap-2 shadow-sm max-w-2xl">
                            <div className="flex items-center gap-3 flex-1 px-3">
                                <SearchIcon size={18} className="text-muted-foreground shrink-0" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Enter a URL to analyze..."
                                    className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm py-2.5"
                                    id="dashboard-url-input"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary px-5 py-2.5 rounded-xl shrink-0 text-sm"
                                id="dashboard-analyze-btn"
                            >
                                <Zap size={14} />
                                Analyze
                                <ArrowRightIcon size={14} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
                    {/* Total Scans */}
                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Scans</p>
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                                <GlobeIcon size={17} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-foreground">{analyses.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Websites analyzed</p>
                    </div>

                    {/* Avg Score */}
                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Score</p>
                            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center text-accent">
                                <TrendingUpIcon size={17} />
                            </div>
                        </div>
                        <p className={`text-3xl font-black ${getScoreClass(avgScore)}`}>{avgScore || "—"}</p>
                        <div className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-medium border ${getScoreBg(avgScore)}`}>
                            {avgScore >= 80 ? "Good" : avgScore >= 50 ? "Needs work" : "Poor"}
                        </div>
                    </div>

                    {/* Scans Left */}
                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scans Per Dxay</p>
                            <div className="w-9 h-9 rounded-xl bg-accent-teal/10 border border-accent-teal/15 flex items-center justify-center text-accent-teal">
                                <BarChart3Icon size={17} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-foreground">
                            {user?.plan === "free" ? `${Math.max(0, 5 - (user?.analysisCount || 0))}` : "∞"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {user?.plan === "free" ? "Free plan · 5/day" : "Pro plan · Unlimited"}
                        </p>
                    </div>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
                    <Link to="/analyze" className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/3 transition-all">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <SearchIcon size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">New Analysis</p>
                            <p className="text-xs text-muted-foreground">Analyze a website</p>
                        </div>
                    </Link>
                    <Link to="/rank-tracker" className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent/30 hover:bg-accent/3 transition-all">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                            <Target size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Rank Tracker</p>
                            <p className="text-xs text-muted-foreground">Track keywords</p>
                        </div>
                    </Link>
                    <Link to="/history" className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent-teal/30 hover:bg-accent-teal/3 transition-all">
                        <div className="w-9 h-9 rounded-lg bg-accent-teal/10 border border-accent-teal/15 flex items-center justify-center text-accent-teal group-hover:scale-105 transition-transform">
                            <History size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">History</p>
                            <p className="text-xs text-muted-foreground">Past analyses</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Analyses */}
                <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Recent Analyses</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Your latest SEO audits</p>
                        </div>
                        {analyses.length > 0 && (
                            <Link
                                to="/history"
                                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                View All
                                <ArrowRightIcon size={14} />
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                                <p className="text-sm text-muted-foreground">Loading analyses...</p>
                            </div>
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="card-elevated rounded-2xl p-14 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                                <SearchIcon size={28} className="text-muted-foreground opacity-60" />
                            </div>
                            <h3 className="text-base font-bold text-foreground mb-2">No analyses yet</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                                Enter a URL above to run your first AI-powered SEO analysis.
                            </p>
                            <Link to="/analyze" className="btn-primary text-sm px-6 py-2.5 rounded-xl inline-flex">
                                <Zap size={14} />
                                Start Analyzing
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analyses.map((a) => (
                                <AnalysesCard key={a._id} analysis={a} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
