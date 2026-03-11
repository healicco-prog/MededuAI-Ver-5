'use server';

import { cookies } from 'next/headers';

export async function setRoleCookie(role: string, jwtToken?: string) {
    const roleMapping: Record<string, string> = {
        'super_admin': 'superadmin',
        'master_admin': 'masteradmin',
        'institution_admin': 'instadmin',
        'department_admin': 'deptadmin',
        'teacher': 'teacher',
        'student': 'student'
    };

    const frontendRole = roleMapping[role] || 'student';

    const cookieStore = await cookies();
    
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = { 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
        httpOnly: true,
        secure: isProd
    };

    cookieStore.set('__session', frontendRole, cookieOptions);
    
    if (jwtToken) {
        cookieStore.set('auth_token', jwtToken, cookieOptions);
    }
    
    return frontendRole;
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();
    const currentRole = cookieStore.get('__session')?.value;
    cookieStore.delete('__session');
    cookieStore.delete('auth_token');
    return currentRole;
}
