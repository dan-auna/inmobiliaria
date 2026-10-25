/* ================= VISTAS: RESUMEN · PROYECTOS ================= */
const CITIES = ['Lima','Arequipa','Trujillo','Chiclayo'];
const sel = (k,lab,opts)=>`<label class="field sl"><span>${lab}</span><select data-f="${k}" aria-label="${lab}">${opts.map(([v,t])=>`<option value="${esc(v)}"${String(S[k])===String(v)?' selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
const seg = (k,opts,cls='')=>`<div class="seg ${cls}" role="group">${opts.map(([v,t])=>`<button data-seg="${k}:${v}" aria-pressed="${S[k]===v}">${t}</button>`).join('')}</div>`;
const O_CITY = [['all','Todas las ciudades'],...CITIES.map(c=>[c,c])];
const O_PROJ = [['all','Todos los proyectos'],...PROJ.map(p=>[p.id,p.name])];
const O_ADV = [['all','Todos los asesores'],...ADV.map(a=>[a.id,a.name])];
const O_PER = [['30','Últimos 30 días'],['90','Últimos 90 días'],['6m','Últimos 6 meses'],['12m','Últimos 12 meses'],['ytd','Año '+NOW.getFullYear()]];
const search = (k,ph)=>`<label class="field search">${ico('search')}<input type="search" data-f="${k}" value="${esc(S[k])}" placeholder="${ph}" aria-label="${ph}"></label>`;
const sod = T0 - 12*36e5;
function dueLabel(d){ const n=Math.round((d-T0)/DAY); return n===0?'Hoy':n===1?'Mañana':n<0?'Vencida hace '+(-n)+' d':fd(d); }
const isLate = l => l.next && l.next.due < sod;
const openLeads = () => LEADS.filter(l=>l.stage>=0&&l.stage<=4);

function alertsData(){
  const L = LEADS.filter(l=>okLead(l));
  const sinContacto = L.filter(l=>l.stage===0 && T0-l.createdTs>DAY).length;
  const vencidas = L.filter(l=>l.stage>=0&&l.stage<=4&&isLate(l)).length;
  const reservas = UNITS.filter(u=>u.status==='Reservado'&&okUnit(u)&&u.resExp-T0<=5*DAY).length;
  const sinVentas = PROJ.filter(p=>(S.city==='all'||p.city===S.city)&&(S.project==='all'||p.id===S.project)&&!SOLD.some(u=>u.project===p.id&&u.saleTs>=ago(30))).length;
  return [
    {c:'var(--bad)',ic:'clock',t:'Leads sin contactar',s:'Más de 24 horas sin primer contacto',k:sinContacto,go:'crm'},
    {c:'var(--warn)',ic:'alert',t:'Seguimientos vencidos',s:'Tareas con fecha pasada',k:vencidas,go:'crm'},
    {c:'var(--gold)',ic:'key',t:'Separaciones por vencer',s:'Vencen en 5 días o menos',k:reservas,go:'propiedades'},
    {c:'var(--info)',ic:'pin',t:'Proyectos sin ventas',s:'Ninguna venta en los últimos 30 días',k:sinVentas,go:'proyectos'}
  ];
}

const V = {};
V.resumen = {
  title:'Resumen comercial',
  tb(){ return `<div class="tb">${sel('period','Período',O_PER)}${sel('city','Ciudad',O_CITY)}${sel('project','Proyecto',O_PROJ)}${sel('advisor','Asesor',O_ADV)}<span class="grow"></span><span class="muted" style="font-size:12.5px">Comparado con el período anterior equivalente</span></div>`; },
  body(){
    const P=getPeriod(), C=agg(P.start,P.end), Pv=agg(P.prevStart,P.prevEnd);
    this.P=P; this.series=P.buckets.map(b=>agg(b.s,b.e)); this.C=C;
    const gu = goalMonthly()*P.months, cum = gu? C.n/gu : 0;
    const rv = this.series.map(x=>x.rev), un = this.series.map(x=>x.n), ld = this.series.map(x=>x.lead);
    const cv = this.series.map(x=>x.conv);
    const kpi = (cls,lbl,val,d,sub,sp,inv)=>`<div class="card kpi c2 ${cls}"><span class="lbl">${lbl}</span><div class="v">${val}</div><div class="row"><div style="display:flex;flex-direction:column;gap:3px;min-width:0">${d}<span class="sub">${sub}</span></div>${sp||''}</div></div>`;
    const dpp = Pv.conv? (C.conv-Pv.conv)*100 : null;
    const kpis = `<div class="grid kpis" style="margin-bottom:16px">
      ${kpi('hero','Ventas cerradas',mc(C.rev),deltaPill(delta(C.rev,Pv.rev)),'vs '+mc(Pv.rev),sparkline(rv,'#6fe3b0'))}
      ${kpi('','Unidades vendidas',nf(C.n),deltaPill(delta(C.n,Pv.n)),'vs '+Pv.n+' anteriores',sparkline(un,'var(--accent)'))}
      ${kpi('','Ticket promedio',C.n?mc(C.tk):'—',deltaPill(delta(C.tk,Pv.tk)),Pv.n?'vs '+mc(Pv.tk):'',sparkline(this.series.map(x=>x.tk),'var(--gold)'))}
      ${kpi('','Leads generados',nf(C.lead),deltaPill(delta(C.lead,Pv.lead)),nf(C.visits)+' llegaron a visita',sparkline(ld,'var(--info)'))}
      ${kpi('','Conversión a venta',pct(C.conv),dpp===null?'':`<span class="delta ${dpp>=0?'up':'dn'}">${dpp>=0?'▲':'▼'} ${Math.abs(dpp).toFixed(1)} pp</span>`,'lead → cierre',sparkline(cv,'var(--accent)'))}
      <div class="card kpi c2"><span class="lbl">Cumplimiento de meta</span><div class="v" style="color:${cum>=1?'var(--good)':cum>=.8?'var(--warn)':'var(--bad)'}">${pct(cum,0)}</div><div class="hb-t" style="height:8px"><i style="width:${Math.min(100,cum*100)}%;background:${cum>=1?'var(--good)':cum>=.8?'var(--warn)':'var(--bad)'}"></i></div><span class="sub">${C.n} de ${Math.round(gu)} unidades meta</span></div>
    </div>`;
    // Embudo
    const L=C.l, fn=[['Leads',L.length],['Contactados',L.filter(x=>x.reached>=1).length],['Visita agendada',L.filter(x=>x.reached>=2).length],['Visitaron',L.filter(x=>x.reached>=3).length],['Separación',L.filter(x=>x.reached>=4).length],['Cierre',L.filter(x=>x.reached>=5).length]];
    const funnel = '<div class="fun">'+fn.map((r,i)=>{const w=fn[0][1]?Math.max(7,r[1]/fn[0][1]*100):0, prev=i?fn[i-1][1]:0;
      return `<div class="fun-r"><span class="n">${r[0]}</span><div class="fun-b"><i style="width:${w}%;background:color-mix(in srgb,var(--accent) ${46-i*5}%,var(--surface))"></i><span>${nf(r[1])}<em>${i?pct(prev?r[1]/prev:0,0)+' del paso previo':'100%'}</em></span></div></div>`;}).join('')+'</div>';
    // Ventas por proyecto
    const byP = PROJ.map(p=>({p,s:C.s.filter(u=>u.project===p.id)})).filter(x=>x.s.length).sort((a,b)=>sum(b.s,'sold')-sum(a.s,'sold'));
    const projBars = byP.length ? hbars(byP.map(x=>({n:x.p.name,v:sum(x.s,'sold'),t:`${mc(sum(x.s,'sold'))} <span class="muted">· ${x.s.length} uds</span>`,open:'proj:'+x.p.id,c:serColor(PROJ.indexOf(x.p))}))) : '<div class="empty">Sin ventas en este período con los filtros actuales.</div>';
    // Canales
    const ch = SRC.map(s=>{const ls=L.filter(l=>l.src===s.id), vs=ls.filter(l=>l.stage===5).length; return {s,ls:ls.length,vs,conv:ls.length?vs/ls.length:0,cost:ls.length*s.cpl}}).sort((a,b)=>b.conv-a.conv);
    const bestConv = Math.max(...ch.map(c=>c.conv));
    const chTable = `<div class="tw"><table><thead><tr><th>Canal</th><th class="r">Leads</th><th class="r">Ventas</th><th>Conversión</th><th class="r">Costo / lead</th><th class="r">Costo / venta</th></tr></thead><tbody>${ch.map(c=>`<tr style="cursor:default"><td><b style="font-weight:600">${esc(c.s.id)}</b></td><td class="r">${nf(c.ls)}</td><td class="r">${c.vs}</td><td><div style="display:flex;align-items:center;gap:8px"><span class="hb-t" style="width:70px;height:7px"><i style="width:${bestConv?c.conv/bestConv*100:0}%"></i></span><b>${pct(c.conv)}</b></div></td><td class="r">${c.s.cpl?mf(c.s.cpl):'—'}</td><td class="r">${c.vs&&c.cost?mf(c.cost/c.vs):'—'}</td></tr>`).join('')}</tbody></table></div>`;
    // Financiamiento
    const finItems = FIN.map((f,i)=>({n:f,v:C.s.filter(u=>u.fin===f).length,c:serColor(i)})).filter(x=>x.v);
    const finBlock = finItems.length ? `<div class="donut-w">${donut(finItems,{center:C.n,sub:'ventas'})}<div class="dl">${finItems.map(x=>`<div><i style="background:${x.c}"></i><span>${x.n}</span><b>${pct(x.v/C.n,0)}</b></div>`).join('')}</div></div><div class="stats3" style="margin-top:18px"><div><small>Mejor canal</small><b style="font-size:13px">${esc(ch[0].s.id.split(' (')[0])}</b></div><div><small>Conv. top</small><b>${pct(ch[0].conv)}</b></div><div><small>Con crédito</small><b>${pct(C.n?C.s.filter(u=>u.fin.startsWith('Crédito')).length/C.n:0,0)}</b></div></div>` : '<div class="empty">Sin datos</div>';
    // Stock
    const us = UNITS.filter(u=>(S.city==='all'||u.city===S.city)&&(S.project==='all'||u.project===S.project));
    const cnt = st=>us.filter(u=>u.status===st).length;
    const sold90 = SOLD.filter(u=>u.saleTs>=ago(90)&&(S.city==='all'||u.city===S.city)&&(S.project==='all'||u.project===S.project)).length;
    const absor = sold90/3, disp = cnt('Disponible'), mesesStock = absor? disp/absor : 0;
    const stockItems = [{n:'Disponible',v:disp,c:'var(--s-disp)'},{n:'Reservado',v:cnt('Reservado'),c:'var(--s-res)'},{n:'Vendido',v:cnt('Vendido'),c:'var(--s-sold)'},{n:'Bloqueado',v:cnt('Bloqueado'),c:'var(--s-block)'}];
    const stock = `<div class="donut-w">${donut(stockItems,{center:pct(us.length?cnt('Vendido')/us.length:0,0),sub:'vendido',fs:25})}<div class="dl">${stockItems.map(x=>`<div><i style="background:${x.c}"></i><span>${x.n}</span><b>${x.v}</b></div>`).join('')}</div></div>
      <div class="stats3" style="margin-top:16px"><div><small>Absorción</small><b>${absor.toFixed(1)}/mes</b></div><div><small>Stock</small><b>${mesesStock?mesesStock.toFixed(1)+' m':'—'}</b></div><div><small>Disponible</small><b>${mc(sum(us.filter(u=>u.status==='Disponible'),'price'))}</b></div></div>`;
    // Ranking
    const rk = ADV.map(a=>{const s=C.s.filter(u=>u.adv===a.id); const g=a.goal*P.months; return {a,rev:sum(s,'sold'),n:s.length,cum:g?s.length/g:0}}).filter(x=>x.n||S.advisor===x.a.id).sort((a,b)=>b.rev-a.rev).slice(0,5);
    const ranking = rk.length? `<div class="rank">${rk.map((r,i)=>`<div class="rank-r" style="cursor:pointer" data-open="adv:${r.a.id}"><b>${i+1}</b>${av(r.a)}<div style="min-width:0"><b style="font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.a.name)}</b><div class="hb-t"><i style="width:${Math.min(100,r.cum*100)}%;background:${r.cum>=1?'var(--good)':'var(--accent)'}"></i></div><span class="muted" style="font-size:11.5px">${r.n} uds · ${pct(r.cum,0)} de la meta</span></div><b class="num">${mc(r.rev)}</b></div>`).join('')}</div>` : '<div class="empty">Sin ventas</div>';
    // Precio m² por distrito
    const dists = [...new Set(PROJ.filter(p=>(S.city==='all'||p.city===S.city)&&(S.project==='all'||p.id===S.project)).map(p=>p.district))];
    const dRows = dists.map(d=>{const ps=PROJ.filter(p=>p.district===d), ss=SOLD.filter(u=>u.district===d&&u.saleTs>=ago(180)); const set=ss.length?ss:ps.flatMap(p=>p.units); const v=sum(set,x=>(x.sold||x.price))/sum(set,'area'); return {d,v,m:MKT[d]||v,n:ss.length}}).sort((a,b)=>b.v-a.v);
    const mTable = `<div class="tw"><table><thead><tr><th>Distrito</th><th class="r">${sym()}/m²</th><th class="r">vs. mercado</th></tr></thead><tbody>${dRows.map(r=>{const df=r.v/r.m-1; return `<tr style="cursor:default"><td>${esc(r.d)}</td><td class="r"><b>${nf(fx(r.v))}</b></td><td class="r"><span data-tip="${esc(r.d+'|Mercado: '+sym()+' '+nf(fx(r.m))+'/m²')}" class="delta ${df>=0?'up':'dn'}">${df>=0?'+':''}${(df*100).toFixed(1)}%</span></td></tr>`}).join('')}</tbody></table></div>`;
    const al = alertsData();
    const alerts = `<div class="alerts">${al.map(a=>`<button class="al" style="--c:${a.c}" data-go="${a.go}"><span class="ic"><svg viewBox="0 0 24 24">${IC[a.ic]}</svg></span><span><b>${a.t}</b><small>${a.s}</small></span><span class="k">${a.k}</span></button>`).join('')}</div>`;
    return kpis + `<div class="grid">
      <div class="card c8"><div class="card-h"><div><h3>Evolución de ventas</h3><p>${P.label} · línea punteada: meta</p></div>${seg('metric',[['monto','Monto'],['unidades','Unidades'],['leads','Leads']],'sm')}</div><div class="chart" id="mainchart" style="min-height:268px"></div></div>
      <div class="card c4"><div class="card-h"><div><h3>Requiere atención</h3><p>Acciones pendientes del equipo comercial</p></div></div>${alerts}</div>
      <div class="card c5"><div class="card-h"><div><h3>Embudo comercial</h3><p>Leads creados en el período, por etapa alcanzada</p></div></div>${funnel}</div>
      <div class="card c7"><div class="card-h"><div><h3>Ventas por proyecto</h3><p>Monto cerrado y unidades · clic para ver el detalle</p></div></div>${projBars}</div>
      <div class="card c7"><div class="card-h"><div><h3>Rendimiento por canal de captación</h3><p>Ordenado por conversión · costos referenciales</p></div></div>${chTable}</div>
      <div class="card c5"><div class="card-h"><div><h3>Forma de financiamiento</h3><p>Ventas del período</p></div></div>${finBlock}</div>
      <div class="card c4"><div class="card-h"><div><h3>Estado del inventario</h3><p>Absorción de los últimos 90 días</p></div></div>${stock}</div>
      <div class="card c4"><div class="card-h"><div><h3>Top asesores</h3><p>Por monto vendido en el período</p></div></div>${ranking}</div>
      <div class="card c4"><div class="card-h"><div><h3>Precio por m² vs. mercado</h3><p>Ventas de 6 meses · referencia de zona</p></div></div>${mTable}</div>
    </div>`;
  },
  after(){
    const el=$('#mainchart'); if(!el||!this.series) return;
    const P=this.P, ser=this.series, m=S.metric, gm=goalMonthly(), tk=this.C.tk||AVG_TICKET;
    const gU = P.buckets.map(b=>gm*(b.e-b.s)/(30.4*DAY));
    let bars, goal, axis, tip;
    if(m==='monto'){ bars=ser.map(x=>x.rev); goal=gU.map(g=>g*tk); axis=axisM; tip=i=>`${P.buckets[i].label}|Ventas: ${mf(bars[i])}|Unidades: ${ser[i].n}|Meta: ${mc(goal[i])}`; }
    else if(m==='unidades'){ bars=ser.map(x=>x.n); goal=gU; axis=v=>Math.round(v*10)/10; tip=i=>`${P.buckets[i].label}|Unidades: ${bars[i]}|Meta: ${goal[i].toFixed(1)}`; }
    else { bars=ser.map(x=>x.lead); goal=null; axis=v=>nf(v); tip=i=>`${P.buckets[i].label}|Leads: ${nf(bars[i])}|Visitas: ${ser[i].visits}|Ventas: ${ser[i].n}`; }
    el.innerHTML = barChart(el.clientWidth||640,{labels:P.buckets.map(b=>b.label),bars,goal,axis,tip,aria:'Evolución de ventas'});
  }
};

V.proyectos = {
  title:'Proyectos inmobiliarios',
  tb(){ return `<div class="tb">${search('jq','Buscar proyecto o distrito')}${sel('jcity','Ciudad',O_CITY)}${sel('jstage','Etapa',[['all','Todas'],['Preventa','Preventa'],['En construcción','En construcción'],['Entrega inmediata','Entrega inmediata']])}</div>`; },
  body(){
    const q=S.jq.trim().toLowerCase();
    const ps = PROJ.filter(p=>(S.jcity==='all'||p.city===S.jcity)&&(S.jstage==='all'||p.stage===S.jstage)&&(!q||(p.name+' '+p.district+' '+p.city).toLowerCase().includes(q)));
    const us = ps.flatMap(p=>p.units), c = st=>us.filter(u=>u.status===st);
    const chips = `<div class="chips">
      <div class="chip"><small>Proyectos activos</small><b>${ps.length}</b></div>
      <div class="chip"><small>Unidades totales</small><b>${us.length}</b></div>
      <div class="chip"><small>Vendidas</small><b>${c('Vendido').length} <span class="muted" style="font-size:13px;font-weight:600">${pct(us.length?c('Vendido').length/us.length:0,0)}</span></b></div>
      <div class="chip"><small>Reservadas</small><b>${c('Reservado').length}</b></div>
      <div class="chip"><small>Valor del stock disponible</small><b>${mc(sum(c('Disponible'),'price'))}</b></div>
    </div>`;
    if(!ps.length) return chips+'<div class="card empty">No hay proyectos con estos filtros.</div>';
    return chips+'<div class="pgrid">'+ps.map(p=>{
      const i=PROJ.indexOf(p), n=p.units.length, st=k=>p.units.filter(u=>u.status===k).length;
      const s30 = SOLD.filter(u=>u.project===p.id&&u.saleTs>=ago(30)).length;
      const minP = Math.min(...p.units.filter(u=>u.status==='Disponible').map(u=>u.price), Infinity);
      const stClass = p.stage==='Entrega inmediata'?'p-good':p.stage==='Preventa'?'p-gold':'p-acc';
      return `<button class="card pc" data-open="proj:${p.id}" style="--hue-a:${p.hue[0]};--hue-b:${p.hue[1]}">
        <div class="pc-top"><span class="pill"><i></i>${p.stage}</span>${skyline(i+1,'#16365a')}</div>
        <div class="pc-b"><div><h4>${esc(p.name)}</h4><div class="loc">${esc(p.district)}, ${esc(p.city)} · entrega ${p.delivery}</div></div>
        <div><div class="stk" data-tip="${esc('Inventario|Vendido: '+st('Vendido')+'|Reservado: '+st('Reservado')+'|Disponible: '+st('Disponible'))}"><i style="width:${st('Vendido')/n*100}%;background:var(--s-sold)"></i><i style="width:${st('Reservado')/n*100}%;background:var(--s-res)"></i><i style="width:${st('Disponible')/n*100}%;background:var(--s-disp)"></i><i style="flex:1;background:var(--s-block);opacity:.5"></i></div>
        <div class="legend" style="margin-top:8px"><span><i style="background:var(--s-sold)"></i>${st('Vendido')} vendidas</span><span><i style="background:var(--s-res)"></i>${st('Reservado')} reservadas</span><span><i style="background:var(--s-disp)"></i>${st('Disponible')} disp.</span></div></div>
        <div class="stats3"><div><small>Desde</small><b>${isFinite(minP)?mc(minP):'—'}</b></div><div><small>Ventas 30 d</small><b>${s30}</b></div><div><small>${sym()}/m²</small><b>${nf(fx(p.ppm))}</b></div></div>
        <div class="prog"><div><span>Avance de obra</span><b style="color:var(--fg)">${p.progress}%</b></div><div class="hb-t"><i style="width:${p.progress}%"></i></div></div></div>
      </button>`;}).join('')+'</div>';
  }
};
