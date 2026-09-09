import React from 'react';

interface IconMeta { emoji: string; bg: string; fg: string }

const KEYWORD_MAP: Array<{ keys: string[]; meta: IconMeta }> = [
  { keys: ['laptop','notebook','computadora','portatil','pc','ordenador'],      meta: { emoji:'💻', bg:'linear-gradient(135deg,#3B82F6,#1D4ED8)', fg:'#fff' } },
  { keys: ['monitor','pantalla','display'],                                     meta: { emoji:'🖥️', bg:'linear-gradient(135deg,#2563EB,#1E40AF)', fg:'#fff' } },
  { keys: ['teclado','keyboard'],                                               meta: { emoji:'⌨️', bg:'linear-gradient(135deg,#475569,#1E293B)', fg:'#fff' } },
  { keys: ['mouse','raton'],                                                    meta: { emoji:'🖱️', bg:'linear-gradient(135deg,#64748B,#334155)', fg:'#fff' } },
  { keys: ['impresora','printer','toner','cartucho'],                           meta: { emoji:'🖨️', bg:'linear-gradient(135deg,#0891B2,#0E7490)', fg:'#fff' } },
  { keys: ['router','switch','ethernet','wifi','red ','cable utp'],             meta: { emoji:'📡', bg:'linear-gradient(135deg,#0284C7,#075985)', fg:'#fff' } },
  { keys: ['disco','ssd','hdd','memoria','usb','pendrive','flash'],             meta: { emoji:'💾', bg:'linear-gradient(135deg,#7C3AED,#5B21B6)', fg:'#fff' } },
  { keys: ['camara','camera','webcam','fotografia','foto'],                     meta: { emoji:'📷', bg:'linear-gradient(135deg,#D97706,#92400E)', fg:'#fff' } },
  { keys: ['telefono','celular','smartphone','iphone','samsung','movil'],       meta: { emoji:'📱', bg:'linear-gradient(135deg,#6366F1,#4338CA)', fg:'#fff' } },
  { keys: ['tablet','ipad','tableta'],                                          meta: { emoji:'📲', bg:'linear-gradient(135deg,#8B5CF6,#6D28D9)', fg:'#fff' } },
  { keys: ['audifonos','auricular','headphone','earphone'],                     meta: { emoji:'🎧', bg:'linear-gradient(135deg,#EC4899,#9D174D)', fg:'#fff' } },
  { keys: ['televisor','television','smart tv','tv '],                          meta: { emoji:'📺', bg:'linear-gradient(135deg,#1D4ED8,#1E3A5F)', fg:'#fff' } },
  { keys: ['altavoz','bocina','parlante','speaker'],                            meta: { emoji:'🔊', bg:'linear-gradient(135deg,#0891B2,#164E63)', fg:'#fff' } },
  { keys: ['cargador','power bank','cable usb','cable tipo'],                   meta: { emoji:'🔋', bg:'linear-gradient(135deg,#16A34A,#14532D)', fg:'#fff' } },
  { keys: ['leche','lacteo','yogur','queso','mantequilla'],                     meta: { emoji:'🥛', bg:'linear-gradient(135deg,#60A5FA,#2563EB)', fg:'#fff' } },
  { keys: ['pan','bolo','tortilla','galleta'],                                  meta: { emoji:'🍞', bg:'linear-gradient(135deg,#F59E0B,#B45309)', fg:'#fff' } },
  { keys: ['arroz','frijol','cereal','grano','avena','maiz'],                   meta: { emoji:'🌾', bg:'linear-gradient(135deg,#CA8A04,#92400E)', fg:'#fff' } },
  { keys: ['aceite','vinagre','condimento','salsa','aderezo'],                  meta: { emoji:'🫙', bg:'linear-gradient(135deg,#FBBF24,#D97706)', fg:'#fff' } },
  { keys: ['agua','bebida','refresco','jugo','soda','cola','cerveza'],          meta: { emoji:'🥤', bg:'linear-gradient(135deg,#06B6D4,#0E7490)', fg:'#fff' } },
  { keys: ['cafe','coffee','te ','infusion'],                                   meta: { emoji:'☕', bg:'linear-gradient(135deg,#78350F,#451A03)', fg:'#fff' } },
  { keys: ['pollo','chicken','carne','res','cerdo','embutido','salchicha'],     meta: { emoji:'🍗', bg:'linear-gradient(135deg,#EF4444,#991B1B)', fg:'#fff' } },
  { keys: ['pescado','atun','mariscos','sardina'],                              meta: { emoji:'🐟', bg:'linear-gradient(135deg,#0EA5E9,#0369A1)', fg:'#fff' } },
  { keys: ['fruta','manzana','naranja','banano','pina','mango','uva'],          meta: { emoji:'🍎', bg:'linear-gradient(135deg,#DC2626,#991B1B)', fg:'#fff' } },
  { keys: ['verdura','vegetal','tomate','cebolla','papa','zanahoria'],          meta: { emoji:'🥦', bg:'linear-gradient(135deg,#16A34A,#14532D)', fg:'#fff' } },
  { keys: ['huevo','egg'],                                                      meta: { emoji:'🥚', bg:'linear-gradient(135deg,#FBBF24,#D97706)', fg:'#fff' } },
  { keys: ['chocolate','dulce','caramelo','candy','gomita','snack'],            meta: { emoji:'🍫', bg:'linear-gradient(135deg,#92400E,#451A03)', fg:'#fff' } },
  { keys: ['jabon','detergente','shampoo','champu'],                            meta: { emoji:'🧼', bg:'linear-gradient(135deg,#22D3EE,#0891B2)', fg:'#fff' } },
  { keys: ['cloro','desinfectante','limpiador','lejia','blanqueador'],          meta: { emoji:'🧴', bg:'linear-gradient(135deg,#06B6D4,#0E7490)', fg:'#fff' } },
  { keys: ['escoba','trapeador','mopa','cepillo'],                              meta: { emoji:'🧹', bg:'linear-gradient(135deg,#10B981,#065F46)', fg:'#fff' } },
  { keys: ['papel higienico','toalla','servilleta','panuelo'],                  meta: { emoji:'🧻', bg:'linear-gradient(135deg,#94A3B8,#475569)', fg:'#fff' } },
  { keys: ['insecticida','repelente','aerosol'],                                meta: { emoji:'💨', bg:'linear-gradient(135deg,#84CC16,#4D7C0F)', fg:'#fff' } },
  { keys: ['martillo','mazo','clavo','hammer'],                                 meta: { emoji:'🔨', bg:'linear-gradient(135deg,#F97316,#C2410C)', fg:'#fff' } },
  { keys: ['tornillo','tuerca','perno','destornillador'],                       meta: { emoji:'🔩', bg:'linear-gradient(135deg,#78716C,#44403C)', fg:'#fff' } },
  { keys: ['llave','wrench','plomeria','tuberia'],                              meta: { emoji:'🔧', bg:'linear-gradient(135deg,#B45309,#92400E)', fg:'#fff' } },
  { keys: ['taladro','drill','sierra','corte'],                                 meta: { emoji:'⚙️', bg:'linear-gradient(135deg,#374151,#111827)', fg:'#fff' } },
  { keys: ['pintura','brocha','rodillo','barniz','laca'],                       meta: { emoji:'🖌️', bg:'linear-gradient(135deg,#A78BFA,#7C3AED)', fg:'#fff' } },
  { keys: ['cemento','mezcla','arena','block','ladrillo'],                      meta: { emoji:'🧱', bg:'linear-gradient(135deg,#D97706,#92400E)', fg:'#fff' } },
  { keys: ['pastilla','tableta','capsula','aspirina','antibiotico','medicina'], meta: { emoji:'💊', bg:'linear-gradient(135deg,#EF4444,#B91C1C)', fg:'#fff' } },
  { keys: ['jarabe','solucion','gotas','suspension'],                           meta: { emoji:'🧪', bg:'linear-gradient(135deg,#F472B6,#BE185D)', fg:'#fff' } },
  { keys: ['vitamina','suplemento','mineral','proteina','omega'],               meta: { emoji:'💉', bg:'linear-gradient(135deg,#0EA5E9,#0369A1)', fg:'#fff' } },
  { keys: ['mascarilla','guante','alcohol','antiseptico','vendaje'],            meta: { emoji:'🩺', bg:'linear-gradient(135deg,#6EE7B7,#059669)', fg:'#fff' } },
  { keys: ['tensiometro','termometro','glucometro'],                            meta: { emoji:'🩻', bg:'linear-gradient(135deg,#2DD4BF,#0F766E)', fg:'#fff' } },
  { keys: ['camisa','blusa','polo','camiseta','playera'],                       meta: { emoji:'👔', bg:'linear-gradient(135deg,#60A5FA,#2563EB)', fg:'#fff' } },
  { keys: ['pantalon','jeans','short','bermuda'],                               meta: { emoji:'👖', bg:'linear-gradient(135deg,#1D4ED8,#1E3A8A)', fg:'#fff' } },
  { keys: ['zapato','tenis','sandalia','bota','calzado'],                       meta: { emoji:'👟', bg:'linear-gradient(135deg,#F97316,#EA580C)', fg:'#fff' } },
  { keys: ['vestido','falda','dress','skirt'],                                  meta: { emoji:'👗', bg:'linear-gradient(135deg,#EC4899,#BE185D)', fg:'#fff' } },
  { keys: ['chaqueta','jacket','abrigo','sueter','hoodie'],                     meta: { emoji:'🧥', bg:'linear-gradient(135deg,#6B7280,#374151)', fg:'#fff' } },
  { keys: ['gorra','sombrero','gorro','hat','cap'],                             meta: { emoji:'🧢', bg:'linear-gradient(135deg,#10B981,#059669)', fg:'#fff' } },
  { keys: ['lapiz','pencil'],                                                   meta: { emoji:'✏️', bg:'linear-gradient(135deg,#FBBF24,#D97706)', fg:'#fff' } },
  { keys: ['pluma','boligrafo','pen','marcador'],                               meta: { emoji:'🖊️', bg:'linear-gradient(135deg,#2563EB,#1E40AF)', fg:'#fff' } },
  { keys: ['cuaderno','libreta'],                                               meta: { emoji:'📓', bg:'linear-gradient(135deg,#EF4444,#B91C1C)', fg:'#fff' } },
  { keys: ['carpeta','folder','archivador'],                                    meta: { emoji:'📁', bg:'linear-gradient(135deg,#F59E0B,#D97706)', fg:'#fff' } },
  { keys: ['papel ','resma','hoja'],                                            meta: { emoji:'📄', bg:'linear-gradient(135deg,#64748B,#334155)', fg:'#fff' } },
  { keys: ['tijeras','grapas','engrapador','perforadora'],                      meta: { emoji:'✂️', bg:'linear-gradient(135deg,#EC4899,#9D174D)', fg:'#fff' } },
  { keys: ['calculadora','calculator'],                                         meta: { emoji:'🧮', bg:'linear-gradient(135deg,#6366F1,#4338CA)', fg:'#fff' } },
];

export const CATEGORY_META: Record<string, IconMeta> = {
  'Electronica':  { emoji:'💻', bg:'linear-gradient(135deg,#3B82F6,#1D4ED8)', fg:'#fff' },
  'Electrónica':  { emoji:'💻', bg:'linear-gradient(135deg,#3B82F6,#1D4ED8)', fg:'#fff' },
  'Alimentos':    { emoji:'🛒', bg:'linear-gradient(135deg,#22C55E,#15803D)', fg:'#fff' },
  'Limpieza':     { emoji:'🧹', bg:'linear-gradient(135deg,#06B6D4,#0E7490)', fg:'#fff' },
  'Papeleria':    { emoji:'📄', bg:'linear-gradient(135deg,#F59E0B,#B45309)', fg:'#fff' },
  'Papelería':    { emoji:'📄', bg:'linear-gradient(135deg,#F59E0B,#B45309)', fg:'#fff' },
  'Herramientas': { emoji:'🔧', bg:'linear-gradient(135deg,#F97316,#C2410C)', fg:'#fff' },
  'Farmacia':     { emoji:'💊', bg:'linear-gradient(135deg,#EF4444,#B91C1C)', fg:'#fff' },
  'Tecnologia':   { emoji:'📱', bg:'linear-gradient(135deg,#6366F1,#4338CA)', fg:'#fff' },
  'Tecnología':   { emoji:'📱', bg:'linear-gradient(135deg,#6366F1,#4338CA)', fg:'#fff' },
  'Ropa':         { emoji:'👕', bg:'linear-gradient(135deg,#A855F7,#7E22CE)', fg:'#fff' },
  'Otros':        { emoji:'📦', bg:'linear-gradient(135deg,#94A3B8,#475569)', fg:'#fff' },
};

const DEFAULT_META: IconMeta = { emoji:'📦', bg:'linear-gradient(135deg,#94A3B8,#475569)', fg:'#fff' };

export function resolveProductMeta(name = '', description = '', category = ''): IconMeta {
  const haystack = (name + ' ' + description).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const entry of KEYWORD_MAP) {
    if (entry.keys.some(k => haystack.includes(k))) return entry.meta;
  }
  return CATEGORY_META[category] ?? DEFAULT_META;
}

export function ProductIcon({
  name = '', description = '', category = '',
  size = 48, fontSize = 22, borderRadius = 12,
}: { name?: string; description?: string; category?: string; size?: number; fontSize?: number; borderRadius?: number }) {
  const meta = resolveProductMeta(name, description, category);
  return (
    <div style={{ width:size, height:size, borderRadius, background:meta.bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,.18)', userSelect:'none' }}>
      {meta.emoji}
    </div>
  );
}

export function CustomerAvatar({ name, size = 38 }: { name: string; size?: number }) {
  const COLORS: [string,string][] = [
    ['#3B82F6','#1D4ED8'],['#8B5CF6','#6D28D9'],['#EC4899','#BE185D'],
    ['#F59E0B','#B45309'],['#10B981','#065F46'],['#06B6D4','#0E7490'],
    ['#F97316','#C2410C'],['#6366F1','#4338CA'],
  ];
  const idx = name.split('').reduce((a,c) => a + c.charCodeAt(0), 0) % COLORS.length;
  const [from, to] = COLORS[idx];
  const initials = name.trim().split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <div style={{ width:size, height:size, borderRadius:'50%',
      background:`linear-gradient(135deg,${from},${to})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#fff', fontWeight:700, fontSize:size*0.36,
      flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,.18)', letterSpacing:'.02em' }}>
      {initials || '?'}
    </div>
  );
}
