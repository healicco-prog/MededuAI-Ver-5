'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Home, Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { setRoleCookie } from './actions';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data?.user) {
            try {
                // Get the user's role from the profiles table
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                let role = 'student'; // Default role
                if (data.user.user_metadata?.role) {
                    role = data.user.user_metadata.role;
                } else if (profileData && profileData.role) {
                    role = profileData.role;
                }

                // Set the role cookie and get the frontend role
                const frontendRole = await setRoleCookie(role, data.session?.access_token);
                
                // Use a hard reload window location to fully reset Next.js client-side caches and cookies
                window.location.href = `/dashboard/${frontendRole}`;
            } catch (err: any) {
                console.error("Redirection logic failed: ", err);
                setError("Failed to fetch user profile. Please contact support.");
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
                <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BrainCircuit className="text-white w-7 h-7" />
                    </div>
                    <span className="font-bold text-2xl text-slate-900 tracking-tight">MedEduAI</span>
                </div>

                <h2 className="text-center text-xl font-bold text-slate-800 mb-2">
                    Welcome Back
                </h2>
                <p className="text-center text-sm text-slate-500 mb-8">
                    Sign in to MedEduAI using your email and password.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center flex items-center justify-center gap-2">
                        <span className="font-bold">!</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email Input */}
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

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                            <label className="block text-sm font-bold text-slate-700">Password</label>
                            <Link href="/auth/forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow mt-6"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Log In
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <Link href="/" className="text-sm font-bold text-slate-400 hover:text-emerald-600 flex items-center justify-center gap-2 transition-colors">
                        <Home className="w-4 h-4" /> Back to Home Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
