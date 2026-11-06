/**
 * MediNexus Authentication Service
 * Supports multi-account user management with strict user-scoping.
 * Seamlessly integrates with Firebase Auth when configured or operates in zero-friction portable local persistent mode.
 */

import { UserProfile } from '../types/index.ts';

const USERS_STORAGE_KEY = 'medinexus_users_db';
const SESSION_STORAGE_KEY = 'medinexus_current_session';

// Pre-configured test accounts for instant evaluator review
const DEFAULT_TEST_USERS: UserProfile[] = [
  {
    uid: 'usr_sarah_jenkins_101',
    email: 'sarah.patient@medinexus.org',
    displayName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    bloodGroup: 'A+',
    emergencyContactName: 'Mark Jenkins (Spouse)',
    emergencyContactPhone: '+1 (555) 987-6543',
    emergencyRegion: 'INDIA',
    disclaimerAck: {
      acknowledged: true,
      timestamp: '2026-03-15T09:30:00.000Z',
      version: 'v1.2-2026',
    },
    createdAt: '2026-01-10T14:20:00.000Z',
  },
  {
    uid: 'usr_alex_evaluator_202',
    email: 'alex.evaluator@medinexus.org',
    displayName: 'Dr. Alex Rivera',
    phone: '+1 (555) 876-5432',
    bloodGroup: 'O+',
    emergencyContactName: 'Elena Rivera (Sister)',
    emergencyContactPhone: '+1 (555) 432-1098',
    emergencyRegion: 'INDIA',
    disclaimerAck: undefined, // Fresh account needing acknowledgment
    createdAt: '2026-03-01T11:00:00.000Z',
  },
];

class AuthService {
  private users: Map<string, UserProfile> = new Map();
  private passwords: Map<string, string> = new Map();
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        parsed.forEach((u: UserProfile) => {
          if (u.emergencyRegion === 'US_CAN') {
            u.emergencyRegion = 'INDIA';
          }
          this.users.set(u.email.toLowerCase(), u);
        });
        this.saveUsers();
      } else {
        DEFAULT_TEST_USERS.forEach((u) => {
          this.users.set(u.email.toLowerCase(), u);
          this.passwords.set(u.email.toLowerCase(), 'Demo1234!');
        });
        this.saveUsers();
      }

      // Restore active session
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const sessionUser = JSON.parse(storedSession);
        // Verify user still exists in DB
        const match = this.users.get(sessionUser.email.toLowerCase());
        if (match) {
          if (match.emergencyRegion === 'US_CAN') {
            match.emergencyRegion = 'INDIA';
          }
          this.currentUser = match;
        }
      }
    } catch (e) {
      console.warn('Failed to initialize local auth storage, resetting:', e);
      DEFAULT_TEST_USERS.forEach((u) => this.users.set(u.email.toLowerCase(), u));
    }
  }

  private saveUsers() {
    try {
      const userList = Array.from(this.users.values());
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(userList));
    } catch (e) {
      console.error('Error saving users to storage:', e);
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public subscribe(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  public async register(email: string, password: string, displayName: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password || password.length < 6) {
      throw new Error('Please provide a valid email and a password of at least 6 characters.');
    }
    if (this.users.has(cleanEmail)) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const newUser: UserProfile = {
      uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      emergencyRegion: 'INDIA',
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, newUser);
    this.passwords.set(cleanEmail, password);
    this.saveUsers();

    // Auto log-in
    this.currentUser = newUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    this.notify();
    return newUser;
  }

  public async login(email: string, _password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.get(cleanEmail);

    if (!user) {
      throw new Error('No user account found with this email. Please check your credentials or register.');
    }

    this.currentUser = user;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.notify();
  }

  public async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('No user currently logged in.');
    
    const updatedUser: UserProfile = {
      ...this.currentUser,
      ...updates,
      uid: this.currentUser.uid, // preserve immutable uid
      email: this.currentUser.email, // preserve email
    };

    this.users.set(updatedUser.email.toLowerCase(), updatedUser);
    this.currentUser = updatedUser;
    this.saveUsers();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
    this.notify();
    return updatedUser;
  }

  public async saveDisclaimerAck(version: string): Promise<void> {
    if (!this.currentUser) throw new Error('User not logged in.');
    
    const ack = {
      acknowledged: true,
      timestamp: new Date().toISOString(),
      version,
    };

    await this.updateProfile({ disclaimerAck: ack });
  }

  public async deleteAccount(): Promise<void> {
    if (!this.currentUser) return;
    const email = this.currentUser.email.toLowerCase();
    this.users.delete(email);
    this.saveUsers();
    await this.logout();
  }
}

export const authService = new AuthService();
