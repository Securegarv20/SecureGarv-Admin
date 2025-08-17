import { useState, useEffect } from 'react';
import { Save, Eye, ArrowRight, X, Link, Loader2, User, Brain, Rocket, Briefcase } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface AboutContent {
  whoIAm: string;
  myExpertise: string;
  myMission: string;
  myJourney: string;
}

interface HeroContent {
  typewriterTexts: string[];
  heroParagraph: string;
  resume: {
    url: string;
    fileName: string;
  };
  about: AboutContent;
}

interface APIError {
  message: string;
  status?: number;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

export default function HeroEditor() {
  const [content, setContent] = useState<HeroContent>({
    typewriterTexts: [],
    heroParagraph: '',
    resume: {
      url: '',
      fileName: ''
    },
    about: {
      whoIAm: '',
      myExpertise: '',
      myMission: '',
      myJourney: ''
    }
  });
  const [newText, setNewText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeLink, setResumeLink] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Enhanced API client with better error handling
  const apiClient = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, { 
        ...options, 
        headers 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || `Request failed with status ${response.status}`,
          status: response.status
        } as APIError;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient<HeroContent>('/api/content');
        
        setContent({
          typewriterTexts: data.typewriterTexts || [],
          heroParagraph: data.heroParagraph || '',
          resume: data.resume || { url: '', fileName: '' },
          about: data.about || {
            whoIAm: '',
            myExpertise: '',
            myMission: '',
            myJourney: ''
          }
        });
        setResumeLink(data.resume?.url || '');
        toast.success('Content loaded successfully!');
      } catch (error) {
        const err = error as APIError;
        console.error('Error fetching content:', err);
        toast.error(err.message || 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Validate form fields
  const validateField = (field: string, value: string): boolean => {
    const errors = { ...validationErrors };
    
    if (!value.trim()) {
      errors[field] = 'This field is required';
    } else {
      delete errors[field];
    }

    setValidationErrors(errors);
    return !errors[field];
  };

  const addText = () => {
    if (!validateField('newText', newText)) return;
    
    if (content.typewriterTexts.includes(newText.trim())) {
      toast.error('This text already exists');
      return;
    }

    setContent(prev => ({
      ...prev,
      typewriterTexts: [...prev.typewriterTexts, newText.trim()]
    }));
    setNewText('');
    toast.success('Text added successfully!');
  };

  const removeText = (index: number) => {
    setContent(prev => ({
      ...prev,
      typewriterTexts: prev.typewriterTexts.filter((_, i) => i !== index)
    }));
    toast.success('Text removed successfully!');
  };

  const handleAboutChange = (field: keyof AboutContent, value: string) => {
    setContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }));
    validateField(field, value);
  };

  const saveAboutSection = async () => {
    const requiredFields: (keyof AboutContent)[] = ['whoIAm', 'myExpertise', 'myMission', 'myJourney'];
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!validateField(field, content.about[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast.error('Please fill in all required fields in the About section');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient('/api/content/about', {
        method: 'PUT',
        body: JSON.stringify(content.about)
      });
      toast.success('About section saved successfully!');
    } catch (error) {
      const err = error as APIError;
      console.error('Error saving about section:', err);
      toast.error(err.message || 'Failed to save about section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    const heroValid = validateField('heroParagraph', content.heroParagraph);
    const aboutValid = ['whoIAm', 'myExpertise', 'myMission', 'myJourney'].every(field => 
      validateField(field, content.about[field as keyof AboutContent])
    );

    if (!heroValid || !aboutValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient('/api/content', {
        method: 'PUT',
        body: JSON.stringify({
          typewriterTexts: content.typewriterTexts,
          heroParagraph: content.heroParagraph,
          resume: content.resume,
          about: content.about
        })
      });
      toast.success('All content saved successfully!');
    } catch (error) {
      const err = error as APIError;
      console.error('Error saving content:', err);
      toast.error(err.message || 'Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const updateResumeLink = async () => {
    if (!validateField('resumeLink', resumeLink)) return;

    try {
      new URL(resumeLink);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSaving(true);
    try {
      const data = await apiClient<HeroContent>('/api/content/resume', {
        method: 'PUT',
        body: JSON.stringify({ 
          url: resumeLink,
          fileName: resumeLink.split('/').pop() || 'Resume'
        })
      });

      setContent(prev => ({
        ...prev,
        resume: data.resume || { url: resumeLink, fileName: 'Resume' }
      }));
      toast.success('Resume link updated successfully!');
      setShowResumeModal(false);
    } catch (error) {
      const err = error as APIError;
      console.error('Error updating resume:', err);
      toast.error(err.message || 'Failed to update resume');
    } finally {
      setIsSaving(false);
    }
  };

  const removeResume = async () => {
    try {
      await apiClient('/api/content/resume', {
        method: 'PUT',
        body: JSON.stringify({ url: '', fileName: '' })
      });

      setContent(prev => ({
        ...prev,
        resume: { url: '', fileName: '' }
      }));
      toast.success('Resume removed successfully!');
    } catch (error) {
      const err = error as APIError;
      console.error('Error removing resume:', err);
      toast.error(err.message || 'Failed to remove resume');
    }
  };

   if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 text-blue-400 mx-auto" />
          <p className="text-gray-400 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-6">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#111827',
          color: '#F3F4F6',
          border: '1px solid #1F2937',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem'
        }
      }}/>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Content Editor
            </h1>
            <p className="text-gray-400 mt-1">Manage your portfolio's hero and about sections</p>
          </div>
          <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
            Last Updated: {new Date().toLocaleString()}
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hero Section Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                  <span className="bg-blue-500/20 p-2 rounded-lg">
                    <Rocket size={20} className="text-blue-400" />
                  </span>
                  Hero Section
                </h2>
                <div className="text-xs bg-gray-700 px-2 py-1 rounded-md text-gray-300">
                  Required Fields
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Hero Paragraph */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                    Introduction
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={content.heroParagraph}
                      onChange={(e) => {
                        setContent({...content, heroParagraph: e.target.value});
                        validateField('heroParagraph', e.target.value);
                      }}
                      onBlur={(e) => validateField('heroParagraph', e.target.value)}
                      rows={4}
                      className={`w-full p-3 bg-gray-700/70 border ${
                        validationErrors.heroParagraph ? 'border-red-500/80' : 'border-gray-600/50'
                      } rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-gray-100 placeholder-gray-500`}
                      placeholder="Write your compelling introduction here..."
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                      {content.heroParagraph.length}/500
                    </div>
                  </div>
                  {validationErrors.heroParagraph && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <X size={12} /> {validationErrors.heroParagraph}
                    </p>
                  )}
                </div>

                {/* Typewriter Texts */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rotating Headlines
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addText()}
                        onBlur={(e) => validateField('newText', e.target.value)}
                        className={`w-full p-2 pl-3 pr-10 bg-gray-700/70 border ${
                          validationErrors.newText ? 'border-red-500/80' : 'border-gray-600/50'
                        } rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-gray-100 placeholder-gray-500`}
                        placeholder="Add a new rotating headline"
                      />
                      <button
                        onClick={addText}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition"
                        title="Add text"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                  {validationErrors.newText && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <X size={12} /> {validationErrors.newText}
                    </p>
                  )}
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {content.typewriterTexts.length === 0 ? (
                      <div className="p-3 bg-gray-700/30 rounded-lg text-center text-gray-500 border border-dashed border-gray-600/50">
                        No headlines added yet
                      </div>
                    ) : (
                      content.typewriterTexts.map((text, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-700/40 rounded-lg group hover:bg-gray-700/60 transition border border-gray-700/30">
                          <span className="text-gray-100 truncate">{text}</span>
                          <button
                            onClick={() => removeText(index)}
                            className="text-gray-400 hover:text-red-400 transition p-1 rounded-full hover:bg-gray-600/50"
                            aria-label="Remove text"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Section Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                  <span className="bg-purple-500/20 p-2 rounded-lg">
                    <User size={20} className="text-purple-400" />
                  </span>
                  About Section
                </h2>
                <button
                  onClick={saveAboutSection}
                  disabled={isSaving}
                  className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg ${
                    isSaving ? 'bg-blue-600/50 text-blue-200' : 'bg-blue-600/80 hover:bg-blue-600 text-white'
                  } transition`}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              
              <div className="space-y-5">
                {[
                  { field: 'whoIAm', label: 'Who I Am', icon: <User size={16} className="text-blue-400" /> },
                  { field: 'myExpertise', label: 'My Expertise', icon: <Brain size={16} className="text-green-400" /> },
                  { field: 'myMission', label: 'My Mission', icon: <Rocket size={16} className="text-purple-400" /> },
                  { field: 'myJourney', label: 'My Journey', icon: <Briefcase size={16} className="text-yellow-400" /> }
                ].map(({ field, label, icon }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                      {icon} {label}
                      <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={content.about[field as keyof AboutContent]}
                      onChange={(e) => handleAboutChange(field as keyof AboutContent, e.target.value)}
                      onBlur={(e) => validateField(field, e.target.value)}
                      rows={3}
                      className={`w-full p-3 bg-gray-700/70 border ${
                        validationErrors[field] ? 'border-red-500/80' : 'border-gray-600/50'
                      } rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-gray-100 placeholder-gray-500`}
                      placeholder={`Describe ${label.toLowerCase()}...`}
                    />
                    {validationErrors[field] && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <X size={12} /> {validationErrors[field]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Resume Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                  <span className="bg-green-500/20 p-2 rounded-lg">
                    <Link size={20} className="text-green-400" />
                  </span>
                  Resume
                </h2>
                {content.resume?.url && (
                  <a 
                    href={content.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-2 py-1 rounded transition"
                  >
                    <Eye size={14} /> View
                  </a>
                )}
              </div>
              
              <div className="border border-gray-700/40 rounded-lg p-4 bg-gray-700/20">
                {content.resume?.url ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">File Name</p>
                      <p className="font-medium text-gray-200 truncate">
                        {content.resume.fileName || 'Resume'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">URL</p>
                      <p className="text-blue-400 text-sm truncate">
                        {content.resume.url}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setResumeLink(content.resume.url);
                          setShowResumeModal(true);
                        }}
                        className="flex-1 text-sm py-1.5 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 rounded transition flex items-center justify-center gap-1"
                      >
                        <Eye size={14} /> Edit
                      </button>
                      <button
                        onClick={removeResume}
                        className="flex-1 text-sm py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition flex items-center justify-center gap-1"
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResumeModal(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-600/50 rounded-lg hover:bg-gray-700/30 flex flex-col items-center justify-center gap-2 text-gray-300 transition group"
                  >
                    <div className="p-3 bg-gray-700/50 rounded-full group-hover:bg-gray-700/70 transition">
                      <Link size={20} className="text-gray-400 group-hover:text-blue-400" />
                    </div>
                    <span className="font-medium">Add Resume Link</span>
                    <span className="text-xs text-gray-500">PDF or online document</span>
                  </button>
                )}
              </div>
            </div>

            {/* Save All Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <span className="bg-blue-500/20 p-2 rounded-lg">
                  <Save size={20} className="text-blue-400" />
                </span>
                Save Changes
              </h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Review all sections before saving. Required fields are marked with <span className="text-red-400">*</span>.
                </p>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`w-full py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                    isSaving 
                      ? 'bg-blue-600/70 text-blue-200 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save All Changes
                    </>
                  )}
                </button>
                
                <div className="text-xs text-gray-500 text-center">
                  Last saved changes will overwrite previous content
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Link Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700/70 animate-pop-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-200">
                {content.resume?.url ? 'Update Resume' : 'Add Resume'}
              </h2>
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setResumeLink(content.resume?.url || '');
                }}
                className="text-gray-400 hover:text-gray-200 transition p-1 rounded-full hover:bg-gray-700/50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Link size={16} className="text-blue-400" />
                Resume URL
                <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={resumeLink}
                onChange={(e) => {
                  setResumeLink(e.target.value);
                  validateField('resumeLink', e.target.value);
                }}
                onBlur={(e) => validateField('resumeLink', e.target.value)}
                placeholder="https://example.com/resume.pdf"
                className={`w-full p-3 bg-gray-700/70 border ${
                  validationErrors.resumeLink ? 'border-red-500/80' : 'border-gray-600/50'
                } rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-gray-100 placeholder-gray-500`}
              />
              {validationErrors.resumeLink && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <X size={12} /> {validationErrors.resumeLink}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Tip: Upload your resume to a cloud service like Google Drive or Dropbox and share the link
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setResumeLink(content.resume?.url || '');
                }}
                className="px-4 py-2 border border-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateResumeLink}
                disabled={isSaving || !resumeLink.trim()}
                className={`px-4 py-2 rounded-lg transition ${
                  isSaving 
                    ? 'bg-blue-600/70 text-blue-200 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                } flex items-center gap-2`}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Save size={16} />
                )}
                {content.resume?.url ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        .animate-pop-in {
          animation: popIn 0.2s ease-out forwards;
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}