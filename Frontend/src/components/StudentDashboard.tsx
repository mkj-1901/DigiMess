import React from "react";
import type { User } from '../types/User';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

interface DashboardCardProps {
  title: string;
  description: string;
  actionText: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, actionText, onClick }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-1">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 text-sm">{description}</p>
    <button 
      onClick={onClick}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      {actionText} →
    </button>
  </div>
);

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const handleNavigation = (section: string) => {
    console.log(`Navigating to ${section}`);
    // Add navigation logic here
  };

  const dashboardCards = [
    {
      title: "Today's Menu",
      description: "Check what's cooking today",
      actionText: "View",
      onClick: () => handleNavigation("menu")
    },
    {
      title: "Meal Plan",
      description: "Your subscription details",
      actionText: "Manage",
      onClick: () => handleNavigation("meal-plan")
    },
    {
      title: "Feedback",
      description: "Rate your meals and share feedback",
      actionText: "Rate",
      onClick: () => handleNavigation("feedback")
    },
    {
      title: "Profile",
      description: "Update your preferences and settings",
      actionText: "Edit",
      onClick: () => handleNavigation("profile")
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">DigiMess Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 sm:px-6 lg:px-8">
        <div className="w-full px-6 py-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
            <p className="text-gray-600">
              Welcome to your student dashboard. Here you can view your meal plans,
              check daily menus, and manage your preferences.
            </p>
          </header>

          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards.map((card, index) => (
                <DashboardCard
                  key={index}
                  title={card.title}
                  description={card.description}
                  actionText={card.actionText}
                  onClick={card.onClick}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
