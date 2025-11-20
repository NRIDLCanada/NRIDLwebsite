
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Configuration
const PARTICLE_COUNT = 20000;
const PARTICLE_SIZE = 0.05;
const TRANSITION_DURATION = 2000; // ms

// State
let currentEraIndex = 0;
let isTransitioning = false;
let particles;
let sunMoon;
let renderer, scene, camera;
let clock = new THREE.Clock();
let frameCount = 0;
let lastTime = 0;

// Eras Definition
const ERAS = [
    { name: "GENESIS", color: 0xffffff, sunColor: 0xffaa00, type: 'random' },
    { name: "AGRARIAN", color: 0x4caf50, sunColor: 0xffd700, type: 'plow' },
    { name: "MARITIME", color: 0x2196f3, sunColor: 0xe0e0e0, type: 'ship' }, // Moon
    { name: "INDUSTRIAL", color: 0xff5722, sunColor: 0xff4500, type: 'train' },
    { name: "DIGITAL", color: 0x00bcd4, sunColor: 0x00ffff, type: 'sphere' }
];

// UI Elements
const uiFPS = document.getElementById('ui-fps');
const uiParticles = document.getElementById('ui-particles');
const uiEra = document.getElementById('ui-era');
const btnSwitch = document.getElementById('btn-switch');

// Initialize
function init() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 1;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Particles
    createParticles();

    // Sun/Moon
    createSunMoon();

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    if(btnSwitch) btnSwitch.addEventListener('click', nextEra);

    // Start Loop
    animate();
    
    // Initial UI
    updateUI();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);

    // Initial Random Positions (Big Bang)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Initialize targets to same
        targetPositions[i * 3] = x;
        targetPositions[i * 3 + 1] = y;
        targetPositions[i * 3 + 2] = z;

        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));

    // Shader Material for Glowing Dots
    const material = new THREE.PointsMaterial({
        size: PARTICLE_SIZE,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createSunMoon() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    sunMoon = new THREE.Mesh(geometry, material);
    sunMoon.position.set(3, 2, -2);
    scene.add(sunMoon);
}

// Shape Generation Functions
function getShapePoints(type) {
    const points = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x, y, z;
        
        if (type === 'random') {
            const r = 5 * Math.random();
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        } 
        else if (type === 'plow') {
            // Simple wedge shape
            const t = i / PARTICLE_COUNT;
            if (t < 0.7) {
                // Blade
                x = (Math.random() - 0.5) * 2;
                z = (Math.random() - 0.5) * 4;
                y = Math.abs(x) * 0.5 - 1; 
            } else {
                // Handle
                x = 0;
                y = (Math.random()) * 2 - 1;
                z = 1 + Math.random();
            }
        }
        else if (type === 'ship') {
            // Hull
            const t = i / PARTICLE_COUNT;
            const u = Math.random() * Math.PI; // 0 to PI
            const v = Math.random() * Math.PI * 2;
            
            // Ellipsoid hull
            x = 3 * Math.cos(u) * Math.sin(v);
            y = -1 + 1 * Math.cos(v); // Bottom curve
            z = 1.5 * Math.sin(u) * Math.sin(v);
            
            // Flatten top
            if (y > 0) y = 0;
            
            // Mast
            if (i > PARTICLE_COUNT * 0.8) {
                x = 0;
                z = 0;
                y = Math.random() * 3;
            }
        }
        else if (type === 'train') {
            // Boxy shape
            const t = i / PARTICLE_COUNT;
            if (t < 0.2) {
                // Wheels
                x = (Math.random() - 0.5) * 3;
                y = -1;
                z = (Math.random() > 0.5 ? 0.5 : -0.5);
            } else {
                // Body
                x = (Math.random() - 0.5) * 4;
                y = (Math.random() - 0.5) * 1.5;
                z = (Math.random() - 0.5) * 1.5;
            }
        }
        else if (type === 'sphere') {
            // Digital Sphere
            const r = 2.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
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
    
    // Update UI
    updateUI();
    
    // Generate Target Points
    const targetPoints = getShapePoints(era.type);
    const attr = particles.geometry.attributes.targetPosition;
    
    for(let i=0; i < PARTICLE_COUNT; i++) {
        attr.setXYZ(i, targetPoints[i*3], targetPoints[i*3+1], targetPoints[i*3+2]);
    }
    attr.needsUpdate = true;

    // Transition Sun/Moon Color
    new TWEEN.Tween(sunMoon.material.color)
        .to(new THREE.Color(era.sunColor), TRANSITION_DURATION)
        .start();

    // Transition Particle Color
    const targetColor = new THREE.Color(era.color);
    const colors = particles.geometry.attributes.color;
    // We'll just tween a global color uniform or re-color all points over time
    // For simplicity, let's just lerp the particle positions in the animate loop
    
    // Reset transition timer
    transitionStartTime = Date.now();
}

let transitionStartTime = 0;

function updateUI() {
    if(uiEra) uiEra.innerText = `ERA: ${ERAS[currentEraIndex].name}`;
    if(uiParticles) uiParticles.innerText = `PARTICLES: ${PARTICLE_COUNT}`;
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
    const delta = time - lastTime;
    lastTime = time;
    
    // FPS Calculation
    if (frameCount % 30 === 0) {
        if(uiFPS) uiFPS.innerText = `FPS: ${Math.round(1000 / delta)}`;
    }
    frameCount++;

    TWEEN.update();

    // Particle Morphing Logic
    if (isTransitioning) {
        const progress = Math.min((time - transitionStartTime) / TRANSITION_DURATION, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        
        const positions = particles.geometry.attributes.position;
        const targets = particles.geometry.attributes.targetPosition;
        
        // We need to store "start" positions to lerp correctly, 
        // but for a continuous flow effect, simple lerping towards target every frame works too
        // creating a "magnetic" pull.
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const cx = positions.getX(i);
            const cy = positions.getY(i);
            const cz = positions.getZ(i);
            
            const tx = targets.getX(i);
            const ty = targets.getY(i);
            const tz = targets.getZ(i);
            
            // Simple lerp for smooth flow
            positions.setXYZ(i, 
                cx + (tx - cx) * 0.05,
                cy + (ty - cy) * 0.05,
                cz + (tz - cz) * 0.05
            );
        }
        positions.needsUpdate = true;
        
        if (progress >= 1 && Math.abs(positions.getX(0) - targets.getX(0)) < 0.1) {
            isTransitioning = false;
        }
    }

    // Rotation
    particles.rotation.y += 0.001;
    
    // Sun/Moon Orbit
    sunMoon.position.x = Math.sin(time * 0.0005) * 4;
    sunMoon.position.z = Math.cos(time * 0.0005) * 4;

    renderer.render(scene, camera);
}

// Simple Tweening Library (since we didn't import one)
const TWEEN = {
    tweens: [],
    getAll() { return this.tweens; },
    removeAll() { this.tweens = []; },
    add(tween) { this.tweens.push(tween); },
    remove(tween) {
        const i = this.tweens.indexOf(tween);
        if (i !== -1) this.tweens.splice(i, 1);
    },
    update(time) {
        if (this.tweens.length === 0) return false;
        let i = 0;
        time = time !== undefined ? time : Date.now();
        while (i < this.tweens.length) {
            if (this.tweens[i].update(time)) {
                i++;
            } else {
                this.tweens.splice(i, 1);
            }
        }
        return true;
    }
};

TWEEN.Tween = function(object) {
    this._object = object;
    this._valuesStart = {};
    this._valuesEnd = {};
    this._duration = 1000;
    this._startTime = null;
    this._onUpdateCallback = null;
};

TWEEN.Tween.prototype = {
    to: function(properties, duration) {
        this._valuesEnd = properties;
        if (duration !== undefined) this._duration = duration;
        return this;
    },
    start: function(time) {
        TWEEN.add(this);
        this._startTime = time !== undefined ? time : Date.now();
        for (const property in this._valuesEnd) {
            if (this._object[property] === null || this._object[property] === undefined) continue;
            this._valuesStart[property] = this._object[property]; // Simple copy
            if(this._object[property] instanceof THREE.Color) {
                 this._valuesStart[property] = this._object[property].clone();
            }
        }
        return this;
    },
    update: function(time) {
        if (time < this._startTime) return true;
        let elapsed = (time - this._startTime) / this._duration;
        elapsed = elapsed > 1 ? 1 : elapsed;
        
        for (const property in this._valuesEnd) {
            const start = this._valuesStart[property];
            const end = this._valuesEnd[property];
            
            if (start instanceof THREE.Color) {
                this._object[property].r = start.r + (end.r - start.r) * elapsed;
                this._object[property].g = start.g + (end.g - start.g) * elapsed;
                this._object[property].b = start.b + (end.b - start.b) * elapsed;
            } else {
                this._object[property] = start + (end - start) * elapsed;
            }
        }
        if (elapsed === 1) return false;
        return true;
    }
};

// Start
init();
