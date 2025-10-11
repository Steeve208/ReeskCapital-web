// === PLANETA DIGITAL ECOSYSTEM (MÓVIL) ===
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('ecosystemPlanetCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const W = 300, H = 300;
  const centerX = W / 2;
  const centerY = H / 2;
  const R = 90;
  
  // Generar puntos de la esfera
  const points = [];
  const latLines = 25;
  const lonLines = 60;
  for(let i=0; i<=latLines; i++){
    const phi = Math.PI * (i/latLines);
    for(let j=0; j<lonLines; j++){
      const theta = (j/lonLines)*2*Math.PI;
      points.push({phi, theta});
    }
  }
  
  function drawFrame(t){
    ctx.clearRect(0,0,W,H);
    
    // Glow de fondo
    const glow = ctx.createRadialGradient(centerX, centerY, R*0.3, centerX, centerY, R*1.8);
    glow.addColorStop(0, 'rgba(100,150,255,0.5)');
    glow.addColorStop(0.5, 'rgba(50,100,255,0.3)');
    glow.addColorStop(1, 'rgba(0,0,50,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,W,H);
    
    const rot = (t/6000) % (2*Math.PI);
    
    // Líneas horizontales (latitud)
    ctx.save();
    for(let i=3; i<=22; i+=2){
      const phi = Math.PI * (i/25);
      const y = centerY - R * Math.cos(phi);
      
      ctx.beginPath();
      for(let angle=0; angle<=Math.PI; angle+=0.03){
        const theta = angle + rot;
        const x = Math.sin(phi)*Math.cos(theta);
        if(x > 0){
          const sx = centerX + R * Math.sin(phi) * Math.cos(theta);
          const sy = y;
          if(angle===0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
      }
      ctx.strokeStyle = `rgba(150,180,255,${0.4+0.2*Math.sin(phi)})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(100,150,255,0.6)';
      ctx.shadowBlur = 6;
      ctx.stroke();
    }
    ctx.restore();
    
    // Puntos de la esfera
    for(const pt of points){
      const phi = pt.phi;
      const theta = pt.theta + rot;
      const x = Math.sin(phi)*Math.cos(theta);
      const y = Math.cos(phi);
      
      if(x > 0){
        const sx = centerX + R * Math.sin(phi) * Math.cos(theta);
        const sy = centerY - R * y;
        const brightness = 0.5 + 0.5*Math.pow(x, 1.3);
        const size = 0.8 + 1*x;
        
        ctx.save();
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, 2*Math.PI);
        ctx.fillStyle = `rgb(${180+75*x},${200+55*x},255)`;
        ctx.shadowColor = `rgba(100,150,255,${brightness})`;
        ctx.shadowBlur = 5+6*x;
        ctx.fill();
        ctx.restore();
      }
    }
  }
  
  function animate(){
    drawFrame(performance.now());
    requestAnimationFrame(animate);
  }
  
  // Iniciar cuando es visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });
  
  observer.observe(canvas);
});

