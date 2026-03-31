import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, model;

// Определяем проект по URL
const projectId = window.location.pathname.match(/project(\d)\.html/)?.[1] || '1';

// Настройки для каждого проекта
const projectConfig = {
    1: {
        title: 'Космическая колонизация',
        desc: '3D сцена с анимацией планет и частиц',
        tech: ['Three.js', 'Blender'],
        modelPath: './models/123.glb', // замените на вашу модель
        bgColor: 0x0a0a2a,
        cameraPos: { x: 3, y: 2, z: 5 }
    },
    2: {
        title: 'Интерактивный шоурум',
        desc: 'Виртуальная галерея с возможностью вращать объекты',
        tech: ['WebGL', 'GSAP'],
        modelPath: './models/showroom.glb',
        bgColor: 0x1a0a2a,
        cameraPos: { x: 4, y: 2, z: 4 }
    },
    3: {
        title: 'Нейро-арт инсталляция',
        desc: 'Генеративная графика с использованием AI',
        tech: ['WebGPU', 'ML'],
        modelPath: './models/neural-art.glb',
        bgColor: 0x0a1a2a,
        cameraPos: { x: 2, y: 3, z: 6 }
    }
};

const config = projectConfig[projectId] || projectConfig[1];

// Обновляем информацию на странице
document.getElementById('projectTitle').textContent = config.title;
document.getElementById('projectDesc').textContent = config.desc;
const techContainer = document.getElementById('projectTech');
techContainer.innerHTML = config.tech.map(t => `<span>${t}</span>`).join('');

// Инициализация 3D сцены
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.bgColor);
    scene.fog = new THREE.FogExp2(config.bgColor, 0.02);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(config.cameraPos.x, config.cameraPos.y, config.cameraPos.z);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Орбит контрол - можно крутить модель
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.2;
    controls.rotateSpeed = 1.0;
    controls.target.set(0, 0.5, 0);

    // Освещение
    setupLights();
    
    // Загружаем модель или создаём демо-объект
    loadModel();
    
    // Добавляем частицы для атмосферы
    createParticles();
    
    animate();
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(3, 5, 2);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.5);
    fillLight.position.set(-2, 1, -3);
    scene.add(fillLight);
    
    const backLight = new THREE.PointLight(0xff66cc, 0.4);
    backLight.position.set(1, 2, 2);
    scene.add(backLight);
    
    const rimLight = new THREE.PointLight(0x44aaff, 0.3);
    rimLight.position.set(0, 1, -3);
    scene.add(rimLight);
}

function createParticles() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i*3] = (Math.random() - 0.5) * 50;
        positions[i*3+1] = (Math.random() - 0.5) * 30;
        positions[i*3+2] = (Math.random() - 0.5) * 50 - 20;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.05, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    function animateParticles() {
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0003;
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

function loadModel() {
    const loader = new GLTFLoader();
    
    loader.load(config.modelPath, 
        (gltf) => {
            model = gltf.scene;
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            model.position.set(0, -0.5, 0);
            model.scale.set(1, 1, 1);
            scene.add(model);
            console.log('✅ Модель загружена');
        },
        (xhr) => {
            console.log(`📦 Загрузка: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
        },
        (error) => {
            console.error('❌ Ошибка загрузки модели:', error);
            createFallbackModel();
        }
    );
}

function createFallbackModel() {
    // Создаём красивый объект если модель не найдена
    const geometry = new THREE.TorusKnotGeometry(0.8, 0.2, 128, 32, 3, 4);
    const material = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x3b0764,
        emissiveIntensity: 0.3
    });
    model = new THREE.Mesh(geometry, material);
    model.position.set(0, 0, 0);
    model.castShadow = true;
    scene.add(model);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();

