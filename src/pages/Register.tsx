import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2, Terminal, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { authService } from '@/services/auth';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Max 30 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains special char', test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.register(data as import('@/types/auth').RegisterCredentials);
      toast({ title: 'Account created!', description: 'Please login to continue.' });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const strength = passwordChecks.filter(c => c.test(passwordValue)).length;
  const strengthColors = ['', 'bg-destructive', 'bg-warning', 'bg-yellow-400', 'bg-terminal'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <Shield className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-gradient-primary">Join</span> Commands-HUB
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create your researcher account</p>
        </div>

        <Card className="bg-card border-border card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary">$</span> auth.register()
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">Username</Label>
                <Input
                  {...register('username')}
                  placeholder="security_researcher"
                  className={`bg-muted/50 border-border font-mono text-sm focus:border-primary/50 ${errors.username ? 'border-destructive' : ''}`}
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">Email</Label>
                <Input
                  {...register('email')}
                  type="email"
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
                    onChange={e => setPasswordValue(e.target.value)}
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

                {/* Password strength */}
                {passwordValue && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength] : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {passwordChecks.map(check => (
                        <div key={check.label} className="flex items-center gap-1 text-xs">
                          {check.test(passwordValue) ? (
                            <CheckCircle className="h-3 w-3 text-terminal" />
                          ) : (
                            <XCircle className="h-3 w-3 text-muted-foreground/30" />
                          )}
                          <span className={check.test(passwordValue) ? 'text-terminal' : 'text-muted-foreground/50'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">Confirm Password</Label>
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className={`bg-muted/50 border-border font-mono text-sm focus:border-primary/50 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-mono">Login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
