import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log('[LOGIN PAGE] Form submitted:', { email: data.email });
    try {
      console.log('[LOGIN PAGE] Calling login function...');
      await login(data.email, data.password);
      console.log('[LOGIN PAGE] Login successful, navigating to home');
      navigate('/');
      toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
    } catch (error: any) {
      console.error('[LOGIN PAGE] Login error caught:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || error.message || 'Invalid credentials.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <Shield className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-gradient-primary">Commands</span>-HUB
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        <Card className="bg-card border-border card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary">$</span> auth.login()
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">Email or Username</Label>
                <Input
                  {...register('email')}
                  placeholder="user@example.com"
                  className={`bg-muted/50 border-border font-mono text-sm focus:border-primary/50 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`bg-muted/50 border-border font-mono text-sm pr-10 focus:border-primary/50 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isSubmitting ? 'Authenticating...' : 'Login'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-mono">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50 mt-4 font-mono">
          For authorized security professionals only.
        </p>
      </div>
    </div>
  );
};

export default Login;
