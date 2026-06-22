'use client';

import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string | null;
    companyName: string | null;
    industry: string | null;
    gmailConnected: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                // Compatibility marker while dashboard calls migrate away from
                // manually attaching Authorization headers. It contains no secret.
                setToken('cookie-session');
            } else {
                setUser(null);
                setToken(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void loadUser(); }, [loadUser]);

    const login = useCallback(async () => {
        setIsLoading(true);
        await loadUser();
    }, [loadUser]);

    const logout = useCallback(async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setToken(null);
        setUser(null);
    }, []);

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
