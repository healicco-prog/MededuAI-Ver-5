"use client";

import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useMentorshipStore } from '@/store/mentorshipStore';
import {
    Users, Calendar, MessageSquare, ClipboardCheck, Search,
    ChevronRight, FileSignature, CheckCircle2,
    Send, AlertCircle, Clock, BarChart, Save
} from 'lucide-react';

export default function MentorDashboardClient() {
    const { users } = useUserStore();
    const { mentees, meetings, chats, assessments, addMeeting, signMeeting, approveMeeting, addAssessment, sendMessage } = useMentorshipStore();
    
    // Simulating the logged-in teacher (mentor)
    const currentMentor = users.find(u => u.role === 'teacher' && u.name === 'Dr. Gregory House') || users.find(u => u.role === 'teacher');
    
    // For Coordinator view, find mentees that belong to mentors under this coordinator.
    // In a real app, there'd be a relation mapping `mentor.coordinatorId === currentTeacher.id`.
    // Here we'll just say Dr. Cuddy is a Coordinator, or assume any Teacher can coordinate others.
    const isCoordinator = currentMentor?.name === 'Dr. Lisa Cuddy' || true; // Mock: everyone can see coordinator tab for demo
    const allMentors = users.filter(u => u.role === 'teacher' && u.id !== currentMentor?.id);
    
    const [viewMode, setViewMode] = useState<'mentor' | 'coordinator'>('mentor');
    const [activeTab, setActiveTab] = useState<'mentees' | 'meetings' | 'chats' | 'assessments'>('mentees');
    const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);

    // Mock states for forms
    const [meetingForm, setMeetingForm] = useState({
        date: '',
        issuesRaised: '',
        actionTaken: '',
        discussionPoints: '',
        goalSetting: '',
        nextMeetingDate: '',
        sendFeedback: true
    });

    const [chatInput, setChatInput] = useState('');

    const [assessmentForm, setAssessmentForm] = useState({
        attendanceRemarks: '',
        assessmentsRemarks: '',
        nonScholasticRemarks: ''
    });

    const currentMentees = mentees.filter(m => m.mentorId === currentMentor?.id);
    const selectedMentee = currentMentees.find(m => m.id === selectedMenteeId);

    // Filter data for the selected mentee
    const menteeMeetings = meetings.filter(m => m.menteeId === selectedMenteeId);
    const menteeAssessment = assessments.find(a => a.menteeId === selectedMenteeId && a.year === selectedMentee?.year);

    
    const renderMenteesTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        My Mentees
                    </h3>
                    <div className="space-y-3">
                        {currentMentees.map(mentee => (
                            <button
                                key={mentee.id}
                                onClick={() => setSelectedMenteeId(mentee.id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                                    selectedMenteeId === mentee.id
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                                }`}
                            >
                                <div>
                                    <div className="font-bold text-slate-900">{mentee.studentName}</div>
                                    <div className="text-sm text-slate-500">Year: {mentee.year}</div>
                                </div>
                                <ChevronRight className={`w-5 h-5 ${selectedMenteeId === mentee.id ? 'text-purple-600' : 'text-slate-400'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
                    {selectedMentee ? (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedMentee.studentName}</h2>
                                    <p className="text-slate-500">Academic Year: {selectedMentee.year}</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('meetings')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                                >
                                    Schedule Meeting
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 font-medium mb-1">Total Meetings</div>
                                    <div className="text-2xl font-bold text-slate-800">{menteeMeetings.length}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 font-medium mb-1">Avg Score</div>
                                    <div className="text-2xl font-bold text-slate-800">
                                        {Math.round(selectedMentee.progressData.reduce((a,b)=>a+b,0)/selectedMentee.progressData.length)}%
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <BarChart className="w-5 h-5 text-purple-600" />
                                    Progress Overview
                                </h3>
                                <div className="h-64 flex items-end justify-between px-4 pb-4 border-b border-l border-slate-200 bg-slate-50/50 rounded-bl-xl pt-8">
                                    {selectedMentee.progressData.map((val, idx) => (
                                        <div key={idx} className="flex flex-col items-center w-full">
                                            <div 
                                                className="w-12 bg-purple-500 rounded-t-lg transition-all duration-1000 ease-out hover:bg-purple-600 cursor-pointer relative group flex items-end justify-center pb-2 text-white text-xs font-bold"
                                                style={{ height: `${val}%` }}
                                            >
                                                {val}%
                                                <div className="absolute -top-10 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    Assessment {idx + 1}: {val}%
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-2 font-medium">Asmt {idx + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Users className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium">Select a mentee from the list to view their progress.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderMeetingsTab = () => (
         <div className="space-y-6">
            {!selectedMentee ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Mentee Selected</h3>
                    <p className="text-slate-600">Please select a mentee from the &quot;Mentees&quot; tab to schedule or view meetings.</p>
                    <button onClick={() => setActiveTab('mentees')} className="mt-4 px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">
                        Go to Mentees
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Meeting Form */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Calendar className="w-6 h-6 text-purple-600" /> Log New Meeting</span>
                            <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-700 rounded-full">{selectedMentee.studentName}</span>
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Meeting Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={meetingForm.date}
                                    onChange={e => setMeetingForm({...meetingForm, date: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Issues Raised (by Student)</label>
                                <textarea 
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    value={meetingForm.issuesRaised}
                                    onChange={e => setMeetingForm({...meetingForm, issuesRaised: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Action Taken on Previous Issues</label>
                                <textarea 
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    value={meetingForm.actionTaken}
                                    onChange={e => setMeetingForm({...meetingForm, actionTaken: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Discussion Points</label>
                                <textarea 
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    value={meetingForm.discussionPoints}
                                    onChange={e => setMeetingForm({...meetingForm, discussionPoints: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Goal Setting for Next Meeting</label>
                                <textarea 
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    value={meetingForm.goalSetting}
                                    onChange={e => setMeetingForm({...meetingForm, goalSetting: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date for Next Meeting</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={meetingForm.nextMeetingDate}
                                    onChange={e => setMeetingForm({...meetingForm, nextMeetingDate: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="sendFeedback"
                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded cursor-pointer"
                                    checked={meetingForm.sendFeedback}
                                    onChange={e => setMeetingForm({...meetingForm, sendFeedback: e.target.checked})}
                                />
                                <label htmlFor="sendFeedback" className="text-sm font-bold text-slate-700 cursor-pointer">Request Mentee Feedback</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button 
                                    onClick={() => {
                                        if(!currentMentor || !selectedMenteeId || !meetingForm.date) return alert("Please fill at least the meeting date.");
                                        addMeeting({
                                            menteeId: selectedMenteeId,
                                            mentorId: currentMentor.id,
                                            isPeerMeeting: false,
                                            date: meetingForm.date,
                                            issuesRaised: meetingForm.issuesRaised,
                                            actionTaken: meetingForm.actionTaken,
                                            discussionPoints: meetingForm.discussionPoints,
                                            goalSetting: meetingForm.goalSetting,
                                            nextMeetingDate: meetingForm.nextMeetingDate,
                                            feedbackSent: meetingForm.sendFeedback,
                                            isSigned: false
                                        });
                                        setMeetingForm({ date: '', issuesRaised: '', actionTaken: '', discussionPoints: '', goalSetting: '', nextMeetingDate: '', sendFeedback: true});
                                        alert("Meeting Saved!");
                                    }}
                                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Save Record
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Previous Meetings List */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
                            Meeting History
                            <span className="text-sm font-medium text-slate-500">{menteeMeetings.length} Records</span>
                        </h3>

                        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
                            {menteeMeetings.length === 0 ? (
                                <div className="text-center text-slate-400 py-12">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    No meetings recorded yet.
                                </div>
                            ) : (
                                menteeMeetings.map(meeting => (
                                    <div key={meeting.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="font-bold text-slate-800 text-lg">{new Date(meeting.date).toLocaleDateString()}</div>
                                            <div className="flex items-center gap-2">
                                                {meeting.isSigned ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                                        <CheckCircle2 className="w-3 h-3" /> Signed
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => signMeeting(meeting.id)}
                                                        className="text-xs font-bold text-purple-600 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded transition flex items-center gap-1"
                                                    >
                                                        <FileSignature className="w-3 h-3" /> Sign Record
                                                    </button>
                                                )}
                                                {meeting.coordinatorApproved && (
                                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded" title="Coordinator Approved">
                                                        Co-ordin. ✅
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-bold text-slate-700">Discussion:</span> {meeting.discussionPoints || 'N/A'}</div>
                                            <div><span className="font-bold text-slate-700">Goals:</span> {meeting.goalSetting || 'N/A'}</div>
                                            {meeting.nextMeetingDate && (
                                                <div className="mt-2 inline-block px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600">
                                                    Next Meeting: {new Date(meeting.nextMeetingDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderChatTab = () => (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex h-[600px]">
            {/* Contacts Sidebar */}
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-3">Messages</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input type="text" placeholder="Search..." className="w-full pl-9 pr-3 py-2 text-sm border-slate-300 rounded-lg outline-none focus:border-purple-500 border" />
                    </div>
                </div>
                
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    <button 
                        onClick={() => setSelectedMenteeId(null)}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${!selectedMenteeId ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700"><Users className="w-5 h-5"/></div>
                        <div>
                            <div>Group Broadcast</div>
                            <div className="text-xs text-slate-500 font-normal">Message all mentees</div>
                        </div>
                    </button>
                    
                    <div className="pt-4 pb-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Direct Messages</div>
                    
                    {currentMentees.map(mentee => (
                        <button 
                            key={mentee.id}
                            onClick={() => setSelectedMenteeId(mentee.id)}
                            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedMenteeId === mentee.id ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                {mentee.studentName.charAt(0)}
                            </div>
                            <div className="truncate">
                                <div className="truncate">{mentee.studentName}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div className="font-bold text-lg text-slate-800">
                        {!selectedMenteeId ? 'Broadcast to All Mentees' : selectedMentee?.studentName}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {chats
                        .filter(c => (selectedMenteeId === null && c.receiverId === 'group') || (selectedMenteeId && (c.receiverId === selectedMenteeId || (c.senderId === selectedMenteeId && c.receiverId === currentMentor?.id))))
                        .map(chat => {
                            const isMe = chat.senderId === currentMentor?.id;
                            return (
                                <div key={chat.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-3 ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                                        {!isMe && <div className="text-xs font-bold text-purple-600 mb-1">{chat.senderName}</div>}
                                        <div className="text-sm">{chat.message}</div>
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                                            {new Date(chat.timestamp).toLocaleTimeString([], {timeStyle: 'short'})}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="flex gap-2 relative">
                        <input 
                            type="text" 
                            placeholder={!selectedMenteeId ? "Type a broadcast message..." : "Type a message..."}
                            className="flex-1 border border-slate-300 rounded-full px-4 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && chatInput.trim() && currentMentor) {
                                    sendMessage({
                                        senderId: currentMentor.id,
                                        senderName: currentMentor.name,
                                        receiverId: selectedMenteeId || 'group',
                                        message: chatInput.trim()
                                    });
                                    setChatInput('');
                                }
                            }}
                        />
                        <button 
                            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
                            onClick={() => {
                                if(chatInput.trim() && currentMentor) {
                                    sendMessage({
                                        senderId: currentMentor.id,
                                        senderName: currentMentor.name,
                                        receiverId: selectedMenteeId || 'group',
                                        message: chatInput.trim()
                                    });
                                    setChatInput('');
                                }
                            }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAssessmentTab = () => (
         <div className="space-y-6">
            {!selectedMentee ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Mentee</h3>
                    <p className="text-slate-600">Please select a mentee to complete their End of Year report.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-between">
                        End of Year Overall Assessment
                        {menteeAssessment?.isSignedAndLocked && (
                            <span className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-4 h-4" /> Signed & Locked
                            </span>
                        )}
                    </h3>
                    <p className="text-slate-500 mb-8 border-b border-slate-100 pb-4">
                        Student: <span className="font-bold text-slate-800">{selectedMentee.studentName}</span> | 
                        Academic Year: <span className="font-bold text-slate-800">{selectedMentee.year}</span>
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Attendance Remarks</label>
                            <textarea 
                                rows={3}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="Describe the student's attendance performance this year..."
                                value={menteeAssessment ? menteeAssessment.attendanceRemarks : assessmentForm.attendanceRemarks}
                                onChange={e => setAssessmentForm({...assessmentForm, attendanceRemarks: e.target.value})}
                                disabled={!!menteeAssessment?.isSignedAndLocked}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Assessments / Scholastic Remarks</label>
                            <textarea 
                                rows={3}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="Summarize scholastic achievement and formative/summative scores..."
                                value={menteeAssessment ? menteeAssessment.assessmentsRemarks : assessmentForm.assessmentsRemarks}
                                onChange={e => setAssessmentForm({...assessmentForm, assessmentsRemarks: e.target.value})}
                                disabled={!!menteeAssessment?.isSignedAndLocked}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Non-Scholastic Remarks</label>
                            <textarea 
                                rows={3}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="Participation in extracurriculars, behavioral traits, leadership..."
                                value={menteeAssessment ? menteeAssessment.nonScholasticRemarks : assessmentForm.nonScholasticRemarks}
                                onChange={e => setAssessmentForm({...assessmentForm, nonScholasticRemarks: e.target.value})}
                                disabled={!!menteeAssessment?.isSignedAndLocked}
                            />
                        </div>

                        {!menteeAssessment?.isSignedAndLocked && (
                            <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
                                <button className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                                    Save Draft
                                </button>
                                <button 
                                    onClick={() => {
                                        if(!currentMentor || !selectedMenteeId) return;
                                        if(!assessmentForm.attendanceRemarks || !assessmentForm.assessmentsRemarks) return alert("Please fill major remarks.");
                                        
                                        if(confirm("Are you sure you want to sign and lock this assessment? It cannot be changed once locked and the student will be moved to the next year computationally.")) {
                                            addAssessment({
                                                menteeId: selectedMenteeId,
                                                mentorId: currentMentor.id,
                                                year: selectedMentee.year,
                                                attendanceRemarks: assessmentForm.attendanceRemarks,
                                                assessmentsRemarks: assessmentForm.assessmentsRemarks,
                                                nonScholasticRemarks: assessmentForm.nonScholasticRemarks,
                                                isSignedAndLocked: true
                                            });
                                            alert("Report locked and approved!");
                                        }
                                    }}
                                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <ClipboardCheck className="w-4 h-4" /> Sign & Lock Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderCoordinatorView = () => {
        // Find mentees under other mentors
        const menteesOfOthers = mentees.filter(m => m.mentorId !== currentMentor?.id);
        const coordinatorMeetingsToApprove = meetings.filter(m => 
            menteesOfOthers.some(mentee => mentee.id === m.menteeId) &&
            m.isSigned && !m.coordinatorApproved
        );

        return (
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Assigned Mentors
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Teachers you co-ordinate.</p>
                        <div className="space-y-3">
                            {allMentors.map(mentor => {
                                const mCount = mentees.filter(m => m.mentorId === mentor.id).length;
                                return (
                                    <div key={mentor.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{mentor.name}</div>
                                            <div className="text-xs text-slate-500">{mCount} Mentees</div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                            <Users className="w-4 h-4"/>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-h-[600px] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <FileSignature className="w-5 h-5 text-blue-600" /> Pending Approvals
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">Meetings conducted by Mentors waiting for your sign-off.</p>

                        <div className="space-y-4">
                            {coordinatorMeetingsToApprove.length === 0 ? (
                                <div className="text-center text-slate-400 py-12">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-emerald-500" />
                                    No pending approvals.
                                </div>
                            ) : (
                                coordinatorMeetingsToApprove.map(meeting => {
                                    const menteeObj = mentees.find(m => m.id === meeting.menteeId);
                                    const mentorObj = users.find(u => u.id === meeting.mentorId);
                                    return (
                                        <div key={meeting.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-800">{menteeObj?.studentName}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Mentored by {mentorObj?.name}</span>
                                                </div>
                                                <div className="text-sm text-slate-600 mb-2">
                                                    Meeting Date: <span className="font-semibold">{new Date(meeting.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-sm bg-slate-50 p-2 rounded border border-slate-100 italic">
                                                    &quot;{meeting.discussionPoints}&quot;
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    approveMeeting(meeting.id);
                                                    alert("Meeting Approved and Signed by Coordinator.");
                                                }}
                                                className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition"
                                            >
                                                Approve & Sign
                                            </button>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                 </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentorship Portal</h1>
                    <p className="text-slate-600">Monitor mentee progress, schedule meetings, and provide end-of-year assessments.</p>
                </div>
                {isCoordinator && (
                    <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
                        <button 
                            onClick={() => setViewMode('mentor')}
                            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${viewMode === 'mentor' ? 'bg-white text-purple-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            As Mentor
                        </button>
                        <button 
                            onClick={() => setViewMode('coordinator')}
                            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${viewMode === 'coordinator' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            As Coordinator
                        </button>
                    </div>
                )}
            </div>

            {viewMode === 'mentor' ? (
                <>
                    {/* Inner navigation for Mentor view */}
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                        <button 
                            onClick={() => setActiveTab('mentees')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                                activeTab === 'mentees' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Users className="w-4 h-4" /> My Mentees
                        </button>
                        <button 
                            onClick={() => setActiveTab('meetings')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                                activeTab === 'meetings' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Calendar className="w-4 h-4" /> Meetings Log
                        </button>
                        <button 
                            onClick={() => setActiveTab('chats')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                                activeTab === 'chats' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" /> Chat & Broadcast
                        </button>
                        <button 
                            onClick={() => setActiveTab('assessments')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                                activeTab === 'assessments' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <ClipboardCheck className="w-4 h-4" /> End-Year Assessment
                        </button>
                    </div>

                    {activeTab === 'mentees' && renderMenteesTab()}
                    {activeTab === 'meetings' && renderMeetingsTab()}
                    {activeTab === 'chats' && renderChatTab()}
                    {activeTab === 'assessments' && renderAssessmentTab()}
                </>
            ) : (
                renderCoordinatorView()
            )}
        </div>
    );
}
