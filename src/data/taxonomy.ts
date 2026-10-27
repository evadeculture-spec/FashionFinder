import type { CategoryId, City, CityId, ColourId, StyleTag, StoreType, OutfitSlot } from './types';

export const CATEGORIES: { id: CategoryId; label: string; plural: string; terms: string[] }[] = [
  { id: 'outerwear', label: 'Casaco', plural: 'Casacos', terms: ['casaco', 'casacos', 'blazer', 'trench', 'gabardina', 'sobretudo', 'parka', 'blusão', 'blusao', 'jaqueta', 'colete'] },
  { id: 'tops', label: 'Top', plural: 'Tops & Camisas', terms: ['camisa', 'camisas', 't-shirt', 'tshirt', 'top', 'tops', 'blusa', 'polo', 'body'] },
  { id: 'knitwear', label: 'Malha', plural: 'Malhas', terms: ['camisola', 'camisolas', 'malha', 'cardigan', 'casaco de malha', 'pullover', 'gola alta'] },
  { id: 'trousers', label: 'Calças', plural: 'Calças & Saias', terms: ['calças', 'calcas', 'calça', 'jeans', 'ganga', 'saia', 'saias', 'calções', 'calcoes', 'chino'] },
  { id: 'dresses', label: 'Vestido', plural: 'Vestidos', terms: ['vestido', 'vestidos', 'macacão', 'macacao'] },
  { id: 'shoes', label: 'Calçado', plural: 'Calçado', terms: ['sapatos', 'sapato', 'botas', 'bota', 'botins', 'ténis', 'tenis', 'sapatilhas', 'sandálias', 'sandalias', 'mocassins', 'loafers', 'calçado', 'calcado'] },
  { id: 'bags', label: 'Mala', plural: 'Malas', terms: ['mala', 'malas', 'bolsa', 'carteira', 'mochila', 'tote', 'saco'] },
  { id: 'jewellery', label: 'Joalharia', plural: 'Joalharia', terms: ['brincos', 'colar', 'anel', 'pulseira', 'joia', 'jóia', 'joias', 'jóias', 'argolas'] },
  { id: 'accessories', label: 'Acessório', plural: 'Acessórios', terms: ['cinto', 'lenço', 'lenco', 'cachecol', 'óculos', 'oculos', 'chapéu', 'chapeu', 'boné', 'bone', 'gorro', 'acessório', 'acessorio'] },
];

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  (typeof CATEGORIES)[number]
>;

export const COLOURS: { id: ColourId; label: string; hex: string; terms: string[] }[] = [
  { id: 'black', label: 'Preto', hex: '#232220', terms: ['preto', 'preta', 'pretos', 'pretas', 'negro'] },
  { id: 'white', label: 'Branco', hex: '#FBFAF7', terms: ['branco', 'branca', 'brancos', 'brancas'] },
  { id: 'ecru', label: 'Cru', hex: '#EDE4D3', terms: ['cru', 'crua', 'bege', 'creme', 'marfim', 'off-white', 'areia'] },
  { id: 'camel', label: 'Camelo', hex: '#B98A5A', terms: ['camelo', 'caramelo', 'tabaco', 'conhaque'] },
  { id: 'brown', label: 'Castanho', hex: '#6B4A35', terms: ['castanho', 'castanha', 'castanhos', 'chocolate', 'café', 'cafe', 'marrom'] },
  { id: 'grey', label: 'Cinzento', hex: '#9C9A95', terms: ['cinzento', 'cinzenta', 'cinza', 'mescla', 'antracite'] },
  { id: 'navy', label: 'Azul-marinho', hex: '#1F2A44', terms: ['marinho', 'azul-marinho', 'azul marinho', 'navy'] },
  { id: 'blue', label: 'Azul', hex: '#5D7EA6', terms: ['azul', 'azuis', 'ganga clara', 'celeste'] },
  { id: 'green', label: 'Verde', hex: '#4E6B57', terms: ['verde', 'verdes', 'esmeralda', 'garrafa'] },
  { id: 'olive', label: 'Azeitona', hex: '#7A7A52', terms: ['azeitona', 'oliva', 'caqui', 'khaki', 'militar'] },
  { id: 'red', label: 'Vermelho', hex: '#A8352B', terms: ['vermelho', 'vermelha', 'encarnado'] },
  { id: 'burgundy', label: 'Bordeaux', hex: '#5E1F2B', terms: ['bordeaux', 'bordô', 'bordo', 'vinho'] },
  { id: 'pink', label: 'Rosa', hex: '#D9A9A2', terms: ['rosa', 'cor-de-rosa', 'rosado', 'blush'] },
  { id: 'gold', label: 'Dourado', hex: '#C2A15A', terms: ['dourado', 'dourada', 'ouro'] },
  { id: 'silver', label: 'Prateado', hex: '#BFC1C2', terms: ['prateado', 'prateada', 'prata'] },
];

export const colourById = Object.fromEntries(COLOURS.map((c) => [c.id, c])) as Record<
  ColourId,
  (typeof COLOURS)[number]
>;

export const STYLES: { id: StyleTag; label: string; terms: string[] }[] = [
  { id: 'vintage', label: 'Vintage', terms: ['vintage', 'retro', 'retrô', 'anos 70', 'anos 90', 'segunda mão'] },
  { id: 'minimal', label: 'Minimal', terms: ['minimal', 'minimalista', 'simples', 'clean', 'básico', 'basico'] },
  { id: 'oversized', label: 'Oversized', terms: ['oversized', 'largo', 'larga', 'folgado', 'folgada', 'ampla', 'amplo'] },
  { id: 'classic', label: 'Clássico', terms: ['clássico', 'classico', 'clássica', 'intemporal', 'elegante'] },
  { id: 'streetwear', label: 'Streetwear', terms: ['streetwear', 'urbano', 'urbana', 'street'] },
  { id: 'boho', label: 'Boho', terms: ['boho', 'boémio', 'boemio', 'hippie'] },
  { id: 'tailoring', label: 'Alfaiataria', terms: ['alfaiataria', 'fato', 'estruturado', 'estruturada'] },
  { id: 'romantic', label: 'Romântico', terms: ['romântico', 'romantico', 'romântica', 'delicado', 'floral', 'renda'] },
  { id: 'casual', label: 'Casual', terms: ['casual', 'descontraído', 'descontraido', 'dia a dia'] },
  { id: 'party', label: 'Festa', terms: ['festa', 'noite', 'casamento', 'evento', 'cerimónia', 'cerimonia'] },
  { id: 'workwear', label: 'Escritório', terms: ['escritório', 'escritorio', 'trabalho', 'reunião', 'reuniao', 'profissional'] },
  { id: 'sporty', label: 'Desportivo', terms: ['desportivo', 'desportiva', 'sport', 'ginásio', 'ginasio'] },
];

export const styleById = Object.fromEntries(STYLES.map((s) => [s.id, s])) as Record<StyleTag, (typeof STYLES)[number]>;

export const CITIES: City[] = [
  { id: 'lisboa', name: 'Lisboa', lat: 38.7139, lng: -9.1394 },
  { id: 'porto', name: 'Porto', lat: 41.1496, lng: -8.611 },
  { id: 'coimbra', name: 'Coimbra', lat: 40.2033, lng: -8.4103 },
  { id: 'braga', name: 'Braga', lat: 41.5454, lng: -8.4265 },
  { id: 'faro', name: 'Faro', lat: 37.0194, lng: -7.9304 },
];

export const cityById = Object.fromEntries(CITIES.map((c) => [c.id, c])) as Record<CityId, City>;

export const RADII = [2, 5, 10, 25, 50] as const;

export const STORE_TYPES: Record<StoreType, string> = {
  boutique: 'Boutique',
  department: 'Grande armazém',
  vintage: 'Vintage & segunda mão',
  concept: 'Concept store',
  footwear: 'Sapataria',
};

export const SLOT_LABELS: Record<OutfitSlot, string> = {
  outerwear: 'Casaco',
  top: 'Parte de cima',
  bottom: 'Parte de baixo',
  dress: 'Vestido',
  shoes: 'Calçado',
  bag: 'Mala',
  accessory: 'Acessório',
};

/** Which catalogue categories can fill an outfit slot. */
export const SLOT_CATEGORIES: Record<OutfitSlot, CategoryId[]> = {
  outerwear: ['outerwear'],
  top: ['tops', 'knitwear'],
  bottom: ['trousers'],
  dress: ['dresses'],
  shoes: ['shoes'],
  bag: ['bags'],
  accessory: ['jewellery', 'accessories'],
};

export function slotForCategory(c: CategoryId): OutfitSlot {
  switch (c) {
    case 'outerwear':
      return 'outerwear';
    case 'tops':
    case 'knitwear':
      return 'top';
    case 'trousers':
      return 'bottom';
    case 'dresses':
      return 'dress';
    case 'shoes':
      return 'shoes';
    case 'bags':
      return 'bag';
    default:
      return 'accessory';
  }
}
