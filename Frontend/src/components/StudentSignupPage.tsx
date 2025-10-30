import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

interface SignupData {
  name: string;
  email: string;
  password: string;
}

export const StudentSignupPage: React.FC = () => {
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
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Student Signup for DigiMess
          </h2>
          <p className="mt-2 text-sm text-gray-600">Create your student account</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Full Name"
              value={userData.name}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                        placeholder-gray-400 text-gray-900 focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            {/* Email */}
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={userData.email}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                        placeholder-gray-400 text-gray-900 focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            {/* Password */}
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={userData.password}
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

          {/* Success */}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-center">
              <p className="text-sm text-green-700">{success}</p>
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

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/student/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
