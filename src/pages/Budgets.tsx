import React from 'react';
import { useTranslation } from 'react-i18next';
import AdvancedBudgetManagement from '@/components/AdvancedBudgetManagement';

const Budgets: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <AdvancedBudgetManagement />
    </div>
  );
};

export default Budgets; 