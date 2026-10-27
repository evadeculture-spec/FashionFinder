/* Remote editorial imagery (Unsplash CDN). Everything is referenced through this
   file so assets can be swapped for retailer feeds or a brand CDN in one place.
   <SmartImage> renders an illustrated fallback if any URL fails to load. */

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

export const img = {
  // Editorial / campaign
  heroMain: u('1515886657613-9f3515b0c78f', 1400),
  heroAlt: u('1509631179647-0177331693ae', 1100),
  heroDetail: u('1490481651871-ab68de25d43d', 900),
  streetA: u('1485968579580-b6d095142e6e', 900),
  streetB: u('1469334031218-e382a71b716b', 900),
  streetC: u('1529139574466-a303027c1d8b', 900),
  streetD: u('1487222477894-8943e31ef7b2', 900),
  menA: u('1503342217505-b0a15ec3261c', 900),
  menB: u('1507679799987-c73779587ccf', 900),
  rack: u('1445205170230-053b83016050', 1100),
  flatlay: u('1434389677669-e08b4cac3105', 900),
  shopping: u('1483985988355-763728e1935b', 1100),
  giftBox: u('1513885535751-8b9238bd345a', 1000),
  wardrobe: u('1558769132-cb1aea458c5e', 1000),

  // Stores
  storeA: u('1441986300917-64674bd600d8', 1000),
  storeB: u('1555529669-e69e7aa0ba9a', 1000),
  storeC: u('1567401893414-76b7b1e5a7a5', 1000),
  storeD: u('1604176354204-9268737828e4', 1000),
  storeE: u('1528698827591-e19ccd7bc23d', 1000),
  storeF: u('1560243563-062bfc001d68', 1000),

  // Products
  coatCamel: u('1539533018447-63fcce2678e3'),
  coatBrown: u('1551028719-00167b16eac5'),
  jacketDenim: u('1591047139829-d91aecb6caea'),
  blazer: u('1594633312681-425c7b97ccd1'),
  trench: u('1548624313-0396c75e4b1a'),
  coatWool: u('1544022613-e87ca75a784a'),
  coatLong: u('1525507119028-ed4c629a60a3'),
  teeWhite: u('1521572163474-6864f9cf17ab'),
  teeBasic: u('1576566588028-4147f3842f27'),
  shirtLinen: u('1596755094514-f87e34085b2c'),
  blouse: u('1581044777550-4cfa60707c03'),
  knit: u('1576871337622-98d48d1cf531'),
  knitB: u('1564584217132-2271feaeb3c5'),
  sweat: u('1556905055-8f358a7a47b2'),
  jeans: u('1542272604-787c3835535d'),
  jeansB: u('1541099649105-f69ad21f3246'),
  chinos: u('1473966968600-fa801b869a1a'),
  trousers: u('1594938298603-c8148c4dae35'),
  skirt: u('1583496661160-fb5886a0aaaa'),
  dressRed: u('1595777457583-95e059d581b8'),
  dressFlow: u('1496747611176-843222e1e57c'),
  dressSlip: u('1612336307429-8a898d10e223'),
  sneakers: u('1549298916-b41d501d3772'),
  sneakersB: u('1600185365483-26d7a4cc7519'),
  boots: u('1608256246200-53e635b5b65f'),
  loafers: u('1614252235316-8c857d38b5f4'),
  heels: u('1543163521-1bf539c55dd2'),
  shoeLeather: u('1525966222134-fcfa99b8ae77'),
  bagTote: u('1590874103328-eac38a683ce7'),
  bagLeather: u('1584917865442-de89df76afd3'),
  bagShoulder: u('1548036328-c9fa89d128fa'),
  earrings: u('1535632066927-ab7c9ab60908'),
  necklace: u('1599643478518-a784e5dc4c8f'),
  ring: u('1605100804763-247f67b3557e'),
  watch: u('1523170335258-f5ed11844a49'),
  sunglasses: u('1511499767150-a48a237f0083'),
  sunglassesB: u('1572635196237-14b3f281503f'),
  belt: u('1553062407-98eeb64c6a62'),
  scarf: u('1520903920243-00d872a2d1c9'),
  hat: u('1514327605112-b887c0e61c0a'),
};
