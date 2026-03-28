import React, { useState, useEffect, useRef } from "react";

// ─── Fonts & Global Styles ────────────────────────────────────────────────────
(function() {
  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap";
  document.head.appendChild(fl);
  const gs = document.createElement("style");
  gs.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { --bg:#080810;--card:#14141f;--acc:#00e5ff;--a2:#ff3d6b;--a3:#22d4a8;--a4:#a855f7;--txt:#f4f4f8;--mut:#5a5a72;--tr:#ff7043;--gr:#22c55e;--yw:#fbbf24;--rd:#e8294a;--r:14px;--fd:'Orbitron',sans-serif;--fb:'Inter',sans-serif;--fm:'Space Mono',monospace; }
body { background:var(--bg);color:var(--txt);font-family:var(--fb);overflow-x:hidden; }
::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pop{from{transform:scale(.88);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:3px;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;cursor:pointer;border:2px solid var(--bg)}
select{-webkit-appearance:none} textarea{resize:none}
.glass{background:rgba(8,8,16,.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}.card-hover:active{transform:scale(.98)}`;
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
  unlimited: { id:"unlimited", name:"UNLIMITED",  price:"$14.99", period:"/month",  color:"var(--rd)",  clientLimit:Infinity },
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
};
const applyPromo = code => PROMO_CODES[code.trim().toUpperCase()] || null;

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
  card: { background:"rgba(20,20,31,.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"var(--r)" },
  mono: { fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"2px", color:"var(--mut)" },
};

function Card({ children, style, accent }) {
  return <div style={{ ...S.card, ...(accent ? { border:`1px solid ${accent}` } : {}), ...style }}>{children}</div>;
}
function Mono({ children, style }) {
  return <div style={{ ...S.mono, ...style }}>{children}</div>;
}
function HeroBg({ src, ov, style, children }) {
  return (
    <div style={{ position:"relative", overflow:"hidden", ...style }}>
      <img src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0, filter:"brightness(.5) saturate(.7)" }} />
      <div style={{ position:"absolute", inset:0, background:ov||"rgba(8,8,16,.7)", zIndex:1 }} />
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
  return <span style={{ fontFamily:"Arial,sans-serif", fontWeight:900, fontSize:"19px" }}><span style={{ color:"#009cde" }}>Pay</span><span style={{ color:"#003087" }}>Pal</span></span>;
}
function PayPalModal({ planName, amount, onSuccess, onClose }) {
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  function pay() {
    if (!name.trim() || !email.trim()) return;
    setStep("loading");
    window.open("https://www.paypal.com/paypalme/jcsc0912/" + amount + "USD", "_blank");
    setTimeout(() => setStep("done"), 2000);
  }
  function emailFallback() {
    const sub = encodeURIComponent("Fit2All " + planName);
    const body = encodeURIComponent("Plan: " + planName + "\nAmount: $" + amount + "/mo\nName: " + name + "\nEmail: " + email);
    window.open("mailto:" + PP_EMAIL + "?subject=" + sub + "&body=" + body, "_blank");
    setTimeout(() => setStep("done"), 600);
  }
  return (
    <Sheet onClose={onClose} title="PAYMENT" acc="#009cde">
      {step === "form" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"13px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"13px", background:"rgba(0,156,222,.08)", border:"1px solid rgba(0,156,222,.2)", borderRadius:"12px" }}>
            <PayPalLogo />
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,.6)", lineHeight:1.5 }}>Secure payment<br/><span style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"#009cde" }}>{PP_EMAIL}</span></div>
          </div>
          <Card style={{ padding:"14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
              <span style={{ fontSize:"14px", fontWeight:600 }}>{planName}</span>
              <span style={{ fontFamily:"var(--fd)", fontSize:"22px", color:"var(--acc)" }}>${amount}</span>
            </div>
            <Mono>BILLED MONTHLY · CANCEL ANYTIME</Mono>
          </Card>
          <Field lbl="YOUR NAME" val={name} set={setName} ph="Full name" acc="#009cde" />
          <Field lbl="YOUR EMAIL" val={email} set={setEmail} ph="your@email.com" acc="#009cde" type="email" />
          <button onClick={pay} disabled={!name.trim()||!email.trim()} style={{ width:"100%", padding:"14px", background:name.trim()&&email.trim()?"#009cde":"rgba(255,255,255,.08)", border:"none", borderRadius:"12px", color:name.trim()&&email.trim()?"#fff":"var(--mut)", cursor:name.trim()&&email.trim()?"pointer":"default", fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px" }}>
            PAY ${amount}/mo via PayPal
          </button>
          <button onClick={emailFallback} style={{ width:"100%", padding:"11px", background:"transparent", border:"1px solid rgba(255,255,255,.08)", borderRadius:"12px", color:"var(--mut)", cursor:"pointer", fontSize:"13px" }}>Send via Email instead</button>
          <Mono style={{ textAlign:"center" }}>Payment goes to: {PP_EMAIL}</Mono>
        </div>
      )}
      {step === "loading" && (
        <div style={{ textAlign:"center", padding:"28px 0" }}>
          <div style={{ width:"46px", height:"46px", borderRadius:"50%", border:"3px solid #009cde", borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 14px" }} />
          <div style={{ fontFamily:"var(--fd)", fontSize:"17px", color:"#009cde", letterSpacing:"2px" }}>REDIRECTING</div>
        </div>
      )}
      {step === "done" && (
        <div style={{ textAlign:"center", padding:"24px 0" }}>
          <div style={{ fontSize:"46px", marginBottom:"12px", animation:"pop .4s" }}>🎉</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"7px" }}>WELCOME TO PRO!</div>
          <p style={{ fontSize:"13px", color:"var(--mut)", lineHeight:1.7, marginBottom:"16px" }}>Payment processing. Activates once confirmed.</p>
          <Card style={{ padding:"11px", marginBottom:"14px", border:"1px solid rgba(0,156,222,.2)" }}>
            <Mono style={{ textAlign:"center", color:"#009cde" }}>TO: {PP_EMAIL}</Mono>
          </Card>
          <PBtn onClick={()=>{ onSuccess(); onClose(); }}>⚡ ACTIVATE</PBtn>
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
      <div style={{ width:"300px", padding:"30px 26px", background:"rgba(14,14,22,.98)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"20px", animation:"pop .3s", position:"relative" }}>
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
      <div style={{ padding:"14px 18px", background:"rgba(14,14,22,.98)", borderBottom:"1px solid rgba(232,41,74,.2)", display:"flex", alignItems:"center", gap:"11px", flexShrink:0 }}>
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
          <button key={v} onClick={()=>{ setView(v); setSearch(""); setSelTrainer(null); }} style={{ padding:"6px 13px", background:view===v?"var(--rd)":"rgba(255,255,255,.04)", border:"1px solid "+(view===v?"var(--rd)":"rgba(255,255,255,.07)"), borderRadius:"50px", color:view===v?"#fff":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>{lbl}</button>
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
                    <div style={{ flex:1, height:"5px", background:"rgba(255,255,255,.07)", borderRadius:"3px", overflow:"hidden" }}><div style={{ height:"100%", width:pct+"%", background:plan.color, borderRadius:"3px" }}/></div>
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
                    <span style={{ fontWeight:600, fontSize:"13px" }}>{cl.name}</span>
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
                  <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:"linear-gradient(135deg,var(--acc),#009eb5)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"14px", color:"#000", flexShrink:0 }}>{mb.name.charAt(0)}</div>
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
                  <button key={st} onClick={()=>setEditItem(p=>({...p,status:st}))} style={{ padding:"7px 13px", background:editItem.status===st?"rgba(34,197,94,.15)":"rgba(255,255,255,.04)", border:"1px solid "+(editItem.status===st?"var(--gr)":"rgba(255,255,255,.08)"), borderRadius:"50px", color:editItem.status===st?"var(--gr)":"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{st}</button>
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
  { id:"galaxy",  name:"Samsung Galaxy Watch", icon:"⌚", col:"#1a73e8", models:["Watch 6","Watch 6 Classic","Watch 5 Pro","Watch 4"],           mets:["Heart Rate","SpO2","Sleep","Stress","ECG","Body Comp","GPS","VO2 Max","Steps","Calories"] },
  { id:"apple",   name:"Apple Watch",          icon:"⌚", col:"#888",    models:["Series 9","Series 8","Ultra 2","SE 2nd gen"],                 mets:["Heart Rate","SpO2","ECG","GPS","Sleep","Temperature","Calories"] },
  { id:"garmin",  name:"Garmin",               icon:"🟠", col:"#007CC3", models:["Fenix 7","Forerunner 965","Venu 3","Vivoactive 5"],            mets:["Heart Rate","GPS","VO2 Max","HRV","Body Battery","Training Load","Sleep"] },
  { id:"fitbit",  name:"Fitbit / Pixel Watch", icon:"💚", col:"#00B0B9", models:["Pixel Watch 2","Sense 2","Versa 4","Charge 6"],                mets:["Heart Rate","SpO2","Sleep Score","Steps","Stress","Active Zones"] },
  { id:"whoop",   name:"WHOOP 4.0",            icon:"🔴", col:"#E63946", models:["WHOOP 4.0"],                                                   mets:["HRV","Recovery Score","Sleep Coach","Strain","Respiratory Rate","SpO2"] },
  { id:"polar",   name:"Polar",                icon:"🔵", col:"#C62828", models:["Vantage V3","Pacer Pro","Ignite 3","H10 Strap"],               mets:["Heart Rate","HRV","GPS","Training Load","Recovery","VO2 Max"] },
];
const rndMet = () => ({ hr:62+Math.floor(Math.random()*30), spo2:97+Math.floor(Math.random()*3), steps:3800+Math.floor(Math.random()*5000), kcal:280+Math.floor(Math.random()*350), hrv:35+Math.floor(Math.random()*40), stress:18+Math.floor(Math.random()*50), rec:50+Math.floor(Math.random()*45), bat:40+Math.floor(Math.random()*55), vo2:40+Math.floor(Math.random()*20), act:25+Math.floor(Math.random()*50) });

function ArcGauge({ v, max, col, lbl, unit }) {
  const r=18, cx=26, cy=26, circ=2*Math.PI*r, dash=Math.min(1,v/max)*circ*.75;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5" strokeDasharray={`${circ*.75} ${circ}`} strokeLinecap="round" transform="rotate(135 26 26)"/>
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

  function doPair(d) { setPairing(d.id); setTimeout(()=>{ setConn(p=>[...p.filter(x=>x!==d.id),d.id]); setMets(p=>({...p,[d.id]:rndMet()})); setPairing(null); },2600); }
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
      <Card style={{ padding:"15px", marginBottom:"10px", border:wActive?"2px solid var(--rd)":"1px solid rgba(0,229,255,.2)" }}>
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
              <div style={{ padding:"3px 10px", background:isConn?"rgba(34,197,94,.15)":"rgba(255,255,255,.05)", border:`1px solid ${isConn?"rgba(34,197,94,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"50px", fontSize:"11px", color:isConn?"var(--gr)":"var(--mut)", display:"flex", alignItems:"center", gap:"4px" }}>
                {isConn && <Dot col="var(--gr)"/>}{isConn?"CONNECTED":"NOT CONNECTED"}
              </div>
              {isConn && dm && <div style={{ padding:"3px 10px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)", borderRadius:"50px", fontSize:"11px", color:"var(--acc)" }}>🔋 {dm.bat}%</div>}
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
            : <button onClick={()=>doPair(dev)} disabled={pairing===dev.id} style={{ flex:1, padding:"12px", background:pairing===dev.id?"rgba(255,255,255,.08)":dev.col, border:"none", borderRadius:"var(--r)", color:"#fff", cursor:pairing===dev.id?"default":"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>
                {pairing===dev.id ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"7px" }}><div style={{ width:"12px", height:"12px", borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin .8s linear infinite" }}/>PAIRING...</span> : "🔗 PAIR DEVICE"}
              </button>
          }
        </div>
      </Card>
      <Mono style={{ marginBottom:"9px" }}>TRACKED METRICS</Mono>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"11px" }}>
        {dev.mets.map(m=><div key={m} style={{ padding:"4px 10px", background:isConn?dev.col+"12":"rgba(255,255,255,.04)", border:`1px solid ${isConn?dev.col+"30":"rgba(255,255,255,.07)"}`, borderRadius:"50px", fontSize:"11px", color:isConn?dev.col:"var(--mut)" }}>{isConn&&"● "}{m}</div>)}
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
      <HeroBg src={IMG.recovery} ov="linear-gradient(180deg,rgba(8,8,16,.15) 0%,rgba(8,8,16,.9) 100%)" style={{ height:"120px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 0 13px", borderRadius:"12px", overflow:"hidden", marginBottom:"13px" }}>
        <Mono>SMART DEVICES</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"23px", letterSpacing:"2px" }}>WEARABLES <span style={{ color:"var(--acc)" }}>HUB</span></div>
      </HeroBg>
      {connDevs.length>0 && (
        <Card style={{ padding:"13px", marginBottom:"13px", border:"1px solid rgba(34,197,94,.2)" }}>
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
  const totalKcal = macros.p*4 + macros.c*4 + macros.f*9;
  const diets = { Standard:{p:165,c:220,f:60}, "High Protein":{p:220,c:165,f:55}, Keto:{p:175,c:28,f:155}, Vegan:{p:110,c:275,f:60} };

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <HeroBg src={IMG.food} ov="linear-gradient(180deg,rgba(8,8,16,.15) 0%,rgba(8,8,16,.9) 100%)" style={{ height:"115px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 0 12px", borderRadius:"12px", overflow:"hidden", marginBottom:"12px" }}>
        <Mono>FUEL CENTER</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px" }}>NUTRITION <span style={{ color:"var(--acc)" }}>HUB</span></div>
      </HeroBg>
      <div style={{ display:"flex", gap:"6px", marginBottom:"11px", overflowX:"auto" }}>
        {[["overview","📊"],["macros","🎚️"],["water","💧"]].map(([t,ic])=>(
          <button key={t} onClick={()=>setVw(t)} style={{ padding:"6px 12px", background:vw===t?"var(--a3)":"rgba(255,255,255,.04)", border:`1px solid ${vw===t?"var(--a3)":"rgba(255,255,255,.07)"}`, borderRadius:"50px", color:vw===t?"#000":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px", whiteSpace:"nowrap" }}>{ic} {t.toUpperCase()}</button>
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
          <Card style={{ padding:"12px", border:"1px solid rgba(0,229,255,.2)", display:"flex", alignItems:"center", gap:"11px" }}>
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
      {vw==="macros" && (
        <Card style={{ padding:"13px" }}>
          <div style={{ textAlign:"center", marginBottom:"8px" }}><span style={{ fontFamily:"var(--fd)", fontSize:"28px", color:"var(--acc)" }}>{totalKcal}</span><span style={{ fontSize:"12px", color:"var(--mut)", marginLeft:"5px" }}>kcal/day</span></div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"12px" }}>
            {Object.entries(diets).map(([n,v])=>(
              <button key={n} onClick={()=>{ setMacros({...v,fiber:30}); setDiet(n); }} style={{ padding:"6px 11px", background:diet===n?"rgba(168,85,247,.2)":"rgba(255,255,255,.04)", border:`1px solid ${diet===n?"var(--a4)":"rgba(255,255,255,.07)"}`, borderRadius:"50px", color:diet===n?"var(--a4)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{n}</button>
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
          <Card style={{ padding:"18px", textAlign:"center", marginBottom:"10px", border:"1px solid rgba(0,229,255,.2)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:Math.min(100,water/3*100)+"%", background:"linear-gradient(180deg,rgba(0,229,255,.15),rgba(0,229,255,.03))", borderTop:"1px solid rgba(0,229,255,.25)", transition:"height .7s", pointerEvents:"none" }}/>
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:"40px", marginBottom:"4px" }}>💧</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"44px", color:"var(--acc)", lineHeight:1 }}>{water.toFixed(1)}</div>
              <p style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"6px" }}>of 3.0L goal</p>
              <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:water>=3?"var(--gr)":"var(--mut)" }}>{water>=3?"🎯 GOAL!":water>=1.5?"💪 HALFWAY":"🌊 KEEP GOING"}</div>
            </div>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"7px", marginBottom:"9px" }}>
            {[.25,.5,.75,1].map(a=><button key={a} onClick={()=>setWater(v=>clamp(v+a,0,4))} style={{ padding:"11px 6px", background:"rgba(0,229,255,.07)", border:"1px solid rgba(0,229,255,.18)", borderRadius:"9px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px" }}>+{a}L</button>)}
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
    return <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#00e5ff,#0096aa)", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px", flexShrink:0 }}><Logo size={18} col="#001a22"/></div>;
  }

  return (
    <HeroBg src={IMG.workout} ov="rgba(8,8,16,.97)" style={{ position:"fixed", inset:0, zIndex:500, display:"flex", flexDirection:"column", maxWidth:"480px", margin:"0 auto", animation:"fadeIn .25s" }}>
      <div className="glass" style={{ padding:"12px 15px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
        <div style={{ width:"37px", height:"37px", borderRadius:"50%", background:"linear-gradient(135deg,#00e5ff,#0096aa)", display:"flex", alignItems:"center", justifyContent:"center", padding:"5px" }}><Logo size={25} col="#001a22"/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"3px", lineHeight:1 }}>AI COACH</div>
          <div style={{ fontSize:"10px", color:"var(--gr)", fontFamily:"var(--fm)", marginTop:"1px", display:"flex", alignItems:"center", gap:"5px" }}>
            <Dot col="var(--gr)"/>ONLINE · Fit2All
            {ctx && ctx.plan.limits.ai !== Infinity && <span style={{ padding:"1px 6px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>{ctx.aiLeft()}/2 TODAY</span>}
            {ctx && ctx.plan.limits.ai === Infinity && <span style={{ padding:"1px 6px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>⚡ PRO</span>}
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
                  ? <div style={{ padding:"10px 13px", background:"linear-gradient(135deg,rgba(0,229,255,.12),rgba(0,229,255,.06))", border:"1px solid rgba(0,229,255,.18)", borderRadius:"15px 15px 4px 15px", fontSize:"13px", lineHeight:1.6 }}>{msg.content}</div>
                  : <div className="glass" style={{ padding:"11px 12px", border:"1px solid rgba(255,255,255,.07)", borderRadius:"15px 15px 15px 4px" }}>
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
            <div className="glass" style={{ padding:"11px 13px", display:"flex", gap:"4px", alignItems:"center", border:"1px solid rgba(255,255,255,.07)", borderRadius:"15px 15px 15px 4px" }}>
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
      <div className="glass" style={{ padding:"9px 12px 22px", borderTop:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
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
      <HeroBg src={IMG.trainer} ov="linear-gradient(180deg,rgba(8,8,16,.1) 0%,rgba(8,8,16,.95) 60%,rgba(8,8,16,1) 100%)" style={{ height:"190px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 20px 20px", position:"relative" }}>
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
            <div style={{ marginTop:"8px", padding:"8px 11px", background:"rgba(34,212,168,.1)", border:"1px solid rgba(34,212,168,.25)", borderRadius:"8px", display:"flex", alignItems:"center", gap:"7px" }}>
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
    <div onClick={()=>setEditSlot(s)} style={{ padding:compact?"8px 10px":"12px 14px", background:"rgba(20,20,31,.9)", border:`1px solid ${s.color}40`, borderLeft:`3px solid ${s.color}`, borderRadius:"10px", marginBottom:"8px", cursor:"pointer", animation:"fadeUp .3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:s.color, letterSpacing:"1px", marginBottom:"2px" }}>{formatTime(s.date)} · {s.duration}min</div>
          <div style={{ fontWeight:600, fontSize:"13px", marginBottom:"2px" }}>{s.className || s.clientName || s.type}</div>
          {!compact && <div style={{ fontSize:"11px", color:"var(--mut)" }}>{s.type}{s.maxSpots ? ` · ${s.bookedSpots}/${s.maxSpots} spots` : ""}</div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px", flexShrink:0 }}>
          <div style={{ padding:"2px 8px", background:s.status==="confirmed"?"rgba(34,197,94,.15)":s.status==="pending"?"rgba(251,191,36,.15)":"rgba(255,255,255,.08)", border:`1px solid ${s.status==="confirmed"?"rgba(34,197,94,.3)":s.status==="pending"?"rgba(251,191,36,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"50px", fontSize:"9px", fontFamily:"var(--fm)", color:s.status==="confirmed"?"var(--gr)":s.status==="pending"?"var(--yw)":"var(--mut)", letterSpacing:"1px", textTransform:"uppercase" }}>{s.status}</div>
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
      <div style={{ display:"flex", gap:"6px", marginBottom:"14px" }}>
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
            <button onClick={()=>{ setNewType("Group Class"); setShowNewClass(true); }} style={{ flex:1, padding:"11px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ CLASS</button>
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
            <button onClick={()=>{ setNewType("Group Class"); setShowNewClass(true); }} style={{ flex:1, padding:"11px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ CLASS</button>
          </div>
        </div>
      )}

      {/* ── BOOKING REQUESTS VIEW ── */}
      {calView==="requests" && (
        <div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"1px", marginBottom:"12px" }}>BOOKING REQUESTS</div>
          {requests.length===0 && <Card style={{ padding:"20px", textAlign:"center" }}><Mono>No requests yet</Mono></Card>}
          {requests.map((req,i)=>(
            <Card key={req.id} style={{ padding:"14px", marginBottom:"9px", border:`1px solid ${req.status==="pending"?"rgba(251,191,36,.2)":req.status==="approved"?"rgba(34,197,94,.2)":"rgba(255,61,107,.15)"}`, animation:`fadeUp .3s ease ${i*.06}s both` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:"14px", marginBottom:"2px" }}>{req.clientName}</div>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--acc)", letterSpacing:"1px" }}>{req.type}</div>
                </div>
                <div style={{ padding:"3px 9px", background:req.status==="pending"?"rgba(251,191,36,.15)":req.status==="approved"?"rgba(34,197,94,.15)":"rgba(255,61,107,.12)", border:`1px solid ${req.status==="pending"?"rgba(251,191,36,.3)":req.status==="approved"?"rgba(34,197,94,.3)":"rgba(255,61,107,.25)"}`, borderRadius:"50px", fontSize:"10px", fontFamily:"var(--fm)", color:req.status==="pending"?"var(--yw)":req.status==="approved"?"var(--gr)":"var(--a2)", letterSpacing:"1px", textTransform:"uppercase" }}>{req.status}</div>
              </div>
              <div style={{ fontSize:"12px", color:"var(--mut)", marginBottom:"4px" }}>Preferred: <span style={{ color:"var(--txt)" }}>{req.preferred}</span></div>
              {req.note && <div style={{ fontSize:"12px", color:"var(--mut)", fontStyle:"italic", marginBottom:"10px" }}>"{req.note}"</div>}
              {req.status==="pending" && (
                <div style={{ display:"flex", gap:"7px" }}>
                  <button onClick={()=>approveRequest(req.id)} style={{ flex:1, padding:"8px", background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", borderRadius:"8px", color:"var(--gr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✓ APPROVE</button>
                  <button onClick={()=>declineRequest(req.id)} style={{ flex:1, padding:"8px", background:"rgba(255,61,107,.08)", border:"1px solid rgba(255,61,107,.2)", borderRadius:"8px", color:"var(--a2)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✕ DECLINE</button>
                </div>
              )}
            </Card>
          ))}
          {/* Client booking link info */}
          <Card style={{ padding:"14px", marginTop:"10px", border:"1px solid rgba(168,85,247,.2)" }}>
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
                  <button key={t} onClick={()=>setNewType(t)} style={{ padding:"6px 12px", background:newType===t?(showNewClass?"rgba(0,229,255,.15)":"rgba(255,112,67,.15)"):"rgba(255,255,255,.04)", border:`1px solid ${newType===t?(showNewClass?"var(--acc)":"var(--tr)"):"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:newType===t?(showNewClass?"var(--acc)":"var(--tr)"):"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{t}</button>
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
              <button onClick={()=>setEditSlot(s=>({...s,status:s.status==="confirmed"?"pending":"confirmed"}))} style={{ flex:1, padding:"11px", background:"rgba(251,191,36,.1)", border:"1px solid rgba(251,191,36,.25)", borderRadius:"10px", color:"var(--yw)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>
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

function TrainerDashboard({ user, tab, setTab }) {
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [selId, setSelId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [trainerSub, setTrainerSub] = useState(()=>loadTrainerSub());
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("Muscle Gain");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const tplan = getTrainerPlan(trainerSub);
  const limit = tplan.clientLimit;
  const atLimit = clients.length >= limit;

  function handleAdd() { if (atLimit) setShowUpgrade(true); else setShowAdd(true); }
  function handleUpgraded(pid) { const s = mkTrainerSub(pid); setTrainerSub(s); setShowUpgrade(false); }

  // Client detail
  if (selId) {
    const cl = clients.find(c=>c.id===selId);
    const cNotes = notes[selId] || [];
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", paddingBottom:"32px" }}>
        <HeroBg src={IMG.trainer} ov="linear-gradient(180deg,rgba(8,8,16,.1) 0%,rgba(8,8,16,.9) 100%)" style={{ height:"165px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 18px 13px", position:"relative" }}>
          <BackBtn onClick={()=>setSelId(null)}/>
          <div style={{ fontFamily:"var(--fd)", fontSize:"21px", letterSpacing:"2px" }}>{cl.name.split(" ")[0].toUpperCase()}</div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,.5)", marginTop:"2px" }}>{cl.goal}</div>
        </HeroBg>
        <div style={{ padding:"13px 18px 0" }}>
          <Card style={{ padding:"13px", marginBottom:"11px", border:"1px solid rgba(255,112,67,.2)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"9px" }}>
              <div style={{ width:"50px", height:"50px", borderRadius:"50%", background:"linear-gradient(135deg,var(--tr),#ff8a50)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"16px", border:"2px solid rgba(255,112,67,.4)", flexShrink:0 }}>{cl.av}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:"14px" }}>{cl.name}</div>
                <Mono>{cl.sessions} sessions · 🔥 {cl.streak}d streak</Mono>
              </div>
            </div>
            <div style={{ height:"4px", background:"rgba(255,255,255,.08)", borderRadius:"2px", marginBottom:"4px" }}><div style={{ height:"100%", width:cl.progress+"%", background:"linear-gradient(90deg,var(--tr),#ffb74d)", borderRadius:"2px" }}/></div>
            <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:"10px", color:"var(--mut)" }}>Progress</span><span style={{ fontSize:"10px", color:"var(--tr)", fontFamily:"var(--fm)" }}>{cl.progress}%</span></div>
          </Card>
          {/* Quick schedule button */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
            <button onClick={()=>{ setSelId(null); setTab("calendar"); }} style={{ flex:1, padding:"10px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>📅 SCHEDULE SESSION</button>
            <button onClick={()=>setShowNote(true)} style={{ flex:1, padding:"10px", background:"rgba(255,112,67,.1)", border:"1px solid rgba(255,112,67,.25)", borderRadius:"10px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>📝 ADD NOTE</button>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"9px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px" }}>SESSION NOTES</div>
          </div>
          {showNote && (
            <Card style={{ padding:"11px", marginBottom:"9px", border:"1px solid rgba(255,112,67,.3)", animation:"fadeIn .3s" }}>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Session notes..." rows={3} style={{ width:"100%", background:"transparent", border:"none", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)", outline:"none" }}/>
              <div style={{ display:"flex", gap:"6px", marginTop:"6px" }}>
                <button onClick={()=>{ if(note.trim()){ setNotes(p=>({...p,[selId]:[{d:"Today",n:note,m:"📝"},...(p[selId]||[])]})); setNote(""); setShowNote(false); } }} style={{ flex:1, padding:"8px", background:"var(--tr)", border:"none", borderRadius:"7px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>SAVE</button>
                <button onClick={()=>setShowNote(false)} style={{ padding:"8px 11px", background:"transparent", border:"1px solid rgba(255,255,255,.08)", borderRadius:"7px", color:"var(--mut)", cursor:"pointer" }}>Cancel</button>
              </div>
            </Card>
          )}
          {cNotes.map((n,i)=>(
            <Card key={i} style={{ padding:"11px", marginBottom:"7px", animation:`fadeUp .3s ease ${i*.07}s both` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}><Mono>{n.d}</Mono><span style={{ fontSize:"14px" }}>{n.m}</span></div>
              <div style={{ fontSize:"13px", lineHeight:1.6 }}>{n.n}</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", paddingBottom:"100px" }}>
      {/* Trainer header */}
      <div style={{ position:"relative", height:"200px" }}>
        <img src={IMG.trainer} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.4) saturate(.7)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(8,8,16,.3) 0%,rgba(8,8,16,.88) 100%)" }}/>
        {/* Top row */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Wordmark size={22} col="rgba(255,255,255,.8)"/>
          <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"50px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"5px 13px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>CONTACT</button>
        </div>
        {/* Trainer info */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 18px 16px", display:"flex", alignItems:"flex-end", gap:"12px" }}>
          <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:"linear-gradient(135deg,var(--tr),#ff8a50)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"20px", color:"#fff", border:"1.5px solid rgba(255,112,67,.4)", flexShrink:0 }}>{user.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
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
        {[{l:"CLIENTS",v:clients.length,i:"👥",c:"var(--tr)"},{l:"THIS WEEK",v:"6",i:"📅",c:"var(--a3)"},{l:"AVG PROGRESS",v:Math.round(clients.reduce((a,c)=>a+c.progress,0)/clients.length)+"%",i:"📈",c:"var(--acc)"}].map(s=>(
          <div key={s.l} style={{ flexShrink:0, padding:"14px 18px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"14px", minWidth:"100px", textAlign:"center" }}>
            <div style={{ fontSize:"20px", marginBottom:"5px" }}>{s.i}</div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:s.c, lineHeight:1 }}>{s.v}</div>
            <Mono style={{ fontSize:"9px", marginTop:"4px" }}>{s.l}</Mono>
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
                    <span style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"var(--acc)", background:"rgba(0,229,255,.08)", padding:"1px 5px", borderRadius:"4px" }}>🔥 {cl.streak}d</span>
                  </div>
                  <Mono style={{ marginBottom:"5px" }}>{cl.goal} · {cl.sessions} sessions</Mono>
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
          <PBtn onClick={()=>setShowContact(true)} col="var(--a3)" style={{ color:"#000" }}>📧 CONTACT DEVELOPER</PBtn>
        </div>
      )}
      {showAdd && (
        <Sheet onClose={()=>setShowAdd(false)} title="ADD CLIENT" acc="var(--tr)">
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <Field lbl="CLIENT NAME" val={newName} set={setNewName} ph="Full name" acc="var(--tr)"/>
            <div>
              <Mono style={{ marginBottom:"7px" }}>GOAL</Mono>
              <select value={newGoal} onChange={e=>setNewGoal(e.target.value)} style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", color:"var(--txt)", fontSize:"13px", fontFamily:"var(--fb)" }}>
                {["Muscle Gain","Fat Loss","Endurance","Flexibility","General Fitness"].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <PBtn onClick={()=>{ if(!newName.trim()) return; const av=newName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); setClients(p=>[...p,{id:p.length+1,name:newName,goal:newGoal,sessions:0,progress:0,av,streak:0}]); setNewName(""); setShowAdd(false); }} col="var(--tr)" style={{ color:"#fff" }}>ADD CLIENT</PBtn>
          </div>
        </Sheet>
      )}
      {showContact && <ContactModal onClose={()=>setShowContact(false)}/>}
      {showUpgrade && <TrainerUpgradeScreen clientCount={clients.length} onUpgraded={handleUpgraded} onClose={()=>setShowUpgrade(false)}/>}
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
                  <button key={t} onClick={()=>setType(t)} style={{ padding:"5px 11px", background:type===t?"rgba(34,212,168,.15)":"rgba(255,255,255,.04)", border:`1px solid ${type===t?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:type===t?"var(--a3)":"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{t==="suggestion"?"💡":t==="bug"?"🐛":t==="feature"?"✨":"❤️"} {t}</button>
                ))}
              </div>
            </div>
            <Field lbl="MESSAGE" val={msg} set={setMsg} ph="Your message..." acc="var(--a3)" rows={3}/>
            <PBtn onClick={send} disabled={!msg.trim()} col="var(--a3)" style={{ color:"#000" }}>📧 SEND MESSAGE</PBtn>
            <Mono style={{ textAlign:"center" }}>Jcsc04@gmail.com</Mono>
          </div>
      }
    </Sheet>
  );
}

// ─── Member Onboarding ─────────────────────────────────────────────────────────
function ProfileSetup({ onDone, user }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ goal:"", level:"", days:"3", equipment:"" });
  const steps = [
    { key:"goal",      img:IMG.workout, lbl:"MAIN GOAL?",      opts:["💪 Muscle Gain","🔥 Fat Loss","🏃 Build Endurance","🧘 Improve Flexibility","⚡ General Fitness","🏆 Sport Performance"] },
    { key:"level",     img:IMG.pro,     lbl:"FITNESS LEVEL?",  opts:["🌱 Beginner","🌿 Some Experience","💪 Intermediate","🔥 Advanced"] },
    { key:"days",      img:IMG.free,    lbl:"DAYS PER WEEK?",  opts:["2 Days","3 Days","4 Days","5 Days","6 Days"] },
    { key:"equipment", img:IMG.trainer, lbl:"EQUIPMENT?",      opts:["🏠 No Equipment","🏠 Basic Home","🏋️ Full Gym","🌳 Outdoors"] },
  ];
  if (step >= steps.length) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <HeroBg src={IMG.pro} ov="linear-gradient(180deg,rgba(8,8,16,.1) 0%,rgba(8,8,16,.95) 60%,rgba(8,8,16,1) 100%)" style={{ height:"240px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 22px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"44px", letterSpacing:"4px", lineHeight:.95 }}>YOU'RE<br/><span style={{ color:"var(--rd)" }}>READY.</span></div>
      </HeroBg>
      <div style={{ padding:"22px" }}>
        <p style={{ fontSize:"14px", color:"var(--mut)", marginBottom:"20px", lineHeight:1.7 }}>We have everything needed for your personalized AI program.</p>
        <PBtn onClick={()=>onDone(data)} style={{ fontSize:"15px", letterSpacing:"3px", color:"#000" }}>⚡ GENERATE MY PROGRAM</PBtn>
      </div>
    </div>
  );
  const cur = steps[step];
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <HeroBg src={cur.img} ov="linear-gradient(180deg,rgba(8,8,16,.05) 0%,rgba(8,8,16,.88) 55%,rgba(8,8,16,1) 100%)" style={{ height:"200px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px" }}>
        <div style={{ display:"flex", gap:"5px", marginBottom:"9px" }}>{steps.map((_,i)=><div key={i} style={{ height:"3px", flex:1, background:i<=step?"var(--acc)":"rgba(255,255,255,.12)", borderRadius:"2px", transition:"background .3s" }}/>)}</div>
        <Mono style={{ color:"var(--a3)", marginBottom:"5px" }}>STEP {step+1} OF {steps.length}</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"30px", letterSpacing:"3px", lineHeight:1 }}>{cur.lbl}</div>
      </HeroBg>
      <div style={{ padding:"18px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {cur.opts.map(opt=>(
            <button key={opt} onClick={()=>{ setData({...data,[cur.key]:opt}); setStep(step+1); }} style={{ padding:"12px 15px", background:data[cur.key]===opt?"rgba(0,229,255,.1)":"rgba(255,255,255,.03)", border:`1px solid ${data[cur.key]===opt?"var(--acc)":"rgba(255,255,255,.07)"}`, borderRadius:"12px", color:"var(--txt)", cursor:"pointer", textAlign:"left", fontSize:"14px", fontFamily:"var(--fb)", fontWeight:500, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>{opt}</span>{data[cur.key]===opt&&<span style={{ color:"var(--acc)" }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenProg({ profile, user, onDone }) {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; started.current = true;
    async function go() {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1600, messages:[{ role:"user", content:`Fitness program JSON for: Name:${user.name}, Goal:${profile.goal}, Level:${profile.level}, Days:${profile.days}, Equipment:${profile.equipment}. Return ONLY JSON: {"programName":"...","overview":"...","weeklySchedule":[{"day":"Monday","focus":"...","exercises":[{"name":"...","sets":"3","reps":"12","rest":"60s","notes":"..."}],"duration":"40 min","intensity":"Moderate"}],"weeklyGoals":["..."]}` }] }) });
        const d = await res.json(); const raw = d.content?.[0]?.text || "";
        try { onDone(JSON.parse(raw.replace(/```json|```/g,"").trim())); } catch { onDone(fallback(profile,user)); }
      } catch { setTimeout(()=>onDone(fallback(profile,user)),900); }
    }
    go();
  }, []);
  return (
    <HeroBg src={IMG.pro} ov="rgba(8,8,16,.88)" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"30px", textAlign:"center" }}>
      <div style={{ width:"58px", height:"58px", borderRadius:"50%", border:"3px solid var(--acc)", borderTopColor:"transparent", animation:"spin 1s linear infinite", marginBottom:"18px" }}/>
      <div style={{ fontFamily:"var(--fd)", fontSize:"26px", color:"var(--acc)", letterSpacing:"4px", marginBottom:"6px" }}>BUILDING YOUR PROGRAM</div>
      <p style={{ color:"rgba(255,255,255,.5)", fontSize:"13px" }}>AI crafting your personalized plan...</p>
    </HeroBg>
  );
}
const fallback = (p,u) => ({ programName:u.name.split(" ")[0]+"'s Custom Plan", overview:"Personalized "+(p.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim()+" program. "+p.days+" days/week.", weeklySchedule:[{day:"Monday",focus:"Push — Chest & Triceps",exercises:[{name:"Push-ups",sets:"4",reps:"15",rest:"60s",notes:"Core tight"},{name:"Pike Push-ups",sets:"3",reps:"12",rest:"60s",notes:"Shoulders"},{name:"Tricep Dips",sets:"3",reps:"12",rest:"60s",notes:"Full ROM"}],duration:"40 min",intensity:"Moderate"},{day:"Wednesday",focus:"Pull — Back & Biceps",exercises:[{name:"Inverted Rows",sets:"4",reps:"12",rest:"60s",notes:"Table edge"},{name:"Superman Hold",sets:"3",reps:"15",rest:"45s",notes:"3s hold"}],duration:"40 min",intensity:"Moderate"},{day:"Friday",focus:"Legs & Core",exercises:[{name:"Squats",sets:"4",reps:"20",rest:"60s",notes:"Parallel"},{name:"Lunges",sets:"3",reps:"12",rest:"60s",notes:"Control"},{name:"Plank",sets:"3",reps:"45s",rest:"45s",notes:"Neutral"}],duration:"45 min",intensity:"High"}], weeklyGoals:["Complete all sessions","Hit protein target","Log meals"] });

function ProgramView({ prog }) {
  const [exp, setExp] = useState(0);
  return (
    <div style={{ animation:"fadeIn .5s" }}>
      <Card style={{ padding:"13px", marginBottom:"11px", border:"1px solid rgba(0,229,255,.12)" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"5px" }}>{prog.programName}</div>
        <p style={{ fontSize:"13px", lineHeight:1.7, color:"rgba(255,255,255,.6)" }}>{prog.overview}</p>
      </Card>
      {prog.weeklyGoals?.length>0 && <div style={{ marginBottom:"11px" }}><div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"7px" }}>THIS WEEK</div>{prog.weeklyGoals.map((g,i)=><Card key={i} style={{ padding:"9px", marginBottom:"5px", display:"flex", alignItems:"center", gap:"8px" }}><div style={{ width:"16px", height:"16px", borderRadius:"50%", border:"2px solid var(--acc)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:"var(--acc)", flexShrink:0 }}>✓</div><span style={{ fontSize:"13px" }}>{g}</span></Card>)}</div>}
      <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"7px" }}>SCHEDULE</div>
      {(prog.weeklySchedule||[]).map((day,i)=>(
        <Card key={i} style={{ marginBottom:"7px", overflow:"hidden", border:`1px solid ${exp===i?"rgba(0,229,255,.25)":"rgba(255,255,255,.06)"}` }}>
          <div onClick={()=>setExp(exp===i?-1:i)} style={{ padding:"12px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontWeight:600, fontSize:"13px" }}>{day.day}</div><Mono style={{ marginTop:"1px" }}>{day.focus} · {day.duration}</Mono></div>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"20px", background:day.intensity==="High"?"rgba(255,61,107,.15)":"rgba(0,229,255,.08)", color:day.intensity==="High"?"var(--a2)":"var(--acc)", fontFamily:"var(--fm)" }}>{day.intensity}</span>
              <span style={{ color:"var(--mut)", fontSize:"14px", transform:exp===i?"rotate(180deg)":"rotate(0)", transition:"transform .2s" }}>⌄</span>
            </div>
          </div>
          {exp===i && <div style={{ padding:"0 12px 12px", borderTop:"1px solid rgba(255,255,255,.05)", animation:"fadeIn .2s" }}>
            {(day.exercises||[]).map((ex,j)=>(
              <div key={j} style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto", gap:"6px", alignItems:"center", padding:"7px 0", borderBottom:j<day.exercises.length-1?"1px solid rgba(255,255,255,.04)":"none" }}>
                <div><div style={{ fontSize:"13px", fontWeight:500 }}>{ex.name}</div>{ex.notes&&<Mono style={{ marginTop:"1px" }}>{ex.notes}</Mono>}</div>
                {[{v:ex.sets,l:"sets"},{v:ex.reps,l:"reps"},{v:ex.rest,l:"rest"}].map((x,k)=><div key={k} style={{ textAlign:"center" }}><div style={{ fontFamily:"var(--fm)", fontSize:"12px", color:"var(--acc)" }}>{x.v}</div><Mono style={{ fontSize:"9px" }}>{x.l}</Mono></div>)}
              </div>
            ))}
          </div>}
        </Card>
      ))}
    </div>
  );
}

// ─── Member Dashboard ──────────────────────────────────────────────────────────
function MemberDashboard({ user, tab, setTab, sub, ctx, onUpgrade }) {
  const [showGen, setShowGen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [prog, setProg] = useState(null);
  const [showContact, setShowContact] = useState(false);

  if (!profile) return <ProfileSetup onDone={p=>{ setProfile(p); setShowGen(true); }} user={user}/>;
  if (showGen && !prog) return <GenProg profile={profile} user={user} onDone={p=>{ setProg(p); setShowGen(false); setTab("program"); }}/>;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", paddingBottom:"100px" }}>
      {/* Header */}
      <div style={{ position:"relative", height:"200px" }}>
        <img src={sub?.id==="pro"?IMG.pro:IMG.free} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.45) saturate(.7)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(8,8,16,.3) 0%,rgba(8,8,16,.85) 100%)" }}/>
        {/* Top row */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Wordmark size={22} col="rgba(255,255,255,.8)"/>
          <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"50px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"5px 13px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>CONTACT</button>
        </div>
        {/* User info row */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 18px 16px", display:"flex", alignItems:"flex-end", gap:"12px" }}>
          <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:`linear-gradient(135deg,var(--acc),#006b80)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"20px", color:"#000", border:"1.5px solid rgba(0,229,255,.4)", flexShrink:0 }}>{user.name.charAt(0)}</div>
          <div style={{ flex:1, paddingBottom:"2px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px", lineHeight:1, color:"var(--txt)" }}>HEY, {user.name.split(" ")[0].toUpperCase()}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"5px" }}>
              <div style={{ padding:"2px 9px", background:sub?.id==="pro"?"rgba(0,229,255,.15)":"rgba(34,212,168,.12)", border:`1px solid ${sub?.id==="pro"?"rgba(0,229,255,.3)":"rgba(34,212,168,.3)"}`, borderRadius:"50px", fontSize:"10px", fontFamily:"var(--fm)", color:sub?.id==="pro"?"var(--acc)":"var(--a3)", letterSpacing:"1px" }}>
                {sub?.id==="pro"?"⚡ PRO":"🎁 FREE TRIAL"}
              </div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,.4)" }}>{(profile?.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim()} · Week 1</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"7px", padding:"12px 18px 4px", overflowX:"auto", scrollbarWidth:"none" }}>
        {[["program","📋","Program"],["nutrition","🥗","Nutrition"],["wearables","⌚","Wearables"],["stats","📊","Stats"],["account","👤","Account"],["new","🔄","New Plan"]].map(([t,ic,lbl])=>{
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
        <div onClick={()=>onUpgrade("trial_expired")} style={{ margin:"0 18px 11px", padding:"9px 13px", background:ctx.daysLeft()<=7?"rgba(255,61,107,.07)":"rgba(0,229,255,.05)", border:`1px solid ${ctx.daysLeft()<=7?"rgba(255,61,107,.25)":"rgba(0,229,255,.18)"}`, borderRadius:"12px", cursor:"pointer", display:sub.id==="free"?"block":"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}><Mono style={{ color:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)" }}>{ctx.daysLeft()<=7?"⚠️ TRIAL ENDING":"🎁 FREE TRIAL"}</Mono><Mono>{ctx.daysLeft()}d left</Mono></div>
          <div style={{ height:"3px", background:"rgba(255,255,255,.07)", borderRadius:"2px", overflow:"hidden" }}><div style={{ height:"100%", width:Math.min(100,(30-ctx.daysLeft())/30*100)+"%", background:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)", transition:"width .5s" }}/></div>
          <div style={{ marginTop:"4px", fontSize:"11px", color:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)", textDecoration:"underline" }}>Upgrade to Pro →</div>
        </div>
      )}
      <div style={{ padding:"0 18px" }}>
        {tab==="program" && prog && <ProgramView prog={prog}/>}
        {tab==="nutrition" && <NutritionHub/>}
        {tab==="wearables" && <WearablesHub/>}
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
          <div style={{ animation:"fadeIn .4s" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", marginBottom:"11px" }}>MY ACCOUNT</div>
            <Card style={{ padding:"15px", marginBottom:"11px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"11px" }}>
                <div style={{ width:"42px", height:"42px", borderRadius:"11px", background:ctx.plan.color+"15", border:`1px solid ${ctx.plan.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>{sub.id==="pro"?"⚡":"🎁"}</div>
                <div style={{ flex:1 }}><div style={{ fontFamily:"var(--fd)", fontSize:"17px", color:ctx.plan.color, letterSpacing:"2px" }}>{ctx.plan.name}</div><Mono>{ctx.plan.price} {ctx.plan.period}</Mono></div>
                {sub.id==="pro" && <div style={{ padding:"4px 9px", background:"rgba(0,229,255,.1)", border:"1px solid rgba(0,229,255,.25)", borderRadius:"7px", fontSize:"10px", color:"var(--acc)", fontFamily:"var(--fm)" }}>ACTIVE</div>}
              </div>
              {sub.id==="free" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px", marginBottom:"11px" }}>
                  <div style={{ textAlign:"center", padding:"9px", background:"rgba(255,255,255,.03)", borderRadius:"8px" }}><div style={{ fontFamily:"var(--fd)", fontSize:"21px", color:"var(--a3)" }}>{ctx.aiLeft()}</div><div style={{ fontSize:"10px", color:"var(--mut)" }}>AI questions left</div></div>
                  <div style={{ textAlign:"center", padding:"9px", background:"rgba(255,255,255,.03)", borderRadius:"8px" }}><div style={{ fontFamily:"var(--fd)", fontSize:"21px", color:"var(--acc)" }}>{ctx.daysLeft()}</div><div style={{ fontSize:"10px", color:"var(--mut)" }}>trial days left</div></div>
                </div>
              )}
              {sub.id==="free" && <UpgradeBtn onUpgrade={onUpgrade}/>}
            </Card>
          </div>
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
      <HeroBg src={sel==="pro"?IMG.pro:IMG.free} ov="linear-gradient(180deg,rgba(8,8,16,.15) 0%,rgba(8,8,16,.92) 55%,rgba(8,8,16,1) 100%)" style={{ height:"205px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px", position:"relative" }}>
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
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, rgba(8,8,16,0) 0%, rgba(8,8,16,.2) 70%, rgba(8,8,16,1) 100%)" }}/>

        {/* Top bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:10 }}>
          <div onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold} onTouchStart={startHold} onTouchEnd={endHold} style={{ position:"relative", userSelect:"none" }}>
            <Wordmark size={26} col="rgba(255,255,255,.9)"/>
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
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 12px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.22)", borderRadius:"50px", marginBottom:"12px" }}>
            <Dot/><span style={{ fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"2px", color:"var(--acc)" }}>AI-POWERED FITNESS</span>
          </div>
          <div style={{ fontFamily:"var(--fd)", fontWeight:900, fontSize:"clamp(46px,13vw,68px)", letterSpacing:"5px", lineHeight:.85, marginBottom:"8px" }}>
            <span style={{ color:"var(--txt)" }}>FIT</span><span style={{ color:"var(--rd)" }}>2</span><span style={{ color:"var(--txt)" }}>ALL</span>
          </div>
          <Mono style={{ color:"rgba(255,255,255,.35)", letterSpacing:"3px", marginBottom:"22px" }}>MOVE BETTER · LIVE STRONGER</Mono>

          {/* Role selector cards - side by side */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"20px" }}>
            {[
              {role:"trainer",  icon:"🏋️", title:"TRAINER",  sub:"Manage clients",        border:"rgba(255,112,67,.35)", col:"var(--tr)",  glow:"rgba(255,112,67,.08)"},
              {role:"enthusiast",icon:"⚡", title:"MEMBER",   sub:"Start your journey",    border:"rgba(0,229,255,.35)",  col:"var(--acc)", glow:"rgba(0,229,255,.08)"}
            ].map(item=>(
              <button key={item.role} onClick={()=>onContinue(item.role)} style={{ all:"unset", cursor:"pointer", display:"block" }}>
                <div style={{ padding:"18px 14px 16px", background:item.glow, border:`1px solid ${item.border}`, borderRadius:"16px", textAlign:"center", transition:"transform .15s", backdropFilter:"blur(4px)" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  <div style={{ fontSize:"28px", marginBottom:"10px" }}>{item.icon}</div>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"2px", color:item.col, marginBottom:"4px" }}>{item.title}</div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,.4)", lineHeight:1.4 }}>{item.sub}</div>
                  <div style={{ marginTop:"12px", display:"inline-flex", alignItems:"center", gap:"4px", padding:"4px 12px", background:item.col+"15", border:`1px solid ${item.col}30`, borderRadius:"50px" }}>
                    <span style={{ fontSize:"11px", color:item.col, fontFamily:"var(--fm)", letterSpacing:"1px" }}>GET STARTED</span>
                    <span style={{ color:item.col, fontSize:"12px" }}>→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Plan pills */}
          <div style={{ display:"flex", gap:"6px" }}>
            {[["🎁","Free","30-day trial","var(--a3)"],["⚡","Pro","$4.99/mo","var(--acc)"],["🏋️","Trainer","From free","var(--tr)"]].map(([ic,n,d,c])=>(
              <div key={n} style={{ flex:1, padding:"9px 6px", background:"rgba(255,255,255,.03)", border:`1px solid ${c}20`, borderRadius:"10px", textAlign:"center" }}>
                <div style={{ fontSize:"14px", marginBottom:"3px" }}>{ic}</div>
                <div style={{ fontFamily:"var(--fd)", fontSize:"10px", letterSpacing:"1px", color:c, marginBottom:"1px" }}>{n}</div>
                <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"rgba(255,255,255,.3)" }}>{d}</div>
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
  const isT = role==="trainer"; const col = isT?"var(--tr)":"var(--acc)";
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {/* Hero */}
      <div style={{ position:"relative", height:"40vh", flexShrink:0 }}>
        <img src={isT?IMG.trainer:IMG.workout} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.5) saturate(.7)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(8,8,16,0) 0%,rgba(8,8,16,1) 100%)" }}/>
        <div style={{ position:"absolute", top:"16px", left:"16px" }}>
          <BackBtn onClick={onBack}/>
        </div>
        {/* Centred role icon in hero */}
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
          <Field lbl="FULL NAME" val={name} set={setName} ph="Your name" acc={col}/>
          <Field lbl="EMAIL ADDRESS" val={email} set={setEmail} ph="your@email.com" acc={col} type="email"/>
          {isT && <Field lbl="CERTIFICATION ID" val="" set={()=>{}} ph="e.g. NASM-12345" acc={col}/>}
        </div>

        <div style={{ marginTop:"auto" }}>
          <button onClick={()=>onLogin({ name:name||(isT?"Coach":"Athlete"), email, role })}
            style={{ width:"100%", padding:"16px", background:col, border:"none", borderRadius:"var(--r)", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px", boxShadow:`0 8px 28px ${col}30`, marginBottom:"12px" }}>
            {isT?"ENTER DASHBOARD →":"LET'S GO →"}
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
      <div style={{ margin:"0 16px 12px", background:"rgba(18,18,28,.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRadius:"20px", border:"1px solid rgba(255,255,255,.1)", padding:"6px 8px", display:"flex", justifyContent:"space-around", boxShadow:"0 8px 32px rgba(0,0,0,.4)" }}>
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
    <button onClick={onClick} style={{ position:"fixed", bottom:"88px", right:"18px", width:"54px", height:"54px", borderRadius:"16px", background:"linear-gradient(135deg,#00e5ff 0%,#006b80 100%)", border:"1px solid rgba(0,229,255,.35)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(0,229,255,.35), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.15)", zIndex:100, padding:"7px", animation:popped?"pop .5s ease":"none", transform:"translateZ(0)" }}>
      <Logo size={36} col="#001a22"/>
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
  function goLogin(u) { setUser(u); setScreen("app"); setTab(u.role==="trainer"?"clients":"program"); }
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
            ? <TrainerDashboard user={user} tab={tab} setTab={setTab}/>
            : <MemberDashboard user={user} tab={tab} setTab={setTab} sub={sub} ctx={ctx} onUpgrade={r=>setUpgradeReason(r)}/>
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
