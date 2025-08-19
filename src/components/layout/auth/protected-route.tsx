// components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AlreadyLoggedInModal } from "./loggedin-modal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires auth, false = blocks if authenticated
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/",
}) => {
  const { isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Show modal instead of redirecting immediately
    return <AlreadyLoggedInModal />;
  }

  return <>{children}</>;
};
