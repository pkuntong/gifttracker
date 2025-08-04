import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Calendar,
  Gift,
  Plus,
  ArrowRight,
  UserPlus,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SocialActivity {
  id: string;
  type: 'family_created' | 'wishlist_shared' | 'gift_reserved' | 'event_created' | 'member_joined';
  user: string;
  action: string;
  target: string;
  time: string;
  avatar?: string;
}

interface FamilyGroup {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
  lastActivity: string;
}

interface SharedWishlist {
  id: string;
  name: string;
  owner: string;
  itemCount: number;
  isPublic: boolean;
  lastUpdated: string;
}

const SocialWidget: React.FC = () => {
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [families, setFamilies] = useState<FamilyGroup[]>([]);
  const [wishlists, setWishlists] = useState<SharedWishlist[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSocialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock social data
      const mockActivities: SocialActivity[] = [
        {
          id: '1',
          type: 'wishlist_shared',
          user: 'Sarah Smith',
          action: 'shared a wishlist',
          target: 'Christmas Wishlist 2024',
          time: '2 hours ago'
        },
        {
          id: '2',
          type: 'gift_reserved',
          user: 'Mike Johnson',
          action: 'reserved a gift',
          target: 'Cookbook Collection',
          time: '1 day ago'
        },
        {
          id: '3',
          type: 'member_joined',
          user: 'Emma Wilson',
          action: 'joined your family group',
          target: 'Smith Family',
          time: '3 days ago'
        }
      ];

      const mockFamilies: FamilyGroup[] = [
        {
          id: '1',
          name: 'Smith Family',
          memberCount: 5,
          lastActivity: '2 hours ago'
        },
        {
          id: '2',
          name: 'Johnson Family',
          memberCount: 3,
          lastActivity: '1 day ago'
        }
      ];

      const mockWishlists: SharedWishlist[] = [
        {
          id: '1',
          name: 'Christmas Wishlist 2024',
          owner: 'John Smith',
          itemCount: 12,
          isPublic: false,
          lastUpdated: '2 hours ago'
        },
        {
          id: '2',
          name: 'Birthday Ideas',
          owner: 'Sarah Smith',
          itemCount: 8,
          isPublic: true,
          lastUpdated: '1 day ago'
        }
      ];

      setActivities(mockActivities);
      setFamilies(mockFamilies);
      setWishlists(mockWishlists);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load social data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSocialData();
  }, [loadSocialData]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'family_created': return <Users className="w-4 h-4" />;
      case 'wishlist_shared': return <Heart className="w-4 h-4" />;
      case 'gift_reserved': return <Gift className="w-4 h-4" />;
      case 'event_created': return <Calendar className="w-4 h-4" />;
      case 'member_joined': return <UserPlus className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'family_created': return 'text-blue-600';
      case 'wishlist_shared': return 'text-pink-600';
      case 'gift_reserved': return 'text-green-600';
      case 'event_created': return 'text-purple-600';
      case 'member_joined': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Social Activity
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
            <Share2 className="w-5 h-5" />
            <CardTitle>Social Activity</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/social">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Recent activity from your family and friends
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Share2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No social activity yet. Start collaborating with family and friends.
            </p>
            <Button size="sm" asChild>
              <Link to="/app/social">
                <Users className="w-4 h-4 mr-2" />
                Create Family Group
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recent Activities */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recent Activity</h4>
              {activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action}{' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Family Groups */}
            {families.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Family Groups</h4>
                <div className="space-y-2">
                  {families.slice(0, 2).map((family) => (
                    <div key={family.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback>{family.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{family.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {family.memberCount} members
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {family.lastActivity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Wishlists */}
            {wishlists.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Shared Wishlists</h4>
                <div className="space-y-2">
                  {wishlists.slice(0, 2).map((wishlist) => (
                    <div key={wishlist.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-600" />
                        <div>
                          <p className="text-sm font-medium">{wishlist.name}</p>
                          <p className="text-xs text-muted-foreground">
                            by {wishlist.owner} • {wishlist.itemCount} items
                          </p>
                        </div>
                      </div>
                      <Badge variant={wishlist.isPublic ? "default" : "secondary"} className="text-xs">
                        {wishlist.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/app/social">
                  <Share2 className="w-4 h-4 mr-2" />
                  View All Social
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialWidget; 