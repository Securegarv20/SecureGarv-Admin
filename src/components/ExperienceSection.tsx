import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, Calendar, Building } from 'lucide-react';

interface Experience {
  id: string;
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

export default function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      company: 'Tech Solutions Inc.',
      position: 'Senior Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: '',
      description: 'Led development of scalable web applications using React, Node.js, and cloud technologies. Collaborated with cross-functional teams to deliver high-quality software solutions.',
      achievements: [
        'Increased application performance by 40% through optimization',
        'Led a team of 5 developers on major product releases',
        'Implemented CI/CD pipeline reducing deployment time by 60%'
      ],
      technologies: ['React', 'Node.js', 'AWS', 'MongoDB', 'TypeScript'],
      isCurrentJob: true
    },
    {
      id: '2',
      company: 'Digital Agency Pro',
      position: 'Frontend Developer',
      location: 'Remote',
      startDate: '2020-06',
      endDate: '2022-02',
      description: 'Developed responsive web applications and collaborated with designers to create pixel-perfect user interfaces. Worked on various client projects across different industries.',
      achievements: [
        'Delivered 15+ client projects on time and within budget',
        'Improved code quality by implementing testing frameworks',
        'Mentored junior developers and conducted code reviews'
      ],
      technologies: ['React', 'Vue.js', 'JavaScript', 'CSS3', 'Figma'],
      isCurrentJob: false
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    achievements: [] as string[],
    technologies: [] as string[],
    isCurrentJob: false
  });

  const [newAchievement, setNewAchievement] = useState('');
  const [newTechnology, setNewTechnology] = useState('');

  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      ...formData
    };
    setExperiences([...experiences, newExperience]);
    resetForm();
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      company: experience.company,
      position: experience.position,
      location: experience.location,
      startDate: experience.startDate,
      endDate: experience.endDate,
      description: experience.description,
      achievements: [...experience.achievements],
      technologies: [...experience.technologies],
      isCurrentJob: experience.isCurrentJob
    });
    setIsEditing(true);
  };

  const handleUpdateExperience = () => {
    if (editingExperience) {
      setExperiences(experiences.map(exp => 
        exp.id === editingExperience.id ? { ...editingExperience, ...formData } : exp
      ));
      resetForm();
    }
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
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
    setEditingExperience(null);
    setNewAchievement('');
    setNewTechnology('');
  };

  const handleSave = () => {
    console.log('Saving experience:', experiences);
    alert('Experience section updated successfully!');
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !formData.achievements.includes(newAchievement.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }));
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (startDate: string, endDate: string, isCurrentJob: boolean) => {
    const start = new Date(startDate);
    const end = isCurrentJob ? new Date() : new Date(endDate);
    const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Experience Management</h2>
        <p className="text-gray-600 mt-2">Manage your professional work experience and career history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Experience' : 'Add New Experience'}
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Tech Solutions Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position/Role</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Full Stack Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA or Remote"
              />
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
                  disabled={formData.isCurrentJob}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCurrentJob"
                checked={formData.isCurrentJob}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isCurrentJob: e.target.checked,
                  endDate: e.target.checked ? '' : prev.endDate
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isCurrentJob" className="text-sm text-gray-700">I currently work here</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your role and responsibilities"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Achievements</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add achievement"
                />
                <button
                  onClick={addAchievement}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{achievement}</span>
                    <button
                      onClick={() => removeAchievement(achievement)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add technology"
                />
                <button
                  onClick={addTechnology}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tech}
                    <button
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={isEditing ? handleUpdateExperience : handleAddExperience}
                disabled={!formData.company || !formData.position}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                <Plus size={16} />
                <span>{isEditing ? 'Update Experience' : 'Add Experience'}</span>
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
            <h3 className="text-lg font-semibold text-gray-900">Work Experience ({experiences.length})</h3>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save size={16} />
              <span>Save All</span>
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {experiences.map(exp => (
              <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Building size={16} className="text-blue-500" />
                      <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                      {exp.isCurrentJob && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-600">{exp.location}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditExperience(exp)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>
                      {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {calculateDuration(exp.startDate, exp.endDate, exp.isCurrentJob)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{exp.description}</p>

                {exp.achievements.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Key Achievements:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {exp.achievements.slice(0, 2).map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {achievement}
                        </li>
                      ))}
                      {exp.achievements.length > 2 && (
                        <li className="text-xs text-gray-500">
                          +{exp.achievements.length - 2} more achievements
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {exp.technologies.slice(0, 4).map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                    {exp.technologies.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                        +{exp.technologies.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {experiences.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No work experience yet. Add your first job!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}