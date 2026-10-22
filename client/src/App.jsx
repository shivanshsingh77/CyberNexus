import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { WebsiteScanner } from './pages/WebsiteScanner';
import { PasswordChecker } from './pages/PasswordChecker';
import { SecurityAwareness } from './pages/SecurityAwareness';
import { SecurityChecklist } from './pages/SecurityChecklist';
import { SecurityReport } from './pages/SecurityReport';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'scanner':
        return <WebsiteScanner />;
      case 'password-checker':
        return <PasswordChecker />;
      case 'awareness':
        return <SecurityAwareness />;
      case 'checklist':
        return <SecurityChecklist />;
      case 'report':
        return <SecurityReport />;
      case 'profile':
        return isAuthenticated ? (
          <Profile setActiveTab={setActiveTab} />
        ) : (
          <Login setActiveTab={setActiveTab} />
        );
      case 'login':
        return <Login setActiveTab={setActiveTab} />;
      case 'register':
        return <Register setActiveTab={setActiveTab} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
        />
        <main style={{ flex: 1 }}>{renderContent()}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
