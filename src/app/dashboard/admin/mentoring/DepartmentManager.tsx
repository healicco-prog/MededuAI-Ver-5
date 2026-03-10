"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Building2, User, MoreVertical, Trash2, Edit2, CheckCircle2, UserPlus, X } from 'lucide-react';

const mockFaculty = [
    { id: 'f1', name: 'Dr. Sarah Connor', email: 'sarah.c@mededuai.com' },
    { id: 'f2', name: 'Dr. John Smith', email: 'john.s@mededuai.com' },
    { id: 'f3', name: 'Dr. Emily Chen', email: 'emily.c@mededuai.com' },
    { id: 'f4', name: 'Dr. Michael Chang', email: 'm.chang@mededuai.com' },
    { id: 'f5', name: 'Dr. Lisa Cuddy', email: 'l.cuddy@mededuai.com' },
];

export default function DepartmentManager() {
    const [departments, setDepartments] = useState([
        { id: 1, name: 'Anatomy', head: 'Dr. Sarah Connor', facultyCount: 12 },
        { id: 2, name: 'Physiology', head: 'Dr. John Smith', facultyCount: 8 },
        { id: 3, name: 'Biochemistry', head: 'Dr. Emily Chen', facultyCount: 6 },
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [addingFacultyDeptId, setAddingFacultyDeptId] = useState<number | null>(null);
    
    // Form State for Dept
    const [deptName, setDeptName] = useState('');
    const [deptHead, setDeptHead] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Form State for Add Faculty
    const [facultySearchQuery, setFacultySearchQuery] = useState('');
    const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const facultyDropdownRef = useRef<HTMLDivElement>(null);

    const filteredFaculty = mockFaculty.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAddFaculty = mockFaculty.filter(f => 
        f.name.toLowerCase().includes(facultySearchQuery.toLowerCase()) || 
        f.email.toLowerCase().includes(facultySearchQuery.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (facultyDropdownRef.current && !facultyDropdownRef.current.contains(event.target as Node)) {
                setIsFacultyDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenAdd = () => {
        setDeptName('');
        setDeptHead('');
        setSearchQuery('');
        setEditingId(null);
        setIsAdding(true);
    };

    const handleOpenEdit = (dept: any) => {
        setDeptName(dept.name);
        setDeptHead(dept.head);
        setSearchQuery(dept.head);
        setEditingId(dept.id);
        setIsAdding(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this department?")) {
            setDepartments(departments.filter(d => d.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deptName) return;

        if (editingId) {
            setDepartments(departments.map(d => 
                d.id === editingId ? { ...d, name: deptName, head: deptHead || 'Unassigned' } : d
            ));
        } else {
            setDepartments([...departments, {
                id: Date.now(),
                name: deptName,
                head: deptHead || 'Unassigned',
                facultyCount: 0
            }]);
        }
        
        setIsAdding(false);
        setEditingId(null);
    };

    const handleAddFaculty = (faculty: any) => {
        alert(`Added ${faculty.name} to the department! (Mock Action)`);
        setAddingFacultyDeptId(null);
        setFacultySearchQuery('');
    };

    return (
        <div className="w-full text-left relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Department Management</h2>
                    <p className="text-slate-500">Create departments and assign faculty as department heads.</p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> Add Department
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-slate-800 mb-4">{editingId ? 'Edit Department' : 'Create New Department'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Department Name</label>
                            <input 
                                type="text"
                                required
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                placeholder="e.g. Pathology"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div ref={dropdownRef} className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Head (Optional search)</label>
                            <div className="relative">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setDeptHead(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Search by name or Email ID..."
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            
                            {/* Search Dropdown */}
                            {isDropdownOpen && searchQuery.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {filteredFaculty.length > 0 ? (
                                        <div className="py-2">
                                            {filteredFaculty.map(faculty => (
                                                <button
                                                    key={faculty.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setDeptHead(faculty.name);
                                                        setSearchQuery(faculty.name);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <User className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{faculty.name}</p>
                                                        <p className="text-xs text-slate-500">{faculty.email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No faculty found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                            <CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Create Department'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 font-bold text-slate-700">Department</th>
                            <th className="px-6 py-4 font-bold text-slate-700">Department Head</th>
                            <th className="px-6 py-4 font-bold text-slate-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {departments.map(dept => (
                            <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-900">{dept.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="font-medium text-slate-700">{dept.head}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setAddingFacultyDeptId(dept.id)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                            title="Add Faculty"
                                        >
                                            <UserPlus className="w-5 h-5" /> <span className="hidden sm:inline">Faculty</span>
                                        </button>
                                        <button 
                                            onClick={() => handleOpenEdit(dept)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Department"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Department"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {departments.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Departments Found</h3>
                        <p className="text-slate-500 mb-6">Create your first institution department to get started.</p>
                        <button 
                            onClick={handleOpenAdd}
                            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Add Department
                        </button>
                    </div>
                )}
            </div>

            {/* Add Faculty Modal/Overlay */}
            {addingFacultyDeptId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-900">Add Faculty</h3>
                                <p className="text-xs text-slate-500">to {departments.find(d => d.id === addingFacultyDeptId)?.name} Department</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setAddingFacultyDeptId(null);
                                    setFacultySearchQuery('');
                                }} 
                                className="p-2 text-slate-400 hover:bg-white hover:text-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div ref={facultyDropdownRef} className="relative">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                                <input 
                                    type="text"
                                    value={facultySearchQuery}
                                    onChange={(e) => {
                                        setFacultySearchQuery(e.target.value);
                                        setIsFacultyDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsFacultyDropdownOpen(true)}
                                    placeholder="Type Name or Email Id..."
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                    autoFocus
                                />
                                
                                {isFacultyDropdownOpen && facultySearchQuery.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                        {filteredAddFaculty.length > 0 ? (
                                            <div className="py-2">
                                                {filteredAddFaculty.map(faculty => (
                                                    <button
                                                        key={faculty.id}
                                                        type="button"
                                                        onClick={() => handleAddFaculty(faculty)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-sm">{faculty.name}</p>
                                                            <p className="text-xs text-slate-500">{faculty.email}</p>
                                                        </div>
                                                        <UserPlus className="w-4 h-4 ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-sm text-slate-500">
                                                No faculty found matching "{facultySearchQuery}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
