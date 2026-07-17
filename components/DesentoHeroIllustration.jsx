import React from "react";
import { FiUsers, FiClock, FiMail, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import { BsStars } from "react-icons/bs";

export default function DesentoHeroIllustration() {
  return (
    <div className="relative w-full max-w-[540px] mx-auto p-4 sm:p-8 font-sans">
      {/* Glow effects matching original design */}
      <div className="absolute w-[320px] h-[320px] -top-[6%] left-[4%] bg-[radial-gradient(circle,rgba(79,110,247,0.28)_0%,rgba(79,110,247,0)_70%)] rounded-full blur-[70px] -z-10 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] -bottom-[4%] right-0 bg-[radial-gradient(circle,rgba(123,97,255,0.24)_0%,rgba(123,97,255,0)_70%)] rounded-full blur-[70px] -z-10 pointer-events-none" />

      {/* Wireframe decorations - Top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40">
        <div className="w-12 h-[22px] rounded-full border-[1.5px] border-gray-400 flex items-center justify-center bg-white">
           <div className="w-5 h-[1.5px] bg-gray-400" />
        </div>
      </div>
      <div className="absolute top-[22px] left-1/2 -translate-x-1/2 h-8 w-[1.5px] border-l-[1.5px] border-dashed border-gray-400 opacity-40" />
      
      {/* Wireframe decorations - Left */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 flex items-center opacity-40">
        <div className="w-[22px] h-12 rounded-full border-[1.5px] border-gray-400 flex items-center justify-center bg-white">
           <div className="h-5 w-[1.5px] bg-gray-400" />
        </div>
      </div>
      <div className="absolute top-1/2 left-[22px] -translate-y-1/2 w-8 h-[1.5px] border-t-[1.5px] border-dashed border-gray-400 opacity-40" />

      {/* Wireframe decorations - Right */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 flex items-center opacity-40">
        <div className="absolute right-[22px] w-8 h-[1.5px] border-t-[1.5px] border-dashed border-gray-400" />
        <div className="w-[22px] h-12 rounded-full border-[1.5px] border-gray-400 flex items-center justify-center bg-white absolute right-0">
           <div className="h-5 w-[1.5px] bg-gray-400" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative bg-[#F4F5F8] rounded-[32px] p-5 sm:p-7 flex flex-col gap-6 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_12px_40px_-12px_rgba(0,0,0,0.08)] border-[3px] border-white/60 backdrop-blur-sm z-10 mt-2">
        
        <ContainerDots />

        {/* Card 1: Contacts Pill */}
        <div className="relative bg-white rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-5">
          <CardDots />
          <div className="flex -space-x-3 ml-2">
            <div className="w-[44px] h-[44px] rounded-full border-[3px] border-white relative z-30 shadow-sm flex items-center justify-center text-white font-semibold text-[15px] bg-[linear-gradient(135deg,#4F6EF7,#6C7CF0)]">
              A
            </div>
            <div className="w-[44px] h-[44px] rounded-full border-[3px] border-white relative z-20 shadow-sm flex items-center justify-center text-white font-semibold text-[15px] bg-[linear-gradient(135deg,#7B61FF,#9C8CFA)]">
              S
            </div>
            <div className="w-[44px] h-[44px] rounded-full border-[3px] border-white relative z-10 shadow-sm flex items-center justify-center text-white bg-[linear-gradient(135deg,#22C55E,#4F6EF7)]">
              <FiUsers size={18} />
            </div>
          </div>
          <div className="text-[#3A4358] font-medium text-[16px]">
            <span className="text-[#4F6EF7] font-bold">12,500+</span> outreach contacts
          </div>
        </div>

        {/* Card 2: Main campaign card */}
        <div className="relative bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col overflow-hidden p-6 pt-5">
          <CardDots />
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[#111827] text-[17px] tracking-tight">Fall Product Launch</h3>
            <div className="flex items-center gap-1.5 bg-[linear-gradient(135deg,rgba(79,110,247,0.10),rgba(123,97,255,0.12))] text-[#4F6EF7] text-[12px] font-semibold px-3 py-1.5 rounded-full">
              <BsStars size={13} />
              AI Generated
            </div>
          </div>

          <div className="bg-[#F6F8FB] border border-gray-100/50 rounded-[16px] p-4 mb-5">
            <div className="text-[#111827] font-semibold text-[14px] mb-2.5">Re: quick question about your workflow</div>
            <div className="h-1.5 rounded-full bg-[#E5E7EB] mb-2.5 w-[92%]" />
            <div className="h-1.5 rounded-full bg-[#E5E7EB] mb-2.5 w-[76%]" />
            <div className="h-1.5 rounded-full bg-[#E5E7EB] w-[58%]" />
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[13px] text-[#6B7280] font-medium">Campaign progress</div>
            <div className="text-[14px] font-bold text-[#111827]">247 / 500 sent</div>
          </div>
          <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden mb-6">
            <div className="h-full w-[49%] rounded-full bg-[linear-gradient(90deg,#4F6EF7,#7B61FF)]" />
          </div>

          {/* Timeline */}
          <div className="relative flex justify-between items-start mt-2 px-1">
             {/* Line */}
             <div className="absolute top-[10px] left-6 right-6 h-[2px] bg-[#E5E7EB] rounded-full" />
             <div className="absolute top-[10px] left-6 w-[55%] h-[2px] bg-[linear-gradient(90deg,#4F6EF7,#7B61FF)] rounded-full z-10" />
             
             {/* Steps */}
             <TimelineStep title="Draft" state="done" align="left" />
             <TimelineStep title="AI Generated" state="done" align="center" />
             <TimelineStep title="Sent" state="active" align="center" />
             <TimelineStep title="Replied" state="pending" align="right" />
          </div>
        </div>

        {/* Card 3: Analytics card */}
        <div className="relative bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
          <CardDots />
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-[#111827] text-[15.5px]">Reply rate</div>
            <FiTrendingUp size={18} color="#4F6EF7" />
          </div>
          <div className="flex items-end gap-2 h-10 mb-6">
            {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
              <div key={i} className="flex-1 rounded-[4px] bg-[linear-gradient(180deg,#7B61FF,#4F6EF7)] opacity-90 shadow-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-[#F6F8FB] rounded-[16px] py-2 px-2 text-center">
              <div className="text-[17px] font-bold text-[#111827]">68%</div>
              <div className="text-[11px] text-[#6B7280] font-semibold mt-0.5 uppercase tracking-wider">Open</div>
            </div>
            <div className="flex-1 bg-[#F6F8FB] rounded-[16px] py-2 px-2 text-center">
              <div className="text-[17px] font-bold text-[#111827]">24%</div>
              <div className="text-[11px] text-[#6B7280] font-semibold mt-0.5 uppercase tracking-wider">Reply</div>
            </div>
            <div className="flex-1 bg-[#F6F8FB] rounded-[16px] py-2 px-2 text-center">
              <div className="text-[17px] font-bold text-[#111827]">12%</div>
              <div className="text-[11px] text-[#6B7280] font-semibold mt-0.5 uppercase tracking-wider">Pos</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Outer bounding box dashed border */}
      <div className="absolute inset-x-2 inset-y-2 border-[1.5px] border-dashed border-gray-300 rounded-[44px] pointer-events-none opacity-40 z-0" />

      {/* Floating Cards */}
      {/* Gmail connected */}
      <div className="absolute top-24 -right-2 bg-white/95 backdrop-blur border border-gray-100 rounded-[18px] shadow-[0_16px_28px_-12px_rgba(30,42,90,0.20)] p-3.5 flex items-center gap-3 z-20 hidden sm:flex">
        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,0.2)]" />
        <div className="text-[13.5px] font-semibold text-[#111827]">Gmail connected</div>
      </div>

      {/* Follow-up scheduled */}
      <div className="absolute top-[260px] -left-8 bg-white/95 backdrop-blur border border-gray-100 rounded-[18px] shadow-[0_16px_28px_-12px_rgba(30,42,90,0.20)] p-3.5 flex items-center gap-3 z-20 hidden sm:flex">
        <div className="w-[32px] h-[32px] rounded-[10px] flex items-center justify-center bg-[rgba(79,110,247,0.10)] text-[#4F6EF7]">
          <FiClock size={16} />
        </div>
        <div>
          <div className="text-[13.5px] font-semibold text-[#111827]">Follow-up scheduled</div>
          <div className="text-[11.5px] text-[#6B7280] font-medium mt-0.5">Tomorrow, 9:00 AM</div>
        </div>
      </div>

      {/* Recent reply notification */}
      <div className="absolute bottom-[90px] -right-6 bg-white/95 backdrop-blur border border-gray-100 rounded-[18px] shadow-[0_16px_28px_-12px_rgba(30,42,90,0.20)] p-3.5 flex items-center gap-3 z-20 hidden sm:flex">
        <div className="w-[32px] h-[32px] rounded-[10px] flex items-center justify-center bg-[rgba(123,97,255,0.12)] text-[#7B61FF]">
          <FiMail size={16} />
        </div>
        <div>
          <div className="text-[13.5px] font-semibold text-[#111827]">New reply received</div>
          <div className="text-[11.5px] text-[#6B7280] font-medium mt-0.5">From Sarah K.</div>
        </div>
      </div>

    </div>
  );
}

function CardDots() {
  return (
    <>
      <div className="absolute top-3.5 left-3.5 w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />
      <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />
      <div className="absolute bottom-3.5 left-3.5 w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />
      <div className="absolute bottom-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />
    </>
  );
}

function ContainerDots() {
  return (
    <>
      <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
      <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
      <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
      <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
    </>
  );
}

function TimelineStep({ title, state, align }) {
  const isDone = state === "done";
  const isActive = state === "active";
  
  let alignClass = "flex flex-col ";
  if (align === "left") alignClass += "items-start";
  else if (align === "right") alignClass += "items-end";
  else alignClass += "items-center";

  return (
    <div className={alignClass}>
      <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center bg-white border-[2px] ${isDone || isActive ? 'border-[#4F6EF7]' : 'border-[#E5E7EB]'} z-20`}>
         {isDone && <FiCheckCircle size={14} className="text-[#4F6EF7]" />}
         {isActive && <div className="w-[8px] h-[8px] rounded-full bg-[#7B61FF]" />}
      </div>
      <div className={`mt-2 font-bold text-[11px] text-center ${isDone || isActive ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
        {title}
      </div>
    </div>
  );
}
