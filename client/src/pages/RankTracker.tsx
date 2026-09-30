/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Target, Plus, RefreshCw, Trash2, TrendingUp, TrendingDown, Minus,
    ExternalLink, Clock, Loader2, X, Search, Globe, AlertCircle,
    Eye, EyeOff, Filter, ArrowUpDown, Zap, CheckCircle2
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface KeywordItem {
    _id: string;
    keyword: string;
    url: string;
    domain: string;
    currentPosition: number | null;
    currentPage: number | null;
    bestPosition: number | null;
    positionChange: number;
    active: boolean;
    lastChecked: string | null;
    status: string;
    competitors: { position: number; url: string; domain: string; title: string; snippet: string }[];
}

export default function RankTracker() {
    const { api } = useApp();

    const [keywords, setKeywords] = useState<KeywordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKeyword, setNewKeyword] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");
    const [refreshing, setRefreshing] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const startPolling = (id: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const check = await api.get(`/api/rank/${id}`);
                if (check.data.tracking.status !== "checking") {
                    clearInterval(pollInterval);
                    setKeywords((prev) => prev.map((k) => (k._id === id ? check.data.tracking : k)));
                    setRefreshing((prev) => (prev === id ? null : prev));
                }
            } catch (error: any) {
                console.error(error);
            }
        }, 3000);
    };

    const fetchKeywords = async () => {
        try {
            const res = await api.get("/api/rank/list");
            if (res.data.success) {
                setKeywords(res.data.keywords);
                res.data.keywords
                    .filter((k: KeywordItem) => k.status === "checking")
                    .forEach((k: KeywordItem) => startPolling(k._id));
            }
        } catch (err) {
            console.error("Failed to fetch keywords:", err);
        }
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim() || !newUrl.trim()) return;

        setAdding(true);
        setAddError("");
        try {
            const res = await api.post("/api/rank/add", {
                keyword: newKeyword.trim(),
                url: newUrl.trim(),
            });
            if (res.data.success) {
                setKeywords((prev) => [res.data.tracking, ...prev]);
                setNewKeyword("");
                setNewUrl("");
                setShowAddModal(false);
                startPolling(res.data.tracking._id);
            }
        } catch (err: any) {
            setAddError(err.response?.data?.message || "Failed to add keyword");
        }
        setAdding(false);
    };

    const handleRefresh = async (id: string) => {
        setRefreshing(id);
        try {
            await api.post(`/api/rank/${id}/refresh`);
            setKeywords((prev) => prev.map((k) => (k._id === id ? { ...k, status: "checking" } : k)));
            startPolling(id);
        } catch (err) {
            console.error("Refresh failed:", err);
            setRefreshing(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this keyword tracking?")) return;
        setDeleting(id);
        try {
            await api.delete(`/api/rank/${id}`);
            setKeywords((prev) => prev.filter((k) => k._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
        setDeleting(null);
    };

    const handleToggle = async (id: string) => {
        try {
            const res = await api.put(`/api/rank/${id}/toggle`);
            if (res.data.success) {
                setKeywords((prev) => prev.map((k) => (k._id === id ? { ...k, active: res.data.tracking.active } : k)));
            }
        } catch (err) {
            console.error("Toggle failed:", err);
        }
    };

    const getPositionBadge = (pos: number | null) => {
        if (pos === null) return { text: "Not Ranked", class: "text-muted-foreground bg-muted border-border" };
        if (pos <= 3) return { text: `#${pos}`, class: "rank-badge-top3" };
        if (pos <= 10) return { text: `#${pos}`, class: "rank-badge-top10" };
        if (pos <= 20) return { text: `#${pos}`, class: "rank-badge-top20" };
        return { text: `#${pos}`, class: "rank-badge-low" };
    };

    const getChangeIndicator = (change: number) => {
        if (change > 0) return { icon: <TrendingUp size={13} />, text: `+${change}`, class: "text-success bg-success/10 border-success/25" };
        if (change < 0) return { icon: <TrendingDown size={13} />, text: `${change}`, class: "text-danger bg-danger/10 border-danger/25" };
        return { icon: <Minus size={13} />, text: "0", class: "text-muted-foreground bg-muted border-border" };
    };

    let processedData = [...keywords];

    if (searchQuery) {
        processedData = processedData.filter(
            (k) => k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) || k.domain.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (statusFilter !== "all") {
        if (statusFilter === "active") processedData = processedData.filter((k) => k.active === true);
        else if (statusFilter === "paused") processedData = processedData.filter((k) => k.active === false);
    }

    processedData.sort((a: any, b: any) => {
        if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        if (sortBy === "rank_asc") return (a.currentPosition || 999) - (b.currentPosition || 999);
        if (sortBy === "rank_desc") return (b.currentPosition || 0) - (a.currentPosition || 0);
        if (sortBy === "change") return (b.positionChange || 0) - (a.positionChange || 0);
        return 0;
    });

    useEffect(() => {
        (async () => await fetchKeywords())();
    }, []);

    return (
        <div className="min-h-screen pt-16 md:pt-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tracking</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            <span className="gradient-text">Rank Tracker</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Track your keyword rankings on Google — updated daily.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary text-sm px-5 py-2.5 rounded-xl self-start"
                        id="add-keyword-btn"
                    >
                        <Plus size={16} />
                        Track Keyword
                    </button>
                </div>

                {/* Stats summary row */}
                {keywords.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="text-xl font-black text-foreground">{keywords.length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Total Keywords</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="text-xl font-black text-success">{keywords.filter(k => k.active).length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="text-xl font-black text-primary">{keywords.filter(k => k.currentPosition && k.currentPosition <= 10).length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Top 10</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <p className="text-xl font-black text-accent">{keywords.filter(k => (k.positionChange || 0) > 0).length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Improved</p>
                        </div>
                    </div>
                )}

                {/* Filters Row */}
                <div className="mb-6 flex flex-col md:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
                    <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
                        <Search size={16} className="text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search keywords or domains..."
                            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1"
                            id="rank-search-input"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <Filter size={14} className="text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm text-foreground outline-none appearance-none pr-2 cursor-pointer"
                            >
                                <option value="all" className="bg-background">All Status</option>
                                <option value="active" className="bg-background">Active</option>
                                <option value="paused" className="bg-background">Paused</option>
                            </select>
                        </div>
                        <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm text-foreground outline-none appearance-none pr-2 cursor-pointer"
                            >
                                <option value="newest" className="bg-background">Newest First</option>
                                <option value="rank_asc" className="bg-background">Highest Ranked</option>
                                <option value="rank_desc" className="bg-background">Lowest Ranked</option>
                                <option value="change" className="bg-background">Biggest Gain</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Keywords List */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                            <p className="text-sm text-muted-foreground">Loading keywords...</p>
                        </div>
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="card-elevated rounded-2xl p-14 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                            <Target size={28} className="text-muted-foreground opacity-60" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-2">No keywords tracked yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                            Add your first keyword and URL to start tracking your Google rankings.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary text-sm px-6 py-2.5 rounded-xl inline-flex"
                        >
                            <Plus size={14} />
                            Track Your First Keyword
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        {processedData.map((kw) => {
                            const posBadge = getPositionBadge(kw.currentPosition);
                            const change = getChangeIndicator(kw.positionChange);

                            return (
                                <div
                                    key={kw._id}
                                    className={`card-elevated rounded-xl p-5 hover:border-primary/20 transition-all ${!kw.active ? "opacity-55" : ""}`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Position badge */}
                                        <div className="flex items-center gap-3 lg:w-40 shrink-0">
                                            {kw.status === "checking" ? (
                                                <div className="w-16 h-16 rounded-xl bg-primary/8 border border-primary/20 flex items-center justify-center">
                                                    <Loader2 size={22} className="text-primary animate-spin" />
                                                </div>
                                            ) : (
                                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-lg font-black border ${posBadge.class}`}>
                                                    {kw.currentPosition ? `#${kw.currentPosition}` : "—"}
                                                </div>
                                            )}
                                            {kw.status === "completed" && kw.currentPosition && (
                                                <div className="flex flex-col items-center">
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${change.class}`}>
                                                        {change.icon}
                                                        {change.text}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">change</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Keyword info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/rank/${kw._id}`}
                                                className="text-base font-bold text-foreground hover:text-primary transition-colors block truncate"
                                            >
                                                "{kw.keyword}"
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <Globe size={11} className="text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground truncate">{kw.domain}</span>
                                                </div>
                                                {kw.currentPage && (
                                                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Page {kw.currentPage}
                                                    </span>
                                                )}
                                                {!kw.active && (
                                                    <span className="text-[10px] font-semibold text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Paused
                                                    </span>
                                                )}
                                            </div>
                                            {kw.lastChecked && (
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                                    <Clock size={9} />
                                                    Last checked: {new Date(kw.lastChecked).toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        {kw.status === "completed" && (
                                            <div className="hidden md:flex items-center gap-4 bg-muted/50 border border-border rounded-xl px-4 py-2.5">
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-primary">{kw.bestPosition || "—"}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Best</p>
                                                </div>
                                                <div className="w-px h-6 bg-border" />
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-accent">{kw.competitors?.length || 0}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rivals</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Link
                                                to={`/rank/${kw._id}`}
                                                className="p-2.5 rounded-lg hover:bg-primary/8 text-muted-foreground hover:text-primary transition-all"
                                                title="View Details"
                                            >
                                                <ExternalLink size={15} />
                                            </Link>
                                            <button
                                                onClick={() => handleRefresh(kw._id)}
                                                disabled={refreshing === kw._id || kw.status === "checking"}
                                                className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
                                                title="Refresh Ranking"
                                            >
                                                <RefreshCw size={15} className={refreshing === kw._id ? "animate-spin" : ""} />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(kw._id)}
                                                className={`p-2.5 rounded-lg hover:bg-muted transition-all ${kw.active ? "text-success hover:text-success" : "text-muted-foreground hover:text-foreground"}`}
                                                title={kw.active ? "Pause Tracking" : "Resume Tracking"}
                                            >
                                                {kw.active ? <Eye size={15} /> : <EyeOff size={15} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(kw._id)}
                                                disabled={deleting === kw._id}
                                                className="p-2.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deleting === kw._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Keyword Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="card-elevated rounded-2xl p-6 w-full max-w-md animate-scale-in">
                        {/* Modal header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl gradient-bg-primary flex items-center justify-center">
                                    <Target size={17} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-foreground">Track New Keyword</h2>
                                    <p className="text-xs text-muted-foreground">Monitor your Google rankings</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowAddModal(false); setAddError(""); }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {addError && (
                            <div className="mb-4 px-4 py-3 rounded-xl severity-critical text-sm flex items-center gap-2 animate-fade-in">
                                <AlertCircle size={15} className="shrink-0" />
                                {addError}
                            </div>
                        )}

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label htmlFor="modal-keyword" className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                                    Keyword
                                </label>
                                <div className="relative">
                                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id="modal-keyword"
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        placeholder='e.g., "best seo tools"'
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="modal-url" className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                                    Website URL
                                </label>
                                <div className="relative">
                                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id="modal-url"
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="e.g., example.com"
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3.5 flex items-start gap-2.5">
                                <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    We'll search Google for your keyword, find your website's position (up to page 5), and track it daily.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full py-3 btn-primary rounded-xl justify-center disabled:opacity-50"
                            >
                                {adding ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <Zap size={16} />
                                        Start Tracking
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
