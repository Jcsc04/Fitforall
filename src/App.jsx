import React, { useState, useEffect, useRef } from "react";

// ─── Fonts & Global Styles ────────────────────────────────────────────────────
(function() {
  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap";
  document.head.appendChild(fl);
  const gs = document.createElement("style");
  gs.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { --bg:#0a0a0a;--card:#141414;--acc:#7c3aed;--a2:#e8291e;--a3:#9333ea;--a4:#7c3aed;--txt:#f5f5f5;--mut:#666666;--tr:#e8291e;--gr:#9333ea;--yw:#9333ea;--rd:#e8291e;--r:14px;--fd:'Orbitron',sans-serif;--fb:'Inter',sans-serif;--fm:'Space Mono',monospace; }
body { background:var(--bg);color:var(--txt);font-family:var(--fb);overflow-x:hidden; }
::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pop{from{transform:scale(.88);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:3px;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;cursor:pointer;border:2px solid var(--bg)}
select{-webkit-appearance:none} textarea{resize:none}
.glass{background:rgba(10,10,10,.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}.card-hover:active{transform:scale(.98)}`;
  document.head.appendChild(gs);
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const IMG = {
  splash:   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=70",
  trainer:  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=70",
  free:     "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=70",
  pro:      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=70",
  food:     "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=70",
  workout:  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=70",
  recovery: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=70",
};

// ─── Member Plans ─────────────────────────────────────────────────────────────
const MEMBER_PLANS = {
  free: { id:"free", name:"FREE TRIAL", price:"$0", period:"30 days", color:"var(--a3)", limits:{ai:2,days:30},
    features:[{l:"AI Coach",d:"2/day",y:1},{l:"2-week Program",d:"",y:1},{l:"Nutrition Hub",d:"Full",y:1},{l:"Wearables",d:"Full",y:1},{l:"Unlimited AI",d:"",y:0},{l:"4-week Program",d:"",y:0}] },
  pro:  { id:"pro",  name:"PRO",        price:"$4.99", period:"/month", color:"var(--acc)", limits:{ai:Infinity,days:Infinity},
    features:[{l:"Unlimited AI",d:"Every day",y:1},{l:"4-week Programs",d:"Progressive",y:1},{l:"Nutrition Hub",d:"Full",y:1},{l:"Wearables",d:"Full",y:1},{l:"Priority Support",d:"",y:1},{l:"Early Access",d:"",y:1}] },
};

// ─── Trainer Plans ────────────────────────────────────────────────────────────
const TRAINER_PLANS = {
  free:      { id:"free",      name:"FREE",      price:"$0",     period:"forever", color:"var(--a3)",  clientLimit:1 },
  starter:   { id:"starter",   name:"STARTER",   price:"$4.99",  period:"/month",  color:"var(--acc)", clientLimit:5 },
  pro:       { id:"pro",       name:"PRO",        price:"$6.99",  period:"/month",  color:"var(--a4)",  clientLimit:10 },
  unlimited: { id:"unlimited", name:"UNLIMITED",  price:"$14.99", period:"/month",  color:"var(--tr)",  clientLimit:Infinity },
};
const TP_FEATURES = {
  free:      [{l:"1 Client",d:"free forever",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"More clients",d:"",y:0}],
  starter:   [{l:"Up to 5 clients",d:"$4.99/mo",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"Priority support",d:"",y:1}],
  pro:       [{l:"Up to 10 clients",d:"$6.99/mo",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"Priority support",d:"",y:1}],
  unlimited: [{l:"Unlimited clients",d:"$14.99/mo",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"Priority support",d:"",y:1}],
};
const PROMO_CODES = {
  "FIT2ALL50":     { discount:50,  label:"50% off first month" },
  "TRAINERLAUNCH": { discount:100, label:"1 month FREE" },
  "STARTER10":     { discount:10,  label:"10% off" },
  "PRO20":         { discount:20,  label:"20% off" },
  "UNLIMITED30":   { discount:30,  label:"30% off" },
  "PROFREE":       { discount:100, label:"Pro — 1 month FREE" },
  "UNLIMITEDFREE": { discount:100, label:"Unlimited — 1 month FREE" },
};
const applyPromo = code => PROMO_CODES[code.trim().toUpperCase()] || null;
// ─── Owner Access ─────────────────────────────────────────────────────────────
const OWNER = { name:"Joao", email:"Jcsc04@gmail.com", password:"Fit2All2024" };



// ─── Storage ──────────────────────────────────────────────────────────────────
const store = {
  get: key => { try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { sessionStorage.setItem(key, JSON.stringify(val)); } catch {} },
};
const loadMemberSub = () => store.get("f2a_mem");
const saveMemberSub = s => store.set("f2a_mem", s);
const mkMemberSub = id => { const s = { id, start: new Date().toISOString(), aiToday: 0, aiDate: new Date().toDateString() }; saveMemberSub(s); return s; };
const loadTrainerSub = () => store.get("f2a_tr");
const saveTrainerSub = s => store.set("f2a_tr", s);
const mkTrainerSub = id => { const s = { id, start: new Date().toISOString() }; saveTrainerSub(s); return s; };

function getMemberCtx(sub, setSub) {
  if (!sub) return null;
  const plan = MEMBER_PLANS[sub.id] || MEMBER_PLANS.free;
  const today = new Date().toDateString();
  const used = sub.aiDate === today ? (sub.aiToday || 0) : 0;
  return {
    plan,
    canAsk: () => plan.limits.ai === Infinity || used < plan.limits.ai,
    aiLeft: () => plan.limits.ai === Infinity ? Infinity : Math.max(0, plan.limits.ai - used),
    recAsk: () => { const u = { ...sub, aiToday: used + 1, aiDate: today }; setSub(u); saveMemberSub(u); },
    expired: () => plan.limits.days !== Infinity && Math.floor((Date.now() - new Date(sub.start)) / 86400000) >= plan.limits.days,
    daysLeft: () => Math.max(0, plan.limits.days - Math.floor((Date.now() - new Date(sub.start)) / 86400000)),
  };
}
const getTrainerPlan = sub => TRAINER_PLANS[(sub && sub.id) || "free"] || TRAINER_PLANS.free;

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
const S = {
  card: { background:"rgba(20,20,20,.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"var(--r)" },
  mono: { fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"2px", color:"var(--mut)" },
};

function Card({ children, style, accent, onClick }) {
  return <div onClick={onClick} style={{ ...S.card, ...(accent ? { border:`1px solid ${accent}` } : {}), ...style }}>{children}</div>;
}
function Mono({ children, style }) {
  return <div style={{ ...S.mono, ...style }}>{children}</div>;
}
function HeroBg({ src, ov, style, children }) {
  return (
    <div style={{ position:"relative", overflow:"hidden", ...style }}>
      <img src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0, filter:"brightness(.5) saturate(.7)" }} />
      <div style={{ position:"absolute", inset:0, background:ov||"rgba(10,10,10,.7)", zIndex:1 }} />
      <div style={{ position:"relative", zIndex:2 }}>{children}</div>
    </div>
  );
}
function Field({ lbl, val, set, ph, acc, type, rows }) {
  const [f, sf] = useState(false);
  const c = acc || "var(--acc)";
  const s = { width:"100%", padding:"12px 14px", background:"rgba(255,255,255,.04)", border:`1px solid ${f?c:"rgba(255,255,255,.08)"}`, borderRadius:"10px", color:"var(--txt)", fontSize:"14px", fontFamily:"var(--fb)", outline:"none" };
  return (
    <div>
      <Mono style={{ marginBottom:"7px", color:f?c:"var(--mut)" }}>{lbl}</Mono>
      {rows
        ? <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{ ...s, lineHeight:1.5 }} />
        : <input type={type||"text"} value={val} onChange={e=>set(e.target.value)} placeholder={ph} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={s} />
      }
    </div>
  );
}
function Sheet({ onClose, title, acc, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:400, animation:"fadeIn .2s" }} onClick={onClose}>
      <div className="glass" style={{ borderRadius:"22px 22px 0 0", padding:"22px 20px 44px", width:"100%", maxWidth:"480px", animation:"slideUp .3s", maxHeight:"92vh", overflowY:"auto", border:"1px solid rgba(255,255,255,.1)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"18px", letterSpacing:"2px", color:acc||"var(--acc)" }}>{title}</div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"5px 11px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function PBtn({ onClick, children, col, disabled, style }) {
  const bg = col || "var(--acc)";
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:"100%", padding:"14px", background:disabled?"rgba(255,255,255,.08)":bg, border:"none", borderRadius:"var(--r)", color:disabled?"var(--mut)":"#000", cursor:disabled?"default":"pointer", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", ...style }}>
      {children}
    </button>
  );
}
function Dot({ col }) {
  return <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:col||"var(--acc)", animation:"pulse 2s infinite", flexShrink:0 }} />;
}
function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ position:"absolute", top:"14px", left:"14px", background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"8px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"6px 11px", fontSize:"11px", fontFamily:"var(--fm)" }}>← BACK</button>;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size, col, anim }) {
  const sz = size || 60, c = col || "var(--acc)";
  return (
    <svg width={sz} height={sz} viewBox="0 0 80 80" fill="none" style={{ display:"block", flexShrink:0 }}>
      <circle cx="40" cy="40" r="33" stroke={c} strokeWidth="2" opacity=".22"/>
      <polyline points="6,40 16,40 21,22 27,58 32,30 37,50 40,40 49,40 54,26 60,54 65,40 74,40" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" style={anim?{animation:"pulse 2s infinite"}:{}}/>
      <circle cx="40" cy="40" r="3.5" fill={c}/>
    </svg>
  );
}
function Wordmark({ size, col }) {
  const sz = size || 36, c = col || "var(--acc)";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
      <Logo size={sz} col={c} />
      <div style={{ fontFamily:"var(--fd)", fontSize:sz*.54+"px", fontWeight:900, letterSpacing:"3px", color:c, lineHeight:1, whiteSpace:"nowrap" }}>
        FIT<span style={{ color:"var(--rd)" }}>2</span>ALL
      </div>
    </div>
  );
}

// ─── PayPal ───────────────────────────────────────────────────────────────────
const PP_EMAIL = "jcsc0912@hotmail.com";
function PayPalLogo() {
  return <span style={{ fontFamily:"Arial,sans-serif", fontWeight:900, fontSize:"19px" }}><span style={{ color:"#7c3aed" }}>Pay</span><span style={{ color:"#003087" }}>Pal</span></span>;
}
function PayPalModal({ planName, amount, onSuccess, onClose }) {
  const [step, setStep] = useState("choose");   // choose | paypal | card | cardForm | loading | done
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  function fmtCard(v) { return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim(); }
  function fmtExp(v) { const d = v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; }

  function payPP() {
    if (!name.trim()||!email.trim()) return;
    setStep("loading");
    window.open("https://www.paypal.com/paypalme/jcsc0912/"+amount+"USD","_blank");
    setTimeout(()=>setStep("done"),2000);
  }
  function payCard() {
    if (!cardNum||!cardExp||!cardCvc||!cardName) return;
    setStep("loading");
    setTimeout(()=>setStep("done"),2200);
  }

  const PlanSummary = () => (
    <Card style={{ padding:"13px", marginBottom:"4px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:"14px", fontWeight:600 }}>{planName}</span>
        <span style={{ fontFamily:"var(--fd)", fontSize:"22px", color:"var(--acc)" }}>${amount}<span style={{ fontSize:"12px", color:"var(--mut)", fontFamily:"var(--fb)" }}>/mo</span></span>
      </div>
      <Mono style={{ marginTop:"3px" }}>BILLED MONTHLY · CANCEL ANYTIME</Mono>
    </Card>
  );

  return (
    <Sheet onClose={onClose} title="PAYMENT" acc="var(--acc)">
      {/* ── CHOOSE METHOD ── */}
      {step==="choose" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
          <PlanSummary/>
          <Mono style={{ marginTop:"4px" }}>SELECT PAYMENT METHOD</Mono>
          <button onClick={()=>setStep("paypal")} style={{ width:"100%", padding:"15px 16px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.25)", borderRadius:"14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"14px", textAlign:"left" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontWeight:900, fontSize:"22px", flexShrink:0 }}><span style={{ color:"#7c3aed" }}>Pay</span><span style={{ color:"#003087" }}>Pal</span></div>
            <div><div style={{ fontSize:"14px", color:"var(--txt)", fontWeight:600, marginBottom:"2px" }}>PayPal</div><div style={{ fontSize:"11px", color:"rgba(255,255,255,.45)" }}>Pay securely with your PayPal account</div></div>
            <div style={{ marginLeft:"auto", color:"var(--mut)", fontSize:"18px" }}>›</div>
          </button>
          <button onClick={()=>setStep("cardForm")} style={{ width:"100%", padding:"15px 16px", background:"rgba(124,58,237,.06)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"14px", textAlign:"left" }}>
            <div style={{ width:"36px", height:"26px", background:"linear-gradient(135deg,#111111,#111111)", border:"1px solid rgba(124,58,237,.3)", borderRadius:"5px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>💳</div>
            <div><div style={{ fontSize:"14px", color:"var(--txt)", fontWeight:600, marginBottom:"2px" }}>Card Payment</div><div style={{ fontSize:"11px", color:"rgba(255,255,255,.45)" }}>Debit or credit card — coming soon</div></div>
            <div style={{ marginLeft:"auto", color:"var(--mut)", fontSize:"18px" }}>›</div>
          </button>
        </div>
      )}

      {/* ── PAYPAL FORM ── */}
      {step==="paypal" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <button onClick={()=>setStep("choose")} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fm)", textAlign:"left", letterSpacing:"1px" }}>← BACK</button>
          <PlanSummary/>
          <Field lbl="YOUR NAME" val={name} set={setName} ph="Full name" acc="#7c3aed"/>
          <Field lbl="YOUR EMAIL" val={email} set={setEmail} ph="your@email.com" acc="#7c3aed" type="email"/>
          <button onClick={payPP} disabled={!name.trim()||!email.trim()} style={{ width:"100%", padding:"14px", background:name.trim()&&email.trim()?"#7c3aed":"rgba(255,255,255,.08)", border:"none", borderRadius:"12px", color:"#fff", cursor:name.trim()&&email.trim()?"pointer":"default", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px" }}>
            <span style={{ fontFamily:"Arial,sans-serif", fontWeight:900 }}><span style={{ color:"#fff" }}>Pay</span><span style={{ color:"rgba(255,255,255,.7)" }}>Pal</span></span> — ${amount}/mo
          </button>
          <Mono style={{ textAlign:"center" }}>Redirects to PayPal · {PP_EMAIL}</Mono>
        </div>
      )}

      {/* ── CARD FORM ── */}
      {step==="cardForm" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <button onClick={()=>setStep("choose")} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fm)", textAlign:"left", letterSpacing:"1px" }}>← BACK</button>
          <PlanSummary/>
          <div style={{ padding:"12px 14px", background:"rgba(255,140,0,.07)", border:"1px solid rgba(255,140,0,.25)", borderRadius:"10px", fontSize:"12px", color:"var(--yw)", lineHeight:1.6 }}>
            💳 Card payment is coming soon. Enter your details below and we'll process your payment manually within 24 hours.
          </div>
          <Field lbl="NAME ON CARD" val={cardName} set={setCardName} ph="Full name as on card" acc="var(--acc)"/>
          <div>
            <Mono style={{ marginBottom:"7px" }}>CARD NUMBER</Mono>
            <input value={cardNum} onChange={e=>setCardNum(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" inputMode="numeric" style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--txt)", fontSize:"15px", fontFamily:"var(--fm)", outline:"none", letterSpacing:"2px" }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div>
              <Mono style={{ marginBottom:"7px" }}>EXPIRY</Mono>
              <input value={cardExp} onChange={e=>setCardExp(fmtExp(e.target.value))} placeholder="MM/YY" inputMode="numeric" style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--txt)", fontSize:"15px", fontFamily:"var(--fm)", outline:"none", letterSpacing:"2px" }}/>
            </div>
            <div>
              <Mono style={{ marginBottom:"7px" }}>CVC</Mono>
              <input value={cardCvc} onChange={e=>setCardCvc(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" inputMode="numeric" style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--txt)", fontSize:"15px", fontFamily:"var(--fm)", outline:"none", letterSpacing:"2px" }}/>
            </div>
          </div>
          <Field lbl="EMAIL FOR RECEIPT" val={email} set={setEmail} ph="your@email.com" acc="var(--acc)" type="email"/>
          <button onClick={payCard} disabled={!cardNum||!cardExp||!cardCvc||!cardName||!email} style={{ width:"100%", padding:"14px", background:cardNum&&cardExp&&cardCvc&&cardName&&email?"var(--acc)":"rgba(255,255,255,.08)", border:"none", borderRadius:"12px", color:cardNum&&cardExp&&cardCvc&&cardName&&email?"#000":"var(--mut)", cursor:cardNum&&cardExp&&cardCvc&&cardName&&email?"pointer":"default", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px" }}>
            💳 PAY ${amount}/mo
          </button>
          <Mono style={{ textAlign:"center" }}>256-bit encrypted · Your details are secure</Mono>
        </div>
      )}

      {step==="loading" && (
        <div style={{ textAlign:"center", padding:"32px 0" }}>
          <div style={{ width:"50px", height:"50px", borderRadius:"50%", border:"3px solid var(--acc)", borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 16px" }}/>
          <div style={{ fontFamily:"var(--fd)", fontSize:"17px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"6px" }}>PROCESSING</div>
          <p style={{ fontSize:"12px", color:"var(--mut)" }}>Please wait...</p>
        </div>
      )}

      {step==="done" && (
        <div style={{ textAlign:"center", padding:"24px 0" }}>
          <div style={{ fontSize:"50px", marginBottom:"12px", animation:"pop .4s" }}>🎉</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"8px" }}>PAYMENT RECEIVED</div>
          <p style={{ fontSize:"13px", color:"var(--mut)", lineHeight:1.7, marginBottom:"18px" }}>Your plan is being activated.<br/>You'll receive a confirmation shortly.</p>
          <PBtn onClick={()=>{ onSuccess(); onClose(); }} style={{ color:"#000" }}>⚡ ACTIVATE MY PLAN</PBtn>
        </div>
      )}
    </Sheet>
  );
}

// ─── Admin System ─────────────────────────────────────────────────────────────
const ADMIN_PASS = "Fit2AllAdmin2024";

// Demo data representing real users in the system
const ADMIN_DATA = {
  trainers: [
    { id:"t1", name:"Coach Alex",    email:"alex@fit2all.com",    plan:"starter",   clients:3,  joined:"Jan 2025", status:"active" },
    { id:"t2", name:"Maria Santos",  email:"maria@fit2all.com",   plan:"pro",       clients:8,  joined:"Feb 2025", status:"active" },
    { id:"t3", name:"James Kirk",    email:"james@fit2all.com",   plan:"free",      clients:1,  joined:"Mar 2025", status:"active" },
    { id:"t4", name:"Priya Patel",   email:"priya@fit2all.com",   plan:"unlimited", clients:24, joined:"Dec 2024", status:"active" },
  ],
  trainerClients: {
    t1: [{ name:"Marcus Webb", goal:"Muscle Gain", sessions:12, progress:72 },{ name:"Sofia Chen", goal:"Fat Loss", sessions:8, progress:45 },{ name:"Jake Torres", goal:"Endurance", sessions:20, progress:88 }],
    t2: [{ name:"Riley Adams", goal:"Sport Perf.", sessions:15, progress:60 },{ name:"Noah Kim", goal:"Muscle Gain", sessions:6, progress:30 }],
    t3: [{ name:"Priya Nair", goal:"Flexibility", sessions:6, progress:30 }],
    t4: [],
  },
  members: [
    { id:"m1", name:"Alex Johnson", email:"alex@gmail.com",   plan:"pro",  goal:"Muscle Gain", joined:"Feb 2025", status:"active" },
    { id:"m2", name:"Sophie Lee",   email:"sophie@gmail.com", plan:"free", goal:"Fat Loss",    joined:"Mar 2025", status:"active" },
    { id:"m3", name:"David Chen",   email:"david@gmail.com",  plan:"free", goal:"Endurance",   joined:"Mar 2025", status:"trial_expired" },
    { id:"m4", name:"Emma Wilson",  email:"emma@gmail.com",   plan:"pro",  goal:"Flexibility", joined:"Jan 2025", status:"active" },
    { id:"m5", name:"Carlos Rivera",email:"carlos@gmail.com", plan:"free", goal:"Gen. Fitness",joined:"Mar 2025", status:"active" },
  ],
};

const PC = { free:"var(--mut)", starter:"var(--acc)", pro:"var(--a4)", unlimited:"var(--rd)", active:"var(--gr)", suspended:"var(--a2)", trial_expired:"var(--yw)" };

function AdminLogin({ onLogin, onClose }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  function attempt() {
    if (pw === ADMIN_PASS) { onLogin(); }
    else { setErr("Incorrect password"); setPw(""); setTimeout(() => setErr(""), 2500); }
  }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.97)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, animation:"fadeIn .3s" }}>
      <div style={{ width:"300px", padding:"30px 26px", background:"rgba(15,15,15,.98)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"20px", animation:"pop .3s", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:"14px", right:"14px", background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:"16px" }}>✕</button>
        <div style={{ textAlign:"center", marginBottom:"26px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"13px", background:"rgba(232,41,74,.15)", border:"1px solid rgba(232,41,74,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:"22px" }}>🔐</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"17px", letterSpacing:"3px", color:"var(--rd)", marginBottom:"3px" }}>ADMIN ACCESS</div>
          <Mono style={{ textAlign:"center" }}>FIT2ALL CONTROL PANEL</Mono>
        </div>
        <div style={{ marginBottom:"13px" }}>
          <Mono style={{ marginBottom:"7px" }}>PASSWORD</Mono>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="Enter admin password" autoFocus style={{ width:"100%", padding:"12px 38px 12px 13px", background:"rgba(255,255,255,.05)", border:"1px solid "+(err?"var(--rd)":"rgba(255,255,255,.12)"), borderRadius:"10px", color:"var(--txt)", fontSize:"14px", fontFamily:"var(--fm)", outline:"none", letterSpacing:"3px" }} />
            <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"14px" }}>{show?"🙈":"👁️"}</button>
          </div>
          {err && <div style={{ marginTop:"5px", fontSize:"12px", color:"var(--rd)", fontFamily:"var(--fm)" }}>{err}</div>}
        </div>
        <PBtn onClick={attempt} disabled={!pw.trim()} col="var(--rd)" style={{ color:"#fff", fontSize:"14px" }}>ENTER</PBtn>
      </div>
    </div>
  );
}

function AdminPanel({ onClose }) {
  const [view, setView] = useState("dash");
  const [trainers, setTrainers] = useState(ADMIN_DATA.trainers);
  const [members, setMembers] = useState(ADMIN_DATA.members);
  const [selTrainer, setSelTrainer] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editType, setEditType] = useState(null);
  const [search, setSearch] = useState("");
  const [delConfirm, setDelConfirm] = useState(null);

  const rev = (trainers.filter(t=>t.plan==="starter").length*4.99 + trainers.filter(t=>t.plan==="pro").length*6.99 + trainers.filter(t=>t.plan==="unlimited").length*14.99 + members.filter(m=>m.plan==="pro").length*4.99).toFixed(2);
  const filt = list => !search.trim() ? list : list.filter(i => (i.name+i.email).toLowerCase().includes(search.toLowerCase()));

  function saveEdit() {
    if (editType==="trainer") setTrainers(p=>p.map(t=>t.id===editItem.id?editItem:t));
    else setMembers(p=>p.map(m=>m.id===editItem.id?editItem:m));
    setEditItem(null); setEditType(null);
  }
  function del(id, type) {
    if (type==="trainer") setTrainers(p=>p.filter(t=>t.id!==id));
    else setMembers(p=>p.filter(m=>m.id!==id));
    setDelConfirm(null);
  }
  function toggleStatus(id, type) {
    const toggle = s => s==="active"?"suspended":"active";
    if (type==="trainer") setTrainers(p=>p.map(t=>t.id===id?{...t,status:toggle(t.status)}:t));
    else setMembers(p=>p.map(m=>m.id===id?{...m,status:toggle(m.status)}:m));
  }

  function ActionBtns({ item, type }) {
    return (
      <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
        {type==="trainer" && <button onClick={()=>setSelTrainer(item)} style={aBtnS("var(--acc)")}>CLIENTS</button>}
        <button onClick={()=>{ setEditItem({...item}); setEditType(type); }} style={aBtnS("var(--mut)")}>EDIT</button>
        <button onClick={()=>toggleStatus(item.id,type)} style={aBtnS(item.status==="active"?"var(--yw)":"var(--gr)")}>{item.status==="active"?"SUSPEND":"RESTORE"}</button>
        <button onClick={()=>setDelConfirm({id:item.id,name:item.name,type})} style={aBtnS("var(--a2)")}>DELETE</button>
      </div>
    );
  }
  function aBtnS(col) {
    return { padding:"4px 10px", background:col+"18", border:"1px solid "+col+"35", borderRadius:"5px", color:col, cursor:"pointer", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" };
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:9000, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px", background:"rgba(15,15,15,.98)", borderBottom:"1px solid rgba(232,41,74,.2)", display:"flex", alignItems:"center", gap:"11px", flexShrink:0 }}>
        <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:"rgba(232,41,74,.15)", border:"1px solid rgba(232,41,74,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>🔐</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"3px", color:"var(--rd)" }}>ADMIN PANEL</div>
          <Mono>FIT2ALL CONTROL</Mono>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,61,107,.1)", border:"1px solid rgba(255,61,107,.25)", borderRadius:"8px", color:"var(--a2)", cursor:"pointer", padding:"6px 13px", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>EXIT</button>
      </div>

      {/* Nav */}
      <div style={{ display:"flex", gap:"6px", padding:"10px 18px", borderBottom:"1px solid rgba(255,255,255,.05)", flexShrink:0 }}>
        {[["dash","📊 Dashboard"],["trainers","🏋️ Trainers"],["members","👥 Members"]].map(([v,lbl])=>(
          <button key={v} onClick={()=>{ setView(v); setSearch(""); setSelTrainer(null); }} style={{ padding:"6px 13px", background:view===v?"var(--rd)":"rgba(255,255,255,.04)", border:"1px solid "+(view===v?"var(--rd)":"rgba(255,255,255,.08)"), borderRadius:"50px", color:view===v?"#fff":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>{lbl}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>

        {view==="dash" && (
          <div style={{ animation:"fadeIn .3s" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", marginBottom:"13px" }}>OVERVIEW</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"9px", marginBottom:"18px" }}>
              {[{lbl:"Trainers",v:trainers.length,i:"🏋️",c:"var(--tr)"},{lbl:"Members",v:members.length,i:"👥",c:"var(--acc)"},{lbl:"Paid Plans",v:members.filter(m=>m.plan==="pro").length+trainers.filter(t=>t.plan!=="free").length,i:"⚡",c:"var(--a4)"},{lbl:"Est. Revenue",v:"$"+rev,i:"💰",c:"var(--gr)"}].map(s=>(
                <Card key={s.lbl} style={{ padding:"13px" }}>
                  <div style={{ fontSize:"20px", marginBottom:"5px" }}>{s.i}</div>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"24px", color:s.c, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"3px" }}>{s.lbl}</div>
                </Card>
              ))}
            </div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"9px" }}>TRAINER PLANS</div>
            <Card style={{ padding:"13px", marginBottom:"14px" }}>
              {Object.values(TRAINER_PLANS).map((plan,i)=>{
                const cnt = trainers.filter(t=>t.plan===plan.id).length;
                const pct = trainers.length>0 ? Math.round(cnt/trainers.length*100) : 0;
                return (
                  <div key={plan.id} style={{ display:"flex", alignItems:"center", gap:"9px", padding:"6px 0", borderBottom:i<3?"1px solid rgba(255,255,255,.04)":"none" }}>
                    <div style={{ fontFamily:"var(--fd)", fontSize:"11px", color:plan.color, width:"75px", letterSpacing:"1px" }}>{plan.name}</div>
                    <div style={{ flex:1, height:"5px", background:"rgba(255,255,255,.08)", borderRadius:"3px", overflow:"hidden" }}><div style={{ height:"100%", width:pct+"%", background:plan.color, borderRadius:"3px" }}/></div>
                    <Mono style={{ color:plan.color, width:"18px", textAlign:"right" }}>{cnt}</Mono>
                  </div>
                );
              })}
            </Card>
            <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"9px" }}>MEMBER STATUS</div>
            <Card style={{ padding:"13px" }}>
              {[["active","Active","var(--gr)"],["trial_expired","Trial Expired","var(--yw)"],["suspended","Suspended","var(--a2)"]].map(([st,lbl,col],i)=>(
                <div key={st} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:i<2?"1px solid rgba(255,255,255,.04)":"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}><div style={{ width:"7px", height:"7px", borderRadius:"50%", background:col }}/><span style={{ fontSize:"13px" }}>{lbl}</span></div>
                  <span style={{ fontFamily:"var(--fm)", fontSize:"13px", color:col }}>{members.filter(m=>m.status===st).length}</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {view==="trainers" && !selTrainer && (
          <div style={{ animation:"fadeIn .3s" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", marginBottom:"11px" }}>TRAINERS ({trainers.length})</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..." style={{ width:"100%", padding:"10px 13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none", marginBottom:"11px" }}/>
            {filt(trainers).map((tr,i)=>(
              <Card key={tr.id} style={{ padding:"13px", marginBottom:"8px", animation:`fadeUp .3s ease ${i*.05}s both` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:"linear-gradient(135deg,var(--tr),#ff8a50)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"13px", flexShrink:0 }}>
                    {tr.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2px" }}>
                      <span style={{ fontWeight:600, fontSize:"13px" }}>{tr.name}</span>
                      <div style={{ display:"flex", gap:"4px" }}>
                        <span style={{ padding:"2px 7px", background:PC[tr.plan]+"20", border:"1px solid "+PC[tr.plan]+"40", borderRadius:"50px", fontSize:"9px", color:PC[tr.plan], fontFamily:"var(--fm)" }}>{tr.plan.toUpperCase()}</span>
                        <span style={{ padding:"2px 7px", background:PC[tr.status]+"15", border:"1px solid "+PC[tr.status]+"30", borderRadius:"50px", fontSize:"9px", color:PC[tr.status], fontFamily:"var(--fm)" }}>{tr.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"7px" }}>{tr.email} · {tr.clients} clients · {tr.joined}</div>
                    <ActionBtns item={tr} type="trainer" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {view==="trainers" && selTrainer && (
          <div style={{ animation:"fadeIn .3s" }}>
            <button onClick={()=>setSelTrainer(null)} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fm)", marginBottom:"12px" }}>← ALL TRAINERS</button>
            <Card style={{ padding:"15px", marginBottom:"13px", border:"1px solid rgba(255,112,67,.2)" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--tr)", letterSpacing:"1px", marginBottom:"3px" }}>{selTrainer.name}</div>
              <Mono>{selTrainer.email} · Plan: <span style={{ color:PC[selTrainer.plan] }}>{selTrainer.plan.toUpperCase()}</span></Mono>
            </Card>
            <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"9px" }}>CLIENTS ({(ADMIN_DATA.trainerClients[selTrainer.id]||[]).length})</div>
            {(ADMIN_DATA.trainerClients[selTrainer.id]||[]).length===0
              ? <Card style={{ padding:"18px", textAlign:"center" }}><Mono style={{ letterSpacing:"1px" }}>NO CLIENTS YET</Mono></Card>
              : (ADMIN_DATA.trainerClients[selTrainer.id]||[]).map((cl,i)=>(
                <Card key={i} style={{ padding:"12px", marginBottom:"7px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                    <span style={{ fontWeight:700, fontSize:"16px" }}>{cl.name}</span>
                    <span style={{ fontSize:"11px", color:"var(--mut)" }}>{cl.sessions} sessions</span>
                  </div>
                  <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"6px" }}>{cl.goal}</div>
                  <div style={{ height:"4px", background:"rgba(255,255,255,.08)", borderRadius:"2px" }}><div style={{ height:"100%", width:cl.progress+"%", background:"linear-gradient(90deg,var(--tr),#ffb74d)", borderRadius:"2px" }}/></div>
                  <div style={{ textAlign:"right", marginTop:"2px" }}><span style={{ fontSize:"10px", color:"var(--tr)", fontFamily:"var(--fm)" }}>{cl.progress}%</span></div>
                </Card>
              ))
            }
          </div>
        )}

        {view==="members" && (
          <div style={{ animation:"fadeIn .3s" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", marginBottom:"11px" }}>MEMBERS ({members.length})</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..." style={{ width:"100%", padding:"10px 13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none", marginBottom:"11px" }}/>
            {filt(members).map((mb,i)=>(
              <Card key={mb.id} style={{ padding:"13px", marginBottom:"8px", animation:`fadeUp .3s ease ${i*.05}s both` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:"linear-gradient(135deg,var(--acc),#5b21b6)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"14px", color:"#000", flexShrink:0 }}>{mb.name.charAt(0)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2px" }}>
                      <span style={{ fontWeight:600, fontSize:"13px" }}>{mb.name}</span>
                      <div style={{ display:"flex", gap:"4px" }}>
                        <span style={{ padding:"2px 7px", background:PC[mb.plan]+"20", border:"1px solid "+PC[mb.plan]+"40", borderRadius:"50px", fontSize:"9px", color:PC[mb.plan], fontFamily:"var(--fm)" }}>{mb.plan.toUpperCase()}</span>
                        <span style={{ padding:"2px 7px", background:PC[mb.status]+"15", border:"1px solid "+PC[mb.status]+"30", borderRadius:"50px", fontSize:"9px", color:PC[mb.status], fontFamily:"var(--fm)" }}>{mb.status.replace("_"," ")}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"7px" }}>{mb.email} · {mb.goal} · {mb.joined}</div>
                    <ActionBtns item={mb} type="member" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit sheet */}
      {editItem && (
        <Sheet onClose={()=>{ setEditItem(null); setEditType(null); }} title={"EDIT "+editType?.toUpperCase()} acc="var(--rd)">
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <Field lbl="NAME"  val={editItem.name}  set={v=>setEditItem(p=>({...p,name:v}))}  ph="Full name"        acc="var(--rd)" />
            <Field lbl="EMAIL" val={editItem.email} set={v=>setEditItem(p=>({...p,email:v}))} ph="email@example.com" acc="var(--rd)" />
            <div>
              <Mono style={{ marginBottom:"8px" }}>PLAN</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {(editType==="trainer" ? Object.values(TRAINER_PLANS) : [{id:"free",name:"FREE",color:"var(--a3)"},{id:"pro",name:"PRO",color:"var(--acc)"}]).map(plan=>(
                  <button key={plan.id} onClick={()=>setEditItem(p=>({...p,plan:plan.id}))} style={{ padding:"7px 12px", background:editItem.plan===plan.id?plan.color+"20":"rgba(255,255,255,.04)", border:"1px solid "+(editItem.plan===plan.id?plan.color:"rgba(255,255,255,.08)"), borderRadius:"50px", color:editItem.plan===plan.id?plan.color:"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{plan.name}</button>
                ))}
              </div>
            </div>
            <div>
              <Mono style={{ marginBottom:"8px" }}>STATUS</Mono>
              <div style={{ display:"flex", gap:"6px" }}>
                {["active","suspended"].map(st=>(
                  <button key={st} onClick={()=>setEditItem(p=>({...p,status:st}))} style={{ padding:"7px 13px", background:editItem.status===st?"rgba(147,51,234,.15)":"rgba(255,255,255,.04)", border:"1px solid "+(editItem.status===st?"var(--gr)":"rgba(255,255,255,.08)"), borderRadius:"50px", color:editItem.status===st?"var(--gr)":"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{st}</button>
                ))}
              </div>
            </div>
            <PBtn onClick={saveEdit} col="var(--rd)" style={{ color:"#fff" }}>SAVE CHANGES</PBtn>
          </div>
        </Sheet>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, animation:"fadeIn .2s" }}>
          <Card style={{ padding:"22px 20px", width:"290px", textAlign:"center", border:"1px solid rgba(255,61,107,.3)", animation:"pop .3s" }}>
            <div style={{ fontSize:"32px", marginBottom:"10px" }}>⚠️</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--a2)", letterSpacing:"2px", marginBottom:"8px" }}>DELETE USER</div>
            <p style={{ fontSize:"13px", color:"var(--mut)", lineHeight:1.6, marginBottom:"18px" }}>Delete <strong style={{ color:"var(--txt)" }}>{delConfirm.name}</strong>? This cannot be undone.</p>
            <div style={{ display:"flex", gap:"9px" }}>
              <button onClick={()=>setDelConfirm(null)} style={{ flex:1, padding:"11px", background:"transparent", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--mut)", cursor:"pointer", fontSize:"13px" }}>Cancel</button>
              <button onClick={()=>del(delConfirm.id,delConfirm.type)} style={{ flex:1, padding:"11px", background:"var(--a2)", border:"none", borderRadius:"10px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>DELETE</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Wearables ─────────────────────────────────────────────────────────────────
const DEVICES = [
  { id:"galaxy",  name:"Samsung Galaxy Watch", icon:"⌚", col:"#e8291e", models:["Watch 6","Watch 6 Classic","Watch 5 Pro","Watch 4"],           mets:["Heart Rate","SpO2","Sleep","Stress","ECG","Body Comp","GPS","VO2 Max","Steps","Calories"] },
  { id:"apple",   name:"Apple Watch",          icon:"⌚", col:"#888",    models:["Series 9","Series 8","Ultra 2","SE 2nd gen"],                 mets:["Heart Rate","SpO2","ECG","GPS","Sleep","Temperature","Calories"] },
  { id:"garmin",  name:"Garmin",               icon:"🟠", col:"#007CC3", models:["Fenix 7","Forerunner 965","Venu 3","Vivoactive 5"],            mets:["Heart Rate","GPS","VO2 Max","HRV","Body Battery","Training Load","Sleep"] },
  { id:"fitbit",  name:"Fitbit / Pixel Watch", icon:"💚", col:"#00B0B9", models:["Pixel Watch 2","Sense 2","Versa 4","Charge 6"],                mets:["Heart Rate","SpO2","Sleep Score","Steps","Stress","Active Zones"] },
  { id:"whoop",   name:"WHOOP 4.0",            icon:"🔴", col:"#E63946", models:["WHOOP 4.0"],                                                   mets:["HRV","Recovery Score","Sleep Coach","Strain","Respiratory Rate","SpO2"] },
  { id:"polar",   name:"Polar",                icon:"🔵", col:"#e8291e", models:["Vantage V3","Pacer Pro","Ignite 3","H10 Strap"],               mets:["Heart Rate","HRV","GPS","Training Load","Recovery","VO2 Max"] },
];
const rndMet = () => ({ hr:62+Math.floor(Math.random()*30), spo2:97+Math.floor(Math.random()*3), steps:3800+Math.floor(Math.random()*5000), kcal:280+Math.floor(Math.random()*350), hrv:35+Math.floor(Math.random()*40), stress:18+Math.floor(Math.random()*50), rec:50+Math.floor(Math.random()*45), bat:40+Math.floor(Math.random()*55), vo2:40+Math.floor(Math.random()*20), act:25+Math.floor(Math.random()*50) });

function ArcGauge({ v, max, col, lbl, unit }) {
  const r=18, cx=26, cy=26, circ=2*Math.PI*r, dash=Math.min(1,v/max)*circ*.75;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" strokeDasharray={`${circ*.75} ${circ}`} strokeLinecap="round" transform="rotate(135 26 26)"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="5" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(135 26 26)"/>
        <text x={cx} y={cy+4} textAnchor="middle" fill={col} fontSize="9" fontFamily="Space Mono,monospace">{v}</text>
      </svg>
      <Mono style={{ fontSize:"9px", textAlign:"center" }}>{lbl}<br/>{unit}</Mono>
    </div>
  );
}

function WearablesHub() {
  const [vw, setVw] = useState("list");
  const [selId, setSelId] = useState(null);
  const [conn, setConn] = useState([]);
  const [mets, setMets] = useState({});
  const [pairing, setPairing] = useState(null);
  const [live, setLive] = useState(null);
  const [wActive, setWActive] = useState(false);
  const [wTime, setWTime] = useState(0);
  const [wType, setWType] = useState("Running");
  const timerRef = useRef(); const liveRef = useRef();
  const dev = DEVICES.find(d=>d.id===selId);
  const isConn = conn.includes(selId);
  const dm = mets[selId];
  const connDevs = DEVICES.filter(d=>conn.includes(d.id));

  function doPair(d) {
    setPairing(d.id);
    const timer = setTimeout(() => {
      setConn(prev => {
        if (!prev.includes(d.id)) return [...prev, d.id];
        return prev;
      });
      setMets(prev => ({ ...prev, [d.id]: rndMet() }));
      setPairing(null);
      setVw("detail");
    }, 2800);
    return () => clearTimeout(timer);
  }
  function doUnpair(id) { setConn(p=>p.filter(x=>x!==id)); if(selId===id){setVw("list");setSelId(null);} }
  function startLive() { setLive(rndMet()); liveRef.current=setInterval(()=>setLive(rndMet()),2000); }
  function stopLive() { clearInterval(liveRef.current); setLive(null); }
  function startW() { setWActive(true); setWTime(0); startLive(); timerRef.current=setInterval(()=>setWTime(t=>t+1),1000); }
  function stopW() { setWActive(false); clearInterval(timerRef.current); stopLive(); }
  useEffect(() => ()=>{ clearInterval(timerRef.current); clearInterval(liveRef.current); }, []);
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pairDev = DEVICES.find(d=>d.id===pairing);

  if (vw==="live" && live) return (
    <div style={{ animation:"fadeIn .3s" }}>
      <button onClick={()=>{ stopLive(); setVw("detail"); }} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fm)", marginBottom:"12px" }}>← BACK</button>
      <Card style={{ padding:"15px", marginBottom:"10px", border:wActive?"2px solid var(--rd)":"1px solid rgba(124,58,237,.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"4px" }}><Dot col={wActive?"var(--rd)":"var(--acc)"}/><Mono style={{ color:wActive?"var(--rd)":"var(--acc)" }}>{wActive?"LIVE WORKOUT":"LIVE METRICS"}</Mono></div>
            {wActive && <div style={{ fontFamily:"var(--fd)", fontSize:"32px", color:"var(--rd)", lineHeight:1 }}>{fmtTime(wTime)}<div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"2px" }}>{wType}</div></div>}
          </div>
          {wActive
            ? <button onClick={stopW} style={{ padding:"9px 14px", background:"rgba(232,41,74,.15)", border:"1px solid rgba(232,41,74,.35)", borderRadius:"10px", color:"var(--rd)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>⏹ STOP</button>
            : <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                <select value={wType} onChange={e=>setWType(e.target.value)} style={{ padding:"7px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--txt)", fontSize:"12px" }}>
                  {["Running","Cycling","Weight Training","HIIT","Swimming","Yoga","Walking"].map(w=><option key={w}>{w}</option>)}
                </select>
                <button onClick={startW} style={{ padding:"8px 13px", background:"var(--acc)", border:"none", borderRadius:"9px", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>▶ START</button>
              </div>
          }
        </div>
        <div style={{ background:"rgba(255,255,255,.03)", borderRadius:"9px", padding:"11px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"7px" }}>
            <Mono>HEART RATE</Mono>
            <div style={{ display:"flex", alignItems:"baseline", gap:"4px" }}>
              <span style={{ fontFamily:"var(--fd)", fontSize:"26px", color:"var(--rd)" }}>{live.hr}</span>
              <span style={{ fontSize:"11px", color:"var(--mut)" }}>bpm</span>
              <Dot col="var(--rd)"/>
            </div>
          </div>
          <svg width="100%" height="42" viewBox="0 0 260 42" preserveAspectRatio="none">
            <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--rd)" stopOpacity=".3"/><stop offset="100%" stopColor="var(--rd)" stopOpacity="0"/></linearGradient></defs>
            <path d="M0,21 L26,21 L39,8 L52,34 L65,13 L78,29 L91,21 L130,21 L143,9 L156,33 L169,21 L182,21 L195,15 L208,27 L221,21 L260,21 L260,42 L0,42Z" fill="url(#hg)"/>
            <path d="M0,21 L26,21 L39,8 L52,34 L65,13 L78,29 L91,21 L130,21 L143,9 L156,33 L169,21 L182,21 L195,15 L208,27 L221,21 L260,21" stroke="var(--rd)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </Card>
      <Card style={{ padding:"13px", marginBottom:"10px" }}>
        <Mono style={{ marginBottom:"11px" }}>REAL-TIME METRICS</Mono>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"5px" }}>
          {[{v:live.spo2,max:100,col:"var(--a3)",lbl:"SpO2",unit:"%"},{v:live.stress,max:100,col:"var(--yw)",lbl:"Stress",unit:"pts"},{v:live.hrv,max:100,col:"var(--a4)",lbl:"HRV",unit:"ms"},{v:live.rec,max:100,col:"var(--gr)",lbl:"Recovery",unit:"%"}].map(g=><ArcGauge key={g.lbl} {...g}/>)}
        </div>
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
        {[["👟",live.steps.toLocaleString(),"steps","var(--acc)"],["🔥",live.kcal,"kcal","var(--rd)"],["⚡",live.act,"min","var(--a3)"]].map(([i,v,u,c])=>(
          <Card key={u} style={{ padding:"12px", textAlign:"center" }}><div style={{ fontSize:"17px", marginBottom:"3px" }}>{i}</div><div style={{ fontFamily:"var(--fd)", fontSize:"18px", color:c, lineHeight:1 }}>{v}</div><div style={{ fontSize:"10px", color:"var(--mut)", marginTop:"2px" }}>{u}</div></Card>
        ))}
      </div>
    </div>
  );

  if (vw==="detail" && dev) return (
    <div style={{ animation:"fadeIn .3s" }}>
      <button onClick={()=>setVw("list")} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fm)", marginBottom:"12px" }}>← ALL DEVICES</button>
      <Card style={{ padding:"15px", marginBottom:"11px", border:`1px solid ${dev.col}40` }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"13px" }}>
          <div style={{ width:"56px", height:"56px", borderRadius:"14px", background:dev.col+"20", border:`2px solid ${dev.col}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", flexShrink:0 }}>{dev.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"2px", color:dev.col, marginBottom:"3px" }}>{dev.name}</div>
            <Mono style={{ marginBottom:"7px" }}>Bluetooth LE · {dev.mets.length} metrics</Mono>
            <div style={{ display:"flex", gap:"6px" }}>
              <div style={{ padding:"3px 10px", background:isConn?"rgba(147,51,234,.15)":"rgba(255,255,255,.05)", border:`1px solid ${isConn?"rgba(147,51,234,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"50px", fontSize:"11px", color:isConn?"var(--gr)":"var(--mut)", display:"flex", alignItems:"center", gap:"4px" }}>
                {isConn && <Dot col="var(--gr)"/>}{isConn?"CONNECTED":"NOT CONNECTED"}
              </div>
              {isConn && dm && <div style={{ padding:"3px 10px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"50px", fontSize:"11px", color:"var(--acc)" }}>🔋 {dm.bat}%</div>}
            </div>
          </div>
        </div>
        {isConn && dm && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"7px", marginBottom:"12px" }}>
            {[["❤️",dm.hr,"bpm","var(--rd)"],["💨",dm.spo2,"%","var(--a3)"],["👟",(dm.steps/1000).toFixed(1)+"k","steps","var(--acc)"]].map(([i,v,u,c])=>(
              <div key={u} style={{ textAlign:"center", padding:"8px", background:"rgba(255,255,255,.04)", borderRadius:"8px" }}>
                <div style={{ fontFamily:"var(--fd)", fontSize:"17px", color:c }}>{v}</div>
                <div style={{ fontSize:"9px", color:"var(--mut)" }}>{u}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:"8px" }}>
          {isConn
            ? <><button onClick={()=>{ startLive(); setVw("live"); }} style={{ flex:1, padding:"11px", background:"var(--acc)", border:"none", borderRadius:"var(--r)", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>📡 LIVE DATA</button>
              <button onClick={()=>doUnpair(dev.id)} style={{ padding:"11px 13px", background:"rgba(255,61,107,.1)", border:"1px solid rgba(255,61,107,.25)", borderRadius:"var(--r)", color:"var(--a2)", cursor:"pointer", fontSize:"12px" }}>Disconnect</button></>
            : <button onClick={()=>doPair(dev)} disabled={!!pairing} style={{ flex:1, padding:"12px", background:pairing?"rgba(255,255,255,.06)":dev.col, border:pairing?"1px solid rgba(255,255,255,.1)":"none", borderRadius:"var(--r)", color:"#fff", cursor:pairing?"default":"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>
                {pairing===dev.id
                  ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"7px" }}><div style={{ width:"12px", height:"12px", borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin .8s linear infinite" }}/>CONNECTING...</span>
                  : pairing
                  ? "Pairing another device..."
                  : "🔗 CONNECT DEVICE"}
              </button>
          }
        </div>
      </Card>
      <Mono style={{ marginBottom:"9px" }}>TRACKED METRICS</Mono>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"11px" }}>
        {dev.mets.map(m=><div key={m} style={{ padding:"4px 10px", background:isConn?dev.col+"12":"rgba(255,255,255,.04)", border:`1px solid ${isConn?dev.col+"30":"rgba(255,255,255,.08)"}`, borderRadius:"50px", fontSize:"11px", color:isConn?dev.col:"var(--mut)" }}>{isConn&&"● "}{m}</div>)}
      </div>
      <Card style={{ padding:"13px" }}>
        <Mono style={{ marginBottom:"9px" }}>COMPATIBLE MODELS</Mono>
        {dev.models.map((mo,i)=><div key={mo} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<dev.models.length-1?"1px solid rgba(255,255,255,.04)":"none" }}><span style={{ fontSize:"13px" }}>{mo}</span><span style={{ fontSize:"10px", color:"var(--gr)", fontFamily:"var(--fm)" }}>✓</span></div>)}
      </Card>
      {pairing && pairDev && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, animation:"fadeIn .2s" }}>
          <Card style={{ padding:"24px 20px", width:"260px", textAlign:"center", animation:"pop .3s" }}>
            <div style={{ fontSize:"38px", marginBottom:"9px" }}>{pairDev.icon}</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:pairDev.col, letterSpacing:"2px", marginBottom:"6px" }}>PAIRING</div>
            <div style={{ fontSize:"12px", color:"var(--mut)", marginBottom:"14px", lineHeight:1.6 }}>Connecting to<br/><strong style={{ color:"var(--txt)" }}>{pairDev.name}</strong></div>
            <div style={{ width:"42px", height:"42px", borderRadius:"50%", border:`3px solid ${pairDev.col}`, borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 10px" }}/>
            <Mono style={{ animation:"pulse 1.5s infinite" }}>SEARCHING VIA BLUETOOTH...</Mono>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <HeroBg src={IMG.recovery} ov="linear-gradient(180deg,rgba(10,10,10,.15) 0%,rgba(10,10,10,.9) 100%)" style={{ height:"120px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 0 13px", borderRadius:"12px", overflow:"hidden", marginBottom:"13px" }}>
        <Mono>SMART DEVICES</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"23px", letterSpacing:"2px" }}>WEARABLES <span style={{ color:"var(--acc)" }}>HUB</span></div>
      </HeroBg>
      {connDevs.length>0 && (
        <Card style={{ padding:"13px", marginBottom:"13px", border:"1px solid rgba(147,51,234,.2)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"8px" }}><Dot col="var(--rd)"/><Mono style={{ color:"var(--gr)" }}>{connDevs.length} DEVICE{connDevs.length>1?"S":""} CONNECTED</Mono></div>
          {mets[connDevs[0].id] && (
            <>
              <div style={{ fontSize:"12px", fontWeight:600, marginBottom:"6px" }}>{connDevs[0].name}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px", marginBottom:"10px" }}>
                {[["❤️",mets[connDevs[0].id].hr,"bpm","var(--rd)"],["💨",mets[connDevs[0].id].spo2,"%","var(--a3)"],["👟",(mets[connDevs[0].id].steps/1000).toFixed(1)+"k","steps","var(--acc)"],["🔋",mets[connDevs[0].id].bat+"%","bat","var(--gr)"]].map(([i,v,u,c])=>(
                  <div key={u} style={{ textAlign:"center", padding:"7px", background:"rgba(255,255,255,.03)", borderRadius:"7px" }}>
                    <div style={{ fontSize:"13px", marginBottom:"1px" }}>{i}</div>
                    <div style={{ fontFamily:"var(--fd)", fontSize:"14px", color:c, lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:"9px", color:"var(--mut)" }}>{u}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{ setSelId(connDevs[0].id); startLive(); setVw("live"); }} style={{ width:"100%", padding:"10px", background:"var(--acc)", border:"none", borderRadius:"10px", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>📡 VIEW LIVE DATA</button>
            </>
          )}
        </Card>
      )}
      <Mono style={{ marginBottom:"9px" }}>SUPPORTED DEVICES</Mono>
      {DEVICES.map((dv,i)=>{
        const isC=conn.includes(dv.id), iP=pairing===dv.id, dm2=mets[dv.id];
        return (
          <Card key={dv.id} style={{ padding:"12px", marginBottom:"8px", border:`1px solid ${isC?dv.col+"40":"rgba(255,255,255,.06)"}`, cursor:"pointer", animation:`fadeUp .4s ease ${i*.05}s both` }} onClick={()=>{ setSelId(dv.id); setVw("detail"); }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"11px", background:dv.col+"15", border:`1px solid ${dv.col}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>{dv.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2px" }}>
                  <span style={{ fontWeight:600, fontSize:"13px" }}>{dv.name}</span>
                  {isC ? <span style={{ fontSize:"10px", color:"var(--rd)", fontFamily:"var(--fm)", display:"flex", alignItems:"center", gap:"3px" }}><Dot col="var(--rd)"/>LIVE</span>
                  : iP ? <Mono>PAIRING...</Mono>
                  : <Mono>TAP TO PAIR</Mono>}
                </div>
                <Mono style={{ marginBottom:"5px" }}>{dv.models.length} models · {dv.mets.length} metrics</Mono>
                {isC && dm2
                  ? <div style={{ display:"flex", gap:"8px" }}>{[["❤️",dm2.hr,"bpm"],["💨",dm2.spo2,"%"],["🔋",dm2.bat+"%",""]].map(([ic,v,u])=><span key={ic} style={{ fontSize:"10px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{ic} {v}{u}</span>)}</div>
                  : <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>{dv.mets.slice(0,4).map(m=><span key={m} style={{ fontSize:"10px", padding:"1px 6px", background:"rgba(255,255,255,.04)", borderRadius:"4px", color:"var(--mut)" }}>{m}</span>)}{dv.mets.length>4&&<Mono>+{dv.mets.length-4}</Mono>}</div>
                }
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Nutrition Hub ─────────────────────────────────────────────────────────────
function NutritionHub() {
  const [macros, setMacros] = useState({ p:165, c:220, f:60, fiber:30 });
  const [water, setWater] = useState(0);
  const [diet, setDiet] = useState("Standard");
  const [vw, setVw] = useState("overview");
  const [mealGoal, setMealGoal] = useState("Muscle Gain");
  const [mealTime, setMealTime] = useState("All meals");
  const [meals, setMeals] = useState(null);
  const [mealsLoading, setMealsLoading] = useState(false);

  async function genMeals() {
    setMealsLoading(true); setMeals(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000,
          messages:[{ role:"user", content:`Create a practical, delicious 1-day meal plan for someone with the goal: ${mealGoal}. Focus on: ${mealTime}. Return ONLY JSON: {"meals":[{"mealTime":"Breakfast","name":"Meal name","calories":"kcal","protein":"g","carbs":"g","fat":"g","ingredients":["item1","item2"],"prep":"2-sentence prep instructions","tip":"1 practical tip"}],"dailyTotals":{"calories":"total","protein":"g","carbs":"g","fat":"g"},"groceryList":["item1","item2"]}. Include 4-5 meals with snacks. Make meals realistic, tasty and goal-aligned.` }]
        })
      });
      const d = await res.json();
      const raw = d.content?.[0]?.text || "";
      setMeals(JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim()));
    } catch { setMeals({ meals:[{mealTime:"Error",name:"Couldn't generate meals",calories:"—",protein:"—",carbs:"—",fat:"—",ingredients:[],prep:"Please try again.",tip:"Check your connection."}], dailyTotals:{}, groceryList:[] }); }
    setMealsLoading(false);
  }
  const totalKcal = macros.p*4 + macros.c*4 + macros.f*9;
  const diets = { Standard:{p:165,c:220,f:60}, "High Protein":{p:220,c:165,f:55}, Keto:{p:175,c:28,f:155}, Vegan:{p:110,c:275,f:60} };

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <HeroBg src={IMG.food} ov="linear-gradient(180deg,rgba(10,10,10,.15) 0%,rgba(10,10,10,.9) 100%)" style={{ height:"115px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 0 12px", borderRadius:"12px", overflow:"hidden", marginBottom:"12px" }}>
        <Mono>FUEL CENTER</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px" }}>NUTRITION <span style={{ color:"var(--acc)" }}>HUB</span></div>
      </HeroBg>
      <div style={{ display:"flex", gap:"6px", marginBottom:"11px", overflowX:"auto" }}>
        {[["overview","📊"],["macros","🎚️"],["water","💧"]].map(([t,ic])=>(
          <button key={t} onClick={()=>setVw(t)} style={{ padding:"6px 12px", background:vw===t?"var(--a3)":"rgba(255,255,255,.04)", border:`1px solid ${vw===t?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:vw===t?"#000":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px", whiteSpace:"nowrap" }}>{ic} {t.toUpperCase()}</button>
        ))}
      </div>
      {vw==="overview" && (
        <div>
          <Card style={{ padding:"13px", marginBottom:"10px", display:"flex", gap:"13px", alignItems:"center" }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink:0 }}>
              {[{v:macros.p*4,col:"var(--tr)",off:0},{v:macros.c*4,col:"var(--acc)",off:macros.p*4/totalKcal*207},{v:macros.f*9,col:"var(--a3)",off:(macros.p*4+macros.c*4)/totalKcal*207}].map((s,i)=>(
                <circle key={i} cx="50" cy="50" r="33" fill="none" stroke={s.col} strokeWidth="9" strokeDasharray={`${s.v/totalKcal*207} 207`} strokeDashoffset={-s.off} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition:"all .6s" }}/>
              ))}
              <text x="50" y="47" textAnchor="middle" fill="var(--acc)" fontSize="14" fontFamily="Orbitron,sans-serif" fontWeight="900">{totalKcal}</text>
              <text x="50" y="57" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="8" fontFamily="Space Mono,monospace">kcal</text>
            </svg>
            <div style={{ flex:1 }}>
              <Mono style={{ marginBottom:"8px" }}>DAILY TARGETS</Mono>
              {[{l:"Protein",v:macros.p,c:"var(--tr)"},{l:"Carbs",v:macros.c,c:"var(--acc)"},{l:"Fat",v:macros.f,c:"var(--a3)"},{l:"Fiber",v:macros.fiber,c:"var(--a4)"}].map(m=>(
                <div key={m.l} style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
                  <div style={{ width:"6px", height:"6px", borderRadius:"2px", background:m.c, flexShrink:0 }}/>
                  <span style={{ fontSize:"11px", color:"var(--mut)", width:"42px" }}>{m.l}</span>
                  <span style={{ fontFamily:"var(--fm)", fontSize:"11px", color:m.c }}>{m.v}g</span>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ padding:"12px", border:"1px solid rgba(124,58,237,.2)", display:"flex", alignItems:"center", gap:"11px" }}>
            <div style={{ fontSize:"22px" }}>💧</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                <span style={{ fontSize:"12px", color:"var(--mut)" }}>Water Today</span>
                <span style={{ fontFamily:"var(--fm)", fontSize:"11px", color:"var(--acc)" }}>{water.toFixed(1)}L / 3.0L</span>
              </div>
              <div style={{ height:"4px", background:"rgba(255,255,255,.08)", borderRadius:"2px" }}><div style={{ height:"100%", width:Math.min(100,water/3*100)+"%", background:"var(--acc)", borderRadius:"2px", transition:"width .5s" }}/></div>
            </div>
          </Card>
        </div>
      )}
      {vw==="meals" && (
        <div style={{ animation:"fadeIn .3s" }}>
          <Card style={{ padding:"14px", marginBottom:"12px", border:"1px solid rgba(147,51,234,.2)" }}>
            <Mono style={{ marginBottom:"10px" }}>🍽️ AI MEAL PLANNER</Mono>
            <div style={{ marginBottom:"10px" }}>
              <Mono style={{ marginBottom:"7px" }}>YOUR GOAL</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {["Muscle Gain","Fat Loss","Endurance","General Fitness","Vegan","High Protein","Keto"].map(g=>(
                  <button key={g} onClick={()=>setMealGoal(g)} style={{ padding:"5px 11px", background:mealGoal===g?"rgba(147,51,234,.18)":"rgba(255,255,255,.04)", border:`1px solid ${mealGoal===g?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:mealGoal===g?"var(--a3)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{g}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:"12px" }}>
              <Mono style={{ marginBottom:"7px" }}>MEAL FOCUS</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {["All meals","Pre-workout","Post-workout","Breakfast","High protein snacks"].map(t=>(
                  <button key={t} onClick={()=>setMealTime(t)} style={{ padding:"5px 11px", background:mealTime===t?"rgba(147,51,234,.18)":"rgba(255,255,255,.04)", border:`1px solid ${mealTime===t?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:mealTime===t?"var(--a3)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={genMeals} disabled={mealsLoading} style={{ width:"100%", padding:"13px", background:mealsLoading?"rgba(255,255,255,.06)":"var(--a3)", border:"none", borderRadius:"10px", color:mealsLoading?"var(--mut)":"#000", cursor:mealsLoading?"default":"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"2px" }}>
              {mealsLoading ? "⏳ GENERATING..." : "🍽️ GENERATE MEAL PLAN"}
            </button>
          </Card>

          {mealsLoading && (
            <Card style={{ padding:"22px", textAlign:"center" }}>
              <div style={{ width:"40px", height:"40px", borderRadius:"50%", border:"3px solid var(--a3)", borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 12px" }}/>
              <Mono style={{ color:"var(--a3)" }}>AI crafting your meal plan...</Mono>
            </Card>
          )}

          {meals && !mealsLoading && (
            <div>
              {/* Daily totals */}
              {meals.dailyTotals?.calories && (
                <Card style={{ padding:"13px", marginBottom:"11px", border:"1px solid rgba(147,51,234,.15)" }}>
                  <Mono style={{ marginBottom:"9px", color:"var(--a3)" }}>DAILY TOTALS</Mono>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px" }}>
                    {[{l:"Calories",v:meals.dailyTotals.calories,c:"var(--acc)"},{l:"Protein",v:meals.dailyTotals.protein,c:"var(--tr)"},{l:"Carbs",v:meals.dailyTotals.carbs,c:"var(--a3)"},{l:"Fat",v:meals.dailyTotals.fat,c:"var(--a4)"}].map(s=>(
                      <div key={s.l} style={{ textAlign:"center", padding:"8px 4px", background:"rgba(255,255,255,.04)", borderRadius:"8px" }}>
                        <div style={{ fontFamily:"var(--fd)", fontSize:"14px", color:s.c, lineHeight:1 }}>{s.v}</div>
                        <div style={{ fontSize:"9px", color:"var(--mut)", marginTop:"3px" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Meal cards */}
              {(meals.meals||[]).map((meal,i)=>(
                <Card key={i} style={{ marginBottom:"9px", overflow:"hidden", border:"1px solid rgba(255,255,255,.08)", animation:`fadeUp .3s ease ${i*.07}s both` }}>
                  <div style={{ padding:"13px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                      <div>
                        <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"var(--a3)", letterSpacing:"1px", marginBottom:"2px" }}>{meal.mealTime?.toUpperCase()}</div>
                        <div style={{ fontWeight:700, fontSize:"15px" }}>{meal.name}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--acc)" }}>{meal.calories}</div>
                        <div style={{ fontSize:"9px", color:"var(--mut)" }}>kcal</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:"8px", marginBottom:"9px" }}>
                      {[{l:"P",v:meal.protein,c:"var(--tr)"},{l:"C",v:meal.carbs,c:"var(--a3)"},{l:"F",v:meal.fat,c:"var(--a4)"}].map(m=>(
                        <div key={m.l} style={{ padding:"3px 9px", background:m.c+"12", border:`1px solid ${m.c}25`, borderRadius:"50px", fontSize:"11px", color:m.c, fontFamily:"var(--fm)" }}>{m.l}: {m.v}</div>
                      ))}
                    </div>
                    {meal.ingredients?.length>0 && (
                      <div style={{ marginBottom:"8px" }}>
                        <Mono style={{ marginBottom:"5px" }}>INGREDIENTS</Mono>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                          {meal.ingredients.map((ing,j)=>(
                            <span key={j} style={{ fontSize:"11px", padding:"2px 8px", background:"rgba(255,255,255,.05)", borderRadius:"5px", color:"rgba(255,255,255,.65)" }}>{ing}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {meal.prep && <div style={{ fontSize:"12px", color:"rgba(255,255,255,.55)", lineHeight:1.6, marginBottom:"5px" }}>{meal.prep}</div>}
                    {meal.tip && <div style={{ fontSize:"11px", color:"var(--a3)", fontStyle:"italic" }}>💡 {meal.tip}</div>}
                  </div>
                </Card>
              ))}

              {/* Grocery list */}
              {meals.groceryList?.length>0 && (
                <Card style={{ padding:"14px", border:"1px solid rgba(124,58,237,.15)" }}>
                  <Mono style={{ marginBottom:"9px", color:"var(--a4)" }}>🛒 GROCERY LIST</Mono>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {meals.groceryList.map((item,i)=>(
                      <span key={i} style={{ fontSize:"12px", padding:"4px 10px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"8px", color:"rgba(255,255,255,.7)" }}>{item}</span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
      {vw==="macros" && (
        <Card style={{ padding:"13px" }}>
          <div style={{ textAlign:"center", marginBottom:"8px" }}><span style={{ fontFamily:"var(--fd)", fontSize:"28px", color:"var(--acc)" }}>{totalKcal}</span><span style={{ fontSize:"12px", color:"var(--mut)", marginLeft:"5px" }}>kcal/day</span></div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"12px" }}>
            {Object.entries(diets).map(([n,v])=>(
              <button key={n} onClick={()=>{ setMacros({...v,fiber:30}); setDiet(n); }} style={{ padding:"6px 11px", background:diet===n?"rgba(124,58,237,.2)":"rgba(255,255,255,.04)", border:`1px solid ${diet===n?"var(--a4)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:diet===n?"var(--a4)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{n}</button>
            ))}
          </div>
          {[{lbl:"PROTEIN",k:"p",min:50,max:300,col:"var(--tr)"},{lbl:"CARBS",k:"c",min:20,max:500,col:"var(--acc)"},{lbl:"FAT",k:"f",min:20,max:200,col:"var(--a3)"},{lbl:"FIBER",k:"fiber",min:10,max:80,col:"var(--a4)"}].map(sl=>(
            <div key={sl.k} style={{ marginBottom:"15px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"5px" }}>
                <Mono>{sl.lbl}</Mono>
                <span style={{ fontFamily:"var(--fd)", fontSize:"22px", color:sl.col }}>{macros[sl.k]}<span style={{ fontSize:"11px", color:"var(--mut)", marginLeft:"2px" }}>g</span></span>
              </div>
              <input type="range" min={sl.min} max={sl.max} value={macros[sl.k]} onChange={e=>setMacros(p=>({...p,[sl.k]:Number(e.target.value)}))} style={{ background:`linear-gradient(to right,${sl.col} 0%,${sl.col} ${Math.round((macros[sl.k]-sl.min)/(sl.max-sl.min)*100)}%,rgba(255,255,255,.08) ${Math.round((macros[sl.k]-sl.min)/(sl.max-sl.min)*100)}%,rgba(255,255,255,.08) 100%)` }}/>
              <style>{`input[type=range]::-webkit-slider-thumb{background:${sl.col}}`}</style>
            </div>
          ))}
        </Card>
      )}
      {vw==="water" && (
        <div>
          <Card style={{ padding:"18px", textAlign:"center", marginBottom:"10px", border:"1px solid rgba(124,58,237,.2)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:Math.min(100,water/3*100)+"%", background:"linear-gradient(180deg,rgba(124,58,237,.15),rgba(124,58,237,.03))", borderTop:"1px solid rgba(124,58,237,.25)", transition:"height .7s", pointerEvents:"none" }}/>
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:"40px", marginBottom:"4px" }}>💧</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"44px", color:"var(--acc)", lineHeight:1 }}>{water.toFixed(1)}</div>
              <p style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"6px" }}>of 3.0L goal</p>
              <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:water>=3?"var(--gr)":"var(--mut)" }}>{water>=3?"🎯 GOAL!":water>=1.5?"💪 HALFWAY":"🌊 KEEP GOING"}</div>
            </div>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"7px", marginBottom:"9px" }}>
            {[.25,.5,.75,1].map(a=><button key={a} onClick={()=>setWater(v=>clamp(v+a,0,4))} style={{ padding:"11px 6px", background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.18)", borderRadius:"9px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px" }}>+{a}L</button>)}
          </div>
          <button onClick={()=>setWater(0)} style={{ width:"100%", padding:"10px", background:"transparent", border:"1px solid rgba(255,255,255,.08)", borderRadius:"var(--r)", color:"var(--mut)", cursor:"pointer", fontSize:"13px" }}>Reset</button>
        </div>
      )}
    </div>
  );
}

// ─── AI Coach ──────────────────────────────────────────────────────────────────
const QPS = [
  {i:"💪",l:"Similar exercises",t:"Give me 5 alternatives to bench press with YouTube links."},
  {i:"🥗",l:"Pre/post nutrition",t:"What to eat before and after workouts for muscle gain?"},
  {i:"😴",l:"Recovery tips",t:"Best recovery strategies and how many rest days?"},
  {i:"🏃",l:"Best cardio",t:"Best cardio for fat loss without losing muscle?"},
  {i:"🎯",l:"Exercise form",t:"Perfect squat form with a YouTube tutorial link."},
  {i:"🔥",l:"Break plateaus",t:"How do I break through a bench press plateau?"},
];

function parseYT(text) {
  const re = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  const parts = []; let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type:"text", c:text.slice(last,m.index) });
    parts.push({ type:"yt", url:m[0], vid:m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type:"text", c:text.slice(last) });
  return parts.length ? parts : [{ type:"text", c:text }];
}

function AICoach({ user, profile, ctx, onClose, onLimit }) {
  const [msgs, setMsgs] = useState([{ role:"assistant", content:`Hey ${user?.name?.split(" ")[0]||"there"}! 👋 I'm your Fit2All AI Coach.\n\nAsk me about:\n• 💪 Exercises & YouTube tutorials\n• 🥗 Nutrition & meal timing\n• 😴 Rest & recovery`, time:nowTime() }]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQ, setShowQ] = useState(true);
  const botRef = useRef(); const inpRef = useRef();

  useEffect(() => { botRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  async function send(text) {
    const q = text || inp.trim();
    if (!q || loading) return;
    if (ctx && !ctx.canAsk()) { onLimit("ai_limit"); return; }
    setInp(""); setShowQ(false);
    const hist = [...msgs, { role:"user", content:q, time:nowTime() }];
    setMsgs(hist); setLoading(true);
    const sys = `You are Fit2All AI Coach. User:${user?.name||"Member"}, Goal:${(profile?.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim()||"Fitness"}. Include YouTube URLs for exercises. Concise bullet points under 250 words. Known URLs: squat:https://www.youtube.com/watch?v=gcNh17Ckjgg deadlift:https://www.youtube.com/watch?v=op9kVnSso6Q bench:https://www.youtube.com/watch?v=rT7DgCr-3pg push-up:https://www.youtube.com/watch?v=IODxDxX7oi4`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800, system:sys, messages:hist.map(m=>({ role:m.role, content:m.content })) }) });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, try again.";
      if (ctx) ctx.recAsk();
      setMsgs(p=>[...p,{ role:"assistant", content:reply, time:nowTime() }]);
    } catch {
      setMsgs(p=>[...p,{ role:"assistant", content:"⚠️ Connection issue. Please try again.", time:nowTime() }]);
    }
    setLoading(false);
  }

  function LogoIcon() {
    return <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px", flexShrink:0 }}><Logo size={18} col="#111111"/></div>;
  }

  return (
    <HeroBg src={IMG.workout} ov="rgba(10,10,10,.97)" style={{ position:"fixed", inset:0, zIndex:500, display:"flex", flexDirection:"column", maxWidth:"480px", margin:"0 auto", animation:"fadeIn .25s" }}>
      <div className="glass" style={{ padding:"12px 15px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
        <div style={{ width:"37px", height:"37px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", display:"flex", alignItems:"center", justifyContent:"center", padding:"5px" }}><Logo size={25} col="#111111"/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"3px", lineHeight:1 }}>AI COACH</div>
          <div style={{ fontSize:"10px", color:"var(--gr)", fontFamily:"var(--fm)", marginTop:"1px", display:"flex", alignItems:"center", gap:"5px" }}>
            <Dot col="var(--gr)"/>ONLINE · Fit2All
            {ctx && ctx.plan.limits.ai !== Infinity && <span style={{ padding:"1px 6px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>{ctx.aiLeft()}/2 TODAY</span>}
            {ctx && ctx.plan.limits.ai === Infinity && <span style={{ padding:"1px 6px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>⚡ PRO</span>}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"5px 10px", fontSize:"11px", fontFamily:"var(--fm)" }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 12px 6px" }}>
        {msgs.map((msg,i) => {
          const isU = msg.role==="user";
          const parts = isU ? [{ type:"text", c:msg.content }] : parseYT(msg.content);
          return (
            <div key={i} style={{ display:"flex", justifyContent:isU?"flex-end":"flex-start", marginBottom:"11px", animation:"fadeUp .3s" }}>
              {!isU && <div style={{ marginRight:"5px", alignSelf:"flex-end" }}><LogoIcon/></div>}
              <div style={{ maxWidth:"83%", display:"flex", flexDirection:"column", gap:"3px" }}>
                {isU
                  ? <div style={{ padding:"10px 13px", background:"linear-gradient(135deg,rgba(124,58,237,.12),rgba(124,58,237,.06))", border:"1px solid rgba(124,58,237,.18)", borderRadius:"15px 15px 4px 15px", fontSize:"13px", lineHeight:1.6 }}>{msg.content}</div>
                  : <div className="glass" style={{ padding:"11px 12px", border:"1px solid rgba(255,255,255,.08)", borderRadius:"15px 15px 15px 4px" }}>
                      {parts.map((p,j) => p.type==="yt"
                        ? <a key={j} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:"7px", padding:"7px 9px", background:"rgba(255,0,0,.08)", border:"1px solid rgba(255,0,0,.2)", borderRadius:"8px", textDecoration:"none", color:"var(--txt)", marginTop:"6px" }}>
                            <div style={{ position:"relative", width:"56px", height:"36px", borderRadius:"5px", overflow:"hidden", background:"#000", flexShrink:0 }}>
                              <img src={`https://img.youtube.com/vi/${p.vid}/mqdefault.jpg`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
                              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ width:"17px", height:"17px", background:"rgba(255,0,0,.85)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"7px", color:"#fff" }}>▶</div></div>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <Mono style={{ color:"#ff4444", marginBottom:"2px", letterSpacing:"1px" }}>▶ TUTORIAL</Mono>
                              <div style={{ fontSize:"10px", color:"var(--mut)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.url}</div>
                            </div>
                          </a>
                        : <div key={j} style={{ fontSize:"13px", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{p.c}</div>
                      )}
                    </div>
                }
                <Mono style={{ fontSize:"9px", textAlign:isU?"right":"left", paddingLeft:"2px" }}>{msg.time}</Mono>
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", marginBottom:"11px" }}>
            <LogoIcon/>
            <div className="glass" style={{ padding:"11px 13px", display:"flex", gap:"4px", alignItems:"center", border:"1px solid rgba(255,255,255,.08)", borderRadius:"15px 15px 15px 4px" }}>
              {[0,1,2].map(i=><div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:"var(--mut)", animation:`pulse 1.2s ease-in-out ${i*.2}s infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={botRef}/>
      </div>
      {showQ && (
        <div style={{ padding:"0 12px 7px", flexShrink:0 }}>
          <Mono style={{ marginBottom:"6px" }}>QUICK QUESTIONS</Mono>
          <div style={{ display:"flex", gap:"6px", overflowX:"auto", paddingBottom:"3px" }}>
            {QPS.map((q,i)=><button key={i} onClick={()=>send(q.t)} style={{ padding:"5px 10px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"50px", color:"var(--txt)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fb)", whiteSpace:"nowrap", flexShrink:0 }}>{q.i} {q.l}</button>)}
          </div>
        </div>
      )}
      <div className="glass" style={{ padding:"9px 12px 22px", borderTop:"1px solid rgba(255,255,255,.08)", flexShrink:0 }}>
        <div style={{ display:"flex", gap:"7px", alignItems:"flex-end" }}>
          <div style={{ flex:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"12px", padding:"7px 12px" }}>
            <textarea ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }} placeholder="Ask about exercises, nutrition..." rows={1} style={{ width:"100%", background:"none", border:"none", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none", lineHeight:1.5, maxHeight:"70px", overflowY:"auto" }}/>
          </div>
          <button onClick={()=>send()} disabled={!inp.trim()||loading} style={{ width:"38px", height:"38px", borderRadius:"50%", background:inp.trim()&&!loading?"var(--acc)":"rgba(255,255,255,.08)", border:"none", cursor:inp.trim()&&!loading?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0, color:inp.trim()&&!loading?"#000":"var(--mut)" }}>
            {loading ? <div style={{ width:"13px", height:"13px", borderRadius:"50%", border:"2px solid var(--mut)", borderTopColor:"transparent", animation:"spin .8s linear infinite" }}/> : "↑"}
          </button>
        </div>
        {!showQ && <button onClick={()=>setShowQ(true)} style={{ marginTop:"5px", background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>⚡ Quick prompts</button>}
      </div>
    </HeroBg>
  );
}

// ─── Trainer Plan Screen ───────────────────────────────────────────────────────
function TrainerUpgradeScreen({ clientCount, onUpgraded, onClose }) {
  const [sel, setSel] = useState("starter");
  const [promoIn, setPromoIn] = useState("");
  const [promo, setPromo] = useState(null);
  const [promoErr, setPromoErr] = useState("");
  const [showPP, setShowPP] = useState(false);

  function tryPromo() {
    const r = applyPromo(promoIn);
    if (r) { setPromo({ code:promoIn.toUpperCase(), ...r }); setPromoErr(""); }
    else { setPromoErr("Invalid code. Try: FIT2ALL50, TRAINERLAUNCH, STARTER10, PRO20, UNLIMITED30"); setPromo(null); }
  }

  const plan = TRAINER_PLANS[sel];
  const base = parseFloat(plan.price.replace("$",""));
  const finalAmt = promo ? Math.max(0, base*(1-promo.discount/100)).toFixed(2) : base.toFixed(2);

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:550, overflowY:"auto", animation:"fadeIn .2s" }}>
      <HeroBg src={IMG.trainer} ov="linear-gradient(180deg,rgba(10,10,10,.1) 0%,rgba(10,10,10,.95) 60%,rgba(10,10,10,1) 100%)" style={{ height:"190px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 20px 20px", position:"relative" }}>
        <BackBtn onClick={onClose}/>
        <Mono style={{ color:"var(--tr)", marginBottom:"5px" }}>UPGRADE YOUR PLAN</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"26px", letterSpacing:"2px", lineHeight:1 }}>ADD MORE <span style={{ color:"var(--tr)" }}>CLIENTS</span></div>
        <div style={{ fontSize:"11px", color:"rgba(255,255,255,.5)", marginTop:"4px" }}>You have {clientCount} client{clientCount!==1?"s":""} — free plan includes 1</div>
      </HeroBg>
      <div style={{ padding:"18px" }}>
        <Mono style={{ marginBottom:"10px" }}>SELECT YOUR PLAN</Mono>
        <div style={{ display:"flex", flexDirection:"column", gap:"9px", marginBottom:"18px" }}>
          {["starter","pro","unlimited"].map(pid => {
            const p = TRAINER_PLANS[pid]; const isSel = sel===pid;
            return (
              <button key={pid} onClick={()=>setSel(pid)} style={{ all:"unset", cursor:"pointer", display:"block" }}>
                <Card style={{ padding:"15px", border:`2px solid ${isSel?p.color:"rgba(255,255,255,.06)"}`, transition:"border-color .2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
                      <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:isSel?p.color:"rgba(255,255,255,.15)", border:`2px solid ${isSel?p.color:"rgba(255,255,255,.2)"}`, flexShrink:0 }}/>
                      <div>
                        <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:isSel?p.color:"var(--txt)", letterSpacing:"2px" }}>{p.name}</div>
                        <Mono>{p.clientLimit===Infinity?"Unlimited clients":"Up to "+p.clientLimit+" clients"}</Mono>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"var(--fd)", fontSize:"19px", color:isSel?p.color:"var(--txt)" }}>{p.price}</div>
                      <Mono>{p.period}</Mono>
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
        {/* Features */}
        <Card style={{ padding:"14px", marginBottom:"18px" }}>
          <Mono style={{ marginBottom:"11px" }}>PLAN INCLUDES</Mono>
          {(TP_FEATURES[sel]||[]).map((f,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"7px 0", borderBottom:i<(TP_FEATURES[sel]||[]).length-1?"1px solid rgba(255,255,255,.04)":"none" }}>
              <span style={{ width:"16px", height:"16px", borderRadius:"50%", background:f.y?TRAINER_PLANS[sel].color+"20":"rgba(255,255,255,.04)", border:`1px solid ${f.y?TRAINER_PLANS[sel].color:"rgba(255,255,255,.08)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:f.y?TRAINER_PLANS[sel].color:"var(--mut)", flexShrink:0 }}>{f.y?"✓":"✕"}</span>
              <span style={{ fontSize:"13px", flex:1 }}>{f.l}</span>
              {f.d && <span style={{ fontSize:"11px", color:TRAINER_PLANS[sel].color, fontFamily:"var(--fm)" }}>{f.d}</span>}
            </div>
          ))}
        </Card>
        {/* Promo */}
        <Card style={{ padding:"14px", marginBottom:"18px" }}>
          <Mono style={{ marginBottom:"9px" }}>🎟️ PROMO CODE</Mono>
          <div style={{ display:"flex", gap:"7px" }}>
            <input value={promoIn} onChange={e=>{ setPromoIn(e.target.value.toUpperCase()); setPromoErr(""); }} placeholder="Enter promo code" style={{ flex:1, padding:"9px 12px", background:"rgba(255,255,255,.04)", border:`1px solid ${promo?"var(--a3)":promoErr?"var(--a2)":"rgba(255,255,255,.1)"}`, borderRadius:"9px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fm)", outline:"none", letterSpacing:"1px" }}/>
            <button onClick={tryPromo} disabled={!promoIn.trim()} style={{ padding:"9px 14px", background:promoIn.trim()?"var(--tr)":"rgba(255,255,255,.06)", border:"none", borderRadius:"9px", color:promoIn.trim()?"#fff":"var(--mut)", cursor:promoIn.trim()?"pointer":"default", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>APPLY</button>
          </div>
          {promoErr && <div style={{ fontSize:"11px", color:"var(--a2)", marginTop:"6px", lineHeight:1.5 }}>{promoErr}</div>}
          {promo && (
            <div style={{ marginTop:"8px", padding:"8px 11px", background:"rgba(147,51,234,.1)", border:"1px solid rgba(147,51,234,.25)", borderRadius:"8px", display:"flex", alignItems:"center", gap:"7px" }}>
              <span style={{ fontSize:"15px" }}>🎉</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"13px", color:"var(--a3)", fontWeight:600 }}>{promo.code} applied!</div>
                <Mono style={{ color:"var(--mut)" }}>{promo.label}</Mono>
              </div>
              <button onClick={()=>{ setPromo(null); setPromoIn(""); }} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"12px" }}>✕</button>
            </div>
          )}
        </Card>
        <PBtn onClick={()=>setShowPP(true)} col={plan.color} style={{ color:"#fff", fontSize:"15px", letterSpacing:"2px", marginBottom:"9px" }}>
          💳 PAY ${finalAmt}/mo via PayPal
        </PBtn>
        <Mono style={{ textAlign:"center" }}>Secure checkout · Cancel anytime</Mono>
      </div>
      {showPP && <PayPalModal planName={"Trainer "+plan.name} amount={finalAmt} onSuccess={()=>onUpgraded(sel)} onClose={()=>setShowPP(false)}/>}
    </div>
  );
}


// ─── Packages Manager ─────────────────────────────────────────────────────────
function PackagesManager({ packages, setPackages, paypalEmail, bankDetails, onClose }) {
  const [editing, setEditing] = useState(null);
  const [newPkg, setNewPkg] = useState({ name:"", sessions:"4", price:"", desc:"", perks:"" });
  const [showNew, setShowNew] = useState(false);

  function save() {
    if (!newPkg.name||!newPkg.price) return;
    if (editing) {
      setPackages(p=>p.map(x=>x.id===editing?{...newPkg,id:editing}:x));
    } else {
      setPackages(p=>[...p,{...newPkg,id:Date.now()}]);
    }
    setEditing(null); setShowNew(false); setNewPkg({name:"",sessions:"4",price:"",desc:"",perks:""});
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:600, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
      <div style={{ padding:"14px 18px", background:"rgba(15,15,15,.98)", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:"11px", flexShrink:0 }}>
        <div style={{ flex:1 }}><div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", color:"var(--acc)" }}>📦 PT PACKAGES</div><Mono>Create & manage your training packages</Mono></div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"6px 13px", fontSize:"11px", fontFamily:"var(--fm)" }}>← BACK</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
        {/* Payment info */}
        <Card style={{ padding:"13px", marginBottom:"14px", border:"1px solid rgba(255,140,0,.2)" }}>
          <Mono style={{ color:"var(--a3)", marginBottom:"7px" }}>CLIENTS PAY VIA</Mono>
          <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)" }}>
            {paypalEmail && <div>💳 PayPal: <span style={{ color:"var(--acc)" }}>{paypalEmail}</span></div>}
            {bankDetails && <div style={{ marginTop:"4px" }}>🏦 Bank: <span style={{ color:"var(--acc)" }}>{bankDetails}</span></div>}
            {!paypalEmail && !bankDetails && <div style={{ color:"var(--mut)" }}>No payment method set. Go to Profile → Payment Settings.</div>}
          </div>
        </Card>

        {/* Package list */}
        <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"10px" }}>YOUR PACKAGES ({packages.length})</div>
        {packages.map(pkg=>(
          <Card key={pkg.id} style={{ padding:"14px", marginBottom:"9px", border:"1px solid rgba(124,58,237,.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
              <div>
                <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--acc)", letterSpacing:"1px" }}>{pkg.name}</div>
                <Mono style={{ marginTop:"2px" }}>{pkg.sessions} sessions · <span style={{ color:"var(--a3)" }}>${pkg.price}/mo</span></Mono>
              </div>
              <div style={{ display:"flex", gap:"6px" }}>
                <button onClick={()=>{ setNewPkg({...pkg}); setEditing(pkg.id); setShowNew(true); }} style={{ padding:"4px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"6px", color:"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)" }}>EDIT</button>
                <button onClick={()=>setPackages(p=>p.filter(x=>x.id!==pkg.id))} style={{ padding:"4px 10px", background:"rgba(255,61,107,.08)", border:"1px solid rgba(255,61,107,.2)", borderRadius:"6px", color:"var(--a2)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)" }}>DEL</button>
              </div>
            </div>
            {pkg.desc && <div style={{ fontSize:"12px", color:"rgba(255,255,255,.55)", marginBottom:"3px" }}>{pkg.desc}</div>}
            {pkg.perks && <div style={{ fontSize:"11px", color:"var(--a3)" }}>✓ {pkg.perks}</div>}
          </Card>
        ))}

        <button onClick={()=>{ setNewPkg({name:"",sessions:"4",price:"",desc:"",perks:""}); setEditing(null); setShowNew(true); }} style={{ width:"100%", padding:"13px", background:"rgba(255,112,67,.1)", border:"2px dashed rgba(255,112,67,.3)", borderRadius:"12px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px", marginTop:"8px" }}>+ CREATE NEW PACKAGE</button>

        {showNew && (
          <Sheet onClose={()=>setShowNew(false)} title={editing?"EDIT PACKAGE":"NEW PACKAGE"} acc="var(--tr)">
            <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
              <Field lbl="PACKAGE NAME" val={newPkg.name} set={v=>setNewPkg(p=>({...p,name:v}))} ph="e.g. Starter Pack" acc="var(--tr)"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div>
                  <Mono style={{ marginBottom:"7px" }}>SESSIONS</Mono>
                  <select value={newPkg.sessions} onChange={e=>setNewPkg(p=>({...p,sessions:e.target.value}))} style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                    {["1","2","4","6","8","10","12","16","20"].map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <Field lbl="PRICE (USD)" val={newPkg.price} set={v=>setNewPkg(p=>({...p,price:v}))} ph="49.99" acc="var(--tr)" type="number"/>
              </div>
              <Field lbl="DESCRIPTION" val={newPkg.desc} set={v=>setNewPkg(p=>({...p,desc:v}))} ph="What's included" acc="var(--tr)"/>
              <Field lbl="PERKS (optional)" val={newPkg.perks} set={v=>setNewPkg(p=>({...p,perks:v}))} ph="e.g. Nutrition guide, Check-ins" acc="var(--tr)"/>
              <PBtn onClick={save} disabled={!newPkg.name||!newPkg.price} col="var(--tr)" style={{ color:"#fff" }}>{editing?"SAVE CHANGES":"CREATE PACKAGE"}</PBtn>
            </div>
          </Sheet>
        )}
      </div>
    </div>
  );
}

// ─── Client Full Profile ───────────────────────────────────────────────────────
function ClientProfile({ client, notes, onBack, onUpdate, onDelete, onSuspend, packages, paypalEmail, clientPrograms, setClientPrograms, setShowSendWorkout }) {
  const [view, setView] = useState("profile"); // profile | program | packages
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({...client});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [genType, setGenType] = useState("ai");
  const prog = (clientPrograms||{})[client.id];

  const age = client.dob ? new Date().getFullYear() - new Date(client.dob).getFullYear() : null;
  const isSuspended = client.status === "suspended";

  function sendProgram() {
    if (!client.email || !prog) return;
    const sub = encodeURIComponent("Fit2All — New Workout Program from your Trainer");
    const days = prog.phases?.[0]?.days||prog.weeklySchedule||[];
    const sched = days.slice(0,3).map(d=>"• "+d.day+": "+(d.sessionName||d.focus)).join("\n");
    const body = encodeURIComponent(
      "Hi "+client.name+"! 💪\n\n"+
      "Your trainer has created a new program for you!\n\n"+
      "📋 "+prog.programName+"\n\n"+
      "WEEKLY SCHEDULE PREVIEW:\n"+sched+"\n\nAnd more...\n\n"+
      "Log in to your Fit2All Member account to see your full program:\nhttps://fit2all.vercel.app\n\n"+
      "— Your Personal Trainer"
    );
    window.open("mailto:"+client.email+"?subject="+sub+"&body="+body,"_blank");
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ position:"relative", height:"180px" }}>
        <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=70" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.4) saturate(.6)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(10,10,10,.2) 0%,rgba(10,10,10,.9) 100%)" }}/>
        <button onClick={onBack} style={{ position:"absolute", top:"14px", left:"14px", background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"8px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"6px 11px", fontSize:"11px", fontFamily:"var(--fm)" }}>← CLIENTS</button>
        {isSuspended && <div style={{ position:"absolute", top:"14px", right:"14px", padding:"3px 10px", background:"rgba(255,61,107,.2)", border:"1px solid rgba(255,61,107,.4)", borderRadius:"50px", fontSize:"10px", color:"var(--a2)", fontFamily:"var(--fm)" }}>SUSPENDED</div>}
        <div style={{ position:"absolute", bottom:"14px", left:"18px", right:"18px", display:"flex", alignItems:"flex-end", gap:"12px" }}>
          <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"linear-gradient(135deg,var(--tr),#ff8a50)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"20px", border:"2px solid rgba(255,112,67,.4)", flexShrink:0 }}>{client.av}</div>
          <div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px", color:"var(--txt)" }}>{client.name}</div>
            <Mono style={{ color:"var(--tr)" }}>{client.goal}{age?" · Age "+age:""}</Mono>
          </div>
        </div>
      </div>

      {/* Sub nav */}
      <div style={{ display:"flex", gap:"6px", padding:"12px 18px 0", borderBottom:"1px solid rgba(255,255,255,.06)", flexShrink:0 }}>
        {[["profile","👤 Profile"],["program","💪 Program"],["packages","📦 Packages"]].map(([v,lbl])=>(
          <button key={v} onClick={()=>setView(v)} style={{ padding:"7px 13px", background:view===v?"var(--tr)":"rgba(255,255,255,.04)", border:`1px solid ${view===v?"var(--tr)":"rgba(255,255,255,.07)"}`, borderRadius:"50px", color:view===v?"#fff":"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fb)", fontWeight:600 }}>{lbl}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"14px 18px 80px" }}>

        {/* ── PROFILE VIEW ── */}
        {view==="profile" && (
          <div>
            <Card style={{ padding:"14px", marginBottom:"11px", border:"1px solid rgba(255,112,67,.18)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", color:"var(--tr)" }}>CLIENT DETAILS</div>
                <button onClick={()=>setEditing(!editing)} style={{ padding:"5px 12px", background:editing?"var(--tr)":"rgba(255,112,67,.12)", border:"1px solid rgba(255,112,67,.3)", borderRadius:"7px", color:editing?"#fff":"var(--tr)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)" }}>{editing?"SAVE ✓":"EDIT"}</button>
              </div>
              {editing ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <Field lbl="NAME" val={editData.name} set={v=>setEditData(p=>({...p,name:v}))} ph="Full name" acc="var(--tr)"/>
                  <Field lbl="EMAIL" val={editData.email||""} set={v=>setEditData(p=>({...p,email:v}))} ph="client@email.com" acc="var(--tr)" type="email"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                    <div>
                      <Mono style={{ marginBottom:"6px" }}>SEX</Mono>
                      <select value={editData.sex||"Male"} onChange={e=>setEditData(p=>({...p,sex:e.target.value}))} style={{ width:"100%", padding:"9px 11px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"9px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                        {["Male","Female","Other"].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Mono style={{ marginBottom:"6px" }}>DATE OF BIRTH</Mono>
                      <input type="date" value={editData.dob||""} onChange={e=>setEditData(p=>({...p,dob:e.target.value}))} style={{ width:"100%", padding:"9px 11px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"9px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none", colorScheme:"dark" }}/>
                    </div>
                  </div>
                  <div>
                    <Mono style={{ marginBottom:"6px" }}>GOAL</Mono>
                    <select value={editData.goal} onChange={e=>setEditData(p=>({...p,goal:e.target.value}))} style={{ width:"100%", padding:"9px 11px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"9px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                      {["Muscle Gain","Fat Loss","Endurance","Flexibility","General Fitness","Sport Performance"].map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <Field lbl="INJURIES / LIMITATIONS" val={editData.injuries||""} set={v=>setEditData(p=>({...p,injuries:v}))} ph="e.g. Lower back pain..." acc="var(--tr)" rows={2}/>
                  <PBtn onClick={()=>{ onUpdate(editData); setEditing(false); }} col="var(--tr)" style={{ color:"#fff" }}>SAVE CHANGES</PBtn>
                </div>
              ) : (
                <div>
                  {[["Email",client.email||"—"],["Sex",client.sex||"—"],["Age",age?age+" years":"—"],["Injuries",client.injuries||"None reported"],["Sessions",client.sessions+" completed"],["Progress",client.progress+"%"],["Streak",client.streak+" days"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                      <span style={{ fontSize:"13px", color:"var(--mut)" }}>{k}</span>
                      <span style={{ fontSize:"13px", fontWeight:500, color:k==="Injuries"&&v!=="None reported"?"var(--yw)":"var(--txt)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent notes */}
            {(notes||[]).slice(0,3).length>0 && (
              <Card style={{ padding:"13px", marginBottom:"11px" }}>
                <Mono style={{ marginBottom:"9px", color:"var(--tr)" }}>RECENT NOTES</Mono>
                {(notes||[]).slice(0,3).map((n,i)=>(
                  <div key={i} style={{ padding:"8px 0", borderBottom:i<2?"1px solid rgba(255,255,255,.05)":"none" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}><Mono>{n.d}</Mono><span>{n.m}</span></div>
                    <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)" }}>{n.n}</div>
                  </div>
                ))}
              </Card>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
              <button onClick={()=>setShowSendWorkout(client.id)} style={{ flex:1, padding:"11px", background:"rgba(232,41,30,.1)", border:"1px solid rgba(232,41,30,.25)", borderRadius:"10px", color:"var(--rd)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>💪 SEND WORKOUT</button>
              <button onClick={()=>onSuspend(client.id)} style={{ flex:1, padding:"11px", background:isSuspended?"rgba(34,197,94,.1)":"rgba(255,140,0,.08)", border:`1px solid ${isSuspended?"rgba(34,197,94,.25)":"rgba(255,140,0,.2)"}`, borderRadius:"10px", color:isSuspended?"var(--a3)":"var(--yw)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>
                {isSuspended?"RESTORE":"SUSPEND"}
              </button>
            </div>
            {showDeleteConfirm ? (
              <Card style={{ padding:"14px", border:"1px solid rgba(255,61,107,.3)", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"var(--mut)", marginBottom:"11px" }}>Delete {client.name}? This cannot be undone.</div>
                <div style={{ display:"flex", gap:"9px" }}>
                  <button onClick={()=>setShowDeleteConfirm(false)} style={{ flex:1, padding:"10px", background:"transparent", border:"1px solid rgba(255,255,255,.1)", borderRadius:"9px", color:"var(--mut)", cursor:"pointer" }}>Cancel</button>
                  <button onClick={()=>{ onDelete(client.id); onBack(); }} style={{ flex:1, padding:"10px", background:"var(--a2)", border:"none", borderRadius:"9px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>DELETE</button>
                </div>
              </Card>
            ) : (
              <button onClick={()=>setShowDeleteConfirm(true)} style={{ width:"100%", padding:"10px", background:"transparent", border:"1px solid rgba(255,61,107,.2)", borderRadius:"9px", color:"var(--a2)", cursor:"pointer", fontSize:"13px" }}>🗑 Delete Client</button>
            )}
          </div>
        )}

        {/* ── PROGRAM VIEW ── */}
        {view==="program" && (
          <div>
            {prog ? (
              <div>
                <Card style={{ padding:"13px", marginBottom:"11px", border:"1px solid rgba(124,58,237,.25)" }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"4px" }}>{prog.programName}</div>
                  <div style={{ fontSize:"12px", color:"rgba(255,255,255,.55)", lineHeight:1.6, marginBottom:"10px" }}>{prog.overview}</div>
                  <div style={{ display:"flex", gap:"7px" }}>
                    <button onClick={()=>setShowProgramBuilder(true)} style={{ flex:1, padding:"9px", background:"rgba(255,112,67,.1)", border:"1px solid rgba(255,112,67,.25)", borderRadius:"9px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✏️ EDIT</button>
                    <button onClick={sendProgram} disabled={!client.email} style={{ flex:1, padding:"9px", background:client.email?"rgba(124,58,237,.15)":"rgba(255,255,255,.05)", border:`1px solid ${client.email?"rgba(124,58,237,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"9px", color:client.email?"var(--acc)":"var(--mut)", cursor:client.email?"pointer":"default", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>📧 SEND TO CLIENT</button>
                  </div>
                </Card>
                <ProgramView prog={prog}/>
              </div>
            ) : (
              <Card style={{ padding:"24px", textAlign:"center", border:"1px solid rgba(255,255,255,.08)" }}>
                <div style={{ fontSize:"40px", marginBottom:"12px" }}>💪</div>
                <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"8px" }}>NO PROGRAM YET</div>
                <div style={{ fontSize:"13px", color:"var(--mut)", marginBottom:"18px", lineHeight:1.6 }}>Create a program for {client.name} to send directly to their account.</div>
                <div style={{ display:"flex", gap:"9px" }}>
                  <button onClick={()=>{ setGenType("ai"); setShowProgramBuilder(true); }} style={{ flex:1, padding:"12px", background:"var(--acc)", border:"none", borderRadius:"10px", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>🤖 AI GENERATE</button>
                  <button onClick={()=>{ setGenType("manual"); setShowProgramBuilder(true); }} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"10px", color:"var(--txt)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>✏️ MANUAL</button>
                </div>
              </Card>
            )}
            {showProgramBuilder && (
              <ClientProgramBuilder
                client={client}
                existing={prog}
                onSave={p=>{ setClientPrograms(prev=>({...prev,[client.id]:p})); setShowProgramBuilder(false); }}
                onClose={()=>setShowProgramBuilder(false)}
              />
            )}
          </div>
        )}

        {/* ── PACKAGES VIEW ── */}
        {view==="packages" && (
          <div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"11px", color:"var(--acc)" }}>PACKAGES AVAILABLE TO {client.name.split(" ")[0].toUpperCase()}</div>
            {packages.length===0 ? (
              <Card style={{ padding:"20px", textAlign:"center" }}><Mono>No packages created yet. Add packages in your Profile tab.</Mono></Card>
            ) : packages.map(pkg=>(
              <Card key={pkg.id} style={{ padding:"14px", marginBottom:"9px", border:"1px solid rgba(124,58,237,.2)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--acc)", letterSpacing:"1px" }}>{pkg.name}</div>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:"var(--a3)" }}>${pkg.price}</div>
                </div>
                <Mono style={{ marginBottom:"4px" }}>{pkg.sessions} sessions</Mono>
                {pkg.desc && <div style={{ fontSize:"12px", color:"rgba(255,255,255,.55)", marginBottom:"3px" }}>{pkg.desc}</div>}
                {pkg.perks && <div style={{ fontSize:"11px", color:"var(--a3)" }}>✓ {pkg.perks}</div>}
                <div style={{ marginTop:"10px", padding:"8px 11px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"8px" }}>
                  <Mono style={{ color:"var(--acc)", marginBottom:"3px" }}>CLIENT PAYS VIA</Mono>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,.5)" }}>{paypalEmail||"PayPal (not set)"}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Client Program Builder ────────────────────────────────────────────────────
function ClientProgramBuilder({ client, existing, onSave, onClose }) {
  const [mode, setMode] = useState(existing?"view":"choose");
  const [genLoading, setGenLoading] = useState(false);
  const [prog, setProg] = useState(existing||null);
  const [phase, setPhase] = useState(0);
  const phases = ["Analysing client profile...","Building personalised splits...","Calculating overload...","Finalising program..."];

  async function generateAI() {
    setMode("generating"); setGenLoading(true);
    const cycler = setInterval(()=>setPhase(p=>(p+1)%phases.length),1500);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:6000,
          system:"You are an elite personal trainer. Create a detailed 4-week periodized program. Return ONLY valid JSON.",
          messages:[{role:"user",content:"Create 4-week program JSON for client: Name:"+client.name+", Goal:"+client.goal+", Sex:"+(client.sex||"unknown")+", Injuries:"+(client.injuries||"none")+". Use same JSON structure as before with phases, exercises, sets/reps/rest/tempo/rpe/cues/progression fields. Be thorough and professional."}]})
      });
      const d = await res.json();
      const raw = d.content?.[0]?.text||"";
      clearInterval(cycler);
      const parsed = JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim());
      setProg(parsed); setMode("preview"); setGenLoading(false);
    } catch {
      clearInterval(cycler);
      setProg({programName:client.name+"'s Custom Plan",overview:"Personalised "+client.goal+" program.",phases:[{week:1,theme:"Foundation",focus:"Establish baseline",days:[{day:"Monday",sessionName:"Full Body A",muscleGroups:["Full Body"],duration:"50 min",intensity:"Moderate",warmup:"5 min dynamic",exercises:[{name:"Squat",sets:"3",reps:"10",rest:"90s",tempo:"3-1-1",rpe:"7",cues:"Depth below parallel",progression:"Add 2.5kg when all reps complete",muscleTarget:"Quads, glutes"},{name:"Push-ups",sets:"3",reps:"12",rest:"60s",tempo:"2-1-1",rpe:"6",cues:"Core tight",progression:"+2 reps weekly",muscleTarget:"Chest, triceps"}],cooldown:"5 min stretch",sessionNotes:"Focus on form this week"}]}],weeklyGoals:["Complete all sessions","Log weights","Track nutrition"],progressionMarkers:["Adding weight each session","Feel stronger by week 2"],progressionProtocol:"Add weight when reps feel easy",nutritionGuidance:{preworkout:"Light meal 90 min before",postworkout:"Protein within 30 min",dailyProtein:"1.8g/kg bodyweight",hydration:"3L daily"},recoveryProtocol:"Sleep 8 hours, stretch daily"});
      setMode("preview"); setGenLoading(false);
    }
  }

  if (mode==="choose") return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700, animation:"fadeIn .2s" }}>
      <Card style={{ padding:"26px 22px", width:"300px", textAlign:"center" }}>
        <div style={{ fontSize:"36px", marginBottom:"12px" }}>💪</div>
        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px", marginBottom:"6px" }}>CREATE PROGRAM</div>
        <div style={{ fontSize:"13px", color:"var(--mut)", marginBottom:"20px" }}>for {client.name}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
          <PBtn onClick={generateAI} col="var(--acc)" style={{ color:"#000" }}>🤖 AI GENERATE</PBtn>
          <button onClick={onClose} style={{ padding:"12px", background:"transparent", border:"1px solid rgba(255,255,255,.1)", borderRadius:"var(--r)", color:"var(--mut)", cursor:"pointer", fontSize:"13px" }}>Cancel</button>
        </div>
      </Card>
    </div>
  );

  if (mode==="generating") return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700 }}>
      <Card style={{ padding:"28px 22px", width:"300px", textAlign:"center" }}>
        <div style={{ width:"50px", height:"50px", borderRadius:"50%", border:"3px solid var(--acc)", borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 16px" }}/>
        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"8px" }}>GENERATING</div>
        <Mono style={{ color:"var(--acc)" }}>{phases[phase]}</Mono>
      </Card>
    </div>
  );

  if (mode==="preview" && prog) return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:700, display:"flex", flexDirection:"column", animation:"fadeIn .2s", overflowY:"auto" }}>
      <div style={{ padding:"14px 18px", background:"rgba(15,15,15,.98)", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
        <div style={{ flex:1 }}><div style={{ fontFamily:"var(--fd)", fontSize:"14px", color:"var(--acc)" }}>{prog.programName}</div><Mono>Review before saving</Mono></div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"6px 12px", fontSize:"11px", fontFamily:"var(--fm)" }}>CANCEL</button>
        <button onClick={()=>onSave(prog)} style={{ padding:"8px 16px", background:"var(--tr)", border:"none", borderRadius:"8px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>SAVE ✓</button>
      </div>
      <div style={{ flex:1, padding:"14px 18px", overflowY:"auto" }}>
        <ProgramView prog={prog}/>
      </div>
    </div>
  );
  return null;
}


// ─── Send Workout Sheet ────────────────────────────────────────────────────────
function SendWorkoutSheet({ client, onClose }) {
  const [workoutType, setWorkoutType] = useState("Full Body Strength");
  const [week, setWeek] = useState("Week 1");
  const [customNote, setCustomNote] = useState("");
  const [sent, setSent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [workout, setWorkout] = useState(null);

  const WORKOUT_TEMPLATES = {
    "Full Body Strength": [
      { name:"Barbell Squat", sets:"4", reps:"8-10", rest:"90s", notes:"Depth below parallel, brace core" },
      { name:"Bench Press", sets:"4", reps:"8-10", rest:"90s", notes:"Retract scapula, controlled descent" },
      { name:"Deadlift", sets:"3", reps:"6-8", rest:"2min", notes:"Hip hinge, neutral spine" },
      { name:"Overhead Press", sets:"3", reps:"10-12", rest:"75s", notes:"Squeeze glutes, lock core" },
      { name:"Pull-ups", sets:"3", reps:"8-10", rest:"75s", notes:"Full ROM, no kipping" },
      { name:"Plank", sets:"3", reps:"45s", rest:"45s", notes:"Neutral spine, breathe steadily" },
    ],
    "Push Day": [
      { name:"Bench Press", sets:"4", reps:"8-10", rest:"90s", notes:"Control descent to chest" },
      { name:"Incline DB Press", sets:"3", reps:"10-12", rest:"75s", notes:"Upper chest focus" },
      { name:"Overhead Press", sets:"3", reps:"10-12", rest:"75s", notes:"Core tight throughout" },
      { name:"Lateral Raises", sets:"3", reps:"15", rest:"60s", notes:"Lead with elbows, no swinging" },
      { name:"Tricep Pushdown", sets:"3", reps:"12-15", rest:"60s", notes:"Elbows pinned to sides" },
    ],
    "Pull Day": [
      { name:"Deadlift", sets:"4", reps:"6-8", rest:"2min", notes:"Hip hinge, bar close to body" },
      { name:"Pull-ups", sets:"4", reps:"6-10", rest:"90s", notes:"Elbows down, not back" },
      { name:"Seated Row", sets:"3", reps:"10-12", rest:"75s", notes:"Squeeze shoulder blades" },
      { name:"Face Pulls", sets:"3", reps:"15-20", rest:"60s", notes:"External rotation at end" },
      { name:"Barbell Curl", sets:"3", reps:"10-12", rest:"60s", notes:"Fixed elbows, full ROM" },
    ],
    "Leg Day": [
      { name:"Barbell Squat", sets:"4", reps:"8-10", rest:"2min", notes:"Below parallel, drive knees out" },
      { name:"Romanian Deadlift", sets:"3", reps:"10-12", rest:"90s", notes:"Feel the hamstring stretch" },
      { name:"Leg Press", sets:"3", reps:"12-15", rest:"75s", notes:"Full depth, controlled" },
      { name:"Bulgarian Split Squat", sets:"3", reps:"10 each", rest:"75s", notes:"Torso upright" },
      { name:"Calf Raises", sets:"4", reps:"15-20", rest:"60s", notes:"Pause at top, full ROM" },
    ],
    "HIIT Cardio": [
      { name:"Burpees", sets:"4", reps:"45s on / 15s off", rest:"60s between rounds", notes:"Full extension at top" },
      { name:"Mountain Climbers", sets:"4", reps:"45s on / 15s off", rest:"60s", notes:"Hips level, fast pace" },
      { name:"Jump Squats", sets:"4", reps:"45s on / 15s off", rest:"60s", notes:"Land softly, full depth" },
      { name:"High Knees", sets:"4", reps:"45s on / 15s off", rest:"60s", notes:"Drive knees to chest" },
      { name:"Box Jumps", sets:"3", reps:"10", rest:"60s", notes:"Soft landing, step down" },
    ],
    "Core & Mobility": [
      { name:"Plank", sets:"3", reps:"60s", rest:"45s", notes:"Neutral spine, no hip sag" },
      { name:"Dead Bug", sets:"3", reps:"10 each side", rest:"45s", notes:"Lower back flat to floor" },
      { name:"Russian Twist", sets:"3", reps:"20", rest:"45s", notes:"Controlled rotation" },
      { name:"Hip 90/90 Stretch", sets:"2", reps:"60s each side", rest:"30s", notes:"Breathe into the stretch" },
      { name:"Pigeon Pose", sets:"2", reps:"90s each", rest:"30s", notes:"Full hip opener" },
    ],
  };

  async function genAIWorkout() {
    setGenerating(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500,
          messages:[{ role:"user", content:`Create a single workout session for: Name:${client?.name}, Goal:${client?.goal}${client?.injuries?", Injuries:"+client.injuries:""}. Type:${workoutType}. Return ONLY JSON: {"sessionName":"...","warmup":"5 min specific warmup","exercises":[{"name":"...","sets":"3","reps":"10","rest":"60s","notes":"technique cue"}],"cooldown":"5 min cooldown","coachNote":"motivating note from trainer"}` }]
        })
      });
      const d = await res.json();
      const raw = d.content?.[0]?.text || "";
      setWorkout(JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim()));
    } catch {
      setWorkout({ sessionName:workoutType, warmup:"5 min light cardio + dynamic stretching", exercises:WORKOUT_TEMPLATES[workoutType]||WORKOUT_TEMPLATES["Full Body Strength"], cooldown:"5 min static stretching", coachNote:"Great session planned for you! Push hard today." });
    }
    setGenerating(false);
  }

  function sendWorkout() {
    if (!client?.email) { setSent(true); return; }
    const w = workout || { sessionName:workoutType, exercises:WORKOUT_TEMPLATES[workoutType]||[] };
    const exerciseList = w.exercises.map(e=>"• "+e.name+": "+e.sets+" sets x "+e.reps+" | Rest: "+e.rest+"\n  Notes: "+e.notes).join("\n");
    const sub = encodeURIComponent("Fit2All — "+w.sessionName+" from your trainer");
    const body = encodeURIComponent(
      "Hi "+client.name+"! 💪\n\n"+
      "Here is your workout for "+week+":\n\n"+
      "🔥 SESSION: "+w.sessionName+"\n\n"+
      "🏃 WARM-UP\n"+(w.warmup||"5 min light cardio")+"\n\n"+
      "💪 EXERCISES\n"+exerciseList+"\n\n"+
      "❄️ COOL-DOWN\n"+(w.cooldown||"5 min stretching")+"\n\n"+
      "📝 COACH NOTES\n"+(customNote||w.coachNote||"Work hard, stay consistent!")+"\n\n"+
      "— Your Trainer via Fit2All\nhttps://fit2all.vercel.app"
    );
    window.open("mailto:"+client.email+"?subject="+sub+"&body="+body, "_blank");
    setSent(true);
  }

  if (sent) return (
    <Sheet onClose={onClose} title="WORKOUT SENT" acc="var(--tr)">
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ fontSize:"48px", marginBottom:"12px", animation:"pop .4s" }}>✅</div>
        <div style={{ fontFamily:"var(--fd)", fontSize:"18px", color:"var(--tr)", letterSpacing:"2px", marginBottom:"8px" }}>SENT!</div>
        <p style={{ fontSize:"13px", color:"var(--mut)", lineHeight:1.7 }}>Workout emailed to {client?.name}.</p>
        <PBtn onClick={onClose} col="var(--tr)" style={{ marginTop:"18px", color:"#fff" }}>CLOSE</PBtn>
      </div>
    </Sheet>
  );

  return (
    <Sheet onClose={onClose} title={"SEND WORKOUT — "+client?.name?.split(" ")[0]?.toUpperCase()} acc="var(--tr)">
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {/* Workout type */}
        <div>
          <Mono style={{ marginBottom:"8px" }}>WORKOUT TYPE</Mono>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {Object.keys(WORKOUT_TEMPLATES).map(t=>(
              <button key={t} onClick={()=>{ setWorkoutType(t); setWorkout(null); }} style={{ padding:"6px 11px", background:workoutType===t?"rgba(232,41,30,.15)":"rgba(255,255,255,.04)", border:`1px solid ${workoutType===t?"var(--rd)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:workoutType===t?"var(--rd)":"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{t}</button>
            ))}
          </div>
        </div>
        {/* Week */}
        <div>
          <Mono style={{ marginBottom:"8px" }}>WEEK / LABEL</Mono>
          <div style={{ display:"flex", gap:"6px" }}>
            {["Week 1","Week 2","Week 3","Week 4","Custom"].map(w=>(
              <button key={w} onClick={()=>setWeek(w)} style={{ padding:"5px 10px", background:week===w?"rgba(255,112,67,.15)":"rgba(255,255,255,.04)", border:`1px solid ${week===w?"var(--tr)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:week===w?"var(--tr)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{w}</button>
            ))}
          </div>
        </div>

        {/* AI Generate or use template */}
        <button onClick={genAIWorkout} disabled={generating} style={{ width:"100%", padding:"11px", background:generating?"rgba(255,255,255,.05)":"rgba(232,41,30,.1)", border:"1px solid rgba(232,41,30,.25)", borderRadius:"10px", color:generating?"var(--mut)":"var(--rd)", cursor:generating?"default":"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>
          {generating ? "⏳ GENERATING..." : "🤖 AI GENERATE CUSTOM WORKOUT"}
        </button>

        {/* Preview */}
        {(workout || WORKOUT_TEMPLATES[workoutType]) && (
          <Card style={{ padding:"13px", maxHeight:"200px", overflowY:"auto" }}>
            <Mono style={{ marginBottom:"8px", color:"var(--tr)" }}>WORKOUT PREVIEW</Mono>
            {(workout?.exercises || WORKOUT_TEMPLATES[workoutType] || []).slice(0,5).map((ex,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<4?"1px solid rgba(255,255,255,.05)":"none" }}>
                <span style={{ fontSize:"13px", fontWeight:500 }}>{ex.name}</span>
                <span style={{ fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{ex.sets}×{ex.reps}</span>
              </div>
            ))}
          </Card>
        )}

        <Field lbl="COACH NOTE (optional)" val={customNote} set={setCustomNote} ph="Words of motivation for your client..." acc="var(--tr)" rows={2}/>
        <PBtn onClick={sendWorkout} col="var(--tr)" style={{ color:"#fff" }}>📧 SEND TO {client?.name?.split(" ")[0]?.toUpperCase()}</PBtn>
        {!client?.email && <Mono style={{ textAlign:"center", color:"var(--yw)" }}>⚠️ No email on file for this client</Mono>}
      </div>
    </Sheet>
  );
}


// ─── Trainer Calendar & Booking ────────────────────────────────────────────────
const TODAY = new Date();
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const SESSION_TYPES = ["1-on-1 Session","Group Class","Cardio Class","HIIT Class","Yoga Class","Strength Class","Assessment","Free Consultation"];

// Seed some initial bookings and availability
const seedDate = (offset, hour, min=0) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

const INIT_SLOTS = [
  { id:"s1", type:"1-on-1 Session", clientId:1, clientName:"Marcus Webb", date:seedDate(0,9), duration:60, status:"confirmed", color:"var(--tr)" },
  { id:"s2", type:"Group Class",    clientId:null, date:seedDate(0,11), duration:45, status:"confirmed", color:"var(--acc)", maxSpots:8, bookedSpots:5, className:"Morning HIIT" },
  { id:"s3", type:"1-on-1 Session", clientId:2, clientName:"Sofia Chen", date:seedDate(1,10), duration:60, status:"confirmed", color:"var(--tr)" },
  { id:"s4", type:"Yoga Class",     clientId:null, date:seedDate(2,8), duration:60, status:"confirmed", color:"var(--a4)", maxSpots:12, bookedSpots:7, className:"Morning Yoga" },
  { id:"s5", type:"1-on-1 Session", clientId:3, clientName:"Jake Torres", date:seedDate(3,7), duration:45, status:"confirmed", color:"var(--tr)" },
  { id:"s6", type:"Strength Class", clientId:null, date:seedDate(4,18), duration:60, status:"confirmed", color:"var(--a3)", maxSpots:10, bookedSpots:3, className:"Evening Strength" },
  { id:"s7", type:"Assessment",     clientId:4, clientName:"Priya Nair", date:seedDate(5,14), duration:30, status:"pending", color:"var(--yw)" },
  { id:"s8", type:"Group Class",    clientId:null, date:seedDate(7,10), duration:45, status:"confirmed", color:"var(--acc)", maxSpots:8, bookedSpots:2, className:"Weekend HIIT" },
];

const INIT_REQUESTS = [
  { id:"r1", clientId:2, clientName:"Sofia Chen", type:"1-on-1 Session", preferred:"Thursday 6PM", note:"Need to focus on cardio this week", status:"pending" },
  { id:"r2", clientId:4, clientName:"Priya Nair", type:"Yoga Class", preferred:"Any morning slot", note:"Interested in the yoga class", status:"pending" },
  { id:"r3", clientId:1, clientName:"Marcus Webb", type:"1-on-1 Session", preferred:"Friday 9AM", note:"Want to work on deadlift form", status:"pending" },
];

function TrainerCalendar({ clients }) {
  const [year, setYear] = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth());
  const [selDay, setSelDay] = useState(TODAY.getDate());
  const [slots, setSlots] = useState(INIT_SLOTS);
  const [requests, setRequests] = useState(INIT_REQUESTS);
  const [calView, setCalView] = useState("month"); // month | day | requests
  const [showNewSlot, setShowNewSlot] = useState(false);
  const [showNewClass, setShowNewClass] = useState(false);
  const [editSlot, setEditSlot] = useState(null);

  // New slot form state
  const [newType, setNewType] = useState("1-on-1 Session");
  const [newClient, setNewClient] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newDur, setNewDur] = useState("60");
  const [newClassName, setNewClassName] = useState("");
  const [newMaxSpots, setNewMaxSpots] = useState("10");
  const isClass = ["Group Class","Cardio Class","HIIT Class","Yoga Class","Strength Class"].includes(newType);

  const pendingCount = requests.filter(r=>r.status==="pending").length;

  // Calendar grid helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  function hasSlot(day) {
    return slots.some(s => {
      const d = new Date(s.date);
      return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day;
    });
  }
  function daySlots(day) {
    return slots.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day;
    }).sort((a,b)=>new Date(a.date)-new Date(b.date));
  }
  function todaySlots() { return daySlots(selDay); }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return DAYS_SHORT[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0,3);
  }

  function addSlot() {
    if (!newDate || !newTime) return;
    const dt = new Date(newDate + "T" + newTime);
    const isC = isClass;
    const s = {
      id: "s" + Date.now(),
      type: newType,
      clientId: isC ? null : Number(newClient),
      clientName: isC ? null : clients.find(c=>c.id===Number(newClient))?.name || "",
      date: dt.toISOString(),
      duration: Number(newDur),
      status: "confirmed",
      color: isC ? "var(--acc)" : "var(--tr)",
      ...(isC ? { maxSpots: Number(newMaxSpots), bookedSpots: 0, className: newClassName || newType } : {})
    };
    setSlots(p=>[...p,s]);
    setShowNewSlot(false); setShowNewClass(false);
    setNewDate(""); setNewTime("09:00"); setNewClient(""); setNewClassName(""); setNewDur("60");
  }

  function deleteSlot(id) { setSlots(p=>p.filter(s=>s.id!==id)); setEditSlot(null); }

  function approveRequest(id) {
    const req = requests.find(r=>r.id===id);
    if (!req) return;
    const s = {
      id: "s" + Date.now(),
      type: req.type, clientId: req.clientId, clientName: req.clientName,
      date: seedDate(2, 10), duration: 60, status: "confirmed", color: "var(--tr)"
    };
    setSlots(p=>[...p,s]);
    setRequests(p=>p.map(r=>r.id===id?{...r,status:"approved"}:r));
  }
  function declineRequest(id) { setRequests(p=>p.map(r=>r.id===id?{...r,status:"declined"}:r)); }

  const SlotCard = ({ s, compact }) => (
    <div onClick={()=>setEditSlot(s)} style={{ padding:compact?"8px 10px":"12px 14px", background:"rgba(20,20,20,.9)", border:`1px solid ${s.color}40`, borderLeft:`3px solid ${s.color}`, borderRadius:"10px", marginBottom:"8px", cursor:"pointer", animation:"fadeUp .3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:s.color, letterSpacing:"1px", marginBottom:"2px" }}>{formatTime(s.date)} · {s.duration}min</div>
          <div style={{ fontWeight:600, fontSize:"13px", marginBottom:"2px" }}>{s.className || s.clientName || s.type}</div>
          {!compact && <div style={{ fontSize:"11px", color:"var(--mut)" }}>{s.type}{s.maxSpots ? ` · ${s.bookedSpots}/${s.maxSpots} spots` : ""}</div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px", flexShrink:0 }}>
          <div style={{ padding:"2px 8px", background:s.status==="confirmed"?"rgba(147,51,234,.15)":s.status==="pending"?"rgba(255,140,0,.15)":"rgba(255,255,255,.08)", border:`1px solid ${s.status==="confirmed"?"rgba(147,51,234,.3)":s.status==="pending"?"rgba(255,140,0,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"50px", fontSize:"9px", fontFamily:"var(--fm)", color:s.status==="confirmed"?"var(--gr)":s.status==="pending"?"var(--yw)":"var(--mut)", letterSpacing:"1px", textTransform:"uppercase" }}>{s.status}</div>
          {s.maxSpots && (
            <div style={{ fontSize:"10px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{s.maxSpots - s.bookedSpots} left</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      {/* View toggle */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"14px", overflowX:"auto", scrollbarWidth:"none" }}>
        {[["month","📅 Month"],["day","🕐 Day"],["requests","📩 Requests"+(pendingCount>0?" ("+pendingCount+")":"")]].map(([v,lbl])=>(
          <button key={v} onClick={()=>setCalView(v)} style={{ padding:"7px 13px", background:calView===v?"var(--tr)":"rgba(255,255,255,.04)", border:`1px solid ${calView===v?"var(--tr)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:calView===v?"#fff":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px", whiteSpace:"nowrap" }}>{lbl}</button>
        ))}
      </div>

      {/* ── MONTH VIEW ── */}
      {calView==="month" && (
        <div>
          {/* Month nav */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <button onClick={prevMonth} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--txt)", cursor:"pointer", padding:"6px 12px", fontSize:"16px" }}>‹</button>
            <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px" }}>{MONTHS[month].toUpperCase()} {year}</div>
            <button onClick={nextMonth} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--txt)", cursor:"pointer", padding:"6px 12px", fontSize:"16px" }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", marginBottom:"4px" }}>
            {DAYS_SHORT.map(d=><div key={d} style={{ textAlign:"center", fontFamily:"var(--fm)", fontSize:"9px", color:"var(--mut)", padding:"4px 0", letterSpacing:"1px" }}>{d.toUpperCase()}</div>)}
          </div>
          {/* Day cells */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", marginBottom:"14px" }}>
            {Array.from({length: firstDay}).map((_,i)=><div key={"e"+i}/>)}
            {Array.from({length: daysInMonth}).map((_,i)=>{
              const day = i + 1;
              const isToday = day===TODAY.getDate() && month===TODAY.getMonth() && year===TODAY.getFullYear();
              const isSel = day===selDay && month===TODAY.getMonth() && year===TODAY.getFullYear();
              const booked = hasSlot(day);
              return (
                <div key={day} onClick={()=>{ setSelDay(day); setCalView("day"); }} style={{ aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:"10px", cursor:"pointer", background:isSel?"var(--tr)":isToday?"rgba(255,112,67,.15)":"rgba(255,255,255,.03)", border:isToday&&!isSel?"1px solid rgba(255,112,67,.4)":"1px solid transparent", position:"relative", gap:"2px", transition:"background .15s" }}>
                  <span style={{ fontSize:"13px", fontWeight:isSel||isToday?700:400, color:isSel?"#fff":isToday?"var(--tr)":"var(--txt)" }}>{day}</span>
                  {booked && <div style={{ display:"flex", gap:"2px" }}>{daySlots(day).slice(0,3).map((s,si)=><div key={si} style={{ width:"4px", height:"4px", borderRadius:"50%", background:s.color }}/>)}</div>}
                </div>
              );
            })}
          </div>
          {/* Today's upcoming */}
          <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"9px" }}>TODAY'S SCHEDULE</div>
          {daySlots(TODAY.getDate()).length===0
            ? <Card style={{ padding:"18px", textAlign:"center" }}><div style={{ fontSize:"26px", marginBottom:"6px" }}>📭</div><Mono>No sessions today</Mono></Card>
            : daySlots(TODAY.getDate()).map(s=><SlotCard key={s.id} s={s} compact/>)
          }
          <div style={{ display:"flex", gap:"8px", marginTop:"14px" }}>
            <button onClick={()=>{ setNewType("1-on-1 Session"); setShowNewSlot(true); }} style={{ flex:1, padding:"11px", background:"rgba(255,112,67,.12)", border:"1px solid rgba(255,112,67,.3)", borderRadius:"10px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ SESSION</button>
            <button onClick={()=>{ setNewType("Group Class"); setShowNewClass(true); }} style={{ flex:1, padding:"11px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ CLASS</button>
          </div>
        </div>
      )}

      {/* ── DAY VIEW ── */}
      {calView==="day" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
            <button onClick={()=>{ setSelDay(d=>d>1?d-1:daysInMonth); }} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--txt)", cursor:"pointer", padding:"6px 12px", fontSize:"16px" }}>‹</button>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"20px", letterSpacing:"2px" }}>{selDay}</div>
              <Mono>{MONTHS[month].toUpperCase()} {year}</Mono>
            </div>
            <button onClick={()=>{ setSelDay(d=>d<daysInMonth?d+1:1); }} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--txt)", cursor:"pointer", padding:"6px 12px", fontSize:"16px" }}>›</button>
          </div>
          {todaySlots().length===0
            ? <Card style={{ padding:"24px", textAlign:"center", marginBottom:"12px" }}><div style={{ fontSize:"30px", marginBottom:"8px" }}>📭</div><div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px", marginBottom:"4px" }}>FREE DAY</div><Mono>No sessions scheduled</Mono></Card>
            : todaySlots().map(s=><SlotCard key={s.id} s={s}/>)
          }
          <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
            <button onClick={()=>{ setNewType("1-on-1 Session"); setShowNewSlot(true); }} style={{ flex:1, padding:"11px", background:"rgba(255,112,67,.12)", border:"1px solid rgba(255,112,67,.3)", borderRadius:"10px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ SESSION</button>
            <button onClick={()=>{ setNewType("Group Class"); setShowNewClass(true); }} style={{ flex:1, padding:"11px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ CLASS</button>
          </div>
        </div>
      )}

      {/* ── BOOKING REQUESTS VIEW ── */}
      {calView==="requests" && (
        <div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"1px", marginBottom:"12px" }}>BOOKING REQUESTS</div>
          {requests.length===0 && <Card style={{ padding:"20px", textAlign:"center" }}><Mono>No requests yet</Mono></Card>}
          {requests.map((req,i)=>(
            <Card key={req.id} style={{ padding:"14px", marginBottom:"9px", border:`1px solid ${req.status==="pending"?"rgba(255,140,0,.2)":req.status==="approved"?"rgba(147,51,234,.2)":"rgba(255,61,107,.15)"}`, animation:`fadeUp .3s ease ${i*.06}s both` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:"14px", marginBottom:"2px" }}>{req.clientName}</div>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--acc)", letterSpacing:"1px" }}>{req.type}</div>
                </div>
                <div style={{ padding:"3px 9px", background:req.status==="pending"?"rgba(255,140,0,.15)":req.status==="approved"?"rgba(147,51,234,.15)":"rgba(255,61,107,.12)", border:`1px solid ${req.status==="pending"?"rgba(255,140,0,.3)":req.status==="approved"?"rgba(147,51,234,.3)":"rgba(255,61,107,.25)"}`, borderRadius:"50px", fontSize:"10px", fontFamily:"var(--fm)", color:req.status==="pending"?"var(--yw)":req.status==="approved"?"var(--gr)":"var(--a2)", letterSpacing:"1px", textTransform:"uppercase" }}>{req.status}</div>
              </div>
              <div style={{ fontSize:"12px", color:"var(--mut)", marginBottom:"4px" }}>Preferred: <span style={{ color:"var(--txt)" }}>{req.preferred}</span></div>
              {req.note && <div style={{ fontSize:"12px", color:"var(--mut)", fontStyle:"italic", marginBottom:"10px" }}>"{req.note}"</div>}
              {req.status==="pending" && (
                <div style={{ display:"flex", gap:"7px" }}>
                  <button onClick={()=>approveRequest(req.id)} style={{ flex:1, padding:"8px", background:"rgba(147,51,234,.15)", border:"1px solid rgba(147,51,234,.3)", borderRadius:"8px", color:"var(--gr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✓ APPROVE</button>
                  <button onClick={()=>declineRequest(req.id)} style={{ flex:1, padding:"8px", background:"rgba(255,61,107,.08)", border:"1px solid rgba(255,61,107,.2)", borderRadius:"8px", color:"var(--a2)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✕ DECLINE</button>
                </div>
              )}
            </Card>
          ))}
          {/* Client booking link info */}
          <Card style={{ padding:"14px", marginTop:"10px", border:"1px solid rgba(124,58,237,.2)" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"12px", color:"var(--a4)", letterSpacing:"1px", marginBottom:"5px" }}>📱 CLIENT BOOKING</div>
            <div style={{ fontSize:"12px", color:"var(--mut)", lineHeight:1.7 }}>Clients can request sessions from their profile. Share your trainer link to let them book directly.</div>
          </Card>
        </div>
      )}

      {/* ── NEW SESSION SHEET ── */}
      {(showNewSlot || showNewClass) && (
        <Sheet onClose={()=>{ setShowNewSlot(false); setShowNewClass(false); }} title={showNewClass?"NEW CLASS":"NEW SESSION"} acc={showNewClass?"var(--acc)":"var(--tr)"}>
          <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
            {/* Type */}
            <div>
              <Mono style={{ marginBottom:"8px" }}>TYPE</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {SESSION_TYPES.filter(t=>showNewClass?["Group Class","Cardio Class","HIIT Class","Yoga Class","Strength Class"].includes(t):["1-on-1 Session","Assessment","Free Consultation"].includes(t)).map(t=>(
                  <button key={t} onClick={()=>setNewType(t)} style={{ padding:"6px 12px", background:newType===t?(showNewClass?"rgba(124,58,237,.15)":"rgba(255,112,67,.15)"):"rgba(255,255,255,.04)", border:`1px solid ${newType===t?(showNewClass?"var(--acc)":"var(--tr)"):"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:newType===t?(showNewClass?"var(--acc)":"var(--tr)"):"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{t}</button>
                ))}
              </div>
            </div>
            {/* Class name if class */}
            {showNewClass && (
              <Field lbl="CLASS NAME" val={newClassName} set={setNewClassName} ph={newType+" e.g. Morning Burn"} acc="var(--acc)"/>
            )}
            {/* Client picker if session */}
            {!showNewClass && (
              <div>
                <Mono style={{ marginBottom:"8px" }}>CLIENT</Mono>
                <select value={newClient} onChange={e=>setNewClient(e.target.value)} style={{ width:"100%", padding:"11px 13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:newClient?"var(--txt)":"var(--mut)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                  <option value="">Select client...</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {/* Max spots if class */}
            {showNewClass && (
              <div>
                <Mono style={{ marginBottom:"8px" }}>MAX SPOTS</Mono>
                <input type="number" value={newMaxSpots} onChange={e=>setNewMaxSpots(e.target.value)} min="1" max="50" style={{ width:"100%", padding:"11px 13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none" }}/>
              </div>
            )}
            {/* Date */}
            <div>
              <Mono style={{ marginBottom:"8px" }}>DATE</Mono>
              <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{ width:"100%", padding:"11px 13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none", colorScheme:"dark" }}/>
            </div>
            {/* Time + Duration */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <div>
                <Mono style={{ marginBottom:"8px" }}>TIME</Mono>
                <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} style={{ width:"100%", padding:"11px 13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none", colorScheme:"dark" }}/>
              </div>
              <div>
                <Mono style={{ marginBottom:"8px" }}>DURATION (min)</Mono>
                <select value={newDur} onChange={e=>setNewDur(e.target.value)} style={{ width:"100%", padding:"11px 13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                  {["30","45","60","75","90"].map(d=><option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
            </div>
            <PBtn onClick={addSlot} col={showNewClass?"var(--acc)":"var(--tr)"} style={{ color:showNewClass?"#000":"#fff" }} disabled={!newDate||(showNewClass?false:!newClient)}>
              {showNewClass?"➕ CREATE CLASS":"➕ SCHEDULE SESSION"}
            </PBtn>
          </div>
        </Sheet>
      )}

      {/* ── SLOT DETAIL / EDIT SHEET ── */}
      {editSlot && (
        <Sheet onClose={()=>setEditSlot(null)} title="SESSION DETAIL" acc={editSlot.color}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <Card style={{ padding:"14px", border:`1px solid ${editSlot.color}40` }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:editSlot.color, letterSpacing:"1px", marginBottom:"6px" }}>{editSlot.className || editSlot.clientName || editSlot.type}</div>
              <div style={{ fontSize:"13px", color:"var(--mut)", marginBottom:"4px" }}>📅 {formatDate(editSlot.date)} at {formatTime(editSlot.date)}</div>
              <div style={{ fontSize:"13px", color:"var(--mut)", marginBottom:"4px" }}>⏱ {editSlot.duration} minutes</div>
              <div style={{ fontSize:"13px", color:"var(--mut)", marginBottom:"4px" }}>🏷 {editSlot.type}</div>
              {editSlot.maxSpots && <div style={{ fontSize:"13px", color:"var(--mut)" }}>👥 {editSlot.bookedSpots}/{editSlot.maxSpots} spots booked</div>}
            </Card>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={()=>setEditSlot(s=>({...s,status:s.status==="confirmed"?"pending":"confirmed"}))} style={{ flex:1, padding:"11px", background:"rgba(255,140,0,.1)", border:"1px solid rgba(255,140,0,.25)", borderRadius:"10px", color:"var(--yw)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>
                {editSlot.status==="confirmed"?"MARK PENDING":"CONFIRM"}
              </button>
              <button onClick={()=>deleteSlot(editSlot.id)} style={{ flex:1, padding:"11px", background:"rgba(255,61,107,.1)", border:"1px solid rgba(255,61,107,.25)", borderRadius:"10px", color:"var(--a2)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>DELETE</button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}


// ─── Trainer Dashboard ─────────────────────────────────────────────────────────
const MOCK_CLIENTS = [
  { id:1, name:"Marcus Webb",  goal:"Muscle Gain",  sessions:12, progress:72, av:"MW", streak:8 },
  { id:2, name:"Sofia Chen",   goal:"Fat Loss",     sessions:8,  progress:45, av:"SC", streak:5 },
  { id:3, name:"Jake Torres",  goal:"Endurance",    sessions:20, progress:88, av:"JT", streak:14 },
  { id:4, name:"Priya Nair",   goal:"Flexibility",  sessions:6,  progress:30, av:"PN", streak:3 },
];
const MOCK_NOTES = {
  1:[{d:"Mar 10",n:"Deadlift PR: 180kg. Excellent form.",m:"💪"},{d:"Mar 7",n:"Struggled with pull-ups.",m:"😤"}],
  2:[{d:"Mar 11",n:"Cardio 45min. Heart rate zones good.",m:"😊"}],
  3:[{d:"Mar 12",n:"10km in 48min. New PB!",m:"🏃"}],
  4:[{d:"Mar 11",n:"Hip flexibility improving.",m:"🧘"}],
};

function TrainerDashboard({ user, tab, setTab, onHome }) {
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [selId, setSelId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [trainerSub, setTrainerSub] = useState(()=>loadTrainerSub());
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("Muscle Gain");
  const [newSex, setNewSex] = useState("Male");
  const [newDOB, setNewDOB] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newInjuries, setNewInjuries] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [showSendWorkout, setShowSendWorkout] = useState(null); // client id

  const [packages, setPackages] = useState([
    { id:1, name:"Starter Pack", sessions:4, price:"49.99", desc:"4 x 1-on-1 sessions", perks:"Nutrition guide included" },
    { id:2, name:"Monthly Program", sessions:8, price:"89.99", desc:"8 sessions + program", perks:"Full program + nutrition" },
    { id:3, name:"Elite Transform", sessions:16, price:"159.99", desc:"16 sessions + 4-week plan", perks:"Full access + weekly check-ins" },
  ]);
  const [paypalEmail, setPaypalEmail] = useState(PP_EMAIL);
  const [bankDetails, setBankDetails] = useState("");
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [clientPrograms, setClientPrograms] = useState({});
  const tplan = getTrainerPlan(trainerSub);
  const limit = tplan.clientLimit;
  const atLimit = clients.length >= limit;

  // Safe guard: clear selId if client no longer exists
  useEffect(() => {
    if (selId && !clients.find(c=>c.id===selId)) setSelId(null);
  }, [selId, clients]);

  // Render client profile as full replacement
  if (selId) {
    const cl = clients.find(c=>c.id===selId);
    if (cl) return (
      <ClientProfile
        client={cl}
        notes={notes[selId]||[]}
        onBack={()=>setSelId(null)}
        onUpdate={updated=>setClients(p=>p.map(c=>c.id===updated.id?{...c,...updated}:c))}
        onDelete={id=>{ setClients(p=>p.filter(c=>c.id!==id)); setSelId(null); }}
        onSuspend={id=>setClients(p=>p.map(c=>c.id===id?{...c,status:c.status==="suspended"?"active":"suspended"}:c))}
        packages={packages}
        paypalEmail={paypalEmail}
        clientPrograms={clientPrograms}
        setClientPrograms={setClientPrograms}
        setShowSendWorkout={setShowSendWorkout}
      />
    );
  }

  function handleAdd() { if (atLimit) setShowUpgrade(true); else setShowAdd(true); }
  function handleUpgraded(pid) { const s = mkTrainerSub(pid); setTrainerSub(s); setShowUpgrade(false); }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", paddingBottom:"100px" }}>
      {/* Trainer header */}
      <div style={{ position:"relative", height:"200px" }}>
        <img src={IMG.trainer} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.4) saturate(.7)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(10,10,10,.3) 0%,rgba(10,10,10,.88) 100%)" }}/>
        {/* Top row */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div onClick={onHome} style={{ cursor:"pointer" }}><Wordmark size={22} col="rgba(255,255,255,.9)"/></div>
          <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"50px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"5px 13px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>CONTACT</button>
        </div>
        {/* Trainer info */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 18px 16px", display:"flex", alignItems:"flex-end", gap:"12px" }}>
          <div style={{ width:"64px", height:"64px", borderRadius:"50%", overflow:"hidden", border:"2.5px solid rgba(255,112,67,.5)", flexShrink:0, boxShadow:"0 4px 16px rgba(255,112,67,.25)" }}>
            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80" alt="Trainer" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          <div style={{ flex:1, paddingBottom:"2px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px", lineHeight:1, color:"var(--txt)" }}>HEY, {user.name.split(" ")[0].toUpperCase()}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"5px" }}>
              <div style={{ padding:"2px 9px", background:tplan.color+"20", border:`1px solid ${tplan.color}40`, borderRadius:"50px", fontSize:"10px", fontFamily:"var(--fm)", color:tplan.color, letterSpacing:"1px" }}>{tplan.name}</div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,.4)" }}>{limit===Infinity?"Unlimited":""+clients.length+"/"+limit+" clients"}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"10px", padding:"14px 18px 0", overflowX:"auto", scrollbarWidth:"none" }}>
        {[{l:"CLIENTS",v:clients.length,i:"👥",c:"var(--tr)",action:null},{l:"THIS WEEK",v:"6",i:"📅",c:"var(--a3)",action:()=>setTab("calendar")},{l:"AVG PROGRESS",v:Math.round(clients.reduce((a,c)=>a+c.progress,0)/clients.length)+"%",i:"📈",c:"var(--acc)",action:null}].map(s=>(
          <div key={s.l} onClick={s.action||undefined} style={{ flexShrink:0, padding:"14px 18px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"14px", minWidth:"100px", textAlign:"center", cursor:s.action?"pointer":"default" }}>
            <div style={{ fontSize:"20px", marginBottom:"5px" }}>{s.i}</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:s.c, lineHeight:1 }}>{s.v}</div>
            <Mono style={{ fontSize:"9px", marginTop:"4px" }}>{s.l}{s.action?" →":""}</Mono>
          </div>
        ))}
      </div>

      {tab==="clients" && (
        <div style={{ padding:"13px 18px 0" }}>
          {atLimit && (
            <div onClick={()=>setShowUpgrade(true)} style={{ padding:"10px 13px", background:"rgba(255,112,67,.07)", border:"1px solid rgba(255,112,67,.25)", borderRadius:"10px", marginBottom:"10px", cursor:"pointer", display:"flex", alignItems:"center", gap:"9px" }}>
              <span style={{ fontSize:"17px" }}>🔒</span>
              <div style={{ flex:1 }}><Mono style={{ color:"var(--tr)", letterSpacing:"1px" }}>CLIENT LIMIT REACHED</Mono><div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"1px" }}>Upgrade to add more clients</div></div>
              <Mono style={{ color:"var(--tr)", textDecoration:"underline" }}>UPGRADE →</Mono>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"9px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px" }}>MY CLIENTS</div>
            <button onClick={handleAdd} style={{ padding:"6px 12px", background:atLimit?"rgba(255,255,255,.04)":"rgba(255,112,67,.12)", border:"1px solid rgba(255,112,67,.25)", borderRadius:"8px", color:atLimit?"var(--mut)":"var(--tr)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)" }}>{atLimit?"🔒 UPGRADE":"+ ADD"}</button>
          </div>
          {clients.map((cl,i)=>(
            <Card key={cl.id} style={{ padding:"12px", marginBottom:"8px", cursor:"pointer", animation:`fadeUp .4s ease ${i*.06}s both` }} onClick={()=>setSelId(cl.id)}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:"linear-gradient(135deg,var(--tr),#ff8a50)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"13px", border:"2px solid rgba(255,112,67,.3)", flexShrink:0 }}>{cl.av}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2px" }}>
                    <span style={{ fontWeight:600, fontSize:"13px" }}>{cl.name}</span>
                    <span style={{ fontFamily:"var(--fm)", fontSize:"11px", color:"var(--tr)", background:"rgba(255,112,67,.12)", padding:"2px 8px", borderRadius:"6px" }}>🔥 {cl.streak}d</span>
                  </div>
                  <div style={{ fontSize:"13px", color:"rgba(255,255,255,.6)", marginBottom:"3px", fontFamily:"var(--fb)" }}>{cl.goal} · {cl.sessions} sessions{cl.sex?" · "+cl.sex:""}</div>
                  {(cl.injuries||cl.email) && <div style={{ display:"flex", gap:"8px", marginBottom:"3px" }}>{cl.injuries&&<Mono style={{ fontSize:"9px", color:"var(--yw)" }}>⚠️ {cl.injuries.slice(0,25)}{cl.injuries.length>25?"...":""}</Mono>}{cl.email&&<Mono style={{ fontSize:"9px", color:"var(--acc)" }}>✉️</Mono>}</div>}
                  <div style={{ height:"3px", background:"rgba(255,255,255,.08)", borderRadius:"2px" }}><div style={{ height:"100%", width:cl.progress+"%", background:"linear-gradient(90deg,var(--tr),#ffb74d)", borderRadius:"2px" }}/></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab==="calendar" && (
        <div style={{ padding:"13px 18px 0" }}>
          <TrainerCalendar clients={clients}/>
        </div>
      )}
      {tab==="notes" && (
        <div style={{ padding:"13px 18px 0" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"9px" }}>SESSION NOTES</div>
          <div style={{ display:"flex", gap:"6px", overflowX:"auto", marginBottom:"11px" }}>
            {clients.map(cl=><button key={cl.id} onClick={()=>setSelId(cl.id)} style={{ flexShrink:0, padding:"6px 11px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"50px", color:"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{cl.name.split(" ")[0]}</button>)}
          </div>
          <Card style={{ padding:"14px", textAlign:"center" }}><div style={{ fontSize:"26px", marginBottom:"6px" }}>📝</div><Mono style={{ letterSpacing:"1px" }}>SELECT A CLIENT ABOVE</Mono></Card>
        </div>
      )}
      {tab==="profile" && (
        <div style={{ padding:"13px 18px 0" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"11px" }}>TRAINER PROFILE</div>
          <Card style={{ padding:"15px", marginBottom:"11px", border:"1px solid rgba(255,112,67,.2)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"11px" }}>
              <div style={{ width:"50px", height:"50px", borderRadius:"50%", background:"linear-gradient(135deg,var(--tr),#ff8a50)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"19px", color:"#fff" }}>{user.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
              <div><div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px" }}>{user.name}</div><Mono>Certified Personal Trainer</Mono></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px", marginBottom:"12px" }}>
              {[{l:"Clients",v:clients.length,c:"var(--tr)"},{l:"Sessions",v:clients.reduce((a,c)=>a+c.sessions,0),c:"var(--acc)"},{l:"Avg Prog",v:Math.round(clients.reduce((a,c)=>a+c.progress,0)/clients.length)+"%",c:"var(--a3)"}].map(s=>(
                <div key={s.l} style={{ textAlign:"center", padding:"8px", background:"rgba(255,255,255,.03)", borderRadius:"8px" }}><div style={{ fontFamily:"var(--fd)", fontSize:"18px", color:s.c }}>{s.v}</div><div style={{ fontSize:"10px", color:"var(--mut)", marginTop:"1px" }}>{s.l}</div></div>
              ))}
            </div>
            <div style={{ padding:"11px 13px", background:tplan.color+"10", border:`1px solid ${tplan.color}25`, borderRadius:"10px", marginBottom:"11px" }}>
              <Mono style={{ color:tplan.color, marginBottom:"5px" }}>CURRENT PLAN: {tplan.name}</Mono>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:"12px", color:"var(--mut)" }}>{limit===Infinity?"Unlimited":"Up to "+limit} clients · {tplan.price}{tplan.period!=="forever"?tplan.period:""}</div>
                {tplan.id!=="unlimited" && <button onClick={()=>setShowUpgrade(true)} style={{ padding:"5px 11px", background:"var(--tr)", border:"none", borderRadius:"7px", color:"#fff", cursor:"pointer", fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"1px" }}>UPGRADE</button>}
              </div>
            </div>
          </Card>

          {/* Financials */}
          <Card style={{ padding:"15px", marginBottom:"11px", border:"1px solid rgba(255,106,26,.25)" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px", color:"var(--a3)", marginBottom:"12px" }}>💰 FINANCIALS</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px", marginBottom:"12px" }}>
              {[
                {l:"This Week",v:"$"+(clients.filter(c=>c.status!=="suspended").length * (packages.reduce((a,p)=>a+parseFloat(p.price||0),0)/Math.max(packages.length,1))).toFixed(0),c:"var(--a3)"},
                {l:"This Month",v:"$"+(clients.filter(c=>c.status!=="suspended").length * (packages.reduce((a,p)=>a+parseFloat(p.price||0),0)/Math.max(packages.length,1)) * 4).toFixed(0),c:"var(--acc)"},
                {l:"Active Clients",v:clients.filter(c=>c.status!=="suspended").length,c:"var(--tr)"},
                {l:"Packages",v:packages.length,c:"var(--a4)"},
              ].map(s=>(
                <div key={s.l} style={{ padding:"11px", background:"rgba(255,255,255,.04)", borderRadius:"10px", textAlign:"center" }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:s.c, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"3px" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"10px 12px", background:"rgba(255,255,255,.03)", borderRadius:"9px", marginBottom:"10px" }}>
              <Mono style={{ marginBottom:"4px" }}>PAYMENT DETAILS</Mono>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,.5)", marginBottom:"8px" }}>
                {paypalEmail || "No payment method set"}{bankDetails?" · Bank: "+bankDetails.slice(0,12)+"...":""}
              </div>
              <button onClick={()=>setShowPaymentSettings(true)} style={{ padding:"6px 13px", background:"var(--tr)", border:"none", borderRadius:"7px", color:"#fff", cursor:"pointer", fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"1px" }}>⚙️ UPDATE PAYMENT</button>
            </div>
            <button onClick={()=>setShowPackages(true)} style={{ width:"100%", padding:"11px", background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>📦 MANAGE PACKAGES</button>
          </Card>

          <PBtn onClick={()=>setShowContact(true)} col="var(--a3)" style={{ color:"#000" }}>📧 CONTACT DEVELOPER</PBtn>
        </div>
      )}
      {showSendWorkout && (
        <SendWorkoutSheet
          client={clients.find(c=>c.id===showSendWorkout)}
          onClose={()=>setShowSendWorkout(null)}
        />
      )}
      {showAdd && (
        <Sheet onClose={()=>setShowAdd(false)} title="ADD CLIENT" acc="var(--tr)">
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <Field lbl="CLIENT NAME *" val={newName} set={setNewName} ph="Full name" acc="var(--tr)"/>
            <Field lbl="CLIENT EMAIL *" val={newEmail} set={setNewEmail} ph="client@email.com" acc="var(--tr)" type="email"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <div>
                <Mono style={{ marginBottom:"7px" }}>SEX</Mono>
                <select value={newSex} onChange={e=>setNewSex(e.target.value)} style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                  {["Male","Female","Other"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Mono style={{ marginBottom:"7px" }}>DATE OF BIRTH</Mono>
                <input type="date" value={newDOB} onChange={e=>setNewDOB(e.target.value)} style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none", colorScheme:"dark" }}/>
              </div>
            </div>
            <div>
              <Mono style={{ marginBottom:"7px" }}>GOAL</Mono>
              <select value={newGoal} onChange={e=>setNewGoal(e.target.value)} style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                {["Muscle Gain","Fat Loss","Endurance","Flexibility","General Fitness","Sport Performance"].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <Field lbl="INJURIES / LIMITATIONS (optional)" val={newInjuries} set={setNewInjuries} ph="e.g. Lower back pain, knee injury..." acc="var(--tr)" rows={2}/>
            <div style={{ padding:"10px 12px", background:"rgba(255,112,67,.08)", border:"1px solid rgba(255,112,67,.2)", borderRadius:"9px", fontSize:"12px", color:"rgba(255,255,255,.6)", lineHeight:1.6 }}>
              📧 An email invitation with a temporary password and app download link will be sent to the client automatically.
            </div>
            <PBtn onClick={()=>{
              if (!newName.trim() || !newEmail.trim()) return;
              const tempPass = "FIT2ALL" + Math.floor(1000+Math.random()*9000);
              const av = newName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
              setClients(p=>[...p,{id:p.length+1,name:newName,goal:newGoal,sex:newSex,dob:newDOB,email:newEmail,injuries:newInjuries,sessions:0,progress:0,av,streak:0,tempPass}]);
              const sub = encodeURIComponent("Welcome to Fit2All — Your trainer has added you!");
              const body = encodeURIComponent(`Hi ${newName},

Your personal trainer has added you to Fit2All!

Your temporary password: ${tempPass}

Download Fit2All and sign in as a Member:
https://fit2all.vercel.app

See you in the gym! 💪
— Your Fit2All Trainer`);
              window.open("mailto:"+newEmail+"?subject="+sub+"&body="+body, "_blank");
              setNewName(""); setNewEmail(""); setNewDOB(""); setNewInjuries(""); setShowAdd(false);
            }} col="var(--tr)" style={{ color:"#fff" }}>ADD CLIENT & SEND INVITE</PBtn>
          </div>
        </Sheet>
      )}
      {showContact && <ContactModal onClose={()=>setShowContact(false)}/>}
      {showUpgrade && <TrainerUpgradeScreen clientCount={clients.length} onUpgraded={handleUpgraded} onClose={()=>setShowUpgrade(false)}/>}
      {showPaymentSettings && (
        <Sheet onClose={()=>setShowPaymentSettings(false)} title="PAYMENT SETTINGS" acc="var(--tr)">
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <Field lbl="PAYPAL EMAIL" val={paypalEmail} set={setPaypalEmail} ph="your@paypal.com" acc="var(--tr)" type="email"/>
            <Field lbl="BANK DETAILS (optional)" val={bankDetails} set={setBankDetails} ph="Sort code / Account no or IBAN" acc="var(--tr)"/>
            <div style={{ padding:"10px 12px", background:"rgba(255,140,0,.08)", border:"1px solid rgba(255,140,0,.2)", borderRadius:"9px", fontSize:"12px", color:"rgba(255,255,255,.55)", lineHeight:1.6 }}>
              💡 Your payment details are shown to clients when they purchase packages. Keep them accurate.
            </div>
            <PBtn onClick={()=>setShowPaymentSettings(false)} col="var(--tr)" style={{ color:"#fff" }}>SAVE SETTINGS</PBtn>
          </div>
        </Sheet>
      )}
      {showPackages && (
        <PackagesManager
          packages={packages}
          setPackages={setPackages}
          paypalEmail={paypalEmail}
          bankDetails={bankDetails}
          onClose={()=>setShowPackages(false)}
        />
      )}
    </div>
  );
}

// ─── Contact Modal ─────────────────────────────────────────────────────────────
function ContactModal({ onClose }) {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("suggestion");
  const [sent, setSent] = useState(false);
  function send() {
    if (!msg.trim()) return;
    const sub = encodeURIComponent("[Fit2All "+type+"] from "+(name||"Anonymous"));
    const body = encodeURIComponent("From:"+(name||"Anonymous")+"\nType:"+type+"\n\n"+msg+"\n\n---Fit2All");
    window.open("mailto:Jcsc04@gmail.com?subject="+sub+"&body="+body,"_blank");
    setSent(true);
  }
  return (
    <Sheet onClose={onClose} title={sent?"THANKS!":"CONTACT DEV"} acc="var(--a3)">
      {sent
        ? <div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:"42px", marginBottom:"11px" }}>✅</div><p style={{ color:"var(--mut)", lineHeight:1.7 }}>Message sent!<br/>We read every submission.</p><PBtn onClick={onClose} col="var(--gr)" style={{ marginTop:"18px", color:"#fff" }}>CLOSE</PBtn></div>
        : <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
            <Field lbl="NAME (optional)" val={name} set={setName} ph="Anonymous" acc="var(--a3)"/>
            <div>
              <Mono style={{ marginBottom:"7px" }}>TYPE</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {["suggestion","bug","feature","praise"].map(t=>(
                  <button key={t} onClick={()=>setType(t)} style={{ padding:"5px 11px", background:type===t?"rgba(147,51,234,.15)":"rgba(255,255,255,.04)", border:`1px solid ${type===t?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:type===t?"var(--a3)":"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{t==="suggestion"?"💡":t==="bug"?"🐛":t==="feature"?"✨":"❤️"} {t}</button>
                ))}
              </div>
            </div>
            <Field lbl="MESSAGE" val={msg} set={setMsg} ph="Your message..." acc="var(--a3)" rows={3}/>
            <PBtn onClick={send} disabled={!msg.trim()} col="var(--a3)" style={{ color:"#000" }}>📧 SEND MESSAGE</PBtn>
          </div>
      }
    </Sheet>
  );
}

// ─── Account Tab ─────────────────────────────────────────────────────────────
function AccountTab({ sub, ctx, user, onUpgrade }) {
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();
  const camRef = useRef();

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ animation:"fadeIn .4s" }}>
      <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"14px" }}>MY ACCOUNT</div>

      {/* Profile photo */}
      <Card style={{ padding:"16px", marginBottom:"12px" }}>
        <Mono style={{ marginBottom:"12px" }}>PROFILE PHOTO</Mono>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ width:"76px", height:"76px", borderRadius:"50%", background:"rgba(255,255,255,.06)", border:"2px solid rgba(255,255,255,.12)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {photo
              ? <img src={photo} alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : <span style={{ fontSize:"28px" }}>👤</span>
            }
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px", flex:1 }}>
            <button onClick={()=>fileRef.current.click()} style={{ padding:"10px 14px", background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.3)", borderRadius:"9px", color:"var(--acc)", cursor:"pointer", fontSize:"13px", fontFamily:"var(--fd)", letterSpacing:"1px", textAlign:"left" }}>
              🖼️ Choose from Library
            </button>
            <button onClick={()=>camRef.current.click()} style={{ padding:"10px 14px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"9px", color:"var(--txt)", cursor:"pointer", fontSize:"13px", fontFamily:"var(--fd)", letterSpacing:"1px", textAlign:"left" }}>
              📷 Take Photo
            </button>
          </div>
        </div>
        {/* Hidden file inputs */}
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
        <input ref={camRef} type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display:"none" }}/>
      </Card>

      {/* Plan info */}
      <Card style={{ padding:"15px", marginBottom:"11px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"11px" }}>
          <div style={{ width:"46px", height:"46px", borderRadius:"50%", background:ctx.plan.color+"15", border:`1.5px solid ${ctx.plan.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{sub.id==="pro"?"⚡":"🎁"}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"17px", color:ctx.plan.color, letterSpacing:"2px" }}>{ctx.plan.name}</div>
            <Mono>{ctx.plan.price} {ctx.plan.period}</Mono>
          </div>
          {sub.id==="pro" && <div style={{ padding:"4px 9px", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.25)", borderRadius:"7px", fontSize:"10px", color:"var(--acc)", fontFamily:"var(--fm)" }}>ACTIVE</div>}
        </div>
        {sub.id==="free" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px", marginBottom:"11px" }}>
            <div style={{ textAlign:"center", padding:"9px", background:"rgba(255,255,255,.03)", borderRadius:"8px" }}><div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:"var(--a3)" }}>{ctx.aiLeft()}</div><div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"2px" }}>AI left today</div></div>
            <div style={{ textAlign:"center", padding:"9px", background:"rgba(255,255,255,.03)", borderRadius:"8px" }}><div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:"var(--acc)" }}>{ctx.daysLeft()}</div><div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"2px" }}>trial days left</div></div>
          </div>
        )}
        {sub.id==="free" && <UpgradeBtn onUpgrade={onUpgrade}/>}
      </Card>

      {/* Profile details */}
      <Card style={{ padding:"14px" }}>
        <Mono style={{ marginBottom:"10px" }}>PROFILE</Mono>
        {[["Name", user.name],["Email", user.email||"—"]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
            <span style={{ fontSize:"13px", color:"var(--mut)" }}>{k}</span>
            <span style={{ fontSize:"13px", fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}


// ─── Member Onboarding ─────────────────────────────────────────────────────────
function ProfileSetup({ onDone, user }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ goal:"", level:"", days:"3", duration:"60", equipment:"" });
  const steps = [
    { key:"goal",      img:IMG.workout, lbl:"WHAT'S YOUR MAIN GOAL?",
      opts:["💪 Muscle Gain","🔥 Fat Loss","🏃 Build Endurance","🧘 Improve Flexibility","⚡ General Fitness","🏆 Sport Performance"] },
    { key:"level",     img:IMG.pro,     lbl:"YOUR FITNESS LEVEL?",
      opts:["🌱 Complete Beginner","🌿 Some Experience","💪 Intermediate","🔥 Advanced","🏆 Elite / Athlete"] },
    { key:"days",      img:IMG.free,    lbl:"DAYS PER WEEK?",
      opts:["2 Days / Week","3 Days / Week","4 Days / Week","5 Days / Week","6 Days / Week"] },
    { key:"duration",  img:IMG.recovery,lbl:"HOW LONG PER SESSION?",
      opts:["30 Minutes","45 Minutes","60 Minutes","75 Minutes","90 Minutes","120 Minutes"] },
    { key:"equipment", img:IMG.trainer, lbl:"EQUIPMENT AVAILABLE?",
      opts:["🏠 No Equipment","🏠 Basic Home Gym","🏋️ Full Gym Access","🌳 Outdoors Only","🏊 Pool Access"] },
  ];

  if (step >= steps.length) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <HeroBg src={IMG.pro} ov="linear-gradient(180deg,rgba(10,10,10,.1) 0%,rgba(10,10,10,.95) 60%,rgba(10,10,10,1) 100%)" style={{ height:"260px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 22px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"48px", letterSpacing:"4px", lineHeight:.9 }}>YOU'RE<br/><span style={{ color:"var(--rd)" }}>READY.</span></div>
      </HeroBg>
      <div style={{ padding:"24px" }}>
        <Card style={{ padding:"16px", marginBottom:"18px" }}>
          {[["Goal",data.goal],["Level",data.level],["Days",data.days],["Duration",data.duration],["Equipment",data.equipment]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
              <span style={{ fontSize:"13px", color:"var(--mut)" }}>{k}</span>
              <span style={{ fontSize:"13px", fontWeight:600, color:"var(--txt)" }}>{v}</span>
            </div>
          ))}
        </Card>
        <PBtn onClick={()=>onDone(data)} style={{ fontSize:"17px", letterSpacing:"3px", color:"#000" }}>⚡ GENERATE MY PROGRAM</PBtn>
      </div>
    </div>
  );

  const cur = steps[step];
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <HeroBg src={cur.img} ov="linear-gradient(180deg,rgba(10,10,10,.05) 0%,rgba(10,10,10,.88) 55%,rgba(10,10,10,1) 100%)" style={{ height:"210px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px", position:"relative" }}>
        {step > 0 && <button onClick={()=>setStep(step-1)} style={{ position:"absolute", top:"14px", left:"14px", background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"8px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"6px 11px", fontSize:"11px", fontFamily:"var(--fm)" }}>← BACK</button>}
        <div style={{ display:"flex", gap:"5px", marginBottom:"10px" }}>{steps.map((_,i)=><div key={i} style={{ height:"4px", flex:1, background:i<=step?"var(--acc)":"rgba(255,255,255,.12)", borderRadius:"2px", transition:"background .3s" }}/>)}</div>
        <Mono style={{ color:"var(--acc)", marginBottom:"6px" }}>STEP {step+1} OF {steps.length}</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"clamp(22px,7vw,30px)", letterSpacing:"2px", lineHeight:1.1 }}>{cur.lbl}</div>
      </HeroBg>
      <div style={{ padding:"18px 18px 100px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {cur.opts.map(opt=>{
            const sel = data[cur.key]===opt;
            return (
              <button key={opt} onClick={()=>{ setData({...data,[cur.key]:opt}); setTimeout(()=>setStep(step+1), 180); }}
                style={{ padding:"18px 18px", background:sel?"rgba(124,58,237,.14)":"rgba(255,255,255,.04)", border:`2px solid ${sel?"var(--acc)":"rgba(255,255,255,.1)"}`, borderRadius:"14px", color:sel?"var(--txt)":"rgba(255,255,255,.75)", cursor:"pointer", textAlign:"left", fontSize:"18px", fontFamily:"var(--fb)", fontWeight:sel?700:500, display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all .15s" }}>
                <span>{opt}</span>
                <span style={{ width:"24px", height:"24px", borderRadius:"50%", border:`2px solid ${sel?"var(--acc)":"rgba(255,255,255,.2)"}`, background:sel?"var(--acc)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", color:"#000", flexShrink:0 }}>{sel?"✓":""}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GenProg({ profile, user, onDone }) {
  const started = useRef(false);
  const [phase, setPhase] = useState(0);
  const phases = ["Analysing your profile...", "Building training splits...", "Calculating progressive overload...", "Adding exercise prescriptions...", "Finalising your plan..."];

  useEffect(() => {
    if (started.current) return; started.current = true;
    const cycler = setInterval(() => setPhase(p => (p + 1) % phases.length), 1800);
    const goal = (profile.goal || "").replace(/[🔥💪🏃🧘⚡🏆]/g, "").trim();
    const level = (profile.level || "").replace(/[🌱🌿💪🔥🏆]/g, "").trim();
    const days = parseInt(profile.days) || 3;
    const duration = profile.duration || "60 Minutes";
    const equip = (profile.equipment || "").replace(/[🏠🏋️🌳🏊]/g, "").trim();

    const systemPrompt = `You are an elite certified personal trainer and sports scientist with 15+ years experience. Create advanced, periodized workout programs that deliver real results. You understand progressive overload, periodization, muscle physiology, and evidence-based training principles. Always be specific, practical and professional.`;

    const userPrompt = `Create a 4-week training program for:
- Name: ${user.name}, Goal: ${goal}, Level: ${level}
- ${days} days/week, ${duration} sessions, Equipment: ${equip}

Return ONLY valid JSON:
{
  "programName": "short name",
  "overview": "1-2 sentences",
  "methodology": "e.g. PPL / Upper-Lower",
  "weeklyStructure": "brief split",
  "week1": [
    {
      "day": "Monday",
      "sessionName": "e.g. Push Day A",
      "muscleGroups": ["Chest","Shoulders"],
      "duration": "${duration}",
      "intensity": "Moderate",
      "warmup": "5 min warmup",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": "3",
          "reps": "10-12",
          "rest": "75s",
          "tempo": "2-1-1-0",
          "rpe": "7",
          "cues": "key technique cue",
          "progression": "add 2.5kg when reps complete",
          "muscleTarget": "Primary muscle"
        }
      ],
      "cooldown": "5 min stretch",
      "sessionNotes": "focus for this day"
    }
  ],
  "progressionProtocol": "Week 1 @ RPE7, Week 2 add weight/reps, Week 3 peak effort RPE8-9, Week 4 deload 60%",
  "nutritionGuidance": {
    "preworkout": "advice",
    "postworkout": "advice",
    "dailyProtein": "target",
    "hydration": "target"
  },
  "recoveryProtocol": "sleep and recovery advice",
  "weeklyGoals": ["goal1","goal2","goal3"],
  "progressionMarkers": ["marker1","marker2"]
}

Include ${days} training days in week1. 4-5 exercises per day. Be specific to goal "${goal}".`;

    async function go() {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, system: systemPrompt, messages: [{ role: "user", content: userPrompt }] })
        });
        const d = await res.json();
        const raw = d.content?.[0]?.text || "";
        clearInterval(cycler);
        try {
          const parsed = JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim());
          // Derive all 4 phases from week1 if API returned week1 format
          onDone(buildPhases(parsed));
        }
        catch { onDone(advancedFallback(profile, user)); }
      } catch {
        clearInterval(cycler);
        setTimeout(() => onDone(advancedFallback(profile, user)), 900);
      }
    }
    go();
    return () => clearInterval(cycler);
  }, []);

  return (
    <HeroBg src={IMG.pro} ov="rgba(10,10,10,.92)" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"30px", textAlign:"center" }}>
      <div style={{ position:"relative", width:"80px", height:"80px", marginBottom:"24px" }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid rgba(124,58,237,.15)" }}/>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"var(--acc)", animation:"spin 1s linear infinite" }}/>
        <div style={{ position:"absolute", inset:"8px", borderRadius:"50%", border:"2px solid transparent", borderTopColor:"rgba(124,58,237,.4)", animation:"spin 1.5s linear infinite reverse" }}/>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Logo size={36} col="var(--acc)"/>
        </div>
      </div>
      <div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:"var(--acc)", letterSpacing:"3px", marginBottom:"10px" }}>BUILDING YOUR PROGRAM</div>
      <div style={{ fontFamily:"var(--fm)", fontSize:"11px", color:"rgba(255,255,255,.45)", letterSpacing:"1px", marginBottom:"28px", minHeight:"18px" }}>{phases[phase]}</div>
      <Card style={{ padding:"16px 20px", border:"1px solid rgba(124,58,237,.15)", maxWidth:"280px" }}>
        <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"8px" }}>YOUR PLAN INCLUDES</div>
        {["4-week progressive program","Warm-up & cool-down protocols","Exercise cues & tempo guide","Week-by-week overload plan","Nutrition & recovery guidance"].map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"4px 0", fontSize:"12px", color:"rgba(255,255,255,.6)" }}>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--acc)", flexShrink:0 }}/>
            {item}
          </div>
        ))}
      </Card>
    </HeroBg>
  );
}

// Derives 4 progressive weeks from a week1 day array
function buildPhases(parsed) {
  const base = parsed.week1 || parsed.phases?.[0]?.days || [];
  const makeWeek = (weekNum, theme, focus, rpeAdd, setsAdd, intensityLabel) => ({
    week: weekNum, theme, focus,
    days: base.map(day => ({
      ...day,
      intensity: intensityLabel,
      sessionNotes: weekNum === 4 ? "Deload — use 60% of Week 3 weights, focus on form" : day.sessionNotes,
      exercises: day.exercises.map(ex => ({
        ...ex,
        rpe: weekNum === 4 ? "5-6" : String(Math.min(10, parseInt(ex.rpe||7) + rpeAdd)),
        sets: weekNum === 4 ? "3" : String(Math.max(3, parseInt(ex.sets||3) + setsAdd)),
      }))
    }))
  });
  return {
    ...parsed,
    phases: [
      makeWeek(1, "Foundation", "Learn movements, establish baseline weights", 0, 0, "Moderate"),
      makeWeek(2, "Progressive Overload", "Add weight or reps to all main lifts", 1, 0, "Moderate-High"),
      makeWeek(3, "Intensification", "Peak effort — push to RPE 8-9", 2, 1, "High"),
      makeWeek(4, "Deload", "Reduce volume 40%, consolidate gains", 0, -1, "Low"),
    ],
    week1: undefined,
  };
}

const advancedFallback = (p, u) => {
  const goal = (p.goal || "").replace(/[🔥💪🏃🧘⚡🏆]/g, "").trim();
  const days = parseInt(p.days) || 3;
  const hasGym = (p.equipment || "").toLowerCase().includes("gym");

  const push = { day:"Monday", sessionName:"Push — Chest, Shoulders & Triceps", muscleGroups:["Chest","Shoulders","Triceps"], duration:"55 min", intensity:"Moderate",
    warmup:"5 min: arm circles 30s each direction, 10 band pull-aparts, 10 scapular push-ups, 30s deep breathing",
    exercises:[
      { name:hasGym?"Barbell Bench Press":"Push-ups", sets:"4", reps:"8-10", rest:"90s", tempo:"3-1-1-0", rpe:"7", cues:"Retract scapula, slight arch, drive in straight path", progression:"Add 2.5kg or 1 rep when all sets complete at top of range", muscleTarget:"Primary: Pectoralis major. Secondary: Anterior delt, triceps" },
      { name:hasGym?"Overhead Press":"Pike Push-ups", sets:"3", reps:"10-12", rest:"75s", tempo:"2-1-1-0", rpe:"7", cues:"Brace core, squeeze glutes, stack wrists over elbows", progression:"Add 2.5kg when all reps clean", muscleTarget:"Primary: Anterior & medial deltoid. Secondary: Triceps" },
      { name:hasGym?"Incline Dumbbell Press":"Decline Push-ups", sets:"3", reps:"10-12", rest:"75s", tempo:"3-0-1-0", rpe:"7", cues:"Keep shoulder blades pinched, lower to chest", progression:"+1 rep each week until 15, then add weight", muscleTarget:"Primary: Upper chest. Secondary: Front delt" },
      { name:hasGym?"Lateral Raises":"Plank Shoulder Taps", sets:"3", reps:"15", rest:"60s", tempo:"2-0-2-0", rpe:"6", cues:"Lead with elbows, slight forward lean, no swinging", progression:"Add 1kg every 2 weeks", muscleTarget:"Primary: Medial deltoid" },
      { name:hasGym?"Tricep Rope Pushdown":"Diamond Push-ups", sets:"3", reps:"12-15", rest:"60s", tempo:"2-1-2-0", rpe:"7", cues:"Keep elbows pinned to sides, full extension at bottom", progression:"+2.5kg when all reps complete", muscleTarget:"Primary: Triceps brachii, all three heads" },
    ],
    cooldown:"5 min: doorway chest stretch 30s, cross-body shoulder 30s each, overhead tricep stretch 30s each",
    sessionNotes:"Track all weights. Focus on feeling the muscle contract, not just moving the weight."
  };

  const pull = { day:"Wednesday", sessionName:"Pull — Back & Biceps", muscleGroups:["Lats","Rhomboids","Biceps","Rear Delts"], duration:"55 min", intensity:"Moderate",
    warmup:"5 min: 10 band pull-aparts, 10 scapular retractions, 10 face pulls, 5 dead hangs if possible",
    exercises:[
      { name:hasGym?"Deadlift":"Inverted Rows", sets:"4", reps:"6-8", rest:"2min", tempo:"3-1-1-0", rpe:"8", cues:"Hip hinge, neutral spine, bar close to body throughout", progression:"Add 5kg when form is solid for all reps", muscleTarget:"Primary: Erectors, glutes, hamstrings. Secondary: Lats, traps" },
      { name:hasGym?"Pull-ups or Lat Pulldown":"Australian Pull-ups", sets:"4", reps:"6-10", rest:"90s", tempo:"3-1-1-0", rpe:"8", cues:"Drive elbows to hips, think pulling elbows down not hands up", progression:"Add resistance band or +1 rep per week", muscleTarget:"Primary: Latissimus dorsi. Secondary: Biceps, rear delt" },
      { name:hasGym?"Seated Cable Row":"Resistance Band Row", sets:"3", reps:"10-12", rest:"75s", tempo:"2-1-2-1", rpe:"7", cues:"Squeeze between shoulder blades at peak, controlled return", progression:"+2.5kg when 12 reps feel manageable", muscleTarget:"Primary: Mid-back, rhomboids. Secondary: Biceps" },
      { name:hasGym?"Face Pulls":"Band Face Pulls", sets:"3", reps:"15-20", rest:"60s", tempo:"2-1-2-0", rpe:"6", cues:"Pull to nose level, external rotation at end of movement", progression:"Increase band resistance after 3 sessions", muscleTarget:"Primary: Rear delt, rotator cuff — vital for shoulder health" },
      { name:hasGym?"Barbell Curl":"Chin-ups or Band Curl", sets:"3", reps:"10-12", rest:"60s", tempo:"2-0-2-1", rpe:"7", cues:"Keep elbows fixed, full ROM, hard squeeze at top", progression:"+2.5kg when 12 reps complete across all sets", muscleTarget:"Primary: Biceps brachii. Secondary: Brachialis" },
    ],
    cooldown:"5 min: lat stretch with doorframe 30s each, bicep wall stretch 30s each, thoracic rotation 10 each side",
    sessionNotes:"Deadlifts are the priority movement. Reduce weight before sacrificing form."
  };

  const legs = { day:"Friday", sessionName:"Legs & Core — Lower Body Power", muscleGroups:["Quads","Hamstrings","Glutes","Calves","Core"], duration:"60 min", intensity:"High",
    warmup:"8 min: 2 min walk/jog, 10 bodyweight squats, 10 hip circles each leg, 10 glute bridges, 5 single-leg RDLs each",
    exercises:[
      { name:hasGym?"Barbell Back Squat":"Goblet Squat", sets:"4", reps:"8-10", rest:"2min", tempo:"3-1-1-0", rpe:"8", cues:"Brace core before descent, knees track toes, depth to parallel or below", progression:"Add 2.5-5kg when all 4 sets complete cleanly", muscleTarget:"Primary: Quads, glutes. Secondary: Hamstrings, erectors" },
      { name:hasGym?"Romanian Deadlift":"Single-leg RDL", sets:"3", reps:"10-12", rest:"90s", tempo:"3-1-1-0", rpe:"7", cues:"Push hips back, soft knee bend, feel the hamstring stretch", progression:"+5kg when form is solid throughout", muscleTarget:"Primary: Hamstrings, glutes. Secondary: Erectors" },
      { name:hasGym?"Leg Press":"Bulgarian Split Squat", sets:"3", reps:"12 each leg", rest:"75s", tempo:"3-1-1-0", rpe:"7", cues:"Front foot flat, knee stays behind toe, torso upright", progression:"+2.5kg or +1 rep each week", muscleTarget:"Primary: Quads, glutes. Secondary: Hamstrings" },
      { name:hasGym?"Calf Raises Machine":"Calf Raises on Step", sets:"4", reps:"15-20", rest:"60s", tempo:"2-1-3-0", rpe:"7", cues:"Full range — heels below platform to toes raised. Pause 1s at top", progression:"+5kg when 20 reps feel comfortable", muscleTarget:"Primary: Gastrocnemius, soleus" },
      { name:"Plank", sets:"3", reps:"45s", rest:"45s", tempo:"controlled", rpe:"6", cues:"Neutral spine, squeeze glutes, breathe steadily, no hip sag or hike", progression:"Increase to 60s then add movement", muscleTarget:"Primary: Transverse abdominis, obliques" },
      { name:hasGym?"Hanging Knee Raise":"Ab Wheel Rollout", sets:"3", reps:"10-12", rest:"60s", tempo:"3-0-1-0", rpe:"7", cues:"Control the eccentric, maintain hollow body, exhale on the way up", progression:"+2 reps each week", muscleTarget:"Primary: Rectus abdominis. Secondary: Hip flexors" },
    ],
    cooldown:"8 min: pigeon pose 60s each, hamstring stretch 45s each, hip flexor lunge 45s each, quad stretch 30s each",
    sessionNotes:"Legs drive the most hormonal response — biggest muscle group means biggest results. Never skip."
  };

  const allDays = [push, pull, legs,
    { ...push, day:"Tuesday", sessionName:"Upper A — Strength Focus", intensity:"High" },
    { ...pull, day:"Thursday", sessionName:"Upper B — Hypertrophy Focus" },
    { ...legs, day:"Saturday", sessionName:"Lower B — Volume Day" }
  ];
  const daySched = allDays.slice(0, Math.min(days, 6));

  const makeWeek = (weekNum, theme, focusNote) => ({
    week: weekNum, theme, focus: focusNote,
    days: daySched.map(d => ({
      ...d,
      exercises: d.exercises.map(ex => ({
        ...ex,
        rpe: weekNum === 4 ? "5-6" : String(Math.min(9, 6 + weekNum)),
        sets: weekNum === 3 ? String(parseInt(ex.sets) + 1) : weekNum === 4 ? "3" : ex.sets,
        notes: ["Learn the pattern — log your starting weights", "Push harder — add weight where possible", "Peak effort week — this is where gains are made", "Deload — 60% of Week 3 weights, perfect form"][weekNum - 1]
      }))
    }))
  });

  return {
    programName: `${u.name.split(" ")[0]}'s ${goal} Transformation Program`,
    overview: `A science-based 4-week periodized program built specifically for ${goal.toLowerCase()}. Every session uses progressive overload — systematically increasing demand each week to force continuous muscle adaptation. Week 4 is a strategic deload to consolidate gains and prepare you for the next training cycle.`,
    methodology: goal.includes("Muscle") ? "Linear Periodization with Push/Pull/Legs Split" : goal.includes("Fat") ? "Metabolic Resistance Training with Progressive Overload" : goal.includes("Endurance") ? "Block Periodization — Aerobic Base to Threshold" : "General Physical Preparedness (GPP)",
    weeklyStructure: `${days} training days per week with strategic muscle group sequencing for maximum recovery`,
    phases: [
      makeWeek(1, "Foundation", "Master technique and establish baseline weights. Every set logged."),
      makeWeek(2, "Progressive Overload", "Increase weight or reps on all main lifts from Week 1."),
      makeWeek(3, "Intensification", "Peak effort. Push RPE 8-9 on primary lifts."),
      makeWeek(4, "Deload", "Reduce volume 40%, maintain movement quality. Let adaptations consolidate."),
    ],
    progressionProtocol: "Week 1: Find working weights @ RPE 7. Week 2: Add 2.5-5kg to barbell, 1-2kg to dumbbells. Week 3: Another 2.5kg or top of rep range all sets. Week 4: Drop to 60% of Week 3, 3 sets. Next cycle: Restart from Week 2 weights.",
    nutritionGuidance: {
      preworkout: goal.includes("Fat") ? "Train fasted or light meal 2h prior: banana + black coffee" : "2h before: 40g carbs + 20g protein — oats + whey, or chicken + rice",
      postworkout: "Within 30 min: 30-40g protein + 40-60g carbs — whey + banana, or Greek yogurt + rice cake",
      dailyProtein: goal.includes("Muscle") ? "2.0-2.2g per kg bodyweight. 80kg person = 160-176g/day. Sources: chicken, eggs, fish, beef, Greek yogurt" : "1.6-1.8g per kg bodyweight minimum to preserve muscle while losing fat",
      hydration: "3-4L water daily. 500ml 30min pre-session, 200ml every 20min during, 500ml after. Add electrolytes on heavy sweat sessions."
    },
    recoveryProtocol: "7-9 hours sleep is non-negotiable — muscles rebuild during sleep. 10min mobility on rest days. Cold shower post-session reduces DOMS. Avoid alcohol 24h post-training — it significantly blunts protein synthesis.",
    weeklyGoals: [
      `Complete all ${days} sessions — consistency beats perfection`,
      "Log every set, weight and rep in a training journal",
      goal.includes("Muscle") ? "Eat at 200-300 calorie surplus with 2g/kg bodyweight protein" : goal.includes("Fat") ? "Maintain 300-500 calorie deficit, minimum 1.6g/kg protein" : "Hit 7,500 steps minimum on rest days"
    ],
    progressionMarkers: [
      "Week 2: You should lift more weight or reps than Week 1 on every lift",
      "Week 3: Noticeably stronger than Week 1 — proof the program works",
      goal.includes("Muscle") ? "Month end: 1-2kg bodyweight gain, clothes fitting tighter in right places" : goal.includes("Fat") ? "Month end: 2-3kg reduction, waist down 1-2cm" : "Month end: Sessions feel easier, resting heart rate dropping"
    ]
  };
};

// ─── Exercise Image Map ────────────────────────────────────────────────────────
const EX_IMAGES = {
  "Barbell Bench Press":     "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=60",
  "Push-ups":                "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=60",
  "Overhead Press":          "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=60",
  "Pike Push-ups":           "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=60",
  "Incline Dumbbell Press":  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=60",
  "Lateral Raises":          "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=400&q=60",
  "Tricep Rope Pushdown":    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=60",
  "Diamond Push-ups":        "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=60",
  "Deadlift":                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=60",
  "Barbell Deadlift":        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=60",
  "Pull-ups or Lat Pulldown":"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60",
  "Pull-ups":                "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60",
  "Australian Pull-ups":     "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60",
  "Inverted Rows":           "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60",
  "Seated Cable Row":        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=60",
  "Barbell Curl":            "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=60",
  "Barbell Back Squat":      "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&q=60",
  "Goblet Squat":            "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&q=60",
  "Romanian Deadlift":       "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=60",
  "Single-leg RDL":          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=60",
  "Leg Press":               "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=60",
  "Bulgarian Split Squat":   "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&q=60",
  "Calf Raises Machine":     "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=60",
  "Calf Raises on Step":     "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=60",
  "Plank":                   "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=60",
  "Ab Wheel Rollout":        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=60",
  "Hanging Knee Raise":      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60",
  "default":                 "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=60",
};
function getExImg(name) {
  for (const [k, v] of Object.entries(EX_IMAGES)) {
    if (name && name.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return EX_IMAGES.default;
}

function ProgramView({ prog }) {
  const [activeWeek, setActiveWeek] = useState(0);
  const [expDay, setExpDay] = useState(0);
  const [activeTab, setActiveTab] = useState("schedule");

  // Support both old format (weeklySchedule) and new (phases)
  const hasPhases = prog.phases && prog.phases.length > 0;
  const weeks = hasPhases ? prog.phases : [{ week:1, theme:"Program", days: prog.weeklySchedule || [] }];
  const currentWeek = weeks[activeWeek] || weeks[0];
  const days = currentWeek?.days || [];

  const intensityColor = (i) => {
    if (!i) return "var(--acc)";
    const l = i.toLowerCase();
    if (l === "high") return "var(--a2)";
    if (l === "low") return "var(--a3)";
    return "var(--acc)";
  };

  return (
    <div style={{ animation:"fadeIn .5s" }}>
      {/* Program header card */}
      <Card style={{ padding:"16px", marginBottom:"12px", border:"1px solid rgba(124,58,237,.15)" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"8px" }}>{prog.programName}</div>
        <p style={{ fontSize:"15px", lineHeight:1.8, color:"rgba(255,255,255,.75)", marginBottom:"10px" }}>{prog.overview}</p>
        {prog.methodology && (
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            <div style={{ padding:"4px 10px", background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", borderRadius:"50px", fontSize:"11px", color:"var(--a4)", fontFamily:"var(--fm)" }}>⚡ {prog.methodology}</div>
            {prog.weeklyStructure && <div style={{ padding:"4px 10px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"50px", fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)" }}>📅 {prog.weeklyStructure}</div>}
          </div>
        )}
      </Card>

      {/* Tab nav */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"12px", overflowX:"auto", scrollbarWidth:"none" }}>
        {[["schedule","💪 Schedule"],["nutrition","🥗 Nutrition"],["progression","📈 Progression"],["goals","🎯 Goals"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:"7px 13px", background:activeTab===t?"var(--acc)":"rgba(255,255,255,.04)", border:`1px solid ${activeTab===t?"var(--acc)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:activeTab===t?"#000":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fb)", fontWeight:activeTab===t?700:400, whiteSpace:"nowrap", flexShrink:0 }}>{lbl}</button>
        ))}
      </div>

      {/* SCHEDULE TAB */}
      {activeTab==="schedule" && (
        <div>
          {/* Week selector — only show if multiple weeks */}
          {weeks.length > 1 && (
            <div style={{ display:"flex", gap:"6px", marginBottom:"12px", overflowX:"auto", scrollbarWidth:"none" }}>
              {weeks.map((w, i) => (
                <button key={i} onClick={()=>{ setActiveWeek(i); setExpDay(0); }} style={{ flexShrink:0, padding:"8px 14px", background:activeWeek===i?"rgba(124,58,237,.12)":"rgba(255,255,255,.03)", border:`1px solid ${activeWeek===i?"var(--acc)":"rgba(255,255,255,.06)"}`, borderRadius:"10px", cursor:"pointer", textAlign:"left", minWidth:"100px" }}>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:activeWeek===i?"var(--acc)":"var(--mut)", letterSpacing:"1px", marginBottom:"2px" }}>WEEK {w.week}</div>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"11px", color:activeWeek===i?"var(--acc)":"var(--txt)", letterSpacing:"1px" }}>{w.theme}</div>
                </button>
              ))}
            </div>
          )}

          {/* Week focus */}
          {currentWeek.focus && (
            <div style={{ padding:"10px 13px", background:"rgba(124,58,237,.05)", border:"1px solid rgba(124,58,237,.12)", borderRadius:"10px", marginBottom:"12px", fontSize:"12px", color:"rgba(255,255,255,.6)", lineHeight:1.6 }}>
              <span style={{ color:"var(--acc)", fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"1px", marginRight:"6px" }}>WEEK FOCUS:</span>{currentWeek.focus}
            </div>
          )}

          {/* Weekly goals if available */}
          {prog.weeklyGoals?.length > 0 && activeWeek === 0 && (
            <div style={{ marginBottom:"12px" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"7px" }}>THIS CYCLE'S GOALS</div>
              {prog.weeklyGoals.map((g, i) => (
                <Card key={i} style={{ padding:"9px 12px", marginBottom:"5px", display:"flex", alignItems:"flex-start", gap:"9px" }}>
                  <div style={{ width:"18px", height:"18px", borderRadius:"50%", border:"2px solid var(--acc)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:"var(--acc)", flexShrink:0, marginTop:"1px" }}>✓</div>
                  <span style={{ fontSize:"13px", lineHeight:1.5 }}>{g}</span>
                </Card>
              ))}
            </div>
          )}

          {/* Day cards */}
          <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"8px" }}>
            {days.length} SESSIONS THIS WEEK
          </div>
          {days.map((day, i) => (
            <Card key={i} style={{ marginBottom:"12px", overflow:"hidden", border:`2px solid ${expDay===i?"var(--acc)":"rgba(255,255,255,.12)"}`, borderRadius:"14px" }}>
              {/* Day header */}
              <div onClick={()=>setExpDay(expDay===i?-1:i)} style={{ padding:"13px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:"17px", marginBottom:"3px" }}>{day.day}</div>
                  <div style={{ fontSize:"13px", color:"var(--acc)", fontFamily:"var(--fm)", letterSpacing:"1px", marginBottom:"3px" }}>{day.sessionName || day.focus}</div>
                  {day.muscleGroups && <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>{day.muscleGroups.map(mg=><span key={mg} style={{ fontSize:"10px", padding:"1px 7px", background:"rgba(255,255,255,.05)", borderRadius:"4px", color:"var(--mut)" }}>{mg}</span>)}</div>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"7px", flexShrink:0 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"10px", padding:"3px 9px", borderRadius:"20px", background:intensityColor(day.intensity)+"18", color:intensityColor(day.intensity), fontFamily:"var(--fm)", letterSpacing:"1px" }}>{day.intensity || "Moderate"}</div>
                    {day.duration && <div style={{ fontSize:"10px", color:"var(--mut)", marginTop:"3px", fontFamily:"var(--fm)" }}>⏱ {day.duration}</div>}
                  </div>
                  <span style={{ color:"var(--mut)", fontSize:"14px", transform:expDay===i?"rotate(180deg)":"rotate(0)", transition:"transform .2s" }}>⌄</span>
                </div>
              </div>

              {/* Expanded content */}
              {expDay===i && (
                <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", animation:"fadeIn .2s" }}>
                  {/* Warmup */}
                  {day.warmup && (
                    <div style={{ padding:"10px 14px", background:"rgba(147,51,234,.05)", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                      <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--a3)", letterSpacing:"1px", marginBottom:"3px" }}>🔥 WARM-UP</div>
                      <div style={{ fontSize:"14px", color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>{day.warmup}</div>
                    </div>
                  )}

                  {/* Exercises */}
                  <div style={{ padding:"0 14px" }}>
                    {(day.exercises || []).map((ex, j) => (
                      <div key={j} style={{ padding:"12px 0", borderBottom:j<(day.exercises.length-1)?"1px solid rgba(255,255,255,.04)":"none" }}>
                        {/* Exercise image */}
                        <div style={{ height:"110px", borderRadius:"10px", overflow:"hidden", marginBottom:"9px", position:"relative" }}>
                          <img src={getExImg(ex.name)} alt={ex.name} style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.7) saturate(.8)" }} onError={e=>{ e.target.src=EX_IMAGES.default; }}/>
                          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 40%,rgba(10,10,10,.85) 100%)" }}/>
                          <div style={{ position:"absolute", bottom:"8px", left:"10px", right:"10px" }}>
                            <div style={{ fontSize:"13px", fontWeight:700, color:"#fff", letterSpacing:".5px" }}>{ex.name}</div>
                          </div>
                        </div>
                        {/* Exercise name row */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:"12px", fontWeight:500, color:"var(--mut)", marginBottom:"2px" }}>{ex.name}</div>
                            {ex.muscleTarget && <div style={{ fontSize:"13px", color:"var(--mut)", lineHeight:1.5 }}>{ex.muscleTarget}</div>}
                          </div>
                          {ex.rpe && <div style={{ padding:"2px 8px", background:"rgba(255,61,107,.1)", border:"1px solid rgba(255,61,107,.2)", borderRadius:"6px", fontSize:"10px", color:"var(--a2)", fontFamily:"var(--fm)", flexShrink:0, marginLeft:"8px" }}>RPE {ex.rpe}</div>}
                        </div>
                        {/* Stats row */}
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px", marginBottom:"6px" }}>
                          {[{v:ex.sets,l:"sets"},{v:ex.reps,l:"reps"},{v:ex.rest,l:"rest"},{v:ex.tempo,l:"tempo"}].map((x,k)=>x.v?(
                            <div key={k} style={{ textAlign:"center", padding:"6px 4px", background:"rgba(255,255,255,.04)", borderRadius:"7px" }}>
                              <div style={{ fontFamily:"var(--fm)", fontSize:"14px", color:"var(--acc)", fontWeight:700 }}>{x.v}</div>
                              <div style={{ fontFamily:"var(--fm)", fontSize:"11px", color:"var(--mut)", marginTop:"2px" }}>{x.l}</div>
                            </div>
                          ):null)}
                        </div>
                        {/* Cues */}
                        {ex.cues && (
                          <div style={{ padding:"7px 10px", background:"rgba(124,58,237,.05)", border:"1px solid rgba(124,58,237,.1)", borderRadius:"7px", marginBottom:"4px" }}>
                            <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"2px" }}>TECHNIQUE CUES</div>
                            <div style={{ fontSize:"14px", color:"rgba(255,255,255,.8)", lineHeight:1.6 }}>{ex.cues}</div>
                          </div>
                        )}
                        {/* Progression */}
                        {ex.progression && (
                          <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:"var(--a3)" }}>
                            <span>📈</span><span>{ex.progression}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Cooldown */}
                  {day.cooldown && (
                    <div style={{ padding:"10px 14px", background:"rgba(124,58,237,.05)", borderTop:"1px solid rgba(255,255,255,.04)" }}>
                      <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--a4)", letterSpacing:"1px", marginBottom:"3px" }}>❄️ COOL-DOWN</div>
                      <div style={{ fontSize:"14px", color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>{day.cooldown}</div>
                    </div>
                  )}

                  {/* Session notes */}
                  {day.sessionNotes && (
                    <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(255,255,255,.04)", background:"rgba(255,255,255,.02)" }}>
                      <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--yw)", letterSpacing:"1px", marginBottom:"3px" }}>💡 COACH NOTES</div>
                      <div style={{ fontSize:"12px", color:"rgba(255,255,255,.55)", lineHeight:1.6 }}>{day.sessionNotes}</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* NUTRITION TAB */}
      {activeTab==="nutrition" && prog.nutritionGuidance && (
        <div style={{ animation:"fadeIn .3s" }}>
          {[
            {title:"PRE-WORKOUT", icon:"⚡", content:prog.nutritionGuidance.preworkout, col:"var(--yw)"},
            {title:"POST-WORKOUT", icon:"💪", content:prog.nutritionGuidance.postworkout, col:"var(--a3)"},
            {title:"DAILY PROTEIN", icon:"🥩", content:prog.nutritionGuidance.dailyProtein, col:"var(--a2)"},
            {title:"HYDRATION", icon:"💧", content:prog.nutritionGuidance.hydration, col:"var(--acc)"},
          ].map(item => item.content && (
            <Card key={item.title} style={{ padding:"14px", marginBottom:"10px", border:`1px solid ${item.col}20` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                <span style={{ fontSize:"18px" }}>{item.icon}</span>
                <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:item.col, letterSpacing:"1px" }}>{item.title}</div>
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>{item.content}</div>
            </Card>
          ))}
          {prog.recoveryProtocol && (
            <Card style={{ padding:"14px", border:"1px solid rgba(124,58,237,.2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                <span style={{ fontSize:"18px" }}>😴</span>
                <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--a4)", letterSpacing:"1px" }}>RECOVERY PROTOCOL</div>
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>{prog.recoveryProtocol}</div>
            </Card>
          )}
        </div>
      )}

      {/* PROGRESSION TAB */}
      {activeTab==="progression" && (
        <div style={{ animation:"fadeIn .3s" }}>
          {prog.progressionProtocol && (
            <Card style={{ padding:"14px", marginBottom:"12px", border:"1px solid rgba(124,58,237,.15)" }}>
              <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"10px" }}>📈 OVERLOAD PROTOCOL</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)", lineHeight:1.8 }}>{prog.progressionProtocol}</div>
            </Card>
          )}
          {weeks.length > 1 && (
            <div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"9px" }}>WEEKLY PROGRESSION MAP</div>
              {weeks.map((w, i) => (
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"10px", alignItems:"flex-start" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:i===3?"rgba(124,58,237,.2)":i===2?"rgba(255,61,107,.2)":"rgba(124,58,237,.12)", border:`1px solid ${i===3?"var(--a4)":i===2?"var(--a2)":"var(--acc)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"12px", color:i===3?"var(--a4)":i===2?"var(--a2)":"var(--acc)", flexShrink:0 }}>{w.week}</div>
                  <Card style={{ flex:1, padding:"11px 13px", border:`1px solid ${i===3?"rgba(124,58,237,.15)":i===2?"rgba(255,61,107,.15)":"rgba(255,255,255,.06)"}` }}>
                    <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", color:i===3?"var(--a4)":i===2?"var(--a2)":"var(--acc)", marginBottom:"3px" }}>{w.theme}</div>
                    <div style={{ fontSize:"12px", color:"rgba(255,255,255,.55)", lineHeight:1.5 }}>{w.focus}</div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GOALS TAB */}
      {activeTab==="goals" && (
        <div style={{ animation:"fadeIn .3s" }}>
          {prog.weeklyGoals?.length > 0 && (
            <div style={{ marginBottom:"16px" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"9px" }}>YOUR TARGETS</div>
              {prog.weeklyGoals.map((g, i) => (
                <Card key={i} style={{ padding:"12px 14px", marginBottom:"7px", display:"flex", alignItems:"flex-start", gap:"10px", border:"1px solid rgba(124,58,237,.1)" }}>
                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", border:"2px solid var(--acc)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"var(--acc)", flexShrink:0, marginTop:"1px" }}>{i+1}</div>
                  <span style={{ fontSize:"13px", lineHeight:1.6 }}>{g}</span>
                </Card>
              ))}
            </div>
          )}
          {prog.progressionMarkers?.length > 0 && (
            <div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"9px" }}>HOW TO KNOW IT'S WORKING</div>
              {prog.progressionMarkers.map((m, i) => (
                <Card key={i} style={{ padding:"12px 14px", marginBottom:"7px", display:"flex", alignItems:"flex-start", gap:"10px", border:"1px solid rgba(147,51,234,.12)" }}>
                  <span style={{ fontSize:"16px", flexShrink:0 }}>📊</span>
                  <span style={{ fontSize:"13px", lineHeight:1.6, color:"rgba(255,255,255,.75)" }}>{m}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Exercise Q&A (for trainer-assigned members) ──────────────────────────────
function ExerciseQA() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const QUICK = ["How do I squat correctly?","Show me push-up form","How to do a deadlift","Best bicep exercises","Proper plank technique","Romanian deadlift form"];

  async function ask(q) {
    const question = q||query.trim();
    if (!question) return;
    setLoading(true); setResults(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,
          system:"You are a fitness coach. Answer exercise questions concisely. Always include a relevant YouTube URL for form demonstrations. Known URLs: squat:https://youtu.be/gcNh17Ckjgg deadlift:https://youtu.be/op9kVnSso6Q bench:https://youtu.be/rT7DgCr-3pg push-up:https://youtu.be/IODxDxX7oi4 plank:https://youtu.be/ASdvN_XEl_c",
          messages:[{role:"user",content:question}]})
      });
      const d = await res.json();
      setResults(d.content?.[0]?.text||"Sorry, try again.");
    } catch { setResults("Connection error. Please try again."); }
    setLoading(false);
  }

  const ytMatch = results && results.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"11px" }}>🎥 EXERCISE Q&A</div>
      <div style={{ display:"flex", gap:"7px", marginBottom:"11px" }}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask about any exercise..." style={{ flex:1, padding:"11px 13px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none" }}/>
        <button onClick={()=>ask()} disabled={!query.trim()||loading} style={{ padding:"11px 16px", background:query.trim()&&!loading?"var(--acc)":"rgba(255,255,255,.07)", border:"none", borderRadius:"10px", color:query.trim()&&!loading?"#000":"var(--mut)", cursor:query.trim()&&!loading?"pointer":"default", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>ASK</button>
      </div>
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"14px" }}>
        {QUICK.map(q=><button key={q} onClick={()=>ask(q)} style={{ padding:"5px 11px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"50px", color:"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{q}</button>)}
      </div>
      {loading && <Card style={{ padding:"18px", textAlign:"center" }}><div style={{ width:"36px",height:"36px",borderRadius:"50%",border:"3px solid var(--acc)",borderTopColor:"transparent",animation:"spin 1s linear infinite",margin:"0 auto 10px" }}/><Mono style={{color:"var(--acc)"}}>Finding answer...</Mono></Card>}
      {results && !loading && (
        <Card style={{ padding:"14px" }}>
          {ytMatch && (
            <a href={"https://youtu.be/"+ytMatch[1]} target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",background:"rgba(255,0,0,.08)",border:"1px solid rgba(255,0,0,.2)",borderRadius:"10px",textDecoration:"none",color:"var(--txt)",marginBottom:"12px" }}>
              <div style={{ position:"relative",width:"60px",height:"40px",borderRadius:"6px",overflow:"hidden",background:"#000",flexShrink:0 }}>
                <img src={"https://img.youtube.com/vi/"+ytMatch[1]+"/mqdefault.jpg"} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{width:"18px",height:"18px",background:"rgba(255,0,0,.85)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7px",color:"#fff"}}>▶</div></div>
              </div>
              <div><Mono style={{color:"#ff4444",marginBottom:"2px",letterSpacing:"1px"}}>▶ WATCH TUTORIAL</Mono><div style={{fontSize:"11px",color:"var(--mut)"}}>Tap to open on YouTube</div></div>
            </a>
          )}
          <div style={{ fontSize:"14px", lineHeight:1.8, whiteSpace:"pre-wrap", color:"rgba(255,255,255,.85)" }}>{results.replace(/https?:\/\/\S+/g,"").trim()}</div>
        </Card>
      )}
    </div>
  );
}

// ─── Member Packages (purchase) ────────────────────────────────────────────────
function MemberPackages({ user }) {
  const [showPay, setShowPay] = useState(null);
  const DEMO_PKGS = [
    { id:1, name:"Starter Pack", sessions:4, price:"49.99", desc:"4 x 1-on-1 sessions", perks:"Nutrition guide included", trainer:"Your Trainer" },
    { id:2, name:"Monthly Program", sessions:8, price:"89.99", desc:"8 sessions + program", perks:"Full program + nutrition", trainer:"Your Trainer" },
    { id:3, name:"Elite Transform", sessions:16, price:"159.99", desc:"16 sessions + 4-week plan", perks:"Full access + weekly check-ins", trainer:"Your Trainer" },
  ];
  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"6px" }}>📦 TRAINING PACKAGES</div>
      <Mono style={{ marginBottom:"14px" }}>Purchase directly from your trainer</Mono>
      {DEMO_PKGS.map(pkg=>(
        <Card key={pkg.id} style={{ padding:"15px", marginBottom:"10px", border:"1px solid rgba(124,58,237,.2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
            <div><div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--acc)", letterSpacing:"1px" }}>{pkg.name}</div><Mono style={{ marginTop:"2px" }}>{pkg.sessions} sessions with {pkg.trainer}</Mono></div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:"var(--a3)" }}>${pkg.price}</div>
          </div>
          {pkg.desc && <div style={{ fontSize:"13px", color:"rgba(255,255,255,.6)", marginBottom:"4px" }}>{pkg.desc}</div>}
          {pkg.perks && <div style={{ fontSize:"12px", color:"var(--a3)", marginBottom:"12px" }}>✓ {pkg.perks}</div>}
          <PBtn onClick={()=>setShowPay(pkg)} style={{ color:"#000", fontSize:"14px", letterSpacing:"1px" }}>💳 PURCHASE — ${pkg.price}</PBtn>
        </Card>
      ))}
      {showPay && <PayPalModal planName={showPay.name} amount={showPay.price} onSuccess={()=>setShowPay(null)} onClose={()=>setShowPay(null)}/>}
    </div>
  );
}


// ─── Member Dashboard ──────────────────────────────────────────────────────────
function MemberDashboard({ user, tab, setTab, sub, ctx, onUpgrade, onHome }) {
  const [showGen, setShowGen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [prog, setProg] = useState(null);
  const [showContact, setShowContact] = useState(false);

  // Trainer client: skip profile setup, use trainer-assigned program
  if (user.isTrainerClient) {
    // Show a limited view - no profile setup needed
  } else {
    if (!profile) return <ProfileSetup onDone={p=>{ setProfile(p); setShowGen(true); }} user={user}/>;
    if (showGen && !prog) return <GenProg profile={profile} user={user} onDone={p=>{ setProg(p); setShowGen(false); setTab("program"); }}/>;
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", paddingBottom:"100px" }}>
      {/* Header */}
      <div style={{ position:"relative", height:"200px" }}>
        <img src={sub?.id==="pro"?IMG.pro:IMG.free} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.45) saturate(.7)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(10,10,10,.3) 0%,rgba(10,10,10,.85) 100%)" }}/>
        {/* Top row */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div onClick={onHome} style={{ cursor:"pointer" }}><Wordmark size={22} col="rgba(255,255,255,.9)"/></div>
          <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"50px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"5px 13px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>CONTACT</button>
        </div>
        {/* User info row */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 18px 16px", display:"flex", alignItems:"flex-end", gap:"12px" }}>
          <div style={{ width:"64px", height:"64px", borderRadius:"50%", overflow:"hidden", border:"2.5px solid rgba(124,58,237,.5)", flexShrink:0, boxShadow:"0 4px 16px rgba(124,58,237,.2)" }}>
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80" alt="Member" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          <div style={{ flex:1, paddingBottom:"2px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px", lineHeight:1, color:"var(--txt)" }}>HEY, {user.name.split(" ")[0].toUpperCase()}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"5px" }}>
              <div style={{ padding:"2px 9px", background:sub?.id==="pro"?"rgba(124,58,237,.15)":"rgba(147,51,234,.12)", border:`1px solid ${sub?.id==="pro"?"rgba(124,58,237,.3)":"rgba(147,51,234,.3)"}`, borderRadius:"50px", fontSize:"10px", fontFamily:"var(--fm)", color:sub?.id==="pro"?"var(--acc)":"var(--a3)", letterSpacing:"1px" }}>
                {sub?.id==="pro"?"⚡ PRO":"🎁 FREE TRIAL"}
              </div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,.4)" }}>{(profile?.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim()} · Week 1</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"7px", padding:"12px 18px 4px", overflowX:"auto", scrollbarWidth:"none" }}>
        {(user.isTrainerClient
          ? [["program","📋","My Program"],["nutrition","🥗","Nutrition"],["exercises","🎥","Exercises"],["account","👤","Account"],["packages","📦","Packages"]]
          : [["program","📋","Program"],["nutrition","🥗","Nutrition"],["wearables","⌚","Wearables"],["stats","📊","Stats"],["account","👤","Account"],["new","🔄","New Plan"]]
        ).map(([t,ic,lbl])=>{
          const isA = tab===t;
          return (
            <button key={t} onClick={()=>{ if(t==="new"){ setProg(null); setShowGen(true); } else setTab(t); }}
              style={{ padding:"7px 14px", background:isA?"var(--acc)":"rgba(255,255,255,.05)", border:`1px solid ${isA?"var(--acc)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:isA?"#000":"rgba(255,255,255,.55)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fb)", fontWeight:isA?700:500, whiteSpace:"nowrap", transition:"all .2s", display:"flex", alignItems:"center", gap:"5px", flexShrink:0 }}>
              <span style={{ fontSize:"13px" }}>{ic}</span>{lbl}
            </button>
          );
        })}
      </div>
      {sub && ctx && (
        <div onClick={()=>onUpgrade("trial_expired")} style={{ margin:"0 18px 11px", padding:"9px 13px", background:ctx.daysLeft()<=7?"rgba(255,61,107,.07)":"rgba(124,58,237,.05)", border:`1px solid ${ctx.daysLeft()<=7?"rgba(255,61,107,.25)":"rgba(124,58,237,.18)"}`, borderRadius:"12px", cursor:"pointer", display:sub.id==="free"?"block":"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}><Mono style={{ color:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)" }}>{ctx.daysLeft()<=7?"⚠️ TRIAL ENDING":"🎁 FREE TRIAL"}</Mono><Mono>{ctx.daysLeft()}d left</Mono></div>
          <div style={{ height:"3px", background:"rgba(255,255,255,.08)", borderRadius:"2px", overflow:"hidden" }}><div style={{ height:"100%", width:Math.min(100,(30-ctx.daysLeft())/30*100)+"%", background:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)", transition:"width .5s" }}/></div>
          <div style={{ marginTop:"4px", fontSize:"11px", color:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)", textDecoration:"underline" }}>Upgrade to Pro →</div>
        </div>
      )}
      <div style={{ padding:"0 18px" }}>
        {tab==="program" && prog && <ProgramView prog={prog}/>}
        {tab==="nutrition" && <NutritionHub/>}
        {tab==="wearables" && <WearablesHub/>}
        {tab==="exercises" && (
          <ExerciseQA/>
        )}
        {tab==="packages" && (
          <MemberPackages user={user}/>
        )}
        {tab==="stats" && (
          <div style={{ animation:"fadeIn .4s" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"11px" }}>YOUR STATS</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"9px" }}>
              {[["🏋️","0","sessions","var(--acc)","Workouts Done"],["🔥","0","kcal","var(--rd)","Calories Burned"],["⚡","0","days","var(--a3)","Current Streak"],["📅","1","of 4","var(--tr)","Program Week"]].map(([i,v,u,c,l])=>(
                <Card key={l} style={{ padding:"15px" }}><div style={{ fontSize:"21px", marginBottom:"5px" }}>{i}</div><div style={{ fontFamily:"var(--fd)", fontSize:"28px", color:c }}>{v}</div><div style={{ fontSize:"10px", color:"var(--mut)" }}>{u}</div><div style={{ fontSize:"11px", color:"var(--txt)", marginTop:"2px" }}>{l}</div></Card>
              ))}
            </div>
          </div>
        )}
        {tab==="account" && sub && ctx && (
          <AccountTab sub={sub} ctx={ctx} user={user} onUpgrade={onUpgrade}/>
        )}
      </div>
      {showContact && <ContactModal onClose={()=>setShowContact(false)}/>}
    </div>
  );
}

function UpgradeBtn({ onUpgrade }) {
  const [showPP, setShowPP] = useState(false);
  return (
    <>
      <button onClick={()=>setShowPP(true)} style={{ width:"100%", padding:"12px", background:"var(--acc)", border:"none", borderRadius:"var(--r)", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"2px" }}>💳 UPGRADE TO PRO — $4.99/mo</button>
      {showPP && <PayPalModal planName="Fit2All Pro" amount="4.99" onSuccess={()=>onUpgrade("done")} onClose={()=>setShowPP(false)}/>}
    </>
  );
}

// ─── Plan Selection ────────────────────────────────────────────────────────────
function PlanScreen({ onSelect, onBack }) {
  const [sel, setSel] = useState("free");
  const [showPP, setShowPP] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", overflowY:"auto" }}>
      <HeroBg src={sel==="pro"?IMG.pro:IMG.free} ov="linear-gradient(180deg,rgba(10,10,10,.15) 0%,rgba(10,10,10,.92) 55%,rgba(10,10,10,1) 100%)" style={{ height:"205px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px", position:"relative" }}>
        <BackBtn onClick={onBack}/>
        <Mono style={{ color:"var(--a3)", marginBottom:"5px" }}>CHOOSE YOUR FIT2ALL PLAN</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"30px", letterSpacing:"3px", lineHeight:1 }}>START YOUR <span style={{ color:"var(--acc)" }}>JOURNEY</span></div>
      </HeroBg>
      <div style={{ padding:"18px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px", marginBottom:"16px" }}>
          {Object.values(MEMBER_PLANS).map(p=>(
            <button key={p.id} onClick={()=>setSel(p.id)} style={{ padding:"12px", background:sel===p.id?p.color+"15":"rgba(255,255,255,.03)", border:`2px solid ${sel===p.id?p.color:"rgba(255,255,255,.06)"}`, borderRadius:"12px", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"17px", color:p.color, letterSpacing:"2px" }}>{p.name}</div>
              <div style={{ fontSize:"16px", fontWeight:700, color:"var(--txt)", marginTop:"3px" }}>{p.price}</div>
              <Mono style={{ marginTop:"2px" }}>{p.period}</Mono>
            </button>
          ))}
        </div>
        <Card style={{ padding:"14px", marginBottom:"14px" }}>
          <Mono style={{ marginBottom:"11px" }}>WHAT'S INCLUDED</Mono>
          {MEMBER_PLANS[sel].features.map((f,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"7px 0", borderBottom:i<MEMBER_PLANS[sel].features.length-1?"1px solid rgba(255,255,255,.04)":"none" }}>
              <span style={{ width:"16px", height:"16px", borderRadius:"50%", background:f.y?MEMBER_PLANS[sel].color+"20":"rgba(255,255,255,.04)", border:`1px solid ${f.y?MEMBER_PLANS[sel].color:"rgba(255,255,255,.08)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:f.y?MEMBER_PLANS[sel].color:"var(--mut)", flexShrink:0 }}>{f.y?"✓":"✕"}</span>
              <span style={{ fontSize:"13px", color:f.y?"var(--txt)":"var(--mut)", opacity:f.y?1:.5, flex:1 }}>{f.l}</span>
              {f.d && f.y && <span style={{ fontSize:"11px", color:MEMBER_PLANS[sel].color, fontFamily:"var(--fm)" }}>{f.d}</span>}
            </div>
          ))}
        </Card>
        <PBtn onClick={()=>sel==="pro"?setShowPP(true):onSelect("free")} col={MEMBER_PLANS[sel].color} style={{ fontSize:"16px", letterSpacing:"2px", color:sel==="pro"?"#fff":"#000" }}>
          {sel==="pro"?"💳 PAY $4.99/mo via PayPal":"🎁 START FREE TRIAL"}
        </PBtn>
        <Mono style={{ textAlign:"center", marginTop:"8px" }}>{sel==="pro"?"Secure checkout · Cancel anytime":"No credit card required"}</Mono>
      </div>
      {showPP && <PayPalModal planName="Fit2All Pro" amount="4.99" onSuccess={()=>onSelect("pro")} onClose={()=>setShowPP(false)}/>}
    </div>
  );
}

function UpgradeModal({ reason, onUpgrade, onClose }) {
  const [showPP, setShowPP] = useState(false);
  const cfg = { ai_limit:{icon:"🤖",title:"DAILY LIMIT REACHED",body:"You've used your 2 daily AI questions. Upgrade for unlimited."}, trial_expired:{icon:"⏰",title:"TRIAL EXPIRED",body:"Your 30-day free trial has ended. Upgrade to continue."} };
  const info = cfg[reason] || cfg.ai_limit;
  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.9)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:600, animation:"fadeIn .2s" }} onClick={onClose}>
        <div className="glass" style={{ borderRadius:"22px 22px 0 0", padding:"24px 20px 42px", width:"100%", maxWidth:"480px", animation:"slideUp .3s", border:"1px solid rgba(255,255,255,.1)" }} onClick={e=>e.stopPropagation()}>
          <div style={{ textAlign:"center", marginBottom:"16px" }}>
            <div style={{ fontSize:"38px", marginBottom:"7px" }}>{info.icon}</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"19px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"6px" }}>{info.title}</div>
            <p style={{ fontSize:"13px", color:"var(--mut)", lineHeight:1.7 }}>{info.body}</p>
          </div>
          <PBtn onClick={()=>setShowPP(true)} style={{ marginBottom:"8px", fontSize:"14px", letterSpacing:"2px", color:"#000" }}>💳 PAY $4.99/mo via PayPal</PBtn>
          <PBtn onClick={onClose} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.08)", color:"var(--mut)", fontSize:"14px" }}>Maybe later</PBtn>
        </div>
      </div>
      {showPP && <PayPalModal planName="Fit2All Pro" amount="4.99" onSuccess={()=>{ onUpgrade(); onClose(); }} onClose={()=>setShowPP(false)}/>}
    </>
  );
}

// ─── Splash + Auth ─────────────────────────────────────────────────────────────
function SplashScreen({ onContinue, onAdminHold }) {
  const [visible, setVisible] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [holdProg, setHoldProg] = useState(0);
  const holdRef = useRef(null); const intRef = useRef(null);
  useEffect(() => { setTimeout(()=>setVisible(true), 100); }, []);

  function startHold() {
    holdRef.current = Date.now();
    intRef.current = setInterval(() => {
      const elapsed = Date.now() - holdRef.current;
      const pct = Math.min(100, (elapsed / 5000) * 100);
      setHoldProg(pct);
      if (elapsed >= 5000) { clearInterval(intRef.current); setHoldProg(0); onAdminHold(); }
    }, 50);
  }
  function endHold() { clearInterval(intRef.current); setHoldProg(0); }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>

      {/* Full-bleed hero image - top third */}
      <div style={{ position:"relative", height:"20vh", flexShrink:0 }}>
        <img src={IMG.splash} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", filter:"brightness(.55) saturate(.75)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,.2) 70%, rgba(10,10,10,1) 100%)" }}/>

        {/* Top bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:10 }}>
          <div onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold} onTouchStart={startHold} onTouchEnd={endHold} style={{ position:"relative", userSelect:"none" }}>
            <Wordmark size={38} col="#ffffff"/>
            {holdProg > 0 && (
              <div style={{ position:"absolute", bottom:"-3px", left:0, right:0, height:"2px", background:"rgba(255,255,255,.15)", borderRadius:"1px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:holdProg+"%", background:"var(--rd)", borderRadius:"1px", transition:"width .05s linear" }}/>
              </div>
            )}
          </div>
          <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.18)", borderRadius:"50px", color:"rgba(255,255,255,.8)", cursor:"pointer", padding:"6px 14px", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px", backdropFilter:"blur(8px)" }}>CONTACT</button>
        </div>
      </div>

      {/* Content panel */}
      <div style={{ flex:1, padding:"16px 22px 28px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>

        {/* Brand heading + all content */}
        <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)", transition:"all .65s cubic-bezier(.16,1,.3,1)" }}>
          {/* AI badge — tight under image */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 12px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.3)", borderRadius:"50px", marginBottom:"12px" }}>
            <Dot col="#ffffff"/><span style={{ fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"2px", color:"#ffffff" }}>AI-POWERED FITNESS</span>
          </div>
          <div style={{ fontFamily:"var(--fd)", fontWeight:900, fontSize:"clamp(46px,13vw,68px)", letterSpacing:"5px", lineHeight:.85, marginBottom:"8px" }}>
            <span style={{ color:"var(--txt)" }}>FIT</span><span style={{ color:"var(--rd)" }}>2</span><span style={{ color:"var(--txt)" }}>ALL</span>
          </div>
          <Mono style={{ color:"rgba(255,255,255,.35)", letterSpacing:"3px", marginBottom:"22px" }}>MOVE BETTER · LIVE STRONGER</Mono>

          {/* Role selector cards - side by side */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"40px" }}>
            {[
              {role:"trainer",  img:IMG.trainer, title:"TRAINER",  sub:"Manage clients",     border:"rgba(255,112,67,.4)", col:"var(--tr)",  glow:"rgba(255,112,67,.06)"},
              {role:"enthusiast",img:IMG.workout, title:"MEMBER",  sub:"Start your journey", border:"rgba(124,58,237,.4)",  col:"var(--acc)", glow:"rgba(124,58,237,.06)"}
            ].map(item=>(
              <button key={item.role} onClick={()=>onContinue(item.role)} style={{ all:"unset", cursor:"pointer", display:"block" }}>
                <div style={{ border:`1px solid ${item.border}`, borderRadius:"20px", overflow:"hidden", transition:"transform .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  {/* Full image */}
                  <div style={{ position:"relative", height:"130px", overflow:"hidden" }}>
                    <img src={item.img} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.6) saturate(.8)" }}/>
                    <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg, transparent 40%, ${item.glow.replace(".06","0.7")} 100%)` }}/>
                  </div>
                  {/* Label area */}
                  <div style={{ padding:"11px 12px 13px", background:item.glow, textAlign:"center" }}>
                    <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"2px", color:item.col, marginBottom:"3px" }}>{item.title}</div>
                    <div style={{ fontSize:"11px", color:"rgba(255,255,255,.4)", lineHeight:1.4, marginBottom:"10px" }}>{item.sub}</div>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", padding:"4px 12px", background:item.col+"18", border:`1px solid ${item.col}35`, borderRadius:"50px" }}>
                      <span style={{ fontSize:"11px", color:item.col, fontFamily:"var(--fm)", letterSpacing:"1px" }}>GET STARTED</span>
                      <span style={{ color:item.col, fontSize:"11px" }}>→</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Plan pills */}
          <div style={{ display:"flex", gap:"6px" }}>
            {[
              { img:"https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=200&q=60", n:"Free", d:"30-day trial", c:"var(--a3)" },
              { img:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=60", n:"Pro", d:"$4.99/mo", c:"var(--acc)" },
              { img:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=60", n:"Trainer", d:"From free", c:"var(--tr)" },
            ].map(item=>(
              <div key={item.n} style={{ flex:1, background:"rgba(255,255,255,.03)", border:`1px solid ${item.c}20`, borderRadius:"10px", overflow:"hidden", textAlign:"center" }}>
                <div style={{ height:"52px", overflow:"hidden", position:"relative" }}>
                  <img src={item.img} alt={item.n} style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.6) saturate(.7)" }}/>
                  <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg,transparent 0%,rgba(10,10,10,.6) 100%)` }}/>
                </div>
                <div style={{ padding:"6px 4px 7px" }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"10px", letterSpacing:"1px", color:item.c, marginBottom:"1px" }}>{item.n}</div>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"rgba(255,255,255,.3)" }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showContact && <ContactModal onClose={()=>setShowContact(false)}/>}
    </div>
  );
}

function AuthScreen({ role, onLogin, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [ownerErr, setOwnerErr] = useState("");
  const isT = role==="trainer"; const col = isT?"var(--tr)":"var(--acc)";
  const isOwnerEmail = email.trim().toLowerCase() === OWNER.email.toLowerCase();

  function handleLogin() {
    // Owner access — check password
    if (isOwnerEmail) {
      if (password !== OWNER.password) { setOwnerErr("Incorrect password"); setTimeout(()=>setOwnerErr(""), 2500); return; }
      // Owner gets unlimited sub + trainer plan
      const s = mkMemberSub("pro"); saveMemberSub(s);
      saveTrainerSub(mkTrainerSub("unlimited"));
      onLogin({ name:OWNER.name, email:OWNER.email, role, isOwner:true });
      return;
    }
    onLogin({ name:name||(isT?"Coach":"Athlete"), email, role });
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {/* Hero */}
      <div style={{ position:"relative", height:"40vh", flexShrink:0 }}>
        <img src={isT?IMG.trainer:IMG.workout} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.5) saturate(.7)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(10,10,10,0) 0%,rgba(10,10,10,1) 100%)" }}/>
        <BackBtn onClick={onBack}/>
        <div style={{ position:"absolute", bottom:"28px", left:0, right:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"18px", background:col+"18", border:`1.5px solid ${col}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", backdropFilter:"blur(8px)" }}>{isT?"🏋️":"⚡"}</div>
          <Mono style={{ color:col, letterSpacing:"2px" }}>{isT?"TRAINER ACCESS":"JOIN FIT2ALL"}</Mono>
        </div>
      </div>

      {/* Form area */}
      <div style={{ flex:1, padding:"28px 22px 36px", display:"flex", flexDirection:"column", gap:"18px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"clamp(28px,9vw,40px)", letterSpacing:"3px", lineHeight:.9, marginBottom:"4px" }}>
          {isT ? "SIGN IN" : <span>YOUR<br/><span style={{ color:col }}>JOURNEY</span><br/>STARTS</span>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
          {!isOwnerEmail && <Field lbl="FULL NAME" val={name} set={setName} ph="Your name" acc={col}/>}
          <Field lbl="EMAIL ADDRESS" val={email} set={v=>{ setEmail(v); setOwnerErr(""); }} ph="your@email.com" acc={col} type="email"/>
          {/* Show password field only for owner email */}
          {isOwnerEmail && (
            <div>
              <Mono style={{ marginBottom:"7px", color:ownerErr?"var(--rd)":"var(--mut)" }}>PASSWORD</Mono>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"} value={password} onChange={e=>{ setPassword(e.target.value); setOwnerErr(""); }} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter your password" style={{ width:"100%", padding:"12px 40px 12px 14px", background:"rgba(255,255,255,.04)", border:`1px solid ${ownerErr?"var(--rd)":"rgba(255,255,255,.1)"}`, borderRadius:"10px", color:"var(--txt)", fontSize:"14px", fontFamily:"var(--fm)", outline:"none", letterSpacing:"2px" }}/>
                <button onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute", right:"11px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"14px" }}>{showPass?"🙈":"👁️"}</button>
              </div>
              {ownerErr && <div style={{ fontSize:"12px", color:"var(--rd)", marginTop:"5px", fontFamily:"var(--fm)" }}>{ownerErr}</div>}
              <div style={{ marginTop:"8px", padding:"8px 11px", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.2)", borderRadius:"8px", display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ fontSize:"14px" }}>👑</span>
                <span style={{ fontSize:"12px", color:"var(--acc)" }}>Owner access — unlimited everything</span>
              </div>
            </div>
          )}
          {isT && !isOwnerEmail && <Field lbl="CERTIFICATION ID" val="" set={()=>{}} ph="e.g. NASM-12345" acc={col}/>}
        </div>

        <div style={{ marginTop:"auto" }}>
          <button onClick={handleLogin} disabled={isOwnerEmail&&!password.trim()}
            style={{ width:"100%", padding:"16px", background:isOwnerEmail&&!password.trim()?"rgba(255,255,255,.08)":col, border:"none", borderRadius:"var(--r)", color:isOwnerEmail&&!password.trim()?"var(--mut)":"#000", cursor:isOwnerEmail&&!password.trim()?"default":"pointer", fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px", boxShadow:isOwnerEmail&&!password.trim()?"none":`0 8px 28px ${col}30`, marginBottom:"12px" }}>
            {isOwnerEmail ? "👑 OWNER LOGIN" : isT?"ENTER DASHBOARD →":"LET'S GO →"}
          </button>
          <Mono style={{ textAlign:"center" }}>By continuing you agree to our Terms of Service</Mono>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ role, tab, setTab }) {
  const tabs = role==="trainer"
    ? [["clients","👥","Clients"],["calendar","📅","Calendar"],["profile","👤","Profile"]]
    : [["program","📋","Program"],["wearables","⌚","Wearables"],["nutrition","🥗","Nutrition"]];
  const col = role==="trainer" ? "var(--tr)" : "var(--acc)";
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, maxWidth:"480px", margin:"0 auto", zIndex:50 }}>
      {/* Frosted pill nav */}
      <div style={{ margin:"0 16px 12px", background:"rgba(18,18,18,.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRadius:"20px", border:"1px solid rgba(255,255,255,.1)", padding:"6px 8px", display:"flex", justifyContent:"space-around", boxShadow:"0 8px 32px rgba(0,0,0,.4)" }}>
        {tabs.map(([t, icon, lbl])=>{
          const isActive = tab === t;
          return (
            <button key={t} onClick={()=>setTab(t)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px", background:isActive?col+"18":"transparent", border:isActive?`1px solid ${col}30`:"1px solid transparent", borderRadius:"14px", cursor:"pointer", padding:"8px 18px", transition:"all .2s", flex:1, margin:"0 2px" }}>
              <span style={{ fontSize:"20px", filter:isActive?"none":"grayscale(.6) opacity(.6)", transition:"filter .2s" }}>{icon}</span>
              <span style={{ fontSize:"9px", fontFamily:"var(--fm)", letterSpacing:"1px", color:isActive?col:"var(--mut)", transition:"color .2s" }}>{lbl}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FAB({ onClick }) {
  const [popped, setPopped] = useState(true);
  useEffect(() => { const t = setTimeout(()=>setPopped(false),3000); return ()=>clearTimeout(t); }, []);
  return (
    <button onClick={onClick} style={{ position:"fixed", bottom:"88px", right:"18px", width:"54px", height:"54px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)", border:"1px solid rgba(124,58,237,.35)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(124,58,237,.35), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.15)", zIndex:100, padding:"7px", animation:popped?"pop .5s ease":"none", transform:"translateZ(0)" }}>
      <Logo size={36} col="#111111"/>
    </button>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("program");
  const [showAI, setShowAI] = useState(false);
  const [profile, setProfile] = useState(null);
  const [sub, setSub] = useState(()=>loadMemberSub());
  const [upgradeReason, setUpgradeReason] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const ctx = getMemberCtx(sub, setSub);

  function goRole(r) { setRole(r); if (r==="enthusiast"&&!sub) setScreen("plan"); else setScreen("auth"); }
  function goPlan(id) { const s = mkMemberSub(id); setSub(s); setScreen("auth"); }
  function goLogin(u) {
    setUser(u);
    if (u.isOwner) {
      // Ensure owner has pro member sub + unlimited trainer sub
      if (!sub || sub.id !== "pro") { const s = mkMemberSub("pro"); setSub(s); }
      saveTrainerSub({ id:"unlimited", start: new Date().toISOString() });
    }
    setScreen("app");
    setTab(u.role==="trainer"?"clients":"program");
  }
  function openAI() {
    if (role==="enthusiast"&&ctx) {
      if (ctx.expired()) { setUpgradeReason("trial_expired"); return; }
      if (!ctx.canAsk()) { setUpgradeReason("ai_limit"); return; }
    }
    setShowAI(true);
  }
  function doUpgrade() { setUpgradeReason(null); const s = mkMemberSub("pro"); setSub(s); }

  return (
    <div style={{ maxWidth:"480px", margin:"0 auto", minHeight:"100vh", position:"relative" }}>
      {screen==="splash" && <SplashScreen onContinue={goRole} onAdminHold={()=>setShowAdminLogin(true)}/>}
      {screen==="plan"   && <PlanScreen onSelect={goPlan} onBack={()=>setScreen("splash")}/>}
      {screen==="auth"   && <AuthScreen role={role} onLogin={goLogin} onBack={()=>setScreen(role==="enthusiast"&&!sub?"plan":"splash")}/>}
      {screen==="app" && user && (
        <>
          {role==="trainer"
            ? <TrainerDashboard user={user} tab={tab} setTab={setTab} onHome={()=>setScreen("splash")}/>
            : <MemberDashboard user={user} tab={tab} setTab={setTab} sub={sub} ctx={ctx} onUpgrade={r=>setUpgradeReason(r)} onHome={()=>setScreen("splash")}/>
          }
          <BottomNav role={role} tab={tab} setTab={setTab}/>
          {!showAI && <FAB onClick={openAI}/>}
          {showAI && <AICoach user={user} profile={profile} ctx={ctx} onClose={()=>setShowAI(false)} onLimit={r=>{ setShowAI(false); setUpgradeReason(r); }}/>}
          {upgradeReason && <UpgradeModal reason={upgradeReason} onUpgrade={doUpgrade} onClose={()=>setUpgradeReason(null)}/>}
        </>
      )}
      {showAdminLogin && <AdminLogin onLogin={()=>{ setShowAdminLogin(false); setShowAdminPanel(true); }} onClose={()=>setShowAdminLogin(false)}/>}
      {showAdminPanel && <AdminPanel onClose={()=>setShowAdminPanel(false)}/>}
    </div>
  );
}
