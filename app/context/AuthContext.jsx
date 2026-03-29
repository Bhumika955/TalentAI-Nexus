"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("hireapp_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem("hireapp_users") || "[]");
    const exists = users.find((u) => u.email === email);
    if (exists) return { error: "Email already registered" };

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("hireapp_users", JSON.stringify(users));
    localStorage.setItem("hireapp_user", JSON.stringify({ name, email }));
    setUser({ name, email });
    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("hireapp_users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { error: "Invalid email or password" };

    localStorage.setItem("hireapp_user", JSON.stringify({ name: found.name, email }));
    setUser({ name: found.name, email });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("hireapp_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}