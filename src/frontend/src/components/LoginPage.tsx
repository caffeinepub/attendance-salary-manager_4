import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function BriefcaseIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Attendance & Salary Manager logo"
    >
      <rect
        x="3"
        y="8"
        width="26"
        height="18"
        rx="3"
        className="fill-primary"
      />
      <rect
        x="8"
        y="4"
        width="16"
        height="6"
        rx="2"
        className="fill-destructive"
      />
      <rect
        x="7"
        y="14"
        width="18"
        height="2"
        rx="1"
        fill="white"
        fillOpacity="0.9"
      />
      <rect
        x="7"
        y="19"
        width="12"
        height="2"
        rx="1"
        fill="white"
        fillOpacity="0.6"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const ok = login(username.trim(), password);
    if (!ok) {
      setError("Invalid username or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-login-bg">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-destructive/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-2xl" />
      </div>

      {/* Geometric accent lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-destructive to-primary opacity-70" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-destructive via-primary to-destructive opacity-70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar with gradient */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-destructive to-primary" />

          <div className="p-8 sm:p-10">
            {/* Logo / Brand */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/30 mb-4">
                <BriefcaseIcon />
              </div>
              <h1 className="text-2xl font-bold font-display text-foreground tracking-tight leading-tight">
                Attendance &amp;
                <br />
                <span className="text-primary">Salary Manager</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to continue
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-sm font-semibold text-foreground"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  data-ocid="login.input"
                  className="h-11 border-input focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  data-ocid="login.input"
                  className="h-11 border-input focus-visible:ring-primary"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-destructive font-medium bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2"
                  data-ocid="login.error_state"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={loading}
                data-ocid="login.submit_button"
                className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <SpinnerIcon />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.form>

            {/* Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-muted-foreground">
                Use{" "}
                <span className="font-semibold text-primary">
                  admin / admin123
                </span>{" "}
                for full access or{" "}
                <span className="font-semibold text-muted-foreground">
                  guest / guest123
                </span>{" "}
                for view only
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
