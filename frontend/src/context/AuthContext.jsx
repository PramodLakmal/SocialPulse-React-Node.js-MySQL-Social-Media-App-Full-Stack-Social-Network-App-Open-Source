import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthContextProvider = ({ children }) => {
  
    const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true); // Start with loading true
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const login = async (inputs) => {
    try {
      setLoading(true);
      
      const res = await axios.post("http://localhost:8800/api/auth/login", inputs, {
        withCredentials: true,
      });
      
      const userData = res.data;
      
      setCurrentUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      
      return userData;
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      setLoading(false);
      throw error;
    }
  };

  const register = async (inputs) => {
    try {
      setLoading(true);
      
      const res = await axios.post("http://localhost:8800/api/auth/register", inputs, {
        withCredentials: true,
      });
      
      const userData = res.data;
      
      setCurrentUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      
      return userData;
    } catch (error) {
      console.error("Registration error in AuthContext:", error);
      setLoading(false);
      throw error;
    }
  };

  // Check if user is already logged in via OAuth on page load
  const checkAuthStatus = async () => {
    if (initialCheckDone && (loading || currentUser)) return; // Don't check if already done or loading
    
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8800/api/auth/me", {
        withCredentials: true,
      });
      if (response.data) {
        setCurrentUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      // User is not authenticated, which is fine
      // Clear any stale localStorage data
      if (localStorage.getItem("user") && localStorage.getItem("user") !== "null") {
        localStorage.removeItem("user");
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Call backend logout endpoint
      await axios.post("http://localhost:8800/api/auth/logout", {}, {
        withCredentials: true,
      });
      
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if backend call fails
    } finally {
      // Clear user state and localStorage regardless of backend response
      setCurrentUser(null);
      localStorage.removeItem("user");
      setLoading(false);
    }
  };

  // Update localStorage when currentUser changes, but avoid infinite loops
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  // Check auth status on app initialization - only once
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser && storedUser !== "null") {
      // User exists in localStorage, set loading to false immediately
      setLoading(false);
      setInitialCheckDone(true);
    } else {
      // No stored user, check with server
      checkAuthStatus();
    }
  }, []); // Empty dependency array - run only once

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, setCurrentUser, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
