import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePassword } from '@/utils/api-helpers';
import { Progress } from '@/components/ui/progress';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{name?: string; email?: string; password?: string; confirmPassword?: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real-time validation and password strength checking
  useEffect(() => {
    const errors: {name?: string; email?: string; password?: string; confirmPassword?: string} = {};
    
    // Name validation
    if (name && name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (email && !validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation and strength
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.errors[0]; // Show first error
      }
      
      // Calculate password strength
      let strength = 0;
      if (password.length >= 8) strength += 20;
      if (/[A-Z]/.test(password)) strength += 20;
      if (/[a-z]/.test(password)) strength += 20;
      if (/\d/.test(password)) strength += 20;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
    
    // Confirm password validation
    if (confirmPassword && password && confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    
    // Check if form is valid
    const isValid = name.trim().length >= 2 && 
                   validateEmail(email) && 
                   validatePassword(password).valid && 
                   password === confirmPassword &&
                   Object.keys(errors).length === 0;
    setIsFormValid(isValid);
  }, [name, email, password, confirmPassword]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) setError('');
  }, [name, email, password, confirmPassword]);

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 80) return 'Fair';
    if (passwordStrength < 100) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 80) return 'bg-yellow-500';
    if (passwordStrength < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Enhanced error messaging
  const getErrorMessage = (err: unknown): string => {
    const message = (err as { message?: string })?.message || 'Registration failed';
    
    if (message.toLowerCase().includes('email') && message.toLowerCase().includes('exists')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }
    if (message.toLowerCase().includes('timeout')) {
      return 'Registration is taking longer than usual. Please try again.';
    }
    if (message.toLowerCase().includes('validation')) {
      return 'Please check your information and try again.';
    }
    
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if form is invalid
    if (!isFormValid) {
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      
      console.log('Attempting registration with:', { 
        name: cleanName, 
        email: cleanEmail, 
        passwordLength: password.length,
        emailValid: validateEmail(cleanEmail)
      });
      
      await register(cleanEmail, password, cleanName);
      toast({
        title: "Welcome to GiftTracker!",
        description: "Your account has been created successfully. You're now signed in.",
        duration: 4000,
      });
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(getErrorMessage(err));
      
      // Auto-focus on first field with error
      setTimeout(() => {
        const firstErrorField = document.querySelector('[data-error="true"]') as HTMLInputElement;
        firstErrorField?.focus();
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
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Join thousands of families organizing their gift giving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    {error}
                    {error.includes('email') && error.includes('exists') && (
                      <div className="mt-2">
                        <Link
                          to="/login"
                          className="text-sm underline hover:no-underline"
                        >
                          Go to sign in page
                        </Link>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`pl-10 ${
                      fieldErrors.name 
                        ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                        : name && name.trim().length >= 2
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : ''
                    }`}
                    data-error={!!fieldErrors.name}
                    required
                    autoComplete="name"
                    disabled={isLoading}
                  />
                  {name && name.trim().length >= 2 && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {fieldErrors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

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
                    data-error={!!fieldErrors.email}
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${
                      fieldErrors.password 
                        ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                        : password && validatePassword(password).valid
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : ''
                    }`}
                    data-error={!!fieldErrors.password}
                    required
                    autoComplete="new-password"
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
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength} className="flex-1 h-2" />
                      <span className={`text-xs font-medium ${
                        passwordStrength < 40 ? 'text-red-600' :
                        passwordStrength < 80 ? 'text-yellow-600' :
                        passwordStrength < 100 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    {passwordStrength < 100 && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>Strong passwords include:</span>
                        </div>
                        <ul className="ml-4 space-y-0.5">
                          <li className={password.length >= 8 ? 'text-green-600' : ''}>
                            {password.length >= 8 ? '✓' : '•'} At least 8 characters
                          </li>
                          <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                            {/[A-Z]/.test(password) ? '✓' : '•'} One uppercase letter
                          </li>
                          <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                            {/[a-z]/.test(password) ? '✓' : '•'} One lowercase letter
                          </li>
                          <li className={/\d/.test(password) ? 'text-green-600' : ''}>
                            {/\d/.test(password) ? '✓' : '•'} One number
                          </li>
                          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}>
                            {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '•'} One special character
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 ${
                      fieldErrors.confirmPassword 
                        ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                        : confirmPassword && password && confirmPassword === password
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : ''
                    }`}
                    data-error={!!fieldErrors.confirmPassword}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    tabIndex={isLoading ? -1 : undefined}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                  {confirmPassword && password && confirmPassword === password && (
                    <CheckCircle className="absolute right-8 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
                {confirmPassword && password && confirmPassword === password && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className={`w-full transition-all duration-200 ${
                  isFormValid && !isLoading 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'opacity-50'
                }`}
                disabled={!isFormValid || isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
              
              {!isFormValid && (name || email || password || confirmPassword) && (
                <p className="text-xs text-muted-foreground text-center">
                  Please complete all fields correctly to continue
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register; 