/* ================= DATOS DE DEMOSTRACIÓN (ficticios) ================= */
const TC = 3.72, DAY = 864e5;
const NOW = new Date(); NOW.setHours(12, 0, 0, 0);
const T0 = NOW.getTime();
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R = mulberry(26102026);
const rnd = (a,b)=>a+R()*(b-a), ri = (a,b)=>Math.floor(rnd(a,b+1)), pick = a=>a[Math.floor(R()*a.length)];
function wpick(items, w){let t=0;for(const x of w)t+=x;let x=R()*t;for(let i=0;i<items.length;i++){x-=w[i];if(x<0)return items[i]}return items[items.length-1]}
const ago = d => T0 - d*DAY;

const ADV = [
 {id:'a1',name:'Carolina Quispe',zone:'Lima Moderna',cities:['Lima'],skill:1.3,goal:2.6,color:'#0e7c86'},
 {id:'a2',name:'Diego Salazar',zone:'Lima Moderna',cities:['Lima'],skill:1.15,goal:2.4,color:'#3f5f9e'},
 {id:'a3',name:'María Fernanda Huamán',zone:'Lima Centro',cities:['Lima'],skill:1.0,goal:2.0,color:'#a8742a'},
 {id:'a4',name:'Luis Paredes',zone:'Lima Centro',cities:['Lima'],skill:0.85,goal:1.8,color:'#6b5b95'},
 {id:'a5',name:'Andrea Chávez',zone:'Lima Sur',cities:['Lima'],skill:1.2,goal:2.4,color:'#b5483f'},
 {id:'a6',name:'Jorge Mendoza',zone:'Lima Sur',cities:['Lima'],skill:0.7,goal:1.6,color:'#4e7d5b'},
 {id:'a7',name:'Valeria Rivas',zone:'Lima Oeste',cities:['Lima'],skill:0.95,goal:1.9,color:'#8a5a83'},
 {id:'a8',name:'Renzo Gutiérrez',zone:'Arequipa',cities:['Arequipa'],skill:1.5,goal:1.6,color:'#2f7a9b'},
 {id:'a9',name:'Lucía Vargas',zone:'La Libertad · Lambayeque',cities:['Trujillo','Chiclayo'],skill:0.9,goal:1.6,color:'#a65f4a'},
 {id:'a10',name:'Miguel Tapia',zone:'Venta digital',cities:['Lima','Arequipa','Trujillo','Chiclayo'],skill:0.45,goal:1.8,color:'#5a6f86'}
];
ADV.forEach(a=>{const p=a.name.split(' ');a.ini=(p[0][0]+(p[1]?p[1][0]:'')).toUpperCase()});
const advById = Object.fromEntries(ADV.map(a=>[a.id,a]));

const PROJ = [
 {id:'p1',code:'MR',name:'Marea Residencial',district:'Miraflores',city:'Lima',floors:12,per:4,amin:55,amax:140,ppm:3900,progress:58,delivery:'dic 2027',stage:'En construcción',sold:.52,launch:26,hue:['#cfe3f2','#9ec5e0'],fin:[30,40,0,22,8]},
 {id:'p2',code:'PA',name:'Parque Aurora',district:'Santiago de Surco',city:'Lima',floors:10,per:5,amin:60,amax:112,ppm:2350,progress:71,delivery:'jun 2027',stage:'En construcción',sold:.62,launch:30,hue:['#d7ecdf','#a4d3b9'],fin:[34,36,0,20,10]},
 {id:'p3',code:'BM',name:'Bosques de La Molina',district:'La Molina',city:'Lima',floors:8,per:4,amin:95,amax:165,ppm:2500,progress:34,delivery:'mar 2028',stage:'Preventa',sold:.22,launch:7,hue:['#dfe9d0','#b9d29a'],fin:[18,52,0,22,8]},
 {id:'p4',code:'CT',name:'Costanera 18',district:'San Miguel',city:'Lima',floors:14,per:5,amin:45,amax:86,ppm:1850,progress:83,delivery:'feb 2027',stage:'En construcción',sold:.74,launch:34,hue:['#d2e6ef','#8fc0d6'],fin:[48,22,18,8,4]},
 {id:'p5',code:'AB',name:'Alameda Barranco',district:'Barranco',city:'Lima',floors:8,per:3,amin:70,amax:132,ppm:3300,progress:45,delivery:'sep 2027',stage:'En construcción',sold:.42,launch:16,hue:['#efe0d2','#dcb998'],fin:[22,46,0,24,8]},
 {id:'p6',code:'MC',name:'Mirador Cayma',district:'Cayma',city:'Arequipa',floors:10,per:4,amin:62,amax:106,ppm:1450,progress:62,delivery:'ago 2027',stage:'En construcción',sold:.46,launch:20,hue:['#ecdcd3','#d3a894'],fin:[40,34,8,12,6]},
 {id:'p7',code:'ET',name:'Eco Trujillo Norte',district:'Víctor Larco',city:'Trujillo',floors:9,per:4,amin:58,amax:96,ppm:1250,progress:25,delivery:'jul 2028',stage:'Preventa',sold:.2,launch:6,hue:['#e3e6f2','#b2bce0'],fin:[38,30,14,12,6]},
 {id:'p8',code:'JP',name:'Jardines de Pueblo Libre',district:'Pueblo Libre',city:'Lima',floors:11,per:5,amin:50,amax:92,ppm:1980,progress:92,delivery:'dic 2026',stage:'Entrega inmediata',sold:.82,launch:36,hue:['#e6dcef','#c2aad8'],fin:[44,30,10,10,6]},
 {id:'p9',code:'VV',name:'Valle Verde',district:'Chiclayo',city:'Chiclayo',floors:5,per:8,amin:118,amax:182,ppm:1080,progress:48,delivery:'oct 2027',stage:'En construcción',sold:.32,launch:12,hue:['#e0eadc','#aecaa0'],fin:[14,40,12,26,8],casas:true}
];
const projById = Object.fromEntries(PROJ.map(p=>[p.id,p]));
const MKT = {'Miraflores':3650,'Santiago de Surco':2300,'La Molina':2450,'San Miguel':1900,'Barranco':3150,'Pueblo Libre':2020,'Cayma':1380,'Víctor Larco':1240,'Chiclayo':1050};
const FIN = ['Crédito MiVivienda','Crédito hipotecario','Techo Propio','Contado','Financiamiento directo'];
const SRC = [
 {id:'Portales (Urbania, Adondevivo)',w:24,conv:1.0,cpl:38},
 {id:'Facebook / Instagram Ads',w:27,conv:.62,cpl:19},
 {id:'Google Ads',w:14,conv:1.1,cpl:41},
 {id:'Referidos',w:8,conv:2.4,cpl:7},
 {id:'Sala de ventas',w:9,conv:2.1,cpl:0},
 {id:'Ferias inmobiliarias',w:7,conv:1.3,cpl:56},
 {id:'WhatsApp directo',w:8,conv:1.0,cpl:11},
 {id:'Base de datos',w:3,conv:1.2,cpl:3}
];
const STAGES = [
 {id:0,name:'Nuevo',color:'var(--info)'},
 {id:1,name:'Contactado',color:'var(--accent)'},
 {id:2,name:'Visita agendada',color:'var(--gold)'},
 {id:3,name:'Visitó proyecto',color:'var(--warn)'},
 {id:4,name:'Separación',color:'var(--bad)'},
 {id:5,name:'Cierre ganado',color:'var(--good)'}
];
const NAMES_F = ['Karen','Rosa','Milagros','Fiorella','Gabriela','Daniela','Patricia','Claudia','Sofía','Verónica','Jimena','Paola','Lourdes','Cecilia','Katherine','Alejandra'];
const NAMES_M = ['Carlos','José','Luis','Marco','Eduardo','Sergio','Fernando','Alonso','Javier','Pedro','Ricardo','Álvaro','Hugo','César','Renato','Gonzalo'];
const SURN = ['Ramírez','Torres','Flores','Rojas','Castillo','Vásquez','Mamani','Huamán','Quispe','Chávez','Ríos','Salinas','Delgado','Espinoza','Calderón','Cárdenas','Ponce','Valdivia','Zegarra','Ccama','Bustamante','Lazo','Zavala','Ortiz','Núñez','Aguilar','Paz','Bravo','Soto','Cueva'];
const JOBS = [['Ingeniero civil','Ingeniera civil'],['Médico','Médica'],['Docente','Docente'],['Contador','Contadora'],['Abogado','Abogada'],['Empresario','Empresaria'],['Arquitecto','Arquitecta'],['Administrador','Administradora'],['Independiente','Independiente'],['Ingeniero de sistemas','Ingeniera de sistemas'],['Enfermero','Enfermera'],['Economista','Economista']];
const MOTIVO = ['Primera vivienda','Inversión','Mejorar vivienda','Para alquilar','Independizarse'];
const RES_DIST = ['Los Olivos','San Juan de Lurigancho','Comas','Callao','Surco','Jesús María','Lince','Ate','San Martín de Porres','Chorrillos','Villa El Salvador','Magdalena','Breña','Independencia','Cercado de Lima'];
const LOST = ['Precio fuera de presupuesto','No calificó para crédito','Compró en otro proyecto','Sin respuesta','Postergó la decisión'];
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z]/g,'');

/* ---------- Unidades ---------- */
const UNITS = [];
PROJ.forEach(p => {
  const elig = ADV.filter(a => a.cities.includes(p.city));
  p.units = [];
  for (let f = 1; f <= p.floors; f++) for (let k = 1; k <= p.per; k++) {
    const frac = (k-1)/Math.max(1,p.per-1);
    const area = Math.round((p.amin + (p.amax-p.amin)*Math.min(1,Math.max(0, frac*.8 + R()*.25 + (f===p.floors?.1:0))))*10)/10;
    const bed = p.casas ? 3 + (area>150?1:0) : area<56?1:area<82?2:area<112?3:4;
    const top = f===p.floors && !p.casas;
    const type = p.casas ? 'Casa' : top ? 'Penthouse' : (f===p.floors-1 && k%2===0 ? 'Dúplex' : 'Departamento');
    const list = Math.round(area*p.ppm*(1+(f-1)*.007)*(top?1.12:1)*rnd(.97,1.04)/1000)*1000;
    const pr = Math.pow(1.35-.7*(f/p.floors),1);
    const u0 = R(), ps = p.sold*pr;
    let status = u0<ps ? 'Vendido' : u0<ps+.065 ? 'Reservado' : u0<ps+.065+.015 ? 'Bloqueado' : 'Disponible';
    const u = {
      id: p.code+'-'+String(f).padStart(2,'0')+String(k).padStart(2,'0'), project:p.id, floor:f, num:k, type, area, bed,
      bath: bed>=3?2+(area>120?1:0):bed, price:list, status, orient: R()<.55?'Frente':'Interior', park: R()<.7, view: f>p.floors*.6?'Vista abierta':'Vista a calle', adv:null
    };
    if (status!=='Disponible' && status!=='Bloqueado') {
      u.adv = wpick(elig, elig.map(a=>a.skill)).id;
      if (status==='Vendido') {
        const maxd = p.launch*30;
        u.saleTs = ago(Math.floor(Math.pow(R(),1.3)*maxd)+1);
        u.sold = Math.round(list*(1-rnd(0,.045))/500)*500;
        u.src = wpick(SRC.map(s=>s.id), SRC.map(s=>s.w*s.conv));
        u.fin = wpick(FIN, p.fin);
      } else {
        u.resTs = ago(ri(1,13)); u.src = wpick(SRC.map(s=>s.id), SRC.map(s=>s.w*s.conv)); u.fin = wpick(FIN, p.fin);
      }
    }
    p.units.push(u); UNITS.push(u);
  }
});
const unitById = Object.fromEntries(UNITS.map(u=>[u.id,u]));
UNITS.forEach(u=>{u.city=projById[u.project].city; u.district=projById[u.project].district});

/* ---------- Leads ---------- */
const LEADS = [];
let lid = 1000;
function person(){
  const fem = R()<.5, first = pick(fem?NAMES_F:NAMES_M), s1 = pick(SURN), s2 = pick(SURN);
  const phone = '9'+String(ri(10,99))+' '+String(ri(100,999))+' '+String(ri(100,999));
  const email = strip(first)+'.'+strip(s1)+ri(1,99)+'@'+pick(['gmail.com','hotmail.com','outlook.com','gmail.com','yahoo.com']);
  return {name:first+' '+s1+' '+s2, phone, email, job: pick(JOBS)[fem?1:0], from: pick(RES_DIST), motivo: pick(MOTIVO)};
}
function mkLead(o){
  const p = projById[o.project], elig = ADV.filter(a=>a.cities.includes(p.city));
  const adv = o.adv || wpick(elig, elig.map(a=>a.skill)).id;
  const L = Object.assign({id:'L-'+(++lid)}, person(), {
    advisor: adv, fin: o.fin || wpick(FIN, p.fin), bed: o.bed || ri(1,3), reached: o.reached
  }, o);
  L.temp = L.stage>=4?'Caliente': L.stage===3?wpick(['Caliente','Tibio'],[70,30]) : L.stage===2?wpick(['Caliente','Tibio','Frío'],[35,50,15]) : L.stage===1?wpick(['Tibio','Frío','Caliente'],[45,40,15]) : wpick(['Frío','Tibio'],[60,40]);
  const base = L.unit ? unitById[L.unit].price : Math.round(p.units.reduce((s,u)=>s+u.price,0)/p.units.length*rnd(.85,1.12)/1000)*1000;
  L.value = L.unit ? (unitById[L.unit].sold||base) : base;
  L.budget = Math.round(L.value*rnd(.92,1.12)/5000)*5000;
  L.resp = L.reached>=1 ? Math.max(3, Math.round(24/advById[adv].skill*rnd(.4,2.2))) : null;
  L.score = Math.min(99, Math.round(18 + L.stage*13 + (L.temp==='Caliente'?18:L.temp==='Tibio'?8:0) + rnd(-6,10)));
  LEADS.push(L); return L;
}
// Ganados y separaciones desde las unidades
UNITS.forEach(u=>{
  if (u.status==='Vendido') {
    const created = Math.min(u.saleTs - ri(12,85)*DAY, T0 - DAY);
    mkLead({project:u.project, stage:5, reached:5, unit:u.id, adv:u.adv, src:u.src, fin:u.fin, createdTs:created, stageTs:u.saleTs, lastTs:u.saleTs});
  } else if (u.status==='Reservado') {
    mkLead({project:u.project, stage:4, reached:4, unit:u.id, adv:u.adv, src:u.src, fin:u.fin, createdTs:u.resTs - ri(10,50)*DAY, stageTs:u.resTs, lastTs:u.resTs + ri(0,Math.max(0,Math.floor((T0-u.resTs)/DAY)))*DAY});
  }
});
// Contadores objetivo por canal
const N_TOTAL = 3050, tgt = {};
SRC.forEach(s=>tgt[s.id]=Math.round(N_TOTAL*s.w/100));
LEADS.forEach(l=>{tgt[l.src]--});
function nextSrc(){return wpick(SRC.map(s=>s.id), SRC.map(s=>Math.max(1,tgt[s.id])))}
// Abiertos 0..3
const openCounts = [41,46,27,20];
const pAvail = PROJ.map(p=>p.units.filter(u=>u.status==='Disponible').length+3);
openCounts.forEach((n,stage)=>{
  for (let i=0;i<n;i++){
    const p = wpick(PROJ, pAvail), maxAge = [4,12,24,40][stage];
    const created = ago(rnd(stage===0?0.05:1, maxAge));
    const src = nextSrc(); tgt[src]--;
    const stageTs = stage===0 ? created : created + rnd(.2,.8)*(T0-created);
    const last = stage===0 ? null : Math.min(T0, stageTs + rnd(0,.7)*(T0-stageTs));
    mkLead({project:p.id, stage, reached:stage, src, createdTs:created, stageTs, lastTs:last});
  }
});
// Descartados (históricos)
let guard = 0;
while (LEADS.length < N_TOTAL && guard++ < 9000) {
  const p = wpick(PROJ, PROJ.map(x=>x.launch)), src = nextSrc(); tgt[src]--;
  const age = Math.floor(Math.pow(R(),.85)*Math.min(p.launch*30, 720))+3;
  const reached = wpick([0,1,2,3],[46,34,14,6]);
  const created = ago(age);
  mkLead({project:p.id, stage:-1, reached, src, createdTs:created, stageTs:created+rnd(1,20)*DAY, lastTs:created+rnd(1,20)*DAY, why:pick(LOST)});
}
LEADS.forEach(l=>{ if (l.stage===-1){l.temp='Frío'; l.score=Math.round(8+l.reached*9+rnd(0,8)); l.value=l.value||0}
  l.city = projById[l.project].city; });

// Próximas acciones para abiertos
const ACT = {0:['Llamar y presentarse','Enviar WhatsApp de bienvenida'],1:['Enviar cotización','Agendar visita al showroom','Compartir brochure y lista de precios'],2:['Confirmar visita','Recordar visita por WhatsApp'],3:['Enviar propuesta con cronograma','Seguimiento de decisión','Validar pre-calificación bancaria'],4:['Cobrar saldo de separación','Coordinar firma de minuta','Revisar documentos para crédito']};
LEADS.forEach(l=>{
  if (l.stage>=0 && l.stage<=4) {
    const late = l.stage>0 && R()<.13;
    const d = late ? -ri(1,3) : wpick([0,0,1,1,2,4],[3,3,3,3,2,1]);
    l.next = {text:pick(ACT[l.stage]), due:T0+d*DAY};
  }
});
// Reservas: vencimiento a 15 días
UNITS.forEach(u=>{ if(u.status==='Reservado') u.resExp = u.resTs + 15*DAY });
