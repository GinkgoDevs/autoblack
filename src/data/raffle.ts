export type TicketPack = {
  id: string;
  chances: number;
  price: number;
  badge?: "POPULAR" | "MEJOR VALOR";
};

export type Winner = {
  id: string;
  name: string;
  location: string;
  prize: string;
  image: string;
};

export const ticketPacks: TicketPack[] = [
  { id: "1", chances: 1, price: 5000 },
  { id: "3", chances: 3, price: 12000, badge: "POPULAR" },
  { id: "10", chances: 10, price: 35000 },
  { id: "20", chances: 20, price: 60000, badge: "MEJOR VALOR" },
  { id: "100", chances: 100, price: 250000 },
];

export const winners: Winner[] = [
  {
    id: "1",
    name: "Marcos R.",
    location: "Córdoba",
    prize: "Honda CB 300F",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Laura M.",
    location: "Rosario",
    prize: "Yamaha FZ 25",
    image: "https://images.unsplash.com/photo-1609630875176-bb049c059221?w=600&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Diego S.",
    location: "Buenos Aires",
    prize: "Ford Ranger",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop",
  },
  {
    id: "4",
    name: "Carolina P.",
    location: "Mendoza",
    prize: "Honda XR 190",
    image: "https://images.unsplash.com/photo-1568778551063-d5fef692c50a?w=600&h=400&fit=crop",
  },
  {
    id: "5",
    name: "Julián T.",
    location: "Tucumán",
    prize: "Bajaj Dominar 400",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop",
  },
  {
    id: "6",
    name: "Valentina G.",
    location: "Salta",
    prize: "Chevrolet Onix",
    image: "https://images.unsplash.com/photo-1494976388531-d1058498cdd8?w=600&h=400&fit=crop",
  },
];

export const raffleDate = {
  day: "MIÉRCOLES 10 DE JUNIO DE 2026",
  time: "22:00 HS",
};

export const courseFeatures = [
  "Acceso total las 24 hs",
  "Actualizaciones constantes",
  "Contenido en HD",
  "Certificado de finalización",
  "Soporte por WhatsApp",
  "Acceso de por vida",
];

export const prizes = [
  {
    draw: "1er Sorteo",
    date: "10 de Junio 2026",
    items: ["Honda CB 300F", "Yamaha FZ 25", "Bajaj Dominar 400"],
  },
  {
    draw: "2do Sorteo",
    date: "17 de Junio 2026",
    items: ["Ford Ranger XLT", "Honda XR 190", "Kit de herramientas premium"],
  },
  {
    draw: "3er Sorteo",
    date: "24 de Junio 2026",
    items: ["Chevrolet Onix", "Yamaha MT-03", "Gift card $500.000"],
  },
];
