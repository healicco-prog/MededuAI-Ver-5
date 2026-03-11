'use server';

import { cookies } from 'next/headers';

export async function setRoleCookie(role: string) {
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
    cookieStore.set('__session', frontendRole, { 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax'
    });
    
    return frontendRole;
}
