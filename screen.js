function screenres() {
    const mainDiv = document.getElementById('main');
    const bodyDiv = document.body;
    const ASPECT_RATIO = 16 / 9; // 16:9 aspect ratio constant

    // Set base dimensions (these can be any size that matches 16:9)
    const baseWidth = 1600; // Example base width
    const baseHeight = baseWidth / ASPECT_RATIO; // Calculated height

    mainDiv.style.width = `${baseWidth}px`;
    mainDiv.style.height = `${baseHeight}px`;
    mainDiv.style.position = 'absolute';
    bodyDiv.style.backgroundColor = '#000';

    function updateScale() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate available space's aspect ratio
        const windowAspect = windowWidth / windowHeight;

        // Determine scale factor
        let scale;
        if (windowAspect > ASPECT_RATIO) {
            // Window is wider than 16:9 - scale based on height
            scale = windowHeight / baseHeight;
        } else {
            // Window is taller than 16:9 - scale based on width
            scale = windowWidth / baseWidth;
        }

        // Apply scaling
        mainDiv.style.transform = `scale(${scale})`;
        mainDiv.style.transformOrigin = 'top left';

        // Center the scaled element
        const scaledWidth = baseWidth * scale;
        const scaledHeight = baseHeight * scale;
        mainDiv.style.left = `${(windowWidth - scaledWidth) / 2}px`;
        mainDiv.style.top = `${(windowHeight - scaledHeight) / 2}px`;
    }

    // Initial scale update
    updateScale();
    window.addEventListener('resize', updateScale);
}

screenres();
