import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Gift, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  currentPage, 
  onNavigate 
}) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', icon: Home, label: t('nav.dashboard') },
    { id: 'gifts', icon: Gift, label: t('nav.gifts') },
    { id: 'people', icon: Users, label: t('nav.people') },
    { id: 'search', icon: Search, label: t('nav.search') },
    { id: 'more', icon: Bell, label: 'More', isMenu: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation; 