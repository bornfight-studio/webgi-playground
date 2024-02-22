import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ViewerApp, AssetManagerPlugin, addBasePlugins } from "webgi";

gsap.registerPlugin(ScrollTrigger);

export default class ModularConfigurator {
    /**
     * Constructor for the class.
     *
     * @param {Object} options - An object containing options for the constructor.
     * @param {string} options.elementClass - The class of the element.
     * @param {string} options.modelUrl - The URL of the model.
     */
    constructor(options) {
        let _defaults = {
            elementClass: "",
            modelUrl: "",
        };

        this.defaults = Object.assign({}, _defaults, options);

        console.log(this.defaults.modelUrl);
        this.body = document.body;

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
                // caching: true,
                canvas: $this.element,
                // useRgbm: true,
                // isAntialiased: false,
                // useGBufferDepth: false,
            });

            // $this.viewer.renderManager.displayCanvasScaling = Math.min(2, window.devicePixelRatio) * 1.25;
            // $this.viewer.renderManager.displayCanvasScaling = 1.5;

            $this.manager = await $this.viewer.addPlugin(AssetManagerPlugin);

            $this.importer = $this.manager.importer;

            await addBasePlugins($this.viewer);

            $this.viewer.renderer.refreshPipeline();
        }

        setupViewer().then((r) => {
            this.manager.addFromPath(this.defaults.modelUrl).then((r) => {});

            this.importer.addEventListener("onLoad", (ev) => {
                setTimeout(() => {
                    this.afterInit();
                }, 100);
            });
        });
    }

    /**
     * Initializes the settings and objects after the viewer is initialized.
     */
    afterInit() {
        const camera = this.viewer.scene.activeCamera;
        const controls = camera.controls;
        controls.minDistance = 0.95;
        controls.maxDistance = 1.5;
        controls.minZoom = 0;
        controls.maxZoom = 0;
        controls.minPolarAngle = 0.2;
        controls.maxPolarAngle = 1.6;
    }
}
