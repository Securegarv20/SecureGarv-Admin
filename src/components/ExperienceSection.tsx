import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Loader2, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Experience {
  _id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  technologies: string[];
  isCurrentJob: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

const ExperienceSection = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Experience, '_id'>>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    achievements: [],
    technologies: [],
    isCurrentJob: false
  });

  const [newAchievement, setNewAchievement] = useState('');
  const [newTechnology, setNewTechnology] = useState('');

  // API request helper
  const apiRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle empty responses for DELETE requests
      if (method === 'DELETE') {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Fetch experience data
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest('/api/experience');
        setExperiences(data || []);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load experiences. Please try again later.');
        setExperiences([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked,
      endDate: checked ? '' : prev.endDate 
    }));
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: [],
      technologies: [],
      isCurrentJob: false
    });
    setIsEditing(false);
    setEditingId(null);
    setNewAchievement('');
    setNewTechnology('');
  };

  const addAchievement = () => {
    const achievement = newAchievement.trim();
    if (achievement && !formData.achievements.includes(achievement)) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievement]
      }));
      setNewAchievement('');
      toast.success('Achievement added');
    }
  };

  const removeAchievement = (achievement: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }));
    toast.success('Achievement removed');
  };

  const addTechnology = () => {
    const technology = newTechnology.trim();
    if (technology && !formData.technologies.includes(technology)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, technology]
      }));
      setNewTechnology('');
      toast.success('Technology added');
    }
  };

  const removeTechnology = (technology: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== technology)
    }));
    toast.success('Technology removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.company || !formData.position || !formData.location || !formData.startDate || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      if (isEditing && editingId) {
        // Update existing experience
        const updatedExperience = await apiRequest(
          `/api/experience/${editingId}`, 
          'PUT', 
          formData
        );
        setExperiences(prev => prev.map(exp => 
          exp._id === editingId ? updatedExperience : exp
        ));
        toast.success('Experience updated successfully!');
      } else {
        // Add new experience
        const newExperience = await apiRequest(
          '/api/experience', 
          'POST', 
          formData
        );
        setExperiences(prev => [...prev, newExperience]);
        toast.success('Experience added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save experience. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    setFormData({
      company: experience.company,
      position: experience.position,
      location: experience.location,
      startDate: experience.startDate,
      endDate: experience.endDate,
      description: experience.description,
      achievements: experience.achievements,
      technologies: experience.technologies,
      isCurrentJob: experience.isCurrentJob
    });
    setIsEditing(true);
    setEditingId(experience._id);
    toast('Editing experience entry', { icon: '✏️' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience entry?')) return;

    try {
      setIsSaving(true);
      await apiRequest(`/experience/${id}`, 'DELETE');
      setExperiences(prev => prev.filter(exp => exp._id !== id));
      toast.success('Experience deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete experience. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [month, year] = dateString.split(" ");
    try {
      const date = new Date(`${month} 1, ${year}`);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    } catch (e) {
      return dateString;
    }
  };

  const calculateDuration = (startDate: string, endDate: string, isCurrentJob: boolean) => {
    if (!startDate) return "";
    
    try {
      const start = new Date(startDate);
      const end = isCurrentJob || !endDate ? new Date() : new Date(endDate);
      const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

      if (diffInMonths <= 0 || isNaN(diffInMonths)) return "";

      const years = Math.floor(diffInMonths / 12);
      const months = diffInMonths % 12;

      if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
      if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
      return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Experience Management</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your professional work experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isEditing ? 'Edit Experience Entry' : 'Add New Experience Entry'}
          </h3>
          
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your position/role"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., San Francisco, CA or Remote"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <div className="flex gap-2">
                  <select
                    name="startMonth"
                    value={formData.startDate.split(" ")[0] || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      startDate: `${e.target.value} ${prev.startDate.split(" ")[1] || new Date().getFullYear()}`
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Month</option>
                    {[
                      "January","February","March","April","May","June",
                      "July","August","September","October","November","December"
                    ].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="startYear"
                    value={formData.startDate.split(" ")[1] || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      startDate: `${prev.startDate.split(" ")[0] || "January"} ${e.target.value}`
                    }))}
                    placeholder="Year"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <div className="flex gap-2">
                  <select
                    name="endMonth"
                    value={formData.endDate.split(" ")[0] || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endDate: `${e.target.value} ${prev.endDate.split(" ")[1] || new Date().getFullYear()}`
                    }))}
                    disabled={formData.isCurrentJob}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Month</option>
                    {[
                      "January","February","March","April","May","June",
                      "July","August","September","October","November","December"
                    ].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="endYear"
                    value={formData.endDate.split(" ")[1] || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endDate: `${prev.endDate.split(" ")[0] || "January"} ${e.target.value}`
                    }))}
                    placeholder="Year"
                    disabled={formData.isCurrentJob}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isCurrentJob"
                checked={formData.isCurrentJob}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                I currently work here
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description of your role and responsibilities"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Achievements (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                  placeholder="Add achievement and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addAchievement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-800 dark:text-gray-200">{achievement}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(achievement)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technologies (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  placeholder="Add technology and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addTechnology}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((technology, index) => (
                  <div key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    <span className="text-sm">{technology}</span>
                    <button
                      type="button"
                      onClick={() => removeTechnology(technology)}
                      className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isEditing ? (
                  <Edit2 size={16} />
                ) : (
                  <Plus size={16} />
                )}
                <span>{isEditing ? 'Update' : 'Add'} Experience</span>
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Experience ({experiences.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading experiences...</span>
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No experience entries found.</p>
              <p className="mt-2">Add your first entry using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {experiences.map(exp => (
                <div key={exp._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Building size={16} className="text-gray-500 dark:text-gray-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">{exp.position}</h4>
                        {exp.isCurrentJob && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{exp.company}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{exp.location}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(exp)}
                        disabled={isSaving}
                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 disabled:text-gray-400 dark:disabled:text-gray-500"
                        aria-label="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        disabled={isSaving}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:text-gray-400 dark:disabled:text-gray-500"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} />
                      <span>
                        {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                      </span>
                      {calculateDuration(exp.startDate, exp.endDate, exp.isCurrentJob) && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                          {calculateDuration(exp.startDate, exp.endDate, exp.isCurrentJob)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{exp.description}</p>
                  
                  {exp.achievements.length > 0 && (
                    <div className="mb-2">
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Achievements</h5>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {exp.achievements.slice(0, 3).map((a, i) => (
                          <li key={i} className="flex">
                            <span className="mr-2">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                        {exp.achievements.length > 3 && (
                          <li className="text-xs text-gray-500 dark:text-gray-500">
                            +{exp.achievements.length - 3} more achievements
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {exp.technologies.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Technologies</h5>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.slice(0, 5).map((t, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            {t}
                          </span>
                        ))}
                        {exp.technologies.length > 5 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            +{exp.technologies.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;