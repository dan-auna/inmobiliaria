/* ================= UTILIDADES, ESTADO Y ANALÍTICA ================= */
const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESL = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre'];
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const fd = ts => { const d=new Date(ts); return d.getDate()+' '+MES[d.getMonth()]; };
const fdl = ts => { const d=new Date(ts); return d.getDate()+' '+MES[d.getMonth()]+' '+d.getFullYear(); };
const sum = (a,k)=>a.reduce((s,x)=>s+(typeof k==='function'?k(x):x[k]||0),0);
const nf = n => Math.round(n).toLocaleString('en-US');
const S = {
  view:'resumen', period:'12m', city:'all', project:'all', advisor:'all', cur:'USD', metric:'monto',
  jcity:'all', jstage:'all', jq:'',
  pq:'', pproj:'all', pstatus:'all', pbed:'all', pprice:'all', padv:'all', psort:'price-desc', pview:'tabla', ppage:1,
  cq:'', cadv:'all', cproj:'all', csrc:'all', ctemp:'all', cview:'kanban',
  asort:'rev', adir:-1, lsort:'stage'
};
try { const c = localStorage.getItem('nuvia-cur'); if (c==='PEN'||c==='USD') S.cur = c; } catch(e){}

/* Moneda: los precios se guardan en US$ y se convierten */
const fx = usd => S.cur==='PEN' ? usd*TC : usd;
const sym = () => S.cur==='PEN' ? 'S/' : 'US$';
function mc(usd){ const v=fx(usd), a=Math.abs(v), s=sym();
  if (a>=1e6) return s+' '+(v/1e6).toFixed(a>=1e7?1:2)+' M';
  if (a>=1e3) return s+' '+Math.round(v/1e3)+' K';
  return s+' '+Math.round(v); }
const mf = usd => sym()+' '+nf(fx(usd));
const axisM = usd => { const v=fx(usd); return v>=1e6 ? (v/1e6).toFixed(v%1e6?1:0)+' M' : v>=1e3 ? Math.round(v/1e3)+' K' : Math.round(v)+''; };
const pct = (v,d=1) => (v*100).toFixed(d).replace(/\.0$/,'')+'%';

/* Metas: se calibran con las ventas reales de 12 meses */
(function(){
  const n12 = UNITS.filter(u=>u.status==='Vendido'&&u.saleTs>=ago(365)).length;
  const k = (n12/12)/sum(ADV,'goal')*1.02;
  ADV.forEach(a=>a.goal=+(a.goal*k).toFixed(2));
})();
const AVG_TICKET = sum(UNITS.filter(u=>u.status==='Vendido'),'sold')/UNITS.filter(u=>u.status==='Vendido').length;

/* ---------- Períodos y filtros globales ---------- */
const mStart = off => new Date(NOW.getFullYear(), NOW.getMonth()+off, 1).getTime();
function getPeriod(){
  const id=S.period, end=T0+DAY, buckets=[];
  if (id==='30'||id==='90'){
    const days=+id, n=id==='30'?6:9, size=days/n, start=T0-days*DAY;
    for(let i=0;i<n;i++){ const s=start+i*size*DAY, e=s+size*DAY; buckets.push({s,e,label:fd(e-DAY)}); }
    return {id,start,end,buckets,prevStart:start-days*DAY,prevEnd:start,months:days/30,label:'últimos '+days+' días'};
  }
  const nm = id==='6m'?6:id==='12m'?12:NOW.getMonth()+1, start=mStart(-(nm-1));
  for(let i=0;i<nm;i++){ const s=mStart(-(nm-1)+i), e=mStart(-(nm-1)+i+1); buckets.push({s,e,label:MES[new Date(s).getMonth()]}); }
  return {id,start,end,buckets,prevStart:mStart(-(2*nm-1)),prevEnd:start,months:(end-start)/(30.4*DAY),label:id==='ytd'?'año '+NOW.getFullYear():'últimos '+nm+' meses'};
}
const okUnit = u => (S.city==='all'||u.city===S.city)&&(S.project==='all'||u.project===S.project)&&(S.advisor==='all'||u.adv===S.advisor);
const okLead = l => (S.city==='all'||l.city===S.city)&&(S.project==='all'||l.project===S.project)&&(S.advisor==='all'||l.advisor===S.advisor);
const SOLD = UNITS.filter(u=>u.status==='Vendido');
const salesIn = (a,b) => SOLD.filter(u=>u.saleTs>=a&&u.saleTs<b&&okUnit(u));
const leadsIn = (a,b) => LEADS.filter(l=>l.createdTs>=a&&l.createdTs<b&&okLead(l));
function agg(a,b){ const s=salesIn(a,b), l=leadsIn(a,b), rev=sum(s,'sold');
  return {s,l,rev,n:s.length,lead:l.length,tk:s.length?rev/s.length:0,conv:l.length?s.length/l.length:0,visits:l.filter(x=>x.reached>=3).length}; }
function goalMonthly(){
  const city = S.project!=='all' ? projById[S.project].city : S.city;
  const set = S.advisor!=='all' ? [advById[S.advisor]] : ADV.filter(a=>city==='all'||a.cities.includes(city));
  let g = sum(set,'goal');
  if (S.project!=='all'){ const p=projById[S.project]; g *= p.units.length/sum(PROJ.filter(x=>x.city===p.city),x=>x.units.length); }
  return g;
}
const delta = (c,p) => p>0 ? (c-p)/p : null;
function deltaPill(d, inv){ if (d===null||!isFinite(d)) return '<span class="delta" style="color:var(--fg-3)">—</span>';
  const up = inv ? d<=0 : d>=0; return `<span class="delta ${up?'up':'dn'}">${d>=0?'▲':'▼'} ${Math.abs(d*100).toFixed(Math.abs(d)<.1?1:0)}%</span>`; }

/* ---------- Gráficos SVG ---------- */
function niceMax(v){ if(!v||v<=0) return 1; const raw=v/4, p=Math.pow(10,Math.floor(Math.log10(raw))), n=raw/p; const st=[1,1.2,1.5,2,2.5,3,4,5,10].find(x=>n<=x+1e-9); return st*p*4; }
function sparkline(vals, color){
  const w=72,h=30,p=3,mx=Math.max(...vals,1), mn=Math.min(...vals,0), rg=(mx-mn)||1;
  const pts = vals.map((v,i)=>[p+i*(w-2*p)/Math.max(1,vals.length-1), h-p-(v-mn)/rg*(h-2*p)]);
  const d = pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join('');
  const last = pts[pts.length-1];
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}L${last[0]} ${h}L${pts[0][0]} ${h}Z" fill="${color}" fill-opacity=".14"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="${color}"/></svg>`;
}
function barChart(W, o){
  const H=268, m={l:o.ml||50,r:8,t:14,b:28}, iw=W-m.l-m.r, ih=H-m.t-m.b, n=o.bars.length;
  const mx = niceMax(Math.max(...o.bars,...(o.goal||[0]))*1.06), y=v=>m.t+ih-(v/mx)*ih, step=iw/n, bw=Math.min(54,step*.62);
  let g='';
  for(let i=0;i<=4;i++){ const v=mx*i/4; g+=`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l-8}" y="${y(v)+4}" text-anchor="end">${o.axis(v)}</text>`; }
  let b='', lbl='';
  const skip = n>8 && W<560 ? 2 : 1;
  o.bars.forEach((v,i)=>{
    const x=m.l+step*i+(step-bw)/2, yy=y(v), hh=Math.max(0,m.t+ih-yy), r=Math.min(6,bw/2,hh);
    b+=`<g class="barg" data-tip="${esc(o.tip(i))}"><rect x="${m.l+step*i}" y="${m.t}" width="${step}" height="${ih}" fill="transparent"/><path class="bar${i<n-1&&o.dimOld?' dim':''}" d="M${x} ${m.t+ih}V${yy+r}Q${x} ${yy} ${x+r} ${yy}H${x+bw-r}Q${x+bw} ${yy} ${x+bw} ${yy+r}V${m.t+ih}Z"/></g>`;
    if(i%skip===0) lbl+=`<text x="${x+bw/2}" y="${H-8}" text-anchor="middle">${esc(o.labels[i])}</text>`;
  });
  let gl='';
  if(o.goal){ const pts=o.goal.map((v,i)=>[m.l+step*i+step/2,y(v)]); gl=`<path class="goal" d="${pts.map((q,i)=>(i?'L':'M')+q[0]+' '+q[1]).join('')}"/>`+pts.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="3.2" fill="var(--surface)" stroke="var(--gold)" stroke-width="2"/>`).join(''); }
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||'Gráfico de barras')}">${g}${b}${gl}${lbl}</svg>`;
}
function donut(items, o={}){
  const size=o.size||148, th=o.th||20, r=(size-th)/2, c=2*Math.PI*r, tot=sum(items,'v')||1; let off=0, arcs='';
  items.forEach(it=>{ const len=it.v/tot*c; if(len>0) arcs+=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${it.c}" stroke-width="${th}" stroke-dasharray="${Math.max(0,len-2)} ${c-Math.max(0,len-2)}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size/2} ${size/2})" data-tip="${esc(it.n+'|'+it.v+' ('+pct(it.v/tot,0)+')')}"/>`; off+=len; });
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${th}"/>${arcs}<text x="50%" y="${o.sub?'47%':'52%'}" text-anchor="middle" dominant-baseline="middle" style="fill:var(--fg);font-size:${o.fs||24}px;font-weight:800">${o.center||''}</text>${o.sub?`<text x="50%" y="63%" text-anchor="middle" style="fill:var(--fg-3);font-size:11px">${o.sub}</text>`:''}</svg>`;
}
const SER = ['#0a7570','#c89a35','#3f5778','#b5483f','#6b9e8f','#8a5a83','#7d8da3','#a8742a'];
const serColor = i => `var(--ser${i%8})`;
function hbars(rows, o={}){
  const mx = Math.max(...rows.map(r=>r.v),1);
  return '<div class="hb">'+rows.map(r=>`<div class="hb-r"${r.tip?` data-tip="${esc(r.tip)}"`:''}${r.open?` data-open="${r.open}" style="cursor:pointer"`:''}><span class="n" title="${esc(r.n)}">${esc(r.n)}</span><span class="hb-t"><i style="width:${Math.max(2,r.v/mx*100)}%;${r.c?`background:${r.c}`:''}"></i></span><span class="vv">${r.t}</span></div>`).join('')+'</div>';
}
function av(a, cls=''){ return `<span class="av ${cls}" style="background:${a.color}" title="${esc(a.name)}">${a.ini}</span>`; }
function statusPill(s){ const m={Disponible:'p-disp',Reservado:'p-res',Vendido:'p-sold',Bloqueado:'p-block'}; return `<span class="pill ${m[s]}"><i></i>${s}</span>`; }
function tempPill(t){ const m={Caliente:'t-hot',Tibio:'t-warm','Frío':'t-cold'}; return `<span class="pill ${m[t]}"><i></i>${t}</span>`; }
const IC = {
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert:'<path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin:'<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  note:'<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 13h8M8 17h5"/>',
  down:'<path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14"/>'
};
const ico = n => `<svg viewBox="0 0 24 24">${IC[n]}</svg>`;
function skyline(i, col){
  let x=8,out=''; const rs=mulberry(i*77+3);
  while(x<330){ const w=22+Math.floor(rs()*26), h=28+Math.floor(rs()*54); out+=`<rect x="${x}" y="${84-h}" width="${w}" height="${h}" fill="${col}" fill-opacity="${.28+rs()*.4}"/>`; x+=w+5+Math.floor(rs()*8); }
  return `<svg viewBox="0 0 340 84" preserveAspectRatio="none" aria-hidden="true">${out}</svg>`;
}
let toastT; function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),2300); }

/* Tooltip global */
(function(){
  const tip=$('#tip');
  document.addEventListener('mouseover',e=>{ const t=e.target.closest('[data-tip]'); if(!t){tip.style.opacity=0;return;}
    const p=t.getAttribute('data-tip').split('|'); tip.innerHTML='<b>'+esc(p[0])+'</b>'+p.slice(1).map(esc).join('<br>'); tip.style.opacity=1; });
  document.addEventListener('mousemove',e=>{ if(tip.style.opacity!=='1')return; const w=tip.offsetWidth,h=tip.offsetHeight; let x=e.clientX+14,y=e.clientY+14;
    if(x+w>innerWidth-8)x=e.clientX-w-14; if(y+h>innerHeight-8)y=e.clientY-h-14; tip.style.left=Math.max(8,x)+'px'; tip.style.top=Math.max(8,y)+'px'; });
  document.addEventListener('mouseleave',()=>tip.style.opacity=0);
})();
