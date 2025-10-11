// === PLANETA DIGITAL TOKENOMICS ESTILO ARGUSVPN ===
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('tokenomicsPlanetCanvas');
  if (!canvas) {
    console.log('Canvas no encontrado');
    return;
  }
  
  console.log('Iniciando planeta digital...');
  
  const W = 700, H = 420;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('Context 2D no disponible');
    return;
  }

  const centerX = W/2, centerY = H*0.52;
  const R = 180;
  
  // Generar puntos de la esfera (más densos)
  const points = [];
  const latLines = 40;
  const lonLines = 120;
  for(let i=0; i<=latLines; i++){
    const phi = Math.PI * (i/latLines);
    for(let j=0; j<lonLines; j++){
      const theta = (j/lonLines)*2*Math.PI;
      points.push({phi, theta});
    }
  }
  
  console.log(`Puntos generados: ${points.length}`);
  
  // Partículas flotantes aleatorias
  const floatingDots = [];
  for(let i=0; i<30; i++){
    floatingDots.push({
      x: centerX + (Math.random()-0.5)*R*3,
      y: centerY + (Math.random()-0.5)*R*2.2,
      size: Math.random()*2+0.5,
      speed: Math.random()*0.3+0.1,
      offset: Math.random()*Math.PI*2
    });
  }

  function drawFrame(t){
    ctx.clearRect(0,0,W,H);
    
    // ==== GLOW MASIVO DE FONDO ====
    const glow = ctx.createRadialGradient(centerX, centerY, R*0.3, centerX, centerY, R*1.8);
    glow.addColorStop(0, 'rgba(100,150,255,0.6)');
    glow.addColorStop(0.3, 'rgba(50,100,255,0.4)');
    glow.addColorStop(0.6, 'rgba(20,50,150,0.2)');
    glow.addColorStop(1, 'rgba(0,0,50,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,W,H);
    
    const rot = (t/8000) % (2*Math.PI);
    
    // ==== LÍNEAS HORIZONTALES CURVAS (LATITUD) ====
    ctx.save();
    for(let i=5; i<=35; i+=3){
      const phi = Math.PI * (i/40);
      const y = centerY - R * Math.cos(phi);
      
      ctx.beginPath();
      for(let angle=0; angle<=Math.PI; angle+=0.02){
        const theta = angle + rot;
        const x = Math.sin(phi)*Math.cos(theta);
        if(x > 0){
          const sx = centerX + R * Math.sin(phi) * Math.cos(theta);
          const sy = y;
          if(angle===0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
      }
      ctx.strokeStyle = `rgba(150,180,255,${0.3+0.2*Math.sin(phi)})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(100,150,255,0.8)';
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
    ctx.restore();
    
    // ==== PUNTOS BRILLANTES DE LA ESFERA ====
    for(const pt of points){
      const phi = pt.phi;
      const theta = pt.theta + rot;
      const x = Math.sin(phi)*Math.cos(theta);
      const y = Math.cos(phi);
      
      if(x > 0){ // Solo lado visible
        const sx = centerX + R * Math.sin(phi) * Math.cos(theta);
        const sy = centerY - R * y;
        const brightness = 0.4 + 0.6*Math.pow(x, 1.5);
        const size = 1 + 1.5*x;
        
        ctx.save();
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, 2*Math.PI);
        ctx.fillStyle = `rgb(${180+75*x},${200+55*x},255)`;
        ctx.shadowColor = `rgba(100,150,255,${brightness})`;
        ctx.shadowBlur = 6+8*x;
        ctx.fill();
        ctx.restore();
      }
    }
    
    // ==== PARTÍCULAS FLOTANTES ====
    floatingDots.forEach(dot => {
      const pulse = Math.sin(t/1000 + dot.offset)*0.3+0.7;
      ctx.save();
      ctx.globalAlpha = pulse*0.6;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, 2*Math.PI);
      ctx.fillStyle = '#a8c8ff';
      ctx.shadowColor = 'rgba(168,200,255,0.8)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
      
      dot.y -= dot.speed;
      if(dot.y < centerY - R*1.5) dot.y = centerY + R*1.2;
    });
    
    // ==== PUNTOS CONECTORES LATERALES ====
    // Punto izquierdo
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX - R*0.7, centerY - R*0.3, 6, 0, 2*Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();
    
    // Punto derecho
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX + R*0.9, centerY + R*0.1, 6, 0, 2*Math.PI);
    ctx.fillStyle = '#8ab4ff';
    ctx.shadowColor = 'rgba(138,180,255,1)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();
  }
  
  function animate(){
    drawFrame(performance.now());
    requestAnimationFrame(animate);
  }
  
  console.log('Iniciando animación...');
  animate();
});

