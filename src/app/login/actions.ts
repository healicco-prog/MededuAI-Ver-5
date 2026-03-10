'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setRoleCookieAndRedirect(role: string) {
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
    cookieStore.set('role', frontendRole, { 
        secure: process.env.NODE_ENV === 'production', 
        path: '/' 
    });
    
    // Redirect securely based on role
    redirect(`/dashboard/${frontendRole}`);
}
