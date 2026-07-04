import React from 'react'

const steps = [
    { step: "01", title: "Connect your email", desc: "Securely sync your Gmail or Outlook account in one click. No technical setup required." },
    { step: "02", title: "Import your leads", desc: "Upload a CSV of your prospects. Desento automatically maps the data and enriches profiles." },
    { step: "03", title: "Launch & Automate", desc: "Review the dynamically personalized drafts, hit send, and watch the replies roll in on your dashboard." }
]

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="w-full bg-white py-24 sm:py-32 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-text-dark mb-6 tracking-tight">
                        Launch your first campaign <br className="hidden sm:block" /> in <span className="text-secondary">3 simple steps</span>
                    </h2>
                    <p className="text-lg text-text/80 font-medium">
                        We've stripped away the complexity so you can focus on booking meetings.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
                    <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-100 z-0"></div>

                    {steps.map((item, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white border-[8px] border-[#fcfcfd] shadow-[0_4px_20px_rgb(0,0,0,0.08)] flex items-center justify-center mb-8">
                                <span className="text-2xl font-black text-primary">{item.step}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-text-dark mb-4">{item.title}</h3>
                            <p className="text-text/70 font-medium leading-relaxed max-w-sm">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks