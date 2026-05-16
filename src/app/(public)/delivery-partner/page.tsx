import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { Truck, IndianRupee, ShieldCheck } from "lucide-react";

export default function DeliveryPartnerPage() {
  return (
    <>
      <PageBanner 
        title="Delivery Partner" 
        subtitle="Tehsil / Block Level Delivery Partner"
        image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'flex-start' }}>
            <div>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '25px' }}>Business Opportunity</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '30px' }}>
                In the SakhiHub Delivery Partner model, the partner does not need to handle hiring, marketing, or group formation. The company provides ready orders, customers, product material, and full operational support. The partner is responsible for local product delivery within their assigned Tehsil/Block.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '25px' }}>
                  <IndianRupee size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                  <h4>Monthly Income</h4>
                  <p style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '1.2rem' }}>₹25,000 – ₹50,000</p>
                </div>
                <div className="glass-card" style={{ padding: '25px' }}>
                  <ShieldCheck size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                  <h4>Security Deposit</h4>
                  <p style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '1.2rem' }}>₹25,000</p>
                </div>
              </div>

              <h3>Main Requirements</h3>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Truck size={20} color="var(--primary)" /> 10×10 ft space for storage</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Truck size={20} color="var(--primary)" /> Two-wheeler (Bike)</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Truck size={20} color="var(--primary)" /> Valid Driving License & Helmet</li>
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ marginBottom: '25px', textAlign: 'center' }}>Job Description</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>1</div>
                  <p style={{ fontSize: '0.95rem' }}>Receiving ready orders from the company</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>2</div>
                  <p style={{ fontSize: '0.95rem' }}>Ensuring timely delivery to customers</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>3</div>
                  <p style={{ fontSize: '0.95rem' }}>Collecting payments for COD (Cash on Delivery) orders</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>4</div>
                  <p style={{ fontSize: '0.95rem' }}>Submitting daily delivery and collection reports</p>
                </div>
                
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="/register?role=delivery" className="btn-primary" style={{ justifyContent: 'center' }}>Apply as Delivery Partner</a>
                  <a href="/contact" className="btn-secondary" style={{ justifyContent: 'center' }}>
                    Request More Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
