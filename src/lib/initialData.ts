import { Show, Product } from '../types';

export interface BandMember {
  id: string;
  name: string;
  role: string;
  instagram: string;
  description: string;
  image_url: string;
  gallery: string[];
  color?: string;
}

export const DEFAULT_MEMBERS: BandMember[] = [
  {
    id: 'member_ronaldo',
    name: 'Ronaldo Augusto',
    role: 'Vocal',
    instagram: '@ronaldoaugusto_hc',
    description: 'Vocalista da Doggbite. Voz agressiva, visceral e letras com mensagens de revolta, vivência periférica e resistência.',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
      '/logo1.png'
    ],
    color: '#39FF14' // Neon Green
  },
  {
    id: 'member_lucas',
    name: 'Lucas Santo',
    role: 'Baixo',
    instagram: '@lucassanto_bass',
    description: 'Baixista da Doggbite. Linhas graves pesadas e distorcidas que sustentam o peso da banda.',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'
    ],
    color: '#00FFFF' // Neon Cyan
  },
  {
    id: 'member_ramon',
    name: 'Ramon Oliveira',
    role: 'Bateria',
    instagram: '@ramonoliveira_drum',
    description: 'Baterista da Doggbite. Pegada forte, bumbo duplo veloz e levadas rápidas que ditam o ritmo do moshpit.',
    image_url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1520523839898-50712825e617?auto=format&fit=crop&q=80&w=800'
    ],
    color: '#FFF01F' // Neon Yellow
  }
];

export const DEFAULT_SHOWS: Show[] = [
  // PRÓXIMOS SHOWS
  {
    id: 'show_1',
    name: 'DOGGBITE LIVE - TOUR CÃES DE RUA',
    date: '2026-11-21',
    time: '22:00',
    venue: 'Correria Music Bar',
    city: 'Vila Velha',
    state: 'ES',
    address: 'Av. Est. José Júlio de Souza, 172 - Praia de Itaparica',
    status: 'CONFIRMADO',
    image_url: '/Cães de Rua.jpg'
  },
  {
    id: 'show_2',
    name: 'HARDCORE RESISTÊNCIA FEST',
    date: '2026-12-12',
    time: '21:00',
    venue: 'Matrix Music Hall',
    city: 'Cariacica',
    state: 'ES',
    address: 'Waldemar Siepierski, 467 - Rio Branco',
    status: 'CONFIRMADO',
    image_url: '/Grilhões.jpg'
  },
  {
    id: 'show_3',
    name: 'SP UNDERGROUND MOSH EXPLOSION',
    date: '2027-01-16',
    time: '20:30',
    venue: 'Hangar 110',
    city: 'São Paulo',
    state: 'SP',
    address: 'Rua Rodolfo Miranda, 110 - Bom Retiro',
    status: 'EM BREVE',
    image_url: '/Doente.jpg'
  },
  {
    id: 'show_4',
    name: 'NOITE DE RESPEITO E PESO',
    date: '2027-02-27',
    time: '21:30',
    venue: 'Circo Voador',
    city: 'Rio de Janeiro',
    state: 'RJ',
    address: 'Rua dos Arcos, s/n - Lapa',
    status: 'EM BREVE',
    image_url: '/Respeito.png'
  },
  // SHOWS REALIZADOS (HISTÓRICO)
  {
    id: 'show_past_1',
    name: 'LANÇAMENTO SINGLE CÃES DE RUA',
    date: '2026-05-15',
    time: '22:00',
    venue: 'Correria Music Bar',
    city: 'Vila Velha',
    state: 'ES',
    address: 'Av. Est. José Júlio de Souza, 172',
    status: 'REALIZADO',
    image_url: '/Cães de Rua.jpg'
  },
  {
    id: 'show_past_2',
    name: 'DOENTE TOUR BRASIL',
    date: '2026-03-22',
    time: '21:00',
    venue: 'Audio Club',
    city: 'São Paulo',
    state: 'SP',
    address: 'Av. Francisco Matarazzo, 694 - Água Branca',
    status: 'REALIZADO',
    image_url: '/Doente.jpg'
  }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Camiseta Oficial Cães de Rua - Tour Edition',
    price: 89.90,
    description: 'Malha premium 100% algodão penteado fio 30.1 com costuras reforçadas ombro a ombro. Estampa frontal e traseira em silk-screen plastisol de alta durabilidade com arte exclusiva da tour.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'prod_2',
    name: 'Moletom Canguru Doggbite Heavyweight',
    price: 189.90,
    description: 'Moletom 3 cabos flanelado de alto padrão (360g). Bolso frontal canguru, capuz duplo com cordão reforçado e estampa de alta definição no peito e nas mangas.',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'prod_3',
    name: 'Boné Snapback Doggbite All-Black Edition',
    price: 69.90,
    description: 'Boné aba reta em sarja 100% algodão black com bordado frontal 3D em alto relevo neon. Fecho ajustável clássico snapback e acabamento interno personalizado.',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&q=80&w=800'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'prod_4',
    name: 'Vinil 12" LP Cães de Rua - Edição Limitada Fumê',
    price: 159.90,
    description: 'Prensagem audiófila pesada de 180g em vinil fumê translúcido. Acompanha encarte especial formato livreto com fotos exclusivas de gravação e letras completas.',
    image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'prod_5',
    name: 'Shape Maple Canadense Doggbite Mosh Series 8.25"',
    price: 249.90,
    description: 'Shape profissional confeccionado em 7 lâminas de Maple canadense com resina epóxi premium. Gráfico em heat-transfer com alta definição, concave perfeito para mosh & street.',
    image_url: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=800'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'prod_6',
    name: 'Pack Oficial Doggbite: 3 Patches Bordados + 10 Adesivos',
    price: 39.90,
    description: 'Pack oficial contendo 3 patches termocolantes bordados em alta definição para jaqueta/colete mais 10 adesivos vinílicos laminados à prova de água e sol.',
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
    ]
  }
];
