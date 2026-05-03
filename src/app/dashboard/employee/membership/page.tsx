import React from "react";
import { CreditCard, Search, Calendar, FileText, CheckCircle } from "lucide-react";

export default function MembershipCollectionPage() {
  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Membership Collection</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage ₹100 membership fee collection.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
        <div>
          <h4 style={{ marginBottom: '20px' }}>New Entry</h4>
          <form className="glass-card" style={{ padding: '30px', background: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Search Member</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
                <input type="text" placeholder="Mobile or Name" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Payment Mode</label>
              <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                <option>Cash</option>
                <option>UPI</option>
                <option>Online</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Amount (Fixed)</label>
              <div style={{ padding: '12px', borderRadius: '10px', background: '#f1f5f9', fontWeight: '700', color: 'var(--secondary)' }}>₹ 100</div>
            </div>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Submit Payment</button>
          </form>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ marginBottom: '25px' }}>Recent Collections</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '15px 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Member Name</th>
                  <th style={{ padding: '15px 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mode</th>
                  <th style={{ padding: '15px 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '15px 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 10px' }}>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Member {i}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: SH-2024-00{i}</p>
                    </td>
                    <td style={{ padding: '15px 10px', fontSize: '0.9rem' }}>Cash</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '5px', fontSize: '0.75rem', fontWeight: '600' }}>Paid</span>
                    </td>
                    <td style={{ padding: '15px 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>May 03, 2024</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
