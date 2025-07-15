import React from 'react';
import { useTranslation } from 'react-i18next';
import SmartNotifications from '@/components/SmartNotifications';

const Notifications: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <SmartNotifications />
    </div>
  );
};

export default Notifications; 