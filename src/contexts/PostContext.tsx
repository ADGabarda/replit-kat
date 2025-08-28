import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/database';
import { addMinutes, format } from 'date-fns';
import NotificationPopup from '../components/NotificationPopup';
import { InboxNotification } from '../components/NotificationInbox';

export interface Post {
  id: string;
  content: string;
  image?: string;
  scheduledFor: Date;
  status: 'scheduled' | 'posted' | 'failed';
  createdAt: Date;
  error?: string;
}

interface PostContextType {
  posts: Post[];
  inboxNotifications: InboxNotification[];
  createPost: (content: string, scheduledFor: Date, image?: string) => Promise<void>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  updatePostStatus: (id: string, status: 'scheduled' | 'posted' | 'failed') => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  retryPost: (id: string) => Promise<void>;
  isLoading: boolean;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'due' | 'failed';
  }>>([]);
  const [inboxNotifications, setInboxNotifications] = useState<InboxNotification[]>([]);
  const [processedPosts, setProcessedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const addNotification = (message: string, type: 'due' | 'failed') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Also add to inbox
    const inboxNotification: InboxNotification = {
      id,
      message,
      type,
      timestamp: new Date(),
      isRead: false
    };
    setInboxNotifications(prev => [inboxNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  useEffect(() => {
    // Load posts from database when user changes
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const loadUserPosts = () => {
    if (!user) return;
    
    const dbPosts = db.getPostsByUserId(user.id);
    const formattedPosts = dbPosts.map((post: any) => ({
      id: post.id.toString(),
      content: post.content,
      image: post.image,
      scheduledFor: new Date(post.scheduledFor),
      status: post.status,
      createdAt: new Date(post.createdAt),
      error: post.error
    }));
    
    setPosts(formattedPosts);
  };

  useEffect(() => {
    // Check for due posts, failed posts, and auto-fail overdue posts
    const interval = setInterval(() => {
      if (!user) return;
      
      const now = new Date();
      posts.forEach(post => {
        // Check for due posts (show notification)
        const postKey = `${post.id}-due`;
        if (post.status === 'scheduled' && new Date(post.scheduledFor) <= now && !processedPosts.has(postKey)) {
          addNotification(
            `Post scheduled for ${format(new Date(post.scheduledFor), 'MMM d, h:mm a')} is now due: "${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}"`,
            'due'
          );
          setProcessedPosts(prev => new Set(prev).add(postKey));
        }
        
        // Check for posts that should auto-fail (10 minutes after scheduled time)
        const tenMinutesAfter = new Date(new Date(post.scheduledFor).getTime() + 10 * 60 * 1000);
        const autoFailKey = `${post.id}-auto-fail`;
        if (post.status === 'scheduled' && now >= tenMinutesAfter && !processedPosts.has(autoFailKey)) {
          // Auto-fail the post
          db.updatePost(parseInt(post.id), { 
            status: 'failed', 
            error: 'Post failed to publish automatically after 10 minutes' 
          });
          
          // Add failure notification to inbox
          addNotification(
            `Post automatically failed after 10 minutes: "${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}"`,
            'failed'
          );
          
          setProcessedPosts(prev => new Set(prev).add(autoFailKey));
          
          // Reload posts to reflect the status change
          loadUserPosts();
        }
        
        // Check for manually failed posts (show notification)
        const failedKey = `${post.id}-failed`;
        if (post.status === 'failed' && !processedPosts.has(failedKey) && !processedPosts.has(`${post.id}-auto-fail`)) {
          // Show notification for manually failed post (not auto-failed)
          addNotification(
            `Post failed to publish: "${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}"`,
            'failed'
          );
          setProcessedPosts(prev => new Set(prev).add(failedKey));
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, posts, processedPosts]);

  useEffect(() => {
  }, []);

  const createPost = async (content: string, scheduledFor: Date, image?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create post in database
    const postId = db.createPost(
      user.id,
      content,
      image || null,
      scheduledFor.toISOString()
    );
    
    // Reload posts to get updated data
    loadUserPosts();
    setIsLoading(false);
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update in database
    const dbUpdates: any = {};
    if (updates.content) dbUpdates.content = updates.content;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.scheduledFor) dbUpdates.scheduledFor = updates.scheduledFor.toISOString();
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.error !== undefined) dbUpdates.error = updates.error;
    
    db.updatePost(parseInt(id), dbUpdates);
    
    // Reload posts
    loadUserPosts();
    setIsLoading(false);
  };

  const updatePostStatus = async (id: string, status: 'scheduled' | 'posted' | 'failed') => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update status in database
    db.updatePost(parseInt(id), { status, error: null });
    
    // Reload posts
    loadUserPosts();
    setIsLoading(false);
  };

  const deletePost = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Delete from database
    db.deletePost(parseInt(id), user.id);
    
    // Reload posts
    loadUserPosts();
    setIsLoading(false);
  };

  const retryPost = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update post to retry
    const newScheduledTime = addMinutes(new Date(), 1);
    db.updatePost(parseInt(id), {
      status: 'scheduled',
      scheduledFor: newScheduledTime.toISOString(),
      error: null
    });
    
    // Reload posts
    loadUserPosts();
    setIsLoading(false);
  };

  const markNotificationAsRead = (id: string) => {
    setInboxNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setInboxNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setInboxNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  return (
    <>
      <PostContext.Provider value={{
        posts,
        inboxNotifications,
        createPost,
        updatePost,
        updatePostStatus,
        deletePost,
        retryPost,
        isLoading,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification
      }}>
        {children}
      </PostContext.Provider>
      
      {/* Render notifications */}
      {notifications.map(notification => (
        <NotificationPopup
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};