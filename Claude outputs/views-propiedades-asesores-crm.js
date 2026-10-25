/* ================= VISTAS: PROPIEDADES · ASESORES · CRM ================= */
const PRICE_BANDS = {lt150:[0,150e3],b150:[150e3,250e3],b250:[250e3,400e3],gt400:[400e3,1e12]};
const unitPrice = u => u.sold||u.price;
V.propiedades = {
  title:'Gestión de propiedades',
  tb(){ return `<div class="tb">${search('pq','Buscar código, proyecto o distrito')}${sel('pproj','Proyecto',O_PROJ)}${sel('pstatus','Estado',[['all','Todos'],['Disponible','Disponible'],['Reservado','Reservado'],['Vendido','Vendido'],['Bloqueado','Bloqueado']])}${sel('pbed','Dormitorios',[['all','Todos'],['1','1'],['2','2'],['3','3'],['4','4+']])}${sel('pprice','Precio',[['all','Todos'],['lt150','Hasta US$ 150 K'],['b150','US$ 150–250 K'],['b250','US$ 250–400 K'],['gt400','Más de US$ 400 K']])}${sel('padv','Asesor',O_ADV)}<span class="grow"></span>${sel('psort','Orden',[['price-desc','Mayor precio'],['price-asc','Menor precio'],['area-desc','Mayor área'],['code','Código']])}${seg('pview',[['tabla','Tabla'],['cards','Tarjetas']])}</div>`; },
  list(){
    const q=S.pq.trim().toLowerCase();
    let r = UNITS.filter(u=>{ const p=projById[u.project];
      if(S.pproj!=='all'&&u.project!==S.pproj) return false;
      if(S.pstatus!=='all'&&u.status!==S.pstatus) return false;
      if(S.pbed!=='all'&&(S.pbed==='4'?u.bed<4:u.bed!==+S.pbed)) return false;
      if(S.pprice!=='all'){const b=PRICE_BANDS[S.pprice]; if(u.price<b[0]||u.price>=b[1]) return false;}
      if(S.padv!=='all'&&u.adv!==S.padv) return false;
      if(q&&!(u.id+' '+p.name+' '+p.district+' '+u.type).toLowerCase().includes(q)) return false;
      return true; });
    const so=S.psort; r.sort((a,b)=> so==='price-desc'?unitPrice(b)-unitPrice(a): so==='price-asc'?unitPrice(a)-unitPrice(b): so==='area-desc'?b.area-a.area : a.id.localeCompare(b.id));
    return r;
  },
  body(){
    const r=this.list(), c=st=>r.filter(u=>u.status===st);
    const per = S.pview==='cards'?12:12, pages=Math.max(1,Math.ceil(r.length/per)); if(S.ppage>pages) S.ppage=pages;
    const slice = r.slice((S.ppage-1)*per, S.ppage*per);
    const chips = `<div class="chips"><div class="chip"><small>Resultados</small><b>${nf(r.length)}</b></div><div class="chip"><small>Disponibles</small><b style="color:var(--s-disp)">${c('Disponible').length}</b></div><div class="chip"><small>Reservadas</small><b style="color:var(--warn)">${c('Reservado').length}</b></div><div class="chip"><small>Vendidas</small><b>${c('Vendido').length}</b></div><div class="chip"><small>Valor disponible</small><b>${mc(sum(c('Disponible'),'price'))}</b></div></div>`;
    if(!r.length) return chips+'<div class="card empty">No hay propiedades con estos filtros. Prueba ampliar el rango de precio o el estado.</div>';
    let main;
    if(S.pview==='cards'){
      main = '<div class="pgrid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">'+slice.map(u=>{const p=projById[u.project], a=u.adv?advById[u.adv]:null;
        return `<button class="card pc" data-open="unit:${u.id}" style="--hue-a:${p.hue[0]};--hue-b:${p.hue[1]}"><div class="pc-top" style="height:78px">${skyline(PROJ.indexOf(p)+4,'#16365a')}<span class="pill" style="left:12px;top:12px">${u.id}</span></div>
        <div class="pc-b" style="gap:10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><b style="font-size:15px">${u.type} ${u.bed} dorm.</b><div class="loc" style="color:var(--fg-3);font-size:12.5px">${esc(p.name)} · piso ${u.floor}</div></div>${statusPill(u.status)}</div>
        <div class="big" style="font-size:22px">${mc(unitPrice(u))}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;color:var(--fg-3);font-size:12.5px"><span>${u.area} m² · ${nf(fx(unitPrice(u)/u.area))} ${sym()}/m²</span>${a?av(a,'sm'):''}</div></div></button>`;}).join('')+'</div>';
    } else {
      main = `<div class="card" style="padding:8px 12px 12px"><div class="tw"><table><thead><tr><th>Código</th><th>Proyecto</th><th>Tipo</th><th class="r">Piso</th><th class="r">Área</th><th class="r">Dorm.</th><th class="r">Precio</th><th class="r">${sym()}/m²</th><th>Estado</th><th>Asesor</th></tr></thead><tbody>${slice.map(u=>{const p=projById[u.project],a=u.adv?advById[u.adv]:null;
        return `<tr data-open="unit:${u.id}"><td><b>${u.id}</b></td><td><div class="who"><div><b>${esc(p.name)}</b><small>${esc(p.district)}</small></div></div></td><td>${u.type}</td><td class="r">${u.floor}</td><td class="r">${u.area} m²</td><td class="r">${u.bed}</td><td class="r"><b>${mf(unitPrice(u))}</b></td><td class="r muted">${nf(fx(unitPrice(u)/u.area))}</td><td>${statusPill(u.status)}</td><td>${a?`<div class="who">${av(a,'sm')}<span>${esc(a.name.split(' ')[0])}</span></div>`:'<span class="muted">Sin asignar</span>'}</td></tr>`;}).join('')}</tbody></table></div></div>`;
    }
    const pager = `<div class="pager"><span>Mostrando ${(S.ppage-1)*per+1}–${Math.min(r.length,S.ppage*per)} de ${nf(r.length)}</span><div style="display:flex;gap:8px;align-items:center"><button class="btn" data-page="-1" ${S.ppage<=1?'disabled':''}>Anterior</button><span>Página ${S.ppage} de ${pages}</span><button class="btn" data-page="1" ${S.ppage>=pages?'disabled':''}>Siguiente</button></div></div>`;
    return chips+main+pager;
  }
};

/* ---------- Asesores ---------- */
function advStats(a,P){
  const s = SOLD.filter(u=>u.adv===a.id&&u.saleTs>=P.start&&u.saleTs<P.end&&(S.city==='all'||u.city===S.city));
  const l = LEADS.filter(x=>x.advisor===a.id&&x.createdTs>=P.start&&x.createdTs<P.end&&(S.city==='all'||x.city===S.city));
  const rs = l.filter(x=>x.resp), resp = rs.length? sum(rs,'resp')/rs.length : 0;
  const pipe = LEADS.filter(x=>x.advisor===a.id&&x.stage>=0&&x.stage<=4&&(S.city==='all'||x.city===S.city));
  const g = a.goal*P.months, rev = sum(s,'sold');
  return {a,n:s.length,rev,leads:l.length,visits:l.filter(x=>x.reached>=3).length,conv:l.length?s.length/l.length:0,resp,pipe:sum(pipe,'value'),pipeN:pipe.length,cum:g?s.length/g:0,goal:g,comm:rev*.015,s};
}
V.asesores = {
  title:'Equipo de asesores',
  tb(){ return `<div class="tb">${sel('period','Período',O_PER)}${sel('city','Ciudad',O_CITY)}<span class="grow"></span><span class="muted" style="font-size:12.5px">Comisión estimada al 1.5% del monto vendido</span></div>`; },
  body(){
    const P=getPeriod(); let rows = ADV.map(a=>advStats(a,P)).filter(r=>S.city==='all'||r.a.cities.includes(S.city));
    const top = [...rows].sort((a,b)=>b.rev-a.rev).slice(0,3);
    const pod = `<div class="podium">${top.map((r,i)=>`<div class="card pod" style="cursor:pointer" data-open="adv:${r.a.id}"><div class="top">${av(r.a,'lg')}<div><b style="font-size:15px">${esc(r.a.name)}</b><div class="muted" style="font-size:12.5px">${esc(r.a.zone)}</div></div><span class="medal">${i+1}</span></div><div><span class="lbl">Ventas del período</span><div class="big">${mc(r.rev)}</div></div><div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span class="muted">${r.n} de ${r.goal.toFixed(1)} unidades meta</span><b>${pct(r.cum,0)}</b></div><div class="hb-t"><i style="width:${Math.min(100,r.cum*100)}%;background:${r.cum>=1?'var(--good)':'var(--accent)'}"></i></div></div></div>`).join('')}</div>`;
    const k=S.asort, d=S.adir; rows.sort((x,y)=>{const f=r=>k==='name'?r.a.name:r[k]; const A=f(x),B=f(y); return (typeof A==='string'?A.localeCompare(B):A-B)*d;});
    const th=(key,lab,r)=>`<th class="${r?'r':''}" data-sort="${key}">${lab}${S.asort===key?(S.adir<0?' ↓':' ↑'):''}</th>`;
    const tot = rows.reduce((s,r)=>s+r.rev,0);
    const tbl = `<div class="card" style="padding:8px 12px 12px"><div class="tw"><table><thead><tr>${th('name','Asesor')}${th('rev','Ventas',1)}${th('n','Unid.',1)}${th('cum','Cumplimiento')}${th('leads','Leads',1)}${th('conv','Conversión',1)}${th('resp','T. resp.',1)}${th('pipe','Pipeline',1)}${th('comm','Comisión est.',1)}</tr></thead><tbody>${rows.map(r=>`<tr data-open="adv:${r.a.id}"><td><div class="who">${av(r.a)}<div><b>${esc(r.a.name)}</b><small>${esc(r.a.zone)}</small></div></div></td><td class="r"><b>${mf(r.rev)}</b></td><td class="r">${r.n}</td><td><div style="display:flex;align-items:center;gap:8px"><span class="hb-t" style="width:84px;height:7px"><i style="width:${Math.min(100,r.cum*100)}%;background:${r.cum>=1?'var(--good)':r.cum>=.75?'var(--accent)':'var(--warn)'}"></i></span><b>${pct(r.cum,0)}</b></div></td><td class="r">${nf(r.leads)}</td><td class="r">${pct(r.conv)}</td><td class="r"><span style="color:${r.resp&&r.resp<=20?'var(--good)':r.resp>35?'var(--bad)':'inherit'}">${r.resp?Math.round(r.resp)+' min':'—'}</span></td><td class="r">${mc(r.pipe)} <span class="muted">· ${r.pipeN}</span></td><td class="r">${mf(r.comm)}</td></tr>`).join('')}</tbody><tfoot><tr><td style="font-weight:700">Equipo (${rows.length})</td><td class="r"><b>${mf(tot)}</b></td><td class="r"><b>${sum(rows,'n')}</b></td><td></td><td class="r"><b>${nf(sum(rows,'leads'))}</b></td><td colspan="4"></td></tr></tfoot></table></div></div>`;
    return pod+tbl;
  }
};

/* ---------- CRM ---------- */
const PROB = [.05,.15,.3,.55,.85,1];
function crmFiltered(){
  const q=S.cq.trim().toLowerCase();
  return LEADS.filter(l=>{
    if(S.cadv!=='all'&&l.advisor!==S.cadv) return false;
    if(S.cproj!=='all'&&l.project!==S.cproj) return false;
    if(S.csrc!=='all'&&l.src!==S.csrc) return false;
    if(S.ctemp!=='all'&&l.temp!==S.ctemp) return false;
    if(q&&!(l.name+' '+l.phone+' '+l.email+' '+projById[l.project].name).toLowerCase().includes(q)) return false;
    return true; });
}
function leadCard(l){
  const p=projById[l.project], a=advById[l.advisor], late=isLate(l);
  const nx = l.stage===5 ? `<div class="nx" style="color:var(--good)">${ico('key')}<span>Cierre ${fd(l.stageTs)} · ${l.unit||''}</span></div>`
    : l.stage===0 && !l.lastTs ? `<div class="nx ${T0-l.createdTs>DAY?'late':''}">${ico('clock')}<span>Sin contactar · ingresó hace ${T0-l.createdTs<DAY?Math.max(1,Math.round((T0-l.createdTs)/36e5))+' h':Math.round((T0-l.createdTs)/DAY)+' d'}</span></div>`
    : l.next ? `<div class="nx ${late?'late':''}">${ico(late?'alert':'cal')}<span><b style="font-weight:700">${dueLabel(l.next.due)}</b> · ${esc(l.next.text)}</span></div>` : '';
  return `<div class="lc" draggable="true" data-lead="${l.id}" data-open="lead:${l.id}">
    <div class="t"><b>${esc(l.name)}</b>${tempPill(l.temp)}</div>
    <div class="m"><span>${esc(p.name)} · ${l.bed} dorm.</span><span>${esc(l.fin)} · ${esc(l.src.split(' (')[0])}</span></div>
    ${nx}
    <div class="f"><span class="val">${mc(l.value)}</span>${av(a,'sm')}</div></div>`;
}
V.crm = {
  title:'CRM · Gestión de clientes',
  tb(){ return `<div class="tb">${search('cq','Buscar cliente, teléfono o correo')}${sel('cadv','Asesor',O_ADV)}${sel('cproj','Proyecto',O_PROJ)}${sel('csrc','Canal',[['all','Todos los canales'],...SRC.map(s=>[s.id,s.id])])}${seg('ctemp',[['all','Todos'],['Caliente','Caliente'],['Tibio','Tibio'],['Frío','Frío']],'sm')}<span class="grow"></span>${seg('cview',[['kanban','Pipeline'],['lista','Lista']])}</div>`; },
  body(){
    const F=crmFiltered(), open=F.filter(l=>l.stage>=0&&l.stage<=4);
    const won=F.filter(l=>l.stage===5&&l.stageTs>=ago(45));
    const tasks = open.filter(l=>l.next&&l.next.due<=T0+1000).sort((a,b)=>(isLate(a)?1:0)-(isLate(b)?1:0)||a.next.due-b.next.due||b.value-a.value);
    const late = tasks.filter(isLate).length;
    const weighted = sum(open,l=>l.value*PROB[l.stage]);
    const rs = open.filter(l=>l.resp), resp = rs.length? sum(rs,'resp')/rs.length : 0;
    const chips = `<div class="chips">
      <div class="chip"><small>Clientes en gestión</small><b>${open.length}</b></div>
      <div class="chip"><small>Valor del pipeline</small><b>${mc(sum(open,'value'))}</b></div>
      <div class="chip"><small>Cierre estimado (ponderado)</small><b>${mc(weighted)}</b></div>
      <div class="chip"><small>Tareas para hoy</small><b>${tasks.length-late}</b></div>
      <div class="chip"><small>Seguimientos vencidos</small><b style="color:${late?'var(--bad)':'inherit'}">${late}</b></div>
      <div class="chip"><small>Tiempo de respuesta</small><b>${resp?Math.round(resp)+' min':'—'}</b></div></div>`;
    const agenda = tasks.length ? `<div class="lbl" style="margin:2px 2px 8px">Agenda de seguimiento</div><div class="lead-t">${tasks.slice(0,8).map(l=>`<button class="task" data-open="lead:${l.id}" style="--c:${isLate(l)?'var(--bad)':'var(--accent)'}"><span class="dot"></span><span><b>${esc(l.next.text)}</b><small>${esc(l.name)} · ${dueLabel(l.next.due)}</small></span></button>`).join('')}</div>` : '';
    if(S.cview==='lista'){
      let rows = F.filter(l=>l.stage>=0 || l.stageTs>=ago(90)).sort((a,b)=> S.lsort==='value'?b.value-a.value : (b.stage<0?-1:b.stage)-(a.stage<0?-1:a.stage) || b.value-a.value).slice(0,60);
      return chips+agenda+`<div class="card" style="padding:8px 12px 12px"><div class="tw"><table><thead><tr><th>Cliente</th><th>Proyecto de interés</th><th>Etapa</th><th>Temp.</th><th class="r">Valor</th><th>Financiamiento</th><th>Próxima acción</th><th>Asesor</th></tr></thead><tbody>${rows.map(l=>{const st=l.stage<0?{name:'Descartado',color:'var(--fg-3)'}:STAGES[l.stage]; return `<tr data-open="lead:${l.id}"><td><div class="who"><div><b>${esc(l.name)}</b><small>${esc(l.phone)}</small></div></div></td><td>${esc(projById[l.project].name)}</td><td><span class="pill" style="--c:${st.color}"><i></i>${st.name}</span></td><td>${tempPill(l.temp)}</td><td class="r"><b>${mc(l.value)}</b></td><td>${esc(l.fin)}</td><td>${l.next?`<span style="${isLate(l)?'color:var(--bad)':''}">${dueLabel(l.next.due)}</span> · ${esc(l.next.text)}`:'<span class="muted">—</span>'}</td><td><div class="who">${av(advById[l.advisor],'sm')}<span>${esc(advById[l.advisor].name.split(' ')[0])}</span></div></td></tr>`;}).join('')}</tbody></table></div><div class="pager"><span>Mostrando los ${rows.length} registros más relevantes · usa los filtros para afinar</span></div></div>`;
    }
    const cols = STAGES.map(st=>{
      const ls = (st.id===5?won:open.filter(l=>l.stage===st.id)).sort((a,b)=>(a.next?a.next.due:T0+9*DAY)-(b.next?b.next.due:T0+9*DAY));
      return `<section class="col" data-stage="${st.id}" aria-label="${st.name}"><div class="col-h"><b><i style="background:${st.color}"></i>${st.name}</b><small>${ls.length}</small></div><div class="col-sum">${mc(sum(ls,'value'))}${st.id===5?' · últimos 45 días':''}</div><div class="col-l">${ls.length?ls.map(leadCard).join(''):'<div class="empty" style="padding:24px 4px;font-size:12.5px">Sin clientes en esta etapa</div>'}</div></section>`;
    }).join('');
    return chips+agenda+`<div class="board" id="board">${cols}</div>`;
  }
};
