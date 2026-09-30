/* eslint-disable @typescript-eslint/no-explicit-any */
import { homeFeaturesData } from "../../assets/assets";

export default function Features() {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="bg-dot-pattern absolute inset-0 -z-1 opacity-40" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <div className="section-label mx-auto mb-5">Features</div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground tracking-tight">
                        Everything You Need to{" "}
                        <span className="gradient-text">Rank Higher</span>
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Comprehensive SEO analysis powered by real browser rendering and artificial intelligence.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {homeFeaturesData.map((f: any, i: number) => (
                        <div
                            key={f.title}
                            className="card-elevated p-6 group animate-fade-in-up"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-primary bg-primary/8 border border-primary/15 group-hover:scale-105 transition-transform duration-300">
                                {f.icon}
                            </div>
                            <h3 className="text-base font-semibold mb-2 text-foreground">{f.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                            {/* Bottom accent on hover */}
                            <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
