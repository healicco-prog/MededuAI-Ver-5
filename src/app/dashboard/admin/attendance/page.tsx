"use client";

import { useState, useRef, useEffect } from 'react';
import { Users, Upload, Search, Download, CheckSquare, Square, Plus, Trash2, ArrowLeft, FileText, Settings, Award, Calendar, Clock, BarChart } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';
import { useAttendanceStore, CourseSetup, StudentInfo, AttendanceRecord } from '@/store/attendanceStore';
import { useTimetableStore } from '@/store/timetableStore';

export default function AttendanceSystem() {
    const store = useAttendanceStore();
    const [view, setView] = useState<'dashboard' | 'setup' | 'mark' | 'edit_list' | 'edit_single' | 'reports'>('dashboard');
    const [activeCourseId, setActiveCourseId] = useState<string>('');
    const [activeRecordId, setActiveRecordId] = useState<string>('');

    // If no courses and not in setup, force setup (for first time)
    if (store.courses.length === 0 && view !== 'setup') {
        setView('setup');
    }

    const renderView = () => {
        switch (view) {
            case 'setup': return <CourseSetupWizard onComplete={() => setView('dashboard')} store={store} />;
            case 'dashboard': return <DashboardView onNavigate={setView} store={store} setActiveCourse={setActiveCourseId} />;
            case 'mark': return <MarkAttendanceView onBack={() => setView('dashboard')} store={store} courseId={activeCourseId} onSave={() => setView('dashboard')} />;
            case 'edit_list': return <EditRecordsList onBack={() => setView('dashboard')} store={store} courseId={activeCourseId} onEdit={(rId: string, cId: string) => { setActiveCourseId(cId); setActiveRecordId(rId); setView('edit_single'); }} />;
            case 'edit_single': return <MarkAttendanceView onBack={() => setView('edit_list')} store={store} courseId={activeCourseId} editMode={true} recordId={activeRecordId} onSave={() => setView('edit_list')} />;
            case 'reports': return <ReportsView onBack={() => setView('dashboard')} store={store} courseId={activeCourseId} />;
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 print:block print:max-w-none print:m-0 print:p-0">
            {renderView()}

            <style jsx global>{`
                @media print {
                    @page { size: auto; margin: 15mm; }
                    html, body { height: auto !important; overflow: visible !important; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: white !important; }
                }
            `}</style>
        </div>
    );
}

// ----------------------------------------------------------------------
// 1. Course Setup Wizard
// ----------------------------------------------------------------------
function CourseSetupWizard({ onComplete, store }: { onComplete: () => void, store: any }) {
    const [form, setForm] = useState({
        courseName: '', instituteName: '', departmentName: '', sessionType: '', customSession: '', logoUrl: '', faculty: ['']
    });
    const [students, setStudents] = useState<StudentInfo[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const arrayBuffer = evt.target?.result as ArrayBuffer;
                const wb = XLSX.read(arrayBuffer, { type: 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const parsedList = data.map((rawRow: any, i) => {
                    // Normalize all keys by making them lowercase and stripping whitespace and dots
                    const row: any = {};
                    for (const key in rawRow) {
                        const normalizedKey = key.toLowerCase().replace(/[\s.]+/g, '');
                        row[normalizedKey] = rawRow[key];
                    }

                    return {
                        id: Date.now().toString() + i,
                        name: String(row['studentname'] || row['name'] || row['student'] || ''),
                        registrationNumber: String(row['registrationnumber'] || row['regno'] || row['registrationno'] || ''),
                        rollNumber: String(row['rollnumber'] || row['rollno'] || row['roll'] || row['rn'] || ''),
                        email: String(row['emailid'] || row['email'] || ''),
                    };
                }).filter(s => s.name.trim() !== '' && s.name.trim() !== 'undefined');

                if (parsedList.length === 0) {
                    alert("Could not find any valid students in the Excel file. Please ensure it has a 'Name' or 'Student Name' column.");
                } else {
                    setStudents(parsedList);
                }
            } catch (err) {
                console.error("Excel Parsing Error:", err);
                alert("Failed to parse the Excel file. Please ensure it is a valid .xlsx or .xls file.");
            }
        };
        reader.readAsArrayBuffer(file);

        // Reset the file input so the same file can be uploaded again if needed
        e.target.value = '';
    };

    const handleSave = () => {
        if (!form.courseName || students.length === 0) return alert("Course Name and Student Roster are required.");
        // if (!store.isPro && store.courses.length >= 1) {
        //     return alert("Free plan limits you to 1 course. Please upgrade to Pro.");
        // }
        const { sessionType, customSession, ...restForm } = form;
        store.addCourse({
            id: Date.now().toString(),
            ...restForm,
            session: sessionType === 'Any other' ? customSession : sessionType,
            faculty: form.faculty.filter(Boolean),
            students
        });
        onComplete();
    };

    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:hidden">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2"><Settings className="text-blue-600" /> Create Classroom: Course/ Department</h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name of the Institute</label><input value={form.instituteName} onChange={e => setForm({ ...form, instituteName: e.target.value })} placeholder="Enter Institute Name" className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Institute Logo</label><input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Course</label><input value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} placeholder="e.g. MBBS First Year" className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Department</label><input value={form.departmentName} onChange={e => setForm({ ...form, departmentName: e.target.value })} placeholder="e.g. Anatomy" className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload students List:</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-slate-100 text-slate-600 font-bold px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-2">
                            <Upload className="w-5 h-5" /> Upload Excel Roster
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                        </label>
                        <span className="text-sm text-slate-500">excel (Student Name, Roll Number, Registration Number, Email ID) which ever row is there. Edit/ Add/ Delete any row</span>
                    </div>

                    {students.length > 0 && (
                        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm"><tr className="border-b border-slate-200"><th className="p-3 w-32">Roll No</th><th className="p-3">Name</th><th className="p-3 w-40">Reg No</th><th className="p-3 w-16 text-right">Actions</th></tr></thead>
                                    <tbody>
                                        {students.map((s, idx) => (
                                            <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-2">
                                                    <input value={s.rollNumber} onChange={(e) => { const newS = [...students]; newS[idx].rollNumber = e.target.value; setStudents(newS); }} className="w-full bg-white border border-slate-200 px-3 py-2 outline-none font-mono focus:ring-2 focus:ring-blue-500 rounded-lg transition-all" placeholder="Roll No" />
                                                </td>
                                                <td className="p-2">
                                                    <input value={s.name} onChange={(e) => { const newS = [...students]; newS[idx].name = e.target.value; setStudents(newS); }} className="w-full bg-white border border-slate-200 px-3 py-2 outline-none font-medium focus:ring-2 focus:ring-blue-500 rounded-lg transition-all" placeholder="Student Name" />
                                                </td>
                                                <td className="p-2">
                                                    <input value={s.registrationNumber} onChange={(e) => { const newS = [...students]; newS[idx].registrationNumber = e.target.value; setStudents(newS); }} className="w-full bg-white border border-slate-200 px-3 py-2 outline-none text-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg transition-all" placeholder="Reg No" />
                                                </td>
                                                <td className="p-2 text-right">
                                                    <button onClick={() => setStudents(students.filter(st => st.id !== s.id))} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-600 text-sm">Total: {students.length} students</span>
                                <button onClick={() => setStudents([...students, { id: Date.now().toString(), name: '', registrationNumber: '', rollNumber: '', email: '' }])} className="text-blue-600 font-bold flex items-center gap-1.5 hover:underline text-sm"><Plus className="w-4 h-4" /> Add Student</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button onClick={handleSave} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition">Save</button>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. Dashboard View
// ----------------------------------------------------------------------
function DashboardView({ onNavigate, store, setActiveCourse }: { onNavigate: (v: any) => void, store: any, setActiveCourse: (id: string) => void }) {
    return (
        <div className="space-y-6 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-1">Attendance MS</h2>
                    <p className="text-slate-500">First make the students list as per Classroom</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => {
                        onNavigate('setup');
                    }} className="bg-indigo-50 text-indigo-700 font-bold h-12 px-6 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-200">
                        <Plus className="w-5 h-5" /> Create Multiple Classroom as required
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.courses.map((course: CourseSetup) => (
                    <div key={course.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-lg transition-transform hover:-translate-y-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{course.courseName}</h3>
                        <p className="text-sm text-slate-500 mb-4 flex items-center gap-1"><Users className="w-4 h-4" /> {course.students.length} Enrolled Students</p>
                        <div className="mt-auto grid grid-cols-2 gap-2">
                            <button onClick={() => { setActiveCourse(course.id); onNavigate('mark'); }} className="col-span-2 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"><CheckSquare className="w-4 h-4" /> Mark Attendance</button>
                            <button onClick={() => { setActiveCourse(course.id); onNavigate('edit_list'); }} className="bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center gap-2 text-sm"><Clock className="w-4 h-4" /> Edit Logs</button>
                            <button onClick={() => { setActiveCourse(course.id); onNavigate('reports'); }} className="bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center gap-2 text-sm"><BarChart className="w-4 h-4" /> Attendance Report</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. Mark / Edit Attendance View
// ----------------------------------------------------------------------
function MarkAttendanceView({ onBack, store, courseId, editMode = false, recordId, onSave }: any) {
    const course = store.courses.find((c: any) => c.id === courseId);
    const { formats, schedules } = useTimetableStore();

    // Derived state for the form
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        timeFrom: '09:00',
        timeTo: '10:00',
        topic: '',
        faculty: course?.faculty?.[0] || ''
    });

    // Default all present
    const defaultAttendance = course?.students.reduce((acc: any, s: any) => ({ ...acc, [s.id]: true }), {});
    const [attendance, setAttendance] = useState(defaultAttendance);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (editMode && recordId) {
            const record = store.attendanceRecords.find((r: any) => r.id === recordId);
            if (record) {
                setForm({ date: record.date, timeFrom: record.timeFrom, timeTo: record.timeTo, topic: record.topic, faculty: record.faculty });
                setAttendance(record.studentAttendance);
            }
        }
    }, [editMode, recordId, store.attendanceRecords]);

    if (!course) return null;

    const filteredStudents = course.students.filter((s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase())
    );

    const toggleStatus = (id: string) => setAttendance((prev: any) => ({ ...prev, [id]: !prev[id] }));

    const handleSave = () => {
        if (!form.topic) return alert('Topic is required');
        const recordData = {
            id: editMode ? recordId : Date.now().toString(),
            courseId,
            ...form,
            studentAttendance: attendance
        };
        if (editMode) store.updateAttendanceRecord(recordData);
        else store.addAttendanceRecord(recordData);
        onSave();
    };

    const presentCount = Object.values(attendance).filter(Boolean).length;
    const absentCount = course.students.length - presentCount;

    // Time Table Integration
    const matchingFormats = formats.filter(f => f.course === course.courseName && f.department === course.departmentName);
    const formatIds = matchingFormats.map(f => f.id);
    const todaysClasses = schedules.filter(s => s.date === form.date && formatIds.includes(s.formatId));

    const handleClassSelect = (scheduleId: string) => {
        const sc = todaysClasses.find(s => s.id === scheduleId);
        if (sc) {
            setForm({
                ...form,
                topic: `${sc.topicName} (${sc.activity} - ${sc.batch})`,
                faculty: sc.staffName
            });
        }
    };

    return (
        <div className="space-y-6 print:hidden">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"><ArrowLeft className="w-4 h-4" /> Back</button>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">{editMode ? 'Edit Attendance' : 'Start marking Attendance'} - {course.courseName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border outline-none" /></div>
                    
                    {/* Time Table Classes Hook */}
                    <div className="lg:col-span-5 flex flex-col justify-end pb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Calendar className="w-3 h-3 text-indigo-500" /> Time Table: Classes Today</label>
                        {todaysClasses.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {todaysClasses.map(sc => (
                                    <button 
                                        key={sc.id} 
                                        onClick={() => handleClassSelect(sc.id)}
                                        className="whitespace-nowrap bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-100 transition shadow-sm"
                                    >
                                        {sc.activity}: {sc.topicName} (Prof. {sc.staffName})
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-slate-400 italic py-1.5">No classes scheduled in Time Table MS for this date and classroom.</p>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time</label>
                        <div className="flex gap-2">
                            <input type="time" value={form.timeFrom} onChange={e => setForm({ ...form, timeFrom: e.target.value })} className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-slate-50 border outline-none" />
                            <input type="time" value={form.timeTo} onChange={e => setForm({ ...form, timeTo: e.target.value })} className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-slate-50 border outline-none" />
                        </div>
                    </div>
                    <div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic Covered *</label><input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Intro to Anatomy" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border outline-none font-bold" /></div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teacher</label>
                        <input value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} placeholder="Enter Teacher Name" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border outline-none font-medium" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative max-w-sm w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex items-center gap-4 font-bold text-sm">
                        <span className="text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">Present: {presentCount}</span>
                        <span className="text-red-700 bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm">Absent: {absentCount}</span>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition shadow-md">Save Attendance</button>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white shadow-sm z-10"><tr className="border-b border-slate-200"><th className="p-4 pl-8 w-20">Mark</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Roll No</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Student Name</th><th className="p-4 pr-8 text-right text-xs font-bold text-slate-500 uppercase">Status</th></tr></thead>
                        <tbody>
                            {filteredStudents.map((s: any) => {
                                const isPresent = attendance[s.id];
                                return (
                                    <tr key={s.id} onClick={() => toggleStatus(s.id)} className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 select-none ${!isPresent ? 'bg-red-50/40' : ''}`}>
                                        <td className="p-4 pl-8"><div className={`${isPresent ? 'text-green-500' : 'text-slate-300'}`}>{isPresent ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}</div></td>
                                        <td className="p-4 font-mono text-sm text-slate-500">{s.rollNumber}</td>
                                        <td className="p-4 font-bold text-slate-800">{s.name}</td>
                                        <td className="p-4 pr-8 text-right"><span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isPresent ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{isPresent ? 'Present' : 'Absent'}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 4. Edit Records List View
// ----------------------------------------------------------------------
function EditRecordsList({ onBack, store, courseId, onEdit }: any) {
    const records = store.attendanceRecords.filter((r: any) => !courseId || r.courseId === courseId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const course = store.courses.find((c: any) => c.id === courseId);

    return (
        <div className="space-y-6 print:hidden">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"><ArrowLeft className="w-4 h-4" /> Back</button>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Attendance Logs</h2>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500 uppercase tracking-wider"><th className="p-4">Date</th><th className="p-4">Course</th><th className="p-4">Topic</th><th className="p-4 text-center">Stats</th><th className="p-4 text-right">Actions</th></tr></thead>
                    <tbody>
                        {records.map((r: any) => {
                            const c = store.courses.find((c: any) => c.id === r.courseId);
                            const total = Object.keys(r.studentAttendance).length;
                            const pres = Object.values(r.studentAttendance).filter(Boolean).length;
                            return (
                                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-700"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> {new Date(r.date).toLocaleDateString()}</div><div className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {r.timeFrom} - {r.timeTo}</div></td>
                                    <td className="p-4 font-bold text-slate-800">{c?.courseName || 'Unknown'}</td>
                                    <td className="p-4 text-slate-600 font-medium">{r.topic}</td>
                                    <td className="p-4 text-center"><span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{pres} / {total} Present</span></td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => onEdit(r.id, r.courseId)} className="text-blue-600 font-bold hover:underline text-sm mr-4">Edit</button>
                                        <button onClick={() => confirm('Delete this record?') && store.deleteAttendanceRecord(r.id)} className="text-red-500 font-bold hover:underline text-sm"><Trash2 className="w-4 h-4 inline" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 5. Reports View (Daily & Consolidated)
// ----------------------------------------------------------------------
function ReportsView({ onBack, store, courseId }: any) {
    const course = store.courses.find((c: any) => c.id === courseId);
    const records = store.attendanceRecords.filter((r: any) => r.courseId === courseId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const [reportType, setReportType] = useState<'daily' | 'consolidated' | 'bulk_edit'>('daily');
    const [selectedRecordId, setSelectedRecordId] = useState(records[0]?.id || '');

    // Bulk edit state
    const [bulkStudent, setBulkStudent] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const printRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef: printRef, documentTitle: `${course?.courseName} Report` });

    const handleBulkMark = (status: boolean) => {
        if (!bulkStudent || !fromDate || !toDate) {
            return alert("Please select a student and both dates.");
        }

        let updatedCount = 0;
        records.forEach((r: any) => {
            const dStr = r.date.split('T')[0];
            const dObj = new Date(dStr);
            dObj.setHours(0, 0, 0, 0);
            const d = dObj.getTime();

            const startObj = new Date(fromDate);
            startObj.setHours(0, 0, 0, 0);
            const userStart = startObj.getTime();

            const endObj = new Date(toDate);
            endObj.setHours(0, 0, 0, 0);
            const userEnd = endObj.getTime();

            if (d >= userStart && d <= userEnd) {
                // Update record
                const newRecord = { ...r, studentAttendance: { ...r.studentAttendance, [bulkStudent]: status } };
                store.updateAttendanceRecord(newRecord);
                updatedCount++;
            }
        });
        alert(`Successfully updated attendance for ${updatedCount} records.`);
    };

    if (!course) return null;

    const ActiveReport = () => {
        if (reportType === 'daily') {
            const record = records.find((r: any) => r.id === selectedRecordId);
            if (!record) return <div className="p-8 text-center text-slate-500">No records found. Note attendance first.</div>;

            const present = Object.values(record.studentAttendance).filter(Boolean).length;
            const absent = Object.keys(record.studentAttendance).length - present;

            return (
                <div ref={printRef} className="bg-white p-10 print:p-0 print:border-none rounded-2xl border border-slate-200 shadow-xl print:shadow-none mx-auto max-w-[21cm]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-4 border-slate-800 pb-6 mb-8">
                        {course.logoUrl && <img src={course.logoUrl} alt="Logo" className="h-20 w-auto object-contain" />}
                        <div className="text-right flex-1">
                            <h1 className="text-2xl font-black uppercase text-slate-900">{course.instituteName}</h1>
                            <p className="text-slate-600 font-bold tracking-widest uppercase text-sm">{course.departmentName}{course.session ? ` - ${course.session}` : ''}</p>
                            <h2 className="text-xl font-bold text-blue-700 mt-2">{course.courseName} - Daily Attendance</h2>
                        </div>
                    </div>
                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-4 mb-8 text-sm border p-4 rounded-xl bg-slate-50 print:border-slate-300 print:bg-white">
                        <div><strong className="text-slate-500 uppercase mr-2">Date:</strong> <span className="font-bold">{new Date(record.date).toLocaleDateString()}</span></div>
                        <div><strong className="text-slate-500 uppercase mr-2">Time:</strong> <span className="font-bold">{record.timeFrom} - {record.timeTo}</span></div>
                        <div><strong className="text-slate-500 uppercase mr-2">Topic:</strong> <span className="font-bold text-indigo-700">{record.topic}</span></div>
                        <div><strong className="text-slate-500 uppercase mr-2">Teacher:</strong> <span className="font-bold">{record.faculty}</span></div>
                    </div>
                    {/* Stats */}
                    <div className="flex gap-4 mb-6 font-bold text-sm">
                        <div className="bg-green-50 text-green-700 px-4 py-2 border border-green-200 rounded-lg print:border-slate-300 print:text-black">Present: {present}</div>
                        <div className="bg-red-50 text-red-700 px-4 py-2 border border-red-200 rounded-lg print:border-slate-300 print:text-black">Absent: {absent}</div>
                    </div>
                    {/* Table */}
                    <table className="w-full text-left text-sm border-collapse border border-slate-300">
                        <thead><tr className="bg-slate-100 print:bg-gray-100"><th className="border border-slate-300 p-2">S.No</th><th className="border border-slate-300 p-2">Roll No</th><th className="border border-slate-300 p-2">Student Name</th><th className="border border-slate-300 p-2 text-center">Status</th></tr></thead>
                        <tbody>
                            {course.students.map((s: any, i: number) => {
                                const isPre = record.studentAttendance[s.id];
                                return (
                                    <tr key={s.id}>
                                        <td className="border border-slate-300 p-2 w-12 text-center">{i + 1}</td>
                                        <td className="border border-slate-300 p-2 font-mono">{s.rollNumber}</td>
                                        <td className="border border-slate-300 p-2 font-medium">{s.name}</td>
                                        <td className={`border border-slate-300 p-2 text-center font-bold ${isPre ? 'text-green-600 print:text-black' : 'text-red-600 print:text-gray-500'}`}>{isPre ? 'P' : 'A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            // Consolidated
            if (records.length === 0) return <div className="p-8 text-center text-slate-500">No records found. Note attendance first.</div>;

            // Calculate totals
            const totalClasses = records.length;
            const stats = course.students.map((s: any) => {
                const attended = records.reduce((acc: number, r: any) => acc + (r.studentAttendance[s.id] ? 1 : 0), 0);
                const perc = totalClasses === 0 ? 0 : Math.round((attended / totalClasses) * 100);
                return { ...s, attended, perc };
            });

            return (
                <div ref={printRef} className="bg-white p-10 print:p-0 print:border-none rounded-2xl border border-slate-200 shadow-xl print:shadow-none mx-auto max-w-[21cm]">
                    <div className="text-center border-b-4 border-slate-800 pb-6 mb-8">
                        <h1 className="text-2xl font-black uppercase text-slate-900">{course.instituteName} - {course.departmentName}{course.session ? ` - ${course.session}` : ''}</h1>
                        <h2 className="text-xl font-bold text-indigo-700 mt-2">Consolidated Attendance Report</h2>
                        <h3 className="text-lg font-bold text-slate-600 uppercase tracking-widest mt-1">{course.courseName}</h3>
                        <p className="font-bold text-slate-500 mt-2">Total Classes Conducted: {totalClasses}</p>
                    </div>
                    <table className="w-full text-left text-sm border-collapse border border-slate-300">
                        <thead><tr className="bg-slate-100 print:bg-gray-100"><th className="border border-slate-300 p-2">Roll No</th><th className="border border-slate-300 p-2">Student Name</th><th className="border border-slate-300 p-2 text-center">Attended</th><th className="border border-slate-300 p-2 text-center">Percentage</th></tr></thead>
                        <tbody>
                            {stats.map((s: any) => (
                                <tr key={s.id} className={s.perc < 75 ? 'bg-red-50/50 print:bg-transparent' : ''}>
                                    <td className="border border-slate-300 p-2 font-mono">{s.rollNumber}</td>
                                    <td className="border border-slate-300 p-2 font-bold">{s.name}</td>
                                    <td className="border border-slate-300 p-2 text-center">{s.attended} / {totalClasses}</td>
                                    <td className="border border-slate-300 p-2 text-center font-bold">
                                        <span className={s.perc < 75 ? 'text-red-600 print:text-black' : 'text-green-600 print:text-black'}>{s.perc}%</span>
                                        {s.perc < 75 && <span className="print:hidden text-[10px] ml-2 bg-red-100 text-red-800 px-1 inline-block rounded">Warning</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }
    };

    return (
        <div className="space-y-6 print:hidden">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"><ArrowLeft className="w-4 h-4" /> Back</button>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setReportType('daily')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${reportType === 'daily' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Daily Sheet</button>
                    <button onClick={() => setReportType('consolidated')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${reportType === 'consolidated' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>Consolidated</button>
                    <button onClick={() => setReportType('bulk_edit')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${reportType === 'bulk_edit' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>Bulk Edit</button>
                </div>
                {reportType !== 'bulk_edit' && <button onClick={() => reactToPrintFn()} className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md"><Download className="w-4 h-4" /> Export PDF</button>}
            </div>

            {reportType === 'daily' && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 max-w-xl mx-auto">
                    <label className="font-bold text-slate-600 whitespace-nowrap">Select Record:</label>
                    <select value={selectedRecordId} onChange={e => setSelectedRecordId(e.target.value)} className="flex-1 border border-slate-300 rounded-lg p-2 outline-none">
                        {records.map((r: any) => <option key={r.id} value={r.id}>{new Date(r.date).toLocaleDateString()} - {r.topic}</option>)}
                    </select>
                </div>
            )}

            {reportType === 'bulk_edit' ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Student *</label>
                        <select value={bulkStudent} onChange={e => setBulkStudent(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none font-bold">
                            <option value="">Select a student...</option>
                            {course?.students?.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">From Date *</label>
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">To Date *</label>
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none font-medium" />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex gap-4">
                        <button onClick={() => handleBulkMark(true)} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"><CheckSquare className="w-5 h-5" /> Mark Present</button>
                        <button onClick={() => handleBulkMark(false)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"><Square className="w-5 h-5" /> Mark Absent</button>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-200 p-8 rounded-3xl overflow-auto shadow-inner min-h-[500px]">
                    <ActiveReport />
                </div>
            )}
        </div>
    );
}
