/**
 * The quick set strip widget
 *
 * Represents the quick set strip stepper widget. It is used for
 * incrementing/decrementing a setting.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.qssWidget.menu", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],
        model: {
            disabled: false,
            setting: {}
        },
        modelListeners: {
            setting: {
                func: "{channelNotifier}.events.onQssWidgetSettingAltered.fire",
                args: ["{change}.value"],
                includeSource: "settingAlter"
            }
        },
        selectors: {
            menuControls: ".flc-qssMenuWidget-controls"
        },
        activationParams: {},
        closeDelay: 1200,
        components: {
            repeater: {
                // TODO Perhaps add "createOnEvent" so that the component can be recreated
                // whenever the setting changes (e.g. if the change is made via the PSP)
                type: "gpii.psp.repeater",
                container: "{menu}.dom.menuControls",
                options: {
                    model: {
                        disabled: "{menu}.model.disabled",
                        items: "{menu}.model.setting.schema.enum",
                        value: "{menu}.model.setting.value",
                        styles: "{menu}.model.setting.styles"
                    },
                    dynamicContainerMarkup: {
                        container: "<div role=\"radio\" class=\"%containerClass fl-qssWidgetMenu-item fl-focusable\" tabindex=\"0\"></div>",
                        containerClassPrefix: "flc-qssWidgetMenu-item"
                    },
                    handlerType: "gpii.qssWidget.menu.presenter",
                    markup: null,
                    styles: {
                        disabled: "disabled"
                    },
                    events: {
                        onItemFocus: null
                    },
                    invokers: {
                        updateValue: {
                            funcName: "gpii.qssWidget.menu.updateValue",
                            args: [
                                "{that}",
                                "{menu}",
                                "{that}.container",
                                "{arguments}.0" // value
                            ]
                        }
                    },
                    listeners: {
                        "onCreate.enable": {
                            this: "{that}.container",
                            method: "removeClass",
                            args: ["{that}.options.styles.disabled"]
                        }
                    }
                }
            }
        },
        invokers: {
            close: {
                funcName: "gpii.qssWidget.menu.close",
                args: ["{that}", "{channelNotifier}"]
            }
        }
    });

    gpii.qssWidget.menu.updateValue = function (that, menu, container, value) {
        if (!that.model.disabled && that.model.value !== value) {
            that.applier.change("value", value, null, "settingAlter");

            // Disable interactions with the window as it is about to close
            that.applier.change("disabled", true);
            container.addClass(that.options.styles.disabled);

            menu.close();
        }
    };

    gpii.qssWidget.menu.close = function (that, channelNotifier) {
        setTimeout(function () {
            channelNotifier.events.onQssWidgetClosed.fire();
        }, that.options.closeDelay);
    };

    fluid.defaults("gpii.qssWidget.menu.presenter", {
        gradeNames: ["fluid.viewComponent", "gpii.qssWidget.button"],
        model: {
            item: null
        },
        styles: {
            active: "active"
        },
        modelListeners: {
            item: {
                this: "{that}.container",
                method: "text",
                args: ["{change}.value"]
            },
            "{repeater}.model.value": [{
                funcName: "gpii.qssWidget.menu.presenter.toggleCheckmark",
                args: ["{change}.value", "{that}.model.item", "{that}.container"]
            }, {
                funcName: "gpii.qssWidget.menu.presenter.animateActivation",
                args: ["{change}.value", "{that}.model.item", "{that}.container", "{that}.options.styles"],
                includeSource: "settingAlter"
            }]
        },
        events: {
            onItemFocus: "{repeater}.events.onItemFocus"
        },
        listeners: {
            "onCreate.applyStyles": {
                funcName: "gpii.qssWidget.menu.presenter.applyStyles",
                args: ["{that}", "{that}.container", "{repeater}.model.styles"]
            },
            onItemFocus: {
                funcName: "gpii.qssWidget.menu.presenter.focusItem",
                args: [
                    "{that}",
                    "{focusManager}",
                    "{that}.container",
                    "{arguments}.0" // index
                ]
            }
        },
        invokers: {
            activate: {
                func: "{repeater}.updateValue",
                args: ["{that}.model.item"]
            }
        }
    });

    gpii.qssWidget.menu.presenter.focusItem = function (that, focusManager, container, index) {
        if (that.model.index === index) {
            focusManager.focusElement(container, true);
        }
    };

    gpii.qssWidget.menu.presenter.toggleCheckmark = function (value, item, container) {
        container.attr("aria-checked", item === value);
    };

    gpii.qssWidget.menu.presenter.animateActivation = function (value, item, container, styles) {
        container.toggleClass(styles.active, item === value);
    };

    gpii.qssWidget.menu.presenter.applyStyles = function (that, container, styles) {
        var elementStyles = fluid.get(styles, that.model.item);
        if (elementStyles) {
            container.css(elementStyles);
        }
    };
})(fluid);
