"use strict";

const FocusState = function () {

    let FOCUS_BRAKEPOINT = 0.3;

    let currentFocusState = false;
    let prevFocusState    = true;

    this.getScoreValue = function () {
        return parseFloat(document.getElementById("score").textContent) * 1;
    };

    this.getCurrentFocusState = function () {
        return currentFocusState;
    };

    this.getPrevFocusState = function () {
        return prevFocusState;
    };

    this.updateFocusState = function () {
        prevFocusState    = currentFocusState;
        currentFocusState = (this.getScoreValue() >= FOCUS_BRAKEPOINT);
    };

    this.isFocusStateChanged = function () {
        this.updateFocusState();
        //foccus state stayed the same
        if (prevFocusState === currentFocusState) return 0;
        //focus state became positive
        else if (currentFocusState) return 1;
        //focus state became negative
        return -1;
    };

    return this;
};

var focusState = new FocusState();

// center point
var centerX = 0.0, centerY = 0.0;

var radius    = 100, rotAngle = -90;
var accelX    = 0.0, accelY = 0.0;
var deltaX    = 0.0, deltaY = 0.0;
var springing = 0.0009, damping = 0.98;

//corner nodes
var nodes = 20;

//zero fill arrays
var nodeStartX = [];
var nodeStartY = [];
var nodeX      = [];
var nodeY      = [];
var angle      = [];
var frequency  = [];

// soft-body dynamics
var organicConstant = 1.0;


document.getElementById('exterminate').addEventListener('click', function() {
    var areYouSure = window.confirm("Are you sure you want to stop experiment?");
    if (areYouSure) {
        stopExperiment();
    }
});

//Init experiment
var currentExperiment = localStorage.getItem('museFocus:currentExperimentName');
if (currentExperiment === null) {
    promptForExperiment();
} else {
    var continueExperiment = window.confirm("Continue experiment?");
    if (!continueExperiment) {
        stopExperiment();
    }
}

//Init audio signal
var focusChangeSound;
focusChangeSound = new Howl({src: ['audio/stairs.mp3']});
focusChangeSound.play();

function promptForExperiment() {
    var promptResult = window.prompt('Enter new experiment codename');

    if (promptResult !== null) {
        startNewExperiment(promptResult);
    }
}

function startNewExperiment(name) {
    localStorage.setItem('museFocus:currentExperimentName', name);

}

function stopExperiment() {
    var currentExperiment = localStorage.getItem('museFocus:currentExperimentName');
    localStorage.removeItem('museFocus:currentExperimentName');
    var currentExperimentsArchive = JSON.parse(localStorage.getItem('museFocus:experimentsArchive'));
    if (currentExperimentsArchive === null) {
        currentExperimentsArchive = [];
    }
    currentExperimentsArchive.push(currentExperiment);
    localStorage.setItem('museFocus:experimentsArchive', JSON.stringify(currentExperimentsArchive));

    downloadExperimentData(currentExperiment)
}

function writeExperimentData(focusState) {
    var currentExperimentName = localStorage.getItem('museFocus:currentExperimentName');
    if (!currentExperimentName) return false;

    var dataStorageName = 'museFocus:currentExperimentData:' + currentExperimentName;
    var currentExperimentsData = JSON.parse(localStorage.getItem(dataStorageName));
    if (currentExperimentsData === null) {
        currentExperimentsData = [];
    }
    currentExperimentsData.push([
                                    focusState.getScoreValue(),
                                    focusState.getCurrentFocusState(),
                                    focusState.isFocusStateChanged(),
                                ]);
    localStorage.setItem(dataStorageName, JSON.stringify(currentExperimentsData));
}

function downloadExperimentData(experimentName) {
    var currentExperimentsData = JSON.parse(localStorage.getItem('museFocus:currentExperimentData:' + experimentName));
    var contentHeaders = ['score value', 'focus state', 'is focus state changed'];
    let csvContent = "data:text/csv;charset=utf-8," + contentHeaders.join(",") + "\n" + currentExperimentsData.map(e=>e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", experimentName + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file.
}
function setup() {
    var canvas = createCanvas(800, 600);

    canvas.parent('sketch-holder');
    //center shape in window
    centerX = width / 2;
    centerY = height / 2;

    //initialize arrays to 0
    for (var i = 0; i < nodes; i++) {
        nodeStartX[i] = 0;
        nodeStartY[i] = 0;
        nodeY[i]      = 0;
        nodeY[i]      = 0;
        angle[i]      = 0;
    }

    // iniitalize frequencies for corner nodes
    for (var i = 0; i < nodes; i++) {
        frequency[i] = random(10, 12);
    }

    noStroke();
    frameRate(30);
}

function draw() {
    //fade background
    fill(255);
    rect(0, 0, width, height);
    drawShape();
    drawPerfectCircle();
    moveShape();
    writeExperimentData(focusState);
    var focusStateStatus = focusState.isFocusStateChanged();
    if (focusStateStatus === -1 && focusChangeSound) {
        //alert(focusStateStatus);
        focusChangeSound.play();
    }
}

function drawPerfectCircle() {
    ellipseMode(RADIUS); // Set ellipseMode to RADIUS
    stroke('rgba(0,255,0,0.25)');
    strokeWeight(2);
    ellipse(centerX, centerY, radius, radius); // Draw white ellipse using RADIUS mode
    noStroke();

}

function drawShape() {
    //  calculate node  starting locations
    for (let i = 0; i < nodes; i++) {
        nodeStartX[i] = centerX + cos(radians(rotAngle)) * radius;
        nodeStartY[i] = centerY + sin(radians(rotAngle)) * radius;
        rotAngle += 360.0 / nodes;
    }

    // draw polygon
    curveTightness(organicConstant);

    // real muse data
    let s         = parseFloat(document.getElementById("score").textContent) * 1;
    s         = s / 8;
    fill(color('rgba(40,229,142,' + s + ')'));
    beginShape();
    for (var i = 0; i < nodes; i++) {
        curveVertex(nodeX[i], nodeY[i]);
    }
    for (var i = 0; i < nodes - 1; i++) {
        curveVertex(nodeX[i], nodeY[i]);
    }
    endShape(CLOSE);
    noFill();
}

function moveShape() {
    //move center point fir test
    var score      = parseFloat(document.getElementById("score").textContent) * 1;
    var difference = 1 - score;
    deltaX         = difference * 30;
    deltaY         = difference * 30;

    // create springing effect
    deltaX *= springing;
    deltaY *= springing;
    accelX += deltaX;
    accelY += deltaY;

    // slow down springing
    accelX *= damping;
    accelY *= damping;

    // change curve tightness
    organicConstant = 1 - ((abs(accelX) + abs(accelY)) * 0.1);

    //move nodes
    for (var i = 0; i < nodes; i++) {
        nodeX[i] = nodeStartX[i] + sin(radians(angle[i])) * (accelX * 2);
        nodeY[i] = nodeStartY[i] + sin(radians(angle[i])) * (accelY * 2);
        angle[i] += frequency[i];

    }
}
