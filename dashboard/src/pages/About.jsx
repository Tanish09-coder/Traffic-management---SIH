import { TrafficCone, MapPin, Sparkles, Building2, Atom, Server, Target } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-xs border border-[#D6E0E7] rounded-lg p-6 sm:p-8">
        <div className="flex items-center space-x-3.5 mb-6 border-b border-[#E5EBEF] pb-4">
          <div className="w-10 h-10 rounded-md bg-[#EAF3F8] text-[#1D5D91] border border-[#D6E0E7] flex items-center justify-center flex-shrink-0">
            <TrafficCone size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#123B63] tracking-tight">
              About Smart Traffic Management System (STMS)
            </h1>
            <p className="text-xs text-[#526778] mt-0.5">
              Official Architecture Documentation • Municipal Traffic Control Cell
            </p>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-extrabold text-[#123B63] uppercase tracking-wider mb-2.5 flex items-center space-x-2">
              <MapPin size={16} className="text-[#1D5D91]" />
              <span>System Overview</span>
            </h2>
            <p className="text-xs text-[#526778] leading-relaxed">
              The Smart Traffic Management System (STMS) is an intelligent intersection 
              control and telemetry platform designed to alleviate urban gridlock in high-density corridors like Mumbai. 
              By leveraging real-time queue length estimation, adaptive reinforcement learning policies, and dynamic green wave timing, 
              the system significantly reduces idle wait times, suppresses carbon emissions, and cuts fuel wastage.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-[#123B63] uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Sparkles size={16} className="text-[#1D5D91]" />
              <span>Key System Capabilities</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Dynamic Green Time Allocation', desc: 'Real-time signal phases adjusted according to live lane congestion' },
                { title: 'Emergency Vehicle Priority (EVP)', desc: 'Automated green corridor pre-emption for ambulances and fire engines' },
                { title: 'Eco & Fuel Telemetry', desc: 'Continuous tracking of idling fuel burn, CO₂ reduction, and commuter economic savings' },
                { title: 'Empty Road Bypass', desc: 'Skipping empty approaches to minimize intersection clearance lag' },
                { title: 'Operator Manual Override', desc: 'Fail-safe override mechanism for traffic police with automatic cooldown timers' },
                { title: 'Multi-Model Fallback', desc: 'Seamless transition between live backend API telemetry and offline edge simulation' }
              ].map((feature, idx) => (
                <div key={idx} className="p-3.5 rounded-md bg-[#F4F6F8] border border-[#D6E0E7]">
                  <h3 className="font-extrabold text-[#123B63] text-xs mb-1">{feature.title}</h3>
                  <p className="text-[11px] text-[#526778] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-[#123B63] uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Building2 size={16} className="text-[#1D5D91]" />
              <span>Technical Architecture</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F4F6F8] p-4 rounded-md border border-[#D6E0E7]">
                <h3 className="font-extrabold text-[#123B63] mb-3 text-xs flex items-center space-x-2">
                  <Atom size={16} className="text-[#1D5D91]" />
                  <span>Frontend Dashboard</span>
                </h3>
                <ul className="text-xs text-[#526778] space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D5D91]"></span>
                    <span><strong>React 19 + Vite:</strong> Ultra-fast rendering engine</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D5D91]"></span>
                    <span><strong>Tailwind CSS:</strong> Responsive municipal component styling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D5D91]"></span>
                    <span><strong>Framer Motion:</strong> Smooth vehicle physics and UI transitions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D5D91]"></span>
                    <span><strong>Recharts:</strong> Live queue and wait time analytics</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#F4F6F8] p-4 rounded-md border border-[#D6E0E7]">
                <h3 className="font-extrabold text-[#123B63] mb-3 text-xs flex items-center space-x-2">
                  <Server size={16} className="text-[#1D5D91]" />
                  <span>Backend & AI Engine</span>
                </h3>
                <ul className="text-xs text-[#526778] space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123B63]"></span>
                    <span><strong>Node.js Express / FastAPI:</strong> High-throughput REST & WebSocket gateway</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123B63]"></span>
                    <span><strong>Q-Learning / SUMO Model:</strong> Adaptive traffic signal agent</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123B63]"></span>
                    <span><strong>Environmental Module:</strong> Fuel consumption & emission estimation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123B63]"></span>
                    <span><strong>Python Shell Bridge:</strong> Real-time physics engine integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-[#123B63] uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Target size={16} className="text-[#1D5D91]" />
              <span>Target Benchmarks (Mumbai BKC Pilot)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#EAF3F8] border border-[#D6E0E7] rounded-md">
                <div className="text-2xl font-extrabold text-[#1D5D91]">30–35s</div>
                <div className="text-[11px] font-semibold text-[#123B63] mt-1">Target Avg Wait Time</div>
                <div className="text-[10px] text-[#718392] mt-0.5">Reduced from 45s fixed baseline</div>
              </div>

              <div className="text-center p-4 bg-[#EBF7EE] border border-[#198754]/30 rounded-md">
                <div className="text-2xl font-extrabold text-[#198754]">20–25%</div>
                <div className="text-[11px] font-semibold text-[#123B63] mt-1">Fuel & CO₂ Savings</div>
                <div className="text-[10px] text-[#718392] mt-0.5">Lower idle burn at junction</div>
              </div>

              <div className="text-center p-4 bg-[#FFF8E7] border border-[#D98B19]/30 rounded-md">
                <div className="text-2xl font-extrabold text-[#D98B19]">100%</div>
                <div className="text-[11px] font-semibold text-[#123B63] mt-1">Emergency Clearance</div>
                <div className="text-[10px] text-[#718392] mt-0.5">Zero-delay green wave priority</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;