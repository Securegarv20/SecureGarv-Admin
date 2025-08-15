import { useState, useEffect } from 'react';
import { Save, Eye, ArrowRight, X, Link, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface HeroContent {
  typewriterTexts: string[];
  heroParagraph: string;
  resume: {
    url: string;
    fileName: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function HeroEditor() {
  const [content, setContent] = useState<HeroContent>({
    typewriterTexts: [],
    heroParagraph: '',
    resume: {
      url: '',
      fileName: ''
    }
  });
  const [newText, setNewText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeLink, setResumeLink] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/content`);
        if (!response.ok) throw new Error('Failed to fetch content');
        
        const data = await response.json();
        setContent(data);
        setResumeLink(data.resume?.url || '');
        toast.success('Content loaded successfully!');
      } catch (error: unknown) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const addText = () => {
    if (!newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update typewriter texts
      const textsResponse = await fetch(`${API_URL}/api/content/typewriter-texts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typewriterTexts: content.typewriterTexts })
      });

      // Update hero content
      const contentResponse = await fetch(`${API_URL}/api/content/hero-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroParagraph: content.heroParagraph
        })
      });

      if (!textsResponse.ok || !contentResponse.ok) {
        throw new Error('Failed to save some content');
      }

      toast.success('Content saved successfully!');
    } catch (error: unknown) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const updateResumeLink = async () => {
    if (!resumeLink) {
      toast.error('Please enter a resume URL');
      return;
    }

    try {
      // Validate URL
      new URL(resumeLink);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/content/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: resumeLink })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update resume link');
      }

      const data = await response.json();
      setContent(prev => ({
        ...prev,
        resume: data.data
      }));
      toast.success('Resume link updated successfully!');
      setShowResumeModal(false);
    } catch (error: unknown) {
      console.error('Error updating resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update resume');
    } finally {
      setIsSaving(false);
    }
  };

  const removeResume = async () => {
    try {
      const response = await fetch(`${API_URL}/api/content/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '', fileName: '' })
      });

      if (!response.ok) throw new Error('Failed to remove resume');

      setContent(prev => ({
        ...prev,
        resume: { url: '', fileName: '' }
      }));
      toast.success('Resume removed successfully!');
    } catch (error: unknown) {
      console.error('Error removing resume:', error);
      toast.error('Failed to remove resume');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#F3F4F6',
            border: '1px solid #374151'
          }
        }}
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Hero Section Editor
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="space-y-8">
              {/* Hero Paragraph */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hero Paragraph</label>
                <textarea
                  value={content.heroParagraph}
                  onChange={(e) => setContent({...content, heroParagraph: e.target.value})}
                  rows={4}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-100"
                  placeholder="Write your introduction here..."
                />
                <p className="mt-1 text-xs text-gray-400">This will be displayed as your main introduction text.</p>
              </div>

              {/* Typewriter Texts */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Typewriter Texts</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addText()}
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-100"
                    placeholder="Add new rotating text"
                  />
                  <button
                    onClick={addText}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    <ArrowRight size={16} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {content.typewriterTexts.length === 0 ? (
                    <div className="p-3 bg-gray-700 rounded-lg text-center text-gray-400">
                      No texts added yet
                    </div>
                  ) : (
                    content.typewriterTexts.map((text, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg group hover:bg-gray-600 transition">
                        <span className="text-gray-100">{text}</span>
                        <button
                          onClick={() => removeText(index)}
                          className="text-gray-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                          aria-label="Remove text"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  These texts will rotate in the typewriter effect on your hero section.
                </p>
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resume Link</label>
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-750">
                  {content.resume?.url ? (
                    <div className="flex justify-between items-center">
                      <div className="truncate">
                        <p className="font-medium text-gray-200">
                          {content.resume.fileName || 'Resume Link'}
                        </p>
                        <a 
                          href={content.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-sm"
                        >
                          {content.resume.url}
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setResumeLink(content.resume.url);
                            setShowResumeModal(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-gray-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={removeResume}
                          className="p-2 text-red-400 hover:bg-gray-700 rounded-lg transition"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResumeModal(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-gray-300 transition"
                    >
                      <Link size={16} />
                      <span>Add Resume Link</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full justify-center ${
                    isSaving ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Link Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-200">
                {content.resume?.url ? 'Update Resume Link' : 'Add Resume Link'}
              </h2>
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setResumeLink(content.resume?.url || '');
                }}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resume URL
              </label>
              <input
                type="url"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                placeholder="https://example.com/resume.pdf"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter the direct URL to your resume (PDF recommended)
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setResumeLink(content.resume?.url || '');
                }}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateResumeLink}
                disabled={isSaving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                  isSaving ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}