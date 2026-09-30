import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ScoreGauge from "../components/ScoreGauge";
import IssueCard from "../components/IssueCard";
import {
    ArrowLeft, Globe, Clock, FileText, Image, Link2,
    Heading, Tag, AlertCircle, ExternalLink, Type, Search, Loader2, CheckCircle2
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface AnalysisData {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    loadTime: number;
    pageSize: number;
    wordCount: number;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
    metaData: {
        title: string;
        description: string;
        canonical: string;
        robots: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        twitterCard: string;
        viewport: string;
        charset: string;
    };
    headings: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
        h1Texts: string[];
    };
    links: {
        internal: number;
        external: number;
        total: number;
    };
    images: {
        total: number;
        missingAlt: number;
        withAlt: number;
    };
    keywords: { word: string; count: number; density: number }[];
    issues: { severity: string; category: string; message: string; recommendation: string }[];
}

export default function Report() {
    const { api } = useApp();

    const { id } = useParams();
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    const fetchAnalysis = async () => {
        try {
            const res = await api.get(`/api/analysis/${id}`);
            if (res.data.success) {
                if (res.data.analysis.status === "processing") {
                    setTimeout(fetchAnalysis, 2000);
                    return;
                }
                setAnalysis(res.data.analysis);
            } else {
                setError("Analysis not found");
            }
        } catch {
            setError("Failed to load analysis");
        }
        setLoading(false);
    };

    const getScoreClass = (s: number) => {
        if (s >= 80) return "score-good";
        if (s >= 50) return "score-medium";
        return "score-poor";
    };

    const getScoreBgClass = (s: number) => {
        if (s >= 80) return "score-bg-good";
        if (s >= 50) return "score-bg-medium";
        return "score-bg-poor";
    };

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "meta", label: "Meta Tags" },
        { id: "content", label: "Content" },
        { id: "issues", label: "Issues" },
    ];

    useEffect(() => {
        (async () => await fetchAnalysis())();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
                        <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Loading report...</p>
                </div>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="card-elevated rounded-2xl p-10 text-center max-w-sm w-full">
                    <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={28} className="text-danger" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2">Report Not Found</h2>
                    <p className="text-muted-foreground text-sm mb-6">{error || "This analysis doesn't exist."}</p>
                    <Link to="/dashboard" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (analysis.status === "failed") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="card-elevated rounded-2xl p-10 text-center max-w-sm w-full">
                    <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={28} className="text-danger" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2">Analysis Failed</h2>
                    <p className="text-muted-foreground text-sm mb-6">The AI model might be down. Please try again later.</p>
                    <Link to="/analyze" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
                        Try Again
                    </Link>
                </div>
            </div>
        );
    }

    const criticalCount = analysis.issues.filter((i) => i.severity === "critical").length;
    const warningCount = analysis.issues.filter((i) => i.severity === "warning").length;
    const infoCount = analysis.issues.filter((i) => i.severity === "info").length;

    let hostname = analysis.url;
    try { hostname = new URL(analysis.url).hostname; } catch { /* keep */ }

    return (
        <div className="min-h-screen pt-16 md:pt-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Back + Header */}
                <div className="mb-8 animate-fade-in-up">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group"
                    >
                        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">SEO Report</p>
                            <h1 className="text-2xl font-bold text-foreground truncate">{hostname}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                <a
                                    href={analysis.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors truncate max-w-xs"
                                >
                                    {analysis.url}
                                    <ExternalLink size={11} />
                                </a>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock size={11} />
                                    {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Hero */}
                <div className="card-elevated rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Overall Score */}
                        <div className="text-center shrink-0">
                            <ScoreGauge score={analysis.overallScore} size={160} strokeWidth={12} label="Overall Score" />
                        </div>

                        {/* Right panel */}
                        <div className="flex-1 w-full">
                            {/* Category Scores */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                {[
                                    { label: "SEO", value: analysis.categories.seo, icon: <Search size={16} /> },
                                    { label: "Performance", value: analysis.categories.performance, icon: <Clock size={16} /> },
                                    { label: "Accessibility", value: analysis.categories.accessibility, icon: <Globe size={16} /> },
                                    { label: "Best Practices", value: analysis.categories.bestPractices, icon: <Tag size={16} /> },
                                ].map((cat) => (
                                    <div
                                        key={cat.label}
                                        className={`rounded-xl p-4 border text-center ${getScoreBgClass(cat.value)}`}
                                    >
                                        <div className={`flex items-center justify-center gap-1 mb-2 ${getScoreClass(cat.value)}`}>
                                            {cat.icon}
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{cat.label}</span>
                                        </div>
                                        <p className={`text-2xl font-black ${getScoreClass(cat.value)}`}>{cat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
                                    <p className="text-base font-black text-primary">{analysis.loadTime}ms</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Load Time</p>
                                </div>
                                <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
                                    <p className="text-base font-black text-accent">{Math.round(analysis.pageSize / 1024)}KB</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Page Size</p>
                                </div>
                                <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
                                    <p className="text-base font-black text-foreground">{analysis.wordCount.toLocaleString()}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Words</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 overflow-x-auto pb-1 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
                    <div className="tab-bar flex-shrink-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-item ${activeTab === tab.id ? "tab-item-active" : ""}`}
                            >
                                {tab.label}
                                {tab.id === "issues" && analysis.issues.length > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-danger/15 text-danger">
                                        {analysis.issues.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div key={activeTab} className="animate-fade-in">
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Issues Summary */}
                            <div className="card-elevated rounded-2xl p-6">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center">
                                        <AlertCircle size={15} className="text-danger" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">Issues Summary</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="severity-critical rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black">{criticalCount}</p>
                                        <p className="text-xs font-semibold mt-1 uppercase tracking-wide">Critical</p>
                                    </div>
                                    <div className="severity-warning rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black">{warningCount}</p>
                                        <p className="text-xs font-semibold mt-1 uppercase tracking-wide">Warning</p>
                                    </div>
                                    <div className="severity-info rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black">{infoCount}</p>
                                        <p className="text-xs font-semibold mt-1 uppercase tracking-wide">Info</p>
                                    </div>
                                </div>

                                {analysis.issues.length > 0 && (
                                    <div className="space-y-2.5">
                                        {analysis.issues.slice(0, 3).map((issue, i) => (
                                            <IssueCard key={i} issue={issue} />
                                        ))}
                                        {analysis.issues.length > 3 && (
                                            <button
                                                onClick={() => setActiveTab("issues")}
                                                className="w-full text-center text-sm text-primary hover:text-primary/80 font-semibold py-2.5 rounded-xl hover:bg-primary/5 transition-all"
                                            >
                                                View all {analysis.issues.length} issues →
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5">
                                {/* Links Analysis */}
                                <div className="card-elevated rounded-2xl p-6">
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <Link2 size={15} className="text-primary" />
                                        </div>
                                        <h3 className="text-base font-bold text-foreground">Links Analysis</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Internal", value: analysis.links.internal, color: "text-primary" },
                                            { label: "External", value: analysis.links.external, color: "text-accent" },
                                            { label: "Total", value: analysis.links.total, color: "text-foreground" },
                                        ].map((stat) => (
                                            <div key={stat.label} className="bg-muted/50 border border-border rounded-xl p-3.5 text-center">
                                                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Images Audit */}
                                <div className="card-elevated rounded-2xl p-6">
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                            <Image size={15} className="text-accent" />
                                        </div>
                                        <h3 className="text-base font-bold text-foreground">Images Audit</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Total", value: analysis.images.total, color: "text-foreground" },
                                            { label: "With Alt", value: analysis.images.withAlt, color: "text-success" },
                                            { label: "Missing Alt", value: analysis.images.missingAlt, color: analysis.images.missingAlt > 0 ? "text-danger" : "text-success" },
                                        ].map((stat) => (
                                            <div key={stat.label} className="bg-muted/50 border border-border rounded-xl p-3.5 text-center">
                                                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Headings */}
                            <div className="card-elevated rounded-2xl p-6">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
                                        <Heading size={15} className="text-warning" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">Heading Structure</h3>
                                </div>
                                <div className="space-y-2.5">
                                    {["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => {
                                        const count = analysis.headings[tag as keyof typeof analysis.headings] as number;
                                        const maxBar = Math.max(
                                            analysis.headings.h1, analysis.headings.h2, analysis.headings.h3,
                                            analysis.headings.h4, analysis.headings.h5, analysis.headings.h6, 1
                                        );
                                        return (
                                            <div key={tag} className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold font-mono text-muted-foreground w-5 uppercase">{tag}</span>
                                                <div className="flex-1 h-5 rounded-lg bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-lg gradient-bg-primary transition-all duration-700"
                                                        style={{ width: `${(count / maxBar) * 100}%`, minWidth: count > 0 ? "16px" : "0" }}
                                                    />
                                                </div>
                                                <span className={`text-sm font-bold w-6 text-right ${tag === "h1" && count !== 1 ? "text-danger" : "text-foreground"}`}>
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {analysis.headings.h1Texts.length > 0 && (
                                    <div className="mt-4 p-3.5 rounded-xl bg-muted/50 border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">H1 Text:</p>
                                        {analysis.headings.h1Texts.map((text, i) => (
                                            <p key={i} className="text-sm text-foreground truncate">{text}</p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Keywords */}
                            <div className="card-elevated rounded-2xl p-6">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center">
                                        <Type size={15} className="text-accent-teal" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">Top Keywords</h3>
                                </div>
                                {analysis.keywords.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {analysis.keywords.map((kw, i) => (
                                            <div key={kw.word} className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                                                <span className="flex-1 text-sm font-semibold text-foreground">{kw.word}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{kw.count}×</span>
                                                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                                        style={{ width: `${Math.min(kw.density * 10, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground w-10 text-right font-medium">{kw.density}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No keyword data available.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "meta" && (
                        <div className="card-elevated rounded-2xl p-6">
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center">
                                    <FileText size={15} className="text-white" />
                                </div>
                                <h3 className="text-base font-bold text-foreground">Meta Tags Analysis</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Title", value: analysis.metaData.title, ideal: "50-60 characters", len: analysis.metaData.title.length },
                                    { label: "Description", value: analysis.metaData.description, ideal: "150-160 characters", len: analysis.metaData.description.length },
                                    { label: "Canonical URL", value: analysis.metaData.canonical },
                                    { label: "Robots", value: analysis.metaData.robots },
                                    { label: "Viewport", value: analysis.metaData.viewport },
                                    { label: "Charset", value: analysis.metaData.charset },
                                    { label: "OG Title", value: analysis.metaData.ogTitle },
                                    { label: "OG Description", value: analysis.metaData.ogDescription },
                                    { label: "OG Image", value: analysis.metaData.ogImage },
                                    { label: "Twitter Card", value: analysis.metaData.twitterCard },
                                ].map((meta) => (
                                    <div key={meta.label} className="bg-muted/50 border border-border rounded-xl p-4 hover:border-primary/20 transition-all">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                {meta.value ? (
                                                    <CheckCircle2 size={13} className="text-success shrink-0" />
                                                ) : (
                                                    <AlertCircle size={13} className="text-danger shrink-0" />
                                                )}
                                                <span className="text-sm font-semibold text-foreground">{meta.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {meta.len !== undefined && (
                                                    <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full font-medium">
                                                        {meta.len} chars
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {meta.value ? (
                                            <p className="text-xs text-muted-foreground break-all pl-5">{meta.value}</p>
                                        ) : (
                                            <p className="text-xs text-danger/70 italic pl-5">Missing</p>
                                        )}
                                        {meta.ideal && (
                                            <p className="text-[10px] text-muted-foreground mt-1 pl-5">Ideal: {meta.ideal}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "content" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="card-elevated rounded-2xl p-6">
                                <h3 className="text-base font-bold text-foreground mb-5">Content Statistics</h3>
                                <div className="space-y-2.5">
                                    {[
                                        { label: "Word Count", value: analysis.wordCount.toLocaleString(), color: "text-foreground" },
                                        { label: "Page Size", value: `${Math.round(analysis.pageSize / 1024)} KB`, color: "text-foreground" },
                                        { label: "Load Time", value: `${(analysis.loadTime / 1000).toFixed(2)}s`, color: analysis.loadTime < 3000 ? "text-success" : analysis.loadTime < 5000 ? "text-warning" : "text-danger" },
                                        { label: "Total Links", value: analysis.links.total.toString(), color: "text-foreground" },
                                        { label: "Total Images", value: analysis.images.total.toString(), color: "text-foreground" },
                                        { label: "Total Headings", value: (analysis.headings.h1 + analysis.headings.h2 + analysis.headings.h3 + analysis.headings.h4 + analysis.headings.h5 + analysis.headings.h6).toString(), color: "text-foreground" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="flex items-center justify-between p-3.5 bg-muted/50 border border-border rounded-xl hover:border-primary/15 transition-all">
                                            <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                                            <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card-elevated rounded-2xl p-6">
                                <h3 className="text-base font-bold text-foreground mb-5">Heading Hierarchy</h3>
                                <div className="space-y-2">
                                    {["h1", "h2", "h3", "h4", "h5", "h6"].map((tag, i) => {
                                        const count = analysis.headings[tag as keyof typeof analysis.headings] as number;
                                        return (
                                            <div
                                                key={tag}
                                                className="flex items-center gap-3 p-2.5 bg-muted/30 border border-border rounded-lg"
                                                style={{ paddingLeft: `${i * 10 + 12}px` }}
                                            >
                                                <span className="text-[10px] font-mono font-bold text-primary uppercase">&lt;{tag}&gt;</span>
                                                <span className="text-xs text-muted-foreground flex-1">
                                                    {count} {count === 1 ? "tag" : "tags"}
                                                </span>
                                                {tag === "h1" && (
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${count === 1 ? "score-bg-good text-success" : "score-bg-poor text-danger"}`}>
                                                        {count === 1 ? "✓ Good" : count === 0 ? "✗ Missing" : "✗ Multiple"}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "issues" && (
                        <div>
                            {analysis.issues.length > 0 ? (
                                <>
                                    {/* Issue filter badges */}
                                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filter:</span>
                                        <span className="severity-critical px-3 py-1 rounded-full text-xs font-bold">
                                            {criticalCount} Critical
                                        </span>
                                        <span className="severity-warning px-3 py-1 rounded-full text-xs font-bold">
                                            {warningCount} Warning
                                        </span>
                                        <span className="severity-info px-3 py-1 rounded-full text-xs font-bold">
                                            {infoCount} Info
                                        </span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {analysis.issues.map((issue, i) => (
                                            <IssueCard key={i} issue={issue} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="card-elevated rounded-2xl p-14 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
                                        <Loader2 size={28} className="text-success" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-2">No Issues Found!</h3>
                                    <p className="text-sm text-muted-foreground">Your website is following SEO best practices. Great work!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
