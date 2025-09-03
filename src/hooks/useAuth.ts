export interface AuthState {
  isAuthenticated: boolean;
  instanceId: string | null;
}

import { useState, useEffect } from "react";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    instanceId: null,
  });

  useEffect(() => {
    // Check localStorage on mount
    const storedInstanceId = localStorage.getItem("whatsapp_instance_id");
    if (storedInstanceId) {
      setAuthState({
        isAuthenticated: true,
        instanceId: storedInstanceId,
      });
    }
  }, []);

  const login = (instanceId: string) => {
    localStorage.setItem("whatsapp_instance_id", instanceId);
    setAuthState({
      isAuthenticated: true,
      instanceId,
    });
  };

  const logout = () => {
    localStorage.removeItem("whatsapp_instance_id");
    setAuthState({
      isAuthenticated: false,
      instanceId: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};
