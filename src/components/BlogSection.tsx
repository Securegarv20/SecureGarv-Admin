import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Edit, Trash2, Eye, Calendar, Clock, X, Loader2, BookOpen, Bold, Italic, Underline, List, Code, Link, Image } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  status: 'draft' | 'published';
}

interface APIError {
  message: string;
  status?: number;
}

interface BlogApiResponse {
  posts: BlogPost[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

// Custom toolbar component
const CustomToolbar = () => (
  <div id="toolbar" className="border-b border-gray-600/50 p-2 bg-gray-700/50">
    <select className="ql-header text-gray-300 bg-gray-700 border border-gray-600 rounded mr-2 p-1">
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
      <option value="">Normal</option>
    </select>
    
    <button className="ql-bold p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded">
      <Bold size={16} />
    </button>
    <button className="ql-italic p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded">
      <Italic size={16} />
    </button>
    <button className="ql-underline p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded">
      <Underline size={16} />
    </button>
    
    <button className="ql-list p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded" value="ordered">
      <List size={16} />
    </button>
    <button className="ql-list p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded" value="bullet">
      <List size={16} />
    </button>
    
    <button className="ql-code-block p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded">
      <Code size={16} />
    </button>
    <button className="ql-link p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded">
      <Link size={16} />
    </button>
    <button className="ql-image p-1 mx-1 text-gray-300 hover:bg-gray-600 rounded">
      <Image size={16} />
    </button>
  </div>
);

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const quillRef = useRef<ReactQuill>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    image: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published',
    newTag: ''
  });

  // Quill editor modules configuration
  const modules = {
    toolbar: {
      container: "#toolbar",
      handlers: {
        // You can add custom handlers here if needed
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  // Quill editor formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'code-block'
  ];

  // API client with error handling
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

      const data = await response.json();
      
      if (!response.ok) {
        throw {
          message: data.message || `Request failed with status ${response.status}`,
          status: response.status
        } as APIError;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient<BlogApiResponse>('/api/blog');
        setPosts(response.posts);
      } catch (error) {
        const err = error as APIError;
        console.error('Error fetching blog posts:', err);
        toast.error(err.message || 'Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Validate form fields
  const validateField = (field: string, value: string): boolean => {
    const errors = { ...validationErrors };
    
    if (!value.trim() && field !== 'newTag') {
      errors[field] = 'This field is required';
    } else {
      delete errors[field];
    }

    setValidationErrors(errors);
    return !errors[field];
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: field === 'status' ? (value as 'draft' | 'published') : value 
    }));
    
    if (field !== 'status' && field !== 'tags') {
      validateField(field, value as string);
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
    validateField('content', content);
  };

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        readTime: post.readTime,
        image: post.image,
        tags: [...post.tags],
        status: post.status,
        newTag: ''
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        image: '',
        tags: [],
        status: 'draft',
        newTag: ''
      });
    }
    setShowEditor(true);
    setValidationErrors({});
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingPost(null);
    setValidationErrors({});
  };

  const savePost = async () => {
    const requiredFields = ['title', 'excerpt', 'content', 'image'];
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData] as string)) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPost) {
        // Update existing post
        await apiClient(`/api/blog/${editingPost._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        toast.success('Blog post updated successfully!');
      } else {
        // Create new post
        await apiClient('/api/blog', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast.success('Blog post created successfully!');
      }
      
      // Refresh posts list
      const response = await apiClient<BlogApiResponse>('/api/blog');
      setPosts(response.posts);
      closeEditor();
    } catch (error) {
      const err = error as APIError;
      console.error('Error saving blog post:', err);
      toast.error(err.message || 'Failed to save blog post');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient(`/api/blog/${postId}`, {
        method: 'DELETE'
      });
      toast.success('Blog post deleted successfully!');
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      const err = error as APIError;
      console.error('Error deleting blog post:', err);
      toast.error(err.message || 'Failed to delete blog post');
    }
  };

  const toggleStatus = async (post: BlogPost) => {
    try {
      const updatedPost = { ...post, status: post.status === 'published' ? 'draft' : 'published' };
      await apiClient(`/api/blog/${post._id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedPost)
      });
      
      setPosts(posts.map(p => 
        p._id === post._id 
          ? { ...updatedPost, status: updatedPost.status as 'draft' | 'published' } 
          : p
      ));
      toast.success(`Post ${updatedPost.status === 'published' ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      const err = error as APIError;
      console.error('Error updating post status:', err);
      toast.error(err.message || 'Failed to update post status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 text-blue-400 mx-auto" />
          <p className="text-gray-400 font-medium">Loading blog posts...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Blog Management
            </h1>
            <p className="text-gray-400 mt-1">Create and manage your blog posts</p>
          </div>
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition shadow-lg hover:shadow-purple-500/25"
          >
            <Plus size={20} />
            New Post
          </button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg hover:border-gray-600/70 transition hover:shadow-xl hover:shadow-purple-500/10">
              {/* Image */}
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden group">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/1f2937/9ca3af?text=No+Image';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === 'published' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white line-clamp-2 leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime}
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full border border-gray-600/50">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => openEditor(post)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 rounded-lg transition text-sm border border-gray-600/50 hover:border-gray-500/50"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(post)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition text-sm border border-blue-600/30 hover:border-blue-500/30"
                  >
                    <Eye size={16} />
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deletePost(post._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm border border-red-600/30 hover:border-red-500/30"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="bg-gray-800/50 rounded-xl p-12 border-2 border-dashed border-gray-700/50">
                <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-300 mb-3">No blog posts yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start creating amazing content for your audience. Your first blog post is just a click away.
                </p>
                <button
                  onClick={() => openEditor()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition shadow-lg hover:shadow-purple-500/25 mx-auto"
                >
                  <Plus size={20} />
                  Create First Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blog Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-700/70">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gray-900/50">
              <h2 className="text-xl font-semibold text-white">
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>
              <button
                onClick={closeEditor}
                className="text-gray-400 hover:text-gray-200 transition p-1 rounded-full hover:bg-gray-700/50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onBlur={(e) => validateField('title', e.target.value)}
                  className={`w-full p-3 bg-gray-700/70 border ${
                    validationErrors.title ? 'border-red-500/80' : 'border-gray-600/50'
                  } rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-white placeholder-gray-400`}
                  placeholder="Enter blog post title"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.title}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Excerpt *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  onBlur={(e) => validateField('excerpt', e.target.value)}
                  rows={3}
                  className={`w-full p-3 bg-gray-700/70 border ${
                    validationErrors.excerpt ? 'border-red-500/80' : 'border-gray-600/50'
                  } rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-white placeholder-gray-400`}
                  placeholder="Brief description of your blog post"
                />
                {validationErrors.excerpt && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.excerpt}</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Featured Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  onBlur={(e) => validateField('image', e.target.value)}
                  className={`w-full p-3 bg-gray-700/70 border ${
                    validationErrors.image ? 'border-red-500/80' : 'border-gray-600/50'
                  } rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-white placeholder-gray-400`}
                  placeholder="https://example.com/image.jpg"
                />
                {validationErrors.image && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.image}</p>
                )}
              </div>

              {/* Content - Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <div className={`border ${
                  validationErrors.content ? 'border-red-500/80' : 'border-gray-600/50'
                } rounded-lg overflow-hidden`}>
                  <CustomToolbar />
                  <ReactQuill
                    ref={quillRef}
                    value={formData.content}
                    onChange={handleContentChange}
                    modules={modules}
                    formats={formats}
                    theme="snow"
                    className="bg-gray-700/70 text-white"
                    style={{ 
                      height: '400px',
                      border: 'none'
                    }}
                  />
                </div>
                {validationErrors.content && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.content}</p>
                )}
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full p-3 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => handleInputChange('readTime', e.target.value)}
                    className="w-full p-3 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-white placeholder-gray-400"
                    placeholder="5 min read"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 p-3 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-white placeholder-gray-400"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-purple-300 rounded-lg transition border border-purple-600/50"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-purple-200 transition ml-1"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-3 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700/50 bg-gray-900/50">
              <button
                onClick={closeEditor}
                className="px-6 py-2 border border-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={savePost}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg transition flex items-center gap-2 ${
                  isSaving 
                    ? 'bg-purple-600/70 text-purple-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}