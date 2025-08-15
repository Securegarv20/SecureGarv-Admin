import React, { useState } from 'react';
import { Search, Mail, MailOpen, Trash2, Reply, Star, Archive, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      subject: 'Freelance Web Development Project',
      message: 'Hi Garv, I came across your portfolio and I\'m impressed with your work. I have a freelance project that might interest you. It involves building a responsive e-commerce website using React and Node.js. The project timeline is 3 months and the budget is flexible. Would you be available for a call this week to discuss the details?',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      isStarred: true,
      isArchived: false
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      subject: 'Job Opportunity - Full Stack Developer',
      message: 'Hello Garv, We are looking for a talented Full Stack Developer to join our team at TechCorp. Your portfolio shows excellent skills in the technologies we use. We offer competitive salary, remote work options, and great benefits. Are you currently looking for new opportunities?',
      timestamp: '2024-01-14T14:20:00Z',
      isRead: true,
      isStarred: false,
      isArchived: false
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@startup.io',
      subject: 'Collaboration Proposal',
      message: 'Hey there! I run a startup in the fintech space and we\'re looking for a technical co-founder. Your experience with React and backend technologies would be perfect for what we\'re building. Would love to chat about this opportunity.',
      timestamp: '2024-01-13T09:15:00Z',
      isRead: true,
      isStarred: false,
      isArchived: false
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma.davis@designstudio.com',
      subject: 'Portfolio Feedback',
      message: 'Hi Garv, I\'m a UX designer and I really like your portfolio website. The design is clean and your projects are well presented. Just wanted to give you some positive feedback. Keep up the great work!',
      timestamp: '2024-01-12T16:45:00Z',
      isRead: true,
      isStarred: true,
      isArchived: false
    },
    {
      id: '5',
      name: 'Alex Chen',
      email: 'alex.chen@agency.com',
      subject: 'Partnership Opportunity',
      message: 'Hello, I represent a digital agency and we\'re always looking for skilled developers to partner with on client projects. Your portfolio demonstrates exactly the kind of quality we look for. Would you be interested in discussing a potential partnership?',
      timestamp: '2024-01-11T11:30:00Z',
      isRead: false,
      isStarred: false,
      isArchived: false
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const toggleRead = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, isRead: !msg.isRead } : msg
    ));
  };

  const toggleStar = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const toggleArchive = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, isArchived: !msg.isArchived } : msg
    ));
    setSelectedMessage(null);
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
    setSelectedMessage(null);
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'unread':
        return !msg.isRead && !msg.isArchived;
      case 'starred':
        return msg.isStarred && !msg.isArchived;
      case 'archived':
        return msg.isArchived;
      default:
        return !msg.isArchived;
    }
  });

  const unreadCount = messages.filter(msg => !msg.isRead && !msg.isArchived).length;
  const starredCount = messages.filter(msg => msg.isStarred && !msg.isArchived).length;
  const archivedCount = messages.filter(msg => msg.isArchived).length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600 mt-2">Manage messages and inquiries from your portfolio visitors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded text-sm ${filter === 'unread' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('starred')}
                className={`px-3 py-1 rounded text-sm ${filter === 'starred' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Starred ({starredCount})
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`px-3 py-1 rounded text-sm ${filter === 'archived' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Archived ({archivedCount})
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="overflow-y-auto h-full">
            {filteredMessages.map(message => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.isRead) {
                    toggleRead(message.id);
                  }
                }}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                } ${!message.isRead ? 'bg-blue-25' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${message.isRead ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                    <span className={`font-medium text-sm ${!message.isRead ? 'font-bold' : ''}`}>
                      {message.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {message.isStarred && <Star size={12} className="text-yellow-400 fill-current" />}
                    <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                  </div>
                </div>
                <p className={`text-sm text-gray-700 mb-1 ${!message.isRead ? 'font-semibold' : ''}`}>
                  {message.subject}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {message.message}
                </p>
              </div>
            ))}

            {filteredMessages.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No messages found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Message Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-medium">{selectedMessage.name}</span>
                      <span>&lt;{selectedMessage.email}&gt;</span>
                      <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStar(selectedMessage.id)}
                      className={`p-2 rounded hover:bg-gray-100 ${
                        selectedMessage.isStarred ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      <Star size={20} className={selectedMessage.isStarred ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={() => toggleArchive(selectedMessage.id)}
                      className="p-2 rounded hover:bg-gray-100 text-gray-600"
                    >
                      <Archive size={20} />
                    </button>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 rounded hover:bg-gray-100 text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Reply Section */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Reply size={16} />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={() => toggleRead(selectedMessage.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {selectedMessage.isRead ? <Mail size={16} /> : <MailOpen size={16} />}
                    <span>Mark as {selectedMessage.isRead ? 'Unread' : 'Read'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Message Selected</h3>
                <p>Select a message from the list to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}