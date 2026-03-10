import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TopicCompetency {
    id: string;
    topic: string;
    competencyNo: string;
    isCompleted?: boolean;
}

export interface WeeklyClassSlot {
    id: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    fromTime: string; // HH:mm
    toTime: string;   // HH:mm
}

export interface TimetableFormat {
    id: string; // Unique ID for this format (Course + Department)
    instituteName: string;
    instituteLogoUrl: string | null;
    course: string;
    department: string;
    weeklySlots: WeeklyClassSlot[];
    facultyMembers: string[];
    topicsPool: TopicCompetency[];
    createdAt: string;
    updatedAt: string;
}

export interface ScheduledClass {
    id: string;
    date: string; // YYYY-MM-DD
    formatId: string; // Links back to TimetableFormat
    topicId: string; // ID from TopicCompetency
    topicName: string; // Cached for easy rendering
    competencyNo: string;
    activity: string; // "Lecture", "Tutorial", "Practical", etc.
    batch: 'Full' | 'Batch A' | 'Batch B' | 'Batch C' | 'Batch D' | 'Batch E' | string;
    staffName: string;
}

export interface Holiday {
    id: string;
    date: string; // YYYY-MM-DD
    details: string;
}

interface TimetableStoreState {
    formats: TimetableFormat[];
    schedules: ScheduledClass[];
    holidays: Holiday[];
    
    // Actions for Formats
    addFormat: (format: Omit<TimetableFormat, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateFormat: (id: string, updates: Partial<TimetableFormat>) => void;
    deleteFormat: (id: string) => void;
    
    // Actions for Scheduling
    scheduleClass: (scheduledClass: Omit<ScheduledClass, 'id'>) => void;
    updateScheduledClass: (id: string, updates: Partial<ScheduledClass>) => void;
    deleteScheduledClass: (id: string) => void;
    markTopicCompleted: (formatId: string, topicId: string, isCompleted: boolean) => void;

    // Actions for Holidays
    addHoliday: (date: string, details: string) => void;
    removeHoliday: (date: string) => void;
}

export const useTimetableStore = create<TimetableStoreState>()(
    persist(
        (set) => ({
            formats: [],
            schedules: [],
            holidays: [],

            // --- Formats ---
            addFormat: (formatData) => set((state) => ({
                formats: [
                    ...state.formats,
                    {
                        ...formatData,
                        id: `format_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                ]
            })),
            updateFormat: (id, updates) => set((state) => ({
                formats: state.formats.map(format => 
                    format.id === id 
                        ? { ...format, ...updates, updatedAt: new Date().toISOString() } 
                        : format
                )
            })),
            deleteFormat: (id) => set((state) => ({
                formats: state.formats.filter(format => format.id !== id),
                schedules: state.schedules.filter(sched => sched.formatId !== id) // Cascade delete schedules
            })),

            // --- Scheduling ---
            scheduleClass: (classData) => set((state) => {
                // When scheduling a class, automatically mark the topic as completed in the format's pool
                const updatedFormats = state.formats.map(f => {
                    if (f.id === classData.formatId) {
                        return {
                            ...f,
                            topicsPool: f.topicsPool.map(t => 
                                t.id === classData.topicId ? { ...t, isCompleted: true } : t
                            )
                        };
                    }
                    return f;
                });

                return {
                    formats: updatedFormats,
                    schedules: [
                        ...state.schedules,
                        {
                            ...classData,
                            id: `class_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                        }
                    ]
                };
            }),
            updateScheduledClass: (id, updates) => set((state) => {
                // If the topic changed, we might need to toggle completion states... 
                // For simplicity in this demo, let's just update the schedule record.
                return {
                    schedules: state.schedules.map(sched => 
                        sched.id === id ? { ...sched, ...updates } : sched
                    )
                };
            }),
            deleteScheduledClass: (id) => set((state) => {
                const classToDelete = state.schedules.find(s => s.id === id);
                if (!classToDelete) return state;

                // When deleting a schedule, unmark the topic as completed
                const updatedFormats = state.formats.map(f => {
                    if (f.id === classToDelete.formatId) {
                        return {
                            ...f,
                            topicsPool: f.topicsPool.map(t => 
                                t.id === classToDelete.topicId ? { ...t, isCompleted: false } : t
                            )
                        };
                    }
                    return f;
                });

                return {
                    formats: updatedFormats,
                    schedules: state.schedules.filter(sched => sched.id !== id)
                };
            }),
            markTopicCompleted: (formatId, topicId, isCompleted) => set((state) => ({
                formats: state.formats.map(f => {
                    if (f.id === formatId) {
                        return {
                            ...f,
                            topicsPool: f.topicsPool.map(t => 
                                t.id === topicId ? { ...t, isCompleted } : t
                            )
                        };
                    }
                    return f;
                })
            })),

            // --- Holidays ---
            addHoliday: (date, details) => set((state) => {
                // Ensure we don't add duplicate holidays for the same date
                if (state.holidays.some(h => h.date === date)) return state;
                return {
                    holidays: [
                        ...state.holidays,
                        { id: `hol_${Date.now()}`, date, details }
                    ]
                };
            }),
            removeHoliday: (date) => set((state) => ({
                holidays: state.holidays.filter(h => h.date !== date)
            }))
        }),
        {
            name: 'mededuai-timetable-storage',
            version: 1,
        }
    )
);
