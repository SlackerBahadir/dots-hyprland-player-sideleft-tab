const { Gdk } = imports.gi;
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
const { Box, Button, EventBox, Label, Revealer, Scrollable, Stack } = Widget;
const { execAsync, exec } = Utils;
import { MaterialIcon } from '../.commonwidgets/materialicon.js';
import { setupCursorHover } from '../.widgetutils/cursorhover.js';
import toolBox from './toolbox.js';
import apiWidgets from './apiwidgets.js';
import { chatEntry } from './apiwidgets.js';
import { TabContainer } from '../.commonwidgets/tabcontainer.js';
import { checkKeybind } from '../.widgetutils/keybind.js';
import { updateNestedProperty } from '../.miscutils/objects.js';
import playerWidget from './player.js';

const AGS_CONFIG_FILE = `${App.configDir}/user_options.jsonc`;

const SIDEBARTABS = {
    'apis': {
        name: 'apis',
        content: () => {
            try {
                // apiWidgets is returning an object, not a function
                // We need to check if it's a widget or needs to be treated differently
                const result = apiWidgets();
                console.log('apiWidgets returned:', result);
                
                // Check if it's already a widget by looking for widget-like properties
                if (result && result.get_children) {
                    return result;
                } else {
                    // If it's not a proper widget, create a placeholder
                    console.warn('apiWidgets did not return a proper widget, creating placeholder');
                    return Box({
                        vertical: true,
                        className: 'spacing-v-15',
                        children: [
                            Label({ 
                                className: 'txt txt-title-small',
                                label: '⚠️ API Widgets', 
                                xalign: 0 
                            }),
                            Label({ 
                                className: 'txt-subtext',
                                label: 'The apiwidgets.js file needs to be fixed to return a proper Widget component.',
                                wrap: true,
                                xalign: 0
                            }),
                        ]
                    });
                }
            } catch (error) {
                console.error('Error in apiWidgets:', error);
                return Box({
                    vertical: true,
                    children: [
                        Label({ label: 'Error loading API widgets' }),
                        Label({ label: error.message, className: 'txt-smallie txt-subtext' })
                    ]
                });
            }
        },
        materialIcon: 'api',
        friendlyName: 'APIs',
    },
    'tools': {
        name: 'tools',
        content: () => {
            try {
                // toolBox is returning an object, not a function
                const result = toolBox();
                console.log('toolBox returned:', result);
                
                // Check if it's already a widget by looking for widget-like properties
                if (result && result.get_children) {
                    return result;
                } else {
                    // If it's not a proper widget, create a placeholder
                    console.warn('toolBox did not return a proper widget, creating placeholder');
                    return Box({
                        vertical: true,
                        className: 'spacing-v-15',
                        children: [
                            Label({ 
                                className: 'txt txt-title-small',
                                label: '🔧 Tool Box', 
                                xalign: 0 
                            }),
                            Label({ 
                                className: 'txt-subtext',
                                label: 'The toolbox.js file needs to be fixed to return a proper Widget component.',
                                wrap: true,
                                xalign: 0
                            }),
                        ]
                    });
                }
            } catch (error) {
                console.error('Error in toolBox:', error);
                return Box({
                    vertical: true,
                    children: [
                        Label({ label: 'Error loading toolbox' }),
                        Label({ label: error.message, className: 'txt-smallie txt-subtext' })
                    ]
                });
            }
        },
        materialIcon: 'home_repair_service',
        friendlyName: 'Tools',
    },
    'player': {
        name: 'player',
        content: () => {
            try {
                return playerWidget();
            } catch (error) {
                console.error('Error in playerWidget:', error);
                return Box({
                    vertical: true,
                    children: [Label({ label: 'Error loading player' })]
                });
            }
        },
        materialIcon: 'music_note',
        friendlyName: 'Player',
    },
}

// Debug: Log the current order to help troubleshoot
console.log('userOptions.sidebar.pages.order:', userOptions?.sidebar?.pages?.order);

// Make sure userOptions.sidebar.pages.order includes 'player'
// If it doesn't exist, provide a fallback
const defaultOrder = ['apis', 'tools', 'player'];
let sidebarOrder;

if (userOptions && userOptions.sidebar && userOptions.sidebar.pages && userOptions.sidebar.pages.order) {
    sidebarOrder = userOptions.sidebar.pages.order;
    // Add player if it's not in the order
    if (!sidebarOrder.includes('player')) {
        sidebarOrder = [...sidebarOrder, 'player'];
        console.log('Added player to sidebar order:', sidebarOrder);
    }
} else {
    sidebarOrder = defaultOrder;
    console.log('Using default sidebar order:', sidebarOrder);
}

const CONTENTS = sidebarOrder.map((tabName) => {
    const tab = SIDEBARTABS[tabName];
    if (!tab) {
        console.warn(`Tab '${tabName}' not found in SIDEBARTABS`);
    }
    return tab;
}).filter(Boolean);

console.log('Final CONTENTS:', CONTENTS.map(c => c.name));

const expandButton = Button({
    attribute: {
        'enabled': false,
        'toggle': (self) => {
            self.attribute.enabled = !self.attribute.enabled;
            // We don't expand the bar, but the expand button. Funny hax but it works
            // (somehow directly expanding the sidebar directly makes it unable to unexpand)
            self.toggleClassName('sidebar-expandbtn-enabled', self.attribute.enabled);
            self.toggleClassName('sidebar-controlbtn-enabled', self.attribute.enabled);
        },
    },
    vpack: 'start',
    className: 'sidebar-controlbtn',
    child: MaterialIcon('expand_content', 'larger'),
    tooltipText: `Expand sidebar (${userOptions.keybinds.sidebar.expand})`,
    onClicked: (self) => self.attribute.toggle(self),
    setup: setupCursorHover,
})

export const widgetContent = TabContainer({
    icons: CONTENTS.map((item) => item.materialIcon),
    names: CONTENTS.map((item) => item.friendlyName),
    children: CONTENTS.map((item, index) => {
        console.log(`Creating tab content for: ${item.name} at index ${index}`);
        try {
            const content = item.content(); // Always call as function since we defined them as functions
            console.log(`Successfully created content for ${item.name}:`, content);
            
            // Additional validation
            if (!content || typeof content !== 'object') {
                console.error(`Invalid content returned for ${item.name}:`, content);
                return Widget.Box({
                    vertical: true,
                    children: [Widget.Label({ label: `Invalid content for ${item.name}` })]
                });
            }
            
            return content;
        } catch (error) {
            console.error(`Error creating content for ${item.name}:`, error);
            return Widget.Box({
                vertical: true,
                children: [Widget.Label({ label: `Error loading ${item.name}: ${error.message}` })]
            });
        }
    }),
    className: 'sidebar-left spacing-v-10',
    initIndex: CONTENTS.findIndex(obj => obj.name === userOptions.sidebar.pages.defaultPage),
    onChange: (self, index) => {
        const pageName = CONTENTS[index].name;
        console.log(`Tab changed to: ${pageName} (index: ${index})`);
        console.log(`Available children in stack:`, self.attribute.children.length);
        
        const option = 'sidebar.pages.defaultPage';
        updateNestedProperty(userOptions, option, pageName);
        execAsync(['bash', '-c', `${App.configDir}/scripts/ags/agsconfigurator.py \
            --key ${option} \
            --value ${pageName} \
            --file ${AGS_CONFIG_FILE}`
        ]).catch(print);
    },
    extraTabStripWidgets: [
        expandButton,
    ]
});

export default () => {
    return Box({
        vexpand: true,
        css: 'min-width: 2px;',
        children: [
            widgetContent,
        ],
        setup: (self) => self
            .on('key-press-event', (widget, event) => { // Handle keybinds
                if (checkKeybind(event, userOptions.keybinds.sidebar.cycleTab))
                    widgetContent.cycleTab();
                else if (checkKeybind(event, userOptions.keybinds.sidebar.expand))
                    expandButton.attribute.toggle(expandButton);

                const currentTab = widgetContent.attribute.names[widgetContent.attribute.shown.value];

                if (currentTab == 'APIs') { // If api tab is focused
                    // Focus entry when typing
                    if ((
                        !(event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) &&
                        event.get_keyval()[1] >= 32 && event.get_keyval()[1] <= 126 &&
                        widget != chatEntry && event.get_keyval()[1] != Gdk.KEY_space)
                        ||
                        ((event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) &&
                            event.get_keyval()[1] === Gdk.KEY_v)
                    ) {
                        if (chatEntry && chatEntry.grab_focus) {
                            chatEntry.grab_focus();
                            const buffer = chatEntry.get_buffer();
                            if (buffer) {
                                buffer.set_text(buffer.text + String.fromCharCode(event.get_keyval()[1]), -1);
                                buffer.place_cursor(buffer.get_iter_at_offset(-1));
                            }
                        }
                    }
                    // Switch API type
                    else if (checkKeybind(event, userOptions.keybinds.sidebar.apis.nextTab)) {
                        const toSwitchTab = widgetContent.attribute.children[widgetContent.attribute.shown.value];
                        if (toSwitchTab && toSwitchTab.nextTab) toSwitchTab.nextTab();
                    }
                    else if (checkKeybind(event, userOptions.keybinds.sidebar.apis.prevTab)) {
                        const toSwitchTab = widgetContent.attribute.children[widgetContent.attribute.shown.value];
                        if (toSwitchTab && toSwitchTab.prevTab) toSwitchTab.prevTab();
                    }
                }
                // Add player-specific keybinds if needed
                else if (currentTab == 'Player') {
                    // Add player-specific keyboard shortcuts here
                    // For example:
                    // if (checkKeybind(event, userOptions.keybinds.sidebar.player.playPause))
                    //     // Handle play/pause
                }
            })
        ,
    });
}
