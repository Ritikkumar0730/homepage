(function(){
  const cv=document.getElementById('bh');
  if(!cv) return;
  const ctx=cv.getContext('2d');
  let W,H,cx,cy,DPR;
  function size(){
    DPR=Math.min(devicePixelRatio||1,1.4);
    W=cv.width=Math.floor(innerWidth*DPR*0.55);
    H=cv.height=Math.floor(innerHeight*DPR*0.55);
    cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';
    cx=W*0.5;cy=H*0.46;
  }
  size();addEventListener('resize',size);

  function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const rnd=mulberry(1337),GS=256,grid=new Float32Array(GS*GS);
  for(let i=0;i<grid.length;i++)grid[i]=rnd();
  const sm=t=>t*t*(3-2*t);
  function noise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,
    a=grid[(xi&255)+(yi&255)*GS],b=grid[(xi+1&255)+(yi&255)*GS],
    c=grid[(xi&255)+(yi+1&255)*GS],d=grid[(xi+1&255)+(yi+1&255)*GS],u=sm(xf),v=sm(yf);
    return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;}
  function fbm(x,y){let s=0,a=0.5,f=1;for(let o=0;o<4;o++){s+=a*noise(x*f,y*f);f*=2;a*=0.5;}return s;}
  const stops=[[0,[10,4,2]],[.25,[120,40,12]],[.45,[240,110,30]],[.62,[255,180,90]],
               [.78,[255,235,200]],[.90,[210,225,255]],[1,[170,200,255]]];
  function ramp(t){t=t<0?0:t>1?1:t;for(let i=0;i<stops.length-1;i++){if(t<=stops[i+1][0]){
    const f=(t-stops[i][0])/(stops[i+1][0]-stops[i][0]),a=stops[i][1],b=stops[i+1][1];
    return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}}return stops[6][1];}

  const TILT=0.32;let time=0;
  function render(){
    time+=0.0035;
    const img=ctx.createImageData(W,H),data=img.data;
    const R=Math.min(W,H)*0.46,Rin=R*0.34,horizon=Rin*0.92,bcx=cx,bcy=cy;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const dx=x-bcx,dy=y-bcy,py=dy/TILT,r=Math.hypot(dx,py),ang=Math.atan2(py,dx);
      let R0=0,G0=0,B0=0;
      if(r>Rin&&r<R){
        const rn=(r-Rin)/(R-Rin),temp=1-rn,spin=time*2.2/(0.3+rn),
          u=Math.cos(ang+spin)*r*0.018+r*0.02,v=Math.sin(ang+spin)*r*0.018+ang*2.0;
        let turb=0.55+fbm(u,v)*0.9;
        const dopp=1+0.55*Math.cos(ang);
        let bright=temp*temp*turb*dopp*1.5;
        bright*=Math.min(1,(r-Rin)/(Rin*0.25));bright*=Math.min(1,(R-r)/(R*0.28));
        const col=ramp(temp*0.55+turb*0.18+0.1);
        R0+=col[0]*bright;G0+=col[1]*bright;B0+=col[2]*bright;
      }
      {const lx=dx,arcY=-(R*0.52)*Math.sqrt(Math.max(0,1-(lx/(R*1.05))**2)),
         band=Math.exp(-((dy-arcY)**2)/(2*(R*0.085)**2));
       if(band>0.01&&Math.abs(lx)<R*1.02){
         const rn=Math.abs(lx)/R,temp=1-rn*0.7,turb=0.6+fbm(lx*0.02+time*1.5,7.0)*0.8,
           bright=band*temp*turb*1.5,col=ramp(temp*0.5+0.15);
         R0+=col[0]*bright;G0+=col[1]*bright;B0+=col[2]*bright;}}
      const rs=Math.hypot(dx,dy),ringR=horizon*1.06,
        ring=Math.exp(-((rs-ringR)**2)/(2*(horizon*0.045)**2));
      if(ring>0.01){const b=ring*1.3*(1+0.6*Math.cos(Math.atan2(dy,dx)));
        R0+=255*b;G0+=240*b;B0+=210*b;}
      if(rs<horizon){const k=Math.min(1,(horizon-rs)/(horizon*0.10));R0*=(1-k);G0*=(1-k);B0*=(1-k);}
      const idx=(y*W+x)*4;
      data[idx]=255*(1-Math.exp(-R0/255));data[idx+1]=255*(1-Math.exp(-G0/255));
      data[idx+2]=255*(1-Math.exp(-B0/255));data[idx+3]=255;
    }
    ctx.putImageData(img,0,0);
    requestAnimationFrame(render);
  }
  render();
})();
