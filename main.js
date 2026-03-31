import * as THREE from 'three';

let scene, camera, renderer, particles;
let animationId;
let isMobile = false;

function checkMobile() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    return isMobile;
}

function init3D() {
    isMobile = checkMobile();
    
    if (isMobile) {
        document.body.style.background = '#05050a';
        return;
    }
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';
    
    const starCount = 200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        starPositions[i*3] = (Math.random() - 0.5) * 200;
        starPositions[i*3+1] = (Math.random() - 0.5) * 100;
        starPositions[i*3+2] = (Math.random() - 0.5) * 80 - 40;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.3 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const radius = 5 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        particlePositions[i*3] = Math.cos(angle) * radius;
        particlePositions[i*3+1] = (Math.random() - 0.5) * 4;
        particlePositions[i*3+2] = Math.sin(angle) * radius;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xa855f7, size: 0.05, transparent: true, opacity: 0.4 });
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        if (particles) particles.rotation.y += 0.002;
        if (stars) stars.rotation.y += 0.0005;
        if (renderer && scene && camera) renderer.render(scene, camera);
    }
    
    animate();
}

function setupCursor() {
    if (isMobile) return;
    
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    if (!cursor || !cursorFollower) return;
    
    // Прямое следование без сглаживания для быстрого курсора
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        cursorFollower.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    });
    
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .hero-link, .nav-link, .back-btn, .contact-card, .modal-close, .footer-link');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = `scale(1.8)`;
            cursor.style.backgroundColor = '#ec4899';
            cursorFollower.style.transform = `scale(1.5)`;
            cursorFollower.style.borderColor = '#ec4899';
            cursorFollower.style.backgroundColor = 'rgba(236, 72, 153, 0.15)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = `scale(1)`;
            cursor.style.backgroundColor = '#a855f7';
            cursorFollower.style.transform = `scale(1)`;
            cursorFollower.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            cursorFollower.style.backgroundColor = 'rgba(168, 85, 247, 0.05)';
        });
    });
}

function setupModal() {
    const modal = document.getElementById('contactModal');
    const openButtons = document.querySelectorAll('#openContactModal, .nav-link[data-link="contacts"]');
    const closeButton = modal?.querySelector('.modal-close');
    
    if (!modal) return;
    
    function openModal(e) {
        if (e) e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    openButtons.forEach(btn => btn.addEventListener('click', openModal));
    if (closeButton) closeButton.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
}

function setupNavigation() {
    const projectsBtn = document.querySelector('.hero-link.projects-btn, .nav-link[data-link="projects"]');
    if (projectsBtn) {
        projectsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function setupHeaderScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const header = document.querySelector('.header');
                if (window.scrollY > 50) header.classList.add('scrolled');
                else header.classList.remove('scrolled');
                ticking = false;
            });
            ticking = true;
        }
    });
}

function setupCardsReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.project-card').forEach(card => observer.observe(card));
}

function handleResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

window.addEventListener('load', () => {
    init3D();
    setupCursor();
    setupModal();
    setupNavigation();
    setupHeaderScroll();
    setupCardsReveal();
    window.addEventListener('resize', handleResize);
});

window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) renderer.dispose();
});