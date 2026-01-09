import { Widget, Signal } from '../../lib/base/widget.js';
import { SidebarMenuItem } from '../../lib/base/sidebarwidget.js';

class SiteRouter extends Widget { /*//DOC
    Router widget that manages navigation between sections.
    Takes a site configuration with explicit widget instances and:
    - Builds the sidebar hierarchy automatically
    - Creates flat map of all sections for quick lookup
    - Wires all navigation signals (sidebar clicks + markdown nav links)
    - Provides centralized navigate(id) method
    */
    constructor(config, sidebar, container) {
        super(null); // Router doesn't need a DOM element
        this.config = config;
        this.sidebar = sidebar;
        this.container = container;
        this.sectionsMap = {}; // Flat map: { sectionId: Widget }
        this.sidebarItems = {}; // Hierarchical: { sectionId: SidebarMenuItem }
        this.currentSection = null; // Track current section to avoid redundant navigation
        this.serialize_ = true;
        this.init();
    }

    createSignals() {
        this.signals.state_change = new Signal("State change. Carries { serializationKey, serializationValue, write }");
        this.signals.hash_changed = new Signal("Emitted when URL hash fragment changes. Carries hash string (without #)");
    }

    init() {
        // Build sidebar hierarchy from config
        this.sidebarItems = this.buildSidebarItems(this.config.sections);
        this.sidebar.setItems(this.sidebarItems);

        // Build flat map of all sections for navigation
        this.sectionsMap = this.buildSectionsMap(this.config.sections);

        // Add all section widgets to container
        this.container.setItems(this.sectionsMap);

        // Wire up all signals
        this.wireSidebarSignals(this.sidebarItems);
        this.wireSectionSignals(this.sectionsMap);

        // Navigate to default section if specified (via sidebar to ensure proper activation)
        if (this.config.defaultSection) {
            this.navigateViaSidebar(this.config.defaultSection);
        }

        // Setup hash fragment navigation
        this.setupHashNavigation();
    }

    setupHashNavigation() { /*//DOC
        Sets up hash fragment (#) navigation for deep-linking within sections.
        Emits hash_changed signal when the URL hash changes.
        */
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1); // Remove '#'
            this.log(-1, "Hash changed to:", hash);
            this.signals.hash_changed.emit(hash);
        });
    }

    buildSidebarItems(sections) { /*//DOC
        Builds SidebarMenuItem hierarchy from config.
        Recursively processes nested sections.
        @param {Array} sections - Array of section config objects with shape:
                                  { id: string, label: string, icon?: string,
                                    widget: Widget, sections?: Array }
        @returns {Object} - Object mapping section IDs to SidebarMenuItem widgets
                           Example: { "about-me": SidebarMenuItem,
                                     "about-me-deepdive": SidebarMenuItem, ... }
        */
        const items = {};  // Will hold { sectionId: SidebarMenuItem }

        for (const section of sections) {
            // Create menu item for this section
            const item = new SidebarMenuItem(section.label, section.id, section.icon);

            // If this section has subsections, recursively build them
            if (section.sections && section.sections.length > 0) {
                const subitems = this.buildSidebarItems(section.sections);
                item.setItems(subitems);  // Attach subsections to this item
            }

            items[section.id] = item;
        }
        return items;  // Returns object with all menu items at this level
    }

    buildSectionsMap(sections) { /*//DOC
        Creates a flat map of section ID -> Widget instance.
        Recursively traverses the entire hierarchy and flattens it.
        Widgets are pre-created and passed in config - no auto-creation.
        Sections without widgets are folders (container nodes only).
        @param {Array} sections - Array of section config objects with shape:
                                  { id: string, label: string, icon?: string,
                                    widget?: Widget, sections?: Array }
        @returns {Object} - Flat object mapping section IDs to their Widget instances
                           Example: { "about-me": MarkdownSection,
                                     "cutefront": MarkdownSection, ... }
                           Note: Folder nodes (sections with subsections but no widget)
                                 are NOT added to the map
        */
        const map = {};  // Flat lookup: { sectionId: Widget }

        for (const section of sections) {
            // Only add to map if section has a widget (it's a leaf/page, not a folder)
            if (section.widget) {
                map[section.id] = section.widget;
            }

            // If subsections exist, recursively process them and merge into flat map
            if (section.sections && section.sections.length > 0) {
                Object.assign(map, this.buildSectionsMap(section.sections));
            }
        }
        return map;  // Returns flat map of ALL page sections (folders excluded)
    }

    wireSidebarSignals(items) { /*//DOC
        Called during router initialization.
        Wires up all signal connections between sidebar items and navigation.
        Only wires clicks for items that have corresponding widgets (pages, not folders).
        Recursively processes nested items.
        @param {Object} items - Object of SidebarMenuItem widgets (from buildSidebarItems)
        */
        for (const [sectionId, menuItem] of Object.entries(items)) {
            // Only connect navigation if this section has a widget (is a page, not a folder)
            if (this.sectionsMap[sectionId]) {
                // Sidebar already handles its own activation via clicked_slot
                menuItem.signals.clicked.connect(() => this.navigate(sectionId));
            }

            // If this item has subitems, wire them too (recursive)
            if (menuItem.widgets && Object.keys(menuItem.widgets).length > 0) {
                this.wireSidebarSignals(menuItem.widgets);
            }
        }
    }

    wireSectionSignals(sectionsMap) { /*//DOC
        Wires navigation signals from Widget instances.
        Connects the navigate signal (if present) to router's navigate method.
        For markdown nav links, we trigger the sidebar click to ensure proper activation.
        @param {Object} sectionsMap - Flat map of section ID -> Widget
        */
        for (const [sectionId, widget] of Object.entries(sectionsMap)) {
            // Connect navigation signal from widgets that support it (e.g., MarkdownSection)
            if (widget.signals && widget.signals.navigate) {
                widget.signals.navigate.connect((targetId) => {
                    // Trigger sidebar click to ensure proper activation/deactivation
                    this.navigateViaSidebar(targetId);
                });
            }

            // Connect hash_changed signal to widgets that support hash scrolling
            if (widget.scroll_to_hash_slot) {
                this.signals.hash_changed.connect(widget.scroll_to_hash_slot.bind(widget));
            }
        }
    }

    findSidebarItem(sectionId, items = null) { /*//DOC
        Helper: Recursively finds a sidebar menu item by section ID.
        @param {string} sectionId - The section ID to find
        @param {Object} items - Optional items object to search (defaults to this.sidebarItems)
        @returns {SidebarMenuItem|null} - The menu item or null if not found
        */
        if (!items) {
            items = this.sidebarItems;
        }

        for (const [id, menuItem] of Object.entries(items)) {
            if (id === sectionId) {
                return menuItem;
            }
            // Recursively search in subitems
            if (menuItem.widgets && Object.keys(menuItem.widgets).length > 0) {
                const found = this.findSidebarItem(sectionId, menuItem.widgets);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    navigateViaSidebar(sectionId) { /*//DOC
        Navigate by triggering the sidebar item's click.
        This ensures proper activation/deactivation in the sidebar.
        Used for navigation links in markdown content.
        @param {string} sectionId - The section ID to navigate to
        */
        const sidebarItem = this.findSidebarItem(sectionId);
        if (sidebarItem) {
            sidebarItem.clicked_slot();  // Emulate click on sidebar item
        } else {
            this.err("Sidebar item not found for:", sectionId);
        }
    }

    navigate(sectionId) { /*//DOC
        Navigate to a specific section by ID.
        Called by sidebar clicks - the sidebar handles its own activation.
        For markdown nav links, use navigateViaSidebar() instead.
        @param {string} sectionId - The ID of the section to navigate to
        */
        // Prevent redundant navigation to the same section
        // But log it so we can see if it's happening
        if (this.currentSection === sectionId && !this.restoringState) {
            this.log(-1, "Already at:", sectionId, "- skipping navigation");
            return;
        }

        // Look up the section in our flat map
        const section = this.sectionsMap[sectionId];
        if (!section) {
            this.err("Section not found:", sectionId);
            return;
        }

        this.log(-1, "Navigating to:", sectionId, "(restoringState:", this.restoringState + ")");
        this.currentSection = sectionId;

        // Show section in container
        this.container.show_slot(section);

        // Call show_slot on the section if it has one (e.g., MarkdownSection)
        if (section.show_slot) {
            section.show_slot();
        }

        // Emit state change for URL serialization (if StateWidget is registered)
        if (this.serialize_) {
            this.serialize();
        }
    }

    // State serialization methods for StateWidget integration
    // Note: setSerializationKey() and setSerializationWrite() are inherited from Widget base class

    getSerializationValue() { /*//DOC
        Returns the current section ID as serialized state.
        Called by Widget.getState() which is used by StateWidget.
        @returns {string} The current section ID, or default section, or empty string
        */
        return this.currentSection || this.config.defaultSection || "";
    }

    setState(value) { /*//DOC
        Restore state from URL parameter.
        Called by StateWidget when URL changes (e.g., browser back/forward).
        @param {string} value - The section ID to navigate to
        */
        this.serialize_ = false;
        if (value && this.sectionsMap[value]) {
            this.log(-1, "setState: navigating to", value);
            // Set flag to prevent serialize() from being called
            // This avoids creating new history entries during state restoration
            this.navigateViaSidebar(value);
        }
        this.serialize_ = true;
    }

    getPath(sectionId) { /*//DOC
        Helper: Gets the tree path to a section ID.
        Searches recursively through the config to find the path.
        @param {string} sectionId - Section to find
        @returns {Array|null} - Path as array of indices, e.g., [0, 1] means
                               first top-level item, second sub-item.
                               Returns null if not found.
        */
        const findPath = (sections, targetId, currentPath = []) => {
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const newPath = [...currentPath, i];

                if (section.id === targetId) {
                    return newPath;
                }

                if (section.sections && section.sections.length > 0) {
                    const found = findPath(section.sections, targetId, newPath);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        };

        return findPath(this.config.sections, sectionId);
    }

} // SiteRouter

export { SiteRouter }
