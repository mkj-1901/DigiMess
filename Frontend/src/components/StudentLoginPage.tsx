import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Student Login to DigiMess
          </h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your student account</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={credentials.email}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                        placeholder-gray-400 text-gray-900 focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                        placeholder-gray-400 text-gray-900 focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-center">
              <p className="text-sm text-red-700">{error}</p>
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

          {/* Demo Credentials */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Demo credentials:
              <br />
              Student: <b>student@digimess.com</b> / <b>student123</b>
            </p>
          </div>

          {/* Signup Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/student/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
