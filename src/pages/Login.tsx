import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { validateEmail } from '@/utils/api-helpers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/app/dashboard';

  // Clear field errors when user starts typing
  useEffect(() => {
    if (email) {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
      setError('');
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
      setError('');
    }
  }, [password]);

  // Validate fields in real-time
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced error messaging
  const getErrorMessage = (err: any): string => {
    const message = err?.message || 'Login failed';
    
    if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
      return 'Email or password is incorrect. Please check your credentials and try again.';
    }
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }
    if (message.toLowerCase().includes('timeout')) {
      return 'Login is taking longer than usual. Please try again.';
    }
    if (message.toLowerCase().includes('too many')) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    if (message.toLowerCase().includes('account') && message.toLowerCase().includes('locked')) {
      return 'Your account has been temporarily locked. Please contact support if this continues.';
    }
    
    return message;
  };

  // Enhanced retry logic
  const handleRetry = async () => {
    setIsRetrying(true);
    setError('');
    
    // Add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsRetrying(false);
    handleSubmit(new Event('submit') as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setShowSuggestions(true);
      return;
    }
    
    setError('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      await login(email.trim(), password);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
        duration: 3000,
      });
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Show suggestions after multiple failures
      if (retryCount >= 1) {
        setShowSuggestions(true);
      }
      
      // Auto-focus on email field for retry
      setTimeout(() => {
        const emailInput = document.getElementById('email');
        emailInput?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-large">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your gift tracker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="relative">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    {error}
                    {retryCount > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRetry}
                          disabled={isRetrying}
                          className="h-7 text-xs"
                        >
                          {isRetrying ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Try Again
                            </>
                          )}
                        </Button>
                        <span className="text-xs text-muted-foreground">Attempt {retryCount + 1}</span>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {showSuggestions && !error && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <div className="text-sm font-medium mb-2">Having trouble signing in?</div>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Make sure your email address is correct</li>
                      <li>• Check that Caps Lock is off for your password</li>
                      <li>• Try resetting your password if you forgot it</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${
                      fieldErrors.email 
                        ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                        : email && validateEmail(email) 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : ''
                    }`}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                  {email && validateEmail(email) && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline transition-colors"
                    tabIndex={isLoading ? -1 : undefined}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${
                      fieldErrors.password 
                        ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                        : ''
                    }`}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    tabIndex={isLoading ? -1 : undefined}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label htmlFor="remember" className="text-sm">
                  Keep me signed in for 30 days
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full transition-all duration-200" 
                disabled={isLoading || isRetrying}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    New to Gift Tracker?
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/register"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                  tabIndex={isLoading ? -1 : undefined}
                >
                  Create your free account
                </Link>
                <p className="mt-2 text-xs text-muted-foreground">
                  Takes less than 30 seconds to get started
                </p>
                
                {retryCount > 2 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                      Still having trouble?
                    </p>
                    <div className="space-y-2">
                      <Link
                        to="/forgot-password"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset your password
                      </Link>
                      <Link
                        to="/contact"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Contact support
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login; 