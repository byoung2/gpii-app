/**
 * The restart warning appearing at the bottom of the PSP window
 *
 * A component representing the restart warning which appears at the bottom of the PSP
 * whenever an application or the OS needs to be restarted in order for a setting to be
 * applied. Contains the restart message and the cancel, restart now and restart later
 * buttons.
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

    /**
     * A base component (controller) for display and handling of settings that require
     * restart of application or the OS. Includes logic for displaying the names of the
     * applications which require a restart and firing the appropriate events
     * when the user presses either of the three action buttons.
     * Includes three actions:
     * Cancel (undo changes); Restart now; Close and Restart later
     */
    fluid.defaults("gpii.psp.baseRestartWarning", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            pendingChanges: [],
            solutionNames: [],
            restartText: "",
            restartBtnLabel: "",

            messages: {
                osName: null,
                osRestartText: null,
                restartText: null,

                undo: null,
                applyNow: null,
                restartNow: null
            }
        },

        modelRelay: {
            solutionNames: {
                target: "solutionNames",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "gpii.psp.baseRestartWarning.getSolutionsNames",
                    args: [
                        "{that}.model.messages",
                        "{that}.model.pendingChanges"
                    ]
                }
            },
            restartText: {
                target: "restartText",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "gpii.psp.baseRestartWarning.generateRestartText",
                    args: [
                        "{that}.model.messages",
                        "{that}.model.solutionNames"
                    ]
                }
            },
            restartBtnLabel: {
                target: "restartBtnLabel",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "gpii.psp.baseRestartWarning.generateRestartBtnLabel",
                    args: [
                        "{that}.model.messages",
                        "{that}.model.solutionNames"
                    ]
                }
            }
        },
        modelListeners: {
            restartText: {
                this: "{that}.dom.restartText",
                method: "text",
                args: ["{that}.model.restartText"]
            }
        },
        selectors: {
            restartText: ".flc-restartText",
            restartNow: ".flc-restartNow",
            undo: ".flc-restartUndo"
        },
        components: {
            cancelBtn: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.undo",
                options: {
                    model: {
                        label: "{baseRestartWarning}.model.messages.undo"
                    },
                    invokers: {
                        onClick: {
                            this: "{baseRestartWarning}.events.onUndoChanges",
                            method: "fire",
                            args: ["{baseRestartWarning}.model.pendingChanges"]
                        }
                    }
                }
            },
            restartNowBtn: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.restartNow",
                options: {
                    model: {
                        label: "{baseRestartWarning}.model.restartBtnLabel"
                    },
                    invokers: {
                        onClick: {
                            this: "{baseRestartWarning}.events.onRestartNow",
                            method: "fire",
                            args: ["{baseRestartWarning}.model.pendingChanges"]
                        }
                    }
                }
            }
        },
        invokers: {
            updatePendingChanges: {
                changePath: "pendingChanges",
                value: "{arguments}.0"
            }
        },
        events: {
            onRestartNow: null,
            onUndoChanges: null
        }
    });

    /**
     * Returns the solution names (i.e. the names of the applications which should
     * be restarted) that correspond to the currently pending setting changes. If
     * a given setting does not have a solution name, its title will be used instead.
     * If there is at least one setting which requires the OS to be restarted, then
     * the only solution name that will be returned will be the OS name.
     * @param messages {Object} An object containing various messages used throughout
     * the component.
     * @param pendingChanges {Array} An array containing all pending setting changes.
     * @return the solutions names or titles corresponding to the applications
     * that need to be restarted.
     */
    gpii.psp.baseRestartWarning.getSolutionsNames = function (messages, pendingChanges) {
        var isOSRestartNeeded = fluid.find_if(pendingChanges, function (pendingChange) {
            return pendingChange.liveness === "OSRestart";
        });

        if (isOSRestartNeeded) {
            return [messages.osName];
        }

        return fluid.accumulate(pendingChanges, function (pendingChange, solutionNames) {
            var solutionName = fluid.isValue(pendingChange.solutionName) ?
                                    pendingChange.solutionName :
                                    pendingChange.schema.title;
            if (fluid.isValue(solutionName) && solutionNames.indexOf(solutionName) < 0) {
                solutionNames.push(solutionName);
            }
            return solutionNames;
        }, []);
    };

    /**
     * Returns the text which is to be displayed in the component based on the solution
     * names corresponding to the pending setting changes.
     * @param messages {Object} An object containing various messages used throughout
     * the component.
     * @param solutionNames {Array} the solutions names or titles corresponding to the
     * applications that need to be restarted.
     * @return {String} The text which is to be displayed in the component.
     */
    gpii.psp.baseRestartWarning.generateRestartText = function (messages, solutionNames) {
        if (solutionNames[0] === messages.osName) {
            return messages.osRestartText;
        }

        if (messages.restartText) {
            return fluid.stringTemplate(messages.restartText, { solutions: solutionNames.join(", ")});
        }
    };

    /**
     * Returns the label for the restart button depending on whether the OS needs to be
     * restarted or not.
     * @param messages {Object} An object containing various messages used throughout
     * the component.
     * @param solutionNames {Array} the solutions names or titles corresponding to the
     * applications that need to be restarted.
     * @return {String} The label for the restart button.
     */
    gpii.psp.baseRestartWarning.generateRestartBtnLabel = function (messages, solutionNames) {
        return solutionNames[0] === messages.osName ? messages.restartNow : messages.applyNow;
    };

    fluid.defaults("gpii.psp.restartWarning", {
        gradeNames: ["gpii.psp.baseRestartWarning"],
        model: {
            settings: []
        },
        modelRelay: {
            pendingChanges: {
                target: "pendingChanges",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "gpii.psp.restartWarning.getPendingChanges",
                    args: ["{settingsPanel}.model.pendingChanges", "{that}.model.settings"]
                }
            }
        },
        modelListeners: {
            solutionNames: {
                funcName: "gpii.psp.restartWarning.toggle",
                args: ["{change}.value", "{that}.container"]
            }
        }
    });


    /**
     * Checks if the provided `pendingChange` applies to any of the elements (or their)
     * subsettings in the `settings` array.
     * @param pendingChange {Object} A descriptor of a pending setting change.
     * @param settings {Array} An array of settings which belong to the setting group.
     * @return {Boolean} `true` if the `pendingChange` applies to any of the `settings`
     * elements and `false` otherwise.
     */
    gpii.psp.restartWarning.hasUpdatedSetting = function (pendingChange, settings) {
        return fluid.find_if(settings, function (setting) {
            // Check if the pending change applies to the setting itself
            if (setting.path === pendingChange.path) {
                return true;
            }

            // Check if the pending change applies to any of the setting's subsettings
            if (setting.settings) {
                return gpii.psp.restartWarning.hasUpdatedSetting(pendingChange, setting.settings);
            }

            return false;
        }, false);
    };

    /**
     * Given all pending setting changes and the settings for the current settings group,
     * the function returns only those pending changes which apply to the group.
     * @param pendingChanges {Array} An array of all pending setting changes.
     * @param settings {Array} An array of the settings for the settings group to which
     * this restart warning belongs.
     * @return {Array} An array of the pending settings changes which apply to the current
     * settings group.
     */
    gpii.psp.restartWarning.getPendingChanges = function (pendingChanges, settings) {
        return pendingChanges.filter(function (pendingChange) {
            return gpii.psp.restartWarning.hasUpdatedSetting(pendingChange, settings);
        });
    };

    /**
     * Shows or hides the restart warning depending on whether there is at least one app
     * that needs to be restarted in order to apply the setting changes within the group.
     * @param solutionNames {Array} the solutions names or titles corresponding to the
     * applications that need to be restarted.
     * @param container {jQuery} A jQuery object representing the element which contains
     * the restart warning.
     */
    gpii.psp.restartWarning.toggle = function (solutionNames, container) {
        container.toggle(solutionNames.length > 0);
    };
})(fluid);
