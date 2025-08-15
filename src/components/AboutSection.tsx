import { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AboutContent {
  whoIAm: string;
  myExpertise: string;
  myMission: string;
  myJourney: string;
}

export default function AboutEditor() {
  const [content, setContent] = useState<AboutContent>({
    whoIAm: '',
    myExpertise: '',
    myMission: '',
    myJourney: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/content`);
        if (!response.ok) throw new Error('Failed to fetch content');
        
        const data = await response.json();
        setContent(data.about || {
          whoIAm: '',
          myExpertise: '',
          myMission: '',
          myJourney: ''
        });
        toast.success('✨ About content loaded!');
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('⚠️ Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/content/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save content');
      }

      toast.success('🚀 About content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(`❌ ${error.message || 'Failed to save content'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-mono">
            LOADING PORTFOLIO DATA...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 sm:p-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="fixed -left-1/4 -top-1/4 w-[150%] h-[150%] bg-radial-gradient(from-purple-500/10 via-transparent to-transparent) opacity-30" />
      
      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">
            ABOUT EDITOR
          </h1>
          <p className="text-gray-400 font-mono tracking-wider text-sm">
            CRAFT YOUR DIGITAL IDENTITY
          </p>
        </div>
        
        {/* Editor Card */}
        <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
          {/* Neon Header Bar */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-purple-500/20 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_2px_rgba(168,85,247,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="font-mono text-xs text-gray-300 ml-2 tracking-wider">
                about_editor.jsx
              </span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-6 space-y-8">
            {[
              { id: 'whoIAm', label: 'WHO I AM', icon: '👤', rows: 5 },
              { id: 'myExpertise', label: 'MY EXPERTISE', icon: '⚡', rows: 5 },
              { id: 'myMission', label: 'MY MISSION', icon: '🎯', rows: 5 },
              { id: 'myJourney', label: 'MY JOURNEY', icon: '🛣️', rows: 7 },
            ].map((section) => (
              <div key={section.id} className="group">
                <div className="flex items-center mb-3">
                  <span className="mr-3 text-xl">{section.icon}</span>
                  <h2 className="font-mono text-sm tracking-wider text-purple-400">
                    {section.label}
                  </h2>
                  <div className="ml-auto h-px bg-gradient-to-r from-purple-500/10 via-purple-500/50 to-transparent flex-1" />
                </div>
                <textarea
                  value={content[section.id as keyof AboutContent]}
                  onChange={(e) => setContent({...content, [section.id]: e.target.value})}
                  rows={section.rows}
                  className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 text-gray-200 placeholder-gray-500 font-mono text-sm transition-all duration-300 group-hover:border-purple-500/30"
                  placeholder={`Describe your ${section.label.toLowerCase()}...`}
                />
              </div>
            ))}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`mt-8 w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-mono tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg ${
                isSaving ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-[0_0_15px_5px_rgba(139,92,246,0.3)]'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'ENCRYPTING DATA...' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(55, 65, 81, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(55, 65, 81, 0.3) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .bg-radial-gradient {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        textarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.5) transparent;
        }
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        textarea::-webkit-scrollbar-thumb {
          background-color: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}