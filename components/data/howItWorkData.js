import React, { useEffect, useRef, useState } from 'react';
import { FiCheckCircle, FiUser, FiMail, FiLock, FiTrendingUp, FiZap } from 'react-icons/fi';

export const steps = [
    {
        id: 1,
        step: 'Step 1',
        title: 'Create your job profile',
        desc: 'Add your skills, experience, target role, and portfolio links. This helps Autojobmailer generate personalized job application emails for every company.',
        list: null,
    },
    {
        id: 2,
        step: 'Step 2',
        title: 'Generate personalized email content',
        desc: 'Autojobmailer uses AI to create professional and personalized job application emails tailored to each company and job role. No more rewriting the same email again and again.',
        list: null,
    },
    {
        id: 3,
        step: 'Step 3',
        title: 'Connect your email account securely',
        desc: 'Link your Gmail account using Google OAuth. Emails are sent directly from your inbox. We never store your password.',
        list: null,
    },
    {
        id: 4,
        step: 'Step 4',
        title: 'Send applications and track responses',
        desc: ['Send applications individually or in bulk and track everything in one place.', 'See when emails are:'],
        list: ['Sent', 'Replied', 'Converted to interviews'],
    },
];

export const visualBgs = [
    'from-blue-100/60 via-blue-50/40 to-sky-100/50',
    'from-orange-100/60 via-amber-50/40 to-yellow-100/50',
    'from-green-100/60 via-emerald-50/40 to-teal-100/50',
    'from-purple-100/60 via-violet-50/40 to-fuchsia-100/50',
];

/* ================================================================
   ② ANIMATION HELPERS — edit timing/easing here
   ================================================================ */

export const stepAnimation = {
    fadeInUp: (inView, delay = '0s', y = '24px') => ({
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : `translateY(${y})`,
        transition: `opacity 0.6s ease ${delay}, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}`,
    }),
    slideInX: (inView, delay = '0s', x = '-20px') => ({
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : `translateX(${x})`,
        transition: `all 0.5s ease ${delay}`,
    }),
    scaleIn: (inView, delay = '0.1s', scale = 0.95, y = '30px') => ({
        transform: inView ? 'translateY(0) scale(1)' : `translateY(${y}) scale(${scale})`,
        opacity: inView ? 1 : 0,
        transition: `transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delay}, opacity 0.6s ease ${delay}`,
    }),
    popIn: (inView, delay = '0.8s') => ({
        transform: inView ? 'scale(1)' : 'scale(0)',
        opacity: inView ? 1 : 0,
        transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}`,
    }),
    widthGrow: (inView, targetWidth, delay = '0s', duration = '0.6s') => ({
        width: inView ? targetWidth : '0%',
        transition: `width ${duration} ease ${delay}`,
    }),
    heightGrow: (inView, delay = '0s') => ({
        height: inView ? '100%' : '0%',
        transition: `height 0.5s ease ${delay}`,
    }),
};

/* Hooks */

export function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        // Use a smaller threshold on mobile to ensure tall elements trigger IntersectionObserver
        const isMobile = window.innerWidth < 768;
        const actualThreshold = isMobile ? 0.02 : threshold;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold: actualThreshold, rootMargin: isMobile ? '50px' : '0px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, inView];
}

/* VISUAL COMPONENTS (Step cards with animations) */

function AnimatedBar({ color, width, label, percent, started, delay }) {
    const [filled, setFilled] = useState(false);
    useEffect(() => {
        if (!started) return;
        const t = setTimeout(() => setFilled(true), delay);
        return () => clearTimeout(t);
    }, [started, delay]);
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                <span>{label}</span>
                <span className={filled ? 'text-gray-700' : 'text-gray-300'}>{percent}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: filled ? width : '0%' }}
                />
            </div>
        </div>
    );
}

const Step1Visual = ({ started }) => (
    <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="relative w-[280px] bg-white rounded-xl shadow-2xl shadow-blue-300/30 border border-blue-100/60 p-7 flex flex-col gap-4 z-10"
             style={stepAnimation.scaleIn(started, '0.1s')}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg shadow-blue-400/40">
                <FiUser className="w-8 h-8 text-white" />
            </div>
            <div className="w-3/4 h-3 bg-gray-200 rounded-full mx-auto" />
            <div className="w-1/2 h-2 bg-gray-100 rounded-full mx-auto mb-1" />
            {['Skills', 'Target Role', 'Portfolio'].map((label, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/70">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-sm bg-blue-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[9px] font-bold text-blue-400 tracking-widest uppercase mb-1">{label}</div>
                        <div className="h-2 bg-blue-200 rounded-full" style={stepAnimation.widthGrow(started, ['75%', '55%', '65%'][i], `${0.5 + i * 0.15}s`)} />
                    </div>
                    <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shrink-0" style={stepAnimation.popIn(started, `${0.9 + i * 0.15}s`)}>
                        <span className="text-white text-[8px] font-bold">✓</span>
                    </div>
                </div>
            ))}
        </div>
        <div className="absolute top-8 right-8 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/40 flex items-center gap-1.5 z-20"
             style={stepAnimation.fadeInUp(started, '0.8s', '-20px')}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Profile Ready
        </div>
    </div>
);

const Step2Visual = ({ started }) => (
    <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="relative w-[300px] bg-white rounded-xl shadow-2xl shadow-orange-200/40 border border-orange-100/60 overflow-hidden z-10" style={stepAnimation.scaleIn(started, '0.1s')}>
            <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 h-5 bg-gray-200 rounded-full mx-3" />
            </div>
            <div className="px-5 pt-4 pb-2 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10">To</span>
                    <div className="flex-1 h-6 bg-orange-50 border border-orange-100 rounded-lg flex items-center px-2">
                        <div className="w-3/4 h-2 bg-orange-200 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10">Sub</span>
                    <div className="flex-1 h-6 bg-gray-50 border border-gray-100 rounded-lg flex items-center px-2">
                        <div className="w-2/3 h-2 bg-gray-200 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="px-5 py-3 space-y-2 min-h-[120px]">
                {['85%', '90%', '80%', '60%'].map((w, i) => (
                    <div key={i} className="h-2.5 bg-gray-100 rounded-full" style={stepAnimation.widthGrow(started, w, `${0.6 + i * 0.12}s`, '0.5s')} />
                ))}
            </div>
            <div className="mx-5 mb-5 mt-2 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-400/30" style={stepAnimation.popIn(started, '1.1s')}>
                <div className="flex items-center gap-2"><FiZap className="w-4 h-4" /><span className="text-xs font-bold">AI-Personalized</span></div>
                <div className="text-xs opacity-80 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />Ready</div>
            </div>
        </div>
        <div className="absolute top-10 left-10 w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/40 flex items-center justify-center"
             style={{ ...stepAnimation.fadeInUp(started, '0.9s', '10px'), animation: started ? 'float 3s ease-in-out infinite' : 'none', transform: started ? 'rotate(0deg) translateY(0)' : 'rotate(-20deg) translateY(10px)' }}>
            <FiMail className="w-5 h-5 text-white" />
        </div>
    </div>
);

const Step3Visual = ({ started }) => (
    <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="relative flex flex-col items-center gap-5 z-10">
            <div className="flex items-center gap-4 mb-2">
                {['G', 'OAuth'].map((label, i) => (
                    <div key={i} className="w-14 h-14 bg-white rounded-lg shadow-xl shadow-green-200/40 border border-green-100/60 flex items-center justify-center text-sm font-extrabold text-green-700" style={stepAnimation.scaleIn(started, `${0.2 + i * 0.15}s`, 0.7, '15px')}>
                        {label}
                    </div>
                ))}
            </div>
            <div className="relative w-0.5 h-10 bg-green-100 overflow-hidden rounded-full">
                <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-green-400 to-emerald-500 rounded-full" style={stepAnimation.heightGrow(started, '0.7s')} />
            </div>
            <div className="relative w-24 h-24 bg-white rounded-full shadow-2xl shadow-green-300/40 border-2 border-green-200/60 flex items-center justify-center" style={stepAnimation.popIn(started, '0.8s')}>
                <div className="absolute inset-3 border-2 border-dashed border-green-200/50 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                <FiLock className="w-9 h-9 text-green-500 relative z-10" />
                <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-30" />
            </div>
            <div className="relative w-0.5 h-10 bg-green-100 overflow-hidden rounded-full">
                <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 to-green-400 rounded-full" style={stepAnimation.heightGrow(started, '1.2s')} />
            </div>
            <div className="w-[240px] bg-white rounded-xl shadow-xl shadow-green-200/30 border border-green-100/60 p-4 flex items-center gap-3" style={stepAnimation.scaleIn(started, '1.4s', 0.9, '20px')}>
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">M</div>
                <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 mb-1">Gmail Connected</div>
                    <div className="h-1.5 w-full bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={stepAnimation.widthGrow(started, '100%', '1.7s', '0.8s')} />
                    </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shrink-0" style={stepAnimation.popIn(started, '2s')}>
                    <span className="text-white text-[10px] font-bold">✓</span>
                </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200/60 rounded-full text-xs font-bold text-green-700" style={stepAnimation.popIn(started, '2.1s')}>
                <span>🔒</span> Zero-password storage
            </div>
        </div>
    </div>
);

const Step4Visual = ({ started }) => {
    const stats = [
        { label: 'Sent',       color: 'bg-blue-500',   width: '100%', percent: '100%' },
        { label: 'Opened',     color: 'bg-yellow-500', width: '75%',  percent: '75%'  },
        { label: 'Replied',    color: 'bg-green-500',  width: '50%',  percent: '50%'  },
        { label: 'Interviews', color: 'bg-purple-500', width: '28%',  percent: '28%'  },
    ];
    return (
        <div className="relative w-full h-full flex items-center justify-center p-6">
            <div className="w-[300px] bg-white rounded-xl shadow-2xl shadow-purple-200/40 border border-purple-100/60 p-6 z-10" style={stepAnimation.scaleIn(started, '0.1s')}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">This Month</div>
                        <div className="text-2xl font-extrabold text-gray-800" style={stepAnimation.fadeInUp(started, '0.8s', '0px')}>
                            142 Applications
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                        <FiTrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
                <div className="space-y-4">
                    {stats.map((s, i) => <AnimatedBar key={i} {...s} started={started} delay={500 + i * 200} />)}
                </div>
                <div className="mt-5 flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100" style={stepAnimation.slideInX(started, '1.8s', '20px')}>
                    <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center text-sm shrink-0">🎉</div>
                    <div>
                        <div className="text-xs font-bold text-green-700">Interview Scheduled!</div>
                        <div className="text-[10px] text-green-500">Acme Corp • Tomorrow 2PM</div>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                </div>
            </div>
            <div className="absolute top-8 right-6 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-purple-400/40 flex items-center gap-1.5" style={stepAnimation.fadeInUp(started, '1s', '-20px')}>
                🔥 On a streak
            </div>
        </div>
    );
};

export const visuals = [Step1Visual, Step2Visual, Step3Visual, Step4Visual];