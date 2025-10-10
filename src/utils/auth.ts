import { createClient } from './supabase/client';
import { createUserProfile, getUserProfile, type UserProfile } from './api';

export interface AuthResult {
  success: boolean;
  user?: any;
  profile?: UserProfile;
  error?: string;
}

// Регистрация с email/password
export async function signUpWithEmail(
  email: string, 
  password: string, 
  userData: {
    name: string;
    diaryName?: string;
    diaryEmoji?: string;
    language?: string;
    notificationSettings?: any;
  }
): Promise<AuthResult> {
  try {
    const supabase = createClient();
    
    // Регистрация в Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create user' };
    }

    console.log('User created:', data.user.id);

    // Создаем профиль пользователя
    const profile = await createUserProfile({
      id: data.user.id,
      email: data.user.email!,
      name: userData.name,
      diaryName: userData.diaryName || 'Мой дневник',
      diaryEmoji: userData.diaryEmoji || '🏆',
      language: userData.language || 'ru',
      notificationSettings: userData.notificationSettings || {
        selectedTime: 'none',
        morningTime: '08:00',
        eveningTime: '21:00',
        permissionGranted: false
      },
      onboardingCompleted: false // Новый пользователь должен пройти онбординг
    });

    console.log('Profile created:', profile);

    return {
      success: true,
      user: data.user,
      profile
    };

  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Вход с email/password
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to sign in' };
    }

    console.log('User signed in:', data.user.id);

    // Загружаем профиль
    const profile = await getUserProfile(data.user.id);

    return {
      success: true,
      user: data.user,
      profile: profile || undefined
    };

  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Вход через Google
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }

    // OAuth redirect - вернется на страницу после авторизации
    return { success: true };

  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Вход через Facebook
export async function signInWithFacebook(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Facebook sign in error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error: any) {
    console.error('Facebook sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Вход через Apple
export async function signInWithApple(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Apple sign in error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error: any) {
    console.error('Apple sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Выход
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// Проверка сессии и загрузка профиля
export async function checkSession(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return { success: false };
    }

    console.log('Session found for user:', session.user.id);

    // Загружаем профиль
    let profile = await getUserProfile(session.user.id);

    // Если профиля нет, создаем базовый
    if (!profile) {
      console.log('Profile not found, creating new profile for:', session.user.id);
      
      try {
        const newProfile = await createUserProfile({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Пользователь',
          diaryName: 'Мой дневник',
          diaryEmoji: '🏆',
          language: 'ru',
          notificationSettings: {
            selectedTime: 'none',
            morningTime: '08:00',
            eveningTime: '21:00',
            permissionGranted: false
          },
          onboardingCompleted: false // Новый пользователь должен пройти онбординг
        });

        console.log('Profile created successfully:', newProfile);
        profile = newProfile;
      } catch (createError: any) {
        console.error('Error creating profile:', createError);
        // Возвращаем минимальный профиль в случае ошибки
        profile = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || 'Пользователь',
          diaryName: 'Мой дневник',
          diaryEmoji: '🏆',
          language: 'ru',
          notificationSettings: {
            selectedTime: 'none',
            morningTime: '08:00',
            eveningTime: '21:00',
            permissionGranted: false
          },
          onboardingCompleted: false
        };
      }
    }

    return {
      success: true,
      user: session.user,
      profile
    };

  } catch (error: any) {
    console.error('Session check error:', error);
    return { success: false, error: error.message };
  }
}
