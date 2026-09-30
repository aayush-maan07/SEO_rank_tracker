/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchIcon, GlobeIcon, FileSearchIcon, BrainIcon, CheckCircleIcon, AlertCircle, Loader2, ArrowRightIcon, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

const STEPS = [
    { icon: <GlobeIcon size={20} />, label: "Connecting to browser", desc: "Creating cloud browser session..." },
    { icon: <FileSearchIcon size={20} />, label: "Scanning website", desc: "Extracting meta tags, links, images..." },
    { icon: <BrainIcon size={20} />, label: "AI Analysis", desc: "Gemini is analyzing your SEO data..." },
    { icon: <CheckCircleIcon size={20} />, label: "Report Ready", desc: "Your SEO report is complete!" },
];

export default function Analyze() {
    const { api } = useApp();

    const [url, setUrl] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const pollRef = useRef<any>(null);

    const navigate = useNavigate();

    const handleAnalyze = async (submitUrl?: string) => {
        const targetUrl = submitUrl || url;
        if (!targetUrl.trim()) return;

        setError("");
        setAnalyzing(true);
        setCurrentStep(0);

        try {
            setCurrentStep(0);

            const res = await api.post("/api/analysis/analyze", {
                url: targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
            });

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            const id = res.data.analysisId;

            setCurrentStep(1);

            let attempts = 0;
            const maxAttempts = 60;

            pollRef.current = setInterval(async () => {
                attempts++;
                if (attempts > maxAttempts) {
                    if (pollRef.current) clearInterval(pollRef.current);
                    setError("Analysis is taking longer than expected. Check your history later.");
                    setAnalyzing(false);
                    return;
                }

                try {
                    const check = await api.get(`/api/analysis/${id}`);
                    const analysis = check.data.analysis;

                    if (analysis.status === "completed") {
                        if (pollRef.current) clearInterval(pollRef.current);
                        setCurrentStep(3);
                        setTimeout(() => navigate(`/report/${id}`), 1000);
                    } else if (analysis.status === "failed") {
                        if (pollRef.current) clearInterval(pollRef.current);
                        setError("Analysis failed. The AI model might be down.");
                        setAnalyzing(false);
                    } else {
                        if (attempts > 5) setCurrentStep(2);
                    }
                } catch {
                    // Ignore polling errors
                }
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to start analysis");
            setAnalyzing(false);
        }
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        handleAnalyze();
    };

    useEffect(() => {
        const prefillUrl = searchParams.get("url");
        if (prefillUrl) {
            (() => setUrl(prefillUrl))();
            setTimeout(() => handleAnalyze(prefillUrl), 500);
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen pt-16 md:pt-20 bg-background hero-bg">
            <div className="bg-grid-pattern absolute inset-0 opacity-40 pointer-events-none -z-1" />
            <div className="max-w-2xl mx-auto px-4 py-16">
                {!analyzing ? (
                    <div className="animate-fade-in-up">
                        {/* Header */}
                        <div className="text-center mb-10 mt-16">
                            <div className="section-label mx-auto mb-5">SEO Analyzer</div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
                                Analyze{" "}
                                <span className="gradient-text">Any Website</span>
                            </h1>
                            <p className="text-muted-foreground">
                                Enter a URL to get a comprehensive AI-powered SEO audit report.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 px-4 py-3 rounded-xl severity-critical text-sm flex items-center gap-2 max-w-xl mx-auto animate-fade-in">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* URL Input */}
                        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6">
                            <div className="bg-card border border-border rounded-2xl p-2 flex items-center gap-2 shadow-md shadow-primary/5">
                                <div className="flex items-center gap-3 flex-1 px-3">
                                    <SearchIcon size={18} className="text-muted-foreground shrink-0" />
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Enter website URL (e.g., example.com)"
                                        className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm py-3"
                                        id="analyze-url-input"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary px-5 py-2.5 rounded-xl shrink-0 text-sm"
                                    id="analyze-submit-btn"
                                >
                                    <Zap size={14} />
                                    Analyze
                                    <ArrowRightIcon size={14} />
                                </button>
                            </div>
                        </form>

                        {/* Example URLs */}
                        <div className="text-center text-sm text-muted-foreground">
                            <span className="mr-1">Try:</span>
                            {["github.com", "stripe.com", "vercel.com"].map((ex, i) => (
                                <span key={ex}>
                                    <button
                                        onClick={() => setUrl(ex)}
                                        className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                                    >
                                        {ex}
                                    </button>
                                    {i < 2 ? ", " : ""}
                                </span>
                            ))}
                        </div>

                        {/* Info cards */}
                        <div className="grid grid-cols-3 gap-3 mt-10 max-w-xl mx-auto">
                            {[
                                { label: "SEO Audit", desc: "Full on-page analysis" },
                                { label: "AI-Powered", desc: "Gemini AI insights" },
                                { label: "Real Browser", desc: "Actual rendering" },
                            ].map((item) => (
                                <div key={item.label} className="p-3 rounded-xl bg-card border border-border text-center">
                                    <p className="text-xs font-bold text-primary mb-0.5">{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* Analyzing header */}
                        <div className="text-center mb-10 mt-16">
                            <div className="w-14 h-14 rounded-2xl gradient-bg-primary flex items-center justify-center mx-auto mb-4">
                                <Loader2 size={24} className="text-white animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Analyzing Your Website</h2>
                            <p className="text-muted-foreground mt-2 text-sm flex items-center justify-center gap-1.5">
                                <GlobeIcon size={13} />
                                {url}
                            </p>
                        </div>

                        {/* Progress Steps */}
                        <div className="max-w-sm mx-auto space-y-3">
                            {STEPS.map((step, i) => {
                                const isComplete = i < currentStep;
                                const isCurrent = i === currentStep;
                                const isPending = i > currentStep;

                                return (
                                    <div
                                        key={step.label}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                            isCurrent
                                                ? "bg-primary/5 border-primary/25 shadow-sm"
                                                : isComplete
                                                ? "bg-success/5 border-success/20 opacity-80"
                                                : "bg-card border-border opacity-40"
                                        }`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                isComplete
                                                    ? "bg-success/15 text-success border border-success/25"
                                                    : isCurrent
                                                    ? "gradient-bg-primary text-white"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {isComplete ? <CheckCircleIcon size={18} /> : step.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${isPending ? "text-muted-foreground" : "text-foreground"}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{step.desc}</p>
                                        </div>
                                        {isCurrent && (
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-xs text-muted-foreground mt-8">
                            ⏱ This may take 15–30 seconds depending on the website.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
