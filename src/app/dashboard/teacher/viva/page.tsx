"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2, Ear, PlayCircle, Loader2, CheckCircle, RefreshCcw } from 'lucide-react';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useUserStore } from '@/store/userStore';
import { tokenService } from '@/lib/tokenService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const instructionTypes = [
    "Case scenario based",
    "Test basic knowledge",
    "Test deeper knowledge",
    "Test Memory power",
    "Tests Critical thinking ability",
    "Tests Communication to patient",
    "Any other"
];

export default function VivaSimulatorPage() {
    const currentUser = useUserStore(state => state.users[0]);
    const { coursesList } = useCurriculumStore();
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');

    const [instructionType, setInstructionType] = useState(instructionTypes[0]);
    const [customInstruction, setCustomInstruction] = useState('');

    const [started, setStarted] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

    const [history, setHistory] = useState<{ role: 'user' | 'examiner', content: string }[]>([]);

    // Recording features
    const [recording, setRecording] = useState(false);
    const [loadingResponse, setLoadingResponse] = useState(false);
    const [transcriptText, setTranscriptText] = useState('');
    const recognitionRef = useRef<any>(null);

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

    // Initialize SpeechRecognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscriptText(currentTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setRecording(false);
            };
        }
    }, []);

    const fetchNextQuestion = async (updatedHistory: any[]) => {
        setLoadingResponse(true);
        try {
            const payload = {
                course: activeCourse?.name,
                subject: activeSubject?.name,
                topic: activeTopic?.name,
                instruction: instructionType === 'Any other' ? customInstruction : instructionType,
                history: updatedHistory,
                action: 'next'
            };

            const res = await fetch('/api/viva', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            const aiText = data.response;
            setHistory(prev => [...prev, { role: 'examiner', content: aiText }]);
            playAudio(aiText);

            if (currentUser) {
                tokenService.processTransaction(currentUser.id, 'Viva Simulator', 'gemini-1.5-flash');
            }
        } catch (e) {
            console.error(e);
            const fallbackText = "I am having trouble connecting. Let's try again in a moment.";
            setHistory(prev => [...prev, { role: 'examiner', content: fallbackText }]);
            playAudio(fallbackText);
        } finally {
            setLoadingResponse(false);
        }
    };

    const handleStart = () => {
        if (!currentUser) return;
        const check = tokenService.checkAvailability(currentUser.id, 'Viva Simulator');
        if (!check.allowed) {
            alert(`${check.reason || 'Insufficient tokens'}! Cost: ${check.required}, Balance: ${check.remaining}`);
            return;
        }

        setStarted(true);
        setHistory([]);
        // Initial intro from Examiner
        fetchNextQuestion([]);
    };

    const handleToggleRecording = () => {
        if (recording) {
            // Stop recording
            recognitionRef.current?.stop();
            setRecording(false);
            if (transcriptText.trim()) {
                if (!currentUser) return;
                const check = tokenService.checkAvailability(currentUser.id, 'Viva Simulator');
                if (!check.allowed) {
                    const fallbackText = "You have exhausted your AI tokens. Please recharge your wallet to continue.";
                    setHistory(prev => [...prev, { role: 'examiner', content: fallbackText }]);
                    playAudio(fallbackText);
                    return;
                }

                const newHistory: any = [...history, { role: 'user', content: transcriptText.trim() }];
                setHistory(newHistory);
                setTranscriptText('');
                fetchNextQuestion(newHistory);
            }
        } else {
            // Start recording
            setTranscriptText('');
            recognitionRef.current?.start();
            setRecording(true);
        }
    };

    const handleEndAndAnalyze = async () => {
        setAnalyzing(true);
        setRecording(false);
        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();

        try {
            const payload = {
                course: activeCourse?.name,
                subject: activeSubject?.name,
                topic: activeTopic?.name,
                instruction: instructionType === 'Any other' ? customInstruction : instructionType,
                history,
                action: 'analyze'
            };

            const res = await fetch('/api/viva', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setAnalysisResult(data.response);

            if (currentUser) {
                tokenService.processTransaction(currentUser.id, 'Viva Simulator', 'gemini-1.5-flash');
            }
        } catch (e) {
            setAnalysisResult("Failed to generate analysis.");
        } finally {
            setAnalyzing(false);
        }
    };

    const playAudio = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, '')); // Sanitize MD for voice
            const voices = window.speechSynthesis.getVoices();
            // Try to find a good voice
            const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
            if (preferredVoice) utterance.voice = preferredVoice;
            window.speechSynthesis.speak(utterance);
        }
    };

    const currentExaminerQuestion = history.length > 0 && history[history.length - 1].role === 'examiner'
        ? history[history.length - 1].content
        : "Thinking...";

    return (
        <div className="max-w-4xl mx-auto space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            <div className="text-center mb-4 flex-shrink-0">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Viva Simulator</h2>
                <p className="text-slate-500">Voice-based interactive oral examination training.</p>
            </div>

            {!started ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex-1 overflow-y-auto">
                    <p className="text-slate-600 text-center mb-6 max-w-lg mx-auto leading-relaxed">Choose your parameters to practice structured mock-oral questions. Our AI handles realistic dynamic evaluation on the fly.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Course</label>
                            <select
                                value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {coursesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                            <select
                                value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {activeCourse?.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>) || <option>No Subjects</option>}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Topic</label>
                        <select
                            value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {allTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>) || <option>No Topics</option>}
                        </select>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Instructions / Focus Area</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {instructionTypes.map((type, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                                    <input
                                        type="radio" name="instructionType" value={type}
                                        checked={instructionType === type} onChange={e => setInstructionType(e.target.value)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{type}</span>
                                </label>
                            ))}
                        </div>
                        {instructionType === 'Any other' && (
                            <input
                                value={customInstruction} onChange={e => setCustomInstruction(e.target.value)}
                                placeholder="Type your specific test instructions here..."
                                className="w-full mt-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        )}
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!activeTopic}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
                    >
                        <PlayCircle className="w-5 h-5" /> Start Simulation
                    </button>
                </div>
            ) : analysisResult ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <h3 className="text-2xl font-bold text-slate-800">Performance Analysis</h3>
                    </div>
                    <div className="prose prose-slate max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult}</ReactMarkdown>
                    </div>
                    <button
                        onClick={() => { setStarted(false); setAnalysisResult(''); setHistory([]); }}
                        className="mt-8 py-3 px-6 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 w-full"
                    >
                        <RefreshCcw className="w-5 h-5" /> Start New Simulation
                    </button>
                </div>
            ) : analyzing ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing your performance...</h3>
                    <p className="text-slate-500 text-center">The AI is reviewing your transcript to provide structured feedback.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col pb-8">
                    <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col p-8 items-center justify-center text-center relative overflow-hidden transition-all duration-300">
                        {loadingResponse ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                <span className="text-slate-500 font-medium">Examiner is thinking...</span>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Examiner</h3>
                                <p className="text-2xl font-medium text-slate-800 mb-8 max-w-xl leading-relaxed">
                                    "{currentExaminerQuestion}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => playAudio(currentExaminerQuestion)}
                                        className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                                        title="Replay Audio"
                                    >
                                        <Volume2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </>
                        )}

                        {(recording || transcriptText) && (
                            <div className="absolute bottom-8 inset-x-8 bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4">
                                <p className="text-sm font-bold text-slate-500 mb-1 text-left">Your Answer:</p>
                                <p className="text-slate-800 text-left min-h-6 italic">
                                    {transcriptText || "..."}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-4 flex-shrink-0">
                        <div className="bg-slate-900 rounded-full p-2 pl-6 pr-4 shadow-xl flex items-center justify-between w-full max-w-md gap-6">
                            <div className="flex items-center gap-3">
                                <Ear className={`w-5 h-5 ${recording ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
                                <span className={`text-sm font-bold ${recording ? 'text-white' : 'text-slate-400'}`}>
                                    {recording ? 'Listening... tap to stop & send' : 'Tap Mic to Respond'}
                                </span>
                            </div>
                            <button
                                onClick={handleToggleRecording}
                                disabled={loadingResponse}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${recording ? 'bg-red-500 hover:bg-red-600 shrink-0' : 'bg-indigo-600 hover:bg-indigo-700 shrink-0'
                                    } disabled:opacity-50`}
                            >
                                {recording ? <Square className="w-5 h-5 text-white fill-current" /> : <Mic className="w-5 h-5 text-white" />}
                            </button>
                        </div>

                        <button
                            onClick={handleEndAndAnalyze}
                            disabled={loadingResponse || recording || history.length < 1}
                            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors underline disabled:opacity-50"
                        >
                            I am done, end simulation & analyze
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
