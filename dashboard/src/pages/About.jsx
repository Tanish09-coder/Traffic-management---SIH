const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 md:p-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
            🚦
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              About Smart Traffic Management System
            </h1>
            
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
              <span>📌</span>
              <span>System Overview</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">
              The Smart Traffic Management System (STMS) is an intelligent intersection 
              control and telemetry platform designed to alleviate urban gridlock in high-density corridors like Mumbai. 
              By leveraging real-time queue length estimation, adaptive reinforcement learning policies, and dynamic green wave timing, 
              the system significantly reduces idle wait times, suppresses carbon emissions, and cuts fuel wastage.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
              <span>✨</span>
              <span>Key Capabilities</span>
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
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
              <span>🏗️</span>
              <span>Technical Architecture</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center space-x-2">
                  <span>⚛️</span>
                  <span>Frontend Dashboard</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span><strong>React 19 + Vite:</strong> Ultra-fast rendering engine</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span><strong>Tailwind CSS 4:</strong> Responsive, modern component styling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span><strong>Framer Motion:</strong> Smooth vehicle physics and UI transitions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span><strong>Recharts:</strong> Live queue and wait time analytics</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center space-x-2">
                  <span>🐍</span>
                  <span>Backend & AI Engine</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span><strong>Node.js Express / FastAPI:</strong> High-throughput REST & WebSocket gateway</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span><strong>Q-Learning / SUMO Model:</strong> Adaptive traffic signal agent</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span><strong>Environmental Module:</strong> Fuel consumption & emission estimation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span><strong>Python Shell Bridge:</strong> Real-time physics engine integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
              <span>🎯</span>
              <span>Target Benchmarks (Mumbai BKC Pilot)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">30–35s</div>
                <div className="text-xs font-semibold text-blue-900 mt-1">Target Wait Time</div>
                <div className="text-[11px] text-blue-700/80 mt-0.5">vs 45s traditional baseline</div>
              </div>
              <div className="text-center p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">~28%</div>
                <div className="text-xs font-semibold text-emerald-900 mt-1">Throughput Boost</div>
                <div className="text-[11px] text-emerald-700/80 mt-0.5">Increased vehicles cleared/min</div>
              </div>
              <div className="text-center p-5 bg-purple-50/70 border border-purple-200 rounded-xl">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">₹1,200+</div>
                <div className="text-xs font-semibold text-purple-900 mt-1">Economic Savings / Hr</div>
                <div className="text-[11px] text-purple-700/80 mt-0.5">Fuel saved + Commuter time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;