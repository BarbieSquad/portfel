import * as THREE from 'three';

let scene, camera, renderer, particles, stars, mouseX = 0, mouseY = 0;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.003);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';

    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    const particleCount = 4000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 8;
        const radius = 4 + (i / particleCount) * 3;
        const spiralY = Math.sin(angle * 2) * 1.5;
        
        positions[i*3] = Math.cos(angle) * radius;
        positions[i*3+1] = spiralY + (Math.random() - 0.5) * 0.8;
        positions[i*3+2] = Math.sin(angle) * radius;
        
        const color = new THREE.Color().setHSL(0.65 + (i / particleCount) * 0.2, 1, 0.5);
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({ 
        size: 0.08, 
        vertexColors: true, 
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });
    
    particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        starPositions[i*3] = (Math.random() - 0.5) * 200;
        starPositions[i*3+1] = (Math.random() - 0.5) * 100;
        starPositions[i*3+2] = (Math.random() - 0.5) * 80 - 40;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.4 });
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const orbGroup = new THREE.Group();
    const orbCount = 30;
    
    for (let i = 0; i < orbCount; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xa855f7,
            emissive: 0xec4899,
            emissiveIntensity: 0.5
        });
        const orb = new THREE.Mesh(geometry, material);
        
        const radius = 6;
        const angle = (i / orbCount) * Math.PI * 2;
        orb.position.set(Math.cos(angle) * radius, Math.sin(angle * 2) * 2, Math.sin(angle) * radius);
        orb.userData = { angle, radius, speed: 0.5 };
        orbGroup.add(orb);
    }
    scene.add(orbGroup);

    const ringGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(5.5, 0.05, 128, 200);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x6a0dad, emissiveIntensity: 0.3 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    ringGroup.add(ring1);
    
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.z = Math.PI / 3;
    ringGroup.add(ring2);
    
    scene.add(ringGroup);

    const glowCount = 100;
    const glowGeometry = new THREE.BufferGeometry();
    const glowPositions = new Float32Array(glowCount * 3);
    
    for (let i = 0; i < glowCount; i++) {
        glowPositions[i*3] = (Math.random() - 0.5) * 15;
        glowPositions[i*3+1] = (Math.random() - 0.5) * 8;
        glowPositions[i*3+2] = (Math.random() - 0.5) * 15;
    }
    
    glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    const glowMaterial = new THREE.PointsMaterial({ color: 0xff44aa, size: 0.03, blending: THREE.AdditiveBlending });
    const glowPoints = new THREE.Points(glowGeometry, glowMaterial);
    scene.add(glowPoints);

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    });

    if (window.innerWidth > 768) {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        
        if (cursor && cursorFollower) {
            document.addEventListener('mousemove', (e) => {
                cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
                cursorFollower.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
            });
            
            document.querySelectorAll('a, button, .project-card').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursorFollower.style.transform = `scale(1.5)`;
                    cursorFollower.style.borderColor = '#ec4899';
                });
                el.addEventListener('mouseleave', () => {
                    cursorFollower.style.transform = `scale(1)`;
                    cursorFollower.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                });
            });
        }
    }

    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-link');
            
            if (targetId === 'hero') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else if (targetId === 'projects') {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    projectsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    let time = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        
        particles.rotation.y = time * 0.2;
        particles.rotation.x = Math.sin(time * 0.1) * 0.1;
        
        stars.rotation.y += 0.0005;
        stars.rotation.x += 0.0003;
        
        orbGroup.children.forEach((orb, idx) => {
            orb.userData.angle += 0.01;
            const radius = 6;
            const angle = orb.userData.angle;
            orb.position.x = Math.cos(angle) * radius;
            orb.position.z = Math.sin(angle) * radius;
            orb.position.y = Math.sin(angle * 2) * 1.5;
        });
        orbGroup.rotation.y += 0.005;
        
        ringGroup.rotation.y += 0.003;
        ringGroup.rotation.x = Math.sin(time * 0.2) * 0.1;
        
        glowPoints.rotation.y += 0.002;
        glowPoints.rotation.x += 0.001;
        
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
    }
    
    animate();
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
    observer.observe(card);
    card.classList.add('visible'); // сразу показываем
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

window.addEventListener('load', () => {
    init();
    
    setTimeout(() => {
        document.querySelectorAll('.project-card').forEach(card => {
            card.classList.add('visible');
        });
    }, 100);
});