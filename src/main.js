require("file-loader?name=index.html!./index.html");
// Add a file config js with the following content:
// window.PREFIX = "YOUR_PREFIX";
require("file-loader?name=config.js!./config.js");

// according to https://github.com/mqtt-smarthome/mqtt-smarthome/blob/master/Architecture.md
const TOPIC_LED_SET     = PREFIX + '/set/led';
const TOPIC_LED_STATE   = PREFIX + '/status/led';
const TOPIC_LUX         = PREFIX + '/status/lux';
const TOPIC_ANGLE       = PREFIX + '/status/angle';
const TOPIC_TEMPERATURE = PREFIX + '/status/temperature';
const TOPIC_HUMIDITY    = PREFIX + '/status/humidity';

var info        = document.getElementById("info");
var led         = document.getElementById("led-switch");
var temperature = document.getElementById("temperature");
var humidity    = document.getElementById("humidity");

var mqtt    = require('mqtt');
var gaugeJs = require('gaugeJS');

//http://www.mqtt-dashboard.com/
//http://www.hivemq.com/demos/websocket-client/
var client  = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

var optsLux = {
    angle: 0.05, /// The span of the gauge arc
    lineWidth: 0.124, // The line thickness
    pointer: {
        length: 0.6, // Relative to gauge radius
        strokeWidth: 0.035 // The thickness
    },
    limitMax: true,     // If false, max value increases automatically if value > maxValue
    limitMin: true,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#8FC0DA',    // just experiment with them
    strokeColor: '#E0E0E0'   // to see which ones work best for you
};

var optsAngle = {
    angle: -0.5, // The span of the gauge arc
    lineWidth: 0.03, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
        length: 0.42, // // Relative to gauge radius
        strokeWidth: 0.031, // The thickness
        color: '#000000' // Fill color
    },
    limitMax: true,     // If false, max value increases automatically if value > maxValue
    limitMin: true,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#8FC0DA',    // just experiment with them
    strokeColor: '#E0E0E0'
};
var targetLux = document.getElementById('lux'); // your canvas element
var gaugeLux = new gaugeJs.Gauge(targetLux).setOptions(optsLux); // create sexy gauge!
gaugeLux.maxValue = 150; // set max gauge value
gaugeLux.setMinValue(0);  // set min value
gaugeLux.set(0);

var targetAngle = document.getElementById('angle'); // your canvas element
var gaugeAngle = new gaugeJs.Gauge(targetAngle).setOptions(optsAngle); // create sexy gauge!
gaugeAngle.maxValue = 360; // set max gauge value
gaugeAngle.setMinValue(0);  // set min value
gaugeAngle.set(0);

client.on('connect', function () {
    console.log("connect");
    client.subscribe(TOPIC_LUX);
    client.subscribe(TOPIC_ANGLE);
    client.subscribe(TOPIC_LED_STATE);
    client.subscribe(TOPIC_TEMPERATURE);
    client.subscribe(TOPIC_HUMIDITY);
});

client.on('message', function (topic, message) {
    var msg = "Last MQTT Message: '" + message.toString() + "' on " + topic;
    console.log(msg);
    info.innerHTML = msg;

    if (topic === TOPIC_LED_STATE) {
        setLedState(parseInt(message));
    } else if (topic === TOPIC_LUX) {
       setLux(parseFloat(message.toString()))
    } else if (topic === TOPIC_ANGLE) {
        setAngle(parseInt(message.toString()))
    } else if (topic === TOPIC_TEMPERATURE) {
        setTemperature(parseFloat(message.toString()));
    } else if (topic === TOPIC_HUMIDITY) {
        setHumidity(parseFloat(message.toString()));
    } else {
        console.log("WARN unexpected topic " + topic);
    }
});

window. onClickLedStateChange = function (item) {
    led.style.color = 'red';
    if(led.innerHTML === "LED OFF") {
        console.log("Publish 1 to " + TOPIC_LED_SET);
        client.publish(TOPIC_LED_SET, "1");
    } else {
        console.log("Publish 0 to " + TOPIC_LED_SET);
        client.publish(TOPIC_LED_SET, "0");
    }
};

function setLux(lux) {
    console.log("lux: " + lux);
    gaugeLux.set(lux);
}

function  setAngle(angle) {
    console.log("angle: " + angle);
    gaugeAngle.set(angle);
}

function setLedState(state) {
    led.style.color = 'black';
    if(state === 1) {
        led.innerHTML = "LED ON";
    } else if(state === 0) {
        led.innerHTML = "LED OFF";
    } else {
        console.log("WARN unexpected LED state " + state);
    }
}

function setTemperature(value) {
    temperature.innerHTML = value + "° C";
}

function setHumidity(value) {
    humidity.innerHTML = value + "%";
}