(function(){
  const t=document.getElementById('menuToggle'),o=document.getElementById('navOverlay'),
        p=document.getElementById('navPanel'),c=document.getElementById('navClose');
  if(!t) return;
  const open=()=>{o.classList.add('open');p.classList.add('open')};
  const close=()=>{o.classList.remove('open');p.classList.remove('open')};
  t.onclick=open;c.onclick=close;o.onclick=close;
  addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
