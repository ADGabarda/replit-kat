import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePost } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import { 
  Image, 
  Calendar, 
  Clock, 
  Send, 
  X,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { addMinutes, format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

const Compose: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(addMinutes(new Date(), 30));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPost, isLoading } = usePost();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!content.trim()) {
      setError('Please enter some content for your post');
      setIsSubmitting(false);
      return;
    }

    if (selectedDate <= new Date()) {
      setError('Please select a future date and time');
      setIsSubmitting(false);
      return;
    }

    if (user && user.postsUsed >= user.postsLimit) {
      setError(`You've reached your post limit. Please try again later.`);
      setIsSubmitting(false);
      return;
    }

    try {
      await createPost(content, selectedDate, selectedImage || undefined);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to schedule post. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const suggestedTimes = [
    { label: 'In 30 minutes', value: addMinutes(new Date(), 30) },
    { label: 'In 1 hour', value: addMinutes(new Date(), 60) },
    { label: 'Tomorrow 9 AM', value: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) },
    { label: 'Tomorrow 6 PM', value: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) },
  ];

  const charactersLeft = 280 - content.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600">Schedule your social media post for the perfect time</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Compose Area */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Social Media Post</span>
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={8}
                className="w-full border-0 resize-none focus:ring-0 text-lg placeholder-gray-400"
                maxLength={280}
              />
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer text-blue-600 hover:text-blue-700">
                    <Image className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className={`text-sm ${charactersLeft < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                  {charactersLeft} characters left
                </div>
              </div>

              {/* Image Preview */}
              {selectedImage && (
                <div className="mt-4 relative">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Scheduling */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Schedule</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date & Time
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date!)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Options
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedTimes.map((time, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedDate(time.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#38b6ff]"
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || isLoading || !content.trim()}
                className="bg-gradient-to-r from-[#38b6ff] to-[#2da5ef] text-white px-8 py-3 rounded-lg font-medium hover:from-[#2da5ef] hover:to-[#1e94d4] focus:outline-none focus:ring-2 focus:ring-[#38b6ff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {format(selectedDate, 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-900 mb-3">
                {content || 'Your post content will appear here...'}
              </div>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tips for Better Engagement</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <Clock className="w-4 h-4 mr-2 mt-0.5 text-[#38b6ff]" />
                Best times to post: 9 AM, 1 PM, and 3 PM
              </li>
              <li className="flex items-start">
                <Image className="w-4 h-4 mr-2 mt-0.5 text-[#38b6ff]" />
                Posts with images get 2.3x more engagement
              </li>
              <li className="flex items-start">
                <Send className="w-4 h-4 mr-2 mt-0.5 text-[#38b6ff]" />
                Keep it concise and engaging
              </li>
            </ul>
          </div>

          {/* Usage */}
        </div>
      </div>
    </div>
  );
};

export default Compose;