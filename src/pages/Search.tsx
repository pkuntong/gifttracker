import React from 'react';
import { useTranslation } from 'react-i18next';
import AdvancedSearch from '@/components/AdvancedSearch';

const Search: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <AdvancedSearch />
    </div>
  );
};

export default Search; 