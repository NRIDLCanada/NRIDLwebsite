
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Configuration
const PARTICLE_COUNT = 300000; // Ultra-high detail for artistic clarity
const PARTICLE_SIZE = 0.015; // Very small for high density
const TRANSITION_DURATION = 3500; // Smooth transitions
const ERA_DURATION = 8000; // Longer viewing time

// State
let currentEraIndex = 0;
let isTransitioning = false;
let particles;
let renderer, scene, camera, controls;
let eraStartTime = 0;
let transitionStartTime = 0;
let sceneLines = []; // Store line geometries for each scene

// Eras Definition
const ERAS = [
    { name: "THE BEGINNING", caption: "Our Planet Earth", color: 0xcccccc, type: 'earth' },
    { name: "AGRARIAN ERA", caption: "Farming & Harvest", color: 0xaaaaaa, type: 'sickle' },
    { name: "AGE OF TRANSPORT", caption: "Horse-Drawn Commerce", color: 0x999999, type: 'cart' },
    { name: "INDUSTRIAL AGE", caption: "Steam & Railways", color: 0x888888, type: 'locomotive' },
    { name: "ELECTRIC ERA", caption: "Power & Light", color: 0xbbbbbb, type: 'lightbulb' },
    { name: "DIGITAL AGE", caption: "Computing & Information", color: 0xdddddd, type: 'computer' },
    { name: "HUMANITY", caption: "The Human Spirit", color: 0xe0e0e0, type: 'face' }
];

// Initialize
function init() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure black background

    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 6;
    camera.position.y = 0;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1); // Black background
    container.appendChild(renderer.domElement);

    // Orbit Controls for rotation
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 4;
    controls.maxDistance = 12;
    controls.autoRotate = false;
    controls.rotateSpeed = 0.5;

    // Particles
    createParticles();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    
    // Scene selector interaction
    const sceneDots = document.querySelectorAll('.scene-dot');
    sceneDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const sceneIndex = parseInt(dot.getAttribute('data-scene'));
            jumpToScene(sceneIndex);
        });
    });

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

        // Initial Colors (Earth-like) - Grayscale with variation
        const color = new THREE.Color();
        const rand = Math.random();
        if (rand > 0.7) color.setHex(0x666666); // Dark gray (oceans)
        else if (rand > 0.5) color.setHex(0xcccccc); // Light gray (land)
        else if (rand > 0.3) color.setHex(0x555555); // Darker (deep ocean)
        else color.setHex(0xdddddd); // Lighter (ice/clouds)
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));

    // Material for Grayscale Dots
    const material = new THREE.PointsMaterial({
        size: PARTICLE_SIZE,
        vertexColors: true,
        blending: THREE.NormalBlending, // Normal blending for grayscale
        depthTest: true,
        transparent: false,
        opacity: 1.0
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
            // Realistic Earth with continents visible
            if (t < 0.88) {
                // Main sphere with continent mapping
                const r = 2.5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
                
                // Create continent-like patterns (simplified landmass distribution)
                // Using spherical coordinates to create recognizable land patterns
                const lat = phi - Math.PI / 2; // -PI/2 to PI/2
                const lon = theta; // 0 to 2PI
                
                // Simplified continent logic:
                // Africa/Europe (lon: 0-1, lat: -0.5 to 0.8)
                // Asia (lon: 1.5-4, lat: 0 to 1.2)
                // Americas (lon: 4-6, lat: -1 to 1)
                // Antarctica (lat < -1.2)
                
                const isLand = 
                    (lon > 0 && lon < 1.2 && lat > -0.6 && lat < 0.9) || // Africa/Europe
                    (lon > 1.8 && lon < 4.2 && lat > 0.1 && lat < 1.3) || // Asia
                    (lon > 4.0 && lon < 6.0 && lat > -1.0 && lat < 1.1) || // Americas
                    (lat < -1.3); // Antarctica
                    
                // Adjust surface slightly outward for land (creates relief)
                if (isLand && Math.random() > 0.3) {
                    const landR = r + 0.02;
                    x = landR * Math.sin(phi) * Math.cos(theta);
                    y = landR * Math.sin(phi) * Math.sin(theta);
                    z = landR * Math.cos(phi);
                }
            } else {
                // Few shooting stars in the background
                const starIndex = i - Math.floor(PARTICLE_COUNT * 0.88);
                const totalStars = Math.floor(PARTICLE_COUNT * 0.12);
                
                if (starIndex % 100 < 5) { // Only 5% are actual stars
                    const starR = 6 + Math.random() * 2;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI;
                    x = starR * Math.sin(phi) * Math.cos(theta);
                    y = starR * Math.sin(phi) * Math.sin(theta);
                    z = starR * Math.cos(phi);
                } else {
                    // Hide excess particles far away
                    x = 0;
                    y = 0;
                    z = -100;
                }
            }
        } 
        else if (type === 'sickle') {
            // Artistic sickle with sharp blade and textured handle
            if (t < 0.7) {
                // Sharp crescent blade with tapering
                const bladeT = t / 0.7;
                const angle = bladeT * Math.PI * 1.4 + Math.PI * 0.1;
                const radius = 2.8 - Math.sin(angle * 0.5) * 0.4;
                const bladeThickness = 0.08 * (1 - bladeT * 0.7); // Thinner towards tip
                const depthVar = (Math.random() - 0.5) * bladeThickness;
                x = Math.cos(angle) * radius + depthVar;
                y = Math.sin(angle) * radius + depthVar;
                z = (Math.random() - 0.5) * 0.15;
            } else {
                // Wooden handle with texture
                const handleT = (i - PARTICLE_COUNT * 0.7) / (PARTICLE_COUNT * 0.3);
                const handleR = 0.15 + Math.sin(handleT * Math.PI * 6) * 0.03; // Textured grip
                const angle = Math.random() * Math.PI * 2;
                x = -0.2 + Math.cos(angle) * handleR;
                y = -1.6 - handleT * 2.2;
                z = Math.sin(angle) * handleR;
            }
        }
        else if (type === 'cart') {
            // Artistic horse-drawn cart with 4 detailed wheels and wooden body
            const wheelParticles = PARTICLE_COUNT * 0.2;
            
            if (i < wheelParticles) {
                // 4 wooden spoked wheels
                const wheelIndex = Math.floor((i / wheelParticles) * 4);
                const wheelT = (i % (wheelParticles / 4)) / (wheelParticles / 4);
                const wheelR = 0.7;
                const angle = wheelT * Math.PI * 2;
                
                const xPos = wheelIndex % 2 === 0 ? -1.8 : 1.8; // left or right
                const zPos = wheelIndex < 2 ? 1.5 : -1.5; // front or back
                
                // Wheel rim
                if (wheelT < 0.85) {
                    x = xPos + (Math.random() - 0.5) * 0.12;
                    y = -1.6 + Math.sin(angle) * wheelR;
                    z = zPos + Math.cos(angle) * wheelR;
                } else {
                    // Spokes
                    const spokeR = wheelT * wheelR;
                    x = xPos;
                    y = -1.6 + Math.sin(angle) * spokeR;
                    z = zPos + Math.cos(angle) * spokeR;
                }
            } else if (t < 0.7) {
                // Cart bed (wooden planks)
                const plankT = (i - wheelParticles) / (PARTICLE_COUNT * 0.5);
                x = (Math.random() - 0.5) * 3.8;
                y = -0.5 + (Math.random() - 0.5) * 0.4;
                z = (Math.random() - 0.5) * 3.0;
            } else {
                // Cart sides (rails)
                const sideT = (i - PARTICLE_COUNT * 0.7) / (PARTICLE_COUNT * 0.3);
                const isLeftSide = sideT < 0.5;
                const railZ = isLeftSide ? -1.5 : 1.5;
                x = (Math.random() - 0.5) * 3.8;
                y = -0.2 + (Math.random() - 0.5) * 0.8;
                z = railZ + (Math.random() - 0.5) * 0.2;
            }
        }
        else if (type === 'locomotive') {
            // Detailed steam locomotive with wheels, boiler, smokestack, and smoke
            if (t < 0.12) {
                // Multiple large drive wheels (6 wheels total)
                const wheelIndex = Math.floor(t / 0.02);
                const wheelT = (t % 0.02) / 0.02;
                const wheelR = 0.6;
                const angle = wheelT * Math.PI * 2;
                const xPos = -2.5 + wheelIndex * 1.0;
                
                x = xPos;
                y = -1.9 + Math.sin(angle) * wheelR;
                z = (Math.random() > 0.5 ? 1.0 : -1.0) + (Math.random() - 0.5) * 0.15;
            } else if (t < 0.45) {
                // Cylindrical boiler (main body) with rivets
                const boilerT = (t - 0.12) / 0.33;
                const angle = Math.random() * Math.PI * 2;
                const cylR = 1.0;
                const length = (boilerT - 0.5) * 5;
                x = length;
                y = Math.sin(angle) * cylR - 0.2;
                z = Math.cos(angle) * cylR;
            } else if (t < 0.6) {
                // Tall smokestack
                const stackT = (t - 0.45) / 0.15;
                const angle = Math.random() * Math.PI * 2;
                const stackR = 0.35 - stackT * 0.05; // Tapered
                x = 1.8 + Math.cos(angle) * stackR;
                y = 1.2 + stackT * 1.8;
                z = Math.sin(angle) * stackR;
            } else if (t < 0.75) {
                // Smoke/steam rising from stack
                const smokeT = (t - 0.6) / 0.15;
                const puff = Math.sin(smokeT * Math.PI * 3) * 0.5;
                x = 1.8 + (Math.random() - 0.5) * (smokeT * 2);
                y = 3.0 + smokeT * 2.5;
                z = (Math.random() - 0.5) * (smokeT * 2);
            } else {
                // Cab (engineer's compartment)
                const cabT = (t - 0.75) / 0.25;
                x = -2.8 + (Math.random() - 0.5) * 1.4;
                y = (Math.random() - 0.5) * 1.8;
                z = (Math.random() - 0.5) * 2.0;
            }
        }
        else if (type === 'lightbulb') {
            // Classic Edison bulb with detailed filament and glow
            if (t < 0.55) {
                // Glass bulb envelope (smooth sphere)
                const u = Math.random();
                const v = Math.random() * 0.8; // Upper portion
                const theta = 2 * Math.PI * u;
                const phi = Math.PI * v;
                const r = 1.7;
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta) + 0.9;
                z = r * Math.cos(phi);
            } else if (t < 0.68) {
                // Detailed spiral filament (glowing core)
                const filamentT = (i - PARTICLE_COUNT * 0.55) / (PARTICLE_COUNT * 0.13);
                const spiralAngle = filamentT * Math.PI * 12; // Multiple turns
                const spiralR = 0.25 + Math.sin(filamentT * Math.PI * 4) * 0.08;
                x = Math.cos(spiralAngle) * spiralR;
                y = filamentT * 2.0 - 0.3;
                z = Math.sin(spiralAngle) * spiralR;
            } else if (t < 0.73) {
                // Filament support wires
                const wireT = (i - PARTICLE_COUNT * 0.68) / (PARTICLE_COUNT * 0.05);
                const wireSide = Math.random() > 0.5 ? 1 : -1;
                x = wireSide * 0.15;
                y = wireT * 2.5 - 0.5;
                z = 0;
            } else {
                // Threaded metal base (screw threads visible)
                const baseT = (i - PARTICLE_COUNT * 0.73) / (PARTICLE_COUNT * 0.27);
                const threadAngle = baseT * Math.PI * 10; // Thread spirals
                const baseR = 0.65 - baseT * 0.08;
                x = Math.cos(threadAngle) * baseR;
                y = -1.7 - baseT * 1.2;
                z = Math.sin(threadAngle) * baseR;
            }
        }
        else if (type === 'computer') {
            // Modern desktop computer setup with monitor, keyboard, and tower
            if (t < 0.45) {
                // Widescreen monitor (with bezel and screen content)
                const screenT = t / 0.45;
                x = (Math.random() - 0.5) * 4.5;
                y = (Math.random() - 0.5) * 2.8 + 1.0;
                z = -0.2 + (Math.random() - 0.5) * 0.3;
                
                // Add visible pixels/content pattern
                if (screenT > 0.1 && screenT < 0.9) {
                    const gridPattern = (Math.floor(x * 5) + Math.floor(y * 5)) % 2;
                    z += gridPattern * 0.1;
                }
            } else if (t < 0.7) {
                // Keyboard with visible keys
                const keyT = (i - PARTICLE_COUNT * 0.45) / (PARTICLE_COUNT * 0.25);
                const keyRow = Math.floor(keyT * 5);
                const keyCol = (keyT * 5 - keyRow) * 15;
                
                x = (keyCol - 7.5) * 0.3;
                y = -1.7 + (Math.random() - 0.5) * 0.15;
                z = 1.8 + keyRow * 0.2 + (Math.random() - 0.5) * 0.1;
            } else if (t < 0.85) {
                // Computer tower (vertical case with ventilation)
                const towerT = (i - PARTICLE_COUNT * 0.7) / (PARTICLE_COUNT * 0.15);
                x = -2.8 + (Math.random() - 0.5) * 0.9;
                y = (Math.random() - 0.5) * 2.5;
                z = 1.2 + (Math.random() - 0.5) * 1.2;
                
                // Ventilation holes pattern
                if (Math.random() > 0.7) {
                    x -= 0.5;
                }
            } else {
                // Mouse and cables
                const accessoryT = (i - PARTICLE_COUNT * 0.85) / (PARTICLE_COUNT * 0.15);
                if (accessoryT < 0.5) {
                    // Mouse
                    const mouseAngle = accessoryT * Math.PI * 4;
                    x = 2.5 + Math.cos(mouseAngle) * 0.4;
                    y = -1.7;
                    z = 2.0 + Math.sin(mouseAngle) * 0.3;
                } else {
                    // Cables
                    const cableT = (accessoryT - 0.5) * 2;
                    x = -2.5 + cableT * 3;
                    y = -1.8 + Math.sin(cableT * Math.PI * 2) * 0.3;
                    z = 0.5 + (Math.random() - 0.5) * 0.2;
                }
            }
        }
        else if (type === 'face') {
            // Realistic human face with detailed features (inspired by dotted portrait art)
            
            // Base face structure
            if (t < 0.6) {
                // Face contour - using 2D projection for realistic portrait
                const faceU = Math.random();
                const faceV = Math.random();
                
                // Map to face shape (narrower at top and bottom)
                const yPos = (faceV - 0.5) * 3.5; // Vertical position
                const faceWidth = 1.2 - Math.abs(yPos) * 0.15; // Narrower at chin and forehead
                const xPos = (faceU - 0.5) * faceWidth * 2;
                
                x = xPos;
                y = yPos;
                z = 0.3 + (Math.random() - 0.5) * 0.4; // Slight depth variation
            }
            // Left eye - detailed
            else if (t < 0.68) {
                const eyeT = (i - PARTICLE_COUNT * 0.6) / (PARTICLE_COUNT * 0.08);
                const eyeAngle = eyeT * Math.PI * 2;
                const eyeR = 0.25 + (Math.random() - 0.5) * 0.08;
                x = -0.5 + Math.cos(eyeAngle) * eyeR;
                y = 0.8 + Math.sin(eyeAngle) * eyeR * 0.7;
                z = 0.8 + (Math.random() - 0.5) * 0.2;
            }
            // Right eye - detailed
            else if (t < 0.76) {
                const eyeT = (i - PARTICLE_COUNT * 0.68) / (PARTICLE_COUNT * 0.08);
                const eyeAngle = eyeT * Math.PI * 2;
                const eyeR = 0.25 + (Math.random() - 0.5) * 0.08;
                x = 0.5 + Math.cos(eyeAngle) * eyeR;
                y = 0.8 + Math.sin(eyeAngle) * eyeR * 0.7;
                z = 0.8 + (Math.random() - 0.5) * 0.2;
            }
            // Nose bridge and definition
            else if (t < 0.82) {
                const noseT = (i - PARTICLE_COUNT * 0.76) / (PARTICLE_COUNT * 0.06);
                x = (Math.random() - 0.5) * 0.3;
                y = 0.6 - noseT * 1.0;
                z = 0.9 + noseT * 0.4;
            }
            // Lips - upper and lower
            else if (t < 0.9) {
                const lipT = (i - PARTICLE_COUNT * 0.82) / (PARTICLE_COUNT * 0.08);
                const lipAngle = (lipT - 0.5) * Math.PI;
                const lipR = 0.6 * Math.sin(lipAngle * 0.5);
                x = Math.sin(lipAngle) * lipR;
                y = -0.7 + (lipT < 0.5 ? 0.15 : -0.1); // Upper lip slightly above lower
                z = 0.7 + Math.cos(lipAngle) * 0.2;
            }
            // Hair strands on sides
            else {
                const hairSide = Math.random() > 0.5 ? 1 : -1;
                const hairT = (i - PARTICLE_COUNT * 0.9) / (PARTICLE_COUNT * 0.1);
                const hairFlow = Math.sin(hairT * Math.PI * 2) * 0.3;
                x = hairSide * (1.3 + hairT * 0.8);
                y = 1.5 - hairT * 3.5 + hairFlow;
                z = -0.5 + (Math.random() - 0.5) * 0.3;
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
    
    // Update active dot
    document.querySelectorAll('.scene-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentEraIndex);
    });
}

function jumpToScene(sceneIndex) {
    if (isTransitioning || sceneIndex === currentEraIndex) return;
    
    currentEraIndex = sceneIndex;
    const era = ERAS[currentEraIndex];
    
    // Update caption
    updateCaption(era.name, era.caption);
    
    // Reset auto-timer
    eraStartTime = Date.now();
    
    // Trigger transition
    isTransitioning = true;
    const targetPoints = getShapePoints(era.type);
    const attr = particles.geometry.attributes.targetPosition;
    
    for(let i=0; i < PARTICLE_COUNT; i++) {
        attr.setXYZ(i, targetPoints[i*3], targetPoints[i*3+1], targetPoints[i*3+2]);
    }
    attr.needsUpdate = true;

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
    
    // Update controls
    if (controls) {
        controls.update();
    }
    
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
