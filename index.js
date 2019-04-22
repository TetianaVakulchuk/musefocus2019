let osc = require("osc"),
    express = require("express"),
    WebSocket = require("ws");

let getIPAddresses = function () {
    let os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (let deviceName in interfaces) {
        let addresses = interfaces[deviceName];
        for (let i = 0; i < addresses.length; i++) {
            let addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

// Bind to a UDP socket to listen for incoming OSC events.
let udpPort = new osc.UDPPort({
    localAddress: getIPAddresses()[0],
    localPort: 57121
});

udpPort.on("ready", function () {
    let ipAddresses = getIPAddresses();
    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
    console.log("To start the demo, go to http://localhost:8081 in your web browser.");
});

udpPort.open();

// Create an Express-based Web Socket server to which OSC messages will be relayed.
let appResources = __dirname + "/web",
    app = express(),
    server = app.listen(8081),
    wss = new WebSocket.Server({
        server: server
    });

app.use("/", express.static(appResources));
wss.on("connection", function (socket) {
    console.log("A Web Socket connection has been established!");
    let socketPort = new osc.WebSocketPort({
        socket: socket
    });

    new osc.Relay(udpPort, socketPort, {
        raw: true
    });
});
