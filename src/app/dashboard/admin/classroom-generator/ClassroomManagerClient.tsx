"use client";

import React, { useState, useRef } from 'react';
import { Plus, Upload, Trash2, ChevronLeft, Save, FileSpreadsheet, Image as ImageIcon, Users, BookOpen, Clock, Building, UserCircle, GraduationCap } from 'lucide-react';

interface Topic {
    id: string;
    topic: string;
    competency: string;
}

interface Student {
    id: string;
    name: string;
    rollNo: string;
    regNo: string;
    email: string;
}

interface Classroom {
    id: string;
    name: string;
    course: string;
    year: string;
    department: string;
    faculty: string[];
    classDays: string[];
    topics: Topic[];
    students: Student[];
    dateCreated: string;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassroomManagerClient() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([
        {
            id: '1',
            name: 'Anatomy Batch A',
            course: 'Human Anatomy',
            year: 'MBBS 1st Year',
            department: 'Anatomy',
            faculty: ['Dr. Sarah Jenkins'],
            classDays: ['Monday', 'Wednesday', 'Friday'],
            topics: [{ id: 't1', topic: 'Upper Limb Bones', competency: 'AN1.1' }],
            students: [{ id: 's1', name: 'John Doe', rollNo: '101', regNo: 'REG2026', email: 'john@example.com' }],
            dateCreated: '2026-03-01'
        }
    ]);

    const [isCreating, setIsCreating] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Classroom>>({
        name: '',
        course: '',
        year: 'MBBS 1st Year',
        department: '',
        faculty: [],
        classDays: [],
        topics: [],
        students: []
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const studentFileRef = useRef<HTMLInputElement>(null);

    const handleCreateNew = () => {
        setFormData({
            name: '',
            course: '',
            year: 'MBBS 1st Year',
            department: '',
            faculty: [],
            classDays: [],
            topics: [],
            students: []
        });
        setIsCreating(true);
        setEditingClassroom(null);
    };

    const handleSave = () => {
        if (!formData.name || !formData.course) {
            alert("Name and Course are required.");
            return;
        }

        if (editingClassroom) {
            setClassrooms(classrooms.map(c => c.id === editingClassroom.id ? { ...c, ...formData } as Classroom : c));
        } else {
            setClassrooms([...classrooms, {
                ...formData,
                id: Math.random().toString(36).substr(2, 9),
                topics: formData.topics || [],
                students: formData.students || [],
                classDays: formData.classDays || [],
                dateCreated: new Date().toISOString().split('T')[0]
            } as Classroom]);
        }
        setIsCreating(false);
    };

    const toggleDay = (day: string) => {
        const days = formData.classDays || [];
        if (days.includes(day)) {
            setFormData({ ...formData, classDays: days.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, classDays: [...days, day] });
        }
    };

    const addEmptyTopicRow = () => {
        const topics = formData.topics || [];
        setFormData({
            ...formData,
            topics: [...topics, { id: Math.random().toString(), topic: '', competency: '' }]
        });
    };

    const updateTopic = (id: string, field: 'topic' | 'competency', value: string) => {
        const topics = formData.topics || [];
        setFormData({
            ...formData,
            topics: topics.map(t => t.id === id ? { ...t, [field]: value } : t)
        });
    };

    const removeTopicRow = (id: string) => {
        const topics = formData.topics || [];
        setFormData({
            ...formData,
            topics: topics.filter(t => t.id !== id)
        });
    };

    const simulateUploadTopics = () => {
        // Simulate an excel upload
        const fakeUpload = [
            { id: Math.random().toString(), topic: 'Introduction to Thorax', competency: 'AN21.1' },
            { id: Math.random().toString(), topic: 'Sternum & Ribs', competency: 'AN21.2' },
        ];
        const topics = formData.topics || [];
        setFormData({ ...formData, topics: [...topics, ...fakeUpload] });
    };

    const addEmptyStudentRow = () => {
        const students = formData.students || [];
        setFormData({
            ...formData,
            students: [...students, { id: Math.random().toString(), name: '', rollNo: '', regNo: '', email: '' }]
        });
    };

    const updateStudent = (id: string, field: keyof Student, value: string) => {
        const students = formData.students || [];
        setFormData({
            ...formData,
            students: students.map(s => s.id === id ? { ...s, [field]: value } : s)
        });
    };

    const removeStudentRow = (id: string) => {
        const students = formData.students || [];
        setFormData({
            ...formData,
            students: students.filter(s => s.id !== id)
        });
    };

    const simulateUploadStudents = () => {
        // Simulate an excel upload
        const fakeUpload = [
            { id: Math.random().toString(), name: 'Alice Smith', rollNo: '102', regNo: 'REG2027', email: 'alice@example.com' },
            { id: Math.random().toString(), name: 'Bob Johnson', rollNo: '103', regNo: 'REG2028', email: 'bob@example.com' },
        ];
        const students = formData.students || [];
        setFormData({ ...formData, students: [...students, ...fakeUpload] });
    };


    if (!isCreating) {
        return (
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Classroom Generator</h2>
                        <p className="text-sm text-slate-500">Create and manage your institutional classrooms.</p>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Classroom
                    </button>
                </div>

                {classrooms.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Classrooms Found</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                            Start creating classrooms to enroll students and track curriculum progression efficiently.
                        </p>
                        <button
                            onClick={handleCreateNew}
                            className="bg-purple-50 text-purple-600 font-bold px-6 py-3 rounded-xl hover:bg-purple-100 transition-colors inline-block"
                        >
                            Build Your First Classroom
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classrooms.map((cls) => (
                            <div key={cls.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setFormData(cls);
                                            setEditingClassroom(cls);
                                            setIsCreating(true);
                                        }}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                        title="Edit Classroom"
                                    >
                                        <Clock className="w-4 h-4" /> {/* Edit placeholder */}
                                    </button>
                                    <button
                                        onClick={() => setClassrooms(classrooms.filter(c => c.id !== cls.id))}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        title="Delete Classroom"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                                        <GraduationCap className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{cls.name}</h3>
                                        <p className="text-xs font-semibold text-slate-500">{cls.course} • {cls.year}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Building className="w-4 h-4 text-emerald-500" />
                                        <span>{cls.department || 'No Dept Specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <UserCircle className="w-4 h-4 text-blue-500" />
                                        <span>{cls.faculty?.length > 0 ? cls.faculty.join(', ') : 'No Faculty Assigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Users className="w-4 h-4 text-purple-500" />
                                        <span>{cls.students.length} Enrolled Students</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <BookOpen className="w-4 h-4 text-amber-500" />
                                        <span>{cls.topics.length} Configured Topics</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {cls.classDays.length === 0 && <span className="text-xs text-slate-400 italic">No class days</span>}
                                    {cls.classDays.map(day => (
                                        <span key={day} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase">
                                            {day.substring(0, 3)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCreating(false)}
                        className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {editingClassroom ? 'Edit Classroom' : 'Create New Classroom'}
                        </h2>
                        <p className="text-sm text-slate-500">Provide details for the curriculum environment.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-sm"
                >
                    <Save className="w-5 h-5" />
                    {editingClassroom ? 'Save Changes' : 'Create Classroom'}
                </button>
            </div>

            <div className="p-6 md:p-8 space-y-12 max-w-5xl mx-auto">

                {/* General Information Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                        <GraduationCap className="text-purple-600 w-5 h-5" />
                        <h3 className="text-lg font-bold text-slate-800">General Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Institution Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    placeholder="e.g. Anatomy Batch A 2026"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Course</label>
                                    <input
                                        type="text"
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                        placeholder="Course name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Year</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    >
                                        <option value="MBBS 1st Year">MBBS 1st Year</option>
                                        <option value="MBBS 2nd Year">MBBS 2nd Year</option>
                                        <option value="MBBS 3rd Year">MBBS 3rd Year</option>
                                        <option value="MBBS 4th Year">MBBS 4th Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                        placeholder="e.g. Anatomy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Faculty</label>
                                    <div className="space-y-2">
                                        {(formData.faculty || []).map((f, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={f}
                                                    onChange={(e) => {
                                                        const newF = [...(formData.faculty || [])];
                                                        newF[i] = e.target.value;
                                                        setFormData({ ...formData, faculty: newF });
                                                    }}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                                    placeholder="Assigned Faculty"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newF = [...(formData.faculty || [])];
                                                        newF.splice(i, 1);
                                                        setFormData({ ...formData, faculty: newF });
                                                    }}
                                                    className="px-3 bg-slate-100 text-red-500 rounded-xl hover:bg-slate-200 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setFormData({ ...formData, faculty: [...(formData.faculty || []), ''] })}
                                            className="flex items-center gap-2 text-sm text-purple-600 font-bold hover:text-purple-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Faculty
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Institution Logo/ Banner</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                                        <ImageIcon className="text-slate-400 w-5 h-5" />
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-purple-600">Click to upload image</span>
                                        <p className="text-slate-500 text-xs">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Scheduling Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                        <Clock className="text-amber-500 w-5 h-5" />
                        <h3 className="text-lg font-bold text-slate-800">Weekly Class Days</h3>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-4">Define the recurring weekly slots for this course. You can always override this later when scheduling specific days.</p>
                    
                    <div className="flex flex-wrap gap-3">
                        {WEEK_DAYS.map((day) => {
                            const isSelected = formData.classDays?.includes(day);
                            return (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-2.5 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 
                                        ${isSelected 
                                            ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Topics Section */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                            <BookOpen className="text-emerald-500 w-5 h-5" />
                            <h3 className="text-lg font-bold text-slate-800">Curriculum Topics</h3>
                        </div>
                        <div className="flex gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".xlsx, .xls, .csv"
                                onChange={simulateUploadTopics}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Upload Excel
                            </button>
                            <button 
                                onClick={addEmptyTopicRow}
                                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Row
                            </button>
                        </div>
                    </div>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left bg-white text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                <tr>
                                    <th className="p-3 w-16 text-center">No.</th>
                                    <th className="p-3">Topic Title</th>
                                    <th className="p-3 w-48">Competency Number</th>
                                    <th className="p-3 w-16 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!formData.topics || formData.topics.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                                            No curriculum topics added. Upload an Excel list or add rows manually.
                                        </td>
                                    </tr>
                                ) : (
                                    formData.topics.map((t, index) => (
                                        <tr key={t.id} className="border-b border-slate-100 last:border-none group">
                                            <td className="p-3 text-center text-slate-400 font-medium">{index + 1}</td>
                                            <td className="p-3">
                                                <input 
                                                    type="text" 
                                                    value={t.topic} 
                                                    onChange={(e) => updateTopic(t.id, 'topic', e.target.value)}
                                                    className="w-full bg-transparent outline-none font-medium placeholder-slate-300"
                                                    placeholder="Enter Topic Title..."
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="text" 
                                                    value={t.competency} 
                                                    onChange={(e) => updateTopic(t.id, 'competency', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-emerald-300 font-medium text-xs text-slate-600"
                                                    placeholder="e.g. AN1.1"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => removeTopicRow(t.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors mx-auto p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Students Section */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                            <Users className="text-blue-500 w-5 h-5" />
                            <h3 className="text-lg font-bold text-slate-800">Enrolled Students</h3>
                        </div>
                         <div className="flex gap-3">
                            <input 
                                type="file" 
                                ref={studentFileRef} 
                                className="hidden" 
                                accept=".xlsx, .xls, .csv"
                                onChange={simulateUploadStudents}
                            />
                            <button 
                                onClick={() => studentFileRef.current?.click()}
                                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Upload Excel List
                            </button>
                            <button 
                                onClick={addEmptyStudentRow}
                                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Row
                            </button>
                        </div>
                    </div>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left bg-white text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                <tr>
                                    <th className="p-3">Student Name</th>
                                    <th className="p-3 w-32">Roll Number</th>
                                    <th className="p-3 w-40">Registration No.</th>
                                    <th className="p-3 w-64">Email ID</th>
                                    <th className="p-3 w-16 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!formData.students || formData.students.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                            No students added yet. You can upload an excel file containing standard rows.
                                        </td>
                                    </tr>
                                ) : (
                                    formData.students.map((s, index) => (
                                        <tr key={s.id} className="border-b border-slate-100 last:border-none group">
                                            <td className="p-3">
                                                 <input 
                                                    type="text" 
                                                    value={s.name} 
                                                    onChange={(e) => updateStudent(s.id, 'name', e.target.value)}
                                                    className="w-full bg-transparent outline-none font-medium text-slate-800"
                                                    placeholder="Full Name"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="text" 
                                                    value={s.rollNo} 
                                                    onChange={(e) => updateStudent(s.id, 'rollNo', e.target.value)}
                                                    className="w-full bg-transparent outline-none font-medium text-slate-600"
                                                    placeholder="Roll No"
                                                />
                                            </td>
                                            <td className="p-3">
                                                 <input 
                                                    type="text" 
                                                    value={s.regNo} 
                                                    onChange={(e) => updateStudent(s.id, 'regNo', e.target.value)}
                                                    className="w-full bg-transparent outline-none font-medium text-slate-600"
                                                    placeholder="Reg No"
                                                />
                                            </td>
                                            <td className="p-3">
                                                 <input 
                                                    type="email" 
                                                    value={s.email} 
                                                    onChange={(e) => updateStudent(s.id, 'email', e.target.value)}
                                                    className="w-full bg-transparent outline-none font-medium text-slate-600"
                                                    placeholder="email@example.com"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => removeStudentRow(s.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors mx-auto p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Create Bottom CTA */}
                <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                     <button
                        onClick={() => setIsCreating(false)}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-sm text-lg"
                    >
                        <Save className="w-5 h-5" />
                        {editingClassroom ? 'Save Database' : 'Generate Classroom'}
                    </button>
                </div>
            </div>
        </div>
    );
}
