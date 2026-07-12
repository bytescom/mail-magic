"use client"

import React from 'react'
import { FiFileText, FiCheckCircle, FiMenu, FiZap, FiArrowDownLeft, FiMoreHorizontal, FiBell, FiArrowUpRight, FiCalendar } from 'react-icons/fi';
import { IoIosNotifications } from "react-icons/io";
import { Playfair_Display } from "next/font/google";

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const quickStats = [
  {
    title: "Total Applied",
    value: "128",
    icon: <FiFileText size={18} />,
    percentage: null, trend: "up",
    colorClass: "bg-primary/10 border-primary/20 text-primary",
    stroke: "var(--color-primary)",
    graphPoints: "0,15 10,10 20,12 30,5 40,2"
  },
  {
    title: "Interviews",
    value: "14",
    icon: <FiCheckCircle size={18} />,
    percentage: null, trend: "up",
    colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    stroke: "#10b981",
    graphPoints: "0,18 10,12 20,10 30,8 40,2"
  },
  {
    title: "Emails Sent Today",
    value: "32",
    icon: <FiCalendar size={18} />,
    percentage: null, trend: "up",
    colorClass: "bg-secondary/10 border-secondary/20 text-secondary",
    stroke: "var(--color-secondary)",
    graphPoints: "0,12 10,8 20,10 30,5 40,2"
  },
  {
    title: "AI Credits Left",
    value: "780",
    icon: <FiZap size={18} />,
    percentage: null, trend: "up",
    colorClass: "bg-primary-dark/10 border-primary-dark/20 text-primary-dark",
    stroke: "var(--color-primary-dark)",
    graphPoints: "0,12 10,10 20,15 30,8 40,2"
  },
];

const activityLog = [
  {
    id: 1,
    company: "DataWeave",
    role: "Data Science Intern",
    logo: "D",
    hrEmail: "bhuvansh.r@dataweave.com",
    status: "replied",
    replyType: "neutral",
    sentDate: "18 Mar 2026",
  },
  {
    id: 2,
    company: "Jupiter AI Labs",
    role: "Full Stack Developer",
    logo: "J",
    hrEmail: "rupali.mishra@jupiterai.com",
    status: "sent",
    replyType: null,
    sentDate: "18 Mar 2026",
  },
  {
    id: 3,
    company: "RayMach Technologies",
    role: "Python Intern",
    logo: "R",
    hrEmail: "annapurna.chandel@raymach.com",
    status: "sent",
    replyType: null,
    sentDate: "17 Mar 2026",
  },
  {
    id: 4,
    company: "Techasoft Pvt Ltd",
    role: "Python AI Intern",
    logo: "T",
    hrEmail: "yuvarani@techasoft.com",
    status: "sent",
    replyType: null,
    sentDate: "16 Mar 2026",
  },
  {
    id: 5,
    company: "Accellor",
    role: "AI Developer",
    logo: "A",
    hrEmail: "radhika.charhate@accellor.com",
    status: "sent",
    replyType: null,
    sentDate: "15 Mar 2026",
  }
];


const Dashboard = () => {
  return (
    <>

      <header className="flex items-center justify-between">
        <h1 className={`text-[32px] md:text-[36px] font-bold text-text-dark leading-[1.1] tracking-tight ${serif.className}`}>Dashboard</h1>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-text hover:bg-surface transition-colors cursor-pointer shadow-sm">
            <IoIosNotifications size={20} />
          </button>
          <button className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-text hover:bg-surface transition-colors cursor-pointer shadow-sm">
            <FiMenu size={18} />
          </button>
        </div>
      </header>

      <section aria-label="Quick Stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <article key={i} className="bg-background px-4 py-3 rounded-xl border border-border shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 transition-transform group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${stat.colorClass}`}>
                {stat.icon}
              </div>
              {stat.percentage && (
                <div className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-xl ${stat.trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                  {stat.trend === 'up' ? <FiArrowUpRight size={12} strokeWidth={3} /> : <FiArrowDownLeft size={12} strokeWidth={3} />}
                  {stat.percentage}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-[11px] text-muted font-bold tracking-[0.1em] uppercase mb-1.5">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-[22px] font-extrabold text-text-dark leading-none">{stat.value}</p>
                {stat.graphPoints && (
                  <div className="w-16 h-6 opacity-70 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="-2 -2 44 24" className="w-full h-full" preserveAspectRatio="none">
                      <polyline
                        points={stat.graphPoints}
                        fill="none"
                        stroke={stat.stroke}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section aria-label="Platform Highlights" className='flex flex-col xl:flex-row gap-5'>
        <article className="relative w-full xl:w-1/2 min-h-[200px] rounded-xl overflow-hidden p-8 flex flex-col justify-center items-start border border-border shadow-sm">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-secondary/5 opacity-90" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-32 w-48 h-48 bg-secondary/20 rounded-full blur-[60px]" />

          <div className={`relative z-10 max-w-sm ${serif.className}`}>
            <h2 className="text-[24px] lg:text-[28px] leading-[1.2] font-semibold text-text-dark mb-3 tracking-tight">
              Desento 3.0 launch will be live on 25&apos; July.
            </h2>
            <p className="text-[14px] text-text font-medium tracking-wide mb-6">
              Set a reminder and tune in live to catch all the latest updates.
            </p>
            <button className="flex items-center gap-2 px-6 py-3 bg-background rounded-lg text-[13px] font-bold text-text-dark shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-border hover:-translate-y-0.5 transition-transform">
              <FiBell className="text-primary" size={16} /> Set a reminder
            </button>
          </div>
        </article>

        <article className="w-full xl:w-1/2 bg-background p-6 sm:p-8 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-[22px] font-extrabold text-text-dark mb-1 tracking-tight">Activity Overview</h3>
              <p className="text-[14px] text-text font-medium">1,260 total interactions this month</p>
            </div>
            <div className="flex items-center gap-1 text-[24px] font-extrabold text-text-dark">
              23% <FiArrowUpRight size={22} className="text-emerald-500 ml-1" />
            </div>
          </div>

          <div>
            {/* Stacked Bar Chart */}
            <div className="flex h-[18px] rounded-xl overflow-hidden mb-5">
              <div className="bg-primary w-[35%] transition-all duration-1000 ease-out hover:opacity-90"></div>
              <div className="bg-secondary w-[25%] transition-all duration-1000 ease-out hover:opacity-90"></div>
              <div className="bg-emerald-500 w-[40%] transition-all duration-1000 ease-out hover:opacity-90"></div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-[0.1em]">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Sent <span className="text-text-dark ml-0.5">264</span></span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Hits <span className="text-text-dark ml-0.5">126</span></span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Matches <span className="text-text-dark ml-0.5">345</span></span>
              <button className="w-6 h-6 rounded-full bg-surface flex items-center justify-center hover:bg-gray-200 transition-colors"><FiMoreHorizontal size={14} /></button>
            </div>
          </div>
        </article>
      </section>

      <section aria-label="Activity Log" className='border border-border bg-background shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] rounded-xl p-6 lg:p-8'>
        <article className="">
          <div className="flex items-end justify-between mb-4 lg:mb-5">
            <div>
              <h3 className={`text-[20px] lg:text-[22px] font-medium text-text-dark mb-1 ${serif.className}`}>Activity Log</h3>
              <p className="text-[13px] text-text font-medium">All recent applications, follow-ups, and interviews.</p>
            </div>
            <button className="text-[13px] font-semibold text-text-dark hover:text-primary transition-colors">See all</button>
          </div>

          {/* Column Headers */}
          <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr] gap-0 px-4 pb-2 border-b border-border">
            <span className="text-[11px] font-extrabold text-muted tracking-[0.08em] uppercase">Company</span>
            <span className="text-[11px] font-extrabold text-muted tracking-[0.08em] uppercase">Role</span>
            <span className="text-[11px] font-extrabold text-muted tracking-[0.08em] uppercase">Status</span>
            <span className="text-[11px] font-extrabold text-muted tracking-[0.08em] uppercase text-right">Reply</span>
          </div>
          <div className="flex flex-col gap-1 pt-1">
            {activityLog.map((log) => (
              <div key={log.id} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr] gap-0 items-center px-4 py-4 border border-border rounded-lg hover:bg-surface transition-colors">
                {/* Company */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                    <span className="font-extrabold text-text text-[16px]">{log.logo}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-text-dark truncate">{log.company}</p>
                    <p className="text-[12px] text-muted font-medium truncate">{log.hrEmail}</p>
                  </div>
                </div>
                {/* Role */}
                <div className="hidden sm:flex items-center">
                  <p className="text-[14px] font-semibold text-text truncate">{log.role}</p>
                </div>
                {/* Status */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'replied' ? 'bg-emerald-500' :
                    log.status === 'sent' ? 'bg-primary' :
                      log.status === 'rejected' ? 'bg-red-500' : 'bg-secondary'
                    }`} />
                  <span className="text-[13px] font-semibold text-text capitalize">{log.status}</span>
                </div>
                {/* Reply + Date */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[14px] font-bold text-text-dark capitalize">{log.replyType || '—'}</span>
                  <span className="text-[11px] text-muted font-medium mt-0.5">{log.sentDate}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}

export default Dashboard
