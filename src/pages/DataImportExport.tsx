import React from 'react';
import { useTranslation } from 'react-i18next';
import AdvancedDataManagement from '@/components/AdvancedDataManagement';

const DataImportExport: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <AdvancedDataManagement />
    </div>
  );
};

export default DataImportExport; 