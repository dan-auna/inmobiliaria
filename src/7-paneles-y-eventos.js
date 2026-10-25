/* ================= PANELES LATERALES ================= */
const D = {type:null,id:null};
const SIM = {down:10,years:20,tea:9.5};
const EV_COLOR = {lead:'var(--info)',call:'var(--accent)',wa:'var(--good)',visit:'var(--gold)',note:'var(--fg-3)',stage:'var(--accent)',sale:'var(--good)',lost:'var(--bad)'};

function kv(pairs){ return '<div class="kv">'+pairs.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')+'</div>'; }
function annuity(P, tea, years){ const r=Math.pow(1+tea/100,1/12)-1, n=years*12; return P*r/(1-Math.pow(1+r,-n)); }

function drUnit(id){
  const u=unitById[id], p=projById[u.project], a=u.adv?advById[u.adv]:null, price=unitPrice(u);
  const adSel = `<label class="field sl" style="align-self:flex-start"><span>Asesor</span><select data-assign="unit" aria-label="Asesor asignado"><option value="">Sin asignar</option>${ADV.filter(x=>x.cities.includes(u.city)).map(x=>`<option value="${x.id}"${u.adv===x.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label>`;
  let extra='';
  if(u.status==='Vendido') extra = `<div class="sec"><h5>Detalle de la venta</h5>${kv([['Fecha de cierre',fdl(u.saleTs)],['Canal de origen',esc(u.src.split(' (')[0])],['Financiamiento',esc(u.fin)],['Precio de lista',mf(u.price)],['Descuento',((1-u.sold/u.price)*100).toFixed(1)+'%'],['Asesor',a?esc(a.name):'—']])}</div>`;
  if(u.status==='Reservado') extra = `<div class="sec"><h5>Separación</h5>${kv([['Fecha',fdl(u.resTs)],['Vence',fdl(u.resExp)+' ('+dueLabel(u.resExp).toLowerCase()+')'],['Financiamiento previsto',esc(u.fin)],['Canal de origen',esc(u.src.split(' (')[0])]])}</div>`;
  const sim = u.status==='Disponible' || u.status==='Reservado' ? `<div class="sec"><h5>Simulador de financiamiento · referencial</h5><div class="sim">
    <label>Cuota inicial<input type="range" min="7" max="40" step="1" value="${SIM.down}" data-sim="down"><output id="o-down">${SIM.down}%</output></label>
    <label>Plazo<input type="range" min="5" max="25" step="1" value="${SIM.years}" data-sim="years"><output id="o-years">${SIM.years} años</output></label>
    <label>TEA<input type="range" min="7" max="13" step="0.1" value="${SIM.tea}" data-sim="tea"><output id="o-tea">${SIM.tea.toFixed(1)}%</output></label>
    <div class="kv" style="margin-top:4px"><div><small>Cuota inicial</small><b id="s-down"></b></div><div><small>Monto a financiar</small><b id="s-fin"></b></div><div><small>Cuota mensual</small><b id="s-cuota" style="font-size:18px;color:var(--accent)"></b></div><div><small>Ingreso familiar sugerido</small><b id="s-inc"></b></div></div></div></div>` : '';
  return {
    head:`<div><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px">${statusPill(u.status)}<span class="muted" style="font-size:12.5px">${esc(p.name)}</span></div><h2>${u.type} ${u.id}</h2></div>`,
    body:`<div><span class="lbl">${u.status==='Vendido'?'Precio de venta':'Precio de lista'}</span><div class="big">${mf(price)}</div><div class="muted" style="font-size:12.5px">${S.cur==='USD'?'S/ '+nf(price*TC):'US$ '+nf(price)} · ${nf(fx(price/u.area))} ${sym()}/m²</div></div>
    <div class="sec"><h5>Características</h5>${kv([['Proyecto',esc(p.name)],['Ubicación',esc(p.district)+', '+esc(p.city)],['Área techada',u.area+' m²'],['Dormitorios / baños',u.bed+' / '+u.bath],['Piso',u.floor+' de '+p.floors],['Orientación',u.orient+' · '+u.view],['Estacionamiento',u.park?'Incluido':'Opcional'],['Entrega',p.delivery]])}</div>
    ${extra}${sim}<div class="sec"><h5>Asignación comercial</h5>${adSel}</div>`,
    after(){ simCalc(price); }
  };
}
function simCalc(price){
  const P=fx(price), down=P*SIM.down/100, fin=P-down, c=annuity(fin,SIM.tea,SIM.years);
  const set=(i,v)=>{const e=$('#'+i); if(e) e.textContent=v;};
  set('s-down',sym()+' '+nf(down)); set('s-fin',sym()+' '+nf(fin)); set('s-cuota',sym()+' '+nf(c)); set('s-inc',sym()+' '+nf(c/.35));
  set('o-down',SIM.down+'%'); set('o-years',SIM.years+' años'); set('o-tea',SIM.tea.toFixed(1)+'%');
}

function drProj(id){
  const p=projById[id], n=p.units.length, st=k=>p.units.filter(u=>u.status===k).length;
  const rows=[]; for(let f=p.floors;f>=1;f--){ const us=p.units.filter(u=>u.floor===f).sort((a,b)=>a.num-b.num);
    rows.push(`<div class="plan-r"><small>${p.casas?'Mz '+f:'P'+f}</small><div class="plan-c" style="grid-template-columns:repeat(${p.per},minmax(0,1fr))">${us.map(u=>{const c={Disponible:'disp',Reservado:'res',Vendido:'sold',Bloqueado:'block'}[u.status]; return `<button class="cell ${c}" data-open="unit:${u.id}" data-tip="${esc(u.id+'|'+u.type+' · '+u.area+' m² · '+u.bed+' dorm.|'+u.status+' · '+mc(unitPrice(u)))}">${u.id.split('-')[1]}</button>`;}).join('')}</div></div>`); }
  const adv = ADV.map(a=>({a,n:p.units.filter(u=>u.adv===a.id&&u.status==='Vendido').length})).filter(x=>x.n).sort((x,y)=>y.n-x.n).slice(0,5);
  const sold = p.units.filter(u=>u.status==='Vendido'), s30=sold.filter(u=>u.saleTs>=ago(30)).length;
  return {
    head:`<div><div style="display:flex;gap:8px;margin-bottom:6px"><span class="pill p-acc"><i></i>${p.stage}</span></div><h2>${esc(p.name)}</h2><div class="muted" style="font-size:13px;margin-top:4px">${esc(p.district)}, ${esc(p.city)}</div></div>`,
    body:`<div class="stats3"><div><small>Avance de obra</small><b>${p.progress}%</b></div><div><small>Entrega</small><b>${p.delivery}</b></div><div><small>Ventas 30 días</small><b>${s30}</b></div></div>
    <div class="sec"><h5>Inventario por estado</h5><div class="stk" style="height:12px"><i style="width:${st('Vendido')/n*100}%;background:var(--s-sold)"></i><i style="width:${st('Reservado')/n*100}%;background:var(--s-res)"></i><i style="width:${st('Disponible')/n*100}%;background:var(--s-disp)"></i><i style="flex:1;background:var(--s-block);opacity:.5"></i></div>
    <div class="legend" style="margin-top:10px"><span><i style="background:var(--s-sold)"></i>Vendido ${st('Vendido')}</span><span><i style="background:var(--s-res)"></i>Reservado ${st('Reservado')}</span><span><i style="background:var(--s-disp)"></i>Disponible ${st('Disponible')}</span><span><i style="background:var(--s-block)"></i>Bloqueado ${st('Bloqueado')}</span></div></div>
    <div class="sec"><h5>Plano de stock · clic en una unidad</h5><div class="plan">${rows.join('')}</div></div>
    <div class="sec"><h5>Resultados comerciales</h5>${kv([['Monto vendido',mf(sum(sold,'sold'))],['Valor por vender',mf(sum(p.units.filter(u=>u.status==='Disponible'),'price'))],['Ticket promedio',sold.length?mf(sum(sold,'sold')/sold.length):'—'],[sym()+'/m² de venta',sold.length?nf(fx(sum(sold,'sold')/sum(sold,'area'))):'—']])}</div>
    <div class="sec"><h5>Asesores con más ventas</h5>${adv.length?hbars(adv.map(x=>({n:x.a.name,v:x.n,t:x.n+' uds',c:x.a.color,open:'adv:'+x.a.id}))):'<span class="muted">Aún sin ventas</span>'}</div>
    <div class="acts"><button class="btn pri" data-viewunits="${p.id}">Ver unidades disponibles</button></div>`
  };
}

function drAdv(id){
  const a=advById[id], P=getPeriod(), st=advStats(a,P);
  const mb=[]; for(let i=11;i>=0;i--){ const s=mStart(-i), e=mStart(-i+1); mb.push({s,e,label:MES[new Date(s).getMonth()],v:SOLD.filter(u=>u.adv===id&&u.saleTs>=s&&u.saleTs<e)}); }
  const bars=mb.map(m=>sum(m.v,'sold')), goal=mb.map(()=>a.goal*AVG_TICKET);
  const chart=barChart(520,{labels:mb.map(m=>m.label),bars,goal,axis:axisM,tip:i=>`${mb[i].label}|Ventas: ${mc(bars[i])}|Unidades: ${mb[i].v.length}`,aria:'Ventas mensuales'});
  const pipe=STAGES.slice(0,5).map(s=>{const l=LEADS.filter(x=>x.advisor===id&&x.stage===s.id); return {n:s.name,v:l.length,t:l.length+' <span class="muted">· '+mc(sum(l,'value'))+'</span>',c:s.color};});
  const hot=LEADS.filter(x=>x.advisor===id&&x.stage>=0&&x.stage<=4).sort((x,y)=>y.stage-x.stage||y.value-x.value).slice(0,5);
  return {
    head:`<div style="display:flex;gap:14px;align-items:center">${av(a,'lg')}<div><h2>${esc(a.name)}</h2><div class="muted" style="font-size:13px;margin-top:4px">${esc(a.zone)} · meta ${a.goal.toFixed(1)} unid./mes</div></div></div>`,
    body:`<div class="stats3"><div><small>Ventas (${P.label})</small><b>${mc(st.rev)}</b></div><div><small>Unidades</small><b>${st.n}</b></div><div><small>Cumplimiento</small><b style="color:${st.cum>=1?'var(--good)':'inherit'}">${pct(st.cum,0)}</b></div></div>
    <div class="stats3"><div><small>Leads</small><b>${nf(st.leads)}</b></div><div><small>Conversión</small><b>${pct(st.conv)}</b></div><div><small>T. respuesta</small><b>${st.resp?Math.round(st.resp)+' min':'—'}</b></div></div>
    <div class="sec"><h5>Ventas mensuales · últimos 12 meses</h5><div class="chart">${chart}</div></div>
    <div class="sec"><h5>Cartera abierta por etapa</h5>${hbars(pipe)}</div>
    <div class="sec"><h5>Clientes más avanzados</h5><div style="display:flex;flex-direction:column;gap:8px">${hot.map(l=>`<button class="task" data-open="lead:${l.id}" style="--c:${STAGES[l.stage].color}"><span class="dot"></span><span style="flex:1"><b>${esc(l.name)}</b><small>${STAGES[l.stage].name} · ${esc(projById[l.project].name)}</small></span><b class="num">${mc(l.value)}</b></button>`).join('')||'<span class="muted">Sin cartera abierta</span>'}</div></div>`
  };
}

function buildEvents(l){
  if(l.events) return l.events;
  const r=mulberry(+l.id.slice(2)), p=projById[l.project], ev=[], span=Math.max(DAY,(l.lastTs||l.createdTs)-l.createdTs), at=f=>l.createdTs+span*f;
  ev.push({ts:l.createdTs,t:'lead',x:`Ingresó por ${l.src} consultando por ${p.name}`});
  if(l.reached>=1){ ev.push({ts:l.createdTs+(l.resp||15)*6e4,t:'call',x:`Primer contacto a los ${l.resp||15} min · busca ${l.bed} dormitorio${l.bed>1?'s':''}`}); ev.push({ts:at(.2),t:'wa',x:'Se envió brochure y lista de precios por WhatsApp'}); }
  if(l.reached>=2) ev.push({ts:at(.45),t:'visit',x:`Visita agendada a la sala de ventas de ${p.name}`});
  if(l.reached>=3) ev.push({ts:at(.65),t:'visit',x:'Visitó el departamento piloto · solicitó cotización'});
  if(l.reached>=4 && l.stage>=4){ const u=l.unit?unitById[l.unit]:null; ev.push({ts:u&&u.resTs?u.resTs:l.stageTs,t:'sale',x:`Separación de ${l.unit||'unidad'} · constancia de pago registrada`}); }
  if(l.stage===5) ev.push({ts:l.stageTs,t:'sale',x:`Cierre ganado${l.unit?' · '+l.unit:''} · minuta firmada`});
  if(l.stage===-1) ev.push({ts:l.stageTs,t:'lost',x:'Descartado: '+(l.why||'sin respuesta')});
  l.events=ev; return ev;
}
function drLead(id){
  const l=LEADS.find(x=>x.id===id), p=projById[l.project], a=advById[l.advisor];
  const evs=[...buildEvents(l),...(l.extra||[])].sort((x,y)=>y.ts-x.ts);
  const cur=l.stage;
  const step=STAGES.map(s=>`<button data-st="${s.id}" class="${cur===s.id?'cur':cur>s.id?'done':''}">${s.name}</button>`).join('');
  const u=l.unit?unitById[l.unit]:null;
  const circ=a.color;
  return {
    head:`<div style="display:flex;gap:14px;align-items:center;min-width:0"><span class="av lg" style="background:${circ}">${l.name.split(' ').slice(0,2).map(x=>x[0]).join('')}</span><div style="min-width:0"><h2>${esc(l.name)}</h2><div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">${tempPill(l.temp)}${l.stage<0?'<span class="pill p-bad"><i></i>Descartado</span>':`<span class="pill" style="--c:${STAGES[l.stage].color}"><i></i>${STAGES[l.stage].name}</span>`}<span class="muted" style="font-size:12px">${l.id}</span></div></div></div>`,
    body:`<div class="acts"><button class="btn pri" data-log="call">${ico('phone')}Llamar</button><button class="btn" data-log="wa">${ico('chat')}WhatsApp</button><button class="btn" data-log="mail">${ico('mail')}Correo</button><button class="btn" data-log="visit">${ico('cal')}Agendar visita</button></div>
    <div class="sec"><h5>Etapa del proceso</h5><div class="stepper">${step}</div></div>
    ${l.next&&l.stage>=0&&l.stage<5?`<div class="nx lc" style="cursor:default;flex-direction:row;align-items:center;gap:10px;${isLate(l)?'border-color:var(--bad)':''}"><span style="color:${isLate(l)?'var(--bad)':'var(--accent)'};display:grid">${ico('cal')}</span><div style="flex:1"><b>${esc(l.next.text)}</b><div class="muted" style="font-size:12px">${dueLabel(l.next.due)}</div></div></div>`:''}
    <div class="sec"><h5>Contacto</h5>${kv([['Teléfono',esc(l.phone)],['Correo',esc(l.email)],['Ocupación',esc(l.job)],['Vive en',esc(l.from)]])}</div>
    <div class="sec"><h5>Interés y perfil de compra</h5>${kv([['Proyecto',esc(p.name)+' · '+esc(p.district)],['Tipología',l.bed+' dormitorio'+(l.bed>1?'s':'')],['Presupuesto',mf(l.budget)],['Valor del negocio',mf(l.value)],['Financiamiento',esc(l.fin)],['Motivo',esc(l.motivo)],['Canal de origen',esc(l.src)],['Unidad',u?`<a href="#" data-open="unit:${u.id}" style="color:var(--accent);font-weight:700">${u.id}</a>`:'Por definir']])}</div>
    <div class="sec"><h5>Probabilidad de cierre</h5><div class="score"><div class="hb-t"><i style="width:${l.score}%;background:${l.score>=70?'var(--good)':l.score>=40?'var(--warn)':'var(--info)'}"></i></div><b class="num">${l.score}/100</b></div></div>
    <div class="sec"><h5>Asesor responsable</h5><label class="field sl" style="align-self:flex-start;display:inline-flex"><span>Asesor</span><select data-assign="lead" aria-label="Asesor responsable">${ADV.filter(x=>x.cities.includes(p.city)).map(x=>`<option value="${x.id}"${l.advisor===x.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label></div>
    <div class="sec"><h5>Nueva nota</h5><textarea class="note" id="note-t" placeholder="Escribe un acuerdo, objeción o dato del cliente…"></textarea><div class="acts" style="margin-top:8px"><button class="btn" data-note>${ico('note')}Guardar nota</button>${l.stage>=0&&l.stage<5?'<button class="btn" data-discard style="color:var(--bad)">Descartar cliente</button>':''}</div></div>
    <div class="sec"><h5>Historial de actividad</h5><div class="tl">${evs.map(e=>`<div style="--c:${EV_COLOR[e.t]||'var(--accent)'}"><b>${esc(e.x)}</b><small>${fdl(e.ts)}</small></div>`).join('')}</div></div>`
  };
}

function renderDrawer(){
  const dr=$('#drawer'), keep=(dr.querySelector('.dr-b')||{}).scrollTop||0;
  const o={unit:drUnit,proj:drProj,adv:drAdv,lead:drLead}[D.type](D.id);
  dr.innerHTML=`<div class="dr-h">${o.head}<button class="x" data-close aria-label="Cerrar panel">${ico('x')}</button></div><div class="dr-b">${o.body}</div>`;
  dr.querySelector('.dr-b').scrollTop=keep; o.after&&o.after();
}
function openDrawer(t,id){
  const same=D.type===t&&D.id===id; D.type=t; D.id=id; renderDrawer();
  if(!same) $('#drawer .dr-b').scrollTop=0;
  $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); $('#drawer').setAttribute('aria-hidden','false');
}
function closeDrawer(){ $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); $('#drawer').setAttribute('aria-hidden','true'); D.type=null; }

/* ================= ACCIONES CRM ================= */
function moveLead(id,st){
  const l=LEADS.find(x=>x.id===id); if(!l||l.stage===st) return;
  const from=l.stage; l.stage=st; l.stageTs=T0; l.lastTs=T0;
  if(st>=0){ l.reached=Math.max(l.reached,st); if(st>=4) l.temp='Caliente'; }
  l.next = st>=0&&st<=4 ? {text:pick(ACT[st]),due:T0+DAY} : null;
  (l.extra=l.extra||[]).push({ts:T0,t:st===5?'sale':st<0?'lost':'stage',x:st<0?'Cliente descartado':`Etapa: ${from>=0?STAGES[from].name:'Descartado'} → ${STAGES[st].name}`});
  if(st<0) l.why='Descartado manualmente';
  toast(st===5?'¡Cierre registrado! '+l.name:st<0?'Cliente descartado':l.name.split(' ')[0]+' pasó a '+STAGES[st].name);
  refresh();
}
function logAct(id,kind){
  const l=LEADS.find(x=>x.id===id), m={call:['call','Llamada registrada · se coordinó el siguiente paso'],wa:['wa','Mensaje de WhatsApp enviado con información del proyecto'],mail:['note','Correo enviado con cotización y cronograma'],visit:['visit','Visita agendada a la sala de ventas']}[kind];
  (l.extra=l.extra||[]).push({ts:T0,t:m[0],x:m[1]}); l.lastTs=T0; if(l.stage===0&&kind!=='mail') { l.stage=1; l.reached=Math.max(1,l.reached); l.stageTs=T0; l.resp=l.resp||12; }
  if(kind==='visit'&&l.stage<2){ l.stage=2; l.reached=Math.max(2,l.reached); l.stageTs=T0; }
  toast('Actividad registrada'); refresh();
}
function refresh(){
  if(S.view==='crm'){ const b=$('#board'), sx=b?b.scrollLeft:0; update(); const nb=$('#board'); if(nb) nb.scrollLeft=sx; } else update();
  if(D.type) renderDrawer(); badge();
}
function badge(){ const n=openLeads().filter(l=>l.next&&l.next.due<=T0+1000).length; $('#crm-badge').textContent=n; }

/* ================= ENRUTADOR Y EVENTOS ================= */
function renderTb(){ $('#tb').innerHTML=V[S.view].tb(); }
function update(){ const v=V[S.view]; $('#body').innerHTML=v.body(); v.after&&v.after(); }
function go(v,keep){
  if(!V[v]) v='resumen'; S.view=v;
  $$('#nav a').forEach(a=>{ if(a.dataset.v===v) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  $('#title').textContent=V[v].title; renderTb(); update(); if(!keep) window.scrollTo(0,0);
}
function nav(v){ closeDrawer(); try{ history.replaceState(null,'','#'+v); }catch(e){} go(v); }
const RESET_P = ['pq','pproj','pstatus','pbed','pprice','padv','psort'];
function onFilter(k,val){
  S[k]=val; if(RESET_P.includes(k)) S.ppage=1;
  if(k==='project'&&val!=='all') S.city='all';
  if(k==='city'&&val!=='all'&&S.project!=='all'&&projById[S.project].city!==val) S.project='all';
  if(k==='city'||k==='project') renderTb();
  update();
}
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.f&&t.type==='search') onFilter(t.dataset.f,t.value);
  if(t.dataset.sim){ SIM[t.dataset.sim]=+t.value; simCalc(unitPrice(unitById[D.id])); }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.f&&t.type!=='search') onFilter(t.dataset.f,t.value);
  if(t.dataset.assign==='unit'){ unitById[D.id].adv=t.value||null; toast('Asesor actualizado'); if(S.view==='propiedades') update(); }
  if(t.dataset.assign==='lead'){ const l=LEADS.find(x=>x.id===D.id); l.advisor=t.value; toast('Cliente reasignado a '+advById[t.value].name.split(' ')[0]); refresh(); }
});
document.addEventListener('click',e=>{
  const t=e.target; let el;
  if(t.closest('[data-close]')||t===$('#scrim')) return closeDrawer();
  if(el=t.closest('[data-cur]')){ S.cur=el.dataset.cur; try{localStorage.setItem('nuvia-cur',S.cur)}catch(x){} syncCur(); update(); if(D.type) renderDrawer(); return; }
  if(el=t.closest('[data-seg]')){ const [k,v]=el.dataset.seg.split(':'); S[k]=v; if(k==='metric'){ update(); } else { if(k==='pview') S.ppage=1; renderTb(); update(); } return; }
  if(el=t.closest('[data-sort]')){ const k=el.dataset.sort; if(S.asort===k) S.adir*=-1; else { S.asort=k; S.adir=k==='name'?1:-1; } update(); return; }
  if(el=t.closest('[data-page]')){ S.ppage+=+el.dataset.page; update(); window.scrollTo({top:0}); return; }
  if(el=t.closest('[data-st]')){ if(D.type==='lead') moveLead(D.id,+el.dataset.st); return; }
  if(el=t.closest('[data-log]')){ logAct(D.id,el.dataset.log); return; }
  if(t.closest('[data-note]')){ const v=($('#note-t').value||'').trim(); if(!v){ toast('Escribe una nota antes de guardar'); return; } const l=LEADS.find(x=>x.id===D.id); (l.extra=l.extra||[]).push({ts:T0,t:'note',x:'Nota: '+v}); toast('Nota guardada'); renderDrawer(); return; }
  if(t.closest('[data-discard]')){ moveLead(D.id,-1); return; }
  if(el=t.closest('[data-viewunits]')){ S.pproj=el.dataset.viewunits; S.pstatus='Disponible'; S.ppage=1; nav('propiedades'); return; }
  if(el=t.closest('[data-go]')){ e.preventDefault(); nav(el.dataset.go); return; }
  if(el=t.closest('[data-open]')){ e.preventDefault(); const [ty,id]=el.dataset.open.split(':'); openDrawer(ty,id); return; }
  if(t.closest('#theme')){ const r=document.documentElement, dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches; r.dataset.theme=dark?'light':'dark'; try{localStorage.setItem('nuvia-theme',r.dataset.theme)}catch(x){} return; }
  if(el=t.closest('#nav a')){ e.preventDefault(); nav(el.dataset.v); }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&D.type) closeDrawer(); });
/* Arrastrar y soltar en el tablero */
let dragId=null;
document.addEventListener('dragstart',e=>{ const c=e.target.closest&&e.target.closest('.lc'); if(!c) return; dragId=c.dataset.lead; e.dataTransfer.effectAllowed='move'; try{e.dataTransfer.setData('text/plain',dragId)}catch(x){} setTimeout(()=>c.classList.add('drag'),0); });
document.addEventListener('dragend',()=>{ $$('.lc.drag').forEach(c=>c.classList.remove('drag')); $$('.col.over').forEach(c=>c.classList.remove('over')); dragId=null; });
document.addEventListener('dragover',e=>{ const col=e.target.closest&&e.target.closest('.col'); if(col&&dragId){ e.preventDefault(); $$('.col.over').forEach(c=>{if(c!==col)c.classList.remove('over')}); col.classList.add('over'); } });
document.addEventListener('drop',e=>{ const col=e.target.closest&&e.target.closest('.col'); if(col&&dragId){ e.preventDefault(); const id=dragId; dragId=null; moveLead(id,+col.dataset.stage); } });
let rt; window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ const v=V[S.view]; v.after&&v.after(); },120); });
window.addEventListener('hashchange',()=>go((location.hash||'').slice(1)));

function syncCur(){ $$('#cur button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cur===S.cur))); }
(function init(){
  try{ const th=localStorage.getItem('nuvia-theme'); if(th) document.documentElement.dataset.theme=th; }catch(e){}
  $('#today').textContent = DIAS[NOW.getDay()].replace(/^./,c=>c.toUpperCase())+', '+NOW.getDate()+' de '+MESL[NOW.getMonth()]+' de '+NOW.getFullYear();
  syncCur(); badge();
  const h=(location.hash||'').slice(1); go(V[h]?h:'resumen',true);
})();
