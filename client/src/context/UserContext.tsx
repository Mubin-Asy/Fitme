import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  maxUsersLimit: number;
  switchUser: (user: User) => void;
  refreshUsers: () => Promise<void>;
  addUser: (userData: Partial<User>) => Promise<User>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const maxUsersLimit = 10;

  const refreshUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userList = await api.getUsers();
      setUsers(userList);

      const savedId = localStorage.getItem('fitme_active_user_id');
      if (savedId) {
        const found = userList.find((u) => u.id === parseInt(savedId, 10));
        if (found) {
          setCurrentUser(found);
          return;
        }
      }

      if (userList.length > 0 && !currentUser) {
        setCurrentUser(userList[0]);
        localStorage.setItem('fitme_active_user_id', userList[0].id.toString());
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load group athletes');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fitme_active_user_id', user.id.toString());
  };

  const addUser = async (userData: Partial<User>): Promise<User> => {
    if (users.length >= maxUsersLimit) {
      throw new Error(`Group capacity reached (${maxUsersLimit} athletes max).`);
    }
    const created = await api.createUser({
      ...userData,
      password: 'fitme_member_password_123',
    });
    await refreshUsers();
    switchUser(created);
    return created;
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        isLoading,
        error,
        maxUsersLimit,
        switchUser,
        refreshUsers,
        addUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
