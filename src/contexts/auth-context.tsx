'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await fetch('/api/auth/me', {
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                        setToken(storedToken);
                    } else {
                        // Invalid token, clear it
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    const login = async (newToken: string) => {
        // Store token
        localStorage.setItem('token', newToken);
        setToken(newToken);

        // Fetch user data
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${newToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token, // Check token, not user! User can be null even when authenticated
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
