"use client";

import React, { useState } from 'react';
import { Building2, Users, UserPlus, FileSpreadsheet, Send, BarChart3, ChevronRight, ArrowLeft } from 'lucide-react';
import InstitutionSetup from './InstitutionSetup';
import DepartmentManager from './DepartmentManager';
import MentorManager from './MentorManager';
import MenteeManager from './MenteeManager';
import MentorshipAllocation from './MentorshipAllocation';
import BulkMessaging from './BulkMessaging';

export default function MentoringHubClient() {
    const modules = [
        {
            id: 'departments',
            title: 'Department Setup',
            description: 'Create departments and assign department heads to manage faculty.',
            icon: <Building2 className="w-6 h-6" />,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            id: 'mentors',
            title: 'Mentor Management',
            description: 'Upload and manage mentors manually or via Excel imports.',
            icon: <Users className="w-6 h-6" />,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            id: 'mentees',
            title: 'Mentee Management',
            description: 'Upload and manage student mentees batch-wise using Excel.',
            icon: <UserPlus className="w-6 h-6" />,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            id: 'allocation',
            title: 'Mentorship Allocation',
            description: 'Allocate mentees manually or automatically via Serial/Random distribution.',
            icon: <FileSpreadsheet className="w-6 h-6" />,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            id: 'messaging',
            title: 'Bulk Messaging',
            description: 'Send broadcast messages to department heads, mentors, or all mentees.',
            icon: <Send className="w-6 h-6" />,
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        },
        {
            id: 'analytics',
            title: 'Analytics & Reports',
            description: 'View mentor-mentee ratios, meeting compliance, and student performance metrics.',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        }
    ];

    const [hasOnboarded, setHasOnboarded] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    if (!hasOnboarded) {
        return <InstitutionSetup onComplete={() => setHasOnboarded(true)} />;
    }

    return (
        <div className="flex flex-col gap-6">
            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => setActiveTab(mod.id)}
                            className="p-6 bg-white border rounded-3xl text-left transition-all hover:shadow-md group border-slate-200"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${mod.bg} ${mod.color}`}>
                                {mod.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 flex justify-between items-center">
                                {mod.title}
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-slate-700" />
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{mod.description}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex items-center">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Modules
                    </button>
                </div>
            )}

            {activeTab === 'overview' ? (
                <div className="bg-white border p-8 md:p-12 border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm relative py-20">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a Module</h2>
                    <p className="text-slate-500">Choose a management module from above to begin configuring your institution's mentorship structure.</p>
                </div>
            ) : (
                <div className="bg-white border p-6 md:p-8 border-slate-200 rounded-3xl flex flex-col shadow-sm relative animate-in fade-in slide-in-from-bottom-4">
                    {activeTab === 'departments' && <DepartmentManager />}
                    {activeTab === 'mentors' && <MentorManager />}
                    {activeTab === 'mentees' && <MenteeManager />}
                    {activeTab === 'allocation' && <MentorshipAllocation />}
                    {activeTab === 'messaging' && <BulkMessaging />}
                    
                    {activeTab !== 'departments' && activeTab !== 'mentors' && activeTab !== 'mentees' && activeTab !== 'allocation' && activeTab !== 'messaging' && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2 capitalize">{activeTab} Interface</h2>
                            <p className="text-slate-500 mt-4">This module form is currently under active development. Soon you will be able to manage this section.</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
