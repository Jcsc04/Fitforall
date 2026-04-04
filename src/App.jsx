import React, { useState, useEffect, useRef } from "react";

// ─── Fonts & Global Styles ────────────────────────────────────────────────────
(function() {
  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap";
  document.head.appendChild(fl);
  const gs = document.createElement("style");
  gs.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { --bg:#0a0a0a;--card:#141414;--acc:#0ea5e9;--a2:#ff1f1f;--a3:#0284c7;--a4:#0ea5e9;--txt:#f5f5f5;--mut:#666666;--tr:#ff1f1f;--gr:#0ea5e9;--yw:#ff6b00;--rd:#ff1f1f;--r:14px;--fd:'Orbitron',sans-serif;--fb:'Space Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;--fm:'Space Mono',monospace; }
body { background:var(--bg);color:var(--txt);font-family:var(--fb);overflow-x:hidden;-webkit-text-size-adjust:100%;text-size-adjust:100%; }
* { box-sizing:border-box; }
/* Responsive container */
#root { max-width:480px; margin:0 auto; }
/* Tablet adjustments */
@media (min-width:481px) and (max-width:1024px) { #root { max-width:600px; } }
@media (min-width:1025px) { #root { max-width:480px; box-shadow:0 0 80px rgba(0,0,0,.8); } }
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
  pro:  { id:"pro",  name:"PRO",        price:"£5.99", period:"/month", color:"var(--acc)", limits:{ai:Infinity,days:Infinity},
    features:[{l:"Unlimited AI",d:"Every day",y:1},{l:"4-week Programs",d:"Progressive",y:1},{l:"Nutrition Hub",d:"Full",y:1},{l:"Wearables",d:"Full",y:1},{l:"Priority Support",d:"",y:1},{l:"Early Access",d:"",y:1}] },
};

// ─── Trainer Plans ────────────────────────────────────────────────────────────
const TRAINER_PLANS = {
  free:      { id:"free",      name:"FREE",      price:"$0",     period:"forever", color:"var(--a3)",  clientLimit:1 },
  starter:   { id:"starter",   name:"STARTER",   price:"£4.99",  period:"/month",  color:"var(--acc)", clientLimit:5 },
  pro:       { id:"pro",       name:"PRO",        price:"£9.99",  period:"/month",  color:"var(--a4)",  clientLimit:10 },
  unlimited: { id:"unlimited", name:"UNLIMITED",  price:"£14.99", period:"/month",  color:"var(--tr)",  clientLimit:Infinity },
};
const TP_FEATURES = {
  free:      [{l:"1 Client",d:"free forever",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"More clients",d:"",y:0}],
  starter:   [{l:"Up to 5 clients",d:"£4.99/mo",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"Priority support",d:"",y:1}],
  pro:       [{l:"Up to 10 clients",d:"£9.99/mo",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"Priority support",d:"",y:1}],
  unlimited: [{l:"Unlimited clients",d:"£14.99/mo",y:1},{l:"Full management",d:"",y:1},{l:"Session notes",d:"",y:1},{l:"Priority support",d:"",y:1}],
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
const FULL_ACCESS_USERS = [
  { name:"Joao M",  email:"Jmrm0912@hotmail.com", password:"Jmrmjcsc" },
  { name:"FitPlus", email:"Fitplustest@gmail.com", password:"Fitplus" },
];
function isFullAccess(email) {
  if (!email) return false;
  const e = email.toLowerCase();
  return e === "jcsc04@gmail.com" ||
    FULL_ACCESS_USERS.some(u => u.email.toLowerCase() === e);
}



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
      <img src={src} alt="" style={{ position:"absolute", top:0, left:0, right:0, bottom:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0, filter:"brightness(.5) saturate(.7)" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:ov||"rgba(10,10,10,.7)", zIndex:1 }} />
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:400, animation:"fadeIn .2s" }} onClick={onClose}>
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
  en:    { name:"English (UK)",     flag:"🇬🇧", currency:"£", currencyCode:"GBP" },
  "en-us":{ name:"English (US)",   flag:"🇺🇸", currency:"$", currencyCode:"USD" },
  pt:    { name:"Português",        flag:"🇵🇹", currency:"€", currencyCode:"EUR" },
  es:    { name:"Español",          flag:"🇪🇸", currency:"€", currencyCode:"EUR" },
  fr:    { name:"Français",         flag:"🇫🇷", currency:"€", currencyCode:"EUR" },
  de:    { name:"Deutsch",          flag:"🇩🇪", currency:"€", currencyCode:"EUR" },
  it:    { name:"Italiano",         flag:"🇮🇹", currency:"€", currencyCode:"EUR" },
  zh:    { name:"中文",              flag:"🇨🇳", currency:"¥", currencyCode:"CNY" },
  ja:    { name:"日本語",            flag:"🇯🇵", currency:"¥", currencyCode:"JPY" },
  ru:    { name:"Русский",          flag:"🇷🇺", currency:"₽", currencyCode:"RUB" },
  ar:    { name:"العربية",          flag:"🇸🇦", currency:"﷼", currencyCode:"SAR" },
};
const getCurrency = () => LANGS[getLang()]?.currency || "£";
const T = {
  en:    { trainer:"TRAINER",    member:"MEMBER",    manageClients:"Manage clients",       startJourney:"Start your journey",       getStarted:"GET STARTED", moveTagline:"MOVE BETTER · LIVE STRONGER",           free:"Free",      pro:"Pro", trainerPlan:"Trainer"    },
  "en-us":{ trainer:"TRAINER",  member:"MEMBER",    manageClients:"Manage clients",       startJourney:"Start your journey",       getStarted:"GET STARTED", moveTagline:"MOVE BETTER · LIVE STRONGER",           free:"Free",      pro:"Pro", trainerPlan:"Trainer"    },
  pt:    { trainer:"TREINADOR", member:"MEMBRO",    manageClients:"Gerir clientes",       startJourney:"Comece a sua jornada",     getStarted:"COMEÇAR",     moveTagline:"MOVA-SE MELHOR · VIVA MAIS FORTE",      free:"Grátis",    pro:"Pro", trainerPlan:"Treinador"  },
  es:    { trainer:"ENTRENADOR",member:"MIEMBRO",   manageClients:"Gestionar clientes",   startJourney:"Empieza tu viaje",         getStarted:"COMENZAR",    moveTagline:"MUÉVETE MEJOR · VIVE MÁS FUERTE",       free:"Gratis",    pro:"Pro", trainerPlan:"Entrenador" },
  fr:    { trainer:"ENTRAÎNEUR",member:"MEMBRE",    manageClients:"Gérer les clients",    startJourney:"Commencez votre parcours", getStarted:"COMMENCER",   moveTagline:"BOUGEZ MIEUX · VIVEZ PLUS FORT",        free:"Gratuit",   pro:"Pro", trainerPlan:"Entraîneur" },
  de:    { trainer:"TRAINER",   member:"MITGLIED",  manageClients:"Kunden verwalten",     startJourney:"Starte deine Reise",       getStarted:"LOSLEGEN",    moveTagline:"BESSER BEWEGEN · STÄRKER LEBEN",        free:"Kostenlos", pro:"Pro", trainerPlan:"Trainer"    },
  it:    { trainer:"ALLENATORE",member:"MEMBRO",    manageClients:"Gestisci clienti",     startJourney:"Inizia il tuo percorso",   getStarted:"INIZIA",      moveTagline:"MUOVITI MEGLIO · VIVI PIÙ FORTE",       free:"Gratuito",  pro:"Pro", trainerPlan:"Allenatore" },
  zh:    { trainer:"教练",       member:"会员",       manageClients:"管理客户",             startJourney:"开始你的旅程",             getStarted:"开始",         moveTagline:"动得更好 · 活得更强",                   free:"免费",       pro:"专业", trainerPlan:"教练"        },
  ja:    { trainer:"トレーナー", member:"メンバー",   manageClients:"クライアント管理",     startJourney:"あなたの旅を始めましょう", getStarted:"始める",       moveTagline:"もっと動いて · もっと強く生きる",       free:"無料",       pro:"プロ", trainerPlan:"トレーナー"   },
  ru:    { trainer:"ТРЕНЕР",    member:"УЧАСТНИК",  manageClients:"Управление клиентами", startJourney:"Начните свой путь",        getStarted:"НАЧАТЬ",      moveTagline:"ДВИГАЙТЕСЬ ЛУЧШЕ · ЖИВИТЕ СИЛЬНЕЕ",     free:"Бесплатно", pro:"Про",  trainerPlan:"Тренер"     },
  ar:    { trainer:"مدرب",      member:"عضو",       manageClients:"إدارة العملاء",        startJourney:"ابدأ رحلتك",              getStarted:"ابدأ",        moveTagline:"تحرك بشكل أفضل · عش بقوة أكبر",        free:"مجاني",     pro:"احترافي", trainerPlan:"مدرب"    },
};
const getLang = () => { try { return localStorage.getItem("f2a_lang") || "en"; } catch { return "en"; } };
const setLang = l => { try { localStorage.setItem("f2a_lang", l); } catch {} };


const FAB_ICON = "data:image/png;base64,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";
const NUTR_ICON_64 = "data:image/png;base64,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";
const NUTR_ICON_32 = "data:image/png;base64,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";
const NUTR_ICON_96 = "data:image/png;base64,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";

// ─── Custom Nav Icons ─────────────────────────────────────────────────────────
const NAV_ICON_WORKOUT = "data:image/png;base64,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";
const NAV_ICON_CALENDAR = "data:image/png;base64,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";
const NAV_ICON_NUTRITION = "data:image/png;base64,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";
const NAV_ICON_WEARABLES = "data:image/png;base64,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";

// ─── Logo ─────────────────────────────────────────────────────────────────────
// App logo image (FitPlus brand)
const LOGO_URL = "data:image/png;base64,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";
const LOGO_TEXT_URL = "data:image/png;base64,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";
const NUTRITION_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAlI0lEQVR42t17d5hVRdL+233OuflOHhjCAAMzDJIFJIkExcUA6soKSlBkFdcc18guYFqM4BpW3cWMARBR8qISdAVhSA4wiSFOnjt37p0bTuyu3x8z48f6W3f32/3C49fPc/4499zu6qqurq6ueovhn2xbt25VJ0yY4LS/L1iwIGPy5ElnBYOpeRkZmZlpaRkUDodZTU1NJJlMlq9bt6588eLFTe3/JyKFMSb+GVpEpHDOBREBAPr27RtYsmRJYXZ2ZmFmZnZ2x44dYds2KisrLc75kR07dpTddtttdf8KrX9mMpwxBgD49a9/HSwvL5nZ0NDwcSKRqKe/01paovUNDXUrSksPTxs5cqS3fSwiYn+HFiMi3vaq7N2796K6uro3otHIKSL5o7QSiUQ4Eol8WlJSctOSJUvSAIAxhjPG+tHG/tFKtEmSVVZW/qpDh+z7AoFgTwAwDEM4jn1Q143DjY2NjT16dDtVX1/fwePxdg4E/L0VRTnH5wtoABCJNJdVV9c81r9//+U/tkIrVqxQpk2bJgCgvLx8SnZ29m/S0tLOAQDLMmEY+mHHsQ80N0dqs7M71oQj4VS35u6kaWpfr9c31O/3ewEgkUicrqurfjY/v/DFVlL/ojYQkQIAX3zxRb9QKLS1XdpNTaFt5eXlv1y1alX3v9f/vff+1H3//v03hcOhv7T3bWhoWLlhw4au7Vvqh7SWLVuW3dDQ8Fb7/6PR6LcnTlTeuvbPqwoAKD9G6403Xs6tqCid3tTUuLm9bzgc3vr5558PaRtf/c8yrwJAUVHRzxOJRKRVpVv2lZQUT/kr9WEMREUa0SHX31EmpbKycmo8HjtMRBSLtVTt379/QjudM2gNiUQilW20ju/Zs+eXANw/mJmyfPny9F/9+rLCZcteyL4of4P7h8Q+/3zzlHC4aTcRUTKZiJeVHbn67wmB/S3mGWNOaenhWd265b3j9XpZTU3VK0uXLnjwmWfeiAHAcy8+OqAlJBr79TvSOG3aSgEAT782vVfXbs7QnE4pQcOwUX/arvz47fN3r1t3UxIAlixZkPaLX9ywtGvXrteZppE4cODg9JEjR64HgD179pzbr1+/T71eb2ZNTc3K5Z8sv+P+2+6vA4Bf/vLujPOvrL7cF5ST/QEUqqqTbZhOhsejRQ2TNYFrB1qa+Paj33b8ZP78pbUA0L07PFu2HH2ioKDXPVIKHDpUfNugQWe/3M7bjwqgfb8UFxdPKSgo+NTtdrOKitK7evc+6wUAuP2h27MvuNhZasZzamM1nkU33PBA7KlXrx7W/2z5m0CKeWEwlXm5IkFgSMQJetxd0dzoe+X5OQNf21V1rw4AFRUVC/Pz8xfoejJZXHxooq7rxpAhQ7YHg8FgRUXFc717974PAAYOfMb/2Ivf3RhITd4dzLC7aZoACQnhCAgBECMwlUN1qXBsBc0h1hgL+9/Yt6rbU4v/sLgZAA4ePHhrYWHhS5qm4sCBfXOHDh3+5g9tAvuhEdqxY8fAYcOG7vB6faklJSW39+3b9yUAeOr1meedPdJ6hzmB2NefHhu+aNF247UPZs/oeVb8jfQOljuRsCAlCQIIjIGDuNutcE3zo6HKu7OsyH393be8UQYAhw8XL+rbt/9vE4lEgxBCpqSk5Bw9evTpgoKCBwDg5Xemjx42yvVKZgd9UCQWg6ELQQ5AEkwwxkAAASAQEYiIAEWB4vf7EGsKHqo44v3lzTOX7W6ldXhWYWHh27qepKKivWMmTJiw60yDy9qPHwDsvvvu8z744IO7srKy+h86dGjxgAEDHgKApe9fdV1+n+SfVIWbOzex3ose+KzmxXevuaHv2cYfiUfIElwwzhTGwADWNigAkpKBZEqaR20J+cOl+/xX3DH3ra8A4NSpU6/m5ubeBACnT59+rVu3br8CgFfem3Hx0FH2qo6dbF+kyXB0gxRHEGMgSALE92MDRATGGECA7UgiJp2UFJeWiPv1E2XBGTf84u01rVpX9kh+fu/Hm5tDR1544aURCxcu1AFIxhixM1W/qqrqkS5dujxeW1uzrXPnLucDjJ5598rr+g2038rKlqjY731k5qUrn5z/1DUFw8YmigPpcS2RJDCVcfqBSvH2l9aJCl9AVRLhgL73Cz5x0YMffwOAVVdXr/d6vcjIyLgUAL392c3jOveo2xQIxjzShNA0VeEcsGwJy5GwBKDbAoYjQZKgEIPCGVQFcGkKFAYIIYXigsKQLkI1nS+6+sKXPgeA6upTn3XunDvl2LFjj/bq1WtBO8+8zVmQmzZtys3MzHzQsqxE0Xd7bwYDPf76NYO79NRfT0nVqalWDZdXpb8OALl9kvO9GYY7EpfSJuKWTbAcgu0QLJtg2wTTJpgWwXAItmRKJGoLLdDi7Tfa+ezRJXMLAdDUqVOn3vHE9KsA0B/enDm+sG94k9cX9+gJSCGhmJaEbkrEdIHGqIX6qImI7iCmC0QNiSZLoEG3URu1UBe1EDUEJJhiG5DEIjyYWb366ZevHsgYsGvXnlv0ZDLcqVPOr7/44oteACQRcQ6AM8aoT58+d3o8nkB9ff1Ll110Wentkza4M7s0v+kLJl2MVJaI4c+Lbno99MjTV/RyBY1rwjGDTIcU0yYYjoTuSBhO20o5ErYjYQsJx5GwhIQloDTHHeFKj2UWDk1uff2dx/J27txpvPfclsRzf5g1aPA4WhPMiHukA8kBTsSQMARqmwyEYxaEJAgJ2AKQAAkichwJ2yE4ABK2g/qoiVDMhgPG9aSUbn882LEg8fZtt21wT506taqmunqp1+vzFhYW3sUYIwCcAxCLFy9OzcrKmmOaRsuuXV8sBYD8G96+tXMeGyxMYZgWQySibAGBZXbhFwSyoBlCCt2RrJ1px5awbAnTbmXckgTTkTAltQqg7V0QAYwawRybMUYPPDC9R/5Qfb3ij6RGmh2pKoyrCkNCdxCKmdBtCcshOESCMymkEAAnxhkxKYQkKUXrNgOIATFToD5iwBRQIlHDycixB/c7783rAOCzdSv+pOvJWEZGxowlS5akMcYczhijadOmjff7/ZnNzZFPpk27vu72h27PDqTHHnbsJClMcYXDEqFGfggMxNz22aawYVoEW7Qx2ca84xAcSTAFwRIEmwBLEmwJmJYQqospZjS9sqV04M/mzV5UNfvW2ZkDJxrrvektXWprksK0JQdn0B1CKGZBEANjDI4QQkpSXG6f4uhexBpcoVhIjWvMy/1+l+IIQcImIgE4kpA0BRqbDVgO546jUyAz+dADDzyQes8982ubmpqWe73ejLFjx170va3KyMiYDAB1jdUriYh17VMzJTVLZNqmFIoGblvQm0NWAwBoHp5mWgKGJWDLVvU2HQlb/MdKO5K+3wqOQzAtKRUVihVJbWg61umSG298pH7BggW+a653Pu3Q3egbCRuOLaDEkg7CLTZCURNc5YCQBAjp9QWU5vrA11XlvuuPHvQPqd6cc9bxLwP9q0u9U0Kn3e8z6WEuD2dCkhSOhCTAsCQiUYvrupCZOdQjb9jJKUTETp489j4AdOvW9TIAUPv27evinF1ommZi09ervjl74DBasnrSZEdaRJIRSYBzZvTsNzgOfArLcUgTBNsiMC7bDD2DAwnOGJS2M7D1YGWQQkjNDSbi6YnTB1yXPfbrl8sB4iOmzP4gOzd+bn2d5TDiqhAEPSkQjVvw+11wK4zIBbJMH2+sCjx478yBzwCL5Bl+WwjASQDr5r848aPUTnyZ6tezpCOlonAOMCRNAbfBKZ3bxD3xqxlj7123YNyewYM/C2mae+LkyZN9bMWKFfk///nl5fF4fEd6eub4efMeSO17aVFFMNPI1sClx8u4HvUax0oz+y265f1jC9+a+FpmnnljMmYKKaF+f/YxBs5bBUBgbW4AkeqS0iPSWPPJ9Mnzb/poIwB88vW1y3J6ROZGI3GbS6YZpkA07qAxYkAwDk1jlJaqSk0JKqfKPLMfmrPmPQC4pF/3s0Z28/0s1YN+pGr1JUlt7Wvr9+4GgKtvHjOwzwhsScm2soVNxBjjkjGoYNQpS2OxiLv52I5hBYsXL26qr69fn52dfcn69esH8IED+/VTVRdrjoaPAEBmYdlgfwrLNg1BtgRPmFKqPngCXrMbAEjLtduxGLMcyWyHWq29TXDsdkNIsCwB25REcISb0pTwsdQ57cx/uHnm4syu0bkNjVHbMkiTgsDAEG2xYDsACZBpOyIRdyl1R72/amf+ngmFc68dFNh7QVe+9Jws3Dgs05l/WRf726d/3vdjdOzo//APX3/XeFyZbiVdwoEk0yE4UiJpOawpYkqPD+n+vGNnA4At7AOMMRQW5hdyKakPAEjplAJAemfeRfUQbJAUIJAkGQgAKZkYBgCRar4lUi9NSZJZpqRW5gmOA9i2hG0J2LaEQ7ZwKUG15UTg3t/csvJdAPhg85x7svPiDzRFmm3LZpplSyQMiYawAQcEpjBIsh2QW63cx3977+xPXgOA30zqfc+F+e5lHZQWbzQachpbok5jPOlw0sWwLsqVz4/rvAQAe3nR9m3Nje5XXR63IiCF7RBsSYgmhYQq4fJaPQFA2FZ520W1F09NTfcCgCNkHQDYht3JIQlHgIgAlXNG0oKiWNMAYr9ftO6U3ux5xePxcgHpOIJgC9n2tDlE0rE9roDaUOZa/PC81c8DwAdfXDc7LTf8XFMs7BgmV4WU0G2J2iYDzQkHBA7NzWyP16/VlLAXn3/4i8cAhgcmD5w6qpvrOe6EhZF7luw68yF12MPvqec9ukYd9tvV3DtknNU307zx+bnjZxCBJap9zydblCQxcNuSJCSQtASSjoDbrWUBwPFTx5MAkJ2dHeSZmZkSAGpr61oDDhpXjLbzmrV69kosZklX0B727PK55xKB2ce6Px6rc59y+RTNlsIWBLKFhGlLaZFj+/0BLXzUtWzxnZsfAoC3Prv+Yl9G01sJo1nYFldISiaIIRy1EDccEGOwpbSDqX6tpT74wQsP/+UOAJg7KGPC8I70PlNt0WX6I+ziJzbzAZfdicyBhVBzspDVtT9L6VqgBl1JyvXqjxYU5LteemLt8ViEdnPOmZQkpaC2Y5qQ0JNdAKBb99wGAKiqqurJTdPkAJCZliEAIBE3GcnWK40jCI4gWA4jciWY6qt/mjHQkiXLwqEK13Q7HGgMBD0aVyTjnKC5wFN8QS1WFXjn2J3zbgKAF96+ZpwvJ7RKd6LMNBgjKZkQhFDIQCxhQwrAsh3H7dG0ugptxW/nJq8FgAMVxybNmDtzHSVqtfwZj/B+k37Fj9d8ibVfzcPba67GxxsfBEkJOxbmwhHUOZV6Xj4wOAIAMxPyMBGDLSU5kiCJwbAdONIxASASavIDQE5OTgMPhUImAPiCPh8AuDRXA+cMgojp5vdurRKP2yK9kzXqhZXTFwLAq09u2nW6yDsmXhX40Ir6mq2IW9jN/qPNlZ67fnfTxjkrMU0seO6K4dm9Yp85POrTdSIpiTNwhCM2IjELjHNIEo7X71Ljdf7N86/ffA2w3Xn3ww+H9O3ZfdV5197iy5g0l/LHzGb7j76NDXsfQGnjAXxXcQrZmf3AOIdRdQiKpsqgl6hLEIMAEKRyEsRa7yaCQBywbMDtCtQAgMvlTgMARVGaVU3jJwEAgnJbw1zuKscCQMRskjAFAwkJMKa0JGPC20FZsPidq8IPXrvy9+++vLEcwDUz503qRJqeZe8denTlriU6wPC7V64a2qlPfCO8yRQ9QZIkOBEhHjcRabHAuQIppRNI9ahmc+o+KzLpasa5fODmWzNp2/PvRQdmBLLOulCMn/M7pb75IP6891XUhAUiSROprk4Ye84cJENHYNVXwOP1wpGSpQS8raZNpbgEwSYCkwQ4klk2YJuyAQDcbk8OADQ1NTarR48er8zN7QG/P6UPACQaUku0tLq45ucBwyRKOA7zuBQABGEyTlpEpnSxX3jyvUsHNFb4nlqyaOXR5a9vrgVQC+zAwIEX+qff7Z6T0yP+pCuYTEnGhWQMnHOGlhYL4YgFVeUQUoq0dK+aCLuKH5m5aTiwSQBwp1VvWJ0ZjJ/13UfPiPG/OVfhig8HTm7Ht2W1SFgaMlMCmDPlcaT6clD0yZNw2S3QAunMJkYGUQgALNvOUTQFsi1kAkk8GSNQAzsBACkp6QUA0NwcParu3r25dOTIc1p8Pu95Q4cO1Z5+cFnVouXjDnnSlBFG3JQQUFyaAiYBIjDbYsxhcZmeK25QPPqMhW9O+jIaNitAAtk5gVS3xxyT0iHRWzALiTgjAnGNcyTiDpqj7WovpTfoUsL15pG02MS5p0++c7/qUi6wLbOreeovhVX7P5e1xUXKsQNbkT/0Uuw6+B0M8mNU/wn4xcjr0L/HOTDNGFI690JLQz7MxuPc1jJYVVgeAwDVo+YSHNgWgThJt0vhLRGnJhjK2wuAKYoy2jRNa+/evd+xVlUIbc3IyBj/xVebBk0ce0nxw69Mmp+Wn3g0FI47AFeDbgU+l9IegALAIJkUnDNFU1UwUuDSFHh9DJZlQddtIR3GXRpnLheHZRGamgyI1uCLdHs1Hmui2gk9Hlw74bzLL9JcSrczXFwJgIdri2GaNjrmDsTxmgp4/T50zvj/I/GW0SSrd77LP//oja+XfiUuHuMdY6qz9x1K64retTW6FIJkapZPTdaq7y67f9e1n2z6IPfS86eeiMXiRZmZGSNUANB1YwPAxvfKLZgM4Lumk2nvOt6W+5UU7pM2o7juMIUzuFUGkgAYQTpQJEDCtiVnNgnBYNsMYIxzcIUYYDkEy5aItpggxkCSyOXTeFOd3XJ+3iOVP7vgynkAUHXwgNNUUsaS4TBzp6fxrH590W3goO+Z7JV7FgDgZHExjmzciIbSUkBl6DPpZxgxdTrlTbgLF3S/0J73Wv/44LsDE9I16h0NW1IIxgVJSoQlkAj+iTGG7jmFP9c0jSeTiU3fR7C2bNnRe/z4kaWWpR8eO/b8IXv37rVveWrMMx37ivuSCcMhYqoCwO9S4FI5iCSkbO3NGMA5h6IwKGckoogxJHWBRMICAwdjIM2nwIxTc757+uvXX3nfXTZZ7uLVa6h27UYeq6oCJweaV4PhcsGd1wsdBw+FJy2IcG09qvfsQWT/AfDmJrilAdtIIGRbyJh4MWb9/iWR0amrcrzi5IIH37tgUNeC9CtDdUlhCEneoEvV690bVzxadAlASlNTU1Fqaurgr776asCECRMOsfbYWDgc2pCennnx/v27Zw4ZMuL9GTNmpHcad3KfL8fsYRkkpSQuHAmPpsCvcagKA1MYmAJwsNaIRNvNSIAhodswTdGu1KS6IT08RWkod0955u6N97k8fNy+Dz8UdR+vVRKRZuQPHw4j3oJ4XQ00BWgONyGmGzBNE0gacAkJj0sDBwGOBUYEw46jrqYG7rHnY96qT6Vkkj/2/pVoNE4jFuVkSSFV6WFOKGvkmhe/2POXXd9cNGr4qI2hUOib7OzsMUTEvl+ziorKxUI46JWXv+juu+/2fvDBB83JOv9cmD6oLklCEjkAYoaDxpiFaNJpjdZIwCLAcIC4IRCO22iIGEiYDiRnkMSImBBuJaicLEtc88T1m+MuDx9XX14q6tasU2I1tRh4yWT0GDQItmHCSugQgpASzEDnDl1QkNcb+b0KkeLxwkUSzDZBtgM4BHIYcjrlIPrVNuxctZJ7PQEaVnghRVt0QIHjcXmUeA27/5Pff7mHCEqP3O6L2iLSTwGgbdu2cc4YE0SkjBgxYkdDQ92alLSM/Jtvvmk+EeEPC7ZsrS9l98P2KRJSOo6UJAFbEFoMgaaohYaQgbqQjrpmAw0RGy1xG7bVukUkkVTdJH2eFDVyIvCbPz5S9GFUnJoHgKp37SX9xGl0HtAPnbp2wc5330Pzd4egOQ6kboA5DphoDW6QIHBHApJAgoERB4hBYQocIdAx4MWRD5eDiFjvbucwx+K21+/Sko1s9aZXv3sOIBQXF9/WqVPn4aFQaMvQoUPXEhGfMGGCw/8jKUTs4MFDdyeS8Uj3Hj0eOHDgwPkA4fXfbn+m+jvlLtK9isercK6So7q5VFQGcAYhAUcAEm3bQWFgnJEg4bg8nHMKKKGTrgefu3fD4wDgCwR7A2At5ccY4gY6d8tF+fYdsE6dRsDrBoQAhIRwHEjHBiMJR9dbja/kABhaFZeDwEFEcLvciJVXoKWhHp2zesnM9GwtWiu3V+xOvY4gsW7dutEFBflPWpYVP3r06J1tAdEzwveMSQD84osvPnH8WOUdLs2tFBb2Xl5cvPcsAHjr8R0vxI56J8kWb2laakANBlTONRBx6QiQI0g6gHQ4gwMOqbrBAn6vqjd5jteVKFe8eO+XTwHAdZdcONijynwrkaTY8dPczRQUf74dJ/7yNVxuDbZtg2wHwrIgbRskBLhhwQhH2laJAVDAoIAYh4ACIRUQ12DFkwjX1skMbycWsLt+cWpT4yVHtm+PL1u2rO+IESNWu90e34kTJ+4dNWpUyZdffqm28Qx+RqZXEJE6YMDgd0tKSl70eLw5eXkFn33zzTddQGBvLN76511vdBkSP+G/N1HvLiVDYxpzq26XS/X63GowxaOmpHpVt8vHnbivLnLM+2TFp+rwPy3Y9ikA3Duxz5WXDxJfe1QnNdncAqOxgWk5GRg6+RIotg0pHDiWBceyIQwLZJhQDAvxugbYpvn9igMKGFMAqJCkQZIbEio0AkgIACo7J2vqb/burU0uXbq02+WXX/5ZVlZWx7q6ulcLCwtfJ6K/QrqoP0h3i7YM6p1lZaWdevcu/EWfwsLP1q1fN/FSujTCFa7v2kXPA3hx9sPjBnk8fKDXr/ZkqkjXQaqUojoRcQ7EjvCdK1dub2wb1vXivNG39c8yng0EksyUDjEoTFUAvaoGxRvWg6SEtB0wCXAFUBQFYA50KwnLcsCZCkkCrXdUBWhLkVmCwSEFJAlQ3eT2+TkA2bN359px48YFrrzyyjWZmZm9GhsbV3Xq1OnmNhzCX4ElfpgzJwCCiBhjbNbp06fcXbvmThk6dPCWW2655UIG1vxq0Y3aTcNet999cnsRgKIfBRlkFgaf/0XmZXlp4s7uKfY5zLSoOSZJmjrzpHcF97gh4hHYiTg0tw/SITBBkIoAQUJK0eoScuX73dp+0hJjsIWELiQYU+E4ErYvQKk5HZkjZXTevDui69evW5Gbm3t2fX391jlz5sxqz4Cduf//lgDAGKMFCxYwzrl58823XP3KKy/vyM3tNvThhx/6aO3atZfPG/qa+flVzUrfXP+I7sEYtn1bWx9x6Xo8Hmf9O2b4umV4Cjv65fgOfjGlawrrrUkHsZgpBDGFkwE9GkJG93yoGWkwSUBzu9uYpdZgqqD/sE6MgwS1Jj3QmgQlAGAq4o4OUzK4VA1J04SroDsC6ekIhUKHV61a9fvc3G4X19XVHnjrrbenbt682WzPgP2Q37+Jmli0aFFr3ozz5KefTpr0y19ev6Fr19wLv/xyy/uMsZ8TEX/ijlkyNyg2PXSp4mtu0ZK6k6K4VXKl+CxXikuChIOk7oiEA8ZVVeEKg+YkEa8/iszuI+HPL0Bo8wao0gGj1igyWnkGsdbVFkStyJi2+wcxgDMVccdBi2kBnENwFRHdwcgLJnAAUDgb1Lt37zGRSOTk6tWfXPbQQw81r1ix4kdxQj+KomKMyY8++ki5/fbbm+rrT1yu63pZQUGfK2prqx9jjMn5Ly7fVXyoYYpFip2XKVO7p1Kgc9BxuZkuddN0EqaUElxRGOOcEbjG4A1qiFXvBwDkjj0XLJgKKQgOESQRCK1ZX5ISUhAgWOvZTwQJAmcqDAk06joEAEkMjm1DzcrCyBlTAUiZnpEZjMVi4d27d0++9dZbTxPR91iA/5QAAGDatGmCiJS8vP515eXll8XjsdqcnM7zS0pKFgLAPW/t/Gr1Xrq0Mua2VDeXpmBSksKJmAoCZ22RXsXFofo5XEEv9Kq90FtOoNvwYfAPHoK4noAFCVu2PpZ04EgBKantkSAiKFBgOISaRAymlABjYKqCxkgLBs+5Bp175kmAI5FIGNu3b79i0qRJh7Zu3ar+I4TYP8bRtXmKgwcPLj958tQVpmnG+vTps+Dbb3feAxAWvb1925aD9vQoAk5qisI4I6EoHKqLQfEqUP0KuE9p3eFMhUw2oPbIF0LTNNH/hmsRgYQkBxKtmmBTa5TZodZ3QQySOKK2jepkFLZsM5IciLTEoPUrxEV33UQASNd1vm/fvmumTJny1Q+Pu39ZAGcej/37999dW1s7zbZte/DgIc/t2LF1NgAsem/Pmt2nPb+oN/12WqpLYRo5pHEBhRFnjFhraEZKRwi/V5PG8T8r5DQrhRecT92nX4PGUAhClTCkAUM6MEjAlA4MKRAXNmrNJGr0OGySIAgwhcEwTEQ8Hsx5+RlKSUsVQgil6NuieWPHjl1TVFSk/RAM9W8JoE0ITlFRkZaXl7fpxIkTc1VVxZAhw5Z9/vnmiwHCjU9uXrv6a3t0SZNnt+ILqMEUl+LzMObSiHlcYD6PwlNSXYoW7MCPlFa9c/BA8ZMAZ5MWLZLeseNQXVsFqTiwmIUELCTIREzE0WxEYQgLXGWAwkAqRzweRxMjXP/mCygcNtgBoO7bt++RsRPG/pGItGHDhtn/NF//WQBlUVGRNmzYMLuysvzunj0Lno9GI7Fvv91/4aRJ53/bhonhbz/ys6u6ZdNst+YM0zjcwhZMwt2gW+reoyH+wU2LN3wGEKpqapd36ZQzIxZuEstvvVmpW7sRQU8ANjhihg3L7YM7IwN2PAErFoMAISkIaYW9cd3vF2PA2NE2AK24+OALAwcOvutvweD+ywXQdnPSGGP2sWPHnszLy3soHo/XlpSUTBg+fHjZmTC0ceMuT7tqfBdPY2MjFr2S0wy8aLaP8bvbp57dOyO0ZNS028d26juVhJT867ffwaG1m9DSEkd2/74YOmUycnr3kvHGRlm2aw9rrG9gOXk9+OjLL0FqeroNQCsvL19eWFg4q4150ebM/bc31o68rKmp+WMburNs48aNnQDg0IoFLqIFf2N7dfU+NmvU6JUPTXh5+5NjjPKXzqHtTwyUFV+/QkKafwsH/WMIaZuIKBKJvNs2F+XvgbD/yzXgDGgdZ4zJqqqq1V26dLkiEmnec/jwjgvOPffyOAA8due1F5+V0ngxJcMJlaGHVxHDMlPUXplBgmlYsCQkcXBDOPB2GQJPl/FIye0J1RNES91Jp/HgdvW7quS2UVfe/m5GeupkQZSTlZV1js/vV3VdX+vz+S5rc3Hpb3l5/60COBNfOGrUKPeaNZ9s6tgxZ2wk0rx56dIXJi9cuFAsvGNWl+EdG78c180oiDYlIaVE0hZwQI4kroCDgXO4XAoajzQhdDIGuD2AwkWqh5TSKJ16Yf3pkaVAbRuK/OOCgoIrY7HYzjVr1lw4e/ZsfeHChVi06K+AE/9zAmivAeCcy2effTZj1qxZ2zp06DCgqanp/aysrJkAMOPSMek3j1F29gokCmNx25bgGjECtdUgKCpD9KQBo8aCxhjIkVJ1M34C7siWej5x2Y6SvSQcfryy8v0ePXtOj8Vihw8dOjR29OjR4bZaBvnvzJ//28agzWW+9957wytXrpwSCoVOZmZmzqitrX4ZAD7Y8E3z6n3m5ONJT63fp2lMklTAwAlQVY7YKRNGlQ6Nt6IUfF6G08zTtLZWnPenbYf3knDQ2Nj4fI+ePacnEomTFRUVl44ePTrc5t/Lf3f+/L/CIk6bNk1s3bpVve22205u27btsqampnBOTudbKirKnyaSWLJq99H1JWzyad0d8/sUJomkqnAkq02Yp3X4uAJIIr/GqNnl5V+FxOz3dpQfAkmcOnVqflZW1p3JZLKprKzssqFDh57cunWr+vf8+/+11l4EsXLlyvHRaFQnIvrmm7883r7bnr5x5MTi359rV//hHLH/nv7yL5f3pP1TC2j31Hy5f3ovZ/us/nTPmF73tK/L6dOnbyIi0nU9WVxcPP5fKn74n27tE9yyZcvUeDzuCOHQrl1fzWv//sdfj56+f9EI2vfzPHvfFfmyaGo+HZzWy945pz89PmXAvHazdOLEiamWZQld1+WBAwem/iSY/6EQdu/ePcu2LUokY/TVV9tmtGvCoxML7911dR86clUv8/D0XubBuf3piUmFi9v7b9m0abppmgYR0aFDh25q90DxU2pnlMI82FZFZn2y9pNJ7d8fn5j/Vtn1fal83gBaMuWsN9p/LysrG9TS0pIgIiorK5v/k1r5HxNCcXHxs0REoVBDZM2alcNav470vnLVoA/fnDPifaCrt61oY3A8Hj9JRFRaWvrCT5r5Hwqhvr52CRFRY0N91RtvvFHww/998MEHufUN9dVEROXl5e+f0Zf91AXQfm9g4XD4TSKi+oa6kqeffjqnrZCS33fffTmNjY37iIiOHj26GYD2j4osf4pC4AB4JNKyjojo1KlTOwG4ALgqKyt3ERGdPn16z8yZM1OIiC1YsIDj/1JrX9E333wzraUlspOIqLKyYnV5eflqIqLm5uY9Dz/8cKd/tuT1JyuEtpMhKxFPlLTfbSORyOlvv/02p716Df+XW3uZbGlpaZ5pmtXxeLz5448/HnLmt//zrZ3RkpKS0ZWVlWP+N5n/f8uKMNkIKMASAAAAAElFTkSuQmCC";
const NUTRITION_ICON_LG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AABJz0lEQVR42u29d5xV1dU3/l17n3PvnTudGYbeOwxFGRBsgCUK9jJjiwXNMyYxQNQYk2i8TPQxUaOCNWBFrDN2EZCoAwqCUpQy9DaUqUy/7ZS91++Pc+7I4+vz5Ckm7/v+3pzPZz7izC37rLX3Kt/1XesAP8AViUQEMxtCiO/+ie68887sp56aV7h9+/bCpqamwkOHDhV+8MEHhbNnzx4CIPDdNzCzLC8vl/iBr9Qav+dPZmlpad/XX3+9cO/evYVNTU2FtbW1hZWVlYU///nPBwP4N+8hIjCzEYlExA+xLvqfvJmZaeXKlXLatGlu6nfPPvvsCWPHjj21d++eE7TmceFwWq7jON0yMjLYMALMzEgkEsKyLFspVee67r6GhoYqy4p/WFZ239crVqxo9j9b+Des/6eCnzt3LhGR8n9lvP32+5MGD+57ajgcPikYDI0MBgMFhmGmh8NpWkoJZkIymRSJRMJWSh2Jx+O7Y7HY5y0tLR9PnTq1CoCd2iwANBEx/tGX/+UAgIcffrjX7t07f3n06OGv29pa+b9zKeVwfX1t4759e55/8803T//O99D/dI0PPvjgmJ07t9/X0FC/I5lM/rfWGIvF+OjRI3s3b978x6effrr/933PP0LwlNqdv/3t7G7V1dX3NjUda/6+BVtWkpubm44dPXpo986dOzYmErE3otFoxc6dO7c1NjbsOXasIeG69vfcaJQPHjz44bvvvntS6tj/V8wSMwtmJgD4/PPPB1ZXVz/X1HTM+b41trQ066amYwd27dqxu6Wl6b1YLPZGS0vr+zt37tzV1NR0sKnpmPt974tGO1q2bdv69Lx587qlvvOHMkv/7nW8EFatWn3DsWPHDnnL0Z0La2pqqq+uri7ftGnTz1atWjVx1qzfdgXwfQuT9957b78vvvhiyubNm/+wf/++jR0d7f/mJtvaWtWePXsePP/888P+TRp/a42VlZWp14jNmzfPjUajbcd/pm3b3NTU9E1VVdVjK1euLHn22WcLAQS/55QRgNDChQuHLlu27NodO3a8eOxY477j75WZubW15dDXX2+44ftk9INeqRv713/912779+9/2zccvvlw+ejRw19UVVVde9ttt+X/L46GCJ5tZYOZ5fc4awDAokWLTt25c+fC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";

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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.97)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, animation:"fadeIn .3s" }}>
      <div style={{ width:"300px", padding:"30px 26px", background:"rgba(15,15,15,.98)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"20px", animation:"pop .3s", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:"14px", right:"14px", background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:"16px" }}>✕</button>
        <div style={{ textAlign:"center", marginBottom:"26px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"13px", background:"rgba(232,41,74,.15)", border:"1px solid rgba(232,41,74,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:"22px" }}>🔐</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:"17px", letterSpacing:"3px", color:"var(--rd)", marginBottom:"3px" }}>ADMIN ACCESS</div>
          <Mono style={{ textAlign:"center" }}>FITPLUS CONTROL PANEL</Mono>
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

  const rev = (trainers.filter(t=>t.plan==="starter").length*4.99 + trainers.filter(t=>t.plan==="pro").length*9.99 + trainers.filter(t=>t.plan==="unlimited").length*14.99 + members.filter(m=>m.plan==="pro").length*5.99).toFixed(2);
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"var(--bg)", zIndex:9000, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px", background:"rgba(15,15,15,.98)", borderBottom:"1px solid rgba(232,41,74,.2)", display:"flex", alignItems:"center", gap:"11px", flexShrink:0 }}>
        <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:"rgba(232,41,74,.15)", border:"1px solid rgba(232,41,74,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>🔐</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"3px", color:"var(--rd)" }}>ADMIN PANEL</div>
          <Mono>FITPLUS CONTROL</Mono>
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
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, animation:"fadeIn .2s" }}>
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
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, animation:"fadeIn .2s" }}>
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
// ─── Nutrition Overview Tab with Food Intake Logger ───────────────────────────
function OverviewTab({ macros, water, totalKcal }) {
  const today = new Date().toDateString();
  const storageKey = "f2a_food_log_" + today;
  const [foodLog, setFoodLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [foodCal, setFoodCal] = useState("");
  const [foodP, setFoodP] = useState("");
  const [foodC, setFoodC] = useState("");
  const [foodF, setFoodF] = useState("");

  const consumedCal = foodLog.reduce((a, f) => a + (f.cal||0), 0);
  const consumedP   = foodLog.reduce((a, f) => a + (f.p||0), 0);
  const consumedC   = foodLog.reduce((a, f) => a + (f.c||0), 0);
  const consumedFat = foodLog.reduce((a, f) => a + (f.f||0), 0);
  const pct = Math.min(100, totalKcal > 0 ? (consumedCal / totalKcal) * 100 : 0);
  const over = consumedCal > totalKcal;
  const circleCol = consumedCal === 0 ? "rgba(255,255,255,.12)" : over ? "#ef4444" : "#22c55e";
  const circleR = 33;
  const circleCircumference = 2 * Math.PI * circleR;
  const strokeDash = (pct / 100) * circleCircumference;

  function addFood() {
    if (!foodName || !foodCal) return;
    const entry = { id:Date.now(), name:foodName, cal:parseInt(foodCal)||0, p:parseInt(foodP)||0, c:parseInt(foodC)||0, f:parseInt(foodFat)||0, time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) };
    const updated = [...foodLog, entry];
    setFoodLog(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
    setFoodName(""); setFoodCal(""); setFoodP(""); setFoodC(""); setFoodF(""); setShowAdd(false);
  }

  function removeFood(id) {
    const updated = foodLog.filter(f => f.id !== id);
    setFoodLog(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  }

  // fix: use foodF not foodFat
  const foodFat = foodF;

  return (
    <div>
      {/* Main card: target donut LEFT + consumed donut RIGHT */}
      <Card style={{ padding:"13px", marginBottom:"10px" }}>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          {/* Target donut */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              {[{v:macros.p*4,col:"var(--tr)",off:0},{v:macros.c*4,col:"var(--acc)",off:macros.p*4/totalKcal*circleCircumference},{v:macros.f*9,col:"var(--a3)",off:(macros.p*4+macros.c*4)/totalKcal*circleCircumference}].map((s,i)=>(
                <circle key={i} cx="50" cy="50" r={circleR} fill="none" stroke={s.col} strokeWidth="9"
                  strokeDasharray={`${s.v/totalKcal*circleCircumference} ${circleCircumference}`}
                  strokeDashoffset={-s.off} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition:"all .6s" }}/>
              ))}
              <text x="50" y="47" textAnchor="middle" fill="var(--acc)" fontSize="13" fontFamily="Orbitron,sans-serif" fontWeight="900">{totalKcal}</text>
              <text x="50" y="57" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="7" fontFamily="Space Mono,monospace">target</text>
            </svg>
            <Mono style={{ fontSize:"9px", marginTop:"2px" }}>DAILY TARGET</Mono>
          </div>

          {/* Macros list */}
          <div style={{ flex:1 }}>
            <Mono style={{ marginBottom:"7px" }}>DAILY TARGETS</Mono>
            {[{l:"Protein",v:macros.p,c:"var(--tr)"},{l:"Carbs",v:macros.c,c:"var(--acc)"},{l:"Fat",v:macros.f,c:"var(--a3)"},{l:"Fiber",v:macros.fiber,c:"var(--a4)"}].map(m=>(
              <div key={m.l} style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"2px", background:m.c, flexShrink:0 }}/>
                <span style={{ fontSize:"11px", color:"var(--mut)", width:"42px" }}>{m.l}</span>
                <span style={{ fontFamily:"var(--fm)", fontSize:"11px", color:m.c }}>{m.v}g</span>
              </div>
            ))}
          </div>

          {/* Consumed donut */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle cx="50" cy="50" r={circleR} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9"/>
              {/* Progress ring */}
              {consumedCal > 0 && (
                <circle cx="50" cy="50" r={circleR} fill="none" stroke={circleCol} strokeWidth="9"
                  strokeDasharray={`${strokeDash} ${circleCircumference}`}
                  strokeDashoffset={0} strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition:"all .5s ease" }}/>
              )}
              <text x="50" y="45" textAnchor="middle" fill={circleCol} fontSize="13" fontFamily="Orbitron,sans-serif" fontWeight="900">{consumedCal}</text>
              <text x="50" y="55" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="7" fontFamily="Space Mono,monospace">consumed</text>
              <text x="50" y="63" textAnchor="middle" fill={over?"#ef4444":"rgba(255,255,255,.3)"} fontSize="7" fontFamily="Space Mono,monospace">{over?"OVER!":Math.round(pct)+"%"}</text>
            </svg>
            <Mono style={{ fontSize:"9px", marginTop:"2px", color:over?"#ef4444":"var(--mut)" }}>
              {over ? "OVER TARGET" : "DAILY INTAKE"}
            </Mono>
          </div>
        </div>

        {/* Consumed macro bars */}
        {foodLog.length > 0 && (
          <div style={{ marginTop:"10px", paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
            {[{l:"Protein",v:consumedP,t:macros.p,c:"var(--tr)"},{l:"Carbs",v:consumedC,t:macros.c,c:"var(--acc)"},{l:"Fat",v:consumedFat,t:macros.f,c:"var(--a3)"}].map(m=>(
              <div key={m.l} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px" }}>
                <span style={{ fontSize:"10px", color:"var(--mut)", width:"40px" }}>{m.l}</span>
                <div style={{ flex:1, height:"4px", background:"rgba(255,255,255,.07)", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:Math.min(100, m.t>0?m.v/m.t*100:0)+"%", background:m.c, borderRadius:"2px", transition:"width .5s" }}/>
                </div>
                <span style={{ fontSize:"10px", color:m.c, fontFamily:"var(--fm)", width:"44px", textAlign:"right" }}>{m.v}/{m.t}g</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Food intake log */}
      <Card style={{ padding:"13px", marginBottom:"10px", border:`1px solid ${over?"rgba(239,68,68,.25)":"rgba(34,197,94,.2)"}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <Mono style={{ color: over ? "#ef4444" : "#22c55e" }}>
            TODAY'S FOOD LOG
          </Mono>
          <button onClick={()=>setShowAdd(s=>!s)} style={{ padding:"5px 12px", background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.3)", borderRadius:"8px", color:"#22c55e", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"1px" }}>
            {showAdd ? "✕ CANCEL" : "+ ADD FOOD"}
          </button>
        </div>

        {/* Add food form */}
        {showAdd && (
          <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px", padding:"12px", marginBottom:"10px" }}>
            <input value={foodName} onChange={e=>setFoodName(e.target.value)} placeholder="Food name (e.g. Chicken breast 150g)"
              style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"9px", color:"var(--txt)", fontSize:"14px", fontFamily:"var(--fb)", outline:"none", marginBottom:"8px" }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"7px", marginBottom:"10px" }}>
              {[{l:"Calories",v:foodCal,s:setFoodCal,c:"var(--acc)"},{l:"Protein g",v:foodP,s:setFoodP,c:"var(--tr)"},{l:"Carbs g",v:foodC,s:setFoodC,c:"var(--a3)"},{l:"Fat g",v:foodF,s:setFoodF,c:"var(--yw)"}].map(f=>(
                <div key={f.l}>
                  <Mono style={{ fontSize:"8px", color:f.c, marginBottom:"3px" }}>{f.l}</Mono>
                  <input type="number" value={f.v} onChange={e=>f.s(e.target.value)} placeholder="0" inputMode="numeric"
                    style={{ width:"100%", padding:"8px 6px", background:"rgba(255,255,255,.05)", border:`1px solid ${f.c}30`, borderRadius:"7px", color:"var(--txt)", fontSize:"14px", fontFamily:"var(--fd)", outline:"none", textAlign:"center" }}/>
                </div>
              ))}
            </div>
            <button onClick={addFood} disabled={!foodName||!foodCal}
              style={{ width:"100%", padding:"11px", background:!foodName||!foodCal?"rgba(255,255,255,.05)":"#22c55e", border:"none", borderRadius:"9px", color:!foodName||!foodCal?"var(--mut)":"#000", cursor:!foodName||!foodCal?"default":"pointer", fontFamily:"var(--fd)", fontSize:"13px", letterSpacing:"1px" }}>
              ✓ ADD TO LOG
            </button>
          </div>
        )}

        {/* Food entries */}
        {foodLog.length === 0 ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <img src={NUTR_ICON_64} alt="" style={{ width:"44px", height:"44px", objectFit:"contain", marginBottom:"6px" }}/>
            <Mono style={{ color:"var(--mut)" }}>No food logged today</Mono>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,.3)", marginTop:"3px" }}>Tap "+ ADD FOOD" to start tracking</div>
          </div>
        ) : (
          <div>
            {foodLog.map((f,i)=>(
              <div key={f.id||i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 0", borderBottom:i<foodLog.length-1?"1px solid rgba(255,255,255,.05)":"none" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"13px", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                  <div style={{ fontSize:"10px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{f.time} · {f.p||0}g P · {f.c||0}g C · {f.f||0}g F</div>
                </div>
                <div style={{ fontFamily:"var(--fd)", fontSize:"14px", color:"var(--acc)", flexShrink:0 }}>{f.cal} kcal</div>
                <button onClick={()=>removeFood(f.id||i)} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", borderRadius:"6px", color:"#ef4444", cursor:"pointer", padding:"3px 8px", fontSize:"11px" }}>✕</button>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"8px", marginTop:"4px", borderTop:"1px solid rgba(255,255,255,.08)" }}>
              <Mono>TOTAL TODAY</Mono>
              <div style={{ fontFamily:"var(--fd)", fontSize:"14px", color: over ? "#ef4444" : "#22c55e" }}>{consumedCal} / {totalKcal} kcal</div>
            </div>
          </div>
        )}
      </Card>

      {/* Water tracker */}
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
  );
}


// Inline nutrition icon — replaces 🥗/🍽️ emoji throughout app
function NutriIcon({ size=22, style={} }) {
  return <img src={NUTRITION_ICON} alt="nutrition" style={{ width:size+"px", height:size+"px", objectFit:"contain", verticalAlign:"middle", display:"inline-block", ...style }}/>;
}

// ─── Advanced Nutrition Plan — AI-generated 4-week plan (paid feature £9.99) ─
function AdvancedNutritionPlan({ user, profile, onBack }) {
  const STORAGE_KEY = "adv_nutrition_" + (user?.email||"guest");
  const PAID_KEY   = "adv_nutrition_paid_" + (user?.email||"guest");
  const EXPIRY_KEY = "adv_nutrition_expiry_" + (user?.email||"guest");

  // Check full-access bypass
  const isFreeAccess = isFullAccess(user?.email);

  // Check if paid (or free access) and not expired
  const isPaid = (() => {
    if (isFreeAccess) return true;
    try {
      const paid = localStorage.getItem(PAID_KEY);
      if (!paid) return false;
      const expiry = localStorage.getItem(EXPIRY_KEY);
      if (expiry && new Date() > new Date(expiry)) {
        // Expired — clear plan
        localStorage.removeItem(PAID_KEY);
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      return true;
    } catch { return false; }
  })();

  const [plan, setPlan] = useState(() => {
    if (!isPaid) return null;
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  function handlePaymentSuccess() {
    // Mark as paid with 6-week expiry
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 42); // 6 weeks
    try {
      localStorage.setItem(PAID_KEY, "true");
      localStorage.setItem(EXPIRY_KEY, expiry.toISOString());
    } catch {}
    setShowPayment(false);
    setPaymentDone(true);
  }
  const [msgIdx, setMsgIdx] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDay, setActiveDay] = useState(null);

  const genMsgs = [
    "Calculating your calorie targets...",
    "Designing macro splits by week...",
    "Building personalised meal plans...",
    "Adding supplement protocol...",
    "Finalising grocery lists...",
    "Optimising meal timing..."
  ];

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(()=>setMsgIdx(i=>(i+1)%genMsgs.length), 1800);
    return ()=>clearInterval(t);
  }, [loading]);

  async function generatePlan() {
    setLoading(true);
    const goal    = (profile?.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim() || "General Fitness";
    const level   = (profile?.level||"").replace(/[🌱🌿💪🔥🏆]/g,"").trim() || "Intermediate";
    const bmr     = profile?.bmr || 1800;
    const tdee    = profile?.tdee || 2400;
    const wkg     = profile?.weightKg || 75;
    const gender  = profile?.gender || "unknown";
    const bioAge  = profile?.bioAge || profile?.bmrAge || null;
    const days    = parseInt(profile?.days)||4;

    const PROMPT = `You are a registered dietitian and sports nutritionist. Create a complete, highly detailed 4-week advanced nutrition plan.

ATHLETE PROFILE:
- Goal: ${goal}
- Level: ${level}
- BMR: ${bmr} kcal/day | TDEE: ${tdee} kcal/day
- Body Weight: ${wkg}kg
- Gender: ${gender}
${bioAge ? `- Fitness Age: ${bioAge} years` : ""}
- Training Days/Week: ${days}

REQUIREMENTS:
1. 4 progressive weeks: Week 1 baseline → Week 2 adjustment → Week 3 optimisation → Week 4 peak/carb cycle
2. Training days vs rest days must have different macro splits
3. Each week includes 7 days of meals (Mon-Sun) with 5-6 meals per day
4. Each meal: name, calories, protein(g), carbs(g), fat(g), ingredients list, prep instructions, timing
5. Include pre/post workout meal windows with exact timing
6. Progressive calorie/macro changes week to week based on goal
7. Include supplement stack recommendations with dosing and timing
8. Weekly grocery list with quantities
9. Meal prep tips for efficiency

NUTRITION TARGETS:
${goal.toLowerCase().includes("fat") ? `- Calorie deficit: ${Math.round(tdee*0.8)}-${Math.round(tdee*0.85)} kcal/day training days, ${Math.round(tdee*0.75)} rest days
- Protein: ${Math.round(wkg*2.2)}g/day (preserve muscle)
- Carbs: lower on rest days, moderate on training days
- Strategy: progressive deficit, refeed every 7 days` :
goal.toLowerCase().includes("muscle") ? `- Calorie surplus: ${Math.round(tdee*1.1)}-${Math.round(tdee*1.15)} kcal training days, ${Math.round(tdee*1.02)} rest days
- Protein: ${Math.round(wkg*2.2)}g/day
- Carbs: high on training days (muscle glycogen), moderate on rest
- Strategy: lean bulk with macro cycling` :
`- Maintenance: ${tdee} kcal/day
- Protein: ${Math.round(wkg*1.8)}g/day
- Balanced macros with performance focus`}

Return ONLY valid JSON (no markdown):
{
  "planName": "string",
  "overview": "3-sentence overview",
  "totalDuration": "4 weeks",
  "dailyCalorieTarget": {"training": number, "rest": number},
  "macroSplit": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
  "weeks": [
    {
      "week": 1,
      "theme": "string",
      "focus": "string",
      "calorieTarget": {"training": number, "rest": number},
      "macros": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
      "days": [
        {
          "day": "Monday",
          "type": "training",
          "totalCalories": number,
          "macros": {"protein": number, "carbs": number, "fat": number},
          "meals": [
            {
              "mealNumber": 1,
              "mealName": "Breakfast",
              "time": "7:00 AM",
              "calories": number,
              "protein": number,
              "carbs": number,
              "fat": number,
              "foods": ["food with quantity"],
              "prepTime": "X min",
              "prep": "preparation instructions",
              "notes": "timing or goal-specific tip"
            }
          ]
        }
      ],
      "supplements": [{"name": "string", "dose": "string", "timing": "string", "benefit": "string"}],
      "groceryList": [{"item": "string", "quantity": "string", "category": "Protein/Carbs/Veg/Fats/Other"}],
      "mealPrepTips": ["tip1", "tip2"],
      "weeklyTips": ["tip1", "tip2", "tip3"]
    }
  ],
  "supplementStack": [{"name":"string","dose":"string","timing":"string","benefit":"string","priority":"Essential/Beneficial/Optional"}],
  "hydrationProtocol": "detailed daily hydration guidance",
  "cheatMealGuidance": "when and how to include flexible meals"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:8000,
          messages:[{role:"user", content:PROMPT}]
        })
      });
      const data = await res.json();
      const raw = (data.content?.[0]?.text||"").replace(/```json/g,"").replace(/```/g,"").trim();
      const parsed = JSON.parse(raw);
      setPlan(parsed);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch {}
    } catch(e) {
      console.error(e);
      setPlan({ error: "Generation failed. Please try again." });
    }
    setLoading(false);
  }

  // ── PAYMENT MODAL ──
  if (showPayment) return (
    <PayPalModal
      planName="Advanced Nutrition Plan"
      amount="9.99"
      onSuccess={handlePaymentSuccess}
      onClose={()=>setShowPayment(false)}
    />
  );

  // ── WELCOME / GENERATE SCREEN (after payment) ──
  if ((isPaid || paymentDone) && !plan && !loading) return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"#0a0a0a", zIndex:700, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px", textAlign:"center" }}>
      <div style={{ fontSize:"64px", marginBottom:"20px" }}>🥗</div>
      <div style={{ fontFamily:"var(--fd)", fontSize:"24px", letterSpacing:"2px", color:"#22c55e", marginBottom:"12px" }}>WELCOME!</div>
      <div style={{ fontSize:"15px", color:"rgba(255,255,255,.7)", lineHeight:1.8, marginBottom:"8px" }}>
        Your Advanced Nutrition Plan is ready to generate.
      </div>
      <div style={{ fontSize:"13px", color:"rgba(255,255,255,.4)", lineHeight:1.6, marginBottom:"32px" }}>
        This is a personalised 4-week plan built around your goals, BMR, and training schedule. It takes about 20-30 seconds to create.
      </div>
      <button onClick={generatePlan}
        style={{ width:"100%", maxWidth:"320px", padding:"18px", background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:"14px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px", boxShadow:"0 8px 32px rgba(34,197,94,.35)", marginBottom:"12px" }}>
        🌿 GENERATE MY NUTRITION PLAN
      </button>
      <div style={{ fontSize:"11px", color:"rgba(255,255,255,.3)", fontFamily:"var(--fm)" }}>Valid for 6 weeks · Stored on your device</div>
      {isFreeAccess && <div style={{ marginTop:"10px", fontSize:"11px", color:"#22c55e", fontFamily:"var(--fm)" }}>⚡ Full access granted</div>}
    </div>
  );

  // ── LOADING STATE ──
  if (loading) return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"#0a0a0a", zIndex:700, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"30px", textAlign:"center" }}>
      <div style={{ position:"relative", width:"80px", height:"80px", marginBottom:"28px" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, borderRadius:"50%", border:"3px solid rgba(34,197,94,.15)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"#22c55e", animation:"spin 1s linear infinite" }}/>
        <div style={{ position:"absolute", top:"10px", left:"10px", right:"10px", bottom:"10px", borderRadius:"50%", border:"2px solid transparent", borderTopColor:"rgba(34,197,94,.4)", animation:"spin 1.6s linear infinite reverse" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", alignItems:"center", justifyContent:"center", display:"flex",alignItems:"center",justifyContent:"center"}}><NutriIcon size={38}/></div>
      </div>
      <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:"#22c55e", letterSpacing:"3px", marginBottom:"10px" }}>BUILDING YOUR NUTRITION PLAN</div>
      <div style={{ fontSize:"13px", color:"rgba(255,255,255,.55)", fontFamily:"var(--fm)", marginBottom:"6px", minHeight:"20px" }}>{genMsgs[msgIdx]}</div>
      <Mono style={{ fontSize:"10px", color:"rgba(255,255,255,.25)" }}>Powered by Claude AI · Usually takes 20-30 seconds</Mono>
      <div style={{ marginTop:"28px", display:"flex", flexDirection:"column", gap:"8px", width:"100%", maxWidth:"260px" }}>
        {["4-week progressive nutrition plan","Daily meal schedules (5-6 meals)","Goal-specific macro targets","Supplement protocol + grocery lists"].map((f,i)=>(
          <div key={i} style={{ display:"flex", gap:"8px", padding:"8px 12px", background:"rgba(34,197,94,.05)", border:"1px solid rgba(34,197,94,.12)", borderRadius:"9px", alignItems:"center" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e", flexShrink:0 }}/>
            <span style={{ fontSize:"12px", color:"rgba(255,255,255,.6)", fontFamily:"var(--fm)" }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── PLAN VIEW ──
  if (plan && !plan.error) {
    const week = plan.weeks?.[activeWeek];
    return (
      <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"#0a0a0a", zIndex:700, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
        {/* Header */}
        <div style={{ flexShrink:0, padding:"14px 16px 10px", background:"rgba(10,10,10,.98)", borderBottom:"1px solid rgba(34,197,94,.15)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
            <button onClick={onBack} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"10px", color:"var(--txt)", cursor:"pointer", padding:"8px 13px", fontSize:"12px", fontFamily:"var(--fm)" }}>← BACK</button>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"1px", color:"#22c55e" }}>{plan.planName || "ADVANCED NUTRITION PLAN"}</div>
              <div style={{ fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)" }}>4 Weeks · Personalised · AI-Generated</div>
            </div>
            <div style={{ padding:"4px 10px", background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.3)", borderRadius:"20px", fontSize:"10px", color:"#22c55e", fontFamily:"var(--fd)" }}>⚡ PRO</div>
          </div>
          {/* Week selector */}
          <div style={{ display:"flex", gap:"6px", overflowX:"auto" }}>
            {(plan.weeks||[]).map((w,i)=>(
              <button key={i} onClick={()=>{setActiveWeek(i);setActiveDay(null);}} style={{ flexShrink:0, padding:"6px 14px", background:activeWeek===i?"rgba(34,197,94,.15)":"rgba(255,255,255,.04)", border:`1px solid ${activeWeek===i?"rgba(34,197,94,.4)":"rgba(255,255,255,.08)"}`, borderRadius:"10px", cursor:"pointer", textAlign:"left", minWidth:"90px" }}>
                <div style={{ fontFamily:"var(--fd)", fontSize:"11px", color:activeWeek===i?"#22c55e":"var(--txt)", letterSpacing:"1px" }}>WEEK {w.week}</div>
                <div style={{ fontSize:"10px", color:"var(--mut)", marginTop:"1px" }}>{w.theme}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", minHeight:0, WebkitOverflowScrolling:"touch", padding:"14px 16px 100px" }}>
          {week && (
            <>
              {/* Week overview */}
              <Card style={{ padding:"14px", marginBottom:"14px", border:"1px solid rgba(34,197,94,.2)" }}>
                <div style={{ fontFamily:"var(--fd)", fontSize:"12px", color:"#22c55e", letterSpacing:"2px", marginBottom:"8px" }}>WEEK {week.week}: {week.theme?.toUpperCase()}</div>
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)", lineHeight:1.65, marginBottom:"12px" }}>{week.focus}</div>
                {/* Macro targets */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"10px" }}>
                  {[
                    { label:"Training Day", cal:week.calorieTarget?.training, col:"#22c55e" },
                    { label:"Rest Day", cal:week.calorieTarget?.rest, col:"#60a5fa" },
                  ].map((t,i)=>(
                    <div key={i} style={{ padding:"10px", background:"rgba(255,255,255,.03)", border:`1px solid ${t.col}20`, borderRadius:"10px", textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--fd)", fontSize:"20px", color:t.col }}>{t.cal}</div>
                      <div style={{ fontSize:"9px", color:"var(--mut)", fontFamily:"var(--fm)" }}>kcal · {t.label}</div>
                    </div>
                  ))}
                </div>
                {/* Macro split */}
                {week.macros && (
                  <div style={{ display:"flex", gap:"6px" }}>
                    {[{l:"Protein",v:week.macros.protein,c:"#f87171"},{l:"Carbs",v:week.macros.carbs,c:"#60a5fa"},{l:"Fat",v:week.macros.fat,c:"#fbbf24"}].map((m,i)=>(
                      <div key={i} style={{ flex:1, padding:"7px", background:"rgba(255,255,255,.03)", border:`1px solid ${m.c}20`, borderRadius:"9px", textAlign:"center" }}>
                        <div style={{ fontFamily:"var(--fd)", fontSize:"14px", color:m.c }}>{m.v}</div>
                        <div style={{ fontSize:"9px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Days */}
              <Mono style={{ marginBottom:"10px" }}>DAILY MEAL PLANS</Mono>
              {(week.days||[]).map((day,di)=>(
                <div key={di}>
                  <div onClick={()=>setActiveDay(activeDay===di?null:di)}
                    style={{ padding:"12px 14px", marginBottom:"6px", background:"rgba(255,255,255,.03)", border:`1px solid ${activeDay===di?"rgba(34,197,94,.3)":"rgba(255,255,255,.07)"}`, borderRadius:"12px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:"14px" }}>{day.day}</div>
                      <div style={{ fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)", marginTop:"1px" }}>
                        {day.type==="training"?"🏋️ Training":"😴 Rest"} · {day.totalCalories} kcal · P:{day.macros?.protein}g C:{day.macros?.carbs}g F:{day.macros?.fat}g
                      </div>
                    </div>
                    <span style={{ color:"var(--mut)", fontSize:"14px", transform:activeDay===di?"rotate(90deg)":"none", transition:"transform .2s" }}>›</span>
                  </div>
                  {activeDay===di && (
                    <div style={{ marginBottom:"12px", animation:"fadeIn .2s" }}>
                      {(day.meals||[]).map((meal,mi)=>(
                        <Card key={mi} style={{ padding:"13px", marginBottom:"8px", border:"1px solid rgba(255,255,255,.07)", marginLeft:"8px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                            <div>
                              <div style={{ fontFamily:"var(--fd)", fontSize:"13px", color:"#22c55e", letterSpacing:"1px" }}>{meal.mealName}</div>
                              <div style={{ fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)" }}>⏰ {meal.time} · {meal.prepTime} prep</div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--txt)" }}>{meal.calories}</div>
                              <div style={{ fontSize:"9px", color:"var(--mut)", fontFamily:"var(--fm)" }}>kcal</div>
                            </div>
                          </div>
                          {/* Macro pills */}
                          <div style={{ display:"flex", gap:"5px", marginBottom:"8px" }}>
                            {[{l:"P",v:meal.protein,c:"#f87171"},{l:"C",v:meal.carbs,c:"#60a5fa"},{l:"F",v:meal.fat,c:"#fbbf24"}].map((m,i)=>(
                              <div key={i} style={{ padding:"3px 8px", background:"rgba(255,255,255,.04)", border:`1px solid ${m.c}30`, borderRadius:"20px", fontSize:"11px", color:m.c, fontFamily:"var(--fd)" }}>{m.l}: {m.v}g</div>
                            ))}
                          </div>
                          {/* Foods */}
                          <div style={{ marginBottom:"8px" }}>
                            {(meal.foods||[]).map((f,fi)=>(
                              <div key={fi} style={{ fontSize:"12px", color:"rgba(255,255,255,.7)", padding:"2px 0", display:"flex", gap:"6px", alignItems:"flex-start" }}>
                                <span style={{ color:"#22c55e", fontSize:"10px", marginTop:"2px", flexShrink:0 }}>•</span>{f}
                              </div>
                            ))}
                          </div>
                          {/* Prep */}
                          {meal.prep && <div style={{ fontSize:"12px", color:"rgba(255,255,255,.5)", lineHeight:1.6, borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:"7px", marginTop:"4px" }}>👨‍🍳 {meal.prep}</div>}
                          {meal.notes && <div style={{ fontSize:"11px", color:"#60a5fa", marginTop:"5px", fontStyle:"italic" }}>💡 {meal.notes}</div>}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Supplements */}
              {week.supplements?.length > 0 && (
                <div style={{ marginTop:"8px" }}>
                  <Mono style={{ marginBottom:"10px" }}>💊 SUPPLEMENT PROTOCOL</Mono>
                  {week.supplements.map((s,i)=>(
                    <Card key={i} style={{ padding:"11px 14px", marginBottom:"7px", border:"1px solid rgba(168,85,247,.2)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"3px" }}>
                        <div style={{ fontFamily:"var(--fd)", fontSize:"13px", color:"#c084fc" }}>{s.name}</div>
                        <div style={{ fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)" }}>{s.dose}</div>
                      </div>
                      <div style={{ fontSize:"11px", color:"var(--mut)" }}>⏰ {s.timing}</div>
                      <div style={{ fontSize:"11px", color:"rgba(255,255,255,.5)", marginTop:"3px" }}>{s.benefit}</div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Grocery list */}
              {week.groceryList?.length > 0 && (
                <div style={{ marginTop:"16px" }}>
                  <Mono style={{ marginBottom:"10px" }}>🛒 WEEKLY GROCERY LIST</Mono>
                  {["Protein","Carbs","Veg","Fats","Other"].map(cat=>{
                    const items = week.groceryList.filter(g=>(g.category||"Other")===cat);
                    if (!items.length) return null;
                    return (
                      <div key={cat} style={{ marginBottom:"10px" }}>
                        <div style={{ fontSize:"10px", color:"var(--mut)", fontFamily:"var(--fm)", letterSpacing:"1px", marginBottom:"5px" }}>{cat.toUpperCase()}</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                          {items.map((g,i)=>(
                            <div key={i} style={{ padding:"4px 10px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"20px", fontSize:"11px", color:"rgba(255,255,255,.75)" }}>
                              {g.item} <span style={{ color:"var(--mut)" }}>({g.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Meal prep tips */}
              {week.mealPrepTips?.length > 0 && (
                <div style={{ marginTop:"14px", padding:"12px 14px", background:"rgba(251,191,36,.05)", border:"1px solid rgba(251,191,36,.2)", borderRadius:"12px" }}>
                  <Mono style={{ color:"#fbbf24", marginBottom:"8px" }}>⚡ MEAL PREP TIPS</Mono>
                  {week.mealPrepTips.map((t,i)=>(
                    <div key={i} style={{ fontSize:"12px", color:"rgba(255,255,255,.65)", marginBottom:"4px", display:"flex", gap:"6px" }}>
                      <span style={{ color:"#fbbf24", flexShrink:0 }}>•</span>{t}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── PURCHASE / GENERATE PAGE ──
  const hasNutritionPlan = (() => {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
  })();

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <button onClick={onBack} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"10px", color:"var(--mut)", cursor:"pointer", padding:"8px 14px", fontSize:"12px", fontFamily:"var(--fm)", marginBottom:"16px" }}>← BACK</button>

      {/* Hero */}
      <div style={{ borderRadius:"16px", overflow:"hidden", marginBottom:"20px", position:"relative", background:"linear-gradient(135deg,rgba(34,197,94,.15),rgba(16,185,129,.08))", border:"1px solid rgba(34,197,94,.25)", padding:"24px" }}>
        <img src={NUTR_ICON_96} alt="nutrition" style={{ width:"64px", height:"64px", objectFit:"contain", marginBottom:"10px" }}/>
        <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px", marginBottom:"6px" }}>ADVANCED NUTRITION PLAN</div>
        <div style={{ fontSize:"13px", color:"rgba(255,255,255,.6)", lineHeight:1.7, marginBottom:"16px" }}>
          A fully personalised 4-week nutrition programme built by AI around your exact BMR, goals, and training schedule.
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:"6px", marginBottom:"16px" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"36px", color:"#22c55e" }}>£9.99</div>
          <div style={{ fontSize:"13px", color:"var(--mut)" }}>one-time · yours forever</div>
        </div>
        {/* Features */}
        <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
          {[
            "4-week personalised meal plans (28 days × 5-6 meals)",
            "Training day vs rest day macro cycling",
            "Daily grocery lists by category",
            "Supplement stack with dosing & timing",
            "Meal prep tips to save time",
            "Progressive calorie targets per week",
            "Goal-specific nutrition strategy",
          ].map((f,i)=>(
            <div key={i} style={{ display:"flex", gap:"8px", alignItems:"center", fontSize:"12px", color:"rgba(255,255,255,.75)" }}>
              <span style={{ color:"#22c55e", fontWeight:700, fontSize:"14px" }}>✓</span>{f}
            </div>
          ))}
        </div>
      </div>

      {plan?.error && (
        <Card style={{ padding:"12px", marginBottom:"14px", border:"1px solid rgba(239,68,68,.3)", background:"rgba(239,68,68,.06)" }}>
          <div style={{ fontSize:"13px", color:"#ef4444" }}>⚠️ {plan.error}</div>
        </Card>
      )}

      <button onClick={generatePlan}
        style={{ width:"100%", padding:"17px", background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:"14px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px", boxShadow:"0 6px 24px rgba(34,197,94,.3)", marginBottom:"10px" }}>
        <NutriIcon size={18} style={{marginRight:"7px"}}/> GENERATE MY NUTRITION PLAN
      </button>
      <div style={{ fontSize:"11px", color:"rgba(255,255,255,.3)", textAlign:"center", fontFamily:"var(--fm)" }}>
        Payment processed via PayPal · Instant access after purchase
      </div>
    </div>
  );
}


function NutritionHub({ user, profile }) {
  const [macros, setMacros] = useState({ p:165, c:220, f:60, fiber:30 });
  const [water, setWater] = useState(0);
  const [diet, setDiet] = useState("Standard");
  const [vw, setVw] = useState("overview");
  const [mealGoal, setMealGoal] = useState("Muscle Gain");
  const [mealTime, setMealTime] = useState("All meals");
  const [meals, setMeals] = useState(null);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [showAdvPlan, setShowAdvPlan] = useState(false);

  if (showAdvPlan) return <AdvancedNutritionPlan user={user} profile={profile} onBack={()=>setShowAdvPlan(false)}/>;

  // Meal plan limits based on subscription
  const memberEmail = user?.email || "";
  const memberPlan  = (() => {
    try {
      const s = JSON.parse(localStorage.getItem("f2a_member_sub")||"{}");
      return s.id || "free";
    } catch { return "free"; }
  })();
  const hasFullAccess = isFullAccess(memberEmail);
  const mealDays = hasFullAccess ? 7 : memberPlan === "pro" ? 7 : 2;
  const mealLabel = hasFullAccess ? "7-day" : memberPlan === "pro" ? "7-day" : "2-day";
  // Check if meal plan already generated this period
  const MEAL_GEN_KEY = "meal_plan_generated_" + memberEmail;
  const alreadyGenerated = (() => {
    if (hasFullAccess) return false;
    try {
      const ts = localStorage.getItem(MEAL_GEN_KEY);
      if (!ts) return false;
      const generated = new Date(ts);
      const now = new Date();
      if (memberPlan === "pro") {
        // Reset monthly (30 days)
        const diffDays = (now - generated) / (1000*60*60*24);
        return diffDays < 30;
      } else {
        // Free trial — never regenerate (one time)
        return true;
      }
    } catch { return false; }
  })();

  async function genMeals() {
    if (alreadyGenerated) return;
    setMealsLoading(true); setMeals(null);
    const goal   = mealGoal;
    const bmr    = profile?.bmr;
    const tdee   = profile?.tdee;
    const wkg    = profile?.weightKg;
    const gender = profile?.gender;
    const bioAge = profile?.bioAge || profile?.bmrAge;

    // Generate one day at a time to avoid token limits
    const allDays = [];
    try {
      for (let d = 1; d <= mealDays; d++) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:2000,
            messages:[{ role:"user", content:
              `You are a dietitian. Create a 1-day meal plan for Day ${d} of ${mealDays}.
Goal: ${goal}. Focus: ${mealTime}.${bmr?` TDEE: ${tdee}kcal.`:""}${wkg?` Weight: ${wkg}kg.`:""}${gender?` Gender: ${gender}.`:""}
Return ONLY a JSON object (no markdown, no extra text):
{"day":${d},"label":"Day ${d}","meals":[{"name":"Breakfast","time":"7:30 AM","calories":420,"protein":32,"carbs":48,"fat":11,"foods":["180g oats","250ml milk","1 banana"],"prep":"Cook oats in milk, top with banana.","tip":"Great energy for morning."}],"totalCalories":2100,"totalProtein":170,"totalCarbs":220,"totalFat":60}
Include exactly 5 meals: Breakfast, Mid-Morning Snack, Lunch, Afternoon Snack, Dinner. Make it realistic and goal-aligned.`
            }]
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || "API error");
        const raw = (data.content?.[0]?.text || "")
          .replace(/^```json\s*/,"").replace(/^```\s*/,"").replace(/\s*```$/,"").trim();
        // Find first { and last } to extract JSON cleanly
        const firstBrace = raw.indexOf("{");
        const lastBrace = raw.lastIndexOf("}");
        if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON in response");
        const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
        allDays.push(parsed);
      }
      // Build grocery list from all days
      const allFoods = allDays.flatMap(day =>
        (day.meals||[]).flatMap(m => m.foods||[])
      );
      const uniqueFoods = [...new Set(allFoods)].slice(0, 25);
      setMeals({ days: allDays, groceryList: uniqueFoods, notes:`${mealDays}-day ${goal} meal plan tailored to your TDEE and goals.` });
    } catch(err) {
      setMeals({ days:[{ day:1, label:"Day 1", meals:[{
        name:"Generation failed",
        time:"—", calories:0, protein:0, carbs:0, fat:0,
        foods:[], prep:`Error: ${err?.message||"Unknown error"}. Tap Generate again.`, tip:"Check your internet connection."
      }], totalCalories:0, totalProtein:0 }], groceryList:[], notes:"" });
    }
    if (!hasFullAccess) {
      try { localStorage.setItem(MEAL_GEN_KEY, new Date().toISOString()); } catch {}
    }
    setMealsLoading(false);
  }
  const totalKcal = macros.p*4 + macros.c*4 + macros.f*9;
  const diets = { Standard:{p:165,c:220,f:60}, "High Protein":{p:220,c:165,f:55}, Keto:{p:175,c:28,f:155}, Vegan:{p:110,c:275,f:60} };

  return (
    <div style={{ animation:"fadeIn .3s" }}>
      <div style={{ borderRadius:"12px", overflow:"hidden", marginBottom:"12px", background:"linear-gradient(135deg,rgba(34,197,94,.12),rgba(16,185,129,.06))", border:"1px solid rgba(34,197,94,.2)", padding:"16px 18px", display:"flex", alignItems:"center", gap:"16px" }}>
        <img src={NUTRITION_ICON_LG} alt="nutrition" style={{ width:"64px", height:"64px", objectFit:"contain", flexShrink:0 }}/>
        <div>
          <Mono style={{ color:"#22c55e", marginBottom:"3px" }}>FUEL CENTER</Mono>
          <div style={{ fontFamily:"var(--fd)", fontSize:"22px", letterSpacing:"2px" }}>NUTRITION <span style={{ color:"#22c55e" }}>HUB</span></div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"6px", marginBottom:"11px", overflowX:"auto" }}>
        {[["overview","📊"],["meals","🍽"],["macros","🎚️"],["water","💧"],["plans","⭐"]].map(([t,ic])=>(
          <button key={t} onClick={()=>setVw(t)} style={{ padding:"6px 12px", background:vw===t?t==="plans"?"linear-gradient(135deg,#22c55e,#16a34a)":"var(--a3)":"rgba(255,255,255,.04)", border:`1px solid ${vw===t?t==="plans"?"#22c55e":"var(--a3)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:vw===t?"#fff":"var(--mut)", cursor:"pointer", fontSize:"11px", fontFamily:"var(--fm)", letterSpacing:"1px", whiteSpace:"nowrap", flexShrink:0 }}>{ic} {t.toUpperCase()}</button>
        ))}
      </div>
      {/* Advanced Plan promo banner in overview */}
      {vw==="overview" && (
        <div onClick={()=>setVw("plans")} style={{ padding:"12px 14px", marginBottom:"12px", background:"linear-gradient(135deg,rgba(34,197,94,.08),rgba(16,185,129,.05))", border:"1px solid rgba(34,197,94,.22)", borderRadius:"12px", cursor:"pointer", display:"flex", alignItems:"center", gap:"12px" }}>
          <img src={NUTR_ICON_64} alt="" style={{ width:"36px", height:"36px", objectFit:"contain", flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"1px", color:"#22c55e", marginBottom:"2px" }}>ADVANCED NUTRITION PLAN — £9.99</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,.5)" }}>4-week personalised plan with daily meals, macros & grocery lists →</div>
          </div>
          <span style={{ color:"#22c55e", fontSize:"16px" }}>›</span>
        </div>
      )}
      {vw==="overview" && (
        <OverviewTab macros={macros} water={water} totalKcal={totalKcal}/>
      )}
      {vw==="meals" && (
        <div style={{ animation:"fadeIn .3s" }}>
          <Card style={{ padding:"14px", marginBottom:"12px", border:"1px solid rgba(2,132,199,.2)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}><img src={NUTR_ICON_32} alt="" style={{ width:"22px", height:"22px", objectFit:"contain" }}/><Mono>AI MEAL PLANNER</Mono></div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,.4)", fontFamily:"var(--fm)", marginBottom:"10px" }}>
              {hasFullAccess ? "⚡ Full access — 7-day plan" : memberPlan === "pro" ? "⭐ Pro — 7-day plan · Refreshes monthly" : "🆓 Free trial — 2-day plan · One time only"}
            </div>
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
              {mealsLoading ? "⏳ GENERATING..." : alreadyGenerated ? `✓ ${mealLabel.toUpperCase()} PLAN GENERATED` : `🌿 GENERATE ${mealLabel.toUpperCase()} MEAL PLAN`}
            </button>
          </Card>

          {mealsLoading && (
            <Card style={{ padding:"22px", textAlign:"center" }}>
              <div style={{ width:"40px", height:"40px", borderRadius:"50%", border:"3px solid var(--a3)", borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 12px" }}/>
              <Mono style={{ color:"var(--a3)" }}>AI crafting your meal plan...</Mono>
            </Card>
          )}

          {meals && !mealsLoading && (() => {
            // Handle both old format (meals array) and new multi-day format (days array)
            const days = meals.days || [{ day:1, label:"Day 1", meals: meals.meals||[], totalCalories: meals.dailyTotals?.calories, totalProtein: meals.dailyTotals?.protein }];
            const grocery = meals.groceryList || [];
            const notes = meals.notes || meals.nutritionNotes || "";
            return (
              <div style={{ animation:"fadeIn .3s" }}>
                {notes && (
                  <div style={{ padding:"11px 13px", background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.18)", borderRadius:"12px", marginBottom:"12px", fontSize:"12px", color:"rgba(255,255,255,.65)", lineHeight:1.65, fontStyle:"italic" }}>
                    💡 {notes}
                  </div>
                )}
                {days.map((dayObj, di) => (
                  <div key={di} style={{ marginBottom:"16px" }}>
                    <Mono style={{ color:"var(--a3)", marginBottom:"8px" }}>{dayObj.label || `DAY ${dayObj.day}`} · {dayObj.totalCalories||"—"} kcal</Mono>
                    {(dayObj.meals||[]).map((m,mi) => (
                      <Card key={mi} style={{ padding:"13px", marginBottom:"8px", border:"1px solid rgba(255,255,255,.07)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"7px" }}>
                          <div>
                            <div style={{ fontWeight:700, fontSize:"14px" }}>{m.name}</div>
                            <div style={{ fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)" }}>⏰ {m.time}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--acc)" }}>{m.calories}</div>
                            <div style={{ fontSize:"9px", color:"var(--mut)", fontFamily:"var(--fm)" }}>kcal</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:"5px", marginBottom:"7px" }}>
                          {[{l:"P",v:m.protein,c:"#f87171"},{l:"C",v:m.carbs,c:"#60a5fa"},{l:"F",v:m.fat,c:"#fbbf24"}].map((x,xi)=>(
                            <div key={xi} style={{ padding:"2px 7px", background:"rgba(255,255,255,.04)", border:`1px solid ${x.c}25`, borderRadius:"20px", fontSize:"11px", color:x.c, fontFamily:"var(--fd)" }}>{x.l}: {x.v}g</div>
                          ))}
                        </div>
                        {(m.foods||m.ingredients||[]).map((f,fi)=>(
                          <div key={fi} style={{ fontSize:"12px", color:"rgba(255,255,255,.65)", display:"flex", gap:"5px", marginBottom:"2px" }}>
                            <span style={{ color:"var(--a3)", flexShrink:0 }}>•</span>{f}
                          </div>
                        ))}
                        {m.prep && <div style={{ marginTop:"7px", fontSize:"12px", color:"rgba(255,255,255,.45)", lineHeight:1.6, borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:"6px" }}>👨‍🍳 {m.prep}</div>}
                        {m.tip && <div style={{ marginTop:"4px", fontSize:"11px", color:"var(--a3)", fontStyle:"italic" }}>💡 {m.tip}</div>}
                      </Card>
                    ))}
                    <div style={{ padding:"8px 12px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"10px", display:"flex", gap:"10px", flexWrap:"wrap" }}>
                      <span style={{ fontSize:"11px", color:"var(--mut)", fontFamily:"var(--fm)" }}>Totals:</span>
                      {[{l:"Calories",v:dayObj.totalCalories||"—",c:"var(--acc)"},{l:"Protein",v:(dayObj.totalProtein||"—")+"g",c:"#f87171"},{l:"Carbs",v:(dayObj.totalCarbs||"—")+"g",c:"#60a5fa"},{l:"Fat",v:(dayObj.totalFat||"—")+"g",c:"#fbbf24"}].map((t,ti)=>(
                        <span key={ti} style={{ fontSize:"11px", color:t.c, fontFamily:"var(--fd)" }}>{t.l}: {t.v}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {grocery.length > 0 && (
                  <Card style={{ padding:"13px", marginTop:"8px", border:"1px solid rgba(255,255,255,.07)" }}>
                    <Mono style={{ marginBottom:"8px" }}>🛒 GROCERY LIST</Mono>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                      {grocery.map((g,gi)=>(
                        <div key={gi} style={{ padding:"3px 9px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"20px", fontSize:"11px", color:"rgba(255,255,255,.7)" }}>{g}</div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}
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
      {vw==="plans" && (
        <div style={{ animation:"fadeIn .3s" }}>
          {/* Hero card */}
          <div style={{ borderRadius:"16px", overflow:"hidden", marginBottom:"16px", background:"linear-gradient(135deg,rgba(34,197,94,.12),rgba(16,185,129,.06))", border:"1px solid rgba(34,197,94,.28)", padding:"22px" }}>
            <img src={NUTR_ICON_96} alt="nutrition" style={{ width:"64px", height:"64px", objectFit:"contain", marginBottom:"10px" }}/>
            <div style={{ fontFamily:"var(--fd)", fontSize:"20px", letterSpacing:"2px", marginBottom:"6px" }}>ADVANCED NUTRITION PLAN</div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,.6)", lineHeight:1.7, marginBottom:"16px" }}>
              A fully AI-generated 4-week nutrition programme built around your exact BMR, TDEE, goals, and training schedule. No generic plans — everything personalised to you.
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:"6px", marginBottom:"16px" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:"34px", color:"#22c55e" }}>£9.99</div>
              <div style={{ fontSize:"13px", color:"var(--mut)" }}>one-time · yours forever</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:"20px" }}>
              {["28 days of personalised meals (5-6 meals/day)","Training day vs rest day macro cycling","Weekly progressive calorie targets","Daily grocery lists by food category","Supplement stack with exact dosing & timing","Meal prep strategies to save time","Hydration & recovery nutrition protocol"].map((f,i)=>(
                <div key={i} style={{ display:"flex", gap:"8px", alignItems:"center", fontSize:"12px", color:"rgba(255,255,255,.75)" }}>
                  <span style={{ color:"#22c55e", fontWeight:700 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={()=>setShowAdvPlan(true)}
              style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:"14px", color:"#fff", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", boxShadow:"0 6px 24px rgba(34,197,94,.3)", marginBottom:"10px" }}>
              <NutriIcon size={18} style={{marginRight:"7px"}}/> GET MY PLAN — £9.99
            </button>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,.3)", textAlign:"center", fontFamily:"var(--fm)" }}>
              Secure payment · Instant access · AI-generated in ~30 seconds
            </div>
          </div>

          {/* What's included breakdown */}
          <Mono style={{ marginBottom:"10px" }}>WHAT YOU GET</Mono>
          {[
            { icon:"📅", title:"4 Progressive Weeks", desc:"Each week builds on the last — Week 1 baseline, Week 2 adjustment, Week 3 optimisation, Week 4 peak/carb cycle" },
            { icon:<NutriIcon size={22}/>, title:"5-6 Meals Per Day", desc:"Breakfast, pre-workout, lunch, post-workout, dinner, evening snack — timed to your training schedule" },
            { icon:"🛒", title:"Weekly Grocery Lists", desc:"Organised by category: proteins, carbs, veg, fats — know exactly what to buy each week" },
            { icon:"💊", title:"Supplement Protocol", desc:"Evidence-based supplement recommendations with exact doses, timing, and why they work for your goal" },
          ].map((item,i)=>(
            <Card key={i} style={{ padding:"13px 14px", marginBottom:"8px", display:"flex", gap:"12px", alignItems:"flex-start" }}>
              <span style={{ fontSize:"22px", flexShrink:0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight:600, fontSize:"13px", marginBottom:"3px" }}>{item.title}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,.5)", lineHeight:1.6 }}>{item.desc}</div>
              </div>
            </Card>
          ))}
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
  const [msgs, setMsgs] = useState([{ role:"assistant", content:`Hey ${user?.name?.split(" ")[0]||"there"}! 👋 I'm your FitPlus AI Coach.\n\nAsk me about:\n• 💪 Exercises & YouTube tutorials\n• 🥗 Nutrition & meal timing\n• 😴 Rest & recovery`, time:nowTime() }]);
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
    const sys = `You are FitPlus AI Coach. User:${user?.name||"Member"}, Goal:${(profile?.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim()||"Fitness"}. Include YouTube URLs for exercises. Concise bullet points under 250 words. Known URLs: squat:https://www.youtube.com/watch?v=gcNh17Ckjgg deadlift:https://www.youtube.com/watch?v=op9kVnSso6Q bench:https://www.youtube.com/watch?v=rT7DgCr-3pg push-up:https://www.youtube.com/watch?v=IODxDxX7oi4`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800, system:sys, messages:hist.map(m=>({ role:m.role, content:m.content })) }) });
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:500, display:"flex", flexDirection:"column", maxWidth:"480px", margin:"0 auto", animation:"fadeIn .25s", background:"rgba(10,10,10,.97)" }}>
      <div className="glass" style={{ padding:"12px 15px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
        <div style={{ width:"37px", height:"37px", borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", padding:"5px", boxShadow:"0 2px 8px rgba(14,165,233,.4)" }}><img src={FAB_ICON} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"50%" }}/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"3px", lineHeight:1 }}>AI COACH</div>
          <div style={{ fontSize:"10px", color:"var(--gr)", fontFamily:"var(--fm)", marginTop:"1px", display:"flex", alignItems:"center", gap:"5px" }}>
            <Dot col="var(--gr)"/>ONLINE · FitPlus
            {ctx && ctx.plan.limits.ai !== Infinity && <span style={{ padding:"1px 6px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>{ctx.aiLeft()}/2 TODAY</span>}
            {ctx && ctx.plan.limits.ai === Infinity && <span style={{ padding:"1px 6px", background:"rgba(14,165,233,.08)", border:"1px solid rgba(14,165,233,.2)", borderRadius:"4px", color:"var(--acc)", fontSize:"9px" }}>⚡ PRO</span>}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"8px", color:"var(--mut)", cursor:"pointer", padding:"5px 10px", fontSize:"11px", fontFamily:"var(--fm)" }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 12px 6px", minHeight:0, WebkitOverflowScrolling:"touch" }}>
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
                              <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ width:"17px", height:"17px", background:"rgba(255,0,0,.85)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"7px", color:"#fff" }}>▶</div></div>
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
    </div>
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"var(--bg)", zIndex:550, overflowY:"auto", animation:"fadeIn .2s" }}>
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"var(--bg)", zIndex:600, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
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
    const sub = encodeURIComponent("FitPlus — New Workout Program from your Trainer");
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
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ position:"relative", height:"180px" }}>
        <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=70" alt="" style={{ position:"absolute", top:0, left:0, right:0, bottom:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.4) saturate(.6)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(180deg,rgba(10,10,10,.2) 0%,rgba(10,10,10,.9) 100%)" }}/>
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
        method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.92)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700, animation:"fadeIn .2s" }}>
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.92)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700 }}>
      <Card style={{ padding:"28px 22px", width:"300px", textAlign:"center" }}>
        <div style={{ width:"50px", height:"50px", borderRadius:"50%", border:"3px solid var(--acc)", borderTopColor:"transparent", animation:"spin 1s linear infinite", margin:"0 auto 16px" }}/>
        <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--acc)", letterSpacing:"2px", marginBottom:"8px" }}>GENERATING</div>
        <Mono style={{ color:"var(--acc)" }}>{phases[phase]}</Mono>
      </Card>
    </div>
  );

  if (mode==="preview" && prog) return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"var(--bg)", zIndex:700, display:"flex", flexDirection:"column", animation:"fadeIn .2s", overflowY:"auto" }}>
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
        method:"POST", headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
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
    const sub = encodeURIComponent("FitPlus — "+w.sessionName+" from your trainer");
    const body = encodeURIComponent(
      "Hi "+client.name+"! 💪\n\n"+
      "Here is your workout for "+week+":\n\n"+
      "🔥 SESSION: "+w.sessionName+"\n\n"+
      "🏃 WARM-UP\n"+(w.warmup||"5 min light cardio")+"\n\n"+
      "💪 EXERCISES\n"+exerciseList+"\n\n"+
      "❄️ COOL-DOWN\n"+(w.cooldown||"5 min stretching")+"\n\n"+
      "📝 COACH NOTES\n"+(customNote||w.coachNote||"Work hard, stay consistent!")+"\n\n"+
      "— Your Trainer via FitPlus\nhttps://fit2all.vercel.app"
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
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", paddingBottom:"100px" }}>
      {/* Trainer header */}
      <div style={{ position:"relative", height:"200px" }}>
        <img src={IMG.trainer} alt="" style={{ position:"absolute", top:0, left:0, right:0, bottom:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.4) saturate(.7)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(180deg,rgba(10,10,10,.3) 0%,rgba(10,10,10,.88) 100%)" }}/>
        {/* Top row */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div onClick={onHome} style={{ cursor:"pointer" }}><Wordmark size={40} col="rgba(255,255,255,.9)"/></div>
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
              const sub = encodeURIComponent("Welcome to FitPlus — Your trainer has added you!");
              const body = encodeURIComponent(`Hi ${newName},

Your personal trainer has added you to FitPlus!

Your temporary password: ${tempPass}

Download FitPlus and sign in as a Member:
https://fit2all.vercel.app

See you in the gym! 💪
— Your FitPlus Trainer`);
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
  const [bmrData, setBmrData] = useState({ dob:"", gender:"", height:"", weight:"", unit:"metric" });
  const [showBMR, setShowBMR] = useState(false);

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

  // ── BMR Step (after equipment, before YOU'RE READY) ────────────────────────
  if (step >= steps.length && !showBMR) {
    // Calculate BMR if we have the data
    const calcBMR = () => {
      if (!bmrData.dob || !bmrData.gender || !bmrData.height || !bmrData.weight) return null;
      const today = new Date();
      const birth = new Date(bmrData.dob);
      const age = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
      let weightKg = parseFloat(bmrData.weight);
      let heightCm = parseFloat(bmrData.height);
      if (bmrData.unit === "imperial") {
        weightKg = weightKg * 0.453592;
        heightCm = heightCm * 2.54;
      }
      if (age < 1 || weightKg < 20 || heightCm < 100) return null;
      // Mifflin-St Jeor
      const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
      const bmr = bmrData.gender === "male" ? base + 5 : base - 161;
      return { bmr: Math.round(bmr), age, weightKg: Math.round(weightKg), heightCm: Math.round(heightCm) };
    };
    const result = calcBMR();
    const TDEE_FACTORS = [
      { label:"Sedentary", desc:"Little or no exercise", factor:1.2 },
      { label:"Lightly Active", desc:"1–3 days/week", factor:1.375 },
      { label:"Moderately Active", desc:"3–5 days/week", factor:1.55 },
      { label:"Very Active", desc:"6–7 days/week", factor:1.725 },
      { label:"Extra Active", desc:"Very hard exercise / physical job", factor:1.9 },
    ];
    const isMetric = bmrData.unit === "metric";
    const canCalc = bmrData.dob && bmrData.gender && bmrData.height && bmrData.weight;

    return (
      <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)" }}>
        <div style={{ position:"fixed", top:0, left:0, right:0, maxWidth:"480px", margin:"0 auto", zIndex:200, padding:"14px 18px", pointerEvents:"none" }}>
          <button onClick={()=>setStep(steps.length-1)} style={{ pointerEvents:"all", background:"rgba(10,10,10,.8)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"10px", color:"rgba(255,255,255,.85)", cursor:"pointer", padding:"8px 14px", fontSize:"12px", fontFamily:"var(--fm)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", letterSpacing:"1px" }}>← BACK</button>
        </div>
        <HeroBg src={IMG.recovery} ov="linear-gradient(180deg,rgba(10,10,10,.05) 0%,rgba(10,10,10,.9) 55%,rgba(10,10,10,1) 100%)" style={{ height:"190px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px" }}>
          <div style={{ display:"flex", gap:"5px", marginBottom:"10px" }}>{[...steps,{key:"bmr"}].map((_,i)=><div key={i} style={{ height:"4px", flex:1, background:i<=steps.length?"var(--acc)":"rgba(255,255,255,.12)", borderRadius:"2px" }}/>)}</div>
          <Mono style={{ color:"var(--acc)", marginBottom:"5px" }}>STEP {steps.length+1} OF {steps.length+1}</Mono>
          <div style={{ fontFamily:"var(--fd)", fontSize:"clamp(20px,6vw,26px)", letterSpacing:"2px", lineHeight:1.1 }}>BASAL METABOLIC<br/><span style={{ color:"var(--rd)" }}>RATE (BMR)</span></div>
        </HeroBg>

        <div style={{ padding:"18px 18px 100px" }}>
          {/* Unit toggle */}
          <div style={{ display:"flex", gap:"6px", marginBottom:"14px" }}>
            {["metric","imperial"].map(u=>(
              <button key={u} onClick={()=>setBmrData(d=>({...d,unit:u,height:"",weight:""}))}
                style={{ flex:1, padding:"9px", background:bmrData.unit===u?"var(--acc)20":"rgba(255,255,255,.04)", border:`1.5px solid ${bmrData.unit===u?"var(--acc)":"rgba(255,255,255,.1)"}`, borderRadius:"10px", color:bmrData.unit===u?"var(--acc)":"var(--mut)", cursor:"pointer", fontFamily:"var(--fb)", fontSize:"13px", fontWeight:bmrData.unit===u?700:400 }}>
                {u==="metric"?"⚖️ Metric (kg/cm)":"🏈 Imperial (lb/in)"}
              </button>
            ))}
          </div>

          {/* Date of Birth */}
          <div style={{ marginBottom:"12px" }}>
            <Mono style={{ marginBottom:"7px", color:"var(--acc)" }}>DATE OF BIRTH</Mono>
            <input type="date" value={bmrData.dob} onChange={e=>setBmrData(d=>({...d,dob:e.target.value}))}
              max={new Date().toISOString().split("T")[0]}
              style={{ width:"100%", padding:"13px 14px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"12px", color:bmrData.dob?"var(--txt)":"var(--mut)", fontSize:"16px", fontFamily:"var(--fb)", outline:"none", colorScheme:"dark" }}/>
          </div>

          {/* Gender */}
          <div style={{ marginBottom:"12px" }}>
            <Mono style={{ marginBottom:"7px", color:"var(--acc)" }}>GENDER</Mono>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px" }}>
              {[["male","♂️ Male"],["female","♀️ Female"]].map(([v,l])=>(
                <button key={v} onClick={()=>setBmrData(d=>({...d,gender:v}))}
                  style={{ padding:"14px", background:bmrData.gender===v?"rgba(14,165,233,.14)":"rgba(255,255,255,.04)", border:`2px solid ${bmrData.gender===v?"var(--acc)":"rgba(255,255,255,.1)"}`, borderRadius:"12px", color:bmrData.gender===v?"var(--txt)":"rgba(255,255,255,.7)", cursor:"pointer", fontSize:"16px", fontFamily:"var(--fb)", fontWeight:bmrData.gender===v?700:500 }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div style={{ marginBottom:"12px" }}>
            <Mono style={{ marginBottom:"7px", color:"var(--acc)" }}>HEIGHT {isMetric?"(cm)":"(inches)"}</Mono>
            <input type="number" value={bmrData.height} onChange={e=>setBmrData(d=>({...d,height:e.target.value}))}
              placeholder={isMetric?"e.g. 175":"e.g. 69"} inputMode="decimal"
              style={{ width:"100%", padding:"13px 14px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"12px", color:"var(--txt)", fontSize:"18px", fontFamily:"var(--fd)", outline:"none" }}/>
            {!isMetric && <div style={{ fontSize:"11px", color:"var(--mut)", marginTop:"4px" }}>Tip: 5ft 9in = 69 inches · 6ft = 72 inches</div>}
          </div>

          {/* Weight */}
          <div style={{ marginBottom:"20px" }}>
            <Mono style={{ marginBottom:"7px", color:"var(--acc)" }}>WEIGHT {isMetric?"(kg)":"(lbs)"}</Mono>
            <input type="number" value={bmrData.weight} onChange={e=>setBmrData(d=>({...d,weight:e.target.value}))}
              placeholder={isMetric?"e.g. 75":"e.g. 165"} inputMode="decimal"
              style={{ width:"100%", padding:"13px 14px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"12px", color:"var(--txt)", fontSize:"18px", fontFamily:"var(--fd)", outline:"none" }}/>
          </div>

          {/* BMR Results */}
          {result && (
            <div style={{ animation:"fadeIn .4s" }}>
              <Card style={{ padding:"16px", marginBottom:"12px", border:"1px solid rgba(255,31,31,.25)", background:"rgba(255,31,31,.05)" }}>
                <Mono style={{ color:"var(--rd)", marginBottom:"10px" }}>🔥 YOUR BMR RESULT</Mono>
                <div style={{ textAlign:"center", padding:"10px 0" }}>
                  <div style={{ fontFamily:"var(--fd)", fontSize:"52px", color:"var(--rd)", lineHeight:1 }}>{result.bmr}</div>
                  <div style={{ fontFamily:"var(--fm)", fontSize:"13px", color:"rgba(255,255,255,.5)", marginTop:"4px" }}>calories / day at complete rest</div>
                </div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,.5)", lineHeight:1.7, marginTop:"8px", paddingTop:"8px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
                  <strong style={{ color:"rgba(255,255,255,.7)" }}>Mifflin-St Jeor Formula</strong><br/>
                  {bmrData.gender==="male"
                    ? `(10 × ${result.weightKg}kg) + (6.25 × ${result.heightCm}cm) - (5 × ${result.age}yrs) + 5 = ${result.bmr} kcal`
                    : `(10 × ${result.weightKg}kg) + (6.25 × ${result.heightCm}cm) - (5 × ${result.age}yrs) - 161 = ${result.bmr} kcal`
                  }
                </div>
              </Card>

              {/* TDEE Table */}
              <Card style={{ padding:"14px", marginBottom:"16px" }}>
                <Mono style={{ marginBottom:"11px", color:"var(--acc)" }}>📊 YOUR DAILY CALORIE NEEDS (TDEE)</Mono>
                {TDEE_FACTORS.map((row,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:i<TDEE_FACTORS.length-1?"1px solid rgba(255,255,255,.05)":"none" }}>
                    <div>
                      <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"1px" }}>{row.label}</div>
                      <div style={{ fontSize:"11px", color:"var(--mut)" }}>{row.desc}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"var(--fd)", fontSize:"16px", color:"var(--acc)" }}>{Math.round(result.bmr * row.factor)}</div>
                      <div style={{ fontSize:"10px", color:"var(--mut)", fontFamily:"var(--fm)" }}>kcal/day</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {!canCalc && (
            <div style={{ padding:"14px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"12px", marginBottom:"16px", textAlign:"center" }}>
              <div style={{ fontSize:"28px", marginBottom:"6px" }}>🧬</div>
              <Mono style={{ color:"var(--mut)" }}>Fill in your details above to calculate your BMR & daily calorie needs</Mono>
            </div>
          )}

          {/* BMR must be calculated — no skip */}
          {!result && (
            <div style={{ padding:"13px 14px", background:"rgba(255,140,0,.07)", border:"1px solid rgba(255,140,0,.25)", borderRadius:"12px", marginBottom:"14px", display:"flex", gap:"10px", alignItems:"flex-start" }}>
              <span style={{ fontSize:"18px", flexShrink:0 }}>⚠️</span>
              <div style={{ fontSize:"13px", color:"rgba(255,200,80,.9)", lineHeight:1.6 }}>
                <strong>BMR required.</strong> Your workout plan is personalised using your metabolic rate and calorie needs. Please fill in your details and tap <em>Calculate BMR</em> to continue.
              </div>
            </div>
          )}
          <button
            disabled={!result}
            onClick={()=>{ if(!result) return; const bioAge = (() => { try { const s = localStorage.getItem("bioage_done_"+user.email); return s ? "completed" : null; } catch { return null; } })(); const merged = {...data, bmr:result.bmr, tdee:Math.round(result.bmr*1.55), bmrAge:result.age, gender:bmrData.gender, heightCm:result.heightCm, weightKg:result.weightKg, bioAgeDone:!!bioAge }; onDone(merged); }}
            style={{ width:"100%", padding:"16px", background:result?"var(--rd)":"rgba(255,255,255,.06)", border:"none", borderRadius:"var(--r)", color:result?"#fff":"var(--mut)", cursor:result?"pointer":"not-allowed", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", marginBottom:"10px" }}>
            {result ? "⚡ BUILD MY PERSONALISED PLAN" : "🔢 Calculate BMR First ↑"}
          </button>
        </div>
      </div>
    );
  }

  if (showBMR) {
    setShowBMR(false);
    onDone(data);
    return null;
  }

  if (step >= steps.length) return null;

  if (step >= steps.length) return (
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)" }}>
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
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)" }}>
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
  const [phase, setPhase] = useState("thinking"); // thinking | generating | done
  const [msg, setMsg] = useState("Analysing your profile...");

  useEffect(() => {
    generateProgram();
  }, []);

  async function generateProgram() {
    const goal    = (profile.goal||"").replace(/[🔥💪🏃🧘⚡🏆]/g,"").trim();
    const level   = (profile.level||"").replace(/[🌱🌿💪🔥🏆]/g,"").trim();
    const days    = parseInt(profile.days) || 3;
    const dur     = parseInt(profile.duration) || 60;
    const equip   = (profile.equipment||"").replace(/[🏠🏋️🌳🏊]/g,"").trim();
    const bmr     = profile.bmr || null;
    const tdee    = profile.tdee || null;
    const bioAge  = profile.bioAge || profile.bmrAge || null;
    const gender  = profile.gender || "unknown";
    const wkg     = profile.weightKg || null;
    const hasGym  = equip.toLowerCase().includes("gym");

    setTimeout(() => setMsg("Designing your program structure..."), 800);
    setTimeout(() => { setPhase("generating"); setMsg("AI building your personalised workouts..."); }, 1600);

    // Load saved bio age result for extra detail
  const savedBioResult = (() => {
    try { return JSON.parse(localStorage.getItem("bioage_result_"+(user?.email||"")))||null; } catch { return null; } })();

  const PROMPT = `You are an elite certified personal trainer and sports scientist with 20+ years of experience. Design a COMPLETE, highly personalised 4-week periodized training program. This must be ADVANCED, SPECIFIC, and PROFESSIONAL — not generic.

MEMBER PROFILE (use ALL of this to personalise every aspect):
- Name: ${user?.name || "Athlete"}
- Goal: ${goal}
- Fitness Level: ${level}
- Training Days/Week: ${days}
- Session Duration: ${dur} minutes
- Equipment: ${equip}
- Gender: ${gender}
${wkg ? `- Body Weight: ${wkg}kg` : ""}
${bmr ? `- BMR: ${bmr} kcal/day (energy at rest)` : ""}
${tdee ? `- TDEE: ${tdee} kcal/day (total daily needs)` : ""}
${bioAge ? `- Fitness Age: ${bioAge} years (use this to adjust intensity, recovery, and exercise selection)` : ""}
${savedBioResult ? `- VO2max estimate: ${savedBioResult.vo2max || "unknown"}, overall fitness score: ${savedBioResult.score || "unknown"}` : ""}
${profile?.duration ? `- Preferred session length: ${profile.duration} minutes` : ""}

PROGRAM REQUIREMENTS:
1. Use periodization: Week 1 Foundation → Week 2 Progression → Week 3 Intensification → Week 4 Deload
2. Each session must include: warm-up, main exercises, cardio finisher, cool-down stretching
3. Include ADVANCED techniques: supersets, drop sets, tempo manipulation, pause reps, rest-pause sets (vary by level)
4. Each exercise needs: sets, reps, rest, tempo (4-digit e.g. "3-1-2-0"), RPE (1-10), technique cues, progression rule, primary + secondary muscles
5. Cardio finisher: adapt to goal — HIIT for fat loss, steady-state for endurance, active recovery for muscle gain
6. Stretching: minimum 5 targeted stretches per session matching muscles worked
7. Progressive overload must be explicit: exact weight increments, rep range targets
8. For ${goal.toLowerCase().includes("fat") ? "fat loss: higher volume, shorter rest, metabolic conditioning" : goal.toLowerCase().includes("muscle") ? "muscle gain: compound movements first, progressive overload, adequate rest" : goal.toLowerCase().includes("endurance") ? "endurance: cardiovascular base, lactate threshold work, tempo runs" : "general fitness: balanced strength, cardio, and mobility"}

EXERCISE SELECTION RULES:
- Level "${level}": ${level.includes("Beginner") ? "bodyweight + machine exercises, simple movement patterns, 3 sets max, RPE max 7" : level.includes("Some") ? "mix of machines and free weights, moderate complexity, 3-4 sets, RPE 6-8" : level.includes("Intermediate") ? "free weights focus, compound movements, 4-5 sets, advanced techniques, RPE 7-9" : "advanced free weight movements, Olympic lifts, complex programming, 4-6 sets, RPE 8-10"}
- Equipment: ${hasGym ? "Full gym — barbells, dumbbells, cables, machines, pull-up bars" : equip.includes("Home") ? "Dumbbells, resistance bands, bodyweight, pull-up bar if available" : "Bodyweight only — creative exercise selection"}

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "programName": "string",
  "overview": "detailed 3-sentence overview mentioning goal, methodology, and expected outcomes",
  "methodology": "specific training methodology name (e.g. Daily Undulating Periodization, Linear Periodization, Block Periodization)",
  "phases": [
    {
      "week": 1,
      "theme": "Foundation",
      "focus": "detailed focus description",
      "days": [
        {
          "day": "Monday",
          "sessionName": "descriptive session name",
          "muscleGroups": ["Primary Muscle", "Secondary Muscle"],
          "duration": "${dur} min",
          "intensity": "Moderate",
          "warmup": "detailed 5-8 minute warm-up protocol with specific movements and durations",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": "4",
              "reps": "8-10",
              "rest": "90s",
              "tempo": "3-1-2-0",
              "rpe": "7",
              "cues": "2-3 key technique cues as a sentence",
              "progression": "specific rule e.g. add 2.5kg when all sets complete at top of rep range",
              "muscleTarget": "Primary: muscle name. Secondary: muscle names",
              "technique": "Standard"
            }
          ],
          "cooldown": "detailed cool-down with 5-6 specific stretches, hold times, and benefits",
          "sessionNotes": "specific coaching note for this session"
        }
      ]
    }
  ],
  "weeklyGoals": ["goal 1", "goal 2", "goal 3"],
  "progressionMarkers": ["marker 1", "marker 2", "marker 3"],
  "nutritionGuidance": {
    "preworkout": "specific pre-workout nutrition",
    "postworkout": "specific post-workout nutrition",
    "dailyProtein": "specific protein target",
    "hydration": "specific hydration protocol"
  },
  "progressionProtocol": "detailed weekly progression rules",
  "recoveryProtocol": "detailed recovery guidance"
}

Include exactly ${days} training days per week, distributed optimally. Each day must have 6-9 exercises including the cardio finisher and 5 stretching exercises. Make this program genuinely challenging, specific, and professional — not generic.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          messages: [{ role: "user", content: PROMPT }]
        })
      });
      const data = await res.json();
      const raw = (data.content?.[0]?.text || "").replace(/```json/g,"").replace(/```/g,"").trim();
      const parsed = JSON.parse(raw);

      // Ensure 4 weeks — derive weeks 2-4 if only 1 provided
      if (parsed.phases && parsed.phases.length === 1) {
        const w1 = parsed.phases[0];
        parsed.phases = [
          w1,
          { ...w1, week:2, theme:"Progression",      focus:"Add weight/reps to all main lifts — progressive overload week",
            days: w1.days.map(d=>({...d, intensity:"Moderate-High", sessionNotes:"Increase weight by 2.5-5% from last week",
              exercises:d.exercises.map(e=>({...e, rpe:String(Math.min(9,parseInt(e.rpe||7)+1)), sets:e.sets}))
            }))},
          { ...w1, week:3, theme:"Intensification",  focus:"Peak effort — push to RPE 8-9 on all main lifts",
            days: w1.days.map(d=>({...d, intensity:"High", sessionNotes:"Maximum effort week — this is where real gains happen",
              exercises:d.exercises.map(e=>({...e, rpe:String(Math.min(9,parseInt(e.rpe||7)+2)), sets:String(parseInt(e.sets||3)+1)}))
            }))},
          { ...w1, week:4, theme:"Deload",            focus:"60% of Week 3 volume — recover and consolidate",
            days: w1.days.map(d=>({...d, intensity:"Low", sessionNotes:"Deload week: reduce weight to 60% of Week 3, 3 sets only, perfect form",
              exercises:d.exercises.map(e=>({...e, rpe:"5-6", sets:"3"}))
            }))},
        ];
      }

      // Add BMR context to overview
      if (bmr) {
        parsed.overview = (parsed.overview || "") + ` BMR: ${bmr} kcal/day — target TDEE: ${tdee} kcal/day.`;
      }
      parsed.bmrCalories = bmr;
      parsed.tdeeCalories = tdee;
      parsed.bioAgeFitness = bioAge;

      onDone(parsed);
    } catch (err) {
      // Fallback to template if AI fails
      console.warn("AI gen failed, using fallback", err);
      onDone(advancedFallback(profile, user));
    }
  }

  const msgs = [
    "Analysing your profile...",
    "Designing your program structure...",
    "AI building your personalised workouts...",
    "Calculating progressive overload...",
    "Adding cardio & mobility work...",
    "Finalising nutrition guidance...",
  ];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i+1) % msgs.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <HeroBg src={IMG.pro} ov="rgba(10,10,10,.94)" style={{ minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"30px", textAlign:"center" }}>
      {/* Animated rings */}
      <div style={{ position:"relative", width:"80px", height:"80px", marginBottom:"28px" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, borderRadius:"50%", border:"3px solid rgba(14,165,233,.15)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"var(--acc)", animation:"spin 1s linear infinite" }}/>
        <div style={{ position:"absolute", top:"10px", left:"10px", right:"10px", bottom:"10px", borderRadius:"50%", border:"2px solid transparent", borderTopColor:"rgba(14,165,233,.4)", animation:"spin 1.6s linear infinite reverse" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>🧠</div>
      </div>
      <div style={{ fontFamily:"var(--fd)", fontSize:"22px", color:"var(--acc)", letterSpacing:"3px", marginBottom:"10px" }}>AI BUILDING YOUR PLAN</div>
      <div style={{ fontSize:"13px", color:"rgba(255,255,255,.6)", fontFamily:"var(--fm)", marginBottom:"6px", minHeight:"20px", transition:"opacity .3s" }}>{msgs[msgIdx]}</div>
      <Mono style={{ fontSize:"10px", color:"rgba(255,255,255,.25)" }}>Powered by Claude AI · Usually takes 10-20 seconds</Mono>
      <div style={{ marginTop:"32px", display:"flex", flexDirection:"column", gap:"8px", width:"100%", maxWidth:"260px" }}>
        {["Personalised to your exact goals","BMR-aware calorie guidance","Progressive overload built in","Cardio + stretching every session"].map((f,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"9px" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"var(--acc)", flexShrink:0 }}/>
            <span style={{ fontSize:"12px", color:"rgba(255,255,255,.6)", fontFamily:"var(--fm)" }}>{f}</span>
          </div>
        ))}
      </div>
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
  const bmr = p.bmr || null;
  const tdee = p.tdee || null;
  const bioAge = p.bioAge || p.bmrAge || null;
  const gender = p.gender || "unknown";
  const weightKg = p.weightKg || null;
  // Adapt intensity based on bio age
  const isOlderAthlete = bioAge && bioAge > 45;
  const isYoung = bioAge && bioAge < 30;
  // Cardio prescription based on goal and BMR
  const goalLower = goal.toLowerCase();
  const isFatLoss = goalLower.includes("fat") || goalLower.includes("weight");
  const isEndurance = goalLower.includes("endurance");
  // Cardio finisher — added to every session
  const cardioFinisher = isFatLoss
    ? { name: hasGym ? "Treadmill Intervals (HIIT)" : "Jump Rope Intervals", sets:"6", reps:"30s work / 30s rest", rest:"0s", rpe: isOlderAthlete?"6-7":"7-8", cues:"All-out effort on work intervals, active recovery on rest", muscleTarget:"Cardiovascular system — burns 150-200 extra kcal" }
    : isEndurance
    ? { name: hasGym ? "Rowing Machine" : "Burpees", sets:"1", reps:"8 min steady", rest:"0s", rpe:"6-7", cues:"Maintain consistent pace and breathing throughout", muscleTarget:"Aerobic capacity & cardiovascular endurance" }
    : { name: hasGym ? "Bike or Treadmill Cooldown Jog" : "High Knees / Skipping", sets:"1", reps:"5-8 min", rest:"0s", rpe:"5-6", cues:"Moderate pace — elevate heart rate without exhaustion", muscleTarget:"Cardiovascular maintenance + active recovery" };
  // Stretching routine — every session
  const stretchFinisher = [
    { name:"Child's Pose", sets:"1", reps:"60s hold", rest:"0s", rpe:"2", cues:"Arms extended, breathe deeply, feel lower back decompress", muscleTarget:"Spine, glutes, hip flexors" },
    { name:"90-90 Hip Stretch", sets:"1", reps:"45s each side", rest:"0s", rpe:"3", cues:"Sit tall, front shin parallel to body, gently press down on back knee", muscleTarget:"Hip rotators, glutes, piriformis" },
    { name:"Doorway Chest & Shoulder Stretch", sets:"1", reps:"30s each side", rest:"0s", rpe:"2", cues:"Elbow at 90°, lean gently forward until stretch felt across chest", muscleTarget:"Pectoralis major, anterior deltoid" },
    { name:"Standing Quad Stretch", sets:"1", reps:"30s each leg", rest:"0s", rpe:"2", cues:"Hold ankle, keep knees together, slight forward lean for deeper stretch", muscleTarget:"Quadriceps, hip flexors" },
    { name:"Seated Hamstring Stretch", sets:"1", reps:"45s each leg", rest:"0s", rpe:"3", cues:"Straight leg, hinge from hips (not rounding back), breathe into the stretch", muscleTarget:"Hamstrings, calves" },
  ];

  const push = { day:"Monday", sessionName:"Push — Chest, Shoulders & Triceps", muscleGroups:["Chest","Shoulders","Triceps"], duration:"55 min", intensity:"Moderate",
    warmup:"5 min: arm circles 30s each direction, 10 band pull-aparts, 10 scapular push-ups, 30s deep breathing",
    exercises:[
      { name:hasGym?"Barbell Bench Press":"Push-ups", sets:"4", reps:"8-10", rest:"90s", tempo:"3-1-1-0", rpe:"7", cues:"Retract scapula, slight arch, drive in straight path", progression:"Add 2.5kg or 1 rep when all sets complete at top of range", muscleTarget:"Primary: Pectoralis major. Secondary: Anterior delt, triceps" },
      { name:hasGym?"Overhead Press":"Pike Push-ups", sets:"3", reps:"10-12", rest:"75s", tempo:"2-1-1-0", rpe:"7", cues:"Brace core, squeeze glutes, stack wrists over elbows", progression:"Add 2.5kg when all reps clean", muscleTarget:"Primary: Anterior & medial deltoid. Secondary: Triceps" },
      { name:hasGym?"Incline Dumbbell Press":"Decline Push-ups", sets:"3", reps:"10-12", rest:"75s", tempo:"3-0-1-0", rpe:"7", cues:"Keep shoulder blades pinched, lower to chest", progression:"+1 rep each week until 15, then add weight", muscleTarget:"Primary: Upper chest. Secondary: Front delt" },
      { name:hasGym?"Lateral Raises":"Plank Shoulder Taps", sets:"3", reps:"15", rest:"60s", tempo:"2-0-2-0", rpe:"6", cues:"Lead with elbows, slight forward lean, no swinging", progression:"Add 1kg every 2 weeks", muscleTarget:"Primary: Medial deltoid" },
      { name:hasGym?"Tricep Rope Pushdown":"Diamond Push-ups", sets:"3", reps:"12-15", rest:"60s", tempo:"2-1-2-0", rpe:"7", cues:"Keep elbows pinned to sides, full extension at bottom", progression:"+2.5kg when all reps complete", muscleTarget:"Primary: Triceps brachii, all three heads" },
      cardioFinisher,
      ...stretchFinisher,
    ],
    cooldown:"8 min stretching: doorway chest stretch 45s, cross-body shoulder 30s each, overhead tricep 30s each, neck side stretch 20s each, wrist circles 30s",
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
      cardioFinisher,
      ...stretchFinisher,
    ],
    cooldown:"8 min stretching: lat doorframe stretch 45s each, bicep wall stretch 30s each, thoracic rotation 10 reps each side, cobra pose 45s, seated twist 30s each",
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
      cardioFinisher,
      ...stretchFinisher,
    ],
    cooldown:"10 min stretching: pigeon pose 60s each, lying hamstring stretch 45s each, hip flexor lunge 60s each, quad stretch 30s each, calf stretch 30s each, figure-4 glute stretch 45s each",
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
    bmrCalories: bmr,
    tdeeCalories: tdee,
    bioAgeFitness: bioAge,
    memberGender: gender,
    memberWeightKg: weightKg,
    overview: `A science-based 4-week periodized program built specifically for ${goal.toLowerCase()}${bioAge ? `, optimised for your fitness age of ${bioAge}` : ''}${bmr ? `. Your BMR is ${bmr} kcal/day — daily calorie target (TDEE): ${tdee} kcal` : ''}. Every session includes strength work, cardio conditioning and a dedicated stretching cool-down. Progressive overload is applied each week. Week 4 is a strategic deload.`,
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
      preworkout: (() => {
        const base = goal.includes("Fat") ? "Train fasted or light meal 2h prior: banana + black coffee" : "2h before: 40g carbs + 20g protein — oats + whey, or chicken + rice";
        return tdee ? `${base}. Daily calorie target: ${tdee} kcal` : base;
      })(),
      postworkout: "Within 30 min: 30-40g protein + 40-60g carbs — whey + banana, or Greek yogurt + rice cake",
      dailyProtein: (() => {
        const target = goal.includes("Muscle") ? "2.0-2.2" : "1.6-1.8";
        const kgStr = weightKg ? ` (your ${Math.round(weightKg)}kg = ${Math.round(weightKg*(goal.includes("Muscle")?2.1:1.7))}g/day)` : "";
        return `${target}g per kg bodyweight${kgStr}. Sources: chicken, eggs, fish, beef, Greek yogurt`;
      })(),
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
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(180deg,transparent 35%,rgba(8,8,16,.88) 100%)" }}/>
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
  const FREE_EX_URL = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json";
  const FREE_EX_IMG = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";

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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"var(--bg)", zIndex:800, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
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
                  <StatPill key={x.l} label={x.l.toLowerCase()} value={x.v} color={mcol}/>
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


// ─── Stat Tooltip (tap any stat pill to learn what it means) ──────────────────
const STAT_INFO = {
  sets: {
    title: "Sets",
    icon: "🔁",
    what: "A set is one complete group of repetitions. Doing 3 sets means you perform the exercise 3 separate times with a rest in between.",
    tip: "Rest fully between sets for strength. Shorter rests (30-60s) for endurance or fat loss.",
  },
  reps: {
    title: "Reps (Repetitions)",
    icon: "💪",
    what: "The number of times you perform the movement in one set. '10-12 reps' means aim for at least 10 but no more than 12.",
    tip: "1-5 reps = max strength. 6-12 reps = muscle size. 12-20+ reps = endurance and tone.",
  },
  rest: {
    title: "Rest Period",
    icon: "⏱️",
    what: "How long you pause between sets to recover. Written in seconds (s) or minutes (min).",
    tip: "Longer rest (2-3 min) for heavy lifts. Shorter rest (30-60s) for fat burning circuits.",
  },
  tempo: {
    title: "Tempo",
    icon: "🎵",
    what: "Controls the speed of each phase: Eccentric (lowering) – Pause at bottom – Concentric (lifting) – Pause at top. E.g. '3-1-1-0' = 3s down, 1s pause, 1s up, 0s pause.",
    tip: "Slower tempos increase muscle tension and growth. Faster tempos build power.",
  },
  rpe: {
    title: "RPE (Rate of Perceived Exertion)",
    icon: "🔥",
    what: "A scale of 1–10 for how hard the set feels. RPE 7 = 3 reps left in the tank. RPE 9 = 1 rep left. RPE 10 = absolute maximum effort.",
    tip: "Stay at RPE 7 when learning technique. Push to RPE 8-9 for progressive overload weeks.",
  },
};

function StatPill({ label, value, color }) {
  const [open, setOpen] = useState(false);
  const key = label.toLowerCase();
  const info = STAT_INFO[key];
  return (
    <>
      <div onClick={()=>info&&setOpen(true)} style={{ textAlign:"center", padding:"6px 4px", background:"rgba(255,255,255,.04)", borderRadius:"7px", cursor:info?"pointer":"default", position:"relative" }}>
        <div style={{ fontFamily:"var(--fm)", fontSize:"14px", color:color||"var(--acc)", fontWeight:700 }}>{value}</div>
        <div style={{ fontFamily:"var(--fm)", fontSize:"11px", color:"var(--mut)", marginTop:"2px", display:"flex", alignItems:"center", justifyContent:"center", gap:"3px" }}>
          {label}{info && <span style={{ fontSize:"9px", opacity:.5 }}>ⓘ</span>}
        </div>
      </div>
      {open && info && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:900, display:"flex", alignItems:"flex-end", background:"rgba(0,0,0,.65)", padding:"0" }} onClick={()=>setOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:"480px", margin:"0 auto", background:"rgba(16,16,16,.98)", borderTop:"1px solid rgba(255,255,255,.12)", borderRadius:"20px 20px 0 0", padding:"20px 22px 36px", animation:"slideUp .25s ease" }}>
            {/* Handle bar */}
            <div style={{ width:"36px", height:"4px", background:"rgba(255,255,255,.15)", borderRadius:"2px", margin:"0 auto 18px" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
              <span style={{ fontSize:"28px" }}>{info.icon}</span>
              <div style={{ fontFamily:"var(--fd)", fontSize:"18px", letterSpacing:"1px", color:"var(--acc)" }}>{info.title.toUpperCase()}</div>
            </div>
            <div style={{ fontSize:"15px", color:"rgba(255,255,255,.85)", lineHeight:1.75, marginBottom:"14px" }}>{info.what}</div>
            <div style={{ padding:"11px 14px", background:"rgba(14,165,233,.07)", border:"1px solid rgba(14,165,233,.18)", borderRadius:"10px" }}>
              <div style={{ fontFamily:"var(--fm)", fontSize:"10px", color:"var(--acc)", letterSpacing:"1px", marginBottom:"5px" }}>💡 PRO TIP</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.7)", lineHeight:1.65 }}>{info.tip}</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{ width:"100%", padding:"13px", background:"var(--acc)", border:"none", borderRadius:"10px", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"14px", letterSpacing:"1px", marginTop:"16px" }}>GOT IT ✓</button>
          </div>
        </div>
      )}
    </>
  );
}


// ─── Muscle SVG Icons (inline, no external dependency) ───────────────────────
// ─── Muscle Images (real anatomy photos) ────────────────────────────────────
const MIMG_CHEST = "data:image/jpeg;base64,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";
const MIMG_CORE = "data:image/jpeg;base64,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";
const MIMG_HAMSTRINGS = "data:image/jpeg;base64,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";
const MIMG_GLUTES = "data:image/jpeg;base64,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";
const MIMG_CALVES = "data:image/jpeg;base64,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";
const MIMG_QUADS = "data:image/jpeg;base64,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";
const MIMG_TRICEPS = "data:image/jpeg;base64,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";
const MIMG_SHOULDERS = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCACMAIwDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAAcFBggEAgMB/8QASBAAAgIBAwIDBQUEBQoEBwAAAQIDBAUABhESIQcTMSJBUWFxCBQygZEVQoKhFiNSYpIkMzRDU3KTorHBN3OjsmN0s9Hh8fL/xAAbAQEBAAMBAQEAAAAAAAAAAAAAAQQFBgMCB//EAC8RAAIBAgMFBgYDAAAAAAAAAAABAgMRBAUhBhIxQWETUXGRsdEUIoGh4fAyM8H/2gAMAwEAAhEDEQA/ANU6NGjQBo0aNAGjRo0BFbn2xid4YabD5qoLVKcqWTqKkFWBVgykFSCAQQdI/wALZq9HYWGhDqtjFZO3KsZPtmFbUkUvr68JJyfoDrQus9S0KO2965vZVnJLUty3WzuFlUjzEScksqg9iVcSAofxI36AQ+7ty+E+a3XlHt7X3TdycXMVy7jqs8fnlB0GFulwSpCgdwAePXVl2fubZmb2jWx21qNjEYite823WtwtEIEQmd+SxIILKgPBPHIHw105Pbu4tzyIcjvbKYyOvC8MRwbGqZ+rjlpQSw5HHAA+fcc685qexToJc3luCp+y8eFZoli6ElKfhaRmYs57BugActx68DUKfbw02ziM/wCLW9Nz3Kv3i7jrlVKUrM3TGWqL1Hp54LcHjkjkc+7Tr0uvA3FyR7Vs7kssDY3RcfL8c8+XE4Cwp9RGq8/MnTF1SBo0aNAGjRo0AaNGjQBo0aNAGjRo0AaNGqJ4p+KUHh/TrU6NNsvuXJsYsZi4u7TP/bbj8MY95/8AyQBK788RtueHOK/aGevLF1+zBWj9qey39mNPVj8/Qe8jWQ96xZnxa3TkNxZOpJibr21xWOg6+9aRYDNEjMP3jwQfg0nu405sV4eR4WtkfELxFyKZncscD2Jp2PNfHIoJMcK+gI7jn4+nxNH3xVn2h4IYXPW4/Ly93PxZyYc91kkZnC/wxhV/I6hTj2HZ8VpsQmXoV6e5a9+qIkkltiCSu68qTIG45ZSCD8ePXVOzW1tz5rNnFbqyy2xjjWrrXgcmKOzZk4ROe3UwUl2PwAGrvtvxHyvh/ndz4OntjJZ3HPeNmkaQ58o2FEqo3Y8K3VyD7u/rqvbdzVjIZzZVnJji3uHc8uUsAeiiNhDGv0B6gPpoBpeBvjTV27iqWyt5KcYtWaWhjcnL2gnWOQp5UjeiSLxx34BHHp79EKyuoZSGUjkEeh0g6+zsNNv/AHRs7OUobWMzaDOVIpPQl+EnCn1VlkAYEd+G15wuezX2fsnDiM7bsZjw+sSiKrkpPbnwzn0jm49Y+44P6cfh1SD/ANGvEM0dmFJoZEkikUMjoQVYEcggj1GvegDRo0aANGjRoA0aNGgPlatQUq0tm1NHBBCheSWRgqooHJJJ9ABpJ537Vm361x4dv4TI5yvGxVrpda1duPepYFmHz4Gqx9pzf02Wzcfh/QmZaNaNbWW6G481z3jhJ+HHtEe/lfhpPwQhwOngBfT2eQv0GtfjMcqL3VxOiyfIZY2Dqydo8uo73+1vNGzsdgW3gUciSLIKef1QaV+M3/j967kv53M5f7pl73AkRz5JSIcdFaFm7BOSB3I59p39Apg5aPWeoqGIPsnp8xz+vYa5rmFW6hN1ImjHcGYglfn7PAH668qeZxf8jKr7L1V/Xe/28+X1GHkt2rn8RFs/H2RJiobH3vJ2YySsvHtLEvJ5K8qZCP7KoD7TNzKZh23jV29tvJtFHU+8ZCwQ7DiOOKsyIp5PfiSQKPppB2KW2a0xjhntWJj/AKqqSR9BorDCwyRi3Vt1nJ9h7at0+vz7azfiE1vKL8jRvL3Ge5KpG/j7aDy8Pciaj2Mj1H/KtnU7zNz+KSuJIW/P2Rqt1cVHVxVW+WQWttYHDXY42bgl5LZsS8fPoJOjw6tT2MLl8dJDLCtXb+SSrIyniSpLIrIwPvUOJhzqjbkydLKZO5kstAYvvLIK0DoRJ92WNVg6R69JQA8+/nX3Opux3rGPSw/aTcN5K19W9NBy73zOVO6F3Bj5IzlcRaMlTluFlhIUNE3f8LKy8/8AmE/u6j9xbxwG5Eu56XKQUoLRYtXllHPPT3ieM88sQGXuCOtCD7MiFUgYcQpZrVXL14D6SMrBePz1L4rBYOyBLjpa9hh7X9byzD6jkf8ATXlUxUaavJNfQzMNlVTES3aUot919fIa/hn9o+XZOIl25VwlzcWPqt/kEvm+QYUJPMXLgkoPVee4B6TzwDq6Rfa1fp5n2LZVgfaSPIozgfQoOf10jzRIj6ZwAOe39WsiD+QYa/fupRSCigKeyj2l+o57jWDPNEuFjfUNlXLSd/T3NgeHfi7tjxLjlTEzzQX64DT4+2nlzxD48ckMvP7ykj6auusC18hkdv5WpncJO0OVxz+bBIP9Z/aRvirDsR89be2NuynvnaWL3FR9mG/AsvRzyY29GQ/NWBH5az8LiVXhvczQZrlk8DV3G7p8GTmjRo1kmsDX5I6xozsQFUckn3DX7qB39dON2NuK6p4avjLMoPzWJiNAYhv5mTc2by+fm5Z8rdmtjk9+guRGv04AGu6GM9I54J95GoPFw9FOnGpHUIkH8v8A+jqfhKugK9gfT6fHXK5g25XP1nZyMY01HuS+3E9T2I6teSeaXy4o163f5DXTg8DTz0EdrPmnG0/txVLk8iqifukwwgyOxHclio78Ae/UPNVbcW5MPtuCOax94kFiwkIDMYl5bgAkA+hPHI92tC7DxduvA8m37mItwRP02almmadmF/g7JyQ3+8vf3HWwyrCKMO1ktXwOc2uzidWu8HSfyR49X+PUicJ4c4nHYlb81gx0+jqMNSoacRHzVR5rfIMTz8NechTyOYqNSTblVMUy+Xxl+faX5RKCVH1IOnL5SlRyoDcd+Pjqmbm2JjMjZku3hbts3dY5bL+VGPgqKQB/M63JxZB+DePatgsjgbUMbPiLslGLk+YRWkVZUj6j3KjzDwD7vUap+NxN/Kbmze6auOxdqxLemqVGuM3MVeFjEqRBQQg9g9/U/Ietx8GY4qm7N94+JBHFXvUXRBzwoNcenP8Au6q3hXtjF7o2xDdv1PNlltW280SOjcGxJxwVI0IT8OJh3HMtXLUMji8iFIjdZD0uB69Ei8q4/usOflqk7w8OMDjLrC4+LMwHUs8taWjL39/nwr5ZP1XT+weEiw9FayT2rCg8qbMpkYD4dR7kD3c8nXnO1crPAIcRFQDuD1SW2cqnw4RR7X6jToW74oySJJaeSfE2G8zhfNrWCysLEXvPUvskj0PHr68D0192AZSp/Iam/F7Bx16EmfoWUyNrFWla1ZpUEgrKGPSydan2m5K88dXzI1AxTx24I7ELdSSIHH0OuYzPCKlNTgtH6n6nspm8sZQdCu7zjz71+OHkR90MhXoB9eRx6du5H6afv2Ss4ZMPuPbjPyuPupbgBPpHOvPA+QZG/XSEuMZFboPHcHt6Ecdj+umf9le35fiTmKqgrHYwyy8fEpOAP5SazsrbTsaLatRkrrk/x++BqnRo0a3Rw4apHjblqWH8KN0zXrCQJLjpqyFj3eSRCiKPiSSBq76zT9orL2d45+ztyqScdhKr+bx6SXZEHH/DjcfQyH4aARlEsYolA9oqgB+HI7/oOo6kzahhrSSSsFiCGSRv7MY7Kv1P/wB9RdKQPRgfg8PEp7e4FR/25/XU9tfbNjdpe3OjLh68xBKj/SpkXqYL8UiTgfN2Qfva0ssM61S3I7ilmkcHhVPnbTr+8+nU5vDGCGfxBrXs/Smare6avmLIUFaWYHyVYggjlUI+ra0/itrcXPJtS30t1kDUcxC/TNJAT3glbgiQofc4PKkH1B0iquNevtHe+U8sK1PL1XDD9xq7RE8fIFmGtSV2Dx8j0JOtvGKirI4upOVSTnN3b1PooKqAWLEAAk+/5658gges3I9NdOue8wWs/Pw19HwLXw04h8TfEVRz+HGyf+i4/wC2uf7PcAbw6wzkd385z+c0murYR6PFDf5A9aWNf/05R/2148ASE8Odvj06q5b9ZGOgGnqMzuHgy9fou270dJFJmr1pCgnX14YqOsj+6pHPz1J6NAIrxYw0SbHsPkKE/wB9yZWhiMRA/lx0y5/q0CLwpYAdbk89wR7tIva9qSvWSjID1hPvNb/4iH8cf1BB1p3xHH3zfuyaY9oJLdudPzjgCg/l5mkfT2LJk8degikFW5jMlaWCwfSHplIPP93uhP8AdDn3a8MTQVaDgzPy3HSwVdVo8Ofh+6rqiDsOD2BJQ91+BQnt+javf2cMxSxvjBFFcsJA1/FTVq/V28yTzEYJ9eEbj48aXjNMs1itcrtUuVpHhs1X7GCUHhh9OeCPz19dvULWQzVixSZoLlKoJq8w9Ypussj/AFBQfz1hYKm4TszeZ3iI16CnB6M37o1XfD7da712hjc35YinnjKWYf8AYzoSkqfk6sPpxqxa2pyZ8blqKjUmtTt0QwI0jsfcqjkn9BpN+H+1oM9smDPZKItkc4tnKScnsGsv1r+iCMD5DV68Yrr4/wAKt22I2KuMTZVSPcWjK8/z142skMWEx9SuCsVSKOp/w1VD+XI0BinbeCyO5rOH2zjTxcyLrAJPUQxqOZJD8lA1sfC7Ew2CxNPE4+v0Q0qy1YOr3cP19RHvZnAZviQPhpT/AGa9nqtjN7tniHHnSYugT/s1cmVx9W4X+E6edq5Hj6s12VgsdaNpnJ9wUFj/ANNedOG6vEyK9btGuisKD+jkE3gnvYVwXNmTKyRH+35TlFP5+Rqy3/EirtvYVTP/AHabIzW466U6cHeS1PKoKIvr69yfXsNQ2Meal4IbalkVWNtYbE6n1bzneU8fXq4/i0t9rW6W99l1tqtmbePtbfsv91v1BzL/AFPWF4XkdzE3bg/utx6a+zwHx4b7yl33tODNWMecbZM01aet19YjkjcqwDe8akc5kIq8So0iKXboUMeOpvgPiflqkbczO3tk7ZqYPFSyJjqkSn7zyG4STkiwx96s5ILeinsQBqvbkzXnPJHlBFJJ5QFuu8ojjuxL3WzXckAOvw5B93uU6Altl2PK8Rt8v/aw1Kb/AAiYa+Pgxcjo7A26JZEjU1IwCx4BLE8D6knXnwTpnP5HdG4UsWrOKuwV8XSt2ouh51RXLt6DqALher38HVE2le/Y1eDA3p2gz+DRqsgvBY4MaisV85FP+dZl4Kkc88+oHqBpmOQSICD9dLa94zpjPEybadrCTrjIp4aLZcPykduWMOiOvHZW54B59QfdzowO7hShroDMteRBFRrS/wCkWADy9iQt3VfU8njgck9yBqr7wwG29zbkh3WmYv0mCQ2btaAf1eQihkBhZx7uWUBT6sB2Hv0Ba52TL+NGJhY9sfg7lhv7plljjX9ek/prq2Ztyl/SPeUcsausWWfmNh6iWFJAfoRNKpHvB0udgbt/pT4g5DMwOnmS5Crj4155VYo1bk8+/mSRm/g00cFP908Vt10CeBcx+OyKD49IkhY/8qaAWP2ivDtMVFS3vi42KwLFSyqnuZIhwkcxPvZeyk+8Fdcf2dtv1s1ld0m6vmRrWqwjg9wWabv+mtBZjFVM7ibmKvxiWpchevMpH7jDg/n7x8xpQfZuwlrbtnemJv8A+mY+9BTkP9sIsnS/0YEH89fDh828e6rPsXSfff3/AMGF4bAbf33u/a6nitL92zdVflMhjlH/ABIef49MvSqrW44/HXGeXyGmwVynKD7zHNBKp/SU/rpq69DHFl9ozNw4rwpzNMlTaykLU68Z9XYqXb9ERj9eNUrFb+bGbVyOailLrFjrFpEB7PJ/qx+bzqNTXijAdw+KWOxcw66uMwstgL7vMsyGHn8kjf8AxaRuz77Qpi9s5FjxDk/u9sH/AGVWQTPz+UC/roDSeycXR2XtLDbeaeMTU6yxy9/xTeyZCfmZJP8AmGobxUzU52RnaFMgWchZiwNPj1eacojfoHf/AAnUJiNxN9/F3IcsKUBv2V97SEmUR/UyzRKP/K11beozbr8SsPh5CJqmzomymUkHdZMrYBKJ9UDO3y7ahSESzK/hRgsVNY4sYjKNh5+O7FqsjoGHzCqh4/vaoGF2Lj8/sjF5vD598HuKGKR2aKB3hsRrKzAlUBYFQwYFQSFB7HpPFr8QYH2v4hZ7GFnhrWL0OfrlfXy508qdgPis0aN/+9Lzw6feO6cVX2dgqCxWmVWfLO/SlWu7s6TLwQyyKWlVSp7hyONUhxftHf75lMTislhci7Xo6kV6gvVALE34o0JABDAFnXgqOCSAdWarZ8LNqWWr7n3Fkt/ZOrIzJjKNdv2dHL8ETkI3ftzyR8tdG9KkeBuYfb+1JD9yxtGz9zdJY3861MyVPPbpHWsvXM3Kv6FRx2GmrtHwR27tanB56xyLAh6uQACQxPUze/t66A6/CjxKm34+SpWNvpgjj1haGFJhIDC5YLzwAFIKHsO3fSw3F4tbL3qxG/dmXKdVWb9nZrHyeZPEob2SWXhkPbnjuvy1bqORxe2fEHPQ4kqIk2vYssFB4DwTNx3/ADYflr7+Gmz9sbi2Di1ZYnsPRgLsv4g3lhieD6jl+T9dQomcwt6tUjymxN5x7rxl+4lOxDkYOi3HIwJjinLcMyOVIHcKSOOO+uja2CzfiDEJc9velQos7z361CF2txlBwRKOkLGQPYUE8dwFB51OeMfhr/QGD9r4eTiK6phl6F6SZIlE8TlfTnrhYfxals7gMu7Jv3acUd3IBEObxhmjkableqK50xkRCdQSwXvxwrcc86pDiw1DGYbxCtU8I0dalTuY1IexLKBGyFiffwer6ksdW45exF4+HPNIBiHsHZ55PYTCBbC/mZCV0oNrZ9r+Uy+QtoaFS01KaKFm5MdWNXBct7z5aMPmZCdPHC7ByO5fs/yTIhh3FlLEm6Kzcd0ttL50IHPxQIv56AYdfLwirNLbkSFoJ5oX+HKct/7AG1R8raG1vEbKXqboqZ/CSS9Snn/LKXf9TDIP8Guanu2Dc+DTOVU4XMVFvrAfWO9WHFiA/NowRx7+k6pm7c35ONx9/wA3zBSswv1+9kZHpTf4keB/4tQpIYnd8OL8cMH95kX7sleapLIx/AZ3jijPPzaNB3+OtLaxztvCSbsq77yTn8cK0YJB6pJGpm6gfiHKfprV2zsw24No4TMSEdd+hBZb6vGrH+Z1SCv3/kamA8c8Ebsixw7gw7Y9GJ7LNFMXTn5HzCv140q/EDay7X8aJ7Evs0MxSluwAduZSEjnQfPpUn+LVs+0wgXdmOyJjaQ4fHLkOlfVohaCTAfwPz+Q1JeNGNbcnhom4qDCTIbcm++RykcmSNfZl5+TRkOR8tAUOLc1qhLXir1jkM5kLIkqUF/Fatckxhh7o4yxkYntyUH7p40V4V7E/oDtVKVmcW8tbla7krfvsWX7uefgOyj5D56S20dq47aWW21mo5ZMhcu5SokuRnA6njlDKFQeiJy69h+ZOtMj0GgE99ovaUl3DUd30o3ezgmb70sY5aSlJwJe3vKELIP906Se3bd+SHaFXaFeG1uZsXYoWIHYitapK8jCUupBUrJyq/HkdxrZciLJGyOodWBBUjkEfA6yNs25R8HPGzdOFnrxfsuzZNKGXgddPzB51dAxI4RuShHYcgEkcaAicRkcuc/YyO6VqNdoy49JfIkSSQqLhPTIwHJfmMDliTwB30x94+J0FPBreydqSJb39TBQg5eSZjXQ9KqO55Mp5J7cgaqt7DW89X3jk6EcF58euJYx/fnCkJLJNKrPY7xEKfaViengjk6gcBtPdu6LLXNvjzLthRBPuIoVSBAgHk0gRyqheAZjwW59ngd2AYXhjtPJ7tzO4tzZvHth6t/HzYirTkkD2FSVizySKPwH04U8H17cdzUsHua/4XmHb256cuPel1Va+YrP5lSwVACqWH4Cekcg+gHcDvqe8OcCfC3dWdxlSaWQvteXIzs7k+ZZhlbh+/oSG41UcF4T7iG3KG4NrypZXJUIHyWOvcywXWdQzeYvv5LcgjuvHIIPfQF78Stx/tehX29Y4nYXuYbCt1eavnTR+vv9gggj3aW+Lym+5Ni3LKR49NtQ04a1m1SlDPUgk6BI6RJ0qZOk8sWHPb11IbH2zkchvDEbchryQ1a1rzpcfdmAs4pF6y6An/PxFm9l15I9GA1ObY3vBs3wuavJDXyORt0kxtamZ5Zw9jlo+iRXIRAACxRAeFHtN7SjQELX2/W8Q/EpNsYCEw4ixXowsynlosdBF7UhPuMisgHzkPw1sWCCOtDHBCixxRqERFHAUAcADSO+yNtStifD6xnfYmtZW5KBOB3METGNFHwXkOePnp6aAzp4n4Sx4W7jt5WA+TtbO21uCwq8riMn7nYf7KX0b6n5crvd1uIbdzCOBDB5LSxL1ciMkAdHPv4ZYgD7wgPv1o7xqMUu3sXj54UnjyGXrV2idQyuvtOwIPqOlDpFQeGcDeIm3tr1Z5nw0rNlbdKb2vIggI4QN6lGcqvSfTj11CliNaLwn8AHt5QiPJ26skrIR7TW7IJVeP7oI5+AU6fGx8YMNsvAYzkN9zx1aDkeh6YlHP8ALSD+0Hbhz2TxmEbqZKot3bAHHSEgg8xifq7Iv8J1oLaLM+1cMzEljRgJJ+PlrqkFN4v16mQ8WdtYa3x5eYwmRouD7wSjD/2nUV4R5U2Nr2Ns5gB5Y+MRcUn8DqTVYnn4qax/j518vHqxJV8Z9iWojxLXev0H5SWxG4/NWI1w5znD+M26atMlIbWLTIOvuE4hY9Q+HJhjJ+Y0B9qcwj8A8HkWYC5iZqQbv3DVr6Rn+Sa0iNZKzliSLYO4IEPTGuQyICj3cZByNa1GgA6yT4hbTyWb8cd7fs3Fw5xkSo1rDyyeX9/qvBHyEb92RGCspHf69wdbazrbtvD9pfekaqnCbfS0pI79aQoB9QQ7Ag+vb4aArlDKbYO07m3KkW4Kty5m8bDlK2clWSYwGToCrIvZox0dPx+OnxWvYnF0oK8dmtHGiIiorD5KOw9fcOdZq8Yqr0M/twJcuTJcxdCx0TzGTyeq11dCMfa6QfQMSR8dWnDWJHkgLN1FarOOfiJIeP8AqdAWyv8Adtx+J242rcNHHtqWkWB5DF52HP0IXnUh4Obgxx8PcFFJPHDLFVhgYMeOSsIJPyHZv8J1C+CoD7z3P1dz9zxo5PwPm8/9NUfaDNDtKREJAFayR8iDaA/lqFGf4i2sTQzO09wxT11sw5etEZ1YdoZCwk5+XSTzpRTYGlvOS7a2RhM1Hjz5xmz+asAQ42q/U8q1YfVS4LcFuW4Pu55EP4t2plxKkOf6p4yvf09kjTYsRPhfD6yVs2bjSbMF/m1KWCMir0oqjhVQfADv7ydUhdPszQrF4LYAxqVjdrToD6hTZk4/lxpo6W32cf8AwT2t/wDLyf8A1n0ydALjxPYWN47Bx8jARNet2n5Pb+rqSAH9ZNVrD2a1TxT3ZknVWSlXx2JjPP4QySWZj+S9/wAtdfjhM8G7tnOh4YVsqR/woh/30v4701alva0hHmrYsyAn4ilUQf8ALK4/PQEBuG02SwniDvC0wKV6QwsD8+s0reZPx9HmC/w61ht5VXA45U46RViA4+HQNZS3bXSt9nHZ1dOSuXt/e7jHu0shjnmJJ/31X8gNal2a7SbSwjseWahXJ+vlLoD/2Q==";
const MIMG_LATS = "data:image/jpeg;base64,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";
const MIMG_BACK = "data:image/jpeg;base64,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";
const MIMG_BICEPS = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCACMAIwDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAABgcEBQgAAwEC/8QARRAAAQMDAgMEBwYCBwgDAQAAAQIDBAUGEQASByExE0FRYQgUIjJxgZEVI0JygqFikhYzNVJjosEXJENTc4OxskSTpLP/xAAbAQEBAAIDAQAAAAAAAAAAAAAAAQUGAgQHA//EAC4RAQABAwICBwgDAAAAAAAAAAABAgMEBREhMQYSE0FRcbEUMmGBkaHh8CJC0f/aAAwDAQACEQMRAD8A1TrtdrtB2u1V3Nc1Ks+hy63WpaIkGIje44r9gB1JJ5ADqTpMzOLd/wBwpE6lwYNtUp4gRESoi5tQkg9D2SVJSjI54J5d50D60p+MvFSZb7qLStRbBuOW2HHZTx+5pTBOO2cPP2j+FPMk9x5Ar97iXxZYlOsNXFbrslGdsBdNU7IUfBaY5WEH4q5d+ls7XazbdRdn8RLaqTT894vPTVjemQ7jALieRCeeMDmEJ2pA3KOgdtr0e0OG1i1m5GZv2xLCFu1Kru5U/Ne5HaCeYClEBIHXcDz66Bb+py6R6OkVCFh6sVOpNT5Bb6mU64XVAflAAHkkHQVK4n0evdjTF1JUaiQ5HrZbeBC5b2DtUUgYASApX/UcH4UDF9F4g2xUJ9vw51Zbkw2qq9OfaabcXjawUNpSkJycrWcADokaiuoM2/EXhW5VkO0tUerRYVTcjzzhIU+z/Wo8woKB8eXI6GqdKmR12c5PeMuRULndqs6QOiwh9uOlfw3FWPjoz4YzAyukT0L3IVachhZwR7cOSQOvftWNCsiTSaVb4hVCQpiXHtGEqKrs1KCZTkn1v2iAQnO1Ayce9oHo4uDbXGvs1OtiPdUNOUnomayCkA933jWOXinzGhyuoRwdu9+v2DJZWw84Ptm1QopS+CM9pHB5BwD8I+A67dL28b/tq4pEl1NxtocU6iXHeQF747oSkgpOORBBHxQkdDqPM4yUavNOyawh+XWHCG1NRWdwccAIC2ycDZuHunmUOFPVtB0GxLVuil3nQIdeo0gSIMxG9tWMEdxSodygQQR3EattY8smvcVLWVNepNOFuUSert1KqMZyY2HD+MBtJKVEYCiQAcAnnk6NKdxF4nvtGQu6KG+ylWPWY1LD8YHuDpSsON/Epxqo0frtKqyeMkt+ux7Xvimx6TVZR2wZkVwrhTyOqUE80L/hV18egLV0Ha7Xa7Qdrtdr4tQQkqUQEgZJPcNAguKNXbvPiUaPIWFUC0G0SpTZ5ofnODKAR+LYg5x4qx36KINPTLaU26FFLiSlXMpOD1GRzGlLZ1Qdq0aRWCne/WqlIqxSr8bjjxbjJP8ACAgr+CNPOhQ+yYbQVlzYkArV1Vy6n46iqaVYZMUtsKU60VbWYDb5gxGU+KwyN7h+J5+WhS47Ssyxaf8Aal3V1iA2rIQxAjoYLp70o5LecP6vjjTFvO64NkWxULgqOSxDa3BAOFOrPJCB5qUQP37tIe34lfu+Yu4qpDqc2qyzuU5FjtpTGR1Sy26/7KEJGOTaSSckqJ0FBVLgoM3tZFr8JUymFn+066diXPPKzz/m1409+46AwqdN4Y052mufeqXTlZdZT3lHNSh4gd3lp5U2x4sOIKk7RnnqmE5/3qSJT2e4BxR2j5YA0OV5UqBICq5c0OhlXtIhwlpLuPNawST8EgfHQBvD6lVisyanU4cJ1yh1WFVJNPeCgS2XR2Sml45JcUptC9vmT46o4tTqlAkyqVPtB+r3LUVNTm4OR2TMYtBDSXh3KQlONp6buvPTd4MiOl26qZDliVHaqDUptYSE/wBeyCrkAADuQc4A5noNCLMunOV+5alIudVKkzKvIby3sHsMq7JAWpSTkAI5DIAyfHQBC01+lTe2q3C62JJkncllTqQrHTaj2yB8AM9+iu2ri4YvSU0ut0GqWBOeOAHSpEZavzEFOPzJA89Mag0qdUmEMz002u0x8exMY24P52zlJ+KT8hqtuaxDBSWqXSKoqIpOVNxZLTjOe8erv5H0xoLmNwtZp7qH4Sos5hWCHGlGBJCT0Ul1ghC/H2kjPjq5FotwH1SXZC5r6chqS8hKXwgjmha047QfmH166WnDG8ZVkXezZlUDzNHqiiKcmQypkwpPUtBKsgNr7glSkhXTAONPR5AcbII0Covq3YtwU1VJkrLLkhWYj6eSmJCQVIWkjoQR8xkaY3Bu85F8WJDm1DAqsRa4FRT4SWjtUf1clfq0H3zFV2TZ7QttLWGlK/5SyR2bo/KsJB8lHULgLVFNX3dtMVhtFSjxayhkcuzdO5l//OgfTSCT012u12qjtVF4ylQbSrUpBwpiBIcB8w2o/wCmrfQJxuuyDaXDWtvSwpxybFdgx2Ue86642oADyA3KJ7gk6BA8O2vWKXQ4gVs3R2EE55JBbAJz3YSJB/Vp523WmX4MiW+vsmg362NwwGY5JCM+akoK8eB0heHKe3o0Ntx3sw7Fajqcz7iFI+8V8mm3f59H8684NCt+VV6k3thtKRUJUce8+4oAQoKR47UoWodwHmdRQtx0uxq6L6tex0vNxYjCk1OoiSopSle0qbbc2nIwjmR3Fzy0bWrBpypjLInVG3qk+nfH7Kb6xDnJ/vNFzchf5eSh4d+kNZVXqyb6kXzUi1IUmS39q7xkhMtwoJR4bMJ+WtT06148ZUmEqHEfosv78xHEApjyAfaKEnltV15Y2qBI97Q2mOEiJCCltKVq3qAAKsAZPjju1SVSiQkLdlsxI6H3ebjqWwFqPTmrqdXbbaGm0ttpCUIASlI7gOg15TEhUdefDQLThbuRxTvqMokgtUtwZ/ItOq3hAz6/RZb6xuS9Vp68HmDmQrVvYKQ1xjvAZxup1NV8cKWNQ+ASA5Zkdz+/MmK//QvQM2m0uHTGlIiRWI4WresNNhAKvHA79RLkjIdp6nZFbdo8RoFT7zZbQdv51g7PiOerfUSbTYM5TT0uAxLcjErZ7VIVtV5Z5A8uvdoM5cXKbDVar86mpfhKjKTOhS6nMdMuUUKHttNKOQnBPtKAz3AadXDm/o182tRKoSEP1BhSXAPdEhvk6jyPVQ/hPloP4nwpNMtt1tSI0m47pkopynljchBdyClOefZtthWPEjceZ0p+Ctz/ANG6g7aVQmCJFqj49Tlr5JhVNo7EKPglzASfp3nTc2k6LzmIqMeU24VBoDt0ZGFBrJZfQf4m1Hd9PDQ7wfluDjU1v5OSKJKQ6P4g80tX+cufXU+s1JExx2U+wY+9a35EY9WHBhiaz9ChwePXQPZl0xbN4z0OTV94YejyIDrwI2srWtCe0V/DvHM92c92g13rtdrtVHazdxlck3/esqCwVLptDbcpzaR0XKcQgvK/SlxtHkSrWi50tqBDflvq2tMNqdWfBKQSf2GldwjpiZNi0qpzmULnVgu1R9ZGTvkuFw8/ylA/SNAhbMnIZteE5J5MmJuf54w2EjeM92QjZ/3dD1crku8pDctalGnsOuLjt9O3eUfvJBHmcIQO5IA7jnylhRt2NbyFlC5chbLp70xmHDvP6l7R+jVg202y2ltpKUoQkJSB0A7hrFajm9jtRTzn0bb0Z0L22ar9z3aeEfGfx6rS1qK47ww4h1Ap5JSEpI/wmwv9irWpaTIEmnsPA53tpX9QD/rpR8OKPHl8C6205hH2uuotJUR1UvLLf7pSNe6OI8yk8IKNVaUmM5VKhHhwovrKwlpt9aQgqWTyCU7VE55cuesja9yPJrWVwvVxHjPqcOvCarbHX8NA/BS6KxdNj+vV2axPktTpEZE1lAQiU2hQAcSAByySAcDIGrq6LlhUxh7t3sBkJU7tSVFpKiQFqA5hOQcnu1zfAM2SR/tjuY596jwT9HXBqFwEWE2NTiD7zslX1kOa6yJG/i/WnW1JW27bkd1KknIViQvBB8OeqXg/WY9Ksa3GnlkvS0qDTSElS3CXVkkDwGck9BoHlr55aiU6ox58dLrDqHEZKd6TkEgkHn8QR8tJ69OKtzWtxZkRPWIJt6EiEl6nuBKXn2nyEqkNKxlRQtQBAPTuxkgCTiSPXL1seCnr63MkYH+HFVj/ANtZ1uShIZuW46c+3uQipSAE9Dgq3jHgfa5eeNaGmTGZvGmhsPLG2nUuW6e8do+42y2PnhX76V/FSCiJxQr4CR98I0kD87KQf8yNdLPuTbszXHczfR/GpycymzXymJ9EG2bxkVALp1VWX6ow2lSnD/8APbSgpDn5lMlbavEpbPXOobtEVcN1PsqBebTSlb8d/aLDZV8+Z1QVdt6MYtYgjE2mOCQ0B+JKTlSD5HGnHwMjRZ963DMaSl2IKXF9XJGQWnXFuJHyHI/DXLCyov2+t397hrmlVafkza/rPGPL8G1wXuSXX7JZj1RwuVWkOGnTFnq4pABQ5+ttTav1HR3pZWuEUHjFVacygNxq3RWJ6EDkA7HWWF4+KFtfy6Zuu4wwW4qyFxeGN2vt8lt0aYpJ8D2K9U/D+Wyu3aZEbLafVGGGEoB57ENpSCfmFfTUX0gK6YViP0CLuVULiC6cwhGN2wtqU6rn3BCSP1DSotm/vUbGcriHB2kelOupHi72ZSgfzvJ0WCwaT29Xq88kKQ5MfZjHwZS8s/upROpYWGwpah7KQVH5c9RoqEU+KzESSrskBGf7yhgE/MnX1+PIqqmqVEKjJqMlqnsAd6nFBJx8AVH5a1C7FWTkb+M/Z7HiVWtM06KYnjRTMz57bz9+B228kwfR/t1xLwbW6hl8qHQqdeUrB+BWD+nSvtG4qRVYlQsy5IKBSHJj7sNiQotAILyyghYOQEuBaCe7I7s6PUlimWPKs9ZPaUG5H6cwhw+9HCi43ny2Oj6aF6FSLYurh43Br9LcU6y/LdZnGUGXYylyHQAp0gpSkqSUkqyncUE43ZG3bPHJnfjI/gXlHpdOjU2lUpuPFYAZahD2DlI+8j+AdHvJzycB5HPPQnX73ptOMdRqoCmlFqC+UlyQAesWQx/WKHQA4zyHeMlXGy5NacjO0Gt15ugVCexSoz9RWAqQ4CS4obDtLbSQo7vLAx3GVu35b9qzXBw24eO1eRuLSLhq75Lr5zt3jllKSe4EabG5pcFrWqMWfVrrqlE+wxUWWI0SnKUd6GUFS1LUPwblK5JwMAdNLubFkcJ3nqJWobtOpy3XER66whTplx1LKkMpV0ZXhWDkjpkeOmDwYvK7bguGqU27J0eSVRWpkdLMYMhkFwoWkY5ke7156BDxcv8ACp0uTS6Zc9DmOvD7Nejhvs2g4pCQFAYUMD8QOgKaPeTcZHbMuRkqaaDaW2l74lLjjB9taeS3DgeynmTgDlkmNd1WtauPR6vcNFZclUk9qy484ULZUTuaZVgjKj76kHIQOulJXk2tX4651vwKnYtZhSWXZkAPlyOphaw327I5YKFKRkDlhXLpq1tGw6CK6uj3um4J9bpjhU/THpSEMPlR+7LIGXHu0JT0xgElRwNNjdd8P7qfuW851TkrebdlzYCGXikpzHBcSkpHgpRcV+nVpx3aSxxPYUCAqbR214HcW3lp/wDCh9NRZc2FIvupPsRxGhMN04hDKgG20JLqTsA/hTlP8IPjruLURVcr1bvdtRXDotXi0Hck+ylksEuH5POo+uutmW+0sVUx4Mno2TGNnWrs8onj5Twn1BycbvaGR3/DTJ9GEmLUrqpruN0ZEUMnP/BKnlAfIqI0tA6E7gtJ5L/YjI0Q8OK19lXjhK9qKxTZVPX3ZcDSnmj9Ukfq1g9Krqt3urPKW/dLrFGRh9rHvUTv8p4T+/A6H6mmRxstNLKkkJiVJgqSffQWmXP2Ukj5ab+snyL2NI4p0muIC1xKJHdlzNnPEd51LSifglRV+nWr0LS4hK0KCkqGQQcgjx1szy0n+IqDUeL1HjOe0in0N+S0k/33X0IUf5UY+es11lx22HKjaasgM1ZbW09OxCg8n5EBH01oTjXX2rO4q2NV1tqcanMSqbMCRkhkqbUlQ8wrn54I0tPSOtFulXjSLpj4MWrM+qOqHu9uhPsKz/E2cD8p187u/UnydjF27ajfxj1ASHglzefaLYB2+Kj0/wAxP000fR1tBdx34uuvI30220lDaj0dmuDn8diST5FQ0qqNTahcdeiW/R0pcnSnkNB5X9XGKzje4e7HPA6k51tvh/ZFP4e2pCt+nErRHSVOvKHtPuq5rcV5k/QYHdro4uLtX2k/JntV1WarPs1E8+f+faPp8SQ4z09ducSnX0oHq1fZj1BsK91UmN906j9TCwT8NKzh3bFZuByPbMqvijUOfFeqS1lKvWFxS6pt9lKumNzQ3BXgD5HU/GexXr3tE/ZzaVVmmOidT9xxvcSCFNE+C0lSfiQe7WbLJE6+zblp0J2TTZ1HcmPrqqUkP0xhTjoUysdCVqLfInuONZJrK24mRGHq1TKZRGfUo0KmPx4TQYKOzQ4WorakuhRQ8k9upYWn2vaO4507KPaFsWVTW1IYZQIbSilS8bgkZXyHiNhx+U6znEpsq1axVfWquawqKiM8HtrYb/tFn3NilDClJB7jnu66M7h4hPux2qexGdrNyzmQsQ0HahlkxnB2rizyQhJfV1I5DqBz0BN/SVhHFs+oMqaDdAqe7lyUW3EqScDzQT89SOCtXo0+w6PClsoDioTSSp0ApWQkqJz3c0qOqPgSin3Nc9dr9TuGm1i4AwYi4UBCkx4kdxZUoIUQO03KOCoZA8TkHQDGqzlpz6pRbTqUW7qDTy+n1ZkFufDRtdSSkEffIQXCSU7umfZGoDvjxw7psagxqpSGw04XDBWlJyChxtaMZ/6nZnyKdQ3LeYvCzKRWINW+wbipkHtok9TC4zb8dTe55ggqLjiBuUVO9MrIHI4HXBese5YcJmlyvW6NUail2OduClXrgXjHVJwsgjy0EWjw/uK4bKqdQplyynsU1taqOEtpVMaCRlrKVlYRgEDIGSeQ66orKDJmMTJlar4ANShRZxKE7G2oiXHAEJT3bkMpCR1wT460vYnDoVrge7RK4js5dysv1CYSObb0hRcSceKMt/y6TFpUsccOJDaY0QMUJiNDM5ptIDcWKyVlETuyskpQfJKzrXqUhKQAAAOWBoMFrROiPSKbU2+xqUFxUCWg/hdR7qvgTzB7wdRFVJdOeYntgpchPIfGO7avmP5VKHy0+PSY4XLK/wCn9DbCpADcepw0jnKSVBCHEY6rTkDHeMeHPOkuU0/TXnm1FxK0EbQPaKjyCceOT08dYqcXsrm9PLfg26nVYysbqVz/AC2mJ+nP975k3eGVETcjd31V9IcjPpTSU56FCWiXP3WPprRHCWou1Phfakt4kuuUqNuJ6qIbAz88aT9aSngrwFYiKQV1p+OW9uMlUt/mtR8kbsfJI79Ozh1AZp1gW1DYyWmaXFQknqR2Seesq1EoPSZhPzarARGB9aao8ybFIGT2sd+O4MfLI+epVzwo3FLgxUGoSB2zUZE2AE8ihSW0vMgfpUUfI6mcaJzcTi1w2adCS1LFQiOA94cS2APmoDQ7wyqDlmTqxa0lf9iyCwpKjkriB0ONq5/4L7n/ANWgi27DplDtG2q5SIbcSE5Ppk13HNSt7zaVFajzUfbIydaXGs0KdjU3gFWqQpwCXR3psdoAHIEeapSfolH7a0q2oLQlQ6KGdB+j01kW5a0vhT6Ql01Kmblw1FqVUoiATvjvNpK3AkdS24oL5c8KPQZ1rrWYb7tB65fSDrbcCp/ZFXbhQ5dPnFG9AcDSkqbWn8SFpCgRz6Ywc4IQERod2wr4rCquGUR6ZTiia422+kLEhb/s9mAXQShITuG85AVzGo9r8FKzdtO/3h6TSaPNUl2Up4j1yqe6oLdI5JbAJ2tJOEkcyTz1+510OUOgS7fqtBt6nIkzoVQbn0NARHqTaJrSHVFAJwoZTy5cs8hp0N33RGYzTcdS3D2fsJSnAwkDPwwDoF7blsxrF4lxabSmQy2m2Z4OAAVlDqFJJPecnQ5aXBWHeli25WYcl6mVZiGytqXHVsXuzuKtw/FzVz+GmBb9QbunjDMfbT91Eor0dORglLr7WM+fsq1A4P3lFpdiwKdMQvMIerlSB0ShK9xPiQW1D6aigii8P59K4lUSFcLgpzsmey+69HYBh1VxpQUFBI/qHlHkcews+B5GPTb5l2Pa71tUV9w1l71mnshYbSmMEPuBUjCBu2obSolxwk5wBySo6YXFK+KGqm0aS2+Q+zVoLwJRhSUB9tSsH8o0ImkVHiU3UanMi0GzqHNZTU5rEFpKqlU4p9pIcdByAo7cjCQSeitVB36JNIhw+G8qpxipxdTqT7hdX76koIQnP0J+Kjp3aVHoxJB4SQXktpaS/MmuBCeiR6wsYHwxpr6AC4ySVIt6lwkZ3z6zCYGPJztD+zZ0oJNgUqrcYrcaEBppxDbtZqJRkJeS0QlrcnoSXCOfUgd+mpxZktouOwWHzhj7Xekr+DUJ9X+uhaFVmEcT7nqbRTsjRqbTULx7qNr0l7/Kk/tooe40VRut3RS6MoJWzTzJqL6vBEdrdz8i6oD/ALenhw33f7PLX7TO/wCyIe7Pj2KNZlqUhUy0OIV8STlKo/2HDXjmpalZeIPfl14j9OtQ2MpKrKoCkABJpsYgDw7JOiEj6SyJD11UpcLPr1Oo8mpxO89ozIYc5ee1CtR71LMq9LMvWnEfZl3RRS5JHQLcaV2Kj54cWn9OjDiQttnjTZ7brSXUzqVPigKGRje0pf8AkCtKvh7Mk3FwMrVF25qlrONVinDqezB9Yax/K6j540FbW6updl3NlRC5EyfkeKnWmVf+zytbEYSUMtpPUJAP01ihATX5MKnRiFNVi4oiEgf8t1EZX/hOttDQdrMHE2q1G3eNlfumAgusUuDEi1BvbuCY7zasO4HP2FhJOOYGtP6S0ItJ48Xoh5pLrcuJEYKFJCgoiOFhODyOUhwY78HQIviEU1qamdARHlogUpM+UqOxskFv1xnPb45OKSMYcHJacK8dWVNvUVCOhdt0WuV8tMupecjxVIaZ3oCclauWRtB1KFKqdvSqq3SKk3Daqqo1KpT0ZwhUSOuUVSGcK9tpSVFCdquaQvAJGDo1o3o80apRGl1atVKosFAUqOuY4ttK8hQOM46eI786DuA9VYqtz3BVXnYESQ4wyyinia29IS2264tTiwk4SPvEp+WTjQFHr0yl1Kq0ih0n+kzbb8otSKNKbfDjbhfO4oHtBQ7fBGPw+erC/LFhcNatHetwFlbtLqzKygBO5PqLis8vMDRPa/o+2lV6BBkSGVh8R2yHEHYvdsHPcnB66BUXTWI13KiW5TmKkKs6ptCociKppxkoxuKs9wSn9tFFGumXHtChUO20wnK1W6aiE2xCY2oaKkAKedV1W6B7aldEBIA5qJ1eXFYMzhfKh1+mXVUXRHfYRLbkS1LDjKnghxBSrPs7VgY1a8E6Gm1RU51WRHdlx4A7DCu1ciwk5U02oj2WysYVt5rUTk4AGQYXo5R2YPC6JAYJU1DmzoyVHqoJkuDPz66Z2lf6OjTrPD1xD39YmrVAK+PrCs/vnTQ0Cf4/uLjT7OlJ5bZU5rPmqE6B/wCNKio1x2n0m+p8cKVICkoaT1KnVx4jCB5n753TY9J6Mv8AoHT6m2Pap1XjuqOeiFhbJ/8A6DSksSKbjv6n0kDfHcqjlTkp6hTcVKdqT5F3s/poLm+qIi3bPs3hyghS2GHq1VFDoewbUtSleSnln+UafHC18yOGdpOnOVUeGT8exTrPT12GtXpxOuFxlL8aJQnYsEnmTHad7JxQ+KytXy1obhfH9W4aWmyRgoo8NJ+PYo0ARxlU7C4icN57CAXHZUynbyM7S82jn9Eq+ulbw0cXbkCz62gbotYosunTGsZCzFfLhHxLPa4/LprekUpUWnWbPZUUSI9yxQ2sdRubdB0qabUHadY9ttRw2BCuKWtklOSnMl5pSfNJQ4oEfDQUfBWlql8ZaPQj94zRpL7zpHPJjMlpCvmVIOtmjkNZh9FuCw5xPvictOX2GGGkKPclaiVfXs0609oOOszVS+Y1v+kVcjtSbzSZSo1PS8FbeymNx0qayrkEhW9xGTy9rnyB1pk9DrMMe3addnEfiFR6sz28SZUXkOJzgjaljapJ7lDccHQV96szrqq0dukNs1CpN0+TKjyUDs5UxUd+OsMvowCl9CQtJ/vciOuq2FeV2UynMqcsa8GYjTaUuSDEWANu0binHMbE4Pz1B4GVuZK4i0tmStL7lP8AtKGiStP3zrSWMpS4r8eNgwTzxy8MSqteVzWzbUi7KXcNUaqAdSXUOvl5h/cee5tzckdeW3GNRVhQK5G4hyREiSUTFxqXVFBn/iI7SM6g7k9R7S0jn46r43E5anWIVGROrkwMtoTGpSC6oISQRuKeQ6DPf10YejlxPrHESXXVVmHSESIzba/WYkNLLruSeSyn3hy0sWuPN6VG7HbfgPU2hRJMxbC10qC207gKIyFkKO7l11RbVlV23YsxZlp3BSGI0ZyTMkT2VJaQ0396o7yBuJ7NCQNHNPv+l2jY6H6g0y2lFMYLFIh4KVvqQhSFPKHvPOrAOwZ2oSonrqEzNmwKBxCpoqE+Swm35L2Zclbyu0GU78rJwSFEHGB00KcJ4Ea7buq8mpsoLVstoTTYraQlhpXulwp/Ev2QdxPX4DEQ7fRekSl8OJESerdMh1WU1IP+IpQcV+7h03tJj0ZCfsW6Rk4+2t3zMVgn99OfVAPxuo667wouaI0nc6iEqS2MZJW0Q6nHzRrNHCe6FUyDc92sJAfjQ3G2SR7oUpyS4fjhtpPxWNbMfZbksuMuoC23ElCknoQRgjWHLBYRFos+koyYsqstwnUq5lTRlMpIz5htI+GfHQENbpT9hUS4oDeC7HseHHlAjOXZMhRc+e5wn5a1pbkL7Nt+mQiMerxGWcflQB/prKfEGpSKxXbickqA9f8A6OR30oGEltwrWpOPzAY+GtejpoP/2Q==";
const MIMG_FULL_BODY = "data:image/jpeg;base64,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";

// Muscle icon using real photo — dark card + image + % badge
function MuscleIcon({ muscleKey, active, size = 68 }) {
  const imgMap = {
    "Chest":      MIMG_CHEST,
    "Core":       MIMG_CORE,
    "Hamstrings": MIMG_HAMSTRINGS,
    "Glutes":     MIMG_GLUTES,
    "Calves":     MIMG_CALVES,
    "Quads":      MIMG_QUADS,
    "Triceps":    MIMG_TRICEPS,
    "Shoulders":  MIMG_SHOULDERS,
    "Lats":       MIMG_LATS,
    "Back":       MIMG_BACK,
    "Biceps":     MIMG_BICEPS,
    "Full Body":  MIMG_FULL_BODY,
  };
  const src = imgMap[muscleKey] || MIMG_FULL_BODY;
  const w = Math.round(size * 0.95);
  return (
    <div style={{ width:w+"px", height:size+"px", borderRadius:"13px", overflow:"hidden", position:"relative", background:"#1c2235", flexShrink:0,
      border: active ? "1.5px solid rgba(255,255,255,.22)" : "1px solid rgba(255,255,255,.07)",
      boxShadow: active ? "0 4px 18px rgba(0,0,0,.5)" : "0 2px 8px rgba(0,0,0,.35)" }}>
      <img src={src} alt={muscleKey} style={{ width:"100%", height:"100%", objectFit:"cover",
        filter: active ? "none" : "grayscale(1) brightness(0.6)",
        transition:"filter .2s" }}/>
      {/* Overlay gradient at bottom */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%",
        background:"linear-gradient(transparent, rgba(10,12,20,.75))" }}/>
    </div>
  );
}

const MUSCLE_SVG = {
  "Chest":      (active) => <MuscleIcon muscleKey="Chest" active={active}/>,
  "Back":       (active) => <MuscleIcon muscleKey="Back" active={active}/>,
  "Lats":       (active) => <MuscleIcon muscleKey="Lats" active={active}/>,
  "Shoulders":  (active) => <MuscleIcon muscleKey="Shoulders" active={active}/>,
  "Biceps":     (active) => <MuscleIcon muscleKey="Biceps" active={active}/>,
  "Triceps":    (active) => <MuscleIcon muscleKey="Triceps" active={active}/>,
  "Quads":      (active) => <MuscleIcon muscleKey="Quads" active={active}/>,
  "Hamstrings": (active) => <MuscleIcon muscleKey="Hamstrings" active={active}/>,
  "Glutes":     (active) => <MuscleIcon muscleKey="Glutes" active={active}/>,
  "Core":       (active) => <MuscleIcon muscleKey="Core" active={active}/>,
  "Calves":     (active) => <MuscleIcon muscleKey="Calves" active={active}/>,
  "Full Body":  (active) => <MuscleIcon muscleKey="Full Body" active={active}/>,
};

// Map muscle keywords to canonical keys
function getMuscleKey(mg) {
  const s = (mg||"").toLowerCase();
  if (s.includes("chest") || s.includes("pec")) return "Chest";
  if (s.includes("lat") || s.includes("rhom")) return "Lats";
  if (s.includes("back")) return "Back";
  if (s.includes("shoulder") || s.includes("delt")) return "Shoulders";
  if (s.includes("bicep")) return "Biceps";
  if (s.includes("tricep")) return "Triceps";
  if (s.includes("quad")) return "Quads";
  if (s.includes("hamstring")) return "Hamstrings";
  if (s.includes("glute")) return "Glutes";
  if (s.includes("core") || s.includes("abs") || s.includes("abdom")) return "Core";
  if (s.includes("calf") || s.includes("calve")) return "Calves";
  if (s.includes("full")) return "Full Body";
  return null;
}

// ─── DaySessionView — Full Screen Workout Page ───────────────────────────────
function DaySessionView({ day, userEmail, onClose, onExercise }) {
  const [completedExs, setCompletedExs] = useState({});
  const [workoutDone, setWorkoutDone] = useState(false);

  // Get muscle groups for this day
  const muscles = (day.muscleGroups || []).map(mg => ({
    name: mg,
    key: getMuscleKey(mg) || "Full Body",
  })).filter((m,i,a) => a.findIndex(x=>x.key===m.key)===i);

  // Add muscles from exercise targets too
  const exMuscles = (day.exercises||[]).flatMap(ex => {
    const tgt = ex.muscleTarget || "";
    return ["Chest","Back","Lats","Shoulders","Biceps","Triceps","Quads","Hamstrings","Glutes","Core","Calves","Full Body"]
      .filter(k => tgt.toLowerCase().includes(k.toLowerCase()));
  });
  const allMuscleKeys = [...new Set([...muscles.map(m=>m.key), ...exMuscles])].slice(0,6);

  // Intensity colour
  const iCol = (() => {
    const iv = (day.intensity||"").toLowerCase();
    if (iv.includes("high")) return "#ef4444";
    if (iv.includes("low") || iv.includes("easy")) return "#22c55e";
    return "#f59e0b";
  })();

  // Exercises split: strength, cardio, stretching
  const exList = day.exercises || [];
  const cardioEx = exList.filter(e => {
    const n = (e.name||"").toLowerCase();
    return n.includes("interval") || n.includes("cardio") || n.includes("treadmill") ||
           n.includes("bike") || n.includes("row") || n.includes("jump rope") ||
           n.includes("burpee") || n.includes("high knee") || n.includes("skipping");
  });
  const stretchEx = exList.filter(e => {
    const n = (e.name||"").toLowerCase();
    return n.includes("stretch") || n.includes("pose") || n.includes("hip stretch") ||
           n.includes("doorway") || n.includes("hamstring stretch") || n.includes("quad stretch") ||
           n.includes("child") || n.includes("90-90") || n.includes("cobra");
  });
  const strengthEx = exList.filter(e => !cardioEx.includes(e) && !stretchEx.includes(e));

  function toggleEx(j) {
    setCompletedExs(p => ({...p, [j]: !p[j]}));
  }

  function markComplete() {
    const key = "workouts_" + (userEmail||"user");
    try {
      const existing = JSON.parse(localStorage.getItem(key)||"[]");
      existing.push({ date: new Date().toISOString(), session: day.sessionName, day: day.day });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    setWorkoutDone(true);
  }

  function ExSection({ title, icon, color, exercises }) {
    if (!exercises.length) return null;
    return (
      <div style={{ marginBottom:"18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"10px", paddingBottom:"6px", borderBottom:`1px solid ${color}30` }}>
          <span style={{ fontSize:"16px" }}>{icon}</span>
          <div style={{ fontFamily:"var(--fd)", fontSize:"12px", letterSpacing:"2px", color }}>{title}</div>
        </div>
        {exercises.map((ex, j) => {
          const idx = exList.indexOf(ex);
          const done = completedExs[idx];
          return (
            <div key={j} onClick={()=>onExercise(ex)}
              style={{ padding:"12px 14px", marginBottom:"8px", background: done?"rgba(34,197,94,.06)":"rgba(255,255,255,.03)", border:`1px solid ${done?"rgba(34,197,94,.25)":"rgba(255,255,255,.07)"}`, borderRadius:"12px", cursor:"pointer", position:"relative" }}>
              {/* Done checkmark */}
              <div onClick={e=>{e.stopPropagation(); toggleEx(idx);}} style={{ position:"absolute", top:"12px", right:"12px", width:"22px", height:"22px", borderRadius:"50%", border:`2px solid ${done?"#22c55e":"rgba(255,255,255,.2)"}`, background:done?"#22c55e":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", color:"#fff", flexShrink:0 }}>
                {done?"✓":""}
              </div>
              <div style={{ fontWeight:600, fontSize:"14px", marginBottom:"4px", paddingRight:"30px", color:done?"rgba(255,255,255,.5)":"var(--txt)", textDecoration:done?"line-through":"none" }}>{ex.name}</div>
              {ex.muscleTarget && <div style={{ fontSize:"11px", color:"var(--mut)", marginBottom:"7px" }}>{ex.muscleTarget}</div>}
              {/* Stat pills */}
              <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                {[{l:"Sets",v:ex.sets,c:"var(--acc)"},{l:"Reps",v:ex.reps,c:"#a78bfa"},{l:"Rest",v:ex.rest,c:"#34d399"},{l:"RPE",v:ex.rpe,c:"#f87171"}].filter(x=>x.v).map((x,k)=>(
                  <div key={k} style={{ padding:"3px 9px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"20px", display:"flex", gap:"4px", alignItems:"center" }}>
                    <span style={{ fontFamily:"var(--fd)", fontSize:"12px", color:x.c }}>{x.v}</span>
                    <span style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"var(--mut)" }}>{x.l}</span>
                  </div>
                ))}
              </div>
              {ex.cues && <div style={{ marginTop:"7px", fontSize:"12px", color:"rgba(255,255,255,.5)", lineHeight:1.6, fontStyle:"italic" }}>💡 {ex.cues}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  const completedCount = Object.values(completedExs).filter(Boolean).length;
  const totalEx = strengthEx.length + cardioEx.length;
  const pct = totalEx > 0 ? Math.round(completedCount / totalEx * 100) : 0;

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:600, background:"#0a0a0a", display:"flex", flexDirection:"column", maxWidth:"480px", margin:"0 auto", animation:"fadeIn .2s" }}>
      {/* Header */}
      <div style={{ flexShrink:0, padding:"14px 16px 10px", background:"rgba(10,10,10,.95)", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:"10px" }}>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"10px", color:"var(--txt)", cursor:"pointer", padding:"8px 13px", fontSize:"13px", fontFamily:"var(--fm)", letterSpacing:"1px", flexShrink:0 }}>← BACK</button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"1px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{day.day}</div>
          <div style={{ fontSize:"11px", color:"var(--acc)", fontFamily:"var(--fm)", marginTop:"1px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{day.sessionName}</div>
        </div>
        <div style={{ flexShrink:0, padding:"4px 10px", background:iCol+"18", border:`1px solid ${iCol}40`, borderRadius:"20px", fontSize:"10px", color:iCol, fontFamily:"var(--fm)" }}>{day.intensity || "Moderate"}</div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex:1, overflowY:"auto", minHeight:0, WebkitOverflowScrolling:"touch" }}>
        <div style={{ padding:"16px 16px 100px" }}>

          {/* ── Muscle Map ── */}
          <div style={{ marginBottom:"18px" }}>
            <div style={{ fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"2px", color:"var(--mut)", marginBottom:"12px" }}>TARGET MUSCLES</div>
            <div style={{ display:"flex", gap:"10px", overflowX:"auto", paddingBottom:"4px" }}>
              {allMuscleKeys.map((key, i) => {
                const SvgFn = MUSCLE_SVG[key] || MUSCLE_SVG["Full Body"];
                // Primary muscles (first 2) = 100%, others scale down
                const intensity = i === 0 ? 100 : i === 1 ? 100 : i === 2 ? 80 : 60;
                const intensityColour = "#ffffff";
                const badgeBg = intensity === 100
                  ? "rgba(30,30,40,.95)"      // 100% — near-black
                  : intensity >= 80
                  ? "rgba(109,40,217,.92)"    // 80% — violet
                  : "rgba(76,29,149,.92)";    // 60% — deep purple
                return (
                  <div key={key} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", flexShrink:0 }}>
                    <div style={{ position:"relative" }}>
                      {SvgFn(true)}
                      {/* Intensity badge — black outline, white text */}
                      <div style={{ position:"absolute", bottom:"3px", left:"50%", transform:"translateX(-50%)", background:badgeBg, borderRadius:"20px", padding:"1px 5px", fontSize:"8px", fontWeight:700, color:"#ffffff", fontFamily:"var(--fd)", whiteSpace:"nowrap", border:"1.5px solid rgba(0,0,0,.85)", outline:"1px solid rgba(0,0,0,.4)", boxShadow:"0 1px 4px rgba(0,0,0,.6)" }}>{intensity}%</div>
                    </div>
                    <div style={{ fontSize:"11px", fontWeight:600, color:"var(--txt)", textAlign:"center" }}>{key}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Session stats bar ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"18px" }}>
            {[
              { icon:"⏱", label:"Duration", value:day.duration||"55 min" },
              { icon:"💪", label:"Exercises", value:`${exList.length} total` },
              { icon:"🔥", label:"Intensity", value:day.intensity||"Moderate" },
            ].map((s,i)=>(
              <div key={i} style={{ padding:"10px 8px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"10px", textAlign:"center" }}>
                <div style={{ fontSize:"18px", marginBottom:"3px" }}>{s.icon}</div>
                <div style={{ fontFamily:"var(--fd)", fontSize:"13px", color:"var(--txt)" }}>{s.value}</div>
                <div style={{ fontFamily:"var(--fm)", fontSize:"9px", color:"var(--mut)", marginTop:"1px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {totalEx > 0 && (
            <div style={{ marginBottom:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                <Mono style={{ fontSize:"9px" }}>WORKOUT PROGRESS</Mono>
                <Mono style={{ fontSize:"9px", color:pct===100?"#22c55e":"var(--mut)" }}>{completedCount}/{totalEx} exercises · {pct}%</Mono>
              </div>
              <div style={{ height:"5px", background:"rgba(255,255,255,.08)", borderRadius:"3px" }}>
                <div style={{ height:"100%", width:pct+"%", background:pct===100?"#22c55e":"var(--acc)", borderRadius:"3px", transition:"width .4s ease" }}/>
              </div>
            </div>
          )}

          {/* Warm-up */}
          {day.warmup && (
            <div style={{ padding:"12px 14px", background:"rgba(251,146,60,.06)", border:"1px solid rgba(251,146,60,.2)", borderRadius:"12px", marginBottom:"16px" }}>
              <div style={{ display:"flex", gap:"7px", alignItems:"center", marginBottom:"6px" }}>
                <span>🔥</span>
                <div style={{ fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"2px", color:"#fb923c" }}>WARM-UP</div>
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", lineHeight:1.7 }}>{day.warmup}</div>
            </div>
          )}

          {/* Exercise sections */}
          <ExSection title="STRENGTH TRAINING" icon="💪" color="var(--acc)" exercises={strengthEx}/>
          <ExSection title="CARDIO FINISHER" icon="🏃" color="#f87171" exercises={cardioEx}/>
          <ExSection title="COOL-DOWN STRETCHING" icon="🧘" color="#34d399" exercises={stretchEx}/>

          {/* Cool-down text */}
          {day.cooldown && !stretchEx.length && (
            <div style={{ padding:"12px 14px", background:"rgba(52,211,153,.06)", border:"1px solid rgba(52,211,153,.2)", borderRadius:"12px", marginBottom:"16px" }}>
              <div style={{ display:"flex", gap:"7px", alignItems:"center", marginBottom:"6px" }}>
                <span>❄️</span>
                <div style={{ fontFamily:"var(--fd)", fontSize:"11px", letterSpacing:"2px", color:"#34d399" }}>COOL-DOWN</div>
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", lineHeight:1.7 }}>{day.cooldown}</div>
            </div>
          )}

          {/* Notes */}
          {day.sessionNotes && (
            <div style={{ padding:"11px 14px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"10px", marginBottom:"16px", fontSize:"12px", color:"rgba(255,255,255,.5)", lineHeight:1.65 }}>
              📋 {day.sessionNotes}
            </div>
          )}
        </div>
      </div>

      {/* ── Complete workout button ── */}
      <div style={{ flexShrink:0, padding:"12px 16px 28px", background:"rgba(10,10,10,.95)", borderTop:"1px solid rgba(255,255,255,.07)" }}>
        {workoutDone
          ? <div style={{ textAlign:"center", padding:"14px", background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.3)", borderRadius:"12px" }}>
              <div style={{ fontSize:"22px", marginBottom:"4px" }}>🎉</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", color:"#22c55e" }}>WORKOUT COMPLETED!</div>
              <div style={{ fontSize:"12px", color:"var(--mut)", marginTop:"3px" }}>Great work — logged to your calendar</div>
            </div>
          : <button onClick={markComplete}
              style={{ width:"100%", padding:"15px", background:pct===100?"#22c55e":"linear-gradient(135deg,var(--acc),var(--a3))", border:"none", borderRadius:"12px", color:"#000", cursor:"pointer", fontFamily:"var(--fd)", fontSize:"15px", letterSpacing:"2px", fontWeight:700 }}>
              {pct===100 ? "✓ MARK COMPLETE" : `💪 MARK AS COMPLETE (${pct}%)`}
            </button>
        }
      </div>
    </div>
  );
}


function ProgramView({ prog, userEmail }) {
  const [activeWeek, setActiveWeek] = useState(0);
  const [expDay, setExpDay] = useState(0);
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedEx, setSelectedEx] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null); // Full-screen day view

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
      {/* Full-screen day view */}
      {selectedDay && <DaySessionView day={selectedDay} userEmail={userEmail} onClose={()=>setSelectedDay(null)} onExercise={ex=>setSelectedEx(ex)}/>}
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
        {[["schedule","💪 Schedule"],["nutrition",<><NutriIcon size={14} style={{marginRight:"4px",verticalAlign:"middle"}}/>Nutrition</>],["progression","📈 Progression"],["goals","🎯 Goals"]].map(([t,lbl])=>(
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
              <div onClick={()=>setSelectedDay(day)} style={{ padding:"13px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
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
                  <span style={{ color:"var(--mut)", fontSize:"14px" }}>›</span>
                </div>
              </div>

              {/* Full content is in DaySessionView full screen — no inline expand */}
              {false && (
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
                        {/* Stats row — tap any pill for explanation */}
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px", marginBottom:"6px" }}>
                          {[{v:ex.sets,l:"sets"},{v:ex.reps,l:"reps"},{v:ex.rest,l:"rest"},{v:ex.tempo,l:"tempo"}].map((x,k)=>x.v?(
                            <StatPill key={k} label={x.l} value={x.v} color="var(--acc)"/>
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
        method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
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
                <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{width:"18px",height:"18px",background:"rgba(255,0,0,.85)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7px",color:"#fff"}}>▶</div></div>
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
  // Load saved bio age result for personalization
  const savedBioAge = (() => { try { const v = localStorage.getItem("bioage_result_"+user.email); return v ? JSON.parse(v) : null; } catch { return null; } })();
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
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", paddingBottom:"100px" }}>
      {/* Header */}
      <div style={{ position:"relative", height:"200px" }}>
        <img src={sub?.id==="pro"?IMG.pro:IMG.free} alt="" style={{ position:"absolute", top:0, left:0, right:0, bottom:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.45) saturate(.7)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(180deg,rgba(10,10,10,.3) 0%,rgba(10,10,10,.85) 100%)" }}/>
        {/* Top row */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div onClick={onHome} style={{ cursor:"pointer" }}><Wordmark size={40} col="rgba(255,255,255,.9)"/></div>
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
          ? [["program","📋","My Program"],["nutrition","__NUTRI__","Nutrition"],["exercises","🎥","Exercises"],["account","👤","Account"],["packages","📦","Packages"]]
          : [["program","📋","Program"],["nutrition","__NUTRI__","Nutrition"],["wearables","⌚","Wearables"],["stats","📊","Stats"],["account","👤","Account"],["new","🔄","New Plan"]]
        ).map(([t,ic,lbl])=>{
          const isA = tab===t;
          return (
            <button key={t} onClick={()=>{ if(t==="new"){
                const bmrDone = !!loadProfile(user.email)?.bmr;
                const bioAgeDoneNow = (() => { try { return !!localStorage.getItem("bioage_done_"+user.email); } catch { return false; } })();
                if (!bmrDone || !bioAgeDoneNow) {
                  alert("⚠️ Please complete your BMR and Bio Age tests first to get a personalised plan. Tap 📊 Stats → Bio Age, then restart setup.");
                  return;
                }
                setProg(null); setShowGen(true);
              } else setTab(t); }}
              style={{ padding:"7px 14px", background:isA?"var(--acc)":"rgba(255,255,255,.05)", border:`1px solid ${isA?"var(--acc)":"rgba(255,255,255,.08)"}`, borderRadius:"50px", color:isA?"#000":"rgba(255,255,255,.55)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--fb)", fontWeight:isA?700:500, whiteSpace:"nowrap", transition:"all .2s", display:"flex", alignItems:"center", gap:"5px", flexShrink:0 }}>
              {ic==="__NUTRI__"
                ? <img src={NUTRITION_ICON} alt="nutrition" style={{ width:"15px", height:"15px", objectFit:"contain", filter:isA?"brightness(0)":"none" }}/>
                : <span style={{ fontSize:"13px" }}>{ic}</span>
              }{lbl}
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
        {tab==="nutrition" && <NutritionHub user={user} profile={profile}/>}
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
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:600, overflowY:"auto", background:"var(--bg)" }}>
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
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", overflowY:"auto" }}>
      <HeroBg src={sel==="pro"?IMG.pro:IMG.free} ov="linear-gradient(180deg,rgba(10,10,10,.15) 0%,rgba(10,10,10,.92) 55%,rgba(10,10,10,1) 100%)" style={{ height:"205px", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px", position:"relative" }}>
        <BackBtn onClick={onBack}/>
        <Mono style={{ color:"var(--a3)", marginBottom:"5px" }}>CHOOSE YOUR FITPLUS PLAN</Mono>
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
      <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.9)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:600, animation:"fadeIn .2s" }} onClick={onClose}>
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
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>

      {/* Full-bleed hero image - top third */}
      <div style={{ position:"relative", height:"20vh", flexShrink:0 }}>
        <img src={IMG.splash} alt="" style={{ position:"absolute", top:0, left:0, right:0, bottom:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", filter:"brightness(.55) saturate(.75)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,.2) 70%, rgba(10,10,10,1) 100%)" }}/>

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
          <div style={{ marginBottom:"8px" }}>
            <img src={LOGO_TEXT_URL} alt="FitPlus" style={{ height:"100px", width:"auto", objectFit:"contain", display:"block", maxWidth:"400px" }}/>
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
                    <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:`linear-gradient(180deg, transparent 40%, ${item.glow.replace(".06","0.7")} 100%)` }}/>
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
              { img:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80", n:"Pro", d:"£5.99/mo", c:"var(--acc)", action:"pro" },
              { img:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", n:"Trainer", d:"From free", c:"var(--tr)", action:"trainer" },
            ].map(item=>(
              <div key={item.n} onClick={()=>onPlanPill&&onPlanPill(item.action)} style={{ flex:1, background:"rgba(255,255,255,.03)", border:`1px solid ${item.c}20`, borderRadius:"10px", overflow:"hidden", textAlign:"center", cursor:"pointer" }}>
                <div style={{ height:"62px", overflow:"hidden", position:"relative" }}>
                  <img src={item.img} alt={item.n} style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.75) saturate(.9)" }}/>
                  <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:`linear-gradient(180deg,transparent 0%,rgba(10,10,10,.5) 100%)` }}/>
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
  const fullAccessUser = FULL_ACCESS_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  const isSpecialEmail = isOwnerEmail || !!fullAccessUser;

  function handleLogin() {
    // Owner access
    if (isOwnerEmail) {
      if (password !== OWNER.password) { setOwnerErr("Incorrect password"); setTimeout(()=>setOwnerErr(""), 2500); return; }
      const s = mkMemberSub("pro"); saveMemberSub(s);
      saveTrainerSub(mkTrainerSub("unlimited"));
      onLogin({ name:OWNER.name, email:OWNER.email, role, isOwner:true });
      return;
    }
    // Full-access users
    if (fullAccessUser) {
      if (password !== fullAccessUser.password) { setOwnerErr("Incorrect password"); setTimeout(()=>setOwnerErr(""), 2500); return; }
      const s = mkMemberSub("pro"); saveMemberSub(s);
      saveTrainerSub(mkTrainerSub("unlimited"));
      onLogin({ name:fullAccessUser.name, email:fullAccessUser.email, role, isOwner:true });
      return;
    }
    onLogin({ name:name||(isT?"Coach":"Athlete"), email, role });
  }

  return (
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {/* Hero */}
      <div style={{ position:"relative", height:"40vh", flexShrink:0 }}>
        <img src={isT?IMG.trainer:IMG.workout} alt="" style={{ position:"absolute", top:0, left:0, right:0, bottom:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.5) saturate(.7)" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(180deg,rgba(10,10,10,0) 0%,rgba(10,10,10,1) 100%)" }}/>
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
          {!isSpecialEmail && <Field lbl="FULL NAME" val={name} set={setName} ph="Your name" acc={col}/>}
          <Field lbl="EMAIL ADDRESS" val={email} set={v=>{ setEmail(v); setOwnerErr(""); }} ph="your@email.com" acc={col} type="email"/>
          {/* Show password field only for owner email */}
          {isSpecialEmail && (
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
          <button onClick={handleLogin} disabled={isSpecialEmail&&!password.trim()}
            style={{ width:"100%", padding:"16px", background:isSpecialEmail&&!password.trim()?"rgba(255,255,255,.08)":col, border:"none", borderRadius:"var(--r)", color:isSpecialEmail&&!password.trim()?"var(--mut)":"#000", cursor:isSpecialEmail&&!password.trim()?"default":"pointer", fontFamily:"var(--fd)", fontSize:"16px", letterSpacing:"2px", boxShadow:isSpecialEmail&&!password.trim()?"none":`0 8px 28px ${col}30`, marginBottom:"12px" }}>
            {isSpecialEmail ? "👑 LOGIN" : isT?"ENTER DASHBOARD →":"LET'S GO →"}
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
  const [pos, setPos] = useState(() => {
    try { const s = localStorage.getItem("f2a_fab_pos"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const dragging = useRef(false);
  const moved = useRef(false);
  const startRef = useRef({ px:0, py:0, bx:0, by:0 });
  const posRef = useRef(pos);
  const btnRef = useRef(null);

  useEffect(() => { const t = setTimeout(()=>setPopped(false),3000); return ()=>clearTimeout(t); }, []);
  useEffect(() => { posRef.current = pos; }, [pos]);

  const SIZE = 58, MARGIN = 6;
  const defaultRight = 18, defaultBottom = 88;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function onPointerDown(e) {
    e.preventDefault();
    dragging.current = true;
    moved.current = false;
    const rect = btnRef.current.getBoundingClientRect();
    startRef.current = { px: e.clientX, py: e.clientY, bx: rect.left, by: rect.top };
    btnRef.current.setPointerCapture(e.pointerId);
    if (btnRef.current) btnRef.current.style.cursor = "grabbing";
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    e.preventDefault();
    const dx = e.clientX - startRef.current.px;
    const dy = e.clientY - startRef.current.py;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;
    const maxX = window.innerWidth  - SIZE - MARGIN;
    const maxY = window.innerHeight - SIZE - MARGIN;
    const nx = clamp(startRef.current.bx + dx, MARGIN, maxX);
    const ny = clamp(startRef.current.by + dy, MARGIN, maxY);
    // Direct DOM move for zero-lag feel
    if (btnRef.current) {
      btnRef.current.style.left   = nx + "px";
      btnRef.current.style.top    = ny + "px";
      btnRef.current.style.right  = "auto";
      btnRef.current.style.bottom = "auto";
    }
    posRef.current = { x: nx, y: ny };
  }

  function onPointerUp(e) {
    if (!dragging.current) return;
    dragging.current = false;
    if (btnRef.current) btnRef.current.style.cursor = "grab";
    const p = posRef.current;
    if (p && moved.current) {
      setPos(p);
      try { localStorage.setItem("f2a_fab_pos", JSON.stringify(p)); } catch {}
    }
    if (!moved.current) onClick();
  }

  const style = {
    position:"fixed",
    width: SIZE+"px", height: SIZE+"px",
    borderRadius:"50%",
    background:"linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%)",
    border:"1px solid rgba(14,165,233,.45)",
    cursor:"grab",
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow:"0 6px 24px rgba(14,165,233,.4), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.15)",
    zIndex:100, padding:"4px",
    animation: popped ? "pop .5s ease" : "none",
    transform:"translateZ(0)",
    userSelect:"none", touchAction:"none",
    WebkitUserSelect:"none",
    ...(pos
      ? { left: pos.x+"px", top: pos.y+"px" }
      : { right: defaultRight+"px", bottom: defaultBottom+"px" }
    ),
  };

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={style}
      title="Drag to move · Tap to open AI Coach"
    >
      <img src={FAB_ICON} alt="AI Coach" style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"50%", pointerEvents:"none" }}/>
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
      <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"var(--bg)", zIndex:800, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
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
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"var(--bg)", zIndex:750, display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
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
      <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
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
            ⚡ START MY FITPLUS JOURNEY
          </PBtn>
          <Mono style={{ textAlign:"center" }}>Your results are saved to your profile</Mono>
        </div>
      </div>
    );
  }

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (cur.type === "intro") return (
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
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
    <div style={{ minHeight:"100vh", minHeight:"-webkit-fill-available", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
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


