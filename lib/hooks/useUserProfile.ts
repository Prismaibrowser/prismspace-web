import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserProfile } from '../db';

export function useUserProfile() {
  const profile = useLiveQuery(async () => {
    let current = await db.user_profile.get('current');
    
    if (!current) {
      // Create default profile
      const now = new Date();
      const defaultProfile: UserProfile = {
        key: 'current',
        username: 'User',
        avatar: '👤',
        createdAt: now,
        updatedAt: now,
      };
      await db.user_profile.put(defaultProfile);
      current = defaultProfile;
    }
    
    return current;
  });

  const updateUsername = async (username: string) => {
    await db.user_profile.update('current', {
      username,
      updatedAt: new Date(),
    });
  };

  const updateAvatar = async (avatar: string) => {
    await db.user_profile.update('current', {
      avatar,
      updatedAt: new Date(),
    });
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'key' | 'createdAt'>>) => {
    await db.user_profile.update('current', {
      ...updates,
      updatedAt: new Date(),
    });
  };

  return {
    profile,
    updateUsername,
    updateAvatar,
    updateProfile,
  };
}
