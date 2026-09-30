/* eslint-disable @typescript-eslint/no-explicit-any */
import { homeHowItWorksData } from "../../assets/assets";

export default function HowItWorks() {
    return (
        <section className="relative py-24 sm:py-32 bg-muted/30">
            <div className="bg-grid-pattern absolute inset-0 -z-1 opacity-60" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <div className="section-label mx-auto mb-5">How It Works</div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground tracking-tight">
                        Get Insights in{" "}
                        <span className="gradient-text">3 Simple Steps</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        SeoProbe.ai uses advanced browser automation and AI to simulate a real user experience and provide deep SEO insights.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Connecting line (Desktop) */}
                    <div className="hidden md:block absolute top-[80px] left-[22%] right-[22%] h-px border-t-2 border-dashed border-border pointer-events-none z-0" />

                    {homeHowItWorksData.map((step: any, i: number) => (
                        <div
                            key={step.num}
                            className="relative z-10 animate-fade-in-up"
                            style={{ animationDelay: `${i * 120}ms` }}
                        >
                            <div className="card-elevated p-8 text-center h-full group">
                                {/* Step number */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    {i + 1}
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2 text-primary bg-primary/8 border border-primary/15 group-hover:bg-primary/12 transition-all duration-300">
                                    {step.icon}
                                </div>

                                <h3 className="text-base font-bold mb-2.5 text-foreground">{step.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
