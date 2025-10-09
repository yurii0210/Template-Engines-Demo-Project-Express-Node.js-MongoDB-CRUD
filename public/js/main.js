document.addEventListener('DOMContentLoaded', function() {
    // --- Робота з cookie ---
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const setThemeFromCookie = () => {
        const theme = getCookie('user_theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    };

    // Встановлюємо тему при завантаженні сторінки
    setThemeFromCookie();

    // --- Кнопки зміни теми ---
    const lightThemeBtn = document.querySelector('a[href="/set-theme/light"]');
    const darkThemeBtn = document.querySelector('a[href="/set-theme/dark"]');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    };

    const changeTheme = async (theme) => {
        try {
            await fetch(`/set-theme/${theme}`);
            applyTheme(theme);
            console.log(`Тема змінена на: ${theme}`);
        } catch (err) {
            console.error('Помилка при зміні теми:', err);
        }
    };

    if (lightThemeBtn) {
        lightThemeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            changeTheme('light');
        });
    }

    if (darkThemeBtn) {
        darkThemeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            changeTheme('dark');
        });
    }

    // --- Анімація при скролі ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.feature-card, .tech-item, .article-card, .user-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // --- Логування кліків по кнопках ---
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Клік по кнопці:', this.textContent);
        });
    });
});
