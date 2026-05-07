'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Camera, Share2 } from 'lucide-react';

const PosterGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('Sakhi Member');
  const [city, setCity] = useState('Varanasi');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    drawPoster();
  }, [name, city, image]);

  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background Gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#E91E63');
    grad.addColorStop(1, '#6A1B9A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Logo Area
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 150, 0, Math.PI * 2);
    ctx.fill();

    // Draw SakhiHub Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Outfit';
    ctx.fillText('SakhiHub', 50, 80);
    
    ctx.font = '30px Plus Jakarta Sans';
    ctx.fillText('Women Empowerment Movement', 50, 120);

    // Draw User Image Placeholder or User Image
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 350, 180, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
         ctx.drawImage(img, canvas.width / 2 - 180, 170, 360, 360);
         // Redraw text over image if needed, or just call drawPoster again
      };
      ctx.drawImage(img, canvas.width / 2 - 180, 170, 360, 360);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(canvas.width / 2 - 180, 170, 360, 360);
      ctx.fillStyle = 'white';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No Photo Uploaded', canvas.width / 2, 350);
    }
    ctx.restore();

    // Draw Name & City
    ctx.textAlign = 'center';
    ctx.font = 'bold 70px Outfit';
    ctx.fillStyle = 'white';
    ctx.fillText(name, canvas.width / 2, 650);

    ctx.font = '40px Plus Jakarta Sans';
    ctx.fillStyle = '#FFD3E0';
    ctx.fillText(city, canvas.width / 2, 710);

    // Draw Footer
    ctx.fillStyle = 'white';
    ctx.font = '30px Plus Jakarta Sans';
    ctx.fillText('Together We Grow, Together We Empower', canvas.width / 2, 850);
    
    ctx.font = '20px Plus Jakarta Sans';
    ctx.fillText('www.sakhihub.org', canvas.width / 2, 900);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `sakhi_poster_${name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="glass-card" style={{ padding: '40px', background: 'white' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Digital Poster Generator</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Create your personalized SakhiHub empowerment poster and share it on WhatsApp!</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>Your Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>Your City</label>
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>Upload Photo</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                />
                <div style={{ padding: '12px', borderRadius: '10px', border: '2px dashed var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '700' }}>
                  <Camera size={20} /> Choose Photo
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button onClick={downloadPoster} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={20} /> Download
              </button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <Share2 size={20} /> Share
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={1000} 
            style={{ width: '100%', maxWidth: '350px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PosterGenerator;

