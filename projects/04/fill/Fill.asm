// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, the
// program clears the screen, i.e. writes "white" in every pixel.

// Put your code here.


(START_SCREEN_LOOP)
@SCREEN //?? is this the address of the beginning of the screen, or does it hold it??
D=A 
@nextSec //holds address of next section to fill
M=D //sets next_sec to screen address
@KEY_LISTEN
0;JMP


(KEY_LISTEN)
@KBD
D=M
@BITS_OFF
D;JEQ  //if no press goto off
@BITS_ON
0;JMP  //if press goto on


(LOOP_SCREEN)
//increment next_sec
@nextSec
M=M+1

//compare nextSec and keyboard addr
D=M //value of nextsec
@KBD
D=A-D //value of keyboardAddr-nextSec

//if nextSec < keyboard goto listen
@KEY_LISTEN
D;JGT
//else goto start_loop
@START_SCREEN_LOOP
0;JMP


(BITS_ON)
//turn bits in write on
@write
M=-1
@WRITE_BITS
0;JMP

(BITS_OFF)
//turns bits in write off
@write
M=0
@WRITE_BITS
0;JMP

(WRITE_BITS)
@write
D=M
@nextSec
A=M //select address of value in nextSec
M=D
@LOOP_SCREEN
0;JMP

