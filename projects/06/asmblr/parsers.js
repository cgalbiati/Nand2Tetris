'use strict';

const fs = require('fs');
const split = require("split");
const wSpaceRE = /\s/g;
const commentRE = /\/\/.*$/;
const splitRE = /[=;]/;
const aOrMRE = /[AM]/;


const symbolTable = {

  SCREEN: 16384,
  KBD:  24576,

  SP: 0, 
  LCL: 1,
  ARG: 2,
  THIS: 3, 
  THAT: 4,

  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  R13: 13,
  R14: 14,
  R15: 15,

};

const compDict = {
  A: '0',
  M: '1',
  '0': '101010',
  '1': '111111',
  '-1': '111010',
  'D': '001100',
  'Y': '110000',
  '!D': '001101',
  '!Y': '110001',
  '-D': '001111',
  '-Y': '110011',
  'D+1': '011111',
  'Y+1': '110111',
  'D-1': '001110',
  'Y-1': '110010',
  'D+Y': '000010',
  'D-Y': '010011',
  'Y-D': '000111',
  'D&Y': '000000',
  'D|Y': '010101',
};

const destDict = {
  none: '000',
  M: '001',
  D: '010',
  MD: '011',
  A: '100',
  AM: '101',
  AD: '110',
  AMD: '111'
};

const jmpDict = {
  none: '000',
  JGT: '001',
  JEQ: '010',
  JGE: '011',
  JLT: '100',
  JNE: '101',
  JLE: '110',
  JMP: '111'
};

let buffStr = '';
let lnNum = 0;
let nextMem = 16;

function startParse(inputName, outputName){

  let readStream = fs.createReadStream(inputName, {flags: 'r', encoding: 'utf-8'});

  readStream.on('data', function(d){
    buffStr +=d.toString();
    console.log(d);
    //parse line
    pumpBuf(parseForSym, null);
  });
  readStream.on('end', function() {
    console.log('finished with first pass');
    console.log(symbolTable);
    secondPass(inputName, outputName);
  });

}

function secondPass(inputName, outputName){

  buffStr = '';

  let readStream = fs.createReadStream(inputName, {flags: 'r', encoding: 'utf-8'});
  let writeStream = fs.createWriteStream(outputName);

  readStream.on('data', function(d){
    buffStr +=d.toString();
    pumpBuf(processLine, readStream, writeStream);
  });
  readStream.on('end', function() {
    console.log('finished');
    writeStream.end();
  });

}

function parseForSym(line){
  //if label
  if(line[0] === '(') {
    //parse out what is between ()'s
    let endIdx = line.search( /\)/ );
    let label = line.slice(1, endIdx);
    //add to symbol table
    symbolTable[label] = lnNum;
  } else lnNum ++;
}

function pumpBuf(cb, readStream, writeStream){
  let newLnPos;
    while ((newLnPos = buffStr.indexOf('\n')) >= 0) { 
        if (newLnPos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
            buffStr = buffStr.slice(1); // discard it
            continue; // so that the next iteration will start with data
        }
        let nextLine = buffStr.slice(0, newLnPos);
        nextLine = nextLine.replace(wSpaceRE, '');
        nextLine = nextLine.replace(commentRE, '');
        if(nextLine.length && nextLine[0] !== '/') cb(nextLine, readStream, writeStream); // hand off the line        
        buffStr = buffStr.slice(newLnPos+1); // and slice the processed data off the buffer
    }
}


function processLine(line, readStream, writeStream) {     
    if (line.length > 0 && line[0] !== '(') { // ignore empty lines
        let builtCmd = parseAssembly(line);
        return writeLine(builtCmd, readStream, writeStream);
    }
    return null;
}

function parseAssembly(line){
  if(line[0] === '@') {
    //is A instr
    return buildA(line);
    builtCmd += dest.slice(1).toString();
  } else {
  //is C instr
    return buildC(line);
  }

}

function buildA(line){
  let builtCmd = '';
  //get sym
  let sym = line.slice(1);
  //look in table
  if (!symbolTable[sym]) {
    symbolTable[sym] = nextMem;
    nextMem ++;
  }
  //convert to binary
  if(Number(sym)>=0) builtCmd += parseInt(sym, 10).toString(2);
  else builtCmd += (symbolTable[sym]).toString(2); 

  console.log('string', Number(sym)>=0, sym, builtCmd);
  //add 0's to beginning
  for(let i = builtCmd.length; i<16; i++) builtCmd = '0' + builtCmd;
  console.log('built a', builtCmd);
  return builtCmd + '\n';
}

function buildC(line){
  let builtCmd = '111';
  //break into parts
  let split = line.split(splitRE);
  console.log('split', split)
  let dest = line.search('=') > -1 ? split[0] : 'none';
  let comp = dest === 'none' ? split[0] : split[1];
  let jmp = dest === 'none' ? split[1] || 'none' : split[2] || 'none';
  console.log(dest, comp, jmp)
  //process comp, dest, jmp
  if(comp.search('M') > -1) builtCmd += '1';
  else builtCmd += '0';
  //repalce A or M with Y for compDict
  comp = comp.replace(aOrMRE, 'Y');
  //add matching seq from compDict
  builtCmd += compDict[comp];
  builtCmd += destDict[dest];
  builtCmd += jmpDict[jmp];
  builtCmd += '\n';
  console.log('built', line, builtCmd);
  return builtCmd;
}

function writeLine (nextLine, readStream, writeStream){
  if (nextLine) {
    var ready = writeStream.write(nextLine);
    if (ready === false) {
      readStream.pause()
      writeStream.once('drain', readStream.resume.bind(readStream));
    }
  }
}

module.exports = startParse;
