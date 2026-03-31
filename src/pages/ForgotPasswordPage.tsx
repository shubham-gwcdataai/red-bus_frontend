import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Mail, Bus, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '@/services/api';
import Button from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#d63031] rounded-xl flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black text-[#1a1a2e]">
                red<span className="text-[#d63031]">Bus</span>
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-[#1a1a2e] mb-2">Check Your Email</h1>
            <p className="text-gray-500 text-sm mb-6">
              We've sent password reset instructions to your email address.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Didn't receive the email? Check your spam folder or{' '}
              <button onClick={() => setIsSubmitted(false)} className="text-[#d63031] font-medium hover:underline">
                try again
              </button>
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-[#d63031] font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#d63031] rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-[#1a1a2e]">
              red<span className="text-[#d63031]">Bus</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[#1a1a2e]">Forgot Password?</h1>
          <p className="mt-1.5 text-gray-500 text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Error</p>
                <p className="text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a1a2e]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  onChange={() => setError(null)}
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

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#d63031] font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
