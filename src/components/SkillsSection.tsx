import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, Star } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon: string;
  description: string;
}

export default function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: '1',
      name: 'JavaScript',
      category: 'Frontend',
      proficiency: 95,
      icon: '🟨',
      description: 'Advanced knowledge in modern JavaScript, ES6+, and frameworks'
    },
    {
      id: '2',
      name: 'React',
      category: 'Frontend',
      proficiency: 90,
      icon: '⚛️',
      description: 'Building dynamic user interfaces with React hooks and context'
    },
    {
      id: '3',
      name: 'Node.js',
      category: 'Backend',
      proficiency: 85,
      icon: '🟢',
      description: 'Server-side development with Express.js and RESTful APIs'
    },
    {
      id: '4',
      name: 'Python',
      category: 'Backend',
      proficiency: 80,
      icon: '🐍',
      description: 'Data analysis, automation, and web development with Django'
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 50,
    icon: '',
    description: ''
  });

  const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Other'];

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      ...formData
    };
    setSkills([...skills, newSkill]);
    resetForm();
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon: skill.icon,
      description: skill.description
    });
    setIsEditing(true);
  };

  const handleUpdateSkill = () => {
    if (editingSkill) {
      setSkills(skills.map(skill => 
        skill.id === editingSkill.id ? { ...editingSkill, ...formData } : skill
      ));
      resetForm();
    }
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Frontend',
      proficiency: 50,
      icon: '',
      description: ''
    });
    setIsEditing(false);
    setEditingSkill(null);
  };

  const handleSave = () => {
    console.log('Saving skills:', skills);
    alert('Skills updated successfully!');
  };

  const getSkillsByCategory = (category: string) => {
    return skills.filter(skill => skill.category === category);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Skills Management</h2>
        <p className="text-gray-600 mt-2">Add, edit, or remove your technical skills</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., JavaScript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proficiency: {formData.proficiency}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.proficiency}
                onChange={(e) => setFormData(prev => ({ ...prev, proficiency: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 🟨, ⚛️, 🐍"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your experience with this skill"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={isEditing ? handleUpdateSkill : handleAddSkill}
                disabled={!formData.name}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                <Plus size={16} />
                <span>{isEditing ? 'Update Skill' : 'Add Skill'}</span>
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
            <h3 className="text-lg font-semibold text-gray-900">Current Skills ({skills.length})</h3>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save size={16} />
              <span>Save All</span>
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {categories.map(category => {
              const categorySkills = getSkillsByCategory(category);
              if (categorySkills.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">{category}</h4>
                  <div className="space-y-2">
                    {categorySkills.map(skill => (
                      <div key={skill.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{skill.icon}</span>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditSkill(skill)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}