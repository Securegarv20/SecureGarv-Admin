import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import SignInPage from './components/SignInPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import ExperienceSection from './components/ExperienceSection';
import SkillsSection from './components/SkillsSection';
import EducationSection from './components/EducationSection';
import ProjectsSection from './components/ProjectsSection';
import MessagesSection from './components/MessagesSection';

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <SignInPage />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'hero':
        return <HeroSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'skills':
        return <SkillsSection />;
      case 'education':
        return <EducationSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'messages':
        return <MessagesSection />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 min-h-screen">
      <Navbar />
      <div className="flex flex-1">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-8 overflow-y-auto bg-slate-900">
        {renderSection()}
      </main>
      </div>
    </div>
  );
}

export default App;