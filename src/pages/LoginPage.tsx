import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Bus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const schema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const navigate             = useNavigate();
  const location             = useLocation();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const from = (location.state as { from?: string })?.from || '/';
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const result = await login(data);

    if (result.success) {
      const userRole = (result.user as any)?.role;
      if (userRole === 'admin' && (from === '/' || from === '/login')) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setServerError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#d63031] rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-[#1a1a2e]">
              red<span className="text-[#d63031]">Bus</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[#1a1a2e]">Welcome back</h1>
          <p className="mt-1.5 text-gray-500 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* Server error banner */}
          {serverError && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Login failed</p>
                <p className="text-sm mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a1a2e]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  onChange={() => setServerError(null)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-[#1a1a2e]
                    focus:outline-none focus:ring-2 focus:ring-[#d63031] focus:border-transparent
                    transition-all duration-150
                    ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a1a2e]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      formRef.current?.dispatchEvent(new Event('submit', { bubbles: true }));
                    }
                  }}
                  onChange={() => setServerError(null)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-[#1a1a2e]
                    focus:outline-none focus:ring-2 focus:ring-[#d63031] focus:border-transparent
                    transition-all duration-150
                    ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />{errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-[#d63031] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#d63031] font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;