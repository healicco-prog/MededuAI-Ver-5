import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// Rebuilding root dashboard layout to wake watcher
import DashboardLayoutClient from './DashboardLayoutClient';
import React from 'react';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const rawRole = cookieStore.get('__session')?.value;
    const role = rawRole || 'student';
    const authToken = cookieStore.get('auth_token')?.value;

    async function handleLogout() {
        'use server';
        const cookieStore = await cookies();
        const currentRole = cookieStore.get('__session')?.value;
        cookieStore.delete('__session');
        cookieStore.delete('auth_token');
        return currentRole;
    }

    return (
        <DashboardLayoutClient role={role} handleLogout={handleLogout}>
            {children}
        </DashboardLayoutClient>
    );
}
