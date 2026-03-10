"use client";

import { useState, useEffect } from 'react';
import { Volume2, ChevronDown, Library, Loader2, PlayCircle } from 'lucide-react';
import { useCurriculumStore } from '@/store/curriculumStore';

export default function VocabBuilderPage() {
    const { coursesList } = useCurriculumStore();
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');

    const [loading, setLoading] = useState(false);
    const [openedIndex, setOpenedIndex] = useState<number | null>(null);
    const [vocabList, setVocabList] = useState<any[]>([]);

    const activeCourse = coursesList.find(c => c.id === selectedCourseId) || coursesList[0];
    const activeSubject = activeCourse?.subjects.find(s => s.id === selectedSubjectId) || activeCourse?.subjects[0];
    const allTopics = activeSubject?.sections.flatMap(s => s.topics) || [];
    const activeTopic = allTopics.find(t => t.id === selectedTopicId) || allTopics[0];

    useEffect(() => {
        if (!selectedCourseId && coursesList.length > 0) setSelectedCourseId(coursesList[0].id);
    }, [coursesList, selectedCourseId]);

    useEffect(() => {
        if (activeCourse && !selectedSubjectId && activeCourse.subjects.length > 0) {
            setSelectedSubjectId(activeCourse.subjects[0].id);
        }
    }, [activeCourse, selectedSubjectId]);

    useEffect(() => {
        if (activeSubject && !selectedTopicId && activeSubject.sections.length > 0 && activeSubject.sections[0].topics.length > 0) {
            setSelectedTopicId(activeSubject.sections[0].topics[0].id);
        }
    }, [activeSubject, selectedTopicId]);

    const handleGenerate = async () => {
        if (!activeTopic) return;
        setLoading(true);
        setVocabList([]);
        setOpenedIndex(null);

        try {
            const res = await fetch('/api/vocab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course: activeCourse?.name,
                    subject: activeSubject?.name,
                    topic: activeTopic?.name
                })
            });
            const data = await res.json();
            if (data.success && data.terms) {
                setVocabList(data.terms);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
            if (preferredVoice) utterance.voice = preferredVoice;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col h-[calc(100vh-8rem)]">
            <div className="text-center mb-2 flex-shrink-0">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Medical Vocabulary Builder</h2>
                <p className="text-slate-500">Generate 10 key terms for any topic with audio pronunciation and simple English meaning.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Course</label>
                        <select
                            value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                        >
                            {coursesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Subject</label>
                        <select
                            value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                        >
                            {activeCourse?.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>) || <option>No Subjects</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Topic</label>
                        <select
                            value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                        >
                            {allTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>) || <option>No Topics</option>}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                        onClick={handleGenerate}
                        disabled={!activeTopic || loading}
                        className="bg-emerald-600 text-white font-bold h-12 px-8 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Library className="w-5 h-5" />}
                        {loading ? 'Generating Terms...' : 'Generate Terms'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-8">
                {vocabList.length === 0 && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 mt-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Library className="w-8 h-8 text-slate-300" />
                        </div>
                        <p>Select a topic above and click Generate.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                    {vocabList.map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer group"
                                onClick={() => setOpenedIndex(openedIndex === i ? null : i)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-100">{i + 1}</span>
                                    <span className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">{item.term}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex items-center justify-center"
                                        onClick={(e) => { e.stopPropagation(); playAudio(item.term); }}
                                        title="Play Pronunciation"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openedIndex === i ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {openedIndex === i && (
                                <div className="p-5 pt-0 bg-slate-50 border-t border-slate-100 space-y-4">
                                    <div className="mt-4">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">Meaning (Simple English)</h4>
                                        <p className="text-slate-700 font-medium text-[15px]">{item.meaning}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Example Usage</h4>
                                        <p className="text-slate-600 italic text-sm">" {item.example} "</p>
                                    </div>
                                    {item.regional && (
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Regional Language Equivalent</h4>
                                            <p className="text-emerald-700 font-semibold">{item.regional}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
