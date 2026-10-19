/* ============================================
   SHIVAUMEED FOUNDATION — MAIN SCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar scroll behaviour ----
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.scrollY;

        // Navbar shadow on scroll
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top visibility
        if (currentScroll > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Back to top click
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- Mobile menu toggle ----
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // ---- Active nav link based on scroll position ----
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();

    // ---- Impact counter animation ----
    const counters = document.querySelectorAll('.impact-number');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;

        const impactSection = document.getElementById('impact');
        if (!impactSection) return;

        const rect = impactSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
            countersAnimated = true;

            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'), 10);
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease-out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);

                    counter.textContent = current.toLocaleString('en-IN');

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
            });
        }
    }

    window.addEventListener('scroll', animateCounters, { passive: true });
    animateCounters();

    // ---- Scroll reveal animations ----
    function setupRevealAnimations() {
        const revealElements = document.querySelectorAll(
            '.cause-card, .help-card, .impact-card, .contact-card, ' +
            '.about-content, .about-images, .volunteer-info, .volunteer-form-wrapper, ' +
            '.donate-content, .gallery-item, .mission-item'
        );

        revealElements.forEach(el => {
            el.classList.add('reveal');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Staggered reveal for grid children
                    const parent = entry.target.parentElement;
                    const siblings = parent ? Array.from(parent.querySelectorAll('.reveal')) : [];
                    const index = siblings.indexOf(entry.target);
                    const delay = index >= 0 ? index * 100 : 0;

                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    setupRevealAnimations();

    // ---- Form handling (Web3Forms API & WhatsApp) ----
    function handleFormSubmit(formId, successMessage, errorMessage, onBeforeSubmit) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Execute synchronous pre-submit action (e.g. open WhatsApp in direct user event)
            if (typeof onBeforeSubmit === 'function') {
                try {
                    onBeforeSubmit(form);
                } catch (err) {
                    console.error('Form pre-submit error:', err);
                }
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            try {
                const formData = new FormData(form);
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Success
                    submitBtn.textContent = '✓ ' + successMessage;
                    submitBtn.style.background = '#3d7a3e';
                    submitBtn.style.borderColor = '#3d7a3e';
                    if (typeof gtag === 'function') {
                        gtag('event', 'generate_lead', {
                            event_category: 'form',
                            event_label: formId
                        });
                    }
                    form.reset();
                } else {
                    // API returned an error
                    submitBtn.textContent = '✗ ' + (errorMessage || 'Something went wrong');
                    submitBtn.style.background = '#c0392b';
                    submitBtn.style.borderColor = '#c0392b';
                }
            } catch (err) {
                // Network error
                submitBtn.textContent = '✗ Network error, please try again';
                submitBtn.style.background = '#c0392b';
                submitBtn.style.borderColor = '#c0392b';
            }

            // Reset button after 4 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
            }, 4000);
        });
    }

    handleFormSubmit('volunteer-form', 'Application Sent!', 'Failed to send', (form) => {
        const name = form.querySelector('#vol-name')?.value?.trim() || '';
        const email = form.querySelector('#vol-email')?.value?.trim() || '';
        const phone = form.querySelector('#vol-phone')?.value?.trim() || '';
        const city = form.querySelector('#vol-city')?.value?.trim() || '';
        const interestSelect = form.querySelector('#vol-interest');
        const interest = (interestSelect && interestSelect.selectedIndex > 0)
            ? interestSelect.options[interestSelect.selectedIndex].text
            : '';
        const message = form.querySelector('#vol-message')?.value?.trim() || '';

        let waText = `*New Volunteer Application — SHIVAUMEED-FOUNDATION*\n\n` +
            `*Name:* ${name}\n` +
            `*Email:* ${email}\n` +
            `*Phone:* ${phone}\n`;
        if (city) {
            waText += `*City/Village:* ${city}\n`;
        }
        if (interest) {
            waText += `*Area of Interest:* ${interest}\n`;
        }
        if (message) {
            waText += `*About:* ${message}\n`;
        }

        const waUrl = `https://api.whatsapp.com/send?phone=919203269980&text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank');
    });

    handleFormSubmit('contact-form', 'Message Sent!', 'Failed to send', (form) => {
        const name = form.querySelector('#contact-name')?.value?.trim() || '';
        const email = form.querySelector('#contact-email')?.value?.trim() || '';
        const subject = form.querySelector('#contact-subject')?.value?.trim() || '';
        const message = form.querySelector('#contact-message')?.value?.trim() || '';

        let waText = `*New Contact Message — SHIVAUMEED-FOUNDATION*\n\n` +
            `*Name:* ${name}\n` +
            `*Email:* ${email}\n`;
        if (subject) {
            waText += `*Subject:* ${subject}\n`;
        }
        waText += `*Message:* ${message}`;

        const waUrl = `https://api.whatsapp.com/send?phone=919203269980&text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank');
    });

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 10;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ---- Lazy image loading with fade-in ----
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';

        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });

    // ---- Gallery Category Filtering & Lightbox Modal ----
    const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    // Category Filtering
    galleryFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            galleryFilterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const filter = btn.dataset.filter;
            galleryItems.forEach(item => {
                const category = item.dataset.category;
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // Lightbox Functionality
    if (lightbox && lightboxImg) {
        let currentVisibleItems = [];
        let currentIndex = -1;

        function updateVisibleList() {
            currentVisibleItems = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
        }

        function openLightbox(index) {
            updateVisibleList();
            if (index < 0 || index >= currentVisibleItems.length) return;
            currentIndex = index;

            const item = currentVisibleItems[currentIndex];
            const img = item.querySelector('img');
            const heading = item.querySelector('figcaption h4')?.textContent || '';
            const desc = item.querySelector('figcaption p')?.textContent || '';
            const tag = item.querySelector('.gallery-tag')?.textContent || '';

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || 'Gallery photo';
            lightboxCaption.innerHTML = `<strong>${heading}</strong>${tag ? ` <span style="opacity:0.7">(${tag})</span>` : ''}<br><span style="font-size:0.85rem;opacity:0.9;">${desc}</span>`;

            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            lightboxImg.src = '';
            document.body.style.overflow = '';
        }

        function showNext() {
            updateVisibleList();
            if (currentVisibleItems.length === 0) return;
            currentIndex = (currentIndex + 1) % currentVisibleItems.length;
            openLightbox(currentIndex);
        }

        function showPrev() {
            updateVisibleList();
            if (currentVisibleItems.length === 0) return;
            currentIndex = (currentIndex - 1 + currentVisibleItems.length) % currentVisibleItems.length;
            openLightbox(currentIndex);
        }

        // Attach click to gallery items
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                updateVisibleList();
                const idx = currentVisibleItems.indexOf(item);
                if (idx !== -1) {
                    openLightbox(idx);
                }
            });
        });

        // Close triggers
        lightbox.querySelectorAll('[data-close-lightbox]').forEach(el => {
            el.addEventListener('click', closeLightbox);
        });

        if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
        if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });
    }

    // ============================================
    // DARK MODE CONTROLLER
    // ============================================
    const themeToggle = document.getElementById('theme-toggle');

    function applyTheme(theme, savePreference = true) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) {
            const isDark = theme === 'dark';
            themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            themeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        if (savePreference) {
            try {
                localStorage.setItem('shiva_theme', theme);
            } catch (e) {}
        }
    }

    // Initialize theme button state
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(currentTheme, false);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme, true);
        });
    }

    // React to system preference changes if user hasn't set explicit preference
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            try {
                if (!localStorage.getItem('shiva_theme')) {
                    applyTheme(e.matches ? 'dark' : 'light', false);
                }
            } catch (err) {}
        });
    }

    // ============================================
    // BACKGROUND MUSIC & SPEAKER MUTE CONTROLLER
    // ============================================
    const bgAudio = document.getElementById('bg-audio');
    const audioToggle = document.getElementById('audio-toggle');
    const audioToast = document.getElementById('audio-toast');
    const audioToastText = document.getElementById('audio-toast-text');
    let toastTimeout = null;

    function showAudioToast(message, duration = 3500) {
        if (!audioToast || !audioToastText) return;
        audioToastText.textContent = message;
        
        const iconSpan = audioToast.querySelector('.audio-toast-icon');
        if (iconSpan) {
            iconSpan.textContent = message.includes('muted') ? '🔇' : '🎵';
        }

        audioToast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            audioToast.classList.remove('show');
        }, duration);
    }

    function updateAudioUI(isPlaying) {
        if (!audioToggle) return;
        if (isPlaying) {
            audioToggle.classList.remove('muted');
            audioToggle.classList.add('playing');
            audioToggle.setAttribute('aria-label', 'Mute background music');
            audioToggle.setAttribute('title', 'Mute background music');
        } else {
            audioToggle.classList.remove('playing');
            audioToggle.classList.add('muted');
            audioToggle.setAttribute('aria-label', 'Play background music');
            audioToggle.setAttribute('title', 'Play background music');
        }
    }

    if (bgAudio && audioToggle) {
        let isUserExplicitlyMuted = false;
        const TARGET_VOLUME = 0.55;

        bgAudio.volume = TARGET_VOLUME;
        bgAudio.muted = false;

        const gestureEvents = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll'];

        function handleFirstInteraction(e) {
            // Ignore if the interaction is on the audio toggle button itself
            if (e && e.target && e.target.closest && e.target.closest('#audio-toggle')) {
                return;
            }

            if (!isUserExplicitlyMuted) {
                bgAudio.muted = false;
                bgAudio.volume = TARGET_VOLUME;
                if (bgAudio.paused) {
                    bgAudio.play().then(() => {
                        updateAudioUI(true);
                        showAudioToast('Ambient background music playing', 3500);
                    }).catch(() => {});
                } else {
                    updateAudioUI(true);
                    showAudioToast('Ambient background music playing', 3500);
                }
            }

            removeInteractionListeners();
        }

        function removeInteractionListeners() {
            gestureEvents.forEach(evt => {
                window.removeEventListener(evt, handleFirstInteraction, { capture: true });
            });
        }

        function addInteractionListeners() {
            gestureEvents.forEach(evt => {
                window.addEventListener(evt, handleFirstInteraction, { capture: true, passive: true });
            });
        }

        // Attempt direct unmuted autoplay on load
        const startPromise = bgAudio.play();
        if (startPromise !== undefined) {
            startPromise.then(() => {
                // Succeeded unmuted!
                bgAudio.muted = false;
                updateAudioUI(true);
                showAudioToast('Ambient background music playing', 3500);
            }).catch(() => {
                // Browser blocked unmuted autoplay -> start muted and listen for first interaction
                bgAudio.muted = true;
                bgAudio.play().then(() => {
                    // Playing muted in background; will unmute on first gesture
                    updateAudioUI(true);
                }).catch(() => {
                    updateAudioUI(false);
                });

                // Listen for first interaction to unmute and play with sound
                addInteractionListeners();
            });
        } else {
            addInteractionListeners();
        }

        // Audio toggle button click listener
        audioToggle.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!bgAudio.paused && !bgAudio.muted) {
                // Mute
                isUserExplicitlyMuted = true;
                bgAudio.pause();
                bgAudio.muted = true;
                updateAudioUI(false);
                showAudioToast('Background music muted', 3000);
            } else {
                // Unmute and Play
                isUserExplicitlyMuted = false;
                bgAudio.muted = false;
                bgAudio.volume = TARGET_VOLUME;
                bgAudio.play().then(() => {
                    updateAudioUI(true);
                    showAudioToast('Ambient background music playing', 3500);
                }).catch((err) => {
                    console.warn('Playback error:', err);
                });
            }
        });
    }

});
