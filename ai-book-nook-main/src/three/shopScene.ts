import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function initShop(container: HTMLDivElement) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)

    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    )
    camera.position.set(0, 5, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const light = new THREE.PointLight(0xffffff, 1)
    light.position.set(5, 10, 5)
    scene.add(light)

    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    // Shelf + books
    function createShelf(x: number, z: number) {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.3, 1),
            new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
        )
        shelf.position.set(x, 1.5, z)
        scene.add(shelf)

        for (let i = 0; i < 8; i++) {
            const book = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1, 0.6),
                new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
            )
            book.position.set(x - 2.2 + i * 0.6, 2.1, z)
            scene.add(book)
        }
    }

    createShelf(0, 0)
    createShelf(0, -3)
    createShelf(0, 3)

    let animationId: number

    function animate() {
        animationId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }
    animate()

    // Cleanup function
    return () => {
        cancelAnimationFrame(animationId)
        controls.dispose()
        renderer.dispose()
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose()
                if (object.material instanceof THREE.Material) {
                    object.material.dispose()
                }
            }
        })
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement)
        }
    }
}
