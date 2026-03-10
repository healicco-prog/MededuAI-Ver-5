"use client";

import { useState } from 'react';
import { BrainCircuit, BookOpen, Mic, Stethoscope, ChevronRight, CheckCircle2, Menu, X, Star } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">MedEduAI</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">How it Works</a>
              <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Testimonials</a>
              <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Blog</Link>
              <Link href="/login" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                Log In
              </Link>
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-8 border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Next-Gen Medical Education
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
          Master Medicine with <span className="text-emerald-600">AI Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
          The all-in-one web portal for MBBS, BDS, and Nursing students. Experience personalized viva simulations, AI-generated structured notes, and smart case presentations.
        </p>
        <div className="flex flex-col items-center justify-center gap-6 mt-8 max-w-4xl mx-auto">
          <Link 
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl text-lg font-bold hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            Explore Dashboards
            <ChevronRight className="w-5 h-5 transition-transform duration-300" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Empowering the Medical Future</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Tools built specifically for the demanding workflow of modern medical students and leading university teachers.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="LMS Creator Intel"
              description="AI automatically generates structured topic notes tailored precisely to university examination marking patterns."
              color="emerald"
            />
            <FeatureCard
              icon={<Mic className="w-6 h-6" />}
              title="Viva Simulator"
              description="Voice-based interactive oral exams with instant, structured feedback on your terminology and confidence."
              color="blue"
            />
            <FeatureCard
              icon={<Stethoscope className="w-6 h-6" />}
              title="Case Presenter"
              description="Upload rough case summaries and let our AI restructure them into perfect clinical flow formats."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How MedEduAI Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Choose Role', desc: 'Login easily to dynamically load the student or teacher interface tailored to your needs.' },
              { step: '2', title: 'Select Module', desc: 'From grading scripts to taking a simulated viva exam, navigate seamlessly via our modern sidebar.' },
              { step: '3', title: 'Master Your Output', desc: 'Securely extract perfectly formatted outputs backed by the latest Gemini Models.' }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-400 mx-auto mb-6 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Trusted by Indian Medicos</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <TestimonialCard
              name="Dr. Ananya Sharma"
              role="MBBS Intern"
              text="The AI mentor structured my messy case files directly into perfect university-standard presentations. A massive time saver during my grueling rotations!"
            />
            <TestimonialCard
              name="Dr. Rohan Iyer"
              role="Assistant Professor"
              text="MedEduAI's Evaluation Management System and auto-rubric generator means I grade batches of scripts with high precision in a fraction of the usual time."
            />
            <TestimonialCard
              name="Dr. Meera Nair"
              role="BDS Final Year"
              text="The Viva Simulator correctly pointed out when I used the wrong oral pathology descriptors. Truly remarkable system."
            />
            <TestimonialCard
              name="Dr. Arjun Patel"
              role="Medical Educator"
              text="Unbelievable. The platform correctly adapts different modules whether I'm preparing a detailed lesson plan or formulating standard question papers."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-emerald-600 w-6 h-6" />
            <span className="font-bold text-xl text-slate-900">MedEduAI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 MedEduAI Platform. Built for the future of Medicine.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: any) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:shadow-xl transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, role, text }: any) {
  return (
    <div className="bg-white p-8 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex text-amber-400 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
      </div>
      <p className="text-slate-600 mb-6 font-medium leading-relaxed italic">"{text}"</p>
      <div>
        <p className="font-bold text-slate-900">{name}</p>
        <p className="text-sm text-emerald-600 font-semibold">{role}</p>
      </div>
    </div>
  );
}
