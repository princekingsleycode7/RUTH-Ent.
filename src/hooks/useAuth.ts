
// src/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "123456";
const ADMIN_SESSION_KEY = 'swiftcheck_admin_session';

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // To check initial localStorage state

  useEffect(() => {
    // Check localStorage for persisted admin session on mount
    try {
      const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (adminSession === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      // localStorage might not be available (e.g. SSR, private browsing)
      console.warn("localStorage not available for auth session check.");
    }
    setIsAuthLoading(false);
  }, []);

  const loginAdmin = useCallback((pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch (error) {
         console.warn("localStorage not available for setting auth session.");
      }
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (error) {
      console.warn("localStorage not available for removing auth session.");
    }
    setIsAdmin(false);
  }, []);
  
  // For now, all users are considered "authenticated" for basic app access like scanning.
  // This can be expanded for more granular user roles if needed.
  const isAuthenticated = true; 

  return { isAdmin, isAuthenticated, loginAdmin, logoutAdmin, isAuthLoading };
};
