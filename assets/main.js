document.addEventListener('DOMContentLoaded', () => {
    
    // Cookie Badge Logic
    const cookieBadge = document.getElementById('cookie-badge');
    const btnAccept = document.getElementById('cookie-accept');
    const btnDecline = document.getElementById('cookie-decline');
    
    let hasConsent = localStorage.getItem('cookieConsent');
    
    if (!hasConsent) {
        setTimeout(() => { cookieBadge.classList.add('show'); }, 1500);
    }

    if (btnAccept && btnDecline) {
        btnAccept.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieBadge.classList.remove('show');
        });
        btnDecline.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'false');
            localStorage.removeItem('theme'); // Clean up if declined
            cookieBadge.classList.remove('show');
        });
    }

    // Theme Toggle & Paint Bucket Logic
    const themeToggle = document.getElementById('theme-toggle');
    
    // Initial Theme Load
    let savedTheme = 'dark'; // Default
    if (hasConsent === 'true') {
        savedTheme = localStorage.getItem('theme') || 'dark';
    }
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Create Paint Bucket Overlay
            const overlay = document.createElement('div');
            overlay.className = 'theme-overlay';
            // Set color of the "paint" to the background of the incoming theme
            overlay.style.backgroundColor = newTheme === 'light' ? '#FAFAFC' : '#0A0A0C';
            document.body.appendChild(overlay);
            
            // Trigger drop animation
            requestAnimationFrame(() => {
                overlay.classList.add('drop');
            });

            // Mid-animation (when screen is covered), switch the actual DOM theme instantly
            setTimeout(() => {
                document.documentElement.setAttribute('data-theme', newTheme);
                if (localStorage.getItem('cookieConsent') === 'true') {
                    localStorage.setItem('theme', newTheme);
                }
            }, 600); // Corresponds to transition duration in CSS

            // Slide out the overlay downwards
            setTimeout(() => {
                overlay.classList.remove('drop');
                overlay.classList.add('slide-out');
                
                // Cleanup DOM
                setTimeout(() => {
                    overlay.remove();
                }, 600);
            }, 700); // Slight pause before sliding out
        });
    }

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Intersection Observer (Fade Up)
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
