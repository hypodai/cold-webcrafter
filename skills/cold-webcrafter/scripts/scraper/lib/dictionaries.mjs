/*
 * Words the scraper looks for, in several languages. They are signals for
 * the auditor, not proof — every claim built on them is verified in the
 * page text first (references/sources.md).
 *
 * Add a language by extending the lists; keep entries lowercase. Stems
 * ("enquir", "poptáv") match more word forms than whole words.
 */

// Text of links and buttons that ask the visitor to act.
export const CTA = [
    // en
    // (no bare "book" or "try": they match "facebook" and "industry")
    'contact', 'enquir', 'inquir', 'get a quote', 'quote', 'order', 'book now', 'book a', 'call us',
    'call now', 'get in touch', 'request', 'consult', 'demo', 'try it', 'try for free', 'learn more',
    'find out more', 'more info', 'reserve', 'get started', 'sign up',
    // cs / sk
    'kontakt', 'poptáv', 'nezávazn', 'objedn', 'zavolej', 'napište', 'zjistit více', 'více informac',
    'rezerv', 'konzultac', 'cenov', 'nabídk', 'vyzkoušet', 'dopyt', 'zavolajte', 'zistiť viac', 'ponuk',
    // de
    'anfrag', 'angebot', 'bestell', 'termin', 'buchen', 'anrufen', 'mehr erfahren', 'beratung',
    // fr
    'devis', 'commander', 'réserv', 'appel', 'en savoir plus', 'rendez-vous',
    // es / pt / it
    'presupuesto', 'pedir', 'reserv', 'llam', 'más información', 'cita', 'orçamento',
    'contatt', 'preventivo', 'ordina', 'prenota', 'chiama', 'scopri',
    // pl / nl
    'zapytan', 'wycen', 'zamów', 'zadzwoń', 'dowiedz', 'offerte', 'bestel', 'reserveer', 'bel ons', 'meer info',
];

// URL path words of the pages a lite preview is built from — services
// (and their sub-pages), contact, about, prices. With a small page cap these
// are scraped first.
export const KEY_PAGES = /servic|leistung|angebot|prestation|servizi|uslug|usług|sluzb|služb|nabid|nabíd|offer|what-we-do|co-delame|contact|kontakt|contatt|about|o-nas|o-mne|uber-uns|über-uns|chi-siamo|qui-sommes|price|pricing|cenik|ceník|preise|tarif/i;

// Button texts of cookie banners that accept and close them.
export const COOKIE_ACCEPT = [
    'accept', 'accept all', 'allow all', 'agree', 'i agree', 'ok', 'got it', 'understood', 'continue',
    'souhlasím', 'přijmout', 'přijmout vše', 'rozumím', 'souhlas', 'povolit vše', 'súhlasím', 'prijať',
    'akzeptieren', 'alle akzeptieren', 'zustimmen', 'einverstanden',
    'accepter', 'tout accepter', "j'accepte", 'aceptar', 'aceptar todo', 'accetta', 'accetto', 'aceitar',
    'akceptuję', 'zgadzam się', 'akceptuj', 'accepteren', 'alles accepteren', 'godta', 'acceptera', 'hyväksy',
];

export const REFERENCES = /reference|testimonial|reviews?\b|recenz|hodnocen|referenz|bewertung|kundenstimmen|avis client|témoignage|opiniones|testimonios|recensioni|opinie|referencje|ervaringen/i;

export const CERTIFICATIONS = /certifi|\biso\s?\d{3,5}|zertifi|akkredit|accredit|licen[cs]ed|osvědčen|certifik|atest|homologa|certyfikat/i;

// "20 years", "500+ clients", "1 200 projects" — usable as real benefits.
export const NUMBER_UNITS = 'years?|yrs|let|roků|rokov|jahre[n]?|ans|años|anni|lat|jaar|'
    + 'clients?|customers?|klient[ůo]w?|zákazník[ůy]|kunden|clientes|clienti|klantes?|'
    + 'projects?|projekt[ůyóe]w?|projets|proyectos|progetti|projecten|'
    + 'employees|staff|zaměstnanc[ůi]|mitarbeiter|employés|empleados|dipendenti|pracowników|'
    + 'realizac[íie]|zakázek|installations|orders|objednávek|countries|zemí|länder|pays|países';

export const PLACEHOLDERS = /lorem ipsum|small title|your text here|add a title|add your text|sample text|insert text|sem vložte|váš text zde|zde napište|ihr text hier|votre texte ici|tu texto aquí|il tuo testo|twój tekst/i;

// iframes from these hosts are maps.
export const MAP_HOSTS = /google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|openstreetmap|mapy\.(?:cz|com)|bing\.com\/maps|here\.com|maps\.apple|yandex\.[a-z]+\/map|waze\.com/i;
