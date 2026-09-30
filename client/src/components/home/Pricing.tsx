import { Link } from "react-router-dom";
import { CheckCircle, Zap, Crown } from "lucide-react";

const freePlanFeatures = ["5 analyses per day", "Full SEO report", "Keyword analysis", "Issue detection", "Export results"];
const proPlanFeatures = ["Unlimited analyses", "Priority processing", "Competitor analysis", "Historical tracking", "API access", "Email reports"];

export default function Pricing() {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="bg-dot-pattern absolute inset-0 -z-1 opacity-40" />
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <div className="section-label mx-auto mb-5">Pricing</div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground tracking-tight">
                        Simple,{" "}
                        <span className="gradient-text">Transparent</span>{" "}
                        Pricing
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">Start free. Upgrade when you need more power.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Free Plan */}
                    <div className="card-elevated p-8 flex flex-col animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={20} className="text-muted-foreground" />
                            <h3 className="text-xl font-bold text-foreground">Free</h3>
                        </div>
                        <div className="flex items-baseline gap-1 mb-6 mt-1">
                            <span className="text-4xl font-black text-foreground">$0</span>
                            <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {freePlanFeatures.map((item) => (
                                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <CheckCircle size={16} className="text-success shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/register"
                            className="block w-full py-3 rounded-xl text-center text-sm font-semibold border border-border text-foreground hover:bg-muted transition-all"
                        >
                            Get Started Free
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div
                        className="relative rounded-2xl p-8 flex flex-col overflow-hidden animate-fade-in-up border border-primary/25"
                        style={{ animationDelay: "100ms", background: "linear-gradient(135deg, rgba(30,58,138,0.04) 0%, rgba(79,70,229,0.04) 100%)" }}
                    >
                        {/* Popular badge */}
                        <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full gradient-bg-primary text-white text-xs font-bold">
                            <Crown size={11} />
                            Most Popular
                        </div>

                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 gradient-bg-primary rounded-t-2xl" />

                        <div className="flex items-center gap-2 mb-2">
                            <Crown size={20} className="text-primary" />
                            <h3 className="text-xl font-bold text-foreground">Pro</h3>
                        </div>
                        <div className="flex items-baseline gap-1 mb-6 mt-1">
                            <span className="text-4xl font-black text-primary">$19</span>
                            <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {proPlanFeatures.map((item) => (
                                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <CheckCircle size={16} className="text-primary shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 rounded-xl text-center text-sm font-bold btn-primary">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
