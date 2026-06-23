import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import type { User } from "../types/User";
import userIcon from "../assets/userIcon.svg";

interface LandingPageProps {
  user?: User | null;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === "admin" && onLogout) {
      onLogout();
    }
  }, [user, onLogout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ========== NAVBAR ========== */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(10, 10, 15, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-color)",
        }}
        id="landing-nav"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/favicon.svg"
              alt="DigiMess Logo"
              className="w-10 h-10 shrink-0"
              style={{ filter: "drop-shadow(0 2px 6px rgba(129,140,248,0.3))" }}
            />
            <span
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              DigiMess
            </span>
          </div>

          {/* Nav Links */}
          <div
            className="hidden md:flex items-center space-x-8"
            style={{ color: "var(--text-secondary)" }}
          >
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium hover:text-white transition-colors bg-transparent border-none shadow-none p-0"
              style={{ color: "inherit" }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium hover:text-white transition-colors bg-transparent border-none shadow-none p-0"
              style={{ color: "inherit" }}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("tech-stack")}
              className="text-sm font-medium hover:text-white transition-colors bg-transparent border-none shadow-none p-0"
              style={{ color: "inherit" }}
            >
              Tech Stack
            </button>
          </div>

          {/* Auth Button */}
          <div className="flex items-center">
            {user && user.role !== "admin" ? (
              <div
                className="relative flex items-center"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button
                  className="flex items-center justify-center w-10 h-10 transition-all rounded-full"
                  style={{
                    background: "rgba(129, 140, 248, 0.15)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(129, 140, 248, 0.3)",
                    boxShadow: "0 2px 10px rgba(129, 140, 248, 0.1)",
                    borderRadius: "50%",
                    outline: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(129, 140, 248, 0.25)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(129, 140, 248, 0.2)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(129, 140, 248, 0.15)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(129, 140, 248, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  title="Profile Menu"
                >
                  <img 
                    src={userIcon} 
                    alt="User" 
                    className="w-6 h-6" 
                    style={{ filter: "brightness(0) invert(1)" }} 
                  />
                </button>

                {isProfileOpen && (
              <div className="absolute right-0 top-full pt-4 z-50">
                <div
                  className="w-48 rounded-xl shadow-lg overflow-hidden animate-fade-in glass-card border glow-border"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
                >
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg className="mr-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-left transition-colors hover:bg-white/5"
                      style={{ color: "#ef4444" }}
                    >
                      <svg className="mr-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          ) : (
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-all"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
              boxShadow: "0 2px 10px rgba(129, 140, 248, 0.25)",
              color: "#ffffff",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(129, 140, 248, 0.4)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow =
                "0 2px 10px rgba(129, 140, 248, 0.25)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            id="nav-sign-in"
          >
            Sign In
          </Link>
            )}
        </div>
    </div>
      </nav >

  {/* ========== HERO SECTION ========== */ }
  < section
className = "relative min-h-screen flex items-center justify-center overflow-hidden"
id = "hero"
  >
  {/* Animated background orbs */ }
  < div
className = "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float"
style = {{
  background:
  "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)",
          }}
        />
  < div
className = "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
style = {{
  background:
  "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)",
    animation: "float 8s ease-in-out infinite reverse",
          }}
        />
  < div
className = "absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl"
style = {{
  background:
  "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)",
    animation: "float 10s ease-in-out infinite",
      transform: "translate(-50%, -50%)",
          }}
        />

{/* Grid overlay */ }
<div
  className="absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    backgroundSize: "60px 60px",
  }}
/>

{/* Content */ }
<div className="relative z-10 text-center max-w-4xl mx-auto px-6 animate-fade-in">
  <div
    className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-8"
    style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-color)",
      color: "var(--text-secondary)",
    }}
  >
    <span
      className="w-2 h-2 rounded-full mr-2"
      style={{
        background: "var(--success-color)",
        boxShadow: "0 0 6px rgba(52,211,153,0.5)",
      }}
    />
    Smart Mess Management System
  </div>

  <h1
    className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
    style={{ color: "var(--text-primary)" }}
  >
    Manage Your Meals
    <br />
    <span className="gradient-text">Effortlessly</span>
  </h1>

  <p
    className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
    style={{ color: "var(--text-secondary)" }}
  >
    A comprehensive digital platform for students and administrators.
    Track meals, request opt-outs, calculate rebates, and share feedback
    — all in one place.
  </p>

  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
    {user && user.role !== "admin" ? (
      <Link
        to="/dashboard"
        className="px-8 py-3.5 rounded-xl font-semibold text-white text-base transition-all"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
          boxShadow: "0 4px 20px rgba(129, 140, 248, 0.3)",
          color: "#ffffff",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow =
            "0 6px 30px rgba(129, 140, 248, 0.5)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow =
            "0 4px 20px rgba(129, 140, 248, 0.3)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        id="hero-go-dashboard"
      >
        Go to Dashboard
      </Link>
    ) : (
      <Link
        to="/student/signup"
        className="px-8 py-3.5 rounded-xl font-semibold text-white text-base transition-all"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
          boxShadow: "0 4px 20px rgba(129, 140, 248, 0.3)",
          color: "#ffffff",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow =
            "0 6px 30px rgba(129, 140, 248, 0.5)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow =
            "0 4px 20px rgba(129, 140, 248, 0.3)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        id="hero-get-started"
      >
        Get Started — It's Free
      </Link>
    )}
    <button
      onClick={() => scrollToSection("features")}
      className="px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        color: "var(--text-primary)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor =
          "rgba(129, 140, 248, 0.3)";
        e.currentTarget.style.background =
          "var(--bg-surface-hover)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.background = "var(--bg-surface)";
      }}
      id="hero-explore-features"
    >
      Explore Features ↓
    </button>
  </div>
</div>
      </section >

  {/* ========== FEATURES SECTION ========== */ }
  < section className = "py-24 px-6 relative" id = "features" >
    {/* Subtle glow */ }
    < div
className = "absolute top-0 left-1/2 w-full max-w-xl h-px"
style = {{
  background:
  "linear-gradient(90deg, transparent, rgba(129,140,248,0.3), transparent)",
    transform: "translateX(-50%)",
          }}
        />
  < div className = "max-w-7xl mx-auto" >
          <div className="text-center mb-16 animate-fade-in">
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Everything You Need
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              DigiMess simplifies every aspect of mess management — from daily
              meal tracking to AI-powered analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 — Meal Tracking */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              title="Meal Tracking"
              description="Log daily breakfast, lunch, and dinner attendance with a single tap. View your complete meal history at a glance."
              accentColor="rgba(99, 102, 241, 0.15)"
              iconColor="#818cf8"
            />

            {/* Feature 2 — Opt-Out Requests */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Opt-Out Requests"
              description="Request to skip meals for specific date ranges. Perfect for vacations, sick leave, or any planned absences."
              accentColor="rgba(244, 114, 182, 0.15)"
              iconColor="#f472b6"
            />

            {/* Feature 3 — Food Reviews */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
              title="Food Reviews"
              description="Rate and review daily meals with an interactive star rating system. Help improve food quality with your honest feedback."
              accentColor="rgba(251, 191, 36, 0.15)"
              iconColor="#fbbf24"
            />

            {/* Feature 4 — Rebate Calculator */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              title="Rebate Calculator"
              description="Automatic monthly rebate calculations based on attended, missed, and opted-out meal days. Track approval status in real-time."
              accentColor="rgba(52, 211, 153, 0.15)"
              iconColor="#34d399"
            />

            {/* Feature 5 — ML Sentiment Analysis */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="ML Sentiment Analysis"
              description="AI-powered review summarization for administrators. Detects positive, negative, and neutral sentiment with emoji indicators."
              accentColor="rgba(167, 139, 250, 0.15)"
              iconColor="#a78bfa"
            />

            {/* Feature 6 — Secure Authentication */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Secure Authentication"
              description="JWT-based authentication with Google OAuth integration, refresh tokens, and secure password reset via email."
              accentColor="rgba(56, 189, 248, 0.15)"
              iconColor="#38bdf8"
            />
          </div>
        </div >
      </section >

  {/* ========== HOW IT WORKS SECTION ========== */ }
  < section className = "py-24 px-6 relative" id = "how-it-works" >
        <div
          className="absolute top-0 left-1/2 w-full max-w-xl h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(167,139,250,0.3), transparent)",
            transform: "translateX(-50%)",
          }}
        />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              How It Works
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="01"
              title="Sign Up"
              description="Create your student account with email or Google OAuth. Admin accounts are pre-configured."
            />
            <StepCard
              step="02"
              title="Track Meals"
              description="Log your daily meals, submit reviews, and request opt-outs for days you'll be away."
            />
            <StepCard
              step="03"
              title="Get Rebates"
              description="Your monthly rebates are calculated automatically. Track status and approval in real-time."
            />
          </div>
        </div>
      </section >

  {/* ========== TECH STACK SECTION ========== */ }
  < section className = "py-24 px-6 relative" id = "tech-stack" >
        <div
          className="absolute top-0 left-1/2 w-full max-w-xl h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)",
            transform: "translateX(-50%)",
          }}
        />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Built With Modern Tech
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Powered by industry-standard technologies for reliability and
              performance
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "React 19", color: "#61dafb" },
              { name: "TypeScript", color: "#3178c6" },
              { name: "Vite", color: "#646cff" },
              { name: "Tailwind CSS", color: "#38bdf8" },
              { name: "Node.js", color: "#68a063" },
              { name: "Express", color: "#a78bfa" },
              { name: "MongoDB", color: "#4db33d" },
              { name: "JWT Auth", color: "#f472b6" },
              { name: "Nodemailer", color: "#fbbf24" },
              { name: "ML Engine", color: "#818cf8" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                style={{
                  background: `${tech.color}15`,
                  border: `1px solid ${tech.color}30`,
                  color: tech.color,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = `${tech.color}25`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 4px 15px ${tech.color}20`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = `${tech.color}15`;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </section >

  {/* ========== CTA SECTION ========== */ }
  < section className = "py-24 px-6 relative" >
    <div className="max-w-3xl mx-auto text-center">
      <div
        className="rounded-2xl p-12 relative overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute -top-20 left-1/2 w-80 h-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)",
            transform: "translateX(-50%)",
          }}
        />

        <div className="relative z-10">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Ready to get started?
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Join DigiMess today and simplify your mess management experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/student/signup"
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
                boxShadow: "0 4px 20px rgba(129, 140, 248, 0.3)",
                color: "#ffffff",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 6px 30px rgba(129, 140, 248, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(129, 140, 248, 0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              id="cta-signup"
            >
              Create Student Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(129, 140, 248, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
              id="cta-sign-in"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
      </section >

  {/* ========== FOOTER ========== */ }
  < footer
className = "py-12 px-6"
style = {{ borderTop: "1px solid var(--border-color)" }}
id = "footer"
  >
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
      {/* Left */}
      <div className="flex items-center space-x-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
        >
          <img
            src="/favicon.svg"
            alt="DigiMess Logo"
            className="w-10 h-10 shrink-0"
            style={{ filter: "drop-shadow(0 2px 6px rgba(129,140,248,0.3))" }}
          />
        </div>
        <span
          className="font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          DigiMess
        </span>
      </div>

      {/* Center */}
      <p
        className="text-sm text-center"
        style={{ color: "var(--text-muted)" }}
      >
        Built by <a href="https://github.com/mkj-1901" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)", textDecoration: "none" }}>mkj-1901</a>            </p>

      {/* Right */}
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        © {new Date().getFullYear()} DigiMess. ISC License.
      </p>
    </div>
  </div>
      </footer >
    </div >
  );
};

/* ========== SUB-COMPONENTS ========== */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  iconColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accentColor,
  iconColor,
}) => (
  <div
    className="group p-6 rounded-2xl transition-all duration-300 cursor-default"
    style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-color)",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = `${iconColor}40`;
      e.currentTarget.style.background = "var(--bg-surface-hover)";
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = `0 8px 30px ${iconColor}10`;
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = "var(--border-color)";
      e.currentTarget.style.background = "var(--bg-surface)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {/* Icon */}
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
      style={{ background: accentColor, color: iconColor }}
    >
      {icon}
    </div>

    {/* Content */}
    <h3
      className="text-lg font-semibold mb-2"
      style={{ color: "var(--text-primary)" }}
    >
      {title}
    </h3>
    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
      {description}
    </p>
  </div>
);

interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description }) => (
  <div className="text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
      }}
    >
      <span className="gradient-text text-2xl font-bold">{step}</span>
    </div>
    <h3
      className="text-xl font-semibold mb-2"
      style={{ color: "var(--text-primary)" }}
    >
      {title}
    </h3>
    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
      {description}
    </p>
  </div>
);

export default LandingPage;
