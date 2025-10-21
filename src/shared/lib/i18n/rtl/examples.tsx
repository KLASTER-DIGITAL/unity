/**
 * RTL Examples
 * 
 * Real-world examples of RTL support in UNITY-v2 components
 */

import React from 'react';
import { useTranslation } from '../useTranslation';
import { useRTL, RTLDiv, RTLText } from './RTLProvider';
import { ChevronRight, Search, X, ArrowLeft, Settings } from 'lucide-react';

/**
 * Example 1: Navigation Menu with RTL
 */
export function ExampleNavigation() {
  const { t } = useTranslation();
  
  return (
    <nav dir={t.direction} className="bg-white border-b">
      <ul className="flex p-4">
        <li className="me-4">
          <a href="#" className="text-blue-600">{t('nav.home', 'Home')}</a>
        </li>
        <li className="me-4">
          <a href="#" className="text-gray-600">{t('nav.history', 'History')}</a>
        </li>
        <li className="me-4">
          <a href="#" className="text-gray-600">{t('nav.achievements', 'Achievements')}</a>
        </li>
        <li>
          <a href="#" className="text-gray-600">{t('nav.settings', 'Settings')}</a>
        </li>
      </ul>
    </nav>
  );
}

/**
 * Example 2: Card Layout with Image
 */
export function ExampleCard({ 
  image, 
  title, 
  description 
}: { 
  image: string; 
  title: string; 
  description: string;
}) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow p-4" dir={t.direction}>
      <div className="flex gap-4">
        <img 
          src={image} 
          alt={title}
          className="w-20 h-20 rounded object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-start">{title}</h3>
          <p className="text-sm text-gray-600 text-start">{description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Search Input with Icon
 */
export function ExampleSearchInput() {
  const { t } = useTranslation();
  
  return (
    <div className="relative" dir={t.direction}>
      <input
        type="text"
        placeholder={t('search.placeholder', 'Search...')}
        className="w-full ps-10 pe-4 py-2 border rounded-lg"
      />
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}

/**
 * Example 4: Modal with Close Button
 */
export function ExampleModal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full" dir={t.direction}>
        <div className="relative p-6 border-b">
          <h2 className="text-xl font-semibold text-start">{title}</h2>
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 5: Breadcrumbs
 */
export function ExampleBreadcrumbs({ 
  items 
}: { 
  items: Array<{ label: string; href?: string }> 
}) {
  const { t } = useTranslation();
  
  return (
    <nav className="flex items-center gap-2" dir={t.direction}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <a href={item.href} className="text-blue-600 hover:underline">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="icon-mirror w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Example 6: Entry Card with Actions
 */
export function ExampleEntryCard({ 
  entry 
}: { 
  entry: {
    text: string;
    created_at: string;
    category: string;
  }
}) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow p-4" dir={t.direction}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500">
          {t.formatRelativeTime(entry.created_at)}
        </span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {entry.category}
        </span>
      </div>
      <p className="text-start">{entry.text}</p>
      <div className="flex gap-2 mt-4">
        <button className="text-sm text-blue-600 hover:underline">
          {t('entry.edit', 'Edit')}
        </button>
        <button className="text-sm text-red-600 hover:underline">
          {t('entry.delete', 'Delete')}
        </button>
      </div>
    </div>
  );
}

/**
 * Example 7: Settings List
 */
export function ExampleSettingsList() {
  const { t } = useTranslation();
  
  const settings = [
    { icon: Settings, label: t('settings.general', 'General'), href: '#' },
    { icon: Settings, label: t('settings.notifications', 'Notifications'), href: '#' },
    { icon: Settings, label: t('settings.privacy', 'Privacy'), href: '#' },
    { icon: Settings, label: t('settings.language', 'Language'), href: '#' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow" dir={t.direction}>
      {settings.map((setting, index) => (
        <a
          key={index}
          href={setting.href}
          className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b last:border-b-0"
        >
          <setting.icon className="w-5 h-5 text-gray-600" />
          <span className="flex-1 text-start">{setting.label}</span>
          <ChevronRight className="icon-mirror w-5 h-5 text-gray-400" />
        </a>
      ))}
    </div>
  );
}

/**
 * Example 8: Achievement Badge
 */
export function ExampleAchievementBadge({
  title,
  description,
  progress,
  total
}: {
  title: string;
  description: string;
  progress: number;
  total: number;
}) {
  const { t } = useTranslation();
  const percentage = (progress / total) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow p-4" dir={t.direction}>
      <h3 className="text-lg font-semibold text-start mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-start mb-4">{description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {t('achievement.progress', 'Progress')}
          </span>
          <span className="font-semibold">
            {progress} / {total}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 9: Language Switcher with RTL Indicator
 */
export function ExampleLanguageSwitcher() {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', isRTL: false },
    { code: 'ru', name: 'Русский', isRTL: false },
    { code: 'ar', name: 'العربية', isRTL: true },
    { code: 'he', name: 'עברית', isRTL: true }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-4" dir={t.direction}>
      <h3 className="text-lg font-semibold text-start mb-4">
        {t('settings.language', 'Language')}
      </h3>
      
      <div className="space-y-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              w-full flex items-center justify-between p-3 rounded-lg border
              ${currentLanguage === lang.code ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
              hover:bg-gray-50
            `}
          >
            <span className="text-start">{lang.name}</span>
            {lang.isRTL && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                RTL
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 10: RTL Text Detection
 */
export function ExampleRTLTextDetection() {
  const { t } = useTranslation();
  
  const texts = [
    { text: 'Hello World', expected: 'LTR' },
    { text: 'مرحبا بالعالم', expected: 'RTL' },
    { text: 'שלום עולם', expected: 'RTL' },
    { text: 'Mixed مختلط Text', expected: 'Mixed' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-4" dir={t.direction}>
      <h3 className="text-lg font-semibold text-start mb-4">
        RTL Text Detection
      </h3>
      
      <div className="space-y-3">
        {texts.map((item, index) => (
          <div key={index} className="border rounded p-3">
            <RTLText className="block mb-2">{item.text}</RTLText>
            <span className="text-xs text-gray-500">
              Expected: {item.expected}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

