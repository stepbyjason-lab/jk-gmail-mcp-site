// Trusted public example text, fitted before being mapped onto the receipt itself.
export function paintReceiptLabel(canvas,{heading,amount,fontFamily}){
 canvas.width=1024;canvas.height=2304;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Receipt label canvas unavailable');
 const safeWidth=800;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#48354e';
 function line(text,weight,size,y){
  ctx.font=`${weight} ${size}px "${fontFamily}", sans-serif`;
  const measured=ctx.measureText(text).width;if(measured>safeWidth){size*=safeWidth/measured;ctx.font=`${weight} ${size}px "${fontFamily}", sans-serif`;}
  ctx.fillText(text,canvas.width/2,y,safeWidth);
  return Math.min(ctx.measureText(text).width,safeWidth);
 }
 const headingWidth=line(heading,400,44,1010),amountWidth=line(amount,750,170,1210);
 return {safeWidth,headingWidth,amountWidth,fontFamily};
}
