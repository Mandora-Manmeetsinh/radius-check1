import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';
import '@/styles/Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await client.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="flex items-center justify-center min-h-screen relative w-full">
        <div className="w-full max-w-md">
          <Card className="auth-form-card">
            <CardHeader className="auth-form-header">
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                {isSent ? 'Check your email for the reset link' : 'Enter your email to receive a password reset link'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest ml-1">Email Address</Label>
                    <div className="auth-input-group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 pl-12 bg-muted/50 border-border rounded-2xl focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Link <ArrowRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <Mail className="w-16 h-16 text-primary" />
                  <p className="text-center font-medium">We've sent an email to <strong>{email}</strong>.</p>
                  <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                    Try another email
                  </Button>
                </div>
              )}
              <div className="mt-6 text-center">
                <Link to="/auth" className="flex items-center justify-center text-sm font-medium text-primary hover:underline">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Log In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
