import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, Calendar, TrendingUp, AlertTriangle, 
  Target, FileText, Send, CheckCircle2, Clock, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/ui';

interface ChatMessage {
  id: string;
  name: string;
  role: string;
  text: string;
  timestamp: Date;
}

export default function MonthlyDiscussion() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // 1. Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('monthly_discussion_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Rehydrate Dates
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {}
    }
    return [
      {
        id: '1',
        name: 'System',
        role: 'admin',
        text: 'Welcome to the Monthly Discussion room. Please discuss pricing and quality for the upcoming month.',
        timestamp: new Date(Date.now() - 3600000)
      }
    ];
  });
  const [newMessage, setNewMessage] = useState('');

  // 5. Meeting State
  const [meetingDate, setMeetingDate] = useState(() => localStorage.getItem('monthly_discussion_date') || '');
  const [meetingTime, setMeetingTime] = useState(() => localStorage.getItem('monthly_discussion_time') || '');
  const [isMeetingScheduled, setIsMeetingScheduled] = useState(() => localStorage.getItem('monthly_discussion_scheduled') === 'true');

  useEffect(() => {
    localStorage.setItem('monthly_discussion_messages', JSON.stringify(messages));
  }, [messages]);

  // Reminders check (Last week of month)
  const isLastWeekOfMonth = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return (lastDay.getDate() - today.getDate()) <= 7;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    const msg: ChatMessage = {
      id: Date.now().toString(),
      name: user.name,
      role: user.role,
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingDate && meetingTime) {
      setIsMeetingScheduled(true);
      localStorage.setItem('monthly_discussion_date', meetingDate);
      localStorage.setItem('monthly_discussion_time', meetingTime);
      localStorage.setItem('monthly_discussion_scheduled', 'true');
      alert(`Meeting successfully scheduled for ${meetingDate} at ${meetingTime}`);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Submitted successfully!');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <MessageCircle size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Farmer Discussion</h1>
          <p className="text-gray-500">Communicate, review, and plan for the upcoming month.</p>
        </div>
      </div>

      {isLastWeekOfMonth() && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-yellow-600" />
            <p className="font-medium text-yellow-800">
              Reminder: Monthly Farmer Discussion is scheduled for the last week of this month. Please finalize next month's plan.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Chat & Review */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Section 2: Monthly Review */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <TrendingUp className="text-green-600" size={20} />
              Monthly Review
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Total Supplied</p>
                <p className="text-lg font-bold text-gray-900">1,250 kg</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-lg font-bold text-gray-900">15</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Avg. Price</p>
                <p className="text-lg font-bold text-gray-900">₹42/kg</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Delivery Status</p>
                <p className="text-sm font-bold text-green-600">98% On Time</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Quality Feedback</p>
                <p className="text-sm font-bold text-blue-600">4.8 / 5.0</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Pending Issues</p>
                <p className="text-sm font-bold text-gray-900">0</p>
              </div>
            </div>
          </Card>

          {/* Section 1: Discussion Room */}
          <Card className="flex h-[500px] flex-col p-0 overflow-hidden">
            <div className="border-b bg-gray-50 p-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <MessageCircle className="text-blue-600" size={20} />
                Discussion Room
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.name === user?.name;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{msg.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-gray-500">{msg.role}</span>
                      <span className="text-xs text-gray-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
              <input 
                type="text" 
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit" 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Send size={18} />
              </button>
            </form>
          </Card>

        </div>

        {/* Right Column: Forms & Planners */}
        <div className="space-y-6">
          
          {/* Section 5: Monthly Meeting */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Clock className="text-purple-600" size={20} />
              Monthly Meeting
            </h2>
            {isMeetingScheduled ? (
              <div className="rounded-lg bg-purple-50 p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="text-purple-600" size={20} />
                  <span className="font-bold text-purple-900">Meeting Scheduled</span>
                </div>
                <p className="text-sm text-purple-800">Date: {meetingDate}</p>
                <p className="text-sm text-purple-800">Time: {meetingTime}</p>
              </div>
            ) : (
              <form onSubmit={handleScheduleMeeting} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Select Date</label>
                  <input required type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Select Time</label>
                  <input required type="time" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} />
                </div>
                <button type="submit" className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                  Schedule Meeting
                </button>
              </form>
            )}
          </Card>

          {/* Section 3: Issues & Suggestions */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <AlertTriangle className="text-orange-500" size={20} />
              Issues & Suggestions
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option>Price issue</option>
                  <option>Quality issue</option>
                  <option>Delivery/logistics issue</option>
                  <option>Other suggestion</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={2} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Describe the issue..."></textarea>
              </div>
              <button type="submit" className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Submit Report
              </button>
            </form>
          </Card>

          {/* Section 4: Next Month Planning */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Target className="text-indigo-600" size={20} />
              Next Month Planning
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-3">
              <input required type="text" placeholder="Required product / material" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Quantity (kg)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                <input required type="number" placeholder="Expected Price" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <input required type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" title="Preferred delivery date" />
              <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Additional requirements..."></textarea>
              <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Submit Plan
              </button>
            </form>
          </Card>

          {/* Section 6: Discussion Summary */}
          <Card className="p-5 bg-blue-50 border-blue-100">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-blue-900">
              <FileText className="text-blue-600" size={20} />
              Discussion Summary
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-blue-800">Agreed Qty</label>
                  <input type="text" className="w-full rounded-lg border border-blue-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-blue-800">Agreed Price</label>
                  <input type="text" className="w-full rounded-lg border border-blue-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-blue-800">Delivery Plan & Decisions</label>
                <textarea rows={2} className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"></textarea>
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <Check size={16} /> Save Summary
              </button>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}
