export interface User {
    id: string;
    email: string;
    name: string;
    password?: string; // In a real app, this would be hashed. Storing plain for prototype.
    createdAt: number;
}

const USERS_KEY = "ai_novel_users";
const SESSION_KEY = "ai_novel_session";

export function getUsers(): User[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(USERS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load users", e);
        return [];
    }
}

export function saveUser(user: User): void {
    if (typeof window === "undefined") return;
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
    const users = getUsers();
    return users.find(u => u.email === email);
}

export function getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export function setCurrentUser(user: User | null): void {
    if (typeof window === "undefined") return;
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}
