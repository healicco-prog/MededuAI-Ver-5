"use client";

import React, { useState, useRef } from 'react';
import { 
    CalendarPlus, 
    CalendarDays, 
    Calendar,
    Users, 
    Building2, 
    Upload, 
    Plus, 
    Trash2, 
    Save, 
    Image as ImageIcon,
    Clock,
    FileSpreadsheet,
    CheckCircle2,
    BookOpen,
    X,
    Share2,
    MapPin
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTimetableStore, WeeklyClassSlot, TopicCompetency } from '@/store/timetableStore';

export default function TimetablePage() {
    const [activeTab, setActiveTab] = useState<'formats' | 'schedule' | 'today'>('formats');

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 flex flex-col pb-24 lg:pb-0 min-h-screen lg:h-[calc(100vh-8rem)] pt-4 lg:pt-0">
            {/* Header */}
            <div className="text-center flex-shrink-0">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Time Table MS</h2>
                <p className="text-sm lg:text-base text-slate-500 px-4">Manage academic timetables, faculty schedules, and daily class tracking.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-center p-2 bg-slate-100/50 rounded-2xl mx-auto w-fit flex-shrink-0">
                {[
                    { id: 'formats', label: 'Timetable Formats', icon: <Building2 className="w-4 h-4" /> },
                    { id: 'schedule', label: 'Schedule Classes', icon: <CalendarPlus className="w-4 h-4" /> },
                    { id: 'today', label: "What's Today", icon: <CalendarDays className="w-4 h-4" /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-auto lg:h-0 overflow-visible lg:overflow-y-auto relative min-h-[600px] lg:min-h-0 relative">
                
                {/* 1. FORMATS TAB */}
                {activeTab === 'formats' && <FormatsTabView />}

                {/* 2. SCHEDULE TAB */}
                {activeTab === 'schedule' && <SchedulingTabView />}

                {/* 3. WHAT'S TODAY TAB */}
                {activeTab === 'today' && <TodayTabView />}
            </div>
        </div>
    );
}

// ==========================================
// Formats Tab Component
// ==========================================
function FormatsTabView() {
    const { formats, addFormat, deleteFormat } = useTimetableStore();
    
    // View States: 'list' | 'create'
    const [view, setView] = useState<'list' | 'create'>('list');

    // Form State
    const [instituteName, setInstituteName] = useState('');
    const [course, setCourse] = useState('');
    const [department, setDepartment] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    
    const [weeklySlots, setWeeklySlots] = useState<WeeklyClassSlot[]>([]);
    const [newSlot, setNewSlot] = useState({ day: 'Monday', fromTime: '', toTime: '' });

    const [facultyMembers, setFacultyMembers] = useState<string[]>([]);
    const [newFaculty, setNewFaculty] = useState('');

    const [topicsPool, setTopicsPool] = useState<TopicCompetency[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoUrl(URL.createObjectURL(file));
        }
    };

    const handleAddSlot = () => {
        if (!newSlot.fromTime || !newSlot.toTime) return alert("Please specify class flow times.");
        setWeeklySlots([...weeklySlots, { 
            id: `slot_${Date.now()}`, 
            day: newSlot.day as any, 
            fromTime: newSlot.fromTime, 
            toTime: newSlot.toTime 
        }]);
        setNewSlot({ day: 'Monday', fromTime: '', toTime: '' }); // reset but keep day Monday default
    };

    const handleAddFaculty = () => {
        if (!newFaculty.trim()) return;
        if (facultyMembers.includes(newFaculty.trim())) return alert("Faculty already exists.");
        setFacultyMembers([...facultyMembers, newFaculty.trim()]);
        setNewFaculty('');
    };

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const parsedTopics: TopicCompetency[] = [];
            
            data.forEach((row: any) => {
                // Look for common variations of Topic and Competency headers
                let topicStr = row['Topic'] || row['TOPIC'] || row['Topic Name'] || '';
                let compStr = row['Competency No'] || row['Competency'] || row['COMPETENCY'] || row['Comp. No.'] || '';

                if (topicStr && typeof topicStr === 'string' && topicStr.trim() !== '') {
                    parsedTopics.push({
                        id: `top_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
                        topic: topicStr.trim(),
                        competencyNo: compStr ? String(compStr).trim() : 'N/A',
                        isCompleted: false
                    });
                }
            });

            if (parsedTopics.length > 0) {
                setTopicsPool(parsedTopics);
                alert(`Successfully loaded ${parsedTopics.length} topics!`);
            } else {
                alert("Could not find required columns 'Topic' and 'Competency No' in the Excel sheet. Please format the sheet with these headers and try again.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSaveFormat = () => {
        if (!instituteName || !course || !department) {
            return alert("Institute, Course, and Department are required!");
        }
        if (topicsPool.length === 0) {
            return alert("Please upload at least some syllabus topics via Excel first.");
        }

        addFormat({
            instituteName,
            instituteLogoUrl: logoUrl,
            course,
            department,
            weeklySlots,
            facultyMembers,
            topicsPool
        });

        // Reset
        setInstituteName('');
        setCourse('');
        setDepartment('');
        setLogoUrl(null);
        setWeeklySlots([]);
        setFacultyMembers([]);
        setTopicsPool([]);
        setView('list');
    };

    if (view === 'list') {
        return (
            <div className="p-8 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Your Timetable Formats</h3>
                        <p className="text-sm text-slate-500 font-medium">Create and manage department templates.</p>
                    </div>
                    <button 
                        onClick={() => setView('create')}
                        className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition"
                    >
                        <Plus className="w-4 h-4" /> Create New Format
                    </button>
                </div>
                
                {formats.length === 0 ? (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <Building2 className="w-16 h-16 opacity-50 mb-4" />
                        <h4 className="text-xl font-bold text-slate-600 text-center">No Formats Created Yet</h4>
                        <p className="mt-2 text-sm text-center max-w-sm">Set up a timetable parameter format for a department first to start scheduling.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formats.map(format => (
                            <div key={format.id} className="bg-white border text-slate-800 border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
                                <div className="flex justify-between items-start">
                                    {format.instituteLogoUrl ? (
                                        <img src={format.instituteLogoUrl} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-100 shadow-sm p-1" />
                                    ) : (
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl p-1 border border-indigo-200">
                                            {format.instituteName.charAt(0)}
                                        </div>
                                    )}
                                    <button onClick={() => deleteFormat(format.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{format.course}</h4>
                                    <p className="text-sm font-bold text-indigo-600">{format.department}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-1 truncate">{format.instituteName}</p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"><BookOpen className="w-3 h-3" /> {format.topicsPool.length} Topics</span>
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"><Users className="w-3 h-3" /> {format.facultyMembers.length} Staff</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 h-full flex flex-col space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-6 border-b border-slate-100">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600 mr-2 text-xl">&larr;</button> Create Format</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Define the base parameters for a department timetable.</p>
                </div>
                <button 
                    onClick={handleSaveFormat}
                    className="w-full md:w-auto bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition"
                >
                    <Save className="w-4 h-4" /> Save Format
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Basic Info & Setup */}
                <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-500" /> Organization Details</h4>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Institute Name</label>
                                <input value={instituteName} onChange={e => setInstituteName(e.target.value)} type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium" placeholder="e.g., Medical College..." />
                            </div>
                            <div className="w-full md:w-32 shrink-0">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Institution Logo</label>
                                <div className="h-[50px] bg-white border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                    {logoUrl ? (
                                        <img src={logoUrl} className="w-full h-full object-contain p-1" alt="Logo" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition" />
                                    )}
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Course Target</label>
                                <input value={course} onChange={e => setCourse(e.target.value)} type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium" placeholder="e.g., MBBS" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Phase</label>
                                <input value={department} onChange={e => setDepartment(e.target.value)} type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium" placeholder="e.g., Phase 1" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> Weekly Class Days (Optional Default)</h4>
                        <p className="text-xs font-medium text-slate-500">Define the recurring weekly slots for this course. You can always override this later when scheduling specific days.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                            <select value={newSlot.day} onChange={e => setNewSlot({...newSlot, day: e.target.value})} className="w-full sm:flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-bold text-slate-700 text-sm">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
                            </select>
                            <input value={newSlot.fromTime} onChange={e => setNewSlot({...newSlot, fromTime: e.target.value})} type="time" className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm font-bold text-slate-700" title="Start Time" />
                            <span className="text-slate-400 font-bold hidden sm:block">-</span>
                            <div className="flex w-full sm:w-auto gap-2">
                                <input value={newSlot.toTime} onChange={e => setNewSlot({...newSlot, toTime: e.target.value})} type="time" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm font-bold text-slate-700" title="End Time" />
                                <button onClick={handleAddSlot} className="bg-indigo-100 text-indigo-700 p-2 rounded-xl hover:bg-indigo-200 font-bold shrink-0"><Plus className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {weeklySlots.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-2">
                                {weeklySlots.map(slot => (
                                    <div key={slot.id} className="bg-white border border-slate-200 font-bold text-xs text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                                        <span className="text-indigo-600">{slot.day}:</span> {slot.fromTime} - {slot.toTime}
                                        <button onClick={() => setWeeklySlots(weeklySlots.filter(s => s.id !== slot.id))} className="text-slate-400 hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Content & People */}
                <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> Department Faculty</h4>
                        
                        <div className="flex gap-2">
                            <input 
                                value={newFaculty} 
                                onChange={e => setNewFaculty(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleAddFaculty()}
                                type="text" 
                                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium text-sm" 
                                placeholder="E.g., Dr. Smith" 
                            />
                            <button onClick={handleAddFaculty} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-sm">Add</button>
                        </div>

                        {facultyMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {facultyMembers.map(faculty => (
                                    <div key={faculty} className="bg-white border border-slate-200 font-bold text-sm text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                                        {faculty}
                                        <button onClick={() => setFacultyMembers(facultyMembers.filter(f => f !== faculty))} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl p-6 relative overflow-hidden">
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleExcelUpload} 
                            className="hidden" 
                        />
                        <div className="flex flex-col items-center justify-center text-center space-y-3 z-10 relative">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100">
                                {topicsPool.length > 0 ? <CheckCircle2 className="w-7 h-7 text-green-500" /> : <FileSpreadsheet className="w-7 h-7 text-indigo-500" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">Upload Content Pool (Excel)</h4>
                                <p className="text-sm font-medium text-slate-500 mt-1 max-w-sm mx-auto">Upload an Excel sheet containing columns for "Topic" and "Competency No" to build the syllabus pool.</p>
                            </div>

                            {topicsPool.length > 0 ? (
                                <div className="pt-2">
                                    <div className="bg-white px-4 py-2 rounded-xl text-indigo-700 font-bold text-sm shadow-sm inline-flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> {topicsPool.length} Topics Loaded Successfully!
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium mt-3 underline cursor-pointer hover:text-slate-700" onClick={() => fileInputRef.current?.click()}>Need to re-upload? Click here.</p>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md hover:bg-indigo-700 flex items-center gap-2 transition"
                                >
                                    <Upload className="w-4 h-4" /> Select Excel File
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Scheduling Tab Component
// ==========================================
function SchedulingTabView() {
    const { formats, scheduleClass, schedules, holidays, addHoliday, removeHoliday } = useTimetableStore();
    
    // User Selection
    const [selectedFormatId, setSelectedFormatId] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    
    // Current Draft Day
    const [draftTopicId, setDraftTopicId] = useState('');
    const [draftActivity, setDraftActivity] = useState('Lecture');
    const [draftBatch, setDraftBatch] = useState('Full');
    const [draftStaff, setDraftStaff] = useState('');

    const activeFormat = formats.find(f => f.id === selectedFormatId);
    
    // Helper to generate days of selected month
    const daysInMonth = () => {
        if (!selectedMonth) return [];
        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month), 0);
        const days = [];
        for (let i = 1; i <= date.getDate(); i++) {
            days.push(
                new Date(parseInt(year), parseInt(month) - 1, i).toISOString().slice(0, 10)
            );
        }
        return days;
    };

    const handleHolidayToggle = (dateStr: string) => {
        const isHoliday = holidays.some(h => h.date === dateStr);
        if (isHoliday) {
            removeHoliday(dateStr);
        } else {
            const reason = prompt("Enter holiday name/details:");
            if (reason) addHoliday(dateStr, reason);
        }
    };

    const handleSaveDaySchedule = (dateStr: string) => {
        if (!draftTopicId || !draftStaff || !activeFormat) {
            return alert("Please select a Topic and Staff member to schedule a class.");
        }

        const topic = activeFormat.topicsPool.find(t => t.id === draftTopicId);
        if (!topic) return;

        scheduleClass({
            date: dateStr,
            formatId: activeFormat.id,
            topicId: topic.id,
            topicName: topic.topic,
            competencyNo: topic.competencyNo,
            activity: draftActivity,
            batch: draftBatch,
            staffName: draftStaff
        });

        // Reset inputs
        setDraftTopicId('');
    };

    // If no formats exist, prompt user
    if (formats.length === 0) {
        return (
             <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl m-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50 min-h-[400px]">
                <CalendarPlus className="w-16 h-16 opacity-50 mb-4" />
                <h4 className="text-xl font-bold text-slate-600 text-center">No Departments Setup</h4>
                <p className="mt-2 text-sm text-center max-w-sm">You must create at least one Timetable Format in the other tab before scheduling classes.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 h-full flex flex-col space-y-8 animate-in fade-in duration-300">
            {/* Top Config */}
            <div className="flex flex-col md:flex-row gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 items-end relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-bl-full -z-10"></div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Course / Department</label>
                    <select 
                        value={selectedFormatId} 
                        onChange={e => { setSelectedFormatId(e.target.value); setDraftTopicId(''); setDraftStaff(''); }}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-bold text-slate-700"
                    >
                        <option value="" disabled>-- Choose Department --</option>
                        {formats.map(f => (
                            <option key={f.id} value={f.id}>{f.course} - {f.department}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 w-full shrink-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule Month</label>
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-bold text-slate-700" 
                    />
                </div>
            </div>

            {/* Daily Calendars View */}
            {activeFormat && selectedMonth && (
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-4 print:hidden">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Daily Schedule Planner</h3>
                            <p className="text-sm text-slate-500 font-medium">Toggle holidays or assign classes for {new Date(selectedMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}.</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => window.print()} 
                                className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition"
                            >
                                <CalendarDays className="w-4 h-4" /> Export PDF Timetable
                            </button>
                        </div>
                    </div>

                    {/* Print Header (Visible only when printing) */}
                    <div className="hidden print:block mb-8 text-center border-b-2 border-slate-800 pb-4">
                        {activeFormat.instituteLogoUrl ? (
                            <img src={activeFormat.instituteLogoUrl} className="h-16 mx-auto mb-2 object-contain" alt="Logo" />
                        ) : null}
                        <h1 className="text-2xl font-black text-slate-900">{activeFormat.instituteName}</h1>
                        <h2 className="text-lg font-bold text-slate-800 mt-1">{activeFormat.course} - {activeFormat.department}</h2>
                        <h3 className="text-md font-bold text-slate-600 mt-1">Timetable for {new Date(selectedMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
                    </div>

                    <div className="space-y-4 print:space-y-2">
                        {daysInMonth().map((dateStr) => {
                            const dateObj = new Date(dateStr);
                            const dayName = dateObj.toLocaleDateString('default', { weekday: 'long' });
                            const dayNum = dateObj.getDate();
                            const isWeekend = dayName === 'Sunday' || dayName === 'Saturday';
                            const holidayInfo = holidays.find(h => h.date === dateStr);
                            
                            // Get existing schedules for this specific day and format
                            const daySchedules = schedules.filter(s => s.date === dateStr && s.formatId === activeFormat.id);

                            return (
                                <div key={dateStr} className={`border rounded-2xl overflow-hidden transition-all ${holidayInfo ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
                                    
                                    {/* Date Header Strip */}
                                    <div className={`p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${holidayInfo ? 'bg-amber-100/50' : 'bg-slate-50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-bold ${holidayInfo ? 'bg-amber-100 border-amber-200 text-amber-700' : isWeekend ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-indigo-100 border-indigo-200 text-indigo-700'}`}>
                                                <span className="text-xs uppercase">{dayName.slice(0,3)}</span>
                                                <span className="text-xl leading-none">{dayNum}</span>
                                            </div>
                                            <div>
                                                <h5 className={`font-bold ${holidayInfo ? 'text-amber-800' : 'text-slate-800'}`}>
                                                    {holidayInfo ? `Holiday: ${holidayInfo.details}` : 'Class Day'}
                                                </h5>
                                                <p className="text-xs text-slate-500 font-medium">{dateStr}</p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleHolidayToggle(dateStr)}
                                            className={`print:hidden px-4 py-2 text-sm font-bold rounded-xl transition ${holidayInfo ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                        >
                                            {holidayInfo ? 'Remove Holiday' : 'Mark Holiday'}
                                        </button>
                                    </div>

                                    {/* Edit / View Area inside passing days */}
                                    {!holidayInfo && (
                                        <div className="p-4 sm:p-6 bg-white space-y-4 print:p-2 print:space-y-2">
                                            
                                            {/* Existing Scheduled Classes */}
                                            {daySchedules.length > 0 && (
                                                <div className="mb-4 space-y-2">
                                                    {daySchedules.map(sc => (
                                                        <div key={sc.id} className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                                                            <div className="flex-1">
                                                                <div className="flex gap-2 items-center">
                                                                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{sc.activity}</span>
                                                                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{sc.batch} Batch</span>
                                                                </div>
                                                                <p className="font-bold text-slate-900 mt-1">{sc.topicName} <span className="text-xs text-slate-400 font-medium ml-1">({sc.competencyNo})</span></p>
                                                                <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1"><Users className="w-3 h-3"/> Prof. {sc.staffName}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    if (confirm("Remove this scheduled class? Topic will be returned to the pool.")) {
                                                                        useTimetableStore.getState().deleteScheduledClass(sc.id);
                                                                    }
                                                                }} 
                                                                className="print:hidden text-red-400 hover:bg-red-50 p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add New Entry Form */}
                                            <div className="print:hidden grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                                <div className="col-span-12 md:col-span-4">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Uncompleted Topics</label>
                                                    <select 
                                                        value={draftTopicId} 
                                                        onChange={e => setDraftTopicId(e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm font-medium text-slate-700"
                                                    >
                                                        <option value="" disabled>-- Select Topic --</option>
                                                        {activeFormat.topicsPool.filter(t => !t.isCompleted).map(t => (
                                                            <option key={t.id} value={t.id}>{t.topic} ({t.competencyNo})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-6 md:col-span-2">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Activity</label>
                                                    <select value={draftActivity} onChange={e => setDraftActivity(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-700 focus:outline-none">
                                                        <option>Lecture</option>
                                                        <option>Tutorial</option>
                                                        <option>Practical</option>
                                                        <option>SDL</option>
                                                        <option>ECE</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-6 md:col-span-2">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Batch</label>
                                                    <select value={draftBatch} onChange={e => setDraftBatch(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-700 focus:outline-none">
                                                        <option>Full</option>
                                                        <option>Batch A</option>
                                                        <option>Batch B</option>
                                                        <option>Batch C</option>
                                                        <option>Batch D</option>
                                                        <option>Batch E</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-12 md:col-span-3">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Staff / Faculty</label>
                                                    <select 
                                                        value={draftStaff} 
                                                        onChange={e => setDraftStaff(e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm font-medium text-slate-700"
                                                    >
                                                        <option value="" disabled>-- Select --</option>
                                                        {activeFormat.facultyMembers.map(fm => (
                                                            <option key={fm} value={fm}>{fm}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-12 md:col-span-1 border-t pt-3 md:border-none md:pt-0 pb-0.5 flex justify-end shrink-0">
                                                    <button onClick={() => handleSaveDaySchedule(dateStr)} className="bg-slate-900 text-white p-2 w-full md:w-auto rounded-lg shadow-sm hover:bg-slate-800 transition flex justify-center items-center gap-2">
                                                        <Save className="w-4 h-4 hidden md:block" /> <span className="md:hidden font-bold text-sm">Save Entry</span>
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// What's Today Tab Component
// ==========================================
function TodayTabView() {
    const { formats, schedules, holidays } = useTimetableStore();
    
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

    // Get today's classes from all formats
    const todaysClasses = schedules.filter(s => s.date === selectedDate);
    const holidayInfo = holidays.find(h => h.date === selectedDate);
    const dateObj = new Date(selectedDate);
    const dayName = dateObj.toLocaleDateString('default', { weekday: 'long' });

    return (
        <div className="p-4 md:p-8 h-full flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-300">
            {/* Header / Date Picker */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-6 lg:p-10 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="z-10">
                    <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Daily Academic Summary</h3>
                    <h2 className="text-3xl lg:text-4xl font-black mb-2">{dayName}, {dateObj.toLocaleDateString('default', { month: 'long', day: 'numeric' })}</h2>
                    <p className="text-indigo-100 font-medium max-w-md">Snapshot of all lectures, practicals, and activities scheduled across the institution.</p>
                </div>
                <div className="z-10 shrink-0 w-full md:w-auto">
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full md:w-auto px-6 py-4 bg-white/20 border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:outline-none font-bold text-white text-lg backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:invert"
                    />
                </div>
            </div>

            {holidayInfo && (
                <div className="bg-amber-100 border-2 border-amber-200 rounded-3xl p-8 text-center text-amber-800 flex flex-col items-center justify-center min-h-[300px]">
                    <Building2 className="w-16 h-16 mb-4 opacity-50" />
                    <h3 className="text-2xl font-black mb-2">Institutional Holiday</h3>
                    <p className="font-bold text-amber-700 max-w-sm">No regular academic classes are scheduled today due to {holidayInfo.details}.</p>
                </div>
            )}

            {!holidayInfo && formats.length === 0 && (
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl m-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50 min-h-[300px]">
                    <Building2 className="w-16 h-16 opacity-50 mb-4" />
                    <h4 className="text-xl font-bold text-slate-600 text-center">System Initializing</h4>
                    <p className="mt-2 text-sm text-center max-w-sm">Please create department formats and schedule classes to view the daily summary.</p>
                </div>
            )}

            {!holidayInfo && formats.length > 0 && todaysClasses.length === 0 && (
                 <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 min-h-[300px]">
                    <Clock className="w-16 h-16 opacity-50 mb-4" />
                    <h4 className="text-xl font-bold text-slate-600 text-center">No Classes Scheduled</h4>
                    <p className="mt-2 text-sm text-center max-w-sm">There are no academic activities scheduled for this date across the institution.</p>
                </div>
            )}

            {!holidayInfo && todaysClasses.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* Class List */}
                    <div className="col-span-1 lg:col-span-8 space-y-4">
                        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-3 mb-6">
                            <h3 className="text-xl font-black text-slate-900">Today's Roster ({todaysClasses.length})</h3>
                        </div>

                        {todaysClasses.map(sc => {
                            const format = formats.find(f => f.id === sc.formatId);
                            if (!format) return null;

                            return (
                                <div key={sc.id} className="bg-white border text-slate-800 border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center">
                                    {/* Left Accent indicator */}
                                    <div className="absolute top-0 left-0 bottom-0 w-2 bg-indigo-500"></div>

                                    {/* Department Info */}
                                    <div className="flex items-center gap-4 md:w-1/3 shrink-0">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 p-2 shrink-0">
                                            {format.instituteLogoUrl ? <img src={format.instituteLogoUrl} alt="Logo" className="w-full h-full object-contain" /> : <Building2 className="w-6 h-6 text-indigo-400" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{format.course}</p>
                                            <h4 className="font-bold text-slate-900 leading-tight">{format.department}</h4>
                                        </div>
                                    </div>

                                    {/* Topic Details */}
                                    <div className="flex-1 border-l-2 md:border-slate-100 pl-0 md:pl-6 pt-4 md:pt-0 border-t-2 md:border-t-0 border-slate-100 border-dashed">
                                        <div className="flex flex-wrap gap-2 items-center mb-3">
                                            <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest">{sc.activity}</span>
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest">{sc.batch} Batch</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight pr-4">{sc.topicName} <span className="text-xs text-slate-400 font-medium ml-1">({sc.competencyNo})</span></h3>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center"><Users className="w-3 h-3 text-slate-500"/></div>
                                            <p className="text-sm font-bold text-slate-600">Prof. {sc.staffName}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Stats sidebar */}
                    <div className="col-span-1 lg:col-span-4 space-y-4 sticky top-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-500" /> Today's Snapshot</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-sm font-bold text-slate-500">Total Classes</div>
                                    <div className="text-2xl font-black text-indigo-600">{todaysClasses.length}</div>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-sm font-bold text-slate-500">Active Departments</div>
                                    <div className="text-2xl font-black text-indigo-600">{new Set(todaysClasses.map(c => c.formatId)).size}</div>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-sm font-bold text-slate-500">Faculty Deployed</div>
                                    <div className="text-2xl font-black text-indigo-600">{new Set(todaysClasses.map(c => c.staffName)).size}</div>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                    <Share2 className="w-4 h-4" /> Share Summary Record
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}
