import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    const pts = Array.from({ length: 45 }, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4,
      r: Math.random()*2+.5, a: Math.random()*.55+.15,
    }));
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(147,197,253,${p.a})`; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<120){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(99,160,255,${.14*(1-d/120)})`;ctx.lineWidth=.8;ctx.stroke();}
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[]);
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>;
}

function Blob({color,style}:{color:string;style?:React.CSSProperties}){
  return <div className="lp-blob" style={{position:'absolute',borderRadius:'60% 40% 30% 70% / 60% 30% 70% 40%',background:color,filter:'blur(52px)',opacity:.16,pointerEvents:'none',...style}}/>;
}

function FloatingCard({style,icon,title,value,sub,delay=0}:{style?:React.CSSProperties;icon:React.ReactNode;title:string;value:string;sub:string;delay?:number}){
  return(
    <div className="lp-float-card" style={{position:'absolute',background:'rgba(255,255,255,0.07)',backdropFilter:'blur(14px)',border:'1px solid rgba(255,255,255,0.13)',borderRadius:14,padding:'14px 18px',display:'flex',alignItems:'center',gap:14,minWidth:215,animationDelay:`${delay}s`,...style}}>
      <div style={{width:38,height:38,borderRadius:10,background:'rgba(37,99,235,.4)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{icon}</div>
      <div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginBottom:2}}>{title}</div>
        <div style={{fontSize:17,fontWeight:700,color:'#fff',lineHeight:1}}>{value}</div>
        <div style={{fontSize:10.5,color:'rgba(255,255,255,.35)',marginTop:2}}>{sub}</div>
      </div>
    </div>
  );
}

function DTEIllustration(){
  return(
    <div className="lp-doc-wrap" style={{position:'relative',width:200,height:220,margin:'0 auto'}}>
      <svg viewBox="0 0 160 200" width="140" style={{position:'absolute',top:18,left:28,opacity:.22}} fill="none"><rect x="4" y="4" width="152" height="192" rx="10" fill="#1E40AF"/></svg>
      <svg viewBox="0 0 160 200" width="160" style={{position:'relative',zIndex:1,filter:'drop-shadow(0 14px 36px rgba(0,0,0,.5))'}} fill="none">
        <rect x="2" y="2" width="156" height="196" rx="10" fill="#0F2547" stroke="rgba(99,160,255,.3)" strokeWidth="1.5"/>
        <rect x="2" y="2" width="156" height="42" rx="10" fill="#1E3A6E"/>
        <rect x="2" y="32" width="156" height="12" fill="#1E3A6E"/>
        <rect x="14" y="12" width="22" height="22" rx="5" fill="#2563EB"/>
        <text x="25" y="27" textAnchor="middle" fontSize="13" fontWeight="800" fill="white">ε</text>
        <rect x="44" y="15" width="58" height="6" rx="3" fill="rgba(255,255,255,.6)"/>
        <rect x="44" y="25" width="38" height="4" rx="2" fill="rgba(255,255,255,.25)"/>
        <rect x="112" y="14" width="36" height="16" rx="4" fill="rgba(16,185,129,.25)" stroke="rgba(16,185,129,.5)" strokeWidth="1"/>
        <text x="130" y="25" textAnchor="middle" fontSize="7.5" fill="#6EE7B7" fontWeight="600">VÁLIDO</text>
        <rect x="14" y="56" width="42" height="4" rx="2" fill="rgba(255,255,255,.2)"/>
        <rect x="14" y="65" width="110" height="5" rx="2.5" fill="rgba(255,255,255,.5)"/>
        <rect x="14" y="75" width="85" height="4" rx="2" fill="rgba(255,255,255,.25)"/>
        <line x1="14" y1="90" x2="146" y2="90" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
        {[0,1,2].map(i=>(
          <g key={i}><rect x="14" y={100+i*18} width="70" height="4" rx="2" fill="rgba(255,255,255,.3)"/><rect x="110" y={100+i*18} width="36" height="4" rx="2" fill="rgba(99,160,255,.5)"/></g>
        ))}
        <rect x="80" y="158" width="66" height="20" rx="5" fill="rgba(37,99,235,.3)" stroke="rgba(99,160,255,.3)" strokeWidth="1"/>
        <text x="113" y="172" textAnchor="middle" fontSize="10" fill="#93C5FD" fontWeight="700">$1,247.50</text>
        <rect x="14" y="154" width="38" height="38" rx="4" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.15)" strokeWidth="1"/>
        <rect x="19" y="159" width="10" height="10" rx="1" fill="rgba(255,255,255,.3)"/>
        <rect x="31" y="159" width="10" height="10" rx="1" fill="rgba(255,255,255,.3)"/>
        <rect x="19" y="171" width="10" height="10" rx="1" fill="rgba(255,255,255,.3)"/>
        <rect x="31" y="171" width="4" height="4" rx="1" fill="rgba(255,255,255,.3)"/>
        <rect x="37" y="171" width="4" height="4" rx="1" fill="rgba(255,255,255,.3)"/>
        <rect x="25" y="175" width="4" height="4" rx="1" fill="rgba(255,255,255,.3)"/>
        <circle cx="128" cy="178" r="14" fill="rgba(37,99,235,.2)" stroke="rgba(99,160,255,.4)" strokeWidth="1.5" strokeDasharray="3 2"/>
        <text x="128" y="183" textAnchor="middle" fontSize="8" fill="#93C5FD" fontWeight="700">MH</text>
      </svg>
      <div className="lp-check-badge" style={{position:'absolute',top:-8,right:4,width:32,height:32,background:'#10B981',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'3px solid #0A1628',zIndex:2}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    </div>
  );
}

function useTypewriter(text:string,speed=52,delay=400){
  const [d,setD]=useState('');
  useEffect(()=>{
    setD('');let i=0;
    const t0=setTimeout(()=>{
      const iv=setInterval(()=>{ i++; setD(text.slice(0,i)); if(i>=text.length)clearInterval(iv); },speed);
      return ()=>clearInterval(iv);
    },delay);
    return ()=>clearTimeout(t0);
  },[text,speed,delay]);
  return d;
}

function RippleBtn({disabled,loading,children,style}:{disabled?:boolean;loading?:boolean;children:React.ReactNode;style?:React.CSSProperties}){
  const [ripples,setRipples]=useState<{x:number;y:number;id:number}[]>([]);
  const ref=useRef<HTMLButtonElement>(null);
  const click=(e:React.MouseEvent<HTMLButtonElement>)=>{
    if(disabled||loading)return;
    const r=ref.current!.getBoundingClientRect();
    const id=Date.now();
    setRipples(prev=>[...prev,{x:e.clientX-r.left,y:e.clientY-r.top,id}]);
    setTimeout(()=>setRipples(prev=>prev.filter(rr=>rr.id!==id)),700);
  };
  return(
    <button ref={ref} type="submit" disabled={!!disabled||!!loading} onClick={click} className="lp-submit" style={{position:'relative',overflow:'hidden',...style}}>
      {ripples.map(rp=><span key={rp.id} style={{position:'absolute',left:rp.x,top:rp.y,width:0,height:0,borderRadius:'50%',background:'rgba(255,255,255,.28)',transform:'translate(-50%,-50%)',animation:'lp-ripple .7s ease-out forwards',pointerEvents:'none'}}/>)}
      {children}
    </button>
  );
}

const ICO={
  doc:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6M9 16h6M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>,
  zap:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  user:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  lock:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  eye:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  arrow:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  alert:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

const DEMO=[
  {role:'Administrador',user:'admin',pass:'Admin123!',color:'#7C3AED'},
  {role:'Cajero',user:'cajero',pass:'Cajero123!',color:'#2563EB'},
  {role:'Supervisor',user:'supervisor',pass:'Supervisor123!',color:'#0891B2'},
  {role:'Contador',user:'contador',pass:'Contador123!',color:'#059669'},
];

export default function LoginPage(){
  const {login}=useAuth();
  const navigate=useNavigate();
  const location=useLocation();
  const from=(location.state as {from?:{pathname?:string}})?.from?.pathname??'/dashboard';

  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [showPwd,setShowPwd]=useState(false);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [focused,setFocused]=useState<'user'|'pwd'|null>(null);
  const [tick,setTick]=useState(0);
  const [mounted,setMounted]=useState(false);
  const [shake,setShake]=useState(false);

  const headline=useTypewriter('Bienvenido\nde vuelta',50,500);

  useEffect(()=>{const t=setInterval(()=>setTick(n=>n+1),3200);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setTimeout(()=>setMounted(true),80);return()=>clearTimeout(t);},[]);

  const stats=[['1,284','2,841','984','3,120'],['$98,420','$112,030','$74,850','$130,440']];

  const submit=useCallback(async(e:React.FormEvent)=>{
    e.preventDefault();setError('');setLoading(true);
    await new Promise(r=>setTimeout(r,700));
    const s=login(username,password);setLoading(false);
    if(!s){setError('Usuario o contraseña incorrectos.');setShake(true);setTimeout(()=>setShake(false),600);return;}
    navigate(from,{replace:true});
  },[username,password,login,navigate,from]);

  const fill=(u:string,p:string)=>{setUsername(u);setPassword(p);setError('');};

  const inp:React.CSSProperties={width:'100%',height:50,padding:'0 14px 0 46px',border:'1.5px solid #E2E8F0',borderRadius:12,fontFamily:"'Inter',system-ui,sans-serif",fontSize:14,color:'#1E293B',background:'#fff',outline:'none',boxSizing:'border-box',transition:'border-color .2s,box-shadow .2s'};

  return(<>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"/>
    <style>{`
      @keyframes lp-float  {0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
      @keyframes lp-float2 {0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-16px) rotate(1.5deg)}}
      @keyframes lp-pulse  {0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.14)}}
      @keyframes lp-spin   {to{transform:rotate(360deg)}}
      @keyframes lp-glow   {0%,100%{box-shadow:0 0 20px rgba(37,99,235,.35)}50%{box-shadow:0 0 44px rgba(79,70,229,.7)}}
      @keyframes lp-check  {from{transform:scale(0) rotate(-90deg)}to{transform:scale(1) rotate(0)}}
      @keyframes lp-shake  {0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
      @keyframes lp-ripple {to{width:400px;height:400px;opacity:0}}
      @keyframes lp-blob   {0%,100%{border-radius:60% 40% 30% 70% / 60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40% / 50% 60% 30% 60%}}
      @keyframes lp-shimmer{0%{left:-80%}100%{left:130%}}
      @keyframes lp-field  {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes lp-slideR {from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
      @keyframes lp-cursor {0%,100%{opacity:1}50%{opacity:0}}
      .lp-float-card{animation:lp-float 5s ease-in-out infinite}
      .lp-doc-wrap  {animation:lp-float2 6s ease-in-out infinite}
      .lp-check-badge{animation:lp-check .5s .8s cubic-bezier(.34,1.56,.64,1) both}
      .lp-blob      {animation:lp-blob 8s ease-in-out infinite}
      .lp-pill:hover{border-color:var(--pc)!important;background:color-mix(in srgb,var(--pc) 8%,white)!important;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08)!important}
      .lp-pill:hover .lp-pill-role{color:var(--pc)!important}
      .lp-pill{transition:border-color .15s,background .15s,transform .15s,box-shadow .15s!important}
      .lp-submit:not(:disabled)::after{content:'';position:absolute;top:0;left:-80%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:lp-shimmer 2.8s 1.5s ease-in-out infinite}
      .lp-submit:not(:disabled):hover{filter:brightness(1.1);box-shadow:0 8px 28px rgba(37,99,235,.55)!important;transform:translateY(-1px)}
      .lp-submit:not(:disabled):active{transform:translateY(1px)}
      .lp-submit{transition:filter .15s,box-shadow .2s,transform .12s!important}
      .lp-input-wrap input:focus{border-color:#2563EB!important;box-shadow:0 0 0 3.5px rgba(37,99,235,.14)!important}
      .lp-shake{animation:lp-shake .5s ease both}
      .lp-cursor::after{content:'|';animation:lp-cursor .9s step-end infinite;color:#2563EB;font-weight:300}
      @media(max-width:768px){.lp-brand{display:none!important}}
    `}</style>

    <div style={{display:'flex',minHeight:'100vh',fontFamily:"'Inter',system-ui,sans-serif",background:'#0A1628'}}>

      {/* LEFT */}
      <div className="lp-brand" style={{flex:'0 0 48%',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',padding:'44px 52px',background:'linear-gradient(140deg,#040d1e 0%,#0a1628 50%,#0d1f3c 100%)'}}>
        <ParticleCanvas/>
        <Blob color="radial-gradient(circle,#2563EB,#4F46E5)" style={{width:420,height:420,top:-120,left:-100,animationDuration:'9s'}}/>
        <Blob color="radial-gradient(circle,#7C3AED,#2563EB)" style={{width:300,height:300,bottom:-80,right:-60,animationDuration:'11s',animationDelay:'-4s'}}/>
        <Blob color="radial-gradient(circle,#10B981,#0891B2)" style={{width:200,height:200,top:'45%',right:'5%',animationDuration:'7s',animationDelay:'-2s'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(37,99,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.05) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'}}/>

        <div style={{position:'relative',zIndex:2,display:'flex',alignItems:'center',gap:14,marginBottom:52}}>
          <div style={{width:46,height:46,background:'linear-gradient(135deg,#2563EB,#4F46E5)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:24,color:'#fff',animation:'lp-glow 3s ease-in-out infinite'}}>ε</div>
          <div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:'#fff'}}>Grupo Epsilon</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2,letterSpacing:'.04em'}}>SISTEMA DE FACTURACIÓN ELECTRÓNICA</div>
          </div>
        </div>

        <div style={{position:'relative',zIndex:2,flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28}}>
          <DTEIllustration/>
          <FloatingCard style={{top:'14%',left:'-12px',animationDuration:'4.5s'}} icon={ICO.doc} title="DTEs emitidos hoy" value={stats[0][tick%4]} sub="Facturas + CCF + Nota de crédito" delay={0}/>
          <FloatingCard style={{bottom:'20%',right:'-8px',animationDuration:'5.5s'}} icon={ICO.zap} title="Monto procesado" value={stats[1][tick%4]} sub="Acumulado del período" delay={0.8}/>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)',borderRadius:999,padding:'7px 16px'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#10B981',animation:'lp-pulse 1.8s ease-in-out infinite'}}/>
            <span style={{fontSize:12,color:'#6EE7B7',fontWeight:600,letterSpacing:'.03em'}}>Servicio en línea · MH El Salvador</span>
          </div>
        </div>

        <div style={{position:'relative',zIndex:2,display:'flex',gap:20,paddingTop:28,borderTop:'1px solid rgba(255,255,255,.07)'}}>
          {[{icon:'🔐',label:'Cifrado TLS 1.3'},{icon:'📋',label:'DTE Reglamentado'},{icon:'🇸🇻',label:'MH El Salvador'}].map(t=>(
            <div key={t.label} style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:14}}>{t.icon}</span>
              <span style={{fontSize:11,color:'rgba(255,255,255,.35)',letterSpacing:'.03em'}}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{flex:1,background:'#F7F9FC',display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 40px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 80% 10%, rgba(37,99,235,.07) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(124,58,237,.05) 0%, transparent 50%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:280,height:280,borderRadius:'50%',border:'1.5px solid rgba(37,99,235,.08)',animation:'lp-float 8s ease-in-out infinite',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'-30px',right:'-30px',width:180,height:180,borderRadius:'50%',border:'1.5px solid rgba(37,99,235,.06)',animation:'lp-float 6s ease-in-out infinite .8s',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'-50px',left:'-50px',width:220,height:220,borderRadius:'50%',border:'1.5px solid rgba(124,58,237,.07)',animation:'lp-float 9s ease-in-out infinite 1.5s',pointerEvents:'none'}}/>

        <div style={{width:'100%',maxWidth:390,position:'relative',zIndex:1,opacity:mounted?1:0,transform:mounted?'none':'translateY(24px)',transition:'opacity .6s .1s ease,transform .6s .1s cubic-bezier(.22,.68,0,1.2)'}}>

          <div style={{marginBottom:32}}>
            <span style={{display:'inline-block',fontSize:11.5,fontWeight:700,color:'#2563EB',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10,background:'rgba(37,99,235,.08)',padding:'4px 10px',borderRadius:20,animation:'lp-slideR .5s .3s ease both',opacity:0}}>Portal de acceso</span>
            <h1 className="lp-cursor" style={{fontFamily:"'Sora',sans-serif",fontSize:30,fontWeight:800,color:'#0F172A',marginBottom:6,letterSpacing:'-.5px',lineHeight:1.2,whiteSpace:'pre-line',minHeight:74}}>{headline}</h1>
            <p style={{fontSize:14,color:'#64748B',lineHeight:1.6,margin:0,animation:'lp-field .5s .55s ease both',opacity:0}}>Ingresa tus credenciales para acceder al sistema de facturación.</p>
          </div>

          {error&&(
            <div className="lp-shake" style={{display:'flex',alignItems:'center',gap:8,background:'#FEF2F2',border:'1px solid rgba(239,68,68,.25)',borderRadius:10,padding:'11px 14px',fontSize:13,color:'#DC2626',marginBottom:20}}>
              {ICO.alert}<span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} noValidate className={shake?'lp-shake':''}>
            <div style={{marginBottom:18,animation:'lp-field .45s .4s ease both',opacity:0}}>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#1E293B',marginBottom:8}}>Usuario</label>
              <div className="lp-input-wrap" style={{position:'relative'}}>
                <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:focused==='user'?'#2563EB':'#94A3B8',transition:'color .2s',pointerEvents:'none'}}>{ICO.user}</span>
                <input type="text" placeholder="nombre de usuario" value={username} onChange={e=>setUsername(e.target.value)} required autoFocus autoComplete="username" autoCapitalize="none" spellCheck={false}
                  onFocus={()=>setFocused('user')} onBlur={()=>setFocused(null)}
                  style={{...inp,...(focused==='user'?{borderColor:'#2563EB',boxShadow:'0 0 0 3.5px rgba(37,99,235,.14)'}:{}),...(error?{borderColor:'#EF4444'}:{})}}/>
              </div>
            </div>

            <div style={{marginBottom:6,animation:'lp-field .45s .52s ease both',opacity:0}}>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#1E293B',marginBottom:8}}>Contraseña</label>
              <div className="lp-input-wrap" style={{position:'relative'}}>
                <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:focused==='pwd'?'#2563EB':'#94A3B8',transition:'color .2s',pointerEvents:'none'}}>{ICO.lock}</span>
                <input type={showPwd?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"
                  onFocus={()=>setFocused('pwd')} onBlur={()=>setFocused(null)}
                  style={{...inp,paddingRight:44,...(focused==='pwd'?{borderColor:'#2563EB',boxShadow:'0 0 0 3.5px rgba(37,99,235,.14)'}:{}),...(error?{borderColor:'#EF4444'}:{})}}/>
                <button type="button" onClick={()=>setShowPwd(s=>!s)} aria-label={showPwd?'Ocultar':'Mostrar'}
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94A3B8',padding:4,display:'flex',borderRadius:6,transition:'color .15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#475569')} onMouseLeave={e=>(e.currentTarget.style.color='#94A3B8')}>
                  {showPwd?ICO.eyeOff:ICO.eye}
                </button>
              </div>
            </div>

            <div style={{animation:'lp-field .45s .64s ease both',opacity:0}}>
              <RippleBtn disabled={loading} loading={loading}
                style={{width:'100%',height:52,background:'linear-gradient(135deg,#2563EB,#4F46E5)',color:'#fff',border:'none',borderRadius:13,fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,fontWeight:600,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:24,boxShadow:'0 4px 16px rgba(37,99,235,.42)',opacity:loading?.85:1} as React.CSSProperties}>
                {loading?<><span style={{width:18,height:18,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'lp-spin .7s linear infinite',display:'inline-block'}}/>Verificando...</>:<><span>Iniciar sesión</span>{ICO.arrow}</>}
              </RippleBtn>
            </div>
          </form>

          <div style={{marginTop:28,paddingTop:22,borderTop:'1px solid #E2E8F0',animation:'lp-field .45s .76s ease both',opacity:0}}>
            <p style={{fontSize:11.5,fontWeight:700,color:'#94A3B8',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
              Credenciales de demo<span style={{flex:1,height:1,background:'#E2E8F0'}}/>
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {DEMO.map((c,i)=>(
                <button key={c.user} type="button" className="lp-pill" onClick={()=>fill(c.user,c.pass)}
                  style={{['--pc' as string]:c.color,background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:10,padding:'10px 12px',cursor:'pointer',textAlign:'left',fontFamily:"'Inter',system-ui,sans-serif",animation:`lp-field .4s ${0.82+i*.06}s ease both`,opacity:0}}>
                  <span className="lp-pill-role" style={{display:'block',fontSize:11.5,fontWeight:700,color:c.color,marginBottom:3,letterSpacing:'.02em'}}>{c.role}</span>
                  <span style={{display:'block',fontSize:11.5,color:'#64748B',fontFamily:"'SFMono-Regular',Consolas,monospace"}}>{c.user}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{marginTop:20,display:'flex',alignItems:'flex-start',gap:8,padding:'10px 14px',background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',borderRadius:9,animation:'lp-field .45s 1.08s ease both',opacity:0}}>
            <span style={{fontSize:14,flexShrink:0,marginTop:1}}>⚠️</span>
            <p style={{fontSize:11.5,color:'#92400E',lineHeight:1.55,margin:0}}><strong>PROTOTIPO</strong> — DTE simulados. No constituye un sistema fiscal real ni tiene validez ante el Ministerio de Hacienda de El Salvador.</p>
          </div>
        </div>
      </div>
    </div>
  </>);
}
