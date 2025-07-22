import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Plus,
  RefreshCw,
  Bell,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Gift, Person } from '@/types';

interface TrackingInfo {
  id: string;
  giftId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimatedDelivery: string;
  actualDelivery?: string;
  currentLocation?: string;
  events: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

interface ShippingCarrier {
  name: string;
  code: string;
  trackingUrl: string;
  logo: string;
}

const GiftTracking: React.FC = () => {
  const [trackingItems, setTrackingItems] = useState<TrackingInfo[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<TrackingInfo | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    giftId: '',
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: ''
  });

  const carriers: ShippingCarrier[] = [
    { name: 'FedEx', code: 'fedex', trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr={tracking}', logo: '🚚' },
    { name: 'UPS', code: 'ups', trackingUrl: 'https://www.ups.com/track?tracknum={tracking}', logo: '📦' },
    { name: 'USPS', code: 'usps', trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking}', logo: '📮' },
    { name: 'DHL', code: 'dhl', trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB={tracking}', logo: '✈️' },
    { name: 'Amazon', code: 'amazon', trackingUrl: 'https://www.amazon.com/gp/your-account/order-details?orderID={tracking}', logo: '📦' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [giftsData, peopleData] = await Promise.all([
        apiService.getGifts(),
        apiService.getPeople()
      ]);
      setGifts(giftsData);
      setPeople(peopleData);
      
      // Load mock tracking data
      loadMockTrackingData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMockTrackingData = () => {
    const mockTracking: TrackingInfo[] = [
      {
        id: '1',
        giftId: '1',
        trackingNumber: '1Z999AA1234567890',
        carrier: 'ups',
        status: 'in_transit',
        estimatedDelivery: '2024-01-15',
        currentLocation: 'Memphis, TN',
        events: [
          {
            id: '1',
            timestamp: '2024-01-13T10:30:00Z',
            location: 'Memphis, TN',
            status: 'In Transit',
            description: 'Package has left the facility'
          },
          {
            id: '2',
            timestamp: '2024-01-12T15:45:00Z',
            location: 'Atlanta, GA',
            status: 'Departed',
            description: 'Package departed from Atlanta facility'
          },
          {
            id: '3',
            timestamp: '2024-01-12T08:20:00Z',
            location: 'Atlanta, GA',
            status: 'Arrived',
            description: 'Package arrived at Atlanta facility'
          }
        ],
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-13T10:30:00Z'
      },
      {
        id: '2',
        giftId: '2',
        trackingNumber: '9400100000000000000000',
        carrier: 'usps',
        status: 'delivered',
        estimatedDelivery: '2024-01-14',
        actualDelivery: '2024-01-14T14:30:00Z',
        currentLocation: 'Delivered',
        events: [
          {
            id: '4',
            timestamp: '2024-01-14T14:30:00Z',
            location: 'Home Address',
            status: 'Delivered',
            description: 'Package delivered to recipient'
          },
          {
            id: '5',
            timestamp: '2024-01-14T08:15:00Z',
            location: 'Local Post Office',
            status: 'Out for Delivery',
            description: 'Package out for delivery'
          }
        ],
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-14T14:30:00Z'
      }
    ];
    setTrackingItems(mockTracking);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, this would call the API
      const newTracking: TrackingInfo = {
        id: Date.now().toString(),
        giftId: formData.giftId,
        trackingNumber: formData.trackingNumber,
        carrier: formData.carrier,
        status: 'pending',
        estimatedDelivery: formData.estimatedDelivery,
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTrackingItems(prev => [newTracking, ...prev]);
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "Tracking information added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tracking information",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      giftId: '',
      trackingNumber: '',
      carrier: '',
      estimatedDelivery: ''
    });
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

  const getCarrierInfo = (carrierCode: string) => {
    return carriers.find(c => c.code === carrierCode) || carriers[0];
  };

  const getGiftInfo = (giftId: string) => {
    return gifts.find(g => g.id === giftId);
  };

  const getRecipientInfo = (giftId: string) => {
    const gift = gifts.find(g => g.id === giftId);
    if (gift) {
      return people.find(p => p.id === gift.recipientId);
    }
    return null;
  };

  const filteredTracking = trackingItems.filter(item => {
    const matchesSearch = item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const refreshTracking = async (trackingId: string) => {
    toast({
      title: "Refreshing",
      description: "Updating tracking information...",
    });
    // In a real app, this would call the carrier's API
    setTimeout(() => {
      toast({
        title: "Updated",
        description: "Tracking information refreshed",
      });
    }, 2000);
  };

  const openCarrierTracking = (tracking: TrackingInfo) => {
    const carrier = getCarrierInfo(tracking.carrier);
    const url = carrier.trackingUrl.replace('{tracking}', tracking.trackingNumber);
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8 text-primary" />
          <div className="text-left">
            <h1 className="text-3xl font-bold text-left">Gift Tracking</h1>
            <p className="text-muted-foreground text-left">Track your gift shipments and deliveries</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tracking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tracking Information</DialogTitle>
              <DialogDescription>
                Add tracking details for a gift shipment
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="gift">Gift</Label>
                  <Select value={formData.giftId} onValueChange={(value) => setFormData({ ...formData, giftId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gift" />
                    </SelectTrigger>
                    <SelectContent>
                      {gifts.map(gift => {
                        const recipient = getRecipientInfo(gift.id);
                        return (
                          <SelectItem key={gift.id} value={gift.id}>
                            {gift.name} - {recipient?.name || 'Unknown'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                    placeholder="Enter tracking number"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="carrier">Carrier</Label>
                  <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map(carrier => (
                        <SelectItem key={carrier.code} value={carrier.code}>
                          <span className="mr-2">{carrier.logo}</span>
                          {carrier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Tracking</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTracking.map((tracking) => {
          const gift = getGiftInfo(tracking.giftId);
          const recipient = getRecipientInfo(tracking.giftId);
          const carrier = getCarrierInfo(tracking.carrier);
          
          return (
            <Card key={tracking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg">
                      {carrier.logo}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{gift?.name || 'Unknown Gift'}</CardTitle>
                      <CardDescription>
                        {recipient?.name || 'Unknown Recipient'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refreshTracking(tracking.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCarrierTracking(tracking)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-sm text-muted-foreground">{tracking.trackingNumber}</p>
                  </div>
                  <Badge className={getStatusColor(tracking.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(tracking.status)}
                      {tracking.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Carrier</p>
                    <p className="text-muted-foreground">{carrier.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-muted-foreground">
                      {new Date(tracking.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {tracking.currentLocation && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{tracking.currentLocation}</span>
                  </div>
                )}
                
                {tracking.events.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Latest Update</p>
                    <div className="text-sm text-muted-foreground">
                      {tracking.events[0].description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tracking.events[0].timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Tracking Items */}
      {filteredTracking.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tracking Items</h3>
            <p className="text-muted-foreground mb-4">
              Add tracking information to monitor your gift shipments
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Tracking
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GiftTracking; 