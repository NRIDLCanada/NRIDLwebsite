// Digital Futures Page Strategic Section Three.js Background with Interactive Elements
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

class DigitalFuturesStrategicBackground {
    constructor() {
        this.container = document.getElementById('digital-futures-strategic-canvas-container');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.animationId = null;
        this.activeTab = 0;

        this.init();
        this.animate();
        this.handleResize();
        this.initTabInteraction();
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
        this.camera.position.z = 40;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0xffffff, 0);
        this.container.appendChild(this.renderer.domElement);

        // Create geometric patterns
        this.createGeometricPattern();
        
        // Create flowing particles
        this.createFlowingParticles();
    }

    createGeometricPattern() {
        // Create interconnected geometric shapes
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1),
            new THREE.TetrahedronGeometry(1)
        ];

        const material = new THREE.MeshBasicMaterial({
            color: 0xdddddd,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });

        for (let i = 0; i < 3; i++) {
            const geometry = geometries[i % geometries.length];
            const mesh = new THREE.Mesh(geometry, material.clone());
            
            mesh.position.x = (i - 1) * 15;
            mesh.position.y = Math.sin(i) * 5;
            mesh.position.z = -10;
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            
            mesh.userData = {
                index: i,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01,
                    z: (Math.random() - 0.5) * 0.01
                },
                originalY: mesh.position.y,
                floatSpeed: 0.5 + Math.random() * 0.5
            };
            
            this.scene.add(mesh);
        }

        this.geometricShapes = this.scene.children.filter(child => child.isMesh);
    }

    createFlowingParticles() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.03,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 1.5,
            color: 0xcccccc,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.velocities = velocities;
        this.scene.add(this.particles);
    }

    initTabInteraction() {
        const tabs = document.querySelectorAll('.strategic-tab');
        
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.switchTab(index);
            });
        });
    }

    switchTab(index) {
        this.activeTab = index;
        
        // Update active states
        document.querySelectorAll('.strategic-tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        
        document.querySelectorAll('.strategic-content-card').forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });

        // Animate geometric shapes to emphasize the active tab
        if (this.geometricShapes) {
            this.geometricShapes.forEach((shape, i) => {
                const material = shape.material;
                if (i === index) {
                    material.opacity = 0.35;
                    material.color.setHex(0x999999);
                } else {
                    material.opacity = 0.15;
                    material.color.setHex(0xdddddd);
                }
            });
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.0005;

        // Animate geometric shapes
        if (this.geometricShapes) {
            this.geometricShapes.forEach((shape, index) => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.rotation.z += shape.userData.rotationSpeed.z;
                
                // Floating motion
                shape.position.y = shape.userData.originalY + 
                    Math.sin(time * shape.userData.floatSpeed + index) * 2;
            });
        }

        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const velocities = this.particles.userData.velocities;

            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                // Boundary check with wraparound
                if (Math.abs(positions[i * 3]) > 50) velocities[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 40) velocities[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 20) velocities[i].z *= -1;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.rotation.y += 0.0003;
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
        new DigitalFuturesStrategicBackground();
    });
} else {
    new DigitalFuturesStrategicBackground();
}

export default DigitalFuturesStrategicBackground;
