/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Target, Globe, Clock, TrendingUp, TrendingDown, Minus,
    RefreshCw, AlertCircle, ExternalLink, Trophy, Users, Calendar, Loader2
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface RankHistoryEntry {
    date: string;
    position: number | null;
    page: number | null;
    title: string;
    snippet: string;
}

interface Competitor {
    position: number;
    url: string;
    domain: string;
    title: string;
    snippet: string;
}

interface TrackingData {
    _id: string;
    keyword: string;
    url: string;
    domain: string;
    currentPosition: number | null;
    currentPage: number | null;
    bestPosition: number | null;
    positionChange: number;
    rankHistory: RankHistoryEntry[];
    competitors: Competitor[];
    active: boolean;
    lastChecked: string | null;
    status: string;
    createdAt: string;
}

export default function RankDetail() {
    const { api } = useApp();

    const { id } = useParams();
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const chartRef = useRef<HTMLCanvasElement>(null);

    const fetchTracking = async () => {
        try {
            const res = await api.get(`/api/rank/${id}`);
            if (res.data.success) {
                if (res.data.tracking.status === "checking") {
                    setTimeout(fetchTracking, 3000);
                    setTracking(res.data.tracking);
                    return;
                }
                setTracking(res.data.tracking);
            }
        } catch {
            // handled by null state
        }
        setLoading(false);
    };

    const handleRefresh = async () => {
        if (!tracking) return;
        setRefreshing(true);
        try {
            await api.post(`/api/rank/${tracking._id}/refresh`);
            setTracking((prev) => (prev ? { ...prev, status: "checking" } : null));

            const pollInterval = setInterval(async () => {
                try {
                    const check = await api.get(`/api/rank/${tracking._id}`);
                    if (check.data.tracking.status !== "checking") {
                        clearInterval(pollInterval);
                        setTracking(check.data.tracking);
                        setRefreshing(false);
                    }
                } catch (error: any) {
                    console.error(error);
                }
            }, 3000);
        } catch {
            setRefreshing(false);
        }
    };

    const drawChart = () => {
        const canvas = chartRef.current;
        if (!canvas || !tracking) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const history = tracking.rankHistory
            .filter((h) => h.position !== null)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (history.length === 0) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const padding = { top: 30, right: 30, bottom: 50, left: 50 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        ctx.clearRect(0, 0, w, h);

        const positions = history.map((h) => h.position!);
        const minPos = Math.max(1, Math.min(...positions) - 2);
        const maxPos = Math.max(...positions) + 2;

        const styles = getComputedStyle(document.documentElement);
        const borderColor = styles.getPropertyValue("--border").trim() || "rgba(128,128,128,0.2)";
        const primaryColor = styles.getPropertyValue("--accent").trim() || "#4f46e5";
        const textColor = styles.getPropertyValue("--muted-foreground").trim() || "rgba(128,128,128,0.5)";
        const bgColor = styles.getPropertyValue("--background").trim() || "#f8fafc";

        // Grid lines
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartH / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            const posVal = Math.round(minPos + ((maxPos - minPos) / gridLines) * i);
            ctx.fillStyle = textColor;
            ctx.font = "11px Inter, Outfit";
            ctx.textAlign = "right";
            ctx.fillText(`#${posVal}`, padding.left - 8, y + 4);
        }

        // Date labels
        ctx.fillStyle = textColor;
        ctx.font = "10px Inter, Outfit";
        ctx.textAlign = "center";
        const maxLabels = Math.min(history.length, 7);
        const labelStep = Math.max(1, Math.floor(history.length / maxLabels));
        for (let i = 0; i < history.length; i += labelStep) {
            const x = padding.left + (chartW / Math.max(history.length - 1, 1)) * i;
            const date = new Date(history[i].date);
            ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x, h - padding.bottom + 20);
        }

        // Line
        ctx.beginPath();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        history.forEach((entry, i) => {
            const x = padding.left + (chartW / Math.max(history.length - 1, 1)) * i;
            const yNorm = (entry.position! - minPos) / (maxPos - minPos);
            const y = padding.top + yNorm * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        gradient.addColorStop(0, "rgba(79, 70, 229, 0.18)");
        gradient.addColorStop(1, "rgba(79, 70, 229, 0)");

        ctx.beginPath();
        history.forEach((entry, i) => {
            const x = padding.left + (chartW / Math.max(history.length - 1, 1)) * i;
            const yNorm = (entry.position! - minPos) / (maxPos - minPos);
            const y = padding.top + yNorm * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(padding.left + chartW, h - padding.bottom);
        ctx.lineTo(padding.left, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Dots
        history.forEach((entry, i) => {
            const x = padding.left + (chartW / Math.max(history.length - 1, 1)) * i;
            const yNorm = (entry.position! - minPos) / (maxPos - minPos);
            const y = padding.top + yNorm * chartH;

            ctx.beginPath();
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = primaryColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = bgColor;
            ctx.fill();
        });

        // Y-axis label
        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = textColor;
        ctx.font = "11px Inter, Outfit";
        ctx.textAlign = "center";
        ctx.fillText("Position", 0, 0);
        ctx.restore();
    };

    const getChangeIndicator = (change: number) => {
        if (change > 0) return { icon: <TrendingUp size={16} />, text: `+${change}`, class: "text-success" };
        if (change < 0) return { icon: <TrendingDown size={16} />, text: `${change}`, class: "text-danger" };
        return { icon: <Minus size={16} />, text: "—", class: "text-muted-foreground" };
    };

    const getPositionColor = (pos: number | null) => {
        if (pos === null) return "text-muted-foreground";
        if (pos <= 3) return "text-success";
        if (pos <= 10) return "text-primary";
        if (pos <= 20) return "text-accent";
        return "text-danger";
    };

    const getPositionBgClass = (pos: number | null) => {
        if (pos === null) return "bg-muted border-border text-muted-foreground";
        if (pos <= 3) return "rank-badge-top3";
        if (pos <= 10) return "rank-badge-top10";
        if (pos <= 20) return "rank-badge-top20";
        return "rank-badge-low";
    };

    useEffect(() => {
        (async () => await fetchTracking())();
    }, [id]);

    useEffect(() => {
        if (tracking && tracking.rankHistory.length > 0 && chartRef.current) {
            drawChart();
        }
    }, [tracking, activeTab]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
                        <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Loading rank data...</p>
                </div>
            </div>
        );
    }

    if (!tracking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="card-elevated rounded-2xl p-10 text-center max-w-sm w-full">
                    <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={28} className="text-danger" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2">Tracking Not Found</h2>
                    <p className="text-sm text-muted-foreground mb-6">This keyword tracking entry doesn't exist.</p>
                    <Link to="/rank-tracker" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
                        Back to Rank Tracker
                    </Link>
                </div>
            </div>
        );
    }

    const change = getChangeIndicator(tracking.positionChange);
    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "competitors", label: `Competitors (${tracking.competitors.length})` },
        { id: "history", label: "History" },
    ];

    return (
        <div className="min-h-screen pt-16 md:pt-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Back + Header */}
                <div className="mb-8 animate-fade-in-up">
                    <Link
                        to="/rank-tracker"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group"
                    >
                        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Rank Tracker
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Keyword Detail</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                "<span className="gradient-text">{tracking.keyword}</span>"
                            </h1>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1">
                                    <Globe size={13} />
                                    <span>{tracking.domain}</span>
                                </div>
                                <a
                                    href={tracking.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:underline text-xs"
                                >
                                    Visit Site <ExternalLink size={11} />
                                </a>
                                {!tracking.active && (
                                    <span className="text-[10px] font-bold uppercase text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">Paused</span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || tracking.status === "checking"}
                            className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 self-start disabled:opacity-50"
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                            Refresh Now
                        </button>
                    </div>
                </div>

                {/* Score Hero Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
                    {/* Current Position */}
                    <div className="stat-card text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <Target size={13} />
                            <span className="uppercase tracking-wide font-semibold">Current Rank</span>
                        </div>
                        {tracking.status === "checking" ? (
                            <div className="flex items-center justify-center">
                                <Loader2 size={28} className="animate-spin text-primary" />
                            </div>
                        ) : (
                            <p className={`text-4xl font-black ${getPositionColor(tracking.currentPosition)}`}>
                                {tracking.currentPosition ? `#${tracking.currentPosition}` : "N/R"}
                            </p>
                        )}
                        {tracking.currentPage && (
                            <div className="mt-2">
                                <span className="text-[10px] font-semibold bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Page {tracking.currentPage}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Position Change */}
                    <div className="stat-card text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <TrendingUp size={13} />
                            <span className="uppercase tracking-wide font-semibold">Change</span>
                        </div>
                        <div className={`text-3xl font-black flex items-center justify-center gap-1.5 ${change.class}`}>
                            {change.icon}
                            {change.text}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">since last check</p>
                    </div>

                    {/* Best Position */}
                    <div className="stat-card text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <Trophy size={13} />
                            <span className="uppercase tracking-wide font-semibold">Best Ever</span>
                        </div>
                        <p className={`text-3xl font-black ${getPositionColor(tracking.bestPosition)}`}>
                            {tracking.bestPosition ? `#${tracking.bestPosition}` : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">all time</p>
                    </div>

                    {/* Data Points */}
                    <div className="stat-card text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <Calendar size={13} />
                            <span className="uppercase tracking-wide font-semibold">Data Points</span>
                        </div>
                        <p className="text-3xl font-black text-accent">{tracking.rankHistory.length}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">
                            {tracking.lastChecked ? new Date(tracking.lastChecked).toLocaleDateString() : "Never"}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 overflow-x-auto pb-1 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
                    <div className="tab-bar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-item ${activeTab === tab.id ? "tab-item-active" : ""}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div key={activeTab} className="animate-fade-in">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Ranking Chart */}
                            <div className="card-elevated rounded-2xl p-6">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center">
                                        <TrendingUp size={15} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">Ranking History</h3>
                                        <p className="text-xs text-muted-foreground">Position over time</p>
                                    </div>
                                </div>

                                {tracking.rankHistory.filter((h) => h.position !== null).length > 0 ? (
                                    <div className="relative" style={{ height: "280px" }}>
                                        <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} className="rounded-xl" />
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar size={32} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                                        <p className="text-sm text-muted-foreground">No ranking data yet. Check back after the daily tracking runs.</p>
                                    </div>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-3 text-center">
                                    ↑ Lower position number = higher rank. Updated daily at 6:00 AM UTC.
                                </p>
                            </div>

                            {/* Top 3 Competitors Preview */}
                            {tracking.competitors.length > 0 && (
                                <div className="card-elevated rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                                <Users size={15} className="text-accent" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-foreground">Top Competitors</h3>
                                                <p className="text-xs text-muted-foreground">Currently ranking above you</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("competitors")}
                                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                        >
                                            View All →
                                        </button>
                                    </div>
                                    <div className="space-y-2.5">
                                        {tracking.competitors.slice(0, 3).map((comp, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border hover:border-primary/20 transition-all group">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                                                    i === 0 ? "bg-amber-500/15 text-amber-500 border-amber-500/30" :
                                                    i === 1 ? "bg-slate-400/15 text-slate-400 border-slate-400/30" :
                                                    "bg-orange-500/15 text-orange-500 border-orange-500/30"
                                                }`}>
                                                    #{comp.position}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground truncate">{comp.title || comp.domain}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{comp.domain}</p>
                                                </div>
                                                <a
                                                    href={comp.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all"
                                                >
                                                    <ExternalLink size={13} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "competitors" && (
                        <div className="card-elevated rounded-2xl p-6">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    <Users size={15} className="text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">All Competitors</h3>
                                    <p className="text-xs text-muted-foreground">Sites ranking for "{tracking.keyword}"</p>
                                </div>
                            </div>

                            {tracking.competitors.length > 0 ? (
                                <div className="space-y-2.5">
                                    {tracking.competitors.map((comp, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border hover:border-primary/20 hover:bg-muted/70 transition-all">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                                                comp.position <= 3
                                                    ? "bg-success/10 text-success border-success/25"
                                                    : comp.position <= 10
                                                    ? "rank-badge-top10"
                                                    : "rank-badge-top20"
                                            }`}>
                                                #{comp.position}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">{comp.title || "Untitled"}</p>
                                                <p className="text-xs text-primary font-medium mt-0.5">{comp.domain}</p>
                                                {comp.snippet && (
                                                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{comp.snippet}</p>
                                                )}
                                            </div>
                                            <a
                                                href={comp.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all shrink-0"
                                            >
                                                <ExternalLink size={15} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users size={32} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                                    <p className="text-sm text-muted-foreground">No competitor data available yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="card-elevated rounded-2xl p-6">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                                    <Clock size={15} className="text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Ranking History</h3>
                                    <p className="text-xs text-muted-foreground">All recorded positions</p>
                                </div>
                            </div>

                            {tracking.rankHistory.length > 0 ? (
                                <div className="space-y-2">
                                    {[...tracking.rankHistory]
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((entry, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/40 border border-border hover:border-primary/15 transition-all">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                                                    entry.position === null
                                                        ? "bg-muted text-muted-foreground border-border"
                                                        : entry.position <= 3
                                                        ? "rank-badge-top3"
                                                        : entry.position <= 10
                                                        ? "rank-badge-top10"
                                                        : entry.position <= 20
                                                        ? "rank-badge-top20"
                                                        : "rank-badge-low"
                                                }`}>
                                                    {entry.position ? `#${entry.position}` : "—"}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {new Date(entry.date).toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                    <div className="flex items-center gap-2.5 mt-0.5">
                                                        {entry.page && (
                                                            <span className="text-xs text-muted-foreground">Page {entry.page}</span>
                                                        )}
                                                        {entry.title && (
                                                            <span className="text-xs text-muted-foreground truncate">{entry.title}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className={`text-base font-black ${getPositionColor(entry.position)}`}>
                                                        {entry.position ? `#${entry.position}` : "N/R"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar size={32} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                                    <p className="text-sm text-muted-foreground">No history data yet. Data will appear after the first rank check.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
