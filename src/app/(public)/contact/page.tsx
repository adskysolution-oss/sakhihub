import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="overflow-x-hidden bg-white">
      <PageBanner 
        title="Contact Us" 
        subtitle="Get in Touch with SakhiHub"
        image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr,1.2fr] gap-12 lg:gap-20">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-6 leading-tight">Reach Out to Us</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-500 mb-10 lg:mb-12 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Have questions about our programs, products, or opportunities? We are here to help.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8">
                {[
                  { title: "Call Us", val: "8076611842", icon: Phone, bg: "bg-primary/5", color: "text-primary" },
                  { title: "WhatsApp", val: "8076611842", icon: MessageCircle, bg: "bg-green-50", color: "text-green-500" },
                  { title: "Email", val: "info@sakhihub.com", icon: Mail, bg: "bg-primary/5", color: "text-primary" },
                  { title: "Office", val: "Regional Outreach Center, India", icon: MapPin, bg: "bg-primary/5", color: "text-primary" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row lg:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/[0.02]`}>
                      <item.icon size={28} />
                    </div>
                    <div>
                      <h5 className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1">{item.title}</h5>
                      <p className="text-secondary text-base sm:text-lg font-bold">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 sm:p-12 lg:p-16 shadow-2xl shadow-black/5 border border-gray-100">
              <h3 className="text-2xl sm:text-3xl font-bold text-secondary mb-8 sm:mb-10 text-center lg:text-left">Send a Message</h3>
              <form className="flex flex-col gap-5 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" placeholder="Your Name" className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">Mobile Number</label>
                    <input type="tel" placeholder="Your Number" className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">District</label>
                    <input type="text" placeholder="Your District" className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">Interested In</label>
                    <select className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium appearance-none">
                      <option>Campaign</option>
                      <option>Hiring</option>
                      <option>Delivery Partner</option>
                      <option>Product</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">Message</label>
                  <textarea placeholder="Tell us more..." rows={5} className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium resize-none"></textarea>
                </div>
                <button type="submit" className="btn-primary py-5 px-10 text-base sm:text-lg rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-bold mt-4">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

