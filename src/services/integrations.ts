import { ApiService } from './api';

export interface IntegrationConfig {
  id: string;
  name: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  webhookUrl?: string;
  settings: Record<string, unknown>;
}

export interface SyncResult {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: number;
  itemsSynced?: number;
}

export interface IntegrationStatus {
  connected: boolean;
  lastSync?: number;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  error?: string;
}

class IntegrationsService {
  private integrations: Map<string, IntegrationConfig> = new Map();
  private syncStatus: Map<string, IntegrationStatus> = new Map();

  // Amazon Integration
  async connectAmazon(apiKey: string, apiSecret: string): Promise<SyncResult> {
    try {
      const config: IntegrationConfig = {
        id: 'amazon',
        name: 'Amazon',
        apiKey,
        apiSecret,
        settings: {
          wishlistSync: true,
          priceTracking: true,
          purchaseHistory: true
        }
      };

      this.integrations.set('amazon', config);
      this.syncStatus.set('amazon', {
        connected: true,
        syncStatus: 'idle'
      });

      // Simulate API call
      await this.simulateApiCall('amazon', 'connect');

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'Amazon connected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to Amazon',
        timestamp: Date.now()
      };
    }
  }

  async syncAmazonWishlist(): Promise<SyncResult> {
    try {
      this.updateSyncStatus('amazon', 'syncing');

      // Simulate API call to fetch wishlist
      const wishlistItems = await this.simulateApiCall('amazon', 'wishlist') as Array<Record<string, unknown>>;
      
      // Process and store wishlist items
      const processedItems = wishlistItems.map((item: Record<string, unknown>) => ({
        id: item.id,
        name: item.title,
        price: item.price,
        url: item.url,
        image: item.image,
        source: 'amazon',
        addedAt: new Date().toISOString()
      }));

      // Save to local storage or database
      await this.saveSyncedData('amazon', 'wishlist', processedItems);

      this.updateSyncStatus('amazon', 'success', Date.now());

      return {
        success: true,
        data: processedItems,
        timestamp: Date.now(),
        itemsSynced: processedItems.length
      };
    } catch (error) {
      this.updateSyncStatus('amazon', 'error', undefined, error as string);
      return {
        success: false,
        error: 'Failed to sync Amazon wishlist',
        timestamp: Date.now()
      };
    }
  }

  // Google Calendar Integration
  async connectGoogleCalendar(accessToken: string, refreshToken: string): Promise<SyncResult> {
    try {
      const config: IntegrationConfig = {
        id: 'google-calendar',
        name: 'Google Calendar',
        accessToken,
        refreshToken,
        settings: {
          eventSync: true,
          reminderIntegration: true,
          birthdayImport: true
        }
      };

      this.integrations.set('google-calendar', config);
      this.syncStatus.set('google-calendar', {
        connected: true,
        syncStatus: 'idle'
      });

      await this.simulateApiCall('google-calendar', 'connect');

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'Google Calendar connected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to Google Calendar',
        timestamp: Date.now()
      };
    }
  }

  async syncGoogleCalendarEvents(): Promise<SyncResult> {
    try {
      this.updateSyncStatus('google-calendar', 'syncing');

      // Simulate API call to fetch calendar events
      const events = await this.simulateApiCall('google-calendar', 'events') as Array<Record<string, unknown>>;
      
      // Process and store events
      const processedEvents = events.map((event: Record<string, unknown>) => ({
        id: event.id as string,
        title: event.summary as string,
        description: event.description as string,
        startDate: (event.start as { dateTime: string }).dateTime,
        endDate: (event.end as { dateTime: string }).dateTime,
        source: 'google-calendar',
        type: this.categorizeEvent(event.summary as string)
      }));

      await this.saveSyncedData('google-calendar', 'events', processedEvents);

      this.updateSyncStatus('google-calendar', 'success', Date.now());

      return {
        success: true,
        data: processedEvents,
        timestamp: Date.now(),
        itemsSynced: processedEvents.length
      };
    } catch (error) {
      this.updateSyncStatus('google-calendar', 'error', undefined, error as string);
      return {
        success: false,
        error: 'Failed to sync Google Calendar events',
        timestamp: Date.now()
      };
    }
  }

  // PayPal Integration
  async connectPayPal(clientId: string, clientSecret: string): Promise<SyncResult> {
    try {
      const config: IntegrationConfig = {
        id: 'paypal',
        name: 'PayPal',
        apiKey: clientId,
        apiSecret: clientSecret,
        settings: {
          paymentTracking: true,
          expenseReports: true,
          budgetSync: true
        }
      };

      this.integrations.set('paypal', config);
      this.syncStatus.set('paypal', {
        connected: true,
        syncStatus: 'idle'
      });

      await this.simulateApiCall('paypal', 'connect');

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'PayPal connected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to PayPal',
        timestamp: Date.now()
      };
    }
  }

  async syncPayPalTransactions(): Promise<SyncResult> {
    try {
      this.updateSyncStatus('paypal', 'syncing');

      // Simulate API call to fetch transactions
      const transactions = await this.simulateApiCall('paypal', 'transactions') as Array<Record<string, unknown>>;
      
      // Process and store transactions
      const processedTransactions = transactions.map((txn: Record<string, unknown>) => ({
        id: txn.id,
        amount: txn.amount,
        currency: txn.currency,
        description: txn.description,
        date: txn.date,
        category: this.categorizeTransaction(txn.description as string),
        source: 'paypal'
      }));

      await this.saveSyncedData('paypal', 'transactions', processedTransactions);

      this.updateSyncStatus('paypal', 'success', Date.now());

      return {
        success: true,
        data: processedTransactions,
        timestamp: Date.now(),
        itemsSynced: processedTransactions.length
      };
    } catch (error) {
      this.updateSyncStatus('paypal', 'error', undefined, error as string);
      return {
        success: false,
        error: 'Failed to sync PayPal transactions',
        timestamp: Date.now()
      };
    }
  }

  // Etsy Integration
  async connectEtsy(apiKey: string): Promise<SyncResult> {
    try {
      const config: IntegrationConfig = {
        id: 'etsy',
        name: 'Etsy',
        apiKey,
        settings: {
          giftDiscovery: true,
          priceAlerts: true,
          sellerTracking: true
        }
      };

      this.integrations.set('etsy', config);
      this.syncStatus.set('etsy', {
        connected: true,
        syncStatus: 'idle'
      });

      await this.simulateApiCall('etsy', 'connect');

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'Etsy connected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to Etsy',
        timestamp: Date.now()
      };
    }
  }

  async searchEtsyGifts(query: string): Promise<SyncResult> {
    try {
      this.updateSyncStatus('etsy', 'syncing');

      // Simulate API call to search Etsy
      const searchResults = await this.simulateApiCall('etsy', 'search', { query }) as Array<Record<string, unknown>>;
      
      const processedResults = searchResults.map((item: Record<string, unknown>) => ({
        id: item.id,
        name: item.title,
        price: item.price,
        url: item.url,
        image: item.image,
        seller: item.seller,
        rating: item.rating,
        source: 'etsy'
      }));

      await this.saveSyncedData('etsy', 'search', processedResults);

      this.updateSyncStatus('etsy', 'success', Date.now());

      return {
        success: true,
        data: processedResults,
        timestamp: Date.now(),
        itemsSynced: processedResults.length
      };
    } catch (error) {
      this.updateSyncStatus('etsy', 'error', undefined, error as string);
      return {
        success: false,
        error: 'Failed to search Etsy gifts',
        timestamp: Date.now()
      };
    }
  }

  // WhatsApp Integration
  async connectWhatsApp(phoneNumber: string, apiToken: string): Promise<SyncResult> {
    try {
      const config: IntegrationConfig = {
        id: 'whatsapp',
        name: 'WhatsApp',
        apiKey: apiToken,
        settings: {
          giftSharing: true,
          familyCoordination: true,
          photoSharing: true
        }
      };

      this.integrations.set('whatsapp', config);
      this.syncStatus.set('whatsapp', {
        connected: true,
        syncStatus: 'idle'
      });

      await this.simulateApiCall('whatsapp', 'connect');

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'WhatsApp connected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to WhatsApp',
        timestamp: Date.now()
      };
    }
  }

  async sendWhatsAppMessage(recipient: string, message: string, mediaUrl?: string): Promise<SyncResult> {
    try {
      this.updateSyncStatus('whatsapp', 'syncing');

      // Simulate API call to send WhatsApp message
      await this.simulateApiCall('whatsapp', 'send', { recipient, message, mediaUrl });

      this.updateSyncStatus('whatsapp', 'success', Date.now());

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'WhatsApp message sent successfully' }
      };
    } catch (error) {
      this.updateSyncStatus('whatsapp', 'error', undefined, error as string);
      return {
        success: false,
        error: 'Failed to send WhatsApp message',
        timestamp: Date.now()
      };
    }
  }

  // Gmail Integration
  async connectGmail(accessToken: string, refreshToken: string): Promise<SyncResult> {
    try {
      const config: IntegrationConfig = {
        id: 'gmail',
        name: 'Gmail',
        accessToken,
        refreshToken,
        settings: {
          emailTemplates: true,
          giftCoordination: true,
          reminderEmails: true
        }
      };

      this.integrations.set('gmail', config);
      this.syncStatus.set('gmail', {
        connected: true,
        syncStatus: 'idle'
      });

      await this.simulateApiCall('gmail', 'connect');

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'Gmail connected successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to Gmail',
        timestamp: Date.now()
      };
    }
  }

  async sendGmailMessage(to: string, subject: string, body: string): Promise<SyncResult> {
    try {
      this.updateSyncStatus('gmail', 'syncing');

      // Simulate API call to send Gmail
      await this.simulateApiCall('gmail', 'send', { to, subject, body });

      this.updateSyncStatus('gmail', 'success', Date.now());

      return {
        success: true,
        timestamp: Date.now(),
        data: { message: 'Gmail message sent successfully' }
      };
    } catch (error) {
      this.updateSyncStatus('gmail', 'error', undefined, error as string);
      return {
        success: false,
        error: 'Failed to send Gmail message',
        timestamp: Date.now()
      };
    }
  }

  // Utility methods
  private updateSyncStatus(integrationId: string, status: IntegrationStatus['syncStatus'], lastSync?: number, error?: string) {
    const currentStatus = this.syncStatus.get(integrationId);
    if (currentStatus) {
      this.syncStatus.set(integrationId, {
        ...currentStatus,
        syncStatus: status,
        lastSync,
        error
      });
    }
  }

  private async simulateApiCall(integration: string, action: string, params?: Record<string, unknown>): Promise<unknown> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate different responses based on integration and action
    switch (integration) {
      case 'amazon':
        if (action === 'wishlist') {
          return [
            { id: '1', title: 'Wireless Headphones', price: 99.99, url: 'https://amazon.com/1', image: '/headphones.jpg' },
            { id: '2', title: 'Smart Watch', price: 199.99, url: 'https://amazon.com/2', image: '/watch.jpg' },
            { id: '3', title: 'Coffee Maker', price: 79.99, url: 'https://amazon.com/3', image: '/coffee.jpg' }
          ];
        }
        break;
      case 'google-calendar':
        if (action === 'events') {
          return [
            { id: '1', summary: 'Mom Birthday', description: 'Birthday celebration', start: { dateTime: '2024-02-15T10:00:00Z' }, end: { dateTime: '2024-02-15T18:00:00Z' } },
            { id: '2', summary: 'Dad Anniversary', description: 'Wedding anniversary', start: { dateTime: '2024-06-16T12:00:00Z' }, end: { dateTime: '2024-06-16T20:00:00Z' } }
          ];
        }
        break;
      case 'paypal':
        if (action === 'transactions') {
          return [
            { id: '1', amount: 99.99, currency: 'USD', description: 'Gift purchase', date: '2024-01-15' },
            { id: '2', amount: 149.99, currency: 'USD', description: 'Birthday gift', date: '2024-01-20' }
          ];
        }
        break;
      case 'etsy':
        if (action === 'search') {
          return [
            { id: '1', title: 'Handmade Jewelry', price: 45.00, url: 'https://etsy.com/1', image: '/jewelry.jpg', seller: 'ArtisanCrafts', rating: 4.8 },
            { id: '2', title: 'Custom Mug', price: 25.00, url: 'https://etsy.com/2', image: '/mug.jpg', seller: 'PersonalizedGifts', rating: 4.9 }
          ];
        }
        break;
    }

    return { success: true };
  }

  private async saveSyncedData(integration: string, type: string, data: Array<Record<string, unknown>>): Promise<void> {
    // Save to localStorage for demo purposes
    const key = `${integration}_${type}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  private categorizeEvent(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('birthday')) return 'birthday';
    if (lowerTitle.includes('anniversary')) return 'anniversary';
    if (lowerTitle.includes('wedding')) return 'wedding';
    if (lowerTitle.includes('christmas')) return 'christmas';
    return 'other';
  }

  private categorizeTransaction(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('gift')) return 'gift';
    if (lowerDesc.includes('birthday')) return 'birthday';
    if (lowerDesc.includes('anniversary')) return 'anniversary';
    return 'other';
  }

  // Get integration status
  getIntegrationStatus(integrationId: string): IntegrationStatus | undefined {
    return this.syncStatus.get(integrationId);
  }

  // Get all integration statuses
  getAllIntegrationStatuses(): Map<string, IntegrationStatus> {
    return this.syncStatus;
  }

  // Disconnect integration
  disconnectIntegration(integrationId: string): void {
    this.integrations.delete(integrationId);
    this.syncStatus.delete(integrationId);
  }

  // Get connected integrations
  getConnectedIntegrations(): string[] {
    return Array.from(this.syncStatus.entries())
      .filter(([_, status]) => status.connected)
      .map(([id, _]) => id);
  }
}

export const integrationsService = new IntegrationsService(); 