/**
 * ADVANCED SCROLL & INTERACTION EFFECTS
 * Cải tiến trải nghiệm người dùng với các hiệu ứng tương tác nâng cao
 */

// =====================================================
// SCROLL REVEAL INTERSECTION OBSERVER
// =====================================================

export const initScrollReveal = () => {
  const revealElements = document.querySelectorAll(".scroll-reveal");

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
};

// =====================================================
// PARALLAX SCROLL EFFECT
// =====================================================

export const initParallaxEffect = () => {
  const parallaxElements = document.querySelectorAll(".parallax-element");

  window.addEventListener("scroll", () => {
    parallaxElements.forEach((el) => {
      const scrollPosition = window.scrollY;
      const elementOffset = el.offsetTop;
      const yPos = (scrollPosition - elementOffset) * 0.5;

      el.style.backgroundPosition = `center ${yPos}px`;
    });
  });
};

// =====================================================
// MOUSE FOLLOW EFFECT
// =====================================================

export const initMouseFollowEffect = () => {
  const followElements = document.querySelectorAll(".mouse-follow");

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    followElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const x = mouseX - rect.left - rect.width / 2;
      const y = mouseY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);

      // Limit effect radius
      if (distance < 150) {
        const angle = Math.atan2(y, x);
        const moveX = Math.cos(angle) * (150 - distance) * 0.1;
        const moveY = Math.sin(angle) * (150 - distance) * 0.1;

        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        el.style.transform = "translate(0, 0)";
      }
    });
  });
};

// =====================================================
// SMOOTH SCROLL BEHAVIOR
// =====================================================

export const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));

      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
};

// =====================================================
// HOVER LIFT EFFECT
// =====================================================

export const initHoverLiftEffect = () => {
  const elements = document.querySelectorAll(".hover-lift");

  elements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      el.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = "translateY(-8px)";
      el.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translateY(0)";
      el.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
    });
  });
};

// =====================================================
// RIPPLE EFFECT
// =====================================================

export const initRippleEffect = () => {
  const buttons = document.querySelectorAll(".btn-ripple");

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const ripple = document.createElement("span");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.position = "absolute";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.background = "rgba(255, 255, 255, 0.5)";
      ripple.style.borderRadius = "50%";
      ripple.style.pointerEvents = "none";
      ripple.style.animation =
        "ripple 0.6s ease-out forwards cubic-bezier(0.4, 0, 0.2, 1)";

      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
};

// =====================================================
// TEXT TYPING EFFECT
// =====================================================

export const initTypingEffect = () => {
  const elements = document.querySelectorAll(".typing-effect");

  elements.forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    let index = 0;

    const type = () => {
      if (index < text.length) {
        el.textContent += text.charAt(index);
        index++;
        setTimeout(type, 50);
      }
    };

    // Start typing when element is visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && index === 0) {
        type();
        observer.unobserve(el);
      }
    });

    observer.observe(el);
  });
};

// =====================================================
// COUNTER ANIMATION
// =====================================================

export const initCounterAnimation = () => {
  const counters = document.querySelectorAll(".counter");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-target"));
        let current = 0;
        const increment = target / 30;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            el.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = target;
          }
        };

        updateCounter();
        observer.unobserve(el);
      }
    });
  });

  counters.forEach((el) => observer.observe(el));
};

// =====================================================
// THEME TOGGLE WITH SMOOTH TRANSITION
// =====================================================

export const initThemeToggle = () => {
  const themeToggle = document.getElementById("theme-toggle");

  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    document.body.style.transition =
      "background-color 0.3s ease, color 0.3s ease";
    document.body.classList.toggle("dark-mode");

    // Save preference
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light",
    );
  });

  // Apply saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
};

// =====================================================
// SCROLL PROGRESS BAR
// =====================================================

export const initScrollProgressBar = () => {
  const progressBar = document.getElementById("scroll-progress");

  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = progress + "%";
  });
};

// =====================================================
// LAZY LOAD IMAGES
// =====================================================

export const initLazyLoadImages = () => {
  const images = document.querySelectorAll("img[data-src]");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => observer.observe(img));
};

// =====================================================
// INITIALIZE ALL EFFECTS
// =====================================================

export const initAllEffects = () => {
  if (typeof window === "undefined") return;

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initScrollReveal();
      initParallaxEffect();
      initMouseFollowEffect();
      initSmoothScroll();
      initHoverLiftEffect();
      initRippleEffect();
      initTypingEffect();
      initCounterAnimation();
      initThemeToggle();
      initScrollProgressBar();
      initLazyLoadImages();
    });
  } else {
    initScrollReveal();
    initParallaxEffect();
    initMouseFollowEffect();
    initSmoothScroll();
    initHoverLiftEffect();
    initRippleEffect();
    initTypingEffect();
    initCounterAnimation();
    initThemeToggle();
    initScrollProgressBar();
    initLazyLoadImages();
  }
};
