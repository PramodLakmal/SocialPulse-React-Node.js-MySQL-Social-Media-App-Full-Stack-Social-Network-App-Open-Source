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
      console.log("Login function called with inputs:", inputs);
      
      const res = await axios.post("http://localhost:8800/api/auth/login", inputs, {
        withCredentials: true,
      });
      
      console.log("Login API response:", res.data);
      const userData = res.data;
      
      console.log("Setting current user:", userData);
      setCurrentUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      
      console.log("Login completed successfully");
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
      console.log("Register function called with inputs:", inputs);
      
      const res = await axios.post("http://localhost:8800/api/auth/register", inputs, {
        withCredentials: true,
      });
      
      console.log("Registration API response:", res.data);
      const userData = res.data;
      
      console.log("Setting current user after registration:", userData);
      setCurrentUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      
      console.log("Registration and auto-login completed successfully");
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
      console.log("Checking auth status...");
      const response = await axios.get("http://localhost:8800/api/auth/me", {
        withCredentials: true,
      });
      if (response.data) {
        console.log("User authenticated via cookie:", response.data.email);
        setCurrentUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      // User is not authenticated, which is fine
      console.log("User not authenticated via cookie");
      // Clear any stale localStorage data
      if (localStorage.getItem("user") && localStorage.getItem("user") !== "null") {
        console.log("Clearing stale localStorage data");
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
      console.log("Starting logout process...");
      setLoading(true);
      
      // Call backend logout endpoint
      await axios.post("http://localhost:8800/api/auth/logout", {}, {
        withCredentials: true,
      });
      
      console.log("Backend logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if backend call fails
    } finally {
      // Clear user state and localStorage regardless of backend response
      console.log("Clearing user state and localStorage...");
      setCurrentUser(null);
      localStorage.removeItem("user");
      setLoading(false);
      console.log("Logout process completed");
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
    console.log("App initializing, stored user:", storedUser ? "Present" : "None");
    
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
