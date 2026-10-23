import type { DomainId } from "@/lib/domains";

export type BankEntry = {
  term: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  mnemonic: string;
  scenario: string;
};

function word(
  term: string,
  partOfSpeech: string,
  pronunciation: string,
  definition: string,
  mnemonic: string,
  scenario: string,
): BankEntry {
  return { term, partOfSpeech, pronunciation, definition, mnemonic, scenario };
}

export const WORD_BANK: Record<DomainId, BankEntry[]> = {
  "Software Engineering": [
    word(
      "Latency",
      "noun",
      "/ˈleɪ.tən.si/",
      "The time a system takes to respond to a single request.",
      "Late — כמה זמן לוקח עד שהתשובה מגיעה.",
      "A search box feels slow when each keystroke waits 400 milliseconds for a response.",
    ),
    word(
      "Throughput",
      "noun",
      "/ˈθruː.pʊt/",
      "How much work a system finishes in a given period of time.",
      "Through-put — כמה עובר דרך הצינור בדקה.",
      "The API handles two thousand requests a second during checkout.",
    ),
    word(
      "Refactor",
      "verb",
      "/ˌriːˈfæk.tər/",
      "To change the structure of code without changing what it does.",
      "Re-factor — מסדרים מחדש, ההתנהגות נשארת.",
      "The team splits one long function into smaller ones and the tests still pass.",
    ),
    word(
      "Deploy",
      "verb",
      "/dɪˈplɔɪ/",
      "To release a version of software so people can use it.",
      "Deploy — מוציאים את הגרסה החוצה.",
      "The new login screen goes live after the afternoon release.",
    ),
    word(
      "Rollback",
      "noun",
      "/ˈroʊl.bæk/",
      "A return to the previous version after a release causes trouble.",
      "Roll back — מגלגלים אחורה לגרסה שעבדה.",
      "Error rates jump after a release, so the team restores yesterday's build.",
    ),
    word(
      "Cache",
      "noun",
      "/kæʃ/",
      "A nearby copy of data kept so the next read does not start from scratch.",
      "Cache — עותק קרוב, כדי לא ללכת רחוק שוב.",
      "A profile page is stored for a minute so every refresh does not hit the database.",
    ),
    word(
      "Runtime",
      "noun",
      "/ˈrʌn.taɪm/",
      "The period when a program is actually running, not when it is being written.",
      "Run-time — הזמן שבו התוכנית רצה.",
      "A missing setting only shows up at runtime, after the service starts.",
    ),
    word(
      "Compile",
      "verb",
      "/kəmˈpaɪl/",
      "To turn source code into a form the machine can run.",
      "Compile — מקמפלים את הטקסט למשהו שאפשר להריץ.",
      "The build fails to compile because a type no longer matches.",
    ),
  ],
  "Distributed Systems": [
    word(
      "Consensus",
      "noun",
      "/kənˈsen.səs/",
      "Agreement among separate machines on one shared decision.",
      "Consent — כולם מסכימים על אותה עובדה.",
      "Three servers agree which one is allowed to accept writes.",
    ),
    word(
      "Replica",
      "noun",
      "/ˈrep.lɪ.kə/",
      "A copy of the same data kept on another machine.",
      "Replica — עותק נוסף, לא המקור.",
      "A second database copy takes over if the first machine goes down.",
    ),
    word(
      "Partition",
      "noun",
      "/pɑːˈtɪʃ.ən/",
      "A split that stops some machines from talking to the others.",
      "Partition — המערכת נחתכת לחלקים שלא שומעים זה את זה.",
      "A network cut leaves two groups of servers unable to see each other.",
    ),
    word(
      "Timeout",
      "noun",
      "/ˈtaɪm.aʊt/",
      "The moment a wait is abandoned because an answer took too long.",
      "Time-out — נגמר הזמן, מפסיקים לחכות.",
      "The client gives up after three seconds when the service never replies.",
    ),
    word(
      "Retry",
      "verb",
      "/ˌriːˈtraɪ/",
      "To send a request again after a failure or a timeout.",
      "Re-try — מנסים עוד פעם.",
      "The worker sends the same job again after the first attempt fails.",
    ),
    word(
      "Quorum",
      "noun",
      "/ˈkwɔː.rəm/",
      "The minimum number of machines that must agree before a decision counts.",
      "Quorum — בלי רוב אין החלטה.",
      "A write is accepted only after two of three copies confirm it.",
    ),
    word(
      "Failover",
      "noun",
      "/ˈfeɪlˌoʊ.vər/",
      "The switch to a standby machine when the active one fails.",
      "Fail-over — עוברים לגיבוי כשהראשי נופל.",
      "Traffic moves to the standby region when the primary region stops answering.",
    ),
    word(
      "Backlog",
      "noun",
      "/ˈbæk.lɒɡ/",
      "Work that has arrived but has not been processed yet.",
      "Back-log — תור של עבודה שמחכה.",
      "Messages pile up in the queue while the consumers are down.",
    ),
  ],
  "Cloud Architecture": [
    word(
      "Outage",
      "noun",
      "/ˈaʊ.tɪdʒ/",
      "A period when a service is unavailable to its users.",
      "Outage — השירות בחוץ, אי אפשר להשתמש בו.",
      "The status page shows an outage when checkout is down for twenty minutes.",
    ),
    word(
      "Region",
      "noun",
      "/ˈriː.dʒən/",
      "A geographic area where a cloud provider runs a group of data centers.",
      "Region — אזור בעולם שבו השרתים יושבים.",
      "European customers are served from a region in Frankfurt.",
    ),
    word(
      "Scale",
      "verb",
      "/skeɪl/",
      "To add or remove capacity as demand changes.",
      "Scale — מגדילים או מקטינים לפי העומס.",
      "The service adds more instances when traffic rises on Friday.",
    ),
    word(
      "Tenant",
      "noun",
      "/ˈten.ənt/",
      "One customer whose data and traffic are kept apart from the others.",
      "Tenant — דייר: לקוח אחד בתוך בניין משותף.",
      "Each company is a tenant, and one company cannot read another's files.",
    ),
    word(
      "Quota",
      "noun",
      "/ˈkwəʊ.tə/",
      "A limit on how much of a resource an account may use.",
      "Quota — מכסה: עד כאן מותר.",
      "The account cannot launch more machines once it hits its quota.",
    ),
    word(
      "Cluster",
      "noun",
      "/ˈklʌs.tər/",
      "A group of machines that work together as one system.",
      "Cluster — צביר מכונות שעובדות כיחידה.",
      "The application runs across a cluster of twelve machines.",
    ),
    word(
      "Rollout",
      "noun",
      "/ˈroʊl.aʊt/",
      "The gradual release of a change to more users or machines.",
      "Roll-out — פורסים את השינוי בהדרגה.",
      "The new version reaches ten percent of users before everyone else.",
    ),
    word(
      "Uptime",
      "noun",
      "/ˈʌp.taɪm/",
      "The share of time a service is available and working.",
      "Up-time — כמה זמן השירות היה למעלה.",
      "The team aims for 99.9 percent uptime over a month.",
    ),
  ],
  Logic: [
    word(
      "Premise",
      "noun",
      "/ˈprem.ɪs/",
      "A statement that an argument takes as its starting point.",
      "Premise — נקודת הפתיחה של הטיעון.",
      "The proof starts from the premise that every request has an identifier.",
    ),
    word(
      "Assumption",
      "noun",
      "/əˈsʌmp.ʃən/",
      "Something treated as true without being shown in this argument.",
      "Assume — מניחים שזה נכון, בלי להוכיח כאן.",
      "The design assumes the clock on every machine is roughly right.",
    ),
    word(
      "Valid",
      "adjective",
      "/ˈvæl.ɪd/",
      "An argument is valid when the conclusion must follow if the premises are true.",
      "Valid — אם ההנחות נכונות, המסקנה חייבת לבוא.",
      "The reasoning is valid even if one of the facts later turns out to be wrong.",
    ),
    word(
      "Contradiction",
      "noun",
      "/ˌkɒn.trəˈdɪk.ʃən/",
      "Two claims that cannot both be true at the same time.",
      "Contra — שתי טענות שמתנגשות.",
      "The log says the write succeeded and also that the disk was full.",
    ),
    word(
      "Inference",
      "noun",
      "/ˈɪn.fər.əns/",
      "A conclusion drawn from what is already known.",
      "Infer — מסיקים ממה שכבר ידוע.",
      "From three failed health checks, the system infers that the instance is down.",
    ),
    word(
      "Proof",
      "noun",
      "/pruːf/",
      "A chain of reasons that shows a claim must be true.",
      "Proof — שרשרת נימוקים, לא רק תחושה.",
      "The author gives a proof that the lock cannot be held by two callers at once.",
    ),
    word(
      "Constraint",
      "noun",
      "/kənˈstreɪnt/",
      "A limit that a solution is required to respect.",
      "Constraint — מגבלה שאסור לחצות.",
      "The budget is a constraint: the design cannot add another database.",
    ),
    word(
      "Exception",
      "noun",
      "/ɪkˈsep.ʃən/",
      "A case that does not follow the general rule.",
      "Except — המקרה שלא נכנס לכלל.",
      "Empty input is an exception to the rule that every batch has a header.",
    ),
  ],
  "API Design": [
    word(
      "Endpoint",
      "noun",
      "/ˈend.pɔɪnt/",
      "A specific address where a client asks a service to do one thing.",
      "End-point — הכתובת שאליה פונים.",
      "The client calls the invoices endpoint to list unpaid bills.",
    ),
    word(
      "Payload",
      "noun",
      "/ˈpeɪ.ləʊd/",
      "The actual data carried in a request or a response.",
      "Payload — המטען עצמו, לא המעטפת.",
      "The payload is a JSON object with the user's name and email.",
    ),
    word(
      "Schema",
      "noun",
      "/ˈskiː.mə/",
      "The agreed shape of the data: which fields exist and what they mean.",
      "Schema — התבנית של הנתונים.",
      "The schema requires an email and rejects a request that omits it.",
    ),
    word(
      "Version",
      "noun",
      "/ˈvɜː.ʃən/",
      "A numbered form of an interface so old and new clients can coexist.",
      "Version — מספר של החוזה, כדי שלא כולם יזוזו יחד.",
      "Version two adds a field while version one keeps working.",
    ),
    word(
      "Request",
      "noun",
      "/rɪˈkwest/",
      "A message a client sends to ask a service for something.",
      "Request — הבקשה שהלקוח שולח.",
      "The request asks the service to create one order.",
    ),
    word(
      "Response",
      "noun",
      "/rɪˈspɒns/",
      "The message a service sends back after a request.",
      "Response — התשובה שחוזרת.",
      "The response includes the new order id and a status of created.",
    ),
    word(
      "Header",
      "noun",
      "/ˈhed.ər/",
      "A named piece of information sent alongside the body of a message.",
      "Header — שורה מעל התוכן, עם פרט נוסף.",
      "The authorization header carries the token.",
    ),
    word(
      "Contract",
      "noun",
      "/ˈkɒn.trækt/",
      "The promise of what a caller may send and what it will get back.",
      "Contract — החוזה בין מי שקורא למי שעונה.",
      "The contract says a missing id returns an error, not an empty page.",
    ),
  ],
  "Security Engineering": [
    word(
      "Token",
      "noun",
      "/ˈtəʊ.kən/",
      "A short-lived proof that a caller is allowed to act as a certain user.",
      "Token — פתק כניסה זמני, לא הסיסמה עצמה.",
      "The app sends a token with each request instead of the password.",
    ),
    word(
      "Encrypt",
      "verb",
      "/ɪnˈkrɪpt/",
      "To transform data so only someone with the key can read it.",
      "Encrypt — הופכים את התוכן לבלתי קריא בלי מפתח.",
      "The disk encrypts customer files before they are stored.",
    ),
    word(
      "Secret",
      "noun",
      "/ˈsiː.krət/",
      "A value, such as a password or a key, that must stay hidden.",
      "Secret — ערך שאסור שיופיע בפומבי.",
      "The database password is a secret and does not belong in the source code.",
    ),
    word(
      "Permission",
      "noun",
      "/pəˈmɪʃ.ən/",
      "A specific action an identity is allowed to perform.",
      "Permit — רשות לפעולה אחת, לא לכל דבר.",
      "This account has permission to read invoices but not to delete them.",
    ),
    word(
      "Audit",
      "noun",
      "/ˈɔː.dɪt/",
      "A record of who did what, kept so actions can be reviewed later.",
      "Audit — יומן של מי נגע ובמה.",
      "The audit shows which operator downloaded the customer list.",
    ),
    word(
      "Breach",
      "noun",
      "/briːtʃ/",
      "An incident in which protected data or access is exposed.",
      "Breach — פריצה: משהו שהיה סגור נפתח.",
      "A breach exposes email addresses that should have stayed private.",
    ),
    word(
      "Vulnerability",
      "noun",
      "/ˌvʌl.nər.əˈbɪl.ə.ti/",
      "A weakness an attacker could use to cause harm.",
      "Vulnerable — נקודת תורפה שאפשר לנצל.",
      "An outdated library is a vulnerability because a public exploit already exists.",
    ),
    word(
      "Authenticate",
      "verb",
      "/ɔːˈθen.tɪ.keɪt/",
      "To check that a caller really is who they claim to be.",
      "Authentic — בודקים שזה באמת הם.",
      "The service authenticates the user before it shows their account.",
    ),
  ],
  "Data Engineering": [
    word(
      "Query",
      "noun",
      "/ˈkwɪə.ri/",
      "A question asked of a data store, written so it can return matching records.",
      "Query — שאלה אל הנתונים.",
      "The query returns orders placed in the last seven days.",
    ),
    word(
      "Index",
      "noun",
      "/ˈɪn.deks/",
      "A structure that lets a store find matching rows without scanning everything.",
      "Index — מפתח חיפוש, כמו אינדקס בספר.",
      "An index on email makes the lookup fast.",
    ),
    word(
      "Batch",
      "noun",
      "/bætʃ/",
      "A group of records processed together, rather than one by one as they arrive.",
      "Batch — חבילה של רשומות בבת אחת.",
      "The nightly batch rebuilds yesterday's sales totals.",
    ),
    word(
      "Stream",
      "noun",
      "/striːm/",
      "A continuous flow of records handled as they arrive.",
      "Stream — זרם שלא מחכה לסוף היום.",
      "Clicks enter a stream and update the dashboard within seconds.",
    ),
    word(
      "Dataset",
      "noun",
      "/ˈdeɪ.tə.set/",
      "A named collection of related records used together.",
      "Data-set — אוסף נתונים עם שם.",
      "The training dataset holds a year of support tickets.",
    ),
    word(
      "Aggregate",
      "verb",
      "/ˈæɡ.rɪ.ɡeɪt/",
      "To combine many records into one summary value.",
      "Aggregate — מאחדים הרבה שורות למספר אחד.",
      "The job aggregates daily orders into one revenue figure.",
    ),
    word(
      "Ingest",
      "verb",
      "/ɪnˈdʒest/",
      "To take data in from an outside source and store it for later use.",
      "Ingest — בולעים את הנתונים פנימה.",
      "The pipeline ingests files from the partner every hour.",
    ),
    word(
      "Snapshot",
      "noun",
      "/ˈsnæp.ʃɒt/",
      "A copy of data as it was at one moment.",
      "Snap-shot — תמונה של הרגע, לא של מה שיבוא אחר כך.",
      "A snapshot of the table is taken before the migration starts.",
    ),
  ],
};

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickFromBank(domain: string, exclude: string[], count: number, seed?: string) {
  const blocked = new Set(exclude.map((term) => term.toLowerCase()));
  const pool = (WORD_BANK[domain as DomainId] ?? []).filter((entry) => !blocked.has(entry.term.toLowerCase()));
  const random = seed ? mulberry32(hashSeed(seed)) : Math.random;
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool.slice(0, count);
}

export function findBankEntry(term: string) {
  const key = term.trim().toLowerCase();
  for (const entries of Object.values(WORD_BANK)) {
    const found = entries.find((entry) => entry.term.toLowerCase() === key);
    if (found) return found;
  }
  return undefined;
}

const TRANSLATIONS: Record<string, string> = {
  latency: "השהיה",
  throughput: "תפוקה",
  refactor: "לשכתב",
  deploy: "לפרוס",
  rollback: "חזרה לגרסה קודמת",
  cache: "מטמון",
  runtime: "זמן ריצה",
  compile: "להדר",
  consensus: "הסכמה",
  replica: "עותק",
  partition: "ניתוק",
  timeout: "פסק זמן",
  retry: "לנסות שוב",
  quorum: "רוב נדרש",
  failover: "מעבר לגיבוי",
  backlog: "צבר משימות",
  outage: "השבתה",
  region: "אזור",
  scale: "להרחיב",
  tenant: "דייר",
  quota: "מכסה",
  cluster: "אשכול",
  rollout: "פריסה הדרגתית",
  uptime: "זמן פעילות",
  premise: "הנחת מוצא",
  assumption: "הנחה",
  valid: "תקף",
  contradiction: "סתירה",
  inference: "היסק",
  proof: "הוכחה",
  constraint: "אילוץ",
  exception: "חריג",
  endpoint: "נקודת קצה",
  payload: "מטען",
  schema: "סכמה",
  version: "גרסה",
  request: "בקשה",
  response: "תשובה",
  header: "כותרת",
  contract: "חוזה",
  token: "אסימון",
  encrypt: "להצפין",
  secret: "סוד",
  permission: "הרשאה",
  audit: "ביקורת",
  breach: "פריצה",
  vulnerability: "חולשה",
  authenticate: "לאמת",
  query: "שאילתה",
  index: "אינדקס",
  batch: "אצווה",
  stream: "זרם",
  dataset: "מערך נתונים",
  aggregate: "לצבור",
  ingest: "לקלוט",
  snapshot: "צילום מצב",
};

export function hebrewFor(term: string) {
  return TRANSLATIONS[term.trim().toLowerCase()] ?? "";
}
