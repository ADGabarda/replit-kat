import { db, User } from './database';

// Simple password hashing (in production, use bcrypt)
export function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

export function validatePassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

export function registerUser(username: string, password: string, name: string, role: 'admin' | 'user' = 'user'): User {
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  if (!name || name.trim().length === 0) {
    throw new Error('Name is required');
  }

  const hashedPassword = hashPassword(password);
  return db.createUser(username, hashedPassword, name, role);
}

export function loginUser(username: string, password: string): User {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  const user = db.getUserByUsername(username);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  if (!validatePassword(password, user.password)) {
    throw new Error('Invalid username or password');
  }

  return user;
}

export function changeUserPassword(userId: number, currentPassword: string, newPassword: string): boolean {
  const user = db.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!validatePassword(currentPassword, user.password)) {
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const hashedNewPassword = hashPassword(newPassword);
  db.updateUser(userId, { password: hashedNewPassword });
  
  return true;
}