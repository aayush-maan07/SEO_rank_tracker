import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Loader2, ChartNoAxesColumnIcon, User2Icon, Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function Login({ state }: { state: string }) {
    const [isLoginState, setIsLoginState] = useState(state === "login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, register } = useApp();

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);

        let result;
        if (isLoginState) {
            result = await login(email, password);
        } else {
            result = await register(name, email, password);
        }

        if (result.success) {
            const redirect = searchParams.get("redirect") || "/dashboard";
            navigate(redirect);
        } else {
            toast.error(result.message || "Login failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background hero-bg">
            {/* Background grid */}
            <div className="bg-grid-pattern absolute inset-0 opacity-50 pointer-events-none" />

            <div className="w-full max-w-md relative animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center gap-2.5 group mb-2">
                        <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center shadow-md">
                            <ChartNoAxesColumnIcon size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            Seo<span className="text-gradient-primary">Probe.ai</span>
                        </span>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-3">
                        {isLoginState ? "Sign in to your account to continue" : "Create your free account today"}
                    </p>
                </div>

                {/* Form Card */}
                <div className="card-elevated rounded-2xl p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-foreground">
                            {isLoginState ? "Welcome back" : "Get started free"}
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name field (register only) */}
                        {!isLoginState && (
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Full Name</label>
                                <div className="relative">
                                    <User2Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email field */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input-field pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-2 rounded-xl btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            id="login-submit-btn"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                isLoginState ? "Sign In to Dashboard" : "Create Free Account"
                            )}
                        </button>
                    </form>
                </div>

                {/* Toggle */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    {isLoginState ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLoginState((prev) => !prev)}
                        className="text-primary hover:text-primary/80 font-semibold pl-1.5 transition-colors"
                    >
                        {isLoginState ? "Sign up free" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
