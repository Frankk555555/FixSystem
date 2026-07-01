// โหมด mock: เก็บบทบาทปัจจุบันใน localStorage เพื่อสลับ User / Technician / Admin
import { useEffect, useState } from "react";

export type Role = "user" | "technician" | "admin";
const KEY = "mock-role";

export function getRole(): Role {
  if (typeof window === "undefined") return "user";
  const v = window.localStorage.getItem(KEY);
  if (v === "technician") return "technician";
  if (v === "admin") return "admin";
  return "user";
}

export function setRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
  window.dispatchEvent(new CustomEvent("mock-role-change", { detail: role }));
}

export function useRole(): [Role, (r: Role) => void] {
  const [role, setLocal] = useState<Role>("user");
  useEffect(() => {
    setLocal(getRole());
    const onChange = () => setLocal(getRole());
    window.addEventListener("mock-role-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("mock-role-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return [role, (r) => setRole(r)];
}
