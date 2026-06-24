import React from 'react';

interface DocumentHeaderProps {
  logoSrc: string;
  className?: string;
  noPadding?: boolean;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ logoSrc, className = '', noPadding = false }) => {
  const paddingVal = noPadding ? '0' : '0 12mm';

  return (
    <div className={`w-full font-sans select-none ${className}`} style={{ boxSizing: 'border-box', paddingTop: '15px' }}>
      
      {/* 1. Main Letterhead Content Container */}
      <div style={{ padding: paddingVal, boxSizing: 'border-box', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', margin: 0, padding: 0, tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              {/* Left Branding Area */}
              <td style={{ width: '55%', padding: 0, border: 'none', verticalAlign: 'middle', textAlign: 'left' }}>
                <table style={{ borderCollapse: 'collapse', border: 'none', margin: 0, padding: 0, width: 'auto' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0, border: 'none', verticalAlign: 'middle' }}>
                        <img 
                          src={logoSrc} 
                          alt="SakhiHub Logo" 
                          style={{
                            height: '52px',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'block'
                          }} 
                        />
                      </td>
                      <td style={{ padding: 0, border: 'none', verticalAlign: 'middle' }}>
                        <div 
                          style={{
                            width: '2.5px',
                            height: '48px',
                            backgroundColor: '#D91656',
                            margin: '0 16px',
                            borderRadius: '1px'
                          }} 
                        />
                      </td>
                      <td style={{ padding: 0, border: 'none', verticalAlign: 'middle', textAlign: 'left', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#D91656', letterSpacing: '0.2px', display: 'block' }}>
                          SakhiHub
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#6A1B9A', fontWeight: 'bold', fontStyle: 'italic', marginTop: '3px', display: 'block' }}>
                          Empowering Women Across India
                        </span>
                        <span style={{ fontSize: '9px', color: '#374151', fontWeight: '500', marginTop: '5px', display: 'block' }}>
                          Reg No :- INDO260528SE004491
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Right Contact Info Area */}
              <td style={{ width: '45%', padding: 0, border: 'none', verticalAlign: 'middle', textAlign: 'right' }}>
                <table style={{ borderCollapse: 'collapse', border: 'none', margin: 0, padding: 0, width: '100%' }}>
                  <tbody>
                    {/* Row 1: Website */}
                    <tr>
                      <td style={{ padding: '2px 0', border: 'none', textAlign: 'right', fontSize: '11px', color: '#374151', verticalAlign: 'middle' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        <span style={{ fontWeight: 'bold', color: '#6A1B9A', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>Website :</span>
                        <a href="https://www.sakhihub.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D91656', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', verticalAlign: 'middle' }}>
                          www.sakhihub.com
                        </a>
                      </td>
                    </tr>

                    {/* Row 2: Email */}
                    <tr>
                      <td style={{ padding: '2px 0', border: 'none', textAlign: 'right', fontSize: '11px', color: '#374151', verticalAlign: 'middle' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span style={{ fontWeight: 'bold', color: '#6A1B9A', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>Email :</span>
                        <a href="mailto:info@sakhihub.com" style={{ color: '#6A1B9A', textDecoration: 'none', display: 'inline-block', verticalAlign: 'middle' }}>
                          info@sakhihub.com
                        </a>
                      </td>
                    </tr>

                    {/* Row 3: Contact */}
                    <tr>
                      <td style={{ padding: '2px 0', border: 'none', textAlign: 'right', fontSize: '11px', color: '#374151', verticalAlign: 'middle' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#6A1B9A', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', textAlign: 'center', lineHeight: '14px' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginTop: '-3px' }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#6A1B9A', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>Contact :</span>
                        <span style={{ fontWeight: 'bold', color: '#6A1B9A', display: 'inline-block', verticalAlign: 'middle' }}>+91 8031492661</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Address Pill Container */}
      <div style={{ padding: paddingVal, boxSizing: 'border-box', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginTop: '15px', padding: 0, tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              {/* Left Decorative Ribbon */}
              <td style={{ width: '52px', padding: 0, border: 'none', verticalAlign: 'middle', textAlign: 'left' }}>
                <div style={{ display: 'flex', transform: 'skewX(-25deg)', height: '18px', overflow: 'hidden', width: '52px' }}>
                  <div style={{ width: '28px', height: '100%', backgroundColor: '#D91656', flexShrink: 0 }} />
                  <div style={{ width: '18px', height: '100%', backgroundColor: '#6A1B9A', flexShrink: 0 }} />
                  <div style={{ width: '6px', height: '100%', backgroundColor: '#D91656', flexShrink: 0 }} />
                </div>
              </td>

              {/* Center Rounded Address Pill */}
              <td style={{ padding: '0 12px', border: 'none', verticalAlign: 'middle', textAlign: 'center' }}>
                <div 
                  style={{
                    background: 'linear-gradient(to right, #FFF2F6, #F9F0FF)',
                    border: '1px solid #FBCFE8',
                    borderRadius: '25px',
                    padding: '4px 14px',
                    display: 'block',
                    fontSize: '9.5px',
                    color: '#374151',
                    fontWeight: 500,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textAlign: 'center'
                  }}
                >
                  {/* Map Pin SVG Icon inside a solid purple circle */}
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#6A1B9A', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', textAlign: 'center', lineHeight: '14px' }}>
                    <svg width="8" height="8" viewBox="0 0 12 15" fill="none" style={{ color: '#FFFFFF', display: 'inline-block', verticalAlign: 'middle', marginTop: '-3px' }}>
                      <path d="M6 0C2.69 0 0 2.69 0 6C0 10.5 6 15 6 15C6 15 12 10.5 12 6C12 2.69 9.31 0 6 0ZM6 8.25C4.76 8.25 3.75 7.24 3.75 6C3.75 4.76 4.76 3.75 6 3.75C7.24 3.75 8.25 4.76 8.25 6C8.25 7.24 7.24 8.25 6 8.25Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <span style={{ fontWeight: 'bold', color: '#6A1B9A', marginRight: '4px' }}>Address :</span> Pu 4, Behind C21 Mall, Scheme 54, Indore, Madhya Pradesh 452010
                  </span>
                </div>
              </td>

              {/* Right Decorative Ribbon */}
              <td style={{ width: '52px', padding: 0, border: 'none', verticalAlign: 'middle', textAlign: 'right' }}>
                <div style={{ display: 'flex', transform: 'skewX(25deg)', height: '18px', overflow: 'hidden', width: '52px', float: 'right' }}>
                  <div style={{ width: '6px', height: '100%', backgroundColor: '#D91656', flexShrink: 0 }} />
                  <div style={{ width: '18px', height: '100%', backgroundColor: '#6A1B9A', flexShrink: 0 }} />
                  <div style={{ width: '28px', height: '100%', backgroundColor: '#D91656', flexShrink: 0 }} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Bottom Gradient Divider Line */}
      <div 
        style={{
          height: '4px',
          width: '100%',
          background: 'linear-gradient(to right, #D91656, #6A1B9A)',
          marginTop: '15px',
          marginBottom: '20px'
        }} 
      />
    </div>
  );
};

export default DocumentHeader;
