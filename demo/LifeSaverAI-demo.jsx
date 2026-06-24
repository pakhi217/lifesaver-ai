/**
 * LifeSaver AI — The Last-Minute Life Saver
 * VIBe Coding Hackathon · Problem Statement 1
 *
 * Powered by Google Gemini (Google AI Studio)
 * Single-file React artifact — all modules inlined.
 *
 * TO ACTIVATE AI FEATURES:
 *   1. Go to https://aistudio.google.com/app/apikey
 *   2. Create a free API key
 *   3. Enter it in the banner shown on the Dashboard tab
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta/models";

const P_COLOR = { critical:"#F43F5E", high:"#F97316", medium:"#FBBF24", low:"#10B981" };
const P_LABEL = { critical:"Critical",  high:"High",    medium:"Medium",  low:"Low"     };
const CATS    = ["Work","Academic","Personal","Health","Finance","Other"];
const DAYS    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS   = Array.from({ length: 14 }, (_, i) => i + 7);
const HABIT_EMOJIS = ["⭐","💪","📚","🧘","💧","🎯","🌿","🏃","🧠","☀️","🎨","✍️","🎵","🍎","🧩"];

const C = {
  bg:"#0A0E1A", surface:"#0F1322", surface2:"#161B2E",
  border:"#1E2235", border2:"#2A3050",
  text:"#F1F5F9", textMid:"#94A3B8", textDim:"#64748B",
  textFaint:"#475569", textGhost:"#334155",
  indigo:"#6366F1", indigoLt:"#A5B4FC", violet:"#8B5CF6",
  green:"#10B981", orange:"#F97316", red:"#F43F5E",
  yellow:"#FBBF24", blue:"#4285F4", gGreen:"#34A853",
};

const SEED_TASKS = [
  { id:1, title:"Submit ML Assignment",  category:"Academic", priority:"critical", deadline:new Date(Date.now()+2.5*36e5).toISOString(), done:false, notes:"Chapter 4 — gradient descent implementation", calSlot:null, createdAt:new Date().toISOString() },
  { id:2, title:"Pay Electricity Bill",  category:"Finance",  priority:"high",     deadline:new Date(Date.now()+18*36e5).toISOString(),  done:false, notes:"", calSlot:null, createdAt:new Date().toISOString() },
  { id:3, title:"Hackathon Submission",  category:"Work",     priority:"critical", deadline:new Date(Date.now()+5*36e5).toISOString(),   done:false, notes:"VIBe Coding — PS1 LifeSaver AI", calSlot:null, createdAt:new Date().toISOString() },
  { id:4, title:"Team Standup Prep",     category:"Work",     priority:"medium",   deadline:new Date(Date.now()+8*36e5).toISOString(),   done:false, notes:"List 3 blockers", calSlot:null, createdAt:new Date().toISOString() },
  { id:5, title:"Read Research Paper",   category:"Academic", priority:"low",      deadline:new Date(Date.now()+72*36e5).toISOString(),  done:false, notes:"", calSlot:null, createdAt:new Date().toISOString() },
];
const SEED_HABITS = [
  { id:1, name:"Morning Review",  emoji:"☀️", streak:4, log:{} },
  { id:2, name:"Deep Work Block", emoji:"🎯", streak:2, log:{} },
  { id:3, name:"Exercise",        emoji:"💪", streak:7, log:{} },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const hoursUntil   = (dl) => (new Date(dl) - Date.now()) / 36e5;
const todayStr     = ()    => new Date().toISOString().slice(0, 10);
const uid          = ()    => Date.now() + Math.floor(Math.random() * 9999);

function urgencyScore(t) {
  if (t.done) return 0;
  const h = hoursUntil(t.deadline);
  if (h < 0) return 100;
  const base = Math.max(0, 100 - h * 1.8);
  const pb = { critical:30, high:18, medium:8, low:0 }[t.priority] ?? 0;
  return Math.min(100, base + pb);
}
function scoreColor(s) {
  if (s >= 80) return C.red;
  if (s >= 55) return C.orange;
  if (s >= 30) return C.yellow;
  return C.green;
}
function fmtDeadline(dl) {
  const h = hoursUntil(dl);
  if (h < 0)  return `${Math.abs(Math.round(h))}h overdue`;
  if (h < 1)  return `${Math.round(h * 60)}min left`;
  if (h < 24) return `${Math.round(h)}h left`;
  const d = Math.floor(h / 24), r = Math.round(h % 24);
  return r > 0 ? `${d}d ${r}h left` : `${d}d left`;
}
function calcStreak(log) {
  let s = 0, d = new Date();
  while (log[d.toISOString().slice(0,10)]) { s++; d.setDate(d.getDate()-1); }
  return s;
}
function sortByUrgency(ts) { return [...ts].sort((a,b) => urgencyScore(b)-urgencyScore(a)); }
function pendingTasks(ts)   { return ts.filter(t => !t.done); }
function overdueTasks(ts)   { return ts.filter(t => !t.done && hoursUntil(t.deadline) < 0); }
function getLast7()  {
  return Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().slice(0,10); });
}
function getWeekDates() {
  const d = new Date(); d.setDate(d.getDate()-d.getDay());
  return Array.from({length:7},(_,i)=>{ const x=new Date(d); x.setDate(d.getDate()+i); return x; });
}
function renderMd(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g,'<strong style="color:#A5B4FC">$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/\n- /g,'<br/>• ').replace(/\n• /g,'<br/>• ')
    .replace(/\n\n/g,'<br/><br/>').replace(/\n/g,'<br/>');
}
function taskSummary(tasks) {
  return sortByUrgency(pendingTasks(tasks))
    .map(t=>`• "${t.title}" [${t.priority}] — ${fmtDeadline(t.deadline)}, urgency ${Math.round(urgencyScore(t))}/100${t.notes?` | ${t.notes}`:""}`)
    .join("\n") || "None";
}
function habitSummary(habits) {
  return habits.map(h=>`${h.emoji} ${h.name}: ${h.streak}🔥 streak, today: ${h.log[todayStr()]?"done ✓":"not done"}`).join("\n") || "None";
}

// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════
const LS = {
  get:(k,fb)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):fb; }catch{ return fb; } },
  set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
};

// ═══════════════════════════════════════════════════════════════
// GEMINI API
// ═══════════════════════════════════════════════════════════════
let _key = "";
const setKey   = (k) => { _key = k.trim(); };
const hasKey   = ()  => _key.length > 10;
const endpoint = ()  => `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${_key}`;

async function geminiReq(payload) {
  if (!hasKey()) throw new Error("NO_KEY");
  const res = await fetch(endpoint(), {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });
  if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return text;
}
async function callGemini(prompt, sys="", temp=0.7) {
  return geminiReq({
    system_instruction: sys?{parts:[{text:sys}]}:undefined,
    contents:[{role:"user",parts:[{text:prompt}]}],
    generationConfig:{temperature:temp,maxOutputTokens:1024},
  });
}
async function callGeminiChat(messages, sys="") {
  return geminiReq({
    system_instruction: sys?{parts:[{text:sys}]}:undefined,
    contents: messages.map(m=>({ role:m.role==="assistant"?"model":"user", parts:[{text:m.content}] })),
    generationConfig:{temperature:0.8,maxOutputTokens:1024},
  });
}
async function callGeminiJSON(prompt, sys="") {
  const raw = await callGemini(prompt, sys, 0.5);
  const clean = raw.replace(/```json\s*/gi,"").replace(/```/g,"").trim();
  try { return JSON.parse(clean); }
  catch {
    const m = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (m) return JSON.parse(m[1]);
    throw new Error("Gemini returned invalid JSON");
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════

// — useTicker
function useTicker(ms=60000) {
  const [t,set]=useState(0);
  useEffect(()=>{ const id=setInterval(()=>set(n=>n+1),ms); return()=>clearInterval(id); },[ms]);
  return t;
}

// — useTasks
function useTasks() {
  const [tasks,setRaw] = useState(()=>LS.get("ls2_tasks",SEED_TASKS));
  const set = useCallback((upd)=>{
    setRaw(prev=>{ const next=typeof upd==="function"?upd(prev):upd; LS.set("ls2_tasks",next); return next; });
  },[]);
  const addTask    = useCallback((f)=>{ const t={...f,id:uid(),done:false,calSlot:null,createdAt:new Date().toISOString(),deadline:new Date(f.deadline).toISOString()}; set(p=>[t,...p]); },[set]);
  const toggleTask = useCallback((id)=>set(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t)),[set]);
  const deleteTask = useCallback((id)=>set(p=>p.filter(t=>t.id!==id)),[set]);
  const assignSlot = useCallback((id,day,hour)=>set(p=>p.map(t=>{
    if(t.calSlot?.day===day&&t.calSlot?.hour===hour&&t.id!==id) return {...t,calSlot:null};
    if(t.id===id) return {...t,calSlot:{day,hour}};
    return t;
  })),[set]);
  const clearSlot  = useCallback((id)=>set(p=>p.map(t=>t.id===id?{...t,calSlot:null}:t)),[set]);
  return { tasks, addTask, toggleTask, deleteTask, assignSlot, clearSlot };
}

// — useHabits
function useHabits() {
  const [habits,setRaw] = useState(()=>LS.get("ls2_habits",SEED_HABITS));
  const set = useCallback((upd)=>{
    setRaw(prev=>{ const next=typeof upd==="function"?upd(prev):upd; LS.set("ls2_habits",next); return next; });
  },[]);
  const addHabit    = useCallback((name,emoji)=>set(p=>[...p,{id:uid(),name:name.trim(),emoji:emoji||"⭐",streak:0,log:{},createdAt:new Date().toISOString()}]),[set]);
  const checkIn     = useCallback((id)=>set(p=>p.map(h=>{ if(h.id!==id)return h; const td=todayStr(); const log={...h.log,[td]:!h.log[td]}; return {...h,log,streak:calcStreak(log)}; })),[set]);
  const deleteHabit = useCallback((id)=>set(p=>p.filter(h=>h.id!==id)),[set]);
  return { habits, addHabit, checkIn, deleteHabit };
}

// — useVoice
function useVoice({ onResult, onError } = {}) {
  const [listening,setListening] = useState(false);
  const [error,setError]         = useState(null);
  const recRef = useRef(null);
  const supported = !!(window.SpeechRecognition||window.webkitSpeechRecognition);

  const start = useCallback(()=>{
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ const m="Voice not supported in this browser. Try Chrome."; setError(m); onError?.(m); return; }
    if(recRef.current) try{ recRef.current.abort(); }catch{}
    setError(null);
    const rec = new SR(); rec.lang="en-US"; rec.interimResults=false; rec.maxAlternatives=1;
    rec.onstart  = ()=>setListening(true);
    rec.onend    = ()=>setListening(false);
    rec.onresult = (e)=>{ const t=Array.from(e.results).map(r=>r[0].transcript).join(" ").trim(); onResult?.(t); };
    rec.onerror  = (e)=>{
      if(e.error==="aborted"){ setListening(false); return; }
      const msgs={
        "not-allowed":"Microphone access denied. Allow mic permissions.",
        "no-speech":"No speech detected. Try again.",
        "network":"Network error. Check connection.",
        "audio-capture":"No microphone found.",
      };
      const m=msgs[e.error]||`Voice error: ${e.error}`;
      setError(m); onError?.(m); setListening(false);
    };
    try{ rec.start(); recRef.current=rec; }
    catch(e){ const m="Could not start voice input."; setError(m); onError?.(m); }
  },[onResult,onError]);

  const stop   = useCallback(()=>{ try{ recRef.current?.stop(); }catch{} },[]);
  const toggle = useCallback(()=>listening?stop():start(),[listening,start,stop]);
  useEffect(()=>()=>{ try{ recRef.current?.abort(); }catch{} },[]);
  return { listening, supported, error, start, stop, toggle };
}

// — useProactiveAlerts
function useProactiveAlerts(tasks) {
  const [alerts,setAlerts] = useState([]);
  const lastRef = useRef(0);

  const run = useCallback(async()=>{
    if(!hasKey()) return;
    const now = Date.now();
    if(now-lastRef.current < 5*60000) return;
    const top = sortByUrgency(pendingTasks(tasks))[0];
    if(!top||urgencyScore(top)<60) return;
    lastRef.current=now;
    try{
      const text = await callGemini(
        `You are a proactive AI productivity coach. User's most urgent task: "${top.title}", priority: ${top.priority}, deadline: ${fmtDeadline(top.deadline)}, urgency: ${Math.round(urgencyScore(top))}/100.\nWrite ONE urgent, specific, actionable alert in 1-2 sentences. Start with an action verb. No fluff.`,
        "", 0.6
      );
      if(!text?.trim()) return;
      setAlerts(prev=>{
        if(prev.some(a=>a.text.slice(0,40)===text.slice(0,40))) return prev;
        return [{id:Date.now(),text,taskTitle:top.title},...prev].slice(0,3);
      });
    }catch{}
  },[tasks]);

  useEffect(()=>{
    const boot=setTimeout(run,3000);
    const iv=setInterval(run,5*60000);
    return()=>{ clearTimeout(boot); clearInterval(iv); };
  },[run]);

  const dismiss = useCallback((id)=>setAlerts(p=>p.filter(a=>a.id!==id)),[]);
  return { alerts, dismiss };
}

// ═══════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════

function UrgencyRing({ score, size=80 }) {
  const r=size*0.43, c=size/2, sw=size*0.085;
  const circ=2*Math.PI*r, dash=(Math.min(100,Math.max(0,score))/100)*circ;
  const col=scoreColor(score), glow=score>=75;
  return (
    <div role="img" aria-label={`Urgency ${Math.round(score)}/100`} style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}} aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke={C.border} strokeWidth={sw}/>
        {glow&&<circle cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={sw+2} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" opacity={0.2} style={{filter:`blur(${sw}px)`}}/>}
        <circle cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 0.7s ease,stroke 0.4s",filter:glow?`drop-shadow(0 0 ${sw*.7}px ${col})`:"none"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        <span style={{fontSize:size*.22,fontWeight:800,color:col,lineHeight:1,fontFamily:"Space Grotesk,sans-serif",transition:"color .4s"}}>{Math.round(score)}</span>
        <span style={{fontSize:size*.11,color:C.textDim,letterSpacing:"0.05em",fontFamily:"Inter,sans-serif",marginTop:1}}>URGENCY</span>
      </div>
    </div>
  );
}

function LoadingDots({ color=C.indigo, size=7 }) {
  return (
    <div style={{display:"flex",gap:size*.7,alignItems:"center"}}>
      {[0,1,2].map(i=><div key={i} style={{width:size,height:size,borderRadius:"50%",background:color,animation:`bounce 1.2s ease infinite ${i*.2}s`}}/>)}
    </div>
  );
}

function GeminiLogo({ size=26 }) {
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*.28),background:"linear-gradient(135deg,#4285F4,#34A853,#FBBC04,#EA4335)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.52,fontWeight:900,color:"#fff",flexShrink:0,fontFamily:"Space Grotesk,sans-serif"}}>G</div>
  );
}

function ProactiveAlert({ alert, onDismiss }) {
  return (
    <div role="alert" style={{background:"linear-gradient(135deg,#F43F5E12,#F9731612)",border:"1px solid #F43F5E45",borderLeft:"3px solid #F43F5E",borderRadius:12,padding:"13px 16px",display:"flex",gap:12,alignItems:"flex-start",animation:"slideIn .35s ease"}}>
      <span style={{fontSize:20,flexShrink:0,lineHeight:1.2}}>🚨</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10.5,color:C.red,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em",marginBottom:4}}>
          PROACTIVE ALERT{alert.taskTitle&&<span style={{marginLeft:8,color:C.textDim,fontWeight:400,textTransform:"none",letterSpacing:0}}>· {alert.taskTitle}</span>}
        </div>
        <p style={{margin:0,fontSize:13,color:"#FCA5A5",fontFamily:"Inter,sans-serif",lineHeight:1.55}}>{alert.text}</p>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss" style={{background:"transparent",border:"none",color:C.textFaint,cursor:"pointer",fontSize:20,lineHeight:1,padding:0,flexShrink:0}} onMouseOver={e=>e.currentTarget.style.color=C.red} onMouseOut={e=>e.currentTarget.style.color=C.textFaint}>×</button>
    </div>
  );
}

function TaskCard({ task, selected, onClick, onToggle, onDelete, compact=false }) {
  const score=urgencyScore(task), overdue=!task.done&&hoursUntil(task.deadline)<0;
  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={e=>e.key==="Enter"&&onClick?.()} aria-selected={selected}
      style={{background:selected?C.surface2:C.surface,border:`1px solid ${selected?C.indigo:overdue?"#F43F5E33":C.border}`,borderLeft:`3px solid ${task.done?C.border:P_COLOR[task.priority]}`,borderRadius:10,padding:compact?"10px 12px":"12px 16px",cursor:onClick?"pointer":"default",opacity:task.done?0.45:1,boxShadow:selected?`0 0 0 1px ${C.indigo}20`:"none",transition:"background .15s,border-color .15s",outline:"none",userSelect:"none"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <input type="checkbox" checked={task.done} onChange={e=>{e.stopPropagation();onToggle?.(task.id);}} onClick={e=>e.stopPropagation()} style={{marginTop:3,width:16,height:16,accentColor:C.indigo,flexShrink:0,cursor:"pointer"}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:compact?13:13.5,color:task.done?C.textFaint:C.text,fontFamily:"Space Grotesk,sans-serif",textDecoration:task.done?"line-through":"none",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={task.title}>{task.title}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:10.5,color:C.textDim,fontFamily:"Inter,sans-serif"}}>{task.category}</span>
            <span style={{fontSize:10.5,color:P_COLOR[task.priority],fontFamily:"Space Grotesk,sans-serif",fontWeight:600}}>{P_LABEL[task.priority]}</span>
            <span style={{fontSize:10.5,fontFamily:"Inter,sans-serif",fontWeight:overdue?700:400,color:overdue?C.red:C.textDim}}>{fmtDeadline(task.deadline)}</span>
            {task.notes&&!compact&&<span style={{fontSize:10.5,color:C.textGhost,fontFamily:"Inter,sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:130}} title={task.notes}>📝 {task.notes}</span>}
          </div>
        </div>
        {!task.done&&<div style={{fontSize:11,fontWeight:700,color:scoreColor(score),background:`${scoreColor(score)}18`,borderRadius:6,padding:"2px 8px",fontFamily:"Space Grotesk,sans-serif",flexShrink:0}}>{Math.round(score)}</div>}
        {onDelete&&<button onClick={e=>{e.stopPropagation();onDelete(task.id);}} style={{background:"transparent",border:"none",color:C.textGhost,cursor:"pointer",fontSize:17,lineHeight:1,padding:"0 2px",flexShrink:0,transition:"color .15s"}} onMouseOver={e=>e.currentTarget.style.color=C.red} onMouseOut={e=>e.currentTarget.style.color=C.textGhost}>×</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// API KEY BANNER
// ═══════════════════════════════════════════════════════════════
function ApiKeyBanner({ onKeySet }) {
  const [input,setInput]=useState(""); const [err,setErr]=useState(null); const [saving,setSaving]=useState(false); const [hidden,setHidden]=useState(false);
  if(hidden) return null;
  async function save() {
    const k=input.trim(); if(k.length<20){setErr("Key looks too short.");return;}
    setSaving(true); setErr(null);
    try{
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${k}`);
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d?.error?.message||`HTTP ${res.status}`);}
      setKey(k); LS.set("ls2_apikey",k); onKeySet?.(k); setHidden(true);
    }catch(e){setErr(`Invalid key: ${e.message}`);}
    setSaving(false);
  }
  return (
    <div style={{background:"linear-gradient(135deg,#4285F415,#34A85315)",border:"1px solid #4285F440",borderRadius:12,padding:"14px 18px",display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap",animation:"slideIn .3s ease"}}>
      <div style={{flex:"1 1 300px",minWidth:0}}>
        <div style={{fontSize:12,color:"#4285F4",fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.07em",marginBottom:6,display:"flex",alignItems:"center",gap:7}}>
          <GeminiLogo size={20}/> CONNECT GOOGLE AI STUDIO
        </div>
        <p style={{margin:"0 0 10px",fontSize:12.5,color:C.textMid,fontFamily:"Inter,sans-serif",lineHeight:1.5}}>
          Paste your <strong style={{color:"#93C5FD"}}>Gemini API key</strong> from{" "}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color:"#4285F4",textDecoration:"none"}}>aistudio.google.com</a>{" "}
          to unlock AI Coach, Action Plan, and proactive alerts.
        </p>
        <div style={{display:"flex",gap:8}}>
          <input type="password" value={input} onChange={e=>{setInput(e.target.value);setErr(null);}} onKeyDown={e=>e.key==="Enter"&&save()} placeholder="AIza…"
            style={{flex:1,background:C.bg,border:`1px solid ${err?C.red:C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,fontFamily:"Inter,sans-serif",outline:"none"}}
            onFocus={e=>e.target.style.borderColor="#4285F4"} onBlur={e=>e.target.style.borderColor=err?C.red:C.border}/>
          <button onClick={save} disabled={saving||!input.trim()} style={{background:saving?C.border:"linear-gradient(135deg,#4285F4,#34A853)",border:"none",borderRadius:8,padding:"8px 16px",color:saving?C.textDim:"#fff",cursor:saving||!input.trim()?"default":"pointer",fontSize:13,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,flexShrink:0}}>
            {saving?"Checking…":"Connect"}
          </button>
        </div>
        {err&&<div style={{marginTop:6,fontSize:11.5,color:C.red,fontFamily:"Inter,sans-serif"}}>{err}</div>}
      </div>
      <button onClick={()=>setHidden(true)} style={{background:"transparent",border:"none",color:C.textFaint,cursor:"pointer",fontSize:20,lineHeight:1,padding:0,flexShrink:0}}>×</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESCUE MODE
// ═══════════════════════════════════════════════════════════════
function RescueMode({ task, onExit, onMarkDone }) {
  const [breakdown,setBreakdown]=useState(null); const [bdLoading,setBdLoading]=useState(false); const [bdErr,setBdErr]=useState(null);
  const score=urgencyScore(task);

  useEffect(()=>{
    document.body.style.overflow="hidden";
    const h=e=>{ if(e.key==="Escape") onExit(); };
    window.addEventListener("keydown",h);
    return()=>{ document.body.style.overflow=""; window.removeEventListener("keydown",h); };
  },[onExit]);

  useEffect(()=>{
    if(!hasKey()) return;
    setBdLoading(true); setBdErr(null);
    callGeminiJSON(
      `Break down this task into concrete subtasks.\nTask: "${task.title}"\nPriority: ${task.priority}\nDeadline: in ${Math.round(Math.max(0,hoursUntil(task.deadline)))} hours\n${task.notes?`Notes: ${task.notes}`:""}\n\nRespond ONLY with valid JSON:\n{"estimate":"2h","steps":[{"order":1,"action":"specific action","duration":"15min"}],"tip":"one productivity tip"}`
    ).then(setBreakdown).catch(e=>setBdErr(e.message)).finally(()=>setBdLoading(false));
  },[task.id]);

  return (
    <div role="dialog" aria-modal="true" style={{position:"fixed",inset:0,background:"#000000F2",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22,backdropFilter:"blur(10px)",padding:24,overflowY:"auto",animation:"fadeIn .3s ease"}}>
      <div style={{fontSize:12,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.2em",color:C.red,animation:"pulse 1.8s ease infinite",display:"flex",alignItems:"center",gap:8}}>
        <span>⚡</span><span>RESCUE MODE</span><span>⚡</span>
      </div>

      <UrgencyRing score={score} size={140}/>

      <div style={{textAlign:"center",maxWidth:480}}>
        <h1 style={{fontFamily:"Space Grotesk,sans-serif",fontSize:26,fontWeight:800,color:C.text,margin:"0 0 8px",lineHeight:1.15}}>{task.title}</h1>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:P_COLOR[task.priority],fontWeight:700,fontFamily:"Space Grotesk,sans-serif"}}>{P_LABEL[task.priority]}</span>
          <span style={{fontSize:14,color:hoursUntil(task.deadline)<0?C.red:C.orange,fontWeight:700,animation:hoursUntil(task.deadline)<0?"pulse 1.5s ease infinite":"none"}}>{fmtDeadline(task.deadline)}</span>
          <span style={{fontSize:13,color:C.textDim,fontFamily:"Inter,sans-serif"}}>{task.category}</span>
        </div>
        {task.notes&&<p style={{margin:"12px auto 0",maxWidth:360,fontSize:13.5,color:C.textMid,fontFamily:"Inter,sans-serif",lineHeight:1.55,background:"#161B2E80",borderRadius:10,padding:"10px 16px"}}>{task.notes}</p>}
      </div>

      {/* Gemini breakdown */}
      {hasKey()&&(
        <div style={{background:"#0F132280",border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 22px",width:"100%",maxWidth:480,backdropFilter:"blur(4px)"}}>
          <div style={{fontSize:11,color:C.indigo,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em",marginBottom:12}}>✨ GEMINI BREAKDOWN</div>
          {bdLoading&&<div style={{display:"flex",gap:6,alignItems:"center"}}><LoadingDots color={C.indigo}/><span style={{color:C.textDim,fontSize:13,fontFamily:"Inter,sans-serif",marginLeft:6}}>Analysing with Gemini…</span></div>}
          {bdErr&&<p style={{color:"#FCA5A5",fontSize:13,fontFamily:"Inter,sans-serif",margin:0}}>⚠️ {bdErr}</p>}
          {breakdown&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {breakdown.estimate&&<div style={{fontSize:12,color:C.textDim,fontFamily:"Inter,sans-serif"}}>Estimated time: <strong style={{color:C.yellow}}>{breakdown.estimate}</strong></div>}
              {breakdown.steps?.map(s=>(
                <div key={s.order} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:`${C.indigo}30`,border:`1px solid ${C.indigo}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.indigoLt,flexShrink:0,fontFamily:"Space Grotesk,sans-serif",marginTop:1}}>{s.order}</div>
                  <div style={{flex:1}}><span style={{fontSize:13,color:C.text,fontFamily:"Inter,sans-serif"}}>{s.action}</span><span style={{marginLeft:8,fontSize:11,color:C.textDim}}>· {s.duration}</span></div>
                </div>
              ))}
              {breakdown.tip&&<div style={{background:`${C.green}10`,border:`1px solid ${C.green}30`,borderRadius:8,padding:"8px 12px",fontSize:12.5,color:"#6EE7B7",fontFamily:"Inter,sans-serif",lineHeight:1.5}}>💡 {breakdown.tip}</div>}
            </div>
          )}
        </div>
      )}

      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={onExit} style={{background:"transparent",border:`1px solid ${C.border2}`,borderRadius:10,padding:"11px 22px",color:C.textDim,cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:600}}>← Exit Focus</button>
        <button onClick={()=>{onMarkDone?.(task.id);onExit();}} style={{background:`${C.green}20`,border:`1px solid ${C.green}50`,borderRadius:10,padding:"11px 22px",color:C.green,cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:700}}>✓ Mark Done</button>
        <button style={{background:"linear-gradient(135deg,#F43F5E,#F97316)",border:"none",borderRadius:10,padding:"11px 28px",color:"#fff",cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px #F43F5E50"}}>🎯 Start Working Now</button>
      </div>
      <p style={{fontSize:11,color:C.textGhost,fontFamily:"Inter,sans-serif",margin:0}}>Press <kbd style={{background:"#1E2235",borderRadius:4,padding:"1px 5px",fontSize:10}}>Esc</kbd> to exit</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD TASK MODAL
// ═══════════════════════════════════════════════════════════════
function AddTaskModal({ onAdd, onClose, prefill="" }) {
  const [form,setForm]=useState({title:prefill,category:"Work",priority:"medium",deadline:"",notes:""});
  const [errs,setErrs]=useState({});
  const titleRef=useRef(null);
  useEffect(()=>{ titleRef.current?.focus(); },[]);
  useEffect(()=>{ const h=e=>{if(e.key==="Escape")onClose();}; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[onClose]);
  const voice=useVoice({onResult:t=>setForm(f=>({...f,title:t}))});
  function set(k,v){setForm(f=>({...f,[k]:v}));if(errs[k])setErrs(e=>({...e,[k]:null}));}
  function validate(){const e={};if(!form.title.trim())e.title="Required";if(!form.deadline)e.deadline="Required";else if(new Date(form.deadline)<new Date())e.deadline="Must be in the future";setErrs(e);return!Object.keys(e).length;}
  function submit(){if(!validate())return;onAdd(form);onClose();}
  const inp={width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13.5,fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box",colorScheme:"dark"};
  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{position:"fixed",inset:0,background:"#00000085",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(5px)",padding:16,animation:"fadeIn .2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:440,maxWidth:"100%",boxShadow:"0 24px 80px #00000090",animation:"slideUp .25s ease"}}>
        <div style={{fontFamily:"Space Grotesk,sans-serif",fontSize:17,fontWeight:800,color:C.text,marginBottom:22}}>Add New Task</div>

        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.06em",marginBottom:5}}>Title *</label>
          <div style={{display:"flex",gap:8}}>
            <input ref={titleRef} type="text" value={form.title} onChange={e=>set("title",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="What needs to be done?"
              style={{...inp,flex:1,borderColor:errs.title?C.red:C.border}} onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=errs.title?C.red:C.border}/>
            {voice.supported&&<button onClick={voice.toggle} style={{background:voice.listening?"#F43F5E15":"transparent",border:`1px solid ${voice.listening?C.red:C.border}`,borderRadius:8,padding:"0 13px",color:voice.listening?C.red:C.textDim,cursor:"pointer",fontSize:17,flexShrink:0}}>🎙</button>}
          </div>
          {errs.title&&<div style={{fontSize:11,color:C.red,marginTop:3,fontFamily:"Inter,sans-serif"}}>{errs.title}</div>}
          {voice.listening&&<div style={{fontSize:11.5,color:C.red,fontFamily:"Inter,sans-serif",marginTop:4,animation:"pulse 1.5s ease infinite"}}>Listening… speak your task</div>}
        </div>

        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.06em",marginBottom:5}}>Deadline *</label>
          <input type="datetime-local" value={form.deadline} min={new Date(Date.now()+60000).toISOString().slice(0,16)} onChange={e=>set("deadline",e.target.value)}
            style={{...inp,borderColor:errs.deadline?C.red:C.border}} onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=errs.deadline?C.red:C.border}/>
          {errs.deadline&&<div style={{fontSize:11,color:C.red,marginTop:3,fontFamily:"Inter,sans-serif"}}>{errs.deadline}</div>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div>
            <label style={{display:"block",fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.06em",marginBottom:5}}>Category</label>
            <select value={form.category} onChange={e=>set("category",e.target.value)} style={{...inp}} onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.06em",marginBottom:5}}>Priority</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {Object.keys(P_COLOR).map(p=>(
                <button key={p} onClick={()=>set("priority",p)} style={{background:form.priority===p?`${P_COLOR[p]}22`:"transparent",border:`1px solid ${form.priority===p?P_COLOR[p]:C.border}`,borderRadius:7,padding:"6px 4px",color:form.priority===p?P_COLOR[p]:C.textDim,cursor:"pointer",fontSize:11.5,fontFamily:"Space Grotesk,sans-serif",fontWeight:600}}>{P_LABEL[p]}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.06em",marginBottom:5}}>Notes</label>
          <input type="text" value={form.notes} onChange={e=>set("notes",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Any additional context…" style={inp} onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:11,color:C.textDim,cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:14,fontWeight:600}}>Cancel</button>
          <button onClick={submit} style={{flex:2,background:"linear-gradient(135deg,#6366F1,#8B5CF6)",border:"none",borderRadius:10,padding:11,color:"#fff",cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:14,fontWeight:700}}>Add Task</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════

// ── Dashboard ──
function Dashboard({ tasks, habits, alerts, onDismiss, onRescue, onKeySet }) {
  const pending=pendingTasks(tasks), overdue=overdueTasks(tasks), done=tasks.filter(t=>t.done);
  const critical=pending.filter(t=>urgencyScore(t)>=75), topTask=sortByUrgency(pending)[0]??null;
  const todayHabits=habits.filter(h=>h.log[todayStr()]).length;
  const pct=tasks.length?Math.round(done.length/tasks.length*100):0;
  const upcoming=[...pending].sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,5);

  return (
    <div style={{padding:24,display:"flex",flexDirection:"column",gap:18,overflowY:"auto",height:"100%",boxSizing:"border-box"}}>
      {!hasKey()&&<ApiKeyBanner onKeySet={onKeySet}/>}
      {alerts.map(a=><ProactiveAlert key={a.id} alert={a} onDismiss={()=>onDismiss(a.id)}/>)}

      {/* Stats */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {[["📋",pending.length,"Pending",C.indigo],["⚠️",overdue.length,"Overdue",C.red],["🔴",critical.length,"Critical",C.orange],["✅",done.length,"Done",C.green],[`🔥`,`${todayHabits}/${habits.length}`,"Habits Today",C.violet]].map(([icon,val,label,color])=>(
          <div key={label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",textAlign:"center",flex:"1 1 100px",minWidth:80}}>
            <div style={{fontSize:20,marginBottom:5}}>{icon}</div>
            <div style={{fontFamily:"Space Grotesk,sans-serif",fontWeight:800,fontSize:22,color,lineHeight:1}}>{val}</div>
            <div style={{fontSize:10.5,color:C.textDim,fontFamily:"Inter,sans-serif",marginTop:3}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Top priority + upcoming */}
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(0,1fr)",gap:18}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em",marginBottom:16}}>TOP PRIORITY RIGHT NOW</div>
          {topTask?(
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <UrgencyRing score={urgencyScore(topTask)} size={90}/>
              <div style={{flex:1,minWidth:0}}>
                <h3 style={{margin:"0 0 5px",fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={topTask.title}>{topTask.title}</h3>
                <div style={{fontSize:12,color:hoursUntil(topTask.deadline)<0?C.red:C.textMid,marginBottom:12,fontFamily:"Inter,sans-serif",fontWeight:hoursUntil(topTask.deadline)<0?700:400}}>{fmtDeadline(topTask.deadline)}</div>
                <button onClick={()=>onRescue(topTask)} style={{background:"linear-gradient(135deg,#F43F5E,#F97316)",border:"none",borderRadius:8,padding:"7px 16px",color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,boxShadow:"0 3px 12px #F43F5E40"}}>⚡ Rescue Mode</button>
              </div>
            </div>
          ):<div style={{textAlign:"center",color:C.textDim,fontFamily:"Inter,sans-serif",fontSize:14,padding:"20px 0"}}>🎉 No pending tasks!</div>}
        </div>

        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em",marginBottom:14}}>UPCOMING DEADLINES</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {upcoming.length===0&&<p style={{color:C.textGhost,fontFamily:"Inter,sans-serif",fontSize:13,margin:0}}>All clear!</p>}
            {upcoming.map(t=>(
              <div key={t.id} style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:3,height:32,background:scoreColor(urgencyScore(t)),borderRadius:2,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.textMid,fontFamily:"Space Grotesk,sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={t.title}>{t.title}</div>
                  <div style={{fontSize:11,color:hoursUntil(t.deadline)<3?C.red:C.textDim,fontFamily:"Inter,sans-serif",fontWeight:hoursUntil(t.deadline)<3?700:400}}>{fmtDeadline(t.deadline)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      {tasks.length>0&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
            <span style={{fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:600,color:C.textMid}}>Overall Progress</span>
            <span style={{fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:700,color:C.green}}>{pct}%</span>
          </div>
          <div style={{background:C.border,borderRadius:999,height:8,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#6366F1,#10B981)",borderRadius:999,transition:"width .7s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <span style={{fontSize:11,color:C.textGhost,fontFamily:"Inter,sans-serif"}}>{done.length} completed</span>
            <span style={{fontSize:11,color:C.textGhost,fontFamily:"Inter,sans-serif"}}>{pending.length} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tasks page ──
const TASK_FILTERS=[{id:"all",l:"All"},{id:"overdue",l:"⚠️ Overdue"},{id:"critical",l:"🔴"},{id:"high",l:"🟠"},{id:"medium",l:"🟡"},{id:"low",l:"🟢"},{id:"done",l:"✓ Done"}];
function applyFilter(ts,f){
  if(f==="done")    return ts.filter(t=>t.done);
  if(f==="overdue") return ts.filter(t=>!t.done&&hoursUntil(t.deadline)<0);
  if(["critical","high","medium","low"].includes(f)) return ts.filter(t=>!t.done&&t.priority===f);
  return ts;
}

function TasksPage({ tasks, onToggle, onDelete, onAdd, onRescue }) {
  const [filter,setFilter]=useState("all"); const [showAdd,setShowAdd]=useState(false); const [prefill,setPrefill]=useState("");
  const [sel,setSel]=useState(null);
  const voice=useVoice({onResult:t=>{setPrefill(t);setShowAdd(true);}});
  const filtered=sortByUrgency(applyFilter(tasks,filter));
  const selTask=tasks.find(t=>t.id===sel)??null;

  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",borderRight:selTask?`1px solid ${C.border}`:"none"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:5,flex:1,flexWrap:"wrap"}}>
            {TASK_FILTERS.map(({id,l})=>(
              <button key={id} onClick={()=>setFilter(id)} style={{background:filter===id?C.indigo:"transparent",border:`1px solid ${filter===id?C.indigo:C.border}`,borderRadius:6,padding:"4px 10px",fontSize:11.5,color:filter===id?"#fff":C.textDim,cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:7,flexShrink:0}}>
            {voice.supported&&<button onClick={voice.toggle} style={{background:voice.listening?"#F43F5E15":"transparent",border:`1px solid ${voice.listening?C.red:C.border}`,borderRadius:8,padding:"7px 12px",color:voice.listening?C.red:C.textDim,cursor:"pointer",fontSize:13,fontFamily:"Space Grotesk,sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>🎙{voice.listening?" Listening…":" Voice"}</button>}
            <button onClick={()=>{setPrefill("");setShowAdd(true);}} style={{background:"linear-gradient(135deg,#6366F1,#8B5CF6)",border:"none",borderRadius:8,padding:"7px 15px",color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"Space Grotesk,sans-serif",fontWeight:700}}>+ Add Task</button>
          </div>
        </div>
        {voice.error&&<div style={{padding:"7px 16px",background:`${C.orange}18`,borderBottom:`1px solid ${C.border}`,fontSize:12,color:C.orange,fontFamily:"Inter,sans-serif"}}>🎙 {voice.error}</div>}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {filtered.length===0&&<div style={{textAlign:"center",color:C.textGhost,fontFamily:"Inter,sans-serif",fontSize:14,marginTop:60}}>{filter==="done"?"No completed tasks yet.":"No tasks here — add one! 🎉"}</div>}
          {filtered.map(t=><TaskCard key={t.id} task={t} selected={t.id===sel} onClick={()=>setSel(p=>p===t.id?null:t.id)} onToggle={onToggle} onDelete={onDelete}/>)}
        </div>
      </div>

      {selTask&&(
        <div style={{width:270,flexShrink:0,display:"flex",flexDirection:"column",overflowY:"auto",padding:18,gap:14}}>
          <div style={{fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em"}}>TASK DETAIL</div>
          <div style={{fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:700,color:C.text,lineHeight:1.3}}>{selTask.title}</div>
          {[["Category",selTask.category],["Priority",P_LABEL[selTask.priority]],["Status",selTask.done?"✓ Done":"Pending"],["Time left",selTask.done?"Completed":fmtDeadline(selTask.deadline)]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.textDim,fontFamily:"Inter,sans-serif"}}>{k}</span>
              <span style={{fontSize:12,color:C.textMid,fontFamily:"Inter,sans-serif",fontWeight:500}}>{v}</span>
            </div>
          ))}
          {selTask.notes&&<div style={{background:C.surface2,borderRadius:8,padding:"10px 12px",fontSize:12.5,color:C.textMid,fontFamily:"Inter,sans-serif",lineHeight:1.55}}>📝 {selTask.notes}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {!selTask.done&&<button onClick={()=>onRescue(selTask)} style={{background:"linear-gradient(135deg,#F43F5E,#F97316)",border:"none",borderRadius:9,padding:10,color:"#fff",cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:700}}>⚡ Rescue Mode</button>}
            <button onClick={()=>{onToggle(selTask.id);setSel(null);}} style={{background:selTask.done?C.surface2:`${C.green}18`,border:`1px solid ${selTask.done?C.border:`${C.green}50`}`,borderRadius:9,padding:10,color:selTask.done?C.textDim:C.green,cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:600}}>{selTask.done?"↩ Mark Incomplete":"✓ Mark Done"}</button>
            <button onClick={()=>{onDelete(selTask.id);setSel(null);}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:9,padding:10,color:C.red,cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:600}} onMouseOver={e=>e.currentTarget.style.background="#F43F5E10"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>🗑 Delete</button>
          </div>
        </div>
      )}
      {showAdd&&<AddTaskModal prefill={prefill} onAdd={f=>{onAdd(f);setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}

// ── Calendar page ──
function CalendarPage({ tasks, onAssignSlot, onClearSlot }) {
  const week=getWeekDates(), todayIdx=new Date().getDay();
  const [dragging,setDragging]=useState(null);
  const unscheduled=tasks.filter(t=>!t.done&&!t.calSlot);
  function getSlotTask(d,h){return tasks.find(t=>t.calSlot?.day===d&&t.calSlot?.hour===h)??null;}
  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden"}}>
      <div style={{width:195,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em"}}>UNSCHEDULED ({unscheduled.length})</div>
        <div style={{flex:1,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:7}}>
          {unscheduled.length===0&&<p style={{fontSize:12,color:C.textGhost,fontFamily:"Inter,sans-serif",margin:0,padding:"6px 4px"}}>All tasks scheduled!</p>}
          {unscheduled.map(t=>(
            <div key={t.id} draggable onDragStart={()=>setDragging(t)} onDragEnd={()=>setDragging(null)}
              style={{background:C.surface,border:`1px solid ${P_COLOR[t.priority]}30`,borderLeft:`3px solid ${P_COLOR[t.priority]}`,borderRadius:8,padding:"8px 10px",cursor:"grab",opacity:dragging?.id===t.id?0.5:1}}>
              <div style={{fontSize:12,fontWeight:600,color:C.textMid,fontFamily:"Space Grotesk,sans-serif",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={t.title}>{t.title}</div>
              <div style={{fontSize:10,color:C.textDim,fontFamily:"Inter,sans-serif"}}>{fmtDeadline(t.deadline)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowX:"auto",overflowY:"auto"}}>
        <div style={{minWidth:660}}>
          <div style={{display:"grid",gridTemplateColumns:"50px repeat(7,1fr)",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,background:C.bg,zIndex:2}}>
            <div/>
            {week.map((d,i)=>(
              <div key={i} style={{padding:"10px 6px",textAlign:"center",background:i===todayIdx?`${C.indigo}12`:"transparent",borderLeft:`1px solid ${C.border}`}}>
                <div style={{fontSize:10.5,color:i===todayIdx?C.indigo:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.06em"}}>{DAYS[i]}</div>
                <div style={{fontSize:15,fontWeight:800,color:i===todayIdx?C.indigo:C.textMid,fontFamily:"Space Grotesk,sans-serif",lineHeight:1.2,marginTop:2}}>{d.getDate()}</div>
              </div>
            ))}
          </div>
          {HOURS.map(hour=>(
            <div key={hour} style={{display:"grid",gridTemplateColumns:"50px repeat(7,1fr)",borderBottom:`1px solid ${C.surface}`}}>
              <div style={{padding:"6px 6px 6px 2px",fontSize:10,color:C.textGhost,fontFamily:"Inter,sans-serif",textAlign:"right",paddingTop:9}}>{hour%12||12}{hour<12?"am":"pm"}</div>
              {week.map((_,dayIdx)=>{
                const st=getSlotTask(dayIdx,hour);
                return (
                  <div key={dayIdx} style={{minHeight:46,borderLeft:`1px solid ${C.border}`,background:dayIdx===todayIdx?`${C.indigo}05`:"transparent",padding:3,transition:"background .12s"}}
                    onDragOver={e=>{e.preventDefault();if(!st)e.currentTarget.style.background=`${C.indigo}18`;}}
                    onDragLeave={e=>{e.currentTarget.style.background=dayIdx===todayIdx?`${C.indigo}05`:"transparent";}}
                    onDrop={e=>{e.preventDefault();e.currentTarget.style.background=dayIdx===todayIdx?`${C.indigo}05`:"transparent";if(dragging&&!st){onAssignSlot(dragging.id,dayIdx,hour);setDragging(null);}}}>
                    {st&&(
                      <div style={{background:`${P_COLOR[st.priority]}18`,border:`1px solid ${P_COLOR[st.priority]}50`,borderRadius:6,padding:"4px 7px",fontSize:11,color:P_COLOR[st.priority],fontFamily:"Space Grotesk,sans-serif",fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:4,overflow:"hidden"}}>
                        <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={st.title}>{st.title}</span>
                        <button onClick={()=>onClearSlot(st.id)} style={{background:"transparent",border:"none",color:C.textGhost,cursor:"pointer",fontSize:14,lineHeight:1,padding:0,flexShrink:0}}>×</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Habits page ──
function HabitsPage({ habits, onCheckIn, onAdd, onDelete }) {
  const [name,setName]=useState(""); const [emoji,setEmoji]=useState("⭐"); const [err,setErr]=useState(null); const [picker,setPicker]=useState(false);
  const last7=getLast7(), td=todayStr();
  function submit(){if(!name.trim()){setErr("Required.");return;}onAdd(name,emoji);setName("");setEmoji("⭐");setErr(null);}
  const topStreak=habits.reduce((m,h)=>Math.max(m,h.streak),0);
  const doneToday=habits.filter(h=>h.log[td]).length;
  return (
    <div style={{padding:22,overflowY:"auto",height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",gap:18}}>
      {habits.length>0&&(
        <div style={{display:"flex",gap:10}}>
          {[["📋",habits.length,"Tracked",C.indigo],[`✅`,`${doneToday}/${habits.length}`,"Done Today",C.green],["🏆",`${topStreak}🔥`,"Top Streak",C.orange]].map(([ic,v,l,col])=>(
            <div key={l} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 14px",textAlign:"center"}}>
              <div style={{fontSize:19,marginBottom:4}}>{ic}</div>
              <div style={{fontFamily:"Space Grotesk,sans-serif",fontWeight:800,fontSize:20,color:col,lineHeight:1}}>{v}</div>
              <div style={{fontSize:11,color:C.textDim,fontFamily:"Inter,sans-serif",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px"}}>
        <div style={{fontSize:11,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em",marginBottom:12}}>ADD HABIT</div>
        <div style={{display:"flex",gap:8,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>setPicker(v=>!v)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",fontSize:20,cursor:"pointer",lineHeight:1}} onMouseOver={e=>e.currentTarget.style.borderColor=C.indigo} onMouseOut={e=>e.currentTarget.style.borderColor=C.border}>{emoji}</button>
            {picker&&(
              <div style={{position:"absolute",top:"100%",left:0,marginTop:5,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:8,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,zIndex:50,boxShadow:"0 8px 30px #00000060"}}>
                {HABIT_EMOJIS.map(e=><button key={e} onClick={()=>{setEmoji(e);setPicker(false);}} style={{background:emoji===e?`${C.indigo}25`:"transparent",border:`1px solid ${emoji===e?C.indigo:"transparent"}`,borderRadius:5,padding:"5px",fontSize:17,cursor:"pointer"}}>{e}</button>)}
              </div>
            )}
          </div>
          <input value={name} onChange={e=>{setName(e.target.value);setErr(null);}} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="e.g. Morning Review, Read 20 pages…"
            style={{flex:1,minWidth:160,background:C.bg,border:`1px solid ${err?C.red:C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13.5,fontFamily:"Inter,sans-serif",outline:"none"}}
            onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=err?C.red:C.border}/>
          <button onClick={submit} style={{background:"linear-gradient(135deg,#6366F1,#8B5CF6)",border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontWeight:700,fontSize:13,flexShrink:0}}>Add</button>
        </div>
        {err&&<div style={{marginTop:7,fontSize:12,color:C.red,fontFamily:"Inter,sans-serif"}}>{err}</div>}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {habits.length===0&&<div style={{textAlign:"center",padding:"36px 20px",color:C.textGhost,fontFamily:"Inter,sans-serif",fontSize:14}}>No habits yet. Add one above to start building streaks 🚀</div>}
        {habits.map(h=>{
          const doneT=!!h.log[td];
          return (
            <div key={h.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:13,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:9,alignItems:"center",minWidth:150,flex:1}}>
                  <span style={{fontSize:24,lineHeight:1}}>{h.emoji}</span>
                  <div>
                    <div style={{fontFamily:"Space Grotesk,sans-serif",fontWeight:700,fontSize:14,color:C.text}}>{h.name}</div>
                    <div style={{fontSize:11,color:C.textDim,fontFamily:"Inter,sans-serif"}}>Habit tracking</div>
                  </div>
                </div>
                <div style={{textAlign:"center",minWidth:52}}>
                  <span style={{fontSize:20,fontWeight:800,color:h.streak>0?C.orange:C.textGhost,fontFamily:"Space Grotesk,sans-serif",lineHeight:1}}>{h.streak}</span>
                  <div style={{fontSize:10.5,color:C.textDim}}>🔥 streak</div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  {last7.map((d,i)=>{
                    const done=!!h.log[d], isTd=d===td;
                    return (
                      <div key={d} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{width:28,height:28,borderRadius:7,background:done?C.green:C.bg,border:`1px solid ${done?C.green:isTd?C.indigo:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,transition:"all .2s",boxShadow:done?`0 0 7px ${C.green}40`:"none"}}>{done&&"✓"}</div>
                        <span style={{fontSize:9,color:isTd?C.indigo:C.textGhost,fontFamily:"Space Grotesk,sans-serif",fontWeight:isTd?700:400}}>{"SuMoTuWeThFrSa".slice(i*2,i*2+2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:7,marginLeft:"auto"}}>
                  <button onClick={()=>onCheckIn(h.id)} style={{background:doneT?`${C.green}18`:C.green,border:`1px solid ${doneT?`${C.green}50`:C.green}`,borderRadius:8,padding:"7px 13px",color:doneT?C.green:"#fff",cursor:"pointer",fontSize:12.5,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,whiteSpace:"nowrap"}}>{doneT?"✓ Done Today":"Check In"}</button>
                  <button onClick={()=>onDelete(h.id)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",color:C.textGhost,cursor:"pointer",fontSize:15,transition:"all .15s"}} onMouseOver={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red;}} onMouseOut={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textGhost;}}>×</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AI Coach page ──
const COACH_SYS=(ts,hs)=>`You are an elite AI productivity coach inside LifeSaver AI, powered by Google Gemini (Google AI Studio). Direct, concise, actionable. Under 200 words per response. Use **bold** for key actions.\n\nUSER TASKS:\n${ts}\n\nUSER HABITS:\n${hs}`;
const QUICK_PROMPTS=["What's my #1 priority right now?","Plan my next 3 hours","I'm overwhelmed — help me","Break down my most urgent task","How are my habit streaks?","What should I do first tomorrow?"];

function AICoachPage({ tasks, habits }) {
  const [msgs,setMsgs]=useState([{role:"assistant",content:"👋 I'm your AI Coach, powered by **Google Gemini**. I know your tasks, deadlines, and habits.\n\nAsk me to prioritize your day, break down a task, or just say you're overwhelmed — I'll get you unstuck."}]);
  const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [err,setErr]=useState(null);
  const bottomRef=useRef(null); const inputRef=useRef(null);
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,loading]);
  const sys=COACH_SYS(taskSummary(tasks),habitSummary(habits));
  const voice=useVoice({onResult:t=>{setInput(t);setTimeout(()=>send(t),300);}});

  async function send(override){
    const text=(override??input).trim(); if(!text||loading) return;
    if(!hasKey()){setErr("No Gemini key. Add it on the Dashboard tab.");return;}
    const userMsg={role:"user",content:text};
    setMsgs(m=>[...m,userMsg]); setInput(""); setLoading(true); setErr(null);
    try{ const reply=await callGeminiChat([...msgs,userMsg],sys); setMsgs(m=>[...m,{role:"assistant",content:reply}]); }
    catch(e){ setErr(e.message==="NO_KEY"?"Gemini key missing.":`Gemini error: ${e.message}`); }
    setLoading(false);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative"}}>
      <div style={{padding:"9px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <GeminiLogo size={24}/>
          <div>
            <div style={{fontFamily:"Space Grotesk,sans-serif",fontSize:13,fontWeight:700,color:C.text}}>AI Coach</div>
            <div style={{fontSize:10,color:C.textDim,fontFamily:"Inter,sans-serif"}}>Powered by Google Gemini · Google AI Studio</div>
          </div>
        </div>
        <button onClick={()=>setMsgs([{role:"assistant",content:"Chat cleared. What would you like to work on?"}])} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 11px",color:C.textDim,cursor:"pointer",fontSize:12,fontFamily:"Space Grotesk,sans-serif"}}>Clear chat</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"18px 20px",display:"flex",flexDirection:"column",gap:13}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:9,alignItems:"flex-end"}}>
            {m.role==="assistant"&&<GeminiLogo size={27}/>}
            <div style={{maxWidth:"80%",background:m.role==="user"?C.indigo:C.surface,border:m.role==="user"?"none":`1px solid ${C.border}`,borderRadius:m.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px",padding:"11px 15px",fontSize:13.5,color:C.textMid,lineHeight:1.6,fontFamily:"Inter,sans-serif",wordBreak:"break-word",animation:"fadeIn .25s ease"}} dangerouslySetInnerHTML={{__html:renderMd(m.content)}}/>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:9,alignItems:"flex-end"}}>
            <GeminiLogo size={27}/>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"4px 16px 16px 16px",padding:"12px 15px"}}><LoadingDots color={C.blue}/></div>
          </div>
        )}
        {err&&<div style={{background:"#F43F5E10",border:`1px solid ${C.red}35`,borderRadius:10,padding:"10px 14px",fontSize:13,color:"#FCA5A5",fontFamily:"Inter,sans-serif"}}>⚠️ {err}</div>}
        <div ref={bottomRef}/>
      </div>

      <div style={{padding:"7px 18px",display:"flex",gap:6,flexWrap:"wrap",borderTop:`1px solid ${C.border}`}}>
        {QUICK_PROMPTS.map(p=>(
          <button key={p} onClick={()=>send(p)} disabled={loading} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 11px",fontSize:11,color:C.textDim,cursor:loading?"default":"pointer",fontFamily:"Inter,sans-serif",opacity:loading?0.5:1,transition:"all .15s"}} onMouseOver={e=>{if(!loading){e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color="#93C5FD";}}} onMouseOut={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim;}}>{p}</button>
        ))}
      </div>

      <div style={{padding:"9px 18px 15px",display:"flex",gap:9,alignItems:"flex-end"}}>
        <button onClick={voice.toggle} disabled={!voice.supported} title={voice.listening?"Stop":"Voice input"} style={{background:voice.listening?"#F43F5E18":"transparent",border:`1px solid ${voice.listening?C.red:C.border}`,borderRadius:10,padding:"10px 12px",color:voice.listening?C.red:C.textDim,cursor:voice.supported?"pointer":"not-allowed",fontSize:17,flexShrink:0,opacity:voice.supported?1:0.35,animation:voice.listening?"pulse 1.5s ease infinite":"none"}}>🎙</button>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())} placeholder={voice.listening?"Listening… speak your question":"Ask Gemini anything about your tasks…"} rows={1}
          style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13.5,fontFamily:"Inter,sans-serif",outline:"none",resize:"none",lineHeight:1.5}}
          onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:input.trim()&&!loading?"linear-gradient(135deg,#4285F4,#34A853)":C.border,border:"none",borderRadius:10,padding:"10px 15px",color:input.trim()&&!loading?"#fff":C.textDim,cursor:input.trim()&&!loading?"pointer":"default",fontSize:17,flexShrink:0,boxShadow:input.trim()&&!loading?"0 3px 12px #4285F440":"none"}}>↑</button>
      </div>
    </div>
  );
}

// ── Action Plan page ──
function ActionPlanPage({ tasks, habits }) {
  const [plan,setPlan]=useState(null); const [loading,setLoading]=useState(false); const [err,setErr]=useState(null);

  async function generate() {
    if(!hasKey()){setErr("Connect your Gemini API key on the Dashboard first.");return;}
    setLoading(true); setErr(null);
    try{
      const result=await callGeminiJSON(
        `Expert productivity AI. Generate a focused action plan.\n\nTASKS:\n${taskSummary(tasks)}\n\nHABITS:\n${habitSummary(habits)}\n\nRespond ONLY with valid JSON:\n{"headline":"one punchy sentence","rescueTask":"most urgent task title","riskAlert":"what breaks in 2 hours","timeBlocks":[{"time":"Now","duration":"45min","task":"title","action":"next step"}],"habitNote":"one sentence","battleCry":"one punchy motivational line"}`
      );
      setPlan(result);
    }catch(e){setErr(e.message);}
    setLoading(false);
  }

  const Sec=({label,color=C.indigo,children})=>(
    <div style={{background:`${color}0D`,border:`1px solid ${color}30`,borderRadius:13,padding:"14px 17px"}}>
      <div style={{fontSize:10.5,color,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em",marginBottom:7}}>{label}</div>
      {children}
    </div>
  );

  return (
    <div style={{padding:22,overflowY:"auto",height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <GeminiLogo size={36}/>
          <div>
            <h2 style={{margin:0,fontFamily:"Space Grotesk,sans-serif",color:C.text,fontSize:17,fontWeight:800}}>AI Action Plan</h2>
            <p style={{margin:"2px 0 0",color:C.textDim,fontSize:11.5,fontFamily:"Inter,sans-serif"}}>Powered by Google Gemini · Google AI Studio</p>
          </div>
        </div>
        <button onClick={generate} disabled={loading} style={{background:loading?C.border:"linear-gradient(135deg,#4285F4,#34A853)",border:"none",borderRadius:11,padding:"10px 20px",color:loading?C.textDim:"#fff",cursor:loading?"default":"pointer",fontSize:13,fontWeight:700,fontFamily:"Space Grotesk,sans-serif",display:"flex",alignItems:"center",gap:8,boxShadow:loading?"none":"0 4px 16px #4285F445"}}>
          {loading?<><LoadingDots color="#fff" size={6}/><span>Generating…</span></>:"✨ Generate with Gemini"}
        </button>
      </div>

      {err&&<div style={{background:"#F43F5E10",border:`1px solid ${C.red}35`,borderRadius:10,padding:"12px 16px",fontSize:13,color:"#FCA5A5",fontFamily:"Inter,sans-serif"}}>⚠️ {err}</div>}

      {!plan&&!loading&&!err&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:40,textAlign:"center"}}>
          <div style={{fontSize:44}}>🧠</div>
          <div style={{fontFamily:"Space Grotesk,sans-serif",fontWeight:700,fontSize:16,color:C.textFaint}}>No plan generated yet</div>
          <p style={{fontFamily:"Inter,sans-serif",fontSize:13,color:C.textGhost,margin:0,maxWidth:280,lineHeight:1.5}}>Click Generate to get a Gemini-curated schedule built from your real tasks and deadlines.</p>
        </div>
      )}

      {plan&&(
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <Sec label="📌 TODAY'S FOCUS" color={C.blue}><p style={{margin:0,color:C.text,fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:600,lineHeight:1.4}}>{plan.headline}</p></Sec>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
            <Sec label="⚠️ RISK ALERT" color={C.red}><p style={{margin:0,color:"#FDA4AF",fontFamily:"Inter,sans-serif",fontSize:13,lineHeight:1.55}}>{plan.riskAlert}</p></Sec>
            <Sec label="🎯 RESCUE TASK" color={C.green}><p style={{margin:0,color:"#6EE7B7",fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:600,lineHeight:1.4}}>{plan.rescueTask}</p></Sec>
          </div>

          {Array.isArray(plan.timeBlocks)&&plan.timeBlocks.length>0&&(
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:13,padding:"16px 18px"}}>
              <div style={{fontSize:10.5,color:C.textDim,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,letterSpacing:"0.08em",marginBottom:16}}>📅 GEMINI SCHEDULE</div>
              <div style={{display:"flex",flexDirection:"column",gap:15}}>
                {plan.timeBlocks.map((b,i)=>(
                  <div key={i} style={{display:"flex",gap:15,alignItems:"flex-start"}}>
                    <div style={{minWidth:68,textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:12.5,fontWeight:700,color:C.blue,fontFamily:"Space Grotesk,sans-serif",lineHeight:1.2}}>{b.time}</div>
                      <div style={{fontSize:10.5,color:C.textDim,fontFamily:"Inter,sans-serif",marginTop:2}}>{b.duration}</div>
                    </div>
                    <div style={{width:2,alignSelf:"stretch",background:i===0?C.blue:C.border,borderRadius:2,flexShrink:0,marginTop:4,minHeight:34}}/>
                    <div style={{flex:1,paddingBottom:2}}>
                      <div style={{fontSize:13.5,fontWeight:700,color:C.text,fontFamily:"Space Grotesk,sans-serif",marginBottom:3}}>{b.task}</div>
                      <div style={{fontSize:12,color:C.textDim,fontFamily:"Inter,sans-serif",lineHeight:1.45}}>→ {b.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.habitNote&&<Sec label="🔥 HABIT MOMENTUM" color={C.violet}><p style={{margin:0,color:"#C4B5FD",fontFamily:"Inter,sans-serif",fontSize:13,lineHeight:1.5}}>{plan.habitNote}</p></Sec>}

          {plan.battleCry&&(
            <div style={{background:`linear-gradient(135deg,${C.indigo}15,${C.blue}15)`,border:`1px solid ${C.indigo}20`,borderRadius:13,padding:"16px 20px",textAlign:"center"}}>
              <p style={{margin:0,color:C.indigoLt,fontFamily:"Space Grotesk,sans-serif",fontSize:15,fontWeight:700,fontStyle:"italic",lineHeight:1.4}}>"{plan.battleCry}"</p>
            </div>
          )}

          <button onClick={generate} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:10,color:C.textDim,cursor:"pointer",fontFamily:"Space Grotesk,sans-serif",fontSize:13,transition:"all .15s"}} onMouseOver={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}} onMouseOut={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim;}}>↻ Regenerate Plan</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════
const TABS=[{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"tasks",label:"Tasks",icon:"📋"},{id:"calendar",label:"Calendar",icon:"📅"},{id:"habits",label:"Habits",icon:"🔥"},{id:"coach",label:"AI Coach",icon:"🤖"},{id:"plan",label:"Plan",icon:"✨"}];

// Boot: restore saved key
;(()=>{ const k=LS.get("ls2_apikey",""); if(k) setKey(k); })();

export default function App() {
  const [tab,setTab]         = useState("dashboard");
  const [rescue,setRescue]   = useState(null);
  useTicker(60000);

  const { tasks, addTask, toggleTask, deleteTask, assignSlot, clearSlot } = useTasks();
  const { habits, addHabit, checkIn, deleteHabit }                        = useHabits();
  const { alerts, dismiss }                                                = useProactiveAlerts(tasks);

  const pending  = pendingTasks(tasks);
  const overdue  = overdueTasks(tasks);
  const topScore = pending.length ? Math.max(...pending.map(urgencyScore)) : 0;

  return (
    <div style={{height:"100vh",background:C.bg,display:"flex",flexDirection:"column",fontFamily:"Inter,sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0A0E1A;color:#F1F5F9;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1E2235;border-radius:2px;}
        ::-webkit-scrollbar-thumb:hover{background:#2A3050;}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateY(-10px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
        input[type="datetime-local"]::-webkit-calendar-picker-indicator{filter:invert(.6);cursor:pointer;}
        select option{background:#0F1322;}
        textarea{overflow:hidden;}
      `}</style>

      {rescue&&<RescueMode task={rescue} onExit={()=>setRescue(null)} onMarkDone={id=>{toggleTask(id);setRescue(null);}}/>}

      {/* Header */}
      <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 18px",display:"flex",alignItems:"center",height:54,flexShrink:0,gap:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginRight:24,flexShrink:0}}>
          <div style={{width:31,height:31,background:"linear-gradient(135deg,#6366F1,#8B5CF6)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:"0 3px 10px #6366F145",flexShrink:0}}>⚡</div>
          <div>
            <div style={{fontFamily:"Space Grotesk,sans-serif",fontWeight:800,fontSize:14.5,color:C.text,lineHeight:1}}>LifeSaver AI</div>
            <div style={{fontSize:9,color:C.textGhost,fontFamily:"Inter,sans-serif",marginTop:1,letterSpacing:"0.02em"}}>Google Gemini · Google AI Studio</div>
          </div>
        </div>

        <nav style={{display:"flex",height:"100%",overflowX:"auto",flex:1}}>
          {TABS.map(t=>{
            const active=tab===t.id, count=t.id==="tasks"?pending.length:0;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${active?C.indigo:"transparent"}`,padding:"0 13px",height:"100%",color:active?C.indigoLt:C.textFaint,cursor:"pointer",fontSize:12.5,fontFamily:"Space Grotesk,sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:6,transition:"color .15s,border-color .15s",whiteSpace:"nowrap",flexShrink:0}}
                onMouseOver={e=>{if(!active)e.currentTarget.style.color=C.textMid;}} onMouseOut={e=>{if(!active)e.currentTarget.style.color=C.textFaint;}}>
                <span>{t.icon}</span><span>{t.label}</span>
                {count>0&&<span style={{background:C.indigo,borderRadius:10,padding:"1px 6px",fontSize:10,color:"#fff",fontWeight:700,lineHeight:"16px"}}>{count}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0,marginLeft:10}}>
          {overdue.length>0&&<div style={{background:"#F43F5E15",border:"1px solid #F43F5E45",borderRadius:20,padding:"4px 11px",fontSize:11,color:C.red,fontFamily:"Space Grotesk,sans-serif",fontWeight:700,animation:"pulse 2s ease infinite",whiteSpace:"nowrap"}}>⚠️ {overdue.length} overdue</div>}
          {pending.length>0&&<div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:scoreColor(topScore),boxShadow:`0 0 6px ${scoreColor(topScore)}`,flexShrink:0}}/>
            <span style={{fontSize:11,color:C.textDim,fontFamily:"Inter,sans-serif",whiteSpace:"nowrap"}}>Urgency: <span style={{color:scoreColor(topScore),fontWeight:700}}>{Math.round(topScore)}</span></span>
          </div>}
        </div>
      </header>

      {/* Content */}
      <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {tab==="dashboard" && <Dashboard tasks={tasks} habits={habits} alerts={alerts} onDismiss={dismiss} onRescue={setRescue} onKeySet={setKey}/>}
        {tab==="tasks"     && <TasksPage tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onAdd={addTask} onRescue={setRescue}/>}
        {tab==="calendar"  && <CalendarPage tasks={tasks} onAssignSlot={assignSlot} onClearSlot={clearSlot}/>}
        {tab==="habits"    && <HabitsPage habits={habits} onCheckIn={checkIn} onAdd={addHabit} onDelete={deleteHabit}/>}
        {tab==="coach"     && <AICoachPage tasks={tasks} habits={habits}/>}
        {tab==="plan"      && <ActionPlanPage tasks={tasks} habits={habits}/>}
      </main>
    </div>
  );
}
