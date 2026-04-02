import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import SplitAuthLayout from "../../components/layout/SplitAuthLayout";
import { LogIn, AlertCircle } from "lucide-react";
import { adminAPI } from "../../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await adminAPI.login({
        usernameOrEmail: form.identifier,
        password: form.password
      });

      // Role-based redirect after login
      if (response.token) {
        if (response.role === "ADMIN") {
          navigate("/admin");
        } else if (response.role === "REST_OWNER") {
          navigate("/restaurant-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid username/email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      title="Welcome Back"
      subtitle="Login to continue your journey"
      showBusiness={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div>
          <label className="block mb-2 font-medium">Username or Email</label>
          <input
            type="text"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition bg-white"
            placeholder="Enter your username or email"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition bg-white"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={() => setForm({ ...form, remember: !form.remember })}
              className="rounded border-border"
              disabled={isLoading}
            />
            <span className="text-sm">Remember Me</span>
          </label>

          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-primary text-white font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Login
            </>
          )}
        </motion.button>

        <p className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}