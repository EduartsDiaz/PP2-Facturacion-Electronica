import React, { useEffect, useState } from 'react';

const ROLE_LABELS: Record<string, string> = {
  admin:'Administrador', cajero:'Cajero', supervisor:'Supervisor', contador:'Contador',
};
const ROLE_COLORS: Record<string, string> = {
  admin:      'linear-gradient(135deg,#7C3AED,#4F46E5)',
  cajero:     'linear-gradient(135deg,#2563EB,#0891B2)',
  supervisor: 'linear-gradient(135deg,#0891B2,#059669)',
  contador:   'linear-gradient(135deg,#059669,#16A34A)',
};

interface Props { name: string; role: string; onDone: () => void; }

export default function WelcomeOverlay({ name, role, onDone }: Props) {
  const [phase, setPhase] = useState<'in'|'hold'|'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 250);
    const t2 = setTimeout(() => setPhase('out'),  1400);
    const t3 = setTimeout(() => onDone(),          1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const bg      = ROLE_COLORS[role] ?? 'linear-gradient(135deg,#2563EB,#4F46E5)';
  const label   = ROLE_LABELS[role] ?? role;
  const initials = name.trim().split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('');
  const hour    = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  const visible = phase !== 'in';
  const exiting = phase === 'out';

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(10,22,40,.88)', backdropFilter:'blur(14px)',
      opacity: visible ? (exiting ? 0 : 1) : 0,
      transition:'opacity .4s ease',
    }}>
      <div style={{
        textAlign:'center', padding:'36px 52px', position:'relative',
        background:'#fff', borderRadius:24,
        boxShadow:'0 32px 80px rgba(0,0,0,.4)',
        transform: visible ? (exiting ? 'scale(.92) translateY(-8px)' : 'scale(1)') : 'scale(.84) translateY(16px)',
        transition:'transform .4s cubic-bezier(.34,1.4,.64,1), opacity .4s ease',
        opacity: visible ? (exiting ? 0 : 1) : 0,
        maxWidth:360, width:'90%', overflow:'hidden',
      }}>
        {/* Confetti dots */}
        {[...Array(8)].map((_,i) => (
          <div key={i} style={{
            position:'absolute',
            width: 7 + (i%3)*3, height: 7 + (i%3)*3, borderRadius:'50%',
            background: ['#2563EB','#7C3AED','#10B981','#F59E0B','#EC4899','#06B6D4','#EF4444','#6366F1'][i],
            left: `${10 + i*11}%`, top: `${8 + (i%4)*18}%`,
            opacity: visible && !exiting ? 0.3 : 0,
            transform: visible && !exiting ? 'scale(1)' : 'scale(0)',
            transition: `transform .5s ${0.1+i*0.05}s cubic-bezier(.34,1.5,.64,1), opacity .4s ${0.1+i*0.05}s`,
          }} />
        ))}

        {/* Avatar */}
        <div style={{
          width:72, height:72, borderRadius:'50%', background:bg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:26, fontWeight:800, color:'#fff', margin:'0 auto 14px',
          boxShadow:'0 8px 28px rgba(37,99,235,.45)',
          transform: visible && !exiting ? 'scale(1) translateY(0)' : 'scale(.5) translateY(-16px)',
          opacity: visible && !exiting ? 1 : 0,
          transition:'transform .45s .1s cubic-bezier(.34,1.5,.64,1), opacity .3s .1s',
        }}>
          {initials || 'U'}
        </div>

        <p style={{ fontSize:13, color:'#94A3B8', marginBottom:3, fontFamily:"'Inter',sans-serif",
          opacity: visible && !exiting ? 1 : 0, transform: visible && !exiting ? 'translateY(0)' : 'translateY(8px)',
          transition:'opacity .35s .18s, transform .35s .18s' }}>
          {greeting},
        </p>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22,
          color:'#0F172A', marginBottom:8, letterSpacing:'-.3px',
          opacity: visible && !exiting ? 1 : 0, transform: visible && !exiting ? 'translateY(0)' : 'translateY(8px)',
          transition:'opacity .35s .22s, transform .35s .22s' }}>
          {name}
        </h2>

        <span style={{ display:'inline-block', padding:'4px 14px', borderRadius:999,
          background:bg, color:'#fff', fontSize:12, fontWeight:600, letterSpacing:'.03em', marginBottom:20,
          opacity: visible && !exiting ? 1 : 0, transform: visible && !exiting ? 'scale(1)' : 'scale(.8)',
          transition:'opacity .3s .28s, transform .3s .28s cubic-bezier(.34,1.4,.64,1)' }}>
          {label}
        </span>

        <div style={{ display:'flex', justifyContent:'center' }}>
          <svg width="42" height="42" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21" fill="none" stroke="#E2E8F0" strokeWidth="2.5"/>
            <circle cx="24" cy="24" r="21" fill="none" stroke="#10B981" strokeWidth="2.5"
              strokeDasharray="132" strokeDashoffset={visible && !exiting ? 0 : 132}
              strokeLinecap="round"
              style={{ transition:'stroke-dashoffset .6s .3s ease', transformOrigin:'center', transform:'rotate(-90deg)' }}/>
            <polyline points="14,24 21,31 34,17" fill="none" stroke="#10B981" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray:30, strokeDashoffset: visible && !exiting ? 0 : 30,
                transition:'stroke-dashoffset .4s .6s ease' }}/>
          </svg>
        </div>

        <p style={{ fontSize:11.5, color:'#CBD5E1', marginTop:12, fontFamily:"'Inter',sans-serif",
          opacity: visible && !exiting ? 1 : 0, transition:'opacity .3s .35s' }}>
          Sistema de Ventas y Facturación Electrónica
        </p>
      </div>
    </div>
  );
}
