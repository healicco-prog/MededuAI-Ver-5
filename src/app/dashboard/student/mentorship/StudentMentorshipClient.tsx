"use client";

import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useMentorshipStore } from '@/store/mentorshipStore';
import {
    User, Users, Calendar, MessageSquare, Save, ChevronRight,
    Send, AlertCircle, Clock, CheckCircle2, FileSignature
} from 'lucide-react';

export default function StudentMentorshipClient() {
    const { users } = useUserStore();
    const { 
        mentees, meetings, chats, addMeeting, 
        markMeetingAttended, addMeetingFeedback, updateMenteeProfile, sendMessage, signMeeting
    } = useMentorshipStore();

    // Mocking logged in student. In this data, Alice Smith is id '2', John Doe is '1'. John has peerMentorId = '2'.
    const currentUser = users.find(u => u.role === 'student' && u.name === 'Alice Smith') || users.find(u => u.role === 'student');
    const myMenteeRecord = mentees.find(m => m.studentId === currentUser?.id);
    
    // Profile Local State
    const [profileForm, setProfileForm] = useState({
        regNo: myMenteeRecord?.regNo || '',
        mobileNumber: myMenteeRecord?.mobileNumber || '',
        emailId: myMenteeRecord?.emailId || currentUser?.email || '',
        permanentAddress: myMenteeRecord?.permanentAddress || '',
        parentName: myMenteeRecord?.parentName || '',
        parentContactNo: myMenteeRecord?.parentContactNo || '',
        parentContactMail: myMenteeRecord?.parentContactMail || ''
    });

    // Peer Mentees assigned to me
    const myPeerMentees = mentees.filter(m => m.peerMentorId === currentUser?.id);
    const isPeerMentor = myPeerMentees.length > 0;

    const [activeTab, setActiveTab] = useState<'profile' | 'mentee' | 'peerMentor'>('profile');
    const [selectedPeerMenteeId, setSelectedPeerMenteeId] = useState<string | null>(null);

    // Mock states for Peer Mentor meeting form
    const [peerMeetingForm, setPeerMeetingForm] = useState({
        date: '',
        academicNonAcademic: 'Academic',
        remarks: '',
        nextMeetingDate: '',
        sendFeedback: true
    });
    
    const [requestStatus, setRequestStatus] = useState('');

    const selectedPeerMentee = myPeerMentees.find(m => m.id === selectedPeerMenteeId);
    const peerMenteeMeetings = meetings.filter(m => m.menteeId === selectedPeerMenteeId && m.isPeerMeeting);
    
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Mentorship Portal</h1>
                    <p className="text-slate-600">Manage your profile, connect with mentors, and guide your peers.</p>
                </div>
            </div>

            {/* Inner navigation */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                        activeTab === 'profile' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <User className="w-4 h-4" /> My Profile
                </button>
                <button 
                    onClick={() => setActiveTab('mentee')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                        activeTab === 'mentee' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Calendar className="w-4 h-4" /> As Mentee
                </button>
                
                <button 
                    onClick={() => setActiveTab('peerMentor')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                        activeTab === 'peerMentor' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border text-blue-700 border-blue-200 hover:bg-blue-50'
                    }`}
                >
                    <Users className="w-4 h-4" /> As Peer Mentor
                </button>
            </div>

            {/* Content areas */}
            {activeTab === 'profile' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-3xl">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        Mentorship Profile Setup
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Registration Number (University ID)</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={profileForm.regNo}
                                    onChange={e => setProfileForm({...profileForm, regNo: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
                                <input 
                                    type="tel" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={profileForm.mobileNumber}
                                    onChange={e => setProfileForm({...profileForm, mobileNumber: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email ID</label>
                                <input 
                                    type="email" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={profileForm.emailId}
                                    onChange={e => setProfileForm({...profileForm, emailId: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Permanent Address</label>
                                <textarea 
                                    rows={3} 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    value={profileForm.permanentAddress}
                                    onChange={e => setProfileForm({...profileForm, permanentAddress: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <h4 className="text-md font-bold text-slate-800 md:col-span-2">Parent / Guardian Details</h4>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={profileForm.parentName}
                                    onChange={e => setProfileForm({...profileForm, parentName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Contact No</label>
                                <input 
                                    type="tel" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={profileForm.parentContactNo}
                                    onChange={e => setProfileForm({...profileForm, parentContactNo: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Contact Email</label>
                                <input 
                                    type="email" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={profileForm.parentContactMail}
                                    onChange={e => setProfileForm({...profileForm, parentContactMail: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end items-center gap-4">
                            {requestStatus && (
                                <span className={`text-sm font-bold ${requestStatus.includes('Complete') ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {requestStatus}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    if(!profileForm.regNo.trim() || !profileForm.mobileNumber.trim()) {
                                        setRequestStatus("Complete your profile");
                                    } else {
                                        setRequestStatus("Request submitted");
                                    }
                                }}
                                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                            >
                                Request mentorship
                            </button>
                            <button 
                                onClick={() => {
                                    if(myMenteeRecord) {
                                        updateMenteeProfile(myMenteeRecord.id, profileForm);
                                        alert("Profile successfully updated!");
                                    } else {
                                        alert("Mentee record not found.");
                                    }
                                }}
                                className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            
            {activeTab === 'mentee' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Meetings & Feedback */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                My Mentorship Sessions
                            </h3>
                            <div className="space-y-4">
                                {meetings.filter(m => m.menteeId === myMenteeRecord?.id).length === 0 ? (
                                    <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500">
                                        No upcoming or past meetings scheduled yet.
                                    </div>
                                ) : (
                                    meetings
                                        .filter(m => m.menteeId === myMenteeRecord?.id)
                                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map(meeting => (
                                            <div key={meeting.id} className="border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded mb-2 inline-block ${meeting.isPeerMeeting ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                            {meeting.isPeerMeeting ? 'Peer Session' : 'Mentor Session'}
                                                        </span>
                                                        <h4 className="font-bold text-slate-800">{new Date(meeting.date).toLocaleDateString()}</h4>
                                                        {meeting.nextMeetingDate && (
                                                            <div className="text-xs text-slate-500 mt-1">Next scheduled: {new Date(meeting.nextMeetingDate).toLocaleDateString()}</div>
                                                        )}
                                                    </div>
                                                    
                                                    {meeting.isSigned && !meeting.attendedByMentee && (
                                                        <button 
                                                            onClick={() => markMeetingAttended(meeting.id)}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                                                        >
                                                            Mark Attended
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Feedback Section */}
                                                {meeting.attendedByMentee && !meeting.menteeFeedback && (
                                                    <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <label className="block text-xs font-bold text-slate-700 mb-2">Provide Feedback for this session:</label>
                                                        <textarea 
                                                            id={`feedback-${meeting.id}`}
                                                            rows={2}
                                                            className="w-full text-sm border border-slate-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
                                                            placeholder="How was the session? Was it helpful?"
                                                        />
                                                        <div className="flex justify-end">
                                                            <button 
                                                                onClick={() => {
                                                                    const input = document.getElementById(`feedback-${meeting.id}`) as HTMLTextAreaElement;
                                                                    if(input && input.value) {
                                                                        addMeetingFeedback(meeting.id, input.value);
                                                                    }
                                                                }}
                                                                className="px-3 py-1 bg-slate-800 text-white text-xs rounded hover:bg-slate-700"
                                                            >
                                                                Submit Feedback
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {meeting.menteeFeedback && (
                                                    <div className="text-sm italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                        <span className="font-bold not-italic text-slate-800">Your Feedback:</span> &quot;{meeting.menteeFeedback}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>

                        {/* Communications & Notifications */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[500px]">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                Messages &amp; Notifications
                            </h3>
                            
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                {chats.filter(c => c.receiverId === 'group' || c.receiverId === currentUser?.id || c.senderId === currentUser?.id).length === 0 ? (
                                    <div className="text-center p-8 text-slate-400">
                                        No messages or notifications.
                                    </div>
                                ) : (
                                    chats
                                        .filter(c => c.receiverId === 'group' || c.receiverId === currentUser?.id || c.senderId === currentUser?.id)
                                        .map(chat => (
                                        <div key={chat.id} className={`flex ${chat.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-2xl ${
                                                chat.senderId === currentUser?.id 
                                                    ? 'bg-purple-600 text-white rounded-tr-sm' 
                                                    : chat.receiverId === 'group' 
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tl-sm' // Notification style
                                                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                            }`}>
                                                <div className="text-xs opacity-75 mb-1 font-medium flex items-center justify-between gap-4">
                                                    <span>{chat.senderName}</span>
                                                    <span>{new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                {chat.receiverId === 'group' && (
                                                    <div className="text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1 opacity-70">
                                                        <AlertCircle className="w-3 h-3" /> Broadcast
                                                    </div>
                                                )}
                                                <div className="text-sm whitespace-pre-wrap">{chat.message}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-auto shrink-0 flex gap-2 pt-4 border-t border-slate-100">
                                <input 
                                    type="text"
                                    id="menteeMessageInput"
                                    placeholder="Message your mentor..."
                                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const input = e.currentTarget;
                                            if (!input.value.trim() || !currentUser || !myMenteeRecord) return;
                                            sendMessage({
                                                senderId: currentUser.id,
                                                senderName: currentUser.name,
                                                receiverId: myMenteeRecord.mentorId, // Sending directly to assigned mentor
                                                message: input.value.trim()
                                            });
                                            input.value = '';
                                        }
                                    }}
                                />
                                <button 
                                    onClick={() => {
                                        const input = document.getElementById('menteeMessageInput') as HTMLInputElement;
                                        if (!input.value.trim() || !currentUser || !myMenteeRecord) return;
                                        sendMessage({
                                            senderId: currentUser.id,
                                            senderName: currentUser.name,
                                            receiverId: myMenteeRecord.mentorId,
                                            message: input.value.trim()
                                        });
                                        input.value = '';
                                    }}
                                    className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            
            {activeTab === 'peerMentor' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                My Assigned Mentees
                            </h3>
                            <div className="space-y-3">
                                {myPeerMentees.map(mentee => (
                                    <button
                                        key={mentee.id}
                                        onClick={() => setSelectedPeerMenteeId(mentee.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                                            selectedPeerMenteeId === mentee.id
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-bold text-slate-900">{mentee.studentName}</div>
                                            <div className="text-sm text-slate-500">Year: {mentee.year}</div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 ${selectedPeerMenteeId === mentee.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </button>
                                ))}
                                {myPeerMentees.length === 0 && (
                                    <div className="text-sm text-slate-500 italic">No mentees assigned to you currently.</div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
                            {!selectedPeerMentee ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Users className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="font-medium">Select a peer mentee to schedule or view meetings.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">{selectedPeerMentee.studentName}</h2>
                                            <p className="text-slate-500">Peer Mentorship Area</p>
                                        </div>
                                    </div>

                                    {/* Log Meeting Form */}
                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-6">
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" /> Log Session
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                                                    <input 
                                                        type="date" 
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={peerMeetingForm.date}
                                                        onChange={e => setPeerMeetingForm({...peerMeetingForm, date: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Focus Area</label>
                                                    <select 
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={peerMeetingForm.academicNonAcademic}
                                                        onChange={e => setPeerMeetingForm({...peerMeetingForm, academicNonAcademic: e.target.value})}
                                                    >
                                                        <option value="Academic">Academic</option>
                                                        <option value="Non-Academic">Non-Academic</option>
                                                        <option value="Both">Both</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
                                                <textarea 
                                                    rows={2}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                    value={peerMeetingForm.remarks}
                                                    onChange={e => setPeerMeetingForm({...peerMeetingForm, remarks: e.target.value})}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Next Meeting Date (Optional)</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={peerMeetingForm.nextMeetingDate}
                                                    onChange={e => setPeerMeetingForm({...peerMeetingForm, nextMeetingDate: e.target.value})}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    id="peerSendFeedback"
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                                                    checked={peerMeetingForm.sendFeedback}
                                                    onChange={e => setPeerMeetingForm({...peerMeetingForm, sendFeedback: e.target.checked})}
                                                />
                                                <label htmlFor="peerSendFeedback" className="text-xs font-bold text-slate-700 cursor-pointer">Request Mentee Feedback</label>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button 
                                                    onClick={() => {
                                                        if(!currentUser || !selectedPeerMenteeId || !peerMeetingForm.date) return alert("Please fill at least the meeting date.");
                                                        addMeeting({
                                                            menteeId: selectedPeerMenteeId,
                                                            mentorId: currentUser.id,
                                                            isPeerMeeting: true,
                                                            date: peerMeetingForm.date,
                                                            academicNonAcademic: peerMeetingForm.academicNonAcademic,
                                                            remarks: peerMeetingForm.remarks,
                                                            nextMeetingDate: peerMeetingForm.nextMeetingDate,
                                                            feedbackSent: peerMeetingForm.sendFeedback,
                                                            isSigned: false
                                                        });
                                                        setPeerMeetingForm({ date: '', academicNonAcademic: 'Academic', remarks: '', nextMeetingDate: '', sendFeedback: true});
                                                        alert("Peer Mentor Meeting Saved! " + (peerMeetingForm.sendFeedback ? "Feedback form sent to student." : ""));
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                                >
                                                    <Save className="w-4 h-4" /> Save Record
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* History */}
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-600" /> Meeting History
                                        </h4>
                                        <div className="space-y-3">
                                            {peerMenteeMeetings.length === 0 ? (
                                                <div className="text-sm text-slate-500 italic">No meetings recorded yet.</div>
                                            ) : (
                                                peerMenteeMeetings.map(meeting => (
                                                    <div key={meeting.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
                                                        <div className="flex-1 text-sm">
                                                            <div className="font-bold text-slate-800 mb-1">{new Date(meeting.date).toLocaleDateString()}</div>
                                                            <div className="text-slate-600 mb-1"><span className="font-semibold">Focus:</span> {meeting.academicNonAcademic}</div>
                                                            <div className="text-slate-600"><span className="font-semibold">Remarks:</span> {meeting.remarks || 'None'}</div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                                            {meeting.isSigned ? (
                                                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                                                    <CheckCircle2 className="w-3 h-3" /> Signed
                                                                </span>
                                                            ) : (
                                                                <button onClick={() => { signMeeting(meeting.id); }} className="text-xs px-3 py-1 bg-slate-100 font-bold hover:bg-slate-200 rounded transition flex items-center gap-1">
                                                                    <FileSignature className="w-3 h-3 text-slate-600" /> Sign Off
                                                                </button>
                                                            )}
                                                            {meeting.attendedByMentee && (
                                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">Mentee responded to feedback</span>
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
                    </div>
                </div>
            )}
            
        </div>
    );
}
