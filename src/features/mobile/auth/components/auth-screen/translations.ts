/**
 * Translations for AuthScreen
 */

export const authTranslations = {
  ru: {
    signIn: 'Войти',
    signUp: 'Регистрация',
    signInWith: 'Войти через',
    signUpWith: 'Регистрация через',
    yourEmail: 'Ваш email',
    yourName: 'Ваше имя',
    password: 'Пароль',
    welcomeBack: 'Добро пожаловать!',
    createAccount: 'Создать аккаунт',
    notRegisteredYet: 'Еще не зарегистрированы?',
    alreadyHaveAccountAuth: 'Уже есть аккаунт?',
    back: 'Назад'
  },
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signInWith: 'Sign in with',
    signUpWith: 'Sign up with',
    yourEmail: 'Your email',
    yourName: 'Your name',
    password: 'Password',
    welcomeBack: 'Welcome back!',
    createAccount: 'Create account',
    notRegisteredYet: 'Not registered yet?',
    alreadyHaveAccountAuth: 'Already have an account?',
    back: 'Back'
  },
  es: {
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    signInWith: 'Iniciar sesión con',
    signUpWith: 'Registrarse con',
    yourEmail: 'Tu email',
    yourName: 'Tu nombre',
    password: 'Contraseña',
    welcomeBack: '¡Bienvenido de vuelta!',
    createAccount: 'Crear cuenta',
    notRegisteredYet: '¿Aún no registrado?',
    alreadyHaveAccountAuth: '¿Ya tienes cuenta?',
    back: 'Atrás'
  },
  de: {
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    signInWith: 'Anmelden mit',
    signUpWith: 'Registrieren mit',
    yourEmail: 'Deine E-Mail',
    yourName: 'Dein Name',
    password: 'Passwort',
    welcomeBack: 'Willkommen zurück!',
    createAccount: 'Konto erstellen',
    notRegisteredYet: 'Noch nicht registriert?',
    alreadyHaveAccountAuth: 'Bereits ein Konto?',
    back: 'Zurück'
  },
  fr: {
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    signInWith: 'Se connecter avec',
    signUpWith: 'S\'inscrire avec',
    yourEmail: 'Ton email',
    yourName: 'Ton nom',
    password: 'Mot de passe',
    welcomeBack: 'Bon retour !',
    createAccount: 'Créer un compte',
    notRegisteredYet: 'Pas encore inscrit ?',
    alreadyHaveAccountAuth: 'Déjà un compte ?',
    back: 'Retour'
  },
  zh: {
    signIn: '登录',
    signUp: '注册',
    signInWith: '使用以下方式登录',
    signUpWith: '使用以下方式注册',
    yourEmail: '你的邮箱',
    yourName: '你的姓名',
    password: '密码',
    welcomeBack: '欢迎回来！',
    createAccount: '创建账户',
    notRegisteredYet: '还没有注册？',
    alreadyHaveAccountAuth: '已经有账户了？',
    back: '返回'
  },
  ja: {
    signIn: 'サインイン',
    signUp: 'サインアップ',
    signInWith: 'でサインイン',
    signUpWith: 'でサインアップ',
    yourEmail: 'あなたのメール',
    yourName: 'あなたの名前',
    password: 'パスワード',
    welcomeBack: 'おかえりなさい！',
    createAccount: 'アカウントを作成',
    notRegisteredYet: 'まだ登録していませんか？',
    alreadyHaveAccountAuth: 'すでにアカウントをお持ちですか？',
    back: '戻る'
  }
};

export type AuthTranslations = typeof authTranslations.ru;
export type SupportedLanguage = keyof typeof authTranslations;

