import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Loader2, ArrowUp, ArrowDown, Save,
  Code
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Skill {
  _id: string;
  name: string;
  iconUrl?: string;
  proficiency: number;
  featured: boolean;
  order: number;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

const SkillsSection = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Skill, '_id' | 'order'>>({
    name: '',
    iconUrl: '',
    proficiency: 50,
    featured: false
  });

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/skills`, {
        headers: {
          'x-api-key': API_KEY
        }
      });
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      toast.error('Failed to load skills');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleEdit = (skill: Skill) => {
    setFormData({
      name: skill.name,
      iconUrl: skill.iconUrl || '',
      proficiency: skill.proficiency,
      featured: skill.featured
    });
    setIsEditing(true);
    setEditingId(skill._id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      iconUrl: '',
      proficiency: 50,
      featured: false
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Skill name is required');
      return;
    }

    try {
      setIsSaving(true);
      const url = isEditing && editingId 
        ? `${API_URL}/api/skills/${editingId}`
        : `${API_URL}/api/skills`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save skill');

      const data = await response.json();
      
      if (isEditing) {
        setSkills(prev => prev.map(skill => 
          skill._id === editingId ? data : skill
        ));
        toast.success('Skill updated successfully');
      } else {
        setSkills(prev => [...prev, data]);
        toast.success('Skill added successfully');
      }
      
      resetForm();
      fetchSkills();
    } catch (error) {
      toast.error('Failed to save skill');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/api/skills/${id}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.ok) throw new Error('Failed to delete skill');

      setSkills(prev => prev.filter(skill => skill._id !== id));
      toast.success('Skill deleted successfully');
    } catch (error) {
      toast.error('Failed to delete skill');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const moveSkill = async (id: string, direction: 'up' | 'down') => {
    try {
      setIsSaving(true);
      const currentIndex = skills.findIndex(skill => skill._id === id);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= skills.length) return;

      const newSkills = [...skills];
      [newSkills[currentIndex].order, newSkills[newIndex].order] = 
        [newSkills[newIndex].order, newSkills[currentIndex].order];
      
      newSkills.sort((a, b) => a.order - b.order);
      setSkills(newSkills);

      await fetch(`${API_URL}/api/skills/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          orderedIds: newSkills.map(skill => skill._id)
        })
      });

    } catch (error) {
      toast.error('Failed to reorder skills');
      console.error(error);
      fetchSkills();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Skills Management</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your technical skills and proficiencies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isEditing ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., React, Node.js"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon URL (e.g., https://img.icons8.com/ios/50/000000/react-native.png)
              </label>
              <input
                type="url"
                name="iconUrl"
                value={formData.iconUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://img.icons8.com/ios/50/000000/react-native.png"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use direct image URLs from Icons8 or other services
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proficiency: {formData.proficiency}%
              </label>
              <input
                type="range"
                name="proficiency"
                min="1"
                max="100"
                value={formData.proficiency}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Featured Skill (highlight in portfolio)
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 dark:disabled:bg-purple-800 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isEditing ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                <span>{isEditing ? 'Update' : 'Add'} Skill</span>
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Skills ({skills.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No skills added yet.</p>
              <p className="mt-2">Add your first skill using the form.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div 
                  key={skill._id} 
                  className={`p-4 rounded-lg border ${
                    skill.featured 
                      ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30' 
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-500 dark:text-purple-300">
                        {skill.iconUrl ? (
                          <img 
                            src={skill.iconUrl} 
                            alt={skill.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Code className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{skill.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-600">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" 
                              style={{ width: `${skill.proficiency}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {skill.proficiency}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveSkill(skill._id, 'up')}
                        disabled={isSaving || index === 0}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:text-gray-300 dark:disabled:text-gray-600"
                        aria-label="Move up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveSkill(skill._id, 'down')}
                        disabled={isSaving || index === skills.length - 1}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:text-gray-300 dark:disabled:text-gray-600"
                        aria-label="Move down"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(skill)}
                        disabled={isSaving}
                        className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-400"
                        aria-label="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(skill._id)}
                        disabled={isSaving}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;