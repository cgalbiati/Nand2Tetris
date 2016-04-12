'use strict';

//ex call: node assemble.js ../pong/pong.asm ../pong/pongMine.hack

const assemble = require('./parsers.js');
const inputName = process.argv[2];
const outputName = process.argv[3];

assemble(inputName, outputName);