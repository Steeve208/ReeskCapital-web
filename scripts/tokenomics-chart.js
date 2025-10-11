// === TOKENOMICS CHART PROFESIONAL ===
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('tokenomicsChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 140;
  
  // Datos de distribución
  const data = [
    { percentage: 40, color: '#00d4ff', label: 'Mining' },
    { percentage: 30, color: '#7c3aed', label: 'Staking' },
    { percentage: 20, color: '#10b981', label: 'Ecosystem' },
    { percentage: 10, color: '#f59e0b', label: 'Reserve' }
  ];
  
  let currentRotation = -Math.PI / 2;
  let animationProgress = 0;
  
  function drawChart(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Glow de fondo
    const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius * 1.3);
    glow.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
    glow.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let startAngle = currentRotation;
    
    data.forEach((segment, index) => {
      const segmentAngle = (segment.percentage / 100) * 2 * Math.PI * progress;
      const endAngle = startAngle + segmentAngle;
      
      // Segmento principal
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Gradiente para cada segmento
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, segment.color + '99');
      gradient.addColorStop(1, segment.color);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Borde con glow
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = segment.color;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Separador entre segmentos
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(endAngle),
        centerY + radius * Math.sin(endAngle)
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      startAngle = endAngle;
    });
    
    // Círculo interior (dona)
    const innerRadius = radius * 0.55;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0f1e';
    ctx.fill();
    
    // Borde del círculo interior
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Animación de entrada
  function animate() {
    if (animationProgress < 1) {
      animationProgress += 0.02;
      drawChart(Math.min(animationProgress, 1));
      requestAnimationFrame(animate);
    } else {
      drawChart(1);
      // Rotación suave continua
      setInterval(() => {
        currentRotation += 0.001;
        drawChart(1);
      }, 16);
    }
  }
  
  // Iniciar cuando el elemento es visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(canvas);
  
  // Hover effects en legend items
  const legendItems = document.querySelectorAll('.legend-item');
  legendItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateX(10px)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateX(0)';
    });
  });
});

