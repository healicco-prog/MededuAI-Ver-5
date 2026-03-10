"use client";

import { useState } from 'react';
import { ClipboardCheck, Loader2, Save, Send, CheckCircle, XCircle, Trash2, History, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function McqGeneratorPage() {
    // Phase 1: Configuration
    const [subject, setSubject] = useState('');
    const [numPapers, setNumPapers] = useState(1);
    const [paperConfigs, setPaperConfigs] = useState<{ id: string; name: string; topics: string }[]>([
        { id: '0', name: 'Paper 1', topics: '' }
    ]);
    const [isConfigSaved, setIsConfigSaved] = useState(false);

    // Phase 2: Generation
    const [selectedPaperId, setSelectedPaperId] = useState('all');
    const [numMcqs, setNumMcqs] = useState(10);
    const [loading, setLoading] = useState(false);

    const [generatedPapers, setGeneratedPapers] = useState<{ id: string; name: string; mcqs: any[] }[]>([]);

    // History State
    const [savedExams, setSavedExams] = useState<{ id: string; subject: string; date: string; numMcqs: number; papers: { id: string; name: string; mcqs: any[] }[] }[]>([]);
    const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

    // Interaction State
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleNumPapersChange = (val: number) => {
        setNumPapers(val);
        setPaperConfigs(prev => {
            const newConfigs = [...prev];
            if (val > prev.length) {
                for (let i = prev.length; i < val; i++) {
                    newConfigs.push({ id: `${Date.now()}-${i}`, name: `Paper ${i+1}`, topics: '' });
                }
            } else if (val < prev.length) {
                newConfigs.splice(val);
            }
            return newConfigs;
        });
        setIsConfigSaved(false);
    };

    const deletePaper = (idToDelete: string) => {
        if (paperConfigs.length <= 1) return;
        
        setPaperConfigs(prev => {
            const filtered = prev.filter(p => p.id !== idToDelete);
            return filtered.map((p, index) => ({ ...p, name: `Paper ${index + 1}` }));
        });
        setNumPapers(prev => prev - 1);
        setIsConfigSaved(false);
    };

    const updatePaperTopic = (index: number, topics: string) => {
        const newConfigs = [...paperConfigs];
        newConfigs[index].topics = topics;
        setPaperConfigs(newConfigs);
    };

    const saveConfig = () => {
        if (!subject) {
            alert("Please type a subject.");
            return;
        }
        setIsConfigSaved(true);
        setSelectedPaperId('all');
    };

    const handleGenerate = async () => {
        const papersToGenerate = selectedPaperId === 'all' 
            ? paperConfigs.filter(p => p.topics) 
            : paperConfigs.filter(p => p.id === selectedPaperId && p.topics);

        if (papersToGenerate.length === 0) {
            alert("Please ensure the selected paper(s) have topics specified.");
            return;
        }

        setLoading(true);
        setAnswers({});

        try {
            const results = await Promise.all(papersToGenerate.map(async (paper) => {
                const res = await fetch('/api/mcq-generator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, topics: paper.topics, numMcqs })
                });
                const data = await res.json();
                return { id: paper.id, name: paper.name, mcqs: data.success && data.mcqs ? data.mcqs : [] };
            }));
            
            setGeneratedPapers(results.filter(r => r.mcqs.length > 0));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerItem = (paperId: string, mcqIndex: number, option: string) => {
        const key = `${paperId}-${mcqIndex}`;
        if (answers[key] !== undefined) return; // already answered
        setAnswers(prev => ({ ...prev, [key]: option }));
    };

    const handleSaveAllToDb = () => {
        if (generatedPapers.length === 0) return;
        
        let totalMcqs = 0;
        generatedPapers.forEach(p => totalMcqs += p.mcqs.length);

        const newExam = {
            id: Date.now().toString(),
            subject: subject || 'Unnamed Subject',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            numMcqs: totalMcqs,
            papers: [...generatedPapers]
        };

        setSavedExams(prev => [newExam, ...prev]);
        setGeneratedPapers([]); // Clear current generation
        alert("All generated MCQs have been saved successfully!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col h-[calc(100vh-8rem)]">
            <div className="text-center mb-2 flex-shrink-0">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">MCQs Generator</h2>
                <p className="text-slate-500">Generate high-yield MCQs for Final Summative Examinations.</p>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 space-y-6 px-2">
                {/* Configuration Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">1. Setup Exam Paper Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Type Subject</label>
                            <input
                                type="text"
                                placeholder="e.g., Anatomy, Physiology"
                                value={subject}
                                onChange={e => { setSubject(e.target.value); setIsConfigSaved(false); }}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">No. of Papers</label>
                            <select
                                value={numPapers}
                                onChange={e => {
                                    if (e.target.value === 'more') {
                                        handleNumPapersChange(numPapers + 1);
                                    } else {
                                        handleNumPapersChange(Number(e.target.value));
                                    }
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                            >
                                {Array.from({ length: Math.max(numPapers, 2) }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={n}>Paper {n}</option>
                                ))}
                                <option value="more">+ Add More</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        {paperConfigs.map((paper, idx) => (
                            <div key={paper.id} className="relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Topics/Systems for {paper.name}</label>
                                    {paperConfigs.length > 1 && (
                                        <button
                                            onClick={() => deletePaper(paper.id)}
                                            className="text-red-400 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                                            title="Delete Paper"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    placeholder="Enter Topics/Systems specified for this Paper (e.g., Cardiovascular System, CNS)"
                                    value={paper.topics}
                                    onChange={e => { updatePaperTopic(idx, e.target.value); setIsConfigSaved(false); }}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium min-h-[80px]"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            onClick={saveConfig}
                            className={`font-bold h-12 px-8 rounded-xl transition-all flex items-center gap-2 ${isConfigSaved ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                            disabled={isConfigSaved}
                        >
                            <Save className="w-5 h-5" />
                            {isConfigSaved ? 'Configuration Saved' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

                {/* Generator Section */}
                {isConfigSaved && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">2. Generate Questions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Paper To Generate</label>
                                <select
                                    value={selectedPaperId}
                                    onChange={e => setSelectedPaperId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                >
                                    <option value="all">All Papers (Entire Exam)</option>
                                    {paperConfigs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.topics.substring(0, 20)}{p.topics.length > 20 ? '...' : ''})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Specify No. of MCQs</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={numMcqs}
                                    onChange={e => setNumMcqs(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                           <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="bg-emerald-600 text-white font-bold h-12 px-8 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardCheck className="w-5 h-5" />}
                                {loading ? 'Generating MCQs...' : 'Generate MCQs'}
                            </button>
                        </div>
                    </div>
                )}

                {/* MCQs Section */}
                {generatedPapers.length > 0 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pt-4">
                        <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-4">
                             <h3 className="text-xl font-bold text-slate-900">Final Generated Examination</h3>
                             <button
                                onClick={handleSaveAllToDb}
                                className="bg-slate-900 text-white font-bold h-10 px-6 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm shadow-sm"
                            >
                                <Save className="w-4 h-4" /> Save Entire Exam
                            </button>
                        </div>
                        
                        {generatedPapers.map(paper => (
                            <div key={paper.id} className="space-y-4">
                                <div className="bg-emerald-50 text-emerald-800 font-bold px-5 py-3 rounded-xl border border-emerald-100 inline-block mb-2 text-sm uppercase tracking-widest shadow-sm">
                                    {paper.name} ({paper.mcqs.length} MCQs)
                                </div>
                                {paper.mcqs.map((mcq, idx) => {
                                    const ansKey = `${paper.id}-${idx}`;
                                    return (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <h4 className="font-bold text-slate-900 text-[17px] mb-5 flex gap-3 leading-relaxed">
                                                <span className="text-emerald-600 bg-emerald-50 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-100">{idx + 1}</span> 
                                                <span className="mt-1">{mcq.question}</span>
                                            </h4>
                                            <div className="space-y-3 mb-5 pl-11">
                                                {mcq.options.map((opt: string, optIdx: number) => {
                                                    const isAnswered = answers[ansKey] !== undefined;
                                                    const isSelected = answers[ansKey] === opt;
                                                    const isCorrectOpt = opt === mcq.correctAnswer;
                                                    
                                                    let btnClass = "w-full text-left px-5 py-3.5 rounded-2xl border font-medium transition-all duration-200 ";
                                                    if (!isAnswered) {
                                                        btnClass += "border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 shadow-sm hover:shadow";
                                                    } else {
                                                        if (isCorrectOpt) {
                                                            btnClass += "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500 ring-offset-1";
                                                        } else if (isSelected && !isCorrectOpt) {
                                                            btnClass += "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500 ring-offset-1";
                                                        } else {
                                                            btnClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
                                                        }
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            onClick={() => handleAnswerItem(paper.id, idx, opt)}
                                                            disabled={isAnswered}
                                                            className={btnClass}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>{opt}</span>
                                                                {isAnswered && isCorrectOpt && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                                                {isAnswered && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {answers[ansKey] !== undefined && (
                                                <div className={`ml-11 p-5 rounded-2xl border ${answers[ansKey] === mcq.correctAnswer ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'} animate-in fade-in slide-in-from-top-2`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {answers[ansKey] === mcq.correctAnswer ? (
                                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-600" />
                                                        )}
                                                        <h5 className={`font-bold text-sm uppercase tracking-wider ${answers[ansKey] === mcq.correctAnswer ? 'text-emerald-800' : 'text-red-800'}`}>
                                                            {answers[ansKey] === mcq.correctAnswer ? 'Correct Answer' : 'Incorrect Answer'}
                                                        </h5>
                                                    </div>
                                                    <p className="text-slate-700 text-[15px] leading-relaxed font-medium">
                                                        {mcq.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                         <div className="flex justify-center mt-8 pb-10">
                            <button
                                onClick={handleSaveAllToDb}
                                className="bg-emerald-600 text-white font-bold h-14 px-10 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <Save className="w-6 h-6" /> Save All Required MCQs
                            </button>
                        </div>
                    </div>
                )}
                {/* Saved Exams History */}
                {savedExams.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pt-10 border-t-2 border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                                <History className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Saved Examinations History</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Your previously generated MCQs</p>
                            </div>
                        </div>

                        {savedExams.map(exam => (
                            <div key={exam.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                                <div 
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedExamId(expandedExamId === exam.id ? null : exam.id)}
                                >
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{exam.subject} Examination</h4>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {exam.date}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                {exam.papers.length} Paper{exam.papers.length !== 1 && 's'} | {exam.numMcqs} MCQs
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-transform">
                                        {expandedExamId === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                {expandedExamId === exam.id && (
                                    <div className="p-6 pt-2 border-t border-slate-100 bg-slate-50 space-y-8">
                                        {exam.papers.map(paper => (
                                            <div key={paper.id} className="space-y-4">
                                                <div className="bg-white text-emerald-800 font-bold px-5 py-3 rounded-xl border border-emerald-100 inline-block mb-1 text-sm uppercase tracking-widest shadow-sm">
                                                    {paper.name} ({paper.mcqs.length} MCQs)
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 text-sm">
                                                    {paper.mcqs.map((mcq, idx) => (
                                                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                                            <h5 className="font-bold text-slate-800 mb-3 flex gap-3 text-[15px]">
                                                                <span className="text-slate-500 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">{idx + 1}</span> 
                                                                <span className="mt-0.5">{mcq.question}</span>
                                                            </h5>
                                                            <div className="pl-9 space-y-2">
                                                                {mcq.options.map((opt: string, optIdx: number) => (
                                                                    <div key={optIdx} className={`px-4 py-2 rounded-xl border ${opt === mcq.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                                        <div className="flex items-center justify-between">
                                                                            <span>{opt}</span>
                                                                            {opt === mcq.correctAnswer && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="mt-3 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                                                    <h6 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Explanation</h6>
                                                                    <p className="text-slate-700 leading-relaxed font-medium">
                                                                        {mcq.explanation}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
