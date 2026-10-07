// =====================================================
// EXPERIMENT 1D
// BLE SERIAL
// =====================================================


// SAME UUIDs AS WORKING EXPERIMENT 1E

const serviceUuid =
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

const txCharacteristic =
  "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

const rxCharacteristic =
  "6e400003-b5a3-f393-e0a9-e50e24dcca9e";


let myCharacteristicRx;
let myCharacteristicTx;

let myBLE;

let bleConnected = false;

let connectButton;


// =====================================================
// BLE SETUP
// =====================================================

function bleSetup() {

  myBLE =
    new p5ble();


  connectButton =
    createButton(
      "Connect BLE"
    );


  connectButton.id(
    "connectBLE"
  );


  connectButton.mousePressed(
    connectAndStartNotify
  );
}


// =====================================================
// CONNECT
// =====================================================

function connectAndStartNotify() {

  console.log(
    "CONNECT PRESSED"
  );


  myBLE.connect(
    serviceUuid,
    gotCharacteristics
  );
}


// =====================================================
// CHARACTERISTICS
// =====================================================

function gotCharacteristics(
  error,
  characteristics
) {

  if (error) {

    console.log(
      "BLE CONNECTION ERROR:",
      error
    );

    return;
  }


  console.log(
    "GOT CHARACTERISTICS:",
    characteristics.length
  );


  for (
    let i = 0;
    i < characteristics.length;
    i++
  ) {

    console.log(
      "FOUND UUID:",
      characteristics[i].uuid
    );


    // ESP32 -> PHONE

    if (
      rxCharacteristic ==
      characteristics[i].uuid
    ) {

      myCharacteristicRx =
        characteristics[i];


      myBLE.startNotifications(
        myCharacteristicRx,
        handleNotifications,
        "string"
      );
    }


    // PHONE -> ESP32

    else if (
      txCharacteristic ==
      characteristics[i].uuid
    ) {

      myCharacteristicTx =
        characteristics[i];
    }
  }


  // ===================================================
  // CONNECTION COMPLETE
  // ===================================================

  if (
    myCharacteristicTx
  ) {

    bleConnected =
      true;


    connectButton.html(
      "BLE Connected"
    );


    connectButton.addClass(
      "connected"
    );


    console.log(
      "BLE FULLY CONNECTED"
    );

  }

  else {

    console.log(
      "TX CHARACTERISTIC NOT FOUND"
    );
  }
}


// =====================================================
// RECEIVE FROM ESP32
// =====================================================

function handleNotifications(data) {

  console.log(
    "ESP32:",
    data
  );
}


// =====================================================
// SEND SERVO COMMAND
// =====================================================

function sendServoCommand(
  servoNumber
) {

  if (
    !bleConnected ||
    !myCharacteristicTx
  ) {

    console.log(
      "BLE NOT READY"
    );

    return;
  }


  let message =
    String(
      servoNumber
    );


  myBLE.write(
    myCharacteristicTx,
    message
  );


  console.log(
    "BLE SENT:",
    message
  );
}


// =====================================================
// RESET PHYSICAL SERVOS
// =====================================================

function sendResetCommand() {

  if (
    !bleConnected ||
    !myCharacteristicTx
  ) {

    console.log(
      "BLE NOT READY"
    );

    return;
  }


  myBLE.write(
    myCharacteristicTx,
    "R"
  );


  console.log(
    "BLE SENT: R"
  );
}
