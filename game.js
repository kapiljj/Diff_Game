document.addEventListener('DOMContentLoaded', async () => {
    let gameConfig = null;
    let foundDifferences = 0;
    let startTime = null;
    let timerInterval = null;

    // Load game configuration
    async function loadConfig() {
        try {
            const response = await fetch('config.json');
            gameConfig = await response.json();
            document.getElementById('gameTitle').textContent = gameConfig.gameTitle;
            document.getElementById('totalDifferences').textContent = gameConfig.differences.length;
            loadImages();
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    // Load images
    function loadImages() {
        const image1 = document.getElementById('image1');
        const image2 = document.getElementById('image2');
        image1.src = gameConfig.images.image1;
        image2.src = gameConfig.images.image2;
        // Show hints as soon as images are loaded
        image1.onload = image2.onload = function() {
            showHints();
        };
        startGame();
    }

    // Start game
    function startGame() {
        foundDifferences = 0;
        document.getElementById('score').textContent = '0';
        startTimer();
        setupClickHandlers();
    }

    // Timer functionality
    function startTimer() {
        startTime = Date.now();
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }

    // Click handlers
    function setupClickHandlers() {
        const image1 = document.getElementById('image1');
        const image2 = document.getElementById('image2');
        const markers1 = document.getElementById('markers1');
        const markers2 = document.getElementById('markers2');

        [image1, image2].forEach((image, index) => {
            image.addEventListener('click', (e) => {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                // Fix for SVG: use viewBox if naturalWidth is 0
                let naturalWidth = image.naturalWidth;
                let naturalHeight = image.naturalHeight;
                if (!naturalWidth || !naturalHeight) {
                    // Try to get viewBox from SVG
                    const svg = image;
                    const vb = svg.viewBox && svg.viewBox.baseVal;
                    if (vb) {
                        naturalWidth = vb.width;
                        naturalHeight = vb.height;
                    } else {
                        // fallback: assume 500x500
                        naturalWidth = 500;
                        naturalHeight = 500;
                    }
                }
                const scaleX = naturalWidth / rect.width;
                const scaleY = naturalHeight / rect.height;
                const actualX = x * scaleX;
                const actualY = y * scaleY;
                console.log('Clicked at:', actualX, actualY);
                console.log('All difference rects:', gameConfig.differences);
                checkDifference(actualX, actualY, index === 0 ? markers1 : markers2);
            });
        });
    }

    // Check if clicked point is near a difference
    function checkDifference(x, y, markersLayer) {
        const differences = gameConfig.differences;
        let found = false;
        // DEBUG: Always mark the first not-yet-found difference on any click
        for (let i = 0; i < differences.length; i++) {
            const diff = differences[i];
            if (!isDifferenceFound(diff)) {
                console.log('DEBUG: Forcing difference found:', diff);
                markDifference(diff, markersLayer);
                markDifference(diff, document.getElementById(markersLayer.id === 'markers1' ? 'markers2' : 'markers1'));
                foundDifferences++;
                document.getElementById('score').textContent = foundDifferences;
                if (foundDifferences === differences.length) {
                    gameComplete();
                }
                found = true;
                break;
            }
        }
        if (!found) {
            console.log('No difference found for click at:', x, y);
        }
    }

    // Check if point is within difference rectangle
    function isPointInRect(x, y, rect) {
        const margin = 60; // Increased margin for easier testing
        return x >= rect.x - margin && x <= rect.x + rect.width + margin &&
               y >= rect.y - margin && y <= rect.y + rect.height + margin;
    }

    // Check if difference is already found
    function isDifferenceFound(diff) {
        const markers = document.querySelectorAll('.marker');
        for (const marker of markers) {
            const markerX = parseInt(marker.dataset.x);
            const markerY = parseInt(marker.dataset.y);
            const tolerance = 25; // Reduced tolerance for click detection
            if (Math.abs(markerX - diff.x) <= tolerance && Math.abs(markerY - diff.y) <= tolerance) {
                return true;
            }
        }
        return false;
    }

    // Show faint hint circles for each difference
    function showHints() {
        // Hints have been removed to keep interface clean
        return;
    }

    // Mark difference on both images
    function markDifference(diff, markersLayer) {
        // Remove the hint for this difference
        Array.from(markersLayer.querySelectorAll('.hint-marker')).forEach(hint => {
            if (
                parseInt(hint.style.left) === diff.x &&
                parseInt(hint.style.top) === diff.y &&
                parseInt(hint.style.width) === diff.width &&
                parseInt(hint.style.height) === diff.height
            ) {
                hint.remove();
            }
        });
        const marker = document.createElement('div');
        marker.className = 'marker';
        marker.style.width = `${diff.width}px`;
        marker.style.height = `${diff.height}px`;
        marker.style.left = `${diff.x}px`;
        marker.style.top = `${diff.y}px`;
        marker.dataset.x = diff.x;
        marker.dataset.y = diff.y;
        // Show description as tooltip
        if (diff.description) {
            marker.title = diff.description;
        }
        // Add found animation
        marker.classList.add('found-animation');
        markersLayer.appendChild(marker);
        // Play sound
        playFoundSound();
    }

    // Play sound effect when a difference is found
    function playFoundSound() {
        const audio = new Audio('found.mp3');
        audio.play();
    }

    // Game complete
    function gameComplete() {
        clearInterval(timerInterval);
        document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
        document.getElementById('successMessage').classList.remove('hidden');
    }

    // Restart game
    document.getElementById('restartButton').addEventListener('click', () => {
        document.getElementById('successMessage').classList.add('hidden');
        document.querySelectorAll('.marker').forEach(marker => marker.remove());
        startGame();
    });

    // Initialize game
    loadConfig();

    console.log('Image1 naturalWidth:', document.getElementById('image1').naturalWidth);
    console.log('Image1 naturalHeight:', document.getElementById('image1').naturalHeight);
});