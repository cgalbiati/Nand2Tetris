// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.

//set add var to R0
@R0
D=M
@add
M=D

//set max var to R1
@R1
D=M
@max
M=D

//set i var to 0
@0
D=A
@i
M=D

//set sum vr to 0
@0
D=A
@R2
M=D

(LOOP)
//if i==max goto return
@i
D=M
@max
D=D-M
@RETURN
D;JEQ

//compute new sum
@add
D=M
@R2
M=M+D
@1
D=A
@i
M=M+D
@LOOP
0;JMP

(RETURN)
//@sum
//D=M
//@R2
//M=D
@END
0;JMP

(END)
@END
0;
