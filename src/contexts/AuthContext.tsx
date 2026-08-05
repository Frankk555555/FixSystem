"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type RepairDepartment = Database["public"]["Enums"]["repair_department"];

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  person_code: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: AppRole[];
  currentRole: AppRole;
  department: RepairDepartment | null;
  loading: boolean;
  isTechnician: boolean;
  isAdmin: boolean;
  isUser: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: AppRole }>;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    person_code: string;
    role?: AppRole;
  }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name: string; phone: string; person_code: string }) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getDepartmentFromRole(role: AppRole): RepairDepartment | null {
  if (role === "technician_electric") return "electric";
  if (role === "technician_plumbing") return "plumbing";
  if (role === "technician_general") return "general";
  return null;
}

export function getRoleLabel(role: AppRole): string {
  switch (role) {
    case "technician_electric":
      return "ช่างแผนกไฟฟ้า ⚡";
    case "technician_plumbing":
      return "ช่างแผนกประปา 💧";
    case "technician_general":
      return "ช่างแผนกซ่อมสร้าง 🔨";
    case "admin":
      return "ผู้ดูแลระบบ 🛡️";
    case "user":
    default:
      return "ผู้ใช้งานทั่วไป 👤";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [currentRole, setCurrentRole] = useState<AppRole>("user");
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string, userEmail?: string): Promise<AppRole> => {
    let resolvedRole: AppRole = "user";
    try {
      // 1. Fetch profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email, person_code")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      } else if (!profileErr) {
        // Create initial fallback profile object if none
        setProfile({
          id: userId,
          email: userEmail || "",
          full_name: "",
          phone: "",
          person_code: "",
        });
      }

      // 2. Fetch roles
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (roleRows && roleRows.length > 0) {
        const fetchedRoles = roleRows.map((r) => r.role as AppRole);
        setRoles(fetchedRoles);
        // Priority: admin > technician_* > user
        const preferred = fetchedRoles.find((r) => r === "admin") || 
                          fetchedRoles.find((r) => r.startsWith("technician_")) || 
                          fetchedRoles[0];
        resolvedRole = preferred;
        setCurrentRole(preferred);
      } else {
        setRoles(["user"]);
        setCurrentRole("user");
        resolvedRole = "user";
      }
    } catch (err) {
      console.error("[Auth] Error fetching user data:", err);
    }
    return resolvedRole;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserData(user.id, user.email);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (initSession?.user) {
          setSession(initSession);
          setUser(initSession.user);
          await fetchUserData(initSession.user.id, initSession.user.email);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRoles([]);
          setCurrentRole("user");
        }
      } catch (err) {
        console.error("[Auth] Init session error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchUserData(newSession.user.id, newSession.user.email);
        } else {
          setProfile(null);
          setRoles([]);
          setCurrentRole("user");
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const signIn = async (email: string, pass: string): Promise<{ error: Error | null; role?: AppRole }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });
      if (error) return { error };

      let userRole: AppRole = "user";
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        userRole = await fetchUserData(data.user.id, data.user.email);
      }
      return { error: null, role: userRole };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    person_code: string;
    role?: AppRole;
  }) => {
    try {
      const roleToAssign: AppRole = data.role || "user";
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            phone: data.phone.trim(),
            person_code: data.person_code.trim(),
          },
        },
      });

      if (error) return { error };

      if (authData.user) {
        const userId = authData.user.id;

        // Upsert profile in case trigger had not populated it
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          person_code: data.person_code.trim(),
        });

        // Insert selected role if different from default 'user'
        if (roleToAssign !== "user") {
          await supabase.from("user_roles").upsert({
            user_id: userId,
            role: roleToAssign,
          });
        }

        await fetchUserData(userId, data.email);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setCurrentRole("user");
  };

  const updateProfile = async (data: { full_name: string; phone: string; person_code: string }) => {
    if (!user) return { error: new Error("ไม่ได้เข้าสู่ระบบ") };
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          person_code: data.person_code.trim(),
        })
        .eq("id", user.id);

      if (error) return { error };

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: data.full_name.trim(),
              phone: data.phone.trim(),
              person_code: data.person_code.trim(),
            }
          : null
      );
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const department = getDepartmentFromRole(currentRole);
  const isTechnician = currentRole.startsWith("technician_");
  const isAdmin = currentRole === "admin";
  const isUser = currentRole === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        currentRole,
        department,
        loading,
        isTechnician,
        isAdmin,
        isUser,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
