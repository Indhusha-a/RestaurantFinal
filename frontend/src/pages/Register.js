// ... (imports remain the same)
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, Phone, Users, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SplitAuthLayout from "../components/layout/SplitAuthLayout";
import { authAPI } from "../services/api";

export default function Register() {
  // ... (keep all state variables and useEffects exactly as they were)
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "prefer_not_to_say",
    avatarIcon: "neutral"
  });

  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // ... (keep debounced useEffects)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.username.length >= 3) {
        setCheckingUsername(true);
        try {
          const response = await authAPI.checkUsername(form.username);
          setUsernameAvailable(response.available);
        } catch (err) {
          setUsernameAvailable(false);
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.username]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.email.includes('@') && form.email.includes('.')) {
        setCheckingEmail(true);
        try {
          const response = await authAPI.checkEmail(form.email);
          setEmailAvailable(response.available);
        } catch (err) {
          setEmailAvailable(false);
        } finally {
          setCheckingEmail(false);
        }
      } else {
        setEmailAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // ... (keep validations)
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.email.includes('@')) {
      setError("Email must contain @ symbol");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one capital letter");
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(form.password)) {
      setError("Password must contain at least one special character");
      return;
    }

    if (usernameAvailable === false) {
      setError("Username is already taken. Please choose another.");
      return;
    }

    if (emailAvailable === false) {
      setError("Email is already registered. Please use another.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authAPI.register({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        phoneNumber: form.phone,
        password: form.password,
        gender: form.gender === "male" ? "Male" : 
                form.gender === "female" ? "Female" : "Prefer not to say",
        avatarIcon: form.avatarIcon
      });
      
      setSuccess("Registration successful! Redirecting to login...");
      
      // FIX: Redirect to login instead of dashboard to ensure clean state
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keep helper functions and JSX return exactly as before)
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);

  const getStrengthText = () => {
    if (!form.password) return "";
    if (passwordStrength === 0) return "Use at least 8 characters";
    if (passwordStrength === 1) return "Add a capital letter";
    if (passwordStrength === 2) return "Add a special character";
    return "Strong password!";
  };

  return (
    <SplitAuthLayout
      title="Create Your Account"
      subtitle="Start discovering amazing restaurants"
      showBusiness={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Messages */}
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

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </motion.div>
        )}

        {/* ... (rest of the form fields remain exactly the same) */}
        
        {/* First + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition"
              placeholder="John"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition"
              placeholder="Doe"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block mb-2 font-medium">Username</label>
          <div className="relative">
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={`w-full p-4 rounded-xl border ${
                usernameAvailable === true ? 'border-green-500 bg-green-50' :
                usernameAvailable === false ? 'border-red-500 bg-red-50' :
                checkingUsername ? 'border-yellow-500 bg-yellow-50' :
                'border-border'
              } focus:ring-2 focus:ring-primary transition pr-12`}
              placeholder="johndoe123"
              minLength={3}
              required
              disabled={isLoading}
            />
            {checkingUsername && (
              <div className="absolute right-4 top-4">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {usernameAvailable === true && (
            <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Username available
            </p>
          )}
          {usernameAvailable === false && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Username taken
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 font-medium">Email</label>
          <div className="relative">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full p-4 rounded-xl border ${
                emailAvailable === true ? 'border-green-500 bg-green-50' :
                emailAvailable === false ? 'border-red-500 bg-red-50' :
                checkingEmail ? 'border-yellow-500 bg-yellow-50' :
                'border-border'
              } focus:ring-2 focus:ring-primary transition pr-12`}
              placeholder="john@example.com"
              required
              disabled={isLoading}
            />
            {checkingEmail && (
              <div className="absolute right-4 top-4">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {emailAvailable === true && (
            <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Email available
            </p>
          )}
          {emailAvailable === false && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Email already registered
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-2 font-medium">Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
            className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition"
            placeholder="0771234567"
            maxLength={10}
            pattern="[0-9]{10}"
            required
            disabled={isLoading}
          />
          {form.phone && !/^\d{10}$/.test(form.phone) && (
            <p className="text-red-500 text-sm mt-1">Phone must be exactly 10 digits</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block mb-2 font-medium">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition bg-white"
            disabled={isLoading}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        {/* Avatar */}
        {form.gender !== "prefer_not_to_say" && (
          <div>
            <label className="block mb-2 font-medium">Avatar Style</label>
            <div className="flex gap-4">
              {['neutral', 'smile', 'chef', 'foodie'].map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setForm({ ...form, avatarIcon: avatar })}
                  disabled={isLoading}
                  className={`p-4 rounded-xl border-2 transition-all flex-1 ${
                    form.avatarIcon === avatar
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Users className="w-6 h-6 mx-auto" />
                  <span className="text-xs capitalize mt-1 block text-center">{avatar}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block mb-2 font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition pr-12"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-muted-foreground"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1,2,3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= passwordStrength ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${
                passwordStrength === 3 ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {getStrengthText()}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-2 font-medium">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={`w-full p-4 rounded-xl border ${
                form.confirmPassword && form.password !== form.confirmPassword
                  ? 'border-red-500 bg-red-50'
                  : form.confirmPassword && form.password === form.confirmPassword
                  ? 'border-green-500 bg-green-50'
                  : 'border-border'
              } focus:ring-2 focus:ring-primary transition pr-12`}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-4 text-muted-foreground"
              disabled={isLoading}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Passwords do not match
            </p>
          )}
          {form.confirmPassword && form.password === form.confirmPassword && form.password && (
            <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Passwords match
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          disabled={isLoading || 
            (form.username && usernameAvailable === false) ||
            (form.email && emailAvailable === false) ||
            (form.password && form.confirmPassword && form.password !== form.confirmPassword) ||
            (form.phone && !/^\d{10}$/.test(form.phone))}
          className="w-full py-4 rounded-xl bg-primary text-white font-semibold shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating account...</span>
            </div>
          ) : (
            "Create Account →"
          )}
        </motion.button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </SplitAuthLayout>
  );
}