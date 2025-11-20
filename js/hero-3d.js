
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Configuration
const PARTICLE_COUNT = 60000; // High detail for clear shapes
const PARTICLE_SIZE = 0.025; // Smaller for density
const TRANSITION_DURATION = 3000; // Slower transitions
const ERA_DURATION = 6000; // Time between auto-transitions (longer to view)

// State
let currentEraIndex = 0;
let isTransitioning = false;
let particles;
let renderer, scene, camera;
let eraStartTime = 0;
let transitionStartTime = 0;

// Eras Definition
const ERAS = [
    { name: "THE BEGINNING", caption: "Our Planet Earth", color: 0x4caf50, type: 'earth' },
    { name: "AGRARIAN ERA", caption: "Farming & Harvest", color: 0xffd700, type: 'sickle' },
    { name: "AGE OF TRANSPORT", caption: "Horse-Drawn Commerce", color: 0x8d6e63, type: 'cart' },
    { name: "INDUSTRIAL AGE", caption: "Steam & Railways", color: 0x607d8b, type: 'locomotive' },
    { name: "ELECTRIC ERA", caption: "Power & Light", color: 0xffeb3b, type: 'lightbulb' },
    { name: "DIGITAL AGE", caption: "Computing & Information", color: 0x00e5ff, type: 'computer' },
    { name: "HUMANITY", caption: "The Human Spirit", color: 0xffccbc, type: 'face' }
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
            // Sphere with continents and stars around it
            if (t < 0.8) {
                // Main sphere (Earth)
                const r = 2.5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            } else {
                // Orbiting particles (stars/planets)
                const orbitR = 4 + Math.random() * 2;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                x = orbitR * Math.sin(phi) * Math.cos(theta);
                y = orbitR * Math.sin(phi) * Math.sin(theta);
                z = orbitR * Math.cos(phi);
            }
        } 
        else if (type === 'sickle') {
            // Curved blade with distinct handle
            if (t < 0.75) {
                // Crescent blade
                const angle = t * Math.PI * 1.3;
                const radius = 2.5 - Math.sin(angle) * 0.3;
                const thickness = (Math.random() - 0.5) * 0.3;
                x = Math.cos(angle) * radius + thickness;
                y = Math.sin(angle) * radius + thickness;
                z = (Math.random() - 0.5) * 0.2;
            } else {
                // Straight handle
                const handleT = (i - PARTICLE_COUNT * 0.75) / (PARTICLE_COUNT * 0.25);
                x = -0.3 + (Math.random() - 0.5) * 0.3;
                y = -1.8 - handleT * 1.5;
                z = (Math.random() - 0.5) * 0.2;
            }
        }
        else if (type === 'cart') {
            // Cart with 4 distinct wheels
            const wheelCount = 4;
            const wheelParticles = PARTICLE_COUNT * 0.25;
            
            if (i < wheelParticles) {
                // 4 wheels (front-left, front-right, back-left, back-right)
                const wheelIndex = Math.floor((i / wheelParticles) * wheelCount);
                const wheelR = 0.6;
                const angle = Math.random() * Math.PI * 2;
                
                const xPos = wheelIndex % 2 === 0 ? -1.5 : 1.5; // left or right
                const zPos = wheelIndex < 2 ? 1.2 : -1.2; // front or back
                
                x = xPos + (Math.random() - 0.5) * 0.15;
                y = -1.5 + Math.sin(angle) * wheelR;
                z = zPos + Math.cos(angle) * wheelR;
            } else {
                // Cart body (rectangular box)
                x = (Math.random() - 0.5) * 3.5;
                y = (Math.random() - 0.5) * 1.2 - 0.3;
                z = (Math.random() - 0.5) * 2.5;
            }
        }
        else if (type === 'locomotive') {
            // Detailed train with wheels, boiler, smokestack, cab
            if (t < 0.15) {
                // Multiple wheels along the bottom
                const wheelR = 0.5;
                const angle = Math.random() * Math.PI * 2;
                x = (Math.random() - 0.5) * 5;
                y = -1.8 + Math.sin(angle) * wheelR;
                z = (Math.random() > 0.5 ? 0.9 : -0.9) + (Math.random() - 0.5) * 0.2;
            } else if (t < 0.5) {
                // Cylindrical boiler (main body)
                const angle = Math.random() * Math.PI * 2;
                const cylR = 0.9;
                const length = (Math.random() - 0.5) * 4;
                x = length;
                y = Math.sin(angle) * cylR;
                z = Math.cos(angle) * cylR;
            } else if (t < 0.65) {
                // Smokestack (vertical cylinder)
                const angle = Math.random() * Math.PI * 2;
                const stackR = 0.4;
                x = 1.5 + Math.cos(angle) * stackR;
                y = 1.0 + Math.random() * 1.5;
                z = Math.sin(angle) * stackR;
            } else {
                // Cab (engineer's compartment at back)
                x = -2.5 + (Math.random() - 0.5) * 1.2;
                y = (Math.random() - 0.5) * 1.5 + 0.3;
                z = (Math.random() - 0.5) * 1.8;
            }
        }
        else if (type === 'lightbulb') {
            // Classic lightbulb with filament inside
            if (t < 0.6) {
                // Glass bulb (rounded top)
                const u = Math.random();
                const v = Math.random() * 0.85; // Upper hemisphere mostly
                const theta = 2 * Math.PI * u;
                const phi = Math.PI * v;
                const r = 1.6;
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta) + 0.8;
                z = r * Math.cos(phi);
            } else if (t < 0.75) {
                // Filament inside (spiral/zigzag)
                const spiralT = (i - PARTICLE_COUNT * 0.6) / (PARTICLE_COUNT * 0.15);
                const angle = spiralT * Math.PI * 8;
                x = Math.cos(angle) * 0.3;
                y = spiralT * 1.5 - 0.2;
                z = Math.sin(angle) * 0.3;
            } else {
                // Screw base (threaded bottom)
                const angle = Math.random() * Math.PI * 2;
                const baseT = (i - PARTICLE_COUNT * 0.75) / (PARTICLE_COUNT * 0.25);
                const baseR = 0.7 - baseT * 0.1;
                x = Math.cos(angle) * baseR;
                y = -1.5 - baseT * 1.0;
                z = Math.sin(angle) * baseR;
            }
        }
        else if (type === 'computer') {
            // Desktop computer: monitor, keyboard, tower
            if (t < 0.5) {
                // Monitor screen (flat rectangle)
                x = (Math.random() - 0.5) * 4;
                y = (Math.random() - 0.5) * 2.5 + 0.8;
                z = -0.1 + (Math.random() - 0.5) * 0.2;
            } else if (t < 0.75) {
                // Keyboard (flat horizontal rectangle)
                x = (Math.random() - 0.5) * 4;
                y = -1.6 + (Math.random() - 0.5) * 0.2;
                z = 1.5 + (Math.random() - 0.5) * 1.0;
            } else {
                // Computer tower (vertical box on side)
                x = -2.5 + (Math.random() - 0.5) * 0.8;
                y = (Math.random() - 0.5) * 2.0;
                z = 1.0 + (Math.random() - 0.5) * 1.0;
            }
        }
        else if (type === 'face') {
            // Human face (egg-shaped with features)
            const u = Math.random();
            const v = Math.random();
            const theta = Math.PI * u * 2;
            const phi = Math.PI * v;
            
            // Egg shape (ellipsoid - taller than wide)
            const rx = 1.3; // width
            const ry = 1.8; // height
            const rz = 1.0; // depth
            
            x = rx * Math.sin(phi) * Math.cos(theta);
            y = ry * Math.cos(phi);
            z = rz * Math.sin(phi) * Math.sin(theta);
            
            // Add facial features with concentrated particles
            if (t < 0.05) {
                // Left eye
                x = -0.5 + (Math.random() - 0.5) * 0.3;
                y = 0.5 + (Math.random() - 0.5) * 0.2;
                z = 1.1 + (Math.random() - 0.5) * 0.2;
            } else if (t < 0.1) {
                // Right eye
                x = 0.5 + (Math.random() - 0.5) * 0.3;
                y = 0.5 + (Math.random() - 0.5) * 0.2;
                z = 1.1 + (Math.random() - 0.5) * 0.2;
            } else if (t < 0.15) {
                // Mouth (smile curve)
                const mouthT = (i - PARTICLE_COUNT * 0.1) / (PARTICLE_COUNT * 0.05);
                const mouthAngle = (mouthT - 0.5) * Math.PI * 0.6;
                x = Math.sin(mouthAngle) * 0.8;
                y = -0.5 - Math.cos(mouthAngle) * 0.2;
                z = 1.0;
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
    
    // Update caption
    updateCaption(era.name, era.caption);
    
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

function updateCaption(title, subtitle) {
    const captionEl = document.getElementById('scene-caption');
    if (captionEl) {
        const titleEl = captionEl.querySelector('.caption-title');
        const subtitleEl = captionEl.querySelector('.caption-subtitle');
        
        // Fade out
        captionEl.style.opacity = '0';
        
        setTimeout(() => {
            titleEl.textContent = title;
            subtitleEl.textContent = subtitle;
            // Fade in
            captionEl.style.opacity = '1';
        }, 300);
    }
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
