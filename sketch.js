// =====================================================
// EXPERIMENT 1D
// HAND TRACKING + BLE
//
// LEFT -> RIGHT:
//
// Target 1 -> BLE "1" -> Channel 12
// Target 2 -> BLE "2" -> Channel 13
// Target 3 -> BLE "3" -> Channel 14
// Target 4 -> BLE "4" -> Channel 15
//
// Each target can activate ONCE.
//
// RESET:
// All digital targets reset
// BLE "R"
// All physical servos return to 5 degrees
// =====================================================


// =====================================================
// HANDPOSE
// =====================================================

let handPose;

let video;

let hands = [];


// =====================================================
// TARGETS
// =====================================================

let targets = [];

const targetDiameter = 100;
const targetRadius = targetDiameter / 2;


// =====================================================
// RESET BUTTON
// =====================================================

let resetButton;


// =====================================================
// SETUP
// =====================================================

async function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );


  // ===================================================
  // BLE
  // ===================================================

  bleSetup();


  // ===================================================
  // RESET BUTTON
  // ===================================================

  resetButton =
    createButton(
      "RESET"
    );


  resetButton.id(
    "resetButton"
  );


  resetButton.mousePressed(
    resetExperiment
  );


  // ===================================================
  // LOAD HANDPOSE
  // ===================================================

  handPose =
    await ml5.handPose();


  // ===================================================
  // SELFIE CAMERA
  // ===================================================

  video =
    createCapture(
      {
        video: {
          facingMode: "user"
        },

        audio: false
      }
    );


  video.size(
    640,
    480
  );


  video.hide();


  // ===================================================
  // CREATE TARGETS
  // ===================================================

  createTargets();


  // ===================================================
  // START HAND DETECTION
  // ===================================================

  handPose.detectStart(
    video,
    gotHands
  );
}


// =====================================================
// CREATE FOUR TARGETS
// =====================================================

function createTargets() {

  targets = [

    {
      x: width * 0.14,
      activated: false
    },

    {
      x: width * 0.38,
      activated: false
    },

    {
      x: width * 0.62,
      activated: false
    },

    {
      x: width * 0.86,
      activated: false
    }

  ];
}


// =====================================================
// DRAW
// =====================================================

function draw() {

  background(0);


  // ===================================================
  // MIRRORED SELFIE CAMERA
  // ===================================================

  push();


  translate(
    width,
    0
  );


  scale(
    -1,
    1
  );


  image(
    video,
    0,
    0,
    width,
    height
  );


  pop();


  // ===================================================
  // HAND TRACKING
  // ===================================================

  for (
    let i = 0;
    i < hands.length;
    i++
  ) {

    let hand =
      hands[i];


    for (
      let j = 0;
      j < hand.keypoints.length;
      j++
    ) {

      let keypoint =
        hand.keypoints[j];


      // =================================================
      // SCALE HANDPOSE COORDINATES TO SCREEN
      // =================================================

      let scaledX =
        map(
          keypoint.x,
          0,
          640,
          0,
          width
        );


      let scaledY =
        map(
          keypoint.y,
          0,
          480,
          0,
          height
        );


      // =================================================
      // MIRROR X
      // =================================================

      let mirroredX =
        width -
        scaledX;


      let mirroredY =
        scaledY;


      // =================================================
      // GREEN HAND KEYPOINT
      // =================================================

      noStroke();


      fill(
        0,
        255,
        0
      );


      circle(
        mirroredX,
        mirroredY,
        10
      );


      // =================================================
      // CHECK ALL TARGETS
      // =================================================

      for (
        let t = 0;
        t < targets.length;
        t++
      ) {

        let target =
          targets[t];


        // -----------------------------------------------
        // ALREADY ACTIVATED?
        //
        // Ignore it completely.
        // Servo can only activate once.
        // -----------------------------------------------

        if (
          target.activated
        ) {

          continue;
        }


        let targetY =
          height / 2;


        let distance =
          dist(
            mirroredX,
            mirroredY,
            target.x,
            targetY
          );


        // =================================================
        // HAND TOUCHES TARGET
        // =================================================

        if (
          distance <=
          targetRadius
        ) {

          activateTarget(
            t
          );
        }
      }
    }
  }


  // ===================================================
  // DRAW TARGETS
  // ===================================================

  drawTargets();
}


// =====================================================
// ACTIVATE TARGET ONCE
// =====================================================

function activateTarget(index) {

  // Safety check

  if (
    targets[index].activated
  ) {

    return;
  }


  // Permanently activate visually

  targets[index].activated =
    true;


  let servoNumber =
    index + 1;


  console.log(
    "TARGET ACTIVATED:",
    servoNumber
  );


  // ===================================================
  // SEND BLE COMMAND ONCE
  // ===================================================

  sendServoCommand(
    servoNumber
  );
}


// =====================================================
// DRAW TARGETS
// =====================================================

function drawTargets() {

  for (
    let i = 0;
    i < targets.length;
    i++
  ) {

    let target =
      targets[i];


    let targetY =
      height / 2;


    // =================================================
    // ACTIVATED = PERMANENT YELLOW
    // =================================================

    if (
      target.activated
    ) {

      fill(
        255,
        215,
        70,
        210
      );


      stroke(
        255
      );


      strokeWeight(
        5
      );

    }


    // =================================================
    // NOT YET ACTIVATED
    // =================================================

    else {

      fill(
        255,
        255,
        255,
        60
      );


      stroke(
        255,
        255,
        255,
        220
      );


      strokeWeight(
        3
      );
    }


    circle(
      target.x,
      targetY,
      targetDiameter
    );


    // =================================================
    // NUMBER
    // =================================================

    noStroke();


    if (
      target.activated
    ) {

      fill(
        40
      );

    }

    else {

      fill(
        255
      );
    }


    textAlign(
      CENTER,
      CENTER
    );


    textSize(
      24
    );


    textStyle(
      BOLD
    );


    text(
      i + 1,
      target.x,
      targetY
    );


    textStyle(
      NORMAL
    );
  }
}


// =====================================================
// RESET EXPERIMENT
// =====================================================

function resetExperiment() {

  console.log(
    "RESET"
  );


  // ===================================================
  // RESET DIGITAL TARGETS
  // ===================================================

  for (
    let i = 0;
    i < targets.length;
    i++
  ) {

    targets[i].activated =
      false;
  }


  // ===================================================
  // RESET PHYSICAL SERVOS
  // ===================================================

  sendResetCommand();
}


// =====================================================
// HANDPOSE CALLBACK
// =====================================================

function gotHands(results) {

  hands =
    results;
}


// =====================================================
// WINDOW RESIZE
// =====================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );


  // Preserve activation states when resizing

  let oldStates =
    targets.map(
      target =>
        target.activated
    );


  createTargets();


  for (
    let i = 0;
    i < targets.length;
    i++
  ) {

    targets[i].activated =
      oldStates[i] || false;
  }
}
