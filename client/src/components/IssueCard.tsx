import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info, Lightbulb } from "lucide-react";

interface Issue {
    severity: string;
    category: string;
    message: string;
    recommendation: string;
}

export default function IssueCard({ issue }: { issue: Issue }) {
    const [expanded, setExpanded] = useState(false);

    const severityConfig: Record<string, { icon: React.ReactNode; class: string; label: string; dotColor: string }> = {
        critical: {
            icon: <AlertCircle size={14} />,
            class: "severity-critical",
            label: "Critical",
            dotColor: "bg-danger",
        },
        warning: {
            icon: <AlertTriangle size={14} />,
            class: "severity-warning",
            label: "Warning",
            dotColor: "bg-warning",
        },
        info: {
            icon: <Info size={14} />,
            class: "severity-info",
            label: "Info",
            dotColor: "bg-accent",
        },
    };

    const config = severityConfig[issue.severity] || severityConfig.info;

    return (
        <div
            className="card-elevated rounded-xl overflow-hidden cursor-pointer transition-all"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start gap-3 p-4">
                {/* Severity badge */}
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${config.class}`}>
                    {config.icon}
                    {config.label}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{issue.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">{issue.category}</p>
                </div>

                <div className="text-muted-foreground shrink-0 mt-0.5 p-1 hover:bg-muted rounded-lg transition-colors">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {/* Expanded recommendation */}
            {expanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 bg-muted/30 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Lightbulb size={12} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-primary mb-1">Recommendation</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{issue.recommendation}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
