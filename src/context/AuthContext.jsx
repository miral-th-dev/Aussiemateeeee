import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as loginRequest, fetchProfile, updateProfile, uploadProfilePhoto, deleteProfilePhoto } from '../api/services/authService';
import { clearAuth } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async ({ email, password, remember }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginRequest({ email, password });
      const token = 
        data?.token || 
        data?.accessToken || 
        data?.access_token ||
        data?.data?.token ||
        data?.data?.accessToken ||
        data?.auth?.token ||
        data?.result?.token;
      
      if (token) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('token', token);
      }

      const userData = data?.data?.user || data?.user;
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Login failed.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      const fetchedUser = data?.data?.user || data?.user;
      if (fetchedUser) {
        localStorage.setItem('user', JSON.stringify(fetchedUser));
        setUser(fetchedUser);
      }
      return fetchedUser;
    } catch (err) {
      setError(err?.message || 'Failed to load profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfileInfo = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateProfile(payload);
      const updatedUser = data?.data?.user || data?.user;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      setError(err?.message || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPhoto = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadProfilePhoto(file);
      const updatedUser = data?.data?.user || data?.user;
      const profilePhoto = data?.data?.profilePhoto || data?.profilePhoto;

      if (updatedUser) {
        const merged = { ...updatedUser };
        if (profilePhoto) merged.profilePhoto = profilePhoto;
        localStorage.setItem('user', JSON.stringify(merged));
        setUser(merged);
      } else if (profilePhoto && user) {
        const merged = { ...user, profilePhoto };
        localStorage.setItem('user', JSON.stringify(merged));
        setUser(merged);
      }
    } catch (err) {
      setError(err?.message || 'Failed to upload photo.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deletePhoto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteProfilePhoto();
      if (user) {
        const { profilePhoto, ...userWithoutPhoto } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPhoto));
        setUser(userWithoutPhoto);
      }
    } catch (err) {
      setError(err?.message || 'Failed to delete photo.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    refreshProfile,
    updateProfile: updateProfileInfo,
    uploadPhoto,
    deletePhoto,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
