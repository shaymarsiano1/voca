import type { DomainId } from "@/lib/domains";

export type BankEntry = {
  term: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  mnemonic: string;
  scenario: string;
};

export const WORD_BANK: Record<DomainId, BankEntry[]> = {
  "Software Engineering": [
    {
      term: "Idempotent",
      partOfSpeech: "adjective",
      pronunciation: "/ˌaɪ.dəmˈpoʊ.tənt/",
      definition:
        "An operation is idempotent when repeating it with the same input leaves the system in the same state as doing it once.",
      mnemonic:
        "Idem-potent — אותה מנה, כמה פעמים שלא תזמין: התוצאה נשארת אחת.",
      scenario:
        "A payment API charges once for a given Idempotency-Key, even when the client retries the POST after a timeout.",
    },
    {
      term: "Orthogonal",
      partOfSpeech: "adjective",
      pronunciation: "/ɔːrˈθɒɡ.ən.əl/",
      definition:
        "Two designs are orthogonal when changing one does not force a change in the other.",
      mnemonic: "Ortho-gonal — זווית ישרה: שני צירים שלא מושכים זה את זה.",
      scenario:
        "A team ships a new authentication scheme without rewriting billing, because the modules do not share state.",
    },
    {
      term: "Invariant",
      partOfSpeech: "noun",
      pronunciation: "/ɪnˈveə.ri.ənt/",
      definition:
        "A condition that must remain true before and after every operation on a component.",
      mnemonic: "In-variant — אין וריאנט: הכלל לא משתנה בין הכניסה ליציאה.",
      scenario:
        "A ledger service refuses a transfer unless debits and credits still balance after the write.",
    },
    {
      term: "Reentrant",
      partOfSpeech: "adjective",
      pronunciation: "/riːˈɛn.trənt/",
      definition:
        "Code is reentrant when it can be safely entered again before an earlier invocation has finished.",
      mnemonic: "Re-enter — אפשר להיכנס שוב בלי שהכניסה הקודמת תנעל את הדלת.",
      scenario:
        "An async logging hook calls back into itself while the first call is still flushing a buffer.",
    },
    {
      term: "Deterministic",
      partOfSpeech: "adjective",
      pronunciation: "/dɪˌtɜː.mɪˈnɪs.tɪk/",
      definition:
        "A process is deterministic when the same inputs and starting state always produce the same outputs.",
      mnemonic: "Determine — הגורל נקבע מראש: אין קובייה באמצע החישוב.",
      scenario:
        "A replayable event reducer rebuilds the same account balance from the same log on every instance.",
    },
    {
      term: "Cohesion",
      partOfSpeech: "noun",
      pronunciation: "/kəʊˈhiː.ʒən/",
      definition: "How strongly the responsibilities inside one module belong together.",
      mnemonic: "Co-here — הדברים כאן שייכים זה לזה, לא אוסף מקרי של משימות.",
      scenario:
        "An invoice module that only owns billing rules is more cohesive than one that also renders PDFs and sends mail.",
    },
  ],
  "Distributed Systems": [
    {
      term: "Backpressure",
      partOfSpeech: "noun",
      pronunciation: "/ˈbækˌpreʃ.ər/",
      definition:
        "A signal from a slower consumer that tells upstream producers to slow or stop sending.",
      mnemonic: "Back-pressure — לחץ שחוזר אחורה בצינור כדי שהצינור לא יתפוצץ.",
      scenario:
        "A gRPC handler stops reading when its downstream queue is full, so the sender blocks instead of buffering without a limit.",
    },
    {
      term: "Quorum",
      partOfSpeech: "noun",
      pronunciation: "/ˈkwɔː.rəm/",
      definition:
        "The minimum number of nodes that must agree before a distributed decision is accepted.",
      mnemonic: "Quorum — כמו מניין: בלי רוב מוסכם אין החלטה.",
      scenario: "A Raft cluster commits a log entry only after a majority of replicas acknowledge it.",
    },
    {
      term: "Linearizability",
      partOfSpeech: "noun",
      pronunciation: "/ˌlɪn.i.ər.aɪ.zəˈbɪl.ə.ti/",
      definition:
        "Every operation appears to take effect instantly at a single point between its start and end, in one global order.",
      mnemonic: "Linear — כולם רואים שורה אחת של אירועים, בלי ענפים סותרים.",
      scenario:
        "A lock service makes a successful acquire immediately visible to every other client, with no stale owner.",
    },
    {
      term: "Split-brain",
      partOfSpeech: "noun",
      pronunciation: "/ˌsplɪt ˈbreɪn/",
      definition:
        "A failure in which a cluster divides into parts that each believe they are the authority.",
      mnemonic: "Split-brain — המוח נחצה: שני צדדים בטוחים שהם הבוס.",
      scenario:
        "Two database primaries accept writes during a network partition and later cannot reconcile the rows.",
    },
    {
      term: "Thundering herd",
      partOfSpeech: "noun",
      pronunciation: "/ˈθʌn.dər.ɪŋ hɜːrd/",
      definition:
        "Many waiters wake at once and stampede a resource that has just become available.",
      mnemonic: "Thunder — רעם: כולם מתעוררים יחד ורצים לאותה דלת.",
      scenario:
        "A cache key expires and thousands of app servers miss together, all querying the primary database.",
    },
    {
      term: "Fencing token",
      partOfSpeech: "noun",
      pronunciation: "/ˈfen.sɪŋ ˈtoʊ.kən/",
      definition:
        "A monotonically increasing number that lets storage reject writes from a stale leader.",
      mnemonic: "Fence — גדר: הטוקן סוגר את השער בפני מנהיג שכבר הודח.",
      scenario:
        "After a lease expires, the old writer still flushes, and the disk rejects it because its token is older.",
    },
  ],
  "Cloud Architecture": [
    {
      term: "Control plane",
      partOfSpeech: "noun",
      pronunciation: "/kənˈtroʊl pleɪn/",
      definition:
        "The part of a system that decides configuration and policy, separate from the path that carries user traffic.",
      mnemonic: "Control plane — המגדל, לא המטוסים: מחליטים כאן, טסים שם.",
      scenario:
        "The Kubernetes API server stores desired replica counts, while each kubelet does the pod work.",
    },
    {
      term: "Blast radius",
      partOfSpeech: "noun",
      pronunciation: "/blæst ˈreɪ.di.əs/",
      definition: "How much of a system one failure or bad change can damage.",
      mnemonic: "Blast — פיצוץ: הרדיוס הוא עד איפה הרסיסים מגיעים.",
      scenario: "A bad deploy limited to one cell takes down a single shard instead of every tenant.",
    },
    {
      term: "Cold start",
      partOfSpeech: "noun",
      pronunciation: "/koʊld stɑːrt/",
      definition:
        "The extra latency of creating a fresh runtime before it can serve the first request.",
      mnemonic: "Cold — המנוע כבוי, וההתנעה הראשונה לוקחת זמן.",
      scenario:
        "A scale-to-zero function pays hundreds of milliseconds to boot an isolate when traffic returns.",
    },
    {
      term: "Sidecar",
      partOfSpeech: "noun",
      pronunciation: "/ˈsaɪd.kɑːr/",
      definition:
        "A helper process deployed beside an application to handle a cross-cutting concern.",
      mnemonic: "Side-car — הקרון בצד האופנוע: נוסע צמוד, לא מחליף את הנהג.",
      scenario:
        "An Envoy proxy beside each service terminates mTLS so application code never handles certificates.",
    },
    {
      term: "Canary",
      partOfSpeech: "noun",
      pronunciation: "/kəˈneə.ri/",
      definition:
        "A release that sends a small slice of real traffic to a new version before the full rollout.",
      mnemonic: "Canary — הקנרית במכרה: אם היא נחנקת, עוצרים לפני כולם.",
      scenario:
        "Five percent of checkout requests hit the new pricing service while the error budget is watched.",
    },
    {
      term: "Drift",
      partOfSpeech: "noun",
      pronunciation: "/drɪft/",
      definition: "The gap between declared infrastructure and what is actually running.",
      mnemonic: "Drift — סחיפה: מה שכתוב בקוד כבר לא מה שחי בענן.",
      scenario:
        "Someone opened a security group in the console, so the next plan shows a change nobody committed.",
    },
  ],
  Logic: [
    {
      term: "Contrapositive",
      partOfSpeech: "noun",
      pronunciation: "/ˌkɒn.trəˈpɒz.ə.tɪv/",
      definition:
        "The contrapositive of “if P then Q” is “if not Q then not P”, and it is logically equivalent.",
      mnemonic: "Contra — הופכים את שני הצדדים ושוללים, והמשפט נשאר נאמן.",
      scenario:
        "“If the build is green, the artifact exists” is checked by showing a missing artifact means the build was not green.",
    },
    {
      term: "Soundness",
      partOfSpeech: "noun",
      pronunciation: "/ˈsaʊnd.nəs/",
      definition: "An argument is sound when it is valid and its premises are actually true.",
      mnemonic: "Sound — לא רק שהצורה נכונה, גם העובדות מחזיקות.",
      scenario:
        "A proof that a scheduler is safe is sound only if its assumptions about atomic disk writes hold in production.",
    },
    {
      term: "Vacuous",
      partOfSpeech: "adjective",
      pronunciation: "/ˈvæk.ju.əs/",
      definition:
        "A vacuous truth holds because there are no cases that could disprove the universal claim.",
      mnemonic: "Vacuum — אין דוגמאות נגדיות כי אין דוגמאות בכלל.",
      scenario:
        "“Every message in an empty queue is acknowledged” is true, and it can hide a publisher that never sent anything.",
    },
    {
      term: "Non sequitur",
      partOfSpeech: "noun",
      pronunciation: "/ˌnɒn ˈsek.wɪ.tər/",
      definition: "A conclusion that does not follow from the premises offered.",
      mnemonic: "Non sequitur — המסקנה לא הולכת אחרי מה שנאמר.",
      scenario:
        "“Latency rose after the deploy, therefore the migration corrupted data” skips every other cause.",
    },
    {
      term: "Sufficient",
      partOfSpeech: "adjective",
      pronunciation: "/səˈfɪʃ.ənt/",
      definition:
        "A sufficient condition guarantees the result when it is true, even if other paths could also cause it.",
      mnemonic: "Sufficient — מספיק לבד, לא חייב להיות הדרך היחידה.",
      scenario:
        "A failing health check is sufficient to remove a pod, but a rollout can remove one too.",
    },
    {
      term: "Counterexample",
      partOfSpeech: "noun",
      pronunciation: "/ˈkaʊn.tər.ɪɡˌzæm.pəl/",
      definition: "A specific case that shows a general claim is false.",
      mnemonic: "Counter — דוגמה אחת שמפילה את הכלל.",
      scenario:
        "One interleaving where two transfers lose an update falsifies the claim that the lock is correct.",
    },
  ],
  "API Design": [
    {
      term: "Tolerant Reader",
      partOfSpeech: "noun",
      pronunciation: "/ˈtɒl.ər.ənt ˈriː.dər/",
      definition:
        "A consumer that accepts input a bit broader than the strict contract so old and new senders both work.",
      mnemonic: "Tolerant — הקורא לא נשבר משדה שהוא לא מכיר.",
      scenario:
        "A consumer ignores unknown JSON fields so a producer can add a property without a lockstep deploy.",
    },
    {
      term: "Idempotency-Key",
      partOfSpeech: "noun",
      pronunciation: "/ˌaɪ.dəmˈpɒ.tən.si kiː/",
      definition:
        "A client-supplied identifier that lets the server recognize retries of the same request.",
      mnemonic: "Key — אותו מפתח פותח את אותה פעולה, לא פעולה חדשה.",
      scenario:
        "A mobile client resends a transfer with the same key after a lost response and receives the original receipt.",
    },
    {
      term: "Cursor",
      partOfSpeech: "noun",
      pronunciation: "/ˈkɜː.sər/",
      definition:
        "An opaque position marker used to fetch the next page without skipping or repeating items as writes arrive.",
      mnemonic: "Cursor — סמן על השורה, לא מספר עמוד שיכול לזוז.",
      scenario:
        "An activity feed returns a cursor after the last event id so new inserts at the top do not shift page two.",
    },
    {
      term: "Deprecation",
      partOfSpeech: "noun",
      pronunciation: "/ˌdep.rəˈkeɪ.ʃən/",
      definition: "A formal warning that an interface still works but is scheduled to disappear.",
      mnemonic: "Deprecation — מכריזים שהשער ייסגר, אבל הוא עוד פתוח.",
      scenario: "A Sunset header tells clients the v1 route will stop serving after a published date.",
    },
    {
      term: "Backoff",
      partOfSpeech: "noun",
      pronunciation: "/ˈbæk.ɒf/",
      definition: "A retry delay that grows so a failing dependency has room to recover.",
      mnemonic: "Back-off — צעד אחורה: כל ניסיון מחכה יותר לפני שדופקים שוב.",
      scenario:
        "Workers retry a 429 with exponential delays and jitter instead of hammering the rate limiter.",
    },
    {
      term: "Webhook",
      partOfSpeech: "noun",
      pronunciation: "/ˈweb.hʊk/",
      definition:
        "An HTTP callback a provider sends when something happens, so the client does not have to poll.",
      mnemonic: "Hook — קרס: האירוע תופס אותך, אתה לא יוצא לבדוק כל דקה.",
      scenario:
        "A billing provider POSTs when an invoice is paid, and you verify the signature before updating the account.",
    },
  ],
  "Security Engineering": [
    {
      term: "Least privilege",
      partOfSpeech: "noun",
      pronunciation: "/liːst ˈprɪv.ə.lɪdʒ/",
      definition: "Granting only the access a task requires, and nothing kept “just in case”.",
      mnemonic: "Least — המינימום: המפתח פותח חדר אחד, לא את כל הבניין.",
      scenario: "A deploy role can push to one registry and cannot read production secrets.",
    },
    {
      term: "Attack surface",
      partOfSpeech: "noun",
      pronunciation: "/əˈtæk ˈsɜː.fɪs/",
      definition: "Every place an adversary can try to enter or influence the system.",
      mnemonic: "Surface — כל דלת, פורט ושדה קלט שחשופים למגע.",
      scenario: "Disabling an unused admin port and a debug endpoint shrinks what a scanner can touch.",
    },
    {
      term: "Confused deputy",
      partOfSpeech: "noun",
      pronunciation: "/kənˈfjuːzd ˈdep.jə.ti/",
      definition:
        "A component tricked into misusing its authority on behalf of a less privileged caller.",
      mnemonic: "Deputy — סגן מבולבל: מישהו עם סמכות פועל בשביל מי שאין לו.",
      scenario:
        "A metadata service lets a public VM fetch cloud credentials because the request looks internal.",
    },
    {
      term: "Fail closed",
      partOfSpeech: "verb",
      pronunciation: "/feɪl kloʊzd/",
      definition: "To deny access when an error occurs, rather than allowing it.",
      mnemonic: "Closed — כשיש ספק, הדלת נעולה ולא פתוחה.",
      scenario: "If the policy engine times out, the gateway rejects the request instead of forwarding it.",
    },
    {
      term: "Non-repudiation",
      partOfSpeech: "noun",
      pronunciation: "/ˌnɒn.rɪˌpjuː.diˈeɪ.ʃən/",
      definition:
        "The property that a party cannot credibly deny an action because the evidence is strong.",
      mnemonic: "Non-repudiation — אי אפשר להכחיש: החתימה נשארת.",
      scenario: "Signed audit events show which operator approved a production change.",
    },
    {
      term: "Salt",
      partOfSpeech: "noun",
      pronunciation: "/sɔːlt/",
      definition:
        "A unique random value mixed into a password hash so identical passwords do not produce identical hashes.",
      mnemonic: "Salt — אותה מנה, תיבול שונה: הטבלה המוכנה מראש לא עובדת.",
      scenario:
        "A leaked hash database cannot be matched with one precomputed table because every user had a distinct salt.",
    },
  ],
  "Data Engineering": [
    {
      term: "Cardinality",
      partOfSpeech: "noun",
      pronunciation: "/ˌkɑː.dɪˈnæl.ə.ti/",
      definition:
        "The number of distinct values in a dimension. High cardinality makes storage and queries more expensive.",
      mnemonic: "Cardinal — כמה ערכים ייחודיים יש, לא כמה שורות.",
      scenario: "Putting a raw user id on every metric label explodes a time-series database.",
    },
    {
      term: "Watermark",
      partOfSpeech: "noun",
      pronunciation: "/ˈwɔː.tə.mɑːk/",
      definition:
        "A timestamp the pipeline believes event time has reached, used to decide when a window can close.",
      mnemonic: "Watermark — קו המים: מתחתיו כבר לא מחכים לאירועים ישנים.",
      scenario:
        "A five-minute aggregation closes a window once the watermark passes its end, even if a few events are missing.",
    },
    {
      term: "Tombstone",
      partOfSpeech: "noun",
      pronunciation: "/ˈtuːm.stəʊn/",
      definition:
        "A marker that records a deletion so replicas and compacted logs do not resurrect the record.",
      mnemonic: "Tombstone — מצבה: השורה מתה, והסימן מונע ממנה לקום.",
      scenario:
        "A compacted log keeps a null record so a restarted consumer still learns the key was deleted.",
    },
    {
      term: "Compaction",
      partOfSpeech: "noun",
      pronunciation: "/kəmˈpæk.ʃən/",
      definition: "Rewriting stored data to drop obsolete versions and keep the latest state cheaper to read.",
      mnemonic: "Compact — זורקים טיוטות ישנות ומשאירים את הגרסה שקובעת.",
      scenario: "An LSM store merges files so a read does not scan every historical overwrite of a key.",
    },
    {
      term: "Late event",
      partOfSpeech: "noun",
      pronunciation: "/leɪt ɪˈvent/",
      definition: "A record that arrives after the window it belongs to has already been computed.",
      mnemonic: "Late — האירוע מגיע אחרי שהחלון כבר נסגר.",
      scenario:
        "A mobile client uploads a click an hour later, and the daily rollup has to decide whether to revise yesterday.",
    },
    {
      term: "Partition key",
      partOfSpeech: "noun",
      pronunciation: "/pɑːˈtɪʃ.ən kiː/",
      definition:
        "The value that chooses which shard stores a record, so related data lands together and load can spread.",
      mnemonic: "Partition — המפתח קובע באיזה חדר הרשומה גרה.",
      scenario:
        "Keying by tenant keeps one customer's events together, but a giant tenant becomes a hot partition.",
    },
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
  const primary = (WORD_BANK[domain as DomainId] ?? []).filter(
    (entry) => !blocked.has(entry.term.toLowerCase()),
  );
  const rest = Object.entries(WORD_BANK).flatMap(([name, entries]) =>
    name === domain ? [] : entries.filter((entry) => !blocked.has(entry.term.toLowerCase())),
  );
  const pool = [...primary, ...rest];
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
