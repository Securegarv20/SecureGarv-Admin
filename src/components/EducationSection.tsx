import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Loader2, ExternalLink, GraduationCap, Award, BookOpen, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Education {
  _id: string;
  type: 'education' | 'certification' | 'achievement' | 'publication';
  institution: string;
  degree: string;
  period: string;
  description: string;
  certificateLink?: string;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

const EducationSection = () => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Education, '_id'>>({
    type: 'education',
    institution: '',
    degree: '',
    period: '',
    description: '',
    certificateLink: ''
  });

  // Enhanced fetch function with error handling
  const apiRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    }
  };

  // Fetch education data
  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest('/api/education');
        setEducations(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEducation();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      type: 'education',
      institution: '',
      degree: '',
      period: '',
      description: '',
      certificateLink: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.institution || !formData.degree || !formData.period || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      if (isEditing && editingId) {
        // Update existing education
        const updatedEducation = await apiRequest(`/api/education/${editingId}`, 'PUT', formData);
        setEducations(prev => prev.map(edu => 
          edu._id === editingId ? updatedEducation : edu
        ));
        toast.success('Education updated successfully!');
      } else {
        // Add new education
        const newEducation = await apiRequest('/api/education', 'POST', formData);
        setEducations(prev => [...prev, newEducation]);
        toast.success('Education added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (education: Education) => {
    setFormData({
      type: education.type,
      institution: education.institution,
      degree: education.degree,
      period: education.period,
      description: education.description,
      certificateLink: education.certificateLink || ''
    });
    setIsEditing(true);
    setEditingId(education._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    try {
      setIsSaving(true);
      await apiRequest(`/api/education/${id}`, 'DELETE');
      setEducations(prev => prev.filter(edu => edu._id !== id));
      toast.success('Education deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'education': return <GraduationCap size={16} />;
      case 'certification': return <Award size={16} />;
      case 'achievement': return <Trophy size={16} />;
      case 'publication': return <BookOpen size={16} />;
      default: return <GraduationCap size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'education': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'certification': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'achievement': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'publication': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-0">
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Education Management</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your educational background, certifications, achievements, and publications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isEditing ? 'Edit Education Entry' : 'Add New Education Entry'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="education">Education</option>
                <option value="certification">Certification</option>
                <option value="achievement">Achievement</option>
                <option value="publication">Publication</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Institution/Organization *
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="University/Organization name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Degree/Certification *
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Bachelor's Degree, CEH Certification"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period *
              </label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., 2020 - 2023 or May 2023"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certificate Link (Optional)
              </label>
              <input
                type="url"
                name="certificateLink"
                value={formData.certificateLink || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/certificate"
              />
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
                placeholder="Description of your education/certification"
                required
              />
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
                <span>{isEditing ? 'Update' : 'Add'} Entry</span>
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
              Your Education Entries ({educations.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : educations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No education entries found.</p>
              <p className="mt-2">Add your first entry using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {educations.map(edu => (
                <div key={edu._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          {getTypeIcon(edu.type)}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(edu.type)}`}>
                          {edu.type.charAt(0).toUpperCase() + edu.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{edu.institution}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(edu)}
                        disabled={isSaving}
                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 disabled:text-gray-400 dark:disabled:text-gray-500"
                        aria-label="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(edu._id)}
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
                      <span>{edu.period}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{edu.description}</p>
                  
                  {edu.certificateLink && (
                    <a 
                      href={edu.certificateLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View Certificate <ExternalLink className="ml-1" size={14} />
                    </a>
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

export default EducationSection;