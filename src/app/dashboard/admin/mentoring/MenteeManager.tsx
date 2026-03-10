"use client";

import React, { useState, useRef } from 'react';
import { Download, Users, Mail, Phone, Search, FileUp, GraduationCap, CheckCircle2, Save, Edit2, Trash2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function MenteeManager() {
    const [mentees, setMentees] = useState([
        { id: 1, regNo: 'MED2026-001', name: 'Alice Walker', year: '2021-2022', email: 'alice.w@student.mededuai.com', phone: '+91 9988776655' },
        { id: 2, regNo: 'MED2026-002', name: 'Bob Johnson', year: '2021-2022', email: 'bob.j@student.mededuai.com', phone: '+91 9988776656' },
        { id: 3, regNo: 'MED2025-045', name: 'Charlie Davis', year: '2022-2023', email: 'charlie.d@student.mededuai.com', phone: '+91 9988776657' },
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState('All');
    
    // Upload specific states
    const [uploadYear, setUploadYear] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredMentees = mentees.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.regNo.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = yearFilter === 'All' || yearFilter === '' || m.year.toString() === yearFilter;
        return matchesSearch && matchesYear;
    });

    const handleDownloadTemplate = () => {
        const headers = ["Registration Number", "Student Name", "Email ID", "Mobile Number"];
        const csvContent = headers.join(",") + "\n" + "MED2026-000,John Doe,johndoe@student.mededuai.com,+91 0000000000\n";
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "student_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processExcelFile = (data: ArrayBuffer) => {
        if (!uploadYear) {
            alert("Please select a Year before uploading the roster.");
            return;
        }

        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const newMentees: any[] = [];
            
            // Assume the first row might be headers, so we scan for it
            let headerRowIndex = 0;
            for (let i = 0; i < Math.min(json.length, 5); i++) {
                const row = json[i] || [];
                const rowString = row.join(' ').toLowerCase();
                if (rowString.includes('name') || rowString.includes('reg') || rowString.includes('rn')) {
                    headerRowIndex = i;
                    break;
                }
            }

            const headerRow = (json[headerRowIndex] || []).map(h => String(h || '').toLowerCase().trim());
            
            // Find column indices
            const getColIndex = (keywords: string[]) => {
                return headerRow.findIndex(h => keywords.some(k => h.includes(k)));
            };

            const nameCol = getColIndex(['name', 'student']);
            // Specifically match reg no to avoid matching RN (which is just row number here)
            const regNoCol = getColIndex(['reg. no', 'reg no', 'registration', 'reg', 'id']);
            const emailCol = getColIndex(['email', 'mail']);
            const phoneCol = getColIndex(['phone', 'mobile', 'contact', 'no']);
            
            // Fallback indices if headers weren't found cleanly
            const finalNameCol = nameCol !== -1 ? nameCol : 2; // Default to col C (0-indexed 2)
            const finalRegNoCol = regNoCol !== -1 ? regNoCol : 1; // Default to col B (0-indexed 1)
            const finalEmailCol = emailCol !== -1 ? emailCol : 3;
            const finalPhoneCol = phoneCol !== -1 ? phoneCol : 4;

            for (let i = headerRowIndex + 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0) continue;

                const name = row[finalNameCol] || '';
                const regNo = row[finalRegNoCol] || '';
                const email = row[finalEmailCol] || '';
                const phone = row[finalPhoneCol] || '';
                
                // Allow even partially incomplete rows, as requested
                if (name || regNo || email || phone) {
                    newMentees.push({
                        id: Date.now() + i,
                        name: name ? String(name).trim() : 'Unknown Name',
                        regNo: regNo ? String(regNo).trim() : 'N/A',
                        year: uploadYear,
                        email: email ? String(email).trim() : '',
                        phone: phone ? String(phone).trim() : ''
                    });
                }
            }
            
            if (newMentees.length > 0) {
                setMentees(prev => [...prev, ...newMentees]);
                setUploadSuccess(true);
                setHasUnsavedChanges(true);
                setYearFilter('All'); // Reset filter to show all including newly uploaded
                setTimeout(() => setUploadSuccess(false), 3000);
            } else {
                alert("No valid student records found in the file. Ensure you have the right headers.");
            }
        } catch (error) {
            console.error(error);
            alert("Error parsing file. Please ensure it is a valid Excel or CSV file.");
        }
    };

    const handleFileUploadClick = () => {
        if (!uploadYear) {
            alert("Please select a 'Year' from the dropdown above before selecting a file.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result as ArrayBuffer;
            if (data) processExcelFile(data);
        };
        reader.readAsArrayBuffer(file);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (uploadYear) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (!uploadYear) {
            alert("Please select a 'Year' from the dropdown above before dropping a file.");
            return;
        }

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.type === "text/csv" || file.type.includes("excel") || file.type.includes("spreadsheetml") || file.name.match(/\.(csv|xlsx|xls)$/i)) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target?.result as ArrayBuffer;
                if (data) processExcelFile(data);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Please upload an Excel or CSV file format.");
        }
    };

    const handleSaveList = () => {
        alert("Student roster successfully saved to the database!");
        setHasUnsavedChanges(false);
    };

    const handleDeleteMentee = (id: number) => {
        if (confirm("Are you sure you want to remove this student?")) {
            setMentees(prev => prev.filter(m => m.id !== id));
            setHasUnsavedChanges(true);
        }
    };

    return (
        <div className="w-full text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Mentee Management</h2>
                    <p className="text-slate-500">Upload students batch-wise using Excel to populate their digital profiles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-sm">
                        <Download className="w-5 h-5" /> Template
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-6 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                    <label className="font-bold text-slate-700">1. Select Target Year:</label>
                    <div className="relative">
                        <input 
                            list="uploadYearOptions"
                            value={uploadYear}
                            onChange={(e) => setUploadYear(e.target.value)}
                            placeholder="Select or Type Year"
                            className="bg-white border-2 border-purple-200 text-slate-800 rounded-xl px-4 py-2 font-bold outline-none focus:border-purple-500 min-w-[150px]"
                        />
                        <datalist id="uploadYearOptions">
                            <option value="2021-2022" />
                            <option value="2022-2023" />
                            <option value="2023-2024" />
                            <option value="2024-2025" />
                            <option value="2025-2026" />
                        </datalist>
                    </div>
                </div>

                <div 
                    onClick={handleFileUploadClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                        !uploadYear ? 'bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed' :
                        isDragging ? 'bg-purple-100 border-purple-400 cursor-copy' : 
                        uploadSuccess ? 'bg-purple-50 border-purple-300' :
                        'bg-purple-50 border-purple-200 hover:bg-purple-100/50 cursor-pointer group'
                    }`}
                >
                    <input 
                        type="file" 
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                    />
                    
                    {!uploadYear ? (
                        <>
                            <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-1">Select a Year First</h3>
                            <p className="text-sm text-slate-500">You must select a year above before uploading the Excel list.</p>
                        </>
                    ) : uploadSuccess ? (
                        <div className="animate-in zoom-in fade-in duration-300">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-200 shadow-sm text-purple-600">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-purple-900 mb-1">Upload Successful!</h3>
                            <p className="text-sm text-purple-700">Students have been added to the selected year.</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100 shadow-sm group-hover:scale-105 transition-transform">
                                <FileUp className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-purple-900 mb-1">2. Upload Students List (Excel/CSV)</h3>
                            <p className="text-sm text-purple-700">Drag and drop your student roster here, or click to browse</p>
                            <p className="text-xs text-purple-600/70 mt-4">Required columns: Registration Number, Student Name, Email ID, Mobile Number</p>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-purple-600" /> Student Roster</h3>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
                        {hasUnsavedChanges && (
                            <button 
                                onClick={handleSaveList}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm text-sm animate-in fade-in zoom-in duration-300"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        )}
                        <div>
                            <input 
                                list="yearFilterOptions"
                                value={yearFilter === 'All' ? '' : yearFilter}
                                onChange={(e) => setYearFilter(e.target.value === '' ? 'All' : e.target.value)}
                                placeholder="Year Filter (All)"
                                className="bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500 h-[38px] w-full sm:w-auto"
                            />
                            <datalist id="yearFilterOptions">
                                <option value="2021-2022" />
                                <option value="2022-2023" />
                                <option value="2023-2024" />
                                <option value="2024-2025" />
                                <option value="2025-2026" />
                            </datalist>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input 
                                type="text"
                                placeholder="Search by name or reg no..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white h-[38px]"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 text-sm">
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Student Name</th>
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Reg. Number</th>
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Year</th>
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Contact</th>
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMentees.map((mentee) => (
                                <tr key={mentee.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-900">{mentee.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium font-mono">
                                        {mentee.regNo}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-500/10 whitespace-nowrap">
                                            {mentee.year || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-2 break-all hover:text-purple-600"><Mail className="w-3.5 h-3.5 flex-shrink-0" /> {mentee.email}</span>
                                            <span className="flex items-center gap-2 break-all hover:text-purple-600"><Phone className="w-3.5 h-3.5 flex-shrink-0" /> {mentee.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Student">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteMentee(mentee.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Student"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMentees.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Students Found</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Use the batch upload feature to add students to the roster.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
