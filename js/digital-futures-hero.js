// Digital Futures Hero Three.js Background
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

class DigitalFuturesHero {
    constructor() {
        this.container = document.getElementById('digital-futures-hero-canvas');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.networks = [];
        this.animationId = null;
        this.time = 0;

        this.init();
        this.animate();
        this.handleResize();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.001);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 80;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        this.container.appendChild(this.renderer.domElement);

        // Create particle network
        this.createParticleNetwork();

        // Create data streams
        this.createDataStreams();

        // Create grid plane
        this.createGridPlane();

        // Add lights
        this.createLights();
    }

    createParticleNetwork() {
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Spread particles in 3D space
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
            
            // Color variation - cyan to blue to purple
            const colorChoice = Math.random();
            const color = new THREE.Color();
            if (colorChoice < 0.4) {
                color.setHSL(0.55, 0.8, 0.6); // Cyan
            } else if (colorChoice < 0.7) {
                color.setHSL(0.6, 0.7, 0.5); // Blue
            } else {
                color.setHSL(0.75, 0.6, 0.5); // Purple
            }
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.03,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.03
            });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create glowing particle texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 100, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.PointsMaterial({
            size: 2.5,
            map: texture,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.velocities = velocities;
        this.scene.add(this.particles);

        // Create connection lines between nearby particles
        this.createNetworkLines();
    }

    createNetworkLines() {
        const positions = this.particles.geometry.attributes.position.array;
        const particleCount = positions.length / 3;
        const maxDistance = 25;
        
        for (let i = 0; i < particleCount; i++) {
            const px1 = positions[i * 3];
            const py1 = positions[i * 3 + 1];
            const pz1 = positions[i * 3 + 2];
            
            // Check for nearby particles
            for (let j = i + 1; j < particleCount; j++) {
                const px2 = positions[j * 3];
                const py2 = positions[j * 3 + 1];
                const pz2 = positions[j * 3 + 2];
                
                const dx = px2 - px1;
                const dy = py2 - py1;
                const dz = pz2 - pz1;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < maxDistance && Math.random() > 0.7) {
                    const lineGeometry = new THREE.BufferGeometry();
                    const linePositions = new Float32Array([
                        px1, py1, pz1,
                        px2, py2, pz2
                    ]);
                    
                    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
                    
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x4488ff,
                        transparent: true,
                        opacity: 0.15,
                        blending: THREE.AdditiveBlending
                    });
                    
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    line.userData = { idx1: i, idx2: j };
                    this.networks.push(line);
                    this.scene.add(line);
                }
            }
        }
    }

    createDataStreams() {
        // Create flowing data stream effects
        for (let i = 0; i < 15; i++) {
            const streamGeometry = new THREE.BufferGeometry();
            const streamPoints = [];
            const startAngle = Math.random() * Math.PI * 2;
            const radius = 40 + Math.random() * 30;
            
            for (let j = 0; j < 50; j++) {
                const angle = startAngle + j * 0.1;
                const x = Math.cos(angle) * radius;
                const y = (j - 25) * 2;
                const z = Math.sin(angle) * radius;
                streamPoints.push(new THREE.Vector3(x, y, z));
            }
            
            streamGeometry.setFromPoints(streamPoints);
            
            const streamMaterial = new THREE.LineBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            
            const stream = new THREE.Line(streamGeometry, streamMaterial);
            stream.userData.offset = Math.random() * Math.PI * 2;
            this.scene.add(stream);
        }
    }

    createGridPlane() {
        // Create a futuristic grid floor
        const gridHelper = new THREE.GridHelper(200, 40, 0x0066ff, 0x003366);
        gridHelper.position.y = -40;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x0088ff, 1, 150);
        pointLight1.position.set(40, 30, 40);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 150);
        pointLight2.position.set(-40, 20, -40);
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x00ffff, 0.6, 150);
        pointLight3.position.set(0, 50, 0);
        this.scene.add(pointLight3);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.time += 0.01;

        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const velocities = this.particles.userData.velocities;

            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                // Boundary check with wraparound
                if (Math.abs(positions[i * 3]) > 75) velocities[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 40) velocities[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 75) velocities[i].z *= -1;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            
            // Subtle rotation
            this.particles.rotation.y += 0.0003;
        }

        // Update network lines
        if (this.networks.length > 0) {
            const positions = this.particles.geometry.attributes.position.array;
            this.networks.forEach(line => {
                const linePositions = line.geometry.attributes.position.array;
                const idx1 = line.userData.idx1;
                const idx2 = line.userData.idx2;
                
                linePositions[0] = positions[idx1 * 3];
                linePositions[1] = positions[idx1 * 3 + 1];
                linePositions[2] = positions[idx1 * 3 + 2];
                linePositions[3] = positions[idx2 * 3];
                linePositions[4] = positions[idx2 * 3 + 1];
                linePositions[5] = positions[idx2 * 3 + 2];
                
                line.geometry.attributes.position.needsUpdate = true;
                
                // Pulse effect
                line.material.opacity = 0.1 + Math.sin(this.time * 2) * 0.05;
            });
        }

        // Gentle camera movement
        this.camera.position.x = Math.sin(this.time * 0.1) * 5;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            if (!this.container || !this.camera || !this.renderer) return;

            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DigitalFuturesHero();
    });
} else {
    new DigitalFuturesHero();
}

export default DigitalFuturesHero;
