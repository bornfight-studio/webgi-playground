import RingConfigurator from "./RingConfigurator";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import is from "is_js";

gsap.registerPlugin(SplitText);

export default class ModelConfiguratorWrapper {
    constructor() {
        this.DOM = {
            // general
            body: "body",

            // UI
            logo: ".js-logo",
            logoSmall: ".js-logo-small",
            tagline: ".js-tagline",
            cta: ".js-cta",
            frame: {
                wrapper: ".js-frame",
                topLeft: ".js-frame-top-left",
                topRight: ".js-frame-top-right",
                left: ".js-frame-left",
                right: ".js-frame-right",
                bottom: ".js-frame-bottom",
            },

            // configurator
            canvas: ".js-ring-configurator-viewer",
            trigger: ".js-ring-configurator-trigger",
            inputWrappers: ".js-ring-configurator-input-wrapper",
            inputsInner: ".js-ring-configurator-inputs-inner",
            inputWrapperTriggers: ".js-ring-configurator-input-wrapper-tab-trigger",
            inputs: ".js-ring-configurator-inputs",
            close: ".js-ring-configurator-close",
            colors: ".js-ring-configurator-colors",
            colorOption: ".js-ring-configurator-color",
            screenshot: ".js-ring-configurator-screenshot",
            scene: ".js-ring-configurator-scene",
            engravingFont: ".js-ring-configurator-engraving-font",
            engravingText: ".js-ring-configurator-engraving-text",
            engravingSize: ".js-ring-configurator-engraving-size",
            engravingSizeValue: ".js-ring-configurator-engraving-size-value",

            //states
            states: {
                isActive: "is-active",
                isVisible: "is-visible",
                optionsActive: "has-options-active",
                isZoomed: "is-zoomed",
                isDragging: "is-dragging",
            },
        };

        // general
        this.body = document.body;
        this.isLoaded = false;
        this.isMousePressed = false;
        this.isDragging = false;

        // UI
        this.logo = document.querySelector(this.DOM.logo);
        this.logoSmall = document.querySelector(this.DOM.logoSmall);
        this.tagline = document.querySelector(this.DOM.tagline);
        this.cta = document.querySelector(this.DOM.cta);
        this.frameTopLeft = document.querySelector(this.DOM.frame.topLeft);
        this.frameTopRight = document.querySelector(this.DOM.frame.topRight);
        this.frameBottom = document.querySelector(this.DOM.frame.bottom);
        this.frameLeft = document.querySelector(this.DOM.frame.left);
        this.frameRight = document.querySelector(this.DOM.frame.right);

        // configurator
        this.inputsInner = document.querySelector(this.DOM.inputsInner);
        this.trigger = document.querySelector(this.DOM.trigger);
        this.inputWrappers = document.querySelectorAll(this.DOM.inputWrappers);
        this.inputWrapperTriggers = document.querySelectorAll(this.DOM.inputWrapperTriggers);
        this.close = document.querySelector(this.DOM.close);
        this.inputs = document.querySelector(this.DOM.inputs);
        this.engravingText = document.querySelector(this.DOM.engravingText);
        this.engravingFont = document.querySelector(this.DOM.engravingFont);
        this.engravingSize = document.querySelector(this.DOM.engravingSize);
        this.engravingSizeValue = document.querySelector(this.DOM.engravingSizeValue);
        this.colors = document.querySelectorAll(this.DOM.colors);
        this.screenshot = document.querySelector(this.DOM.screenshot);
        this.scenes = document.querySelectorAll(this.DOM.scene);

        this.canvasElement = document.querySelector(this.DOM.canvas);

        this.matchMedia = gsap.matchMedia();

        // timeline
        this.introTl = gsap.timeline({
            delay: 0,
            paused: true,
        });

        this.outroTl = gsap.timeline({
            delay: 0,
            paused: true,
            onStart: () => {
                this.body.classList.add(this.DOM.states.optionsActive);
                this.modelConfigurator.autoRotate(false);
                this.setInitialCamPosition(false, true);
            },
            onReverseComplete: () => {
                this.modelConfigurator.autoRotate(true);
            },
        });

        // configurator
        this.modelConfigurator = new RingConfigurator({
            elementClass: this.DOM.canvas,
            modelUrl: "../static/models/pixotronics-bfs-v7.glb",
            ringOptions: window.ringOptions,
            mouseAnimation: false,
            onLoad: () => {
                if (!this.isLoaded) {
                    this.modelConfigurator.autoRotate(true);

                    this.init();

                    this.setInitialCamPosition(true);

                    this.canvasElement.classList.add(this.DOM.states.isVisible);

                    this.isLoaded = true;
                }
            },
            onProgress: (progress) => {
                if (!this.isLoaded) {
                    gsap.to(this.frameBottom, {
                        duration: 0.4,
                        scaleX: progress / 100,

                        onComplete: () => {
                            this.introTl.play();
                        },
                    });
                }
            },
        });
    }

    init() {
        if (this.colors && this.colors.length > 0) {
            this.colorController();
            this.keyboardShortcut();
            this.takeScreenshot("ring-configurator.png");
            this.sceneToggler();
            this.configuratorToggler();
            this.engravingController();
            this.tabsController();
            this.showHideOnDrag();
        }

        this.initTimelines();
    }

    showHideOnDrag() {
        if (is.not.touchDevice()) {
            this.modelConfigurator.element.addEventListener("mousedown", () => {
                this.isMousePressed = true;
            });

            this.modelConfigurator.element.addEventListener("mouseup", () => {
                this.isMousePressed = false;
                this.isDragging = false;
                this.inputs.classList.remove(this.DOM.states.isDragging);
            });

            this.modelConfigurator.element.addEventListener("mousemove", () => {
                if (this.isMousePressed) {
                    if (!this.isDragging) {
                        this.isDragging = true;
                        this.inputs.classList.add(this.DOM.states.isDragging);
                    }
                }
            });
        } else {
            this.modelConfigurator.element.addEventListener("touchstart", () => {
                this.isMousePressed = true;
            });

            this.modelConfigurator.element.addEventListener("touchend", () => {
                this.isMousePressed = false;
                this.isDragging = false;
                this.inputs.classList.remove(this.DOM.states.isDragging);
            });

            this.modelConfigurator.element.addEventListener("touchmove", () => {
                if (this.isMousePressed) {
                    if (!this.isDragging) {
                        this.isDragging = true;
                        this.inputs.classList.add(this.DOM.states.isDragging);
                    }
                }
            });
        }
    }

    setInitialCamPosition(intro = false, faster = false) {
        let camPosition = {
            x: 5.32,
            y: 6.32,
            z: 4.48,
        };

        let animation = !intro;

        this.matchMedia.add("(max-width: 800px)", () => {
            camPosition = {
                x: 6.98,
                y: 5.71,
                z: 6,
            };
        });

        this.matchMedia.add("(max-width: 490px)", () => {
            camPosition = {
                x: 10.32,
                y: 9.32,
                z: 5.48,
            };
        });

        this.modelConfigurator.setCameraPosition(camPosition, !animation, faster);
    }

    tabsController() {
        let currentActive = 0;

        if (this.inputWrapperTriggers && this.inputWrapperTriggers.length > 0 && this.inputWrapperTriggers.length === this.inputWrappers.length) {
            this.inputWrapperTriggers.forEach((trigger, index) => {
                trigger.addEventListener("click", () => {
                    this.inputWrappers[currentActive].classList.remove(this.DOM.states.isActive);
                    this.inputWrappers[index].classList.add(this.DOM.states.isActive);

                    this.inputWrapperTriggers[currentActive].classList.remove(this.DOM.states.isActive);
                    this.inputWrapperTriggers[index].classList.add(this.DOM.states.isActive);

                    this.inputsInner.classList.remove(`active-${currentActive + 1}`);
                    this.inputsInner.classList.add(`active-${index + 1}`);

                    currentActive = index;
                });
            });
        }
    }

    initTimelines() {
        const logoSplit = new SplitText(this.logo, {
            type: "chars",
            charsClass: "u-split-text-char",
        });
        const logoSmallSplit = new SplitText(this.logoSmall, {
            type: "chars",
            charsClass: "u-split-text-char",
        });

        this.introTl
            .add("start")
            .to([this.frameLeft, this.frameRight], {
                scaleY: 1,
                duration: 1,
                ease: "expo.inOut",
            })
            .to([this.frameTopRight, this.frameTopLeft], {
                scaleX: 1,
                duration: 0.8,
                ease: "expo.inOut",
            })
            .fromTo(
                logoSplit.chars,
                {
                    autoAlpha: 0,
                    yPercent: 110,
                },
                {
                    duration: 1,
                    autoAlpha: 1,
                    yPercent: 0,
                    ease: "expo.out",
                    stagger: {
                        from: "center",
                        each: 0.075,
                    },
                    onStart: () => {
                        this.logo.classList.add(this.DOM.states.isVisible);
                    },
                },
                "start+=0.4",
            )
            .to(
                this.tagline,
                {
                    autoAlpha: 1,
                    y: "0%",
                    ease: "expo.inOut",
                    duration: 0.6,
                },
                "start+=1.2",
            )
            .to(
                this.cta,
                {
                    autoAlpha: 1,
                    y: "0%",
                    ease: "expo.inOut",
                    duration: 0.8,
                },
                "start+=1.4",
            );

        this.outroTl
            .add("start")
            .to(
                [this.frameTopRight, this.frameTopLeft],
                {
                    scaleX: 0,
                    duration: 0.6,
                    ease: "expo.in",
                },
                "start",
            )
            .to([this.frameRight, this.frameLeft], {
                scaleY: 0,
                duration: 0.8,
                ease: "expo.inOut",
            })
            .to(this.frameBottom, {
                scaleX: 0,
                duration: 1,
                ease: "expo.inOut",
            })
            .to(
                logoSplit.chars,
                {
                    duration: 1,
                    autoAlpha: 0,
                    yPercent: -100,
                    ease: "expo.inOut",
                    stagger: {
                        from: "center",
                        each: 0.075,
                    },
                    onStart: () => {
                        this.logo.classList.add(this.DOM.states.isVisible);
                    },
                },
                "start+=0.4",
            )
            .fromTo(
                logoSmallSplit.chars,
                {
                    autoAlpha: 0,
                    yPercent: 110,
                },
                {
                    duration: 1,
                    autoAlpha: 1,
                    yPercent: 0,
                    ease: "expo.inOut",
                    stagger: {
                        from: "center",
                        each: 0.075,
                    },
                    onStart: () => {
                        this.logoSmall.classList.add(this.DOM.states.isVisible);

                        this.canvasElement.classList.add(this.DOM.states.isZoomed);
                    },
                },
                "start+=0.5",
            )
            .to(
                this.tagline,
                {
                    autoAlpha: 0,
                    y: "-50%",
                    ease: "expo.inOut",
                    duration: 0.4,
                },
                "start+=1",
            )
            .to(
                this.cta,
                {
                    autoAlpha: 0,
                    y: "-50%",
                    ease: "expo.inOut",
                    duration: 0.6,
                    onComplete: () => {
                        this.inputs.classList.add(this.DOM.states.isVisible);
                    },
                },
                "start+=1.2",
            );
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

        this.modelConfigurator.setEngravingText(engravingObject, text, font, size);

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
        });

        this.engravingSize.addEventListener("input", (ev) => {
            this.engravingSizeValue.innerText = String(ev.target.value).padStart(3, "0");
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
            this.inputWrappers.forEach((inputWrapper) => {
                inputWrapper.remove();
            });
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
        if (!this.screenshot) return;

        const MIME_TYPE = "image/png";

        this.screenshot.addEventListener("click", () => {
            const imgURL = this.canvasElement.toDataURL(MIME_TYPE);

            const dlLink = document.createElement("a");
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

                if (ev.currentTarget.dataset?.cameraPosition) {
                    let cameraPosition = JSON.parse(ev.currentTarget.dataset.cameraPosition);

                    this.matchMedia.add("(max-width: 1040px)", () => {
                        if (ev.currentTarget.dataset.cameraIpadPosition) cameraPosition = JSON.parse(ev.currentTarget.dataset.cameraIpadPosition);
                    });

                    this.matchMedia.add("(max-width: 800px)", () => {
                        if (ev.currentTarget.dataset.cameraTabletPosition) cameraPosition = JSON.parse(ev.currentTarget.dataset.cameraTabletPosition);
                    });

                    this.matchMedia.add("(max-width: 490px)", () => {
                        if (ev.currentTarget.dataset.cameraMobilePosition) cameraPosition = JSON.parse(ev.currentTarget.dataset.cameraMobilePosition);
                    });

                    this.modelConfigurator.setCameraPosition(cameraPosition);
                }
            });
        });
    }

    configuratorToggler() {
        this.trigger.addEventListener("click", () => {
            this.outroTl.play();
        });

        this.close.addEventListener("click", () => {
            this.setInitialCamPosition(false, true);

            this.body.classList.remove(this.DOM.states.optionsActive);
            this.inputs.classList.remove(this.DOM.states.isVisible);

            this.outroTl.timeScale(1.5).reverse();

            setTimeout(() => {
                this.inputWrapperTriggers[0]?.click();
                this.canvasElement.classList.remove(this.DOM.states.isZoomed);
            }, 300);
        });
    }
}
