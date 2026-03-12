# MedEduAI Platform Specification

## Overview
MedEduAI is an AI-powered medical education platform designed for students, faculty, and institutions.

The platform provides AI learning tools, mentorship modules, academic support systems, and exam preparation tools.

---

## Core Modules

### Authentication
- Secure login
- Signup
- Session cookie authentication
- Role-based access control

### Student Dashboard
- Learning dashboard
- Quick access modules
- Profile and activity tracking

### LMS Notes
- AI-assisted learning notes
- Structured subject content
- Searchable knowledge base

### Mentorship Portal
- Student mentorship profiles
- Peer mentorship system
- Mentor matching

### AI Mentor
- AI question answering
- Medical concept explanation
- Case discussion support

### Viva Simulator
- AI-generated viva questions
- Practice oral exams
- Feedback scoring

### Vocabulary Builder
- Medical terminology training
- Quiz-based learning

### Reflection Generator
- Clinical reflection writing
- Structured response assistance

---

## Navigation Flow

Login → Student Dashboard

Sidebar modules:

- LMS Notes
- Mentorship MS
- AI Mentor
- Viva Simulator
- Vocabulary
- Reflection Generator

---

## Technology Stack

Frontend
- Next.js
- React
- Tailwind CSS

Backend
- Node.js
- Supabase Auth
- API Routes

Deployment
- Google Cloud Run
- Firebase Hosting (temporary)
- Custom domain: mededuai.com