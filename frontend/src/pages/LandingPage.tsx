import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Shield, ArrowRight, Globe, BarChart3, Fingerprint, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-solaris-bg text-slate-50 selection:bg-solaris-cyan/30 overflow-x-hidden font-sans">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-solaris-cyan/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-solaris-gold/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 transition-all duration-500">
          <div className="solaris-glass px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative group">
                <div className="absolute inset-0 bg-solaris-cyan blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-full h-full bg-solaris-bg border border-solaris-cyan/50 rounded-lg flex items-center justify-center">
                  <Activity className="text-solaris-cyan" size={18} />
                </div>
              </div>
              <span className="text-xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                poliSEE
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-white/40">
              <a href="#features" className="hover:text-solaris-cyan transition-colors">Intelligence</a>
              <a href="#methodology" className="hover:text-solaris-cyan transition-colors">Framework</a>
              <Link 
                to="/dashboard" 
                className="relative group px-6 py-2 rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-white group-hover:bg-solaris-cyan transition-colors"></div>
                <span className="relative text-black font-bold">Initiate Simulator</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center min-h-screen">
        <motion.div 
          className="max-w-6xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Integrated Status Indicator */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-12">
            <div className="w-14 h-14 rounded-full border border-solaris-cyan/30 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-solaris-cyan/20 blur-md rounded-full animate-pulse"></div>
              <Fingerprint className="text-solaris-cyan relative z-10 animate-spin-slow" size={24} />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-solaris-cyan shadow-[0_0_8px_rgba(0,240,255,1)]"></div>
              <span className="text-solaris-cyan font-display font-bold tracking-[0.4em] text-[10px] uppercase">
                System Online / Solaris Core v4.0
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase mb-10">
            <Sparkles size={12} className="text-solaris-gold" />
            <span>Next Generation Socio-Economic Forecaster</span>
          </motion.div>

          {/* Core Visual Backdrop */}
          <div className="relative mb-20">
            <div className="absolute inset-0 -top-20 -bottom-20 bg-solaris-cyan/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-7xl md:text-[10rem] font-display font-bold tracking-tighter mb-10 leading-[0.85] text-white relative z-20"
            >
              Predict the <br />
              <span className="text-gradient animate-glow">Unpredictable</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-14 leading-relaxed font-light relative z-20"
            >
              PoliSEE utilizes advanced agent-based modeling to illuminate the complex web of 
              unintended consequences in large-scale policy interventions.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-30">
            <Link 
              to="/dashboard" 
              className="group relative px-12 py-6 bg-transparent rounded-2xl font-bold text-lg transition-all overflow-hidden flex items-center gap-4 border border-solaris-cyan/30"
            >
              <div className="absolute inset-0 bg-solaris-cyan/10 group-hover:bg-solaris-cyan/20 transition-all"></div>
              <span className="relative text-solaris-cyan group-hover:text-white transition-colors">Begin Calibration</span>
              <ArrowRight className="relative text-solaris-cyan group-hover:translate-x-1 transition-transform group-hover:text-white" size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Global Engine Image Overlay */}
        <div className="absolute top-0 inset-x-0 h-full pointer-events-none opacity-30 overflow-hidden">
           <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072" 
            alt="Simulation Engine" 
            className="w-full h-full object-cover mix-blend-screen scale-150 origin-top animate-float-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-solaris-bg/50 to-solaris-bg"></div>
        </div>
      </section>

      {/* Intelligence Grid */}
      <section id="features" className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Analytical Architecture</h2>
            <p className="text-white/40 max-w-xl mx-auto">Our multi-layered simulation engine processes thousands of agent interactions simultaneously.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="text-solaris-cyan" />,
                title: "Emergence Detector",
                desc: "Real-time identification of nonlinear market shifts and systemic instabilities using our proprietary algorithms."
              },
              {
                icon: <Shield className="text-solaris-gold" />,
                title: "Resilience Modeling",
                desc: "Stress-test policy durability against external shocks and behavioral deviations from rational actor models."
              },
              {
                icon: <Globe className="text-blue-500" />,
                title: "Agent Topology",
                desc: "Simulate diverse socio-economic strata with localized feedback loops and geographical interdependencies."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="solaris-card p-10 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-solaris-cyan/30 transition-colors">
                  {React.cloneElement(feature.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Framework Section */}
      <section id="methodology" className="py-40 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-solaris-cyan text-xs font-bold uppercase tracking-[0.3em] mb-6">Scientific Methodology</div>
              <h2 className="text-5xl font-display font-bold mb-8 leading-tight">The Solaris Simulation Framework</h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                Traditional economic models often fail because they treat humans as simple, rational nodes. Our framework leverages <strong>Deep Agentic Integration</strong> to simulate irrationality, community pressure, and second-order feedback loops.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Dynamic Equilibrium", desc: "Unlike static models, Solaris adapts market valuations based on real-time agent utility depletion." },
                  { title: "Counterfactual Branching", desc: "Instantly compare multiple parallel realities where parameter deviations alter system stability." },
                  { title: "Behavioral Distortion", desc: "We model the exact 'friction' created when policy intentions meet human reality." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-solaris-cyan/20 transition-all">
                    <div className="w-6 h-6 rounded-full border border-solaris-cyan/50 flex items-center justify-center text-solaris-cyan text-[10px] font-bold">0{i+1}</div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                      <p className="text-white/40 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-solaris-cyan/10 blur-[80px] rounded-full"></div>
              <div className="solaris-glass p-1 relative z-10 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=2000" 
                  alt="Complexity Matrix" 
                  className="w-full aspect-square object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-solaris-bg via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10">
                   <div className="text-[10px] font-bold text-solaris-cyan uppercase tracking-widest mb-2">Internal Visualization</div>
                   <div className="text-2xl font-display font-bold">Nodal Topology v2.4</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 bg-[#050507]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <Activity className="text-solaris-cyan" size={24} />
                <span className="text-2xl font-display font-bold">poliSEE</span>
              </div>
              <p className="text-white/20 text-sm italic">Forging clarity from economic complexity.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6 text-sm font-bold uppercase tracking-widest text-white/40">
              <div className="flex gap-10">
                <a href="#" className="hover:text-solaris-cyan transition-colors">Privacy</a>
                <a href="#" className="hover:text-solaris-cyan transition-colors">Protocols</a>
                <a href="#" className="hover:text-solaris-cyan transition-colors">Contact</a>
              </div>
              <p className="text-[10px] text-white/10 tracking-widest">
                © 2025 SOLARIS CORE. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
