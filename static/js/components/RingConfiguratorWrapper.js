import RingConfigurator from "./RingConfigurator";
import gsap from "gsap";
import {SplitText} from "gsap/SplitText";

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
            close: ".js-ring-configurator-close",
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

            //states
            states: {
                isActive: "is-active",
                isVisible: "is-visible",
                optionsActive: "has-options-active",
            },
        };

        // general
        this.body = document.body;

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
        this.trigger = document.querySelector(this.DOM.trigger);
        this.close = document.querySelector(this.DOM.close);
        this.options = document.querySelector(this.DOM.options);
        this.engraving = document.querySelector(this.DOM.engraving);
        this.engravingText = document.querySelector(this.DOM.engravingText);
        this.engravingFont = document.querySelector(this.DOM.engravingFont);
        this.engravingSize = document.querySelector(this.DOM.engravingSize);
        this.engravingSizeValue = document.querySelector(this.DOM.engravingSizeValue);
        this.colors = document.querySelectorAll(this.DOM.colors);
        this.screenshot = document.querySelector(this.DOM.screenshot);
        this.scenes = document.querySelectorAll(this.DOM.scene);

        // timeline
        this.introTl = gsap.timeline({
            delay: 0,
            paused: true,
        });

        this.outroTl = gsap.timeline({
            delay: 0,
            paused: true,
            onComplete: () => {
                this.body.classList.add(this.DOM.states.optionsActive);
            },
        });


        // configurator
        this.modelConfigurator = new RingConfigurator({
            elementClass: this.DOM.canvas,
            modelUrl: "../static/models/pixotronics-bfs-v2.glb",
            ringOptions: window.ringOptions,
            mouseAnimation: false,
            onLoad: () => {
                this.init();
            },
            onProgress: (progress) => {
                gsap.to(this.frameBottom, {
                    duration: 0.4,
                    scaleX: progress / 100,

                    onComplete: () => {
                        this.introTl.play();
                    }
                });
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
        }

        this.initTimelines();
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

        this.introTl.add("start")
            .to([this.frameLeft, this.frameRight], {
                scaleY: 1,
                duration: 1,
                ease: "expo.inOut"
            })
            .to([this.frameTopRight, this.frameTopLeft], {
                scaleX: 1,
                duration: 0.8,
                ease: "expo.inOut"
            })
            .fromTo(logoSplit.chars, {
                autoAlpha: 0,
                yPercent: 110,
            },{
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
                }
            }, "start+=0.4")
            .to(this.tagline, {
                autoAlpha: 1,
                y: "0%",
                ease: "expo.inOut",
                duration: 0.6,
            }, "start+=1.2")
            .to(this.cta, {
                autoAlpha: 1,
                y: "0%",
                ease: "expo.inOut",
                duration: 0.8,
            }, "start+=1.4");

        this.outroTl.add("start")
            .to([this.frameTopRight, this.frameTopLeft], {
                scaleX: 0,
                duration: 0.6,
                ease: "expo.in"
            }, "start")
            .to([this.frameRight, this.frameLeft], {
                scaleY: 0,
                duration: 0.8,
                ease: "expo.inOut"
            })
            .to(this.frameBottom, {
                scaleX: 0,
                duration: 1,
                ease: "expo.inOut",
            })
            .to(logoSplit.chars,{
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
                }
            }, "start+=0.4")
            .fromTo(logoSmallSplit.chars, {
                autoAlpha: 0,
                yPercent: 110,
            },{
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
                }
            }, "start+=0.5")
            .to(this.tagline, {
                autoAlpha: 0,
                y: "-50%",
                ease: "expo.inOut",
                duration: 0.4,
            }, "start+=1")
            .to(this.cta, {
                autoAlpha: 0,
                y: "-50%",
                ease: "expo.inOut",
                duration: 0.6,
            }, "start+=1.2");
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

    configuratorToggler() {
        this.trigger.addEventListener("click", () => {
            this.outroTl.play();
        })

        this.close.addEventListener("click", () => {
            this.body.classList.remove(this.DOM.states.optionsActive);
            this.outroTl.timeScale(1.5).reverse();
        })
    }
}
