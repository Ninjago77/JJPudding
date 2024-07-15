import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';

let mesh, renderer, scene, camera, controls, helper, clock;
let pointlist = [];
let dist = 0.5;
let electrons = 4;
let radius = 8;
let size = 0.1;

// // Create a texture for the minus sign
// let canvas = document.createElement('canvas');
// canvas.width = 128;
// canvas.height = 128;
// let ctx = canvas.getContext('2d');
// ctx.fillStyle = '#ffffff'; // White color
// ctx.fillRect(0, 0, canvas.width, canvas.height);

// // Apply the minus sign texture to the sphere
// let minusTexture = new THREE.CanvasTexture(canvas);
// let minusSignMaterial = new THREE.MeshBasicMaterial({ map: minusTexture });
// let minusSignGeometry = new THREE.PlaneGeometry(0.5, 0.1); // Adjust size as needed
// let minusSign = new THREE.Mesh(minusSignGeometry, minusSignMaterial);
// minusSign.position.set(0, 0, 1); // Position on the surface of the sphere

function interpolatePoint(x1, y1, z1, x2, y2, z2, v) {
    if (v < 0 || v > 1) {
        throw new Error('The value of v must be between 0 and 1');
    }

    const x = x1 + (x2 - x1) * v;
    const y = y1 + (y2 - y1) * v;
    const z = z1 + (z2 - z1) * v;

    return { x, y, z };
}

// function generateSpherePoints(x, y, z, radius, pointno) {
//     const points = [];
//     const offset = 2 / pointno;
//     const increment = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

//     for (let i = 0; i < pointno; i++) {
//         const yPos = ((i * offset) - 1) + (offset / 2);
//         const r = Math.sqrt(1 - Math.pow(yPos, 2));
//         const phi = i * increment;

//         const xPos = Math.cos(phi) * r;
//         const zPos = Math.sin(phi) * r;

//         points.push({
//             x: x + radius * xPos,
//             y: y + radius * yPos,
//             z: z + radius * zPos
//         });
//     }

//     return points;
// }

// function generateSpherePoints2(x, y, z, radius, pointno) {
//     // Initialize points randomly on the sphere
//     const points = [];
//     for (let i = 0; i < pointno; i++) {
//         const theta = Math.acos(2 * Math.random() - 1); // Polar angle
//         const phi = 2 * Math.PI * Math.random(); // Azimuthal angle

//         points.push({
//             x: x + radius * Math.sin(theta) * Math.cos(phi),
//             y: y + radius * Math.sin(theta) * Math.sin(phi),
//             z: z + radius * Math.cos(theta)
//         });
//     }

//     // Force-directed adjustment
//     const iterations = 1000;
//     const stepSize = 0.01;

//     for (let iter = 0; iter < iterations; iter++) {
//         for (let i = 0; i < pointno; i++) {
//             let forceX = 0, forceY = 0, forceZ = 0;

//             for (let j = 0; j < pointno; j++) {
//                 if (i !== j) {
//                     const dx = points[i].x - points[j].x;
//                     const dy = points[i].y - points[j].y;
//                     const dz = points[i].z - points[j].z;
//                     const distSq = dx * dx + dy * dy + dz * dz;
//                     const dist = Math.sqrt(distSq);
//                     const force = 1 / distSq;

//                     forceX += force * (dx / dist);
//                     forceY += force * (dy / dist);
//                     forceZ += force * (dz / dist);
//                 }
//             }

//             points[i].x += stepSize * forceX;
//             points[i].y += stepSize * forceY;
//             points[i].z += stepSize * forceZ;

//             // Re-normalize to keep points on the sphere surface
//             const norm = Math.sqrt(
//                 (points[i].x - x) * (points[i].x - x) +
//                 (points[i].y - y) * (points[i].y - y) +
//                 (points[i].z - z) * (points[i].z - z)
//             );
//             points[i].x = x + radius * (points[i].x - x) / norm;
//             points[i].y = y + radius * (points[i].y - y) / norm;
//             points[i].z = z + radius * (points[i].z - z) / norm;
//         }
//     }

//     return points;
// }

// function generateSpherePoints3(x, y, z, radius, pointno) {
//     const points = [];

//     // Use golden ratio to distribute points
//     const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
//     for (let i = 0; i < pointno; i++) {
//         const theta = 2 * Math.PI * i / phi; // Angle
//         const yPos = 1 - (i / (pointno - 1)) * 2; // y position
//         const radiusAtY = Math.sqrt(1 - yPos * yPos); // Radius at current y

//         const xPos = radiusAtY * Math.cos(theta);
//         const zPos = radiusAtY * Math.sin(theta);

//         points.push({
//             x: x + radius * xPos,
//             y: y + radius * yPos,
//             z: z + radius * zPos
//         });
//     }

//     return points;
// }

function generateSpherePoints4(x, y, z, radius, pointno) {
    const points = [];

    // Specific configurations for small numbers of points
    if (pointno === 1) {
        points.push({ x, y, z: z + radius });
    } else if (pointno === 2) {
        points.push({ x, y, z: z + radius });
        points.push({ x, y, z: z - radius });
    } else if (pointno === 3) {
        points.push({ x: x + radius, y, z });
        points.push({ x: x - radius * 0.5, y: y + Math.sqrt(3) * radius * 0.5, z });
        points.push({ x: x - radius * 0.5, y: y - Math.sqrt(3) * radius * 0.5, z });
    } else if (pointno === 4) {
        points.push({ x: x + radius / Math.sqrt(3), y: y + radius / Math.sqrt(3), z: z + radius / Math.sqrt(3) });
        points.push({ x: x - radius / Math.sqrt(3), y: y - radius / Math.sqrt(3), z: z + radius / Math.sqrt(3) });
        points.push({ x: x - radius / Math.sqrt(3), y: y + radius / Math.sqrt(3), z: z - radius / Math.sqrt(3) });
        points.push({ x: x + radius / Math.sqrt(3), y: y - radius / Math.sqrt(3), z: z - radius / Math.sqrt(3) });
    } else {
        // General approach using repulsion algorithm for larger numbers of points
        const repulsionPoints = generateRepulsionPoints(pointno);
        for (let i = 0; i < repulsionPoints.length; i++) {
            points.push({
                x: x + radius * repulsionPoints[i][0],
                y: y + radius * repulsionPoints[i][1],
                z: z + radius * repulsionPoints[i][2],
            });
        }
    }

    return points;
}

function generateRepulsionPoints(pointno) {
    const points = [];
    const epsilon = 1e-9; // Small number to avoid division by zero
    const maxIterations = 1000; // Maximum number of iterations for the optimization
    const stepSize = 0.01; // Step size for the optimization

    // Initialize points on the surface of the sphere
    for (let i = 0; i < pointno; i++) {
        const theta = Math.acos(1 - 2 * (i + 0.5) / pointno);
        const phi = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
        points.push([Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)]);
    }

    // Optimize the positions using repulsion forces
    for (let iter = 0; iter < maxIterations; iter++) {
        const forces = new Array(pointno).fill(null).map(() => [0, 0, 0]);

        // Calculate repulsion forces
        for (let i = 0; i < pointno; i++) {
            for (let j = i + 1; j < pointno; j++) {
                const dx = points[i][0] - points[j][0];
                const dy = points[i][1] - points[j][1];
                const dz = points[i][2] - points[j][2];
                const distanceSquared = dx * dx + dy * dy + dz * dz + epsilon;
                const force = 1 / distanceSquared;

                forces[i][0] += force * dx;
                forces[i][1] += force * dy;
                forces[i][2] += force * dz;
                forces[j][0] -= force * dx;
                forces[j][1] -= force * dy;
                forces[j][2] -= force * dz;
            }
        }

        // Update positions
        for (let i = 0; i < pointno; i++) {
            points[i][0] += stepSize * forces[i][0];
            points[i][1] += stepSize * forces[i][1];
            points[i][2] += stepSize * forces[i][2];

            // Normalize to the surface of the sphere
            const length = Math.sqrt(points[i][0] * points[i][0] + points[i][1] * points[i][1] + points[i][2] * points[i][2]);
            points[i][0] /= length;
            points[i][1] /= length;
            points[i][2] /= length;
        }
    }

    return points;
}

function positiveSymbol() {
    const diffR = radius * .8;

    const pointOnSphere = new THREE.Vector3(0,0,0 + (radius *.95));

    // Create the cuboid
    const cuboidSize = diffR;
    const cuboidGeometry1 = new THREE.BoxGeometry(cuboidSize, cuboidSize * 0.2, cuboidSize * 0.2);
    const cuboidGeometry2 = new THREE.BoxGeometry(cuboidSize * 0.2, cuboidSize, cuboidSize * 0.2);
    const cuboidMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
    const cuboid1 = new THREE.Mesh(cuboidGeometry1, cuboidMaterial);
    const cuboid2 = new THREE.Mesh(cuboidGeometry2, cuboidMaterial);

    // Position the cuboid
    cuboid1.position.set(pointOnSphere.x, pointOnSphere.y, pointOnSphere.z);
    cuboid2.position.set(pointOnSphere.x, pointOnSphere.y, pointOnSphere.z);

    const group = new THREE.Group();
    group.add(cuboid1);
    group.add(cuboid2);
    scene.add(group);
}

init();
animate();

function init() {

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.autoClear = false;
    document.body.appendChild( renderer.domElement );

    // scene
    scene = new THREE.Scene();
    
    // camera
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 20, 20, 20 );

    // controls
    controls = new OrbitControls( camera, renderer.domElement );
    
    // clock    
    clock = new THREE.Clock();
    
    // ambient
    scene.add( new THREE.AmbientLight( 0x333333 ) );
    
    // light
    const light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 10 , 10 , 10 );
    scene.add( light );


    // axes
    scene.add( new THREE.AxesHelper( 20 ) );

    // geometry
    const geometry = new THREE.SphereGeometry( radius, 32, 16 );

    // // material
    // const material = new THREE.MeshPhongMaterial( {
    //     color: 0x00ffff, 
    //     flatShading: true,
    //     transparent: true,
    //     opacity: 0.7,
    // } );
    
    // // mesh
    // mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );
    
    // Create the translucent material
    const material = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.6,
        shininess: 100
      });
  
    // Create the mesh and add it to the scene
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    positiveSymbol();

    function updateElectrons() {
        if (pointlist.length != 0) {
            pointlist.forEach((point) => {
                scene.remove(point);
            })
        }

        pointlist = [];

        generateSpherePoints4(0,0,0,radius,electrons).forEach((point) => {
            const geometry = new THREE.SphereGeometry( radius*size, 32, 16 );
            const material = new THREE.MeshPhongMaterial({
                color: 0x0077ff,
                // transparent: true,
                // opacity: 0.5,
                shininess: 100
              });
            const sphere = new THREE.Mesh(geometry, material);
            var newp = interpolatePoint(0,0,0,point.x,point.y,point.z,dist);
            sphere.position.set(newp.x,newp.y,newp.z);
            // sphere.position.set(point.x,point.y,point.z);

            // Define the left-forward most point on the sphere's surface
            const pointOnSphere = new THREE.Vector3(newp.x, newp.y, newp.z + (radius * size));

            // Create the cuboid
            const cuboidSize = size * radius;
            const cuboidGeometry = new THREE.BoxGeometry(cuboidSize, cuboidSize * 0.2, cuboidSize * 0.2);
            const cuboidMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
            const cuboid = new THREE.Mesh(cuboidGeometry, cuboidMaterial);

            // Position the cuboid
            cuboid.position.set(pointOnSphere.x, pointOnSphere.y, pointOnSphere.z);
            const group = new THREE.Group();
            group.add(sphere);
            group.add(cuboid);
            
            pointlist.push(group);
        })
        
        pointlist.forEach((pointGroup) => {
            scene.add(pointGroup);
        })
    }

    updateElectrons();

    // Add event listener for the slider
    const distanceSlider = document.getElementById('distanceSlider');
    distanceSlider.addEventListener('input', (event) => {
        const v = parseFloat(event.target.value);
        dist = v;
        updateElectrons();
    });

    // Add event listener for the slider
    const electronNoSlider = document.getElementById('electronNoSlider');
    electronNoSlider.addEventListener('input', (event) => {
        const v = parseInt(event.target.value);
        electrons = v;
        updateElectrons();
    });

    // Add event listener for the slider
    const electronSizeSlider = document.getElementById('electronSizeSlider');
    electronSizeSlider.addEventListener('input', (event) => {
        const v = parseFloat(event.target.value);
        size = v;
        updateElectrons();
    });
    

    // helper
    helper = new ViewHelper( camera, renderer.domElement );
    helper.controls = controls;
    helper.controls.center = controls.target;
    
    const div = document.createElement( 'div' );
    div.id = 'viewHelper';
    div.style.position = 'absolute';
    div.style.right = 0;
    div.style.bottom = 0;
    div.style.height = '128px';
    div.style.width = '128px';

    document.body.appendChild( div );

    div.addEventListener( 'pointerup', (event) => helper.handleClick( event ) );

}

function animate() {

    requestAnimationFrame( animate );
    
    const delta = clock.getDelta();
    
    if ( helper.animating ) helper.update( delta );
    
    renderer.clear();
    
    renderer.render( scene, camera );
    
   	helper.render( renderer );

}
