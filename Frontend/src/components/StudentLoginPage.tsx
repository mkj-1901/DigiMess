import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "../services/authService";
import type { LoginCredentials } from "../types/User";

interface StudentLoginPageProps {
  onLogin: (user: any) => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(credentials);

      if (response.success && response.user) {
        onLogin(response.user);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center animate-fade-in relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background orbs */}
      <div
        className="absolute top-1/4 right-1/3 w-72 h-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)" }}
      />

      <div
        className="w-full max-w-md p-8 animate-slide-in relative z-10"
        style={{
          background: "var(--bg-surface)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Student Login
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to your student account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <input
              id="student-email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={credentials.email}
              onChange={handleInputChange}
              className="form-input"
            />

            <input
              id="student-password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="error-message text-center">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-64 py-3 px-6 text-sm font-medium"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow" style={{ borderTop: "1px solid var(--border-color)" }}></div>
            <span className="flex-shrink mx-4 text-sm" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-grow" style={{ borderTop: "1px solid var(--border-color)" }}></div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  setLoading(true);
                  setError("");
                  try {
                    const response = await authService.googleLogin(credentialResponse.credential);
                    if (response.success && response.user) {
                      onLogin(response.user);
                    } else {
                      setError(response.message || "Google login failed");
                    }
                  } catch (err) {
                    setError("An error occurred during Google login");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              onError={() => {
                setError("Google Login failed");
              }}
            />
          </div>

          {/* Signup Link */}
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <Link to="/student/signup" className="font-medium" style={{ color: "var(--primary-color)" }}>
                Sign up
              </Link>
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              <Link to="/home" className="font-medium hover:underline" style={{ color: "var(--text-muted)" }}>
                ← Back to Home
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
