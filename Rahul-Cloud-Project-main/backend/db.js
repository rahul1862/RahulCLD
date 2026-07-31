import crypto from "node:crypto";
import pg from "pg";
const { Pool, Client } = pg;
const isTest = process.env.NODE_ENV === "test";
const isProduction = process.env.NODE_ENV === "production";
const baseConnectionString = process.env.DATABASE_URL;
if (!baseConnectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
const ssl = isProduction
  ? {
      rejectUnauthorized: false,
    }
  : false;
let pool;
if (isTest) {
  const dbName = `userhub_test_${crypto.randomUUID().replace(/-/g, "")}`;
  const bootstrap = new Client({
    connectionString: baseConnectionString,
    ssl,
  });
  await bootstrap.connect();
  await bootstrap.query(`CREATE DATABASE "${dbName}"`);
  await bootstrap.end();
  const testUrl = new URL(baseConnectionString);
  testUrl.pathname = `/${dbName}`;
  pool = new Pool({
    connectionString: testUrl.toString(),
    ssl,
  });
} else {
  pool = new Pool({
    connectionString: baseConnectionString,
    ssl,
  });
}
export async function query(sql, params = []) {
  let i = 0;
  return pool.query(
    sql.replace(/\?/g, () => `$${++i}`),
    params
  );
}
await query(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    "createdAt" TEXT NOT NULL
  )
`);
await query(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    "createdAt" TEXT NOT NULL
  )
`);
const COMPANY_BY_DOMAIN = {
  "marenfoods.ie": "Maren Foods",
  "brightsidecapital.com": "Brightside Capital",
  "kilbrideandco.ie": "Kilbride & Co",
  "northgatelogistics.com": "Northgate Logistics",
  "verityhealth.ie": "Verity Health",
  "lakeshorestudio.com": "Lakeshore Studio",
  "ashfordpartners.ie": "Ashford Partners",
  "greenfieldanalytics.com": "Greenfield Analytics",
};
const SEED = [
  {
    name: "Aoife Murphy",
    email: "aoife.murphy@marenfoods.ie",
    address: "14 Wine St, Sligo",
    phone: "+353 87 214 5563",
    daysAgo: 0,
  },
  {
    name: "Cian Doyle",
    email: "cian.doyle@marenfoods.ie",
    address: "47 Dawson St, Dublin",
    phone: "",
    daysAgo: 2,
  },
  {
    name: "Niamh Healy",
    email: "niamh.healy@marenfoods.ie",
    address: "9 Main St, Waterford",
    phone: "+353 85 330 9981",
    daysAgo: 5,
  },
  {
    name: "Sean Walsh",
    email: "sean.walsh@marenfoods.ie",
    address: "6 George's St, Cork",
    phone: "",
    daysAgo: 18,
  },
  {
    name: "Roisin Kavanagh",
    email: "roisin.kavanagh@marenfoods.ie",
    address: "2 Castle St, Kilkenny",
    phone: "+353 86 770 2214",
    daysAgo: 41,
  },
  {
    name: "Conor Ryan",
    email: "conor.ryan@brightsidecapital.com",
    address: "31 Quay St, Galway",
    phone: "+353 89 442 0087",
    daysAgo: 1,
  },
  {
    name: "Saoirse Gallagher",
    email: "saoirse.gallagher@brightsidecapital.com",
    address: "19 William St, Limerick",
    phone: "",
    daysAgo: 7,
  },
  {
    name: "Eoin Fallon",
    email: "eoin.fallon@brightsidecapital.com",
    address: "63 Mary St, Dublin",
    phone: "+353 83 118 6645",
    daysAgo: 12,
  },
  {
    name: "Caoimhe McCarthy",
    email: "caoimhe.mccarthy@brightsidecapital.com",
    address: "8 North Main St, Cork",
    phone: "",
    daysAgo: 29,
  },
  {
    name: "Liam Brennan",
    email: "liam.brennan@brightsidecapital.com",
    address: "12 Baggot St, Dublin",
    phone: "+353 87 905 3321",
    daysAgo: 63,
  },
  {
    name: "Aisling Fitzgerald",
    email: "aisling.fitzgerald@kilbrideandco.ie",
    address: "4 Grafton St, Dublin",
    phone: "",
    daysAgo: 3,
  },
  {
    name: "Darragh Nolan",
    email: "darragh.nolan@kilbrideandco.ie",
    address: "88 Patrick St, Cork",
    phone: "+353 85 661 4470",
    daysAgo: 9,
  },
  {
    name: "Orla Quinn",
    email: "orla.quinn@kilbrideandco.ie",
    address: "21 O'Connell St, Limerick",
    phone: "",
    daysAgo: 22,
  },
  {
    name: "Ruairi Whelan",
    email: "ruairi.whelan@kilbrideandco.ie",
    address: "3 Shop St, Galway",
    phone: "+353 86 229 7783",
    daysAgo: 54,
  },
  {
    name: "Maeve Lynch",
    email: "maeve.lynch@kilbrideandco.ie",
    address: "57 High St, Kilkenny",
    phone: "",
    daysAgo: 88,
  },
  {
    name: "Tadhg Maher",
    email: "tadhg.maher@northgatelogistics.com",
    address: "14 Wine St, Sligo",
    phone: "+353 87 552 0193",
    daysAgo: 4,
  },
  {
    name: "Sinead Hogan",
    email: "sinead.hogan@northgatelogistics.com",
    address: "9 Main St, Waterford",
    phone: "",
    daysAgo: 11,
  },
  {
    name: "Cormac O'Brien",
    email: "cormac.obrien@northgatelogistics.com",
    address: "47 Dawson St, Dublin",
    phone: "+353 89 304 7762",
    daysAgo: 25,
  },
  {
    name: "Grainne Daly",
    email: "grainne.daly@northgatelogistics.com",
    address: "6 George's St, Cork",
    phone: "",
    daysAgo: 47,
  },
  {
    name: "Fionn Connolly",
    email: "fionn.connolly@northgatelogistics.com",
    address: "31 Quay St, Galway",
    phone: "+353 83 671 0028",
    daysAgo: 95,
  },
  {
    name: "Erin Naughton",
    email: "erin.naughton@verityhealth.ie",
    address: "2 Castle St, Kilkenny",
    phone: "",
    daysAgo: 0,
  },
  {
    name: "Diarmuid Power",
    email: "diarmuid.power@verityhealth.ie",
    address: "19 William St, Limerick",
    phone: "+353 85 117 4456",
    daysAgo: 6,
  },
  {
    name: "Clodagh Phelan",
    email: "clodagh.phelan@verityhealth.ie",
    address: "63 Mary St, Dublin",
    phone: "",
    daysAgo: 15,
  },
  {
    name: "Padraig Greene",
    email: "padraig.greene@verityhealth.ie",
    address: "8 North Main St, Cork",
    phone: "+353 86 884 2210",
    daysAgo: 36,
  },
  {
    name: "Cathal Brophy",
    email: "cathal.brophy@verityhealth.ie",
    address: "12 Baggot St, Dublin",
    phone: "",
    daysAgo: 71,
  },
  {
    name: "Niall Roche",
    email: "niall.roche@lakeshorestudio.com",
    address: "4 Grafton St, Dublin",
    phone: "+353 87 330 6692",
    daysAgo: 2,
  },
  {
    name: "Eabha Cullen",
    email: "eabha.cullen@lakeshorestudio.com",
    address: "88 Patrick St, Cork",
    phone: "",
    daysAgo: 8,
  },
  {
    name: "Senan Dunne",
    email: "senan.dunne@lakeshorestudio.com",
    address: "21 O'Connell St, Limerick",
    phone: "+353 85 778 3341",
    daysAgo: 19,
  },
  {
    name: "Aoibhinn Curran",
    email: "aoibhinn.curran@lakeshorestudio.com",
    address: "3 Shop St, Galway",
    phone: "",
    daysAgo: 44,
  },
  {
    name: "Ronan Sweeney",
    email: "ronan.sweeney@lakeshorestudio.com",
    address: "57 High St, Kilkenny",
    phone: "+353 89 226 1175",
    daysAgo: 102,
  },
  {
    name: "Ciara Buckley",
    email: "ciara.buckley@ashfordpartners.ie",
    address: "14 Wine St, Sligo",
    phone: "",
    daysAgo: 1,
  },
  {
    name: "Brian Mullen",
    email: "brian.mullen@ashfordpartners.ie",
    address: "9 Main St, Waterford",
    phone: "+353 86 412 0857",
    daysAgo: 10,
  },
  {
    name: "Aine Shanahan",
    email: "aine.shanahan@ashfordpartners.ie",
    address: "47 Dawson St, Dublin",
    phone: "",
    daysAgo: 26,
  },
  {
    name: "Eamon Foley",
    email: "eamon.foley@ashfordpartners.ie",
    address: "6 George's St, Cork",
    phone: "+353 83 905 6612",
    daysAgo: 58,
  },
  {
    name: "Roisin Casey",
    email: "roisin.casey@ashfordpartners.ie",
    address: "31 Quay St, Galway",
    phone: "",
    daysAgo: 84,
  },
  {
    name: "Killian Burke",
    email: "killian.burke@greenfieldanalytics.com",
    address: "2 Castle St, Kilkenny",
    phone: "+353 87 661 9943",
    daysAgo: 0,
  },
  {
    name: "Sorcha Egan",
    email: "sorcha.egan@greenfieldanalytics.com",
    address: "19 William St, Limerick",
    phone: "",
    daysAgo: 5,
  },
  {
    name: "Donal Keane",
    email: "donal.keane@greenfieldanalytics.com",
    address: "63 Mary St, Dublin",
    phone: "+353 85 220 4487",
    daysAgo: 13,
  },
  {
    name: "Aoife Reidy",
    email: "aoife.reidy@greenfieldanalytics.com",
    address: "8 North Main St, Cork",
    phone: "",
    daysAgo: 31,
  },
  {
    name: "Cathal Dwyer",
    email: "cathal.dwyer@greenfieldanalytics.com",
    address: "12 Baggot St, Dublin",
    phone: "+353 86 773 1259",
    daysAgo: 67,
  },
  {
    name: "Rahul Dwyer",
    email: "RahulPohwani@greenfieldanalytics.com",
    address: "88 castle St, Dublin",
    phone: "+353 83 101 9990",
    daysAgo: 5,
  },
];
const {
  rows: [{ c: userCount }],
} = await query("SELECT COUNT(*) AS c FROM users");
if (Number(userCount) === 0 && !isTest) {
  const now = Date.now();
  for (const u of SEED) {
    await query(
      'INSERT INTO users (id, name, email, company, address, phone, "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        u.name,
        u.email,
        COMPANY_BY_DOMAIN[u.email.split("@")[1]],
        u.address,
        u.phone || null,
        new Date(now - u.daysAgo * 86400000).toISOString(),
      ]
    );
  }
}
const TX_SEED = [
  {
    type: "income",
    category: "Subscriptions",
    description: "Marenfoods annual plan",
    amount: 2400,
    daysAgo: 2,
  },
  {
    type: "income",
    category: "Subscriptions",
    description: "Brightside Capital annual plan",
    amount: 1800,
    daysAgo: 6,
  },
  {
    type: "income",
    category: "Setup fees",
    description: "Kilbride & Co onboarding",
    amount: 350,
    daysAgo: 9,
  },
  {
    type: "expense",
    category: "Hosting",
    description: "Render API + static site",
    amount: 25,
    daysAgo: 1,
  },
  {
    type: "expense",
    category: "Software",
    description: "GitHub Actions minutes",
    amount: 12,
    daysAgo: 4,
  },
  {
    type: "income",
    category: "Subscriptions",
    description: "Northgate Logistics annual plan",
    amount: 2100,
    daysAgo: 15,
  },
  {
    type: "expense",
    category: "Support",
    description: "Contractor support hours",
    amount: 480,
    daysAgo: 18,
  },
  {
    type: "income",
    category: "Setup fees",
    description: "Verity Health onboarding",
    amount: 350,
    daysAgo: 22,
  },
  {
    type: "expense",
    category: "Hosting",
    description: "Render API + static site",
    amount: 25,
    daysAgo: 32,
  },
  {
    type: "income",
    category: "Subscriptions",
    description: "Lakeshore Studio annual plan",
    amount: 1500,
    daysAgo: 35,
  },
  {
    type: "expense",
    category: "Software",
    description: "Domain renewal",
    amount: 14,
    daysAgo: 40,
  },
  {
    type: "income",
    category: "Subscriptions",
    description: "Ashford Partners annual plan",
    amount: 1200,
    daysAgo: 48,
  },
  {
    type: "expense",
    category: "Hosting",
    description: "Render API + static site",
    amount: 25,
    daysAgo: 62,
  },
  {
    type: "income",
    category: "Setup fees",
    description: "Greenfield Analytics onboarding",
    amount: 350,
    daysAgo: 70,
  },
  {
    type: "expense",
    category: "Support",
    description: "Contractor support hours",
    amount: 480,
    daysAgo: 75,
  },
];
const {
  rows: [{ c: txCount }],
} = await query("SELECT COUNT(*) AS c FROM transactions");
if (Number(txCount) === 0 && !isTest) {
  const now = Date.now();
  for (const t of TX_SEED) {
    const iso = new Date(now - t.daysAgo * 86400000).toISOString();
    await query(
      'INSERT INTO transactions (id, type, category, description, amount, date, "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), t.type, t.category, t.description, t.amount, iso, iso]
    );
  }
}
export default query;
