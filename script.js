import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([
    { client: 'Chrome' },
]);

function testSupport(supportedDevices) {
    const deviceDetector = new DeviceDetector();
    const detectedDevice = deviceDetector.parse(navigator.userAgent);
    let isSupported = false;
    for (const device of supportedDevices) {
        if (device.client !== undefined) {
            const re = new RegExp(`^${device.client}$`);
            if (!re.test(detectedDevice.client.name)) {
                continue;
            }
        }
        if (device.os !== undefined) {
            const re = new RegExp(`^${device.os}$`);
            if (!re.test(detectedDevice.os.name)) {
                continue;
            }
        }
        isSupported = true;
        break;
    }
    if (!isSupported) {
        alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
            `is not well supported at this time, continue at your own risk.`);
    }
}
const controls = window;
const drawingUtils = window;
const mpFaceMesh = window;
const config = {
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@` +
            `${mpFaceMesh.VERSION}/${file}`;
    }
};

const videoElement = document.getElementsByClassName('input_video')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];

/**
 * Solution options.
 */
const solutionOptions = {
    selfieMode: false,
    enableFaceGeometry: false,
    maxNumFaces: 1,
    refineLandmarks: true,
    lookDelay: 300,
    lookWidthThreshold: 0.08,
    lookUpThreshold: 0.11,
    lookDownThreshold: 0.07,
    blinkCutoffTop: 5,
    blinkCutoffBottom: 4
};
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
//const fpsControl = new controls.FPS();

var imagelinks = ["images/amafraid.jpg", "images/amfeelingsick.jpg", "images/aminpain.jpg", "images/wanthobupdown.jpg", "images/wanttvvideo.jpg", "images/wanttobecomforted.jpg", "images/amangry.jpg", "images/amfrustrated.jpg", "images/amsad.jpg", "images/wantliedown.jpg", "images/wantquiet.jpg", "images/wanttobesucctioned.jpg", "images/amchoking.jpg", "images/amhotcold.jpg", "images/amshortofbreath.jpg", "images/wantlightsoffon.jpg", "images/wantremote.jpg", "images/wanttogohome.jpg", "images/amdizzy.jpg", "images/amhungrythirsty.jpg", "images/amtired.jpg", "images/wantwater.jpg", "images/wantsitup.jpg", "images/wanttosleep.jpg"];

var imagesElements = [document.getElementById("img0"), document.getElementById("img1"), document.getElementById("img2"), document.getElementById("img3"), document.getElementById("img4"), document.getElementById("img5"), document.getElementById("img6"), document.getElementById("img7"), document.getElementById("img8"), document.getElementById("img9"), document.getElementById("img10"), document.getElementById("img11"), document.getElementById("img12"), document.getElementById("img13"), document.getElementById("img14"), document.getElementById("img15"), document.getElementById("img16"), document.getElementById("img17"), document.getElementById("img18"), document.getElementById("img19"), document.getElementById("img20"), document.getElementById("img21"), document.getElementById("img22"), document.getElementById("img23")];

function resetImages() {
    leftImages = imagelinks.slice(0, Math.ceil(imagelinks.length / 2));
    rightImages = imagelinks.slice(Math.ceil(imagelinks.length / 2), imagelinks.length);
    for (let i = 0; i < leftImages.length; i++) {
        imagesswapL[i].src = leftImages[i];
        imagesswapL[i].style.visibility = "visible";
    }
    for (let i = 0; i < rightImages.length; i++) {
        imagesswapR[i].src = rightImages[i];
        imagesswapR[i].style.visibility = "visible";
    }
}

const LEFT_IRIS = [474, 475, 476, 477];
const LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

const RIGHT_IRIS = [469, 470, 471, 472];
const RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];

function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function blinkRatio(landmarks) {

    var rhDistance = euclideanDistance(landmarks[0][RIGHT_EYE[0]].x, landmarks[0][RIGHT_EYE[0]].y, landmarks[0][RIGHT_EYE[8]].x, landmarks[0][RIGHT_EYE[8]].y);
    var rvDistance = euclideanDistance(landmarks[0][RIGHT_EYE[12]].x, landmarks[0][RIGHT_EYE[12]].y, landmarks[0][RIGHT_EYE[4]].x, landmarks[0][RIGHT_EYE[4]].y);

    var lhDistance = euclideanDistance(landmarks[0][LEFT_EYE[0]].x, landmarks[0][LEFT_EYE[0]].y, landmarks[0][LEFT_EYE[8]].x, landmarks[0][LEFT_EYE[8]].y);
    var lvDistance = euclideanDistance(landmarks[0][LEFT_EYE[12]].x, landmarks[0][LEFT_EYE[12]].y, landmarks[0][LEFT_EYE[4]].x, landmarks[0][LEFT_EYE[4]].y);


    var reRatio = rhDistance / rvDistance
    var leRatio = lhDistance / lvDistance

    //var ratio = (reRatio + leRatio) / 2
    return [leRatio, reRatio];
}

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};
class GridManager {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.gridLength = height * width;
        this.row = 0;
        this.col = 0;
    }
    up() {
        this.row = (this.row - 1).mod(this.height);
    }
    down() {
        this.row = (this.row + 1).mod(this.height);
    }
    left() {
        this.col = (this.col - 1).mod(this.width);
    }
    right() {
        this.col = (this.col + 1).mod(this.width);
    }
    get getIndex() {
        return this.col + this.width * this.row;
    }
    get getRow() {
        return this.row;
    }
    get getCol() {
        return this.col;
    }
}

var grid = new GridManager(4, 6);

//between 0.00-0.5
var widthThreshold = 0.08;
var LOOK_DELAY = 300; // 0.5 second
var upperLookThreshold = 0.11;
var lowerLookThreshold = 0.05;

function leftRightUpDownRatio(landmarks) {
    var rhDistance = euclideanDistance(landmarks[0][RIGHT_EYE[0]].x, landmarks[0][RIGHT_EYE[0]].y, landmarks[0][RIGHT_EYE[8]].x, landmarks[0][RIGHT_EYE[8]].y);
    //    var rvDistance = euclideanDistance(landmarks[0][RIGHT_EYE[12]].x, landmarks[0][RIGHT_EYE[12]].y, landmarks[0][RIGHT_EYE[4]].x, landmarks[0][RIGHT_EYE[4]].y);

    var lhDistance = euclideanDistance(landmarks[0][LEFT_EYE[0]].x, landmarks[0][LEFT_EYE[0]].y, landmarks[0][LEFT_EYE[8]].x, landmarks[0][LEFT_EYE[8]].y);
    //    var lvDistance = euclideanDistance(landmarks[0][LEFT_EYE[12]].x, landmarks[0][LEFT_EYE[12]].y, landmarks[0][LEFT_EYE[4]].x, landmarks[0][LEFT_EYE[4]].y);
    var avgIrisXLeft = 0;
    var avgIrisYLeft = 0;
    var avgIrisXRight = 0;
    var avgIrisYRight = 0;
    for (let i = 0; i < LEFT_IRIS.length; i++) {
        avgIrisXLeft = avgIrisXLeft + landmarks[0][LEFT_IRIS[i]].x;
        avgIrisYLeft = avgIrisYLeft + landmarks[0][LEFT_IRIS[i]].y;
        avgIrisXRight = avgIrisXRight + landmarks[0][RIGHT_IRIS[i]].x;
        avgIrisYRight = avgIrisYRight + landmarks[0][RIGHT_IRIS[i]].y;
    }
    avgIrisXLeft = avgIrisXLeft / LEFT_IRIS.length;
    avgIrisYLeft = avgIrisYLeft / LEFT_IRIS.length;
    avgIrisXRight = avgIrisXRight / RIGHT_IRIS.length;
    avgIrisYRight = avgIrisYRight / RIGHT_IRIS.length;

    var rhIrisDistance = euclideanDistance(landmarks[0][RIGHT_EYE[0]].x, landmarks[0][RIGHT_EYE[0]].y, avgIrisXRight, avgIrisYRight);
    var lhIrisDistance = euclideanDistance(landmarks[0][LEFT_EYE[0]].x, landmarks[0][LEFT_EYE[0]].y, avgIrisXLeft, avgIrisYLeft);

    var horizontalLookRatio = (rhIrisDistance / rhDistance + lhIrisDistance / lhDistance) / 2;

    var averageXHorizontalRight = (landmarks[0][RIGHT_EYE[0]].x + landmarks[0][RIGHT_EYE[8]].x) / 2;
    var averageYHorizontalRight = (landmarks[0][RIGHT_EYE[0]].y + landmarks[0][RIGHT_EYE[8]].y) / 2;
    var averageXHorizontalLeft = (landmarks[0][LEFT_EYE[0]].x + landmarks[0][LEFT_EYE[8]].x) / 2;
    var averageYHorizontalLeft = (landmarks[0][LEFT_EYE[0]].y + landmarks[0][LEFT_EYE[8]].y) / 2;

    var distanceRIristoMidpoint = euclideanDistance(averageXHorizontalRight, averageYHorizontalRight, avgIrisXRight, avgIrisYRight);
    var distanceLIristoMidpoint = euclideanDistance(averageXHorizontalLeft, averageYHorizontalLeft, avgIrisXLeft, avgIrisYLeft);
    var verticalLookRatio = (distanceRIristoMidpoint / rhDistance + distanceLIristoMidpoint / lhDistance) / 2;

    return [horizontalLookRatio, verticalLookRatio];
}

var modal = document.getElementById('myModal');
var modalImg = document.getElementById("modalImgID");


let startLookTime = Number.POSITIVE_INFINITY;
let lookDirection = null;

var leftImages = imagelinks.slice(0, imagelinks.length / 2);
var rightImages = imagelinks.slice(imagelinks.length / 2, imagelinks.length);

var loaderelement = document.getElementById("loader");
var loadingtext = document.getElementById("loadingtext");


var blinkTime = 1000;
var upperBlinkCutoff = 5;
var lowerBlinkCutoff = 4;

function onResults(results) {
    var minThreshold = 0.5 - widthThreshold;
    var maxThreshold = 0.5 + widthThreshold;
//    fpsControl.tick();
    loaderelement.style.display = 'none';
    loadingtext.style.display = 'none';

    var timestamp = +new Date();

    if (results.multiFaceLandmarks.length !== 1 || lookDirection === "STOP") return

    var horizontalLookRatio = 0;
    var verticalLookRatio = 0;
    [horizontalLookRatio, verticalLookRatio] = leftRightUpDownRatio(results.multiFaceLandmarks);
    var [lBlinkRatio, rBlinkRatio] = blinkRatio(results.multiFaceLandmarks);
    console.log(`lblinkratio ${lBlinkRatio} rblinkRatio ${rBlinkRatio}`);
    var selectElement = false;
    if (lBlinkRatio > upperBlinkCutoff && rBlinkRatio < lowerBlinkCutoff) {
        selectElement = true
    } else {
        selectElement = false;
    }


    if (selectElement &&
        lookDirection !== "SELECT" &&
        lookDirection !== "RESET") {
        startLookTime = timestamp;
        lookDirection = "SELECT";
    } else if (
        horizontalLookRatio > maxThreshold &&
        lookDirection !== "LEFT" &&
        lookDirection !== "RESET"
    ) {
        startLookTime = timestamp;
        lookDirection = "LEFT";
    } else if (
        horizontalLookRatio < minThreshold &&
        lookDirection !== "RIGHT" &&
        lookDirection !== "RESET"
    ) {
        startLookTime = timestamp;
        lookDirection = "RIGHT";
    } else if (
        verticalLookRatio > upperLookThreshold &&
        lookDirection !== "UP" &&
        lookDirection !== "LEFT" &&
        lookDirection !== "RIGHT" &&
        lookDirection !== "RESET") {
        startLookTime = timestamp;
        lookDirection = "UP";
    } else if (
        verticalLookRatio < lowerLookThreshold &&
        lookDirection !== "DOWN" &&
        lookDirection !== "LEFT" &&
        lookDirection !== "RIGHT" &&
        lookDirection !== "RESET") {
        startLookTime = timestamp;
        lookDirection = "DOWN";
    } else if (horizontalLookRatio <= maxThreshold && horizontalLookRatio >= minThreshold && verticalLookRatio <= upperLookThreshold && verticalLookRatio >= lowerLookThreshold && !selectElement) {
        startLookTime = Number.POSITIVE_INFINITY;
        lookDirection = null;
    }
    //console.log("look direction: " + lookDirection);
    if (startLookTime + LOOK_DELAY < timestamp) {
        if (lookDirection === "SELECT") {
            modal.style.display = "block";
            modalImg.src = imagelinks[grid.getIndex];
            //pause for 4000 ms on selection
            setTimeout(() => {
                startLookTime = Number.POSITIVE_INFINITY;
                lookDirection = null;
                modal.style.display = "none";
            }, 4000);
        } else if (lookDirection === "LEFT") {
            imagesElements[grid.getIndex].style.border = "none";
            grid.left();
            imagesElements[grid.getIndex].style.border = "thick solid #0b5ed7";
        } else if (lookDirection === "RIGHT") {
            imagesElements[grid.getIndex].style.border = "none";
            grid.right();
            imagesElements[grid.getIndex].style.border = "thick solid #0b5ed7";
        } else if (lookDirection === "UP") {
            imagesElements[grid.getIndex].style.border = "none";
            grid.up();
            imagesElements[grid.getIndex].style.border = "thick solid #0b5ed7";
        } else if (lookDirection === "DOWN") {
            imagesElements[grid.getIndex].style.border = "none";
            grid.down();
            imagesElements[grid.getIndex].style.border = "thick solid #0b5ed7";
        }
        lookDirection = "RESET";
    }


}

const faceMesh = new mpFaceMesh.FaceMesh(config);
faceMesh.setOptions(solutionOptions);
faceMesh.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, solutionOptions)
    .add([
        new controls.StaticText({ title: 'Settings' }),
        new controls.SourcePicker({
            onFrame: async(input, size) => {
                await faceMesh.send({ image: input });
            },
        }),
        new controls.Slider({
            title: 'Look Delay Threshold in milliseconds',
            field: 'lookDelay',
            range: [200, 3000],
            step: 100
        }),
        new controls.Slider({
            title: 'Look Width Threshold',
            field: 'lookWidthThreshold',
            range: [0.02, 0.3],
            step: 0.01
        }),
        new controls.Slider({
            title: 'Look Up Threshold',
            field: 'lookUpThreshold',
            range: [0.04, 0.3],
            step: 0.01
        }),
        new controls.Slider({
            title: 'Look Down Threshold',
            field: 'lookDownThreshold',
            range: [0.04, 0.3],
            step: 0.01
        }),
        new controls.Slider({
            title: 'Blink Closed Threshold',
            field: 'blinkCutoffTop',
            range: [2, 10],
            step: 0.1
        }),
        new controls.Slider({
            title: 'Blink Open Threshold',
            field: 'blinkCutoffBottom',
            range: [2, 10],
            step: 0.1
        })
    ]).on(x => {
    const options = x;
    LOOK_DELAY = options.lookDelay;
    widthThreshold = options.lookWidthThreshold;
    upperBlinkCutoff = options.blinkCutoffTop;
    lowerBlinkCutoff = options.blinkCutoffBottom;
    upperLookThreshold = options.lookUpThreshold;
    lowerLookThreshold = options.lookDownThreshold;
    faceMesh.setOptions(options);
});
