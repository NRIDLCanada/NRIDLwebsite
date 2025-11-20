// Mission/Vision Section Three.js Background
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

class MissionBackground {
    constructor() {
        this.container = document.getElementById('mission-canvas-container');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.animationId = null;

        this.init();
        this.animate();
        this.handleResize();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0xffffff, 0);
        this.container.appendChild(this.renderer.domElement);

        // Create particle system - elegant floating particles
        this.createParticles();

        // Add subtle ambient light effect
        this.createLights();
    }

    createParticles() {
        const particleCount = 150;
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create elegant circular particles
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
        gradient.addColorStop(0.5, 'rgba(180, 180, 180, 0.4)');
        gradient.addColorStop(1, 'rgba(160, 160, 160, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.PointsMaterial({
            size: 2,
            map: texture,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.velocities = velocities;
        this.scene.add(this.particles);

        // Add connecting lines for elegant web effect
        this.createConnectionLines();
    }

    createConnectionLines() {
        const lineCount = 50;
        const positions = this.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < lineCount; i++) {
            const idx1 = Math.floor(Math.random() * (positions.length / 3)) * 3;
            const idx2 = Math.floor(Math.random() * (positions.length / 3)) * 3;
            
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = new Float32Array([
                positions[idx1], positions[idx1 + 1], positions[idx1 + 2],
                positions[idx2], positions[idx2 + 1], positions[idx2 + 2]
            ]);
            
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xcccccc,
                transparent: true,
                opacity: 0.1,
                blending: THREE.AdditiveBlending
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
        }
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight2.position.set(-20, -20, 20);
        this.scene.add(pointLight2);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Animate particles with gentle floating motion
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const velocities = this.particles.userData.velocities;

            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                // Boundary check with smooth wraparound
                if (Math.abs(positions[i * 3]) > 50) velocities[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 50) velocities[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 30) velocities[i].z *= -1;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            
            // Gentle rotation
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
        }

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
        new MissionBackground();
    });
} else {
    new MissionBackground();
}

export default MissionBackground;
