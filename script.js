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
            '.donate-content, .gallery-item, .mission-item, .cert-card, .identity-card'
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

        let waText = `*New Volunteer Application — SHIVAUMEED- FOUNDATION*\n\n` +
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

        let waText = `*New Contact Message — SHIVAUMEED- FOUNDATION*\n\n` +
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
    const galleryEventCards = document.querySelectorAll('.gallery-event-card');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    function loadGalleryItem(item) {
        const img = item.querySelector('img');
        if (img && img.dataset.src && !img.getAttribute('src')) {
            img.src = img.dataset.src;
        }
    }

    function applyGalleryFilter(filter) {
        galleryFilterBtns.forEach(b => {
            b.classList.toggle('active', b.dataset.filter === filter);
            b.setAttribute('aria-selected', b.dataset.filter === filter ? 'true' : 'false');
        });

        galleryEventCards.forEach(card => {
            card.classList.toggle('hidden', filter !== 'all');
        });

        galleryItems.forEach(item => {
            const isVisible = filter !== 'all' && item.dataset.category === filter;
            item.classList.toggle('hidden', !isVisible);
            if (isVisible) {
                loadGalleryItem(item);
            }
        });
    }

    // Category Filtering
    galleryFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            galleryFilterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            applyGalleryFilter(btn.dataset.filter);
        });
    });

    galleryEventCards.forEach(card => {
        const openCategory = () => {
            const categoryBtn = Array.from(galleryFilterBtns).find(btn => btn.dataset.filter === card.dataset.eventCategory);
            if (categoryBtn) categoryBtn.click();
        };
        card.addEventListener('click', openCategory);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCategory();
            }
        });
    });

    applyGalleryFilter('all');

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
            } catch (e) { }
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
            } catch (err) { }
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
        const TARGET_VOLUME = 0.55;

        bgAudio.volume = TARGET_VOLUME;
        bgAudio.muted = true;
        updateAudioUI(false);

        // Audio toggle button click listener
        audioToggle.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!bgAudio.paused && !bgAudio.muted) {
                // Mute
                bgAudio.pause();
                bgAudio.muted = true;
                updateAudioUI(false);
                showAudioToast('Background music muted', 3000);
            } else {
                // Unmute and Play
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

    // ============================================
    // CERTIFICATIONS & VIEW-ONLY PDF MODAL
    // ============================================
    const certificatesData = [
        {
            title: "Certificate of Incorporation",
            subtitle: "Ministry of Corporate Affairs · CIN: U88900MP2026NPL087595",
            pdf: "Certifications/CERTIFICATE OF INCORPORATION SHIVAUMEED- FOUNDATION.pdf",
            image: "Certifications Thumbnails/CERTIFICATE OF INCORPORATION SHIVAUMEED- FOUNDATION.png"
        },
        {
            title: "Section 8 Non-Profit Licence",
            subtitle: "Government of India · Section 8(1) of Companies Act, 2013",
            pdf: "Certifications/Lisence SHIVAUMEED- FOUNDATION.pdf",
            image: "Certifications Thumbnails/Lisence SHIVAUMEED- FOUNDATION.png"
        },
        {
            title: "12A Registration Certificate",
            subtitle: "Income Tax Department, Govt. of India · URN: ABVCS3577RE20261",
            pdf: "Certifications/12A SHIVAUMEED- FOUNDATION.pdf",
            image: "Certifications Thumbnails/12A SHIVAUMEED- FOUNDATION.png"
        },
        {
            title: "80G Tax Exemption Certificate",
            subtitle: "Income Tax Department, Govt. of India · URN: ABVCS3577RF20261",
            pdf: "Certifications/80G SHIVAUMEED- FOUNDATION.pdf",
            image: "Certifications Thumbnails/80G SHIVAUMEED- FOUNDATION.png"
        },
        {
            title: "CSR Registration Certificate (Form CSR-1)",
            subtitle: "Ministry of Corporate Affairs · Eligible for CSR Initiatives",
            pdf: "Certifications/CSR Registration Certificate SHIVAUMEED- FOUNDATION.pdf",
            image: "Certifications Thumbnails/CSR Registration Certificate SHIVAUMEED- FOUNDATION.png"
        },
        {
            title: "NGO Darpan Registration Certificate",
            subtitle: "NITI Aayog, Government of India · DARPAN ID: MP/2026/1251149",
            pdf: "Certifications/SHIVAUMEED-_FOUNDATION Darpan Registration Certificate.pdf",
            image: "Certifications Thumbnails/SHIVAUMEED-_FOUNDATION Darpan Registration Certificate_Page_1.png"
        },
        {
            title: "E-Anudaan Registration Certificate",
            subtitle: "Ministry of Social Justice & Empowerment, Govt. of India · ANUDAAN ID: MP/000044574",
            pdf: "Certifications/E-Anudaan Certificate - SHIVAUMEED- FOUNDATION.pdf",
            image: "Certifications Thumbnails/E-Anudaan Certificate - SHIVAUMEED- FOUNDATION.png"
        },
        {
            title: "ISO 9001:2015 Quality Management System Certificate",
            subtitle: "International QMS Standard · Certificate No: 1024Q672626",
            pdf: "Certifications/SHIVAUMEED- FOUNDATION ISO Quality Management System Certificate.pdf",
            image: "Certifications Thumbnails/SHIVAUMEED- FOUNDATION ISO Quality Management System Certificate.png"
        }
    ];

    const certCards = document.querySelectorAll('.cert-card');
    const certModal = document.getElementById('cert-pdf-modal');
    const certPdfIframe = document.getElementById('cert-pdf-iframe');
    const certModalImg = document.getElementById('cert-modal-img');
    const certModalTitle = document.getElementById('cert-modal-title');
    const certModalSubtitle = document.getElementById('cert-modal-subtitle');
    const certModalNewTab = document.getElementById('cert-modal-newtab');
    const certCounterCurrent = document.getElementById('cert-counter-current');
    const certCounterTotal = document.getElementById('cert-counter-total');
    const certModalPrev = document.getElementById('cert-modal-prev');
    const certModalNext = document.getElementById('cert-modal-next');
    const certModePdfBtn = document.getElementById('cert-mode-pdf');
    const certModeImgBtn = document.getElementById('cert-mode-img');
    const certFrameWrapper = document.getElementById('cert-frame-wrapper');
    const certImgWrapper = document.getElementById('cert-img-wrapper');
    const certFallbackLink = document.getElementById('cert-fallback-link');

    let currentCertIndex = 0;
    let currentCertMode = 'pdf'; // 'pdf' or 'img'

    if (certCounterTotal) {
        certCounterTotal.textContent = certificatesData.length;
    }

    function setCertViewMode(mode) {
        currentCertMode = mode;
        if (mode === 'pdf') {
            certModePdfBtn?.classList.add('active');
            certModeImgBtn?.classList.remove('active');
            certFrameWrapper?.classList.remove('hidden');
            certImgWrapper?.classList.add('hidden');
        } else {
            certModeImgBtn?.classList.add('active');
            certModePdfBtn?.classList.remove('active');
            certImgWrapper?.classList.remove('hidden');
            certFrameWrapper?.classList.add('hidden');
        }
    }

    if (certModePdfBtn) {
        certModePdfBtn.addEventListener('click', () => setCertViewMode('pdf'));
    }
    if (certModeImgBtn) {
        certModeImgBtn.addEventListener('click', () => setCertViewMode('img'));
    }

    function openCertModal(index) {
        if (!certModal) return;
        currentCertIndex = (index >= 0 && index < certificatesData.length) ? index : 0;
        const cert = certificatesData[currentCertIndex];

        if (certModalTitle) certModalTitle.textContent = cert.title;
        if (certModalSubtitle) certModalSubtitle.textContent = cert.subtitle;
        if (certCounterCurrent) certCounterCurrent.textContent = currentCertIndex + 1;

        // View-only PDF URL: toolbar=0&navpanes=0&scrollbar=1
        const encodedPdfUrl = encodeURI(cert.pdf);
        const viewOnlyUrl = encodedPdfUrl + '#toolbar=0&navpanes=0&scrollbar=1';

        if (certPdfIframe) {
            certPdfIframe.src = viewOnlyUrl;
        }
        if (certFallbackLink) {
            certFallbackLink.href = encodedPdfUrl;
        }
        if (certModalNewTab) {
            certModalNewTab.href = encodedPdfUrl;
        }
        if (certModalImg) {
            certModalImg.src = encodeURI(cert.image);
            certModalImg.alt = cert.title;
        }

        // Default to PDF mode
        setCertViewMode('pdf');

        certModal.classList.add('active');
        certModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeCertModal() {
        if (!certModal) return;
        certModal.classList.remove('active');
        certModal.setAttribute('aria-hidden', 'true');
        if (certPdfIframe) certPdfIframe.src = '';
        if (certModalImg) certModalImg.src = '';
        document.body.style.overflow = '';
    }

    function showPrevCert() {
        let newIndex = currentCertIndex - 1;
        if (newIndex < 0) newIndex = certificatesData.length - 1;
        openCertModal(newIndex);
    }

    function showNextCert() {
        let newIndex = currentCertIndex + 1;
        if (newIndex >= certificatesData.length) newIndex = 0;
        openCertModal(newIndex);
    }

    // Attach click to cert cards
    certCards.forEach((card, idx) => {
        card.addEventListener('click', () => openCertModal(idx));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCertModal(idx);
            }
        });
    });

    // Close buttons & backdrop
    certModal?.querySelectorAll('[data-close-cert-modal]').forEach(el => {
        el.addEventListener('click', closeCertModal);
    });

    if (certModalPrev) certModalPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevCert(); });
    if (certModalNext) certModalNext.addEventListener('click', (e) => { e.stopPropagation(); showNextCert(); });

    // Keyboard navigation for cert modal
    document.addEventListener('keydown', (e) => {
        if (!certModal || !certModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeCertModal();
        if (e.key === 'ArrowRight') showNextCert();
        if (e.key === 'ArrowLeft') showPrevCert();
    });

    // Copy to clipboard for CIN / DARPAN ID
    const copyBtns = document.querySelectorAll('.identity-copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            const statusEl = btn.querySelector('.copy-status');
            const originalText = statusEl ? statusEl.textContent : 'Copy';

            function onSuccess() {
                btn.classList.add('copied');
                if (statusEl) statusEl.textContent = 'Copied!';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (statusEl) statusEl.textContent = originalText;
                }, 2000);
            }

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(onSuccess).catch(() => {
                    fallbackCopyText(textToCopy, onSuccess);
                });
            } else {
                fallbackCopyText(textToCopy, onSuccess);
            }
        });
    });

    function fallbackCopyText(text, callback) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            if (callback) callback();
        } catch (err) {
            console.error('Copy fallback failed:', err);
        }
        document.body.removeChild(textArea);
    }

    // ============================================
    // DONATE WIDGET — Amount + Gateway + QR
    // ============================================
    (function() {
        var presetBtns = document.querySelectorAll('.donate-preset-btn');
        var amountInput = document.getElementById('donate-amount-input');
        var gatewayBtns = document.querySelectorAll('.donate-gateway-btn');
        var generateBtn = document.getElementById('donate-generate-btn');
        var resultPanel = document.getElementById('donate-result-panel');
        var qrBox = document.getElementById('donate-qr-box');
        var displayAmount = document.getElementById('donate-display-amount');
        var resultTitle = document.getElementById('donate-result-title');
        var copyBtns = document.querySelectorAll('.donate-copy-btn');

        var selectedAmount = 0;
        var selectedGateway = '';

        // Canara Bank Account details & Official Merchant UPI ID (from official Canara Bank MQR)
        var ACCOUNT_NO = '120042804190';
        var IFSC_CODE = 'CNRB0007483';
        var PAYEE_NAME = 'SHIVAUMEED- FOUNDATION';
        // Official Canara Bank Merchant UPI ID: cnb.419020266206@cnrb
        var MERCHANT_UPI_VPA = 'cnb.419020266206@cnrb';
        var BANK_TRANSFER_VPA = MERCHANT_UPI_VPA;

        function buildUpiUrl(amount) {
            var params = new URLSearchParams({
                pa: MERCHANT_UPI_VPA,
                pn: PAYEE_NAME,
                cu: 'INR',
                tn: 'Donation to ShivaUmeed Foundation'
            });
            if (amount && amount > 0) {
                params.set('am', amount);
            }
            return 'upi://pay?' + params.toString();
        }

        function getGatewayDeepLink(amount, gateway) {
            var upiUrl = buildUpiUrl(amount);
            switch(gateway) {
                case 'gpay':
                    return 'tez://upi/pay?' + new URLSearchParams({
                        pa: MERCHANT_UPI_VPA, pn: PAYEE_NAME, am: amount, cu: 'INR',
                        tn: 'Donation to ShivaUmeed Foundation'
                    }).toString();
                case 'phonepe':
                    return 'phonepe://' + encodeURIComponent(upiUrl);
                case 'paytm':
                    return upiUrl;
                case 'bhim':
                    return 'upi://pay?' + new URLSearchParams({
                        pa: MERCHANT_UPI_VPA, pn: PAYEE_NAME, am: amount, cu: 'INR',
                        tn: 'Donation to ShivaUmeed Foundation'
                    }).toString();
                case 'amazonpay':
                    return 'amazonpay://upi/pay?' + new URLSearchParams({
                        pa: MERCHANT_UPI_VPA, pn: PAYEE_NAME, am: amount, cu: 'INR',
                        tn: 'Donation to ShivaUmeed Foundation'
                    }).toString();
                case 'supermoney':
                    return 'supermoney://upi/pay?' + new URLSearchParams({
                        pa: MERCHANT_UPI_VPA, pn: PAYEE_NAME, am: amount, cu: 'INR',
                        tn: 'Donation to ShivaUmeed Foundation'
                    }).toString();
                case 'paypal':
                    return 'https://www.paypal.com/donate?business=shivaumeedfoundation%40gmail.com&item_name=Donation+to+ShivaUmeed+Foundation&currency_code=INR&amount=' + amount;
                default:
                    return upiUrl;
            }
        }

        // Generate QR code using QR Server API (no library needed)
        function renderQR(upiUrl) {
            qrBox.innerHTML = '';
            var encoded = encodeURIComponent(upiUrl);
            var img = document.createElement('img');
            img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=138x138&data=' + encoded;
            img.alt = 'Scan to pay via UPI';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            qrBox.appendChild(img);
        }

        presetBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                presetBtns.forEach(function(b) { b.classList.remove('selected'); });
                btn.classList.add('selected');
                selectedAmount = parseInt(btn.dataset.amount);
                if (amountInput) amountInput.value = '';
            });
        });

        if (amountInput) {
            amountInput.addEventListener('input', function() {
                presetBtns.forEach(function(b) { b.classList.remove('selected'); });
                selectedAmount = parseInt(amountInput.value) || 0;
            });
        }

        gatewayBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                gatewayBtns.forEach(function(b) { b.classList.remove('selected'); });
                btn.classList.add('selected');
                selectedGateway = btn.dataset.gateway;
            });
        });

        var upiLinkBtn = document.getElementById('donate-upi-link');
        var copyUpiBtn = document.getElementById('donate-copy-upi-btn');
        var qrActions = document.getElementById('donate-qr-actions');

        if (generateBtn) {
            generateBtn.addEventListener('click', function() {
                // Validate amount
                var amt = selectedAmount;
                if (!amt && amountInput) amt = parseInt(amountInput.value) || 0;
                if (!amt || amt < 1) {
                    alert('Please select or enter a donation amount first.');
                    if (amountInput) amountInput.focus();
                    return;
                }

                // Format display
                var formatted = '₹' + amt.toLocaleString('en-IN');
                if (displayAmount) displayAmount.textContent = formatted;

                var gateway = selectedGateway || 'upi';
                var title = '';
                if (gateway === 'paypal') {
                    title = 'PayPal Payment · ' + formatted;
                } else if (gateway === 'netbanking') {
                    title = 'Bank Transfer Details · ' + formatted;
                } else {
                    title = 'Direct Bank Transfer via UPI · ' + formatted;
                }
                if (resultTitle) resultTitle.textContent = title;

                // Handle PayPal
                if (gateway === 'paypal') {
                    var paypalUrl = 'https://www.paypal.com/donate?business=shivaumeedfoundation%40gmail.com&item_name=Donation+to+ShivaUmeed+Foundation&currency_code=INR&amount=' + amt;
                    renderQR(paypalUrl);
                    if (qrActions) qrActions.style.display = 'flex';
                    if (upiLinkBtn) {
                        upiLinkBtn.href = paypalUrl;
                        upiLinkBtn.textContent = '⚡ Pay via PayPal';
                    }
                    if (copyUpiBtn) {
                        copyUpiBtn.setAttribute('data-copy', paypalUrl);
                        copyUpiBtn.textContent = '📋 Copy PayPal Link';
                    }
                } else if (gateway !== 'netbanking') {
                    // Generate UPI URL & QR (NPCI Account+IFSC direct bank transfer)
                    var standardUpiUrl = buildUpiUrl(amt);
                    var appDeepLink = getGatewayDeepLink(amt, gateway);
                    renderQR(standardUpiUrl);

                    if (qrActions) qrActions.style.display = 'flex';
                    if (upiLinkBtn) {
                        upiLinkBtn.href = appDeepLink;
                        var appName = gateway === 'gpay' ? 'Google Pay' :
                                      gateway === 'phonepe' ? 'PhonePe' :
                                      gateway === 'paytm' ? 'Paytm' :
                                      gateway === 'bhim' ? 'BHIM UPI' :
                                      gateway === 'amazonpay' ? 'Amazon Pay' :
                                      gateway === 'supermoney' ? 'super.money' : 'UPI App';
                        upiLinkBtn.textContent = '⚡ Pay via ' + appName;
                    }
                    if (copyUpiBtn) {
                        copyUpiBtn.setAttribute('data-copy', standardUpiUrl);
                        copyUpiBtn.textContent = '📋 Copy Payment Link';
                    }
                } else {
                    // For net banking show just bank details with amount in QR
                    var bankQrData = 'Pay ₹' + amt + ' to Account 120042804190, IFSC CNRB0007483, Canara Bank, SHIVAUMEED- FOUNDATION';
                    renderQR(bankQrData);
                    if (qrActions) qrActions.style.display = 'none';
                }

                // Show panel
                if (resultPanel) {
                    resultPanel.hidden = false;
                    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }

        // Copy buttons
        document.querySelectorAll('.donate-copy-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var text = btn.getAttribute('data-copy');
                if (!text) return;
                var orig = btn.textContent;
                navigator.clipboard.writeText(text).then(function() {
                    btn.textContent = 'Copied!';
                    setTimeout(function() { btn.textContent = orig; }, 2000);
                }).catch(function() {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    btn.textContent = 'Copied!';
                    setTimeout(function() { btn.textContent = orig; }, 2000);
                });
            });
        });
    })();

});
