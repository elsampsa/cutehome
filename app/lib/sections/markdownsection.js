import { Widget, Signal } from '../../../lib/base/widget.js';
import { MarkedWidget } from '../../../lib/render/marked.js';

class MarkdownSection extends Widget { /*//DOC
    Generic section widget that renders markdown content from a file.
    Can be configured to load any markdown file.
    */
    constructor(id = null) {
        super(id);
        this.markdown_file = null;
        this.content_loaded = false;
        this.createElement();
        this.createState();
    }

    createSignals() {
        this.signals.error = new Signal("Emitted when markdown file fails to load. Carries error message string");
        this.signals.navigate = new Signal("Emitted when user clicks navigation link. Carries section ID string");
    }

    setMarkdownFile(filepath) { /*//DOC
        Set the markdown file to render
        :param filepath: Relative path to the markdown file (e.g., './content/aboutme.md')
        Returns this for method chaining
        */
        this.markdown_file = filepath;
        return this;
    }

    show_slot() { /*//DOC
        Called when this section should be displayed
        Loads and renders the markdown content
        */
        this.log(-1, "show_slot called");
        if (!this.content_loaded && this.markdown_file) {
            this.loadContent();
        } else if (this.content_loaded) {
            // Content already loaded, check if we need to scroll to a hash
            this.scrollToHash();
        }
    }

    scroll_to_hash_slot(hash) { /*//DOC
        Slot that receives hash change signals from router.
        Scrolls to the specified heading ID within the markdown content.
        :param hash: The heading ID to scroll to (without the # symbol)
        */
        if (!hash || hash.length === 0) {
            return;
        }

        this.log(-1, "scroll_to_hash_slot:", hash);

        // Only scroll if content is loaded
        if (!this.content_loaded) {
            this.log(-1, "Content not loaded yet, ignoring hash");
            return;
        }

        this.widgets.markedWidget.scroll_to_slot(hash);
    }

    scrollToHash() { /*//DOC
        Scrolls to the element specified in the URL hash fragment.
        Called after content is loaded or when navigating to an already-loaded section.
        */
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const elementId = hash.substring(1); // Remove the '#'
            this.scroll_to_hash_slot(elementId);
        }
    }

    createState() {
        if (this.element == null) {
            return;
        }
        // State is initialized in constructor for flexibility
    }

    createElement() {
        this.autoElement();
        if (this.element == null) {
            this.err("could not create element");
            return;
        }

        this.element.innerHTML = `
            <div class="container mt-4">
            </div>
        `;

        this.container_element = this.element.querySelector('.container');

        // Create MarkedWidget as a subwidget
        this.widgets.markedWidget = new MarkedWidget();
        this.widgets.markedWidget.setLogLevel(this.loglevel);

        // Append the MarkedWidget's element to our container
        this.container_element.appendChild(this.widgets.markedWidget.getElement());

        // Connect signals
        this.widgets.markedWidget.signals.file_read_error.connect((msg) => {
            this.err("Failed to load markdown:", msg);
            this.signals.error.emit(msg);
        });
        this.widgets.markedWidget.signals.file_read_ok.connect(() => {
            this.log(-1, "Markdown loaded successfully");
            this.content_loaded = true;
            this.setupNavigationLinks();
            this.setupImageCaptions();
            this.scrollToHash(); // Scroll to hash after content is loaded
        });
    }

    loadContent() {
        if (!this.markdown_file) {
            this.err("No markdown file specified. Use setMarkdownFile() first.");
            return;
        }
        this.log(-1, "Loading content from", this.markdown_file);
        this.widgets.markedWidget.render_file_slot(this.markdown_file);
    }

    setupNavigationLinks() { /*//DOC
        Sets up navigation links in the rendered markdown.
        Finds all links with nav: prefix and makes them emit navigate signal.
        Called automatically after markdown is loaded.
        */
        this.log(-1, "Setting up navigation links");

        // Find all links with nav: prefix in the MarkedWidget's element
        const markedElement = this.widgets.markedWidget.element;
        const allLinks = markedElement.querySelectorAll('a');
        this.log(-1, "Found", allLinks.length, "total links");

        allLinks.forEach((link) => {
            const href = link.getAttribute('href');

            if (href && href.startsWith('nav:')) {
                const sectionId = href.replace('nav:', '');
                this.log(-1, "Setting up nav link to:", sectionId);

                link.onclick = (e) => {
                    e.preventDefault();
                    console.log("MarkdownSection: Nav link clicked:", sectionId);
                    this.signals.navigate.emit(sectionId);
                };
            }
        });
    }

    setupImageCaptions() { /*//DOC
        Adds caption elements below images based on their alt text.
        Called automatically after markdown is loaded.
        */
        this.log(-1, "Setting up image captions");

        const markedElement = this.widgets.markedWidget.element;
        const allImages = markedElement.querySelectorAll('img[alt]');
        this.log(-1, "Found", allImages.length, "images with alt text");

        allImages.forEach((img) => {
            const altText = img.getAttribute('alt');
            if (altText && altText.trim() !== '') {
                // Create caption element
                const caption = document.createElement('span');
                caption.className = 'image-caption';
                caption.textContent = altText;

                // Insert caption after the image
                img.parentNode.insertBefore(caption, img.nextSibling);
                this.log(-1, "Added caption:", altText);
            }
        });
    }

    getElement() {
        return this.element;
    }

} // MarkdownSection

export { MarkdownSection }
