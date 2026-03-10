"use client";

import React, { useState, useRef } from 'react';
import { Upload, Plus, Download, Users, Mail, Phone, MoreVertical, Search, FileUp, CheckCircle2, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function MentorManager() {
    const [mentors, setMentors] = useState([
        { id: 1, name: 'Dr. Sarah Connor', dept: 'Anatomy', designation: 'Professor & Head', email: 'sarah.c@mededuai.com', phone: '+91 9876543210' },
        { id: 2, name: 'Dr. John Smith', dept: 'Physiology', designation: 'Associate Professor', email: 'john.s@mededuai.com', phone: '+91 9876543211' }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredMentors = mentors.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.dept.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownloadTemplate = () => {
        const headers = ["Teacher Name", "Department", "Designation", "Email ID", "Mobile Number"];
        const csvContent = headers.join(",") + "\n" + "Dr. Example Name,Cardiology,Professor,example@mededuai.com,+91 0000000000\n";
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "mentor_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processExcelFile = (data: ArrayBuffer) => {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON array of objects based on header row
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            const newMentors: { id: number; name: string; dept: string; designation: string; email: string; phone: string }[] = [];
            
            for (let i = 0; i < json.length; i++) {
                const row = json[i];
                // Flexible matching for headers
                const name = row['Teacher Name'] || row['Faculty Name'] || row['Name'] || row['name'] || '';
                const dept = row['Department'] || row['Dept'] || row['department'] || '';
                const designation = row['Designation'] || row['Role'] || row['Title'] || '';
                const email = row['Email ID'] || row['Email'] || row['email'] || '';
                const phone = row['Mobile Number'] || row['Phone'] || row['Contact'] || row['mobile'] || '';
                
                if (name || email || phone || dept) {
                    newMentors.push({
                        id: Date.now() + i,
                        name: name ? String(name).trim() : 'Unknown Name',
                        dept: dept ? String(dept).trim() : 'Unassigned',
                        designation: designation ? String(designation).trim() : '',
                        email: email ? String(email).trim() : '',
                        phone: phone ? String(phone).trim() : ''
                    });
                }
            }
            
            if (newMentors.length > 0) {
                setMentors(prev => [...prev, ...newMentors]);
                setUploadSuccess(true);
                setHasUnsavedChanges(true);
                setTimeout(() => setUploadSuccess(false), 3000);
            } else {
                alert("No valid rows found in the file. Please ensure it has the correct headers: Teacher Name, Department, Designation, Email ID, Mobile Number.");
            }
        } catch (error) {
            console.error(error);
            alert("Error parsing file. Please ensure it is a valid Excel or CSV file.");
        }
    };

    const handleSaveList = () => {
        // Here you would integrate with your backend to persist the mentor list
        alert("Mentors list successfully saved to the database!");
        setHasUnsavedChanges(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result as ArrayBuffer;
            if (data) {
                processExcelFile(data);
            }
        };
        reader.readAsArrayBuffer(file);
        
        // Reset input so the same file can be uploaded again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.type === "text/csv" || file.type.includes("excel") || file.type.includes("spreadsheetml") || file.name.match(/\.(csv|xlsx|xls)$/i)) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target?.result as ArrayBuffer;
                if (data) {
                    processExcelFile(data);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Please upload an Excel or CSV file format.");
        }
    };

    return (
        <div className="w-full text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Mentor Management</h2>
                    <p className="text-slate-500">Upload and configure faculty members acting as mentors or coordinators.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-sm">
                        <Download className="w-5 h-5" /> Template
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                        <Plus className="w-5 h-5" /> Add Manual
                    </button>
                </div>
            </div>

            <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 mb-8 text-center transition-colors cursor-pointer group ${
                    isDragging ? 'bg-emerald-100 border-emerald-400' : 
                    uploadSuccess ? 'bg-emerald-50 border-emerald-300' :
                    'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50'
                }`}
            >
                <input 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                />
                
                {uploadSuccess ? (
                    <div className="animate-in zoom-in fade-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm text-emerald-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-900 mb-1">Upload Successful!</h3>
                        <p className="text-sm text-emerald-700">Mentors have been added to the table.</p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm group-hover:scale-105 transition-transform">
                            <FileUp className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-900 mb-1">Batch Upload Mentors (Excel/CSV)</h3>
                        <p className="text-sm text-emerald-700">Drag and drop your faculty list here, or click to browse</p>
                        <p className="text-xs text-emerald-600/70 mt-4">Required columns: Teacher Name, Department, Designation, Email ID, Mobile Number</p>
                    </>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600" /> Assigned Mentors</h3>
                    <div className="flex items-center gap-4">
                        {hasUnsavedChanges && (
                            <button 
                                onClick={handleSaveList}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm text-sm animate-in fade-in zoom-in duration-300"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        )}
                        <div className="relative w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input 
                                type="text"
                                placeholder="Search mentors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 text-sm">
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Name</th>
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Department</th>
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Contact</th>
                                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMentors.map((mentor) => (
                                <tr key={mentor.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                                                {mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-900">{mentor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {mentor.dept}
                                            </span>
                                            {mentor.designation && (
                                                <span className="text-xs text-slate-500 font-normal">
                                                    {mentor.designation}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-2 hover:text-emerald-600 transition-colors break-all">
                                                <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {mentor.email}
                                            </span>
                                            <span className="flex items-center gap-2 hover:text-emerald-600 transition-colors break-all">
                                                <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {mentor.phone}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMentors.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Mentors Found</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Use the batch upload feature or add mentors manually to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
