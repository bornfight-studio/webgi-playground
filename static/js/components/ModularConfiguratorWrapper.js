import ModularConfigurator from "./ModularConfigurator";
import gsap from "gsap";

export default class ModularConfiguratorWrapper {
    constructor() {
        this.DOM = {
            body: "body",
            canvas: ".js-modular-configurator-viewer",
        };

        this.modelConfigurator = new ModularConfigurator({
            elementClass: this.DOM.canvas,
            modelUrl: "../static/models/modular-living.glb",
            onLoad: () => {
                this.init();
            },
        });

        this.body = document.body;
    }

    init() {
        this.body.classList.add("is-loaded");
    }
}
