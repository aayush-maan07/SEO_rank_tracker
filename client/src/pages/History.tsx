import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Trash2, ExternalLink, Search, AlertCircle, Loader2, Filter, ArrowUpDown, Plus, CheckCircle2, XCircle } from "lucide-react";
import ScoreGauge from "../components/ScoreGauge";
import { useApp } from "../context/AppContext";

interface AnalysisItem {
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

export default function History() {
    const { api } = useApp();

    const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const fetchAnalyses = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/analysis/list?page=${page}&limit=12`);
            if (res.data.success) {
                setAnalyses(res.data.analyses);
                setTotalPages(res.data.pagination.pages);
            }
        } catch (err) {
            console.error("Failed to fetch:", err);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this analysis?")) return;
        setDeleting(id);
        try {
            await api.delete(`/api/analysis/${id}`);
            setAnalyses((prev) => prev.filter((a) => a._id !== id));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
        setDeleting(null);
    };

    const getScoreClass = (s: number) => {
        if (s >= 80) return "score-good";
        if (s >= 50) return "score-medium";
        return "score-poor";
    };

    let processedData = [...analyses];

    if (searchQuery) {
        processedData = processedData.filter((a) => a.url.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (statusFilter !== "all") {
        processedData = processedData.filter((a) => a.status === statusFilter);
    }

    processedData.sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "score_high") return b.overallScore - a.overallScore;
        if (sortBy === "score_low") return a.overallScore - b.overallScore;
        return 0;
    });

    useEffect(() => {
        (async () => await fetchAnalyses())();
    }, [page]);

    const statusBadge = (status: string) => {
        if (status === "completed") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20"><CheckCircle2 size={10} />Completed</span>;
        if (status === "processing") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"><Loader2 size={10} className="animate-spin" />Processing</span>;
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20"><XCircle size={10} />Failed</span>;
    };

    return (
        <div className="min-h-screen pt-16 md:pt-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">History</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Analysis <span className="gradient-text">History</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">View and manage all your past SEO analyses.</p>
                    </div>
                    <Link
                        to="/analyze"
                        className="btn-primary text-sm px-5 py-2.5 rounded-xl self-start"
                    >
                        <Plus size={16} />
                        New Analysis
                    </Link>
                </div>

                {/* Filters Row */}
                <div className="mb-6 flex flex-col md:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
                    <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
                        <Search size={16} className="text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by URL..."
                            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1"
                            id="history-search-input"
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
                                <option value="completed" className="bg-background">Completed</option>
                                <option value="processing" className="bg-background">Processing</option>
                                <option value="failed" className="bg-background">Failed</option>
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
                                <option value="oldest" className="bg-background">Oldest First</option>
                                <option value="score_high" className="bg-background">Highest Score</option>
                                <option value="score_low" className="bg-background">Lowest Score</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                            <p className="text-sm text-muted-foreground">Loading analyses...</p>
                        </div>
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="card-elevated rounded-2xl p-14 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                            <Search size={28} className="text-muted-foreground opacity-60" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-2">
                            {searchQuery ? "No matching analyses" : "No analyses yet"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            {searchQuery ? "Try a different search term." : "Run your first SEO analysis to see it here."}
                        </p>
                        <Link to="/analyze" className="btn-primary text-sm px-6 py-2.5 rounded-xl inline-flex">
                            Start Analyzing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2.5 animate-fade-in">
                        {processedData.map((a) => {
                            let hostname = a.url;
                            try { hostname = new URL(a.url).hostname; } catch { /* keep url */ }

                            return (
                                <div
                                    key={a._id}
                                    className="card-elevated rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-primary/20"
                                >
                                    {/* Score */}
                                    <div className="shrink-0">
                                        {a.status === "completed" ? (
                                            <ScoreGauge score={a.overallScore} size={52} strokeWidth={5} />
                                        ) : a.status === "processing" ? (
                                            <div className="w-[52px] h-[52px] rounded-xl bg-primary/8 border border-primary/20 flex items-center justify-center">
                                                <Loader2 size={20} className="text-primary animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="w-[52px] h-[52px] rounded-xl bg-danger/8 border border-danger/20 flex items-center justify-center">
                                                <AlertCircle size={20} className="text-danger" />
                                            </div>
                                        )}
                                    </div>

                                    {/* URL + Meta */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/report/${a._id}`}
                                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block"
                                        >
                                            {hostname}
                                        </Link>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{a.url}</p>
                                        <div className="flex items-center gap-2.5 mt-2">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock size={11} />
                                                {new Date(a.createdAt).toLocaleDateString()}
                                            </span>
                                            {statusBadge(a.status)}
                                        </div>
                                    </div>

                                    {/* Category scores */}
                                    {a.status === "completed" && (
                                        <div className="hidden lg:flex items-center gap-4 border border-border rounded-xl px-4 py-2.5">
                                            {[
                                                { label: "SEO", value: a.categories.seo },
                                                { label: "Perf", value: a.categories.performance },
                                                { label: "A11y", value: a.categories.accessibility },
                                                { label: "BP", value: a.categories.bestPractices },
                                            ].map((c) => (
                                                <div key={c.label} className="text-center min-w-[40px]">
                                                    <p className={`text-sm font-bold ${getScoreClass(c.value)}`}>{c.value}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{c.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Link
                                            to={`/report/${a._id}`}
                                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                                            title="View Report"
                                        >
                                            <ExternalLink size={15} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(a._id)}
                                            disabled={deleting === a._id}
                                            className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deleting === a._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground disabled:opacity-30 hover:bg-muted hover:border-primary/30 transition-all font-medium"
                        >
                            ← Previous
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="px-4 py-2 text-sm text-muted-foreground bg-primary/8 border border-primary/20 rounded-lg font-semibold text-primary">
                                {page}
                            </span>
                            <span className="text-muted-foreground text-sm">of {totalPages}</span>
                        </div>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground disabled:opacity-30 hover:bg-muted hover:border-primary/30 transition-all font-medium"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
