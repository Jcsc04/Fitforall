import React, { useState, useEffect, useRef } from "react";

// ─── Fonts & Global Styles ────────────────────────────────────────────────────
(function() {
  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap";
  document.head.appendChild(fl);
  const gs = document.createElement("style");
  gs.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { --bg:#0a0a0a;--card:#141414;--acc:#0ea5e9;--a2:#ff1f1f;--a3:#0284c7;--a4:#0ea5e9;--txt:#f5f5f5;--mut:#666666;--tr:#ff1f1f;--gr:#0ea5e9;--yw:#ff6b00;--rd:#ff1f1f;--r:14px;--fd:'Orbitron',sans-serif;--fb:'Inter',sans-serif;--fm:'Space Mono',monospace; }
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
  get: key => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  del: key => { try { localStorage.removeItem(key); } catch {} },
};
const loadMemberSub = () => store.get("f2a_mem");
const loadSession = () => store.get("f2a_session");
const saveSession = s => store.set("f2a_session", s);
const clearSession = () => { store.del("f2a_session"); store.del("f2a_mem"); store.del("f2a_tr"); };
const saveProfile = (email, p) => { try { localStorage.setItem("f2a_profile_"+email, JSON.stringify(p)); } catch {} };
const loadProfile = email => { try { const v=localStorage.getItem("f2a_profile_"+email); return v?JSON.parse(v):null; } catch { return null; } };
const saveProg = (email, p) => { try { localStorage.setItem("f2a_prog_"+email, JSON.stringify(p)); } catch {} };
const loadProg = email => { try { const v=localStorage.getItem("f2a_prog_"+email); return v?JSON.parse(v):null; } catch { return null; } };
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
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, maxWidth:"480px", margin:"0 auto", zIndex:300, padding:"14px 18px", pointerEvents:"none" }}>
      <button onClick={onClick} style={{ pointerEvents:"all", background:"rgba(10,10,10,.8)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"10px", color:"rgba(255,255,255,.85)", cursor:"pointer", padding:"8px 14px", fontSize:"12px", fontFamily:"var(--fm)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", letterSpacing:"1px" }}>← BACK</button>
    </div>
  );
}

// ─── Biometric Auth (WebAuthn / Fingerprint) ──────────────────────────────────
const BIOMETRIC_KEY = "f2a_biometric_user";

async function isBiometricAvailable() {
  try {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch { return false; }
}

async function registerBiometric(userEmail) {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const uid = new TextEncoder().encode(userEmail);
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name:"FitPlus", id: location.hostname },
        user: { id: uid, name: userEmail, displayName: userEmail },
        pubKeyCredParams: [{ type:"public-key", alg:-7 }, { type:"public-key", alg:-257 }],
        authenticatorSelection: { authenticatorAttachment:"platform", userVerification:"required" },
        timeout: 60000,
      }
    });
    if (cred) {
      store.set(BIOMETRIC_KEY, { email: userEmail, credId: Array.from(new Uint8Array(cred.rawId)) });
      return true;
    }
  } catch (e) { console.log("Biometric register error:", e); }
  return false;
}

async function verifyBiometric() {
  try {
    const saved = store.get(BIOMETRIC_KEY);
    if (!saved) return null;
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const cred = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: location.hostname,
        allowCredentials: [{ type:"public-key", id: new Uint8Array(saved.credId) }],
        userVerification:"required",
        timeout: 60000,
      }
    });
    if (cred) return saved.email;
  } catch (e) { console.log("Biometric verify error:", e); }
  return null;
}


// ─── Translations ──────────────────────────────────────────────────────────────
const LANGS = {
  en: { name:"English",  flag:"🇬🇧" },
  pt: { name:"Português",flag:"🇵🇹" },
  es: { name:"Español",  flag:"🇪🇸" },
  fr: { name:"Français", flag:"🇫🇷" },
  de: { name:"Deutsch",  flag:"🇩🇪" },
  it: { name:"Italiano", flag:"🇮🇹" },
};
const T = {
  en: { trainer:"TRAINER", member:"MEMBER", manageClients:"Manage clients", startJourney:"Start your journey", getStarted:"GET STARTED", moveTagline:"MOVE BETTER · LIVE STRONGER", free:"Free", pro:"Pro", trainerPlan:"Trainer" },
  pt: { trainer:"TREINADOR", member:"MEMBRO", manageClients:"Gerir clientes", startJourney:"Comece a sua jornada", getStarted:"COMEÇAR", moveTagline:"MOVA-SE MELHOR · VIVA MAIS FORTE", free:"Grátis", pro:"Pro", trainerPlan:"Treinador" },
  es: { trainer:"ENTRENADOR", member:"MIEMBRO", manageClients:"Gestionar clientes", startJourney:"Empieza tu viaje", getStarted:"COMENZAR", moveTagline:"MUÉVETE MEJOR · VIVE MÁS FUERTE", free:"Gratis", pro:"Pro", trainerPlan:"Entrenador" },
  fr: { trainer:"ENTRAÎNEUR", member:"MEMBRE", manageClients:"Gérer les clients", startJourney:"Commencez votre parcours", getStarted:"COMMENCER", moveTagline:"BOUGEZ MIEUX · VIVEZ PLUS FORT", free:"Gratuit", pro:"Pro", trainerPlan:"Entraîneur" },
  de: { trainer:"TRAINER", member:"MITGLIED", manageClients:"Kunden verwalten", startJourney:"Starte deine Reise", getStarted:"LOSLEGEN", moveTagline:"BESSER BEWEGEN · STÄRKER LEBEN", free:"Kostenlos", pro:"Pro", trainerPlan:"Trainer" },
  it: { trainer:"ALLENATORE", member:"MEMBRO", manageClients:"Gestisci clienti", startJourney:"Inizia il tuo percorso", getStarted:"INIZIA", moveTagline:"MUOVITI MEGLIO · VIVI PIÙ FORTE", free:"Gratuito", pro:"Pro", trainerPlan:"Allenatore" },
};
const getLang = () => { try { return localStorage.getItem("f2a_lang") || "en"; } catch { return "en"; } };
const setLang = l => { try { localStorage.setItem("f2a_lang", l); } catch {} };


const FAB_ICON = "data:image/png;base64,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";

// ─── Custom Nav Icons ─────────────────────────────────────────────────────────
const NAV_ICON_WORKOUT = "data:image/png;base64,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";
const NAV_ICON_CALENDAR = "data:image/png;base64,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";
const NAV_ICON_NUTRITION = "data:image/png;base64,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";
const NAV_ICON_WEARABLES = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAqT0lEQVR42sW9eZRlV33f+/ntfc65Y83V86BWd0tqdWsiEoMRmEHY2AQ8oGCw8cIEGYNZcYLj2I5t/OznOFnrkSz7mXjAll/Ay0OMARPA2MaEQUwSowY0q+e5q7uqq+qO55y99+/9cc69dat6UDeBpLRud+lW3el3fuP3+/3tFkD5Ln5ZEQC8Dl5GuG58jFunJ9jbbHJ9tcqGaoW6KX6qqoSgw7clIsUNKP4sn0UGzyYggqgi5eNVwWjACsTGIEDbORbywOPtNl9vd7j//HmOtrvlcxSvE/TqTSHfLQMKYESGhts+1uRHNm/gh9fNcMvYGLORFK/sFVRXvw0tn6Cw6Mp9aGk5AdGVX1QB9RDC4IXBmOKxqiuPHT6/cMI57ltq874Tp/mfZ84Bih15v/9HDWhGruaeyQl+fve13L1uhplIwHnwnqAQtHAlEXn2N6GKqiIipREVQQmABiExQCScTx0Ptnp8q9PmYKfPXJ6ReU/NWLZVK+xrNnne5BjX1yJQT5rnfGK5x3/cf4xvLi1hRAov/j9lwMFVrEYRv7jnOn5+2xamRME58lAYzAgjwfjtfik+BGIBKlWebnf406Mn+ciZOfZ3upd95HiS8ILpad64fpYfnawzZoXzCr9x6AT/9cjxFef/323ASASnyr7pKd572028qFGBviMrw0O+g/nB+Zwkspxz8O6Dx/hvR44x7x0Am5IK22yF9SaigcEieAksBscJl3PIpXSCB+D71m/gN67bxp0RBDX87tnz/NKT+8uof3ZP/I4ZMDKCC8qrtm7h/bfeyLoAmcuwYkbS2UgYXjZadaRYyPAxxf2BEAJJNeKBxS4/+8hTPNRugQi3VJvcbmusl4gqEAVPAEQNGEUUchGWVTmiOQ/mbQ7nKeNxwm/fsIt7JurUBP7g3DL/+slnhq95OQNZ4De/U573hmu285e33MhEmpF6X1TgEWOEEC4w0KhhR2+j948+xoVANYn5+Nwir/vGIxxO+2yqVPnB2jh32gazHpSAD4oTwQOegAMyAA3UVNkiln1xjenI8nTe4+NnzkKtzvMbVV7QqOLimM8vLBKJIVzGhP/LBhzkvB/ZuoW/vHUPca9PDlhhlefoFVa3EMLQQwctzOCxPii1OOLjc+f5iYceZRnlpkqD11Qm2BoMLnjyoXMH0IAoGGRY2C3FczpAgrIlitmVVDmrnr87e5b62DjPr8bc2Uh4tO94stMtPst3w4AD4z1/dpYPPudm6v0eDoORy4fmqFEuG7owrOa5dzRiwwOtDj/20KMsqdK0ltfUp9ngAt2y+ouWhjeCGMWIFEajMOTgopiRQjSBcFPS4Jx6/ubMGfbMzHArwnPGmnzsfItl77BiuFgwX7UBBYZurcDGWo2/veMWtmugr2DWGGJtWF7MUGvDdWjgEKjGEQZDJbbMeeW13/wWR7OM2Fj6wXPcp2xPakwHUBWsCHbYHK80yYOmWxi0TmXLaAQVQ6yBvZU6J1yfj5xf5KWz63mOCYw3mnzs7AJyCS+8KgMOKk5ASWyEtYa3X7OdH5+doJtnWFYbI4TwrEl4rXFl2PQGTJTwu8dO8B8Pn+SLrR6/e/g4D7VaRNbgVTEIreA54nOuTaqMoQTRYZtkEERlZEIJoKM/19KQgSBKFAJ7khr3d1qcMsI/n5pgT9XytU7GwV4Pe5F+9YoNKGUema1W+TfX7+L3bt7DXJpz18QYeysJeRh4VjGK+RBWBgFVAoEQlIAQyvvWmnYwsnkN1OKYe0+e5h/ml3jXDddS7fU51u5w2nt63g+9yoqh7R3HcdyY1KgFJUgZzgIyHAmL6DBGEDGIaHGjuN+WjlFTYUelwkcWz7FvZopbxTNTqfLhc+cvOqVckQEHYTAex3z4jtv46ZlxJmLL3548zU9s3shk8KQhYBUqRqgYS8UIiTUk1pIYSIwlMUIiUn4fiFBcaexQvlLQ4jsnht945hD/ft9uvrdhuK1e4WUYbqpW+WK3TyeEYVhZEZa9o2uEG+MaggcpJpXByCdS5EOxhfsJUhpZ0GGIgwM224g8KF/u93nV5Dg7reEbqeNAr0ckUr7XsgO50mLhVHnz9m28LInptXp81Xkihd2NGJtmTEjMslcOpRmH0oxT/YxTaZ/zuaPvHYJQtZbJOGZzpcKWasLOSsLmJKZpDKKB1Dl6Cg1r+PpSh1QMt8URvV5OiCK64nmZwM9Nz/CuudOFFyqE0hMf7LfZEiW8yFRIQ44pR0UtDVbYqYQlZGXOlmL+LIwK9ILysto49y7P87HuLD9Tsbxl3RSfWji/ynhXZEApkZRqFPGTm9bRy/vUoogHTs9z7fgYnczzqfkOX1xc5LMLizzR7pBdYW+eGMONjQbfMzXGXZOTvHC8wcbIYmzMF5fOcn2jxqRCOygxgsXQ8Y4XVquMG8uy+mGLohTheF9vmd2NWTZgcKKYkQiSskqvGbFHPMUUF8RAAtwZVfn7c+e5e/sGXl5LuLXR4KFOe9Ws/6wGHPzyC6enuLkiRMGitsL9nTYHXeBvjp3kYL9f/K4x7JsY54Zmg+3VCtuTCtNxRGIMnkDmAwuZ42iWcqyf8kS7zcPtDg+3Wrz36El21Kr88LoZfmzLVr6w3OINWzci6ot8GQKEgBeYQNlsI5ZzPxyqtczTLee4L+vw+qSJ8a4MzxLuCiNoDgoqZctVWjHosJBleG6Nq3ym2+frqeeVVrh7apyHOu1VI+mzGnAAGr1pwyyVoPzPpR5/eOIwHz17DoBqFPHqjRv5wdl1PH+yzo7YMoYQ4Yteq3xTDFEUCCJkwLLPOZg5vtru89m5eT45f57fO3qC3zt6gt1jTb5nokHmcgQIPuC9JwSlZpSmFcgHxU1XjCjCo2mH51bq7DGGfPDaoai+aBi2MggrNwXRYuYIUjxPpMpujflqq8udkzXuGqvxbhvT8vmwI7msAU3ZyO6ZmODasXHe/Nhh/mzuDAA3jI3xU1s38QNjTW6IoEpAfIZgUBsRgLZCGoQcLVofEaomkAgkAWZVmY0ML5hu8DPTEzye5nz07AJ/dOwk19cbbDRK3wcwpiguIaAErAnEIylmbcrJQ+BLaZvra02i3KGYwq1EkQBGdSWUdaU1GfSfg9zpRdkisL/V5eB4jb2J5UUTDf5hYXGIdUaX974CuDTG8MaHHuV4t8Omeo1/e8023jA7yToJkDlMgJ4RDufKk60OT3d7HOr1OZxmnM5yMu8JCHUjTFZiNicJu+s1bm82ublZZxMG6zL24rhp8yyvWzdF26W4vsMDoh5RgyknCKtFTrxUxIgIT6d9Dleb3CCGTH1hlJFioaMdxpp4kzI5ighVK9Qzx8HMsa9ieMV4k39YWLyyEFYUi+Hx8+cBeMu2rfy7LRu5VgKu14VKhYXI8vmFFh+eW+C+5TZzWf/yOaGz+n+3VWq8eGKCV82M8dKJJtPBsVNyQhyRe4cacAqxBZNE+D5URRiL7CXxJAPkwfPNvM8NcQ2T+zIki6o96EC1nEwULRvssiDpwBuLp59Wy6luSi+u8fxKlbqN6HpXTGXPPusGNtdq/D837ObuZpV+t0uII07bmA+cPMcHz57j4faKVTbVatw+Mc7zxpvsHWuyPrFYa/ilxw5w/+JS2c1rmbOVY2mPv5rr8VdzZ7ip2eQtm9fzYxtmmPU5fZcRIoMYQwhKUkloi2CMsCWOLgl7DpqTR/td5io11osQWEFxZZXhSt5GBmG+UqkH/eGEBHq9lNPNKtdZy631Kve32hjk0gaMxOA0cMvkJO+/fid7TaCd9kiqDf7m3CLvPnaMJ3o9ACaThLu3bOH1m9exr1FDMsfJbp9D/Q4Pt3osBuVM1kdR/JpZ2IopcjzKo+0W//bpFh84fZZf2bGNVzRiUpeRS4GixNUqWIv3nn2VpGi8LxHGRmDZO55xGdtNRM+HwmwGtMyFoiMzssjQI5FBKtCh5/Zzz5zzbI0sz63Xub/VBrmEBxaNc+Dl62e4d9c1zOYZfTUsScxvHjjCn585U0LjFd6+bTPv2LYRA/zjufP84VMH+OpSi5N5dmFPadb0XeX4NHAiKwJG+MryMnd/6wnevmULv7p9PQ31dDUQR4ZqrUq31eaOSpUdScyRPC+K3UWKCShPZimvqMZE5fgoA/8TELMaIRjNh6PwgxhD4gJLmcfHhudUo2EERWtfNhoYb906/nL3NSRpB6KEh9LAv376KR7pdgHh7i0b+O3rd2PyjN85cIT/fnKOsyWkXhhLimF+YKiSbrwsFli2PdYUnvUHx4/xWKfF79+4k+0iLDtHc6xBt9tlg0/5yfEmv31u4QJDjJJ4B13KOWkwiyEzRX5cIbIGY54MWcSLcFkYCtKqnXm6dcueSkLTxrR9XsJiQ88Dp4HbJia497rtJGmbOE74XCfn9Y89ySPdLs045o9vvZE/3buLDx05xnO//HXec+wkZ4MjsobImCEuF1Tx5W0QVkYKyMlcBtYPZU8WWeFz5xd5wyNP87Q31BWcwNTMNP0QeF2jyosbdVwokJkLw7gw+n5VEmOIpXCQqERibKCozrqac14NcBQhbwTykNNVz+bYsLMaDwvW0GWDKtOVKn94w7XMZCnGJtzfyXnrk89wJs/ZkMR85LZ9vGSswWseeIhfP3iEZdXCaAg+rBhLL4Lm+BI4cCHgBxzuZVooHyCyhkfbbd70+FMcF0tFlagS05yZwmYZvzA9wbooIpTE+gVhrHDQZWAKst2gWLToBY1iTMCIR8RBeTM4rOZYzYq/vSdWj3OOroemsdxYq6w24KCE/9au7dxCjlPhkBPe/tQB5lzOpmqN/3HrzVSznJc+8CBfbHWIjcGUs7JeFgiDoIHXbN7EXzz3Vv709lt58ewMGpRn4ZfwobhAj7fa/Jv9x8iSKsZ7Go06VCpcGzJ+bmr8kl0dCIfznJ4BSxhC/UYUIwErgZiALRvoSAsE2yAYDEYLb43EEDz0QyAKys44WTHgAJp/9fr1/MRYnXbf0bGWn3/mAIeylDFred/e60jznB9+9ElOO09sDO5ZwFJBsGIIqrzz+p28/+Y9LLd6kGZ86I5beM36WcJgxLqcEVWJjOWz8/O8+8Q5qlFElueMTzToK7yqFvPKZp2gujonlV+nXc6CUWINGHVYAkY9kSpWy+YcxYaACb5o3AnF/GxAIsVYRfD0XCEK2BnHg768CN1mHPOLWzag/T6VpMp7T8xxX6tAHv7T9bvYGgmv/9YTLHhfUJhXSBL5EJiKY96xdQu/8ODDvOPJp/npR5/gvfsP8e+2bSu98wrIprLR/aNjJ/hsJycBjIlp1OpIP+XNYw3GjBDQVcS4Eej6wGnvia0tMZ0BT6JlSBdGLLxSsaVnCVrMzkHLOVnpO6UfYHNkqJgIMwjd125Yx60xKJ4Hs5Q/OjMHwN0bZviRyTHe9vh+znhHZMxFkdkhslsWiKJYgBglsYY4eM6P9BopZpgor+RSaAm/Z8Hzn4+fpmMSgg80mw0yEa4D7qrXy1ZlTQLRwJz3w+IhpaEipeRPCs8twtdgRYlQYlESIC4b5gghDYEMmDWGKStEQZWqtfzU9Dgh7WHjhD87epZF59hQqfDLmzZx79ETfKndwV7GeGFQ80d+7su/z/RTfv/YCX7/5r3cdPQEdWu5Z/NmfvGxx0tE+Uq9EKwR7l9c5NPt9fxoxdAXoV6v0en0eGWjwt93OuQjE55K8Z5OOweJxcoobWrK91/0osaUiJEaVFYkYFJ+JitCXhbBCWvYmERECrxocpybLTinPNkPfHShmH3/5boZ+mmf95w6e0kq0ojgQ6BiLW/ftoXnjY8VmpUBl2ssJ13Op+fnedeTB3j1zDSiyj0PPcInFhcx5YcYcK/PLjErYP+/PjvPq7dthDylkVRZarfZZy23JQlfzdKVtqR8unnvyW3hZUEUM4BaB/CWkfK9aPnfCvS/iin0iveeSmzZEMdFI/3KqQli51FiPj6/xKJzbE4q/IvJce49dYbF4LHGXPDhrAguBGaThL+4ZR/bIuH9h4/RDQXfkYhhrFJlW63Kf9i+jeOZ41f3H+DJbq8EgE2hcAvhAprzUtqTwUV8YHGJb22Y5mZRbGyx1lILjjvrNb6aphdMPeeDJ8fQKHkPM8QEzYqCbkirll2lyioxYlQCDJkPVK2yTgzReBTzgkqC956z1vDJpUUE+P7xBsZ5Pr7ULtKt6gUNpguBbdUKf3njDcy1O7zwqWe4ZWaaKWtop47DeY+DZwrgdVwMv7xjKx+5dS8/8/jTfGGphdcACi+amuZfzE7yhcUlPnzuPKPkYVijpdHS8C2Xc1+7xy3jdbzPSaKYtJdxkzUkZYcweilaIdABxrREscUOyftLAmPiR7L7SkfgNBAHYcYI0d5mg62iBA08lTqe6vVRgTubDR5Y7nDS5Ygxa8hwCEG5Y6zJf9uzm8+emecXjx7nv+zZxWtmJ/jG+RZ3Vqp8bLnFOw4cLiYCVX7t0FGOdnu8Z9dOfvzJp8kx/Nr2TVxnIu6fn+dXtmxgLs35wvIykSnI+/E4pp37VfqUwQf+WqdHe7wGQalGlrng2JhUuCaKOZBnq2bkXgj0NBAZTz6owRpAfckTCwRT1OUSUVAZmQmHr29wQVFvWW8NZl8twfqCwXqyn5GqMhvFbLMx/9Rur+62BwUjKNNxzHt2XcNfnzjF/3XyFH990x6uU+El9z/Ibx46xunguPfYSTzFdDJuLXdv3sT/d2ae95+a4wPX7eTebVs5sbTMG/fv5xsqZE7p5EUJ8EHYWavy/ut2siOOVlXXQSp5pttj0YWifxODNTFnVFj0jqBatlpFYchV6RSNTYHChAK9sghGV5QMhckLEn7gM1K2RpZCLJWHgFdlSizRrjhGgpJaw/5+kZt2xwkSAo+l/YtQVyuKrDTLmRTDx/Zez4HWMm88dJwecO/mTTy4tMTX05TIWpz3/MD0FO/dvJGX1yq88+ARHmm1OZn2iSoV/tM129hsLL9+6Cjf7PeITCEU2hVXeJ5z7EsSDmQZa8RenMszzuaeSZ8TIxyzlnedW+LO6XFuSmI+ML/MM2mG2OKidwlYiRAtZmJRU1Rp8UUuJCCiQ1RbhjlwUEyk1HoVJJkFzPZIIHiyoBxJcwCujSL6LnDG+YJXvQhkPpfl/OqRE0RieN+x47z10HF6CLc3m+y18Dsn5orHBpiOE94yPcGvPHOQpip/tXsnwRh+cvMG/njrRr42v8hrnjrApzudVdGypxKDy7mjUVnVL2qZ6Ns+cMY5jPckCh9q99jSrPGfx+vcY+A/zE4wblbgsgxBJKBG0RIXLF7OgJaiIzFYzCoh0mglLqpx4Z0NI0QzEqHe05PAeVd0bnVjWHae3mWaMxG4v9Ph/k5nSGlalLfNTnP/UptHs5zICs573jQzQ5al/MnSEn/dbvPO2Rl+bmaCJzp93nziDPudA4Gd9TrjxvJwu401ht2VKvf3c3ZWKjTE0ClHNS3DyqvS8YEYpR0C+53jVWN14l7KKe/YGcXsjGIeyjNQW+ZDW8hPdABmFMC8KREXVS4K0g6a+UHXGxBqRohiii42VyUbCCysZaHMG3I5bVx5dUQUFwLXVKvsiiJ+YWERkQJ92VWt8f2NKu8+eQZEWArK/31mrpDdlqr7xBgyVd42PcUuE3h9u82GOGazNfzJuSXeNDvFnkrCN/r91ZVThRyP14Cj6O8SVXquwB6dU8aknHik9EQzolIIDDHBQbUPa7Q6FwpCtVwuKKQsJgser45Ei7kQhL9fbvH/zp97VqQkAB4l6MqHSlU5H8Kwku2pVmh6OOGLqxtLMU140WE5zYJnR7XCdcYw5gw7o5htSYxTz5d7PRYJ3FBNSkmGrHBnJbYXBNLyIqaqZHhS9QWZP7z8oZR4FIqxC4NLCCrD17i0DFmG0r4gStT2DpWAJVA3RYCczNORUUcvKfkYhc5jYznvPU91+/yrdev49TNn6KN8ZrnFvijitzZv4FdOnuZwVpDS1zcbvGFyErzHI+ypxHx2uU1dhFc06yxbw9O9Hi1VvtHt8yPjE9zWaFKPIv747Dm+1e1RsYZxY3HBkSCMi+FAnmHrMTUHpzAccTkDuCeiWCUZjGdB1szMZaO8CuaXtXLkUFCsCkshYF88Vv/NG0QRI3yh73mqnxIZc+nlmUFXtIoehB+fmeWuRp33nJ3j5WPj/MDYJM+kfc44x5e6PWbE8BNT0zze77HgC2I7uJwT/ZS5LOOJXp+PtFp0Ub6/WWeTjXig0+OJLON45jmW5Rzp93is2+NAltENgZk45k0TTRrO4REyhA+1O2AT+mL5k1abx3M39Ka7ag22iMENZESy1g3KgWGE1gyh1BUOW6hAwxqaRnjUe6IjucNXBOsCG5N42CzqEAoYBQx0UAKpWkPTGMaM4fpKhVfXG/zx3CnmvPLLp07zprEmvza7no+0lvloa5k/OX8eFXjrzCy/deY05/KcT16EeHo8Ten5Jpsl8ERa/Pysd3ymk7N2z2s2iZksQ7MbAreivGV8gvcttzjvcsJQ2wOxsTQF1AcCBlU/srSzGoLFjHQeI+CCDqjOUtmVeSV6InX06xXqTtlVoqxrZ97BXtBslPCjk5PsFoMVoRoACQjKRxcW+Fw/ZUuScM/sOv5obo6v9Pq8ZWqaGRvxF4vn+dBSi9/Y0GCLjXg6ZMVsucaALa88kXuqScyJso2yo8txgzFSYXccUfWeTAXnA3mm3Fa1zFrDvGNEy6dUBcYGn00Yggbls190e+CCxbwSN0QVFWHBK9HjvT7nx+vEwbEnFqajmAXnWEt0qQZePz7B5gAfbZ3nXPAsBE9HA73yF7ckFd4xPc1cp0PHex5yOX+2tMibJyb5ALClUqXnA3PeQfnhdG1eFeEz3S4HM0tLCy537ZqBlBXr9qRCkgcyUZZzjxjDyaAcyzJkdD2h7NkaZeETCauMtqKhLprpEPwIW2eH71LxZRozqApnvCc6kmU86uAlomz3gVtqVT7Xaq3Sj6ysIHjmTUSaxOwwNfZKRM0UJMuEscwKHOq2eX9rmaw0yPZqlYN5RkcDt1erPNXvsxjCkIO5QNeCcjDtczAdtBEXRkNQZV1S4XmxIXUZHst5HwjW8JTr01WwUuzRDbL5eBSRmIK60DAY8cwqBkVLfzVlDSiqtRsKgEO5ASpqSFU5rUqkqny51+Ol9ZhKcLxirMLnWu3Vb1uKq/Oh5SW+r9nkJXGNtg+0fM5y5jmpRdN9NjgOuxwVU8JFcG1c4eHWMokxXGcTPthZKHjZyyDRpvx5uFQ0KdzZrLMVJRVoBWU5FNqZx0q1hK5JQDPGEgVDMHYw0IP6siDKygxcYNYjT1BoC1UFV7ZNFkOXwLzLCzzwc50ub23MMOEz7kxirqtWeabfKwghBoS4cjZ4/mpp8bJyViMrTN3mJKYeDA+lffbWamTe80yWgXBZkl0vYdwBf1KLIv55rUruUryJmc8zMBFHg/JInrPq85ffrY8s1ge6IawsO2qJ+amgYoePU3QESKDsj0uS3RRGXAjKKRcwBjiWZXwm7SNGmPCeu8drF1CEA1TGDDkPgy2LyZAHKcWOWgq7r4trLAbPvAb2JU0eS1O6GhgZT69+N1eVl4yNcYsKXbW0Q2A+C0TEPNzvFwZaW1dF2BzbcmrRYg0sgMPgBLxRfBnyShniGtBQ7OW5EPAa8CIYawDPXAjM+5HX+vPlLvMi9POMV1Yq3Fav4dVf8GZWboVoMgydf8QoJYqxPapwPMtoRobNUcRDaffbX9AspcbTSYWfatTwLiU3hmOppyuWOTwPpH3Wjk/FTotlCzFeRxRaopSarVWfKJRUbShBrMHn8gNwVws5w/EA3aCYQa90IE35cDenYmPqWcbPTk5Qt8UAfvVrqkWSPpD22BlV+emxjZzopxzx2ZUtV1/MgApq4J6pSXa5nFSEZRc4nXuMjbkvSzkXwlB0PqpMWB9FzIrgAgQtqr8vF74L+UmRcnJC4YlqihuCVyFgCMUQTWSKCe1QXpg5GpZy4M+WWrwgmWF3yNhnA2+bmeV35+ZKHcuVb3EPIK8H0jZnXEZdDPtdv5wArj5sjVCs0k5N8Ror9LKi4h7v5YiJORhyPt9vl853IXK9PUpoek8m5QSkK6r+VY9QMwSgVcygehLK8cvgsECugQPlEGBW/AVa3vNfFlv0bYW+y3h11XD39BS+ZK7kKr1QgQMu5Vt5jx7f3pa6pdhDvmNsnLdV67g0R61wsu9ZIsZJzN91W/QHh05cJP/tiizG+ZXV2cFQqsVNMIjakm63BBG8GIIxeGNwGPIhJS8se8OB3K1G60PZ7TzU7/Ffuz2SKMZ3+7y1VuVVUxMlH3z1HjRQY317nifkGrhjbJx/P96klvfxkTDnhCO5oWYiPp+2OeTyYmnwIqNn1Vp2RRYHBCnCMpQ5roBQLBpMGaaCFyGIENTjgyOoJxDweIxRKiqc9HDCuQs10qHE+D68vMxUZHlTtUIrT3l7o0FVDH+7sMTgdItwFeF8tTlvQAaFoLx0YpJ3Npo0sx6ZEfIQcSDNMVHE4yHjs2n70tCTwo64wiYVUgSvptTPrEBXo5Oa6miqKiegsJJRbVRclsd9INOiApu1HzaU24x/en6R/97PqdmIuJ/xM7Uq79ywnok4xpdAq+E7+zXId14LdOh1MzP8Ur3OeNojB2IxnEkdXS/0EP6p3xpOPKoXB9z2VCpUfcCFQi7nkRJ8pWxdCmzQq+IpyKIwzJPF8SmDdtECqQiPZNnwFS65bGgQvtbrYaKIW2oVfJ6yxwq3NcZYUDiWZ8VOxbOIJa/IaCMjmirc0Kjzryan+SEB7zL6xhCpkKvlcN8hJuLx0OfLWfei3jcwaC2K+aF6g3GnODEjIMLA4CV1KWu+Xy1qwBlQE5gxwrJY/rzbplUCi9Glwm6Qat+3uMhc7njrWB0TlK0+5+fHx3igUecfW22eSHvgw6oR7EoEQ8IaKYcYtlVr/OD4GC+PYqayjG7wqLGgkAssOUcPQ8UIJzM3VJbqxeZllOsrNTZ7IQ2KGi13TkYlcMW61+jGkuoK1R7Qcu0LEguJGB5zntPODVfgost3ckVO/ESnzYEs5SfHJ7g5TqhmGXeJ4YVjkzzSGONz/Q7fSlMW8/wisSQj+owLzVqLEq6rJrygWud7bMwG76GbkVlBbVQO/oW0dyEEvBEyKeZu5OLPGcq94BfECcZ5UjGlQEhRMQXSqSvt1pqyXVwUGZwwAh2UesnGfSNPCarD5fLo2QqAVxiLY57Mc941f44fqDf5oXqdbdZSyx13SODmWoPTzTGeCZ79aZ+jmWPBOdoacGGQ04omtGYsU8ayOU64IY64IU7YqpA4T3A5mbXMRwGPYaZsclUotqFcUWkd0NVwSeguBGVHtc5OY0lzV+SxASJaGj2EAig1RsEENMhwrVwlEMoTpbxAJsKYKvOqfL3kygdQ2bPvyqFsr9R4wew6Prpwjn/stvl8v8Nd9QbfW2mwQxKqwbPD5+wA7oqqdCqGNkpXlVwL4klEqIqhptAMQk2VWD1RP0MlIrMx53F8Ke3yiXabf1Yf42erDbzmBYXJ4Fwrg1eD10tfdER4XrVJLQ90RbCBstdbmdVXEB8pVNODJZuBF4sQIcwHj42ECTV8PeQcdW5Vv/msHlhIKNrc02zy4skZPpGlfKrT5uPtNp9sd7ipWuO5SY0b44R1JlBDaPhAo2QTjRZXejXiV/CqHWNpIRwNgYd7SzzQ6zFXhuaBPKVdaRREkBZQeijVAmFAOOgIvjUiO9leq3MTlqxEXsJgBJaVlkRHPGwFthpk/uK1cuCg5txOBYfhK7krCufVGNAAWQjc3+lxT5zwRpPw0ukN/M7iOU4Ezzf7Pb7Z75II7IgqbI0sW2zMrI2YsJaKFAJtQiBXpavCefXMuYz9ec5RlzFfVjQbR9zeGOd5jTHuW1rgYMi5QSDTYh1hgJI7FEdYDfMPosZYXlZt0HCevgWrBe+tI1B8cTSPFIOIrkT2sAAaoSJwxKX0Y2EDwhECX017pQPo1e0LA3wt7fBDSQVxni0i7DKWWxtN9kYRX+j1eCrr83SW8nSuF00FXAwgFajYiD21GvuSKs+JLdcGw4SHZ4zlEZexJ66hwZVblsU76qqhH3RkYCxC1Ktya73B9cHQDQUeXRSCkY88NOIojBSGgsrBD5wYng4Zd9gxYq/c7zIWvRuSVFdlQAGO5BmPBs9z4og8GHZEEcfTPndGY9xWqbBQr3FclRM+cMY75n3Oog/0QqGnQ6CCZcwaJiLLehuxQ4T1VlinQsN7QubI1JIZuN5EfCnPyCr1Yq+tJIEshkV19HREqgt4PFOVCi+P64TcoWpKhmNNN8DKMuGw2pZrvVoCwRWxPOpSiCN2BsNZ9Xyh17ko8RRdWbNb9Dz/0O9w0/gUEhzb4oSHem3OhoC4lKY33ILwHCzGJmRxRIbBqy14CBOIEKIyFG0o9jV85skUigWyGBUl1cAum/CptMu5EJgq1QaC0DOGB3tLxdEmI+tY1hi+rzbBdK7kWlBBfqh/1pFPogwKeKDUx4iWPxGMURZQvhJSXhtNkrjAfT7j9MiW+sWi61kkHEVqfaTX5UPd4jSNa0yEB864nFgjvFr6WgiAlp2jnykh9URZTuwccR6Q3OFyR5o5ut7TCUqqthyIbHFoGIEugY2RZdZYHnMpDRsTFM6q8pl0iad9f0Awlvit8uLGJDe7iEwVEVsAB2KL0S1oif9JUc2lyKNBCiN7AS/FrJwYy6d7S2yo1NgR4LQIn0rbl7RNdKUj1yCUP9pa5Jtxlz2VhFPOcSKGa40lHexalHNSIJSLy1rOlWsEOyGURKGWVW/l7A0FgnPcWW/yN50Wh62n7XIecxlL6hndOQ8o/6wxwYup4bxHxBYeJoPcZ1BjVnZYB5/EDCpu0TA7VRqx5cv9ZU5Z4WejGpp5PuV7nHR5AUB8p87OWgqeg1lGy3usNTw3qeDVrSjcy/1fyr+LPeFQ3m8GBzsxkDOpgB+gvhhUC/nFLIb1lQo9gWuqDU75nEXnhkcwKcrN9QleGTWJs0Cw0VAIKSUgqlrIOFRHcMDBbVBLVKhZyyO+w99lLV47McueDPaL8sHewiV7zqvywLWeOChYX+522BdXucta2uUBOyKmUF8NuHwtd0YGqqhV7YcpaUMzcipq0bvhAzcG5SYsFac0a+P8QZbiKBReL6xN8kKpE2WeIAYT1iCCKqu3KVkNFHgpLm7dWJ4MPT7YXeKF41Pc7ISWCB/vL9EPetF95KvKgRczYhhpX/+ivcijClViHBFeDRoMPhgyhVxKjkFt4YWqBcuF4oC8DGGV4j5Psc3pUHpqaKkwFzy71PLKsWkCihXLVhPRUMGJGYyxw+NVRhjLkiVkeGFCmQNFlaoxPOY7fKC7wHWNMV4udQjCJ12Hp/J+GbqXQ8z/Fw9gNAJZUJ7wGfsqDaZUSUNAy9MjB2E8yv0P9H0Dzlm14DwGBvWUHqlmOJMGI2QKu60hszH7+10OZD2S2LBJEih3idWUYGxpKB0KiIrG2ZevXzFFMflK3uZj/WW21hu8rjLDlAs8rBkf6y6O1O3vogEH00onBB7zGTcmDSYl0B/0Z6IrYsywQoMGsQWsXh4I4U0Bp6sU5/kpFjWlKqpsXoOAcZ7royrdKOJA1ueZvE9mYEtUoTlAlaU4CTNo0aoMPLE4+7AI/2Oa8nf983w977Gj3uDHkkk2OOWg5HygO09fr+yA2e/YIbSm3HebjRLuaU6yU6HrPYgthES6Ar8Nzs4enCuiOpqkyqo8RMB0eIbLAGa3QSGK+FTo8bnOMi4ENkYJz4vrXGvrjGMx6stiUhy4EzD0gDOhzyN5l0eyHsHAHY0pXmIarPdwjJw/755jKfiL4ozfVQOOchl1Y3ltc5LnmwTvlXTV+ny5BDQinyjaHlbxuQMDh1GyvtQ6BwVDIIoMz4jw6bTF4bQHCmPGss1W2GRjJsUiqnTxzAfHYZdxJjhA2FCp8r3VcfZpREUNT2jG33bP0Q7+qozyHT+Ie7RiPb/a5K6kwTo1pWZ5RG04Yi0tXXJU+SDiR8SeKwYcFAQtlxQTCfSM8HjI+Gbe53iWkgd/UaDQGMOWpMpNcY29xMwGS07gK6HLP/WWVkT1enVt3Xf8KHgZWYEdM5bvSRo8N64yU04FrjyFrTjbr8yiGhUeJ2u4ZV3Z0FSKY6ikVIkWOIBiNBAbQ99EzOOZ05wFLVa7PFDBMG0iNmNYT0RDiz2/owQ+ky/xTN77to3xXf3HCGRkD7hpLTfFNW6MKmzGUtOVU398WSBGO8zBvzUwmE10ZE9jIMQcRHVRzYv74/LUXh0Ixgkl6SWEILRwHNacR1yfp1wHX+qhuYrz8/+3GPBi3jgIpVkbs8VEbJGEGWOoiSEZSi1WisWo7GdYUEoOTxjRqMlKez+Q4mmJnKhAj8Ci95xSzzGfMeezi6acb+fr/wefkhnqNsJVqAAAAABJRU5ErkJggg==";

// ─── Logo ─────────────────────────────────────────────────────────────────────
// App logo image (FitPlus brand)
const LOGO_URL = "data:image/png;base64,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";

function Logo({ size, col, anim }) {
  // Circular icon version — just show the logo image cropped square
  const sz = size || 60;
  return (
    <img src={LOGO_URL} alt="FitPlus" style={{ width:sz*2+"px", height:sz*0.75+"px", objectFit:"contain", objectPosition:"left center", display:"block", flexShrink:0 }}/>
  );
}
function Wordmark({ size, col }) {
  const sz = size || 36;
  const h = Math.round(sz * 1.1);
  return (
    <img src={LOGO_URL} alt="FitPlus" style={{ height:h+"px", width:"auto", objectFit:"contain", display:"block", flexShrink:0, maxWidth:"180px" }}/>
  );
}

// ─── PayPal ───────────────────────────────────────────────────────────────────
const PP_EMAIL = "jcsc0912@hotmail.com";
function PayPalLogo() {
  return <span style={{ fontFamily:"Arial,sans-serif", fontWeight:900, fontSize:"19px" }}><span style={{ color:"#0ea5e9" }}>Pay</span><span style={{ color:"#003087" }}>Pal</span></span>;
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
          <button onClick={()=>setStep("paypal")} style={{ width:"100%", padding:"15px 16px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.25)", borderRadius:"14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"14px", textAlign:"left" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontWeight:900, fontSize:"22px", flexShrink:0 }}><span style={{ color:"#0ea5e9" }}>Pay</span><span style={{ color:"#003087" }}>Pal</span></div>
            <div><div style={{ fontSize:"14px", color:"var(--txt)", fontWeight:600, marginBottom:"2px" }}>PayPal</div><div style={{ fontSize:"11px", color:"rgba(255,255,255,.45)" }}>Pay securely with your PayPal account</div></div>
            <div style={{ marginLeft:"auto", color:"var(--mut)", fontSize:"18px" }}>›</div>
          </button>
          <button onClick={()=>setStep("cardForm")} style={{ width:"100%", padding:"15px 16px", background:"rgba(14,165,233,.06)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"14px", textAlign:"left" }}>
            <div style={{ width:"36px", height:"26px", background:"linear-gradient(135deg,#111111,#111111)", border:"1px solid rgba(14,165,233,.3)", borderRadius:"5px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>💳</div>
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
          <Field lbl="YOUR NAME" val={name} set={setName} ph="Full name" acc="#0ea5e9"/>
          <Field lbl="YOUR EMAIL" val={email} set={setEmail} ph="your@email.com" acc="#0ea5e9" type="email"/>
          <button onClick={payPP} disabled={!name.trim()||!email.trim()} style={{ width:"100%", padding:"14px", background:name.trim()&&email.trim()?"#0ea5e9":"rgba(255,255,255,.08)", border:"none", borderRadius:"12px", color:"#fff", cursor:name.trim()&&email.trim()?"pointer":"default", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px" }}>
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
                  <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:"linear-gradient(135deg,var(--acc),#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"14px", color:"#000", flexShrink:0 }}>{mb.name.charAt(0)}</div>
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
                  <button key={st} onClick={()=>setEditItem(p=>({...p,status:st}))} style={{ padding:"7px 13px", background:editItem.status===st?"rgba(2,132,199,.15)":"rgba(255,255,255,.04)", border:"1px solid "+(editItem.status===st?"var(--gr)":"rgba(255,255,255,.08)"), borderRadius:"50px", color:editItem.status===st?"var(--gr)":"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{st}</button>
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
      <Card style={{ padding:"15px", marginBottom:"10px", border:wActive?"2px solid var(--rd)":"1px solid rgba(14,165,233,.2)" }}>
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
              <div style={{ padding:"3px 10px", background:isConn?"rgba(2,132,199,.15)":"rgba(255,255,255,.05)", border:`1px solid ${isConn?"rgba(2,132,199,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"50px", fontSize:"11px", color:isConn?"var(--gr)":"var(--mut)", display:"flex", alignItems:"center", gap:"4px" }}>
                {isConn && <Dot col="var(--gr)"/>}{isConn?"CONNECTED":"NOT CONNECTED"}
              </div>
              {isConn && dm && <div style={{ padding:"3px 10px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"50px", fontSize:"11px", color:"var(--acc)" }}>🔋 {dm.bat}%</div>}
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
        <Card style={{ padding:"13px", marginBottom:"13px", border:"1px solid rgba(2,132,199,.2)" }}>
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
          <Card style={{ padding:"12px", border:"1px solid rgba(14,165,233,.2)", display:"flex", alignItems:"center", gap:"11px" }}>
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
          <Card style={{ padding:"14px", marginBottom:"12px", border:"1px solid rgba(2,132,199,.2)" }}>
            <Mono style={{ marginBottom:"10px" }}>🍽️ AI MEAL PLANNER</Mono>
            <div style={{ marginBottom:"10px" }}>
              <Mono style={{ marginBottom:"7px" }}>YOUR GOAL</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {["Muscle Gain","Fat Loss","Endurance","General Fitness","Vegan","High Protein","Keto"].map(g=>(
                  <button key={g} onClick={()=>setMealGoal(g)} style={{ padding:"5px 11px", background:mealGoal===g?"rgba(2,132,199,.18)":"rgba(255,255,255,.04)", border:`1px solid ${mealGoal===g?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:mealGoal===g?"var(--a3)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{g}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:"12px" }}>
              <Mono style={{ marginBottom:"7px" }}>MEAL FOCUS</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {["All meals","Pre-workout","Post-workout","Breakfast","High protein snacks"].map(t=>(
                  <button key={t} onClick={()=>setMealTime(t)} style={{ padding:"5px 11px", background:mealTime===t?"rgba(2,132,199,.18)":"rgba(255,255,255,.04)", border:`1px solid ${mealTime===t?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:mealTime===t?"var(--a3)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{t}</button>
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
                <Card style={{ padding:"13px", marginBottom:"11px", border:"1px solid rgba(2,132,199,.15)" }}>
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
                <Card style={{ padding:"14px", border:"1px solid rgba(14,165,233,.15)" }}>
                  <Mono style={{ marginBottom:"9px", color:"var(--a4)" }}>🛒 GROCERY LIST</Mono>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {meals.groceryList.map((item,i)=>(
                      <span key={i} style={{ fontSize:"12px", padding:"4px 10px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"8px", color:"rgba(255,255,255,.7)" }}>{item}</span>
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
              <button key={n} onClick={()=>{ setMacros({...v,fiber:30}); setDiet(n); }} style={{ padding:"6px 11px", background:diet===n?"rgba(14,165,233,.2)":"rgba(255,255,255,.04)", border:`1px solid ${diet===n?"var(--a4)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:diet===n?"var(--a4)":"var(--mut)", cursor:"pointer", fontSize:"11px" }}>{n}</button>
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
          <Card style={{ padding:"18px", textAlign:"center", marginBottom:"10px", border:"1px solid rgba(14,165,233,.2)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:Math.min(100,water/3*100)+"%", background:"linear-gradient(180deg,rgba(14,165,233,.15),rgba(14,165,233,.03))", borderTop:"1px solid rgba(14,165,233,.25)", transition:"height .7s", pointerEvents:"none" }}/>
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:"40px", marginBottom:"4px" }}>💧</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"44px", color:"var(--acc)", lineHeight:1 }}>{water.toFixed(1)}</div>
              <p style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"6px" }}>of 3.0L goal</p>
              <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:water>=3?"var(--gr)":"var(--mut)" }}>{water>=3?"🎯 GOAL!":water>=1.5?"💪 HALFWAY":"🌊 KEEP GOING"}</div>
            </div>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"7px", marginBottom:"9px" }}>
            {[.25,.5,.75,1].map(a=><button key={a} onClick={()=>setWater(v=>clamp(v+a,0,4))} style={{ padding:"11px 6px", background:"rgba(14,165,233,.07)", border:"1px solid rgba(14,165,233,.18)", borderRadius:"9px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px" }}>+{a}L</button>)}
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
    return <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px", flexShrink:0, boxShadow:"0 2px 6px rgba(14,165,233,.35)" }}><img src={FAB_ICON} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"50%" }}/></div>;
  }

  return (
    <HeroBg src={IMG.workout} ov="rgba(10,10,10,.97)" style={{ position:"fixed", inset:0, zIndex:500, display:"flex", flexDirection:"column", maxWidth:"480px", margin:"0 auto", animation:"fadeIn .25s" }}>
      <div className="glass" style={{ padding:"12px 15px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
        <div style={{ width:"37px", height:"37px", borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", padding:"5px", boxShadow:"0 2px 8px rgba(14,165,233,.4)" }}><img src={FAB_ICON} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"50%" }}/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"3px", lineHeight:1 }}>AI COACH</div>
          <div style={{ fontSize:"10px", color:"var(--gr)", fontFamily:"var(--fm)", marginTop:"1px", display:"flex", alignItems:"center", gap:"5px" }}>
            <Dot col="var(--gr)"/>ONLINE · Fit2All
            {ctx && ctx.plan.limits.ai !== Infinity && <span style={{ padding:"1px 6px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>{ctx.aiLeft()}/2 TODAY</span>}
            {ctx && ctx.plan.limits.ai === Infinity && <span style={{ padding:"1px 6px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>⚡ PRO</span>}
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
                  ? <div style={{ padding:"10px 13px", background:"linear-gradient(135deg,rgba(14,165,233,.12),rgba(14,165,233,.06))", border:"1px solid rgba(14,165,233,.18)", borderRadius:"15px 15px 4px 15px", fontSize:"13px", lineHeight:1.6 }}>{msg.content}</div>
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
            <div style={{ marginTop:"8px", padding:"8px 11px", background:"rgba(2,132,199,.1)", border:"1px solid rgba(2,132,199,.25)", borderRadius:"8px", display:"flex", alignItems:"center", gap:"7px" }}>
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
          <Card key={pkg.id} style={{ padding:"14px", marginBottom:"9px", border:"1px solid rgba(14,165,233,.2)" }}>
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
        {[["profile","👤 Profile"],["program","💪 Program"],["photos","📸 Photos"],["packages","📦 Packages"]].map(([v,lbl])=>(
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
                <Card style={{ padding:"13px", marginBottom:"11px", border:"1px solid rgba(14,165,233,.25)" }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"4px" }}>{prog.programName}</div>
                  <div style={{ fontSize:"12px", color:"rgba(255,255,255,.55)", lineHeight:1.6, marginBottom:"10px" }}>{prog.overview}</div>
                  <div style={{ display:"flex", gap:"7px" }}>
                    <button onClick={()=>setShowProgramBuilder(true)} style={{ flex:1, padding:"9px", background:"rgba(255,112,67,.1)", border:"1px solid rgba(255,112,67,.25)", borderRadius:"9px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✏️ EDIT</button>
                    <button onClick={sendProgram} disabled={!client.email} style={{ flex:1, padding:"9px", background:client.email?"rgba(14,165,233,.15)":"rgba(255,255,255,.05)", border:`1px solid ${client.email?"rgba(14,165,233,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"9px", color:client.email?"var(--acc)":"var(--mut)", cursor:client.email?"pointer":"default", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>📧 SEND TO CLIENT</button>
                  </div>
                </Card>
                <ProgramView prog={prog} userEmail={user?.email}/>
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

        {/* ── PHOTOS VIEW ── */}
        {view==="photos" && (
          <div>
            <BeforeAfterPhotos storageKey={"photos_client_"+client.id}/>
            <div style={{ height:"1px", background:"rgba(255,255,255,.07)", margin:"20px 0" }}/>
            <ProgressTracker storageKey={"progress_client_"+client.id} user={{name:client.name,email:client.email||client.id}}/>
          </div>
        )}

        {/* ── PACKAGES VIEW ── */}
        {view==="packages" && (
          <div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"11px", color:"var(--acc)" }}>PACKAGES AVAILABLE TO {client.name.split(" ")[0].toUpperCase()}</div>
            {packages.length===0 ? (
              <Card style={{ padding:"20px", textAlign:"center" }}><Mono>No packages created yet. Add packages in your Profile tab.</Mono></Card>
            ) : packages.map(pkg=>(
              <Card key={pkg.id} style={{ padding:"14px", marginBottom:"9px", border:"1px solid rgba(14,165,233,.2)" }}>
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
    const cycler = setInterval(()=>setPhase(p=>(p+1)%phases.length),1400);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:2000,
          messages:[{role:"user",content:`Create a workout program. Return ONLY valid JSON.\nClient: ${client.name}, goal=${client.goal}, sex=${client.sex||"unknown"}, injuries=${client.injuries||"none"}.\nFormat: {"programName":"Name","overview":"1 sentence","methodology":"e.g. Full Body","weeklyStructure":"3x/week","week1":[{"day":"Monday","sessionName":"Full Body A","muscleGroups":["Full Body"],"duration":"60 min","intensity":"Moderate","warmup":"5 min","exercises":[{"name":"Squat","sets":"3","reps":"10","rest":"90s","rpe":"7","cues":"form tip","muscleTarget":"Quads"}],"cooldown":"5 min","sessionNotes":"note"}],"progressionProtocol":"overload plan","nutritionGuidance":{"preworkout":"tip","postworkout":"tip","dailyProtein":"1.8g/kg","hydration":"3L"},"recoveryProtocol":"8h sleep","weeklyGoals":["goal1"],"progressionMarkers":["marker1"]}\nInclude 3 days in week1. 4 exercises per day. Avoid: ${client.injuries||"none"}.`}]
        })
      });
      const d = await res.json();
      const raw = d.content?.[0]?.text||"";
      clearInterval(cycler);
      const parsed = JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim());
      setProg(buildPhases(parsed)); setMode("preview"); setGenLoading(false);
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
          <div style={{ padding:"2px 8px", background:s.status==="confirmed"?"rgba(2,132,199,.15)":s.status==="pending"?"rgba(255,140,0,.15)":"rgba(255,255,255,.08)", border:`1px solid ${s.status==="confirmed"?"rgba(2,132,199,.3)":s.status==="pending"?"rgba(255,140,0,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"50px", fontSize:"9px", fontFamily:"var(--fm)", color:s.status==="confirmed"?"var(--gr)":s.status==="pending"?"var(--yw)":"var(--mut)", letterSpacing:"1px", textTransform:"uppercase" }}>{s.status}</div>
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
            <button onClick={()=>{ setNewType("Group Class"); setShowNewClass(true); }} style={{ flex:1, padding:"11px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ CLASS</button>
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
            <button onClick={()=>{ setNewType("Group Class"); setShowNewClass(true); }} style={{ flex:1, padding:"11px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>+ CLASS</button>
          </div>
        </div>
      )}

      {/* ── BOOKING REQUESTS VIEW ── */}
      {calView==="requests" && (
        <div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"1px", marginBottom:"12px" }}>BOOKING REQUESTS</div>
          {requests.length===0 && <Card style={{ padding:"20px", textAlign:"center" }}><Mono>No requests yet</Mono></Card>}
          {requests.map((req,i)=>(
            <Card key={req.id} style={{ padding:"14px", marginBottom:"9px", border:`1px solid ${req.status==="pending"?"rgba(255,140,0,.2)":req.status==="approved"?"rgba(2,132,199,.2)":"rgba(255,61,107,.15)"}`, animation:`fadeUp .3s ease ${i*.06}s both` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:"14px", marginBottom:"2px" }}>{req.clientName}</div>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--acc)", letterSpacing:"1px" }}>{req.type}</div>
                </div>
                <div style={{ padding:"3px 9px", background:req.status==="pending"?"rgba(255,140,0,.15)":req.status==="approved"?"rgba(2,132,199,.15)":"rgba(255,61,107,.12)", border:`1px solid ${req.status==="pending"?"rgba(255,140,0,.3)":req.status==="approved"?"rgba(2,132,199,.3)":"rgba(255,61,107,.25)"}`, borderRadius:"50px", fontSize:"10px", fontFamily:"var(--fm)", color:req.status==="pending"?"var(--yw)":req.status==="approved"?"var(--gr)":"var(--a2)", letterSpacing:"1px", textTransform:"uppercase" }}>{req.status}</div>
              </div>
              <div style={{ fontSize:"12px", color:"var(--mut)", marginBottom:"4px" }}>Preferred: <span style={{ color:"var(--txt)" }}>{req.preferred}</span></div>
              {req.note && <div style={{ fontSize:"12px", color:"var(--mut)", fontStyle:"italic", marginBottom:"10px" }}>"{req.note}"</div>}
              {req.status==="pending" && (
                <div style={{ display:"flex", gap:"7px" }}>
                  <button onClick={()=>approveRequest(req.id)} style={{ flex:1, padding:"8px", background:"rgba(2,132,199,.15)", border:"1px solid rgba(2,132,199,.3)", borderRadius:"8px", color:"var(--gr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✓ APPROVE</button>
                  <button onClick={()=>declineRequest(req.id)} style={{ flex:1, padding:"8px", background:"rgba(255,61,107,.08)", border:"1px solid rgba(255,61,107,.2)", borderRadius:"8px", color:"var(--a2)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>✕ DECLINE</button>
                </div>
              )}
            </Card>
          ))}
          {/* Client booking link info */}
          <Card style={{ padding:"14px", marginTop:"10px", border:"1px solid rgba(14,165,233,.2)" }}>
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
                  <button key={t} onClick={()=>setNewType(t)} style={{ padding:"6px 12px", background:newType===t?(showNewClass?"rgba(14,165,233,.15)":"rgba(255,112,67,.15)"):"rgba(255,255,255,.04)", border:`1px solid ${newType===t?(showNewClass?"var(--acc)":"var(--tr)"):"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:newType===t?(showNewClass?"var(--acc)":"var(--tr)"):"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{t}</button>
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

function TrainerDashboard({ user, tab, setTab, onHome, onLogout }) {
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
  const [showExLib, setShowExLib] = useState(false);
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
          <div style={{ display:"flex", gap:"7px" }}>
            <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"50px", color:"rgba(255,255,255,.6)", cursor:"pointer", padding:"5px 12px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>CONTACT</button>
            <button onClick={onLogout} style={{ background:"rgba(255,31,31,.12)", border:"1px solid rgba(255,31,31,.3)", borderRadius:"50px", color:"var(--rd)", cursor:"pointer", padding:"5px 12px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>LOG OUT</button>
          </div>
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
            <button onClick={()=>setShowPackages(true)} style={{ width:"100%", padding:"11px", background:"rgba(14,165,233,.12)", border:"1px solid rgba(14,165,233,.25)", borderRadius:"10px", color:"var(--acc)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginBottom:"8px" }}>📦 MANAGE PACKAGES</button>
            <button onClick={()=>setShowExLib(true)} style={{ width:"100%", padding:"11px", background:"rgba(255,31,31,.12)", border:"1px solid rgba(255,31,31,.25)", borderRadius:"10px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>💪 EXERCISE LIBRARY</button>
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
      {showExLib && <ExerciseLibrary onClose={()=>setShowExLib(false)}/>}
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
                  <button key={t} onClick={()=>setType(t)} style={{ padding:"5px 11px", background:type===t?"rgba(2,132,199,.15)":"rgba(255,255,255,.04)", border:`1px solid ${type===t?"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:type===t?"var(--a3)":"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{t==="suggestion"?"💡":t==="bug"?"🐛":t==="feature"?"✨":"❤️"} {t}</button>
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
            <button onClick={()=>fileRef.current.click()} style={{ padding:"10px 14px", background:"rgba(14,165,233,.12)", border:"1px solid rgba(14,165,233,.3)", borderRadius:"9px", color:"var(--acc)", cursor:"pointer", fontSize:"13px", fontFamily:"var(--fd)", letterSpacing:"1px", textAlign:"left" }}>
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

      {/* Before & After */}
      <div style={{ marginBottom:"16px" }}>
        <BeforeAfterPhotos storageKey={"photos_"+user.email}/>
      </div>

      {/* Plan info */}
      <Card style={{ padding:"15px", marginBottom:"11px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"11px" }}>
          <div style={{ width:"46px", height:"46px", borderRadius:"50%", background:ctx.plan.color+"15", border:`1.5px solid ${ctx.plan.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{sub.id==="pro"?"⚡":"🎁"}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"17px", color:ctx.plan.color, letterSpacing:"2px" }}>{ctx.plan.name}</div>
            <Mono>{ctx.plan.price} {ctx.plan.period}</Mono>
          </div>
          {sub.id==="pro" && <div style={{ padding:"4px 9px", background:"rgba(14,165,233,.1)", border:"1px solid rgba(14,165,233,.25)", borderRadius:"7px", fontSize:"10px", color:"var(--acc)", fontFamily:"var(--fm)" }}>ACTIVE</div>}
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
      {/* Back button — same fixed position as all other screens */}
      <div style={{ position:"fixed", top:0, left:0, right:0, maxWidth:"480px", margin:"0 auto", zIndex:200, padding:"14px 18px", pointerEvents:"none" }}>
        <button onClick={()=>setStep(steps.length-1)} style={{ pointerEvents:"all", background:"rgba(10,10,10,.8)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"10px", color:"rgba(255,255,255,.85)", cursor:"pointer", padding:"8px 14px", fontSize:"12px", fontFamily:"var(--fm)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", letterSpacing:"1px" }}>← BACK</button>
      </div>
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
      {/* Back button — always visible, step 0 returns to splash via onBack prop */}
      <div style={{ position:"fixed", top:0, left:0, right:0, maxWidth:"480px", margin:"0 auto", zIndex:200, padding:"14px 18px", pointerEvents:"none" }}>
        <button onClick={()=>{ if(step>0) setStep(step-1); }} style={{ pointerEvents:"all", background:"rgba(10,10,10,.8)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"10px", color:"rgba(255,255,255,.85)", cursor:"pointer", padding:"8px 14px", fontSize:"12px", fontFamily:"var(--fm)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", letterSpacing:"1px" }}>← BACK</button>
      </div>
      <HeroBg src={cur.img} ov="linear-gradient(180deg,rgba(10,10,10,.05) 0%,rgba(10,10,10,.88) 55%,rgba(10,10,10,1) 100%)" style={{ height:"210px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px" }}>
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
                style={{ padding:"18px 18px", background:sel?"rgba(14,165,233,.14)":"rgba(255,255,255,.04)", border:`2px solid ${sel?"var(--acc)":"rgba(255,255,255,.1)"}`, borderRadius:"14px", color:sel?"var(--txt)":"rgba(255,255,255,.75)", cursor:"pointer", textAlign:"left", fontSize:"18px", fontFamily:"var(--fb)", fontWeight:sel?700:500, display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all .15s" }}>
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
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | done | error
  const [aiLabel, setAiLabel] = useState("✨ Enhance with AI");

  // Generate instantly from templates — zero wait
  useEffect(() => {
    const instant = advancedFallback(profile, user);
    // Small delay so user sees the "generating" transition
    setTimeout(() => onDone(instant), 400);
  }, []);

  // Optional background AI enhancement (not blocking)
  async function enhanceWithAI(baseProg) {
    setAiStatus("loading"); setAiLabel("Enhancing...");
    const goal = (profile.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim();
    const level = (profile.level||"").replace(/[🌱🌿💪🔥🏆]/g,"").trim();
    const days = parseInt(profile.days)||3;
    const equip = (profile.equipment||"").replace(/[🏠🏋️🌳🏊]/g,"").trim();
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:1200,
          messages:[{role:"user",content:`Fitness: goal=${goal}, level=${level}, ${days} days/week, equipment=${equip}. Return ONLY JSON with these fields only: {"programName":"string","overview":"string","methodology":"string","weeklyStructure":"string"}. Be specific to the goal.`}]
        })
      });
      const d = await res.json();
      const raw = d.content?.[0]?.text||"";
      const meta = JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim());
      setAiStatus("done"); setAiLabel("✅ AI Enhanced");
      return { ...baseProg, ...meta };
    } catch {
      setAiStatus("error"); setAiLabel("Try again");
      return baseProg;
    }
  }

  return (
    <HeroBg src={IMG.pro} ov="rgba(10,10,10,.94)" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"30px", textAlign:"center" }}>
      <div style={{ width:"56px", height:"56px", borderRadius:"50%", border:"3px solid var(--acc)", borderTopColor:"transparent", animation:"spin 1s linear infinite", marginBottom:"20px" }}/>
      <div style={{ fontFamily:"var(--fd)", fontSize:"24px", color:"var(--acc)", letterSpacing:"3px", marginBottom:"8px" }}>BUILDING YOUR PLAN</div>
      <Mono style={{ color:"var(--mut)", marginBottom:"6px" }}>Personalised to your goals</Mono>
      <Mono style={{ fontSize:"10px", color:"rgba(255,255,255,.3)" }}>Ready in seconds...</Mono>
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

// ─── Exercise Image: Live lookup via ExerciseDB API ───────────────────────────
const EDB_IMG_BASE = "https://exercisedb-api.vercel.app/api/v1";
const exImgCache = {};

function ExerciseImage({ name, style }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!name || tried) return;
    setTried(true);
    // Check cache first
    if (exImgCache[name]) { setImgSrc(exImgCache[name]); return; }
    // Search ExerciseDB for this exercise
    const query = encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9 ]/g,""));
    fetch(`${EDB_IMG_BASE}/exercises/search?name=${query}&limit=1`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.exercises || data.data || []);
        const ex = list[0];
        if (ex) {
          const url = ex.gifUrl || (ex.imageUrl ? (ex.imageUrl.startsWith("http") ? ex.imageUrl : `${EDB_IMG_BASE}/images/${ex.imageUrl}`) : null);
          if (url) { exImgCache[name] = url; setImgSrc(url); }
        }
      })
      .catch(() => {});
  }, [name]);

  // Fallback Unsplash image by muscle/keyword
  const fallback = (() => {
    const n = (name||"").toLowerCase();
    if (n.includes("squat")) return "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&q=60";
    if (n.includes("bench")||n.includes("press")) return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=60";
    if (n.includes("deadlift")) return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=60";
    if (n.includes("pull")||n.includes("row")) return "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60";
    if (n.includes("curl")||n.includes("bicep")) return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=60";
    if (n.includes("lunge")||n.includes("leg")) return "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=60";
    if (n.includes("plank")||n.includes("abs")||n.includes("crunch")) return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=60";
    if (n.includes("run")||n.includes("cardio")) return "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=60";
    return "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=60";
  })();

  return (
    <div style={{ height:"110px", borderRadius:"10px", overflow:"hidden", marginBottom:"9px", position:"relative", background:"rgba(255,255,255,.04)", ...style }}>
      <img
        src={imgSrc || fallback}
        alt={name}
        style={{ width:"100%", height:"100%", objectFit:"cover", filter:imgSrc?"brightness(.75)":"brightness(.6) saturate(.7)" }}
        onError={e=>{ e.target.src=fallback; }}
      />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 35%,rgba(8,8,16,.88) 100%)" }}/>
      <div style={{ position:"absolute", bottom:"8px", left:"10px", right:"10px" }}>
        <div style={{ fontSize:"13px", fontWeight:700, color:"#fff", letterSpacing:".5px" }}>{name}</div>
        {imgSrc && <div style={{ fontSize:"9px", color:"rgba(255,255,255,.45)", fontFamily:"var(--fm)", marginTop:"1px" }}>ExerciseDB</div>}
      </div>
    </div>
  );
}



// ─── Exercise Detail Modal with Weight Logging ───────────────────────────────
function ExerciseDetailModal({ exercise, userEmail, onClose }) {
  const key = "exlog_" + (userEmail||"user") + "_" + (exercise.name||"").replace(/\s+/g,"_").toLowerCase();
  const loadLogs = () => { try { return JSON.parse(localStorage.getItem(key)||"[]"); } catch { return []; } };
  const [logs, setLogs] = useState(loadLogs);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState(exercise.reps||"");
  const [sets, setSets] = useState(exercise.sets||"3");
  const [note, setNote] = useState("");
  const [view, setView] = useState("detail"); // detail | log | progress
  const [exData, setExData] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const FREE_EX_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
  const FREE_EX_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

  // Fetch exercise details from library
  useEffect(() => {
    fetch(FREE_EX_URL)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const q = (exercise.name||"").toLowerCase();
        const match = list.find(e => e.name.toLowerCase() === q) ||
                      list.find(e => q.includes(e.name.toLowerCase().split(" ")[0]) || e.name.toLowerCase().includes(q.split(" ")[0]));
        if (match) {
          setExData(match);
          if (match.images?.length) setImgSrc(FREE_EX_IMG + encodeURIComponent(match.id) + "/" + match.images[0]);
        }
      }).catch(()=>{});
  }, [exercise.name]);

  function saveLog() {
    if (!weight) return;
    const entry = {
      date: new Date().toISOString(),
      dateLabel: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
      weight: parseFloat(weight),
      reps: reps,
      sets: sets,
      note: note,
      volume: parseFloat(weight) * parseInt(sets||1) * parseInt(reps?.split("-")[0]||1),
    };
    const updated = [...logs, entry];
    setLogs(updated);
    try { localStorage.setItem(key, JSON.stringify(updated)); } catch {}
    setWeight(""); setNote(""); setView("progress");
  }

  // Group logs by week/month for chart
  const byDate = logs.slice(-12).map(l=>({ date:l.dateLabel, v:l.weight, vol:l.volume }));
  const maxW = byDate.length ? Math.max(...byDate.map(l=>l.v)) : 0;
  const minW = byDate.length ? Math.min(...byDate.map(l=>l.v)) : 0;
  const latestW = logs.length ? logs[logs.length-1].weight : null;
  const firstW = logs.length ? logs[0].weight : null;
  const pr = logs.length ? Math.max(...logs.map(l=>l.weight)) : null;

  const primaryMuscle = exData?.primaryMuscles?.[0] || exercise.muscleTarget?.split(".")?.[0] || "";
  const MCOLS = { chest:"#f87171",back:"#60a5fa",shoulders:"#c084fc",biceps:"#34d399",triceps:"#a3e635",quadriceps:"#fb923c",hamstrings:"#22d3ee",glutes:"#f472b6",abdominals:"#fbbf24",calves:"#4ade80" };
  const mcol = MCOLS[primaryMuscle] || "var(--acc)";

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:800, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px", background:"rgba(10,10,10,.98)", borderBottom:"1px solid rgba(255,255,255,.08)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"6px 13px", fontSize:"11px", fontFamily:"var(--fm)" }}>← BACK</button>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px", color:mcol }}>{exercise.name}</div>
            <Mono>{primaryMuscle || exercise.muscleTarget}</Mono>
          </div>
          {pr && <div style={{ textAlign:"right" }}><div style={{ fontFamily:"var(--fd)", fontSize:"18px", color:"var(--a3)" }}>{pr}kg</div><Mono style={{fontSize:"9px"}}>PB</Mono></div>}
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          {[["detail","📋 Details"],["log","⚖️ Log"],["progress","📈 Progress"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{ flex:1, padding:"7px", background:view===v?"var(--tr)":"rgba(255,255,255,.05)", border:`1px solid ${view===v?"var(--tr)":"rgba(255,255,255,.08)"}`, borderRadius:"8px", color:view===v?"#fff":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fb)", fontWeight:600 }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"14px 18px 40px" }}>

        {/* ── DETAIL VIEW ── */}
        {view==="detail" && (
          <div>
            {/* Image */}
            <div style={{ borderRadius:"14px", overflow:"hidden", marginBottom:"14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", height:"200px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {imgSrc
                ? <img src={imgSrc} alt={exercise.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ e.target.style.display="none"; }}/>
                : <div style={{ textAlign:"center" }}><div style={{ fontSize:"40px", marginBottom:"8px" }}>💪</div><Mono>Loading image...</Mono></div>
              }
            </div>

            {/* Workout prescription */}
            <Card style={{ padding:"14px", marginBottom:"12px", border:`1px solid ${mcol}25` }}>
              <Mono style={{ color:mcol, marginBottom:"10px" }}>PRESCRIPTION</Mono>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"10px" }}>
                {[{l:"Sets",v:exercise.sets},{l:"Reps",v:exercise.reps},{l:"Rest",v:exercise.rest},{l:"Tempo",v:exercise.tempo},{l:"RPE",v:exercise.rpe}].filter(x=>x.v).map(x=>(
                  <div key={x.l} style={{ textAlign:"center", padding:"8px 4px", background:"rgba(255,255,255,.04)", borderRadius:"8px" }}>
                    <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:mcol, lineHeight:1 }}>{x.v}</div>
                    <Mono style={{ fontSize:"9px", marginTop:"3px" }}>{x.l}</Mono>
                  </div>
                ))}
              </div>
              {exercise.cues && (
                <div style={{ padding:"9px 11px", background:"rgba(14,165,233,.06)", border:"1px solid rgba(14,165,233,.15)", borderRadius:"9px", marginBottom:"8px" }}>
                  <Mono style={{ color:"var(--acc)", marginBottom:"4px" }}>TECHNIQUE CUES</Mono>
                  <div style={{ fontSize:"14px", color:"rgba(255,255,255,.8)", lineHeight:1.7 }}>{exercise.cues}</div>
                </div>
              )}
              {exercise.progression && <div style={{ fontSize:"12px", color:"var(--a3)", lineHeight:1.6 }}>📈 {exercise.progression}</div>}
            </Card>

            {/* From exercise library */}
            {exData && (
              <Card style={{ padding:"14px", marginBottom:"12px" }}>
                <Mono style={{ marginBottom:"10px", color:"var(--acc)" }}>MUSCLES WORKED</Mono>
                {exData.primaryMuscles?.length > 0 && (
                  <div style={{ marginBottom:"8px" }}>
                    <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"5px" }}>PRIMARY</div>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                      {exData.primaryMuscles.map(m=><div key={m} style={{ padding:"4px 11px", background:mcol+"20", border:`1px solid ${mcol}40`, borderRadius:"50px", fontSize:"12px", color:mcol, fontWeight:600 }}>{m}</div>)}
                    </div>
                  </div>
                )}
                {exData.secondaryMuscles?.length > 0 && (
                  <div style={{ marginBottom:"10px" }}>
                    <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"5px" }}>SECONDARY</div>
                    <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                      {exData.secondaryMuscles.slice(0,4).map(m=><div key={m} style={{ padding:"3px 9px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"50px", fontSize:"11px", color:"var(--mut)" }}>{m}</div>)}
                    </div>
                  </div>
                )}
                {exData.instructions?.length > 0 && (
                  <>
                    <Mono style={{ marginBottom:"8px", color:"var(--acc)" }}>HOW TO PERFORM</Mono>
                    {exData.instructions.slice(0,4).map((step,i)=>(
                      <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"8px", paddingBottom:"8px", borderBottom:i<Math.min(3,exData.instructions.length-1)?"1px solid rgba(255,255,255,.05)":"none" }}>
                        <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"var(--tr)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"10px", color:"#fff", flexShrink:0 }}>{i+1}</div>
                        <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", lineHeight:1.65, flex:1 }}>{step}</div>
                      </div>
                    ))}
                  </>
                )}
              </Card>
            )}

            <button onClick={()=>setView("log")} style={{ width:"100%", padding:"14px", background:"var(--tr)", border:"none", borderRadius:"var(--r)", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px" }}>⚖️ LOG THIS WORKOUT</button>
          </div>
        )}

        {/* ── LOG VIEW ── */}
        {view==="log" && (
          <div>
            <Card style={{ padding:"15px", marginBottom:"12px", border:"1px solid rgba(255,31,31,.2)" }}>
              <Mono style={{ color:"var(--tr)", marginBottom:"12px" }}>LOG WORKOUT — {new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</Mono>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"9px", marginBottom:"12px" }}>
                <div>
                  <Mono style={{ marginBottom:"6px" }}>WEIGHT (kg)</Mono>
                  <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="60" inputMode="decimal"
                    style={{ width:"100%", padding:"11px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,31,31,.3)", borderRadius:"9px", color:"var(--txt)", fontSize:"18px", fontFamily:"var(--fd)", outline:"none", textAlign:"center", letterSpacing:"1px" }}/>
                </div>
                <div>
                  <Mono style={{ marginBottom:"6px" }}>SETS</Mono>
                  <input type="number" value={sets} onChange={e=>setSets(e.target.value)} placeholder="3" inputMode="numeric"
                    style={{ width:"100%", padding:"11px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"9px", color:"var(--txt)", fontSize:"18px", fontFamily:"var(--fd)", outline:"none", textAlign:"center" }}/>
                </div>
                <div>
                  <Mono style={{ marginBottom:"6px" }}>REPS</Mono>
                  <input type="text" value={reps} onChange={e=>setReps(e.target.value)} placeholder="10"
                    style={{ width:"100%", padding:"11px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"9px", color:"var(--txt)", fontSize:"18px", fontFamily:"var(--fd)", outline:"none", textAlign:"center" }}/>
                </div>
              </div>
              <Field lbl="NOTE (optional)" val={note} set={setNote} ph="How it felt, form notes..." acc="var(--tr)"/>
              <PBtn onClick={saveLog} disabled={!weight} col="var(--tr)" style={{ marginTop:"12px", color:"#fff" }}>SAVE SESSION</PBtn>
            </Card>

            {/* Recent logs */}
            {logs.length > 0 && (
              <div>
                <Mono style={{ marginBottom:"9px" }}>RECENT SESSIONS</Mono>
                {logs.slice().reverse().slice(0,5).map((l,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"10px", marginBottom:"7px" }}>
                    <div>
                      <div style={{ fontFamily:"var(--fm)", fontSize:"11px", color:"var(--mut)", marginBottom:"2px" }}>{l.dateLabel}</div>
                      <div style={{ fontSize:"13px", fontWeight:600 }}>{l.weight}kg × {l.sets} sets × {l.reps} reps</div>
                      {l.note && <div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"2px" }}>{l.note}</div>}
                    </div>
                    <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--a3)" }}>{l.volume ? Math.round(l.volume)+"kg" : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS VIEW ── */}
        {view==="progress" && (
          <div>
            {logs.length === 0 ? (
              <Card style={{ padding:"30px", textAlign:"center" }}>
                <div style={{ fontSize:"40px", marginBottom:"12px" }}>📈</div>
                <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"1px", marginBottom:"8px" }}>NO DATA YET</div>
                <div style={{ fontSize:"13px", color:"var(--mut)", marginBottom:"18px", lineHeight:1.6 }}>Log your first session to start tracking progress.</div>
                <PBtn onClick={()=>setView("log")} col="var(--tr)" style={{ color:"#fff" }}>⚖️ LOG FIRST SESSION</PBtn>
              </Card>
            ) : (
              <div>
                {/* Summary cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"14px" }}>
                  {[
                    {l:"Sessions",v:logs.length,c:"var(--acc)"},
                    {l:"Personal Best",v:pr+"kg",c:"var(--a3)"},
                    {l:"Progress",v:firstW&&latestW?(latestW-firstW>0?"+":"")+(latestW-firstW).toFixed(1)+"kg":"—",c:firstW&&latestW&&latestW>firstW?"var(--a3)":"var(--rd)"},
                  ].map(s=>(
                    <Card key={s.l} style={{ padding:"11px", textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:s.c, lineHeight:1 }}>{s.v}</div>
                      <Mono style={{ fontSize:"9px", marginTop:"3px" }}>{s.l}</Mono>
                    </Card>
                  ))}
                </div>

                {/* Weight chart */}
                {byDate.length >= 2 && (
                  <Card style={{ padding:"14px", marginBottom:"12px" }}>
                    <Mono style={{ marginBottom:"12px", color:"var(--tr)" }}>WEIGHT OVER TIME</Mono>
                    <div style={{ position:"relative", height:"80px", marginBottom:"8px" }}>
                      <svg width="100%" height="80" viewBox={`0 0 ${Math.max(byDate.length*50,200)} 80`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--tr)" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="var(--tr)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {byDate.length >= 2 && (() => {
                          const W = Math.max(byDate.length*50,200), H = 80;
                          const range = maxW - minW || 1;
                          const xs = byDate.map((_,i)=>(i/(byDate.length-1))*W);
                          const ys = byDate.map(d=>H - ((d.v-minW)/range)*(H-10) - 5);
                          const pathD = xs.map((x,i)=>(i===0?"M":"L")+x.toFixed(0)+","+ys[i].toFixed(0)).join(" ");
                          const areaD = pathD+" L"+W+","+H+" L0,"+H+" Z";
                          return (
                            <>
                              <path d={areaD} fill="url(#wg)"/>
                              <path d={pathD} stroke="var(--tr)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              {xs.map((x,i)=><circle key={i} cx={x} cy={ys[i]} r="4" fill="var(--tr)" stroke="var(--bg)" strokeWidth="2"/>)}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      {byDate.slice(0,6).map((d,i)=><Mono key={i} style={{ fontSize:"8px", textAlign:"center" }}>{d.date.split(" ").slice(0,2).join(" ")}</Mono>)}
                    </div>
                  </Card>
                )}

                {/* Full session history */}
                <Mono style={{ marginBottom:"9px" }}>ALL SESSIONS ({logs.length})</Mono>
                {logs.slice().reverse().map((l,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 12px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"9px", marginBottom:"6px" }}>
                    <div>
                      <Mono style={{ marginBottom:"2px" }}>{l.dateLabel}</Mono>
                      <div style={{ fontSize:"14px", fontWeight:600 }}>{l.weight}kg × {l.sets} × {l.reps}</div>
                      {l.note && <div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"1px" }}>{l.note}</div>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"var(--fd)", fontSize:"15px", color:"var(--a3)" }}>{Math.round(l.volume||0)}</div>
                      <Mono style={{ fontSize:"9px" }}>vol kg</Mono>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function ProgramView({ prog, userEmail }) {
  const [activeWeek, setActiveWeek] = useState(0);
  const [expDay, setExpDay] = useState(0);
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedEx, setSelectedEx] = useState(null);

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
      {/* Exercise detail modal */}
      {selectedEx && <ExerciseDetailModal exercise={selectedEx} userEmail={userEmail} onClose={()=>setSelectedEx(null)}/>}
      {/* Program header card */}
      <Card style={{ padding:"16px", marginBottom:"12px", border:"1px solid rgba(14,165,233,.15)" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"8px" }}>{prog.programName}</div>
        <p style={{ fontSize:"15px", lineHeight:1.8, color:"rgba(255,255,255,.75)", marginBottom:"10px" }}>{prog.overview}</p>
        {prog.methodology && (
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            <div style={{ padding:"4px 10px", background:"rgba(14,165,233,.12)", border:"1px solid rgba(14,165,233,.25)", borderRadius:"50px", fontSize:"11px", color:"var(--a4)", fontFamily:"var(--fm)" }}>⚡ {prog.methodology}</div>
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
                <button key={i} onClick={()=>{ setActiveWeek(i); setExpDay(0); }} style={{ flexShrink:0, padding:"8px 14px", background:activeWeek===i?"rgba(14,165,233,.12)":"rgba(255,255,255,.03)", border:`1px solid ${activeWeek===i?"var(--acc)":"rgba(255,255,255,.06)"}`, borderRadius:"10px", cursor:"pointer", textAlign:"left", minWidth:"100px" }}>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:activeWeek===i?"var(--acc)":"var(--mut)", letterSpacing:"1px", marginBottom:"2px" }}>WEEK {w.week}</div>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"11px", color:activeWeek===i?"var(--acc)":"var(--txt)", letterSpacing:"1px" }}>{w.theme}</div>
                </button>
              ))}
            </div>
          )}

          {/* Week focus */}
          {currentWeek.focus && (
            <div style={{ padding:"10px 13px", background:"rgba(14,165,233,.05)", border:"1px solid rgba(14,165,233,.12)", borderRadius:"10px", marginBottom:"12px", fontSize:"12px", color:"rgba(255,255,255,.6)", lineHeight:1.6 }}>
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
                    <div style={{ padding:"10px 14px", background:"rgba(2,132,199,.05)", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                      <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--a3)", letterSpacing:"1px", marginBottom:"3px" }}>🔥 WARM-UP</div>
                      <div style={{ fontSize:"14px", color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>{day.warmup}</div>
                    </div>
                  )}

                  {/* Exercises */}
                  <div style={{ padding:"0 14px" }}>
                    {(day.exercises || []).map((ex, j) => (
                      <div key={j} onClick={()=>setSelectedEx(ex)} style={{ padding:"12px 0", borderBottom:j<(day.exercises.length-1)?"1px solid rgba(255,255,255,.04)":"none", cursor:"pointer", position:"relative" }}>
                        <div style={{ position:"absolute", top:"12px", right:"0", fontSize:"10px", color:"var(--mut)", fontFamily:"var(--fm)" }}>TAP FOR DETAIL →</div>
                        {/* Exercise image — live from ExerciseDB */}
                        <ExerciseImage name={ex.name}/>
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
                          <div style={{ padding:"7px 10px", background:"rgba(14,165,233,.05)", border:"1px solid rgba(14,165,233,.1)", borderRadius:"7px", marginBottom:"4px" }}>
                            <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"2px" }}>TECHNIQUE CUES</div>
                            <div style={{ fontSize:"16px", color:"rgba(255,255,255,.88)", lineHeight:1.7 }}>{ex.cues}</div>
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
                    <div style={{ padding:"10px 14px", background:"rgba(14,165,233,.05)", borderTop:"1px solid rgba(255,255,255,.04)" }}>
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
                  {/* Complete workout button */}
                  <CompleteWorkoutBtn dayKey={(currentWeek?.week||1)+"-"+i} userEmail={userEmail}/>
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
            <Card style={{ padding:"14px", border:"1px solid rgba(14,165,233,.2)" }}>
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
            <Card style={{ padding:"14px", marginBottom:"12px", border:"1px solid rgba(14,165,233,.15)" }}>
              <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"10px" }}>📈 OVERLOAD PROTOCOL</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)", lineHeight:1.8 }}>{prog.progressionProtocol}</div>
            </Card>
          )}
          {weeks.length > 1 && (
            <div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"9px" }}>WEEKLY PROGRESSION MAP</div>
              {weeks.map((w, i) => (
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"10px", alignItems:"flex-start" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:i===3?"rgba(14,165,233,.2)":i===2?"rgba(255,61,107,.2)":"rgba(14,165,233,.12)", border:`1px solid ${i===3?"var(--a4)":i===2?"var(--a2)":"var(--acc)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"12px", color:i===3?"var(--a4)":i===2?"var(--a2)":"var(--acc)", flexShrink:0 }}>{w.week}</div>
                  <Card style={{ flex:1, padding:"11px 13px", border:`1px solid ${i===3?"rgba(14,165,233,.15)":i===2?"rgba(255,61,107,.15)":"rgba(255,255,255,.06)"}` }}>
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
                <Card key={i} style={{ padding:"12px 14px", marginBottom:"7px", display:"flex", alignItems:"flex-start", gap:"10px", border:"1px solid rgba(14,165,233,.1)" }}>
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
                <Card key={i} style={{ padding:"12px 14px", marginBottom:"7px", display:"flex", alignItems:"flex-start", gap:"10px", border:"1px solid rgba(2,132,199,.12)" }}>
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
  const [showLib, setShowLib] = useState(false);
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
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"11px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px" }}>🎥 EXERCISE Q&A</div>
        <button onClick={()=>setShowLib(true)} style={{ padding:"6px 12px", background:"rgba(255,31,31,.12)", border:"1px solid rgba(255,31,31,.25)", borderRadius:"8px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>💪 EXERCISES</button>
      </div>
      {showLib && <ExerciseLibrary onClose={()=>setShowLib(false)}/>}
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
        <Card key={pkg.id} style={{ padding:"15px", marginBottom:"10px", border:"1px solid rgba(14,165,233,.2)" }}>
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


// ─── Complete Workout Button ───────────────────────────────────────────────────
function CompleteWorkoutBtn({ dayKey, userEmail }) {
  const storageKey = "completed_workouts_" + (userEmail||"user");
  const load = () => { try { return JSON.parse(localStorage.getItem(storageKey)||"{}"); } catch { return {}; } };
  const [done, setDone] = useState(() => !!load()[dayKey]);
  const [popped, setPopped] = useState(false);

  function toggle() {
    const current = load();
    if (done) {
      delete current[dayKey];
    } else {
      const today = new Date();
      current[dayKey] = {
        date: today.toISOString(),
        dateLabel: today.toLocaleDateString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit"}),
        dayKey,
      };
      setPopped(true);
      setTimeout(()=>setPopped(false), 1500);
    }
    try { localStorage.setItem(storageKey, JSON.stringify(current)); } catch {}
    setDone(!done);
  }

  return (
    <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,.06)", background:"rgba(255,255,255,.02)" }}>
      <button onClick={toggle} style={{ width:"100%", padding:"13px", background:done?"rgba(34,197,94,.12)":"var(--tr)", border:done?"2px solid rgba(34,197,94,.4)":"none", borderRadius:"12px", color:done?"#22c55e":"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"2px", transition:"all .3s", position:"relative", overflow:"hidden" }}>
        {done ? "✅ WORKOUT COMPLETED" : "💪 MARK AS COMPLETE"}
      </button>
      {popped && (
        <div style={{ textAlign:"center", marginTop:"8px", animation:"pop .4s ease" }}>
          <span style={{ fontSize:"28px" }}>🎉</span>
          <div style={{ fontFamily:"var(--fd)", fontSize:"12px", color:"#22c55e", letterSpacing:"1px", marginTop:"3px" }}>GREAT WORK!</div>
        </div>
      )}
    </div>
  );
}

// ─── Workout Calendar View ─────────────────────────────────────────────────────
function WorkoutCalendar({ userEmail }) {
  const storageKey = "completed_workouts_" + (userEmail||"user");
  const load = () => { try { return JSON.parse(localStorage.getItem(storageKey)||"{}"); } catch { return {}; } };
  const [completed, setCompleted] = useState(load);

  // Reload on focus
  useEffect(() => {
    const refresh = () => setCompleted(load());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("en-GB",{month:"long",year:"numeric"});
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();

  // Build set of completed date strings "dd/mm/yyyy"
  const completedDates = new Set(
    Object.values(completed).map(c => c.dateLabel).filter(Boolean)
  );

  function fmt(d) {
    return String(d).padStart(2,"0") + "/" + String(viewMonth+1).padStart(2,"0") + "/" + viewYear;
  }

  const totalDone = Object.keys(completed).length;
  const thisMonthDone = Object.values(completed).filter(c=>c.dateLabel&&c.dateLabel.endsWith("/"+String(viewMonth+1).padStart(2,"0")+"/"+viewYear)).length;

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px" }}>🗓 WORKOUT CALENDAR</div>
        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
          <button onClick={()=>{ let m=viewMonth-1; let y=viewYear; if(m<0){m=11;y--;} setViewMonth(m); setViewYear(y); }} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"8px", color:"var(--txt)", cursor:"pointer", padding:"5px 10px", fontSize:"14px" }}>‹</button>
          <button onClick={()=>{ let m=viewMonth+1; let y=viewYear; if(m>11){m=0;y++;} setViewMonth(m); setViewYear(y); }} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"8px", color:"var(--txt)", cursor:"pointer", padding:"5px 10px", fontSize:"14px" }}>›</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px", marginBottom:"14px" }}>
        <Card style={{ padding:"13px", textAlign:"center" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"28px", color:"#22c55e", lineHeight:1 }}>{thisMonthDone}</div>
          <Mono style={{ marginTop:"4px" }}>This month</Mono>
        </Card>
        <Card style={{ padding:"13px", textAlign:"center" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"28px", color:"var(--acc)", lineHeight:1 }}>{totalDone}</div>
          <Mono style={{ marginTop:"4px" }}>All time</Mono>
        </Card>
      </div>

      {/* Month calendar */}
      <Card style={{ padding:"14px", marginBottom:"14px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", textAlign:"center", marginBottom:"12px", color:"var(--acc)" }}>{monthName.toUpperCase()}</div>

        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:"6px" }}>
          {["S","M","T","W","T","F","S"].map((d,i)=>(
            <div key={i} style={{ textAlign:"center", fontFamily:"var(--fm)", fontSize:"10px", color:"var(--mut)", padding:"3px 0" }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"3px" }}>
          {/* Empty cells for first week offset */}
          {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
          {/* Day cells */}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const day = i + 1;
            const dateStr = fmt(day);
            const isCompleted = completedDates.has(dateStr);
            const isToday = day===now.getDate() && viewMonth===now.getMonth() && viewYear===now.getFullYear();
            const isPast = new Date(viewYear, viewMonth, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return (
              <div key={day} style={{
                aspectRatio:"1",
                borderRadius:"8px",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: isCompleted ? "rgba(34,197,94,.2)" : isToday ? "rgba(14,165,233,.15)" : "transparent",
                border: isCompleted ? "1.5px solid rgba(34,197,94,.5)" : isToday ? "1.5px solid var(--acc)" : "1px solid rgba(255,255,255,.05)",
                position:"relative",
              }}>
                <span style={{ fontFamily:"var(--fb)", fontSize:"12px", fontWeight:isToday||isCompleted?700:400, color: isCompleted ? "#22c55e" : isToday ? "var(--acc)" : isPast ? "rgba(255,255,255,.4)" : "var(--txt)" }}>{day}</span>
                {isCompleted && <div style={{ position:"absolute", bottom:"2px", left:"50%", transform:"translateX(-50%)", width:"4px", height:"4px", borderRadius:"50%", background:"#22c55e" }}/>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div style={{ display:"flex", gap:"16px", justifyContent:"center", marginBottom:"14px" }}>
        {[["#22c55e","Completed"],["var(--acc)","Today"]].map(([c,l])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{ width:"12px", height:"12px", borderRadius:"3px", background:c+"30", border:`1.5px solid ${c}` }}/>
            <Mono style={{ fontSize:"10px" }}>{l}</Mono>
          </div>
        ))}
      </div>

      {/* Recent completions */}
      {Object.keys(completed).length > 0 && (
        <div>
          <Mono style={{ marginBottom:"9px" }}>COMPLETED SESSIONS ({Object.keys(completed).length})</Mono>
          {Object.values(completed).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10).map((c,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.15)", borderRadius:"10px", marginBottom:"7px" }}>
              <span style={{ fontSize:"16px" }}>✅</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"13px", fontWeight:600 }}>Session completed</div>
                <Mono style={{ marginTop:"2px" }}>{c.dateLabel}</Mono>
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(completed).length === 0 && (
        <Card style={{ padding:"24px", textAlign:"center" }}>
          <div style={{ fontSize:"36px", marginBottom:"10px" }}>🏋️</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px", marginBottom:"8px" }}>NO WORKOUTS YET</div>
          <div style={{ fontSize:"13px", color:"var(--mut)", lineHeight:1.6 }}>Complete your first workout to see it appear here in green.</div>
        </Card>
      )}
    </div>
  );
}


function MemberExLibBtn() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={()=>setShow(true)} style={{ width:"100%", padding:"13px", background:"rgba(255,31,31,.08)", border:"1px solid rgba(255,31,31,.2)", borderRadius:"12px", color:"var(--tr)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", marginTop:"14px" }}>
        💪 EXERCISE LIBRARY
      </button>
      {show && <ExerciseLibrary onClose={()=>setShow(false)}/>}
    </>
  );
}

// ─── Member Dashboard ──────────────────────────────────────────────────────────
function MemberDashboard({ user, tab, setTab, sub, ctx, onUpgrade, onHome, onLogout }) {
  const [showGen, setShowGen] = useState(false);
  // Restore profile and program from localStorage for returning members
  const [profile, setProfile] = useState(() => loadProfile(user.email));
  const [prog, setProg] = useState(() => loadProg(user.email));
  const [showContact, setShowContact] = useState(false);
  const [showBioAgeTest, setShowBioAgeTest] = useState(false);
  const bioAgeDone = (() => { try { return !!localStorage.getItem("bioage_done_"+user.email); } catch { return false; } })();

  // Trainer client: skip profile setup, use trainer-assigned program
  if (user.isTrainerClient) {
    // Show a limited view - no profile setup needed
  } else {
    if (!profile) return <ProfileSetup onDone={p=>{ setProfile(p); saveProfile(user.email, p); setShowGen(true); }} user={user}/>;
    if (showGen && !prog) return <GenProg profile={profile} user={user} onDone={p=>{ setProg(p); saveProg(user.email, p); setShowGen(false); setTab("program"); }}/>;
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
          <div style={{ display:"flex", gap:"7px" }}>
            <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"50px", color:"rgba(255,255,255,.6)", cursor:"pointer", padding:"5px 12px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>CONTACT</button>
            <button onClick={onLogout} style={{ background:"rgba(255,31,31,.12)", border:"1px solid rgba(255,31,31,.3)", borderRadius:"50px", color:"var(--rd)", cursor:"pointer", padding:"5px 12px", fontSize:"10px", fontFamily:"var(--fm)", letterSpacing:"1px" }}>LOG OUT</button>
          </div>
        </div>
        {/* User info row */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 18px 16px", display:"flex", alignItems:"flex-end", gap:"12px" }}>
          <div style={{ width:"64px", height:"64px", borderRadius:"50%", overflow:"hidden", border:"2.5px solid rgba(14,165,233,.5)", flexShrink:0, boxShadow:"0 4px 16px rgba(14,165,233,.2)" }}>
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80" alt="Member" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          <div style={{ flex:1, paddingBottom:"2px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px", lineHeight:1, color:"var(--txt)" }}>HEY, {user.name.split(" ")[0].toUpperCase()}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"5px" }}>
              <div style={{ padding:"2px 9px", background:sub?.id==="pro"?"rgba(14,165,233,.15)":"rgba(2,132,199,.12)", border:`1px solid ${sub?.id==="pro"?"rgba(14,165,233,.3)":"rgba(2,132,199,.3)"}`, borderRadius:"50px", fontSize:"10px", fontFamily:"var(--fm)", color:sub?.id==="pro"?"var(--acc)":"var(--a3)", letterSpacing:"1px" }}>
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
        <div onClick={()=>onUpgrade("trial_expired")} style={{ margin:"0 18px 11px", padding:"9px 13px", background:ctx.daysLeft()<=7?"rgba(255,61,107,.07)":"rgba(14,165,233,.05)", border:`1px solid ${ctx.daysLeft()<=7?"rgba(255,61,107,.25)":"rgba(14,165,233,.18)"}`, borderRadius:"12px", cursor:"pointer", display:sub.id==="free"?"block":"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}><Mono style={{ color:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)" }}>{ctx.daysLeft()<=7?"⚠️ TRIAL ENDING":"🎁 FREE TRIAL"}</Mono><Mono>{ctx.daysLeft()}d left</Mono></div>
          <div style={{ height:"3px", background:"rgba(255,255,255,.08)", borderRadius:"2px", overflow:"hidden" }}><div style={{ height:"100%", width:Math.min(100,(30-ctx.daysLeft())/30*100)+"%", background:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)", transition:"width .5s" }}/></div>
          <div style={{ marginTop:"4px", fontSize:"11px", color:ctx.daysLeft()<=7?"var(--a2)":"var(--a3)", textDecoration:"underline" }}>Upgrade to Pro →</div>
        </div>
      )}
      {/* Bio Age reminder banner */}
      {!bioAgeDone && (
        <div onClick={()=>setShowBioAgeTest(true)} style={{ margin:"0 18px 11px", padding:"11px 13px", background:"rgba(139,92,246,.08)", border:"1px solid rgba(139,92,246,.3)", borderRadius:"12px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"22px" }}>🧬</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", color:"#a78bfa", marginBottom:"2px" }}>DISCOVER YOUR FITNESS AGE</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,.5)" }}>Take the 3-minute Bio Age test to personalise your plan →</div>
          </div>
        </div>
      )}
      <div style={{ padding:"0 18px" }}>
        {tab==="program" && prog && (
          <div>
            <ProgramView prog={prog} userEmail={user.email}/>
            <MemberExLibBtn/>
          </div>
        )}
        {tab==="nutrition" && <NutritionHub/>}
        {tab==="wearables" && <WearablesHub/>}
        {tab==="exercises" && (
          <ExerciseQA/>
        )}
        {tab==="packages" && (
          <MemberPackages user={user}/>
        )}
        {tab==="calendar" && (
          <WorkoutCalendar userEmail={user.email}/>
        )}
        {tab==="calendar" && (
          <WorkoutCalendar userEmail={user.email}/>
        )}
        {tab==="stats" && (
          <div style={{ animation:"fadeIn .4s" }}>
            {/* Quick stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"9px", marginBottom:"20px" }}>
              {[["🏋️","0","sessions","var(--acc)","Workouts Done"],["🔥","0","kcal","var(--rd)","Calories Burned"],["⚡","0","days","var(--a3)","Current Streak"],["📅","1","of 4","var(--tr)","Program Week"]].map(([i,v,u,c,l])=>(
                <Card key={l} style={{ padding:"15px" }}><div style={{ fontSize:"21px", marginBottom:"5px" }}>{i}</div><div style={{ fontFamily:"var(--fd)", fontSize:"28px", color:c }}>{v}</div><div style={{ fontSize:"10px", color:"var(--mut)" }}>{u}</div><div style={{ fontSize:"11px", color:"var(--txt)", marginTop:"2px" }}>{l}</div></Card>
              ))}
            </div>
            {/* Progress tracker with charts */}
            <ProgressTracker storageKey={"progress_"+user.email} user={user}/>
            <div style={{ height:"1px", background:"rgba(255,255,255,.07)", margin:"20px 0" }}/>
            {/* Before & After photos */}
            <BeforeAfterPhotos storageKey={"photos_"+user.email}/>
          </div>
        )}
        {tab==="account" && sub && ctx && (
          <AccountTab sub={sub} ctx={ctx} user={user} onUpgrade={onUpgrade}/>
        )}
      </div>
      {showContact && <ContactModal onClose={()=>setShowContact(false)}/>}
      {showBioAgeTest && (
        <div style={{ position:"fixed", inset:0, zIndex:600, overflowY:"auto", background:"var(--bg)" }}>
          <BioAgeTest user={user} onComplete={result=>{
            try { localStorage.setItem("bioage_done_"+user.email,"1"); } catch {}
            setShowBioAgeTest(false);
          }}/>
        </div>
      )}
    </div>
  );
}


// ─── Before & After Photos ─────────────────────────────────────────────────────
function BeforeAfterPhotos({ storageKey }) {
  const load = () => { try { return JSON.parse(localStorage.getItem(storageKey)||"{}"); } catch { return {}; } };
  const [photos, setPhotos] = useState(load);
  const beforeRef = useRef(); const afterRef = useRef();
  const beforeCamRef = useRef(); const afterCamRef = useRef();

  function handlePhoto(slot, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const updated = { ...photos, [slot]:ev.target.result, [slot+"Date"]: new Date().toLocaleDateString() };
      setPhotos(updated);
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto(slot) {
    const updated = { ...photos };
    delete updated[slot]; delete updated[slot+"Date"];
    setPhotos(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  }

  const PhotoSlot = ({ slot, label, weeks, libRef, camRef }) => (
    <div style={{ flex:1 }}>
      <div style={{ marginBottom:"7px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Mono style={{ color:"var(--tr)", letterSpacing:"1px" }}>{label}</Mono>
        {photos[slot] && <button onClick={()=>clearPhoto(slot)} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"11px" }}>✕ Remove</button>}
      </div>
      {photos[slot] ? (
        <div style={{ position:"relative", aspectRatio:"3/4", borderRadius:"12px", overflow:"hidden", border:"2px solid var(--tr)" }}>
          <img src={photos[slot]} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px", background:"linear-gradient(transparent,rgba(0,0,0,.7))" }}>
            <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"rgba(255,255,255,.7)", textAlign:"center" }}>{photos[slot+"Date"]}</div>
          </div>
          <div style={{ position:"absolute", top:"8px", right:"8px", display:"flex", gap:"5px" }}>
            <button onClick={()=>libRef.current.click()} style={{ padding:"5px 8px", background:"rgba(0,0,0,.6)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"6px", color:"#fff", cursor:"pointer", fontSize:"10px" }}>📁</button>
            <button onClick={()=>camRef.current.click()} style={{ padding:"5px 8px", background:"rgba(0,0,0,.6)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"6px", color:"#fff", cursor:"pointer", fontSize:"10px" }}>📷</button>
          </div>
        </div>
      ) : (
        <div style={{ aspectRatio:"3/4", borderRadius:"12px", border:"2px dashed rgba(255,255,255,.15)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px", background:"rgba(255,255,255,.03)" }}>
          <div style={{ fontSize:"32px", opacity:.4 }}>📷</div>
          <Mono style={{ textAlign:"center", fontSize:"9px" }}>{weeks}</Mono>
          <div style={{ display:"flex", gap:"6px" }}>
            <button onClick={()=>libRef.current.click()} style={{ padding:"7px 12px", background:"var(--tr)", border:"none", borderRadius:"8px", color:"#fff", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fd)", letterSpacing:"1px" }}>LIBRARY</button>
            <button onClick={()=>camRef.current.click()} style={{ padding:"7px 12px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"8px", color:"var(--txt)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fd)", letterSpacing:"1px" }}>CAMERA</button>
          </div>
        </div>
      )}
      <input ref={libRef} type="file" accept="image/*" onChange={e=>handlePhoto(slot,e)} style={{ display:"none" }}/>
      <input ref={camRef} type="file" accept="image/*" capture="user" onChange={e=>handlePhoto(slot,e)} style={{ display:"none" }}/>
    </div>
  );

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px" }}>📸 BEFORE & AFTER</div>
        {photos.before && photos.after && (
          <div style={{ padding:"3px 10px", background:"rgba(255,31,31,.12)", border:"1px solid rgba(255,31,31,.3)", borderRadius:"50px", fontSize:"10px", color:"var(--rd)", fontFamily:"var(--fm)" }}>12 WEEKS</div>
        )}
      </div>
      <div style={{ display:"flex", gap:"10px", marginBottom:"12px" }}>
        <PhotoSlot slot="before" label="BEFORE" weeks="Day 1 photo" libRef={beforeRef} camRef={beforeCamRef}/>
        <PhotoSlot slot="after" label="AFTER" weeks="12 weeks later" libRef={afterRef} camRef={afterCamRef}/>
      </div>
      {photos.before && photos.after && (
        <Card style={{ padding:"12px", textAlign:"center", border:"1px solid rgba(255,31,31,.2)" }}>
          <div style={{ fontSize:"20px", marginBottom:"4px" }}>🎉</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"13px", color:"var(--rd)", letterSpacing:"1px" }}>TRANSFORMATION COMPLETE!</div>
          <Mono style={{ marginTop:"3px" }}>Keep pushing — you're proof it works</Mono>
        </Card>
      )}
    </div>
  );
}

// ─── Progress Tracker with Charts ─────────────────────────────────────────────
function ProgressTracker({ storageKey, user }) {
  const load = () => { try { return JSON.parse(localStorage.getItem(storageKey+"_prog")||"null"); } catch { return null; } };
  const defaultData = {
    weight:    [{ date:"Week 1", v:80 }, { date:"Week 2", v:79.2 }, { date:"Week 3", v:78.5 }, { date:"Week 4", v:77.8 }],
    fatPct:    [{ date:"Week 1", v:22 }, { date:"Week 2", v:21.3 }, { date:"Week 3", v:20.8 }, { date:"Week 4", v:20.1 }],
    musclePct: [{ date:"Week 1", v:36 }, { date:"Week 2", v:36.5 }, { date:"Week 3", v:37.1 }, { date:"Week 4", v:37.8 }],
    bioAge:    [{ date:"Week 1", v:38 }, { date:"Week 2", v:37 },   { date:"Week 3", v:36 },   { date:"Week 4", v:35 }],
  };
  const [data, setData] = useState(load() || defaultData);
  const [metric, setMetric] = useState("weight");
  const [showAdd, setShowAdd] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [newWeek, setNewWeek] = useState("");
  const [showBioAgeQuiz, setShowBioAgeQuiz] = useState(false);

  function addEntry() {
    if (!newVal || !newWeek) return;
    const updated = { ...data, [metric]: [...(data[metric]||[]), { date: newWeek, v: parseFloat(newVal) }] };
    setData(updated);
    try { localStorage.setItem(storageKey+"_prog", JSON.stringify(updated)); } catch {}
    setNewVal(""); setNewWeek(""); setShowAdd(false);
  }

  const metrics = {
    weight:    { label:"WEIGHT",      unit:"kg",  col:"var(--acc)", icon:"⚖️" },
    fatPct:    { label:"BODY FAT",    unit:"%",   col:"var(--rd)",  icon:"🔥" },
    musclePct: { label:"MUSCLE MASS", unit:"%",   col:"var(--a3)",  icon:"💪" },
    bioAge:    { label:"BIO AGE",     unit:"yrs", col:"var(--a4)",  icon:"🧬" },
  };

  const cur = metrics[metric];
  const points = data[metric] || [];
  const latest = points[points.length-1]?.v;
  const first = points[0]?.v;
  const change = latest && first ? (latest - first).toFixed(1) : null;
  const isGood = metric==="weight"||metric==="fatPct"||metric==="bioAge" ? parseFloat(change)<0 : parseFloat(change)>0;

  // Simple SVG line chart
  function MiniChart({ pts, col }) {
    if (pts.length < 2) return null;
    const vals = pts.map(p=>p.v);
    const min = Math.min(...vals) * 0.98;
    const max = Math.max(...vals) * 1.02;
    const W = 280, H = 80;
    const x = (i) => (i / (pts.length - 1)) * W;
    const y = (v) => H - ((v - min) / (max - min)) * H;
    const pathD = pts.map((p,i)=>(i===0?"M":"L")+x(i).toFixed(1)+","+y(p.v).toFixed(1)).join(" ");
    const areaD = pathD + " L"+W+","+H+" L0,"+H+" Z";
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id={"g"+metric} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={col} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#g${metric})`}/>
        <path d={pathD} stroke={col} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=>(
          <circle key={i} cx={x(i)} cy={y(p.v)} r="4" fill={col} stroke="var(--bg)" strokeWidth="2"/>
        ))}
      </svg>
    );
  }

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px" }}>📊 PROGRESS</div>
        <button onClick={()=>setShowAdd(true)} style={{ padding:"6px 13px", background:"var(--tr)", border:"none", borderRadius:"8px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>+ LOG</button>
      </div>

      {/* Metric selector */}
      <div style={{ display:"flex", gap:"7px", marginBottom:"14px", overflowX:"auto", scrollbarWidth:"none" }}>
        {Object.entries(metrics).map(([k,m])=>(
          <button key={k} onClick={()=>{ if(k==="bioAge"){ setMetric(k); setShowBioAgeQuiz(true); } else setMetric(k); }} style={{ flexShrink:0, padding:"8px 14px", background:metric===k?m.col+"20":"rgba(255,255,255,.04)", border:`1.5px solid ${metric===k?m.col:"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:metric===k?m.col:"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fb)", fontWeight:metric===k?700:400, display:"flex", alignItems:"center", gap:"5px" }}>
            <span>{m.icon}</span>{m.label}{k==="bioAge"&&<span style={{fontSize:"9px",opacity:.6}}> ↗</span>}
          </button>
        ))}
      </div>

      {/* Main chart card */}
      <Card style={{ padding:"16px", marginBottom:"12px", border:`1px solid ${cur.col}30` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
          <div>
            <Mono style={{ color:cur.col, marginBottom:"4px" }}>{cur.icon} {cur.label}</Mono>
            <div style={{ fontFamily:"var(--fd)", fontSize:"36px", color:cur.col, lineHeight:1 }}>
              {latest ?? "—"}<span style={{ fontSize:"14px", color:"var(--mut)", marginLeft:"4px" }}>{cur.unit}</span>
            </div>
          </div>
          {change !== null && (
            <div style={{ padding:"6px 12px", background:isGood?"rgba(255,31,31,.12)":"rgba(255,31,31,.12)", border:`1px solid ${isGood?"var(--a3)30":"var(--rd)30"}`, borderRadius:"10px", textAlign:"center" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"18px", color:isGood?"var(--a3)":"var(--rd)" }}>{parseFloat(change)>0?"+":""}{change}</div>
              <Mono style={{ fontSize:"9px" }}>since start</Mono>
            </div>
          )}
        </div>
        <MiniChart pts={points} col={cur.col}/>
        {/* X axis labels */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
          {points.map((p,i)=>(
            <Mono key={i} style={{ fontSize:"9px", textAlign:"center" }}>{p.date}</Mono>
          ))}
        </div>
      </Card>

      {/* All metrics summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"9px", marginBottom:"12px" }}>
        {Object.entries(metrics).map(([k,m])=>{
          const pts = data[k]||[];
          const val = pts[pts.length-1]?.v;
          const diff = pts.length>1 ? (val - pts[0].v).toFixed(1) : null;
          const good = k==="weight"||k==="fatPct"||k==="bioAge" ? parseFloat(diff)<0 : parseFloat(diff)>0;
          return (
            <div key={k} onClick={()=>setMetric(k)} style={{ padding:"12px", background:metric===k?m.col+"12":"rgba(255,255,255,.04)", border:`1.5px solid ${metric===k?m.col:"rgba(255,255,255,.07)"}`, borderRadius:"12px", cursor:"pointer", transition:"all .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:"16px", marginBottom:"3px" }}>{m.icon}</div>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"18px", color:m.col, lineHeight:1 }}>{val??"-"}</div>
                  <Mono style={{ fontSize:"9px", marginTop:"2px" }}>{m.unit} · {m.label}</Mono>
                </div>
                {diff && <div style={{ fontSize:"12px", color:good?"var(--a3)":"var(--rd)", fontFamily:"var(--fm)", fontWeight:700 }}>{parseFloat(diff)>0?"+":""}{diff}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log entry sheet */}
      {showAdd && (
        <Sheet onClose={()=>setShowAdd(false)} title="LOG MEASUREMENT" acc={cur.col}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div>
              <Mono style={{ marginBottom:"8px" }}>METRIC</Mono>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {Object.entries(metrics).map(([k,m])=>(
                  <button key={k} onClick={()=>setMetric(k)} style={{ padding:"6px 12px", background:metric===k?m.col+"20":"rgba(255,255,255,.04)", border:`1px solid ${metric===k?m.col:"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:metric===k?m.col:"var(--mut)", cursor:"pointer", fontSize:"12px" }}>{m.icon} {m.label}</button>
                ))}
              </div>
            </div>
            <Field lbl={"VALUE ("+cur.unit+")"} val={newVal} set={setNewVal} ph={"e.g. "+latest} acc={cur.col} type="number"/>
            <Field lbl="LABEL (e.g. Week 5)" val={newWeek} set={setNewWeek} ph="Week 5" acc={cur.col}/>
            <PBtn onClick={addEntry} disabled={!newVal||!newWeek} col={cur.col} style={{ color:"#000" }}>SAVE ENTRY</PBtn>
          </div>
        </Sheet>
      )}
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
function PlanScreen({ onSelect, onBack, defaultPlan }) {
  const [sel, setSel] = useState(defaultPlan||"free");
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
function SplashScreen({ onContinue, onPlanPill, onAdminHold }) {
  const [lang, setLangState] = useState(getLang());
  const [showLang, setShowLang] = useState(false);
  const t = T[lang] || T.en;
  function changeLang(l) { setLang(l); setLangState(l); setShowLang(false); }
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
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", zIndex:10 }}>
          <div onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold} onTouchStart={startHold} onTouchEnd={endHold} style={{ position:"relative", userSelect:"none" }}>
            <Wordmark size={38} col="#ffffff"/>
            {holdProg > 0 && (
              <div style={{ position:"absolute", bottom:"-3px", left:0, right:0, height:"2px", background:"rgba(255,255,255,.15)", borderRadius:"1px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:holdProg+"%", background:"var(--rd)", borderRadius:"1px", transition:"width .05s linear" }}/>
              </div>
            )}
          </div>
          {/* CONTACT + Language stacked on the right */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"7px" }}>
            <button onClick={()=>setShowContact(true)} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.18)", borderRadius:"50px", color:"rgba(255,255,255,.8)", cursor:"pointer", padding:"6px 14px", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px", backdropFilter:"blur(8px)" }}>CONTACT</button>
            {/* Language selector */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>setShowLang(s=>!s)} style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"5px 11px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.18)", borderRadius:"50px", color:"rgba(255,255,255,.7)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"0px" }}>
                {LANGS[lang].flag} {LANGS[lang].name} ▾
              </button>
              {showLang && (
                <div style={{ position:"absolute", top:"34px", right:0, background:"rgba(15,15,15,.97)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"12px", zIndex:500, minWidth:"155px", overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,.6)", animation:"fadeIn .15s" }}>
                  {Object.entries(LANGS).map(([code, info])=>(
                    <button key={code} onClick={()=>changeLang(code)} style={{ display:"flex", alignItems:"center", gap:"10px", width:"100%", padding:"10px 14px", background:lang===code?"rgba(14,165,233,.12)":"transparent", border:"none", color:lang===code?"var(--acc)":"var(--txt)", cursor:"pointer", fontSize:"13px", fontFamily:"var(--fb)", textAlign:"left", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                      <span>{info.flag}</span><span>{info.name}</span>{lang===code&&<span style={{marginLeft:"auto",color:"var(--acc)"}}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content panel */}
      <div style={{ flex:1, padding:"16px 22px 28px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>

        {/* Brand heading + all content */}
        <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)", transition:"all .65s cubic-bezier(.16,1,.3,1)" }}>
          {/* Logged-in continue banner — shown if session exists */}
          {loadSession() && (() => {
            const s = loadSession();
            return (
              <div onClick={()=>onContinue && (() => { /* restore handled by App */ })()} style={{ marginBottom:"12px", padding:"10px 14px", background:"rgba(14,165,233,.12)", border:"1px solid rgba(14,165,233,.3)", borderRadius:"12px", display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}
                onClick={()=>{ if(s.role==="trainer") onContinue("trainer_resume"); else onContinue("member_resume"); }}>
                <span style={{ fontSize:"18px" }}>{s.role==="trainer"?"🏋️":"⚡"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px", color:"var(--acc)", marginBottom:"2px" }}>CONTINUE AS {(s.user?.name||"User").toUpperCase()}</div>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"rgba(255,255,255,.5)" }}>{s.role==="trainer"?"Trainer Dashboard":"Member Dashboard"} →</div>
                </div>
              </div>
            );
          })()}
          {/* AI badge — tight under image */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 12px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.3)", borderRadius:"50px", marginBottom:"12px" }}>
            <Dot col="#ffffff"/><span style={{ fontFamily:"var(--fm)", fontSize:"10px", letterSpacing:"2px", color:"#ffffff" }}>AI-POWERED FITNESS</span>
          </div>
          <div style={{ fontFamily:"var(--fd)", fontWeight:900, fontSize:"clamp(46px,13vw,68px)", letterSpacing:"5px", lineHeight:.85, marginBottom:"8px" }}>
            <span style={{ color:"var(--txt)" }}>FIT</span><span style={{ color:"var(--rd)" }}>2</span><span style={{ color:"var(--txt)" }}>ALL</span>
          </div>
          <div style={{ fontFamily:"var(--fm)", fontSize:"15px", color:"rgba(255,255,255,.5)", letterSpacing:"4px", marginBottom:"22px" }}>{t.moveTagline}</div>

          {/* Role selector cards - side by side */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"40px" }}>
            {[
              {role:"trainer",  img:IMG.trainer, title:t.trainer,  sub:t.manageClients,     border:"rgba(255,112,67,.4)", col:"var(--tr)",  glow:"rgba(255,112,67,.06)"},
              {role:"enthusiast",img:"https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80", title:t.member, sub:t.startJourney, border:"rgba(14,165,233,.4)", col:"var(--acc)", glow:"rgba(14,165,233,.06)"}
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
              { img:"https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=400&q=80", n:"Free", d:"30-day trial", c:"var(--a3)", action:"free" },
              { img:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80", n:"Pro", d:"$4.99/mo", c:"var(--acc)", action:"pro" },
              { img:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", n:"Trainer", d:"From free", c:"var(--tr)", action:"trainer" },
            ].map(item=>(
              <div key={item.n} onClick={()=>onPlanPill&&onPlanPill(item.action)} style={{ flex:1, background:"rgba(255,255,255,.03)", border:`1px solid ${item.c}20`, borderRadius:"10px", overflow:"hidden", textAlign:"center", cursor:"pointer" }}>
                <div style={{ height:"62px", overflow:"hidden", position:"relative" }}>
                  <img src={item.img} alt={item.n} style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.75) saturate(.9)" }}/>
                  <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg,transparent 0%,rgba(10,10,10,.5) 100%)` }}/>
                </div>
                <div style={{ padding:"7px 5px 8px" }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", color:item.c, marginBottom:"2px" }}>{item.n}</div>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"11px", color:"rgba(255,255,255,.45)" }}>{item.d}</div>
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
        <div style={{ position:"absolute", bottom:"28px", left:0, right:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", paddingTop:"54px" }}>
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
              <div style={{ marginTop:"8px", padding:"8px 11px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"8px", display:"flex", alignItems:"center", gap:"6px" }}>
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
          {/* Fingerprint button — only shown if biometric is registered for a previous session */}
          {store.get("f2a_biometric_user") && (
            <button onClick={async()=>{
              const email = await verifyBiometric();
              if (email) {
                const s = loadSession();
                if (s && s.user?.email===email) { onLogin(s.user); }
                else { alert("Biometric verified but no saved session found. Please log in manually once."); }
              }
            }} style={{ width:"100%", padding:"14px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"var(--r)", color:"var(--txt)", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"2px", marginBottom:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
              <span style={{ fontSize:"22px" }}>👆</span> USE FINGERPRINT
            </button>
          )}
          <Mono style={{ textAlign:"center" }}>By continuing you agree to our Terms of Service</Mono>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ id, active }) {
  const imgStyle = {
    width: "28px",
    height: "28px",
    objectFit: "contain",
    transition: "filter .2s, opacity .2s",
    // Inactive: greyscale + dark so icon appears same tone as bar
    // Active: full vibrant colour with glow
    filter: active
      ? "drop-shadow(0 0 6px rgba(14,165,233,.65)) brightness(1.1) saturate(1.2)"
      : "grayscale(1) brightness(0.28)",
    opacity: active ? 1 : 1,
    background: "transparent",
    mixBlendMode: "normal",
  };
  if (id==="program")   return <img src={NAV_ICON_WORKOUT} alt="Program" style={imgStyle}/>;
  if (id==="wearables") return <img src={NAV_ICON_WEARABLES} alt="Wearables" style={imgStyle}/>;
  if (id==="nutrition") return <img src={NAV_ICON_NUTRITION} alt="Nutrition" style={imgStyle}/>;
  if (id==="calendar")  return <img src={NAV_ICON_CALENDAR} alt="Calendar" style={imgStyle}/>;
  const s = active ? "#fff" : "rgba(255,255,255,.4)";
  const w = 22;
  if (id==="clients")   return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
  if (id==="profile")   return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
  return null;
}

function BottomNav({ role, tab, setTab }) {
  const tabs = role==="trainer"
    ? [["clients","Clients"],["calendar","Calendar"],["profile","Profile"]]
    : [["program","Program"],["wearables","Wearables"],["nutrition","Nutrition"],["calendar","Calendar"]];
  const col = role==="trainer" ? "var(--tr)" : "var(--acc)";
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, maxWidth:"480px", margin:"0 auto", zIndex:50 }}>
      <div style={{ margin:"0 12px 12px", background:"rgba(12,12,12,.97)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderRadius:"22px", border:"1px solid rgba(255,255,255,.08)", padding:"6px 4px", display:"flex", justifyContent:"space-around", boxShadow:"0 8px 32px rgba(0,0,0,.6)" }}>
        {tabs.map(([t, lbl])=>{
          const isActive = tab === t;
          return (
            <button key={t} onClick={()=>setTab(t)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", background:"transparent", border:"1px solid transparent", borderRadius:"16px", cursor:"pointer", padding:"9px 10px", transition:"all .2s", flex:1, margin:"0 2px" }}>
              <NavIcon id={t} active={isActive}/>
              <span style={{ fontSize:"11px", fontFamily:"var(--fb)", fontWeight:isActive?700:500, color:isActive?col:"rgba(255,255,255,.3)", transition:"color .2s", letterSpacing:"0px" }}>{lbl}</span>
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
    <button onClick={onClick} style={{ position:"fixed", bottom:"88px", right:"18px", width:"58px", height:"58px", borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%)", border:"1px solid rgba(14,165,233,.45)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(14,165,233,.4), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.15)", zIndex:100, padding:"4px", animation:popped?"pop .5s ease":"none", transform:"translateZ(0)" }}>
      <img src={FAB_ICON} alt="AI Coach" style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"50%" }}/>
    </button>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  // Restore session from localStorage on load
  const savedSession = loadSession();
  const [screen, setScreen] = useState(savedSession ? "app" : "splash");
  const [role, setRole] = useState(savedSession?.role || null);
  const [user, setUser] = useState(savedSession?.user || null);
  const [tab, setTab] = useState(savedSession?.role==="trainer" ? "clients" : "program");
  const [showAI, setShowAI] = useState(false);
  const [profile, setProfile] = useState(null);
  const [sub, setSub] = useState(()=>loadMemberSub());
  const [upgradeReason, setUpgradeReason] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [bioAgeResult, setBioAgeResult] = useState(null);
  const [showBioAge, setShowBioAge] = useState(false);

  const ctx = getMemberCtx(sub, setSub);

  function goRole(r) {
    if (r==="trainer_resume" || r==="member_resume") {
      // User is already logged in — restore session
      const s = loadSession();
      if (s) { setUser(s.user); setRole(s.role); setScreen("app"); setTab(s.role==="trainer"?"clients":"program"); return; }
    }
    setRole(r); if (r==="enthusiast"&&!sub) setScreen("plan"); else setScreen("auth");
  }
  function goPlan(id) { const s = mkMemberSub(id); setSub(s); setScreen("auth"); }
  function goLogin(u) {
    setUser(u);
    setRole(u.role);
    if (u.isOwner) {
      if (!sub || sub.id !== "pro") { const s = mkMemberSub("pro"); setSub(s); }
      saveTrainerSub({ id:"unlimited", start: new Date().toISOString() });
    }
    // Persist session
    saveSession({ user: u, role: u.role });
    // Offer biometric registration after first login if available and not yet registered
    if (!store.get("f2a_biometric_user")) {
      isBiometricAvailable().then(available => {
        if (available) {
          setTimeout(async () => {
            try {
              const ok = await registerBiometric(u.email);
              if (ok) console.log("Biometric registered for", u.email);
            } catch {}
          }, 2000);
        }
      });
    }
    setTab(u.role==="trainer"?"clients":"program");
    // Show Bio Age test for new member registrations
    let hasCompletedBioAge = false;
    try { hasCompletedBioAge = !!localStorage.getItem("bioage_done_"+u.email); } catch {}
    if (u.role === "enthusiast" && !u.isOwner && !hasCompletedBioAge) {
      setScreen("bioage");
    } else {
      setScreen("app");
    }
  }
  function doLogout() {
    clearSession();
    setUser(null); setRole(null); setSub(null);
    setScreen("splash"); setTab("program");
    setShowAI(false); setUpgradeReason(null);
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
      {screen==="splash" && <SplashScreen onContinue={goRole} onPlanPill={plan=>{ if(plan==="trainer"){ goRole("trainer"); } else if(plan==="pro"){ setRole("enthusiast"); setScreen("plan_pro"); } else { goRole("enthusiast"); } }} onAdminHold={()=>setShowAdminLogin(true)}/>}
      {screen==="plan"   && <PlanScreen onSelect={goPlan} onBack={()=>setScreen("splash")}/>}
      {screen==="plan_pro" && <PlanScreen onSelect={goPlan} defaultPlan="pro" onBack={()=>setScreen("splash")}/>}
      {screen==="auth"   && <AuthScreen role={role} onLogin={goLogin} onBack={()=>setScreen(role==="enthusiast"&&!sub?"plan":"splash")}/>}
      {screen==="bioage" && user && (
        <BioAgeTest
          user={user}
          onComplete={result=>{
            if (result) setBioAgeResult(result);
            try { localStorage.setItem("bioage_done_"+user.email, "1"); } catch {}
            setScreen("app");
          }}
        />
      )}
      {screen==="app" && user && (
        <>
          {role==="trainer"
            ? <TrainerDashboard user={user} tab={tab} setTab={setTab} onHome={()=>setScreen("splash")} onLogout={doLogout}/>
            : <MemberDashboard user={user} tab={tab} setTab={setTab} sub={sub} ctx={ctx} onUpgrade={r=>setUpgradeReason(r)} onHome={()=>setScreen("splash")} onLogout={doLogout}/>
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



// ─── Exercise Library (free-exercise-db — 800+ exercises, always available) ───
// Source: https://github.com/yuhonas/free-exercise-db (public domain)
// Images hosted on GitHub raw + exercisedb-api GIFs as bonus fallback
const FREE_EX_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const FREE_EX_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

function ExerciseLibrary({ onClose }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [muscle, setMuscle] = useState("all");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const PER = 20;

  const CATS = ["all","strength","stretching","cardio","plyometrics","strongman","powerlifting","olympic_weightlifting"];
  const EQUIPS = ["all","barbell","dumbbell","cable","machine","kettlebell","bands","body only","other"];
  const MUSCLES = ["all","chest","back","shoulders","biceps","triceps","forearms","abdominals","quadriceps","hamstrings","glutes","calves","traps","lats"];

  const COLS = {
    chest:"#f87171", back:"#60a5fa", shoulders:"#c084fc", biceps:"#34d399",
    triceps:"#a3e635", forearms:"#94a3b8", abdominals:"#fbbf24", quadriceps:"#fb923c",
    hamstrings:"#22d3ee", glutes:"#f472b6", calves:"#4ade80", traps:"#818cf8", lats:"#38bdf8",
  };

  useEffect(() => {
    fetch(FREE_EX_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => { setExercises(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Couldn't load exercise database. Check your connection."); setLoading(false); });
  }, []);

  const filtered = exercises.filter(ex => {
    const q = search.toLowerCase();
    const nameOk = !q || ex.name.toLowerCase().includes(q);
    const catOk = category === "all" || ex.category === category;
    const equipOk = equipment === "all" || (ex.equipment||[]).includes(equipment);
    const muscleOk = muscle === "all" || (ex.primaryMuscles||[]).includes(muscle) || (ex.secondaryMuscles||[]).includes(muscle);
    return nameOk && catOk && equipOk && muscleOk;
  });

  const pages = Math.ceil(filtered.length / PER);
  const visible = filtered.slice(page*PER, (page+1)*PER);

  function imgUrl(ex) {
    if (!ex?.images?.length) return null;
    return FREE_EX_IMG + encodeURIComponent(ex.id) + "/" + ex.images[0];
  }

  // ── Selected Exercise Detail ──────────────────────────────────────────────
  if (selected) {
    const img = imgUrl(selected);
    const muscles = selected.primaryMuscles || (selected.target ? [selected.target] : []);
    const secondary = selected.secondaryMuscles || [];
    const instructions = selected.instructions || [];
    const col = COLS[selected.primaryMuscles?.[0]] || "var(--tr)";

    return (
      <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:800, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
        <div style={{ padding:"14px 18px", background:"rgba(10,10,10,.98)", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:"11px", flexShrink:0 }}>
          <button onClick={()=>setSelected(null)} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"6px 13px", fontSize:"11px", fontFamily:"var(--fm)" }}>← BACK</button>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px", color:col }}>{selected.name?.toUpperCase()}</div>
            <Mono>{selected.bodyPart || selected.bodyParts?.[0] || ""} · {selected.equipment || selected.equipments?.[0] || ""}</Mono>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 18px 80px" }}>
          {/* Exercise GIF / image */}
          {img && (
            <div style={{ borderRadius:"14px", overflow:"hidden", marginBottom:"14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", maxHeight:"260px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img src={img} alt={selected.name} style={{ width:"100%", maxHeight:"260px", objectFit:"contain" }}
                onError={e=>{ e.target.style.display="none"; }}/>
            </div>
          )}

          {/* Tags */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"14px" }}>
            {[selected.category, selected.equipment?.[0], selected.force, selected.level].filter(Boolean).map((t,i)=>(
              <div key={i} style={{ padding:"4px 11px", background:col+"18", border:`1px solid ${col}35`, borderRadius:"50px", fontSize:"11px", color:col, fontFamily:"var(--fm)" }}>{t}</div>
            ))}
          </div>

          {/* Muscles */}
          {(muscles.length > 0 || secondary.length > 0) && (
            <Card style={{ padding:"13px", marginBottom:"12px" }}>
              <Mono style={{ marginBottom:"9px", color:"var(--tr)" }}>MUSCLES TARGETED</Mono>
              {muscles.length > 0 && (
                <div style={{ marginBottom:"8px" }}>
                  <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"5px" }}>PRIMARY</div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    {muscles.map((m,i)=><div key={i} style={{ padding:"4px 11px", background:col+"20", border:`1px solid ${col}40`, borderRadius:"50px", fontSize:"12px", color:col, fontWeight:600 }}>{m}</div>)}
                  </div>
                </div>
              )}
              {secondary.length > 0 && (
                <div>
                  <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"5px" }}>SECONDARY</div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    {secondary.slice(0,5).map((m,i)=><div key={i} style={{ padding:"3px 9px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"50px", fontSize:"11px", color:"var(--mut)" }}>{m}</div>)}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Overview */}
          {selected.overview && (
            <Card style={{ padding:"13px", marginBottom:"12px" }}>
              <Mono style={{ marginBottom:"8px" }}>ABOUT</Mono>
              <div style={{ fontSize:"14px", color:"rgba(255,255,255,.7)", lineHeight:1.75 }}>{selected.overview}</div>
            </Card>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <Card style={{ padding:"13px", marginBottom:"12px" }}>
              <Mono style={{ marginBottom:"10px", color:"var(--acc)" }}>HOW TO PERFORM</Mono>
              {instructions.map((step, i)=>(
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"10px", paddingBottom:"10px", borderBottom:i<instructions.length-1?"1px solid rgba(255,255,255,.05)":"none" }}>
                  <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:"var(--acc)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"11px", color:"#000", flexShrink:0, marginTop:"1px" }}>{i+1}</div>
                  <div style={{ fontSize:"14px", color:"rgba(255,255,255,.8)", lineHeight:1.7, flex:1 }}>{step}</div>
                </div>
              ))}
            </Card>
          )}

          {/* Variations */}
          {selected.variations?.length > 0 && (
            <Card style={{ padding:"13px" }}>
              <Mono style={{ marginBottom:"9px" }}>VARIATIONS</Mono>
              {selected.variations.slice(0,4).map((v,i)=>(
                <div key={i} style={{ fontSize:"13px", color:"rgba(255,255,255,.65)", padding:"6px 0", borderBottom:i<3?"1px solid rgba(255,255,255,.05)":"none", lineHeight:1.6 }}>• {v}</div>
              ))}
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ── Main Library List ─────────────────────────────────────────────────────
  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:750, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px 0", background:"rgba(10,10,10,.98)", borderBottom:"1px solid rgba(255,255,255,.08)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"6px 13px", fontSize:"11px", fontFamily:"var(--fm)" }}>← BACK</button>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", color:"var(--tr)" }}>💪 EXERCISE LIBRARY</div>
            <Mono>{loading||searching ? "Loading..." : filtered.length+" exercises · ExerciseDB"}</Mono>
          </div>
        </div>

        {/* Search bar */}
        <input value={search} onChange={e=>onSearchChange(e.target.value)}
          placeholder="Search exercises by name..."
          style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"10px", color:"var(--txt)", fontSize:"14px", fontFamily:"var(--fb)", outline:"none", marginBottom:"10px" }}/>

        {/* Category + muscle + equipment filters */}
        <div style={{ display:"flex", gap:"7px", overflowX:"auto", scrollbarWidth:"none", paddingBottom:"8px" }}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>{ setCategory(c); setPage(0); }}
              style={{ flexShrink:0, padding:"6px 12px", background:category===c?"var(--tr)22":"rgba(255,255,255,.05)", border:`1.5px solid ${category===c?"var(--tr)":"rgba(255,255,255,.1)"}`, borderRadius:"50px", color:category===c?"var(--tr)":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fb)", fontWeight:600, whiteSpace:"nowrap" }}>
              {c==="all"?"All types":c.replace("_"," ")}
            </button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px", paddingBottom:"11px" }}>
          <select value={muscle} onChange={e=>{ setMuscle(e.target.value); setPage(0); }}
            style={{ padding:"8px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"9px", color:muscle!=="all"?(COLS[muscle]||"var(--txt)"):"var(--txt)", fontSize:"12px", fontFamily:"var(--fm)", cursor:"pointer" }}>
            {MUSCLES.map(m=><option key={m} value={m}>{m==="all"?"All muscles":m}</option>)}
          </select>
          <select value={equipment} onChange={e=>{ setEquipment(e.target.value); setPage(0); }}
            style={{ padding:"8px 10px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"9px", color:"var(--txt)", fontSize:"12px", fontFamily:"var(--fm)", cursor:"pointer" }}>
            {EQUIPS.map(e=><option key={e} value={e}>{e==="all"?"All equipment":e}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 18px 80px" }}>
        {(loading||searching) && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"50%", border:"3px solid var(--tr)", borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 14px" }}/>
            <Mono style={{ color:"var(--tr)" }}>Loading exercises...</Mono>
          </div>
        )}

        {error && (
          <Card style={{ padding:"20px", textAlign:"center", marginTop:"16px", border:"1px solid rgba(255,31,31,.2)" }}>
            <div style={{ fontSize:"28px", marginBottom:"10px" }}>⚠️</div>
            <Mono style={{ color:"var(--rd)", marginBottom:"8px" }}>{error}</Mono>
            <button onClick={()=>loadExercises(bodyPart)} style={{ padding:"8px 18px", background:"var(--tr)", border:"none", borderRadius:"8px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px" }}>RETRY</button>
          </Card>
        )}

        {!loading && !searching && !error && visible.length === 0 && (
          <Card style={{ padding:"24px", textAlign:"center", marginTop:"16px" }}>
            <div style={{ fontSize:"32px", marginBottom:"10px" }}>🔍</div>
            <Mono>No exercises found. Try different filters.</Mono>
          </Card>
        )}

        {!loading && !searching && visible.map((ex, i)=>{
          const img = imgUrl(ex);
          const bp = ex.bodyPart || ex.bodyParts?.[0]?.toLowerCase() || "";
          const col = COLS[bp] || "var(--tr)";
          return (
            <div key={ex.exerciseId||ex.id||i} onClick={()=>setSelected(ex)}
              style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 12px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"12px", marginBottom:"8px", cursor:"pointer" }}>
              {/* Thumbnail */}
              <div style={{ width:"54px", height:"54px", borderRadius:"10px", background:"rgba(255,255,255,.06)", border:`1.5px solid ${col}30`, overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {img
                  ? <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ e.target.style.display="none"; }}/>
                  : <span style={{ fontSize:"20px" }}>💪</span>
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:"14px", marginBottom:"3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ex.name}</div>
                <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                  {bp && <span style={{ fontSize:"10px", padding:"2px 8px", background:col+"15", border:`1px solid ${col}30`, borderRadius:"50px", color:col, fontFamily:"var(--fm)" }}>{bp}</span>}
                  {(ex.equipment||ex.equipments?.[0]) && <span style={{ fontSize:"10px", padding:"2px 8px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"50px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{ex.equipment||ex.equipments?.[0]}</span>}
                  {ex.exerciseType && <span style={{ fontSize:"10px", padding:"2px 8px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"50px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{ex.exerciseType.replace("_"," ")}</span>}
                </div>
              </div>
              <div style={{ color:"var(--mut)", fontSize:"16px", flexShrink:0 }}>›</div>
            </div>
          );
        })}

        {/* Pagination */}
        {!loading && !searching && pages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:"10px", padding:"16px 0" }}>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
              style={{ padding:"8px 18px", background:page===0?"rgba(255,255,255,.04)":"var(--tr)", border:"none", borderRadius:"8px", color:page===0?"var(--mut)":"#fff", cursor:page===0?"default":"pointer", fontFamily:"var(--fd)", fontSize:"12px" }}>← PREV</button>
            <Mono>{page+1} / {pages}</Mono>
            <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page===pages-1}
              style={{ padding:"8px 18px", background:page===pages-1?"rgba(255,255,255,.04)":"var(--tr)", border:"none", borderRadius:"8px", color:page===pages-1?"var(--mut)":"#fff", cursor:page===pages-1?"default":"pointer", fontFamily:"var(--fd)", fontSize:"12px" }}>NEXT →</button>
          </div>
        )}
        {!loading && exercises.length > 0 && <Mono style={{ textAlign:"center", marginTop:"8px" }}>800+ exercises · free-exercise-db · Public Domain</Mono>}
      </div>
    </div>
  );
}


// ─── Bio Age Questionnaire ─────────────────────────────────────────────────────
// Based on validated fitness age methodology (Norwegian CERG VO2max model +
// lifestyle biomarkers used by MIA Health / Fitnessage)
function BioAgeTest({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [result, setResult] = useState(null);

  const chronoAge = ans.age ? parseInt(ans.age) : 30;

  // Questions modelled on fitnessage.miahealth.no methodology
  const STEPS = [
    {
      id:"intro",
      type:"intro",
      title:"DISCOVER YOUR\nFITNESS AGE",
      sub:"A science-backed assessment used by MIA Health to calculate your biological fitness age based on cardiovascular health, body composition and lifestyle.",
      img:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=70",
    },
    {
      id:"age", type:"number", section:"ABOUT YOU",
      q:"What is your age?", unit:"years", min:16, max:90, ph:"e.g. 32",
      info:"Your chronological age is our baseline.",
    },
    {
      id:"sex", type:"choice", section:"ABOUT YOU",
      q:"What is your biological sex?",
      opts:[{v:"male",l:"Male"},{v:"female",l:"Female"}],
    },
    {
      id:"height", type:"number", section:"BODY COMPOSITION",
      q:"What is your height?", unit:"cm", min:140, max:220, ph:"e.g. 175",
    },
    {
      id:"weight", type:"number", section:"BODY COMPOSITION",
      q:"What is your current weight?", unit:"kg", min:40, max:200, ph:"e.g. 75",
    },
    {
      id:"waist", type:"number", section:"BODY COMPOSITION",
      q:"What is your waist circumference?", unit:"cm", min:50, max:160, ph:"e.g. 85",
      info:"Measure at navel level. This is the best single predictor of metabolic health.",
    },
    {
      id:"rhr", type:"choice", section:"HEART HEALTH",
      q:"What is your resting heart rate?",
      info:"Check your pulse for 60 seconds first thing in the morning.",
      opts:[
        {v:1,l:"< 50 bpm",sub:"Excellent (athlete level)"},
        {v:2,l:"50–59 bpm",sub:"Very good"},
        {v:3,l:"60–69 bpm",sub:"Good (average)"},
        {v:4,l:"70–79 bpm",sub:"Below average"},
        {v:5,l:"≥ 80 bpm",sub:"Poor"},
      ],
    },
    {
      id:"cardio_freq", type:"choice", section:"PHYSICAL ACTIVITY",
      q:"How often do you do moderate–vigorous cardio?",
      sub:"Running, cycling, swimming, rowing, fast walking",
      opts:[
        {v:5,l:"5+ times per week"},
        {v:4,l:"3–4 times per week"},
        {v:3,l:"1–2 times per week"},
        {v:2,l:"Less than once a week"},
        {v:1,l:"Rarely or never"},
      ],
    },
    {
      id:"cardio_intensity", type:"choice", section:"PHYSICAL ACTIVITY",
      q:"When you do cardio, how hard do you push?",
      opts:[
        {v:4,l:"High intensity — breathless, can't hold a conversation"},
        {v:3,l:"Moderate — slightly breathless, short sentences"},
        {v:2,l:"Light — comfortable, can talk easily"},
        {v:1,l:"Very light — casual walking"},
      ],
    },
    {
      id:"strength_freq", type:"choice", section:"PHYSICAL ACTIVITY",
      q:"How often do you do strength/resistance training?",
      opts:[
        {v:4,l:"3+ times per week"},
        {v:3,l:"1–2 times per week"},
        {v:2,l:"Occasionally (less than weekly)"},
        {v:1,l:"Rarely or never"},
      ],
    },
    {
      id:"sitting", type:"choice", section:"PHYSICAL ACTIVITY",
      q:"How many hours a day do you sit?",
      info:"Excessive sitting is an independent risk factor for reduced fitness age.",
      opts:[
        {v:4,l:"Less than 4 hours"},
        {v:3,l:"4–6 hours"},
        {v:2,l:"7–9 hours"},
        {v:1,l:"10+ hours"},
      ],
    },
    {
      id:"sleep", type:"choice", section:"RECOVERY",
      q:"How many hours of sleep do you get per night?",
      opts:[
        {v:4,l:"7–9 hours (optimal)"},
        {v:3,l:"6–7 hours"},
        {v:2,l:"5–6 hours"},
        {v:1,l:"Less than 5 hours or 9+"},
      ],
    },
    {
      id:"sleep_quality", type:"choice", section:"RECOVERY",
      q:"How would you rate your sleep quality?",
      opts:[
        {v:4,l:"Excellent — wake up refreshed"},
        {v:3,l:"Good — mostly restful"},
        {v:2,l:"Fair — sometimes disturbed"},
        {v:1,l:"Poor — often tired despite sleeping"},
      ],
    },
    {
      id:"stress", type:"choice", section:"LIFESTYLE",
      q:"What is your typical daily stress level?",
      opts:[
        {v:4,l:"Low — generally relaxed"},
        {v:3,l:"Moderate — manageable stress"},
        {v:2,l:"High — frequently stressed"},
        {v:1,l:"Very high — overwhelmed"},
      ],
    },
    {
      id:"diet", type:"choice", section:"LIFESTYLE",
      q:"How would you describe your diet?",
      opts:[
        {v:4,l:"Excellent — mostly whole foods, vegetables, lean protein"},
        {v:3,l:"Good — mostly healthy with occasional treats"},
        {v:2,l:"Fair — mixed, some processed foods"},
        {v:1,l:"Poor — mostly processed / fast food"},
      ],
    },
    {
      id:"smoking", type:"choice", section:"LIFESTYLE",
      q:"Do you smoke or vape?",
      opts:[
        {v:4,l:"Never smoked"},
        {v:3,l:"Ex-smoker (quit 5+ years ago)"},
        {v:2,l:"Ex-smoker (quit recently)"},
        {v:1,l:"Current smoker or vaper"},
      ],
    },
    {
      id:"alcohol", type:"choice", section:"LIFESTYLE",
      q:"How much alcohol do you consume weekly?",
      opts:[
        {v:4,l:"None"},
        {v:3,l:"1–7 units (light)"},
        {v:2,l:"8–14 units (moderate)"},
        {v:1,l:"15+ units (heavy)"},
      ],
    },
    {
      id:"flex", type:"choice", section:"PHYSICAL TESTS",
      q:"Sit on the floor and try to touch your toes. How far can you reach?",
      info:"Flexibility correlates with arterial stiffness — a key ageing marker.",
      opts:[
        {v:4,l:"Past my toes — palms flat on floor"},
        {v:3,l:"Touching my toes"},
        {v:2,l:"Within 5 cm of toes"},
        {v:1,l:"More than 5 cm away"},
      ],
    },
    {
      id:"balance", type:"choice", section:"PHYSICAL TESTS",
      q:"Stand on one leg with eyes closed. How long can you hold it?",
      info:"Balance declines with age — a 10-second hold correlates with healthy ageing.",
      opts:[
        {v:4,l:"30+ seconds easily"},
        {v:3,l:"10–30 seconds"},
        {v:2,l:"5–10 seconds"},
        {v:1,l:"Less than 5 seconds"},
      ],
    },
    {
      id:"stairs", type:"choice", section:"PHYSICAL TESTS",
      q:"How do you feel after climbing 3 flights of stairs briskly?",
      opts:[
        {v:4,l:"Barely notice — no breathlessness"},
        {v:3,l:"Slightly out of breath, recover in 30s"},
        {v:2,l:"Quite out of breath, need a minute"},
        {v:1,l:"Very breathless, need several minutes"},
      ],
    },
  ];

  // ── Scoring algorithm ──────────────────────────────────────────────────────
  function calcBioAge(a) {
    const age = parseInt(a.age)||30;
    const bmi = a.height && a.weight ? (parseFloat(a.weight)/Math.pow(parseFloat(a.height)/100,2)) : 25;
    const waist = parseFloat(a.waist)||85;
    const isMale = a.sex==="male";

    // Waist penalty (central adiposity)
    const waistLimit = isMale ? 94 : 80;
    const waistPenalty = Math.max(0, (waist - waistLimit) * 0.15);

    // BMI score
    const bmiPenalty = bmi < 18.5 ? 2 : bmi > 30 ? 3 : bmi > 25 ? 1 : 0;

    // Lifestyle score (0–100)
    const lifeKeys = ["rhr","cardio_freq","cardio_intensity","strength_freq","sitting","sleep","sleep_quality","stress","diet","smoking","alcohol","flex","balance","stairs"];
    const maxScore = lifeKeys.length * 4;
    const rawScore = lifeKeys.reduce((sum, k) => sum + (parseInt(a[k])||1), 0);
    const pct = rawScore / maxScore; // 0–1 where 1 = perfect

    // VO2max estimation (simplified CERG model)
    // VO2max for age using lifestyle + RHR proxy
    const rhrMap = {1:55,2:48,3:40,4:32,5:25}; // bpm proxy → VO2 contribution
    const vo2Contribution = (rhrMap[a.rhr]||35) / 55;
    const cardioContrib = ((parseInt(a.cardio_freq)||1) + (parseInt(a.cardio_intensity)||1)) / 9;
    const vo2Score = (vo2Contribution * 0.6 + cardioContrib * 0.4);

    // Combined: higher pct + vo2 = younger bio age
    const fitnessAgeOffset = (0.5 - pct) * 14 + (0.5 - vo2Score) * 10 + waistPenalty + bmiPenalty;
    const bioAge = Math.round(Math.max(16, Math.min(age + 20, age + fitnessAgeOffset)));
    const diff = bioAge - age;

    // Identify top areas to improve
    const weakAreas = lifeKeys
      .map(k => ({ k, v: parseInt(a[k])||1 }))
      .filter(x => x.v <= 2)
      .map(x => ({
        rhr:"Resting heart rate",cardio_freq:"Cardio frequency",cardio_intensity:"Cardio intensity",
        strength_freq:"Strength training",sitting:"Sitting time",sleep:"Sleep duration",
        sleep_quality:"Sleep quality",stress:"Stress levels",diet:"Diet quality",
        smoking:"Smoking",alcohol:"Alcohol intake",flex:"Flexibility",balance:"Balance",stairs:"Cardio fitness"
      }[x.k]));

    return { bioAge, diff, pct: Math.round(pct*100), weakAreas: weakAreas.slice(0,3), bmi: Math.round(bmi*10)/10, waist };
  }

  const questions = STEPS.filter(s=>s.type!=="intro");
  const totalQ = questions.length;

  function next(value) {
    const cur = STEPS[step];
    const updated = { ...ans };
    if (cur.id !== "intro") updated[cur.id] = value;
    setAns(updated);
    if (step >= STEPS.length - 1) {
      setResult(calcBioAge(updated));
    } else {
      setStep(s => s+1);
    }
  }

  function goBack() {
    if (step > 0) setStep(s=>s-1);
  }

  const cur = STEPS[step];
  const qNum = STEPS.slice(0, step+1).filter(s=>s.type!=="intro").length;
  const pct = cur.type==="intro" ? 0 : Math.round((qNum/totalQ)*100);

  // ── RESULT SCREEN ──────────────────────────────────────────────────────────
  if (result) {
    const diff = result.diff;
    const isGood = diff < 0;
    const isNeutral = diff === 0;
    const col = isGood ? "#22c55e" : diff <= 5 ? "#f97316" : "#ff1f1f";
    const label = isGood ? "YOUNGER THAN YOUR AGE!" : isNeutral ? "RIGHT ON TARGET" : "OLDER THAN YOUR AGE";
    const msg = isGood
      ? "Outstanding! Your lifestyle is keeping you biologically younger."
      : diff <= 3
      ? "You're close to your ideal fitness age. Small tweaks will make a big difference."
      : diff <= 7
      ? "There's clear room to improve. Your program will help close this gap."
      : "Your fitness age needs attention — but that's exactly what Fit2All is here for.";

    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
        <HeroBg src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=70"
          ov="linear-gradient(180deg,rgba(10,10,10,.3) 0%,rgba(10,10,10,.95) 60%,rgba(10,10,10,1) 100%)"
          style={{ height:"200px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 22px" }}>
          <Mono style={{ color:col, marginBottom:"5px" }}>FITNESS AGE RESULT</Mono>
          <div style={{ fontFamily:"var(--fd)", fontSize:"36px", letterSpacing:"3px" }}>
            {user?.name?.split(" ")[0]?.toUpperCase() || "YOUR"}<br/>
            <span style={{ color:col }}>FITNESS AGE</span>
          </div>
        </HeroBg>

        <div style={{ flex:1, overflowY:"auto", padding:"22px 20px 40px" }}>
          {/* Big number */}
          <Card style={{ padding:"24px", marginBottom:"14px", textAlign:"center", border:`2px solid ${col}40` }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"80px", color:col, lineHeight:1, marginBottom:"4px" }}>
              {result.bioAge}
            </div>
            <div style={{ fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"2px", color:col, marginBottom:"6px" }}>YEARS OLD</div>
            <div style={{ fontFamily:"var(--fm)", fontSize:"12px", color:"rgba(255,255,255,.5)", marginBottom:"12px" }}>
              Your chronological age: <span style={{ color:"var(--txt)", fontWeight:600 }}>{chronoAge}</span>
            </div>
            <div style={{ padding:"8px 18px", background:col+"18", border:`1px solid ${col}40`, borderRadius:"50px", display:"inline-block", fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", color:col }}>
              {diff < 0 ? diff : "+"+diff} YEARS {label}
            </div>
          </Card>

          <Card style={{ padding:"15px", marginBottom:"12px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px", color:"var(--acc)", marginBottom:"10px" }}>HEALTH SNAPSHOT</div>
            {[
              ["Lifestyle Score", result.pct+"%", result.pct >= 75 ? "var(--a3)" : result.pct >= 50 ? "var(--yw)" : "var(--rd)"],
              ["BMI", result.bmi, result.bmi < 25 ? "var(--a3)" : result.bmi < 30 ? "var(--yw)" : "var(--rd)"],
              ["Waist", result.waist+"cm", result.waist < 94 ? "var(--a3)" : "var(--rd)"],
            ].map(([k,v,c])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                <span style={{ fontSize:"13px", color:"var(--mut)" }}>{k}</span>
                <span style={{ fontSize:"13px", fontWeight:700, color:c }}>{v}</span>
              </div>
            ))}
          </Card>

          <div style={{ fontSize:"14px", color:"rgba(255,255,255,.65)", lineHeight:1.7, marginBottom:"14px" }}>{msg}</div>

          {result.weakAreas.length > 0 && (
            <Card style={{ padding:"14px", marginBottom:"14px", border:"1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", marginBottom:"10px", color:"var(--yw)" }}>🎯 TOP AREAS TO IMPROVE</div>
              {result.weakAreas.map((a,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"7px 0", borderBottom:i<result.weakAreas.length-1?"1px solid rgba(255,255,255,.05)":"none" }}>
                  <div style={{ width:"24px", height:"24px", borderRadius:"50%", background:"var(--tr)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:"10px", color:"#fff", flexShrink:0 }}>{i+1}</div>
                  <span style={{ fontSize:"13px" }}>{a}</span>
                </div>
              ))}
            </Card>
          )}

          <PBtn onClick={()=>onComplete(result)} style={{ fontSize:"16px", letterSpacing:"2px", color:"#000", marginBottom:"10px" }}>
            ⚡ START MY FIT2ALL JOURNEY
          </PBtn>
          <Mono style={{ textAlign:"center" }}>Your results are saved to your profile</Mono>
        </div>
      </div>
    );
  }

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (cur.type === "intro") return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <HeroBg src={cur.img} ov="linear-gradient(180deg,rgba(10,10,10,.1) 0%,rgba(10,10,10,.93) 55%,rgba(10,10,10,1) 100%)"
        style={{ height:"280px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 24px" }}>
        <Mono style={{ color:"var(--acc)", marginBottom:"8px", letterSpacing:"2px" }}>🧬 BIO AGE TEST</Mono>
        <div style={{ fontFamily:"var(--fd)", fontSize:"38px", letterSpacing:"3px", lineHeight:1, marginBottom:"8px" }}>
          {cur.title.split("\n").map((l,i)=><div key={i}>{l}</div>)}
        </div>
      </HeroBg>
      <div style={{ flex:1, padding:"24px 22px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"15px", color:"rgba(255,255,255,.65)", lineHeight:1.8, marginBottom:"24px" }}>{cur.sub}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"24px" }}>
          {[["🧬","Bio Age","Science-backed"],["💪","Fitness Age","VO2max model"],["🏥","20 Questions","~3 minutes"],["📊","Instant Result","With action plan"]].map(([i,t,s])=>(
            <div key={t} style={{ padding:"13px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"12px", textAlign:"center" }}>
              <div style={{ fontSize:"22px", marginBottom:"5px" }}>{i}</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px", color:"var(--acc)", marginBottom:"2px" }}>{t}</div>
              <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"var(--mut)" }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:"auto" }}>
          <PBtn onClick={()=>next(null)} style={{ fontSize:"16px", letterSpacing:"2px", color:"#000", marginBottom:"10px" }}>
            🧬 START MY BIO AGE TEST
          </PBtn>
          <button onClick={()=>onComplete(null)} style={{ width:"100%", padding:"12px", background:"transparent", border:"1px solid rgba(255,255,255,.1)", borderRadius:"var(--r)", color:"var(--mut)", cursor:"pointer", fontSize:"13px" }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );

  // ── QUESTION SCREENS ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px 0", flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          {step > 0
            ? <button onClick={goBack} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"8px", color:"rgba(255,255,255,.7)", cursor:"pointer", padding:"6px 11px", fontSize:"11px", fontFamily:"var(--fm)" }}>← BACK</button>
            : <div/>
          }
          <Mono style={{ color:"var(--acc)" }}>Q{qNum} OF {totalQ}</Mono>
          <button onClick={()=>onComplete(null)} style={{ background:"none", border:"none", color:"var(--mut)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fm)" }}>SKIP</button>
        </div>
        {/* Progress bar */}
        <div style={{ height:"4px", background:"rgba(255,255,255,.08)", borderRadius:"2px", marginBottom:"20px" }}>
          <div style={{ height:"100%", width:pct+"%", background:"var(--acc)", borderRadius:"2px", transition:"width .4s ease" }}/>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 18px 40px" }}>
        {cur.section && <Mono style={{ color:"var(--tr)", marginBottom:"6px", letterSpacing:"2px" }}>📍 {cur.section}</Mono>}
        <div style={{ fontFamily:"var(--fd)", fontSize:"clamp(20px,6vw,26px)", letterSpacing:"1px", lineHeight:1.2, marginBottom:cur.info?"8px":"18px" }}>{cur.q}</div>
        {cur.info && <div style={{ fontSize:"12px", color:"rgba(255,255,255,.5)", lineHeight:1.6, marginBottom:"16px", padding:"8px 12px", background:"rgba(14,165,233,.07)", border:"1px solid rgba(14,165,233,.15)", borderRadius:"8px" }}>💡 {cur.info}</div>}

        {/* Number input */}
        {cur.type==="number" && (
          <div>
            <div style={{ position:"relative", marginBottom:"20px" }}>
              <input
                type="number"
                defaultValue={ans[cur.id]||""}
                min={cur.min} max={cur.max}
                placeholder={cur.ph}
                autoFocus
                onKeyDown={e=>{ if(e.key==="Enter"&&e.target.value) next(e.target.value); }}
                onChange={e=>{ if(e.target.value) setAns(p=>({...p,[cur.id]:e.target.value})); }}
                style={{ width:"100%", padding:"18px 60px 18px 18px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"14px", color:"var(--txt)", fontSize:"28px", fontFamily:"var(--fd)", outline:"none", letterSpacing:"2px" }}
              />
              <div style={{ position:"absolute", right:"16px", top:"50%", transform:"translateY(-50%)", fontFamily:"var(--fm)", fontSize:"13px", color:"var(--mut)" }}>{cur.unit}</div>
            </div>
            <PBtn onClick={()=>{ const v = ans[cur.id]; if(v) next(v); }} disabled={!ans[cur.id]} style={{ fontSize:"16px", color:"#000" }}>NEXT →</PBtn>
          </div>
        )}

        {/* Choice input */}
        {cur.type==="choice" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
            {cur.opts.map((o,i)=>(
              <button key={i} onClick={()=>next(o.v)}
                style={{ padding:"16px 18px", background:ans[cur.id]===o.v?"rgba(14,165,233,.15)":"rgba(255,255,255,.04)", border:`2px solid ${ans[cur.id]===o.v?"var(--acc)":"rgba(255,255,255,.1)"}`, borderRadius:"14px", color:"var(--txt)", cursor:"pointer", textAlign:"left", transition:"all .15s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:"16px", fontWeight:600, marginBottom:o.sub?"3px":"0" }}>{o.l}</div>
                  {o.sub && <div style={{ fontSize:"12px", color:"rgba(255,255,255,.45)" }}>{o.sub}</div>}
                </div>
                <div style={{ width:"22px", height:"22px", borderRadius:"50%", border:`2px solid ${ans[cur.id]===o.v?"var(--acc)":"rgba(255,255,255,.2)"}`, background:ans[cur.id]===o.v?"var(--acc)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#000", fontSize:"12px" }}>
                  {ans[cur.id]===o.v?"✓":""}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


