/**
 * AR Research Hero - Three.js Interactive Scene
 * Features floating AR markers, holographic grids, and particle effects
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

class ARHero {
    constructor() {
        this.container = document.getElementById('ar-hero-canvas');
        if (!this.container) {
            console.warn('AR Hero canvas container not found');
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.markers = [];
        this.scanLines = [];
        this.holographicGrid = null;
        this.time = 0;

        this.init();
        this.createLighting();
        this.createParticles();
        this.createARMarkers();
        this.createScanLines();
        this.createHolographicGrid();
        this.animate();
        this.handleResize();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0015, 10, 50);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0015, 1);
        this.container.appendChild(this.renderer.domElement);
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x667eea, 0.3);
        this.scene.add(ambientLight);

        // Purple point lights
        const light1 = new THREE.PointLight(0x667eea, 1.5, 30);
        light1.position.set(-5, 5, 5);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0x764ba2, 1.5, 30);
        light2.position.set(5, 5, -5);
        this.scene.add(light2);

        // Moving spotlight
        const spotlight = new THREE.SpotLight(0x667eea, 1);
        spotlight.position.set(0, 10, 0);
        spotlight.castShadow = true;
        this.scene.add(spotlight);
        this.spotlight = spotlight;
    }

    createParticles() {
        const particleCount = 800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color1 = new THREE.Color(0x667eea);
        const color2 = new THREE.Color(0x764ba2);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Spread particles in a wide area
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = (Math.random() - 0.5) * 40;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;

            // Color gradient
            const mixRatio = Math.random();
            const color = color1.clone().lerp(color2, mixRatio);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Varying sizes
            sizes[i] = Math.random() * 0.15 + 0.05;

            this.particles.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                originalY: positions[i3 + 1]
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    createARMarkers() {
        // Create floating AR marker frames
        const markerCount = 8;
        const markerGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(1.5, 1.5, 0.1)
        );

        for (let i = 0; i < markerCount; i++) {
            const material = new THREE.LineBasicMaterial({
                color: i % 2 === 0 ? 0x667eea : 0x764ba2,
                transparent: true,
                opacity: 0.6
            });

            const marker = new THREE.LineSegments(markerGeometry, material);
            
            // Position markers in a circle
            const angle = (i / markerCount) * Math.PI * 2;
            const radius = 6;
            marker.position.x = Math.cos(angle) * radius;
            marker.position.y = Math.sin(i * 0.5) * 2;
            marker.position.z = Math.sin(angle) * radius;
            
            marker.rotation.y = -angle;

            this.scene.add(marker);
            this.markers.push({
                mesh: marker,
                originalY: marker.position.y,
                angle: angle,
                radius: radius
            });
        }
    }

    createScanLines() {
        // Vertical scan lines
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.PlaneGeometry(0.02, 20);
            const material = new THREE.MeshBasicMaterial({
                color: 0x667eea,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });

            const line = new THREE.Mesh(geometry, material);
            line.position.x = (i - 2) * 3;
            line.position.z = -5;
            
            this.scene.add(line);
            this.scanLines.push({
                mesh: line,
                speed: 0.02 + Math.random() * 0.02
            });
        }
    }

    createHolographicGrid() {
        // Ground grid
        const size = 40;
        const divisions = 40;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x667eea, 0x764ba2);
        gridHelper.position.y = -2;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.2;
        this.scene.add(gridHelper);
        this.holographicGrid = gridHelper;

        // Vertical grid walls
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.15
        });

        const createGridWall = (width, height, posZ, rotY = 0) => {
            const points = [];
            const divs = 20;
            
            // Vertical lines
            for (let i = 0; i <= divs; i++) {
                const x = (i / divs - 0.5) * width;
                points.push(new THREE.Vector3(x, -height/2, 0));
                points.push(new THREE.Vector3(x, height/2, 0));
            }
            
            // Horizontal lines
            for (let i = 0; i <= divs; i++) {
                const y = (i / divs - 0.5) * height;
                points.push(new THREE.Vector3(-width/2, y, 0));
                points.push(new THREE.Vector3(width/2, y, 0));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const grid = new THREE.LineSegments(geometry, gridMaterial);
            grid.position.z = posZ;
            grid.rotation.y = rotY;
            this.scene.add(grid);
        };

        createGridWall(40, 20, -10);
        createGridWall(40, 20, -10, Math.PI / 2);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.time += 0.01;

        // Animate particles
        const positions = this.particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < this.particles.length; i++) {
            const i3 = i * 3;
            const particle = this.particles[i];

            positions[i3] += particle.velocity.x;
            positions[i3 + 1] += particle.velocity.y;
            positions[i3 + 2] += particle.velocity.z;

            // Boundary check and reset
            if (Math.abs(positions[i3]) > 20) positions[i3] *= -0.5;
            if (Math.abs(positions[i3 + 1]) > 20) positions[i3 + 1] *= -0.5;
            if (Math.abs(positions[i3 + 2]) > 20) positions[i3 + 2] *= -0.5;
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;

        // Animate AR markers - floating and rotating
        this.markers.forEach((marker, index) => {
            marker.mesh.position.y = marker.originalY + Math.sin(this.time + index) * 0.5;
            marker.mesh.rotation.y += 0.005;
            marker.mesh.rotation.x = Math.sin(this.time * 0.5 + index) * 0.2;
            
            // Pulse opacity
            marker.mesh.material.opacity = 0.4 + Math.sin(this.time * 2 + index) * 0.2;
        });

        // Animate scan lines
        this.scanLines.forEach(line => {
            line.mesh.position.y += line.speed;
            if (line.mesh.position.y > 10) {
                line.mesh.position.y = -10;
            }
            
            // Fade in/out
            const normalizedY = (line.mesh.position.y + 10) / 20;
            line.mesh.material.opacity = Math.sin(normalizedY * Math.PI) * 0.3;
        });

        // Rotate holographic grid
        if (this.holographicGrid) {
            this.holographicGrid.rotation.y += 0.001;
        }

        // Move spotlight
        if (this.spotlight) {
            this.spotlight.position.x = Math.sin(this.time * 0.5) * 10;
            this.spotlight.position.z = Math.cos(this.time * 0.5) * 10;
        }

        // Camera subtle movement
        this.camera.position.x = Math.sin(this.time * 0.1) * 0.5;
        this.camera.position.y = 2 + Math.sin(this.time * 0.15) * 0.3;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            const width = this.container.offsetWidth;
            const height = this.container.offsetHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ARHero();
    });
} else {
    new ARHero();
}

export default ARHero;
