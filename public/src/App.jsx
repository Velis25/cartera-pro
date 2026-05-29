import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATOS INICIALES ──────────────────────────────────────────────────────────
const INITIAL_HISTORY = [
  {id:1, date:"2024-09-17",time:"14:42",ticker:"NVDA",name:"NVIDIA",type:"COMPRA",shares:0.094002,price:106.38,fee:1.0,broker:"Trade Republic"},
  {id:2, date:"2024-09-17",time:"14:47",ticker:"AMZN",name:"Amazon",type:"COMPRA",shares:0.059687,price:167.54,fee:1.0,broker:"Trade Republic"},
  {id:3, date:"2024-09-17",time:"14:53",ticker:"MSFT",name:"Microsoft",type:"COMPRA",shares:0.025329,price:394.80,fee:1.0,broker:"Trade Republic"},
  {id:50,date:"2025-04-29",time:"10:37",ticker:"NET1",name:"Nueva Exp. Textil (MyInvestor)",type:"COMPRA",shares:600,price:0.44,fee:4.23,broker:"MyInvestor",note:"Comisión 0,12% (€2) + Cánones BME (€2,23)"},
  {id:51,date:"2025-11-17",time:"13:46",ticker:"NET1",name:"Nueva Exp. Textil (MyInvestor)",type:"VENTA",shares:600,price:0.781,fee:4.22,broker:"MyInvestor",
   isClosed:true,sellDate:"2025-11-17",sellTime:"13:46",fiscalYear:2025,
   buys:[{date:"2025-04-29",time:"10:37",shares:600,price:0.44,fee:4.23}],
   note:"MyInvestor · Comisión 0,12% (€3) + Cánones BME (€1,22). Precio medio: €470,40÷600=€0,784/acc",
   profitBruto:207.00,profitNeto:198.55,profitPct:78.54,profitPctNeto:74.12,taxBase:198.55,taxAmount:37.72,profitAfterTax:160.83,profitPctAfterTax:60.03},
  {id:52,date:"2025-05-19",time:"15:14",ticker:"BABA",name:"Alibaba Group (MyInvestor)",type:"COMPRA",shares:4,price:122.62,fee:2.24,broker:"MyInvestor",currency:"USD",brokerEURAmount:439.79,note:"TC 0,8926 · Neto $492,72 → €439,79"},
  {id:53,date:"2026-01-28",time:"11:07",ticker:"BABA",name:"Alibaba Group (MyInvestor)",type:"VENTA",shares:4,price:175.64,fee:3.59,broker:"MyInvestor",
   isClosed:true,sellDate:"2026-01-28",sellTime:"11:07",fiscalYear:2026,currency:"USD",brokerEURAmount:583.27,
   buys:[{date:"2025-05-19",time:"15:14",shares:4,price:122.62,fee:2.24,brokerEURAmount:439.79,note:"TC 0,8926"}],
   note:"MyInvestor · $702,54 bruto · Comisión $3,59 · TC 0,8345 · Recibido €583,27",
   profitBruto:143.48,profitNeto:138.51,profitPct:32.62,profitPctNeto:31.49,taxBase:138.51,taxAmount:26.32,profitAfterTax:112.19,profitPctAfterTax:25.51},
  {id:54,date:"2025-04-29",time:"09:30",ticker:"TTWO",name:"Take-Two Interactive (MyInvestor)",type:"COMPRA",shares:1,price:225.20,fee:2.27,broker:"MyInvestor",currency:"USD",brokerEURAmount:199.98,note:"TC 0,8791 · Neto $227,47 → €199,98"},
  {id:55,date:"2026-05-14",time:"11:07",ticker:"TTWO",name:"Take-Two Interactive (MyInvestor)",type:"VENTA",shares:1,price:245.36,fee:3.52,broker:"MyInvestor",
   isClosed:true,sellDate:"2026-05-14",sellTime:"11:07",fiscalYear:2026,currency:"USD",brokerEURAmount:206.44,
   buys:[{date:"2025-04-29",time:"09:30",shares:1,price:225.20,fee:2.27,brokerEURAmount:199.98,note:"TC 0,8791"}],
   note:"MyInvestor · $245,36 bruto · Comisión $3,52 · TC 0,8536 · Recibido €206,44",
   profitBruto:6.46,profitNeto:1.46,profitPct:3.23,profitPctNeto:0.73,taxBase:1.46,taxAmount:0.28,profitAfterTax:1.18,profitPctAfterTax:0.59},
  {id:4, date:"2026-01-21",time:"09:26",ticker:"NET1",name:"Nueva Exp. Textil",type:"COMPRA",shares:1149.425287,price:0.87,fee:1.0,broker:"Trade Republic"},
  {id:5, date:"2026-01-22",time:"15:35",ticker:"NFLX",name:"Netflix",type:"COMPRA",shares:6.951202,price:71.92,fee:1.0,broker:"Trade Republic"},
  {id:6, date:"2026-01-27",time:"15:57",ticker:"ASTS",name:"AST SpaceMobile",type:"COMPRA",shares:6,price:87.50,fee:1.0,broker:"Trade Republic"},
  {id:7, date:"2026-01-30",time:"10:09",ticker:"PHAG",name:"Physical Silver",type:"COMPRA",shares:5,price:82.086,fee:1.0,broker:"Trade Republic"},
  {id:8, date:"2026-01-30",time:"11:08",ticker:"PHAG",name:"Physical Silver",type:"COMPRA",shares:2,price:77.50,fee:1.0,broker:"Trade Republic"},
  {id:9, date:"2026-02-04",time:"17:39",ticker:"ASTS",name:"AST SpaceMobile",type:"COMPRA",shares:3,price:85.00,fee:1.0,broker:"Trade Republic"},
  {id:10,date:"2026-02-05",time:"09:12",ticker:"PHAG",name:"Physical Silver",type:"COMPRA",shares:3.840245,price:64.966,fee:1.0,broker:"Trade Republic"},
  {id:11,date:"2026-02-05",time:"15:23",ticker:"HIMS",name:"Hims & Hers",type:"COMPRA",shares:21.312872,price:23.48,fee:1.0,broker:"Trade Republic"},
  {id:12,date:"2026-02-09",time:"21:57",ticker:"NVDA",name:"NVIDIA",type:"VENTA",shares:0.094002,price:159.54,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-02-09",sellTime:"21:57",fiscalYear:2026,
   buys:[{date:"2024-09-17",time:"14:42",shares:0.094002,price:106.38,fee:1.0}],
   profitBruto:4.00,profitNeto:2.00,profitPct:36.36,profitPctNeto:18.18,taxBase:3.00,taxAmount:0.57,profitAfterTax:1.43,profitPctAfterTax:13.00},
  {id:13,date:"2026-03-06",time:"19:13",ticker:"NFLX",name:"Netflix",type:"VENTA",shares:6.951202,price:84.75,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-03-06",sellTime:"19:13",fiscalYear:2026,
   buys:[{date:"2026-01-22",time:"15:35",shares:6.951202,price:71.92,fee:1.0}],
   profitBruto:88.18,profitNeto:86.18,profitPct:17.60,profitPctNeto:17.20,taxBase:87.18,taxAmount:16.56,profitAfterTax:69.62,profitPctAfterTax:13.90},
  {id:14,date:"2026-03-27",time:"17:16",ticker:"ASTS",name:"AST SpaceMobile",type:"COMPRA",shares:3,price:70.50,fee:1.0,broker:"Trade Republic"},
  {id:15,date:"2026-04-13",time:"16:01",ticker:"ASTS",name:"AST SpaceMobile",type:"VENTA",shares:12,price:85.10,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-04-13",sellTime:"16:01",fiscalYear:2026,
   buys:[{date:"2026-01-27",time:"15:57",shares:6,price:87.50,fee:1.0},{date:"2026-02-04",time:"17:39",shares:3,price:85.00,fee:1.0},{date:"2026-03-27",time:"17:16",shares:3,price:70.50,fee:1.0}],
   note:"3 compras — precio medio €82,63/acc",
   profitBruto:26.70,profitNeto:24.70,profitPct:2.68,profitPctNeto:2.48,taxBase:24.70,taxAmount:4.69,profitAfterTax:20.01,profitPctAfterTax:2.01},
  {id:16,date:"2026-04-14",time:"15:46",ticker:"AMZN",name:"Amazon",type:"VENTA",shares:0.059687,price:208.90,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-04-14",sellTime:"15:46",fiscalYear:2026,
   buys:[{date:"2024-09-17",time:"14:47",shares:0.059687,price:167.54,fee:1.0}],
   profitBruto:3.82,profitNeto:1.82,profitPct:18.14,profitPctNeto:8.63,taxBase:1.82,taxAmount:0.35,profitAfterTax:1.47,profitPctAfterTax:6.98},
  {id:17,date:"2026-04-14",time:"17:59",ticker:"ASTS",name:"AST SpaceMobile",type:"COMPRA",shares:7,price:75.40,fee:1.0,broker:"Trade Republic"},
  {id:18,date:"2026-04-15",time:"15:41",ticker:"ORCL",name:"Oracle",type:"COMPRA",shares:3,price:144.36,fee:1.0,broker:"Trade Republic"},
  {id:19,date:"2026-04-16",time:"13:07",ticker:"ORCL",name:"Oracle",type:"VENTA",shares:3,price:148.02,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-04-16",sellTime:"13:07",fiscalYear:2026,
   buys:[{date:"2026-04-15",time:"15:41",shares:3,price:144.36,fee:1.0}],
   profitBruto:9.98,profitNeto:7.98,profitPct:2.30,profitPctNeto:1.84,taxBase:7.98,taxAmount:1.52,profitAfterTax:6.46,profitPctAfterTax:1.49},
  {id:20,date:"2026-04-20",time:"08:16",ticker:"ASTS",name:"AST SpaceMobile",type:"COMPRA",shares:8,price:63.40,fee:1.0,broker:"Trade Republic"},
  {id:21,date:"2026-04-20",time:"16:04",ticker:"HIMS",name:"Hims & Hers",type:"VENTA",shares:21.312872,price:26.38,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-04-20",sellTime:"16:04",fiscalYear:2026,
   buys:[{date:"2026-02-05",time:"15:23",shares:21.312872,price:23.48,fee:1.0}],
   profitBruto:60.80,profitNeto:58.80,profitPct:12.13,profitPctNeto:11.73,taxBase:58.80,taxAmount:11.17,profitAfterTax:47.63,profitPctAfterTax:9.50},
  {id:22,date:"2026-05-06",time:"10:05",ticker:"NFLX",name:"Netflix",type:"COMPRA",shares:7,price:74.81,fee:1.0,broker:"Trade Republic"},
  {id:23,date:"2026-05-06",time:"10:06",ticker:"GXO",name:"GXO Logistics",type:"COMPRA",shares:6,price:43.53,fee:1.0,broker:"Trade Republic"},
  {id:24,date:"2026-05-07",time:"18:35",ticker:"ONDS",name:"Ondas Holdings",type:"COMPRA",shares:33.156498,price:7.54,fee:1.0,broker:"Trade Republic"},
  {id:25,date:"2026-05-14",time:"16:18",ticker:"ONDS",name:"Ondas Holdings",type:"VENTA",shares:0.156498,price:8.43,fee:1.0,broker:"Trade Republic",isPartialClose:true},
  {id:26,date:"2026-05-14",time:"16:21",ticker:"ONDS",name:"Ondas Holdings",type:"VENTA",shares:33,price:8.41,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-14",sellTime:"16:21",fiscalYear:2026,
   buys:[{date:"2026-05-07",time:"18:35",shares:33.156498,price:7.54,fee:1.0}],
   note:"2 ventas: 0,156498 acc a las 16:18 + 33 acc a las 16:21. Comisiones totales: €3.",
   profitBruto:25.18,profitNeto:23.85,profitPct:10.03,profitPctNeto:9.50,taxBase:23.85,taxAmount:4.53,profitAfterTax:19.32,profitPctAfterTax:7.70},
  {id:27,date:"2026-05-15",time:"19:01",ticker:"MU",name:"Micron Technology",type:"COMPRA",shares:1,price:632.50,fee:1.0,broker:"Trade Republic"},
  {id:28,date:"2026-05-19",time:"13:54",ticker:"TSLA",name:"Tesla",type:"VENTA",shares:0.0277,price:348.80,fee:1.0,broker:"Trade Republic",
   isClosed:true,isGift:true,sellDate:"2026-05-19",sellTime:"13:54",fiscalYear:2026,buys:[],
   note:"Acción recibida como regalo por referido. Coste €0.",
   profitBruto:9.66,profitNeto:8.66,profitPct:null,profitPctNeto:null,taxBase:8.66,taxAmount:1.64,profitAfterTax:7.02,profitPctAfterTax:null},
  {id:29,date:"2026-05-19",time:"13:54",ticker:"MSFT",name:"Microsoft",type:"VENTA",shares:0.025329,price:368.10,fee:1.0,broker:"Trade Republic",
   isClosed:true,isLoss:true,sellDate:"2026-05-19",sellTime:"13:54",fiscalYear:2026,
   buys:[{date:"2024-09-17",time:"14:53",shares:0.025329,price:394.80,fee:1.0}],
   note:"Pérdida. Compensa otras ganancias en IRPF 2026.",
   profitBruto:-1.68,profitNeto:-2.68,profitPct:-15.27,profitPctNeto:-24.39,taxBase:0,taxAmount:0,profitAfterTax:-2.68,profitPctAfterTax:-24.39},
  {id:30,date:"2026-05-20",time:"16:11",ticker:"RDDT",name:"Reddit",type:"COMPRA",shares:1.984126,price:126.00,fee:1.0,broker:"Trade Republic"},
  {id:31,date:"2026-05-21",time:"10:34",ticker:"MU",name:"Micron Technology",type:"VENTA",shares:1,price:639.90,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-21",sellTime:"10:34",fiscalYear:2026,
   buys:[{date:"2026-05-15",time:"19:01",shares:1,price:632.50,fee:1.0}],
   profitBruto:6.40,profitNeto:4.40,profitPct:1.01,profitPctNeto:0.69,taxBase:4.40,taxAmount:0.84,profitAfterTax:3.56,profitPctAfterTax:0.56},
  {id:32,date:"2026-05-21",time:"17:17",ticker:"ASTS",name:"AST SpaceMobile",type:"VENTA",shares:15,price:82.50,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-21",sellTime:"17:17",fiscalYear:2026,
   buys:[{date:"2026-04-14",time:"17:59",shares:7,price:75.40,fee:1.0},{date:"2026-04-20",time:"08:16",shares:8,price:63.40,fee:1.0}],
   note:"2 compras — precio medio €69,00/acc",
   profitBruto:200.50,profitNeto:197.50,profitPct:19.33,profitPctNeto:19.03,taxBase:197.50,taxAmount:37.53,profitAfterTax:159.98,profitPctAfterTax:15.41},
  {id:33,date:"2026-05-22",time:"16:44",ticker:"RDDT",name:"Reddit",type:"COMPRA",shares:2.03252,price:123.00,fee:1.0,broker:"Trade Republic"},
  {id:34,date:"2026-05-22",time:"16:46",ticker:"MRAM",name:"Everspin",type:"COMPRA",shares:9.071117,price:27.56,fee:1.0,broker:"Trade Republic"},
  {id:35,date:"2026-05-22",time:"17:09",ticker:"TTWO",name:"Take-Two Interactive",type:"COMPRA",shares:1.289324,price:193.90,fee:1.0,broker:"Trade Republic"},
  {id:36,date:"2026-05-22",time:"19:20",ticker:"NVDA",name:"NVIDIA",type:"COMPRA",shares:1.600853,price:187.40,fee:1.0,broker:"Trade Republic"},
  {id:37,date:"2026-05-25",time:"11:19",ticker:"NET1",name:"Nueva Exp. Textil",type:"VENTA",shares:1149.425287,price:0.951,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-25",sellTime:"11:19",fiscalYear:2026,
   buys:[{date:"2026-01-21",time:"09:26",shares:1149.425287,price:0.87,fee:1.0}],
   profitBruto:92.10,profitNeto:90.10,profitPct:9.20,profitPctNeto:9.00,taxBase:90.10,taxAmount:17.12,profitAfterTax:72.98,profitPctAfterTax:7.29},
  {id:38,date:"2026-05-26",time:"18:51",ticker:"MU",name:"Micron Technology",type:"COMPRA",shares:0.329815,price:758.00,fee:1.0,broker:"Trade Republic"},
  {id:39,date:"2026-05-26",time:"19:37",ticker:"MU",name:"Micron Technology",type:"VENTA",shares:0.329815,price:769.90,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-26",sellTime:"19:37",fiscalYear:2026,
   buys:[{date:"2026-05-26",time:"18:51",shares:0.329815,price:758.00,fee:1.0}],
   profitBruto:2.92,profitNeto:0.92,profitPct:1.16,profitPctNeto:0.37,taxBase:0.92,taxAmount:0.17,profitAfterTax:0.75,profitPctAfterTax:0.30},
  {id:40,date:"2026-05-27",time:"16:34",ticker:"WOLF",name:"Wolfspeed",type:"COMPRA",shares:4.800307,price:52.08,fee:1.0,broker:"Trade Republic"},
  {id:41,date:"2026-05-27",time:"17:26",ticker:"WOLF",name:"Wolfspeed",type:"COMPRA",shares:5.108295,price:48.94,fee:1.0,broker:"Trade Republic"},
  {id:42,date:"2026-05-27",time:"22:14",ticker:"SNOW",name:"Snowflake",type:"COMPRA",shares:2.543234,price:196.20,fee:1.0,broker:"Trade Republic"},
  {id:43,date:"2026-05-27",time:"22:33",ticker:"SNOW",name:"Snowflake",type:"VENTA",shares:2.543234,price:198.80,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-27",sellTime:"22:33",fiscalYear:2026,
   buys:[{date:"2026-05-27",time:"22:14",shares:2.543234,price:196.20,fee:1.0}],
   profitBruto:5.61,profitNeto:3.61,profitPct:1.12,profitPctNeto:0.72,taxBase:3.61,taxAmount:0.69,profitAfterTax:2.92,profitPctAfterTax:0.58},
  {id:44,date:"2026-05-28",time:"20:27",ticker:"WOLF",name:"Wolfspeed",type:"VENTA",shares:9.908602,price:59.18,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-28",sellTime:"20:27",fiscalYear:2026,
   buys:[{date:"2026-05-27",time:"16:34",shares:4.800307,price:52.08,fee:1.0},{date:"2026-05-27",time:"17:26",shares:5.108295,price:48.94,fee:1.0}],
   note:"2 compras — precio medio €50,43/acc",
   profitBruto:84.39,profitNeto:82.39,profitPct:16.81,profitPctNeto:16.41,taxBase:82.39,taxAmount:15.65,profitAfterTax:66.74,profitPctAfterTax:13.29},
  {id:45,date:"2026-05-28",time:"22:18",ticker:"DELL",name:"Dell Technologies",type:"COMPRA",shares:3.146633,price:317.80,fee:1.0,broker:"Trade Republic"},
  {id:46,date:"2026-05-29",time:"07:30",ticker:"DELL",name:"Dell Technologies",type:"VENTA",shares:3.146633,price:383.15,fee:1.0,broker:"Trade Republic",
   isClosed:true,sellDate:"2026-05-29",sellTime:"07:30",fiscalYear:2026,
   buys:[{date:"2026-05-28",time:"22:18",shares:3.146633,price:317.80,fee:1.0}],
   profitBruto:204.63,profitNeto:202.63,profitPct:20.44,profitPctNeto:20.24,taxBase:203.63,taxAmount:38.69,profitAfterTax:163.94,profitPctAfterTax:16.39},
];

const INITIAL_DIVS = [
  {id:1, date:"2024-12-12",time:"11:07",ticker:"MSFT",fiscalYear:2024,shares:0.025329,divPerShare:0.83,amountEUR:0.02,broker:"Trade Republic"},
  {id:2, date:"2024-12-27",time:"15:58",ticker:"NVDA",fiscalYear:2024,shares:0.094002,divPerShare:0.01,amountEUR:0.00,broker:"Trade Republic"},
  {id:3, date:"2025-03-13",time:"09:49",ticker:"MSFT",fiscalYear:2025,shares:0.025329,divPerShare:0.91,amountEUR:0.02,broker:"Trade Republic"},
  {id:4, date:"2025-04-02",time:"11:29",ticker:"NVDA",fiscalYear:2025,shares:0.094002,divPerShare:0.01,amountEUR:0.00,broker:"Trade Republic"},
  {id:5, date:"2025-06-12",time:"14:48",ticker:"MSFT",fiscalYear:2025,shares:0.025329,divPerShare:0.83,amountEUR:0.02,broker:"Trade Republic"},
  {id:6, date:"2025-07-03",time:"09:35",ticker:"NVDA",fiscalYear:2025,shares:0.094002,divPerShare:0.01,amountEUR:0.00,broker:"Trade Republic"},
  {id:7, date:"2025-09-11",time:"18:34",ticker:"MSFT",fiscalYear:2025,shares:0.025329,divPerShare:0.83,amountEUR:0.02,broker:"Trade Republic"},
  {id:8, date:"2025-10-02",time:"14:50",ticker:"NVDA",fiscalYear:2025,shares:0.094002,divPerShare:0.01,amountEUR:0.00,broker:"Trade Republic"},
  {id:9, date:"2025-12-11",time:"12:20",ticker:"MSFT",fiscalYear:2025,shares:0.025329,divPerShare:0.91,amountEUR:0.02,broker:"Trade Republic"},
  {id:10,date:"2025-12-24",time:"13:42",ticker:"NVDA",fiscalYear:2025,shares:0.094002,divPerShare:0.01,amountEUR:0.00,broker:"Trade Republic"},
  {id:11,date:"2026-03-12",time:"09:46",ticker:"MSFT",fiscalYear:2026,shares:0.025329,divPerShare:0.91,amountEUR:0.02,broker:"Trade Republic"},
  {id:12,date:"2026-05-14",time:"16:00",ticker:"AAPL",fiscalYear:2026,shares:null,divPerShare:null,amountEUR:0.07,broker:"Trade Republic",note:"Cash dividend Apple"},
];

const MES_L = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const fmt   = (n,d=2) => (n==null||isNaN(n))?"—":Number(n).toLocaleString("es-ES",{minimumFractionDigits:d,maximumFractionDigits:d});
const getY  = d => d?.substring(0,4);
const getM  = d => parseInt(d?.substring(5,7));

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Rellena estos datos con los tuyos de Supabase (ver instrucciones al final)
const SUPABASE_URL = "TU_SUPABASE_URL";
const SUPABASE_KEY = "TU_SUPABASE_ANON_KEY";

async function dbGet(table) {
  if (SUPABASE_URL === "TU_SUPABASE_URL") return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=id`, {
    headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`}
  });
  return r.ok ? r.json() : null;
}
async function dbUpsert(table, data) {
  if (SUPABASE_URL === "TU_SUPABASE_URL") return;
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:"POST",
    headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"},
    body: JSON.stringify(Array.isArray(data)?data:[data])
  });
}
async function dbDelete(table, id) {
  if (SUPABASE_URL === "TU_SUPABASE_URL") return;
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method:"DELETE",
    headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`}
  });
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,         setTab]         = useState("history");
  const [history,     setHistory]     = useState(INITIAL_HISTORY);
  const [divs,        setDivs]        = useState(INITIAL_DIVS);
  const [notif,       setNotif]       = useState(null);
  const [detalle,     setDetalle]     = useState(null);
  const [showDivForm, setShowDivForm] = useState(false);
  const [fYear,       setFYear]       = useState("todos");
  const [fMonth,      setFMonth]      = useState("todos");
  const [dbReady,     setDbReady]     = useState(false);
  // IA Scanner
  const [scanMode,    setScanMode]    = useState(false);   // modal escáner abierto
  const [scanImg,     setScanImg]     = useState(null);    // base64 imagen
  const [scanning,    setScanning]    = useState(false);   // llamando a IA
  const [scanResult,  setScanResult]  = useState(null);    // resultado parseado
  const [scanError,   setScanError]   = useState(null);
  const fileRef = useRef();

  const notify = (m,t="ok") => { setNotif({m,t}); setTimeout(()=>setNotif(null),4000); };

  // ── Carga inicial desde Supabase ──────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      const [h,d] = await Promise.all([dbGet("history"), dbGet("dividends")]);
      if (h && h.length > 0) setHistory(h.map(r=>({...r,...(r.extra||{})})));
      if (d && d.length > 0) setDivs(d);
      setDbReady(true);
    })();
  },[]);

  // ── Persist a Supabase cuando cambian los datos ───────────────────────────
  useEffect(()=>{
    if (!dbReady) return;
    dbUpsert("history", history.map(h=>({id:h.id, ticker:h.ticker, name:h.name,
      date:h.date, time:h.time, type:h.type, shares:h.shares, price:h.price,
      fee:h.fee, broker:h.broker||"Trade Republic",
      is_closed:h.isClosed||false, sell_date:h.sellDate||null,
      fiscal_year:h.fiscalYear||null, profit_neto:h.profitNeto||null,
      profit_after_tax:h.profitAfterTax||null, tax_amount:h.taxAmount||null,
      extra: JSON.stringify({buys:h.buys,note:h.note,isLoss:h.isLoss,isGift:h.isGift,
        isClosed:h.isClosed,sellDate:h.sellDate,sellTime:h.sellTime,fiscalYear:h.fiscalYear,
        profitBruto:h.profitBruto,profitNeto:h.profitNeto,profitPct:h.profitPct,
        profitPctNeto:h.profitPctNeto,taxBase:h.taxBase,taxAmount:h.taxAmount,
        profitAfterTax:h.profitAfterTax,profitPctAfterTax:h.profitPctAfterTax})
    })));
  },[history, dbReady]);

  useEffect(()=>{
    if (!dbReady) return;
    dbUpsert("dividends", divs);
  },[divs, dbReady]);

  // ── Escáner con IA ────────────────────────────────────────────────────────
  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScanImg(ev.target.result);
      setScanResult(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!scanImg) return;
    setScanning(true);
    setScanError(null);
    try {
      const base64 = scanImg.split(",")[1];
      const mtype  = scanImg.split(";")[0].split(":")[1];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:[
              {type:"image",source:{type:"base64",media_type:mtype,data:base64}},
              {type:"text",text:`Analiza este justificante de operación bursátil y extrae los datos. 
Responde ÚNICAMENTE con un JSON válido sin texto adicional ni backticks, con esta estructura exacta:
{
  "tipo": "COMPRA" o "VENTA",
  "activo": "nombre del activo",
  "ticker": "símbolo si es visible, si no déjalo vacío",
  "fecha": "DD/MM/YYYY",
  "hora": "HH:MM",
  "acciones": número,
  "precio": número (precio por acción en la divisa original),
  "divisa": "EUR" o "USD" u otra,
  "comision": número total de comisiones y cánones,
  "totalPagado": número total neto pagado o recibido en EUR,
  "broker": "nombre del broker si es visible",
  "tipoCambio": número o null si es EUR,
  "esDividendo": false,
  "notas": "observaciones relevantes"
}
Si es un dividendo: pon esDividendo: true y usa el campo totalPagado para el importe recibido.`}
            ]
          }]
        })
      });
      const data = await res.json();
      const txt  = data.content?.[0]?.text || "";
      const clean = txt.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setScanResult(parsed);
    } catch(e) {
      setScanError("No se pudo leer la imagen. Prueba con una foto más nítida.");
    }
    setScanning(false);
  };

  const confirmScan = () => {
    if (!scanResult) return;
    const r = scanResult;
    // Convertir fecha DD/MM/YYYY → YYYY-MM-DD
    const [d,m,y] = (r.fecha||"").split("/");
    const dateISO = y && m && d ? `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}` : new Date().toISOString().split("T")[0];
    const hora    = (r.hora||"00:00").substring(0,5);

    if (r.esDividendo) {
      const newDiv = {
        id: Date.now(),
        date: dateISO, time: hora,
        ticker: r.ticker||r.activo?.substring(0,4).toUpperCase()||"???",
        fiscalYear: parseInt(dateISO.substring(0,4)),
        shares: r.acciones||null,
        divPerShare: null,
        amountEUR: r.totalPagado||0,
        broker: r.broker||"Desconocido",
        note: r.notas||""
      };
      setDivs(prev=>[...prev, newDiv]);
      notify("✅ Dividendo registrado correctamente");
    } else {
      const newOp = {
        id: Date.now(),
        date: dateISO, time: hora,
        ticker: r.ticker||r.activo?.substring(0,4).toUpperCase()||"???",
        name: r.activo||"Activo desconocido",
        type: r.tipo==="VENTA"?"VENTA":"COMPRA",
        shares: r.acciones||0,
        price: r.precio||0,
        fee: r.comision||0,
        broker: r.broker||"Desconocido",
        currency: r.divisa||"EUR",
        brokerEURAmount: r.totalPagado||null,
        note: r.notas||""
      };
      setHistory(prev=>[...prev, newOp]);
      notify("✅ Operación registrada — recuerda marcarla como cerrada cuando vendas");
    }
    setScanMode(false);
    setScanImg(null);
    setScanResult(null);
  };

  const closed       = history.filter(h=>h.isClosed&&!h.isPartialClose);
  const gainOps      = closed.filter(h=>!h.isLoss);
  const lossOps      = closed.filter(h=>h.isLoss);
  const netReal      = gainOps.reduce((s,h)=>s+(h.profitNeto||0),0) + lossOps.reduce((s,h)=>s+(h.profitNeto||0),0);
  const totalTax     = closed.reduce((s,h)=>s+(h.taxAmount||0),0);
  const totalDiv     = divs.reduce((s,d)=>s+(d.amountEUR||0),0);
  const availYears   = [...new Set(closed.map(h=>h.fiscalYear?.toString()))].filter(Boolean).sort();

  const filtClosed   = closed.filter(h=>{
    if (fYear!=="todos" && h.fiscalYear?.toString()!==fYear) return false;
    if (fMonth!=="todos" && getM(h.sellDate)!==parseInt(fMonth)) return false;
    return true;
  }).sort((a,b)=>new Date(`${b.sellDate}T${b.sellTime}`)-new Date(`${a.sellDate}T${a.sellTime}`));

  const periodM = {
    g: filtClosed.filter(h=>!h.isLoss).reduce((s,h)=>s+(h.profitNeto||0),0),
    l: filtClosed.filter(h=>h.isLoss).reduce((s,h)=>s+(h.profitNeto||0),0),
    tx: filtClosed.reduce((s,h)=>s+(h.taxAmount||0),0),
  };

  const divByYear = [2024,2025,2026].map(y=>({year:y,total:divs.filter(d=>d.fiscalYear===y).reduce((s,d)=>s+(d.amountEUR||0),0)}));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
    html,body,#root{margin:0;padding:0;background:#0b0f1a;min-height:100vh;color:#e2e8f5;}
    *{box-sizing:border-box;}
    ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:#0b0f1a;}::-webkit-scrollbar-thumb{background:#253060;border-radius:2px;}
    .app{font-family:'Inter',sans-serif;background:#0b0f1a;min-height:100vh;overflow-x:hidden;padding-bottom:80px;}
    .hdr{background:#0d1120;border-bottom:1px solid #1a2540;padding:0 16px;position:sticky;top:0;z-index:50;}
    .hdr-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:52px;}
    .logo{font-family:'Inter',sans-serif;font-weight:700;font-size:15px;letter-spacing:-.03em;color:#e2e8f5;}
    .logo span{color:#22d3a5;}
    .db-dot{width:7px;height:7px;border-radius:50%;background:#22d3a5;display:inline-block;margin-right:4px;}
    .db-dot.off{background:#f87171;}
    /* BOTTOM NAV — móvil */
    .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#0d1120;border-top:1px solid #1a2540;display:flex;align-items:stretch;z-index:50;padding-bottom:env(safe-area-inset-bottom);}
    .bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 4px;cursor:pointer;border:none;background:none;color:#64748b;font-family:'Inter',sans-serif;font-size:10px;font-weight:500;gap:4px;transition:color .15s;}
    .bnav-btn.active{color:#22d3a5;}
    .bnav-btn svg{width:20px;height:20px;}
    .bnav-scan{flex:0 0 64px;display:flex;align-items:center;justify-content:center;padding-bottom:4px;}
    .scan-circle{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#22d3a5,#0ea5e9);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(34,211,165,.4);cursor:pointer;border:none;transition:transform .15s;}
    .scan-circle:active{transform:scale(.93);}
    /* CONTENT */
    .content{max-width:900px;margin:0 auto;padding:16px;}
    .card{background:#111827;border:1px solid #1e2d4a;border-radius:10px;}
    .kpi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;}
    @media(min-width:600px){.kpi-grid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));}}
    .kpi{background:#111827;border:1px solid #1e2d4a;border-radius:10px;padding:14px 16px;}
    .kpi-label{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#475569;font-weight:600;margin-bottom:5px;}
    .kpi-val{font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:500;color:#e2e8f5;}
    .kpi-sub{font-size:10px;color:#475569;margin-top:3px;}
    table{width:100%;border-collapse:collapse;font-size:13px;}
    th{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#475569;padding:9px 12px;text-align:left;border-bottom:1px solid #1e2d4a;}
    td{padding:9px 12px;border-bottom:1px solid rgba(30,45,74,.4);vertical-align:middle;color:#cbd5e1;}
    tr:last-child td{border-bottom:none;}
    .tr-click{cursor:pointer;}.tr-click:hover td{background:rgba(34,211,165,.04)!important;}
    .tr-loss td{background:rgba(248,113,113,.02)!important;}.tr-loss.tr-click:hover td{background:rgba(248,113,113,.06)!important;}
    .tag{display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:.04em;}
    .tag-g{background:rgba(34,211,165,.1);color:#22d3a5;border:1px solid rgba(34,211,165,.2);}
    .tag-r{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2);}
    .tag-b{background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.2);}
    .tag-p{background:rgba(167,139,250,.1);color:#a78bfa;border:1px solid rgba(167,139,250,.2);}
    .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:flex-end;justify-content:center;z-index:200;padding:0;backdrop-filter:blur(6px);}
    @media(min-width:600px){.modal-ov{align-items:center;padding:20px;}}
    .modal{background:#111827;border:1px solid #1e2d4a;border-radius:20px 20px 0 0;padding:24px 20px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;}
    @media(min-width:600px){.modal{border-radius:14px;}}
    .modal-handle{width:36px;height:4px;background:#1e2d4a;border-radius:2px;margin:0 auto 20px;}
    .modal-title{font-weight:700;font-size:18px;color:#e2e8f5;margin-bottom:4px;}
    .modal-sub{font-size:13px;color:#64748b;}
    .btn{cursor:pointer;border:none;font-family:'Inter',sans-serif;font-weight:600;font-size:14px;border-radius:10px;padding:12px 20px;transition:all .15s;width:100%;display:block;text-align:center;}
    .btn-primary{background:#22d3a5;color:#0b0f1a;}
    .btn-primary:active{background:#1ab88e;}
    .btn-danger{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2);}
    .btn-outline{background:transparent;color:#64748b;border:1px solid #1e2d4a;}
    .filter-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:14px;}
    .fsel{background:#0b0f1a;border:1px solid #1e2d4a;border-radius:8px;padding:7px 12px;color:#e2e8f5;font-family:'Inter',sans-serif;font-size:12px;cursor:pointer;outline:none;flex:1;min-width:100px;}
    .fsel:focus{border-color:#22d3a5;}
    select option{background:#111827;}
    input,.form-inp{background:#0b0f1a;border:1px solid #1e2d4a;border-radius:8px;padding:10px 12px;color:#e2e8f5;font-family:'IBM Plex Mono',monospace;font-size:13px;width:100%;outline:none;}
    input:focus,.form-inp:focus{border-color:#22d3a5;}
    label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#475569;display:block;margin-bottom:5px;}
    .mono{font-family:'IBM Plex Mono',monospace;}
    .green{color:#22d3a5;}.red{color:#f87171;}.amber{color:#fbbf24;}.muted{color:#475569;}
    .sep{border:none;border-top:1px solid #1e2d4a;margin:16px 0;}
    .d-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
    @media(max-width:400px){.d-grid{grid-template-columns:repeat(2,1fr);}}
    .d-box{background:#0b0f1a;border:1px solid #1e2d4a;border-radius:8px;padding:11px 12px;}
    .d-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#475569;margin-bottom:4px;}
    .d-val{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:500;color:#e2e8f5;}
    .note-box{background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.15);border-radius:7px;padding:9px 12px;font-size:12px;color:#94a3b8;margin-top:10px;}
    .notif{position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:300;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:500;white-space:nowrap;}
    .notif-ok{background:rgba(34,211,165,.15);border:1px solid rgba(34,211,165,.4);color:#22d3a5;}
    .notif-err{background:rgba(248,113,113,.15);border:1px solid rgba(248,113,113,.4);color:#f87171;}
    .yr-badge{display:inline-block;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.2);}
    .info-box{background:rgba(96,165,250,.05);border:1px solid rgba(96,165,250,.12);border-radius:7px;padding:9px 12px;font-size:12px;color:#64748b;margin-bottom:12px;}
    .info-box strong{color:#60a5fa;}
    /* SCAN MODAL */
    .upload-zone{border:2px dashed #1e2d4a;border-radius:12px;padding:32px 20px;text-align:center;cursor:pointer;transition:border-color .2s;}
    .upload-zone:hover,.upload-zone.has-img{border-color:#22d3a5;}
    .upload-zone img{max-width:100%;max-height:220px;border-radius:8px;margin-top:12px;object-fit:contain;}
    .scan-result{background:#0b0f1a;border:1px solid #22d3a5;border-radius:10px;padding:16px;margin-top:14px;}
    .scan-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1e2d4a;font-size:13px;}
    .scan-row:last-child{border-bottom:none;}
    .scan-key{color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;}
    .scan-val{font-family:'IBM Plex Mono',monospace;color:#e2e8f5;font-weight:500;}
    .pulse-ring{animation:pr 1s ease-in-out infinite;}
    @keyframes pr{0%,100%{opacity:1}50%{opacity:.4}}
    .section-title{font-weight:700;font-size:16px;color:#e2e8f5;margin-bottom:14px;}
    .overflow-x{overflow-x:auto;}
  `;

  // ── Modal detalle operación cerrada ─────────────────────────────────────────
  const DetalleModal = ({h,onClose}) => {
    const totalCom = ((h.buys||[]).reduce((s,b)=>s+(b.fee||0),0)) + (h.fee||0);
    const pmedio = (h.buys||[]).length>1
      ? h.buys.reduce((s,b)=>s+b.shares*b.price,0)/h.buys.reduce((s,b)=>s+b.shares,0)
      : (h.buys||[])[0]?.price||0;
    return (
      <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div className="modal">
          <div className="modal-handle"/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div className="modal-title">{h.ticker} — {h.name}</div>
              <div className="modal-sub">
                <span className="yr-badge">{h.fiscalYear}</span>
                <span style={{marginLeft:8,fontSize:12}}>Renta {h.fiscalYear} → abr-jun {(h.fiscalYear||0)+1}</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:24,lineHeight:1,padding:"0 4px"}}>×</button>
          </div>
          {/* Compras */}
          <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",color:"#475569",marginBottom:8}}>{h.isGift?"Origen":"Compras"}</div>
          {h.isGift ? (
            <div style={{background:"rgba(167,139,250,.07)",border:"1px solid rgba(167,139,250,.18)",borderRadius:8,padding:"10px 12px",fontSize:13,color:"#a78bfa",marginBottom:14}}>
              🎁 Regalo por programa de referidos — Coste: €0,00
            </div>
          ) : (
            <div className="overflow-x" style={{marginBottom:14}}>
              <table>
                <thead><tr><th>Fecha</th><th>Hora</th><th>Acc.</th><th>Precio</th><th>Comisión</th><th>Total</th></tr></thead>
                <tbody>
                  {(h.buys||[]).map((b,i)=>(
                    <tr key={i}>
                      <td className="mono" style={{fontSize:11}}>{b.date}</td>
                      <td className="mono muted" style={{fontSize:11}}>{b.time}h</td>
                      <td className="mono">{fmt(b.shares,4)}</td>
                      <td className="mono">{b.note||""} {h.currency==="USD"?"$":"€"}{fmt(b.price)}</td>
                      <td className="mono red">−€{fmt(b.fee)}</td>
                      <td className="mono" style={{fontWeight:500}}>{b.brokerEURAmount?`€${fmt(b.brokerEURAmount)}`:`€${fmt(b.shares*b.price+b.fee)}`}</td>
                    </tr>
                  ))}
                  {(h.buys||[]).length>1&&(
                    <tr style={{background:"rgba(251,191,36,.04)"}}>
                      <td colSpan={3} style={{color:"#fbbf24",fontWeight:600,fontSize:11}}>Precio medio</td>
                      <td className="mono amber" style={{fontWeight:600}}>{h.currency==="USD"?"$":"€"}{fmt(pmedio)}</td>
                      <td className="mono red">−€{fmt((h.buys||[]).reduce((s,b)=>s+(b.fee||0),0))}</td>
                      <td className="mono amber" style={{fontWeight:600}}>€{fmt(h.brokerEURAmount||(h.buys||[]).reduce((s,b)=>s+b.shares*b.price+b.fee,0))}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <hr className="sep"/>
          <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",color:"#475569",marginBottom:8}}>Venta</div>
          <div className="overflow-x" style={{marginBottom:14}}>
            <table>
              <thead><tr><th>Fecha</th><th>Hora</th><th>Acc.</th><th>Precio</th><th>Bruto</th><th>Comisión</th><th>Neto EUR</th></tr></thead>
              <tbody>
                <tr>
                  <td className="mono" style={{fontSize:11}}>{h.sellDate}</td>
                  <td className="mono muted" style={{fontSize:11}}>{h.sellTime}h</td>
                  <td className="mono">{fmt(h.shares,4)}</td>
                  <td className="mono">{h.currency==="USD"?"$":"€"}{fmt(h.price)}</td>
                  <td className="mono">{h.currency==="USD"?"$":"€"}{fmt(h.shares*h.price)}</td>
                  <td className="mono red">−€{fmt(h.fee)}</td>
                  <td className="mono green" style={{fontWeight:600}}>€{fmt(h.brokerEURAmount||(h.shares*h.price-h.fee))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {h.note&&<div className="note-box">{h.note}</div>}
          <hr className="sep"/>
          <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",color:"#475569",marginBottom:10}}>Resultado</div>
          <div className="d-grid" style={{marginBottom:10}}>
            {[
              {l:"Benef. Bruto",  v:`${(h.profitBruto||0)>=0?"+":""}€${fmt(Math.abs(h.profitBruto||0))}`, p:h.profitPct, c:(h.profitBruto||0)>=0?"green":"red"},
              {l:"Benef. Neto",   v:`${(h.profitNeto||0)>=0?"+":""}€${fmt(Math.abs(h.profitNeto||0))}`, p:h.profitPctNeto, c:(h.profitNeto||0)>=0?"green":"red"},
              {l:"After Tax 19%", v:`${(h.profitAfterTax||0)>=0?"+":""}€${fmt(Math.abs(h.profitAfterTax||0))}`, p:h.profitPctAfterTax, c:"green"},
            ].map((k,i)=>(
              <div key={i} className="d-box">
                <div className="d-label">{k.l}</div>
                <div className={`d-val ${k.c}`}>{k.v}</div>
                {k.p!=null&&<div className={`mono ${k.c}`} style={{fontSize:10,marginTop:2}}>{k.p>=0?"+":""}{fmt(k.p)}%</div>}
              </div>
            ))}
          </div>
          <div className="d-grid">
            <div className="d-box"><div className="d-label">Comisiones</div><div className="d-val red">−€{fmt(totalCom)}</div></div>
            <div className="d-box"><div className="d-label">Base Impon.</div><div className="d-val amber">€{fmt(h.taxBase||0)}</div></div>
            <div className="d-box"><div className="d-label">IRPF 19%</div><div className="d-val" style={{color:"#fb923c"}}>−€{fmt(h.taxAmount||0)}</div></div>
          </div>
          <div style={{marginTop:16}}>
            <button className="btn btn-danger" onClick={()=>{setHistory(p=>p.filter(x=>x.id!==h.id));onClose();notify("Operación eliminada","err");}}>Eliminar operación</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Modal Escáner IA ─────────────────────────────────────────────────────────
  const ScanModal = ({onClose}) => (
    <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="modal-title">📸 Escáner de Operación</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:24,lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.6}}>
          Sube una captura de pantalla o foto de tu justificante (Trade Republic, MyInvestor…) y la IA extraerá los datos automáticamente.
        </p>

        {/* Zona de subida */}
        <div className={`upload-zone ${scanImg?"has-img":""}`} onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={onFileSelect}/>
          {!scanImg ? (
            <>
              <div style={{fontSize:40,marginBottom:8}}>📷</div>
              <div style={{color:"#475569",fontSize:13}}>Toca para hacer una foto o seleccionar imagen</div>
            </>
          ) : (
            <img src={scanImg} alt="captura"/>
          )}
        </div>

        {scanImg && !scanResult && (
          <button className="btn btn-primary" style={{marginTop:14}} onClick={analyzeImage} disabled={scanning}>
            {scanning ? <span className="pulse-ring">🔍 Analizando con IA…</span> : "🔍 Analizar imagen"}
          </button>
        )}

        {scanError && <div style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",borderRadius:8,padding:"10px 14px",color:"#f87171",fontSize:13,marginTop:12}}>{scanError}</div>}

        {scanResult && (
          <>
            <div className="scan-result">
              <div style={{fontWeight:600,fontSize:13,color:"#22d3a5",marginBottom:10}}>✅ Datos detectados — revisa antes de confirmar</div>
              {[
                {k:"Tipo",    v:scanResult.tipo},
                {k:"Activo",  v:scanResult.activo},
                {k:"Ticker",  v:scanResult.ticker||"(detectar)"},
                {k:"Fecha",   v:scanResult.fecha},
                {k:"Hora",    v:scanResult.hora},
                {k:"Acciones",v:scanResult.acciones},
                {k:"Precio",  v:`${scanResult.precio} ${scanResult.divisa||"EUR"}`},
                {k:"Comisión",v:`€${fmt(scanResult.comision||0)}`},
                {k:"Total EUR",v:`€${fmt(scanResult.totalPagado||0)}`},
                {k:"Broker",  v:scanResult.broker||"—"},
                {k:"TC",      v:scanResult.tipoCambio||"—"},
                {k:"¿Dividendo?",v:scanResult.esDividendo?"Sí":"No"},
              ].map((r,i)=>(
                <div key={i} className="scan-row">
                  <span className="scan-key">{r.k}</span>
                  <span className="scan-val">{String(r.v||"—")}</span>
                </div>
              ))}
              {scanResult.notas&&<div className="note-box" style={{marginTop:10}}>{scanResult.notas}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
              <button className="btn btn-outline" onClick={()=>{setScanResult(null);setScanImg(null);}}>↩ Repetir</button>
              <button className="btn btn-primary" onClick={confirmScan}>✅ Confirmar y registrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── Modal dividendo manual ────────────────────────────────────────────────────
  const DivForm = ({onClose,onAdd}) => {
    const [f,setF] = useState({date:new Date().toISOString().split("T")[0],time:"10:00",ticker:"",fiscalYear:"2026",amountEUR:""});
    const s = (k,v)=>setF(x=>({...x,[k]:v}));
    return (
      <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div className="modal" style={{maxWidth:480}}>
          <div className="modal-handle"/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div className="modal-title" style={{fontSize:16}}>Añadir Dividendo</div>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:24}}>×</button>
          </div>
          <div style={{display:"grid",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><label>Fecha</label><input type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
              <div><label>Año Fiscal</label><input value={f.fiscalYear} onChange={e=>s("fiscalYear",e.target.value)}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><label>Ticker</label><input placeholder="MSFT" value={f.ticker} onChange={e=>s("ticker",e.target.value.toUpperCase())}/></div>
              <div><label>Total EUR</label><input type="number" placeholder="0.02" value={f.amountEUR} onChange={e=>s("amountEUR",e.target.value)}/></div>
            </div>
            <button className="btn btn-primary" onClick={()=>{
              if(!f.ticker||!f.amountEUR) return;
              onAdd({...f,id:Date.now(),fiscalYear:parseInt(f.fiscalYear),amountEUR:parseFloat(f.amountEUR)});
            }}>Añadir Dividendo</button>
          </div>
        </div>
      </div>
    );
  };

  // ── FISCAL ────────────────────────────────────────────────────────────────────
  const FiscalTab = () => (
    <div>
      <div className="section-title">Resumen Fiscal</div>
      <div className="info-box">ℹ️ El año fiscal es el de la <strong>fecha de venta</strong>. Las pérdidas compensan ganancias del mismo año.</div>
      {[2024,2025,2026].map(year=>{
        const yc=closed.filter(h=>h.fiscalYear===year);
        const yd=divs.filter(d=>d.fiscalYear===year);
        if(!yc.length&&!yd.length) return null;
        const yG=yc.filter(h=>!h.isLoss).reduce((s,h)=>s+(h.profitNeto||0),0);
        const yL=yc.filter(h=>h.isLoss).reduce((s,h)=>s+(h.profitNeto||0),0);
        const yN=yG+yL; const yTx=yc.reduce((s,h)=>s+(h.taxAmount||0),0);
        const yDv=yd.reduce((s,d)=>s+(d.amountEUR||0),0);
        return (
          <div key={year} className="card" style={{padding:16,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className="yr-badge" style={{fontSize:11,padding:"2px 8px"}}>{year}</span>
                <span style={{fontWeight:700,fontSize:14,color:"#e2e8f5"}}>Año Fiscal {year}</span>
              </div>
              <span style={{fontSize:11,color:"#475569"}}>Renta {year}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[
                {l:"Ganancias netas",v:`+€${fmt(yG)}`,c:"green"},
                {l:"Pérdidas",v:`€${fmt(yL)}`,c:"red"},
                {l:"Base imponible",v:`€${fmt(Math.max(yN,0))}`,c:"amber"},
                {l:"IRPF 19% est.",v:`−€${fmt(yTx)}`,style:{color:"#fb923c"}},
                {l:"After tax",v:`+€${fmt(yN-yTx)}`,c:"green"},
                {l:"Dividendos",v:`+€${fmt(yDv,3)}`,style:{color:"#a78bfa"}},
              ].map((k,i)=>(
                <div key={i} className="d-box">
                  <div className="d-label">{k.l}</div>
                  <div className={`d-val ${k.c||""}`} style={k.style}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="overflow-x">
              <table>
                <thead><tr>
                  <th>Activo</th><th>Cierre</th><th>B.Bruto</th><th>%B</th>
                  <th>Comis.</th><th>B.Neto</th><th>%N</th>
                  <th style={{color:"#fbbf24"}}>Base</th>
                  <th style={{color:"#fb923c"}}>IRPF</th>
                  <th style={{color:"#22d3a5"}}>After Tax</th>
                </tr></thead>
                <tbody>
                  {yc.map(h=>(
                    <tr key={h.id} className={`tr-click ${h.isLoss?"tr-loss":""}`} onClick={()=>setDetalle(h)}>
                      <td>
                        <div style={{fontWeight:600,color:"#e2e8f5",fontSize:12}}>{h.ticker}</div>
                        <div style={{fontSize:10,color:"#475569"}}>{h.broker||""}</div>
                        {h.isGift&&<span className="tag tag-p" style={{marginTop:2}}>🎁</span>}
                      </td>
                      <td className="mono" style={{fontSize:11,color:"#94a3b8"}}>{h.sellDate}</td>
                      <td className={`mono ${(h.profitBruto||0)>=0?"green":"red"}`} style={{fontWeight:500,fontSize:12}}>{(h.profitBruto||0)>=0?"+":""}€{fmt(Math.abs(h.profitBruto||0))}</td>
                      <td className={`mono ${h.profitPct!=null?(h.profitPct>=0?"green":"red"):"muted"}`} style={{fontSize:11}}>{h.profitPct!=null?`${h.profitPct>=0?"+":""}${fmt(h.profitPct)}%`:"—"}</td>
                      <td className="mono red" style={{fontSize:11}}>−€{fmt(((h.buys||[]).reduce((s,b)=>s+(b.fee||0),0))+(h.fee||0))}</td>
                      <td className={`mono ${(h.profitNeto||0)>=0?"green":"red"}`} style={{fontWeight:700,fontSize:12}}>{(h.profitNeto||0)>=0?"+":""}€{fmt(Math.abs(h.profitNeto||0))}</td>
                      <td className={`mono ${h.profitPctNeto!=null?(h.profitPctNeto>=0?"green":"red"):"muted"}`} style={{fontSize:11}}>{h.profitPctNeto!=null?`${h.profitPctNeto>=0?"+":""}${fmt(h.profitPctNeto)}%`:"—"}</td>
                      <td className="mono amber" style={{fontSize:11}}>€{fmt(h.taxBase||0)}</td>
                      <td className="mono" style={{color:"#fb923c",fontSize:11}}>−€{fmt(h.taxAmount||0)}</td>
                      <td className="mono green" style={{fontWeight:700,fontSize:12}}>{(h.profitAfterTax||0)>=0?"+":""}€{fmt(Math.abs(h.profitAfterTax||0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );

  const TABS = [
    {id:"history", label:"Historial",
     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>},
    {id:"dividends", label:"Dividendos",
     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>},
    {id:"fiscal", label:"Fiscal",
     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>},
  ];

  return (
    <div className="app">
      <style>{css}</style>
      {notif && <div className={`notif notif-${notif.t}`}>{notif.m}</div>}

      {/* HEADER */}
      <div className="hdr">
        <div className="hdr-inner">
          <div className="logo">CARTERA<span>PRO</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#475569"}}>
            <span className={`db-dot ${SUPABASE_URL!=="TU_SUPABASE_URL"?(dbReady?"":"off"):"off"}`}/>
            {SUPABASE_URL==="TU_SUPABASE_URL" ? "Local" : dbReady ? "Nube ✓" : "Conectando…"}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* ── HISTORIAL ── */}
        {tab==="history" && (
          <div>
            <div className="kpi-grid">
              {[
                {l:"Ganancia Neta Realizada", v:`+€${fmt(netReal)}`, sub:"antes de impuestos", c:"green"},
                {l:"IRPF Estimado",           v:`−€${fmt(totalTax)}`, sub:"base imponible calculada", style:{color:"#fb923c"}},
                {l:"After Tax Total",         v:`+€${fmt(netReal-totalTax)}`, sub:"lo que realmente ganas", c:"green"},
                {l:"Operaciones Cerradas",    v:`${closed.length}`, sub:`${gainOps.length} gan · ${lossOps.length} pérd`, c:"blue"},
              ].map((k,i)=>(
                <div key={i} className="kpi">
                  <div className="kpi-label">{k.l}</div>
                  <div className={`kpi-val ${k.c||""}`} style={k.style}>{k.v}</div>
                  <div className="kpi-sub">{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="filter-row">
              <select className="fsel" value={fYear} onChange={e=>{setFYear(e.target.value);setFMonth("todos");}}>
                <option value="todos">Todos los años</option>
                {availYears.map(y=><option key={y}>{y}</option>)}
              </select>
              <select className="fsel" value={fMonth} onChange={e=>setFMonth(e.target.value)} disabled={fYear==="todos"}>
                <option value="todos">Todos los meses</option>
                {MES_L.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
              </select>
              {(fYear!=="todos"||fMonth!=="todos")&&(
                <button style={{background:"rgba(248,113,113,.1)",color:"#f87171",border:"1px solid rgba(248,113,113,.2)",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}} onClick={()=>{setFYear("todos");setFMonth("todos");}}>✕</button>
              )}
            </div>
            {(fYear!=="todos"||fMonth!=="todos")&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
                {[
                  {l:"Ganancia neta", v:`${periodM.g>=0?"+":""}€${fmt(periodM.g)}`, c:periodM.g>=0?"green":"red"},
                  {l:"IRPF est.",     v:`−€${fmt(periodM.tx)}`, style:{color:"#fb923c"}},
                  {l:"After tax",     v:`+€${fmt(periodM.g+periodM.l-periodM.tx)}`, c:"green"},
                ].map((k,i)=>(
                  <div key={i} className="d-box">
                    <div className="d-label">{k.l}</div>
                    <div className={`d-val ${k.c||""}`} style={k.style}>{k.v}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="card overflow-x">
              <table>
                <thead><tr><th>Año</th><th>Fecha Cierre</th><th>Activo</th><th>B.Bruto</th><th>%B</th><th>Comis.</th><th>B.Neto</th><th>%N</th><th>Estado</th></tr></thead>
                <tbody>
                  {filtClosed.map(h=>(
                    <tr key={h.id} className={`tr-click ${h.isLoss?"tr-loss":""}`} onClick={()=>setDetalle(h)}>
                      <td><span className="yr-badge">{h.fiscalYear}</span></td>
                      <td><span className="mono" style={{fontSize:11,color:"#94a3b8"}}>{h.sellDate}</span><br/><span className="mono muted" style={{fontSize:10}}>{h.sellTime}h</span></td>
                      <td><div style={{fontWeight:600,color:"#e2e8f5",fontSize:12}}>{h.ticker}</div><div style={{fontSize:10,color:"#475569"}}>{h.broker||""}</div></td>
                      <td className={`mono ${(h.profitBruto||0)>=0?"green":"red"}`} style={{fontWeight:500,fontSize:12}}>{(h.profitBruto||0)>=0?"+":""}€{fmt(Math.abs(h.profitBruto||0))}</td>
                      <td className={`mono ${h.profitPct!=null?(h.profitPct>=0?"green":"red"):"muted"}`} style={{fontSize:11}}>{h.profitPct!=null?`${h.profitPct>=0?"+":""}${fmt(h.profitPct)}%`:"—"}</td>
                      <td className="mono red" style={{fontSize:11}}>−€{fmt(((h.buys||[]).reduce((s,b)=>s+(b.fee||0),0))+(h.fee||0))}</td>
                      <td className={`mono ${(h.profitNeto||0)>=0?"green":"red"}`} style={{fontWeight:700,fontSize:12}}>{(h.profitNeto||0)>=0?"+":""}€{fmt(Math.abs(h.profitNeto||0))}</td>
                      <td className={`mono ${h.profitPctNeto!=null?(h.profitPctNeto>=0?"green":"red"):"muted"}`} style={{fontSize:11}}>{h.profitPctNeto!=null?`${h.profitPctNeto>=0?"+":""}${fmt(h.profitPctNeto)}%`:"—"}</td>
                      <td>{h.isLoss?<span className="tag tag-r">Pérdida</span>:h.isGift?<span className="tag tag-p">🎁</span>:<span className="tag tag-g">✓</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DIVIDENDOS ── */}
        {tab==="dividends" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div className="section-title" style={{marginBottom:0}}>Dividendos</div>
              <button onClick={()=>setShowDivForm(true)} style={{background:"#22d3a5",color:"#0b0f1a",border:"none",borderRadius:8,padding:"8px 14px",fontFamily:"inherit",fontWeight:600,fontSize:13,cursor:"pointer"}}>+ Añadir</button>
            </div>
            <div className="kpi-grid">
              {[
                {l:"Total cobrado",   v:`€${fmt(totalDiv,3)}`, style:{color:"#a78bfa"}},
                {l:"2024 (Renta 24)", v:`€${fmt(divByYear[0].total,3)}`, c:"blue"},
                {l:"2025 (Renta 25)", v:`€${fmt(divByYear[1].total,3)}`, c:"green"},
                {l:"2026 (Renta 26)", v:`€${fmt(divByYear[2].total,3)}`, c:"amber"},
              ].map((k,i)=>(
                <div key={i} className="kpi">
                  <div className="kpi-label">{k.l}</div>
                  <div className={`kpi-val ${k.c||""}`} style={k.style}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="card overflow-x">
              <table>
                <thead><tr><th>Año</th><th>Fecha</th><th>Activo</th><th>Total EUR</th><th>Broker</th><th></th></tr></thead>
                <tbody>
                  {[...divs].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(d=>(
                    <tr key={d.id}>
                      <td><span className="yr-badge">{d.fiscalYear}</span></td>
                      <td className="mono" style={{fontSize:11,color:"#94a3b8"}}>{d.date}</td>
                      <td style={{fontWeight:600,color:"#e2e8f5",fontSize:12}}>{d.ticker}</td>
                      <td className="mono" style={{color:d.amountEUR>0?"#a78bfa":"#475569",fontWeight:500}}>{d.amountEUR>0?`+€${fmt(d.amountEUR,2)}`:"€0,00"}</td>
                      <td style={{fontSize:11,color:"#475569"}}>{d.broker}</td>
                      <td><button onClick={()=>{setDivs(p=>p.filter(x=>x.id!==d.id));notify("Eliminado","err");}} style={{background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:16,padding:"2px 6px"}} onMouseEnter={e=>e.target.style.color="#f87171"} onMouseLeave={e=>e.target.style.color="#374151"}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="fiscal" && <FiscalTab/>}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="bottom-nav">
        {TABS.slice(0,1).map(t=>(
          <button key={t.id} className={`bnav-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
        {/* Botón central SCAN */}
        <div className="bnav-scan">
          <button className="scan-circle" onClick={()=>{setScanMode(true);setScanImg(null);setScanResult(null);setScanError(null);}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b0f1a" strokeWidth="2.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </div>
        {TABS.slice(1).map(t=>(
          <button key={t.id} className={`bnav-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* MODALES */}
      {detalle     && <DetalleModal h={detalle} onClose={()=>setDetalle(null)}/>}
      {scanMode    && <ScanModal    onClose={()=>setScanMode(false)}/>}
      {showDivForm && <DivForm      onClose={()=>setShowDivForm(false)} onAdd={d=>{setDivs(p=>[...p,d]);setShowDivForm(false);notify("Dividendo añadido");}}/>}
    </div>
  );
}
