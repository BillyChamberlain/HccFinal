(function () {
  const events = window.timelineEvents || [];
  const track = document.querySelector("#timelineTrack");
  const timeline = document.querySelector("#timeline");
  const activeTitle = document.querySelector("#activeTitle");
  const activeSummary = document.querySelector("#activeSummary");
  const progressFill = document.querySelector("#progressFill");
  const canvas = document.querySelector("#skyCanvas");

  if (!track || !timeline || !events.length) return;

  const cardMarkup = events
    .map(
      (event, index) => `
        <article class="event-card" style="--accent:${event.accent}" data-index="${index}">
          <a href="${event.page}" aria-label="Open event page: ${event.title}">
            <div class="event-visual ${event.imageClass || ""}">
              <span>${String(index + 1).padStart(2, "0")}</span>
            </div>
            <div class="event-content">
              <p class="event-year">${event.year} · ${event.kicker}</p>
              <h3>${event.title}</h3>
              <p>${event.summary}</p>
              <span class="read-more">Open page</span>
            </div>
          </a>
        </article>
      `
    )
    .join("");

  track.innerHTML = cardMarkup;

  const cards = Array.from(document.querySelectorAll(".event-card"));
  let maxShift = 0;
  let targetShift = 0;
  let currentShift = 0;
  let activeIndex = 0;
  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function resizeTimeline() {
    const viewport = window.innerWidth;
    const scrollWidth = track.scrollWidth;
    maxShift = Math.max(0, scrollWidth - viewport + 48);
    const scrollLength = Math.max(window.innerHeight * 2.8, maxShift + window.innerHeight * 0.9);
    timeline.style.height = `${scrollLength + window.innerHeight}px`;
    updateScroll();
  }

  function updateActive(progress) {
    const nextIndex = clamp(Math.round(progress * (events.length - 1)), 0, events.length - 1);
    if (nextIndex === activeIndex && activeTitle.textContent !== "Loading events") return;
    activeIndex = nextIndex;
    const event = events[activeIndex];
    activeTitle.textContent = event.title;
    activeSummary.textContent = `${event.year} · ${event.summary}`;
    document.documentElement.style.setProperty("--active-accent", event.accent);
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === activeIndex);
    });
  }

  function updateScroll() {
    const rect = timeline.getBoundingClientRect();
    const total = timeline.offsetHeight - window.innerHeight;
    const raw = clamp(-rect.top / Math.max(total, 1), 0, 1);
    targetShift = raw * maxShift;
    if (progressFill) progressFill.style.transform = `scaleX(${raw})`;
    updateActive(raw);
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  }

  function animate() {
    currentShift += (targetShift - currentShift) * 0.095;
    if (Math.abs(targetShift - currentShift) < 0.05) currentShift = targetShift;
    track.style.transform = `translate3d(${-currentShift}px, 0, 0)`;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2 - currentShift;
      const distance = (cardCenter - window.innerWidth / 2) / window.innerWidth;
      const lift = clamp(1 - Math.abs(distance) * 1.9, 0, 1);
      card.style.setProperty("--lift", lift.toFixed(3));
      card.style.setProperty("--tilt", `${clamp(distance * -8, -7, 7).toFixed(2)}deg`);
      card.style.setProperty("--parallax", `${clamp(distance * 22, -24, 24).toFixed(2)}px`);
      card.style.zIndex = String(10 + Math.round(lift * 20));
      card.classList.toggle("is-near", lift > 0.45 || index === activeIndex);
    });

    if (currentShift !== targetShift) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  }

  function initCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const points = Array.from({ length: 72 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.4,
      speed: 0.08 + Math.random() * 0.18,
      phase: index * 0.41
    }));

    function sizeCanvas() {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function draw(time) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createRadialGradient(width * 0.5, height * 0.3, 0, width * 0.5, height * 0.45, width);
      gradient.addColorStop(0, "rgba(255,255,255,0.10)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      points.forEach((point, index) => {
        const x = point.x * width + Math.sin(time * 0.00018 * point.speed + point.phase) * 32;
        const y = point.y * height + Math.cos(time * 0.00022 * point.speed + point.phase) * 24;
        ctx.beginPath();
        ctx.arc(x, y, point.r, 0, Math.PI * 2);
        ctx.fillStyle = index % 3 === 0 ? "rgba(255,209,102,0.58)" : "rgba(255,255,255,0.44)";
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    sizeCanvas();
    window.addEventListener("resize", sizeCanvas, { passive: true });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeTimeline, { passive: true });
  window.addEventListener("scroll", updateScroll, { passive: true });
  resizeTimeline();
  initCanvas();
})();
