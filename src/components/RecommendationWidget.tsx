import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Heart,
  ShoppingCart,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { recommendationService } from '@/services/recommendationService';
import { GiftRecommendation } from '@/types';

interface RecommendationWidgetProps {
  personId?: string;
  occasionId?: string;
  maxItems?: number;
}

const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  personId,
  occasionId,
  maxItems = 3
}) => {
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (personId || occasionId) {
      loadRecommendations();
    }
  }, [personId, occasionId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let recommendations: GiftRecommendation[] = [];

      if (personId) {
        recommendations = await recommendationService.getPersonalizedRecommendations(personId, occasionId);
      } else if (occasionId) {
        recommendations = await recommendationService.getOccasionRecommendations('birthday', 500);
      } else {
        recommendations = await recommendationService.getTrendingRecommendations();
      }

      setRecommendations(recommendations.slice(0, maxItems));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai': return <Target className="w-4 h-4" />;
      case 'popular': return <TrendingUp className="w-4 h-4" />;
      case 'trending': return <Zap className="w-4 h-4" />;
      case 'personalized': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">Smart Recommendations</span>
          </div>
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
            <Target className="w-5 h-5" />
            <CardTitle>AI Recommendations</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/recommendations">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Personalized gift suggestions based on your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No recommendations available
            </p>
            <Button size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  {getSourceIcon(recommendation.source)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">
                        {recommendation.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {recommendation.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge className={getConfidenceColor(recommendation.confidence)}>
                        {recommendation.confidence}%
                      </Badge>
                      <span className="text-sm font-medium">
                        ${recommendation.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {recommendation.category}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Heart className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <ShoppingCart className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/recommendations">
                  <Target className="w-4 h-4 mr-2" />
                  Get More Recommendations
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationWidget; 