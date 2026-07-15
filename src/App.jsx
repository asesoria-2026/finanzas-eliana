import { useState, useEffect } from "react";
import {
  Plus, Trash2, Wallet, Users, CreditCard, Target, LayoutGrid, Download,
  Database, HandCoins, ChevronLeft, ChevronRight, Pencil, Check, X, AlertTriangle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zqfciflgksxxqbfvxkad.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZmNpZmxna3N4eHFiZnZ4a2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTk5NjgsImV4cCI6MjA5OTUzNTk2OH0.lJDps1bqv4nvVPhGuF2rzXNlpdfJeyKjXZQdR_Bqsao";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cargarDatos(userId) {
  const { data, error } = await supabase.from("finanzas_data").select("data").eq("user_id", userId).single();
  if (error && error.code !== "PGRST116") throw error;
  return data?.data || null;
}
async function guardarDatos(userId, datos) {
  const { error: ue } = await supabase.from("finanzas_data").update({ data: datos, updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (ue) {
    const { error: ie } = await supabase.from("finanzas_data").insert({ user_id: userId, data: datos, updated_at: new Date().toISOString() });
    if (ie) console.error("Error guardando:", ie.message);
  }
}

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const handleSubmit = async () => {
    if (!email || !password) { setErr("Ingresa correo y contraseña."); return; }
    setCargando(true); setErr(""); setMsg("");
    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErr(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setErr(error.message);
        else setMsg("¡Cuenta creada! Revisa tu correo para confirmar.");
      }
    } catch(e) { setErr("Error inesperado."); }
    setCargando(false);
  };
  const s = { minHeight:"100vh", background:"#F1F3EC", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'IBM Plex Sans',sans-serif" };
  const card = { background:"white", borderRadius:16, padding:40, width:"100%", maxWidth:400, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" };
  const inp = { padding:"9px 12px", borderRadius:8, border:"1px solid #D8DCCF", fontSize:14, fontFamily:"inherit", width:"100%", boxSizing:"border-box" };
  const btn = (active) => ({ flex:1, padding:"8px 0", borderRadius:999, border:"1px solid", borderColor:active?"#2F5D50":"#D8DCCF", background:active?"#2F5D50":"white", color:active?"white":"#55605A", cursor:"pointer", fontSize:13 });
  return (
    <div style={s}>
      <div style={card}>
        <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", color:"#2F5D50", fontWeight:600, marginBottom:4 }}>Finanzas personales</div>
        <h1 style={{ fontFamily:"serif", fontSize:28, margin:"0 0 24px", color:"#1F2E28" }}>Eliana Posada</h1>
        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          <button onClick={() => setModo("login")} style={btn(modo==="login")}>Iniciar sesión</button>
          <button onClick={() => setModo("registro")} style={btn(modo==="registro")}>Crear cuenta</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <label style={{ display:"flex", flexDirection:"column", gap:4, fontSize:12, color:"#55605A" }}>Correo<input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={inp} /></label>
          <label style={{ display:"flex", flexDirection:"column", gap:4, fontSize:12, color:"#55605A" }}>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={inp} /></label>
          {err && <div style={{ background:"#F7E3DF", border:"1px solid #A34A3D", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#A34A3D" }}>{err}</div>}
          {msg && <div style={{ background:"#DCE6DE", border:"1px solid #2F5D50", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#2F5D50" }}>{msg}</div>}
          <button onClick={handleSubmit} disabled={cargando} style={{ background:"#2F5D50", color:"white", border:"none", padding:"11px 0", borderRadius:8, fontSize:14, fontWeight:500, cursor:cargando?"not-allowed":"pointer", opacity:cargando?0.7:1 }}>{cargando?"Cargando…":modo==="login"?"Entrar":"Crear cuenta"}</button>
        </div>
        <div style={{ marginTop:20, fontSize:11, color:"#9AA398", textAlign:"center" }}>Tus datos se guardan de forma privada y segura.</div>
      </div>
    </div>
  );
}


// ---------------- Utilidades ----------------
const uid = () => Math.random().toString(36).slice(2, 10);
const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(n) || 0);
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthISO = () => new Date().toISOString().slice(0, 7);
const periodoDe = (fechaISO) => (fechaISO ? fechaISO.slice(0, 7) : monthISO());
const mesLabel = (key) => {
  const [y, m] = key.split("-");
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${meses[Number(m) - 1]} ${y}`;
};
const shiftMonth = (key, delta) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function fechaVencimientoDelMes(diaVencimiento, anio, mesIndex0) {
  const ultimoDiaMes = new Date(anio, mesIndex0 + 1, 0).getDate();
  const dia = Math.min(Number(diaVencimiento) || 1, ultimoDiaMes);
  return new Date(anio, mesIndex0, dia);
}

function estadoDeuda(d) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const periodoActual = monthISO();
  const pagadoEstePeriodo = d.ultimoPeriodoPagado === periodoActual;
  const [anioStr, mesStr] = periodoActual.split("-");
  const fechaVenc = fechaVencimientoDelMes(d.diaVencimiento, Number(anioStr), Number(mesStr) - 1);
  fechaVenc.setHours(0, 0, 0, 0);
  let diasMora = 0;
  if (!pagadoEstePeriodo && hoy > fechaVenc) {
    diasMora = Math.floor((hoy.getTime() - fechaVenc.getTime()) / 86400000);
  }
  const estado = pagadoEstePeriodo ? "pagada" : diasMora > 0 ? "mora" : "pendiente";
  return { pagadoEstePeriodo, fechaVenc, diasMora, estado };
}

// Tasa mensual efectiva decimal a partir de MV o EA
function tasaMensualEfectiva(tasa, tipoTasa) {
  const t = Number(tasa) || 0;
  if (tipoTasa === "EA") return Math.pow(1 + t / 100, 1 / 12) - 1;
  return t / 100;
}

const TIPOS_GASTO = ["Fijo-Fijo", "Fijo-Variable", "Variable-Prescindible"];
const MODALIDAD_LABEL = { cuota_fija: "Crédito con cuota fija (amortiza capital)", solo_intereses: "Solo intereses (capital se abona aparte)" };
const TIPO_MEDIO_LABEL = { tc: "Tarjeta de crédito", debito: "Cuenta débito", efectivo: "Efectivo", gdm: "GDM (cuenta por pagar)", otro: "Otro" };

// Categorías especiales (detectadas por nombre)
const CAT_PAGO_DEUDA = "Pago de deuda";
const CAT_PAGO_TC = "Pago tarjeta de crédito";
const CAT_PAGO_GDM = "Pago a GDM";
const CATS_ESPECIALES = [CAT_PAGO_DEUDA, CAT_PAGO_TC, CAT_PAGO_GDM];

const TABS = [
  { id: "fuente", label: "Fuente", icon: Database },
  { id: "movimientos", label: "Movimientos", icon: Wallet },
  { id: "deudas", label: "Deudas", icon: HandCoins },
  { id: "medios", label: "Medios de pago", icon: CreditCard },
  { id: "compartidos", label: "Compartidos", icon: Users },
  { id: "panorama", label: "Panorama", icon: LayoutGrid },
  { id: "metas", label: "Metas", icon: Target },
];

// ---------------- Semilla v2 ----------------
function seedDataV2() {
  const cat = (nombre, tipoGasto, presupuesto = "", subs = []) => ({
    id: uid(), nombre, tipoGasto, presupuesto, subcategorias: subs.map((s) => ({ id: uid(), nombre: s })),
  });
  const medio = (nombre, tipoMedio, saldoInicial = 0) => ({ id: uid(), nombre, tipoMedio, saldoInicial });
  return {
    version: 2,
    ingresos: [
      { id: uid(), nombre: "INDURES", tipoIngreso: "variable", monto: "" },
      { id: uid(), nombre: "GSE", tipoIngreso: "variable", monto: "" },
      { id: uid(), nombre: "SEMILLA", tipoIngreso: "variable", monto: "" },
      { id: uid(), nombre: "Grupo Don Matías", tipoIngreso: "variable", monto: "" },
      { id: uid(), nombre: "Otros ingresos", tipoIngreso: "variable", monto: "" },
    ],
    categorias: [
      cat("Arrendamiento", "Fijo-Fijo"),
      cat("Salud — Póliza Sura", "Fijo-Fijo", "", ["Póliza mensual"]),
      cat("Acueducto", "Fijo-Variable"),
      cat("TigoUne", "Fijo-Fijo"),
      cat("Claro", "Fijo-Fijo"),
      cat("Suramericana de seguros", "Fijo-Fijo"),
      cat("Medicamentos", "Fijo-Variable"),
      cat("Mercado", "Fijo-Variable", "", ["Supermercado", "Plaza de mercado"]),
      cat("Servicios públicos", "Fijo-Variable", "", ["Energía", "Agua", "Gas", "Internet"]),
      cat("Transporte", "Fijo-Variable", "", ["Combustible", "Domicilios / Uber"]),
      cat("Bienestar y belleza", "Variable-Prescindible", "", ["Tratamientos", "Ropa y accesorios"]),
      cat("Viajes y ocio", "Variable-Prescindible", "", ["Viajes", "Buceo", "Salidas"]),
      cat("Familia", "Variable-Prescindible", "", ["Tiempo con mamá", "Regalos"]),
      cat("Emprendimiento", "Variable-Prescindible", "", ["Inversión SEMILLA", "Otros"]),
      cat(CAT_PAGO_DEUDA, "Fijo-Fijo"),
      cat(CAT_PAGO_TC, "Fijo-Fijo"),
      cat(CAT_PAGO_GDM, "Fijo-Fijo"),
    ],
    terceros: [
      { id: uid(), nombre: "Mamá", tipo: "persona", nota: "" },
      { id: uid(), nombre: "Paula", tipo: "persona", nota: "" },
      { id: uid(), nombre: "Diego Lopera", tipo: "persona", nota: "" },
      { id: uid(), nombre: "John Eliécer Zapata (Servicarga)", tipo: "proveedor", nota: "" },
      { id: uid(), nombre: "Araceli", tipo: "persona", nota: "" },
      { id: uid(), nombre: "Jaime Alberto", tipo: "persona", nota: "Arrendador / deudor" },
      { id: uid(), nombre: "Grupo Don Matías", tipo: "frente", nota: "A veces paga a nombre de Eliana (cuenta por pagar)" },
      { id: uid(), nombre: "INDURES", tipo: "frente", nota: "" },
      { id: uid(), nombre: "GSE", tipo: "frente", nota: "" },
      { id: uid(), nombre: "SEMILLA", tipo: "frente", nota: "" },
      { id: uid(), nombre: "Doña Alba", tipo: "persona", nota: "Limpieza" },
      { id: uid(), nombre: "Scotiabank Colpatria", tipo: "banco", nota: "" },
      { id: uid(), nombre: "Itaú", tipo: "banco", nota: "" },
      { id: uid(), nombre: "Bancolombia", tipo: "banco", nota: "" },
    ],
    mediosPago: [
      medio("LifeMiles Itaú física 4680", "tc"),
      medio("LifeMiles Itaú electrónica (número por confirmar)", "tc"),
      medio("Colpatria 0248", "tc"),
      medio("Itaú 6707", "tc"),
      medio("Débito Bancolombia 6246", "debito"),
      medio("Débito Itaú 7142", "debito"),
      medio("Efectivo", "efectivo"),
      medio("GDM", "gdm"),
      medio("Otro", "otro"),
    ],
    deudas: [],
    movimientos: [],
    compartidosCategorias: [
      { id: "arriendo", label: "Arriendo", tag: "Fijo", budget: 1500000 },
      { id: "agua", label: "Agua", tag: "Fijo", budget: 150000 },
      { id: "internet", label: "Internet", tag: "Fijo", budget: 120000 },
      { id: "limpieza", label: "Limpieza", tag: "Fijo aproximado", budget: 800000 },
      { id: "ninos", label: "Niños (medicinas + fondo)", tag: "Fijo calculado", budget: 751000 },
      { id: "carro_fijo", label: "Carro (seguro, SOAT, etc.)", tag: "Fijo prorrateado", budget: 670834 },
      { id: "mercado", label: "Mercado", tag: "Variable", budget: 2000000 },
      { id: "gasolina", label: "Gasolina", tag: "Variable", budget: 600000 },
    ],
    compartidosDirectorio: [
      { tercero: "Acueducto San Pedro", categoria: "agua" },
      { tercero: "Doña Alba", categoria: "limpieza" },
      { tercero: "Sura", categoria: "carro_fijo" },
    ],
    compartidosGastos: [],
    metas: [],
  };
}

// ---------------- Migración desde v1 ----------------
function migrateFromV1(old, base) {
  const next = { ...base };

  if (Array.isArray(old.terceros) && old.terceros.length) {
    old.terceros.forEach((t) => {
      if (!next.terceros.some((x) => x.nombre === t.nombre)) next.terceros.push({ ...t, id: t.id || uid() });
    });
  }
  if (Array.isArray(old.categorias) && old.categorias.length) {
    old.categorias.forEach((c) => {
      const existing = next.categorias.find((x) => x.nombre === c.nombre);
      const tipoGasto = c.tipoGasto === "Variable-Omisible" ? "Variable-Prescindible" : c.tipoGasto;
      if (existing) {
        // conserva subcategorías del usuario
        (c.subcategorias || []).forEach((s) => {
          if (!existing.subcategorias.some((x) => x.nombre === s.nombre))
            existing.subcategorias.push({ id: s.id || uid(), nombre: s.nombre });
        });
        // conserva los ids originales para que los movimientos migrados sigan enlazados
        existing.id = c.id || existing.id;
      } else {
        next.categorias.push({ id: c.id || uid(), nombre: c.nombre, tipoGasto, presupuesto: "", subcategorias: (c.subcategorias || []).map((s) => ({ id: s.id || uid(), nombre: s.nombre })) });
      }
    });
  }
  if (Array.isArray(old.fuentesIngreso)) {
    old.fuentesIngreso.forEach((f) => {
      const ex = next.ingresos.find((x) => x.nombre === f.nombre);
      if (ex) ex.id = f.id || ex.id;
      else next.ingresos.push({ id: f.id || uid(), nombre: f.nombre, tipoIngreso: "variable", monto: "" });
    });
  }

  // Deudas v1: Colpatria e Itaú 6707 pasan a tarjetas de crédito en Medios de pago;
  // recurrentes pasan a categorías; otros créditos quedan como deudas
  (old.deudas || []).forEach((d) => {
    const nombre = (d.nombre || "").toLowerCase();
    const esColpatria = nombre.includes("colpatria");
    const esItau6707 = nombre.includes("itau") || nombre.includes("itaú");
    if (d.tipoDeuda === "credito" && (esColpatria || esItau6707)) {
      const target = next.mediosPago.find((m) =>
        esColpatria ? m.nombre.includes("Colpatria") : m.nombre === "Itaú 6707"
      );
      if (target) {
        target.saldoInicial = Number(d.saldo) || 0;
        target.tasaInteres = d.tasaInteres;
        target.tipoTasa = d.tipoTasa || "MV";
        target.cuotaMinima = d.cuotaMinima;
        target.diaVencimiento = d.diaVencimiento;
      }
    } else if (d.tipoDeuda === "recurrente") {
      const ex = next.categorias.find((c) => c.nombre.toLowerCase() === nombre);
      if (ex && d.cuotaMinima) ex.presupuesto = d.cuotaMinima;
      if (!ex) next.categorias.push({ id: uid(), nombre: d.nombre, tipoGasto: "Fijo-Fijo", presupuesto: d.cuotaMinima || "", subcategorias: [] });
    } else if (d.tipoDeuda === "credito") {
      next.deudas.push({
        id: d.id || uid(), nombre: d.nombre, identificador: d.nombre.replace(/\s+/g, "-").toUpperCase(),
        modalidad: "cuota_fija", capital: Number(d.saldo) || 0, tasaInteres: d.tasaInteres || "",
        tipoTasa: d.tipoTasa || "MV", cuotaMensual: d.cuotaMinima || "", diaVencimiento: d.diaVencimiento || 1,
        ultimoPeriodoPagado: d.ultimoPeriodoPagado || "", pagadoAcumulado: Number(d.pagadoAcumulado) || 0,
      });
    }
  });

  // Movimientos: se conservan, se elimina "estado"
  next.movimientos = (old.movimientos || []).map((m) => {
    const { estado, ...rest } = m;
    return { ...rest, id: m.id || uid() };
  });
  next.metas = (old.metas || []).map((m) => ({ ...m, id: m.id || uid() }));
  return next;
}

function importCompartidosLegacy(data) { return { data, changed: false }; }

// ---------------- Derivaciones de medio de pago (color / etiqueta / naturaleza) ----------------
// Devuelve { color: 'verde'|'rojo'|'neutro', etiqueta: ''|'TC'|'GDM', esCaja, esTC, esGDM }
function infoMedio(mov, mediosPago) {
  const medio = mediosPago.find((m) => m.id === mov.medioPagoId);
  if (!medio) return { color: "neutro", etiqueta: "", esCaja: false, esTC: false, esGDM: false };
  let efectivoTipo = null;
  if (medio.tipoMedio === "efectivo") {
    const origen = mediosPago.find((m) => m.id === mov.cuentaOrigenId);
    efectivoTipo = origen ? origen.tipoMedio : null;
  }
  const t = medio.tipoMedio === "efectivo" ? efectivoTipo || "otro" : medio.tipoMedio;
  if (t === "debito") return { color: "verde", etiqueta: "", esCaja: true, esTC: false, esGDM: false };
  if (t === "tc") return { color: "rojo", etiqueta: "TC", esCaja: false, esTC: true, esGDM: false };
  if (t === "gdm") return { color: "rojo", etiqueta: "GDM", esCaja: false, esTC: false, esGDM: true };
  return { color: "neutro", etiqueta: "", esCaja: t === "debito", esTC: false, esGDM: false };
}

// ---------------- Simulador de pago óptimo ----------------
// Respeta la modalidad: en cuota_fija la cuota amortiza; en solo_intereses la cuota cubre
// solo el interés y el capital solo baja con el pago extra dirigido.
function simulateDebtPayoff(deudasInput, extraMensual, method) {
  const source = deudasInput.filter((d) => Number(d.capital) > 0);
  if (!source.length) return { months: 0, totalInterest: 0, payoffOrder: [], perpetuas: [] };
  let debts = source.map((d) => ({
    id: d.id, nombre: d.nombre, saldo: Number(d.capital) || 0,
    tasa: tasaMensualEfectiva(d.tasaInteres, d.tipoTasa),
    cuota: Number(d.cuotaMensual) || 0, modalidad: d.modalidad || "cuota_fija",
  }));
  const order = [...debts].sort((a, b) => (method === "avalancha" ? b.tasa - a.tasa : a.saldo - b.saldo));
  let totalInterest = 0, months = 0;
  const maxMonths = 600;
  const payoffOrder = [];
  const extra = Number(extraMensual) || 0;

  // Deudas solo-intereses sin pago extra nunca terminan: se reportan como perpetuas
  const perpetuas = extra <= 0 ? debts.filter((d) => d.modalidad === "solo_intereses").map((d) => d.nombre) : [];

  while (debts.some((d) => d.saldo > 0.5) && months < maxMonths) {
    months++;
    for (const d of debts) {
      if (d.saldo <= 0) continue;
      const interest = d.saldo * d.tasa;
      totalInterest += interest;
      d.saldo += interest;
      const pago = d.modalidad === "solo_intereses" ? Math.min(interest, d.saldo) : Math.min(d.cuota, d.saldo);
      d.saldo -= pago;
    }
    let rem = extra;
    for (const od of order) {
      if (rem <= 0) break;
      const d = debts.find((x) => x.id === od.id);
      if (!d || d.saldo <= 0) continue;
      const pay = Math.min(rem, d.saldo);
      d.saldo -= pay;
      rem -= pay;
      if (d.saldo <= 0.5 && !payoffOrder.includes(d.nombre)) payoffOrder.push(d.nombre);
    }
  }
  return { months, totalInterest: Math.round(totalInterest), payoffOrder, perpetuas, terminó: !debts.some((d) => d.saldo > 0.5) };
}

// ---------------- Componentes visuales ----------------
const SEG_COLORS = { verde: "#2F5D50", tc: "#A34A3D", gdm: "#7A2E3B", neutro: "#9AA398" };

function SegmentedBar({ titulo, total, segmentos, onSegmentClick, excedente }) {
  const usado = segmentos.reduce((s, x) => s + x.monto, 0);
  const base = Math.max(total, usado, 1);
  const pct = total > 0 ? Math.round((usado / total) * 100) : 0;
  return (
    <div className="segbar-block">
      <div className="segbar-head">
        <strong>{titulo}</strong>
        <span className="muted small">
          {formatCOP(usado)} de {formatCOP(total)} {total > 0 && <b className={pct > 100 ? "brick" : "accent"}>({pct}%)</b>}
        </span>
      </div>
      <div className="segbar-track">
        {segmentos.map((s, i) => (
          <div
            key={i}
            className={`segbar-seg ${s.etiqueta ? "has-tag" : ""}`}
            style={{ width: `${(s.monto / base) * 100}%`, background: SEG_COLORS[s.tipo] || SEG_COLORS.neutro }}
            title={`${s.label}: ${formatCOP(s.monto)}`}
            onClick={() => onSegmentClick && onSegmentClick(s)}
          >
            {s.etiqueta && (s.monto / base) > 0.08 && <span className="seg-tag">{s.etiqueta}</span>}
          </div>
        ))}
      </div>
      {excedente > 0 && <div className="small brick">Excede el presupuesto por {formatCOP(excedente)}</div>}
    </div>
  );
}

// Select con opción "Otro" que da de alta el valor nuevo en Fuente
function SelectConOtro({ value, onChange, opciones, placeholder, onCrear, label }) {
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState("");
  if (creando) {
    return (
      <div className="otro-inline">
        <input autoFocus placeholder={`Nuevo ${label}`} value={nuevo} onChange={(e) => setNuevo(e.target.value)} />
        <button className="icon-btn" title="Guardar" onClick={() => {
          if (nuevo.trim()) { const id = onCrear(nuevo.trim()); onChange(id); }
          setCreando(false); setNuevo("");
        }}><Check size={14} /></button>
        <button className="icon-btn" title="Cancelar" onClick={() => { setCreando(false); setNuevo(""); }}><X size={14} /></button>
      </div>
    );
  }
  return (
    <select value={value} onChange={(e) => {
      if (e.target.value === "__otro__") setCreando(true);
      else onChange(e.target.value);
    }}>
      <option value="">{placeholder}</option>
      {opciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
      <option value="__otro__">➕ Otro (crear nuevo)</option>
    </select>
  );
}

// ---------------- Formularios vacíos ----------------
const emptyMovi = {
  fecha: todayISO(), tipo: "gasto", monto: "", terceroId: "", medioPagoId: "", cuentaOrigenId: "",
  categoriaId: "", subcategoriaId: "", fuenteIngresoId: "", notas: "",
  compartido: false, compartidoPagadoPor: "Eliana", compartidoPorcentaje: 100, compartidoCategoriaId: "",
  deudaId: "", abonoCapital: "", tarjetaPagoId: "",
};
const emptyDeudaCat = { nombre: "", identificador: "", modalidad: "cuota_fija", capital: "", tasaInteres: "", tipoTasa: "MV", cuotaMensual: "", diaVencimiento: "" };
const emptyMeta = { nombre: "", montoObjetivo: "", montoAhorrado: "0", plazo: "", prioridad: "media" };
const emptyIngreso = { nombre: "", tipoIngreso: "fijo", monto: "", concepto: "" };
const CONCEPTOS_INGRESO = ["salario", "bono", "comisión", "honorarios", "intereses", "dividendos", "alquiler", "otro"];
const emptyCategoria = { nombre: "", tipoGasto: "Fijo-Fijo", presupuesto: "" };

// ==================================================================
export default function FinanzasApp() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState("panorama");
  const [fuenteSec, setFuenteSec] = useState("ingresos");
  const [selectedMonth, setSelectedMonth] = useState(monthISO());
  const [compMonth, setCompMonth] = useState(monthISO());
  const [extraMensual, setExtraMensual] = useState(0);
  const [simResults, setSimResults] = useState(null);
  const [movForm, setMovForm] = useState(emptyMovi);
  const [deudaForm, setDeudaForm] = useState(emptyDeudaCat);
  const [metaForm, setMetaForm] = useState(emptyMeta);
  const [ingresoForm, setIngresoForm] = useState(emptyIngreso);
  const [catForm, setCatForm] = useState(emptyCategoria);
  const [terceroForm, setTerceroForm] = useState({ nombre: "", tipo: "persona", nota: "" });
  const [medioForm, setMedioForm] = useState({ nombre: "", tipoMedio: "otro", saldoInicial: "" });
  const [subInputs, setSubInputs] = useState({});
  const [segDetail, setSegDetail] = useState(null);
  const [compForm, setCompForm] = useState({ fecha: todayISO(), monto: "", tercero: "", categoria: "", descripcion: "", pagadoPor: "Paula", porcentaje: 100 });
  const [compSettingsOpen, setCompSettingsOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // ---------- Auth y carga Supabase ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !session.user) return;
    setLoaded(false);
    (async () => {
      try {
        const d = await cargarDatos(session.user.id);
        setData(d || seedDataV2());
      } catch(e) {
        console.error("Error cargando:", e);
        setData(seedDataV2());
      }
      setLoaded(true);
    })();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!loaded || !data || !session?.user) return;
    const t = setTimeout(async () => {
      try { await guardarDatos(session.user.id, data); }
      catch(e) { console.error("Error guardando:", e); }
    }, 1000);
    return () => clearTimeout(t);
  }, [data, loaded]);

  // Metas por defecto por cada deuda activa
  useEffect(() => {
    if (!loaded || !data) return;
    const faltantes = data.deudas.filter(
      (d) => Number(d.capital) > 0 && !data.metas.some((m) => m.deudaId === d.id)
    );
    if (faltantes.length) {
      setData((prev) => ({
        ...prev,
        metas: [
          ...prev.metas,
          ...faltantes.map((d) => ({
            id: uid(), deudaId: d.id, nombre: `Saldar: ${d.nombre}`,
            montoObjetivo: Number(d.capital) || 0, montoAhorrado: Number(d.pagadoAcumulado) || 0,
            plazo: "", prioridad: "alta", auto: true,
          })),
        ],
      }));
    }
  }, [loaded, data?.deudas?.length]);

  if (!loaded || !data) {
    return (
      <div className="app-root"><style>{CSS}</style><div className="loading">Cargando tus datos…</div></div>
    );
  }

  // ---------- Helpers de estado ----------
  const addItem = (key, item) => { const id = uid(); setData((d) => ({ ...d, [key]: [...d[key], { id, ...item }] })); return id; };
  const updateItem = (key, id, patch) =>
    setData((d) => ({ ...d, [key]: d[key].map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  const removeItem = (key, id) => setData((d) => ({ ...d, [key]: d[key].filter((it) => it.id !== id) }));

  const nombreDe = (key, id, campo = "nombre") => data[key].find((x) => x.id === id)?.[campo] || "";
  const catById = (id) => data.categorias.find((c) => c.id === id);
  const medioById = (id) => data.mediosPago.find((m) => m.id === id);

  // ---------- Cálculos por medio de pago ----------
  const saldoTC = (tarjetaId) => {
    const tarjeta = medioById(tarjetaId);
    let saldo = Number(tarjeta?.saldoInicial) || 0;
    data.movimientos.forEach((m) => {
      if (m.tipo !== "gasto") return;
      const cat = catById(m.categoriaId);
      if (cat?.nombre === CAT_PAGO_TC && m.tarjetaPagoId === tarjetaId) saldo -= Number(m.monto) || 0;
      else if (m.medioPagoId === tarjetaId && cat?.nombre !== CAT_PAGO_TC) saldo += Number(m.monto) || 0;
    });
    return saldo;
  };
  const totalSaldoTC = data.mediosPago.filter((m) => m.tipoMedio === "tc").reduce((s, m) => s + saldoTC(m.id), 0);

  const salidasDeCuenta = (cuentaId, mesKey = null) =>
    data.movimientos
      .filter((m) => m.tipo === "gasto" && (!mesKey || periodoDe(m.fecha) === mesKey))
      .filter((m) => {
        if (m.medioPagoId === cuentaId) return medioById(cuentaId)?.tipoMedio !== "efectivo" ? true : false;
        const medio = medioById(m.medioPagoId);
        return medio?.tipoMedio === "efectivo" && m.cuentaOrigenId === cuentaId;
      })
      .reduce((s, m) => s + (Number(m.monto) || 0), 0);

  const cxpGDM = () => {
    let cxp = 0;
    data.movimientos.forEach((m) => {
      if (m.tipo !== "gasto") return;
      const cat = catById(m.categoriaId);
      const info = infoMedio(m, data.mediosPago);
      if (cat?.nombre === CAT_PAGO_GDM) cxp -= Number(m.monto) || 0;
      else if (info.esGDM) cxp += Number(m.monto) || 0;
    });
    return cxp;
  };

  // ---------- Movimientos: guardar con lógica especial ----------
  const crearTercero = (nombre) => addItem("terceros", { nombre, tipo: "otro", nota: "" });
  const crearMedio = (nombre) => addItem("mediosPago", { nombre, tipoMedio: "otro", saldoInicial: 0 });
  const crearCategoria = (nombre) => addItem("categorias", { nombre, tipoGasto: "Variable-Prescindible", presupuesto: "", subcategorias: [] });

  const catSeleccionada = catById(movForm.categoriaId);
  const esPagoDeuda = catSeleccionada?.nombre === CAT_PAGO_DEUDA;
  const esPagoTC = catSeleccionada?.nombre === CAT_PAGO_TC;
  const medioSeleccionado = medioById(movForm.medioPagoId);
  const esEfectivo = medioSeleccionado?.tipoMedio === "efectivo";
  const deudaSeleccionada = data.deudas.find((d) => d.id === movForm.deudaId);
  const interesEstimado = deudaSeleccionada
    ? Math.round((Number(deudaSeleccionada.capital) || 0) * tasaMensualEfectiva(deudaSeleccionada.tasaInteres, deudaSeleccionada.tipoTasa))
    : 0;

  const submitMovi = () => {
    if (!movForm.monto || !movForm.fecha) { showToast("Falta fecha o monto."); return; }
    if (movForm.tipo === "gasto" && !movForm.medioPagoId) { showToast("Selecciona el medio de pago."); return; }
    if (esEfectivo && !movForm.cuentaOrigenId) { showToast("Indica de qué cuenta salió el efectivo."); return; }
    if (esPagoDeuda && !movForm.deudaId) { showToast("Selecciona el identificador de crédito."); return; }
    if (esPagoTC && !movForm.tarjetaPagoId) { showToast("Selecciona cuál tarjeta estás pagando."); return; }
    if (movForm.compartido && !movForm.compartidoCategoriaId) { showToast("Selecciona la categoría del gasto compartido."); return; }

    const movId = uid();
    const mov = { id: movId, ...movForm, loggedAt: new Date().toISOString() };

    setData((prev) => {
      let next = { ...prev, movimientos: [...prev.movimientos, mov] };

      // Pago de deuda fija: marca el mes pagado y reduce capital por el abono a capital
      if (esPagoDeuda && movForm.deudaId) {
        const abono = movForm.abonoCapital !== "" ? Number(movForm.abonoCapital) : 0;
        next = {
          ...next,
          deudas: next.deudas.map((d) =>
            d.id === movForm.deudaId
              ? {
                  ...d,
                  ultimoPeriodoPagado: periodoDe(movForm.fecha),
                  capital: Math.max(0, (Number(d.capital) || 0) - abono),
                  pagadoAcumulado: (Number(d.pagadoAcumulado) || 0) + (Number(movForm.monto) || 0),
                }
              : d
          ),
        };
      }

      // Gasto compartido: se refleja también en Compartidos
      if (movForm.compartido) {
        next = {
          ...next,
          compartidosGastos: [
            ...next.compartidosGastos,
            {
              id: `e_${movId}`, movId, date: movForm.fecha, amount: Number(movForm.monto) || 0,
              tercero: nombreDe("terceros", movForm.terceroId) || "—",
              category: movForm.compartidoCategoriaId, description: movForm.notas || "",
              paidBy: movForm.compartidoPagadoPor, porcentaje: Number(movForm.compartidoPorcentaje) || 100,
              medioPago: nombreDe("mediosPago", movForm.medioPagoId), loggedAt: new Date().toISOString(),
            },
          ],
        };
      }
      return next;
    });
    setMovForm(emptyMovi);
    showToast("Movimiento registrado.");
  };

  const eliminarMovimiento = (movId) => {
    setData((prev) => ({
      ...prev,
      movimientos: prev.movimientos.filter((m) => m.id !== movId),
      compartidosGastos: prev.compartidosGastos.filter((g) => g.movId !== movId),
    }));
  };

  // ---------- Panorama: cálculos ----------
  const moviMes = data.movimientos.filter((m) => periodoDe(m.fecha) === selectedMonth);
  const ingresosMes = moviMes.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + (Number(m.monto) || 0), 0);
  const gastosMes = moviMes.filter((m) => m.tipo === "gasto");

  const esCatEspecial = (m) => CATS_ESPECIALES.includes(catById(m.categoriaId)?.nombre);
  const esPagoDeudaMov = (m) => catById(m.categoriaId)?.nombre === CAT_PAGO_DEUDA;
  const esPagoTCMov = (m) => catById(m.categoriaId)?.nombre === CAT_PAGO_TC;

  const segmentosPorTipo = (tipoGasto) => {
    const movs = gastosMes.filter((m) => catById(m.categoriaId)?.tipoGasto === tipoGasto && !esCatEspecial(m));
    return agrupaSegmentos(movs);
  };
  const agrupaSegmentos = (movs) => {
    const grupos = { verde: [], tc: [], gdm: [], neutro: [] };
    movs.forEach((m) => {
      const info = infoMedio(m, data.mediosPago);
      const key = info.esTC ? "tc" : info.esGDM ? "gdm" : info.color === "verde" ? "verde" : "neutro";
      grupos[key].push(m);
    });
    const seg = [];
    if (grupos.verde.length) seg.push({ tipo: "verde", etiqueta: "", label: "Cuentas propias (6246 / 7142)", monto: suma(grupos.verde), movs: grupos.verde });
    if (grupos.tc.length) seg.push({ tipo: "tc", etiqueta: "TC", label: "Tarjeta de crédito", monto: suma(grupos.tc), movs: grupos.tc });
    if (grupos.gdm.length) seg.push({ tipo: "gdm", etiqueta: "GDM", label: "Pagado por GDM", monto: suma(grupos.gdm), movs: grupos.gdm });
    if (grupos.neutro.length) seg.push({ tipo: "neutro", etiqueta: "", label: "Otro medio", monto: suma(grupos.neutro), movs: grupos.neutro });
    return seg;
  };
  const suma = (arr) => arr.reduce((s, m) => s + (Number(m.monto) || 0), 0);

  const presupuestoPorTipo = (tipoGasto) =>
    data.categorias
      .filter((c) => c.tipoGasto === tipoGasto && !CATS_ESPECIALES.includes(c.nombre))
      .reduce((s, c) => s + (Number(c.presupuesto) || 0), 0);

  const cuotasDeudasActivas = data.deudas.filter((d) => Number(d.capital) > 0 || d.modalidad === "solo_intereses")
    .reduce((s, d) => s + (Number(d.cuotaMensual) || 0), 0);
  const pagosDeudaMes = gastosMes.filter(esPagoDeudaMov);
  const segDeudas = agrupaSegmentos(pagosDeudaMes);

  // Salidas reales de caja del mes (verde): incluye pagos de deuda y de TC hechos desde cuentas propias
  const salidasCajaMes = gastosMes
    .filter((m) => infoMedio(m, data.mediosPago).esCaja)
    .reduce((s, m) => s + (Number(m.monto) || 0), 0);
  const disponibleReal = ingresosMes - salidasCajaMes - totalSaldoTC;

  const fechaUltimoMov = data.movimientos.length
    ? data.movimientos.reduce((max, m) => (m.fecha > max ? m.fecha : max), "0000")
    : null;

  const deudasConEstado = data.deudas.map((d) => ({ ...d, ...estadoDeuda(d) }));
  const deudasEnMora = deudasConEstado.filter((d) => d.estado === "mora").sort((a, b) => b.diasMora - a.diasMora);

  // ---------- Compartidos: cálculos ----------
  const compGastosMes = data.compartidosGastos.filter((g) => (g.date || "").slice(0, 7) === compMonth);
  const compBudgetTotal = data.compartidosCategorias.reduce((s, c) => s + (Number(c.budget) || 0), 0);
  const compCuotaPersona = compBudgetTotal / 2;
  const compGastadoTotal = compGastosMes.reduce((s, g) => s + (Number(g.amount) || 0), 0);
  const compPagadoPor = (quien) => compGastosMes.filter((g) => g.paidBy === quien).reduce((s, g) => s + (Number(g.amount) || 0), 0);
  const pagadoEliana = compPagadoPor("Eliana");
  const pagadoPaula = compPagadoPor("Paula");
  const compSpentByCat = {};
  compGastosMes.forEach((g) => { compSpentByCat[g.category] = (compSpentByCat[g.category] || 0) + (Number(g.amount) || 0); });
  const compAlertas = data.compartidosCategorias
    .map((c) => {
      const spent = compSpentByCat[c.id] || 0;
      const pct = c.budget > 0 ? (spent / c.budget) * 100 : 0;
      return { cat: c, spent, pct };
    })
    .filter((a) => a.pct >= 80);

  const guardarCompartido = (entry) => {
    setData((prev) => {
      let dir = prev.compartidosDirectorio;
      const ex = dir.find((d) => d.tercero.toLowerCase() === entry.tercero.toLowerCase());
      if (!ex) dir = [...dir, { tercero: entry.tercero, categoria: entry.category }];
      else if (ex.categoria !== entry.category)
        dir = dir.map((d) => (d.tercero.toLowerCase() === entry.tercero.toLowerCase() ? { ...d, categoria: entry.category } : d));
      return { ...prev, compartidosGastos: [...prev.compartidosGastos, entry], compartidosDirectorio: dir };
    });
  };

  // ---------- Export Excel ----------
  const exportToExcel = () => {
    const movRows = [...data.movimientos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map((m) => {
      const info = infoMedio(m, data.mediosPago);
      return {
        Fecha: m.fecha,
        Tipo: m.tipo === "ingreso" ? "Ingreso" : "Gasto",
        Monto: Number(m.monto) || 0,
        Tercero: nombreDe("terceros", m.terceroId),
        "Medio de pago": nombreDe("mediosPago", m.medioPagoId),
        "Cuenta origen (efectivo)": m.cuentaOrigenId ? nombreDe("mediosPago", m.cuentaOrigenId) : "",
        Categoría: m.tipo === "gasto" ? (catById(m.categoriaId)?.nombre || "") : "",
        Subcategoría: catById(m.categoriaId)?.subcategorias.find((s) => s.id === m.subcategoriaId)?.nombre || "",
        "Fuente de ingreso": m.tipo === "ingreso" ? nombreDe("ingresos", m.fuenteIngresoId) : "",
        Etiqueta: info.etiqueta || (info.color === "verde" ? "Caja propia" : ""),
        "Deuda (identificador)": m.deudaId ? nombreDe("deudas", m.deudaId, "identificador") : "",
        "Abono a capital": m.abonoCapital !== "" && m.abonoCapital != null ? Number(m.abonoCapital) || 0 : "",
        "Tarjeta pagada": m.tarjetaPagoId ? nombreDe("mediosPago", m.tarjetaPagoId) : "",
        Compartido: m.compartido ? `Sí — pagó ${m.compartidoPagadoPor} (${m.compartidoPorcentaje}%)` : "",
        Notas: m.notas || "",
      };
    });
    const deudasRows = deudasConEstado.map((d) => ({
      Nombre: d.nombre, Identificador: d.identificador, Modalidad: MODALIDAD_LABEL[d.modalidad],
      "Capital pendiente": Number(d.capital) || 0, "Tasa %": Number(d.tasaInteres) || 0, "Tipo tasa": d.tipoTasa,
      "Cuota mensual": Number(d.cuotaMensual) || 0, "Día vencimiento": d.diaVencimiento,
      "Estado del mes": d.estado === "pagada" ? "Pagada" : d.estado === "mora" ? `En mora (${d.diasMora}d)` : "Pendiente",
      "Pagado acumulado": Number(d.pagadoAcumulado) || 0,
    }));
    const mediosRows = data.mediosPago.map((m) => ({
      Nombre: m.nombre, Tipo: TIPO_MEDIO_LABEL[m.tipoMedio],
      "Saldo deudor (TC)": m.tipoMedio === "tc" ? saldoTC(m.id) : "",
      "Salidas acumuladas": m.tipoMedio === "debito" ? salidasDeCuenta(m.id) : "",
      "CxP a GDM": m.tipoMedio === "gdm" ? cxpGDM() : "",
    }));
    const compRows = data.compartidosGastos.map((g) => ({
      Fecha: g.date, Monto: Number(g.amount) || 0, Tercero: g.tercero,
      Categoría: data.compartidosCategorias.find((c) => c.id === g.category)?.label || g.category,
      Descripción: g.description || "", "Pagó": g.paidBy, "%": g.porcentaje || 100, "Medio": g.medioPago || "",
    }));
    const metasRows = data.metas.map((m) => ({
      Nombre: m.nombre, "Monto objetivo": Number(m.montoObjetivo) || 0,
      "Monto ahorrado": Number(m.montoAhorrado) || 0, Plazo: m.plazo || "", Prioridad: m.prioridad,
    }));
    const fuenteRows = [
      ...data.ingresos.map((i) => ({ Catálogo: "Ingreso", Nombre: i.nombre, Tipo: i.tipoIngreso, "Monto/Presupuesto": Number(i.monto) || "" })),
      ...data.categorias.map((c) => ({ Catálogo: "Categoría de gasto", Nombre: c.nombre, Tipo: c.tipoGasto, "Monto/Presupuesto": Number(c.presupuesto) || "" })),
      ...data.terceros.map((t) => ({ Catálogo: "Tercero", Nombre: t.nombre, Tipo: t.tipo, "Monto/Presupuesto": "" })),
      ...data.compartidosCategorias.map((c) => ({ Catálogo: "Compartidos", Nombre: c.label, Tipo: c.tag, "Monto/Presupuesto": c.budget })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(movRows), "Movimientos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(deudasRows), "Deudas");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mediosRows), "Medios de pago");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(compRows), "Compartidos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(metasRows), "Metas");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fuenteRows), "Fuente");
    XLSX.writeFile(wb, `finanzas-eliana-${todayISO()}.xlsx`);
  };

  // ================= RENDER: FUENTE =================
  const fuentePills = [
    { id: "ingresos", label: "Ingresos" },
    { id: "gastos", label: "Gastos (categorías)" },
    { id: "deudas", label: "Deudas" },
    { id: "terceros", label: "Terceros" },
    { id: "medios", label: "Medios de pago" },
    { id: "compartidos", label: "Compartidos" },
  ];

  const promedioUltimos3 = (nombreIngreso) => {
    // promedio de los últimos 3 meses con registros de esa fuente de ingreso
    const ing = data.ingresos.find((i) => i.nombre === nombreIngreso);
    if (!ing) return 0;
    const porMes = {};
    data.movimientos.filter((m) => m.tipo === "ingreso" && m.fuenteIngresoId === ing.id).forEach((m) => {
      const k = periodoDe(m.fecha);
      porMes[k] = (porMes[k] || 0) + (Number(m.monto) || 0);
    });
    const meses = Object.keys(porMes).sort().slice(-3);
    if (!meses.length) return 0;
    return Math.round(meses.reduce((s, k) => s + porMes[k], 0) / meses.length);
  };

  const promedioCategoria3 = (catId) => {
    const porMes = {};
    data.movimientos.filter((m) => m.tipo === "gasto" && m.categoriaId === catId).forEach((m) => {
      const k = periodoDe(m.fecha);
      porMes[k] = (porMes[k] || 0) + (Number(m.monto) || 0);
    });
    const meses = Object.keys(porMes).sort().slice(-3);
    if (!meses.length) return 0;
    return Math.round(meses.reduce((s, k) => s + porMes[k], 0) / meses.length);
  };

  const renderFuente = () => (
    <div className="stack">
      <div className="info-banner">
        Fuente es el catálogo maestro: todo lo que definas aquí alimenta Movimientos, Deudas, Medios de pago y Compartidos.
      </div>
      <div className="pill-nav">
        {fuentePills.map((p) => (
          <button key={p.id} className={`pill ${fuenteSec === p.id ? "active" : ""}`} onClick={() => setFuenteSec(p.id)}>{p.label}</button>
        ))}
      </div>

      {fuenteSec === "ingresos" && (
        <div className="form-card">
          <div className="section-title">Ingresos</div>
          <div className="inline-form">
            <label>Nombre<input value={ingresoForm.nombre} onChange={(e) => setIngresoForm({ ...ingresoForm, nombre: e.target.value })} /></label>
            <label>Concepto
              <select value={ingresoForm.concepto} onChange={(e) => setIngresoForm({ ...ingresoForm, concepto: e.target.value })}>
                <option value="">—</option>
                {CONCEPTOS_INGRESO.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </label>
            <label>Tipo
              <select value={ingresoForm.tipoIngreso} onChange={(e) => setIngresoForm({ ...ingresoForm, tipoIngreso: e.target.value })}>
                <option value="fijo">Fijo</option><option value="variable">Variable (promedio 3 meses)</option>
              </select>
            </label>
            {ingresoForm.tipoIngreso === "fijo" && (
              <label>Monto mensual<input type="number" value={ingresoForm.monto} onChange={(e) => setIngresoForm({ ...ingresoForm, monto: e.target.value })} /></label>
            )}
            <button className="btn-primary" onClick={() => {
              if (!ingresoForm.nombre.trim()) return;
              addItem("ingresos", ingresoForm); setIngresoForm(emptyIngreso);
            }}><Plus size={14} /> Agregar</button>
          </div>
          <ul className="dir-list" style={{ marginTop: 12 }}>
            {data.ingresos.map((i) => {
              const prom = i.tipoIngreso === "variable" ? promedioUltimos3(i.nombre) : 0;
              return (
                <li key={i.id}>
                  <span>
                    <EditableNombre item={i} onSave={(nombre) => updateItem("ingresos", i.id, { nombre })} />
                    {i.concepto && <span className="tag">{i.concepto}</span>}
                  </span>
                  <span className="row-actions">
                    <select className="mini-num" value={i.concepto || ""} onChange={(e) => updateItem("ingresos", i.id, { concepto: e.target.value })} style={{ width: 110 }}>
                      <option value="">concepto…</option>
                      {CONCEPTOS_INGRESO.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <span className="tag">{i.tipoIngreso}</span>
                    <span className="small muted mono">
                      {i.tipoIngreso === "fijo"
                        ? formatCOP(i.monto)
                        : prom > 0 ? `prom. ${formatCOP(prom)}` : (i.monto ? `manual ${formatCOP(i.monto)}` : "sin historia")}
                    </span>
                    {i.tipoIngreso === "variable" && (
                      <input type="number" className="mini-num" placeholder="valor manual" value={i.monto}
                        onChange={(e) => updateItem("ingresos", i.id, { monto: e.target.value })} title="Valor manual mientras no haya 3 meses de historia" />
                    )}
                    {i.tipoIngreso === "fijo" && (
                      <input type="number" className="mini-num" value={i.monto} onChange={(e) => updateItem("ingresos", i.id, { monto: e.target.value })} />
                    )}
                    <button className="icon-btn" onClick={() => removeItem("ingresos", i.id)}><Trash2 size={14} /></button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {fuenteSec === "gastos" && (
        <div className="form-card">
          <div className="section-title">Categorías de gasto</div>
          <div className="small muted" style={{ marginBottom: 10 }}>
            Fijo-fijo = mismo valor exacto cada mes · Fijo-variable = imprescindible pero fluctúa (presupuesto se sugiere con el promedio de los últimos 3 meses) · Variable-prescindible = se puede omitir.
          </div>
          <div className="inline-form">
            <label>Nombre<input value={catForm.nombre} onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })} /></label>
            <label>Tipo
              <select value={catForm.tipoGasto} onChange={(e) => setCatForm({ ...catForm, tipoGasto: e.target.value })}>
                {TIPOS_GASTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>Presupuesto mensual<input type="number" value={catForm.presupuesto} onChange={(e) => setCatForm({ ...catForm, presupuesto: e.target.value })} /></label>
            <button className="btn-primary" onClick={() => {
              if (!catForm.nombre.trim()) return;
              addItem("categorias", { ...catForm, subcategorias: [] }); setCatForm(emptyCategoria);
            }}><Plus size={14} /> Agregar</button>
          </div>
          {/* Categorías de usuario */}
          <div className="cat-grid" style={{ marginTop: 12 }}>
            {data.categorias.filter((c) => !CATS_ESPECIALES.includes(c.nombre)).map((c) => {
              const prom = c.tipoGasto === "Fijo-Variable" ? promedioCategoria3(c.id) : 0;
              return (
                <div className="cat-card" key={c.id}>
                  <div className="cat-head">
                    <div>
                      <EditableNombre item={c} onSave={(nombre) => updateItem("categorias", c.id, { nombre })} bold />
                      <div className="small muted">{c.tipoGasto}</div>
                    </div>
                    <button className="icon-btn" onClick={() => removeItem("categorias", c.id)}><Trash2 size={14} /></button>
                  </div>
                  <label className="small muted" style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 6 }}>
                    Tipo
                    <select value={c.tipoGasto} onChange={(e) => updateItem("categorias", c.id, { tipoGasto: e.target.value })}>
                      {TIPOS_GASTO.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="small muted" style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 6 }}>
                    Presupuesto mensual {prom > 0 && <span>(prom. 3 meses: {formatCOP(prom)}{" "}
                      <button className="link-btn" onClick={() => updateItem("categorias", c.id, { presupuesto: prom })}>usar</button>)</span>}
                    <input type="number" value={c.presupuesto} onChange={(e) => updateItem("categorias", c.id, { presupuesto: e.target.value })} />
                  </label>
                  <div className="subcats">
                    {c.subcategorias.map((s) => (
                      <span className="chip" key={s.id}>{s.nombre}
                        <button onClick={() => setData((d) => ({ ...d, categorias: d.categorias.map((x) => x.id === c.id ? { ...x, subcategorias: x.subcategorias.filter((y) => y.id !== s.id) } : x) }))}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="inline-form small">
                    <input placeholder="Nueva subcategoría" value={subInputs[c.id] || ""} onChange={(e) => setSubInputs({ ...subInputs, [c.id]: e.target.value })} />
                    <button className="btn-secondary" onClick={() => {
                      const nombre = (subInputs[c.id] || "").trim();
                      if (!nombre) return;
                      setData((d) => ({ ...d, categorias: d.categorias.map((x) => x.id === c.id ? { ...x, subcategorias: [...x.subcategorias, { id: uid(), nombre }] } : x) }));
                      setSubInputs({ ...subInputs, [c.id]: "" });
                    }}><Plus size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel explicativo de categorías de sistema */}
          <div className="sistema-cats-panel">
            <div className="small muted" style={{ marginBottom: 8, fontWeight: 600 }}>Categorías de sistema — se usan en Movimientos para activar flujos especiales</div>
            <div className="sistema-cats-grid">
              <div className="sistema-cat-item">
                <strong>Pago de deuda</strong>
                <div className="small muted">Selecciónala en Movimientos → Categoría para registrar el pago de un crédito/préstamo. Activa el selector de identificador de crédito (configura las deudas en la sección "Deudas" de este menú de Fuente), reduce el capital pendiente y marca la deuda como pagada este mes.</div>
              </div>
              <div className="sistema-cat-item">
                <strong>Pago tarjeta de crédito</strong>
                <div className="small muted">Selecciónala en Movimientos para registrar el pago de una tarjeta. Activa el selector de tarjeta (las tarjetas están en Medios de pago) y reduce el saldo deudor de esa tarjeta. El medio de pago del movimiento es de dónde sale la plata (ej. Débito Bancolombia).</div>
              </div>
              <div className="sistema-cat-item">
                <strong>Pago a GDM</strong>
                <div className="small muted">Registra cuando le devuelves plata a GDM. Reduce la cuenta por pagar que se genera cada vez que GDM paga algo por ti (movimientos con medio de pago = GDM). El saldo neto se ve en la pestaña Medios de pago.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {fuenteSec === "deudas" && (
        <div className="form-card">
          <div className="section-title">Catálogo de deudas (préstamos y créditos — las tarjetas viven en Medios de pago)</div>
          <div className="form-grid">
            <label>Nombre<input value={deudaForm.nombre} onChange={(e) => setDeudaForm({ ...deudaForm, nombre: e.target.value })} /></label>
            <label>Identificador de crédito (único)
              <input placeholder="Ej. BANCOL-8842" value={deudaForm.identificador} onChange={(e) => setDeudaForm({ ...deudaForm, identificador: e.target.value })} />
            </label>
            <label>Modalidad
              <select value={deudaForm.modalidad} onChange={(e) => {
                const mod = e.target.value;
                // Al cambiar a solo_intereses, calcula la cuota si ya hay capital y tasa
                let cuota = deudaForm.cuotaMensual;
                if (mod === "solo_intereses" && deudaForm.capital && deudaForm.tasaInteres) {
                  cuota = Math.round(Number(deudaForm.capital) * tasaMensualEfectiva(Number(deudaForm.tasaInteres), deudaForm.tipoTasa));
                }
                setDeudaForm({ ...deudaForm, modalidad: mod, cuotaMensual: cuota });
              }}>
                <option value="cuota_fija">Cuota fija (amortiza capital + intereses)</option>
                <option value="solo_intereses">Solo intereses (capital se abona aparte)</option>
              </select>
            </label>
            <label>Capital pendiente
              <input type="number" value={deudaForm.capital} onChange={(e) => {
                const capital = e.target.value;
                let cuota = deudaForm.cuotaMensual;
                if (deudaForm.modalidad === "solo_intereses" && capital && deudaForm.tasaInteres) {
                  cuota = Math.round(Number(capital) * tasaMensualEfectiva(Number(deudaForm.tasaInteres), deudaForm.tipoTasa));
                }
                setDeudaForm({ ...deudaForm, capital, cuotaMensual: cuota });
              }} />
            </label>
            <label>Tasa de interés %
              <input type="number" step="0.01" value={deudaForm.tasaInteres} onChange={(e) => {
                const tasaInteres = e.target.value;
                let cuota = deudaForm.cuotaMensual;
                if (deudaForm.modalidad === "solo_intereses" && deudaForm.capital && tasaInteres) {
                  cuota = Math.round(Number(deudaForm.capital) * tasaMensualEfectiva(Number(tasaInteres), deudaForm.tipoTasa));
                }
                setDeudaForm({ ...deudaForm, tasaInteres, cuotaMensual: cuota });
              }} />
            </label>
            <label>Tipo de tasa
              <select value={deudaForm.tipoTasa} onChange={(e) => {
                const tipoTasa = e.target.value;
                let cuota = deudaForm.cuotaMensual;
                if (deudaForm.modalidad === "solo_intereses" && deudaForm.capital && deudaForm.tasaInteres) {
                  cuota = Math.round(Number(deudaForm.capital) * tasaMensualEfectiva(Number(deudaForm.tasaInteres), tipoTasa));
                }
                setDeudaForm({ ...deudaForm, tipoTasa, cuotaMensual: cuota });
              }}>
                <option value="MV">MV (mensual vencida)</option><option value="EA">EA (efectiva anual)</option>
              </select>
            </label>
            <label>
              {deudaForm.modalidad === "solo_intereses" ? "Pago mensual de intereses (auto-calculado)" : "Cuota mensual fija"}
              {deudaForm.modalidad === "solo_intereses" && deudaForm.capital && deudaForm.tasaInteres && (
                <span className="small accent"> = {deudaForm.tasaInteres}% {deudaForm.tipoTasa} × capital</span>
              )}
              <input type="number" value={deudaForm.cuotaMensual}
                onChange={(e) => setDeudaForm({ ...deudaForm, cuotaMensual: e.target.value })}
                title={deudaForm.modalidad === "solo_intereses" ? "Calculado automáticamente. Puedes ajustar si el valor real difiere." : ""}
              />
              {deudaForm.modalidad === "solo_intereses" && (
                <span className="small muted">Calculado automáticamente — edítalo si la cifra real del acreedor difiere.</span>
              )}
            </label>
            <label>Día de vencimiento (1-31)<input type="number" min="1" max="31" value={deudaForm.diaVencimiento} onChange={(e) => setDeudaForm({ ...deudaForm, diaVencimiento: e.target.value })} /></label>
          </div>
          <button className="btn-primary" onClick={() => {
            if (!deudaForm.nombre.trim() || !deudaForm.identificador.trim()) { showToast("Nombre e identificador son obligatorios."); return; }
            if (data.deudas.some((d) => d.identificador === deudaForm.identificador.trim())) { showToast("Ese identificador ya existe — debe ser único."); return; }
            addItem("deudas", { ...deudaForm, identificador: deudaForm.identificador.trim(), ultimoPeriodoPagado: "", pagadoAcumulado: 0 });
            setDeudaForm(emptyDeudaCat);
          }}><Plus size={14} /> Agregar deuda</button>
          <ul className="dir-list" style={{ marginTop: 12 }}>
            {data.deudas.map((d) => (
              <li key={d.id}>
                <span><strong>{d.nombre}</strong> <span className="tag mono">{d.identificador}</span>
                  <div className="small muted">{MODALIDAD_LABEL[d.modalidad]} · capital {formatCOP(d.capital)} · {d.tasaInteres}% {d.tipoTasa} · cuota {formatCOP(d.cuotaMensual)} · vence día {d.diaVencimiento}</div>
                </span>
                <button className="icon-btn" onClick={() => removeItem("deudas", d.id)}><Trash2 size={14} /></button>
              </li>
            ))}
            {data.deudas.length === 0 && <li className="muted small">Sin deudas registradas. Recuerda: Colpatria e Itaú 6707 ahora viven como tarjetas en Medios de pago.</li>}
          </ul>
        </div>
      )}

      {fuenteSec === "terceros" && (
        <div className="form-card">
          <div className="section-title">Terceros</div>
          <div className="inline-form">
            <label>Nombre<input value={terceroForm.nombre} onChange={(e) => setTerceroForm({ ...terceroForm, nombre: e.target.value })} /></label>
            <label>Tipo
              <select value={terceroForm.tipo} onChange={(e) => setTerceroForm({ ...terceroForm, tipo: e.target.value })}>
                <option value="persona">Persona</option><option value="proveedor">Proveedor</option>
                <option value="banco">Banco</option><option value="frente">Frente</option><option value="otro">Otro</option>
              </select>
            </label>
            <label>Nota<input value={terceroForm.nota} onChange={(e) => setTerceroForm({ ...terceroForm, nota: e.target.value })} /></label>
            <button className="btn-primary" onClick={() => {
              if (!terceroForm.nombre.trim()) return;
              addItem("terceros", terceroForm); setTerceroForm({ nombre: "", tipo: "persona", nota: "" });
            }}><Plus size={14} /> Agregar</button>
          </div>
          <ul className="dir-list" style={{ marginTop: 12 }}>
            {data.terceros.map((t) => (
              <li key={t.id}>
                <span><EditableNombre item={t} onSave={(nombre) => updateItem("terceros", t.id, { nombre })} /> <span className="tag">{t.tipo}</span>
                  {t.nota && <div className="small muted">{t.nota}</div>}</span>
                <button className="icon-btn" onClick={() => removeItem("terceros", t.id)}><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fuenteSec === "medios" && (
        <div className="form-card">
          <div className="section-title">Medios de pago (catálogo)</div>
          <div className="inline-form">
            <label>Nombre<input value={medioForm.nombre} onChange={(e) => setMedioForm({ ...medioForm, nombre: e.target.value })} /></label>
            <label>Tipo
              <select value={medioForm.tipoMedio} onChange={(e) => setMedioForm({ ...medioForm, tipoMedio: e.target.value })}>
                <option value="tc">Tarjeta de crédito</option><option value="debito">Cuenta débito</option>
                <option value="efectivo">Efectivo</option><option value="gdm">GDM</option><option value="otro">Otro</option>
              </select>
            </label>
            {medioForm.tipoMedio === "tc" && (
              <label>Saldo deudor inicial<input type="number" value={medioForm.saldoInicial} onChange={(e) => setMedioForm({ ...medioForm, saldoInicial: e.target.value })} /></label>
            )}
            <button className="btn-primary" onClick={() => {
              if (!medioForm.nombre.trim()) return;
              addItem("mediosPago", { ...medioForm, saldoInicial: Number(medioForm.saldoInicial) || 0 });
              setMedioForm({ nombre: "", tipoMedio: "otro", saldoInicial: "" });
            }}><Plus size={14} /> Agregar</button>
          </div>
          <ul className="dir-list" style={{ marginTop: 12 }}>
            {data.mediosPago.map((m) => (
              <li key={m.id}>
                <span><EditableNombre item={m} onSave={(nombre) => updateItem("mediosPago", m.id, { nombre })} /> <span className="tag">{TIPO_MEDIO_LABEL[m.tipoMedio]}</span></span>
                <span className="row-actions">
                  {m.tipoMedio === "tc" && (
                    <span className="small muted">saldo inicial <input type="number" className="mini-num" value={m.saldoInicial} onChange={(e) => updateItem("mediosPago", m.id, { saldoInicial: e.target.value })} /></span>
                  )}
                  <button className="icon-btn" onClick={() => removeItem("mediosPago", m.id)}><Trash2 size={14} /></button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fuenteSec === "compartidos" && (
        <div className="form-card">
          <div className="section-title">Presupuesto de gastos compartidos con Paula</div>
          <div className="small muted" style={{ marginBottom: 8 }}>
            Total {formatCOP(compBudgetTotal)} · cuota por persona {formatCOP(compCuotaPersona)}
          </div>
          <ul className="dir-list">
            {data.compartidosCategorias.map((c) => (
              <li key={c.id}>
                <span>
                  <input className="edit-inline" value={c.label} onChange={(e) => setData((d) => ({ ...d, compartidosCategorias: d.compartidosCategorias.map((x) => x.id === c.id ? { ...x, label: e.target.value } : x) }))} />
                  <span className="tag">{c.tag}</span>
                </span>
                <span className="row-actions">
                  <input type="number" className="mini-num" value={c.budget} onChange={(e) => setData((d) => ({ ...d, compartidosCategorias: d.compartidosCategorias.map((x) => x.id === c.id ? { ...x, budget: Number(e.target.value) || 0 } : x) }))} />
                  <button className="icon-btn" onClick={() => setData((d) => ({ ...d, compartidosCategorias: d.compartidosCategorias.filter((x) => x.id !== c.id) }))}><Trash2 size={14} /></button>
                </span>
              </li>
            ))}
          </ul>
          <div className="inline-form small" style={{ marginTop: 10 }}>
            <input placeholder="Nueva categoría compartida" id="new-comp-cat" value={compForm._newCat || ""} onChange={(e) => setCompForm({ ...compForm, _newCat: e.target.value })} />
            <input type="number" placeholder="Presupuesto" value={compForm._newBudget || ""} onChange={(e) => setCompForm({ ...compForm, _newBudget: e.target.value })} />
            <button className="btn-secondary" onClick={() => {
              const label = (compForm._newCat || "").trim();
              if (!label) return;
              setData((d) => ({ ...d, compartidosCategorias: [...d.compartidosCategorias, { id: uid(), label, tag: "Personal", budget: Number(compForm._newBudget) || 0 }] }));
              setCompForm({ ...compForm, _newCat: "", _newBudget: "" });
            }}><Plus size={13} /> Agregar</button>
          </div>
        </div>
      )}
    </div>
  );

  // ================= RENDER: MOVIMIENTOS =================
  const renderMovimientos = () => (
    <div className="stack">
      <div className="form-card">
        <div className="section-title">Registrar movimiento</div>
        <div className="form-grid">
          <label>Fecha<input type="date" value={movForm.fecha} onChange={(e) => setMovForm({ ...movForm, fecha: e.target.value })} /></label>
          <label>Tipo
            <select value={movForm.tipo} onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value })}>
              <option value="gasto">Gasto</option><option value="ingreso">Ingreso</option>
            </select>
          </label>
          <label>Monto<input type="number" value={movForm.monto} onChange={(e) => setMovForm({ ...movForm, monto: e.target.value })} /></label>

          {movForm.tipo === "ingreso" && (
            <label>Fuente de ingreso
              <select value={movForm.fuenteIngresoId} onChange={(e) => setMovForm({ ...movForm, fuenteIngresoId: e.target.value })}>
                <option value="">Selecciona…</option>
                {data.ingresos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </label>
          )}

          <label>Tercero
            <SelectConOtro label="tercero" value={movForm.terceroId} onChange={(v) => setMovForm((f) => ({ ...f, terceroId: v }))}
              opciones={[...data.terceros].sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"))} placeholder="Selecciona…" onCrear={crearTercero} />
          </label>
          <label>Medio de pago
            <SelectConOtro label="medio de pago" value={movForm.medioPagoId} onChange={(v) => setMovForm((f) => ({ ...f, medioPagoId: v, cuentaOrigenId: "" }))}
              opciones={[...data.mediosPago].sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"))} placeholder="Selecciona…" onCrear={crearMedio} />
          </label>

          {esEfectivo && (
            <label>¿De qué cuenta salió el efectivo?
              <select value={movForm.cuentaOrigenId} onChange={(e) => setMovForm({ ...movForm, cuentaOrigenId: e.target.value })}>
                <option value="">Selecciona…</option>
                {data.mediosPago.filter((m) => m.tipoMedio === "debito" || m.tipoMedio === "gdm").map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </label>
          )}

          {movForm.tipo === "gasto" && (
            <>
              <label>Categoría
                <SelectConOtro label="categoría" value={movForm.categoriaId}
                  onChange={(v) => setMovForm((f) => ({ ...f, categoriaId: v, subcategoriaId: "", deudaId: "", abonoCapital: "", tarjetaPagoId: "" }))}
                  opciones={[...data.categorias].sort((a,b)=>a.nombre.localeCompare(b.nombre,"es")).map((c) => ({ id: c.id, nombre: c.nombre }))} placeholder="Selecciona…" onCrear={crearCategoria} />
              </label>
              {catSeleccionada && catSeleccionada.subcategorias.length > 0 && (
                <label>Subcategoría
                  <select value={movForm.subcategoriaId} onChange={(e) => setMovForm({ ...movForm, subcategoriaId: e.target.value })}>
                    <option value="">—</option>
                    {catSeleccionada.subcategorias.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </label>
              )}
            </>
          )}

          {esPagoDeuda && (
            <>
              {data.deudas.length === 0 ? (
                <div className="info-banner full" style={{ gridColumn: "1/-1" }}>
                  No hay deudas en el catálogo. Ve a <strong>Fuente → Deudas</strong> y agrega el crédito antes de registrar el pago.
                </div>
              ) : (
              <label>Identificador de crédito
                <select value={movForm.deudaId} onChange={(e) => {
                  const d = data.deudas.find((x) => x.id === e.target.value);
                  let abono = "";
                  if (d) {
                    const interes = Math.round((Number(d.capital) || 0) * tasaMensualEfectiva(d.tasaInteres, d.tipoTasa));
                    abono = d.modalidad === "solo_intereses" ? 0 : Math.max(0, (Number(movForm.monto) || 0) - interes);
                  }
                  setMovForm({ ...movForm, deudaId: e.target.value, abonoCapital: abono });
                }}>
                  <option value="">Selecciona…</option>
                  {[...data.deudas].sort((a,b)=>a.nombre.localeCompare(b.nombre,"es")).map((d) => <option key={d.id} value={d.id}>{d.identificador} — {d.nombre}</option>)}
                </select>
              </label>
              )}
              {deudaSeleccionada && (
                <label>Abono a capital
                  <input type="number" value={movForm.abonoCapital} onChange={(e) => setMovForm({ ...movForm, abonoCapital: e.target.value })} />
                  <span className="small muted">
                    Interés estimado del mes: {formatCOP(interesEstimado)} ({deudaSeleccionada.modalidad === "solo_intereses" ? "solo intereses: el capital no baja salvo que registres abono" : "el resto del pago se aplica a capital"})
                  </span>
                </label>
              )}
            </>
          )}

          {esPagoTC && (
            <label>¿Cuál tarjeta estás pagando?
              <select value={movForm.tarjetaPagoId} onChange={(e) => setMovForm({ ...movForm, tarjetaPagoId: e.target.value })}>
                <option value="">Selecciona…</option>
                {data.mediosPago.filter((m) => m.tipoMedio === "tc").map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre} (saldo {formatCOP(saldoTC(m.id))})</option>
                ))}
              </select>
            </label>
          )}

          {movForm.tipo === "gasto" && !esPagoDeuda && !esPagoTC && (
            <label className="checkbox-label full">
              <input type="checkbox" checked={movForm.compartido} onChange={(e) => setMovForm({ ...movForm, compartido: e.target.checked })} />
              ¿Es gasto compartido con Paula?
            </label>
          )}

          {movForm.compartido && (
            <>
              <label>¿Quién pagó?
                <select value={movForm.compartidoPagadoPor} onChange={(e) => setMovForm({ ...movForm, compartidoPagadoPor: e.target.value })}>
                  <option value="Eliana">Eliana</option><option value="Paula">Paula</option>
                </select>
              </label>
              <label>Este pago corresponde al…
                <select value={movForm.compartidoPorcentaje} onChange={(e) => setMovForm({ ...movForm, compartidoPorcentaje: e.target.value })}>
                  <option value={50}>50% del ítem</option><option value={100}>100% del ítem</option>
                </select>
              </label>
              <label>Categoría en Compartidos
                <SelectConOtro
                  label="categoría compartida"
                  value={movForm.compartidoCategoriaId}
                  onChange={(v) => setMovForm((f) => ({ ...f, compartidoCategoriaId: v }))}
                  opciones={[...data.compartidosCategorias].sort((a, b) => a.label.localeCompare(b.label, "es")).map((c) => ({ id: c.id, nombre: c.label }))}
                  placeholder="Selecciona…"
                  onCrear={(nombre) => {
                    const id = uid();
                    setData((d) => ({ ...d, compartidosCategorias: [...d.compartidosCategorias, { id, label: nombre, tag: "Personal", budget: 0 }] }));
                    return id;
                  }}
                />
              </label>
            </>
          )}

          <label className="full">Notas<input value={movForm.notas} onChange={(e) => setMovForm({ ...movForm, notas: e.target.value })} /></label>
        </div>

        {movForm.medioPagoId && movForm.tipo === "gasto" && (() => {
          const info = infoMedio(movForm, data.mediosPago);
          return (
            <div className={`preview-etiqueta ${info.color}`}>
              Este movimiento quedará marcado como{" "}
              {info.color === "verde" ? "salida real de caja (verde)" : info.esTC ? "causación con tarjeta de crédito — rojo, etiqueta TC (aumenta el saldo deudor de la tarjeta)" : info.esGDM ? "pagado por GDM — rojo, etiqueta GDM (genera cuenta por pagar a GDM)" : "otro medio"}
            </div>
          );
        })()}

        <button className="btn-primary" onClick={submitMovi}><Plus size={16} /> Guardar movimiento</button>
      </div>

      <div className="full-tbl">
        <table className="tbl">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Tercero</th><th>Medio</th><th>Categoría</th><th>Notas</th><th></th></tr></thead>
          <tbody>
            {[...data.movimientos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map((m) => {
              const info = infoMedio(m, data.mediosPago);
              return (
                <tr key={m.id}>
                  <td className="mono small">{m.fecha}</td>
                  <td>{m.tipo === "ingreso" ? <span className="tag-aldia">Ingreso</span> : <span className={`dot-etq ${info.color}`}>{info.etiqueta || (info.color === "verde" ? "Caja" : "Gasto")}</span>}</td>
                  <td className="mono">{formatCOP(m.monto)}</td>
                  <td>{nombreDe("terceros", m.terceroId) || "—"}</td>
                  <td className="small">{nombreDe("mediosPago", m.medioPagoId)}{m.cuentaOrigenId ? ` ← ${nombreDe("mediosPago", m.cuentaOrigenId)}` : ""}</td>
                  <td className="small">
                    {m.tipo === "gasto" ? catById(m.categoriaId)?.nombre || "—" : nombreDe("ingresos", m.fuenteIngresoId)}
                    {m.deudaId && <span className="tag mono">{nombreDe("deudas", m.deudaId, "identificador")}</span>}
                    {m.tarjetaPagoId && <span className="tag">{nombreDe("mediosPago", m.tarjetaPagoId)}</span>}
                    {m.compartido && <span className="tag">Compartido · pagó {m.compartidoPagadoPor} ({m.compartidoPorcentaje}%)</span>}
                  </td>
                  <td className="small muted">{m.notas}</td>
                  <td><button className="icon-btn" onClick={() => eliminarMovimiento(m.id)}><Trash2 size={14} /></button></td>
                </tr>
              );
            })}
            {data.movimientos.length === 0 && <tr><td colSpan={8} className="muted small" style={{ textAlign: "center", padding: 20 }}>Sin movimientos aún.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ================= RENDER: DEUDAS =================
  const renderDeudas = () => (
    <div className="stack">
      {deudasEnMora.length > 0 && (
        <div className="mora-banner">
          <strong><AlertTriangle size={14} style={{ verticalAlign: "-2px" }} /> Deudas en mora</strong>
          <ul>{deudasEnMora.map((d) => <li key={d.id}>{d.nombre} ({d.identificador}) — {d.diasMora} día(s) de mora, venció el {d.fechaVenc.toISOString().slice(0, 10)}</li>)}</ul>
        </div>
      )}
      <div className="info-banner">
        Aquí viven solo préstamos y créditos. Las tarjetas de crédito están en Medios de pago. Para registrar un pago, ve a Movimientos con la categoría "{CAT_PAGO_DEUDA}" y el identificador de crédito.
      </div>
      <div className="full-tbl">
        <table className="tbl">
          <thead><tr><th>Deuda</th><th>Identificador</th><th>Modalidad</th><th>Capital pendiente</th><th>Tasa</th><th>Cuota</th><th>Vence</th><th>Estado del mes</th><th></th></tr></thead>
          <tbody>
            {deudasConEstado.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.nombre}</strong></td>
                <td className="mono small">{d.identificador}</td>
                <td className="small">{d.modalidad === "solo_intereses" ? "Solo intereses" : "Cuota fija"}</td>
                <td className="mono">{formatCOP(d.capital)}</td>
                <td className="small">{d.tasaInteres}% {d.tipoTasa}</td>
                <td className="mono small">{formatCOP(d.cuotaMensual)}</td>
                <td className="small">día {d.diaVencimiento}</td>
                <td>
                  {d.estado === "pagada" && <span className="tag-aldia">Pagada</span>}
                  {d.estado === "pendiente" && <span className="tag-pendiente">Pendiente</span>}
                  {d.estado === "mora" && <span className="tag-mora">Mora {d.diasMora}d</span>}
                </td>
                <td className="row-actions">
                  <button className="btn-secondary small" onClick={() =>
                    updateItem("deudas", d.id, { ultimoPeriodoPagado: d.pagadoEstePeriodo ? "" : monthISO() })
                  }>{d.pagadoEstePeriodo ? "Marcar pendiente" : "Marcar pagada"}</button>
                </td>
              </tr>
            ))}
            {data.deudas.length === 0 && <tr><td colSpan={9} className="muted small" style={{ textAlign: "center", padding: 20 }}>Sin deudas en el catálogo — agrégalas en Fuente → Deudas.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="form-card">
        <div className="section-title">Simulador de pago óptimo</div>
        <div className="inline-form">
          <label>Abono extra mensual<input type="number" value={extraMensual} onChange={(e) => setExtraMensual(e.target.value)} /></label>
          <button className="btn-primary" onClick={() => {
            setSimResults({
              base: simulateDebtPayoff(data.deudas, 0, "avalancha"),
              avalancha: simulateDebtPayoff(data.deudas, extraMensual, "avalancha"),
              nieve: simulateDebtPayoff(data.deudas, extraMensual, "nieve"),
            });
          }}>Simular</button>
        </div>
        {simResults && (
          <div className="cards-row" style={{ marginTop: 12 }}>
            <div className="card"><div className="card-label">Sin abono extra</div>
              <div className="card-value">{simResults.base.terminó ? `${simResults.base.months} meses` : "No termina"}</div>
              <div className="small muted">Intereses: {formatCOP(simResults.base.totalInterest)}</div>
              {simResults.base.perpetuas.length > 0 && <div className="small brick">Solo intereses (perpetuas sin abono): {simResults.base.perpetuas.join(", ")}</div>}
            </div>
            <div className="card"><div className="card-label">Avalancha (mayor tasa primero)</div>
              <div className="card-value accent">{simResults.avalancha.terminó ? `${simResults.avalancha.months} meses` : "No termina"}</div>
              <div className="small muted">Intereses: {formatCOP(simResults.avalancha.totalInterest)}</div>
              <div className="small muted">Orden: {simResults.avalancha.payoffOrder.join(" → ") || "—"}</div>
            </div>
            <div className="card"><div className="card-label">Bola de nieve (menor saldo primero)</div>
              <div className="card-value gold">{simResults.nieve.terminó ? `${simResults.nieve.months} meses` : "No termina"}</div>
              <div className="small muted">Intereses: {formatCOP(simResults.nieve.totalInterest)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ================= RENDER: MEDIOS DE PAGO =================
  const renderMedios = () => {
    const tarjetas = data.mediosPago.filter((m) => m.tipoMedio === "tc");
    const debitos = data.mediosPago.filter((m) => m.tipoMedio === "debito");
    const gdm = data.mediosPago.find((m) => m.tipoMedio === "gdm");
    const detalleSalidas = (cuentaId) =>
      data.movimientos.filter((m) => {
        if (m.tipo !== "gasto") return false;
        if (m.medioPagoId === cuentaId && medioById(cuentaId)?.tipoMedio !== "efectivo") return true;
        return medioById(m.medioPagoId)?.tipoMedio === "efectivo" && m.cuentaOrigenId === cuentaId;
      });
    return (
      <div className="stack">
        <div className="section-title">Tarjetas de crédito</div>
        <div className="cards-row">
          {tarjetas.map((t) => {
            const saldo = saldoTC(t.id);
            return (
              <div className="card tc-card" key={t.id}>
                <div className="card-label">{t.nombre}</div>
                <div className={`card-value ${saldo > 0 ? "brick" : "accent"}`}>{formatCOP(saldo)}</div>
                <div className="small muted">Saldo deudor {saldo > 0 ? "(por pagar)" : "(al día)"}</div>
                {t.cuotaMinima && <div className="small muted">Cuota mín. ref.: {formatCOP(t.cuotaMinima)} · vence día {t.diaVencimiento}</div>}
              </div>
            );
          })}
        </div>
        <div className="card"><div className="card-label">Total comprometido con tarjetas</div><div className="card-value brick">{formatCOP(totalSaldoTC)}</div></div>

        <div className="section-title">Cuentas propias — de dónde ha salido la plata</div>
        {debitos.map((c) => {
          const movs = detalleSalidas(c.id);
          const total = movs.reduce((s, m) => s + (Number(m.monto) || 0), 0);
          const mes = movs.filter((m) => periodoDe(m.fecha) === selectedMonth).reduce((s, m) => s + (Number(m.monto) || 0), 0);
          const porCat = {};
          movs.forEach((m) => {
            const n = catById(m.categoriaId)?.nombre || "Sin categoría";
            porCat[n] = (porCat[n] || 0) + (Number(m.monto) || 0);
          });
          return (
            <div className="form-card" key={c.id}>
              <div className="cat-head">
                <strong>{c.nombre}</strong>
                <span className="mono">{formatCOP(mes)} este mes · {formatCOP(total)} acumulado</span>
              </div>
              <div className="subcats">
                {Object.entries(porCat).sort((a, b) => b[1] - a[1]).map(([n, v]) => (
                  <span className="chip" key={n}>{n}: {formatCOP(v)}</span>
                ))}
                {movs.length === 0 && <span className="small muted">Sin salidas registradas (incluye el efectivo retirado de esta cuenta).</span>}
              </div>
            </div>
          );
        })}

        <div className="section-title">GDM — cuenta por pagar</div>
        <div className="card">
          <div className="card-label">Lo que GDM ha pagado por ti (pendiente de devolver)</div>
          <div className={`card-value ${cxpGDM() > 0 ? "brick" : "accent"}`}>{formatCOP(cxpGDM())}</div>
          <div className="small muted">Se abona registrando en Movimientos un gasto con categoría "{CAT_PAGO_GDM}".</div>
        </div>
      </div>
    );
  };

  // ================= RENDER: COMPARTIDOS =================
  const renderCompartidos = () => {
    const dirMatch = data.compartidosDirectorio.find((d) => d.tercero.toLowerCase() === compForm.tercero.trim().toLowerCase());
    const catSugerida = dirMatch ? dirMatch.categoria : "";
    const pct = compBudgetTotal > 0 ? Math.min(100, (compGastadoTotal / compBudgetTotal) * 100) : 0;
    const saldoEliana = compCuotaPersona - pagadoEliana;
    const saldoPaula = compCuotaPersona - pagadoPaula;
    return (
      <div className="stack">
        <div className="comp-monthnav">
          <button className="icon-btn" onClick={() => setCompMonth(shiftMonth(compMonth, -1))}><ChevronLeft size={18} /></button>
          <strong style={{ textTransform: "capitalize" }}>{mesLabel(compMonth)}</strong>
          <button className="icon-btn" onClick={() => setCompMonth(shiftMonth(compMonth, 1))}><ChevronRight size={18} /></button>
        </div>

        <div className="form-card receipt">
          <div className="receipt-row"><span className="rlabel">Presupuesto del mes</span><span className="mono">{formatCOP(compBudgetTotal)}</span></div>
          <div className="receipt-row"><span className="rlabel">Aporte por persona (50%)</span><span className="mono">{formatCOP(compCuotaPersona)}</span></div>
          <div className="receipt-row"><span className="rlabel">Gastado</span><span className="mono">{formatCOP(compGastadoTotal)}</span></div>
          <div className="receipt-row"><span className="rlabel">Disponible</span><span className={`mono ${compBudgetTotal - compGastadoTotal < 0 ? "brick" : "accent"}`}>{formatCOP(compBudgetTotal - compGastadoTotal)}</span></div>
          <div className="segbar-track" style={{ marginTop: 8 }}>
            <div className="segbar-seg" style={{ width: `${pct}%`, background: pct >= 100 ? SEG_COLORS.tc : SEG_COLORS.verde }} />
          </div>
        </div>

        <div className="cards-row">
          <div className="card"><div className="card-label">Ha pagado Eliana</div><div className="card-value">{formatCOP(pagadoEliana)}</div>
            <div className={`small ${saldoEliana > 0 ? "muted" : "accent"}`}>{saldoEliana > 0 ? `Le falta ${formatCOP(saldoEliana)} de su cuota` : `Cubrió su cuota (+${formatCOP(-saldoEliana)})`}</div></div>
          <div className="card"><div className="card-label">Ha pagado Paula</div><div className="card-value">{formatCOP(pagadoPaula)}</div>
            <div className={`small ${saldoPaula > 0 ? "muted" : "accent"}`}>{saldoPaula > 0 ? `Le falta ${formatCOP(saldoPaula)} de su cuota` : `Cubrió su cuota (+${formatCOP(-saldoPaula)})`}</div></div>
          <div className="card"><div className="card-label">Cuenta corriente del mes</div>
            <div className="card-value gold">{pagadoEliana === pagadoPaula ? "Parejas" : pagadoEliana > pagadoPaula ? `Paula debe ${formatCOP((pagadoEliana - pagadoPaula) / 2)}` : `Eliana debe ${formatCOP((pagadoPaula - pagadoEliana) / 2)}`}</div>
            <div className="small muted">Balance acumulado del mes sobre split 50/50</div></div>
        </div>

        {compAlertas.length > 0 && (
          <div className="mora-banner">
            <strong>Alertas de presupuesto</strong>
            <ul>{compAlertas.map((a) => (
              <li key={a.cat.id}>{a.cat.label}: {a.pct >= 100 ? "superó" : "va en"} {Math.round(a.pct)}% ({formatCOP(a.spent)} de {formatCOP(a.cat.budget)})</li>
            ))}</ul>
          </div>
        )}

        <div className="form-card">
          <div className="section-title">Registrar gasto compartido</div>
          <div className="form-grid">
            <label>Fecha<input type="date" value={compForm.fecha} onChange={(e) => setCompForm({ ...compForm, fecha: e.target.value })} /></label>
            <label>Monto<input type="number" value={compForm.monto} onChange={(e) => setCompForm({ ...compForm, monto: e.target.value })} /></label>
            <label>Tercero
              <input list="comp-terceros" placeholder="Ej. Carrefour, EPM, Doña Alba" value={compForm.tercero}
                onChange={(e) => {
                  const v = e.target.value;
                  const match = data.compartidosDirectorio.find((d) => d.tercero.toLowerCase() === v.trim().toLowerCase());
                  setCompForm({ ...compForm, tercero: v, categoria: match ? match.categoria : compForm.categoria });
                }} />
              <datalist id="comp-terceros">
                {data.compartidosDirectorio.map((d) => <option key={d.tercero} value={d.tercero} />)}
              </datalist>
            </label>
            <label>Categoría {catSugerida && <span className="small accent">(aprendida)</span>}
              <select value={compForm.categoria} onChange={(e) => setCompForm({ ...compForm, categoria: e.target.value })}>
                <option value="">Selecciona…</option>
                {data.compartidosCategorias.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label>¿Quién pagó?
              <select value={compForm.pagadoPor} onChange={(e) => setCompForm({ ...compForm, pagadoPor: e.target.value })}>
                <option value="Eliana">Eliana</option><option value="Paula">Paula</option>
              </select>
            </label>
            <label>Corresponde al…
              <select value={compForm.porcentaje} onChange={(e) => setCompForm({ ...compForm, porcentaje: e.target.value })}>
                <option value={50}>50% del ítem</option><option value={100}>100% del ítem</option>
              </select>
            </label>
            <label className="full">Descripción<input value={compForm.descripcion} onChange={(e) => setCompForm({ ...compForm, descripcion: e.target.value })} /></label>
          </div>
          <div className="small muted" style={{ marginBottom: 8 }}>
            Si el gasto lo pagaste tú desde tus cuentas, regístralo mejor en Movimientos con el checkbox de compartido — aparecerá aquí automáticamente.
          </div>
          <button className="btn-primary" onClick={() => {
            if (!compForm.monto || !compForm.categoria) { showToast("Falta monto o categoría."); return; }
            guardarCompartido({
              id: uid(), movId: null, date: compForm.fecha, amount: Number(compForm.monto) || 0,
              tercero: compForm.tercero.trim() || "—", category: compForm.categoria,
              description: compForm.descripcion || "", paidBy: compForm.pagadoPor,
              porcentaje: Number(compForm.porcentaje) || 100, medioPago: "", loggedAt: new Date().toISOString(),
            });
            setCompForm({ ...compForm, monto: "", tercero: "", categoria: "", descripcion: "" });
            showToast("Gasto compartido registrado.");
          }}><Plus size={14} /> Guardar</button>
        </div>

        <div className="section-title">Por categoría</div>
        <div className="stack">
          {data.compartidosCategorias.map((c) => {
            const spent = compSpentByCat[c.id] || 0;
            return (
              <SegmentedBar key={c.id} titulo={c.label} total={Number(c.budget) || 0}
                segmentos={spent > 0 ? [{ tipo: spent / (c.budget || 1) >= 1 ? "tc" : "verde", etiqueta: "", label: c.label, monto: spent }] : []}
                excedente={Math.max(0, spent - (Number(c.budget) || 0))} />
            );
          })}
        </div>

        <div className="section-title">Historial del mes</div>
        <div className="full-tbl">
          <table className="tbl">
            <thead><tr><th>Fecha</th><th>Tercero</th><th>Categoría</th><th>Monto</th><th>%</th><th>Pagó</th><th>Descripción</th><th></th></tr></thead>
            <tbody>
              {[...compGastosMes].sort((a, b) => (a.date < b.date ? 1 : -1)).map((g) => (
                <tr key={g.id}>
                  <td className="mono small">{g.date}</td>
                  <td>{g.tercero}</td>
                  <td className="small">{data.compartidosCategorias.find((c) => c.id === g.category)?.label || g.category}</td>
                  <td className="mono">{formatCOP(g.amount)}</td>
                  <td className="small">{g.porcentaje || 100}%</td>
                  <td><span className="tag">{g.paidBy}</span>{g.movId && <span className="tag">de Movimientos</span>}</td>
                  <td className="small muted">{g.description}</td>
                  <td><button className="icon-btn" onClick={() => setData((prev) => ({ ...prev, compartidosGastos: prev.compartidosGastos.filter((x) => x.id !== g.id) }))}><Trash2 size={14} /></button></td>
                </tr>
              ))}
              {compGastosMes.length === 0 && <tr><td colSpan={8} className="muted small" style={{ textAlign: "center", padding: 20 }}>Sin gastos este mes.</td></tr>}
            </tbody>
          </table>
        </div>

        <button className="btn-secondary" onClick={() => setCompSettingsOpen(!compSettingsOpen)}>
          {compSettingsOpen ? "Ocultar directorio" : "Ver directorio tercero ↔ categoría"}
        </button>
        {compSettingsOpen && (
          <div className="form-card">
            <div className="section-title">Directorio aprendido</div>
            <ul className="dir-list">
              {data.compartidosDirectorio.map((d, i) => (
                <li key={i}>
                  <span>{d.tercero} <span className="tag">{data.compartidosCategorias.find((c) => c.id === d.categoria)?.label || d.categoria}</span></span>
                  <button className="icon-btn" onClick={() => setData((prev) => ({ ...prev, compartidosDirectorio: prev.compartidosDirectorio.filter((_, j) => j !== i) }))}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
            <div className="small muted" style={{ marginTop: 8 }}>Los presupuestos por categoría se editan en Fuente → Compartidos.</div>
          </div>
        )}
      </div>
    );
  };

  // ================= RENDER: PANORAMA =================
  const renderPanorama = () => {
    const barras = [
      { titulo: "Fijo-fijo", total: presupuestoPorTipo("Fijo-Fijo"), seg: segmentosPorTipo("Fijo-Fijo") },
      { titulo: "Fijo-variable", total: presupuestoPorTipo("Fijo-Variable"), seg: segmentosPorTipo("Fijo-Variable") },
      { titulo: "Variable-prescindible", total: presupuestoPorTipo("Variable-Prescindible"), seg: segmentosPorTipo("Variable-Prescindible") },
      { titulo: "Deudas (cuotas del mes)", total: cuotasDeudasActivas, seg: segDeudas },
    ];
    return (
      <div className="stack">
        <div className="row-top">
          <div className="updated-at">{fechaUltimoMov ? `Actualizado al ${fechaUltimoMov}` : "Sin movimientos aún"}</div>
          <label className="month-picker">Mes <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} /></label>
        </div>

        {deudasEnMora.length > 0 && (
          <div className="mora-banner">
            <strong><AlertTriangle size={14} style={{ verticalAlign: "-2px" }} /> Tienes {deudasEnMora.length} deuda(s) en mora</strong>
            <ul>{deudasEnMora.map((d) => <li key={d.id}>{d.nombre} — {d.diasMora} día(s)</li>)}</ul>
          </div>
        )}

        <div className="cards-row">
          <div className="card"><div className="card-label">Ingresos del mes</div><div className="card-value accent">{formatCOP(ingresosMes)}</div></div>
          <div className="card"><div className="card-label">Salidas reales de caja</div><div className="card-value">{formatCOP(salidasCajaMes)}</div></div>
          <div className="card"><div className="card-label">Comprometido con tarjetas (saldo deudor)</div><div className="card-value brick">{formatCOP(totalSaldoTC)}</div></div>
          <div className="card"><div className="card-label">Disponible real</div>
            <div className={`card-value ${disponibleReal < 0 ? "brick" : "accent"}`}>{formatCOP(disponibleReal)}</div>
            <div className="small muted">Ingresos − caja − compromiso TC</div></div>
          <div className="card"><div className="card-label">Cuenta por pagar a GDM</div><div className={`card-value ${cxpGDM() > 0 ? "brick" : "accent"}`}>{formatCOP(cxpGDM())}</div></div>
        </div>

        <div className="leyenda small muted">
          <span><i className="dot" style={{ background: SEG_COLORS.verde }} /> Cuentas propias</span>
          <span><i className="dot" style={{ background: SEG_COLORS.tc }} /> Tarjeta de crédito (TC)</span>
          <span><i className="dot" style={{ background: SEG_COLORS.gdm }} /> Pagado por GDM</span>
          <span className="muted">· Toca un segmento para ver el detalle</span>
        </div>

        {barras.map((b) => (
          <SegmentedBar key={b.titulo} titulo={b.titulo} total={b.total} segmentos={b.seg}
            excedente={Math.max(0, b.seg.reduce((s, x) => s + x.monto, 0) - b.total)}
            onSegmentClick={(s) => setSegDetail({ barra: b.titulo, ...s })} />
        ))}

        {segDetail && (
          <div className="form-card">
            <div className="cat-head">
              <strong>{segDetail.barra} — {segDetail.label} ({formatCOP(segDetail.monto)})</strong>
              <button className="icon-btn" onClick={() => setSegDetail(null)}><X size={14} /></button>
            </div>
            <table className="tbl">
              <tbody>
                {segDetail.movs.map((m) => (
                  <tr key={m.id}>
                    <td className="mono small">{m.fecha}</td>
                    <td className="small">{catById(m.categoriaId)?.nombre}</td>
                    <td>{nombreDe("terceros", m.terceroId) || "—"}</td>
                    <td className="small">{nombreDe("mediosPago", m.medioPagoId)}</td>
                    <td className="mono">{formatCOP(m.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ================= RENDER: METAS =================
  const renderMetas = () => {
    const deudasOrdenadas = [...data.deudas]
      .filter((d) => Number(d.capital) > 0)
      .sort((a, b) => tasaMensualEfectiva(b.tasaInteres, b.tipoTasa) - tasaMensualEfectiva(a.tasaInteres, a.tipoTasa));
    return (
      <div className="stack">
        {deudasOrdenadas.length > 0 && (
          <div className="info-banner">
            <strong>Sugerencia avalancha:</strong> para minimizar el costo financiero, abona primero a{" "}
            <strong>{deudasOrdenadas[0].nombre}</strong> ({deudasOrdenadas[0].tasaInteres}% {deudasOrdenadas[0].tipoTasa}
            {deudasOrdenadas[0].modalidad === "solo_intereses" ? ", solo intereses: cada abono a capital reduce el costo perpetuo" : ""}).
            {deudasOrdenadas.length > 1 && <> Orden completo: {deudasOrdenadas.map((d) => d.nombre).join(" → ")}.</>}
            {" "}Corre el simulador en Deudas para ver meses e intereses ahorrados.
          </div>
        )}
        <div className="form-card">
          <div className="section-title">Nueva meta</div>
          <div className="form-grid">
            <label>Nombre<input value={metaForm.nombre} onChange={(e) => setMetaForm({ ...metaForm, nombre: e.target.value })} /></label>
            <label>Monto objetivo<input type="number" value={metaForm.montoObjetivo} onChange={(e) => setMetaForm({ ...metaForm, montoObjetivo: e.target.value })} /></label>
            <label>Ahorrado hasta ahora<input type="number" value={metaForm.montoAhorrado} onChange={(e) => setMetaForm({ ...metaForm, montoAhorrado: e.target.value })} /></label>
            <label>Plazo<input type="date" value={metaForm.plazo} onChange={(e) => setMetaForm({ ...metaForm, plazo: e.target.value })} /></label>
            <label>Prioridad
              <select value={metaForm.prioridad} onChange={(e) => setMetaForm({ ...metaForm, prioridad: e.target.value })}>
                <option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option>
              </select>
            </label>
          </div>
          <button className="btn-primary" onClick={() => {
            if (!metaForm.nombre.trim() || !metaForm.montoObjetivo) return;
            addItem("metas", metaForm); setMetaForm(emptyMeta);
          }}><Plus size={16} /> Agregar meta</button>
        </div>
        <div className="metas-grid">
          {data.metas.map((m) => {
            const deuda = m.deudaId ? data.deudas.find((d) => d.id === m.deudaId) : null;
            const objetivo = deuda ? Number(deuda.capital) + Number(deuda.pagadoAcumulado || 0) : Number(m.montoObjetivo);
            const avance = deuda ? Number(deuda.pagadoAcumulado || 0) : Number(m.montoAhorrado);
            const pct = objetivo > 0 ? Math.min(100, (avance / objetivo) * 100) : 0;
            return (
              <div className="meta-card" key={m.id}>
                <div className="meta-info">
                  <strong>{m.nombre}</strong>
                  {deuda && <span className="tag mono">{deuda.identificador} · {deuda.tasaInteres}% {deuda.tipoTasa}</span>}
                  <div className="segbar-track small-track">
                    <div className="segbar-seg" style={{ width: `${pct}%`, background: SEG_COLORS.verde }} />
                  </div>
                  <div className="muted small">{formatCOP(avance)} de {formatCOP(objetivo)} ({Math.round(pct)}%)</div>
                  {m.plazo && <div className="muted small">Plazo: {m.plazo}</div>}
                  {!deuda && (
                    <input type="number" className="mini-input" value={m.montoAhorrado}
                      onChange={(e) => updateItem("metas", m.id, { montoAhorrado: e.target.value })} />
                  )}
                  {deuda && <div className="small muted">Avanza automáticamente con los pagos registrados a esta deuda.</div>}
                </div>
                <button className="icon-btn" onClick={() => removeItem("metas", m.id)}><Trash2 size={14} /></button>
              </div>
            );
          })}
          {data.metas.length === 0 && <div className="empty">Aún no registras metas — casa, viajes, buceo, emprendimiento…</div>}
        </div>
      </div>
    );
  };

  // ================= LAYOUT =================
  return (
    <div className="app-root">
      <style>{CSS}</style>
      <header className="app-header">
        <div>
          <div className="eyebrow">Finanzas personales</div>
          <h1>Eliana Posada</h1>
          <div className="small muted">{fechaUltimoMov ? `Actualizado al ${fechaUltimoMov}` : "Sin movimientos aún"}</div>
        </div>
        <div className="header-actions">
          <div className="header-sub">Tus datos se guardan solo para ti en este artifact</div>
          <button className="btn-secondary export-btn" onClick={exportToExcel}><Download size={14} /> Exportar a Excel</button>
        </div>
      </header>

      <nav className="tabbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <Icon size={16} />{t.label}
            </button>
          );
        })}
      </nav>

      <main className="app-main">
        {tab === "fuente" && renderFuente()}
        {tab === "movimientos" && renderMovimientos()}
        {tab === "deudas" && renderDeudas()}
        {tab === "medios" && renderMedios()}
        {tab === "compartidos" && renderCompartidos()}
        {tab === "panorama" && renderPanorama()}
        {tab === "metas" && renderMetas()}
      </main>

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

// Nombre editable en línea (crear/renombrar catálogos desde Fuente)
function EditableNombre({ item, onSave, bold }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(item.nombre);
  if (editing) {
    return (
      <span className="otro-inline">
        <input autoFocus value={v} onChange={(e) => setV(e.target.value)} />
        <button className="icon-btn" onClick={() => { if (v.trim()) onSave(v.trim()); setEditing(false); }}><Check size={13} /></button>
        <button className="icon-btn" onClick={() => { setV(item.nombre); setEditing(false); }}><X size={13} /></button>
      </span>
    );
  }
  return (
    <span>
      {bold ? <strong>{item.nombre}</strong> : item.nombre}{" "}
      <button className="icon-btn" title="Renombrar" onClick={() => { setV(item.nombre); setEditing(true); }}><Pencil size={12} /></button>
    </span>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.app-root {
  --bg: #F1F3EC; --surface: #FFFFFF; --surface-alt: #E7EBDF;
  --ink: #1F2E28; --ink-soft: #55605A;
  --accent: #2F5D50; --accent-soft: #DCE6DE;
  --gold: #C48A2E; --brick: #A34A3D; --border: #D8DCCF;
  font-family: 'IBM Plex Sans', sans-serif; color: var(--ink); background: var(--bg);
  min-height: 100%; padding: 20px; border-radius: 12px;
}
.loading { padding: 40px; text-align: center; color: var(--ink-soft); }
.mono { font-family: 'IBM Plex Mono', monospace; }
.app-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); font-weight: 600; }
.app-header h1 { font-family: 'Fraunces', serif; font-size: 28px; margin: 2px 0 0; font-weight: 600; }
.header-sub { font-size: 12px; color: var(--ink-soft); }
.header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.export-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; }

.tabbar { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; border: 1px solid transparent; background: transparent; color: var(--ink-soft); font-size: 13px; font-weight: 500; cursor: pointer; }
.tab-btn.active { background: var(--accent); color: white; }
.tab-btn:not(.active):hover { background: var(--surface-alt); }

.app-main { padding-bottom: 20px; }
.stack { display: flex; flex-direction: column; gap: 16px; }
.section-title { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; margin-bottom: 8px; }

.cards-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
.card-label { font-size: 11px; color: var(--ink-soft); margin-bottom: 6px; }
.card-value { font-family: 'IBM Plex Mono', monospace; font-size: 19px; font-weight: 500; }
.card-value.accent { color: var(--accent); } .card-value.brick { color: var(--brick); } .card-value.gold { color: var(--gold); }
.tc-card { border-left: 4px solid var(--brick); }

.row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 8px; }
.updated-at { font-family: 'IBM Plex Mono', monospace; font-size: 13px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 5px 14px; }
.month-picker { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-soft); }
.month-picker input { border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-family: inherit; }

.segbar-block { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
.segbar-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px; }
.segbar-track { display: flex; height: 22px; background: var(--surface-alt); border-radius: 999px; overflow: hidden; }
.small-track { height: 10px; margin: 4px 0; }
.segbar-seg { height: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: width 0.5s ease; min-width: 0; }
.segbar-seg:hover { filter: brightness(1.12); }
.seg-tag { font-size: 9px; color: white; font-weight: 600; letter-spacing: 0.05em; }
.leyenda { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
.leyenda .dot { display: inline-block; width: 10px; height: 10px; border-radius: 999px; margin-right: 4px; vertical-align: -1px; }

.dot-etq { padding: 2px 8px; border-radius: 999px; font-size: 10px; text-transform: uppercase; color: white; }
.dot-etq.verde { background: #2F5D50; } .dot-etq.rojo { background: #A34A3D; } .dot-etq.neutro { background: #9AA398; }

.preview-etiqueta { border-radius: 8px; padding: 8px 12px; font-size: 12px; margin-bottom: 10px; }
.preview-etiqueta.verde { background: var(--accent-soft); border: 1px solid var(--accent); }
.preview-etiqueta.rojo { background: #F7E3DF; border: 1px solid var(--brick); }
.preview-etiqueta.neutro { background: var(--surface-alt); border: 1px solid var(--border); }

.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl td, .tbl th { padding: 7px 8px; border-bottom: 1px solid var(--border); text-align: left; }
.tbl th { font-size: 11px; text-transform: uppercase; color: var(--ink-soft); font-weight: 600; }
.full-tbl { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: auto; }
.accent { color: var(--accent); } .brick { color: var(--brick); } .muted { color: var(--ink-soft); } .small { font-size: 11px; }
.empty { padding: 20px; text-align: center; color: var(--ink-soft); background: var(--surface-alt); border-radius: 10px; font-size: 13px; }

.form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px; }
.form-grid label, .inline-form label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--ink-soft); }
.form-grid .full { grid-column: 1 / -1; }
.checkbox-label { flex-direction: row !important; align-items: center; gap: 6px !important; }
input, select { font-family: inherit; padding: 7px 9px; border-radius: 7px; border: 1px solid var(--border); background: white; font-size: 13px; color: var(--ink); }
.mini-input { width: 100%; margin-top: 6px; }
.mini-num { width: 110px; padding: 4px 6px; font-size: 12px; }
.edit-inline { border: none; background: transparent; font-size: 13px; padding: 2px 0; border-bottom: 1px dashed var(--border); border-radius: 0; }
.link-btn { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 11px; text-decoration: underline; padding: 0; }

.btn-primary { display: flex; align-items: center; gap: 6px; background: var(--accent); color: white; border: none; padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; width: fit-content; }
.btn-primary:hover { opacity: 0.9; }
.btn-secondary { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 7px; padding: 7px 9px; cursor: pointer; font-size: 12px; }
.icon-btn { background: transparent; border: none; color: var(--ink-soft); cursor: pointer; padding: 4px; border-radius: 6px; }
.icon-btn:hover { background: var(--surface-alt); color: var(--brick); }

.pill-nav { display: flex; gap: 6px; flex-wrap: wrap; }
.pill { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); font-size: 12px; cursor: pointer; color: var(--ink-soft); }
.pill.active { background: var(--ink); color: white; border-color: var(--ink); }

.info-banner { background: var(--accent-soft); border: 1px solid var(--accent); color: var(--ink); border-radius: 8px; padding: 10px 12px; font-size: 12px; }
.mora-banner { background: #F7E3DF; border: 1px solid var(--brick); color: var(--ink); border-radius: 8px; padding: 12px 14px; font-size: 13px; }
.mora-banner ul { margin: 6px 0 0; padding-left: 18px; }
.tag-mora { background: var(--brick); color: white; padding: 2px 8px; border-radius: 999px; font-size: 10px; text-transform: uppercase; }
.tag-aldia { background: var(--accent-soft); color: var(--accent); padding: 2px 8px; border-radius: 999px; font-size: 10px; text-transform: uppercase; }
.tag-pendiente { background: #F2E7D5; color: #8A6A2F; padding: 2px 8px; border-radius: 999px; font-size: 10px; text-transform: uppercase; }
.row-actions { display: flex; gap: 6px; align-items: center; }

.inline-form { display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end; }
.inline-form.small { margin-top: 8px; }
.inline-form input, .inline-form select { flex: 1; min-width: 120px; }
.otro-inline { display: flex; gap: 4px; align-items: center; }
.otro-inline input { flex: 1; min-width: 100px; }

.dir-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.dir-list li { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 13px; flex-wrap: wrap; gap: 6px; }
.tag { font-size: 10px; text-transform: uppercase; background: var(--surface-alt); color: var(--ink-soft); padding: 2px 7px; border-radius: 999px; margin-left: 6px; }

.cat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.cat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.cat-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 6px; }
.subcats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.chip { background: var(--surface-alt); border-radius: 999px; padding: 3px 8px; font-size: 11px; display: flex; align-items: center; gap: 4px; }
.chip button { background: none; border: none; cursor: pointer; color: var(--ink-soft); font-size: 13px; line-height: 1; }

.metas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.meta-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; display: flex; align-items: flex-start; gap: 12px; position: relative; }
.meta-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.meta-card .icon-btn { position: absolute; top: 8px; right: 8px; }

.comp-monthnav { display: flex; align-items: center; justify-content: center; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; width: fit-content; margin: 0 auto; }
.receipt { font-size: 13px; }
.receipt-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed var(--border); }
.receipt-row:last-of-type { border-bottom: none; }
.rlabel { color: var(--ink-soft); }

.toast { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); background: var(--ink); color: white; padding: 9px 18px; border-radius: 999px; font-size: 13px; opacity: 0; transition: opacity 0.25s; pointer-events: none; z-index: 50; }
.toast.show { opacity: 1; }

.sistema-cats-panel { border: 1px dashed var(--border); border-radius: 10px; padding: 12px 14px; background: var(--surface-alt); margin-top: 8px; }
.sistema-cats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 8px; }
.sistema-cat-item { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; }
.sistema-cat-item strong { display: block; margin-bottom: 4px; font-size: 13px; }

@media (max-width: 640px) {
  .app-header { flex-direction: column; align-items: flex-start; }
  .header-actions { align-items: flex-start; }
}
`;
