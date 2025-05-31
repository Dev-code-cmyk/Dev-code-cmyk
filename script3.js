// 1. Global Variables & DOM Elements
const DOM = {
    appContainer: document.querySelector('.app-container'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    frameContainer: document.getElementById('frameContainer'),
    previewCanvas: document.getElementById('previewCanvas'),
    frameOverlay: document.getElementById('frameOverlay'),
    currentPreviewResolution: document.getElementById('currentPreviewResolution'),
    initialPreviewOverlay: document.getElementById('initialPreviewOverlay'),
    mainButtons: document.querySelector('.main-buttons'),
    controlButtons: document.querySelectorAll('.control-button'),
    adjustablePropertiesContainer: document.getElementById('adjustablePropertiesContainer'),
    accordionPanels: document.querySelectorAll('.accordion-panel'),
    imageUpload: document.getElementById('imageUpload'),
    fileNameDisplay: document.getElementById('fileNameDisplay'),
    uploadBtn: document.querySelector('#upload-controls .upload-btn'),
    fitCoverSelect: document.getElementById('fitCover'),
    imageZoomSlider: document.getElementById('imageZoom'),
    zoomValueSpan: document.getElementById('zoomValue'),
    imagePosXSlider: document.getElementById('imagePosX'),
    posXValueSpan: document.getElementById('posXValue'),
    imagePosYSlider: document.getElementById('imagePosY'),
    posYValueSpan: document.getElementById('posYValue'),
    frameGallery: document.getElementById('frameGallery'),
    downloadBtn: document.getElementById('downloadBtn'),
    ratioPortraitBtn: document.getElementById('ratioPortrait'), // Only one ratio button in HTML for now
    resetButtons: document.querySelectorAll('.reset-button')
};

let canvas = DOM.previewCanvas;
let ctx = canvas.getContext('2d');
let downloadCanvas = document.createElement('canvas'); // Off-screen canvas for download
let downloadCtx = downloadCanvas.getContext('2d');

// State object to hold current application settings
const state = {
    selectedFrameId: null,
    userImage: null, // HTMLImageElement
    selectedFrameImg: null, // HTMLImageElement of the selected frame
    aspectRatio: '9/16', // Default for WhatsApp status
    imageFit: 'contain', // 'contain' or 'cover'
    imageZoom: 100, // Percentage
    imagePosX: 0, // Percentage offset from center
    imagePosY: 0, // Percentage offset from center
    activePanel: null, // ID of the currently active accordion panel
    currentTheme: 'light',
};

// 2. framesData Array
// Contains metadata for each frame: id, thumbnail path, full frame image path,
// and maskData for clipping.
// maskData.points: Normalized coordinates (0 to 1) relative to the frame image's
//                 dimensions, defining the transparent hole.
// maskData.bbox: Bounding box of the mask, also normalized, used for initial
//                image positioning before applying zoom/pan.
// IMPORTANT: Corrected thumbnail paths to match the provided frame_XX.png files
const framesData = [
    {
        id: 'frame1', thumbnail: 'frame1.png', frameSrc: 'frames/frame1.png',
        maskData: { type: 'polygon', points: [ // Rounded rectangle
            [0.25, 0.08], [0.75, 0.08], [0.75, 0.92], [0.25, 0.92]
        ], bbox: {x: 0.25, y: 0.08, width: 0.5, height: 0.84} }
    },
    {
        id: 'frame2', thumbnail: 'frame2.png', frameSrc: 'frames/frame2.png',
        maskData: { type: 'polygon', points: [ // Spade shape (simplified)
            [0.5, 0.17], [0.8, 0.35], [0.8, 0.65], [0.5, 0.83], [0.2, 0.65], [0.2, 0.35]
        ], bbox: {x: 0.2, y: 0.17, width: 0.6, height: 0.66} }
    },
    {
        id: 'frame3', thumbnail: 'frame3.png', frameSrc: 'frames/frame3.png',
        maskData: { type: 'polygon', points: [ // Diamond shape
            [0.5, 0.18], [0.8, 0.5], [0.5, 0.82], [0.2, 0.5]
        ], bbox: {x: 0.2, y: 0.18, width: 0.6, height: 0.64} }
    },
    {
        id: 'frame4', thumbnail: 'frame4.png', frameSrc: 'frames/frame4.png',
        maskData: { type: 'polygon', points: [ // Oval
            [0.34, 0.28], [0.66, 0.28], [0.66, 0.72], [0.34, 0.72]
        ], bbox: {x: 0.34, y: 0.28, width: 0.32, height: 0.44} }
    },
    {
        id: 'frame5', thumbnail: 'frame5.png', frameSrc: 'frames/frame5.png',
        maskData: { type: 'polygon', points: [ // Trapezoid/Pentagon
            [0.3, 0.2], [0.7, 0.2], [0.75, 0.75], [0.25, 0.75]
        ], bbox: {x: 0.25, y: 0.2, width: 0.5, height: 0.55} }
    },
    {
        id: 'frame6', thumbnail: 'frame6.png', frameSrc: 'frames/frame6.png',
        maskData: { type: 'polygon', points: [ // Oval
            [0.37, 0.25], [0.63, 0.25], [0.63, 0.75], [0.37, 0.75]
        ], bbox: {x: 0.37, y: 0.25, width: 0.26, height: 0.5} }
    },
    {
        id: 'frame_07', thumbnail: 'frames/frame_07.png', frameSrc: 'frames/frame_07.png',
        maskData: { type: 'polygon', points: [ // Oval
            [0.37, 0.25], [0.63, 0.25], [0.63, 0.75], [0.37, 0.75]
        ], bbox: {x: 0.37, y: 0.25, width: 0.26, height: 0.5} }
    },
    {
        id: 'frame_08', thumbnail: 'frames/frame_08.png', frameSrc: 'frames/frame_08.png',
        maskData: { type: 'polygon', points: [ // Oval
            [0.33, 0.26], [0.67, 0.26], [0.67, 0.74], [0.33, 0.74]
        ], bbox: {x: 0.33, y: 0.26, width: 0.34, height: 0.48} }
    },
    {
        id: 'frame_09', thumbnail: 'frames/frame_09.png', frameSrc: 'frames/frame_09.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.26, 0.2], [0.74, 0.2], [0.74, 0.8], [0.26, 0.8]
        ], bbox: {x: 0.26, y: 0.2, width: 0.48, height: 0.6} }
    },
    {
        id: 'frame_10', thumbnail: 'frames/frame_10.png', frameSrc: 'frames/frame_10.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.28, 0.17], [0.72, 0.17], [0.72, 0.83], [0.28, 0.83]
        ], bbox: {x: 0.28, y: 0.17, width: 0.44, height: 0.66} }
    },
    {
        id: 'frame_11', thumbnail: 'frames/frame_11.png', frameSrc: 'frames/frame_11.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.28, 0.23], [0.72, 0.23], [0.72, 0.77], [0.28, 0.77]
        ], bbox: {x: 0.28, y: 0.23, width: 0.44, height: 0.54} }
    },
    {
        id: 'frame_12', thumbnail: 'frames/frame_12.png', frameSrc: 'frames/frame_12.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.28, 0.21], [0.72, 0.21], [0.72, 0.79], [0.28, 0.79]
        ], bbox: {x: 0.28, y: 0.21, width: 0.44, height: 0.58} }
    },
    {
        id: 'frame_13', thumbnail: 'frames/frame_13.png', frameSrc: 'frames/frame_13.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.28, 0.2], [0.72, 0.2], [0.72, 0.8], [0.28, 0.8]
        ], bbox: {x: 0.28, y: 0.2, width: 0.44, height: 0.6} }
    },
    {
        id: 'frame_14', thumbnail: 'frames/frame_14.png', frameSrc: 'frames/frame_14.png',
        maskData: { type: 'polygon', points: [ // Oval
            [0.37, 0.25], [0.63, 0.25], [0.63, 0.75], [0.37, 0.75]
        ], bbox: {x: 0.37, y: 0.25, width: 0.26, height: 0.5} }
    },
    {
        id: 'frame_15', thumbnail: 'frames/frame_15.png', frameSrc: 'frames/frame_15.png',
        maskData: { type: 'polygon', points: [ // Inner rectangle (horizontal, simplified)
            [0.35, 0.4], [0.65, 0.4], [0.65, 0.6], [0.35, 0.6]
        ], bbox: {x: 0.35, y: 0.4, width: 0.3, height: 0.2} }
    },
    {
        id: 'frame_16', thumbnail: 'frames/frame_16.png', frameSrc: 'frames/frame_16.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.26, 0.2], [0.74, 0.2], [0.74, 0.8], [0.26, 0.8]
        ], bbox: {x: 0.26, y: 0.2, width: 0.48, height: 0.6} }
    },
    {
        id: 'frame_17', thumbnail: 'frames/frame_17.png', frameSrc: 'frames/frame_17.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.28, 0.17], [0.72, 0.17], [0.72, 0.83], [0.28, 0.83]
        ], bbox: {x: 0.28, y: 0.17, width: 0.44, height: 0.66} }
    },
    {
        id: 'frame_18', thumbnail: 'frames/frame_18.png', frameSrc: 'frames/frame_18.png',
        maskData: { type: 'polygon', points: [ // Star shape (simplified)
            [0.5, 0.05], [0.6, 0.35], [0.9, 0.35], [0.7, 0.55], [0.8, 0.85], [0.5, 0.7], [0.2, 0.85], [0.3, 0.55], [0.1, 0.35], [0.4, 0.35]
        ], bbox: {x: 0.1, y: 0.05, width: 0.8, height: 0.8} }
    },
    {
        id: 'frame_19', thumbnail: 'frames/frame_19.png', frameSrc: 'frames/frame_19.png',
        maskData: { type: 'polygon', points: [ // Rectangle (duplicate of 10)
            [0.28, 0.17], [0.72, 0.17], [0.72, 0.83], [0.28, 0.83]
        ], bbox: {x: 0.28, y: 0.17, width: 0.44, height: 0.66} }
    },
    {
        id: 'frame_20', thumbnail: 'frames/frame_20.png', frameSrc: 'frames/frame_20.png',
        maskData: { type: 'polygon', points: [ // Rounded rectangle (duplicate of 01)
            [0.25, 0.08], [0.75, 0.08], [0.75, 0.92], [0.25, 0.92]
        ], bbox: {x: 0.25, y: 0.08, width: 0.5, height: 0.84} }
    },
    {
        id: 'frame_21', thumbnail: 'frames/frame_21.png', frameSrc: 'frames/frame_21.png',
        maskData: { type: 'polygon', points: [ // Diamond (duplicate of 03)
            [0.5, 0.18], [0.8, 0.5], [0.5, 0.82], [0.2, 0.5]
        ], bbox: {x: 0.2, y: 0.18, width: 0.6, height: 0.64} }
    },
    {
        id: 'frame_22', thumbnail: 'frames/frame_22.png', frameSrc: 'frames/frame_22.png',
        maskData: { type: 'polygon', points: [ // Heart shape (simplified)
            [0.5, 0.2], [0.8, 0.3], [0.8, 0.5], [0.5, 0.85], [0.2, 0.5], [0.2, 0.3]
        ], bbox: {x: 0.2, y: 0.2, width: 0.6, height: 0.65} }
    },
    {
        id: 'frame_23', thumbnail: 'frames/frame_23.png', frameSrc: 'frames/frame_23.png',
        maskData: { type: 'polygon', points: [ // Rectangle (duplicate of 11)
            [0.28, 0.23], [0.72, 0.23], [0.72, 0.77], [0.28, 0.77]
        ], bbox: {x: 0.28, y: 0.23, width: 0.44, height: 0.54} }
    },
    {
        id: 'frame_24', thumbnail: 'frames/frame_24.png', frameSrc: 'frames/frame_24.png',
        maskData: { type: 'polygon', points: [ // Hexagon
            [0.5, 0.2], [0.75, 0.35], [0.75, 0.65], [0.5, 0.8], [0.25, 0.65], [0.25, 0.35]
        ], bbox: {x: 0.25, y: 0.2, width: 0.5, height: 0.6} }
    },
    {
        id: 'frame_25', thumbnail: 'frames/frame_25.png', frameSrc: 'frames/frame_25.png',
        maskData: { type: 'polygon', points: [ // Speech bubble (simplified)
            [0.28, 0.22], [0.72, 0.22], [0.72, 0.75], [0.5, 0.75], [0.45, 0.8], [0.4, 0.75], [0.28, 0.75]
        ], bbox: {x: 0.28, y: 0.22, width: 0.44, height: 0.58} }
    },
    {
        id: 'frame_26', thumbnail: 'frames/frame_26.png', frameSrc: 'frames/frame_26.png',
        maskData: { type: 'polygon', points: [ // Rectangle
            [0.28, 0.2], [0.72, 0.2], [0.72, 0.8], [0.28, 0.8]
        ], bbox: {x: 0.28, y: 0.2, width: 0.44, height: 0.6} }
    }
];

// 3. Init Function - Called when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadTheme();
    populateFrameGallery();
    addEventListeners();
    updateControlStates(); // Set initial disabled states for controls
    renderPreview(); // Render the initial empty preview state

    // Programmatically click the 'PHOTO-FRAME' button to open its accordion by default
    DOM.controlButtons.forEach(btn => {
        if (btn.dataset.target === 'frame-controls') {
            btn.click(); // This will trigger handleControlPanelClick
        }
    });
}

// 4. Theme Toggle Logic
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    state.currentTheme = savedTheme;
    updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
    DOM.themeToggleBtn.textContent = state.currentTheme === 'dark' ? '🌙' : '☀️';
}

function handleThemeToggle() {
    const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
    state.currentTheme = newTheme;
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon();
}

// 5. Populate Frame Gallery with thumbnails
function populateFrameGallery() {
    DOM.frameGallery.innerHTML = ''; // Clear any existing content
    framesData.forEach(frame => {
        const thumbDiv = document.createElement('div');
        thumbDiv.classList.add('frame-thumbnail');
        thumbDiv.dataset.frameId = frame.id;

        const img = document.createElement('img');
        img.src = frame.thumbnail; // Now correctly points to frame_XX.png
        img.alt = `Frame ${frame.id}`;

        thumbDiv.appendChild(img);
        DOM.frameGallery.appendChild(thumbDiv);
    });
}

// 6. Handle Frame Selection
async function handleFrameSelect(event) {
    const clickedThumbnail = event.currentTarget;
    const newFrameId = clickedThumbnail.dataset.frameId;

    if (state.selectedFrameId === newFrameId) return; // Frame already selected

    // Remove 'selected' class from previously selected thumbnail
    if (state.selectedFrameId) {
        const prevSelected = DOM.frameGallery.querySelector(`.frame-thumbnail[data-frame-id="${state.selectedFrameId}"]`);
        if (prevSelected) prevSelected.classList.remove('selected');
    }

    // Add 'selected' class to the newly clicked thumbnail
    clickedThumbnail.classList.add('selected');
    state.selectedFrameId = newFrameId;

    const selectedFrameData = framesData.find(f => f.id === newFrameId);
    if (selectedFrameData) {
        // Temporarily hide the frame overlay to prevent flicker during src change
        DOM.frameOverlay.classList.remove('active');

        // Load the full resolution frame image into `state.selectedFrameImg`.
        // This is used for both the DOM overlay and the download canvas, ensuring it's loaded once.
        try {
            state.selectedFrameImg = await loadImage(selectedFrameData.frameSrc);
            DOM.frameOverlay.src = state.selectedFrameImg.src; // Update the DOM <img> src once loaded
            DOM.frameOverlay.classList.add('active'); // Make it visible
            DOM.frameContainer.classList.add('active-preview-mode'); // Activate preview mode
        } catch (error) {
            console.error("Failed to load frame image:", error);
            // Revert selection and clean up on error
            state.selectedFrameId = null;
            state.selectedFrameImg = null;
            DOM.frameOverlay.src = ''; // Clear source on error
            DOM.frameOverlay.classList.remove('active');
            DOM.frameContainer.classList.remove('active-preview-mode');
            // Remove 'selected' class from thumbnail that failed to load
            clickedThumbnail.classList.remove('selected');
            alert('Could not load frame image. Please check the image path and try again.');
            return; // Stop further processing if frame image failed to load
        }
    } else {
        // Fallback if selectedFrameData is unexpectedly null
        state.selectedFrameId = null;
        state.selectedFrameImg = null;
        DOM.frameOverlay.src = '';
        DOM.frameOverlay.classList.remove('active');
        DOM.frameContainer.classList.remove('active-preview-mode');
        clickedThumbnail.classList.remove('selected');
    }

    updateControlStates(); // Re-evaluate which controls should be enabled/disabled
    renderPreview(); // Re-render the canvas with the new frame (even if no user image, the frame should be shown)
}

// Helper function to load an image asynchronously
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => {
            console.error("Image loading error for:", src, e);
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
    });
}

// 7. Handle Image Upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        DOM.fileNameDisplay.textContent = file.name;
        const reader = new FileReader();
        reader.onload = async (e) => {
            state.userImage = await loadImage(e.target.result);
            updateControlStates();
            renderPreview();
        };
        reader.readAsDataURL(file);
    } else {
        DOM.fileNameDisplay.textContent = 'No file chosen';
        state.userImage = null;
        updateControlStates();
        renderPreview();
    }
}

// 8. Accordion Logic: Manages showing/hiding control panels
function handleControlPanelClick(event) {
    const clickedButton = event.target;
    const targetPanelId = clickedButton.dataset.target;

    // Deactivate currently active button and panel
    if (state.activePanel) {
        const prevButton = DOM.mainButtons.querySelector(`.control-button[data-target="${state.activePanel}"]`);
        if (prevButton) prevButton.classList.remove('active');
        const prevPanel = document.getElementById(state.activePanel);
        if (prevPanel) prevPanel.classList.remove('active');
    }

    // Activate the clicked button and its corresponding panel, or deactivate if already active
    if (state.activePanel !== targetPanelId) {
        clickedButton.classList.add('active');
        const newPanel = document.getElementById(targetPanelId);
        if (newPanel) newPanel.classList.add('active');
        state.activePanel = targetPanelId;
    } else {
        // If clicking the same button again, deactivate it and clear active panel
        state.activePanel = null;
    }
}

// 9. Aspect Ratio Selection
function handleAspectRatioChange(event) {
    const clickedRatioBtn = event.target;
    const newRatio = clickedRatioBtn.dataset.ratio;

    if (state.aspectRatio === newRatio) return; // Ratio already selected

    // Remove 'selected' class from previous (only one button for now)
    DOM.ratioPortraitBtn.classList.remove('selected');

    // Add 'selected' class to new
    clickedRatioBtn.classList.add('selected');
    state.aspectRatio = newRatio;

    // Update frame-container aspect ratio for responsive preview sizing
    const [ratioW, ratioH] = newRatio.split('/').map(Number);
    DOM.frameContainer.style.aspectRatio = `${ratioW} / ${ratioH}`;

    renderPreview(); // Re-render with new aspect ratio
}

// 10. Adjustment Sliders (Zoom, Pan X, Pan Y)
function handleSliderChange(event) {
    const slider = event.target;
    const value = parseInt(slider.value);

    switch (slider.id) {
        case 'imageZoom':
            state.imageZoom = value;
            DOM.zoomValueSpan.textContent = `${value}%`;
            break;
        case 'imagePosX':
            state.imagePosX = value;
            DOM.posXValueSpan.textContent = `${value}%`;
            break;
        case 'imagePosY':
            state.imagePosY = value;
            DOM.posYValueSpan.textContent = `${value}%`;
            break;
    }
    renderPreview(); // Re-render on slider change
}

// 11. Fit/Cover Select
function handleFitCoverChange(event) {
    state.imageFit = event.target.value;
    renderPreview(); // Re-render on fit/cover change
}

// 12. Reset Buttons
function handleReset(event) {
    const resetTarget = event.target.dataset.resetTarget;

    switch (resetTarget) {
        case 'full':
            // Reset all state properties to their initial values
            state.selectedFrameId = null;
            state.userImage = null;
            state.selectedFrameImg = null;
            state.aspectRatio = '9/16';
            state.imageFit = 'contain';
            state.imageZoom = 100;
            state.imagePosX = 0;
            state.imagePosY = 0;
            state.activePanel = null;

            // Clear UI elements to their initial state
            DOM.fileNameDisplay.textContent = 'No file chosen';
            DOM.imageUpload.value = ''; // Clear file input
            DOM.frameGallery.querySelectorAll('.frame-thumbnail.selected').forEach(el => el.classList.remove('selected'));
            DOM.frameOverlay.classList.remove('active'); // Hide the frame overlay
            DOM.frameOverlay.src = ''; // Clear actual image source
            DOM.frameContainer.classList.remove('active-preview-mode'); // Show initial placeholder
            DOM.currentPreviewResolution.style.display = 'none';

            // Reset sliders/selects to default values
            DOM.imageZoomSlider.value = 100;
            DOM.zoomValueSpan.textContent = '100%';
            DOM.imagePosXSlider.value = 0;
            DOM.posXValueSpan.textContent = '0%';
            DOM.imagePosYSlider.value = 0;
            DOM.posYValueSpan.textContent = '0%';
            DOM.fitCoverSelect.value = 'contain';
            DOM.ratioPortraitBtn.classList.add('selected'); // Re-select default ratio button
            DOM.frameContainer.style.aspectRatio = '9 / 16';

            // Deactivate all accordion buttons and panels
            DOM.controlButtons.forEach(btn => btn.classList.remove('active'));
            DOM.accordionPanels.forEach(panel => panel.classList.remove('active'));
            // Programmatically click 'PHOTO-FRAME' to re-activate it
            DOM.controlButtons.forEach(btn => {
                if (btn.dataset.target === 'frame-controls') {
                    btn.click();
                }
            });
            break;
        case 'image':
            state.userImage = null;
            DOM.imageUpload.value = '';
            DOM.fileNameDisplay.textContent = 'No file chosen';
            break;
        case 'image-adjustments':
            state.imageFit = 'contain';
            state.imageZoom = 100;
            state.imagePosX = 0;
            state.imagePosY = 0;

            DOM.imageZoomSlider.value = 100;
            DOM.zoomValueSpan.textContent = '100%';
            DOM.imagePosXSlider.value = 0;
            DOM.posXValueSpan.textContent = '0%';
            DOM.imagePosYSlider.value = 0;
            DOM.posYValueSpan.textContent = '0%';
            DOM.fitCoverSelect.value = 'contain';
            break;
    }
    updateControlStates(); // Update disabled states after reset
    renderPreview(); // Re-render the preview
}

// 13. Render Preview (The Core Canvas Drawing Logic)
function renderPreview() {
    // Determine canvas dimensions based on the live preview container's size
    const containerRect = DOM.frameContainer.getBoundingClientRect();
    const targetWidth = containerRect.width;
    const targetHeight = containerRect.height;

    // Set canvas dimensions
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

    // Update resolution text
    // Ensure display is block *before* setting textContent to prevent issues with text-overflow
    DOM.currentPreviewResolution.style.display = 'block';
    DOM.currentPreviewResolution.textContent = `${Math.round(canvas.width)}x${Math.round(canvas.height)}`;

    // Manage visibility of initial overlay, canvas, and resolution text
    if (!state.selectedFrameId && !state.userImage) {
        // Show initial placeholder when no frame or image is selected
        DOM.initialPreviewOverlay.style.opacity = '1';
        DOM.initialPreviewOverlay.style.pointerEvents = 'auto'; // Make it clickable/visible
        DOM.previewCanvas.style.opacity = '0';
        DOM.currentPreviewResolution.style.display = 'none'; // Hide resolution text here
        DOM.frameOverlay.classList.remove('active'); // Hide frame
        DOM.frameContainer.classList.remove('active-preview-mode'); // Hide canvas/frame
        return; // Nothing to draw yet
    } else {
        // Hide initial placeholder and show canvas/frame when active
        DOM.initialPreviewOverlay.style.opacity = '0';
        DOM.initialPreviewOverlay.style.pointerEvents = 'none'; // Make it unclickable
        DOM.previewCanvas.style.opacity = '1';
        // DOM.currentPreviewResolution.style.display is already handled above
        if (state.selectedFrameId) {
             DOM.frameOverlay.classList.add('active'); // Ensure frame image is visible
             DOM.frameContainer.classList.add('active-preview-mode'); // Add class to parent for overall state
        }
    }

    const selectedFrameData = framesData.find(f => f.id === state.selectedFrameId);

    if (state.userImage && selectedFrameData) {
        // Calculate the actual pixel dimensions of the mask bounding box on the current canvas
        const { x, y, width, height } = selectedFrameData.maskData.bbox;
        const maskBBoxPixels = {
            x: x * canvas.width,
            y: y * canvas.height,
            width: width * canvas.width,
            height: height * canvas.height
        };

        // Calculate how the user image should be drawn (position, size)
        const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } = calculateImageDrawParams(
            state.userImage,
            maskBBoxPixels, // Use current canvas dimensions for live preview
            state.imageFit,
            state.imageZoom,
            state.imagePosX,
            state.imagePosY
        );

        // Clip the canvas to the shape of the frame's transparent area
        ctx.save(); // Save current canvas state
        ctx.beginPath();
        const maskPoints = selectedFrameData.maskData.points;
        // Scale normalized mask points to current canvas pixel coordinates
        ctx.moveTo(maskPoints[0][0] * canvas.width, maskPoints[0][1] * canvas.height);
        for (let i = 1; i < maskPoints.length; i++) {
            ctx.lineTo(maskPoints[i][0] * canvas.width, maskPoints[i][1] * canvas.height);
        }
        ctx.closePath();
        ctx.clip(); // Apply the clipping mask, so subsequent draws only affect inside this path

        // Draw the user image
        ctx.drawImage(state.userImage, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

        ctx.restore(); // Restore canvas state (removes the clipping mask)
    } else if (state.userImage && !selectedFrameData) {
        // If an image is uploaded but no frame is selected, just draw the image scaled to fit
        // This case should show the user image full screen.
        const imgRatio = state.userImage.width / state.userImage.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        if (imgRatio > canvas.width / canvas.height) { // Image is wider than canvas area
            drawHeight = canvas.width / imgRatio;
        } else { // Image is taller than canvas area
            drawWidth = canvas.height * imgRatio;
        }
        const drawX = (canvas.width - drawWidth) / 2;
        const drawY = (canvas.height - drawHeight) / 2;
        ctx.drawImage(state.userImage, drawX, drawY, drawWidth, drawHeight);
    }
    // The frame image itself is displayed by the <img> element (#frameOverlay)
    // which is positioned absolutely over the canvas via CSS. It's not drawn on the canvas itself for live preview.
    // It WILL be drawn on the off-screen download canvas.
}

// Helper function to calculate image drawing parameters (source and destination rectangles)
// This function determines what part of the 'img' (source rectangle sx,sy,sWidth,sHeight)
// should be drawn into the 'maskBBox' (destination rectangle dx,dy,dWidth,dHeight)
// based on fit, zoom, and pan parameters.
function calculateImageDrawParams(img, maskBBox, fit, zoom, posX, posY) {
    const imgWidth = img.width;
    const imgHeight = img.height;

    // Destination rectangle is fixed to the mask's bounding box in the target canvas.
    const destX = maskBBox.x;
    const destY = maskBBox.y;
    const destWidth = maskBBox.width;
    const destHeight = maskBBox.height;

    let srcX = 0;
    let srcY = 0;
    let srcWidth = imgWidth;
    let srcHeight = imgHeight;

    // Calculate the scale factor required for the image to fit/cover the maskBBox
    let scale;
    if (fit === 'contain') {
        scale = Math.min(destWidth / imgWidth, destHeight / imgHeight);
    } else { // 'cover'
        scale = Math.max(destWidth / imgWidth, destHeight / imgHeight);
    }

    // Apply this scale to the original image dimensions to find the effective source area
    // that would fill the destination BEFORE zoom/pan.
    let baseSrcWidth = destWidth / scale;
    let baseSrcHeight = destHeight / scale;

    // Apply zoom: Higher zoom means we take a smaller chunk of the source image
    // (making it appear larger when scaled to the destination).
    srcWidth = baseSrcWidth / (zoom / 100);
    srcHeight = baseSrcHeight / (zoom / 100);

    // Initial source position: center the src rectangle within the original image
    srcX = (imgWidth - srcWidth) / 2;
    srcY = (imgHeight - srcHeight) / 2;

    // Apply pan offsets:
    // Pan X positive (e.g., +50) means we want to move the image *right* within the frame.
    // To achieve this, we need to crop from further *left* in the original image. So, `srcX` needs to decrease.
    // The pan percentage (e.g., 50%) is relative to the *visible portion* of the image (srcWidth).
    srcX -= (posX / 100) * srcWidth;
    srcY -= (posY / 100) * srcHeight;

    // Clamp source coordinates to ensure they stay within original image bounds
    srcX = Math.max(0, Math.min(srcX, imgWidth - srcWidth));
    srcY = Math.max(0, Math.min(srcY, imgHeight - srcHeight));

    // Ensure source dimensions are not negative (should be prevented by Math.max/min but good practice)
    srcWidth = Math.max(0, srcWidth);
    srcHeight = Math.max(0, srcHeight);

    return {
        sx: srcX,
        sy: srcY,
        sWidth: srcWidth,
        sHeight: srcHeight,
        dx: destX,
        dy: destY,
        dWidth: destWidth,
        dHeight: destHeight
    };
}


// 14. Download Image (Creates a high-resolution canvas and saves it)
async function downloadImage() {
    if (!state.userImage || !state.selectedFrameId) {
        alert('Please upload an image and select a frame first!');
        return;
    }

    const selectedFrameData = framesData.find(f => f.id === state.selectedFrameId);
    // state.selectedFrameImg is now guaranteed to be loaded if a frame was selected in handleFrameSelect
    if (!selectedFrameData || !state.selectedFrameImg) {
        // This condition should ideally not be met if handleFrameSelect worked correctly
        alert('Frame image not loaded. Please wait or try again.');
        return;
    }

    // Define target download resolution (e.g., standard WhatsApp status is 1080x1920)
    const downloadWidth = 1080;
    const downloadHeight = 1920;

    downloadCanvas.width = downloadWidth;
    downloadCanvas.height = downloadHeight;
    downloadCtx.clearRect(0, 0, downloadWidth, downloadHeight); // Clear the download canvas

    // 1. Draw user image with clipping mask on the download canvas
    // Calculate mask bounding box for the high-resolution download canvas
    const { x, y, width, height } = selectedFrameData.maskData.bbox;
    const maskBBoxDownloadPixels = {
        x: x * downloadWidth,
        y: y * downloadHeight,
        width: width * downloadWidth,
        height: height * downloadHeight
    };

    // Calculate image drawing parameters for the high-resolution canvas
    const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } = calculateImageDrawParams(
        state.userImage,
        maskBBoxDownloadPixels,
        state.imageFit,
        state.imageZoom,
        state.imagePosX,
        state.imagePosY
    );

    downloadCtx.save(); // Save context before clipping
    downloadCtx.beginPath();
    const maskPoints = selectedFrameData.maskData.points;
    // Scale normalized mask points to the high-resolution download canvas pixel coordinates
    downloadCtx.moveTo(maskPoints[0][0] * downloadWidth, maskPoints[0][1] * downloadHeight);
    for (let i = 1; i < maskPoints.length; i++) {
        downloadCtx.lineTo(maskPoints[i][0] * downloadWidth, maskPoints[i][1] * downloadHeight);
    }
    downloadCtx.closePath();
    downloadCtx.clip(); // Apply the clipping mask

    // Draw the user image onto the download canvas
    // Ensure that sWidth and sHeight are not zero or very small, which can cause issues.
    if (sWidth > 0 && sHeight > 0) {
        downloadCtx.drawImage(state.userImage, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    } else {
        console.warn("Source dimensions for user image are zero or negative, skipping user image draw.");
    }
    downloadCtx.restore(); // Restore context (remove clipping)

    // 2. Draw the frame image on top of the user image
    // The frame image (state.selectedFrameImg) is assumed to be an Image object already loaded
    downloadCtx.drawImage(state.selectedFrameImg, 0, 0, downloadWidth, downloadHeight);

    // Get data URL and trigger download
    const dataURL = downloadCanvas.toDataURL('image/png');

    // IMPORTANT: Check if the dataURL is valid. An empty or invalid URL means canvas is empty or tainted.
    if (dataURL.startsWith('data:,') || dataURL.length < 100) { // data:, is for empty canvas, short length implies issue
        console.error("Download failed: Canvas data URL is empty or invalid. This usually indicates a drawing problem, an image loading failure, or a tainted canvas.");
        alert("Download failed. Please check the browser console for errors related to image loading or canvas.");
        return;
    }

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'vilayash_photoframe.png';
    document.body.appendChild(a); // Temporarily add to DOM to allow click
    a.click(); // Trigger the download
    document.body.removeChild(a); // Remove the temporary anchor tag
}


// 15. Helper: Update Control States (enable/disable inputs based on app state)
function updateControlStates() {
    const isFrameSelected = state.selectedFrameId !== null;
    const isImageUploaded = state.userImage !== null;

    // Upload controls (Choose File button and input) are enabled only if a frame is selected
    DOM.imageUpload.disabled = !isFrameSelected;
    DOM.uploadBtn.disabled = !isFrameSelected;

    // Image adjustment controls (Fit/Cover, Zoom, Pan X/Y) are enabled only if both a frame and an image are selected
    const imgAdjustmentControls = [
        DOM.fitCoverSelect,
        DOM.imageZoomSlider,
        DOM.imagePosXSlider,
        DOM.imagePosYSlider
    ];
    imgAdjustmentControls.forEach(control => {
        control.disabled = !(isFrameSelected && isImageUploaded);
    });

    // Reset buttons logic
    DOM.resetButtons.forEach(button => {
        const target = button.dataset.resetTarget;
        if (target === 'full') {
            button.disabled = !(isFrameSelected || isImageUploaded); // Enabled if either frame or image exists
        } else if (target === 'image') {
            button.disabled = !isImageUploaded; // Enabled only if an image is uploaded
        } else if (target === 'image-adjustments') {
            button.disabled = !(isFrameSelected && isImageUploaded); // Enabled only if both exist
        }
    });

    // Download button is enabled only if both a frame and an image are selected
    DOM.downloadBtn.disabled = !(isFrameSelected && isImageUploaded);
}

// 16. Add Event Listeners
function addEventListeners() {
    DOM.themeToggleBtn.addEventListener('click', handleThemeToggle);

    // Event delegation for frame gallery thumbnails
    DOM.frameGallery.addEventListener('click', (event) => {
        const thumbnail = event.target.closest('.frame-thumbnail');
        if (thumbnail) {
            handleFrameSelect({ currentTarget: thumbnail }); // Use currentTarget to get the div
        }
    });

    DOM.imageUpload.addEventListener('change', handleImageUpload);
    DOM.uploadBtn.addEventListener('click', () => DOM.imageUpload.click()); // Custom button clicks hidden input

    // Event delegation for main control buttons (accordion)
    DOM.mainButtons.addEventListener('click', (event) => {
        if (event.target.classList.contains('control-button')) {
            handleControlPanelClick(event);
        }
    });

    DOM.ratioPortraitBtn.addEventListener('click', handleAspectRatioChange); // Only one ratio button, but flexible for future expansion

    // Listen for input changes on sliders and select
    DOM.imageZoomSlider.addEventListener('input', handleSliderChange);
    DOM.imagePosXSlider.addEventListener('input', handleSliderChange);
    DOM.imagePosYSlider.addEventListener('input', handleSliderChange);
    DOM.fitCoverSelect.addEventListener('change', handleFitCoverChange);

    // Attach event listeners to all reset buttons
    DOM.resetButtons.forEach(button => {
        button.addEventListener('click', handleReset);
    });

    DOM.downloadBtn.addEventListener('click', downloadImage);

    // Listen for window resize to redraw preview and adapt to new container size
    window.addEventListener('resize', renderPreview);
}
