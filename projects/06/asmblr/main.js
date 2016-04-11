'use strict';

const filename = process.argv[2];
const outputName = process.argv[3];

const Transform = require('stream').Transform;

const fs = require('fs');
const split = require("split");
const wSpaceRE = /\s/;
const splitRE = /[=;]/;
const aOrMRE = /[AM]/;


const nonVarSymDict = {

}

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

let readStream = fs.createReadStream(filename, {flags: 'r', encoding: 'utf-8'});
let writeStream = fs.createWriteStream(outputName);

readStream.on('data', function(d){
  buffStr +=d.toString();
  console.log(d)
  pumpBuf();
});
readStream.on('end', function() {
  console.log('finished')
  writeStream.end()
});

// readStream.pipe(split())
// .on('data', function (line) {
//       //each chunk now is a seperate line! 
//     })
//  )
// .pipe(writeStream).on('finish', function(){console.log('complete')});

function pumpBuf(){
  let newLnPos;
    while ((newLnPos = buffStr.indexOf('\n')) >= 0) { 
        if (newLnPos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
            buffStr = buffStr.slice(1); // discard it
            continue; // so that the next iteration will start with data
        }
        let nextLine = processLine(buffStr.slice(0,newLnPos)); // hand off the line
        //write data
        if (nextLine) {
          var ready = writeStream.write(nextLine);
          if (ready === false) {
            this.pause()
            writeStream.once('drain', this.resume.bind(this));
          }
        }
        buffStr = buffStr.slice(newLnPos+1); // and slice the processed data off the buffer
    }
}

function processLine(line) { 
    if (line[line.length-1] == '\r') line=line.substr(0,line.length-1); // discard CR 
    if (line.length > 0) { // ignore empty lines
        let builtCmd = parseAssembly(line);
        return builtCmd;
    }
    return null;
}

function parseAssembly(line){
  let builtCmd = '';
  if(line[0] === '@') {
    builtCmd += '0';
    //is A instr
    builtCmd += dest.slice(1).toString();
  } else {
  //break into parts 
    let split = line.split(splitRE);
    let dest = split[0];
    let comp = split[1];
    let jmp = split[2] || 'none';
    builtCmd += '111';
    //process comp, dest, jmp
    if(comp.search('A')) builtCmd += '0';
    else builtCmd += '1';
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

}


