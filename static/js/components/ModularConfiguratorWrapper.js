import ModularConfigurator from "./ModularConfigurator";
import gsap from "gsap";

export default class ModularConfiguratorWrapper {
    constructor() {
        this.DOM = {
            body: "body",
            canvas: ".js-modular-configurator-viewer",
            /////////
            roomToggle: ".js-configurator-viewer-toggle-room",
            viewToggle: ".js-configurator-viewer-toggle-view",
            textureOptions: ".js-furniture-configurator-option",
            texturePreview: ".js-furniture-configurator-preview",
            envLightOptions: ".js-furniture-configurator-light-option",
            loaderLine: ".js-configurator-viewer-loader-line",
            qualityButton: ".js-furniture-configurator-quality-option",
            states: {
                isActive: "is-active",
            },
        };

        this.modelConfigurator = new ModularConfigurator({
            elementClass: this.DOM.canvas,
            modelUrl: "../static/models/modular-living.glb",
            onLoad: () => {
                this.init();
            },
        });

        this.body = document.body;
        this.envLightOptions = document.querySelectorAll(this.DOM.envLightOptions);
        this.textureOptions = document.querySelectorAll(this.DOM.textureOptions);
        this.texturePreviews = document.querySelectorAll(this.DOM.texturePreview);
        this.qualityButtons = document.querySelectorAll(this.DOM.qualityButton);
        this.roomToggle = document.querySelector(this.DOM.roomToggle);
        this.viewToggle = document.querySelector(this.DOM.viewToggle);
    }

    init() {
        if (this.envLightOptions && this.envLightOptions.length > 0) {
            this.envLightController();
        }

        if (this.textureOptions && this.textureOptions.length > 0) {
            this.textureController();
        }

        if (this.roomToggle) {
            this.roomToggleController();
        }

        if (this.viewToggle) {
            this.viewToggleController();
        }

        if (this.qualityButtons?.length > 0) {
            this.qualityController();
        }

        this.body.classList.add("is-loaded");
    }

    envLightController() {
        this.envLightOptions.forEach((option) => {
            const light = option.dataset.light || "neutral";

            option.addEventListener("click", (ev) => {
                this.setActiveClass(ev, this.envLightOptions);
                this.modelConfigurator.setEnvLight(light);
            });
        });
    }

    textureController() {
        this.textureOptions.forEach((option, index) => {
            const additionalScale = parseFloat(option.dataset.additionalScale);
            const baseTexture = option.dataset.textureBase;
            const textureAppearanceSet = option.dataset.textureAppearanceSet;

            if (!baseTexture || !textureAppearanceSet) return;

            option.addEventListener("click", (ev) => {
                this.setActiveClass(ev, this.textureOptions);
                this.setActivePreview(index, this.texturePreviews);
                this.modelConfigurator.setModelTexture(index + 1, additionalScale, baseTexture, textureAppearanceSet);
            });
        });

        const initialBaseTexture = this.textureOptions[0].dataset.textureBase || null;
        const initialTextureAppearanceSet = this.textureOptions[0].dataset.textureAppearanceSet;
        if (!initialBaseTexture || !initialTextureAppearanceSet) return;
        const initialScale = parseFloat(this.textureOptions[0].dataset.additionalScale);
        this.modelConfigurator.setModelTexture(1, initialScale, initialBaseTexture, initialTextureAppearanceSet);
    }

    setActivePreview(currentIndex, previews) {
        previews.forEach((preview) => {
            preview.classList.remove(this.DOM.states.isActive);
        });

        previews[currentIndex].classList.add(this.DOM.states.isActive);
    }

    setActiveClass(ev, options) {
        const clickedItem = ev.currentTarget;

        options.forEach((item) => {
            if (item === clickedItem) {
                item.classList.add(this.DOM.states.isActive);
            } else {
                item.classList.remove(this.DOM.states.isActive);
            }
        });
    }

    roomToggleController() {
        this.roomToggle.addEventListener("click", (ev) => {
            this.modelConfigurator.toggleRoom();
        });
    }

    viewToggleController() {
        this.viewToggle.addEventListener("click", (ev) => {
            this.modelConfigurator.toggleView();
        });
    }

    qualityController() {
        this.qualityButtons.forEach((button) => {
            button.addEventListener("click", (ev) => {
                this.setActiveClass(ev, this.qualityButtons);
                this.modelConfigurator.switchQuality(button.dataset.quality);
            });
        });
    }
}
