import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Topic = { id: string, name: string, generatedNotes?: Record<string, string> };
export type Section = { id: string, name: string, topics: Topic[] };
export type Subject = { id: string, name: string, sections: Section[] };

export type LMSNotesStructureItem = {
    id: string;
    title: string;
    description: string;
    value: string;
    type: 'text' | 'number';
};

export const defaultLMSStructure: LMSNotesStructureItem[] = [
    { id: 'l1', title: 'Introduction', description: 'Mention how it has to be', value: 'Exam-oriented bullet points', type: 'text' },
    { id: 'l2', title: 'Detailed Notes', description: 'Mention how it has to be / approx words', value: 'Essay format', type: 'text' },
    { id: 'l3', title: 'Summary', description: 'Mention how it has to be', value: 'Concise revision or image summary', type: 'text' },
    { id: 'l4', title: '10 Marks Question', description: 'Select No', value: '0', type: 'number' },
    { id: 'l5', title: '5 Marks Question', description: 'Select No', value: '0', type: 'number' },
    { id: 'l6', title: '3 Marks Reasoning Question', description: 'Select No', value: '0', type: 'number' },
    { id: 'l7', title: '2 Marks Case-based MCQs', description: 'Select No', value: '0', type: 'number' },
    { id: 'l8', title: '1 Mark MCQs Question', description: 'Select No', value: '0', type: 'number' },
    { id: 'l9', title: 'Flashcards', description: 'Number of flashcards', value: '0', type: 'number' },
    { id: 'l10', title: 'PPT', description: 'Number of slides required.', value: '0', type: 'number' }
];

export type Course = { id: string, name: string, subjects: Subject[], lmsNotesStructure: LMSNotesStructureItem[] };

interface CurriculumState {
    coursesList: Course[];
    setCoursesList: (updater: Course[] | ((prev: Course[]) => Course[])) => void;
}

export const useCurriculumStore = create<CurriculumState>()(
    persist(
        (set) => ({
            coursesList: [
                {
                    id: 'c1',
                    name: 'MBBS',
                    subjects: [
                        {
                            id: 's1',
                            name: 'Anatomy',
                            sections: [
                                { id: 'sec1', name: 'Upper Limb', topics: [{ id: 't1', name: 'Upper Limb Physiology' }] }
                            ]
                        }
                    ],
                    lmsNotesStructure: [...defaultLMSStructure]
                },
                { id: 'c2', name: 'BDS', subjects: [], lmsNotesStructure: [...defaultLMSStructure] }
            ],
            setCoursesList: (updater) => set((state) => ({
                coursesList: typeof updater === 'function' ? updater(state.coursesList) : updater
            })),
        }),
        {
            name: 'curriculum-storage', // key in local storage
            version: 1, // trigger migration
            migrate: (persistedState: any, version: number) => {
                if (version === 0 && persistedState.coursesList) {
                    persistedState.coursesList.forEach((course: any) => {
                        if (course.lmsNotesStructure) {
                            course.lmsNotesStructure.forEach((item: any) => {
                                if (item.id === 'l9' && item.title === 'Flashcards' && item.description === 'Select No') {
                                    item.description = 'Number of flashcards';
                                }
                                if (item.id === 'l10' && item.title === 'PPT' && item.description === 'Select No') {
                                    item.description = 'Number of slides required.';
                                }
                            });
                        }
                    });
                }
                return persistedState;
            }
        }
    )
);
