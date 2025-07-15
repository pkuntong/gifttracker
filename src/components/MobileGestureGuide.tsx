import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hand, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  MousePointer,
  X
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

const MobileGestureGuide: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile } = useMobile();
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Show guide for first-time mobile users
    const hasSeenGuide = localStorage.getItem('mobile-gesture-guide-seen');
    if (isMobile && !hasSeenGuide) {
      setShowGuide(true);
    }
  }, [isMobile]);

  const gestures = [
    {
      icon: ChevronLeft,
      title: 'Swipe Left',
      description: 'Navigate to next page',
      color: 'text-blue-600'
    },
    {
      icon: ChevronRight,
      title: 'Swipe Right',
      description: 'Navigate to previous page',
      color: 'text-green-600'
    },
    {
      icon: ChevronUp,
      title: 'Swipe Up',
      description: 'Scroll through content',
      color: 'text-purple-600'
    },
    {
      icon: MousePointer,
      title: 'Tap',
      description: 'Select items and perform actions',
      color: 'text-orange-600'
    },
    {
      icon: Hand,
      title: 'Long Press',
      description: 'Access additional options',
      color: 'text-red-600'
    }
  ];

  const handleNext = () => {
    if (currentStep < gestures.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setShowGuide(false);
    localStorage.setItem('mobile-gesture-guide-seen', 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!showGuide || !isMobile) {
    return null;
  }

  const currentGesture = gestures[currentStep];
  const Icon = currentGesture.icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="secondary">
              {currentStep + 1} of {gestures.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-lg">{t('mobile.gestureHint')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 rounded-full bg-gray-100 ${currentGesture.color}`}>
              <Icon className="h-8 w-8" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">{currentGesture.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentGesture.description}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === gestures.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileGestureGuide; 