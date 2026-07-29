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
            if (cookieBadge) cookieBadge.classList.remove('show');
        });
        btnDecline.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'false');
            localStorage.removeItem('theme'); 
            if (cookieBadge) cookieBadge.classList.remove('show');
        });
    }

    // Liquid Theme Transition (Splatoon-Effekt vom Button aus)
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
            
            const overlay = document.createElement('div');
            overlay.className = 'liquid-overlay';
            overlay.style.backgroundColor = newTheme === 'light' ? '#FAFAFC' : '#0A0A0C';
            
            const rect = themeToggle.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;
            
            overlay.style.clipPath = `circle(0px at ${originX}px ${originY}px)`;
            document.body.appendChild(overlay);
            
            void overlay.offsetWidth;
            
            overlay.style.clipPath = `circle(150vw at ${originX}px ${originY}px)`;

            setTimeout(() => {
                document.documentElement.setAttribute('data-theme', newTheme);
                if (localStorage.getItem('cookieConsent') === 'true') {
                    localStorage.setItem('theme', newTheme);
                }
                
                setTimeout(() => { overlay.remove(); }, 50);
            }, 800); 
        });
    }

    // Mobile Menü Toggle (Zuverlässig für alle Geräte)
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Schließe Menü bei Klick auf einen Link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.innerHTML = '☰';
            });
        });
    }

    // Fade-Up Animationen beim Scrollen
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
