import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, Calendar } from 'lucide-react';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
  isOngoing: boolean;
}

export default function EducationSection() {
  const [educations, setEducations] = useState<Education[]>([
    {
      id: '1',
      institution: 'University of Technology',
      degree: 'Bachelor of Technology',
      field: 'Computer Science',
      startDate: '2020-08',
      endDate: '2024-05',
      gpa: '8.5',
      description: 'Focused on software engineering, data structures, algorithms, and web development.',
      isOngoing: false
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    gpa: '',
    description: '',
    isOngoing: false
  });

  const handleAddEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      ...formData
    };
    setEducations([...educations, newEducation]);
    resetForm();
  };

  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    setFormData({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      startDate: education.startDate,
      endDate: education.endDate,
      gpa: education.gpa,
      description: education.description,
      isOngoing: education.isOngoing
    });
    setIsEditing(true);
  };

  const handleUpdateEducation = () => {
    if (editingEducation) {
      setEducations(educations.map(edu => 
        edu.id === editingEducation.id ? { ...editingEducation, ...formData } : edu
      ));
      resetForm();
    }
  };

  const handleDeleteEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
      isOngoing: false
    });
    setIsEditing(false);
    setEditingEducation(null);
  };

  const handleSave = () => {
    console.log('Saving education:', educations);
    alert('Education section updated successfully!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Education Management</h2>
        <p className="text-gray-600 mt-2">Manage your educational background and qualifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Education' : 'Add New Education'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="University/College name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bachelor's, Master's"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={formData.isOngoing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isOngoing"
                checked={formData.isOngoing}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isOngoing: e.target.checked,
                  endDate: e.target.checked ? '' : prev.endDate
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isOngoing" className="text-sm text-gray-700">Currently pursuing</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPA/Grade</label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3.8/4.0 or 85%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Relevant coursework, achievements, or activities"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={isEditing ? handleUpdateEducation : handleAddEducation}
                disabled={!formData.institution || !formData.degree}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                <Plus size={16} />
                <span>{isEditing ? 'Update Education' : 'Add Education'}</span>
              </button>
              
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Education History ({educations.length})</h3>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save size={16} />
              <span>Save All</span>
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {educations.map(edu => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h4>
                    <p className="text-gray-700">{edu.institution}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditEducation(edu)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>
                      {formatDate(edu.startDate)} - {edu.isOngoing ? 'Present' : formatDate(edu.endDate)}
                    </span>
                  </div>
                  {edu.gpa && (
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
                
                {edu.description && (
                  <p className="text-sm text-gray-600">{edu.description}</p>
                )}
              </div>
            ))}

            {educations.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No education entries yet. Add your first one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}