import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "../services/authService";
import type { LoginCredentials } from "../types/User";

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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
        className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)" }}
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
        <div className="text-center mb-8">
          <div className="mb-4">
            <div
              className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
                boxShadow: "0 4px 20px rgba(129, 140, 248, 0.3)",
              }}
            >
              <span className="text-white text-2xl font-bold">D</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome to DigiMess
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-message">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2" style={{ width: 20, height: 20 }}></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign in
                </>
              )}
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

          {/* Forgot Password and Student Signup Links */}
          <div className="text-center space-y-2">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <Link to="/forgot-password" className="font-medium transition-colors" style={{ color: "var(--primary-color)" }}>
                Forgot your password?
              </Link>
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              New student?{" "}
              <Link to="/student/signup" className="font-medium transition-colors" style={{ color: "var(--primary-color)" }}>
                Create an account
              </Link>
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              <Link to="/home" className="font-medium transition-colors hover:underline" style={{ color: "var(--text-muted)" }}>
                ← Back to Home
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
