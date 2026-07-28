document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Intersection Observer
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -40px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Apple-Style 3D Scroll Reveal logic
    const scrollTrack = document.getElementById('scrollHeroTrack');
    const stage = document.getElementById('revealStage');
    const cards = document.querySelectorAll('.reveal-card');
    const dots = document.querySelectorAll('.dot');

    function updateScrollReveal() {
        if (!scrollTrack || !stage) return;

        const rect = scrollTrack.getBoundingClientRect();
        const totalScroll = scrollTrack.offsetHeight - window.innerHeight;
        if (totalScroll <= 0) return;

        const progress = Math.min(Math.max(-rect.top / totalScroll, 0), 1);

        const rotateX = (1 - progress) * 50; 
        const translateY = (1 - progress) * 100;
        const scale = 0.65 + (progress * 0.35);
        const opacity = Math.min(progress * 3.5, 1);
        const blur = (1 - progress) * 12;

        stage.style.transform = `rotateX(${rotateX}deg) translateY(${translateY}px) scale(${scale})`;
        stage.style.opacity = opacity;
        stage.style.filter = `blur(${blur}px)`;

        let activeIdx = -1;
        if (progress > 0.65) {
            activeIdx = 2;
        } else if (progress > 0.35) {
            activeIdx = 1;
        } else if (progress > 0.08) {
            activeIdx = 0;
        }

        cards.forEach((card, idx) => {
            if (idx === activeIdx && progress > 0.05) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        dots.forEach((dot, idx) => {
            if (idx === activeIdx && progress > 0.05) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    if (scrollTrack && stage) {
        window.addEventListener('scroll', updateScrollReveal);
        updateScrollReveal();
    }
});
