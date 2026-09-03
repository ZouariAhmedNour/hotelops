// prisma/seed.ts
/**
 * Seed du module « services hôteliers » de HotelOps.
 *
 * Objectif : après un `npx prisma db seed`, l'app mobile doit trouver du
 * contenu dans TOUS les écrans du module (catalogue, room service, restaurant,
 * spa, loisirs, « mes demandes »).
 *
 * Trois principes tenus dans tout le fichier :
 *
 *  1. IDEMPOTENT. On peut le relancer autant de fois qu'on veut.
 *     - le catalogue (catégories, articles, options, créneaux, salles, tables,
 *       thérapeutes) est *upserté* sur sa clé naturelle : les identifiants ne
 *       bougent pas, les modifications faites à la main sont écrasées mais rien
 *       n'est dupliqué ;
 *     - les commandes et réservations de démonstration sont préfixées
 *       `SO-DEMO-` / `BK-DEMO-` et supprimées puis recréées à chaque exécution
 *       (les lignes et l'historique suivent grâce aux `onDelete: Cascade`).
 *
 *  2. COHÉRENT AVEC LES RÈGLES MÉTIER. Les créneaux (`ServiceSlot`) ne sont pas
 *     décoratifs : `assertSlotAvailability` et `assertRestaurantOpen` refusent
 *     toute réservation qui sort des créneaux. Ceux semés ici sont donc larges
 *     et couvrent les horaires des réservations de démonstration — sinon tu
 *     verrais des « Aucun créneau d'ouverture ne couvre 20:00 » en testant.
 *
 *  3. RATTACHÉ À UN VRAI UTILISATEUR. Le mobile appelle les listes avec
 *     `mine=true`, qui filtre sur `userId`. Des commandes sans `userId` seraient
 *     invisibles dans « Mes demandes ». Le seed cherche donc un utilisateur
 *     existant (voir `resolveDemoUser`) et lui rattache toute la démo.
 *
 * Utilisation :
 *   npx prisma generate            # obligatoire, sinon prisma.serviceCategory n'existe pas
 *   npx prisma db seed             # exécution normale
 *   SEED_USER_EMAIL=client@hotel.tn npx prisma db seed   # cibler un compte précis
 *   SEED_RESET=1 npx prisma db seed                      # vider le module avant de resemer
 *
 * Aucune table hors module services n'est touchée : ni User, ni Role, ni
 * maintenance. Le seed lit la table User, il n'y écrit jamais.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* ================================================================== *
 *  1. HELPERS
 * ================================================================== */

const DAY_MS = 86_400_000;

/** Minuit UTC du jour courant, décalé de `offsetDays` jours. */
function utcDay(offsetDays: number): Date {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(midnight + offsetDays * DAY_MS);
}

/**
 * Instant précis en UTC, pour les `createdAt` / `deliveredAt` de la démo.
 * `bookingDate` NE passe PAS par ici : le backend la normalise à minuit UTC
 * (`startOfUtcDay`), une heure dedans casserait les comparaisons de date.
 */
function utcAt(offsetDays: number, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(utcDay(offsetDays).getTime() + hours * 3_600_000 + minutes * 60_000);
}

/**
 * Prochaine date (dans les 14 jours, à partir de `minOffset`) dont le jour de
 * semaine figure dans `days`. Sert à poser l'excursion sur un jour où elle a
 * réellement un créneau, quel que soit le jour où tu lances le seed.
 */
function nextDayMatching(days: readonly number[], minOffset = 1): Date {
  for (let offset = minOffset; offset < minOffset + 14; offset += 1) {
    const candidate = utcDay(offset);
    if (days.includes(candidate.getUTCDay())) return candidate;
  }
  return utcDay(minOffset);
}

/** 0 = dimanche … 6 = samedi, comme `getUTCDay()` et comme `ServiceSlot.dayOfWeek`. */
const ALL_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * Photos de démonstration. Picsum renvoie une image stable pour une graine
 * donnée : remplace ces URL par tes vraies photos quand tu en auras.
 */
function photo(slug: string): string {
  return `https://picsum.photos/seed/hotelops-${slug}/800/600`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function log(step: string, detail: string): void {
  console.log(`  ${step.padEnd(14)} ${detail}`);
}

/* ================================================================== *
 *  2. TYPES ET UPSERTS
 * ================================================================== */

type CategorySeed = {
  key: string;
  code: string;
  name: string;
  domain: string;
  icon: string;
  description: string;
  sortOrder: number;
};

type SeededCategory = { id: number; code: string; domain: string };

type ItemSeed = {
  key: string;
  category: string;
  name: string;
  description: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  durationMinutes?: number;
  prepTimeMinutes?: number;
  allergens?: string[];
  sortOrder?: number;
  options?: Array<{ name: string; priceDelta?: number }>;
  supplements?: Array<{ name: string; price: number }>;
};

type SeededItem = {
  id: number;
  name: string;
  price: number | null;
  categoryId: number;
  options: Record<string, { id: number; priceDelta: number }>;
  supplements: Record<string, { id: number; price: number }>;
};

/** Clé naturelle : `code`. Un simple upsert suffit. */
async function upsertCategory(seed: CategorySeed): Promise<SeededCategory> {
  const data = {
    name: seed.name,
    domain: seed.domain,
    icon: seed.icon,
    description: seed.description,
    sortOrder: seed.sortOrder,
    isActive: true,
  };

  const category = await prisma.serviceCategory.upsert({
    where: { code: seed.code },
    update: data,
    create: { ...data, code: seed.code },
    select: { id: true, code: true, domain: true },
  });

  return category;
}

/**
 * `ServiceItem` n'a pas de contrainte d'unicité en base : on prend
 * (categoryId, name) comme clé naturelle pour rester idempotent sans toucher
 * au schéma. Deux articles homonymes dans la même catégorie n'auraient de
 * toute façon aucun sens côté client.
 */
async function upsertItem(seed: ItemSeed, category: SeededCategory): Promise<SeededItem> {
  const data = {
    categoryId: category.id,
    domain: category.domain,
    name: seed.name,
    description: seed.description,
    photos: [photo(seed.key)],
    price: seed.price ?? null,
    priceMin: seed.priceMin ?? null,
    priceMax: seed.priceMax ?? null,
    durationMinutes: seed.durationMinutes ?? null,
    prepTimeMinutes: seed.prepTimeMinutes ?? null,
    allergens: seed.allergens ?? [],
    isAvailable: true,
    isActive: true,
    sortOrder: seed.sortOrder ?? 0,
  };

  const existing = await prisma.serviceItem.findFirst({
    where: { categoryId: category.id, name: seed.name },
    select: { id: true },
  });

  const item = existing
    ? await prisma.serviceItem.update({
        where: { id: existing.id },
        data,
        select: { id: true, name: true, price: true, categoryId: true },
      })
    : await prisma.serviceItem.create({
        data,
        select: { id: true, name: true, price: true, categoryId: true },
      });

  const options: Record<string, { id: number; priceDelta: number }> = {};
  for (const option of seed.options ?? []) {
    const found = await prisma.serviceItemOption.findFirst({
      where: { itemId: item.id, name: option.name },
      select: { id: true },
    });
    const priceDelta = option.priceDelta ?? 0;
    const payload = { name: option.name, priceDelta, isActive: true };
    const saved = found
      ? await prisma.serviceItemOption.update({ where: { id: found.id }, data: payload })
      : await prisma.serviceItemOption.create({ data: { ...payload, itemId: item.id } });
    options[option.name] = { id: saved.id, priceDelta };
  }

  const supplements: Record<string, { id: number; price: number }> = {};
  for (const supplement of seed.supplements ?? []) {
    const found = await prisma.serviceItemSupplement.findFirst({
      where: { itemId: item.id, name: supplement.name },
      select: { id: true },
    });
    const payload = { name: supplement.name, price: supplement.price, isActive: true };
    const saved = found
      ? await prisma.serviceItemSupplement.update({ where: { id: found.id }, data: payload })
      : await prisma.serviceItemSupplement.create({ data: { ...payload, itemId: item.id } });
    supplements[supplement.name] = { id: saved.id, price: supplement.price };
  }

  return {
    id: item.id,
    name: item.name,
    price: item.price === null ? null : Number(item.price),
    categoryId: item.categoryId,
    options,
    supplements,
  };
}

/**
 * Un créneau est identifié par sa portée (article OU catégorie), son jour et
 * son heure de début — exactement ce que `assertNoSlotOverlap` considère comme
 * un doublon côté API.
 */
async function upsertSlot(params: {
  itemId?: number;
  categoryId?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity?: number | null;
}): Promise<void> {
  const scope = {
    itemId: params.itemId ?? null,
    categoryId: params.categoryId ?? null,
  };

  const existing = await prisma.serviceSlot.findFirst({
    where: { ...scope, dayOfWeek: params.dayOfWeek, startTime: params.startTime },
    select: { id: true },
  });

  const data = {
    ...scope,
    dayOfWeek: params.dayOfWeek,
    startTime: params.startTime,
    endTime: params.endTime,
    capacity: params.capacity ?? null,
    isActive: true,
  };

  if (existing) {
    await prisma.serviceSlot.update({ where: { id: existing.id }, data });
  } else {
    await prisma.serviceSlot.create({ data });
  }
}

/** Pose le même créneau sur plusieurs jours de la semaine. */
async function upsertSlotOnDays(
  days: readonly number[],
  params: {
    itemId?: number;
    categoryId?: number;
    startTime: string;
    endTime: string;
    capacity?: number | null;
  },
): Promise<void> {
  for (const dayOfWeek of days) {
    await upsertSlot({ ...params, dayOfWeek });
  }
}

/* ================================================================== *
 *  3. DONNÉES DU CATALOGUE
 * ================================================================== */

const CATEGORIES: CategorySeed[] = [
  {
    key: 'breakfast',
    code: 'RS_BREAKFAST',
    name: 'Petit-déjeuner',
    domain: 'ROOM_SERVICE',
    icon: 'coffee',
    description: 'Servi en chambre de 6h30 à 11h00.',
    sortOrder: 1,
  },
  {
    key: 'mains',
    code: 'RS_MAIN',
    name: 'Plats & snacks',
    domain: 'ROOM_SERVICE',
    icon: 'room-service',
    description: 'La carte du room service, 24h/24.',
    sortOrder: 2,
  },
  {
    key: 'drinks',
    code: 'RS_DRINKS',
    name: 'Boissons',
    domain: 'ROOM_SERVICE',
    icon: 'glass-cocktail',
    description: 'Boissons fraîches, chaudes et carte des vins.',
    sortOrder: 3,
  },
  {
    key: 'restaurant',
    code: 'RESTO_TABLE',
    name: 'Nos restaurants',
    domain: 'RESTAURANT',
    icon: 'silverware-fork-knife',
    description: 'Réservez votre table en salle, en terrasse ou au rooftop.',
    sortOrder: 10,
  },
  {
    key: 'massage',
    code: 'SPA_MASSAGE',
    name: 'Massages',
    domain: 'SPA',
    icon: 'spa',
    description: 'Massages signature par nos thérapeutes diplômés.',
    sortOrder: 20,
  },
  {
    key: 'soins',
    code: 'SPA_SOIN',
    name: 'Soins visage & corps',
    domain: 'SPA',
    icon: 'flower',
    description: 'Rituels hammam, gommages et soins du visage.',
    sortOrder: 21,
  },
  {
    key: 'kids',
    code: 'KIDS_CLUB',
    name: 'Espace enfants',
    domain: 'PLAYROOM',
    icon: 'teddy-bear',
    description: 'Kids club encadré, ateliers et animations.',
    sortOrder: 30,
  },
  {
    key: 'pool',
    code: 'POOL_AREA',
    name: 'Piscines & cabanas',
    domain: 'POOL',
    icon: 'pool',
    description: 'Cabanas privées, transats premium et cours de natation.',
    sortOrder: 40,
  },
  {
    key: 'fitness',
    code: 'FITNESS_ROOM',
    name: 'Fitness & coaching',
    domain: 'FITNESS',
    icon: 'dumbbell',
    description: 'Salle équipée, coachs certifiés et cours collectifs.',
    sortOrder: 50,
  },
  {
    key: 'activity',
    code: 'EXCURSION',
    name: 'Excursions & activités',
    domain: 'ACTIVITY',
    icon: 'map-marker-radius',
    description: 'Sorties encadrées au départ de l’hôtel.',
    sortOrder: 60,
  },
  {
    key: 'concierge',
    code: 'CONCIERGE',
    name: 'Conciergerie',
    domain: 'CONCIERGERIE',
    icon: 'bell-ring',
    description: 'Transferts, billetterie et demandes sur mesure.',
    sortOrder: 70,
  },
];

const ITEMS: ItemSeed[] = [
  /* ---------------- ROOM SERVICE — petit-déjeuner ---------------- */
  {
    key: 'continental',
    category: 'breakfast',
    name: 'Petit-déjeuner continental',
    description:
      'Viennoiseries du jour, pain artisanal, beurre et confitures maison, jus pressé et boisson chaude.',
    price: 24,
    prepTimeMinutes: 20,
    allergens: ['gluten', 'lait', 'fruits à coque'],
    sortOrder: 1,
    options: [
      { name: 'Boisson chaude : café' },
      { name: 'Boisson chaude : thé' },
      { name: 'Boisson chaude : chocolat', priceDelta: 1.5 },
    ],
    supplements: [
      { name: 'Œufs brouillés', price: 6 },
      { name: 'Saumon fumé', price: 9 },
      { name: 'Corbeille de fruits frais', price: 7 },
    ],
  },
  {
    key: 'benedict',
    category: 'breakfast',
    name: 'Œufs Bénédicte',
    description: 'Muffin toasté, jambon blanc, œufs pochés et sauce hollandaise.',
    price: 18.5,
    prepTimeMinutes: 18,
    allergens: ['gluten', 'œuf', 'lait'],
    sortOrder: 2,
  },
  {
    key: 'acai',
    category: 'breakfast',
    name: 'Bowl açaï & fruits frais',
    description: 'Açaï, banane, granola maison, graines de chia et miel de romarin.',
    price: 14,
    prepTimeMinutes: 10,
    allergens: ['fruits à coque'],
    sortOrder: 3,
  },

  /* ---------------- ROOM SERVICE — plats ---------------- */
  {
    key: 'club',
    category: 'mains',
    name: 'Club sandwich maison',
    description: 'Poulet fermier, bacon, œuf, tomate et salade, servi avec frites maison.',
    price: 21,
    prepTimeMinutes: 20,
    allergens: ['gluten', 'œuf', 'lait'],
    sortOrder: 1,
    options: [
      { name: 'Pain de mie classique' },
      { name: 'Pain complet' },
      { name: 'Sans mayonnaise' },
    ],
    supplements: [
      { name: 'Frites maison', price: 4 },
      { name: 'Salade verte', price: 3 },
      { name: 'Œuf supplémentaire', price: 2 },
    ],
  },
  {
    key: 'burger',
    category: 'mains',
    name: 'Burger Grand Palace',
    description: 'Bœuf Angus 200 g, cheddar affiné, oignons confits, sauce secrète du chef.',
    price: 27,
    prepTimeMinutes: 25,
    allergens: ['gluten', 'lait', 'sésame', 'moutarde'],
    sortOrder: 2,
    options: [{ name: 'Saignant' }, { name: 'À point' }, { name: 'Bien cuit' }],
    supplements: [
      { name: 'Bacon croustillant', price: 3.5 },
      { name: 'Double cheddar', price: 2.5 },
      { name: 'Frites à la truffe', price: 6 },
    ],
  },
  {
    key: 'cesar',
    category: 'mains',
    name: 'Salade César au poulet',
    description: 'Sucrine, poulet grillé, copeaux de parmesan, croûtons à l’ail et sauce César.',
    price: 19,
    prepTimeMinutes: 15,
    allergens: ['gluten', 'œuf', 'poisson', 'lait'],
    sortOrder: 3,
  },
  {
    key: 'penne',
    category: 'mains',
    name: 'Penne all’arrabbiata',
    description: 'Pâtes fraîches, tomates San Marzano, piment doux et basilic.',
    price: 17.5,
    prepTimeMinutes: 18,
    allergens: ['gluten'],
    sortOrder: 4,
  },
  {
    key: 'fromages',
    category: 'mains',
    name: 'Assiette de fromages affinés',
    description: 'Cinq fromages de la région, confiture de figues et pain aux noix.',
    price: 16,
    prepTimeMinutes: 10,
    allergens: ['lait', 'gluten', 'fruits à coque'],
    sortOrder: 5,
  },

  /* ---------------- ROOM SERVICE — boissons ---------------- */
  {
    key: 'jus',
    category: 'drinks',
    name: 'Jus d’orange pressé',
    description: 'Oranges pressées à la commande, 33 cl.',
    price: 8,
    prepTimeMinutes: 5,
    sortOrder: 1,
  },
  {
    key: 'menthe',
    category: 'drinks',
    name: 'Théière de thé à la menthe',
    description: 'Thé vert, menthe fraîche et pignons de pin, pour deux personnes.',
    price: 7.5,
    prepTimeMinutes: 8,
    allergens: ['fruits à coque'],
    sortOrder: 2,
  },
  {
    key: 'vin',
    category: 'drinks',
    name: 'Vin rouge — Domaine de l’Atlas',
    description: 'Bouteille 75 cl, assemblage syrah et carignan.',
    price: 45,
    prepTimeMinutes: 5,
    allergens: ['sulfites'],
    sortOrder: 3,
  },
  {
    key: 'sodas',
    category: 'drinks',
    name: 'Sélection de sodas',
    description: 'Canette 33 cl au choix.',
    price: 5,
    prepTimeMinutes: 5,
    sortOrder: 4,
  },

  /* ---------------- RESTAURANT ---------------- */
  {
    key: 'gastro',
    category: 'restaurant',
    name: 'Dîner gastronomique — Le Cèdre',
    description: 'Menu en cinq services du chef, en salle principale. Tenue correcte exigée.',
    priceMin: 65,
    priceMax: 120,
    durationMinutes: 120,
    sortOrder: 1,
  },
  {
    key: 'brunch',
    category: 'restaurant',
    name: 'Brunch du dimanche',
    description: 'Buffet salé et sucré, boissons chaudes incluses, servi en terrasse.',
    price: 45,
    durationMinutes: 120,
    sortOrder: 2,
  },
  {
    key: 'chefTable',
    category: 'restaurant',
    name: 'Table du Chef — Rooftop',
    description:
      'Six couverts face aux cuisines du rooftop, menu surprise commenté par le chef. Du mercredi au samedi uniquement.',
    price: 150,
    durationMinutes: 150,
    sortOrder: 3,
  },

  /* ---------------- SPA — massages ---------------- */
  {
    key: 'suedois',
    category: 'massage',
    name: 'Massage suédois 60 min',
    description: 'Massage tonique du dos et des jambes, pression moyenne à forte.',
    price: 90,
    durationMinutes: 60,
    sortOrder: 1,
  },
  {
    key: 'pierres',
    category: 'massage',
    name: 'Massage aux pierres chaudes 75 min',
    description: 'Pierres de basalte chauffées et huile d’argan, relâchement profond.',
    price: 120,
    durationMinutes: 75,
    sortOrder: 2,
  },
  {
    key: 'balinais',
    category: 'massage',
    name: 'Massage balinais 90 min',
    description: 'Étirements, acupression et huiles essentielles, corps entier.',
    price: 145,
    durationMinutes: 90,
    sortOrder: 3,
  },

  /* ---------------- SPA — soins ---------------- */
  {
    key: 'visage',
    category: 'soins',
    name: 'Soin visage éclat 50 min',
    description: 'Nettoyage, gommage enzymatique, masque hydratant et modelage.',
    price: 85,
    durationMinutes: 50,
    sortOrder: 1,
  },
  {
    key: 'hammam',
    category: 'soins',
    name: 'Hammam & gommage au savon noir',
    description: 'Hammam traditionnel, gommage au gant de kessa et enveloppement au rhassoul.',
    price: 70,
    durationMinutes: 45,
    sortOrder: 2,
  },
  {
    key: 'rituel',
    category: 'soins',
    name: 'Rituel Grand Palace 120 min',
    description: 'Hammam, gommage, massage 60 min et soin du visage. Notre signature.',
    price: 210,
    durationMinutes: 120,
    sortOrder: 3,
  },

  /* ---------------- PLAYROOM ---------------- */
  {
    key: 'kidsHalfDay',
    category: 'kids',
    name: 'Kids Club — demi-journée (3-10 ans)',
    description: 'Encadrement par nos animateurs, goûter inclus, de 9h à 12h ou de 14h à 17h.',
    price: 35,
    durationMinutes: 180,
    sortOrder: 1,
  },
  {
    key: 'atelier',
    category: 'kids',
    name: 'Atelier pâtisserie enfants',
    description: 'Les enfants préparent leur goûter avec le pâtissier de l’hôtel.',
    price: 25,
    durationMinutes: 90,
    allergens: ['gluten', 'œuf', 'lait'],
    sortOrder: 2,
  },
  {
    key: 'cinema',
    category: 'kids',
    name: 'Soirée cinéma & popcorn',
    description: 'Projection dans la salle de jeux, plaid et popcorn fournis.',
    price: 15,
    durationMinutes: 120,
    sortOrder: 3,
  },

  /* ---------------- POOL ---------------- */
  {
    key: 'cabana',
    category: 'pool',
    name: 'Cabana privée — piscine principale',
    description: 'Cabana ombragée pour quatre, service dédié, corbeille de fruits offerte.',
    price: 120,
    durationMinutes: 240,
    sortOrder: 1,
  },
  {
    key: 'transat',
    category: 'pool',
    name: 'Transat premium bord de piscine',
    description: 'Première ligne, parasol, serviettes et bouteille d’eau incluses.',
    price: 25,
    durationMinutes: 240,
    sortOrder: 2,
  },
  {
    key: 'natation',
    category: 'pool',
    name: 'Cours de natation particulier',
    description: 'Séance individuelle avec un maître-nageur diplômé.',
    price: 60,
    durationMinutes: 45,
    sortOrder: 3,
  },

  /* ---------------- FITNESS ---------------- */
  {
    key: 'coaching',
    category: 'fitness',
    name: 'Coaching personnel 60 min',
    description: 'Bilan, programme sur mesure et séance encadrée.',
    price: 70,
    durationMinutes: 60,
    sortOrder: 1,
  },
  {
    key: 'yoga',
    category: 'fitness',
    name: 'Cours de yoga sunrise',
    description: 'Vinyasa doux face à la mer, tapis fournis. Uniquement de 7h à 8h30.',
    price: 30,
    durationMinutes: 60,
    sortOrder: 2,
  },
  {
    key: 'aquagym',
    category: 'fitness',
    name: 'Séance d’aquagym',
    description: 'Cours collectif en petit bassin, tous niveaux.',
    price: 25,
    durationMinutes: 45,
    sortOrder: 3,
  },

  /* ---------------- ACTIVITY ---------------- */
  {
    key: 'desert',
    category: 'activity',
    name: 'Excursion désert 4x4 — journée',
    description:
      'Départ 7h, déjeuner sous tente berbère, retour en fin d’après-midi. Lundi, mercredi et vendredi.',
    priceMin: 180,
    priceMax: 240,
    durationMinutes: 480,
    sortOrder: 1,
  },
  {
    key: 'cheval',
    category: 'activity',
    name: 'Balade à cheval au coucher du soleil',
    description: 'Deux heures le long de la plage, accompagnées par notre écurie partenaire.',
    price: 95,
    durationMinutes: 120,
    sortOrder: 2,
  },
  {
    key: 'cuisine',
    category: 'activity',
    name: 'Cours de cuisine tunisienne',
    description: 'Marché, préparation et dégustation avec le chef. Tablier offert.',
    price: 75,
    durationMinutes: 150,
    allergens: ['gluten', 'poisson'],
    sortOrder: 3,
  },

  /* ---------------- CONCIERGERIE ---------------- */
  {
    key: 'transfert',
    category: 'concierge',
    name: 'Transfert aéroport privé',
    description: 'Berline avec chauffeur, accueil en salle d’arrivée, bagages pris en charge.',
    priceMin: 45,
    priceMax: 80,
    durationMinutes: 60,
    sortOrder: 1,
  },
  {
    key: 'billetterie',
    category: 'concierge',
    name: 'Billetterie & spectacles',
    description: 'Nous réservons vos places : concerts, musées, événements sportifs. Sur devis.',
    sortOrder: 2,
  },
  {
    key: 'chauffeur',
    category: 'concierge',
    name: 'Voiture avec chauffeur à la journée',
    description: 'Huit heures à disposition, carburant et péages inclus.',
    priceMin: 150,
    priceMax: 300,
    durationMinutes: 480,
    sortOrder: 3,
  },
];

/* ================================================================== *
 *  4. UTILISATEUR DE DÉMONSTRATION
 * ================================================================== */

/**
 * Le mobile liste les commandes avec `mine=true`, qui filtre sur `userId`.
 * Sans utilisateur rattaché, « Mes demandes » resterait désespérément vide.
 *
 * Ordre de recherche : SEED_USER_EMAIL, puis un compte client, puis le premier
 * utilisateur venu. On ne crée jamais d'utilisateur : c'est le domaine du
 * module auth, pas celui-ci.
 */
async function resolveDemoUser(): Promise<{ id: number; email: string } | null> {
  const wanted = process.env.SEED_USER_EMAIL?.trim();

  if (wanted) {
    const target = await prisma.user.findUnique({
      where: { email: wanted },
      select: { id: true, email: true },
    });
    if (target) return target;
    console.warn(`  ⚠  SEED_USER_EMAIL="${wanted}" introuvable, on retombe sur la détection automatique.`);
  }

  const client = await prisma.user.findFirst({
    where: { isActive: true, role: { code: { in: ['USER', 'CLIENT', 'GUEST'] } } },
    orderBy: { id: 'asc' },
    select: { id: true, email: true },
  });
  if (client) return client;

  return prisma.user.findFirst({
    orderBy: { id: 'asc' },
    select: { id: true, email: true },
  });
}

/* ================================================================== *
 *  5. REMISE À ZÉRO OPTIONNELLE
 * ================================================================== */

/**
 * Ne vide QUE les tables du module services, dans l'ordre des dépendances.
 * Les tables maintenance, User et Role ne sont jamais touchées.
 */
async function resetServiceModule(): Promise<void> {
  await prisma.serviceOrderEvent.deleteMany();
  await prisma.serviceOrderLine.deleteMany();
  await prisma.serviceOrder.deleteMany();

  await prisma.serviceBookingEvent.deleteMany();
  await prisma.serviceBooking.deleteMany();

  await prisma.spaTreatmentTherapist.deleteMany();
  await prisma.spaTreatment.deleteMany();
  await prisma.spaTherapist.deleteMany();

  await prisma.restaurantTable.deleteMany();
  await prisma.restaurantRoom.deleteMany();

  await prisma.serviceSlot.deleteMany();
  await prisma.serviceItemSupplement.deleteMany();
  await prisma.serviceItemOption.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.serviceCategory.deleteMany();

  log('reset', 'toutes les tables du module services ont été vidées');
}

/* ================================================================== *
 *  6. SEED PRINCIPAL
 * ================================================================== */

async function main(): Promise<void> {
  console.log('\n▶ Seed du module « services hôteliers »\n');

  if (process.env.SEED_RESET === '1') {
    await resetServiceModule();
  }

  const demoUser = await resolveDemoUser();
  const userId = demoUser?.id ?? null;
  log(
    'utilisateur',
    demoUser
      ? `commandes et réservations rattachées à ${demoUser.email} (#${demoUser.id})`
      : '⚠ aucun utilisateur en base : la démo sera anonyme et « Mes demandes » restera vide',
  );

  /* ---------- 6.1 Catégories ---------- */

  const categories: Record<string, SeededCategory> = {};
  for (const seed of CATEGORIES) {
    categories[seed.key] = await upsertCategory(seed);
  }
  log('catégories', `${CATEGORIES.length} catégories sur 8 domaines`);

  /* ---------- 6.2 Articles, options et suppléments ---------- */

  const items: Record<string, SeededItem> = {};
  for (const seed of ITEMS) {
    const category = categories[seed.category];
    if (!category) throw new Error(`Catégorie inconnue « ${seed.category} » pour l'article ${seed.key}`);
    items[seed.key] = await upsertItem(seed, category);
  }
  log('articles', `${ITEMS.length} articles, options et suppléments inclus`);

  /* ---------- 6.3 Créneaux ----------
   * Les créneaux de CATÉGORIE définissent les horaires d'ouverture ; ceux
   * d'ARTICLE sont prioritaires et écrasent complètement ceux de la catégorie
   * (cf. assertSlotAvailability). D'où le yoga limité à 7h-8h30 : ce n'est pas
   * un oubli, c'est la démonstration de la priorité article > catégorie.
   */

  // Restaurant : indispensable, assertRestaurantOpen lit les créneaux de
  // catégorie du domaine RESTAURANT pour valider toute réservation de table.
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.restaurant.id,
    startTime: '12:00',
    endTime: '15:00',
  });
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.restaurant.id,
    startTime: '19:00',
    endTime: '23:30',
  });

  // Spa : ouverture large, pas de plafond de capacité (un thérapeute ne peut de
  // toute façon pas être réservé deux fois au même moment).
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.massage.id,
    startTime: '09:00',
    endTime: '20:00',
  });
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.soins.id,
    startTime: '09:00',
    endTime: '20:00',
  });

  // Loisirs.
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.kids.id,
    startTime: '09:00',
    endTime: '19:00',
    capacity: 20,
  });
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.pool.id,
    startTime: '07:00',
    endTime: '20:00',
  });
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.fitness.id,
    startTime: '06:00',
    endTime: '22:00',
  });
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.activity.id,
    startTime: '07:00',
    endTime: '19:00',
  });
  await upsertSlotOnDays(ALL_WEEK, {
    categoryId: categories.concierge.id,
    startTime: '00:00',
    endTime: '23:59',
  });

  // Créneaux d'article, prioritaires sur ceux de leur catégorie.
  await upsertSlotOnDays(ALL_WEEK, {
    itemId: items.yoga.id,
    startTime: '07:00',
    endTime: '08:30',
    capacity: 12,
  });
  await upsertSlotOnDays([3, 4, 5, 6], {
    itemId: items.chefTable.id,
    startTime: '19:00',
    endTime: '23:00',
    capacity: 1,
  });
  await upsertSlotOnDays([1, 3, 5], {
    itemId: items.desert.id,
    startTime: '07:00',
    endTime: '16:00',
    capacity: 8,
  });
  await upsertSlotOnDays([0], {
    itemId: items.brunch.id,
    startTime: '11:00',
    endTime: '15:00',
    capacity: 40,
  });

  const slotCount = await prisma.serviceSlot.count();
  log('créneaux', `${slotCount} créneaux actifs (catégorie + article)`);

  /* ---------- 6.4 Spa : thérapeutes et soins ---------- */

  const THERAPISTS = [
    { firstName: 'Yasmine', lastName: 'Haddad', gender: 'FEMALE' },
    { firstName: 'Nour', lastName: 'Bouazizi', gender: 'FEMALE' },
    { firstName: 'Sofia', lastName: 'Trabelsi', gender: 'FEMALE' },
    { firstName: 'Karim', lastName: 'Lahmar', gender: 'MALE' },
    { firstName: 'Mehdi', lastName: 'Gharbi', gender: 'MALE' },
  ];

  const therapists: Record<string, number> = {};
  for (const seed of THERAPISTS) {
    const existing = await prisma.spaTherapist.findFirst({
      where: { firstName: seed.firstName, lastName: seed.lastName },
      select: { id: true },
    });
    const data = {
      ...seed,
      photo: photo(`therapist-${seed.firstName.toLowerCase()}`),
      isActive: true,
    };
    const saved = existing
      ? await prisma.spaTherapist.update({ where: { id: existing.id }, data })
      : await prisma.spaTherapist.create({ data });
    therapists[seed.firstName] = saved.id;
  }

  /**
   * `genderPreference` sur le soin = contrainte, pas préférence du client :
   * assertTherapistsCompatible refuse d'associer un thérapeute dont le genre
   * ne correspond pas. Le hammam est donc réservé aux thérapeutes femmes.
   */
  const TREATMENTS: Array<{
    itemKey: string;
    genderPreference: string;
    allowTherapistChoice: boolean;
    therapists: string[];
  }> = [
    {
      itemKey: 'suedois',
      genderPreference: 'NO_PREFERENCE',
      allowTherapistChoice: true,
      therapists: ['Yasmine', 'Karim', 'Mehdi'],
    },
    {
      itemKey: 'pierres',
      genderPreference: 'NO_PREFERENCE',
      allowTherapistChoice: true,
      therapists: ['Nour', 'Karim'],
    },
    {
      itemKey: 'balinais',
      genderPreference: 'NO_PREFERENCE',
      allowTherapistChoice: true,
      therapists: ['Yasmine', 'Sofia', 'Mehdi'],
    },
    {
      itemKey: 'visage',
      genderPreference: 'FEMALE',
      allowTherapistChoice: true,
      therapists: ['Nour', 'Sofia'],
    },
    {
      itemKey: 'hammam',
      genderPreference: 'FEMALE',
      allowTherapistChoice: false,
      therapists: ['Yasmine', 'Sofia'],
    },
    {
      itemKey: 'rituel',
      genderPreference: 'NO_PREFERENCE',
      allowTherapistChoice: true,
      therapists: ['Yasmine', 'Nour', 'Karim', 'Mehdi'],
    },
  ];

  for (const seed of TREATMENTS) {
    const item = items[seed.itemKey];
    const data = {
      genderPreference: seed.genderPreference,
      allowTherapistChoice: seed.allowTherapistChoice,
    };

    const treatment = await prisma.spaTreatment.upsert({
      where: { itemId: item.id },
      update: data,
      create: { ...data, itemId: item.id },
      select: { id: true },
    });

    for (const name of seed.therapists) {
      await prisma.spaTreatmentTherapist.upsert({
        where: {
          treatmentId_therapistId: { treatmentId: treatment.id, therapistId: therapists[name] },
        },
        update: {},
        create: { treatmentId: treatment.id, therapistId: therapists[name] },
      });
    }
  }
  log('spa', `${THERAPISTS.length} thérapeutes, ${TREATMENTS.length} soins rattachés`);

  /* ---------- 6.5 Restaurant : salles et tables ---------- */

  const ROOMS = [
    { code: 'R-MAIN', name: 'Salle principale — Le Cèdre', type: 'INTERIEUR', capacity: 80 },
    { code: 'R-TERRACE', name: 'Terrasse jardin', type: 'TERRASSE', capacity: 40 },
    { code: 'R-ROOFTOP', name: 'Rooftop Infinity', type: 'ROOFTOP', capacity: 30 },
  ];

  const rooms: Record<string, number> = {};
  for (const seed of ROOMS) {
    const data = { name: seed.name, type: seed.type, capacity: seed.capacity, isActive: true };
    const saved = await prisma.restaurantRoom.upsert({
      where: { code: seed.code },
      update: data,
      create: { ...data, code: seed.code },
      select: { id: true },
    });
    rooms[seed.code] = saved.id;
  }

  /**
   * `RestaurantTable.itemId` est @unique : une table ne peut porter qu'un seul
   * article, et un article qu'une seule table. On ne rattache donc que la table
   * du chef, qui hérite ainsi de ses créneaux mercredi-samedi 19h-23h.
   */
  const TABLES: Array<{
    code: string;
    name: string;
    room: string;
    seats: number;
    itemKey?: string;
  }> = [
    { code: 'T-01', name: 'Table 1', room: 'R-MAIN', seats: 2 },
    { code: 'T-02', name: 'Table 2', room: 'R-MAIN', seats: 2 },
    { code: 'T-03', name: 'Table 3', room: 'R-MAIN', seats: 4 },
    { code: 'T-04', name: 'Table 4', room: 'R-MAIN', seats: 4 },
    { code: 'T-05', name: 'Table 5 — près de la cheminée', room: 'R-MAIN', seats: 6 },
    { code: 'T-06', name: 'Grande tablée', room: 'R-MAIN', seats: 8 },
    { code: 'TR-01', name: 'Terrasse 1', room: 'R-TERRACE', seats: 2 },
    { code: 'TR-02', name: 'Terrasse 2', room: 'R-TERRACE', seats: 4 },
    { code: 'TR-03', name: 'Terrasse 3 — sous la pergola', room: 'R-TERRACE', seats: 4 },
    { code: 'TR-04', name: 'Terrasse 4', room: 'R-TERRACE', seats: 6 },
    { code: 'RF-01', name: 'Rooftop 1 — vue mer', room: 'R-ROOFTOP', seats: 2 },
    { code: 'RF-02', name: 'Rooftop 2 — vue mer', room: 'R-ROOFTOP', seats: 2 },
    { code: 'RF-03', name: 'Rooftop 3', room: 'R-ROOFTOP', seats: 4 },
    { code: 'RF-CHEF', name: 'Table du Chef', room: 'R-ROOFTOP', seats: 6, itemKey: 'chefTable' },
  ];

  const tables: Record<string, number> = {};
  for (const seed of TABLES) {
    const data = {
      roomId: rooms[seed.room],
      name: seed.name,
      seats: seed.seats,
      itemId: seed.itemKey ? items[seed.itemKey].id : null,
      isActive: true,
    };
    const saved = await prisma.restaurantTable.upsert({
      where: { code: seed.code },
      update: data,
      create: { ...data, code: seed.code },
      select: { id: true },
    });
    tables[seed.code] = saved.id;
  }
  log('restaurant', `${ROOMS.length} salles, ${TABLES.length} tables`);

  /* ---------- 6.6 Commandes de démonstration ----------
   * Préfixe SO-DEMO- : on purge puis on recrée, la cascade nettoie lignes et
   * historique. Les vraies commandes (référence SO-<timestamp>-<hex>) ne sont
   * jamais touchées.
   */

  await prisma.serviceOrder.deleteMany({ where: { orderNumber: { startsWith: 'SO-DEMO-' } } });

  type LineSeed = {
    itemKey: string;
    quantity: number;
    options?: string[];
    supplements?: string[];
    comment?: string;
  };

  /** Reproduit le calcul de createOrder : prix article + options + suppléments. */
  function buildLine(seed: LineSeed) {
    const item = items[seed.itemKey];
    if (item.price === null) throw new Error(`L'article ${seed.itemKey} n'a pas de prix`);

    let unitPrice = item.price;
    const optionIds: number[] = [];
    const supplementIds: number[] = [];

    for (const name of seed.options ?? []) {
      const option = item.options[name];
      if (!option) throw new Error(`Option « ${name} » absente de ${seed.itemKey}`);
      optionIds.push(option.id);
      unitPrice += option.priceDelta;
    }
    for (const name of seed.supplements ?? []) {
      const supplement = item.supplements[name];
      if (!supplement) throw new Error(`Supplément « ${name} » absent de ${seed.itemKey}`);
      supplementIds.push(supplement.id);
      unitPrice += supplement.price;
    }

    return {
      itemId: item.id,
      quantity: seed.quantity,
      unitPrice: round2(unitPrice),
      optionIds,
      supplementIds,
      comment: seed.comment ?? null,
      total: round2(unitPrice * seed.quantity),
    };
  }

  type OrderSeed = {
    orderNumber: string;
    status: string;
    roomNumber: string;
    paymentMethod: string;
    isPaid: boolean;
    comment?: string;
    cancelReason?: string;
    createdAt: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    lines: LineSeed[];
    events: Array<{
      type: string;
      fromStatus?: string;
      toStatus: string;
      message: string;
      createdAt: Date;
    }>;
  };

  const ORDERS: OrderSeed[] = [
    {
      orderNumber: 'SO-DEMO-0001',
      status: 'DELIVERED',
      roomNumber: '214',
      paymentMethod: 'CARD',
      isPaid: true,
      comment: 'Merci de sonner, bébé qui dort.',
      createdAt: utcAt(-2, '12:40'),
      deliveredAt: utcAt(-2, '13:18'),
      lines: [
        {
          itemKey: 'club',
          quantity: 1,
          options: ['Pain complet'],
          supplements: ['Frites maison'],
          comment: 'Sans cornichon',
        },
        { itemKey: 'jus', quantity: 2 },
      ],
      events: [
        { type: 'CREATED', toStatus: 'NEW', message: 'Commande créée', createdAt: utcAt(-2, '12:40') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'NEW',
          toStatus: 'PREPARING',
          message: 'Prise en charge par la cuisine',
          createdAt: utcAt(-2, '12:44'),
        },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'PREPARING',
          toStatus: 'READY',
          message: 'Plateau prêt',
          createdAt: utcAt(-2, '13:05'),
        },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'READY',
          toStatus: 'DELIVERING',
          message: 'En route vers la chambre 214',
          createdAt: utcAt(-2, '13:10'),
        },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'DELIVERING',
          toStatus: 'DELIVERED',
          message: 'Remis au client',
          createdAt: utcAt(-2, '13:18'),
        },
      ],
    },
    {
      orderNumber: 'SO-DEMO-0002',
      status: 'PREPARING',
      roomNumber: '214',
      paymentMethod: 'ROOM_CHARGE',
      isPaid: false,
      createdAt: utcAt(0, '19:05'),
      lines: [
        {
          itemKey: 'burger',
          quantity: 1,
          options: ['À point'],
          supplements: ['Bacon croustillant', 'Frites à la truffe'],
        },
        { itemKey: 'fromages', quantity: 1 },
        { itemKey: 'vin', quantity: 1 },
      ],
      events: [
        { type: 'CREATED', toStatus: 'NEW', message: 'Commande créée', createdAt: utcAt(0, '19:05') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'NEW',
          toStatus: 'PREPARING',
          message: 'Prise en charge par la cuisine',
          createdAt: utcAt(0, '19:09'),
        },
      ],
    },
    {
      orderNumber: 'SO-DEMO-0003',
      status: 'NEW',
      roomNumber: '214',
      paymentMethod: 'ROOM_CHARGE',
      isPaid: false,
      comment: 'Petit-déjeuner pour demain 8h si possible.',
      createdAt: utcAt(0, '21:30'),
      lines: [
        {
          itemKey: 'continental',
          quantity: 2,
          options: ['Boisson chaude : café'],
          supplements: ['Corbeille de fruits frais'],
        },
      ],
      events: [
        { type: 'CREATED', toStatus: 'NEW', message: 'Commande créée', createdAt: utcAt(0, '21:30') },
      ],
    },
    {
      orderNumber: 'SO-DEMO-0004',
      status: 'CANCELLED',
      roomNumber: '214',
      paymentMethod: 'CASH',
      isPaid: false,
      cancelReason: 'Article indisponible ce soir',
      createdAt: utcAt(-5, '22:10'),
      cancelledAt: utcAt(-5, '22:22'),
      lines: [{ itemKey: 'cesar', quantity: 1 }],
      events: [
        { type: 'CREATED', toStatus: 'NEW', message: 'Commande créée', createdAt: utcAt(-5, '22:10') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'NEW',
          toStatus: 'CANCELLED',
          message: 'Article indisponible ce soir',
          createdAt: utcAt(-5, '22:22'),
        },
      ],
    },
  ];

  for (const seed of ORDERS) {
    const lines = seed.lines.map(buildLine);
    const totalAmount = round2(lines.reduce((sum, line) => sum + line.total, 0));

    await prisma.serviceOrder.create({
      data: {
        orderNumber: seed.orderNumber,
        domain: 'ROOM_SERVICE',
        userId,
        roomNumber: seed.roomNumber,
        status: seed.status,
        totalAmount,
        paymentMethod: seed.paymentMethod,
        isPaid: seed.isPaid,
        comment: seed.comment ?? null,
        cancelReason: seed.cancelReason ?? null,
        createdAt: seed.createdAt,
        deliveredAt: seed.deliveredAt ?? null,
        cancelledAt: seed.cancelledAt ?? null,
        lines: {
          create: lines.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            optionIds: line.optionIds,
            supplementIds: line.supplementIds,
            comment: line.comment,
            createdAt: seed.createdAt,
          })),
        },
        events: {
          create: seed.events.map((event) => ({
            type: event.type,
            fromStatus: event.fromStatus ?? null,
            toStatus: event.toStatus,
            message: event.message,
            userId,
            createdAt: event.createdAt,
          })),
        },
      },
    });
  }
  log('commandes', `${ORDERS.length} commandes room service (NEW, PREPARING, DELIVERED, CANCELLED)`);

  /* ---------- 6.7 Réservations de démonstration ----------
   * bookingDate est TOUJOURS à minuit UTC : le backend compare avec
   * startOfUtcDay, une heure dedans rendrait la réservation invisible dans les
   * filtres par date. L'heure vit dans startTime (chaîne « HH:mm »).
   */

  await prisma.serviceBooking.deleteMany({ where: { bookingNumber: { startsWith: 'BK-DEMO-' } } });

  type BookingSeed = {
    bookingNumber: string;
    domain: string;
    itemKey?: string;
    tableCode?: string;
    therapistName?: string;
    bookingDate: Date;
    startTime: string;
    durationMinutes: number;
    partySize?: number;
    genderPreference?: string;
    occasion?: string;
    preferences?: string;
    notes?: string;
    status: string;
    cancelReason?: string;
    createdAt: Date;
    confirmedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    events: Array<{
      type: string;
      fromStatus?: string;
      toStatus: string;
      message: string;
      createdAt: Date;
    }>;
  };

  const desertDate = nextDayMatching([1, 3, 5], 4);

  const BOOKINGS: BookingSeed[] = [
    {
      bookingNumber: 'BK-DEMO-0001',
      domain: 'RESTAURANT',
      tableCode: 'T-03',
      bookingDate: utcDay(1),
      startTime: '20:00',
      durationMinutes: 120,
      partySize: 4,
      occasion: 'Anniversaire de mariage',
      preferences: 'Table au calme si possible',
      status: 'CONFIRMED',
      createdAt: utcAt(-1, '10:12'),
      confirmedAt: utcAt(-1, '10:30'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(-1, '10:12') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'PENDING',
          toStatus: 'CONFIRMED',
          message: 'Confirmée par la réception',
          createdAt: utcAt(-1, '10:30'),
        },
      ],
    },
    {
      bookingNumber: 'BK-DEMO-0002',
      domain: 'SPA',
      itemKey: 'suedois',
      therapistName: 'Yasmine',
      bookingDate: utcDay(3),
      startTime: '15:00',
      durationMinutes: 60,
      genderPreference: 'FEMALE',
      notes: 'Zone lombaire sensible',
      status: 'PENDING',
      createdAt: utcAt(0, '09:45'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(0, '09:45') },
      ],
    },
    {
      bookingNumber: 'BK-DEMO-0003',
      domain: 'POOL',
      itemKey: 'cabana',
      bookingDate: utcDay(2),
      startTime: '10:00',
      durationMinutes: 240,
      partySize: 3,
      status: 'CONFIRMED',
      createdAt: utcAt(-1, '18:20'),
      confirmedAt: utcAt(-1, '18:25'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(-1, '18:20') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'PENDING',
          toStatus: 'CONFIRMED',
          message: 'Cabana n°3 attribuée',
          createdAt: utcAt(-1, '18:25'),
        },
      ],
    },
    {
      bookingNumber: 'BK-DEMO-0004',
      domain: 'FITNESS',
      itemKey: 'yoga',
      bookingDate: utcDay(1),
      startTime: '07:00',
      durationMinutes: 60,
      partySize: 1,
      status: 'PENDING',
      createdAt: utcAt(0, '20:05'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(0, '20:05') },
      ],
    },
    {
      bookingNumber: 'BK-DEMO-0005',
      domain: 'PLAYROOM',
      itemKey: 'kidsHalfDay',
      bookingDate: utcDay(1),
      startTime: '14:00',
      durationMinutes: 180,
      partySize: 2,
      notes: 'Deux enfants, 5 et 8 ans',
      status: 'CONFIRMED',
      createdAt: utcAt(0, '11:00'),
      confirmedAt: utcAt(0, '11:10'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(0, '11:00') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'PENDING',
          toStatus: 'CONFIRMED',
          message: 'Places disponibles',
          createdAt: utcAt(0, '11:10'),
        },
      ],
    },
    {
      bookingNumber: 'BK-DEMO-0006',
      domain: 'ACTIVITY',
      itemKey: 'desert',
      bookingDate: desertDate,
      startTime: '07:00',
      durationMinutes: 480,
      partySize: 2,
      preferences: 'Régime végétarien pour le déjeuner',
      status: 'PENDING',
      createdAt: utcAt(0, '16:40'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(0, '16:40') },
      ],
    },
    {
      bookingNumber: 'BK-DEMO-0007',
      domain: 'RESTAURANT',
      tableCode: 'TR-02',
      bookingDate: utcDay(-3),
      startTime: '19:30',
      durationMinutes: 120,
      partySize: 2,
      status: 'COMPLETED',
      createdAt: utcAt(-4, '15:00'),
      confirmedAt: utcAt(-4, '15:05'),
      completedAt: utcAt(-3, '21:40'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(-4, '15:00') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'PENDING',
          toStatus: 'CONFIRMED',
          message: 'Confirmée par la réception',
          createdAt: utcAt(-4, '15:05'),
        },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'CONFIRMED',
          toStatus: 'COMPLETED',
          message: 'Service terminé',
          createdAt: utcAt(-3, '21:40'),
        },
      ],
    },
    {
      bookingNumber: 'BK-DEMO-0008',
      domain: 'SPA',
      itemKey: 'hammam',
      therapistName: 'Sofia',
      bookingDate: utcDay(-6),
      startTime: '11:00',
      durationMinutes: 45,
      genderPreference: 'FEMALE',
      status: 'CANCELLED',
      cancelReason: 'Annulée par le client',
      createdAt: utcAt(-7, '13:30'),
      cancelledAt: utcAt(-6, '09:15'),
      events: [
        { type: 'CREATED', toStatus: 'PENDING', message: 'Réservation créée', createdAt: utcAt(-7, '13:30') },
        {
          type: 'STATUS_CHANGED',
          fromStatus: 'PENDING',
          toStatus: 'CANCELLED',
          message: 'Annulée par le client',
          createdAt: utcAt(-6, '09:15'),
        },
      ],
    },
  ];

  for (const seed of BOOKINGS) {
    await prisma.serviceBooking.create({
      data: {
        bookingNumber: seed.bookingNumber,
        domain: seed.domain,
        itemId: seed.itemKey ? items[seed.itemKey].id : null,
        tableId: seed.tableCode ? tables[seed.tableCode] : null,
        therapistId: seed.therapistName ? therapists[seed.therapistName] : null,
        userId,
        roomNumber: '214',
        bookingDate: seed.bookingDate,
        startTime: seed.startTime,
        durationMinutes: seed.durationMinutes,
        partySize: seed.partySize ?? null,
        genderPreference: seed.genderPreference ?? null,
        occasion: seed.occasion ?? null,
        preferences: seed.preferences ?? null,
        notes: seed.notes ?? null,
        status: seed.status,
        cancelReason: seed.cancelReason ?? null,
        createdAt: seed.createdAt,
        confirmedAt: seed.confirmedAt ?? null,
        completedAt: seed.completedAt ?? null,
        cancelledAt: seed.cancelledAt ?? null,
        events: {
          create: seed.events.map((event) => ({
            type: event.type,
            fromStatus: event.fromStatus ?? null,
            toStatus: event.toStatus,
            message: event.message,
            userId,
            createdAt: event.createdAt,
          })),
        },
      },
    });
  }
  log('réservations', `${BOOKINGS.length} réservations sur 5 domaines, passées et à venir`);

  /* ---------- 6.8 Récapitulatif ---------- */

  const [categoryCount, itemCount, optionCount, supplementCount, orderCount, bookingCount] =
    await Promise.all([
      prisma.serviceCategory.count(),
      prisma.serviceItem.count(),
      prisma.serviceItemOption.count(),
      prisma.serviceItemSupplement.count(),
      prisma.serviceOrder.count(),
      prisma.serviceBooking.count(),
    ]);

  console.log('\n✔ Seed terminé');
  console.log(
    `  ${categoryCount} catégories · ${itemCount} articles · ${optionCount} options · ` +
      `${supplementCount} suppléments · ${slotCount} créneaux`,
  );
  console.log(`  ${orderCount} commandes · ${bookingCount} réservations en base`);
  if (!demoUser) {
    console.log(
      '\n  ⚠ Aucun utilisateur trouvé : relance avec SEED_USER_EMAIL=<email> une fois un compte créé,\n' +
        '    sinon l\'écran « Mes demandes » du mobile (filtre mine=true) restera vide.',
    );
  }
  console.log('');
}

main()
  .catch((error) => {
    console.error('\n✖ Seed interrompu :', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });