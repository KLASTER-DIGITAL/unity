import { useEffect } from 'react';
import { generateAllPWAIcons } from '@/shared/lib/pwa';

export function PWAHead() {
  useEffect(() => {
    // Динамически добавляем метатеги для PWA
    const meta = [
      { name: 'application-name', content: 'Дневник Достижений' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'Дневник' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#007AFF' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' }
    ];

    const links = [
      { rel: 'manifest', href: '/manifest.json' }
    ];

    // Добавляем meta теги
    meta.forEach(({ name, content }) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    });

    // Добавляем link теги
    links.forEach(({ rel, href }) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    });

    // Генерируем иконки PWA
    generateAllPWAIcons().catch(console.error);
  }, []);

  return null;
}

export default PWAHead;
