"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const allowedDomains = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "icloud.com", "protonmail.com", "rediffmail.com", "ymail.com",
  "live.com", "msn.com", "rocketmail.com"
];
const validateForm = (form, isSignup) => {
  const errors = {};

  if (isSignup) {
    if (!form.name.trim()) {
      errors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(form.name)) {
      errors.name = "Name can only contain letters";
    }
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errors.email = "Enter a valid email address";
    } else {
      const domain = form.email.trim().toLowerCase().split("@")[1];
      if (!allowedDomains.includes(domain)) {
        errors.email = `Please use a valid email provider (e.g. Gmail, Yahoo, Outlook)`;
      }
    }
  }

  if (!form.password) {
  errors.password = "Password is required";
} else if (form.password.length < 8) {
  errors.password = "Password must be at least 8 characters";
} else if (!/^[0-9]+$/.test(form.password)) {
  errors.password = "Password must contain numbers only";
}

  return errors;
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, user } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("signup") === "true") setIsSignup(true);
  }, [searchParams]);

  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Real-time error clear karo jab user type kare
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    setGlobalError("");
  };

  const handleSubmit = () => {
    setGlobalError("");

    const validationErrors = validateForm(form, isSignup);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (isSignup) {
        const result = signup(form.name.trim(), form.email.trim().toLowerCase(), form.password);
        if (result.error) {
          setGlobalError(result.error);
          setLoading(false);
          return;
        }
      } else {
        const result = login(form.email.trim().toLowerCase(), form.password);
        if (result.error) {
          setGlobalError(result.error);
          setLoading(false);
          return;
        }
      }
      router.push("/");
    }, 600);
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setErrors({});
    setGlobalError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-gray-900 font-semibold text-lg">
              Hire<span className="text-blue-600">App</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {isSignup ? "Start your smart job journey" : "Login to continue"}
          </p>

          {/* Global Error */}
          {globalError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <span>⚠️</span> {globalError}
            </div>
          )}

          <div className="space-y-4">

            {/* Name — only signup */}
            {isSignup && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Bhumika Banke"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all
                    ${errors.name
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : "border-gray-200 focus:border-blue-400"}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all
                  ${errors.email
                    ? "border-red-300 bg-red-50 focus:border-red-400"
                    : "border-gray-200 focus:border-blue-400"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all pr-10
                    ${errors.password
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : "border-gray-200 focus:border-blue-400"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              {/* Password hints — only signup */}
              {isSignup && !errors.password && (
  <div className="mt-2 space-y-1">
    <div className={`text-xs flex items-center gap-1.5 ${form.password.length >= 8 ? "text-green-500" : "text-gray-300"}`}>
      <span>{form.password.length >= 8 ? "✓" : "○"}</span> At least 8 characters
    </div>
     <div className={`text-xs flex items-center gap-1.5 ${/^[0-9]+$/.test(form.password) ? "text-green-500" : "text-gray-300"}`}>
      <span>{/^[0-9]+$/.test(form.password) ? "✓" : "○"}</span> Numbers only
    </div>
  </div>
)}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50 mt-2"
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>

          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-400 mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={switchMode}
              className="text-blue-600 font-medium hover:underline"
            >
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}