(function () {
    'use strict';

    var root = document.documentElement;
    var themeToggle = document.querySelector('.article-theme-toggle');
    var lightbox = document.getElementById('article-lightbox');
    var lightboxImage = document.getElementById('article-lightbox-image');
    var lightboxCaption = document.getElementById('article-lightbox-caption');

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('shiva_theme', theme);
        } catch (error) {
            // Theme preference is optional when storage is unavailable.
        }
    }

    try {
        var savedTheme = localStorage.getItem('shiva_theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    } catch (error) {
        setTheme('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        if (lightboxImage) lightboxImage.src = '';
    }

    document.querySelectorAll('[data-lightbox-src]').forEach(function (photo) {
        photo.addEventListener('click', function () {
            if (!lightbox || !lightboxImage || !lightboxCaption) return;
            lightboxImage.src = photo.getAttribute('data-lightbox-src');
            lightboxImage.alt = photo.getAttribute('data-lightbox-alt') || 'Outreach photograph';
            lightboxCaption.textContent = lightboxImage.alt;
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
        });
    });

    if (lightbox) {
        lightbox.querySelectorAll('[data-close-article-lightbox]').forEach(function (element) {
            element.addEventListener('click', closeLightbox);
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeLightbox();
    });
}());
