import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IntegrationsHub from '@/components/IntegrationsHub';
import IntegrationSettings from '@/components/IntegrationSettings';

const Integrations: React.FC = () => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleOpenSettings = (integrationId: string, integrationName: string) => {
    setSelectedIntegration({ id: integrationId, name: integrationName });
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    setSelectedIntegration(null);
  };

  return (
    <div className="space-y-6">
      <IntegrationsHub onOpenSettings={handleOpenSettings} />
      
      {showSettings && selectedIntegration && (
        <IntegrationSettings
          integrationId={selectedIntegration.id}
          integrationName={selectedIntegration.name}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
};

export default Integrations; 