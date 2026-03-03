import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Calendar, BookMarked, Star, Eye, Key, LogOut, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = async (data: PasswordForm) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast({ title: 'Password updated!' });
      reset();
      setShowPasswordForm(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update password.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold font-mono mb-6">
          <span className="text-gradient-primary">Profile</span>
        </h1>

        {/* User Info Card */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 glow-primary">
                <span className="text-primary text-2xl font-mono font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold font-mono">{user.username}</h2>
                  {user.role === 'admin' && (
                    <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                      <Shield className="h-3 w-3 mr-1" /> Admin
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 font-mono">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-mono"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </Button>
            </div>

            {/* Stats */}
            {user.stats && (
              <>
                <Separator className="bg-border my-4" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-primary">
                      {user.stats.totalTemplates}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                      <BookMarked className="h-3 w-3" /> Templates
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-warning">
                      {user.stats.totalRatingPoints}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                      <Star className="h-3 w-3" /> Rating Points
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-accent">
                      {user.stats.templatesCreated}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" /> Created
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Security
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="border-border font-mono text-xs h-7"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </Button>
            </div>
          </CardHeader>
          {showPasswordForm && (
            <CardContent>
              <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                <div>
                  <Label className="text-xs font-mono text-muted-foreground">Current Password</Label>
                  <Input
                    {...register('currentPassword')}
                    type="password"
                    className={`mt-1.5 bg-muted/50 border-border font-mono text-sm ${errors.currentPassword ? 'border-destructive' : ''}`}
                  />
                  {errors.currentPassword && <p className="text-xs text-destructive mt-1">{errors.currentPassword.message}</p>}
                </div>
                <div>
                  <Label className="text-xs font-mono text-muted-foreground">New Password</Label>
                  <Input
                    {...register('newPassword')}
                    type="password"
                    className={`mt-1.5 bg-muted/50 border-border font-mono text-sm ${errors.newPassword ? 'border-destructive' : ''}`}
                  />
                  {errors.newPassword && <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>}
                </div>
                <div>
                  <Label className="text-xs font-mono text-muted-foreground">Confirm New Password</Label>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    className={`mt-1.5 bg-muted/50 border-border font-mono text-sm ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground font-mono"
                  size="sm"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
