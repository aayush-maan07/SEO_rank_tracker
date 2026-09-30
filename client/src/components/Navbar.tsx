import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Search, BarChart3, History, LogOut, Menu, X, Target, Sun, Moon, ChartNoAxesColumnIcon, Zap } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
    const { user, logout } = useApp();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: "/dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
        { path: "/analyze", label: "Analyze", icon: <Search size={16} /> },
        { path: "/rank-tracker", label: "Rank Tracker", icon: <Target size={16} /> },
        { path: "/history", label: "History", icon: <History size={16} /> },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 navbar-container">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center shadow-sm">
                            <ChartNoAxesColumnIcon size={17} className="text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-foreground">Seo<span className="text-gradient-primary">Probe.ai</span></span>
                    </Link>

                    {/* Desktop nav */}
                    {user && (
                        <div className="hidden md:flex items-center gap-1 bg-muted/60 rounded-xl p-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors duration-150 ${
                                        isActive(link.path)
                                            ? "bg-card text-primary shadow-sm border-border"
                                            : "text-muted-foreground hover:text-foreground hover:bg-card/70 border-transparent"
                                    }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                        </button>

                        {user ? (
                            <>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-sm">
                                    <div className="w-7 h-7 rounded-lg gradient-bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="text-foreground font-semibold text-sm">{user.name}</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 ml-1">
                                        {user.plan}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all border border-transparent hover:border-danger/20"
                                >
                                    <LogOut size={15} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
                                    Log In
                                </Link>
                                <Link to="/register" className="btn-primary text-sm px-5 py-2 rounded-lg">
                                    <Zap size={14} />
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle container */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                        >
                            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                        </button>
                        <button
                            className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-all"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg animate-fade-in">
                    <div className="px-4 py-4 space-y-2">
                        {user ? (
                            <>
                                {/* User info */}
                                <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-muted rounded-xl border border-border">
                                    <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-foreground">{user.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 ml-auto shrink-0">
                                        {user.plan}
                                    </span>
                                </div>

                                {/* Nav links */}
                                <div className="space-y-1">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                                isActive(link.path)
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {link.icon}
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="pt-2 border-t border-border mt-3">
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 w-full transition-all"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-2 space-y-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-3 text-sm font-medium text-foreground text-center rounded-xl hover:bg-muted border border-border"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-3 text-sm font-bold text-center rounded-xl btn-primary w-full"
                                >
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
