export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: "admin" | "user";
  plan: "free" | "pro";
  postsLimit: number;
  postsUsed: number;
  createdAt: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  image: string | null;
  scheduledFor: string;
  status: string;
  error: string | null;
  createdAt: string;
}

class DatabaseManager {
  private storageKey = "postpilot_db";

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    const existingData = localStorage.getItem(this.storageKey);

    if (!existingData) {
      // Only create initial data if none exists
      const initialData = {
        users: [],
        posts: [],
        nextUserId: 1,
        nextPostId: 1,
      };

      // Create default admin account
      const defaultAdmin = {
        id: 1,
        username: "admin",
        password: this.hashPassword("admin123"),
        name: "System Administrator",
        role: "admin",
        plan: "pro",
        postsLimit: 999999,
        postsUsed: 0,
        createdAt: new Date().toISOString(),
      };

      initialData.users.push(defaultAdmin);
      initialData.nextUserId = 2;

      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  private getData() {
    const data = localStorage.getItem(this.storageKey);
    return data
      ? JSON.parse(data)
      : { users: [], posts: [], nextUserId: 1, nextPostId: 1 };
  }

  private hashPassword(password: string): string {
    // Simple hash for demo purposes
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // Method to decrypt password (for admin use)

  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // User operations
  createUser(
    username: string,
    password: string,
    name: string,
    role: "admin" | "user" = "user"
  ): User {
    const data = this.getData();

    // Check if username already exists
    const existingUser = data.users.find(
      (user: User) => user.username === username
    );
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const newUser: User = {
      id: data.nextUserId,
      username,
      password,
      name,
      role,
      plan: "free",
      postsLimit: 999999,
      postsUsed: 0,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    data.nextUserId++;
    this.saveData(data);

    return newUser;
  }

  getUserByUsername(username: string): User | null {
    const data = this.getData();
    return data.users.find((user: User) => user.username === username) || null;
  }

  getUserById(id: number): User | null {
    const data = this.getData();
    return data.users.find((user: User) => user.id === id) || null;
  }

  // New method to change user password (for admin)
  changeUserPassword(userId: number, newPassword: string): boolean {
    const data = this.getData();
    const userIndex = data.users.findIndex((user: User) => user.id === userId);

    if (userIndex === -1) return false;

    data.users[userIndex].password = this.hashPassword(newPassword);
    this.saveData(data);
    return true;
  }

  getAllUsers(): User[] {
    const data = this.getData();
    return data.users;
  }

  updateUser(id: number, updates: any): User | null {
    const data = this.getData();
    const userIndex = data.users.findIndex((user: User) => user.id === id);

    if (userIndex === -1) return null;

    // Only update fields that are provided
    const allowedFields = ["name", "role", "plan", "postsLimit"];
    const filteredUpdates: Partial<User> = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (filteredUpdates as any)[field] = updates[field];
      }
    });

    data.users[userIndex] = { ...data.users[userIndex], ...filteredUpdates };
    this.saveData(data);

    return data.users[userIndex];
  }

  // Post operations
  createPost(
    userId: number,
    content: string,
    image: string | null,
    scheduledFor: string
  ) {
    const data = this.getData();

    const newPost: Post = {
      id: data.nextPostId,
      userId,
      content,
      image,
      scheduledFor,
      status: "scheduled",
      error: null,
      createdAt: new Date().toISOString(),
    };

    data.posts.push(newPost);
    data.nextPostId++;

    // Update user's posts count
    const userIndex = data.users.findIndex((user: User) => user.id === userId);
    if (userIndex !== -1) {
      data.users[userIndex].postsUsed++;
    }

    this.saveData(data);
    return newPost.id;
  }

  getPostsByUserId(userId: number): Post[] {
    const data = this.getData();
    return data.posts
      .filter((post: Post) => post.userId === userId)
      .sort(
        (a: Post, b: Post) =>
          new Date(b.scheduledFor).getTime() -
          new Date(a.scheduledFor).getTime()
      );
  }

  updatePost(id: number, updates: Partial<Post>) {
    const data = this.getData();
    const postIndex = data.posts.findIndex((post: Post) => post.id === id);

    if (postIndex === -1) return false;

    data.posts[postIndex] = { ...data.posts[postIndex], ...updates };
    this.saveData(data);
    return true;
  }

  deletePost(id: number, userId: number): boolean {
    const data = this.getData();
    const postIndex = data.posts.findIndex(
      (post: Post) => post.id === id && post.userId === userId
    );

    if (postIndex === -1) return false;

    data.posts.splice(postIndex, 1);

    // Decrease user's posts count
    const userIndex = data.users.findIndex((user: User) => user.id === userId);
    if (userIndex !== -1 && data.users[userIndex].postsUsed > 0) {
      data.users[userIndex].postsUsed--;
    }

    this.saveData(data);
    return true;
  }

  getScheduledPosts(): Post[] {
    const data = this.getData();
    const now = new Date();
    return data.posts.filter(
      (post: Post) =>
        post.status === "scheduled" && new Date(post.scheduledFor) <= now
    );
  }

  close() {
    // No-op for localStorage implementation
  }
}

export const db = new DatabaseManager();
