document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
        const icon = hamburger.querySelector('i');
        if(navLinks.classList.contains('nav-active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link (mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav-active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.section-reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', revealOnScroll);
    
    // Trigger once on load
    revealOnScroll();
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // ==========================================
    // ReactBits LineSidebar Component Logic
    // ==========================================
    const lineSidebarWrapper = document.getElementById('lineSidebarWrapper');
    const lineSidebarToggle = document.getElementById('lineSidebarToggle');
    const list = document.getElementById('lineSidebarList');

    if (lineSidebarToggle && lineSidebarWrapper) {
        lineSidebarToggle.addEventListener('click', () => {
            lineSidebarWrapper.classList.toggle('mobile-active');
            const icon = lineSidebarToggle.querySelector('i');
            if (lineSidebarWrapper.classList.contains('mobile-active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars-staggered';
            }
        });
    }

    if (list) {
        const items = Array.from(list.querySelectorAll('.line-sidebar__item'));
        const proximityRadius = 110;
        const smoothing = 80;
        const falloff = p => p * p * (3 - 2 * p); // smooth ease curve

        let activeIndex = 0;
        const targets = new Array(items.length).fill(0);
        const currents = new Array(items.length).fill(0);
        let lastTime = performance.now();
        let rafId = null;

        function runFrame(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            const tau = Math.max(smoothing, 1) / 1000;
            const k = 1 - Math.exp(-dt / tau);

            let moving = false;
            for (let i = 0; i < items.length; i++) {
                const target = Math.max(targets[i] || 0, activeIndex === i ? 1 : 0);
                const cur = currents[i] || 0;
                const next = cur + (target - cur) * k;
                const settled = Math.abs(target - next) < 0.0015;
                const value = settled ? target : next;
                currents[i] = value;
                items[i].style.setProperty('--effect', value.toFixed(4));
                if (!settled) moving = true;
            }

            if (moving) {
                rafId = requestAnimationFrame(runFrame);
            } else {
                rafId = null;
            }
        }

        function startLoop() {
            if (rafId !== null) cancelAnimationFrame(rafId);
            lastTime = performance.now();
            rafId = requestAnimationFrame(runFrame);
        }

        // Pointer Proximity Effect
        list.addEventListener('pointermove', (e) => {
            const rect = list.getBoundingClientRect();
            const pointerY = e.clientY - rect.top;
            for (let i = 0; i < items.length; i++) {
                const el = items[i];
                const center = el.offsetTop + el.offsetHeight / 2;
                const distance = Math.abs(pointerY - center);
                targets[i] = falloff(Math.max(0, 1 - distance / proximityRadius));
            }
            startLoop();
        });

        list.addEventListener('pointerleave', () => {
            targets.fill(0);
            startLoop();
        });

        // Click to scroll to section
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                activeIndex = index;
                const targetId = item.getAttribute('data-target');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
                if (lineSidebarWrapper && lineSidebarWrapper.classList.contains('mobile-active')) {
                    lineSidebarWrapper.classList.remove('mobile-active');
                    if (lineSidebarToggle) {
                        const icon = lineSidebarToggle.querySelector('i');
                        if (icon) icon.className = 'fas fa-bars-staggered';
                    }
                }
                startLoop();
            });
        });

        // Sync active index with page scroll position
        const sectionIds = ['home', 'about', 'experience', 'skills', 'education'];
        const sections = sectionIds.map(id => document.getElementById(id));

        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + 200;
            for (let i = sections.length - 1; i >= 0; i--) {
                const sec = sections[i];
                if (sec && sec.offsetTop <= scrollPos) {
                    if (activeIndex !== i) {
                        activeIndex = i;
                        startLoop();
                    }
                    break;
                }
            }
        });

        // Initial launch
        startLoop();
    }
});
