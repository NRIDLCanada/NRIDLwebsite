// Literacy Skill Tree - Interactive Visualization
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

class SkillTree {
    constructor() {
        this.container = document.getElementById('literacy-tree-container');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.skillNodes = [];
        this.connections = [];
        this.currentLightIndex = 0;
        this.lightUpDelay = 0;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredNode = null;
        this.tooltip = null;

        // Skill tree structure - hierarchical (tree grows upward)
        this.skills = [
            // Root/Trunk (bottom)
            { id: 0, name: 'Core Literacy', level: 0, x: 0, color: 0x3282b8 },
            
            // Level 1 - Main branches
            { id: 1, name: 'Reading', level: 1, x: -2.5, parent: 0, color: 0x4a90e2 },
            { id: 2, name: 'Writing', level: 1, x: 0, parent: 0, color: 0x4a90e2 },
            { id: 3, name: 'Digital Skills', level: 1, x: 2.5, parent: 0, color: 0x4a90e2 },
            
            // Level 2 - Secondary branches
            { id: 4, name: 'Comprehension', level: 2, x: -4, parent: 1, color: 0x5da9f6 },
            { id: 5, name: 'Vocabulary', level: 2, x: -2, parent: 1, color: 0x5da9f6 },
            { id: 6, name: 'Phonics', level: 2, x: -1, parent: 1, color: 0x5da9f6 },
            { id: 7, name: 'Expression', level: 2, x: -0.5, parent: 2, color: 0x5da9f6 },
            { id: 8, name: 'Grammar', level: 2, x: 0.5, parent: 2, color: 0x5da9f6 },
            { id: 9, name: 'Communication', level: 2, x: 1.5, parent: 2, color: 0x5da9f6 },
            { id: 10, name: 'Coding', level: 2, x: 2, parent: 3, color: 0x5da9f6 },
            { id: 11, name: 'AI Literacy', level: 2, x: 3.5, parent: 3, color: 0x5da9f6 },
            { id: 12, name: 'Data Skills', level: 2, x: 4.5, parent: 3, color: 0x5da9f6 },
            
            // Level 3 - Tertiary branches
            { id: 13, name: 'Critical Thinking', level: 3, x: -5, parent: 4, color: 0x7ec8ff },
            { id: 14, name: 'Analysis', level: 3, x: -3.5, parent: 4, color: 0x7ec8ff },
            { id: 15, name: 'Inference', level: 3, x: -2.5, parent: 5, color: 0x7ec8ff },
            { id: 16, name: 'Context', level: 3, x: -1.5, parent: 5, color: 0x7ec8ff },
            { id: 17, name: 'Creative Writing', level: 3, x: -1, parent: 7, color: 0x7ec8ff },
            { id: 18, name: 'Technical Writing', level: 3, x: 0, parent: 7, color: 0x7ec8ff },
            { id: 19, name: 'Storytelling', level: 3, x: 0.5, parent: 9, color: 0x7ec8ff },
            { id: 20, name: 'Presentation', level: 3, x: 1.5, parent: 9, color: 0x7ec8ff },
            { id: 21, name: 'Python', level: 3, x: 2, parent: 10, color: 0x7ec8ff },
            { id: 22, name: 'Web Dev', level: 3, x: 2.8, parent: 10, color: 0x7ec8ff },
            { id: 23, name: 'ML Basics', level: 3, x: 3.5, parent: 11, color: 0x7ec8ff },
            { id: 24, name: 'Ethics', level: 3, x: 4.2, parent: 11, color: 0x7ec8ff },
            { id: 25, name: 'Data Analysis', level: 3, x: 5, parent: 12, color: 0x7ec8ff },
            
            // Level 4 - Leaf nodes (top of tree)
            { id: 26, name: 'Problem Solving', level: 4, x: -5.5, parent: 13, color: 0x9de4ff },
            { id: 27, name: 'Research', level: 4, x: -4.5, parent: 13, color: 0x9de4ff },
            { id: 28, name: 'Logic', level: 4, x: -3.5, parent: 14, color: 0x9de4ff },
            { id: 29, name: 'Evaluation', level: 4, x: -2.5, parent: 15, color: 0x9de4ff },
            { id: 30, name: 'Poetry', level: 4, x: -1.2, parent: 17, color: 0x9de4ff },
            { id: 31, name: 'Fiction', level: 4, x: -0.5, parent: 17, color: 0x9de4ff },
            { id: 32, name: 'Reports', level: 4, x: 0.2, parent: 18, color: 0x9de4ff },
            { id: 33, name: 'Public Speaking', level: 4, x: 1.5, parent: 20, color: 0x9de4ff },
            { id: 34, name: 'Debate', level: 4, x: 2.2, parent: 20, color: 0x9de4ff },
            { id: 35, name: 'Algorithms', level: 4, x: 2.5, parent: 21, color: 0x9de4ff },
            { id: 36, name: 'JavaScript', level: 4, x: 3, parent: 22, color: 0x9de4ff },
            { id: 37, name: 'Neural Networks', level: 4, x: 3.7, parent: 23, color: 0x9de4ff },
            { id: 38, name: 'Bias Detection', level: 4, x: 4.5, parent: 24, color: 0x9de4ff },
            { id: 39, name: 'Visualization', level: 4, x: 5.3, parent: 25, color: 0x9de4ff },
            
            // Level 5 - Additional leaf nodes for fuller tree
            { id: 40, name: 'Innovation', level: 5, x: -5.7, parent: 26, color: 0xbdf0ff },
            { id: 41, name: 'Collaboration', level: 5, x: -4.3, parent: 27, color: 0xbdf0ff },
            { id: 42, name: 'Reasoning', level: 5, x: -3.2, parent: 28, color: 0xbdf0ff },
            { id: 43, name: 'Synthesis', level: 5, x: -2.3, parent: 29, color: 0xbdf0ff },
            { id: 44, name: 'Leadership', level: 5, x: 1.8, parent: 33, color: 0xbdf0ff },
            { id: 45, name: 'Empathy', level: 5, x: 2.5, parent: 34, color: 0xbdf0ff },
            { id: 46, name: 'Design', level: 5, x: 3.2, parent: 36, color: 0xbdf0ff },
            { id: 47, name: 'Financial Literacy', level: 5, x: 4.8, parent: 38, color: 0xbdf0ff },
            { id: 48, name: 'Statistics', level: 5, x: 5.5, parent: 39, color: 0xbdf0ff },
        ];

        this.init();
        this.createTooltip();
        this.createSkillTree();
        this.animate();
        this.handleResize();
        this.handleMouseMove();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 12;
        this.camera.position.y = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.padding = '8px 12px';
        this.tooltip.style.background = 'rgba(0, 0, 0, 0.85)';
        this.tooltip.style.color = 'white';
        this.tooltip.style.borderRadius = '4px';
        this.tooltip.style.fontSize = '14px';
        this.tooltip.style.fontFamily = 'Inter, sans-serif';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.zIndex = '1000';
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transition = 'opacity 0.2s';
        this.tooltip.style.whiteSpace = 'nowrap';
        this.tooltip.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        document.body.appendChild(this.tooltip);
    }

    createSkillTree() {
        const verticalSpacing = 2.2;
        
        // Create connections first (branches)
        this.skills.forEach(skill => {
            if (skill.parent !== undefined) {
                const parent = this.skills.find(s => s.id === skill.parent);
                const childY = skill.level * verticalSpacing;
                const parentY = parent.level * verticalSpacing;
                
                this.createConnection(
                    parent.x * 2, parentY, 0,
                    skill.x * 2, childY, 0,
                    skill.id
                );
            }
        });

        // Create nodes (skills)
        this.skills.forEach((skill, index) => {
            const y = skill.level * verticalSpacing;
            this.createSkillNode(skill.x * 2, y, 0, skill, index);
        });
    }

    createConnection(x1, y1, z1, x2, y2, z2, skillId) {
        const points = [];
        points.push(new THREE.Vector3(x1, y1, z1));
        points.push(new THREE.Vector3(x2, y2, z2));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.2,
            linewidth: 2
        });
        
        const line = new THREE.Line(geometry, material);
        line.userData.skillId = skillId;
        line.userData.targetOpacity = 0.8;
        line.userData.isConnection = true;
        this.scene.add(line);
        this.connections.push(line);
    }

    createSkillNode(x, y, z, skill, index) {
        // Outer glow ring
        const ringGeometry = new THREE.RingGeometry(0.35, 0.4, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: skill.color,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, y, z);
        
        // Core node
        const geometry = new THREE.CircleGeometry(0.3, 32);
        const material = new THREE.MeshBasicMaterial({
            color: skill.color,
            transparent: true,
            opacity: 0
        });
        const node = new THREE.Mesh(geometry, material);
        node.position.set(x, y, z);
        
        // Inner bright core
        const coreGeometry = new THREE.CircleGeometry(0.15, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.set(x, y, z + 0.01);
        
        // Create particle effect around node
        const particleCount = 8;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.CircleGeometry(0.05, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: skill.color,
                transparent: true,
                opacity: 0
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / particleCount) * Math.PI * 2;
            particle.userData.angle = angle;
            particle.userData.radius = 0.6;
            particle.userData.baseX = x;
            particle.userData.baseY = y;
            particle.position.set(
                x + Math.cos(angle) * 0.6,
                y + Math.sin(angle) * 0.6,
                z
            );
            particles.push(particle);
            this.scene.add(particle);
        }
        
        this.scene.add(ring);
        this.scene.add(node);
        this.scene.add(core);
        
        // Store node data
        this.skillNodes.push({
            skill,
            node,
            core,
            ring,
            particles,
            index,
            isLit: false,
            material,
            coreMaterial,
            ringMaterial
        });
    }

    lightUpNode(index) {
        if (index >= this.skillNodes.length) return;
        
        const nodeData = this.skillNodes[index];
        if (nodeData.isLit) return;
        
        nodeData.isLit = true;
        
        // Animate node appearance
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // ease out cubic
            
            nodeData.material.opacity = easeProgress * 0.8;
            nodeData.coreMaterial.opacity = easeProgress;
            nodeData.ringMaterial.opacity = easeProgress * 0.6;
            
            nodeData.particles.forEach((particle, i) => {
                particle.material.opacity = easeProgress * 0.7;
            });
            
            // Light up connection to parent
            if (nodeData.skill.parent !== undefined) {
                const connection = this.connections.find(c => c.userData.skillId === nodeData.skill.id);
                if (connection) {
                    connection.material.opacity = easeProgress * 0.8;
                    connection.material.color.setHex(nodeData.skill.color);
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Animate particles orbiting around nodes
        this.skillNodes.forEach(nodeData => {
            if (nodeData.isLit) {
                nodeData.particles.forEach((particle, i) => {
                    const angle = particle.userData.angle + time * 0.5;
                    const radius = particle.userData.radius + Math.sin(time * 2 + i) * 0.1;
                    particle.position.x = particle.userData.baseX + Math.cos(angle) * radius;
                    particle.position.y = particle.userData.baseY + Math.sin(angle) * radius;
                });
                
                // Pulse effect on core
                const pulse = Math.sin(time * 2) * 0.1 + 0.9;
                nodeData.coreMaterial.opacity = pulse * 0.9;
            }
        });
        
        // Gradual light-up effect
        this.lightUpDelay++;
        if (this.lightUpDelay > 30 && this.currentLightIndex < this.skillNodes.length) {
            this.lightUpNode(this.currentLightIndex);
            this.currentLightIndex++;
            this.lightUpDelay = 0;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            if (!this.container || !this.camera || !this.renderer) return;
            
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            
            // Adjust camera position for mobile to shrink tree and move it down
            if (window.innerWidth <= 768) {
                this.camera.position.z = 18; // Further back to shrink more
                this.camera.position.y = 2; // Lower Y to move tree down
            } else {
                this.camera.position.z = 12;
                this.camera.position.y = 5;
            }
        });
        
        // Initial mobile check
        if (window.innerWidth <= 768) {
            this.camera.position.z = 18;
            this.camera.position.y = 2;
        }
    }

    handleMouseMove() {
        this.container.addEventListener('mousemove', (event) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            const nodeObjects = this.skillNodes.map(n => n.node);
            const intersects = this.raycaster.intersectObjects(nodeObjects);
            
            if (intersects.length > 0) {
                const intersectedNode = this.skillNodes.find(n => n.node === intersects[0].object);
                if (intersectedNode && intersectedNode.isLit) {
                    this.hoveredNode = intersectedNode;
                    this.tooltip.textContent = intersectedNode.skill.name;
                    this.tooltip.style.left = event.clientX + 15 + 'px';
                    this.tooltip.style.top = event.clientY + 15 + 'px';
                    this.tooltip.style.opacity = '1';
                    this.container.style.cursor = 'pointer';
                }
            } else {
                this.tooltip.style.opacity = '0';
                this.hoveredNode = null;
                this.container.style.cursor = 'default';
            }
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.tooltip.style.opacity = '0';
            this.hoveredNode = null;
            this.container.style.cursor = 'default';
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SkillTree();
    });
} else {
    new SkillTree();
}

export default SkillTree;
