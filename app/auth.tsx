/**
 * Auth Screen - React Native
 *
 * Страница авторизации для React Native приложения
 * Полный parity с PWA AuthScreenNew.tsx
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../app-shared/contexts/ThemeContext';
import { DesignTokens } from '../app-shared/design-system/tokens';
import { supabase } from '../app-shared/lib/supabase/client';

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!(email && password)) {
      setError('Заполните все поля');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.session) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigate to main app
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      setError(err.message || 'Ошибка входа');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('rustam@leadshunter.biz');
    setPassword('demo123');

    // Auto login after setting credentials
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>🏆</Text>
          <Text style={[styles.title, { color: colors.text }]}>UNITY</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Дневник достижений</Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.card }]}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View
              style={[
                styles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}
            >
              <Ionicons color={colors.textSecondary} name="mail-outline" size={20} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { color: colors.text }]}
                value={email}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Пароль</Text>
            <View
              style={[
                styles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}
            >
              <Ionicons color={colors.textSecondary} name="lock-closed-outline" size={20} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: colors.text }]}
                value={password}
              />
              <Pressable
                onPress={() => {
                  setShowPassword(!showPassword);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons
                  color={colors.textSecondary}
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                />
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.error}15` }]}>
              <Ionicons color={colors.error} name="alert-circle" size={16} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <Pressable
            disabled={isLoading}
            onPress={handleLogin}
            style={[
              styles.loginButton,
              { backgroundColor: colors.primary },
              isLoading && styles.loginButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </Pressable>

          {/* Demo Button */}
          <Pressable
            disabled={isLoading}
            onPress={handleDemoLogin}
            style={[styles.demoButton, { borderColor: colors.border }]}
          >
            <Ionicons color={colors.primary} name="flash-outline" size={20} />
            <Text style={[styles.demoButtonText, { color: colors.primary }]}>
              Демо вход (Rustam)
            </Text>
          </Pressable>
        </View>

        {/* Test Accounts */}
        <View style={styles.testAccounts}>
          <Text style={[styles.testAccountsTitle, { color: colors.textSecondary }]}>
            Тестовые аккаунты:
          </Text>
          <Text style={[styles.testAccount, { color: colors.textTertiary }]}>
            • rustam@leadshunter.biz / demo123
          </Text>
          <Text style={[styles.testAccount, { color: colors.textTertiary }]}>
            • an@leadshunter.biz / demo123
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: DesignTokens.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: DesignTokens.spacing.md,
  },
  title: {
    fontSize: DesignTokens.fontSizes.h1,
    fontWeight: DesignTokens.fontWeights.bold,
    marginBottom: DesignTokens.spacing.xs,
  },
  subtitle: {
    fontSize: DesignTokens.fontSizes.body,
  },
  form: {
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing.xl,
    ...DesignTokens.shadows.md,
  },
  inputGroup: {
    marginBottom: DesignTokens.spacing.lg,
  },
  label: {
    fontSize: DesignTokens.fontSizes.bodySmall,
    fontWeight: DesignTokens.fontWeights.medium,
    marginBottom: DesignTokens.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: DesignTokens.borderRadius.lg,
    paddingHorizontal: DesignTokens.spacing.md,
    height: DesignTokens.touchTargets.comfortable,
    gap: DesignTokens.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: DesignTokens.fontSizes.body,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing.xs,
    marginBottom: DesignTokens.spacing.md,
  },
  errorText: {
    fontSize: DesignTokens.fontSizes.bodySmall,
    flex: 1,
  },
  loginButton: {
    height: DesignTokens.touchTargets.comfortable,
    borderRadius: DesignTokens.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: DesignTokens.fontSizes.body,
    fontWeight: DesignTokens.fontWeights.semibold,
  },
  demoButton: {
    height: DesignTokens.touchTargets.comfortable,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  demoButtonText: {
    fontSize: DesignTokens.fontSizes.body,
    fontWeight: DesignTokens.fontWeights.medium,
  },
  testAccounts: {
    marginTop: DesignTokens.spacing.xl,
    alignItems: 'center',
  },
  testAccountsTitle: {
    fontSize: DesignTokens.fontSizes.bodySmall,
    fontWeight: DesignTokens.fontWeights.medium,
    marginBottom: DesignTokens.spacing.xs,
  },
  testAccount: {
    fontSize: DesignTokens.fontSizes.bodySmall,
    marginTop: DesignTokens.spacing.xxs,
  },
});
