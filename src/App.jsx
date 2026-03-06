import { useState, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

// ─── FONTS ────────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{width:100%;height:100%;margin:0;padding:0;overflow:hidden}`;

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const S = {
  bg:"#06080a", surface:"#0b0f12", surface2:"#0f1418", surface3:"#131c22",
  border:"#141c20", border2:"#1c2a30",
  text:"#e8f0ec", muted:"#4d6b5a", faint:"#1a2e22",
  green:"#4ade80", greenDim:"#4ade8012", greenMid:"#4ade8040",
  critical:"#ef4444", warn:"#f97316", ok:"#4ade80", info:"#38bdf8",
  purple:"#a78bfa",
  sans:"'DM Sans',system-ui,sans-serif",
  mono:"'DM Mono','Courier New',monospace",
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function StrataLogo({ size=28, color=S.green }) {
  const w=size*.82,x=size*.09,h=size*.13,g=size*.09,r=size*.035;
  const y1=size*.16,y2=y1+h+g,y3=y2+h+g,y4=y3+h+g;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect x={x} y={y1} width={w} height={h} rx={r} fill={color}/>
      <rect x={x} y={y2} width={w} height={h} rx={r} fill={color} opacity=".65"/>
      <rect x={x} y={y3} width={w} height={h} rx={r} fill={color} opacity=".35"/>
      <rect x={x} y={y4} width={w} height={h*.55} rx={r} fill={color} opacity=".15"/>
    </svg>
  );
}

// ─── STATUS ───────────────────────────────────────────────────────────────────
const SC={critical:S.critical,degraded:S.warn,ok:S.ok};
const SL={critical:"Crítico",degraded:"Degradado",ok:"Normal"};

function Dot({status,pulse,size=7}){
  return (
    <span style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {pulse&&status!=="ok"&&<span style={{position:"absolute",width:size*2.6,height:size*2.6,borderRadius:"50%",background:SC[status],opacity:.18,animation:"ripple 2s ease-out infinite"}}/>}
      <span style={{width:size,height:size,borderRadius:"50%",background:SC[status],display:"block",boxShadow:pulse&&status!=="ok"?`0 0 7px ${SC[status]}`:"none"}}/>
    </span>
  );
}

// ─── ALL DATA ─────────────────────────────────────────────────────────────────
const DOMAINS_TREE = [
  { id:"checkout", label:"Checkout & Payments", status:"critical",
    teams:[
      { id:"conversion", label:"Time de Conversão", features:[
        {id:"checkout",label:"checkout",status:"critical",metric:"Conv 74%",delta:"−8%"},
        {id:"pix",label:"pix",status:"ok",metric:"Conv 98%",delta:"+0.2%"},
        {id:"split",label:"split-payment",status:"degraded",metric:"Conv 89%",delta:"−2%"},
      ]},
      { id:"fraud", label:"Anti-Fraude", features:[
        {id:"fraud-check",label:"fraud-check",status:"ok",metric:"Block 1.2%",delta:"+0.1%"},
      ]},
    ]},
  { id:"catalog", label:"Catálogo & Busca", status:"degraded",
    teams:[
      { id:"search-team", label:"Time de Busca", features:[
        {id:"search",label:"search",status:"degraded",metric:"p95 1.8s",delta:"+400ms"},
        {id:"recs",label:"recommendations",status:"ok",metric:"CTR 12%",delta:"+0.5%"},
      ]},
    ]},
  { id:"logistics", label:"Logística", status:"ok",
    teams:[
      { id:"shipping", label:"Time de Entrega", features:[
        {id:"tracking",label:"tracking",status:"ok",metric:"Delay 3%",delta:"−0.5%"},
      ]},
    ]},
];

const CONV_CHART=[
  {t:"13:50",conv:82,p95:1.1},{t:"13:55",conv:82,p95:1.1},{t:"14:00",conv:81,p95:1.2},
  {t:"14:05",conv:80,p95:1.3},{t:"14:10",conv:79,p95:1.5},{t:"14:15",conv:78,p95:1.8},
  {t:"14:20",conv:78,p95:2.1},{t:"14:21",conv:76,p95:2.8},{t:"14:22",conv:75,p95:3.5},
  {t:"14:23",conv:74,p95:4.2},{t:"14:24",conv:74,p95:4.2},
];

const ERROR_DIST=[
  {h:"00h",e:12},{h:"02h",e:8},{h:"04h",e:5},{h:"06h",e:9},{h:"08h",e:22},
  {h:"10h",e:31},{h:"12h",e:28},{h:"14h",e:87},{h:"16h",e:45},{h:"18h",e:33},
  {h:"20h",e:19},{h:"22h",e:14},
];

const LATENCY_TREND=[
  {t:"13:50",p50:0.8,p95:1.1,p99:1.4},{t:"13:55",p50:0.9,p95:1.1,p99:1.5},
  {t:"14:00",p50:0.9,p95:1.2,p99:1.6},{t:"14:05",p50:1.0,p95:1.3,p99:1.9},
  {t:"14:10",p50:1.2,p95:1.5,p99:2.2},{t:"14:15",p50:1.5,p95:1.8,p99:2.8},
  {t:"14:20",p50:1.8,p95:2.1,p99:3.4},{t:"14:21",p50:2.4,p95:2.8,p99:4.1},
  {t:"14:22",p50:2.8,p95:3.5,p99:5.0},{t:"14:23",p50:3.1,p95:4.2,p99:5.8},
  {t:"14:24",p50:3.0,p95:4.2,p99:5.7},
];

const SLOS=[
  {name:"Checkout availability",target:"99.9%",current:"99.2%",ok:false,fill:99.2/99.9},
  {name:"Payment p95 < 2s",target:"95%",current:"11%",ok:false,fill:0.11},
  {name:"Error rate < 1%",target:"<1%",current:"0.4%",ok:true,fill:0.6},
];

const TIMELINE_EVENTS=[
  {time:"14:20",label:"Deploy payment-service v2.3.1",color:S.info},
  {time:"14:21",label:"Conversão começa a cair",color:S.critical},
  {time:"14:22",label:"Disk I/O em host-42 satura",color:S.warn},
  {time:"14:23",label:"Timeout em 89% das chamadas",color:S.critical},
  {time:"14:24",label:"PagerDuty disparado",color:S.muted},
];

const CAUSES=[
  {id:"c1",score:0.94,layer:"Serviço",headline:"payment-service respondendo 4× mais devagar",detail:"Avg 4.2s — baseline 1.1s. 89% das chamadas em timeout.",color:S.critical,icon:"⬡",
   spans:[{name:"POST /payments",dur:"4218ms",s:"error"},{name:"db.query payments",dur:"3901ms",s:"slow"}],
   logs:["[ERROR] connection timeout after 4000ms","[WARN] retry attempt 1/3 failed"],res:"payment-service · host-42 · us-east-1"},
  {id:"c2",score:0.71,layer:"Infra",headline:"Disco do host-42 saturado",detail:"Disk I/O em 98% — saturou 51s antes da degradação.",color:S.warn,icon:"▣",
   spans:[{name:"host-42 · /dev/sda1",dur:"—",s:"warn"}],
   logs:["[WARN] disk utilization > 95% on /dev/sda1"],res:"host-42 · us-east-1a"},
  {id:"c3",score:0.43,layer:"Deploy",headline:"Deploy 3 min antes pode estar relacionado",detail:"payment-service v2.3.1 foi ao ar às 14:20.",color:"#64748b",icon:"◈",
   spans:[],logs:["[INFO] Deployment payment-service:v2.3.1 completed"],res:"CI/CD · pipeline #4421"},
];

const HEALTH_MAP_DATA=[
  {domain:"Checkout & Payments",status:"critical",teams:[
    {name:"Conversão",status:"critical",metric:"74%",label:"Conv",delta:"−8pp",inc:2},
    {name:"Anti-Fraude",status:"ok",metric:"1.2%",label:"Block",delta:"+0.1%",inc:0},
    {name:"Wallet",status:"ok",metric:"99.8%",label:"Succ",delta:"0%",inc:0},
    {name:"Parcelamento",status:"degraded",metric:"89%",label:"Conv",delta:"−2pp",inc:1},
  ]},
  {domain:"Catálogo & Busca",status:"degraded",teams:[
    {name:"Busca",status:"degraded",metric:"1.8s",label:"p95",delta:"+400ms",inc:1},
    {name:"Recomendações",status:"ok",metric:"12%",label:"CTR",delta:"+0.5%",inc:0},
    {name:"Indexação",status:"ok",metric:"0.2s",label:"Lag",delta:"0%",inc:0},
    {name:"A/B Tests",status:"ok",metric:"100%",label:"Succ",delta:"0%",inc:0},
  ]},
  {domain:"Logística",status:"ok",teams:[
    {name:"Tracking",status:"ok",metric:"3%",label:"Delay",delta:"−0.5%",inc:0},
    {name:"Estoque",status:"ok",metric:"99.1%",label:"Acc",delta:"+0.1%",inc:0},
    {name:"Fulfillment",status:"ok",metric:"98.4%",label:"SLA",delta:"+0.3%",inc:0},
    {name:"Last-mile",status:"ok",metric:"96%",label:"OTD",delta:"+1%",inc:0},
  ]},
  {domain:"Usuários & Auth",status:"ok",teams:[
    {name:"Login",status:"ok",metric:"180ms",label:"p99",delta:"−10ms",inc:0},
    {name:"Perfil",status:"ok",metric:"100%",label:"Succ",delta:"0%",inc:0},
    {name:"KYC",status:"ok",metric:"94%",label:"Pass",delta:"+0.5%",inc:0},
    {name:"Notificações",status:"ok",metric:"98%",label:"Deliv",delta:"0%",inc:0},
  ]},
];

// ─── WIDGET DEFINITIONS ───────────────────────────────────────────────────────
const WIDGET_CATALOG = [
  { type:"stat",      label:"Stat",              icon:"◈", desc:"Valor único com delta e baseline",         sizes:["sm","md"] },
  { type:"conv_chart",label:"Negócio × Técnico", icon:"⟋", desc:"Correlação conversão/latência ao longo do tempo", sizes:["md","lg"] },
  { type:"latency",   label:"Latência (p50/p95/p99)", icon:"⟋", desc:"Tendência de latência por percentil",  sizes:["md","lg"] },
  { type:"error_dist",label:"Distribuição de Erros", icon:"▣", desc:"Histograma de erros por hora",          sizes:["md","lg"] },
  { type:"stack",     label:"Stack Vertical",    icon:"⬡", desc:"Causas identificadas com score causal",   sizes:["md","lg"] },
  { type:"timeline",  label:"Linha do Tempo",    icon:"—", desc:"Eventos e deploys recentes",               sizes:["md","lg"] },
  { type:"slo",       label:"SLO Tracker",       icon:"◉", desc:"Status dos SLOs do domínio",               sizes:["sm","md"] },
  { type:"heatmap",   label:"Health Map",        icon:"⊞", desc:"Grid de saúde dos times do domínio",      sizes:["lg"] },
  { type:"alert_list",label:"Alertas Ativos",    icon:"⚠", desc:"Lista de alertas em aberto",               sizes:["sm","md"] },
];

const SIZE_COLS = { sm:1, md:2, lg:3 };

// ─── DEFAULT DASHBOARD CONFIGS ────────────────────────────────────────────────
const INITIAL_DASHBOARDS = {
  checkout: [
    {id:"w1",type:"stat",    size:"sm", config:{label:"Conversão",   value:"74%",  delta:"−8pp", baseline:"82%",  bad:true}},
    {id:"w2",type:"stat",    size:"sm", config:{label:"Latência p95",value:"4.2s", delta:"+3.1s",baseline:"1.1s", bad:true}},
    {id:"w3",type:"stat",    size:"sm", config:{label:"Falhas payment",value:"89%",delta:"+87pp",baseline:"2%",   bad:true}},
    {id:"w4",type:"conv_chart",size:"lg",config:{}},
    {id:"w5",type:"timeline",size:"md", config:{}},
    {id:"w6",type:"stack",   size:"md", config:{}},
  ],
  catalog: [
    {id:"w1",type:"stat",    size:"sm", config:{label:"Latência p95",value:"1.8s", delta:"+400ms",baseline:"1.4s",bad:true}},
    {id:"w2",type:"stat",    size:"sm", config:{label:"CTR Busca",   value:"12%",  delta:"+0.5%", baseline:"11.5%",bad:false}},
    {id:"w3",type:"stat",    size:"sm", config:{label:"Zero Results",value:"3.2%", delta:"+0.2%", baseline:"3.0%", bad:false}},
    {id:"w4",type:"latency", size:"lg", config:{}},
    {id:"w5",type:"error_dist",size:"md",config:{}},
    {id:"w6",type:"slo",     size:"md", config:{}},
  ],
  logistics: [
    {id:"w1",type:"stat",    size:"sm", config:{label:"Taxa de Atraso",value:"3.0%",delta:"−0.5%",baseline:"3.5%",bad:false}},
    {id:"w2",type:"stat",    size:"sm", config:{label:"SLA",          value:"98.4%",delta:"+0.3%",baseline:"98%", bad:false}},
    {id:"w3",type:"stat",    size:"sm", config:{label:"OTD",          value:"96%",  delta:"+1%",  baseline:"95%", bad:false}},
    {id:"w4",type:"slo",     size:"md", config:{}},
    {id:"w5",type:"heatmap", size:"lg", config:{}},
  ],
};

// ─── CHART TOOLTIP ────────────────────────────────────────────────────────────
const CTip=({active,payload,label})=> !active||!payload?.length?null:(
  <div style={{background:S.surface2,border:`1px solid ${S.border2}`,borderRadius:7,padding:"8px 12px",fontFamily:S.sans}}>
    <p style={{margin:"0 0 4px",fontSize:10,color:S.muted,fontFamily:S.mono}}>{label}</p>
    {payload.map((p,i)=><p key={i} style={{margin:0,fontSize:12,color:p.color,fontWeight:600}}>{p.name}: {p.value}</p>)}
  </div>
);

// ─── WIDGET RENDERERS ─────────────────────────────────────────────────────────
function WidgetStat({config}){
  const{label,value,delta,baseline,bad}=config;
  return (
    <div style={{padding:"16px 18px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <p style={{margin:0,fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.09em",fontWeight:600,fontFamily:S.sans}}>{label}</p>
      <div>
        <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:4}}>
          <span style={{fontSize:28,fontWeight:700,color:bad?S.critical:S.ok,fontFamily:S.mono,letterSpacing:"-0.03em",lineHeight:1}}>{value}</span>
          <span style={{fontSize:12,color:bad?S.critical:S.ok,fontWeight:600,fontFamily:S.mono}}>{delta}</span>
        </div>
        <p style={{margin:0,fontSize:10,color:S.muted,fontFamily:S.sans}}>baseline {baseline}</p>
      </div>
    </div>
  );
}

function WidgetConvChart(){
  return (
    <div style={{padding:"14px 16px",height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10,flexWrap:"wrap"}}>
        <p style={{margin:0,fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>Negócio × Técnico</p>
        <div style={{display:"flex",gap:12}}>
          {[{c:S.critical,l:"% Conversão"},{c:S.info,l:"Latência p95"}].map(x=>(
            <div key={x.l} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:10,height:2,background:x.c,borderRadius:1}}/>
              <span style={{fontSize:9,color:S.muted,fontFamily:S.sans}}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,minHeight:0}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={CONV_CHART} margin={{top:4,right:4,bottom:0,left:-22}}>
            <XAxis dataKey="t" tick={{fontSize:9,fill:S.muted}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="c" domain={[70,85]} tick={{fontSize:9,fill:S.muted}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="p" orientation="right" domain={[0,5]} tick={{fontSize:9,fill:S.muted}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CTip/>}/>
            <ReferenceLine yAxisId="c" x="14:20" stroke={S.info} strokeDasharray="3 3" strokeOpacity={0.6} label={{value:"deploy",position:"top",fill:S.info,fontSize:8}}/>
            <Line yAxisId="c" type="monotone" dataKey="conv" name="conv" stroke={S.critical} strokeWidth={2} dot={false}/>
            <Line yAxisId="p" type="monotone" dataKey="p95" name="p95" stroke={S.info} strokeWidth={2} dot={false} strokeDasharray="4 2"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WidgetLatency(){
  return (
    <div style={{padding:"14px 16px",height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10,flexWrap:"wrap"}}>
        <p style={{margin:0,fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>Latência</p>
        <div style={{display:"flex",gap:12}}>
          {[{c:S.green,l:"p50"},{c:S.warn,l:"p95"},{c:S.critical,l:"p99"}].map(x=>(
            <div key={x.l} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:10,height:2,background:x.c,borderRadius:1}}/>
              <span style={{fontSize:9,color:S.muted,fontFamily:S.sans}}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,minHeight:0}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={LATENCY_TREND} margin={{top:4,right:4,bottom:0,left:-22}}>
            <defs>
              <linearGradient id="gp99" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={S.critical} stopOpacity={0.15}/><stop offset="95%" stopColor={S.critical} stopOpacity={0}/></linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{fontSize:9,fill:S.muted}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:S.muted}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="p99" name="p99" stroke={S.critical} strokeWidth={1.5} fill="url(#gp99)" dot={false}/>
            <Line type="monotone" dataKey="p95" name="p95" stroke={S.warn} strokeWidth={1.5} dot={false}/>
            <Line type="monotone" dataKey="p50" name="p50" stroke={S.green} strokeWidth={1.5} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WidgetErrorDist(){
  return (
    <div style={{padding:"14px 16px",height:"100%",display:"flex",flexDirection:"column"}}>
      <p style={{margin:"0 0 10px",fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>Distribuição de Erros / hora</p>
      <div style={{flex:1,minHeight:0}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ERROR_DIST} margin={{top:4,right:4,bottom:0,left:-22}}>
            <XAxis dataKey="h" tick={{fontSize:9,fill:S.muted}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:S.muted}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:S.surface2,border:`1px solid ${S.border2}`,borderRadius:6,fontFamily:S.sans,fontSize:11}} cursor={{fill:S.border2}}/>
            <Bar dataKey="e" name="erros" fill={S.critical} opacity={0.7} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WidgetStack(){
  const[open,setOpen]=useState(0);
  return (
    <div style={{padding:"14px 16px",height:"100%",overflowY:"auto"}}>
      <p style={{margin:"0 0 10px",fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>Stack Vertical · Causas</p>
      {CAUSES.map((c,i)=>{
        const isOpen=open===i;
        return (
          <div key={c.id} style={{marginBottom:6}}>
            <div onClick={()=>setOpen(isOpen?null:i)} style={{background:isOpen?S.surface3:S.surface2,border:`1px solid ${isOpen?c.color+"50":S.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:15,color:c.color,flexShrink:0}}>{c.icon}</span>
                <div style={{flex:1}}>
                  <div style={{marginBottom:2}}><span style={{fontSize:8,fontWeight:700,textTransform:"uppercase",color:c.color,background:c.color+"18",padding:"1px 5px",borderRadius:3,fontFamily:S.sans}}>{c.layer}</span></div>
                  <p style={{margin:"0 0 2px",fontSize:12,color:S.text,fontWeight:600,fontFamily:S.sans}}>{c.headline}</p>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:50,height:2.5,background:S.border2,borderRadius:2}}><div style={{width:`${c.score*100}%`,height:"100%",background:c.color}}/></div>
                    <span style={{fontSize:9,color:c.color,fontFamily:S.mono}}>{c.score.toFixed(2)}</span>
                    <span style={{fontSize:9,color:S.faint,fontFamily:S.sans}}>causal</span>
                  </div>
                </div>
                <span style={{color:S.muted,fontSize:13,transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
              </div>
              {isOpen&&(
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${S.border}`}}>
                  <p style={{margin:"0 0 2px",fontSize:9,color:S.muted,fontFamily:S.mono}}>{c.res}</p>
                  {c.logs.map((l,j)=><div key={j} style={{fontFamily:S.mono,fontSize:9,color:S.muted,padding:"3px 6px",background:"#07090b",borderRadius:3,marginBottom:2}}>{l}</div>)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WidgetTimeline(){
  return (
    <div style={{padding:"14px 16px",height:"100%"}}>
      <p style={{margin:"0 0 10px",fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>Linha do Tempo</p>
      <div style={{position:"relative",paddingLeft:12}}>
        <div style={{position:"absolute",left:4,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${S.green}40,${S.border})`}}/>
        {TIMELINE_EVENTS.map((e,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:e.color,marginLeft:-3,flexShrink:0,zIndex:1,position:"relative"}}/>
            <span style={{fontSize:10,fontFamily:S.mono,color:S.muted,minWidth:36}}>{e.time}</span>
            <span style={{fontSize:12,color:e.color===S.critical?"#fca5a5":S.muted,fontFamily:S.sans}}>{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetSlo(){
  return (
    <div style={{padding:"14px 16px",height:"100%"}}>
      <p style={{margin:"0 0 10px",fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>SLO Tracker</p>
      {SLOS.map((s,i)=>(
        <div key={i} style={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <Dot status={s.ok?"ok":"critical"} size={6}/>
            <span style={{flex:1,fontSize:12,color:S.text,fontFamily:S.sans}}>{s.name}</span>
            <span style={{fontSize:11,fontWeight:700,color:s.ok?S.ok:S.critical,fontFamily:S.mono}}>{s.current}</span>
            <span style={{fontSize:9,color:S.muted,fontFamily:S.mono}}>/ {s.target}</span>
          </div>
          <div style={{height:3,background:S.border2,borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${Math.min(s.fill*100,100)}%`,height:"100%",background:s.ok?S.ok:S.critical,transition:"width 0.4s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function WidgetHeatmap(){
  return (
    <div style={{padding:"14px 16px",height:"100%",overflowY:"auto"}}>
      <p style={{margin:"0 0 12px",fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>Health Map · Times</p>
      {HEALTH_MAP_DATA.map(row=>(
        <div key={row.domain} style={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
            <Dot status={row.status} size={6}/>
            <span style={{fontSize:11,fontWeight:600,color:S.muted,fontFamily:S.sans}}>{row.domain}</span>
            {row.status!=="ok"&&<span style={{fontSize:8,fontWeight:700,textTransform:"uppercase",color:SC[row.status],background:SC[row.status]+"18",padding:"1px 5px",borderRadius:3,fontFamily:S.sans}}>{SL[row.status]}</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {row.teams.map(t=>(
              <div key={t.name} style={{padding:"8px 10px",borderRadius:6,background:SC[t.status]+"0d",border:`1px solid ${SC[t.status]}25`}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                  <Dot status={t.status} size={5}/>
                  <span style={{fontSize:10,color:t.status==="ok"?S.muted:S.text,fontFamily:S.sans,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</span>
                  {t.inc>0&&<span style={{marginLeft:"auto",fontSize:9,color:SC[t.status],fontWeight:700,fontFamily:S.mono}}>{t.inc}</span>}
                </div>
                <span style={{fontSize:11,fontWeight:700,color:SC[t.status],fontFamily:S.mono}}>{t.metric}</span>
                <span style={{fontSize:9,color:t.delta.startsWith("−")||t.delta.startsWith("-")?S.warn:S.muted,marginLeft:4,fontFamily:S.mono}}>{t.delta}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WidgetAlertList(){
  const alerts=[
    {sev:"critical",msg:"payment-service: timeout rate > 80%",time:"2min atrás"},
    {sev:"critical",msg:"checkout conversion < 75%",time:"3min atrás"},
    {sev:"warn",msg:"host-42: disk I/O > 90%",time:"4min atrás"},
  ];
  return (
    <div style={{padding:"14px 16px",height:"100%"}}>
      <p style={{margin:"0 0 10px",fontSize:10,color:S.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:S.sans}}>Alertas Ativos</p>
      {alerts.map((a,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 10px",borderRadius:6,background:SC[a.sev]+"0d",border:`1px solid ${SC[a.sev]}25`,marginBottom:5}}>
          <Dot status={a.sev} pulse size={6} style={{marginTop:3}}/>
          <div style={{flex:1}}>
            <p style={{margin:0,fontSize:12,color:S.text,fontFamily:S.sans,lineHeight:1.4}}>{a.msg}</p>
            <p style={{margin:0,fontSize:10,color:S.muted,fontFamily:S.mono}}>{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const WIDGET_RENDERERS = {
  stat:       (w)=><WidgetStat config={w.config}/>,
  conv_chart: ()=><WidgetConvChart/>,
  latency:    ()=><WidgetLatency/>,
  error_dist: ()=><WidgetErrorDist/>,
  stack:      ()=><WidgetStack/>,
  timeline:   ()=><WidgetTimeline/>,
  slo:        ()=><WidgetSlo/>,
  heatmap:    ()=><WidgetHeatmap/>,
  alert_list: ()=><WidgetAlertList/>,
};

const WIDGET_HEIGHTS = {
  stat:120, conv_chart:200, latency:200, error_dist:180,
  stack:280, timeline:180, slo:160, heatmap:320, alert_list:160,
};

// ─── WIDGET PICKER MODAL ──────────────────────────────────────────────────────
function WidgetPicker({onAdd,onClose}){
  const[sel,setSel]=useState(null);
  const[size,setSize]=useState("md");
  const wDef=WIDGET_CATALOG.find(w=>w.type===sel);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:S.surface,border:`1px solid ${S.border2}`,borderRadius:14,padding:28,width:580,maxWidth:"92vw",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <StrataLogo size={20}/>
          <div>
            <h3 style={{margin:0,fontSize:14,fontWeight:700,color:S.text,fontFamily:S.sans}}>Adicionar Widget</h3>
            <p style={{margin:0,fontSize:11,color:S.muted,fontFamily:S.sans}}>Escolha um widget e configure o tamanho</p>
          </div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"transparent",border:"none",color:S.muted,fontSize:18,cursor:"pointer",lineHeight:1}}>×</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
          {WIDGET_CATALOG.map(w=>(
            <div key={w.type} onClick={()=>{setSel(w.type);setSize(w.sizes[1]||w.sizes[0]);}} style={{padding:"12px 14px",borderRadius:8,cursor:"pointer",background:sel===w.type?S.greenDim:S.surface2,border:`1px solid ${sel===w.type?S.greenMid:S.border2}`,transition:"all 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                <span style={{fontSize:14,color:sel===w.type?S.green:S.muted}}>{w.icon}</span>
                <span style={{fontSize:12,fontWeight:600,color:sel===w.type?S.text:S.muted,fontFamily:S.sans}}>{w.label}</span>
              </div>
              <p style={{margin:0,fontSize:10,color:S.muted,fontFamily:S.sans,lineHeight:1.4}}>{w.desc}</p>
            </div>
          ))}
        </div>

        {sel&&(
          <div style={{marginBottom:20,padding:"14px 16px",background:S.surface2,borderRadius:8,border:`1px solid ${S.border2}`}}>
            <p style={{margin:"0 0 8px",fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,fontFamily:S.sans}}>Tamanho do Widget</p>
            <div style={{display:"flex",gap:8}}>
              {(wDef?.sizes||["md"]).map(s=>(
                <div key={s} onClick={()=>setSize(s)} style={{flex:1,padding:"8px",borderRadius:6,cursor:"pointer",textAlign:"center",background:size===s?S.greenDim:"transparent",border:`1px solid ${size===s?S.greenMid:S.border2}`,transition:"all 0.15s"}}>
                  <div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:4}}>
                    {Array.from({length:SIZE_COLS[s]}).map((_,i)=>(
                      <div key={i} style={{height:8,flex:1,maxWidth:20,background:size===s?S.green:S.border2,borderRadius:2}}/>
                    ))}
                  </div>
                  <span style={{fontSize:10,color:size===s?S.green:S.muted,fontFamily:S.sans,fontWeight:600}}>{s==="sm"?"Pequeno":s==="md"?"Médio":"Grande"}</span>
                  <p style={{margin:"2px 0 0",fontSize:9,color:S.muted,fontFamily:S.sans}}>{SIZE_COLS[s]}/{3} colunas</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"8px 16px",borderRadius:7,border:`1px solid ${S.border2}`,background:"transparent",color:S.muted,fontSize:12,cursor:"pointer",fontFamily:S.sans}}>Cancelar</button>
          <button onClick={()=>{if(sel){onAdd({id:"w"+Date.now(),type:sel,size,config:{}});onClose();}}} disabled={!sel} style={{padding:"8px 16px",borderRadius:7,border:"none",background:sel?S.green:S.border2,color:sel?S.bg:S.muted,fontSize:12,fontWeight:700,cursor:sel?"pointer":"default",fontFamily:S.sans}}>
            Adicionar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD GRID ───────────────────────────────────────────────────────────
function DashboardGrid({widgets,editing,onRemove,onMoveUp,onMoveDown,onResize}){
  if(!widgets.length){
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:S.muted,textAlign:"center"}}>
        <span style={{fontSize:32,marginBottom:12,opacity:0.4}}>⊞</span>
        <p style={{margin:0,fontSize:14,fontFamily:S.sans}}>Dashboard vazio</p>
        <p style={{margin:"4px 0 0",fontSize:12,color:S.faint,fontFamily:S.sans}}>Clique em "Adicionar widget" para começar</p>
      </div>
    );
  }

  // Build rows: pack widgets into 3-col grid
  const rows=[];
  let row=[], cols=0;
  for(const w of widgets){
    const c=SIZE_COLS[w.size]||2;
    if(cols+c>3&&row.length){
      rows.push(row);
      row=[w]; cols=c;
    } else {
      row.push(w); cols+=c;
    }
  }
  if(row.length) rows.push(row);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {rows.map((row,ri)=>(
        <div key={ri} style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {row.map((w,wi)=>{
            const globalIdx=widgets.indexOf(w);
            const cols=SIZE_COLS[w.size]||2;
            const renderer=WIDGET_RENDERERS[w.type];
            const height=WIDGET_HEIGHTS[w.type]||160;
            const wDef=WIDGET_CATALOG.find(x=>x.type===w.type);
            return (
              <div key={w.id} style={{gridColumn:`span ${cols}`,background:S.surface,border:`1px solid ${editing?"#2a3f4a":S.border}`,borderRadius:10,overflow:"hidden",height,position:"relative",transition:"border-color 0.15s"}}>
                {editing&&(
                  <div style={{position:"absolute",top:0,left:0,right:0,zIndex:10,display:"flex",alignItems:"center",gap:4,padding:"4px 8px",background:"rgba(6,8,10,0.9)",borderBottom:`1px solid ${S.border2}`,backdropFilter:"blur(4px)"}}>
                    <span style={{fontSize:9,color:S.muted,fontFamily:S.sans,flex:1,fontWeight:600}}>{wDef?.label}</span>
                    {/* Resize */}
                    {(wDef?.sizes||["md"]).filter(s=>s!==w.size).map(s=>(
                      <button key={s} onClick={()=>onResize(w.id,s)} title={`Redimensionar para ${s}`} style={{padding:"2px 6px",fontSize:8,borderRadius:3,border:`1px solid ${S.border2}`,background:S.surface2,color:S.muted,cursor:"pointer",fontFamily:S.sans}}>
                        {s==="sm"?"↙":s==="md"?"↔":"↔↔"}
                      </button>
                    ))}
                    <button onClick={()=>onMoveUp(globalIdx)} disabled={globalIdx===0} title="Mover para cima" style={{padding:"2px 6px",fontSize:10,borderRadius:3,border:`1px solid ${S.border2}`,background:S.surface2,color:globalIdx===0?S.faint:S.muted,cursor:globalIdx===0?"default":"pointer"}}>↑</button>
                    <button onClick={()=>onMoveDown(globalIdx)} disabled={globalIdx===widgets.length-1} title="Mover para baixo" style={{padding:"2px 6px",fontSize:10,borderRadius:3,border:`1px solid ${S.border2}`,background:S.surface2,color:globalIdx===widgets.length-1?S.faint:S.muted,cursor:globalIdx===widgets.length-1?"default":"pointer"}}>↓</button>
                    <button onClick={()=>onRemove(w.id)} title="Remover widget" style={{padding:"2px 6px",fontSize:10,borderRadius:3,border:`1px solid ${S.critical}30`,background:S.critical+"12",color:S.critical,cursor:"pointer"}}>×</button>
                  </div>
                )}
                <div style={{height:"100%",paddingTop:editing?28:0,boxSizing:"border-box"}}>
                  {renderer?renderer(w):<div style={{padding:16,color:S.muted,fontFamily:S.sans,fontSize:12}}>Widget não disponível</div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN DASHBOARD VIEW ──────────────────────────────────────────────────────
function DashboardView({dashboards,onUpdate}){
  const[editing,setEditing]=useState(false);
  const[showPicker,setShowPicker]=useState(false);
  const[activeDomain,setActiveDomain]=useState("checkout");

  const widgets=dashboards[activeDomain]||[];
  const domainLabel=DOMAINS_TREE.find(d=>d.id===activeDomain)?.label||activeDomain;
  const domainStatus=DOMAINS_TREE.find(d=>d.id===activeDomain)?.status||"ok";

  const addWidget=(w)=>onUpdate(activeDomain,[...widgets,w]);
  const removeWidget=(id)=>onUpdate(activeDomain,widgets.filter(w=>w.id!==id));
  const moveUp=(i)=>{if(i===0)return;const a=[...widgets];[a[i-1],a[i]]=[a[i],a[i-1]];onUpdate(activeDomain,a);};
  const moveDown=(i)=>{if(i===widgets.length-1)return;const a=[...widgets];[a[i],a[i+1]]=[a[i+1],a[i]];onUpdate(activeDomain,a);};
  const resizeWidget=(id,size)=>onUpdate(activeDomain,widgets.map(w=>w.id===id?{...w,size}:w));

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {showPicker&&<WidgetPicker onAdd={addWidget} onClose={()=>setShowPicker(false)}/>}

      {/* Toolbar */}
      <div style={{padding:"12px 28px",borderBottom:`1px solid ${S.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,background:S.bg}}>
        {/* Domain tabs */}
        <div style={{display:"flex",gap:6,flex:1,flexWrap:"wrap"}}>
          {DOMAINS_TREE.map(d=>(
            <button key={d.id} onClick={()=>setActiveDomain(d.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:6,border:`1px solid ${activeDomain===d.id?SC[d.status]+"60":S.border}`,background:activeDomain===d.id?SC[d.status]+"10":S.surface,color:activeDomain===d.id?S.text:S.muted,fontSize:12,cursor:"pointer",fontFamily:S.sans,fontWeight:activeDomain===d.id?600:400,transition:"all 0.15s"}}>
              <Dot status={d.status} pulse={d.status==="critical"} size={6}/>
              {d.label}
            </button>
          ))}
        </div>
        {/* Actions */}
        {editing&&(
          <button onClick={()=>setShowPicker(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:7,border:`1px solid ${S.greenMid}`,background:S.greenDim,color:S.green,fontSize:12,cursor:"pointer",fontFamily:S.sans,fontWeight:600}}>
            + Adicionar widget
          </button>
        )}
        <button onClick={()=>setEditing(e=>!e)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:7,border:`1px solid ${editing?S.green:S.border2}`,background:editing?S.green:S.surface,color:editing?S.bg:S.muted,fontSize:12,cursor:"pointer",fontFamily:S.sans,fontWeight:editing?700:400,transition:"all 0.15s"}}>
          {editing?"✓ Salvar layout":"⊞ Editar dashboard"}
        </button>
      </div>

      {/* Dashboard header */}
      <div style={{padding:"16px 28px 0",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <Dot status={domainStatus} pulse={domainStatus==="critical"} size={8}/>
          {domainStatus!=="ok"&&<span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:SC[domainStatus],background:SC[domainStatus]+"18",padding:"2px 8px",borderRadius:4,letterSpacing:"0.09em",fontFamily:S.sans}}>{SL[domainStatus]}</span>}
          {editing&&<span style={{fontSize:10,color:S.green,background:S.greenDim,padding:"2px 8px",borderRadius:4,fontFamily:S.sans,border:`1px solid ${S.greenMid}`}}>⊞ Modo edição ativo</span>}
        </div>
        <h2 style={{margin:"0 0 2px",fontSize:18,fontWeight:700,color:S.text,fontFamily:S.sans,letterSpacing:"-0.02em"}}>{domainLabel}</h2>
        <p style={{margin:"0 0 14px",fontSize:11,color:S.muted,fontFamily:S.sans}}>{widgets.length} widgets · atualizado agora</p>
      </div>

      {/* Grid */}
      <div style={{flex:1,overflowY:"auto",padding:"0 28px 28px"}}>
        <DashboardGrid
          widgets={widgets}
          editing={editing}
          onRemove={removeWidget}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onResize={resizeWidget}
        />
      </div>
    </div>
  );
}

// ─── HEALTH MAP VIEW ─────────────────────────────────────────────────────────
function HealthMapView(){
  return (
    <div style={{flex:1,overflowY:"auto",padding:32}}>
      <div style={{marginBottom:24}}>
        <p style={{margin:"0 0 4px",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:S.muted,fontWeight:600,fontFamily:S.sans}}>Observabilidade</p>
        <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:700,color:S.text,fontFamily:S.sans,letterSpacing:"-0.02em"}}>Health Map</h2>
        <p style={{margin:0,fontSize:13,color:S.muted,fontFamily:S.sans}}>Visão cross-team · todos os domínios em tempo real</p>
      </div>
      {HEALTH_MAP_DATA.map(row=>(
        <div key={row.domain} style={{background:S.surface,borderRadius:12,padding:"18px 20px",border:`1px solid ${row.status!=="ok"?SC[row.status]+"30":S.border}`,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <Dot status={row.status} pulse={row.status==="critical"} size={8}/>
            <span style={{fontSize:14,fontWeight:700,color:S.text,fontFamily:S.sans}}>{row.domain}</span>
            {row.status!=="ok"&&<span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:SC[row.status],background:SC[row.status]+"18",padding:"2px 7px",borderRadius:3,letterSpacing:"0.06em",fontFamily:S.sans}}>{SL[row.status]}</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10}}>
            {row.teams.map(team=>(
              <div key={team.name} style={{padding:"12px 14px",borderRadius:8,background:SC[team.status]+"0d",border:`1px solid ${SC[team.status]}28`}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                  <Dot status={team.status} pulse={team.status==="critical"} size={6}/>
                  <span style={{fontSize:12,fontWeight:600,color:team.status==="ok"?S.muted:S.text,fontFamily:S.sans}}>{team.name}</span>
                  {team.inc>0&&<span style={{marginLeft:"auto",fontSize:9,color:SC[team.status],background:SC[team.status]+"20",padding:"1px 5px",borderRadius:3,fontWeight:700,fontFamily:S.mono}}>{team.inc}</span>}
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                  <span style={{fontSize:14,fontWeight:700,color:SC[team.status],fontFamily:S.mono}}>{team.metric}</span>
                  <span style={{fontSize:9,color:S.muted,fontFamily:S.sans}}>{team.label}</span>
                  <span style={{fontSize:10,color:team.delta.startsWith("−")||team.delta.startsWith("-")?S.warn:team.delta==="0%"?S.muted:S.ok,fontFamily:S.mono,marginLeft:2}}>{team.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({activeFeature,onSelect,activeView,onViewChange}){
  // FIX: use Set to allow multiple domains open simultaneously
  const[openDomains,setOpenDomains]=useState(new Set(["checkout"]));
  const[openTeams,setOpenTeams]=useState(new Set(["conversion"]));

  const toggleDomain=(id)=>setOpenDomains(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;});
  const toggleTeam=(id)=>setOpenTeams(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;});

  return (
    <div style={{width:230,borderRight:`1px solid ${S.border}`,display:"flex",flexDirection:"column",background:S.bg,flexShrink:0}}>
      <div style={{padding:"20px 16px 14px",borderBottom:`1px solid ${S.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <StrataLogo size={26}/>
          <span style={{fontSize:16,fontWeight:700,color:S.text,fontFamily:S.sans,letterSpacing:"-0.02em"}}>strata</span>
        </div>
        <p style={{margin:"6px 0 0",fontSize:10,color:S.muted,fontFamily:S.sans}}>See through every layer.</p>
      </div>

      <div style={{padding:"10px 10px 4px"}}>
        <p style={{margin:"0 8px 6px",fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",color:S.faint,fontWeight:700,fontFamily:S.sans}}>Observabilidade</p>
        {[{id:"dashboard",label:"Dashboards",icon:"⊞"},{id:"healthmap",label:"Health Map",icon:"⬡"}].map(v=>(
          <div key={v.id} onClick={()=>onViewChange(v.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:6,cursor:"pointer",marginBottom:2,background:activeView===v.id?S.surface2:"transparent",color:activeView===v.id?S.text:S.muted,fontSize:12,fontWeight:activeView===v.id?600:400,borderLeft:activeView===v.id?`2px solid ${S.green}`:"2px solid transparent",fontFamily:S.sans,transition:"all 0.1s"}}>
            <span style={{fontSize:10,color:activeView===v.id?S.green:S.muted}}>{v.icon}</span>{v.label}
          </div>
        ))}
      </div>

      <div style={{height:1,background:S.border,margin:"4px 0"}}/>

      <div style={{flex:1,overflowY:"auto",padding:"6px 8px"}}>
        <p style={{margin:"4px 8px 6px",fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",color:S.faint,fontWeight:700,fontFamily:S.sans}}>Seus Domínios</p>
        {DOMAINS_TREE.map(domain=>(
          <div key={domain.id}>
            <div onClick={()=>toggleDomain(domain.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:6,cursor:"pointer",marginBottom:1,background:openDomains.has(domain.id)?S.surface:"transparent"}}>
              <Dot status={domain.status}/>
              <span style={{flex:1,fontSize:11,color:S.muted,fontWeight:500,fontFamily:S.sans}}>{domain.label}</span>
              <span style={{fontSize:9,color:S.faint,transform:openDomains.has(domain.id)?"rotate(90deg)":"none",transition:"transform 0.15s"}}>›</span>
            </div>
            {openDomains.has(domain.id)&&domain.teams.map(team=>(
              <div key={team.id} style={{marginLeft:12,borderLeft:`1px solid ${S.border2}`,paddingLeft:8,marginBottom:2}}>
                <div onClick={()=>toggleTeam(team.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 6px",borderRadius:5,cursor:"pointer"}}>
                  <span style={{fontSize:10,color:S.muted,fontStyle:"italic",fontFamily:S.sans,flex:1}}>{team.label}</span>
                  <span style={{fontSize:9,color:S.faint,transform:openTeams.has(team.id)?"rotate(90deg)":"none",transition:"transform 0.15s"}}>›</span>
                </div>
                {openTeams.has(team.id)&&team.features.map(f=>(
                  <div key={f.id} onClick={()=>{onSelect(f.id);onViewChange("dashboard");}} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",borderRadius:5,cursor:"pointer",marginBottom:1,background:activeFeature===f.id?S.greenDim:"transparent",borderLeft:activeFeature===f.id?`2px solid ${SC[f.status]}`:"2px solid transparent"}}>
                    <Dot status={f.status} pulse={f.status==="critical"} size={6}/>
                    <span style={{flex:1,fontSize:11,fontFamily:S.mono,color:activeFeature===f.id?S.text:S.muted}}>{f.label}</span>
                    {f.status!=="ok"&&<span style={{fontSize:8,fontWeight:700,textTransform:"uppercase",color:SC[f.status],background:SC[f.status]+"18",padding:"1px 4px",borderRadius:3,fontFamily:S.sans}}>{SL[f.status]}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{padding:"11px 14px",borderTop:`1px solid ${S.border}`,display:"flex",alignItems:"center",gap:7}}>
        <StrataLogo size={14}/>
        <p style={{margin:0,fontSize:10,color:S.muted,fontFamily:S.sans}}>Powered by <span style={{color:S.green,fontWeight:600}}>OpenTelemetry</span></p>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function Strata(){
  const[activeFeature,setActiveFeature]=useState("checkout");
  const[activeView,setActiveView]=useState("dashboard");
  const[dashboards,setDashboards]=useState(INITIAL_DASHBOARDS);

  const updateDashboard=(domainId,widgets)=>setDashboards(d=>({...d,[domainId]:widgets}));

  return (
    <div style={{minHeight:"100vh",background:S.bg,display:"flex",fontFamily:S.sans,color:S.muted}}>
      <style>{`
        ${FONTS}
        @keyframes ripple{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.8);opacity:0}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${S.border2};border-radius:2px}
        button{transition:opacity 0.1s}
        button:hover:not(:disabled){opacity:0.82}
      `}</style>
      <Sidebar activeFeature={activeFeature} onSelect={setActiveFeature} activeView={activeView} onViewChange={setActiveView}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {activeView==="healthmap"
          ? <HealthMapView/>
          : <DashboardView dashboards={dashboards} onUpdate={updateDashboard}/>
        }
      </div>
    </div>
  );
}
