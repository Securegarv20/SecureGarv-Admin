import { useState, useEffect } from 'react';
import { 
  Search, Mail, MailOpen, Trash2, Reply, Star, Archive, 
  MessageSquare, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from 'react-modal';

// Set app element for accessibility
Modal.setAppElement('#root');

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'starred' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMessageList, setShowMessageList] = useState(true);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Fetch messages with consistent API handling
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/messages?filter=${filter}&search=${searchTerm}`, {
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
      
      toast.success('Messages loaded successfully');
    } catch (error) {
      toast.error('Failed to load messages. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [filter, searchTerm]);

  // Consistent API call pattern for message updates
  const updateMessage = async (id: string, updates: Partial<Message>) => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/api/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      const updatedMessage = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg._id === id ? updatedMessage : msg
      ));
      
      if (selectedMessage?._id === id) {
        setSelectedMessage(updatedMessage);
      }

      toast.success('Message updated successfully');
      return updatedMessage;
    } catch (error) {
      toast.error('Failed to update message');
      console.error(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (id: string) => {
    setMessageToDelete(id);
    setDeleteModalIsOpen(true);
  };

  // Handle actual deletion
  const handleDelete = async () => {
    if (!messageToDelete) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/api/messages/${messageToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg._id !== messageToDelete));
      if (selectedMessage?._id === messageToDelete) {
        setSelectedMessage(null);
      }

      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error(error);
    } finally {
      setIsSaving(false);
      setDeleteModalIsOpen(false);
      setMessageToDelete(null);
    }
  };

  // Wrapper functions using the consistent update pattern
  const toggleRead = async (id: string) => {
    const message = messages.find(m => m._id === id);
    if (message) {
      try {
        await updateMessage(id, { isRead: !message.isRead });
      } catch (error) {
        console.error('Error toggling read status:', error);
      }
    }
  };

  const toggleStar = async (id: string) => {
    const message = messages.find(m => m._id === id);
    if (message) {
      await updateMessage(id, { isStarred: !message.isStarred });
    }
  };

  const toggleArchive = async (id: string, archive: boolean) => {
    await updateMessage(id, { isArchived: archive });
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter messages based on current filter
  const filteredMessages = messages.filter(msg => {
    if (filter === 'starred') return msg.isStarred;
    if (filter === 'archived') return msg.isArchived;
    return true; // 'all' filter
  });

  const starredCount = messages.filter(msg => msg.isStarred).length;
  const archivedCount = messages.filter(msg => msg.isArchived).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Messages</h2>
        <p className="text-gray-400 mt-1">Manage messages from your portfolio</p>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={() => setDeleteModalIsOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
        contentLabel="Delete Message Confirmation"
      >
        <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
          <p className="text-gray-300 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setDeleteModalIsOpen(false)}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-800 transition-colors flex items-center"
            >
              {isSaving ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Trash2 className="mr-2" size={16} />
              )}
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-[calc(100vh-180px)]">
        {/* Messages List Panel */}
        {(showMessageList || !isMobileView) && (
          <div className={`${isMobileView ? 'fixed inset-0 z-50 bg-gray-800 p-4 overflow-y-auto' : 'lg:col-span-1'} bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden flex flex-col`}>
            {/* Mobile close button */}
            {isMobileView && (
              <button 
                onClick={() => setShowMessageList(false)}
                className="mb-4 p-2 rounded-full hover:bg-gray-700 self-end transition-colors"
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
            )}
            
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-white placeholder-gray-400"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap transition-colors ${
                    filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('starred')}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap transition-colors ${
                    filter === 'starred' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Starred ({starredCount})
                </button>
                <button
                  onClick={() => setFilter('archived')}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap transition-colors ${
                    filter === 'archived' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Archived ({archivedCount})
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages.map(message => (
                  <div
                    key={message._id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) {
                        toggleRead(message._id);
                      }
                      if (isMobileView) {
                        setShowMessageList(false);
                      }
                    }}
                    className={`p-3 md:p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                      selectedMessage?._id === message._id ? 'bg-gray-700 border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {!message.isRead && (
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        )}
                        <span className={`font-medium text-sm ${!message.isRead ? 'font-bold text-white' : 'text-gray-200'}`}>
                          {message.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {message.isStarred && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                        <span className="text-xs text-gray-400">{formatDate(message.createdAt)}</span>
                      </div>
                    </div>
                    <p className={`text-sm mb-1 ${!message.isRead ? 'font-semibold text-white' : 'text-gray-300'}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {message.message.substring(0, 60)}...
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="mx-auto mb-4 text-gray-600 h-12 w-12" />
                  <p>No messages found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Try adjusting your search terms</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Detail Panel */}
        <div className={`${isMobileView && showMessageList ? 'hidden' : 'lg:col-span-2'} bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden flex flex-col`}>
          {isMobileView && !showMessageList && (
            <button 
              onClick={() => setShowMessageList(true)}
              className="p-2 rounded-full hover:bg-gray-700 self-start m-2 transition-colors"
            >
              <ChevronUp className="h-5 w-5 text-gray-400" />
            </button>
          )}
          
          {selectedMessage ? (
            <>
              <div className="p-4 md:p-6 border-b border-gray-700">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-400">
                      <span className="font-medium text-gray-300">{selectedMessage.name}</span>
                      <span className="break-all text-purple-400">&lt;{selectedMessage.email}&gt;</span>
                      <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => toggleStar(selectedMessage._id)}
                      disabled={isSaving}
                      className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${
                        selectedMessage.isStarred ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                      aria-label={selectedMessage.isStarred ? 'Unstar message' : 'Star message'}
                    >
                      <Star className={`h-5 w-5 ${selectedMessage.isStarred ? 'fill-current' : ''}`} />
                    </button>
                    {selectedMessage.isArchived ? (
                      <button
                        onClick={() => toggleArchive(selectedMessage._id, false)}
                        disabled={isSaving}
                        className="p-2 rounded-full hover:bg-gray-700 text-green-400 transition-colors"
                        aria-label="Unarchive message"
                      >
                        <Archive className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleArchive(selectedMessage._id, true)}
                        disabled={isSaving}
                        className="p-2 rounded-full hover:bg-gray-700 text-gray-400 transition-colors"
                        aria-label="Archive message"
                      >
                        <Archive className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => confirmDelete(selectedMessage._id)}
                      disabled={isSaving}
                      className="p-2 rounded-full hover:bg-gray-700 text-red-400 transition-colors"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-700 bg-gray-750">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button 
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={() => toggleRead(selectedMessage._id)}
                    disabled={isSaving}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {selectedMessage.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    <span>Mark as {selectedMessage.isRead ? 'Unread' : 'Read'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500 p-6">
                <MessageSquare className="mx-auto mb-4 text-gray-600 h-12 w-12" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Message Selected</h3>
                <p className="mb-4 text-gray-400">Select a message from the list to view its content</p>
                {isMobileView && (
                  <button
                    onClick={() => setShowMessageList(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Messages
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}