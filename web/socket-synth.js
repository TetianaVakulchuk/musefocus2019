var example = example || {};

var alfa_absolute = '/muse/elements/alfa_absolute';
var beta_absolute = '/muse/elements/beta_absolute';

(function () {
    "use strict";

    var freqTransform = function (value) {
        return (value * 6000) + 60;
    };

    var identityTransform = function (value) {
        return value;
    };

    var carrierSpec = {
        freq: {
            inputPath: "carrier.freq.value",
            transform: freqTransform
        },
        mul: {
            inputPath: "carrier.mul",
            transform: identityTransform
        }
    };

    var modulatorSpec = {
        freq: {
            inputPath: "modulator.freq.value",
            transform: freqTransform
        },
        mul: {
            inputPath: "modulator.mul",
            transform: freqTransform
        }
    };

    example.SocketSynth = function () {
        this.oscPort = new osc.WebSocketPort({
            url: "ws://localhost:8081"
        });

        this.listen();
        this.oscPort.open();

        this.oscPort.socket.onmessage = function (e) {
            console.log("message", e);
        };

        this.valueMap = {
            "/muse/acc": carrierSpec.freq,
            "/muse/acc": carrierSpec.freq,

            "/muse/acc": carrierSpec.mul,
            "/fader2/out": carrierSpec.mul,

            "/knobs/2": modulatorSpec.freq,
            "/fader3/out": modulatorSpec.freq,

            "/knobs/3": modulatorSpec.mul,
            "/fader4/out": modulatorSpec.mul,

        };
    };

    example.SocketSynth.prototype.listen = function () {
        this.oscPort.on("ready", console.log('ready'));
        this.oscPort.on("error", function (e) {console.log(e);});
        this.oscPort.on("message", this.mapMessage.bind(this));
        this.oscPort.on("message", function (msg) {
            var address = msg.address;
            if (address == beta_absolute) {
             console.log("message", msg);
            }
        });
    };

    example.SocketSynth.prototype.mapMessage = function (oscMessage) {
        //$("#message").text(fluid.prettyPrintJSON(oscMessage));
        $("#message").text(JSON.stringify(oscMessage));

        var address = oscMessage.address;
        var leftEar = oscMessage.args[0];
        var leftForehead = oscMessage.args[1];
        var rightForehead = oscMessage.args[2];
        var rightEar = oscMessage.args[3];

        var transformSpec = this.valueMap[address];

        if (transformSpec) {
            var transformed = transformSpec.transform(leftEar);
        }
        
        if (address == beta_absolute) {
          //console.log(alfaWave + " | " + betaWave + " | " + gamaWave + " | " + thetaWave + " | ");
          var score = (leftForehead + rightForehead)/2;

          score = score.toFixed(1);
          $("#score").html(score);
        }
    };

}());
