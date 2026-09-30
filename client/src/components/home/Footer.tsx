/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartNoAxesColumnIcon } from "lucide-react";
import { homefooterLinks } from "../../assets/assets";
import { SiX, SiInstagram, SiFacebook, SiTwitch } from "@icons-pack/react-simple-icons";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card text-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center">
                                <ChartNoAxesColumnIcon size={16} className="text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                Seo<span className="text-gradient-primary">Probe.ai</span>
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed w-5/6">
                            Optimize your website for search engines with AI-powered insights and real-time keyword tracking.
                        </p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: <SiX size={16} />, href: "#" },
                                { icon: <SiInstagram size={16} />, href: "#" },
                                { icon: <SiFacebook size={16} />, href: "#" },
                                { icon: <SiTwitch size={16} />, href: "#" },
                            ].map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {homefooterLinks.map((section: any) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold mb-4 text-foreground">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link: any) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} SeoProbe.ai. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-muted-foreground">All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
