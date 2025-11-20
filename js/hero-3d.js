
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Configuration
const PARTICLE_COUNT = 80000; // Optimized for detail and performance
const PARTICLE_SIZE = 0.02; // Visible but not too large
const TRANSITION_DURATION = 3500; // Smooth transitions
const ERA_DURATION = 8000; // Longer viewing time

// State
let currentEraIndex = 0; // Start with Earth
let isTransitioning = false;
let particles;
let renderer, scene, camera;
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
    
    if (!container) {
        console.error('Canvas container not found!');
        return;
    }
    
    console.log('Initializing 3D scene...');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure black background

    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8); // Move camera back further
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    renderer.setClearColor(0x000000, 1); // Black background
    container.appendChild(renderer.domElement);

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
    
    console.log('3D scene initialized successfully');
}

function createParticles() {
    console.log('Creating particles...');
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
    
    console.log('Particles created:', PARTICLE_COUNT);
    console.log('Particle system added to scene');
}

// Shape Generation Functions
function getShapePoints(type) {
    const points = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x, y, z;
        const t = i / PARTICLE_COUNT;
        
        if (type === 'earth') {
            // Realistic Earth with dense continents and empty oceans
            const r = 2.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            // Calculate latitude and longitude
            const lat = (phi - Math.PI / 2) * (180 / Math.PI); // -90 to 90
            const lon = theta * (180 / Math.PI); // 0 to 360
            
            // Define continents with more detailed boundaries
            let isLand = false;
            
            // North America (lon: 220-300, lat: 15-70)
            if (lon >= 220 && lon <= 300 && lat >= 15 && lat <= 70) isLand = true;
            
            // South America (lon: 270-320, lat: -55-15)
            if (lon >= 270 && lon <= 320 && lat >= -55 && lat <= 15) isLand = true;
            
            // Europe (lon: 350-40, lat: 35-70)
            if ((lon >= 350 || lon <= 40) && lat >= 35 && lat <= 70) isLand = true;
            
            // Africa (lon: 340-50, lat: -35-35)
            if ((lon >= 340 || lon <= 50) && lat >= -35 && lat <= 35) isLand = true;
            
            // Asia (lon: 40-150, lat: 0-75)
            if (lon >= 40 && lon <= 150 && lat >= 0 && lat <= 75) isLand = true;
            
            // Australia (lon: 110-155, lat: -45--10)
            if (lon >= 110 && lon <= 155 && lat >= -45 && lat <= -10) isLand = true;
            
            // Antarctica (all longitudes, lat: <-60)
            if (lat < -60) isLand = true;
            
            // Only render particles on land (dense continents)
            if (isLand) {
                // Dense packing for land - use more particles
                if (Math.random() > 0.15) { // 85% fill rate for dense continents
                    x = r * Math.sin(phi) * Math.cos(theta);
                    y = r * Math.sin(phi) * Math.sin(theta);
                    z = r * Math.cos(phi);
                } else {
                    // Hide this particle
                    x = y = z = 0;
                    x = -1000; // Far away
                }
            } else {
                // Ocean - no dots at all
                x = y = z = 0;
                x = -1000; // Hide far away
            }
            
            // Few stars in deep space
            if (t > 0.95 && Math.random() > 0.7) {
                const starR = 6 + Math.random() * 2;
                const starTheta = Math.random() * Math.PI * 2;
                const starPhi = Math.random() * Math.PI;
                x = starR * Math.sin(starPhi) * Math.cos(starTheta);
                y = starR * Math.sin(starPhi) * Math.sin(starTheta);
                z = starR * Math.cos(starPhi);
            }
        } 
        else if (type === 'sickle') {
            // Tilted sickle with realistic curved blade and wooden handle
            const tiltAngle = Math.PI / 6; // 30 degree tilt
            
            if (t < 0.7) {
                // Sharp crescent blade
                const bladeT = t / 0.7;
                const curveAngle = bladeT * Math.PI * 1.3 + Math.PI * 0.2;
                const radius = 2.6 - Math.sin(curveAngle * 0.6) * 0.4;
                const bladeThickness = 0.12 * (1 - bladeT * 0.6);
                
                const baseX = Math.cos(curveAngle) * radius;
                const baseY = Math.sin(curveAngle) * radius;
                
                // Apply tilt rotation
                x = baseX * Math.cos(tiltAngle) - baseY * Math.sin(tiltAngle);
                y = baseX * Math.sin(tiltAngle) + baseY * Math.cos(tiltAngle);
                z = (Math.random() - 0.5) * bladeThickness;
            } else {
                // Wooden handle with texture
                const handleT = (i - PARTICLE_COUNT * 0.7) / (PARTICLE_COUNT * 0.3);
                const handleR = 0.18 + Math.sin(handleT * Math.PI * 8) * 0.03;
                const angle = Math.random() * Math.PI * 2;
                
                const baseX = -0.3 + Math.cos(angle) * handleR;
                const baseY = -1.8 - handleT * 2.3;
                
                // Apply tilt rotation
                x = baseX * Math.cos(tiltAngle) - baseY * Math.sin(tiltAngle);
                y = baseX * Math.sin(tiltAngle) + baseY * Math.cos(tiltAngle);
                z = Math.sin(angle) * handleR;
            }
        }
        else if (type === 'cart') {
            // Single large wooden wagon wheel with spokes (front view)
            const wheelR = 2.8; // Large wheel
            const hubR = 0.4; // Center hub
            const spokeCount = 12;
            
            if (t < 0.75) {
                // Outer rim (wooden circle)
                const rimT = t / 0.75;
                const angle = rimT * Math.PI * 2;
                const rimThickness = 0.15;
                
                x = Math.cos(angle) * (wheelR + (Math.random() - 0.5) * rimThickness);
                y = Math.sin(angle) * (wheelR + (Math.random() - 0.5) * rimThickness);
                z = (Math.random() - 0.5) * 0.25;
            } else if (t < 0.85) {
                // Spokes radiating from center
                const spokeT = (i - PARTICLE_COUNT * 0.75) / (PARTICLE_COUNT * 0.1);
                const spokeIndex = Math.floor(spokeT * spokeCount);
                const spokeAngle = (spokeIndex / spokeCount) * Math.PI * 2;
                const spokeLength = spokeT * (wheelR - hubR) + hubR;
                const spokeThickness = 0.08;
                
                x = Math.cos(spokeAngle) * spokeLength + (Math.random() - 0.5) * spokeThickness;
                y = Math.sin(spokeAngle) * spokeLength + (Math.random() - 0.5) * spokeThickness;
                z = (Math.random() - 0.5) * 0.15;
            } else {
                // Central hub
                const hubT = (i - PARTICLE_COUNT * 0.85) / (PARTICLE_COUNT * 0.15);
                const hubAngle = hubT * Math.PI * 2;
                const hubDist = Math.random() * hubR;
                
                x = Math.cos(hubAngle) * hubDist;
                y = Math.sin(hubAngle) * hubDist;
                z = (Math.random() - 0.5) * 0.3;
            }
        }
        else if (type === 'locomotive') {
            // Vintage steam locomotive based on reference image
            if (t < 0.15) {
                // Large drive wheels (3 pairs, visible from side)
                const wheelPair = Math.floor(t / 0.05);
                const wheelT = (t % 0.05) / 0.05;
                const angle = wheelT * Math.PI * 2;
                const wheelR = 0.65;
                const xPos = -1.5 + wheelPair * 1.2;
                
                x = xPos + (Math.random() - 0.5) * 0.1;
                y = -1.85 + Math.sin(angle) * wheelR;
                z = (Math.random() > 0.5 ? 0.9 : -0.9) + (Math.random() - 0.5) * 0.12;
            } else if (t < 0.5) {
                // Horizontal cylindrical boiler (main body)
                const boilerT = (t - 0.15) / 0.35;
                const angle = Math.random() * Math.PI * 2;
                const boilerR = 0.95;
                const length = (boilerT - 0.5) * 5.5;
                
                x = length;
                y = Math.sin(angle) * boilerR - 0.15;
                z = Math.cos(angle) * boilerR;
            } else if (t < 0.62) {
                // Funnel smokestack at front
                const stackT = (t - 0.5) / 0.12;
                const angle = Math.random() * Math.PI * 2;
                const stackR = 0.38 - stackT * 0.06;
                
                x = 2.2 + Math.cos(angle) * stackR;
                y = 1.1 + stackT * 1.6;
                z = Math.sin(angle) * stackR;
            } else if (t < 0.7) {
                // Dome on top of boiler
                const domeT = (t - 0.62) / 0.08;
                const angle = Math.random() * Math.PI * 2;
                const domeR = 0.45;
                
                x = 0.5 + Math.cos(angle) * domeR;
                y = 1.0 + domeT * 0.8;
                z = Math.sin(angle) * domeR;
            } else {
                // Cab at rear
                const cabT = (t - 0.7) / 0.3;
                x = -3.0 + (Math.random() - 0.5) * 1.3;
                y = (Math.random() - 0.5) * 1.6 + 0.2;
                z = (Math.random() - 0.5) * 1.8;
            }
        }
        else if (type === 'lightbulb') {
            // Classic lightbulb with warm glowing filament
            if (t < 0.6) {
                // Glass envelope (pear-shaped bulb)
                const u = Math.random();
                const v = Math.random() * 0.82;
                const theta = 2 * Math.PI * u;
                const phi = Math.PI * v;
                const r = 1.65 + Math.sin(phi) * 0.15; // Slight pear shape
                
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta) + 0.8;
                z = r * Math.cos(phi);
            } else if (t < 0.7) {
                // Glowing filament (visible zigzag pattern)
                const filamentT = (i - PARTICLE_COUNT * 0.6) / (PARTICLE_COUNT * 0.1);
                const turns = 10;
                const spiralAngle = filamentT * Math.PI * turns;
                const spiralR = 0.22 + Math.sin(filamentT * Math.PI * 6) * 0.06;
                
                x = Math.cos(spiralAngle) * spiralR;
                y = filamentT * 1.8 - 0.2;
                z = Math.sin(spiralAngle) * spiralR;
            } else if (t < 0.75) {
                // Support wires
                const wireT = (i - PARTICLE_COUNT * 0.7) / (PARTICLE_COUNT * 0.05);
                const side = Math.random() > 0.5 ? 1 : -1;
                x = side * 0.12;
                y = wireT * 2.2 - 0.4;
                z = (Math.random() - 0.5) * 0.08;
            } else {
                // Metal screw base
                const baseT = (i - PARTICLE_COUNT * 0.75) / (PARTICLE_COUNT * 0.25);
                const threadAngle = baseT * Math.PI * 12;
                const baseR = 0.62 - baseT * 0.08;
                
                x = Math.cos(threadAngle) * baseR;
                y = -1.65 - baseT * 1.15;
                z = Math.sin(threadAngle) * baseR;
            }
        }
        else if (type === 'computer') {
            // Classic desktop computer setup
            if (t < 0.5) {
                // CRT/LCD Monitor with slight curve
                const monitorT = t / 0.5;
                const screenDepth = Math.abs((monitorT - 0.5) * 2); // Curved screen
                
                x = (Math.random() - 0.5) * 4.2;
                y = (Math.random() - 0.5) * 2.6 + 0.9;
                z = -0.3 + screenDepth * 0.2;
            } else if (t < 0.75) {
                // Keyboard (flat, rectangular)
                const keyT = (i - PARTICLE_COUNT * 0.5) / (PARTICLE_COUNT * 0.25);
                
                x = (Math.random() - 0.5) * 4.0;
                y = -1.65 + (Math.random() - 0.5) * 0.12;
                z = 1.6 + (Math.random() - 0.5) * 1.0;
            } else if (t < 0.88) {
                // Tower case (vertical rectangular box)
                const towerT = (i - PARTICLE_COUNT * 0.75) / (PARTICLE_COUNT * 0.13);
                
                x = -2.6 + (Math.random() - 0.5) * 0.8;
                y = (Math.random() - 0.5) * 2.3;
                z = 1.0 + (Math.random() - 0.5) * 1.0;
            } else {
                // Mouse
                const mouseT = (i - PARTICLE_COUNT * 0.88) / (PARTICLE_COUNT * 0.12);
                const mouseAngle = mouseT * Math.PI * 2;
                
                x = 2.3 + Math.cos(mouseAngle) * 0.35;
                y = -1.65;
                z = 1.9 + Math.sin(mouseAngle) * 0.25;
            }
        }
        else if (type === 'face') {
            // Realistic dotted portrait (side profile, looking left)
            // Based on halftone portrait art style
            
            // Create side profile of face
            const profileT = t;
            
            if (profileT < 0.65) {
                // Main face contour (side view - profile)
                const faceU = Math.random();
                const faceV = Math.random();
                
                // Y position (vertical - forehead to chin)
                const yPos = (faceV - 0.5) * 3.2;
                
                // X position (depth of face - nose, cheeks, forehead)
                // Create realistic profile curve
                let faceDepth;
                if (yPos > 1.2) {
                    // Forehead - slopes back
                    faceDepth = 0.8 - (yPos - 1.2) * 0.5;
                } else if (yPos > 0.3) {
                    // Upper face - relatively flat
                    faceDepth = 1.0 - Math.abs(yPos - 0.8) * 0.2;
                } else if (yPos > -0.5) {
                    // Nose area - protrudes forward
                    faceDepth = 1.3 - Math.abs(yPos - 0.1) * 0.4;
                } else if (yPos > -1.2) {
                    // Mouth and chin
                    faceDepth = 0.9 - Math.abs(yPos + 0.8) * 0.3;
                } else {
                    // Lower chin - recedes
                    faceDepth = 0.5 - (Math.abs(yPos) - 1.2) * 0.4;
                }
                
                // Width (slight thickness for 3D effect)
                const faceWidth = (faceU - 0.5) * 1.6;
                
                x = faceDepth + (Math.random() - 0.5) * 0.2;
                y = yPos;
                z = faceWidth;
            }
            // Eyes (detailed dots)
            else if (profileT < 0.72) {
                const eyeT = (i - PARTICLE_COUNT * 0.65) / (PARTICLE_COUNT * 0.07);
                const eyeAngle = eyeT * Math.PI * 2;
                const eyeR = 0.22;
                
                x = 1.1 + Math.cos(eyeAngle) * eyeR * 0.6;
                y = 0.7 + Math.sin(eyeAngle) * eyeR;
                z = (Math.random() - 0.5) * 0.15;
            }
            // Nose definition
            else if (profileT < 0.78) {
                const noseT = (i - PARTICLE_COUNT * 0.72) / (PARTICLE_COUNT * 0.06);
                
                x = 1.3 + (Math.random() - 0.5) * 0.2;
                y = 0.1 - noseT * 0.6;
                z = (Math.random() - 0.5) * 0.25;
            }
            // Lips
            else if (profileT < 0.85) {
                const lipT = (i - PARTICLE_COUNT * 0.78) / (PARTICLE_COUNT * 0.07);
                const lipCurve = Math.sin(lipT * Math.PI);
                
                x = 1.0 + lipCurve * 0.3;
                y = -0.6 + (lipT - 0.5) * 0.3;
                z = (Math.random() - 0.5) * 0.2;
            }
            // Hair flowing back
            else {
                const hairT = (i - PARTICLE_COUNT * 0.85) / (PARTICLE_COUNT * 0.15);
                const hairFlow = Math.sin(hairT * Math.PI * 2) * 0.4;
                
                x = 0.5 - hairT * 1.5 + hairFlow;
                y = 1.4 - hairT * 0.8;
                z = (Math.random() - 0.5) * 1.0;
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
