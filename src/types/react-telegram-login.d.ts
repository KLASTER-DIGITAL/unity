declare module 'react-telegram-login' {
  import { ComponentType } from 'react';

  export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }

  export interface TelegramLoginButtonProps {
    botName: string;
    dataOnauth: (user: TelegramUser) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: string;
    usePic?: boolean;
    lang?: string;
  }

  const TelegramLoginButton: ComponentType<TelegramLoginButtonProps>;
  export default TelegramLoginButton;
}

