import { ViewerApp, AssetManagerPlugin, addBasePlugins, SimpleTextPlugin, TonemapPlugin } from "webgi";
import gsap from "gsap";

export default class RingConfigurator {
    constructor(options) {
        let _defaults = {
            elementClass: "",
            modelUrl: "",
            envUrl: "",
            onLoad: () => {},
            onProgress: () => {},
        };

        this.defaults = Object.assign({}, _defaults, options);

        this.onLoad = this.defaults.onLoad;
        this.onProgress = this.defaults.onProgress;

        this.element = document.querySelector(this.defaults.elementClass);

        if (!this.element) return;

        if (history.scrollRestoration) {
            history.scrollRestoration = "manual";
        }

        this.init();
    }

    /**
     * Initializes the viewer and sets up the necessary plugins and configurations.
     */
    init() {
        const $this = this;

        async function setupViewer() {
            $this.viewer = new ViewerApp({
                canvas: $this.element,
                useRgbm: true,
                isAntialiased: false,
                useGBufferDepth: false,
            });

            $this.viewer.renderManager.displayCanvasScaling = 1.5;

            $this.manager = await $this.viewer.addPlugin(AssetManagerPlugin);
            $this.text = await $this.viewer.addPlugin(SimpleTextPlugin);
            $this.fontStyles = await (
                await fetch("https://fonts.googleapis.com/css2?family=Aboreto&family=Dancing+Script&family=Inter&display=swap")
            ).text();
            $this.text.applyToAlphaMap = false;
            $this.text.applyToBumpMap = true;

            $this.importer = $this.manager.importer;

            await addBasePlugins($this.viewer);
        }

        setupViewer().then((r) => {
            this.manager.addFromPath(this.defaults.modelUrl).then(() => {
                this.viewer.getPlugin(TonemapPlugin).config.clipBackground = true;
            });

            this.importer.addEventListener("onProgress", (ev) => {
                this.onProgress((ev.loaded / ev.total) * 100);
            });

            this.importer.addEventListener("onLoad", (ev) => {
                this.viewer.renderManager.displayCanvasScaling = 1.5;

                setTimeout(() => {
                    this.afterInit();
                }, 100);

                setTimeout(() => {
                    this.onLoad();
                }, 200);
            });
        });
    }

    /**
     * Initializes the settings and objects after the viewer is initialized.
     */
    afterInit() {
        const camera = this.viewer.scene.activeCamera;
        this.controls = camera.controls;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 15;
        this.controls.minZoom = 0;
        this.controls.maxZoom = 0;
        this.controls.minPolarAngle = 0.2;
        this.controls.maxPolarAngle = 1.6;
    }

    /**
     * Initializes the controller and sets up the materials and objects.
     */

    setModelColor(index, baseColor, modelObjects) {
        const objects = JSON.parse(modelObjects);

        objects.forEach((objectName) => {
            this.viewer.scene.traverse((child) => {
                if (child.isMesh && child.name.includes(objectName)) {
                    child.material.color.set(baseColor);
                    child.material.setDirty?.();
                }
            });
        });
    }

    autoRotate(value) {
        this.controls.autoRotate = value;
    }

    setEngravingText(modelObjects, text, fontFamily = "Inter", fontSize = 100) {
        const objects = JSON.parse(modelObjects);

        objects.forEach((engravingObject) => {
            this.viewer.scene.traverse((child) => {
                if (child.isMesh && child.name === engravingObject) {
                    this.text.updateText(child, {
                        text: text,
                        fontFamily: fontFamily,
                        style: this.fontStyles,
                        fontSize: fontSize,
                    });
                }
            });
        });
    }

    setCameraPosition(cameraPosition, noAnimation = false, faster = false) {
        const camera = this.viewer.scene.activeCamera;

        const position = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
        };

        gsap.to(position, {
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            ease: "expo.inOut",
            duration: noAnimation ? 0 : faster ? 0.7 : 1.2,
            onStart: () => {
                camera.setCameraOptions({ controlsEnabled: false });
            },
            onComplete: () => {
                camera.setCameraOptions({ controlsEnabled: true });
            },
            onUpdate: () => {
                camera.position.set(position.x, position.y, position.z);
                camera.positionTargetUpdated();
            },
        });
    }
}
