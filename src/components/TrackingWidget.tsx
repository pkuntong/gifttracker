import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  MapPin,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface TrackingItem {
  id: string;
  giftName: string;
  recipientName: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimatedDelivery: string;
  currentLocation?: string;
  latestUpdate: string;
}

const TrackingWidget: React.FC = () => {
  const [trackingItems, setTrackingItems] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    try {
      setLoading(true);
      // Mock tracking data
      const mockData: TrackingItem[] = [
        {
          id: '1',
          giftName: 'Wireless Headphones',
          recipientName: 'John Smith',
          trackingNumber: '1Z999AA1234567890',
          carrier: 'UPS',
          status: 'in_transit',
          estimatedDelivery: '2024-01-15',
          currentLocation: 'Memphis, TN',
          latestUpdate: 'Package has left the facility'
        },
        {
          id: '2',
          giftName: 'Cookbook Collection',
          recipientName: 'Sarah Johnson',
          trackingNumber: '9400100000000000000000',
          carrier: 'USPS',
          status: 'delivered',
          estimatedDelivery: '2024-01-14',
          latestUpdate: 'Package delivered to recipient'
        }
      ];
      setTrackingItems(mockData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tracking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'out_for_delivery': return <Package className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDaysUntilDelivery = (estimatedDelivery: string) => {
    const today = new Date();
    const deliveryDate = new Date(estimatedDelivery);
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Package Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <CardTitle>Package Tracking</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/tracking">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Track your gift shipments and deliveries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trackingItems.length === 0 ? (
          <div className="text-center py-6">
            <Truck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No tracking items yet. Add tracking information to monitor shipments.
            </p>
            <Button size="sm" asChild>
              <Link to="/tracking">
                <Truck className="w-4 h-4 mr-2" />
                Add Tracking
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trackingItems.map((item) => {
              const daysUntilDelivery = getDaysUntilDelivery(item.estimatedDelivery);
              const isDelivered = item.status === 'delivered';
              const isOverdue = !isDelivered && daysUntilDelivery < 0;
              
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">
                          {item.giftName}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.recipientName} • {item.carrier}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge className={getStatusColor(item.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            {item.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {item.currentLocation || 'Tracking...'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                          {isDelivered ? 'Delivered' : 
                           isOverdue ? `${Math.abs(daysUntilDelivery)} days overdue` :
                           `${daysUntilDelivery} days left`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {item.latestUpdate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/tracking">
                  <Truck className="w-4 h-4 mr-2" />
                  View All Tracking
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingWidget; 