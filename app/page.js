"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CoachingOptions, CoachingExpert } from "@/services/Options";
import { useUser } from "@stackframe/stack";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";

/* ---------- Small SVG decorations as components ---------- */
const GradientBlob = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0" stopColor="#1e90ff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#0367A5" stopOpacity="0.9" />
      </linearGradient>
      <filter id="blur">
        <feGaussianBlur stdDeviation="50" />
      </filter>
    </defs>
    <g filter="url(#blur)">
      <path d="M421 126C472 210 430 325 360 379C290 433 170 450 109 371C48 292 80 162 164 104C248 46 370 42 421 126Z" fill="url(#g1)"/>
    </g>
  </svg>
);

const DecorativeWave = () => (
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20" aria-hidden>
    <path d="M0,30 C150,80 350,0 600,30 C850,60 1050,10 1200,40 L1200 120 L0 120 Z" fill="#f1f5f9" />
  </svg>
);

/* ---------- Subtle animated background shapes ---------- */
const AnimatedBackdrop = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <motion.div
      className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#EDE9FE] blur-2xl opacity-70"
      animate={{ x: [0, 20, -10, 0], y: [0, -10, 10, 0] }}
      transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -top-32 right-[-6rem] w-[28rem] h-[28rem] rounded-full bg-[#0367A5]/20 blur-3xl"
      animate={{ x: [0, -15, 10, 0], y: [0, 8, -8, 0] }}
      transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-64 left-1/3 w-64 h-64 rounded-full bg-white/40 ring-1 ring-[#0367A5]/10"
      animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
      transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
    />
  </div>
);

/* ---------- Motion helpers ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};
const pop = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1 },
};

/* ---------- Main Page ---------- */
export default function HomePage() {
  const user = useUser();
  const ctaHref = user ? "/dashboard" : "/handler/sign-in";
  const [openExpert, setOpenExpert] = React.useState(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white overflow-x-hidden relative">
      <AnimatedBackdrop />
      {/* Floating gradient blob */}
      <div className="pointer-events-none fixed -z-10 top-[-8rem] right-[-6rem] opacity-80">
        <GradientBlob className="w-[40rem] h-[40rem]" />
      </div>

      {/* Top-centered logo */}
      <header className="w-full flex justify-center pt-6">
        <Link href="/" aria-label="EduVi home" className="inline-flex items-center">
          <Image src="/eduvi-logo.png" alt="EduVi" width={148} height={40} priority />
        </Link>
      </header>

      {/* HERO */}
      <section className="relative pt-2 pb-8 lg:pt-4 lg:pb-20 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ddf4ff] to-[#e8f8ff] text-[#0367A5] px-3 py-1 rounded-full shadow-sm text-sm font-medium w-max">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3v4" stroke="#0367A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 7c1-2 6-2 8 0" stroke="#0367A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 14v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2" stroke="#0367A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              EduVi • AI voice agent for education
            </div>

            <h1 className="mt-6 text-4xl lg:text-6xl font-extrabold leading-tight text-slate-900">
              Learn by Talking — <span className="text-[#0367A5]">Hands-free</span>, Instant & Personal.
            </h1>

            <p className="mt-5 text-lg text-slate-600 max-w-2xl">
              EduVi listens, tutors, and gives feedback — all in natural voice. Choose a task, speak naturally, and get structured notes and improvement pointers.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-3 bg-[#0367A5] hover:bg-[#025b8b] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition"
                aria-label="Get started with EduVi"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Get started
              </Link>

              <a
                href="#features"
                className="text-[#0367A5] hover:underline font-medium"
              >
                Learn how it works →
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard number="+10k" label="Sessions" />
              <StatCard number="5" label="Task types" />
              <StatCard number="Auto" label="Notes & Feedback" />
            </div>
          </motion.div>

          {/* Illustration card */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={pop}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative"
          >
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl ring-1 ring-black/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-[#e6f5ff] to-[#d9f0ff] rounded-lg p-3 shadow-sm">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2v7" stroke="#0367A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 9h8" stroke="#0367A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 14v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2" stroke="#0367A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Demo Session</div>
                  <div className="font-semibold text-slate-800">Voice-first learning</div>
                </div>
              </div>

              <div className="relative">
                {/* decorative SVG waves */}
                <div className="absolute -left-10 -top-16 opacity-40">
                  <svg width="220" height="160" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stopColor="#e6f8ff"/><stop offset="1" stopColor="#d8efff"/></linearGradient></defs>
                    <rect rx="24" width="220" height="160" fill="url(#lg)"/>
                  </svg>
                </div>

                {/* hero illustration */}
                <Image
                  src="/home-1.gif"
                  alt="EduVi Illustration"
                  width={660}
                  height={420}
                  className="mx-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <DecorativeWave />

      {/* FEATURES */}
      <section id="features" className="px-6 lg:px-24 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.4}}>
            Powerful features — built for learners
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* feature cards */}
            {[
              { title: "Real-time voice conversation", desc: "Talk naturally — EduVi listens and replies instantly.", icon: "/realtime-text.png" },
              { title: "Mock interviews & feedback", desc: "Practice interviews and get constructive notes.", icon: "/interview.png" },
              { title: "Topic-based lectures", desc: "Receive concise, structured lectures on any topic.", icon: "/lecture.png" },
              { title: "Language practice", desc: "Pronunciation assistance and conversational drills.", icon: "/language.png" },
              { title: "Noise cancellation", desc: "Works well in noisy environments with audio preprocessing.", icon: "/noise-cancel.png" },
              { title: "Auto notes & summaries", desc: "Get structured notes automatically at session end.", icon: "/notes.png" },
            ].map((f, i) => (
              <motion.div key={i} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition text-center"
                variants={{ hidden: {opacity:0, y:14}, show: {opacity:1, y:0} }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#EDE9FE] to-[#e9f7ff] flex items-center justify-center">
                    <Image src={f.icon} width={44} height={44} alt={f.title} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="px-6 lg:px-24 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.h2 className="text-3xl lg:text-4xl font-bold text-slate-900 text-center mb-12" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>
            How EduVi fits into your learning flow
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "Choose task", title: "Pick one of five modes", text: "Lecture, Mock Interview, Q&A, Language, Meditation." },
              { step: "Speak naturally", title: "Start the voice session", text: "EduVi transcribes, understands context, and responds." },
              { step: "Get notes", title: "Auto-generated insights", text: "Receive summary, feedback, and improvement pointers." },
            ].map((s, idx) => (
              <motion.div key={idx} className="bg-gradient-to-tr from-white to-slate-50 border rounded-3xl p-8 shadow-sm hover:shadow-md transition"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 160, damping: 12 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#0367A5] text-white flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-slate-600 text-sm">{s.step}</div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-slate-600">{s.text}</p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-1 w-24 bg-[#e6f5ff] rounded-full overflow-hidden"><div className="h-full w-10 bg-[#0367A5] rounded-full" /></div>
                  <div className="text-xs text-slate-400">~2–5 mins</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href={ctaHref} className="inline-flex items-center gap-3 px-6 py-3 bg-[#0367A5] text-white rounded-xl font-semibold shadow hover:opacity-95 transition">
              Start a session
            </Link>
          </div>
        </div>
      </section>

      {/* COACHING OPTIONS (uses your array) */}
      <section className="px-6 lg:px-24 py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 className="text-3xl font-bold text-slate-900 mb-10" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.5}}>
            Coaching modes
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CoachingOptions.map((opt, i) => (
              <motion.article
                key={i}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transform hover:-translate-y-2 transition overflow-hidden border"
                initial={{opacity:0, y:10}}
                whileInView={{opacity:1, y:0}}
                viewport={{once:true}}
                transition={{delay: i * 0.06}}
              >
                <div className="bg-gradient-to-br from-[#EDE9FE] to-[#e6f5ff] flex items-center justify-center p-6">
                  <Image src={opt.icon} width={120} height={120} alt={opt.name} className="object-contain" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-lg">{opt.name}</h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                    What you’ll get: personalized guidance, concise voice responses, and auto-generated notes/feedback tailored to your topic.
                  </p>
                  <div className="mt-4 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded-full">Auto notes</span>
                    <span className="px-2 py-1 bg-slate-100 rounded-full">Voice-first</span>
                    <span className="px-2 py-1 bg-slate-100 rounded-full">Short replies</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTS */}
      <section className="px-6 lg:px-24 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.h2 className="text-3xl font-bold mb-8 text-center" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>
            Meet the AI experts
          </motion.h2>

          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 place-items-center justify-center">
            {CoachingExpert.map((e, idx) => (
              <Dialog key={idx} open={openExpert?.name === e.name} onOpenChange={(o)=> setOpenExpert(o ? e : null)}>
                <DialogTrigger asChild>
                  <motion.button whileHover={{ scale: 1.03 }} className="bg-white/70 backdrop-blur rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition w-full">
                    <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-white/30">
                      <Image src={e.avatar} width={80} height={80} alt={e.name} className="object-cover"/>
                    </div>
                    <h4 className="mt-3 font-medium">{e.name}</h4>
                    <div className="mt-1 text-xs text-slate-500">AI Mentor</div>
                    <div className="mt-3">
                      <span className="px-3 py-1 text-xs bg-[#0367A5] text-white rounded-full shadow-sm inline-block">Learn more</span>
                    </div>
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Image src={e.avatar} width={44} height={44} alt={e.name} className="rounded-full"/>
                      {e.name}
                    </DialogTitle>
                    <DialogDescription>
                      Expert profile and coaching approach
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 text-slate-700">
                    <p>
                      {e.name} specializes in voice-first learning with a friendly, structured coaching style. Sessions are concise and practical, focusing on clarity and momentum.
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Strengths: clear explanations, actionable feedback, supportive tone</li>
                      <li>Great for: interviews, lectures, language practice</li>
                      <li>Outputs: summaries, tips, improvement pointers</li>
                    </ul>
                  </div>
                  <div className="mt-4 flex gap-3 justify-end">
                    <Link href={ctaHref} className="px-4 py-2 bg-[#0367A5] text-white rounded-md">Start chat</Link>
                    <DialogClose className="px-4 py-2 bg-slate-100 rounded-md">Close</DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Footer */}
      <section className="px-6 lg:px-24 py-12 bg-[#0367A5] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold">Ready to speak with EduVi?</h3>
            <p className="mt-2 text-slate-100/90">Start a session, practice, and get instant feedback — all by voice.</p>
          </div>
          <div>
            <Link href={ctaHref} className="inline-flex items-center gap-3 px-6 py-3 bg-white text-[#0367A5] rounded-2xl font-semibold shadow hover:opacity-95 transition">
              Start Session
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#012e45] text-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">© {new Date().getFullYear()} EduVi — AI Voice Agent for Education</div>
          <div className="text-sm text-slate-300">
            <a href="/privacy" className="hover:underline mr-4">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ---------- small subcomponents ---------- */
function StatCard({ number, label }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl px-4 py-3 shadow-sm flex flex-col">
      <div className="text-lg font-bold text-slate-900">{number}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
