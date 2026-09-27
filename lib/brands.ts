const houses: { match: string; name: string }[] = [
  { match: "parfums de marly", name: "Parfums de Marly" },
  { match: "maison alhambra", name: "Maison Alhambra" },
  { match: "maison al hambra", name: "Maison Alhambra" },
  { match: "essential parfums", name: "Essential Parfums" },
  { match: "carolina herrera", name: "Carolina Herrera" },
  { match: "ahmed al maghribi", name: "Ahmed Al Maghribi" },
  { match: "maison crivelli", name: "Maison Crivelli" },
  { match: "stronger with you", name: "Giorgio Armani" },
  { match: "french avenue", name: "French Avenue" },
  { match: "swiss arabian", name: "Swiss Arabian" },
  { match: "viktor & rolf", name: "Viktor & Rolf" },
  { match: "paris corner", name: "Paris Corner" },
  { match: "frank olivier", name: "Frank Olivier" },
  { match: "paco rabanne", name: "Paco Rabanne" },
  { match: "maison asrar", name: "Maison Asrar" },
  { match: "maison oud", name: "Maison Oud" },
  { match: "al haramain", name: "Al Haramain" },
  { match: "al haramin", name: "Al Haramain" },
  { match: "mercedes benz", name: "Mercedes-Benz" },
  { match: "giorgio armani", name: "Giorgio Armani" },
  { match: "club de nuit", name: "Armaf" },
  { match: "bade al oud", name: "Lattafa" },
  { match: "ana abiyadh", name: "Lattafa" },
  { match: "bois d", name: "Bois D'Arabie" },
  { match: "hugo boss", name: "Hugo Boss" },
  { match: "now rave", name: "Lattafa" },
  { match: "tom ford", name: "Tom Ford" },
  { match: "terre d", name: "Hermes" },
  { match: "ahmed ignite", name: "Ahmed Al Maghribi" },
  { match: "lattafa", name: "Lattafa" },
  { match: "nishane", name: "Nishane" },
  { match: "rayhaan", name: "Rayhaan" },
  { match: "arabiyat", name: "Arabiyat" },
  { match: "khadlaj", name: "Khadlaj" },
  { match: "xerjoff", name: "Xerjoff" },
  { match: "mancera", name: "Mancera" },
  { match: "amouage", name: "Amouage" },
  { match: "rasasi", name: "Rasasi" },
  { match: "chanel", name: "Chanel" },
  { match: "aurane", name: "Aurane" },
  { match: "armaf", name: "Armaf" },
  { match: "afnan", name: "Afnan" },
  { match: "gucci", name: "Gucci" },
  { match: "kayali", name: "Kayali" },
  { match: "creed", name: "Creed" },
  { match: "assaf", name: "Assaf" },
  { match: "ikeda", name: "Ikeda" },
  { match: "dior", name: "Dior" },
  { match: "dove", name: "Dove" },
  { match: "oak", name: "Oak" },
  { match: "pdm", name: "Parfums de Marly" },
  { match: "ysl", name: "YSL" },
  { match: "lbc", name: "LBC" },
  { match: "raed", name: "Raed" },
  { match: "reef", name: "Reef" },
  { match: "alham", name: "Al Ham Al Khaleej" },
  { match: "london", name: "London" },
  { match: "valar", name: "Valar" },
  { match: "stellar", name: "Stellar" },
  { match: "mercedes", name: "Mercedes-Benz" },
  { match: "viktor", name: "Viktor & Rolf" },
  { match: "swiss", name: "Swiss Arabian" },
  { match: "paris", name: "Paris Corner" },
  { match: "frank", name: "Frank Olivier" },
  { match: "aro", name: "Aro" },
  { match: "pc ", name: "PC" },
].sort((left, right) => right.match.length - left.match.length);

export const leadingBrands = ["Lattafa", "Armaf", "Rayhaan", "Aurane", "Afnan", "Al Haramain"] as const;

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function brandFromName(name: string) {
  const lower = name.toLowerCase();
  for (const house of houses) {
    if (lower.includes(house.match)) return house.name;
  }
  const first = name.trim().split(/\s+/)[0];
  if (!first || /^\d+$/.test(first)) return "Aurane";
  return titleCase(first);
}
