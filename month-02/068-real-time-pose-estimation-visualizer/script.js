let video;
let poseNet;
let poses = []; // Array to store all detected poses
let statusEl;

const CAPTURE_WIDTH = 640; // Desired video capture width
const CAPTURE_HEIGHT = 480; // Desired video capture height
const MIN_KEYPOINT_SCORE = 0.2; // Minimum confidence score to draw a keypoint

function setup() {
    // Create a p5.js canvas and append it to the 'canvas-container' div
    const canvas = createCanvas(CAPTURE_WIDTH, CAPTURE_HEIGHT);
    canvas.parent('canvas-container');

    // Get the status element from the HTML
    statusEl = document.getElementById('status');
    statusEl.innerText = 'Starting webcam...';

    // Create a video capture object from the webcam
    video = createCapture(VIDEO);
    video.size(CAPTURE_WIDTH, CAPTURE_HEIGHT);
    video.hide(); // Hide the default HTML video element; p5.js will draw it

    // Initialize PoseNet model with the video feed
    // The modelReady callback will be triggered once the model is loaded
    statusEl.innerText = 'Loading PoseNet model... (This may take a moment)';
    poseNet = ml5.poseNet(video, modelReady);

    // Listen for pose estimations from PoseNet
    poseNet.on('pose', gotPoses);
}

// Callback function when the PoseNet model is successfully loaded
function modelReady() {
    statusEl.innerText = 'Model Loaded! Ready for pose detection.';
    console.log('PoseNet model loaded!');
}

// Callback function when new poses are detected by PoseNet
function gotPoses(results) {
    poses = results; // Update the global poses array with the latest results
}

function draw() {
    // Draw the current video frame onto the canvas
    image(video, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);

    // Iterate through all detected poses
    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i].pose; // Get the pose object
        let skeleton = poses[i].skeleton; // Get the skeleton array

        // Draw keypoints (e.g., nose, eyes, shoulders, etc.)
        for (let j = 0; j < pose.keypoints.length; j++) {
            let keypoint = pose.keypoints[j];
            // Only draw keypoints that have a confidence score above the threshold
            if (keypoint.score > MIN_KEYPOINT_SCORE) {
                fill(255, 0, 0); // Red color for keypoints
                noStroke(); // No border for keypoints
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10); // Draw a circle
            }
        }

        // Draw the skeleton (lines connecting related keypoints)
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0]; // First keypoint of the bone
            let partB = skeleton[j][1]; // Second keypoint of the bone
            stroke(0, 255, 0); // Green color for skeleton lines
            strokeWeight(2); // Line thickness
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}
