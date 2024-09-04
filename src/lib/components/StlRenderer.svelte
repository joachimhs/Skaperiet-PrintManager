<script>
    import { onMount } from "svelte";
    import * as THREE from "three";
    import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
    import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
    import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

    export let stlUrl;   // URL to load the STL file from
    export let stlFile;  // File object to load the STL file from

    let container;

    function loadSTLFromFile(file) {
        const loader = new STLLoader();
        const reader = new FileReader();

        reader.onload = function (event) {
            const contents = event.target.result;
            const geometry = loader.parse(contents);
            addModelToScene(geometry);
        };

        reader.readAsArrayBuffer(file);
    }

    function loadSTLFromURL(url) {
        const loader = new STLLoader();
        loader.load(url, (geometry) => {
            addModelToScene(geometry);
        });
    }

    function addTextToScene(scene) {
        const fontLoader = new FontLoader();
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const textGeometry1 = new TextGeometry('Skaperiet', {
                font: font,
                size: 10,
                height: 1,
                curveSegments: 12,
            });
            const textMesh1 = new THREE.Mesh(textGeometry1, textMaterial);
            textGeometry1.computeBoundingBox();
            const textWidth1 = textGeometry1.boundingBox.max.x - textGeometry1.boundingBox.min.x;
            textMesh1.position.set(-textWidth1 / 2, 0.1, 85); // Centered on X, near Y edge
            textMesh1.rotation.x = -Math.PI / 2;
            scene.add(textMesh1);

            const textGeometry2 = new TextGeometry('PrintManager', {
                font: font,
                size: 10,
                height: 1,
                curveSegments: 12,
            });
            const textMesh2 = new THREE.Mesh(textGeometry2, textMaterial);
            textGeometry2.computeBoundingBox();
            const textWidth2 = textGeometry2.boundingBox.max.x - textGeometry2.boundingBox.min.x;
            textMesh2.position.set(-textWidth2 / 2, 0.1, 105); // Centered on X, near Y edge
            textMesh2.rotation.x = -Math.PI / 2;
            scene.add(textMesh2);
        });
    }

    function addModelToScene(geometry) {
        // Basic Three.js setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xffffff, 1); // Set background color to white
        container.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // Create a white plane to represent the build plate
        const plateGeometry = new THREE.PlaneGeometry(235, 235);
        const plateMaterial = new THREE.MeshStandardMaterial({color: 0xD8FFFF});
        const buildPlate = new THREE.Mesh(plateGeometry, plateMaterial);
        buildPlate.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat
        scene.add(buildPlate);

        // Add grid lines (black lines every cm)
        const gridHelper = new THREE.GridHelper(235, 23.5, 0x000000, 0x000000);
        scene.add(gridHelper);

        // Add the text near the edge of the Y-axis, centered on the X-axis
        addTextToScene(scene);

        // Prepare the model mesh
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFD700, // Dark yellow color
            wireframe: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Center the object on the build plate and ensure it stands upright
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        mesh.geometry.center();

        // Adjust the mesh position so its bottom sits on the build plate
        const yOffset = -geometry.boundingBox.min.z;  // Use min.z because of the rotation
        mesh.position.set(0, yOffset, 0);
        mesh.rotation.x = -Math.PI / 2; // Rotate the model 90 degrees over the Z axis

        // Adjust camera position to fit the model and build plate
        const size = geometry.boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(0, maxDim * 1.5, maxDim * 2);
        camera.lookAt(0, 0, 0);

        // Add OrbitControls for rotation and zoom
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Smooth rotation
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 10; // Minimum zoom distance
        controls.maxDistance = 500; // Maximum zoom distance

        // Render loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update(); // Only required if controls.enableDamping = true
            renderer.render(scene, camera);
        };
        animate();
    }

    onMount(() => {
        if (stlFile) {
            loadSTLFromFile(stlFile);
        } else if (stlUrl) {
            loadSTLFromURL(stlUrl);
        }
    });
</script>

<style>
    div {
        width: 100%;
        height: 100%;
    }
</style>

<div bind:this={container}></div>
