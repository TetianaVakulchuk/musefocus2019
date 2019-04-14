# museBlink
*read with your mind not eyes!*
It reads alpha_absolute from muse and according to sum of all channel alpha values changes the fontSize of the text the purpose is when you focus you read bigger if your away thinking than just skim it don't spend time or opposite. Experiment.

![Demo](https://media.giphy.com/media/3ohjUZnd8hPaguPbDq/giphy.gif)

# Connection with muse headset

muse-io --device-search Muse-855C --osc osc.udp://172.17.9.164:57121
please replace your muse name to here > Muse-855C

ready to listen run node .
open the localhost:8081

you can edit fontSize from /web/socket-synth.js line 132!

# UDP -> Web Socket Example

This example illustrates a Node.js server that will relay OSC messages sent via
a UDP socket (listening on port 57121) to a web page using a Web Socket connection.

By default, it is configured to handle OSC messages via UDP from Lemur's AB Faderlab project.
It maps four parameters of a simple Flocking-based FM synthesizer to the first four
faders in the Lemur project. Here is the mapping:

<table>
    <tr>
        <th>OSC Address</th>
        <th>OSC Argument Type</th>
        <th>Synth Paramter</th>
    </tr>
    <tr>
        <td>/fader1/out</td>
        <td>float 0.0 - 1.0</td>
        <td>carrier frequency</td>
    <tr>
    <tr>
        <td>/fader2/out</td>
        <td>float 0.0 - 1.0</td>
        <td>carrier amplitude</td>
    <tr>
    <tr>
        <td>/fader3/out</td>
        <td>float 0.0 - 1.0</td>
        <td>modulator frequency</td>
    <tr>
    <tr>
        <td>/fader4/out</td>
        <td>float 0.0 - 1.0</td>
        <td>modulator amplitude</td>
    <tr>
</table>

If you don't have a copy of Lemur, you can use the SuperCollider test client created by [Jascha Narveson](https://github.com/jaschanarveson), which is located in the [utils](../utils/supercollider-lemur-faderlab-style-client.scd) directory.

## Installation

1. Run <code>npm install</code> in the terminal to install all required Node dependencies
2. In the <code>web</code> directory, run <code>bower install</code> to install all web dependencies

## Running the Example

1. Run `node .` in the Terminal
2. Open `http://localhost:8081` in your browser
3. Control the synth using OSC messages sent from Lemur or another OSC server

## Remarks

This project was example of the cool repo of [OSC](https://github.com/colinbdclark/osc.js),

osc.js Examples

This repository contains examples of how to use osc.js in a variety of situations, including in a browser with Web Sockets, on Node.js, and in a Chrome App.

For more information, please see osc.js.
