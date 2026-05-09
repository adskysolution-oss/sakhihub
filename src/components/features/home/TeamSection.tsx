'use client';

import { motion } from 'framer-motion';
import { Users, Shield, Target, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const stories = [
  { 
    name: "Sunita Devi", 
    role: "Village Member", 
    story: "SakhiHub se judne ke baad mujhe swachhta aur health ki sahi jankari mili aur aaj main apne gaon me awareness phaila rahi hu.",
    image: "/images/campaign_sanitary.png"
  },
  { 
    name: "Rekha Bai", 
    role: "Field Volunteer", 
    story: "Main ghar ghar jaakar mahilao ko samjhati hu aur ab main khud financially independent ho chuki hu.",
    image: "/images/campaign_health.png"
  },
  { 
    name: "Pooja Sharma", 
    role: "Group Leader", 
    story: "Humne apne gaon me mahila group banaya aur ab sab milkar kaam karte hain aur earn bhi karte hain.",
    image: "/images/about_mission.png"
  },
  { 
    name: "Meena Kumari", 
    role: "Team Leader", 
    story: "Main chahti hu ki hamare zila ki har mahila apne pairo par khadi ho aur SakhiHub isme puri madad kar raha hai.",
    image: "/images/team_field.png"
  }
];

const TeamSection = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="section-padding overflow-hidden">
      <div className="container">
        {/* Hearts Behind SakhiHub */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 lg:gap-32 items-center mb-20 md:mb-32">
          <motion.div {...fadeInUp} className="text-center md:text-left">
            <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">Our Workforce</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl mt-4 text-secondary leading-tight font-bold">The Hearts Behind <span className="text-gradient">SakhiHub</span></h2>
            <p className="text-base md:text-lg text-text-muted leading-relaxed mt-6 md:mt-8 max-w-xl mx-auto md:mx-0">
              Our field team works at the grassroots level, connecting directly with women in villages and communities. 
              They conduct awareness sessions, build groups, and help women become confident, independent, and empowered.
            </p>
            
            <div className="mt-8 md:mt-10 mb-10 md:mb-12 space-y-4">
              {['Ground-level outreach in villages', 'Direct connection with women', 'Real impact through awareness'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 justify-center md:justify-start text-sm md:text-base font-semibold text-secondary">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
              {[
                { val: '250+', label: 'Field Workers' },
                { val: '15+', label: 'Districts Covered' },
                { val: '50k+', label: 'Women Connected' }
              ].map((stat, idx) => (
                <div key={idx} className={`p-6 bg-primary/5 rounded-[24px] text-center border border-primary/5 shadow-sm transition-all hover:shadow-md ${idx === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
                  <h4 className="text-2xl md:text-3xl text-primary font-bold leading-none">{stat.val}</h4>
                  <p className="text-[10px] md:text-xs text-text-muted mt-2 font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="relative w-full max-w-2xl mx-auto lg:max-w-none">
            <div className="relative z-10 rounded-[32px] overflow-hidden shadow-2xl h-[400px] md:h-[550px] border-4 md:border-8 border-white">
              <img src="/images/team_field.png" className="w-full h-full object-cover" alt="Field Team" />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent"></div>
            </div>
            
            {/* Floating Overlays */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-32 h-24 md:w-48 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-2xl z-20"
            >
              <img src="/images/hero_awareness_campaign.png" className="w-full h-full object-cover" alt="" />
            </motion.div>

            {/* Decor */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl z-0" />
          </motion.div>
        </div>

        {/* Real Impact Stories */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-xs">REAL VOICES</span>
          <h2 className="text-3xl md:text-5xl mt-3 font-bold">Voices of <span className="text-gradient">Real Change</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stories.map((item, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[32px] p-8 md:p-10 text-center shadow-xl shadow-black/5 border border-primary/5 transition-all"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mx-auto mb-6 border-4 border-primary/5 shadow-xl shadow-primary/10">
                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-1">{item.name}</h3>
              <span className="text-[10px] md:text-xs text-primary font-bold uppercase tracking-widest block mb-4">{item.role}</span>
              <p className="text-sm md:text-base text-text-muted leading-relaxed italic opacity-80 font-medium">
                "{item.story}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

