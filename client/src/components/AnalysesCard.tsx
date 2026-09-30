/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangleIcon, ClockIcon, ExternalLink } from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import { Link } from "react-router-dom";

export default function AnalysesCard({ analysis }: { analysis: any }) {
    const getScoreClass = (s: number) => {
        if (s >= 80) return "score-good";
        if (s >= 50) return "score-medium";
        return "score-poor";
    };

    const getScoreBg = (s: number) => {
        if (s >= 80) return "score-bg-good";
        if (s >= 50) return "score-bg-medium";
        return "score-bg-poor";
    };

    let hostname = analysis.url;
    try {
        hostname = new URL(analysis.url).hostname;
    } catch {
        /* keep url */
    }

    return (
        <Link
            to={`/report/${analysis._id}`}
            className="card-elevated rounded-2xl p-5 group block hover:border-primary/25 transition-all"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {hostname}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{analysis.url}</p>
                </div>

                {/* Score or status */}
                {analysis.status === "completed" ? (
                    <ScoreGauge score={analysis.overallScore} size={52} strokeWidth={5} />
                ) : analysis.status === "processing" ? (
                    <div className="w-12 h-12 rounded-xl bg-primary/8 border border-primary/20 flex items-center justify-center shrink-0">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-danger/8 border border-danger/20 flex items-center justify-center shrink-0">
                        <AlertTriangleIcon size={18} className="text-danger" />
                    </div>
                )}
            </div>

            {/* Category scores */}
            {analysis.status === "completed" && (
                <div className={`grid grid-cols-4 gap-1.5 mb-4 p-2.5 rounded-xl border ${getScoreBg(analysis.overallScore)}`}>
                    {[
                        { label: "SEO", value: analysis.categories.seo },
                        { label: "Perf", value: analysis.categories.performance },
                        { label: "A11y", value: analysis.categories.accessibility },
                        { label: "BP", value: analysis.categories.bestPractices },
                    ].map((c) => (
                        <div key={c.label} className="text-center">
                            <p className={`text-sm font-bold ${getScoreClass(c.value)}`}>{c.value}</p>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">{c.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ClockIcon size={11} />
                    {new Date(analysis.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={12} />
                    View Report
                </div>
            </div>
        </Link>
    );
}
