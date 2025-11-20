
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Configuration
const PARTICLE_COUNT = 25000; // Increased for better detail
const PARTICLE_SIZE = 0.035; // Adjusted for density
const TRANSITION_DURATION = 3000; // Slower transitions
const ERA_DURATION = 5000; // Time between auto-transitions

// State
let currentEraIndex = 0;
let isTransitioning = false;
let particles;
let renderer, scene, camera;
let eraStartTime = 0;
let transitionStartTime = 0;

// Eras Definition
const ERAS = [
    { name: "EARTH", color: 0x4caf50, type: 'earth' }, // Green/Blue mix handled in shader/generation
    { name: "AGRARIAN", color: 0xffd700, type: 'sickle' }, // Gold
    { name: "TRANSPORT", color: 0x8d6e63, type: 'cart' }, // Wood/Brown
    { name: "INDUSTRIAL", color: 0x607d8b, type: 'locomotive' }, // Steel Blue
    { name: "ELECTRICITY", color: 0xffff00, type: 'lightbulb' }, // Bright Yellow
    { name: "DIGITAL", color: 0x00e5ff, type: 'computer' }, // Cyan
    { name: "HUMANITY", color: 0xffccbc, type: 'face' } // Skin tone
];

// Initialize
function init() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(0x000000, 0.02); // Removed fog for vivid colors

    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 6;
    camera.position.y = 0;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Particles
    createParticles();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);

    // Start Loop
    animate();
    
    // Start Auto-Transition
    eraStartTime = Date.now();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);

    // Initial Positions (Earth)
    const earthPoints = getShapePoints('earth');
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = earthPoints[i * 3];
        positions[i * 3 + 1] = earthPoints[i * 3 + 1];
        positions[i * 3 + 2] = earthPoints[i * 3 + 2];
        
        targetPositions[i * 3] = positions[i * 3];
        targetPositions[i * 3 + 1] = positions[i * 3 + 1];
        targetPositions[i * 3 + 2] = positions[i * 3 + 2];

        // Initial Colors (Earth-like) - More variety
        const color = new THREE.Color();
        const rand = Math.random();
        if (rand > 0.7) color.setHex(0x2196f3); // Ocean Blue
        else if (rand > 0.5) color.setHex(0x4caf50); // Land Green
        else if (rand > 0.3) color.setHex(0x1976d2); // Deep Ocean
        else color.setHex(0x81c784); // Light Green
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));

    // Material for Vivid Dots
    const material = new THREE.PointsMaterial({
        size: PARTICLE_SIZE,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 1.0 // Full opacity for vivid colors
    });

    particles = new THREE.Points(geometry, material);
    particles.userData = { targetColor: null }; // Initialize userData
    scene.add(particles);
}

// Shape Generation Functions
function getShapePoints(type) {
    const points = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x, y, z;
        const t = i / PARTICLE_COUNT;
        
        if (type === 'earth') {
            const r = 2.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        } 
        else if (type === 'sickle') {
            // Crescent shape
            const angle = t * Math.PI * 1.5; // 270 degrees
            const radius = 2 + Math.cos(angle) * 0.5;
            x = Math.cos(angle) * radius;
            y = Math.sin(angle) * radius;
            z = (Math.random() - 0.5) * 0.5;
            
            // Handle
            if (i > PARTICLE_COUNT * 0.8) {
                x = 0 + (Math.random() - 0.5) * 0.5;
                y = -2 - Math.random() * 2;
                z = (Math.random() - 0.5) * 0.5;
            }
        }
        else if (type === 'cart') {
            // Simple cart
            if (t < 0.3) { // Wheels
                const wheelR = 0.8;
                const wAngle = Math.random() * Math.PI * 2;
                // Two wheels
                const isLeft = Math.random() > 0.5;
                x = (isLeft ? 1.5 : -1.5) + Math.cos(wAngle) * wheelR * 0.1; // Thickness
                y = -1.5 + Math.sin(wAngle) * wheelR;
                z = (isLeft ? 1 : -1) + (Math.random() - 0.5) * 0.2;
                // Swap axes to make wheels face correct way
                const temp = x; x = z; z = temp;
                x = (isLeft ? 1.5 : -1.5);
            } else { // Body
                x = (Math.random() - 0.5) * 3;
                y = (Math.random() - 0.5) * 1.0 - 0.5;
                z = (Math.random() - 0.5) * 2;
            }
        }
        else if (type === 'locomotive') {
            // Steam engine shape
            if (t < 0.2) { // Wheels
                x = (Math.random() - 0.5) * 4;
                y = -1.5;
                z = (Math.random() > 0.5 ? 0.8 : -0.8);
            } else if (t < 0.6) { // Boiler
                const cylAngle = Math.random() * Math.PI * 2;
                const cylR = 0.8;
                x = (Math.random() - 0.5) * 3;
                y = Math.sin(cylAngle) * cylR;
                z = Math.cos(cylAngle) * cylR;
            } else { // Cab
                x = -1.5 + (Math.random() - 0.5);
                y = 0.5 + (Math.random() - 0.5) * 2;
                z = (Math.random() - 0.5) * 2;
            }
        }
        else if (type === 'lightbulb') {
            // Bulb shape
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.PI * v;
            
            // Sphere top
            if (v < 0.7) {
                const r = 1.5;
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta) + 0.5;
                z = r * Math.cos(phi);
            } else {
                // Base
                x = 0.8 * Math.cos(theta) * (1-v);
                y = -1.5 + v; 
                z = 0.8 * Math.sin(theta) * (1-v);
            }
            
            // Filament (Electricity effect)
            if (i % 20 === 0) {
                x = (Math.random() - 0.5) * 0.5;
                y = 0.5 + (Math.random() - 0.5) * 0.5;
                z = (Math.random() - 0.5) * 0.5;
            }
        }
        else if (type === 'computer') {
            // Monitor and keyboard
            if (t < 0.7) { // Screen
                x = (Math.random() - 0.5) * 4;
                y = (Math.random() - 0.5) * 2.5 + 0.5;
                z = 0;
            } else { // Keyboard
                x = (Math.random() - 0.5) * 4;
                y = -1.5;
                z = 1 + (Math.random() - 0.5) * 1.5;
            }
        }
        else if (type === 'face') {
            // Approximate face shape (Ellipsoid looking left)
            const u = Math.random() * Math.PI;
            const v = Math.random() * Math.PI * 2;
            
            // Rotate to look left (towards text)
            x = -1.5 * Math.cos(u) * Math.sin(v) - 1; // Shift left
            y = 2 * Math.cos(v);
            z = 1.5 * Math.sin(u) * Math.sin(v);
            
            // Eyes
            if (i % 100 === 0) {
                // Left eye area
                if (x < -1.5 && y > 0.5 && z > 0.5) {
                    // Keep
                }
            }
        }

        points.push(x, y, z);
    }
    return points;
}

function nextEra() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    currentEraIndex = (currentEraIndex + 1) % ERAS.length;
    const era = ERAS[currentEraIndex];
    
    // Generate Target Points
    const targetPoints = getShapePoints(era.type);
    const attr = particles.geometry.attributes.targetPosition;
    
    for(let i=0; i < PARTICLE_COUNT; i++) {
        attr.setXYZ(i, targetPoints[i*3], targetPoints[i*3+1], targetPoints[i*3+2]);
    }
    attr.needsUpdate = true;

    // Transition Colors
    const targetColor = new THREE.Color(era.color);
    particles.userData.targetColor = targetColor;

    transitionStartTime = Date.now();
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now();
    
    // Auto-Transition Logic
    if (!isTransitioning && time - eraStartTime > ERA_DURATION) {
        nextEra();
        eraStartTime = time;
    }

    // Particle Morphing Logic
    if (isTransitioning) {
        const progress = Math.min((time - transitionStartTime) / TRANSITION_DURATION, 1);
        // const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        
        const positions = particles.geometry.attributes.position;
        const targets = particles.geometry.attributes.targetPosition;
        const colors = particles.geometry.attributes.color;
        const targetColor = particles.userData.targetColor;
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const cx = positions.getX(i);
            const cy = positions.getY(i);
            const cz = positions.getZ(i);
            
            const tx = targets.getX(i);
            const ty = targets.getY(i);
            const tz = targets.getZ(i);
            
            // Smooth lerp
            positions.setXYZ(i, 
                cx + (tx - cx) * 0.03,
                cy + (ty - cy) * 0.03,
                cz + (tz - cz) * 0.03
            );

            // Color lerp
            if (targetColor) {
                const r = colors.getX(i);
                const g = colors.getY(i);
                const b = colors.getZ(i);
                
                colors.setXYZ(i,
                    r + (targetColor.r - r) * 0.02,
                    g + (targetColor.g - g) * 0.02,
                    b + (targetColor.b - b) * 0.02
                );
            }
        }
        positions.needsUpdate = true;
        colors.needsUpdate = true;
        
        if (progress >= 1) {
            isTransitioning = false;
            eraStartTime = time; // Reset auto-timer
        }
    }

    // Gentle Rotation
    particles.rotation.y += 0.002;
    
    // Electricity Effect for Lightbulb Era
    if (ERAS[currentEraIndex].type === 'lightbulb' && !isTransitioning) {
        const positions = particles.geometry.attributes.position;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (i % 50 === 0) {
                positions.setY(i, positions.getY(i) + (Math.random() - 0.5) * 0.1);
            }
        }
        positions.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Start
init();
