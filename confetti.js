const confetti = {
    maxCount: 150,
    speed: 2,
    frameInterval: 15,
    alpha: 1.0,
    gradient: false,
    start: null,
    stop: null,
    toggle: null,
    pause: null,
    resume: null,
    togglePause: null,
    remove: null,
    isRunning: null,
    animate: null
  };
  
  // Initialize confetti
  (function() {
    confetti.start = startConfetti;
    confetti.stop = stopConfetti;
    confetti.toggle = toggleConfetti;
    confetti.pause = pauseConfetti;
    confetti.resume = resumeConfetti;
    confetti.togglePause = toggleConfettiPause;
    confetti.remove = removeConfetti;
    confetti.isRunning = isConfettiRunning;
    let supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
    let colors = ["rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"];
    let streamingConfetti = false;
    let pause = false;
    let lastFrameTime = Date.now();
    let particles = [];
    let waveAngle = 0;
    let context = null;
  
    function resetParticle(particle, width, height) {
      particle.color = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
      particle.x = Math.random() * width;
      particle.y = Math.random() * height - height;
      particle.diameter = Math.random() * 10 + 5;
      particle.tilt = Math.random() * 10 - 10;
      particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
      particle.tiltAngle = Math.random() * Math.PI;
      return particle;
    }
  
    function startConfetti() {
      let width = window.innerWidth;
      let height = window.innerHeight;
      window.requestAnimationFrame = supportsAnimationFrame;
      if (context === null) {
        let canvas = document.createElement("canvas");
        canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
        document.body.prepend(canvas);
        context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
      }
      while (particles.length < confetti.maxCount)
        particles.push(resetParticle({}, width, height));
      streamingConfetti = true;
      pause = false;
      runAnimation();
    }
  
    function stopConfetti() {
      streamingConfetti = false;
    }
  
    function removeConfetti() {
      stop();
      pause = false;
      particles = [];
    }
  
    function toggleConfetti() {
      if (streamingConfetti)
        stopConfetti();
      else
        startConfetti();
    }
  
    function pauseConfetti() {
      pause = true;
    }
  
    function resumeConfetti() {
      pause = false;
      runAnimation();
    }
  
    function toggleConfettiPause() {
      if (pause)
        resumeConfetti();
      else
        pauseConfetti();
    }
  
    function isConfettiRunning() {
      return streamingConfetti;
    }
  
    function runAnimation() {
      if (pause)
        return;
      else if (particles.length === 0) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }
      let now = Date.now();
      let delta = now - lastFrameTime;
      if (!supportsAnimationFrame || delta > confetti.frameInterval) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        updateParticles();
        drawParticles(context);
        lastFrameTime = now - (delta % confetti.frameInterval);
      }
      window.requestAnimationFrame(runAnimation);
    }
  
    function updateParticles() {
      let width = window.innerWidth;
      let height = window.innerHeight;
      let particle;
      waveAngle += 0.01;
      for (let i = 0; i < particles.length; i++) {
        particle = particles[i];
        if (!streamingConfetti && particle.y < -15)
          particle.y = height + 100;
        else {
          particle.tiltAngle += particle.tiltAngleIncrement;
          particle.x += Math.sin(waveAngle) - 0.5;
          particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
          particle.tilt = Math.sin(particle.tiltAngle) * 15;
        }
        if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
          if (streamingConfetti && particles.length <= confetti.maxCount)
            resetParticle(particle, width, height);
          else {
            particles.splice(i, 1);
            i--;
          }
        }
      }
    }
  
    function drawParticles(context) {
      let particle;
      let x, y, x2, y2;
      for (let i = 0; i < particles.length; i++) {
        particle = particles[i];
        context.beginPath();
        context.lineWidth = particle.diameter;
        x2 = particle.x + particle.tilt;
        x = x2 + particle.diameter / 2;
        y2 = particle.y + particle.tilt + particle.diameter / 2;
        if (confetti.gradient) {
          let gradient = context.createLinearGradient(x, particle.y, x2, y2);
          gradient.addColorStop("0", particle.color);
          gradient.addColorStop("1.0", particle.color.replace(")", ",0)"));
          context.strokeStyle = gradient;
        } else
          context.strokeStyle = particle.color;
        context.moveTo(x, particle.y);
        context.lineTo(x2, y2);
        context.stroke();
      }
    }
  })();

export default confetti;