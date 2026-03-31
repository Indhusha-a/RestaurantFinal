import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SplitAuthLayout from "../components/layout/SplitAuthLayout";
import { AlertCircle, LogIn } from "lucide-react";
import { restaurantAPI } from "../services/api";

export default function RestaurantLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusHint, setStatusHint] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await restaurantAPI.login(form);
      localStorage.setItem("restaurantToken", response.token);
      localStorage.setItem("restaurantUser", JSON.stringify(response));
      setStatusHint(response.message || "");
      navigate("/restaurant-dashboard");
    } catch (err) {
      setError(err.message || "Wrong restaurant credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      title="Restaurant Login"
      subtitle="Use your restaurant registration email and dedicated password"
      showBusiness={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-sm text-slate-700">
          <p className="font-semibold text-orange-600">Restaurant access only</p>
          <p className="mt-1">
            Log in using the restaurant registration email and dedicated password created during restaurant signup.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {statusHint && !error && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {statusHint}
          </div>
        )}

        <div>
          <label className="block mb-2 font-medium">Restaurant Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition bg-white"
            placeholder="Enter restaurant email"
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
            placeholder="Enter restaurant password"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-primary text-white font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            "Logging in..."
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Restaurant Login
            </>
          )}
        </button>

        <p className="text-sm text-muted-foreground text-center">
          Need to register your restaurant?{" "}
          <Link to="/restaurant-register" className="text-primary font-semibold hover:underline">
            Start registration
          </Link>
        </p>

        <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-400">
          Pending restaurants can still enter the dashboard and view their current status
        </p>
      </form>
    </SplitAuthLayout>
  );
}
