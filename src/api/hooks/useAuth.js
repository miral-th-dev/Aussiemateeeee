import { useEffect } from 'react';
import { useAuth as useSharedAuth } from '../../context/AuthContext';

/**
 * Backwards compatible version of useAuth that uses AuthProvider state
 */
export const useAuth = () => {
  const auth = useSharedAuth();
  
  return {
    ...auth,
    updateProfile: auth.updateProfile, // Map name if needed, but Context already uses updateProfile
  };
};

/**
 * Helper to init auth on mount
 */
export const useAuthInit = (refreshProfile) => {
  useEffect(() => {
    refreshProfile?.().catch(() => {});
  }, [refreshProfile]);
};
