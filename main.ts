// Tiny stack VM: faithful implementation of the ISA in kit/program/generator/subject/ISA.md,
// semantics taken opcode by opcode from the reference VM (generator/subject/vm.mjs).
// Node 22 runs this TypeScript directly (erasable syntax only).
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
// Per opcode (0x00..0x53) a hex digit: (pops<<2)|pushes, generated from the reference VM's OPS table.
const T='01146abf0000000099999995999599909990000000000000044000000000000058000000000000004414';
const enc=new TextEncoder;
function run(p:Uint8Array,inp:Uint8Array):[Uint8Array,number]{
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let sp=0,cp=0,pc=0,st=0,ol=0,ip=0;
 const done=(e:number):[Uint8Array,number]=>[o.slice(0,ol),e];
 for(;;){
  if(st===1e6)return done(10);
  if(pc<0||pc>=p.length)return done(9);
  const op=p[pc];
  if(!(op<8||op>=0x10&&op<=0x22||op>=0x30&&op<=0x34||op>=0x40&&op<=0x41||op>=0x50&&op<=0x53))return done(5);
  const imm=op===1?1:op===2?4:op>=0x30&&op<=0x33?2:0;
  if(pc+imm>=p.length)return done(9);
  st++;
  const nx=pc+1+imm,pp=parseInt(T[op],16),pops=pp>>2,pu=pp&3;
  if(sp<pops)return done(2);
  if(sp-pops+pu>256)return done(3);
  pc=nx;
  switch(op){
   case 0:return done(0);
   case 1:D[sp++]=(p[nx-1]<<24)>>24;break;
   case 2:D[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break;
   case 3:sp--;break;
   case 4:D[sp]=D[sp-1];sp++;break;
   case 5:{const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;break;}
   case 6:D[sp]=D[sp-2];sp++;break;
   case 7:{const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;break;}
   case 0x17:D[sp-1]=-D[sp-1]|0;break;
   case 0x1b:D[sp-1]=~D[sp-1];break;
   case 0x30:case 0x31:case 0x32:{
     const rel=((p[nx-2]|p[nx-1]<<8)<<16)>>16;
     let take=op===0x30;
     if(op!==0x30){const v=D[--sp];take=op===0x31?v===0:v!==0;}
     if(take)pc=nx+rel;break;}
   case 0x33:
     if(cp===64)return done(7);
     C[cp++]=nx;pc=p[nx-2]|p[nx-1]<<8;break;
   case 0x34:
     if(cp===0)return done(8);
     pc=C[--cp];break;
   case 0x40:{const a=D[sp-1];if(a<0||a>=256)return done(6);D[sp-1]=M[a];break;}
   case 0x41:{const a=D[sp-1],v=D[sp-2];if(a<0||a>=256)return done(6);sp-=2;M[a]=v;break;}
   case 0x50:{const b=enc.encode(String(D[sp-1]));if(ol+b.length>65536)return done(11);sp--;o.set(b,ol);ol+=b.length;break;}
   case 0x51:if(ol+1>65536)return done(11);o[ol++]=D[--sp]&255;break;
   case 0x52:D[sp++]=ip<inp.length?inp[ip++]:-1;break;
   case 0x53:return done(D[--sp]&255);
   default:{
     const b=D[sp-1],a=D[sp-2];let r=0;
     if(op===0x10)r=a+b|0;
     else if(op===0x11)r=a-b|0;
     else if(op===0x12)r=Math.imul(a,b);
     else if(op===0x13){if(b===0)return done(4);r=a===-2147483648&&b===-1?a:(a/b)|0;}
     else if(op===0x14){if(b===0)return done(4);r=b===-1?0:a%b|0;}
     else if(op===0x15){if(b===0)return done(4);r=Math.floor((a>>>0)/(b>>>0))|0;}
     else if(op===0x16){if(b===0)return done(4);r=(a>>>0)%(b>>>0)|0;}
     else if(op===0x18)r=a&b;
     else if(op===0x19)r=a|b;
     else if(op===0x1a)r=a^b;
     else if(op===0x1c)r=a<<(b&31);
     else if(op===0x1d)r=a>>(b&31);
     else if(op===0x1e)r=a>>>(b&31)|0;
     else if(op===0x20)r=a===b?1:0;
     else if(op===0x21)r=a<b?1:0;
     else r=a>>>0<b>>>0?1:0;
     sp-=2;D[sp++]=r;
   }
  }
 }
}
for(const id of readdirSync(I).sort()){
 const [o,e]=run(new Uint8Array(readFileSync(join(I,id,'program.bin'))),new Uint8Array(readFileSync(join(I,id,'input.bin'))));
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'stdout.bin'),o);
 writeFileSync(join(O,id,'exit.txt'),e+'\n');
}
