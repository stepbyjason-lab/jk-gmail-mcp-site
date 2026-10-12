import * as THREE from './vendor/three.module.js';
import {paintReceiptLabel} from './receipt-label.js';

// Code-native envelope, letter, receipt and book. No product data or image requests.
export function createCinematicSpace(host,{hero=false}={}){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.append(renderer.domElement);
 host.dataset.renderer='three-webgl';host.classList.add('cinema-ready');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,70);camera.position.set(0,0,7.3);
 scene.add(new THREE.HemisphereLight(0xfdf4ff,0x171c49,3));
 for(const [color,intensity,x,y,z]of [[0xffffff,5,-4,5,5],[0xafa0ff,7,4,2,-2],[0x96e7cb,4,-4,-2,1]]){const l=new THREE.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);}
 const violet=new THREE.MeshPhysicalMaterial({color:0x9275ef,metalness:.45,roughness:.25,clearcoat:1,clearcoatRoughness:.15});
 const mint=violet.clone();mint.color.set(0x8ed5c1);const amber=violet.clone();amber.color.set(0xc4909c);
 const paperMat=new THREE.MeshStandardMaterial({color:0xfff4da,side:THREE.DoubleSide,roughness:.66});
 const lineMat=new THREE.MeshBasicMaterial({color:0xbaa48d,transparent:true,opacity:.5});
 const shape=new THREE.Shape();const w=1.25,h=.86,r=.075;shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const body=new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:3});body.center();
 const flapShape=new THREE.Shape();flapShape.moveTo(-.6,0);flapShape.lineTo(0,-.44);flapShape.lineTo(.6,0);flapShape.closePath();
 const flapGeo=new THREE.ExtrudeGeometry(flapShape,{depth:.015,bevelEnabled:true,bevelThickness:.008,bevelSize:.01,bevelSegments:2});
 function envelope(material){const g=new THREE.Group();g.add(new THREE.Mesh(body,material));const flap=new THREE.Mesh(flapGeo,material);flap.position.set(0,.37,.09);g.add(flap);return {g,flap};}
 const field=new THREE.Group();scene.add(field);const envelopes=[];
 const glass=new THREE.MeshPhysicalMaterial({color:0xb5a7f9,metalness:.2,roughness:.3,transparent:true,opacity:.22,depthWrite:false,clearcoat:1});
 for(let i=0;i<(hero?5:36);i++){const env=envelope(hero?glass:[violet,mint,amber][i%3]);if(hero)env.flap.visible=false;field.add(env.g);envelopes.push(env);}
 const central=envelope(violet);scene.add(central.g);
 function sheet(width,height,segments=16){const geo=new THREE.PlaneGeometry(width,height,segments,segments);const position=geo.attributes.position,original=Float32Array.from(position.array);const mesh=new THREE.Mesh(geo,paperMat);return {mesh,geo,original,position};}
 const letter=sheet(1.4,1.95);central.g.add(letter.mesh);letter.mesh.position.set(0,.2,-.08);
 const textLines=new THREE.Group();letter.mesh.add(textLines);const strokeGeo=new THREE.PlaneGeometry(1,.018);
 for(let i=0;i<7;i++){const line=new THREE.Mesh(strokeGeo,lineMat);line.position.set(i%3===2?-.1:0,.62-i*.16,.014);line.scale.x=i%3===2?.72:1;textLines.add(line);}
 let receiptTexture=null,receiptLabel=null;
 if(!hero){
  const canvas=document.createElement('canvas'),fontFamily=document.documentElement.lang==='ko'?'Pretendard Variable':'Segoe UI';
  const label={heading:document.querySelector('.story-amount small').textContent,amount:document.querySelector('.story-amount strong').textContent,fontFamily};
  const paint=()=>{const metrics=paintReceiptLabel(canvas,label);host.dataset.receiptInkWidth=String(metrics.amountWidth);host.dataset.receiptSafeWidth=String(metrics.safeWidth);host.dataset.receiptFont=metrics.fontFamily;};
  paint();receiptTexture=new THREE.CanvasTexture(canvas);receiptTexture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:receiptTexture,transparent:true,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});
  receiptLabel=new THREE.Mesh(letter.geo,material);receiptLabel.position.z=.025;receiptLabel.visible=false;letter.mesh.add(receiptLabel);
  host.closest('.cinema-pin').dataset.receiptLabel='attached';
  document.fonts.load(`750 24px "${fontFamily}"`,label.heading+label.amount).then(()=>{if(disposed)return;paint();receiptTexture.needsUpdate=true;if(visible&&!document.hidden)draw();}).catch(()=>{});
 }
 const book=new THREE.Group();const pages=[];
 const bookTextMat=new THREE.LineBasicMaterial({color:0x9a8770,transparent:true,opacity:.5});
 for(let i=0;i<16;i++){const page=sheet(1.5,2.05,24);book.add(page.mesh);pages.push(page);}scene.add(book);
 const coverGeo=new THREE.BoxGeometry(1.58,2.14,.065);coverGeo.translate(.79,0,0);
 const coverMat=new THREE.MeshStandardMaterial({color:0x5c487e,roughness:.7});
 for(const side of [-1,1]){const cover=new THREE.Mesh(coverGeo,coverMat);cover.position.set(0,0,-.095);cover.scale.x=side;cover.rotation.y=-side*.12;book.add(cover);
  for(let j=0;j<10;j++){const points=Array.from({length:25},(_,k)=>{const ratio=.12+k/24*.75;return new THREE.Vector3(side*1.5*ratio,.72-j*.145,Math.sin(ratio*Math.PI)*.23+.007);});const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),bookTextMat);line.rotation.y=-side*.12;book.add(line);}
 }
 const spine=new THREE.Mesh(new THREE.BoxGeometry(.055,2.15,.14),coverMat);spine.position.z=-.105;book.add(spine);
 const orbitMaterial=new THREE.LineBasicMaterial({color:0xae9cff,transparent:true,opacity:.27});
 const pts=Array.from({length:121},(_,i)=>{const a=i/120*Math.PI*2;return new THREE.Vector3(Math.cos(a)*3.2,Math.sin(a)*1.8,Math.sin(a)*1.1);});
 const orbitGeo=new THREE.BufferGeometry().setFromPoints(pts),orbit=new THREE.LineLoop(orbitGeo,orbitMaterial);scene.add(orbit);central.g.visible=false;book.visible=false;
 let frame=null,last=0,time=0,visible=false,still=false,progress=0,lost=false,disposed=false;
 const smooth=(a,b,v)=>THREE.MathUtils.smoothstep(v,a,b),lerp=THREE.MathUtils.lerp;
 function draw(){if(lost||disposed)return;
  const p=hero?0:Math.max(0,Math.min(3.999,progress*4)),gather=smooth(.25,1,p),open=smooth(.65,1.25,p),receipt=smooth(1.5,2.5,p),reading=smooth(2.65,3.5,p);
  host.dataset.stage=hero?'hero':String(Math.min(3,Math.floor(p)));
  const mobile=host.clientWidth<650;camera.position.z=mobile?8.8:7.3;
  field.rotation.z=hero?time*.07:(1-gather)*progress*.45;field.rotation.y=Math.sin(time*.2)*.09;
  envelopes.forEach(({g},i)=>{const a=i*2.399963+time*(still?0:.025),radius=1.65+(i%7)*.42;
   g.position.set(Math.cos(a)*radius,Math.sin(a)*radius*.64,Math.sin(i*1.8)*1.6);
   const size=(.32+(i%5)*.13)*(hero?1.15:1-gather*.85);g.scale.setScalar(size);
   g.position.x=lerp(g.position.x,0,gather);g.position.y=lerp(g.position.y,0,gather);
   g.rotation.set(Math.sin(time*.2+i)*.25,Math.cos(time*.3+i)*.45,Math.sin(a)*.32);g.visible=hero||gather<.99;
   if(hero){g.position.set(1.4+(i-2)*.65,Math.sin(i*2+time*.45)*1.55,-1.3-i*.08);g.scale.set(1.25,.8,1);g.rotation.set(.15,-.2+Math.sin(time*.25+i)*.25,.18+Math.sin(time*.35+i)*.12);}
  });
  if(!hero){central.g.visible=reading<.7;central.g.scale.setScalar(lerp(.2,1.6,gather)*(1-reading*.18));central.g.position.set(0,-.25,-.2);
  central.g.rotation.set(-.08+Math.sin(time*.45)*.03,-.2+progress*.22,.08*Math.sin(time*.3));
  central.flap.rotation.x=-open*Math.PI*.88;central.flap.visible=receipt<.1;
  central.g.children[0].scale.y=1-receipt*.45;central.g.children[0].visible=receipt<.1;
  letter.mesh.visible=open>.01;letter.mesh.position.y=lerp(.02,.2,open);letter.mesh.position.z=lerp(-.08,.2,open);
  letter.mesh.scale.set(1-receipt*.14,1+receipt*.36,1);
  receiptLabel.visible=p>=2&&p<3;
  textLines.children.forEach((line,i)=>{line.visible=receipt<.1||i===0;});
  const pos=letter.position;for(let i=0;i<pos.count;i++){const x=letter.original[i*3],y=letter.original[i*3+1];pos.setXYZ(i,x,y,Math.sin(y*2+time*.55)*receipt*.13);}pos.needsUpdate=true;letter.geo.computeVertexNormals();
  book.visible=!hero&&reading>.01;book.scale.setScalar(1.5*reading);book.rotation.set(-.66,-.12,Math.sin(time*.3)*.02);book.position.set(0,-.07,0);
  if(book.visible)pages.forEach((page,i)=>{const side=i<8?-1:1,index=i%8;page.mesh.position.set(0,0,-index*.009);page.mesh.rotation.y=-side*(.12+index*.002)*reading;if(!page.ready){const p=page.position;for(let k=0;k<p.count;k++){const ratio=(page.original[k*3]+.75)/1.5,y=page.original[k*3+1];p.setXYZ(k,side*1.5*ratio,y,Math.sin(ratio*Math.PI)*(.23-index*.012));}p.needsUpdate=true;page.geo.computeVertexNormals();page.ready=true;}});}
  orbit.rotation.set(.2,hero?Math.sin(time*.2)*.3:progress*.55,time*.035);orbit.visible=hero||reading<.4;
  scene.rotation.y=Math.sin(time*.25)*.035;renderer.render(scene,camera);
 }
 function tick(now){frame=null;if(!visible||still||document.hidden||lost||disposed)return;if(now-last>33){time+=Math.min((now-last)/1000,.05);last=now;draw();}frame=requestAnimationFrame(tick);}
 function manage(){if(frame!==null){cancelAnimationFrame(frame);frame=null;}const run=visible&&!still&&!document.hidden&&!lost&&!disposed;host.dataset.motion=run?'running':'stopped';if(run)frame=requestAnimationFrame(tick);else if(visible&&!document.hidden)draw();}
 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(visible)draw();}
 const ro=new ResizeObserver(resize);ro.observe(host);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;host.classList.remove('cinema-ready');host.dataset.renderer='fallback-context-lost';if(receiptLabel)delete host.closest('.cinema-pin').dataset.receiptLabel;manage();});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;host.classList.add('cinema-ready');host.dataset.renderer='three-webgl';if(receiptLabel)host.closest('.cinema-pin').dataset.receiptLabel='attached';manage();});
 function update(o){if('visible'in o)visible=o.visible;if('still'in o)still=o.still;if('progress'in o)progress=o.progress;if(visible&&!document.hidden)draw();manage();}
 function dispose(){disposed=true;manage();ro.disconnect();const geos=new Set(),mats=new Set([violet,mint,amber,paperMat,lineMat,glass,bookTextMat,coverMat,orbitMaterial]);scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());receiptTexture?.dispose();renderer.dispose();renderer.domElement.remove();}
 resize();return {update,dispose};
}
