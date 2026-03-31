import * as THREE from 'three';

let scene, camera, renderer;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.01);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x2a2a4a);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(3, 5, 2);
    scene.add(mainLight);
    
    const backLight = new THREE.PointLight(0x8866ff, 0.4);
    backLight.position.set(-2, 1, -3);
    scene.add(backLight);

    // Частицы (звёзды)
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i*3] = (Math.random() - 0.5) * 100;
        positions[i*3+1] = (Math.random() - 0.5) * 60;
        positions[i*3+2] = (Math.random() - 0.5) * 80 - 40;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0003;
        renderer.render(scene, camera);
    }
    animate();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();