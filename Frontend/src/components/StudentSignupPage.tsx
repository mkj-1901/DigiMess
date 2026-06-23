import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "../services/authService";

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface StudentSignupPageProps {
  onLogin: (user: any) => void;
}

export const StudentSignupPage: React.FC<StudentSignupPageProps> = ({ onLogin }) => {
  const [userData, setUserData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.signup(userData);

      if (response.success) {
        setSuccess(response.message || 'Signup successful');
        setTimeout(() => navigate("/student/login"), 2000);
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      setError("An error occurred during signup");
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
        className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)" }}
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
            Create Account
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign up as a student to get started
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <input
              id="signup-name"
              name="name"
              type="text"
              required
              placeholder="Full Name"
              value={userData.name}
              onChange={handleInputChange}
              className="form-input"
            />

            {/* Email */}
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={userData.email}
              onChange={handleInputChange}
              className="form-input"
            />

            {/* Password */}
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={userData.password}
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

          {/* Success */}
          {success && (
            <div className="success-message text-center">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-64 py-3 px-6 text-sm font-medium"
            >
              {loading ? "Creating account..." : "Sign up"}
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
                      setError(response.message || "Google signup failed");
                    }
                  } catch (err) {
                    setError("An error occurred during Google signup");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              onError={() => {
                setError("Google Signup failed");
              }}
            />
          </div>

          {/* Login Link */}
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link to="/student/login" className="font-medium" style={{ color: "var(--primary-color)" }}>
                Sign in
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
