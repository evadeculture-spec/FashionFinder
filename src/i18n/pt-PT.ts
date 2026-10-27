/* UI chrome strings. Catalogue content lives in src/data and would be
   localised per market by the content pipeline. */
export const ptPT = {
  nav: {
    discover: 'Descobrir',
    search: 'Pesquisar',
    saved: 'Guardados',
    wardrobe: 'Guarda-roupa',
    profile: 'Perfil',
    stores: 'Lojas',
    looks: 'Looks',
    premium: 'VESTA+',
    partners: 'Para lojas',
  },
  home: {
    greetingMorning: 'Bom dia',
    greetingAfternoon: 'Boa tarde',
    greetingEvening: 'Boa noite',
    heroTitle: 'A tua próxima peça favorita está mais perto do que imaginas.',
    heroCta: 'Descobrir peças',
    heroSecondary: 'Pesquisar por imagem',
    searchPlaceholder: 'Descreve a peça que imaginas…',
  },
  search: {
    loading: 'Estamos a encontrar peças que combinam com a tua ideia…',
    simulated: 'Recomendação simulada',
  },
  common: {
    seeAll: 'Ver tudo',
    back: 'Voltar',
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Fechar',
    apply: 'Aplicar',
    clear: 'Limpar',
  },
  product: {
    primaryCta: 'Ver loja e disponibilidade',
    secondaryCta: 'Adicionar ao guarda-roupa',
  },
};

export type Messages = typeof ptPT;
