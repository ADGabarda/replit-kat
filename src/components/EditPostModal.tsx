import React, { useState } from 'react';
import { usePost } from '../contexts/PostContext';
import DatePicker from 'react-datepicker';
import { X, Save, Image, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

interface EditPostModalProps {
  post: {
    id: string;
    content: string;
    image?: string;
    scheduledFor: Date;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose }) => {
  const [content, setContent] = useState(post.content);
  const [selectedDate, setSelectedDate] = useState(post.scheduledFor);
  const [selectedImage, setSelectedImage] = useState(post.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePost } = usePost();

  if (!isOpen) return null;

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
    setIsSubmitting(true);

    try {
      if (post.id === 'new') {
        // Create new post
        await createPost(content, selectedDate, selectedImage || undefined);
      } else {
        // Update existing post
        await updatePost(post.id, {
          content,
          scheduledFor: selectedDate,
          image: selectedImage || undefined
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to update post:', error);
    }
    
    setIsSubmitting(false);
  };

  const charactersLeft = 280 - content.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={280}
            />
            <div className={`text-sm mt-1 ${charactersLeft < 20 ? 'text-red-500' : 'text-gray-500'}`}>
              {charactersLeft} characters left
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer text-[#38b6ff] hover:text-[#2da5ef] border border-[#38b6ff] rounded-lg px-4 py-2">
                <Image className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove Image
                </button>
              )}
            </div>
            {selectedImage && (
              <div className="mt-4">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Schedule Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date & Time
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date!)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38b6ff]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-6 py-2 bg-[#38b6ff] text-white rounded-lg hover:bg-[#2da5ef] focus:outline-none focus:ring-2 focus:ring-[#38b6ff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {post.id === 'new' ? 'Create Post' : 'Update Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;