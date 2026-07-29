document.addEventListener('DOMContentLoaded', () => {
    
    // Cookie Badge Logik
    const cookieBadge = document.getElementById('cookie-badge');
    const btnAccept = document.getElementById('cookie-accept');
    const btnDecline = document.getElementById('cookie-decline');
    
    let hasConsent = localStorage.getItem('cookieConsent');
    
    if (!hasConsent && cookieBadge) {
        setTimeout(() => { cookieBadge.classList.add('show'); }, 1000);
    }

    if (btnAccept && btnDecline) {
        btnAccept.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieBadge.classList.remove('show');
        });
        btnDecline.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'false');
            localStorage.removeItem('theme'); 
            cookieBadge.classList.remove('show');
        });
    }

    // Liquid Theme Transition (Splatoon Effekt)
    const themeToggle = document.getElementById('theme-toggle');
    
    let savedTheme = 'dark'; 
    if (hasConsent === 'true') {
        savedTheme = localStorage.getItem('theme') || 'dark';
    }
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Overlay erstellen
            const overlay = document.createElement('div');
            overlay.className = 'liquid-overlay';
            overlay.style.backgroundColor = newTheme === 'light' ? '#FAFAFC' : '#0A0A0C';
            
            // Position des Buttons berechnen, damit die Farbe genau von dort startet
            const rect = themeToggle.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;
            
            overlay.style.clipPath = `circle(0px at ${originX}px ${originY}px)`;
            document.body.appendChild(overlay);
            
            // Reflow erzwingen
            void overlay.offsetWidth;
            
            // Farbe über den ganzen Bildschirm ausbreiten
            overlay.style.clipPath = `circle(150vw at ${originX}px ${originY}px)`;

            // Kurz warten, bis die Animation fertig ist, dann echtes Theme wechseln
            setTimeout(() => {
                document.documentElement.setAttribute('data-theme', newTheme);
                if (localStorage.getItem('cookieConsent') === 'true') {
                    localStorage.setItem('theme', newTheme);
                }
                
                // Overlay aufräumen
                setTimeout(() => { overlay.remove(); }, 50);
            }, 800); 
        });
    }

    // Mobile Menü
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Fade-Up Animationen
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});
