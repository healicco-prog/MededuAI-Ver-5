'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Home, Loader2, Mail, Lock, CheckCircle2, UserCircle, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ROLES = [
  { id: 'student', label: 'Student' },
  { id: 'teacher', label: 'Teacher' },
  { id: 'department_admin', label: 'Department Head' },
  { id: 'institution_admin', label: 'Institution Head' },
];

export default function SignUpPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (signUpError) {
            setError(signUpError.message);
        } else {
            // If email confirmation is required, Supabase returns a user but no session
            if (data.user && data.session === null) {
                router.push('/login?message=Signup+successful.+Please+check+your+email+to+verify.');
            } else {
                // If email confirmation is OFF, they are logged in automatically
                router.push('/auth/callback'); 
            }
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
                <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BrainCircuit className="text-white w-7 h-7" />
                    </div>
                    <span className="font-bold text-2xl text-slate-900 tracking-tight">MedEduAI</span>
                </div>

                <h2 className="text-center text-xl font-bold text-slate-800 mb-2">
                    {step === 'form' ? 'Create an Account' : 'Check Your Inbox'}
                </h2>
                <p className="text-center text-sm text-slate-500 mb-8">
                    {step === 'form' 
                        ? 'Join MedEduAI to access your dashboard.' 
                        : 'We sent a verification link to your email address.'}
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center flex items-center justify-center gap-2">
                        <span className="font-bold">!</span> {error}
                    </div>
                )}

                {step === 'form' ? (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        
                        {/* Role Selection */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">I am a</label>
                            <div className="relative">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    placeholder="Enter your name"
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@institution.edu"
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Create a password"
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="pb-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm your password"
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Account
                        </button>
                        
                        <div className="text-center pt-2">
                            <p className="text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all">
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-100">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-lg font-bold text-slate-900">
                                Registration Successful!
                            </p>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    We sent a secure verification link to:<br/>
                                    <span className="font-bold text-slate-900 block mt-1">{email}</span>
                                </p>
                            </div>
                            <p className="text-sm text-slate-500">
                                Please check your inbox and click the link to activate your account and log in.
                            </p>
                        </div>
                        
                        <div className="pt-4">
                            <Link href="/login">
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                                >
                                    Return to Login
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <Link href="/" className="text-sm font-bold text-slate-400 hover:text-emerald-600 flex items-center justify-center gap-2 transition-colors">
                        <Home className="w-4 h-4" /> Back to Home Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
