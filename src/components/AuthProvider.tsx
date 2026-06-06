"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";

type AuthResult = { success: boolean; error: AuthError | null };
type SignupResult = { success: boolean; error: AuthError | null; data?: { session: Session | null } };

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    loginWithGoogle: () => Promise<void>;
    login: (email: string, password: string) => Promise<AuthResult>;
    signup: (name: string, email: string, password: string) => Promise<SignupResult>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async (userId: string, email?: string | null) => {
            const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

            if (data) {
                setProfile(data as Profile);
                return;
            }

            if (error) {
                console.error("Failed to fetch profile:", error);
            }

            setProfile({
                id: userId,
                email: email || "",
                credits: 3,
                subscription_tier: "FREE",
                subscription_status: "active",
            });
        };

        const bootstrap = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email);
            }

            setIsLoading(false);
        };

        void bootstrap();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email);
            } else {
                setProfile(null);
            }

            setIsLoading(false);

            if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, supabase]);

    const loginWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Login error:", error);
        }

        return { success: !error, error };
    };

    const signup = async (name: string, email: string, password: string): Promise<SignupResult> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            console.error("Signup error:", error);
        }

        return { success: !error, error, data: { session: data.session } };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, loginWithGoogle, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
