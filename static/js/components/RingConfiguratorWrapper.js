import RingConfigurator from "./RingConfigurator";

export default class ModelConfiguratorWrapper {
    constructor() {
        this.DOM = {
            body: "body",
            canvas: ".js-ring-configurator-viewer",
            options: ".js-ring-configurator-options",
            colors: ".js-ring-configurator-colors",
            colorOption: ".js-ring-configurator-color",
            screenshot: ".js-ring-configurator-screenshot",
            scene: ".js-ring-configurator-scene",
            engraving: ".js-ring-configurator-engraving",
            engravingFont: ".js-ring-configurator-engraving-font",
            engravingText: ".js-ring-configurator-engraving-text",
            engravingSize: ".js-ring-configurator-engraving-size",
            engravingSizeValue: ".js-ring-configurator-engraving-size-value",
            states: {
                isActive: "is-active",
                isVisible: "is-visible",
                optionsActive: "has-options-active",
            },
        };

        this.modelConfigurator = new RingConfigurator({
            elementClass: this.DOM.canvas,
            modelUrl: "../static/models/ring-engraving-v7.glb",
            ringOptions: window.ringOptions,
            mouseAnimation: false,
            onLoad: () => {
                this.init();
            },
            onProgress: (progress) => {
                console.log(progress);
            },
        });

        this.body = document.body;
        this.options = document.querySelector(this.DOM.options);
        this.engraving = document.querySelector(this.DOM.engraving);
        this.engravingText = document.querySelector(this.DOM.engravingText);
        this.engravingFont = document.querySelector(this.DOM.engravingFont);
        this.engravingSize = document.querySelector(this.DOM.engravingSize);
        this.engravingSizeValue = document.querySelector(this.DOM.engravingSizeValue);
        this.colors = document.querySelectorAll(this.DOM.colors);
        this.screenshot = document.querySelector(this.DOM.screenshot);
        this.scenes = document.querySelectorAll(this.DOM.scene);
    }

    init() {
        if (this.colors && this.colors.length > 0) {
            this.colorController();
            this.keyboardShortcut();
            this.takeScreenshot("ring-configurator.png");
            this.sceneToggler();
            this.engravingController();
        }
    }

    colorController() {
        this.colors.forEach((colorSet) => {
            const colorOptions = colorSet.querySelectorAll(this.DOM.colorOption);

            colorOptions.forEach((option, index) => {
                const baseColor = option.dataset.color;
                const modelObject = option.dataset.modelObject;

                if (!baseColor) return;

                option.addEventListener("click", (ev) => {
                    this.setActiveClass(ev, colorOptions);
                    this.modelConfigurator.setModelColor(index + 1, baseColor, modelObject);
                });
            });
        });
    }

    engravingController() {
        const engravingObject = this.engravingText.dataset.engravingObject;
        let text = this.engravingText.value;
        let font = this.engravingFont.value;
        let size = this.engravingSize.value;

        this.engravingText.addEventListener("input", (ev) => {
            text = ev.target.value;
            // Remove special characters using regex
            text = text.replace(/[^a-zA-Z0-9 .,:;—&*/$%#!?šđčćž❤-]/g, "");
            ev.target.value = text;

            this.modelConfigurator.setEngravingText(engravingObject, text, font, size);
        });

        this.engravingFont.addEventListener("change", (ev) => {
            font = ev.target.value;

            this.modelConfigurator.setEngravingText(engravingObject, text, font, size);
        });

        this.engravingSize.addEventListener("change", (ev) => {
            size = ev.target.value;
            this.modelConfigurator.setEngravingText(engravingObject, text, font, size);
            this.engravingSizeValue.innerText = size;
        });
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

    keyboardShortcut() {
        if (this.body.dataset.showConfigurator === "false") {
            this.options.remove();
            this.engraving.remove();
        }

        document.addEventListener("keyup", (ev) => {
            if (ev.keyCode === 79 && ev.altKey) {
                if (this.body.classList.contains(this.DOM.states.optionsActive)) {
                    this.body.classList.remove(this.DOM.states.optionsActive);
                } else {
                    this.body.classList.add(this.DOM.states.optionsActive);
                }
            }
        });
    }

    takeScreenshot(fileName) {
        const canvasElement = document.querySelector(this.DOM.canvas);
        const MIME_TYPE = "image/png";

        this.screenshot.addEventListener("click", () => {
            var imgURL = canvasElement.toDataURL(MIME_TYPE);

            var dlLink = document.createElement("a");
            dlLink.classList.add("is-visually-hidden");
            dlLink.download = fileName;
            dlLink.href = imgURL;
            dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(":");

            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
        });
    }

    sceneToggler() {
        this.scenes.forEach((scene) => {
            scene.addEventListener("click", (ev) => {
                this.setActiveClass(ev, this.scenes);

                const cameraPosition = JSON.parse(ev.currentTarget.dataset.cameraPosition);
                this.modelConfigurator.setCameraPosition(cameraPosition);
            });
        });
    }
}
