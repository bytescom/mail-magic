import React from "react";
import { FiShield, FiBarChart2, FiCopy, FiDatabase, FiZap} from "react-icons/fi";

const featuresData = [
    {
        icon: FiZap,
        title: "Lightning Fast Generation",
        desc: "AI writes highly professional, personalized outreach emails instantly using your value proposition.",
        span: "md:col-span-3 min-h-[420px]",
        customContent: (
            <div className="w-full max-w-sm flex-1 flex flex-col gap-3 justify-center">
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">H</div>
                    <div className="text-sm text-gray-500 flex-1">To: <span className="text-gray-900 font-medium font-sans">john.doe@stripe.com</span></div>
                    <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 font-medium ml-auto">AI drafted</div>
                </div>
                <div className="flex-1 p-4 bg-white border border-gray-100 rounded-xl shadow-sm relative overflow-hidden flex flex-col">
                    <div className="text-sm text-gray-500 leading-relaxed font-sans text-left">
                        Hi John,<br/><br/>I noticed Stripe is expanding its developer tools. I wanted to share how Desento can help your team <span className="text-primary font-medium">automate outreach at scale</span>...<span className="inline-block w-[2px] h-4 bg-primary ml-[2px] animate-pulse align-middle"></span>
                    </div>
                    <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="text-xs font-semibold text-primary tracking-wide flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Ready to send
                        </div>
                        <div className="text-xs text-gray-400 font-medium">Generated in 0.38s</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        icon: FiShield,
        title: "Secure Gmail Sync",
        desc: "Send outreach campaigns directly through your own Gmail account with bank-tier security.",
        span: "md:col-span-3 min-h-[420px]",
        customContent: (
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="w-full max-w-sm flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium w-20 shrink-0 text-left">Encryption</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary w-full rounded-full"></div></div>
                        <span className="text-xs text-primary font-mono font-semibold w-16 text-right">256-bit</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium w-20 shrink-0 text-left">Auth token</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary/70 w-full rounded-full"></div></div>
                        <span className="text-xs text-primary font-mono font-semibold w-16 text-right">OAuth2</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium w-20 shrink-0 text-left">Storage</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-secondary w-full rounded-full"></div></div>
                        <span className="text-xs text-secondary font-mono font-semibold w-16 text-right">Zero</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        icon: FiBarChart2,
        title: "Visual Tracking",
        desc: "Track every outreach campaign from sent to reply on a visual dashboard.",
        span: "md:col-span-2 min-h-[380px]",
        customContent: (
            <div className="w-full max-w-xs h-full flex flex-col justify-center gap-3">
                {[
                    { label: "Sent", p: "100%", bc: "bg-primary", num: "24", tc:"text-primary" },
                    { label: "Opened", p: "75%", bc: "bg-primary-dark", num: "18", tc:"text-primary-dark" },
                    { label: "Replied", p: "37.5%", bc: "bg-secondary", num: "9", tc:"text-secondary" }
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full">
                        <span className={`text-xs font-semibold w-14 shrink-0 text-left ${stat.tc}`}>{stat.label}</span>
                        <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${stat.bc} relative`} style={{ width: stat.p }}></div>
                        </div>
                        <span className={`text-xs font-bold w-6 text-right ${stat.tc}`}>{stat.num}</span>
                    </div>
                ))}
            </div>
        )
    },
    {
        icon: FiDatabase,
        title: "Auto-Fill Profile",
        desc: "Store target personas and templates. Auto-fills perfectly.",
        span: "md:col-span-2 min-h-[380px]",
        customContent: (
            <div className="w-full h-full flex flex-col justify-center items-center relative">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 w-full max-w-[220px] flex flex-col gap-3">
                    {["Value Proposition", "Sender Profiles", "Target Personas"].map((tag, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${i === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50 border border-transparent hover:bg-gray-100 transition-colors'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <span className={`text-xs font-semibold ${i===0 ? 'text-primary' : 'text-gray-600'}`}>{tag}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        icon: FiCopy,
        title: "Smart Templates",
        desc: "Reuse and perfectly customize dynamic email outreach templates.",
        span: "md:col-span-2 min-h-[380px]",
        customContent: (
            <div className="w-full max-w-xs h-full flex flex-col justify-center gap-3">
                {["Cold Outreach Pitch", "Product Demo Invite", "Quick Follow-Up Thread"].map((tpl, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${i === 0 ? "border-secondary/30 bg-secondary/10 shadow-sm" : "border-gray-100 bg-white shadow-sm"} transition-all cursor-pointer hover:border-secondary/40`}>
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-secondary" : "bg-gray-300"} shrink-0`}></div>
                        <span className={`text-sm font-semibold ${i === 0 ? "text-secondary" : "text-gray-600"}`}>{tpl}</span>
                        <span className={`ml-auto text-sm ${i === 0 ? "text-secondary" : "text-gray-300"}`}>›</span>
                    </div>
                ))}
            </div>
        )
    }
];

const Features = () => {
    return (
        <section className="relative overflow-hidden bg-gray-50 py-24 sm:py-32 border-t border-gray-100" id="features">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-dark mb-6 tracking-tight">
                        Everything you need to <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">automate outreach</span>
                    </h2>
                    <p className="text-lg md:text-xl text-text/80 font-medium">
                        A powerful toolkit built to save you hours of manual tasks. Stop writing emails from scratch.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-8">
                    {featuresData.map((feature, index) => {
                        return (
                            <div
                                key={index}
                                className={`group rounded-xl bg-white border border-gray-100 p-2 flex flex-col overflow-hidden shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.06)] transition-all duration-300 ${feature.span}`}
                            >
                                <div className="flex-2 bg-[#F9F9FB] rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden border border-gray-50">
                                    {feature.customContent}
                                </div>
                                <div className="mt-auto px-6 py-4 text-center">
                                    <h3 className="text-[19px] font-bold text-gray-900 mb-2 tracking-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[15px] leading-relaxed text-gray-500 font-medium mx-auto max-w-6xl">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
