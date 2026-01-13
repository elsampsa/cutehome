import { Widget, Signal } from '../../lib/base/widget.js';

class SlideShowWidget extends Widget { /*//DOC
    A carousel/slideshow widget for displaying images.

    ## How it works

    This widget wraps Bootstrap 5's Carousel component, which provides:
    - Touch/swipe gestures (built into Bootstrap)
    - Keyboard navigation (arrow keys)
    - Click navigation (prev/next buttons and indicator dots)

    ### Image Loading

    Images are loaded by the browser using standard <img> tags:
    - The browser loads images immediately when they're added to the DOM
    - We use loading="lazy" attribute to defer offscreen images
    - Only the first slide's image loads immediately
    - Other images load as you approach them (browser handles this)

    ### Bootstrap Carousel Mechanics

    1. HTML Structure:
       - .carousel-inner contains .carousel-item divs (one per slide)
       - Only one .carousel-item has class "active" at a time
       - Bootstrap uses CSS transforms to slide items left/right

    2. Navigation:
       - Clicking prev/next buttons triggers Bootstrap's slide transition
       - Clicking indicator dots triggers Bootstrap to jump to that slide
       - Touch/swipe events are handled by Bootstrap (Hammer.js internally)
       - Keyboard events (arrows) are handled by Bootstrap

    3. Events:
       - Bootstrap emits 'slid.bs.carousel' event after each transition
       - We listen to this event to update our caption and indicator dots
       - The event carries { to: slideIndex } with the new slide number

    4. State Management:
       - Bootstrap manages which slide is "active" via CSS classes
       - We sync our caption and dots by listening to Bootstrap's events
       - Our updateCaption() method keeps everything in sync

    ### No Auto-Advance

    By setting interval: false, the carousel won't auto-rotate.
    User must manually navigate via swipe/click/keyboard.
    */
    constructor(id = null) {
        super(id);
        this.slides = [];  // Array of { src: string, caption?: string, alt?: string }
        this.simulate_slow_download = false;  // For testing loading states
        this.download_delay_ms = 2000;  // Default delay in milliseconds
        this.createElement();
        this.createState();
    }

    createSignals() {
        this.signals.slide_changed = new Signal("Emitted when slide changes. Carries slide index");
    }

    // ========== PUBLIC API (SLOTS) ==========

    next_slot() { /*//DOC
        Advance to the next slide.
        Calls Bootstrap's next() method which triggers slide transition.
        */
        if (this.carousel) {
            this.carousel.next();
        }
    }

    prev_slot() { /*//DOC
        Go back to the previous slide.
        Calls Bootstrap's prev() method which triggers slide transition.
        */
        if (this.carousel) {
            this.carousel.prev();
        }
    }

    goto_slot(index) { /*//DOC
        Go to a specific slide by index.
        Calls Bootstrap's to(index) method which jumps to that slide.
        :param index: The slide index (0-based)
        */
        if (this.carousel && index >= 0 && index < this.slides.length) {
            this.carousel.to(index);
        }
    }

    // ========== CONFIGURATION METHODS ==========

    simulateSlowDownload(delay_ms = 2000) { /*//DOC
        Enable slow download simulation for testing loading states.
        This adds an artificial delay before images are shown, allowing you to see
        the loading spinner and fade-in animation.
        :param delay_ms: Delay in milliseconds (default: 2000ms = 2 seconds)
        Returns this for method chaining
        */
        this.simulate_slow_download = true;
        this.download_delay_ms = delay_ms;
        return this;
    }

    setSlides(slides) { /*//DOC
        Set the slides to display.
        This triggers a full re-render of the carousel.
        :param slides: Array of slide objects with shape:
                      { src: string, caption?: string, alt?: string }
        Example:
        slideShowWidget.setSlides([
            { src: './images/photo1.jpg', caption: 'My caption', alt: 'Photo 1' },
            { src: './images/photo2.jpg', alt: 'Photo 2' }
        ]);
        Returns this for method chaining
        */
        this.slides = slides;
        this.render();
        return this;
    }

    // ========== INTERNAL METHODS ==========

    createElement() {
        this.autoElement();
        if (this.element == null) {
            this.err("could not create element");
            return;
        }

        // Create carousel structure
        // Bootstrap expects: .carousel > .carousel-inner > .carousel-item
        this.element.innerHTML = `
            <div class="slideshow-container mt-4">
                <div id="${this.id}-carousel" class="carousel slide">
                    <div class="carousel-inner"></div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#${this.id}-carousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${this.id}-carousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
                <div class="carousel-indicators"></div>
                <div class="carousel-caption-external"></div>
            </div>
        `;

        // Add custom styles for better mobile experience
        const style = document.createElement('style');
        style.textContent = `
            /* Slideshow container - limit width on wide screens */
            .slideshow-container {
                max-width: 1200px;
                margin: 0 auto;
            }

            /* Carousel itself */
            .slideshow-container .carousel {
                background-color: transparent;
            }

            /* Make carousel controls more visible and touch-friendly */
            .slideshow-container .carousel-control-prev,
            .slideshow-container .carousel-control-next {
                width: 15%;
                opacity: 0.8;
            }

            .slideshow-container .carousel-control-prev:hover,
            .slideshow-container .carousel-control-next:hover {
                opacity: 1;
            }

            /* Larger control icons for mobile */
            .slideshow-container .carousel-control-prev-icon,
            .slideshow-container .carousel-control-next-icon {
                width: 3rem;
                height: 3rem;
            }

            /* Mobile-specific adjustments */
            @media (max-width: 767px) {
                .slideshow-container .carousel-control-prev-icon,
                .slideshow-container .carousel-control-next-icon {
                    width: 2rem;
                    height: 2rem;
                }
            }

            /* Image container - centers the image */
            .slideshow-container .carousel-inner {
                background-color: transparent;
                min-height: 400px;
                position: relative;
            }

            /* Loading spinner - show before image loads */
            .slideshow-container .carousel-item::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 50px;
                height: 50px;
                margin: -25px 0 0 -25px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-top-color: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                animation: slideshow-spinner 0.8s linear infinite;
            }

            /* Hide spinner when image is loaded */
            .slideshow-container .carousel-item.image-loaded::before {
                display: none;
            }

            @keyframes slideshow-spinner {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Limit image height and center, no black background */
            .slideshow-container .carousel-inner img {
                max-height: 600px;
                max-width: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                margin: 0 auto;
                opacity: 0;
                transition: opacity 0.3s ease-in;
            }

            /* Fade in when image is fully loaded */
            .slideshow-container .carousel-inner img.loaded {
                opacity: 1;
            }

            /* Indicators - moved below image, larger touch targets */
            .slideshow-container .carousel-indicators {
                position: static;
                margin: 1rem 0 0.5rem 0;
            }

            .slideshow-container .carousel-indicators [data-bs-target] {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin: 0 5px;
                background-color: #6c757d;
            }

            .slideshow-container .carousel-indicators .active {
                background-color: #fff;
            }

            /* Caption - below image, outside, centered italic */
            .slideshow-container .carousel-caption-external {
                text-align: center;
                font-style: italic;
                color: #adb5bd;
                padding: 0.5rem 1rem;
                min-height: 1.5rem;
            }
        `;

        // Append style to document head if not already there
        if (!document.getElementById('slideshow-widget-styles')) {
            style.id = 'slideshow-widget-styles';
            document.head.appendChild(style);
        }

        this.carousel_element = this.element.querySelector('.carousel');
        this.indicators_element = this.element.querySelector('.carousel-indicators');
        this.caption_element = this.element.querySelector('.carousel-caption-external');
        this.inner_element = this.element.querySelector('.carousel-inner');
    }

    createState() {
        if (this.element == null) {
            return;
        }
        // State is managed by Bootstrap carousel
    }

    render() { /*//DOC
        Renders the slides into the carousel.
        Called automatically when setSlides() is called.

        Process:
        1. Clear old content
        2. Create indicator buttons (one per slide)
        3. Create carousel-item divs with <img> tags
        4. Initialize Bootstrap Carousel instance
        5. Browser starts loading images (first one immediately, others lazy)
        */
        if (!this.carousel_element) {
            this.err("Carousel element not found");
            return;
        }

        // Clear existing content
        this.indicators_element.innerHTML = '';
        this.inner_element.innerHTML = '';

        if (this.slides.length === 0) {
            this.inner_element.innerHTML = `
                <div class="carousel-item active">
                    <div class="d-flex align-items-center justify-content-center" style="min-height: 400px; background-color: #1a1a1a;">
                        <p class="text-muted">No images to display</p>
                    </div>
                </div>
            `;
            return;
        }

        // Create indicator buttons (dots below image)
        // Bootstrap uses data-bs-slide-to to know which slide to jump to
        this.slides.forEach((_slide, index) => {
            const indicator = document.createElement('button');
            indicator.type = 'button';
            indicator.setAttribute('data-bs-target', `#${this.id}-carousel`);
            indicator.setAttribute('data-bs-slide-to', index.toString());
            indicator.setAttribute('aria-label', `Slide ${index + 1}`);
            if (index === 0) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-current', 'true');
            }
            this.indicators_element.appendChild(indicator);
        });

        // Create carousel-item divs with images
        // Bootstrap shows only the .active one, hides the rest
        this.slides.forEach((slide, index) => {
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            if (index === 0) {
                item.classList.add('active');  // First slide is visible
            }

            const img = document.createElement('img');
            img.classList.add('d-block', 'w-100');
            img.alt = slide.alt || `Slide ${index + 1}`;
            img.loading = 'lazy';  // Browser defers loading until image is near viewport

            // Fade in when image is fully loaded
            img.onload = () => {
                const showImage = () => {
                    img.classList.add('loaded');
                    item.classList.add('image-loaded');  // Hide the spinner
                };

                // Simulate slow download if enabled
                if (this.simulate_slow_download) {
                    setTimeout(showImage, this.download_delay_ms);
                } else {
                    showImage();
                }
            };

            // Error handling for images
            img.onerror = () => {
                this.err(`Failed to load image: ${slide.src}`);
                // Create a simple placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'd-flex align-items-center justify-content-center';
                placeholder.style.cssText = 'min-height: 400px; background-color: #333;';
                placeholder.innerHTML = '<p class="text-muted">Image not found</p>';
                img.replaceWith(placeholder);
            };

            // Set src after setting up handlers (important for cached images)
            img.src = slide.src;

            item.appendChild(img);

            // Store caption in data attribute for external display
            if (slide.caption) {
                item.setAttribute('data-caption', slide.caption);
            }

            this.inner_element.appendChild(item);
        });

        // Initialize Bootstrap carousel
        this.initCarousel();
    }

    initCarousel() { /*//DOC
        Initializes the Bootstrap carousel with configured options.
        Called automatically after rendering.

        Creates a Bootstrap Carousel JavaScript instance that:
        - Handles touch/swipe gestures
        - Handles keyboard navigation
        - Manages CSS class transitions (.active moves between slides)
        - Emits events when slides change
        */
        if (!this.carousel_element) {
            return;
        }

        // Dispose of existing carousel instance if any
        const existing = bootstrap.Carousel.getInstance(this.carousel_element);
        if (existing) {
            existing.dispose();
        }

        // Create new Bootstrap Carousel instance
        this.carousel = new bootstrap.Carousel(this.carousel_element, {
            interval: false,  // No auto-advance (user controls navigation)
            wrap: true,       // Loop: last slide -> first slide
            keyboard: true,   // Enable arrow key navigation
            touch: true       // Enable swipe gestures on touch devices
        });

        // Listen to Bootstrap's slide transition complete event
        this.carousel_element.addEventListener('slid.bs.carousel', (event) => {
            this.log(-1, "Slide changed to:", event.to);
            this.updateCaption(event.to);
            this.signals.slide_changed.emit(event.to);
        });

        // Set initial caption
        this.updateCaption(0);
    }

    updateCaption(index) { /*//DOC
        Updates the external caption text and active indicator based on current slide.
        Called automatically when Bootstrap transitions to a new slide.

        This keeps our custom caption and indicator dots in sync with Bootstrap's
        internal state (which slide has the .active class).

        :param index: The slide index to show caption for
        */
        if (!this.caption_element) {
            return;
        }

        // Update caption text from data attribute
        const items = this.inner_element.querySelectorAll('.carousel-item');
        if (index >= 0 && index < items.length) {
            const caption = items[index].getAttribute('data-caption');
            this.caption_element.textContent = caption || '';
        }

        // Update active indicator dot
        // We manually manage the .active class on indicators because
        // Bootstrap's default indicators are inside the carousel,
        // but we moved them outside (below the image)
        const indicators = this.indicators_element.querySelectorAll('[data-bs-target]');
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.classList.remove('active');
                indicator.removeAttribute('aria-current');
            }
        });
    }

    getElement() {
        return this.element;
    }

} // SlideShowWidget

export { SlideShowWidget }
