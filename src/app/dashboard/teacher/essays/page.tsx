"use client";
// Force rebuild
import { useState } from 'react';
import { ClipboardType, Loader2, Save, History, Calendar, ChevronDown, ChevronUp, Trash2, CheckCircle, BrainCircuit } from 'lucide-react';

interface PaperConfig {
    id: string;
    name: string;
    topics: string;
}

interface SavedEssayExam {
    id: string;
    subject: string;
    date: string;
    papers: { id: string; name: string; questions: string[] }[];
}

export default function EssayGeneratorPage() {
    // Phase 1: Configuration
    const [subject, setSubject] = useState('');
    const [numPapers, setNumPapers] = useState(1);
    const [paperConfigs, setPaperConfigs] = useState<PaperConfig[]>([
        { id: '1', name: 'Paper 1', topics: '' }
    ]);
    const [isConfigSaved, setIsConfigSaved] = useState(false);

    // Phase 2: Generation Setup
    const [selectedPaperId, setSelectedPaperId] = useState('all');
    const [essayType, setEssayType] = useState('Long Essay Questions (LEQs)');
    const [numQs, setNumQs] = useState(5);
    const [loading, setLoading] = useState(false);

    // Current generation draft
    const [generatedPapers, setGeneratedPapers] = useState<{ id: string; name: string; questions: string[] }[]>([]);

    // History
    const [savedExams, setSavedExams] = useState<SavedEssayExam[]>([]);
    const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

    const essayTypes = [
        "Modified Essay Questions (MEQs)",
        "Long Essay Questions (LEQs)",
        "Short Answer Questions (SAQs)",
        "Case-Based / Clinical Scenario Questions",
        "Ethical and Social Issue Essays",
        "Comparative / Critical Analysis Questions"
    ];

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
        setSelectedPaperId('all'); // default
    };

    const handleGenerate = async () => {
        const papersToGenerate = selectedPaperId === 'all' 
            ? paperConfigs.filter(p => p.topics) 
            : paperConfigs.filter(p => p.id === selectedPaperId && p.topics);

        if (papersToGenerate.length === 0) {
            alert("Please ensure selected paper(s) have topics specified.");
            return;
        }

        setLoading(true);
        setGeneratedPapers([]);

        try {
            const results = await Promise.all(papersToGenerate.map(async (paper) => {
                const res = await fetch('/api/essay-generator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        subject, 
                        topics: paper.topics, 
                        essayType,
                        numQs 
                    })
                });
                const data = await res.json();
                return { 
                    id: paper.id, 
                    name: paper.name, 
                    questions: data.success && data.questions ? data.questions : [] 
                };
            }));
            
            setGeneratedPapers(results.filter(r => r.questions.length > 0));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveExam = () => {
        if (generatedPapers.length === 0) return;

        const newExam: SavedEssayExam = {
            id: Date.now().toString(),
            subject: subject || 'Blank Subject',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            papers: [...generatedPapers]
        };

        setSavedExams(prev => [newExam, ...prev]);
        setGeneratedPapers([]);
        alert("Exam saved securely to your timeline!");
    };


    return (
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col h-[calc(100vh-8rem)]">
            <div className="text-center mb-2 flex-shrink-0">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Essay Questions Generator</h2>
                <p className="text-slate-500">Draft complex structured, case-based, and short answer essay questions instantly.</p>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 space-y-6 px-2">
                {/* 1. CONFIGURATION */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex gap-2 items-center">
                        <BrainCircuit className="w-5 h-5 text-emerald-600" /> 1. Configure Subjects & Topics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Type Subject</label>
                            <input
                                type="text"
                                placeholder="e.g., Physiology, Community Medicine"
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
                                    if (e.target.value === 'more') handleNumPapersChange(numPapers + 1);
                                    else handleNumPapersChange(Number(e.target.value));
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                            >
                                {Array.from({ length: Math.max(numPapers, 3) }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={n}>Paper {n}</option>
                                ))}
                                <option value="more">+ Add More Papers</option>
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
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    placeholder="Enter Topics/Systems specified (e.g., Respiratory, CNS)"
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
                            <Save className="w-5 h-5" /> {isConfigSaved ? 'Saved Draft Context' : 'Save Configurations'}
                        </button>
                    </div>
                </div>

                {/* 2. GENERATION TRIGGER */}
                {isConfigSaved && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ClipboardType className="w-5 h-5 text-emerald-600" /> 2. Generate Essay Examination
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Paper To Draft</label>
                                <select
                                    value={selectedPaperId}
                                    onChange={e => setSelectedPaperId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                >
                                    <option value="all">All Papers Simultaneously</option>
                                    {paperConfigs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quantity Of Questions</label>
                                <input
                                    type="number"
                                    min="1" max="25"
                                    value={numQs}
                                    onChange={e => setNumQs(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Type of Essay Questions</label>
                                <select
                                    value={essayType}
                                    onChange={e => setEssayType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                >
                                    {essayTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                           <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="bg-emerald-600 text-white font-bold h-12 px-8 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardType className="w-5 h-5" />}
                                {loading ? 'Orchestrating AI...' : 'Generate Questions'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. GENERATED ACTIVE DRAFT */}
                {generatedPapers.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pt-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 pb-4 border-b border-slate-200 gap-4">
                             <div>
                                <h3 className="text-xl font-bold text-slate-900">Current Exam Draft</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review your generated questions</p>
                             </div>
                             <button
                                onClick={handleSaveExam}
                                className="bg-slate-900 text-white font-bold h-11 px-6 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm shadow-sm"
                            >
                                <Save className="w-4 h-4" /> Save Entire Draft
                            </button>
                        </div>
                        
                        {generatedPapers.map(paper => (
                            <div key={paper.id} className="space-y-4">
                                <div className="bg-emerald-50 text-emerald-800 font-bold px-5 py-3 rounded-xl border border-emerald-100 inline-block text-sm uppercase tracking-widest shadow-sm">
                                    {paper.name} <span className="text-emerald-500 mx-2">•</span> {paper.questions.length} Questions
                                </div>
                                <div className="space-y-4">
                                    {paper.questions.map((q, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4">
                                            <div className="w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center">
                                                Q{idx + 1}
                                            </div>
                                            <div className="pt-2">
                                                <p className="font-medium text-slate-800 leading-relaxed text-[16px] whitespace-pre-wrap">{q}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. EXAM HISTORY TIMELINE */}
                {savedExams.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pt-10 border-t-2 border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                                <History className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Archived Examination Drafts</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Your securely saved offline history</p>
                            </div>
                        </div>

                        {savedExams.map(exam => (
                            <div key={exam.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                                <div 
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedExamId(expandedExamId === exam.id ? null : exam.id)}
                                >
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{exam.subject} <span className="text-slate-400 font-medium ml-1">Essays</span></h4>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">
                                                <Calendar className="w-3.5 h-3.5" /> {exam.date}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                {exam.papers.length} Papers Included
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-transform">
                                        {expandedExamId === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                {expandedExamId === exam.id && (
                                    <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50 mt-4">
                                        <div className="space-y-8 mt-4">
                                            {exam.papers.map(paper => (
                                                <div key={paper.id} className="space-y-3">
                                                    <div className="text-sm font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {paper.name} Questions
                                                    </div>
                                                    <div className="space-y-3">
                                                        {paper.questions.map((q, idx) => (
                                                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-3">
                                                                <span className="text-slate-400 font-bold self-start mt-0.5">Q{idx+1}.</span>
                                                                <p className="text-slate-800 font-medium text-sm whitespace-pre-wrap">{q}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
