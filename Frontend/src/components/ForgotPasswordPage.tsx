import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to send reset link");
      }
    } catch (err) {
      setError("An error occurred while sending reset link");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen w-screen flex items-center justify-center animate-fade-in"
        style={{ background: "var(--bg-primary)" }}
      >
        <div
          className="w-full max-w-md p-8 animate-slide-in text-center"
          style={{
            background: "var(--bg-surface)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--success-color)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Reset Link Sent!
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            If an account exists with that email, we have sent instructions to reset your password. Please check your inbox (and spam folder).
          </p>
          <Link to="/" className="btn-primary inline-block px-6 py-2">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center animate-fade-in relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background orbs */}
      <div
        className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)" }}
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
          <div className="mb-4 flex justify-center">
            <img
              src="/favicon.svg"
              alt="DigiMess Logo"
              className="w-14 h-14 shrink-0"
              style={{ filter: "drop-shadow(0 4px 12px rgba(129,140,248,0.4))" }}
            />
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Forgot Password?
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  Sending Link...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Send Reset Link
                </>
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Remember your password?{" "}
              <Link to="/" className="font-medium transition-colors" style={{ color: "var(--primary-color)" }}>
                Back to login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
