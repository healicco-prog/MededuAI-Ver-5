import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DeptAssessmentsClient from './DeptAssessmentsClient';

export default async function AdminMentorshipPage() {
    // Only allow deptadmin, instadmin, masteradmin, superadmin
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value;

    if (!role || (role !== 'deptadmin' && role !== 'instadmin' && role !== 'masteradmin' && role !== 'superadmin')) {
        return (
            <div className="p-8 text-center mt-20">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-500">You do not have permission to view the Department Assessments dashboard.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 flex-shrink-0">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assessments & Attendance</h2>
                <p className="text-slate-500 mt-1">Manage scholastic and neo-scholastic records for department mentees.</p>
            </div>
            
            <div className="flex-1 min-h-0 bg-transparent">
                <DeptAssessmentsClient />
            </div>
        </div>
    );
}
