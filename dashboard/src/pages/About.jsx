import { Landmark, MapPin, Sparkles, Building2, Atom, Server, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 md:p-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0A1F44] text-[#F5A623] flex items-center justify-center text-2xl font-bold border border-[#1E4D8C]">
            <Landmark size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44]">
                {lang === 'HI' ? 'राष्ट्रीय शहरी यातायात नियंत्रण प्रणाली (N-UTCS)' : 'National Urban Traffic Control System (N-UTCS)'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FFFBEB] text-[#B8860B] rounded border border-[#F5A623]/40">
                {lang === 'HI' ? 'MoRTH ITMS मानक' : 'MoRTH ITMS Standard'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'HI' ? 'सड़क परिवहन एवं राजमार्ग मंत्रालय • एकीकृत कमान एवं नियंत्रण केंद्र (ICCC)' : 'Ministry of Road Transport & Highways • Integrated Command & Control Center (ICCC)'}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-[#0A1F44] mb-3 flex items-center space-x-2">
              <MapPin size={16} className="text-[#0F2C59]" />
              <span>{lang === 'HI' ? 'कार्यकारी अवलोकन' : 'Executive Overview'}</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'HI' ? (
                <>
                  <strong>राष्ट्रीय शहरी यातायात नियंत्रण प्रणाली (N-UTCS)</strong> भारतीय सरकारी वेबसाइट दिशानिर्देशों (GIGW) और भारतीय सड़क कांग्रेस (IRC:106) मानकों के तहत निर्मित एक एंटरप्राइज-ग्रेड, AI-संचालित यातायात अनुकूलन प्लेटफॉर्म है।
                  मुंबई BKC ज़ोन जैसे उच्च-घनत्व वाले महानगरीय गलियारों में तैनाती के लिए डिज़ाइन किया गया, यह रीयल-टाइम कंप्यूटर विज़न (YOLOv8) PCU मैपिंग,
                  एंटी-स्टारवेशन डायनेमिक शेड्यूलिंग, आपातकालीन ग्रीन वेव कॉरिडोर और निरंतर कार्बन उत्सर्जन टेलीमेट्री का लाभ उठाकर शहरी गतिरोध को समाप्त करता है।
                </>
              ) : (
                <>
                  The <strong>National Urban Traffic Control System (N-UTCS)</strong> is an enterprise-grade, AI-powered traffic optimization platform built under the Guidelines for Indian Government Websites (GIGW) and Indian Roads Congress (IRC:106) standards.
                  Designed for deployment in high-density metropolitan corridors like the Mumbai BKC Zone, it leverages real-time computer vision (YOLOv8) PCU mapping,
                  anti-starvation dynamic scheduling, emergency green wave corridors, and continuous carbon footprint telemetry to eliminate urban gridlock.
                </>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A1F44] mb-3 flex items-center space-x-2">
              <Sparkles size={16} className="text-[#F5A623]" />
              <span>{lang === 'HI' ? 'प्रमुख क्षमताएं व विशेषताएं' : 'Key Capabilities'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: lang === 'HI' ? 'डायनेमिक ग्रीन टाइम आवंटन' : 'Dynamic Green Time Allocation',
                  desc: lang === 'HI' ? 'लाइव लेन भीड़भाड़ के अनुसार रीयल-टाइम सिग्नल फेज़ समायोजन' : 'Real-time signal phases adjusted according to live lane congestion'
                },
                {
                  title: lang === 'HI' ? 'आपातकालीन वाहन प्राथमिकता (EVP)' : 'Emergency Vehicle Priority (EVP)',
                  desc: lang === 'HI' ? 'एम्बुलेंस और दमकल वाहनों के लिए स्वचालित ग्रीन कॉरिडोर प्राथमिकता' : 'Automated green corridor pre-emption for ambulances and fire engines'
                },
                {
                  title: lang === 'HI' ? 'इको एवं ईंधन टेलीमेट्री' : 'Eco & Fuel Telemetry',
                  desc: lang === 'HI' ? 'निष्क्रिय ईंधन खपत, CO₂ कमी और यात्रियों की आर्थिक बचत की निरंतर ट्रैकिंग' : 'Continuous tracking of idling fuel burn, CO₂ reduction, and commuter economic savings'
                },
                {
                  title: lang === 'HI' ? 'खाली सड़क बाईपास' : 'Empty Road Bypass',
                  desc: lang === 'HI' ? 'जंक्शन क्लीयरेंस अंतराल कम करने हेतु खाली पहुंच मार्गों को छोड़ना' : 'Skipping empty approaches to minimize intersection clearance lag'
                },
                {
                  title: lang === 'HI' ? 'ऑपरेटर मैनुअल ओवरराइड' : 'Operator Manual Override',
                  desc: lang === 'HI' ? 'स्वचालित कूलडाउन टाइमर के साथ ट्रैफिक पुलिस के लिए सुरक्षित ओवरराइड तंत्र' : 'Fail-safe override mechanism for traffic police with automatic cooldown timers'
                },
                {
                  title: lang === 'HI' ? 'मल्टी-मॉडल फॉलबैक' : 'Multi-Model Fallback',
                  desc: lang === 'HI' ? 'लाइव बैकएंड API टेलीमेट्री और ऑफलाइन एज सिमुलेशन के बीच सहज परिवर्तन' : 'Seamless transition between live backend API telemetry and offline edge simulation'
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A1F44] mb-3 flex items-center space-x-2">
              <Building2 size={16} className="text-[#0F2C59]" />
              <span>{lang === 'HI' ? 'तकनीकी वास्तुकला' : 'Technical Architecture'}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center space-x-2">
                  <Atom size={16} className="text-[#0F2C59]" />
                  <span>{lang === 'HI' ? 'फ्रंटएंड डैशबोर्ड' : 'Frontend Dashboard'}</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2C59]"></span>
                    <span><strong>React 19 + Vite:</strong> {lang === 'HI' ? 'अल्ट्रा-फास्ट रेंडरिंग इंजन' : 'Ultra-fast rendering engine'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2C59]"></span>
                    <span><strong>Tailwind CSS 4:</strong> {lang === 'HI' ? 'उत्तरदायी, आधुनिक कंपोनेंट स्टाइलिंग' : 'Responsive, modern component styling'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2C59]"></span>
                    <span><strong>Framer Motion:</strong> {lang === 'HI' ? 'सहज वाहन भौतिकी और UI संक्रमण' : 'Smooth vehicle physics and UI transitions'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2C59]"></span>
                    <span><strong>Recharts:</strong> {lang === 'HI' ? 'लाइव कतार और प्रतीक्षा समय एनालिटिक्स' : 'Live queue and wait time analytics'}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center space-x-2">
                  <Server size={16} className="text-[#F5A623]" />
                  <span>{lang === 'HI' ? 'बैकएंड एवं AI इंजन' : 'Backend & AI Engine'}</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]"></span>
                    <span><strong>Node.js Express / FastAPI:</strong> {lang === 'HI' ? 'उच्च-थ्रूपुट REST व WebSocket गेटवे' : 'High-throughput REST & WebSocket gateway'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]"></span>
                    <span><strong>Q-Learning / SUMO Model:</strong> {lang === 'HI' ? 'अनुकूली यातायात सिग्नल एजेंट' : 'Adaptive traffic signal agent'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]"></span>
                    <span><strong>Environmental Module:</strong> {lang === 'HI' ? 'ईंधन खपत और उत्सर्जन अनुमान' : 'Fuel consumption & emission estimation'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]"></span>
                    <span><strong>Python Shell Bridge:</strong> {lang === 'HI' ? 'रीयल-टाइम भौतिकी इंजन एकीकरण' : 'Real-time physics engine integration'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A1F44] mb-3 flex items-center space-x-2">
              <Target size={16} className="text-[#0F2C59]" />
              <span>{lang === 'HI' ? 'लक्षित बेंचमार्क (मुंबई BKC पायलट)' : 'Target Benchmarks (Mumbai BKC Pilot)'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-5 bg-[#0A1F44]/5 border border-[#0F2C59]/20 rounded-xl">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">30–35s</div>
                <div className="text-xs font-semibold text-[#0A1F44] mt-1">{lang === 'HI' ? 'लक्षित प्रतीक्षा समय' : 'Target Wait Time'}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{lang === 'HI' ? 'पारंपरिक 45s बेसलाइन की तुलना में' : 'vs 45s traditional baseline'}</div>
              </div>
              <div className="text-center p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">~28%</div>
                <div className="text-xs font-semibold text-emerald-900 mt-1">{lang === 'HI' ? 'थ्रूपुट में वृद्धि' : 'Throughput Boost'}</div>
                <div className="text-[11px] text-emerald-700/80 mt-0.5">{lang === 'HI' ? 'प्रति मिनट अधिक वाहन निकासी' : 'Increased vehicles cleared/min'}</div>
              </div>
              <div className="text-center p-5 bg-[#FFFBEB] border border-[#F5A623]/30 rounded-xl">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#B8860B]">₹1,200+</div>
                <div className="text-xs font-semibold text-[#B8860B] mt-1">{lang === 'HI' ? 'आर्थिक बचत / घंटा' : 'Economic Savings / Hr'}</div>
                <div className="text-[11px] text-amber-800/80 mt-0.5">{lang === 'HI' ? 'बचा हुआ ईंधन + यात्रियों का समय' : 'Fuel saved + Commuter time'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
