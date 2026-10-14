(function(){
'use strict';
var STAGES=[['Opt-In Lead','blue'],['48/24 Hr Qual Call Conf','teal'],['Day of Qual Call','teal'],['Qualification Call','teal'],['Rebook Qual Call','teal'],['Qual Call Follow-Up','teal'],['48/24 Hr Sales Call','blue'],['Day of Sales Call','blue'],['DSA/MRS Sales Call','blue'],['Rebook Sales Call','blue'],['$ Follow Up','purple'],['Aplicación','gold'],['Suscripción','gold'],['Pendiente de requisitos','gold'],['Aprobado','green'],['Activo','green'],['DSA/MRS Students','purple'],['Archived Leads','gray']];
var COLOR={};STAGES.forEach(function(s){COLOR[s[0]]=s[1]});
var NAV=[['dashboard','Dashboard','⌂'],['crm','Contactos / CRM','👤'],['tareas','Tareas','☑'],['calendario','Calendario','📅'],['llamadas','Llamadas','📞'],['mensajes','Mensajes','💬'],['documentos','Documentos','📄'],['reportes','Reportes','📊'],['configuracion','Configuración','⚙']];
var BOTTOM=['dashboard','crm','tareas','calendario','documentos'];
var KEY='aurora-crm-v1';
var FIRST=['Ana Demo','Beto Ficticio','Carla Muestra','Dario Prueba','Elena Ejemplo','Fabio Demo','Gina Ficticia','Hugo Muestra','Irene Prueba','Julio Ejemplo','Karla Demo','Leo Ficticio','Mara Muestra','Nico Prueba','Olga Ejemplo','Pablo Demo','Quina Ficticia','Raúl Muestra','Sara Prueba','Tito Ejemplo','Uma Demo','Vico Ficticio'];
function pad(n){return (n<10?'0':'')+n}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function seed(){var t=new Date(),leads=[];
 FIRST.forEach(function(n,i){var d=new Date(t);d.setDate(t.getDate()-i*2);var ap=null;if(i%4===1){var a=new Date(t);a.setDate(t.getDate()+(i%7));ap={date:iso(a),time:(9+i%8)+':00'}}
  leads.push({id:'L'+(i+1),name:n,phone:'(555) 01'+pad(i)+'-'+(1000+i*37),email:n.toLowerCase().split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'')+(i+1)+'@ejemplo.test',stage:STAGES[i%STAGES.length][0],created:iso(d),apptDate:ap?ap.date:'',apptTime:ap?ap.time:'',notes:''})});
 var tasks=['Llamar a Ana Demo para confirmar cita','Enviar guía de última voluntad a Carla Muestra','Revisar requisitos pendientes de Hugo Muestra','Seguimiento de pago con Karla Demo','Preparar explicación de beneficios en vida'].map(function(x,i){var d=new Date(t);d.setDate(t.getDate()+i);return{id:'T'+i,title:x,due:iso(d),done:i===4}});
 return {leads:leads,tasks:tasks}}
var db;try{db=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!db||!db.leads){db=seed();save()}
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
var st={q:'',stage:'',from:'',to:''};
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(d){if(!d)return '–';var p=d.split('-');return +p[1]+'/'+ +p[2]+'/'+p[0]}
function navHtml(list,cur){return list.map(function(n){return '<a href="#'+n[0]+'" class="'+(n[0]===cur?'on':'')+'"><span class="ico">'+n[2]+'</span><span>'+n[1].replace('Contactos / ','')+'</span></a>'}).join('')}
function stageOpts(sel,all){return (all?'<option value="">Todas las etapas</option>':'')+STAGES.map(function(s){return '<option'+(s[0]===sel?' selected':'')+'>'+esc(s[0])+'</option>'}).join('')}
function pill(l){return '<span class="pill c-'+COLOR[l.stage]+'"><select data-stage="'+l.id+'" aria-label="Cambiar etapa">'+stageOpts(l.stage)+'</select></span>'}
function filtered(){var q=st.q.toLowerCase();return db.leads.filter(function(l){return(!st.stage||l.stage===st.stage)&&(!st.from||l.created>=st.from)&&(!st.to||l.created<=st.to)&&(!q||(l.name+' '+l.phone+' '+l.email).toLowerCase().indexOf(q)>=0)})}
var V={};
V.dashboard=function(){var c={};db.leads.forEach(function(l){c[l.stage]=(c[l.stage]||0)+1});var appts=db.leads.filter(function(l){return l.apptDate}).length,open=db.tasks.filter(function(t){return!t.done}).length,act=(c['Activo']||0)+(c['Aprobado']||0);
 return '<div class="head"><h1>Dashboard</h1><p>Resumen de tu embudo de ventas.</p></div><div class="kpis"><div class="card kpi"><span>Leads</span><b>'+db.leads.length+'</b></div><div class="card kpi"><span>Citas</span><b>'+appts+'</b></div><div class="card kpi"><span>Tareas abiertas</span><b>'+open+'</b></div><div class="card kpi"><span>Aprobados + Activos</span><b>'+act+'</b></div></div><h2>Leads por etapa</h2><div class="stats">'+STAGES.map(function(s){return '<button class="stat" data-go="'+esc(s[0])+'"><span class="pill c-'+s[1]+'">'+esc(s[0])+'</span><b>'+(c[s[0]]||0)+'</b></button>'}).join('')+'</div>'};
V.crm=function(){var L=filtered();
 var f='<div class="filters"><select id="fStage" aria-label="Filtrar por etapa">'+stageOpts(st.stage,true)+'</select><label class="datef">Creado desde<input type="date" id="fFrom" value="'+st.from+'"></label><label class="datef">Creado hasta<input type="date" id="fTo" value="'+st.to+'"></label><input type="search" id="fQ" value="'+esc(st.q)+'" placeholder="Buscar en la lista..."><button class="btn" id="addLead">+ Nuevo lead</button></div>';
 var rows=L.map(function(l,i){return '<tr><td>'+(i+1)+'</td><td>'+pill(l)+'</td><td>'+esc(l.name)+'</td><td>'+esc(l.phone)+'</td><td>'+esc(l.email)+'</td><td>'+fmt(l.created)+'</td><td>'+(l.apptTime||'–')+'</td><td>'+fmt(l.apptDate)+'</td><td><button class="rowbtn" data-edit="'+l.id+'" aria-label="Editar">⋮</button></td></tr>'}).join('')||'<tr><td colspan="9">Sin resultados.</td></tr>';
 var cards=L.map(function(l){return '<div class="lead-card"><h3>'+esc(l.name)+'</h3>'+pill(l)+'<div class="meta">📞 '+esc(l.phone)+'<br>✉ '+esc(l.email)+'<br>Creado: '+fmt(l.created)+(l.apptDate?'<br>Cita: '+fmt(l.apptDate)+' '+l.apptTime:'')+'</div><div class="acts"><a class="btn ghost" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="tel:'+esc(l.phone)+'">Llamar</a><button class="btn" data-edit="'+l.id+'">Editar</button></div></div>'}).join('')||'<p>Sin resultados.</p>';
 return '<div class="head"><h1>CRM</h1><p>Gestiona tus leads, haz seguimiento y cierra más ventas. ('+L.length+')</p></div>'+f+'<div class="tablewrap"><table><thead><tr><th>#</th><th>Etapa del proceso</th><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Creado</th><th>Hora cita</th><th>Fecha cita</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="cards">'+cards+'</div>'};
V.tareas=function(){return '<div class="head"><h1>Tareas</h1><p>Tus pendientes del día.</p></div><form class="filters" id="taskForm"><input type="search" id="tTitle" placeholder="Nueva tarea..." required><input type="date" id="tDue" value="'+iso(new Date())+'"><button class="btn">Agregar</button></form><div class="list">'+db.tasks.slice().sort(function(a,b){return a.done-b.done||a.due.localeCompare(b.due)}).map(function(t){return '<label class="item'+(t.done?' done':'')+'"><input type="checkbox" data-task="'+t.id+'"'+(t.done?' checked':'')+'><span class="grow"><b>'+esc(t.title)+'</b><small>Vence: '+fmt(t.due)+'</small></span><button type="button" class="rowbtn" data-deltask="'+t.id+'" aria-label="Borrar">✕</button></label>'}).join('')+'</div>'};
V.calendario=function(){var A=db.leads.filter(function(l){return l.apptDate}).sort(function(a,b){return(a.apptDate+a.apptTime).localeCompare(b.apptDate+b.apptTime)}),h='',last='';
 A.forEach(function(l){if(l.apptDate!==last){last=l.apptDate;h+='<div class="datehead">'+new Date(l.apptDate+'T12:00').toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})+'</div>'}h+='<div class="item"><span class="grow"><b>'+esc(l.apptTime)+' · '+esc(l.name)+'</b><small>'+esc(l.stage)+'</small></span><button class="rowbtn" data-edit="'+l.id+'" aria-label="Editar">⋮</button></div>'});
 return '<div class="head"><h1>Calendario</h1><p>Próximas citas. Agrega una cita editando un lead.</p></div><div class="list">'+(h||'<p>No hay citas.</p>')+'</div>'};
V.documentos=function(){return '<div class="head"><h1>Documentos</h1><p>Bóveda de documentos (próximamente).</p></div><div class="card"><h2 style="margin-top:0">Última voluntad</h2><p>Redacta e imprime tu última voluntad con nuestra herramienta gratuita.</p><a class="btn gold" style="display:inline-flex;align-items:center;text-decoration:none" target="_blank" rel="noopener" href="https://usa-ultima-voluntad.lovable.app/">Abrir herramienta de Última voluntad ↗</a></div>'};
function ph(t){return function(){return '<div class="head"><h1>'+t+'</h1></div><div class="card ph"><img src="assets/kairos.png" alt=""><h2>Próximamente</h2><p>Kairos está preparando esta sección.</p></div>'}}
V.llamadas=ph('Llamadas');V.mensajes=ph('Mensajes');V.reportes=ph('Reportes');V.configuracion=ph('Configuración');
function cur(){var h=location.hash.slice(1);return V[h]?h:'dashboard'}
function render(){var c=cur();$('#nav').innerHTML=navHtml(NAV,c);$('#bottomNav').innerHTML=navHtml(NAV.filter(function(n){return BOTTOM.indexOf(n[0])>=0}),c);$('#view').innerHTML=V[c]();$('#footSec').textContent=NAV.filter(function(n){return n[0]===c})[0][1];closeMenu()}
function openLead(id){var l=db.leads.filter(function(x){return x.id===id})[0]||{id:'',name:'',phone:'',email:'',stage:'Opt-In Lead',created:iso(new Date()),apptDate:'',apptTime:'',notes:''};var d=$('#dlg');
 d.innerHTML='<form method="dialog" id="leadForm"><h2 style="margin:0">'+(l.id?'Editar lead':'Nuevo lead')+'</h2><label>Nombre</label><input name="name" required value="'+esc(l.name)+'"><label>Teléfono</label><input name="phone" type="tel" value="'+esc(l.phone)+'"><label>Email</label><input name="email" type="email" value="'+esc(l.email)+'"><label>Etapa</label><select name="stage">'+stageOpts(l.stage)+'</select><label>Fecha de la cita</label><input name="apptDate" type="date" value="'+l.apptDate+'"><label>Hora de la cita</label><input name="apptTime" type="time" value="'+l.apptTime+'"><label>Notas</label><textarea name="notes" rows="2">'+esc(l.notes)+'</textarea><div class="row">'+(l.id?'<button type="button" class="btn ghost" id="delLead">Eliminar</button>':'')+'<button type="button" class="btn ghost" id="cancel">Cancelar</button><button class="btn">Guardar</button></div></form>';
 d.showModal();$('#cancel').onclick=function(){d.close()};if($('#delLead'))$('#delLead').onclick=function(){if(confirm('¿Eliminar este lead?')){db.leads=db.leads.filter(function(x){return x.id!==l.id});save();d.close();render()}};
 $('#leadForm').onsubmit=function(e){e.preventDefault();var fd=new FormData(e.target);['name','phone','email','stage','apptDate','apptTime','notes'].forEach(function(k){l[k]=fd.get(k)});if(!l.id){l.id='L'+Date.now();db.leads.unshift(l)}save();d.close();render();say('Guardado ✔')}}
function say(t){var b=$('#bubble');b.textContent=t;b.classList.remove('hide');clearTimeout(say.t);say.t=setTimeout(function(){b.classList.add('hide')},3500)}
function closeMenu(){$('#sidebar').classList.remove('open');$('#scrim').classList.remove('open')}
$('#menuBtn').onclick=function(){$('#sidebar').classList.add('open');$('#scrim').classList.add('open')};$('#scrim').onclick=closeMenu;
var tips=['Hola, soy Kairos. ¿En qué te ayudo hoy?','Toca la etapa de un lead para cambiarla.','Revisa tus citas en Calendario.','Los datos se guardan en este navegador.'],ti=0;
$('#kairosBtn').onclick=function(){ti=(ti+1)%tips.length;say(tips[ti])};setTimeout(function(){$('#bubble').classList.add('hide')},5000);
$('#globalSearch').oninput=function(e){st.q=e.target.value;if(cur()!=='crm')location.hash='crm';else render()};
document.addEventListener('change',function(e){var t=e.target;
 if(t.dataset.stage){var l=db.leads.filter(function(x){return x.id===t.dataset.stage})[0];l.stage=t.value;save();t.parentNode.className='pill c-'+COLOR[l.stage];say('Etapa: '+l.stage)}
 else if(t.id==='fStage'){st.stage=t.value;render()}else if(t.id==='fFrom'){st.from=t.value;render()}else if(t.id==='fTo'){st.to=t.value;render()}
 else if(t.dataset.task){db.tasks.forEach(function(x){if(x.id===t.dataset.task)x.done=t.checked});save();render()}});
document.addEventListener('input',function(e){if(e.target.id==='fQ'){st.q=e.target.value;$('#globalSearch').value=st.q;render();var q=$('#fQ');q.focus();q.setSelectionRange(q.value.length,q.value.length)}});
document.addEventListener('click',function(e){var t=e.target.closest('[data-edit],[data-go],#addLead,[data-deltask]');if(!t)return;
 if(t.dataset.edit)openLead(t.dataset.edit);else if(t.id==='addLead')openLead('');
 else if(t.dataset.go){st.stage=t.dataset.go;location.hash='crm'}
 else if(t.dataset.deltask){e.preventDefault();db.tasks=db.tasks.filter(function(x){return x.id!==t.dataset.deltask});save();render()}});
document.addEventListener('submit',function(e){if(e.target.id==='taskForm'){e.preventDefault();db.tasks.push({id:'T'+Date.now(),title:$('#tTitle').value,due:$('#tDue').value,done:false});save();render()}});
window.addEventListener('hashchange',render);render();
})();
