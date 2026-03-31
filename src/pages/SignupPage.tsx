import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Bus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const schema = z.object({
  name:     z.string().min(2,  'Name must be at least 2 characters'),
  email:    z.string().email('Please enter a valid email address'),
  phone:    z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  password: z.string().min(6,  'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
});
type FormValues = z.infer<typeof schema>;

const Field: React.FC<{
  label:    string;
  error?:   string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-[#1a1a2e]">{label}</label>
    {children}
    {error && (
      <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const inputClass = (hasError?: boolean) =>
  `w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-[#1a1a2e]
   focus:outline-none focus:ring-2 focus:ring-[#d63031] focus:border-transparent
   transition-all duration-150
   ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`;

const SignupPage: React.FC = () => {
  const navigate              = useNavigate();
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const result = await signup({
      name:     data.name,
      email:    data.email,
      password: data.password,
      phone:    data.phone,
    });

    if (result.success) {
      navigate('/');
    } else {
      setServerError(result.error || 'Signup failed. Please try again.');
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
          <h1 className="mt-6 text-2xl font-bold text-[#1a1a2e]">Create your account</h1>
          <p className="mt-1.5 text-gray-500 text-sm">Join millions of happy travellers</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* Server Error Banner */}
          {serverError && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Registration failed</p>
                <p className="text-sm mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name */}
            <Field label="Full Name" error={errors.name?.message}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  {...register('name', {
                    onChange: () => setServerError(null),
                  })}
                  className={inputClass(!!errors.name)}
                />
              </div>
            </Field>

            {/* Email */}
            <Field label="Email Address" error={errors.email?.message}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    onChange: () => setServerError(null),
                  })}
                  className={inputClass(!!errors.email)}
                />
              </div>
            </Field>

            {/* Phone */}
            <Field label="Phone Number (optional)" error={errors.phone?.message}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  {...register('phone')}
                  className={inputClass(!!errors.phone)}
                />
              </div>
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  {...register('password')}
                  className={inputClass(!!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  className={inputClass(!!errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-[#d63031] hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-[#d63031] hover:underline">Privacy Policy</a>.
            </p>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#d63031] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;