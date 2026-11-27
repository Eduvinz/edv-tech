// EDV TECH — PC gamer modelado por código (three.js)
// Escala: 1 unidad = 10 cm. Gabinete centrado en el origen; vidrio lateral en +X, frente en +Z.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { loadLogo, drawLogo } from './logos.js?v=20261126235544';
import { applyRealParts } from './realparts.js?v=20261126235544';

/* ------------------------------------------------------------------ */
/* Fichas de cada componente (productos reales)                        */
/* ------------------------------------------------------------------ */
export const PARTS_INFO = {
  case: {
    tipo: 'Gabinete', logo: 'corsair', nombre: 'Corsair 4000D Airflow',
    desc: 'Mid-tower ATX con frontal perforado, cubierta de fuente y panel de vidrio templado.',
    specs: [['Formato', 'ATX mid-tower'], ['GPU máx.', '360 mm'], ['Cooler CPU máx.', '170 mm'], ['Ventiladores', 'hasta 6 × 120 mm'], ['Radiador', 'hasta 360 mm al frente']],
    instalar: 'Se sacan los dos laterales y se revisa que los standoffs estén en posición ATX antes de poner la placa.',
    fallas: 'Botón de encendido desconectado, USB frontal sin conectar, filtros tapados de polvo.',
    alt: 'NZXT H5 Flow · Lian Li Lancool 216 · Fractal North · Cooler Master TD500',
  },
  mb: {
    tipo: 'Placa madre', logo: 'asus', nombre: 'ASUS PRIME X570-PRO',
    desc: 'Placa ATX blanca y negra para Ryzen en socket AM4, con PCIe 4.0, dos M.2 y disipadores en los VRM y el chipset.',
    specs: [['Socket', 'AM4 (PGA 1331)'], ['Chipset', 'AMD X570'], ['Memoria', '4 × DDR4, hasta 128 GB'], ['PCIe', '4.0 x16 + 2 × M.2 Gen4'], ['Red', '1 GbE Intel'], ['Medidas', '305 × 244 mm']],
    instalar: 'Va sobre 9 standoffs. Se conecta el 24 pines ATX, el 8 pines EPS de CPU y los headers del frontal.',
    fallas: 'Pines del procesador doblados, BIOS antigua que no reconoce un Ryzen 5000, ventilador del chipset con ruido.',
    alt: 'ASUS TUF GAMING X570-PLUS · MSI MAG B550 TOMAHAWK · Gigabyte X570S AORUS ELITE',
  },
  cpu: {
    tipo: 'Procesador', logo: 'amd', nombre: 'AMD Ryzen 9 5900X',
    desc: '12 núcleos y 24 hilos en AM4. Sigue rindiendo muy bien para juegos, edición y trabajo pesado.',
    specs: [['Núcleos / hilos', '12 / 24'], ['Frecuencia', 'hasta 4,8 GHz'], ['Caché L3', '64 MB'], ['TDP', '105 W'], ['Socket', 'AM4'], ['Arquitectura', 'Zen 3']],
    instalar: 'Se levanta la palanca, se alinea el triángulo dorado con la marca del socket y se baja sin hacer fuerza.',
    fallas: 'Temperaturas altas por pasta seca o mal puesta, pines doblados al sacar el disipador pegado, BIOS sin soporte.',
    alt: 'Ryzen 7 5800X3D · Ryzen 5 5600X · Ryzen 7 9800X3D (AM5)',
  },
  nvme: {
    tipo: 'Almacenamiento', logo: 'samsung', nombre: '2 SSD NVMe + 1 SSD SATA',
    desc: 'M.2_1 (CPU): Samsung 990 PRO 2 TB para Windows. Detrás de la placa: Crucial T500 2 TB para juegos. Detrás de la bandeja: Samsung 870 EVO 1 TB SATA para respaldos.',
    specs: [['990 PRO', '7.450 / 6.900 MB/s'], ['T500', '7.400 / 7.000 MB/s'], ['870 EVO', '560 / 530 MB/s'], ['Total', '5 TB']],
    instalar: 'Los M.2 entran a 30° y se fijan con el seguro. El SATA va en la bandeja trasera con cable de datos y de energía.',
    fallas: 'Un M.2 que desactiva puertos SATA por compartir líneas, SSD sin disipador que baja velocidad por temperatura, firmware viejo.',
    alt: 'WD_BLACK SN850X · Crucial T500 · Kingston KC3000 · Samsung 9100 PRO (Gen5)',
  },
  ram: {
    tipo: 'Memoria RAM', logo: 'corsair', nombre: 'Corsair Dominator Platinum RGB 32 GB',
    desc: 'Kit de 2 × 16 GB DDR4 en blanco, con barra de LED Capellix. Va en los slots A2 y B2 para dual channel.',
    specs: [['Capacidad', '2 × 16 GB'], ['Tipo', 'DDR4'], ['Velocidad', '3600 MT/s'], ['Latencias', 'CL18-22-22-42'], ['Perfil', 'XMP 2.0'], ['Voltaje', '1,35 V']],
    instalar: 'Se abren los seguros, se alinea la muesca y se presiona parejo hasta que suene el clic en los dos lados.',
    fallas: 'Pantallazos con XMP activado, módulo mal puesto, slots equivocados (A1/B1) que bajan el rendimiento.',
    alt: 'Corsair Vengeance RGB Pro · G.Skill Trident Z Neo · Kingston FURY Beast · TeamGroup T-Force Delta',
  },
  cooler: {
    tipo: 'Disipador de CPU', logo: 'noctua', nombre: 'Noctua NH-U12A chromax.black',
    desc: 'Torre con 7 heatpipes y dos ventiladores NF-A12x25. Silencioso y a la altura de un AIO de 240 mm.',
    specs: [['Altura', '158 mm'], ['Heatpipes', '7'], ['Ventiladores', '2 × NF-A12x25 PWM'], ['Ruido máx.', '22,6 dB(A)'], ['Sockets', 'AM4 · AM5 · LGA1700 · LGA1851']],
    instalar: 'Se monta el kit SecuFirm2, se pone pasta NT-H2 (punto o cruz) y se aprieta en cruz, parejo.',
    fallas: 'El plástico de la base sin sacar, ventilador en el header equivocado, curva de ventiladores mal hecha.',
    alt: 'Thermalright Peerless Assassin 120 SE · DeepCool AK620 · be quiet! Dark Rock Pro 5 · Arctic Liquid Freezer III',
  },
  psu: {
    tipo: 'Fuente de poder', logo: 'corsair', nombre: 'Corsair RM850x (ATX 3.1)',
    desc: '850 W, 80 PLUS Gold, totalmente modular y con cable 12V-2x6 nativo para tarjetas actuales.',
    specs: [['Potencia', '850 W'], ['Eficiencia', '80 PLUS Gold'], ['Norma', 'ATX 3.1 · PCIe 5.1'], ['Modular', 'Total'], ['Ventilador', '140 mm, modo Zero RPM'], ['Garantía', '10 años']],
    instalar: 'Va bajo la cubierta con el ventilador hacia el filtro de abajo. Solo se conectan los cables que se usan.',
    fallas: 'Apagones con carga en fuentes genéricas, 12V-2x6 mal enchufado, cables modulares de otra marca (peligroso).',
    alt: 'Seasonic FOCUS GX-850 · MSI MAG A850GL · be quiet! Pure Power 12 M · Thermaltake Toughpower GF A3',
  },
  gpu: {
    tipo: 'Tarjeta de video', logo: 'nvidia', nombre: 'ASUS ROG Strix GeForce RTX 4090',
    desc: 'NVIDIA Ada Lovelace con 24 GB GDDR6X, DLSS 3 y ray tracing de tercera generación. Ocupa 3,5 ranuras.',
    specs: [['GPU', 'NVIDIA AD102'], ['Núcleos CUDA', '16.384'], ['Memoria', '24 GB GDDR6X · 384 bit'], ['Consumo', '450 W'], ['Conector', '12VHPWR (16 pines)'], ['Largo', '357,6 mm']],
    instalar: 'Se sacan 4 tapas traseras, entra en el PCIe x16 de arriba hasta el clic y se atornilla. Lleva soporte anti-pandeo.',
    fallas: 'Conector de 16 pines mal enchufado (se derrite), drivers corruptos, artefactos por memoria, pads secos.',
    alt: 'ASUS TUF RTX 5070 Ti · NVIDIA RTX 5080 · AMD Radeon RX 9070 XT',
  },
  fans: {
    tipo: 'Ventilación', logo: null, nombre: 'NZXT Aer P120',
    desc: '120 mm de presión estática. Tres al frente metiendo aire y uno atrás sacándolo: presión positiva.',
    specs: [['Tamaño', '120 mm'], ['Velocidad', '500 – 2.000 RPM'], ['Flujo', '52,4 CFM'], ['Presión', '2,93 mm H2O'], ['Conexión', '4 pines PWM']],
    instalar: 'Las flechas del marco indican el flujo. Frente: hacia adentro. Atrás: hacia afuera.',
    fallas: 'Ventiladores al revés (más polvo), todos en un solo header sin hub (se queda corto de corriente).',
    alt: 'Lian Li UNI FAN SL-INF · Noctua NF-A12x25 · Corsair RX120 · be quiet! Light Wings',
  },
  cables: {
    tipo: 'Cableado', logo: 'corsair', nombre: 'Cables modulares mallados',
    desc: '24 pines ATX, 8 pines EPS para la CPU y 12V-2x6 para la tarjeta, pasados por detrás de la bandeja.',
    specs: [['ATX', '24 pines'], ['CPU', 'EPS 8 pines'], ['GPU', '12V-2x6 · 600 W'], ['Frontal', 'PWR · RST · LED · USB 3 · USB-C']],
    instalar: 'Pasan por los ojales de goma y se amarran con velcro atrás. Peines para que los hilos queden parejos.',
    fallas: 'Equipo que no prende por el frontal mal conectado o el EPS sin enchufar.',
    alt: 'Cables originales de la misma fuente. Nunca mezclar cables modulares de otra marca.',
  },
  panels: {
    tipo: 'Paneles', logo: 'corsair', nombre: 'Vidrio templado y frontal',
    desc: 'Cierre: vidrio templado de 4 mm, frontal perforado y tapa superior con filtro magnético.',
    specs: [['Vidrio', 'Templado 4 mm'], ['Filtros', 'Frente, arriba y abajo'], ['Frontal', 'Acero perforado']],
    instalar: 'Antes de cerrar: prueba de encendido, temperaturas y orden de cables.',
    fallas: 'Vidrio mal apoyado o con el film puesto.',
    alt: '—',
  },
};

/* ------------------------------------------------------------------ */
/* Equipos que se turnan en el despiece                                */
/* ------------------------------------------------------------------ */
export const VARIANTS = [
  {
    id: 'gamer', nombre: 'PC gamer', spec: 'Ryzen 9 5900X · RTX 3080 Gaming X Trio · B550 AORUS · Noctua · Corsair 4000D',
    case: '4000d', board: 'b550', cpu: 'am4', cooler: 'noctua', ram: 'trident', gpu: '3080trio', fans: 'lianli-black',
    info: {
      mb: {
        tipo: 'Placa madre', logo: 'gigabyte', nombre: 'Gigabyte B550 AORUS ELITE V2',
        desc: 'Placa ATX para Ryzen en AM4 con PCIe 4.0 en la tarjeta de video y en el M.2 principal, VRM de 12+2 fases y disipador sobre el M.2.',
        specs: [['Socket', 'AM4'], ['Chipset', 'AMD B550'], ['Memoria', '4 × DDR4, hasta 128 GB'], ['PCIe', '4.0 x16'], ['M.2', '2 (uno con disipador)'], ['Red', '2.5 GbE']],
        instalar: 'Va sobre 9 standoffs. El M.2 principal está bajo el disipador: se saca el tornillo, se pone el SSD y se vuelve a cerrar.',
        fallas: 'BIOS antigua sin soporte para Ryzen 5000, LED de DRAM encendido por RAM mal puesta, M.2 que deshabilita un puerto SATA.',
        alt: 'ASUS TUF GAMING B550-PLUS · MSI MAG B550 TOMAHAWK · ASRock B550 Steel Legend',
      },
      ram: {
        tipo: 'Memoria RAM', logo: null, nombre: 'G.Skill Trident Z 32 GB',
        desc: 'Kit de 2 × 16 GB DDR4 con disipador de aluminio en negro y naranja. Va en A2 y B2 para dual channel.',
        specs: [['Capacidad', '2 × 16 GB'], ['Tipo', 'DDR4'], ['Velocidad', '3600 MT/s'], ['Latencias', 'CL16-19-19-39'], ['Perfil', 'XMP 2.0']],
        instalar: 'Se abren los seguros, se alinea la muesca y se presiona parejo hasta que suene el clic en los dos lados.',
        fallas: 'Pantallazos con XMP activado, slots equivocados que bajan el rendimiento, módulo mal puesto que no da imagen.',
        alt: 'Corsair Vengeance LPX · Kingston FURY Beast · TeamGroup T-Force Vulcan Z',
      },
      gpu: {
        tipo: 'Tarjeta de video', logo: 'nvidia', nombre: 'MSI GeForce RTX 3080 Gaming X Trio 10G',
        desc: 'Ampere con 10 GB GDDR6X y el disipador TRI FROZR 2 de tres ventiladores: fresca y silenciosa para jugar en 1440p y 4K.',
        specs: [['GPU', 'NVIDIA GA102'], ['Núcleos CUDA', '8.704'], ['Memoria', '10 GB GDDR6X · 320 bit'], ['Consumo', '340 W'], ['Conectores', '3 × 8 pines'], ['Largo', '323 mm']],
        instalar: 'Se sacan 3 tapas traseras, entra en el PCIe x16 de arriba hasta el clic, se atornilla y se conectan los 3 cables de 8 pines (sin usar el mismo cable en "cola de chancho").',
        fallas: 'Pads térmicos de la memoria secos (GDDR6X a 100 °C), ventiladores con rodamiento ruidoso, cables PCIe compartidos que causan apagones.',
        alt: 'RTX 4070 SUPER · Radeon RX 7800 XT · RTX 3080 Ti',
      },
      fans: {
        tipo: 'Ventilación', logo: null, nombre: 'Lian Li UNI FAN SL120 (negro)',
        desc: 'Ventiladores de 120 mm que se enganchan entre sí: un solo cable para cada grupo y anillos ARGB en los bordes.',
        specs: [['Tamaño', '120 mm'], ['Velocidad', '800 – 1.900 RPM'], ['Flujo', '58,5 CFM'], ['Conexión', 'Encadenados al controlador']],
        instalar: 'Se deslizan uno contra otro hasta que encajan los conectores y se conecta solo el primero al controlador.',
        fallas: 'Un ventilador mal encajado que no gira, controlador sin firmware actualizado.',
        alt: 'Lian Li UNI FAN SL-INF · Corsair iCUE LINK RX120 · Arctic P12',
      },
    },
  },
  {
    id: 'liquida', nombre: 'Refrigeración líquida', spec: 'Ryzen 9 5900X · ROG RTX 4090 · PRIME X570 · AIO 240 mm · Corsair 4000D', case: '4000d', board: 'x570', cpu: 'am4', cooler: 'aio', ram: 'dominator', gpu: 'rog4090', fans: 'nzxt',
    info: {
      cooler: {
        tipo: 'Refrigeración líquida', logo: null, nombre: 'AIO de 240 mm (bomba + radiador)',
        desc: 'Circuito cerrado: la bomba va sobre el procesador y lleva el calor por dos mangueras a un radiador de 240 mm al frente, con dos ventiladores de 120 mm metiendo aire fresco.',
        specs: [['Radiador', '240 mm (2 × 120 mm)'], ['Montaje', 'Frontal, ventiladores en push'], ['Mangueras', '2, de goma negra'], ['Bomba', 'PWM al header AIO_PUMP'], ['Sockets', 'AM4 · AM5 · LGA1700 · LGA1851']],
        instalar: 'Primero el radiador, con las mangueras abajo o al costado (nunca la bomba en el punto más alto); después la bomba sobre el procesador con pasta térmica, y la bomba al header AIO_PUMP a velocidad completa.',
        fallas: 'Bomba que no gira (CPU a 95 °C en segundos), ruido de burbujas por montaje con la bomba arriba, ventiladores del radiador al revés, líquido evaporado después de 5 o 6 años.',
        alt: 'Arctic Liquid Freezer III 240 · NZXT Kraken 240 · Corsair iCUE H100i · Lian Li Galahad II',
      },
    },
  },
  {
    id: 'trabajo', nombre: 'PC de trabajo y edición', spec: 'Intel Core i9-11900K · RTX 4090 AERO · MSI Z590 ACE · Cooler Master · gabinete blanco', case: 'v2', board: 'z590', cpu: 'i9', cooler: 'cm', ram: 'vengeance', gpu: 'aero4090', fans: 'lianli-white',
    info: {
      mb: {
        tipo: 'Placa madre', logo: 'msi', nombre: 'MSI MEG Z590 ACE',
        desc: 'Placa ATX de gama alta para Intel de 10.ª y 11.ª generación: VRM de 16+2 fases, 4 M.2 con disipador, Thunderbolt 4 y Wi-Fi 6E.',
        specs: [['Socket', 'LGA1200'], ['Chipset', 'Intel Z590'], ['Memoria', '4 × DDR4, hasta 128 GB'], ['PCIe', '4.0 x16'], ['M.2', '4, con disipadores'], ['Red', '2.5 GbE · Wi-Fi 6E']],
        instalar: 'En LGA1200 los pines están en la placa: se levanta la palanca, se apoya el procesador alineando las muescas y se baja sin tocar los pines.',
        fallas: 'Pines del socket doblados al montar el procesador, M.2 bajo disipador con el plástico protector puesto, BIOS sin soporte para 11.ª generación.',
        alt: 'ASUS ROG MAXIMUS XIII HERO · Gigabyte Z590 AORUS MASTER · ASRock Z590 Taichi',
      },
      cpu: {
        tipo: 'Procesador', logo: 'intel', nombre: 'Intel Core i9-11900K',
        desc: '8 núcleos y 16 hilos hasta 5,3 GHz: rinde muy bien en edición, programas de diseño y todo lo que use un solo núcleo rápido.',
        specs: [['Núcleos / hilos', '8 / 16'], ['Frecuencia', 'hasta 5,3 GHz'], ['Caché', '16 MB'], ['TDP', '125 W'], ['Socket', 'LGA1200'], ['Gráficos', 'Intel UHD 750']],
        instalar: 'Se alinea con las dos muescas del socket, se apoya sin arrastrar y se cierra la palanca; la tapa plástica sale sola.',
        fallas: 'Temperaturas altas con disipadores chicos (consume más de 200 W en turbo), pines del socket dañados.',
        alt: 'Intel Core i7-12700K · Intel Core i5-13600K · AMD Ryzen 9 5900X',
      },
      ram: {
        tipo: 'Memoria RAM', logo: 'corsair', nombre: 'Corsair Vengeance RGB PRO 32 GB',
        desc: 'Kit de 2 × 16 GB DDR4 con barra de luz RGB de 10 LED y disipador de aluminio.',
        specs: [['Capacidad', '2 × 16 GB'], ['Tipo', 'DDR4'], ['Velocidad', '3200 MT/s'], ['Latencias', 'CL16-18-18-36'], ['Perfil', 'XMP 2.0']],
        instalar: 'Se abren los seguros, se alinea la muesca y se presiona parejo hasta el clic.',
        fallas: 'RGB que no se sincroniza sin iCUE, XMP inestable con 4 módulos.',
        alt: 'G.Skill Trident Z RGB · Kingston FURY Beast RGB · TeamGroup T-Force Delta',
      },
      fans: {
        tipo: 'Ventilación', logo: null, nombre: 'Lian Li UNI FAN SL120 (blanco)',
        desc: 'Los mismos UNI FAN en blanco: se enganchan entre sí y ordenan el cableado del frente.',
        specs: [['Tamaño', '120 mm'], ['Velocidad', '800 – 1.900 RPM'], ['Flujo', '58,5 CFM'], ['Conexión', 'Encadenados al controlador']],
        instalar: 'Se encajan uno contra otro y se conecta solo el primero al controlador.',
        fallas: 'Ventilador mal encajado que no gira.',
        alt: 'Corsair iCUE LINK RX120 White · Arctic P12 White',
      },
      case: {
        tipo: 'Gabinete', logo: null, nombre: 'Mid-tower blanco con vidrio templado',
        desc: 'Gabinete ATX blanco con cubierta de fuente, filtro superior y compartimiento trasero para el cableado. Silencioso y ordenado para una oficina o un estudio.',
        specs: [['Formato', 'ATX mid-tower'], ['Panel lateral', 'Vidrio templado'], ['Ventiladores', '3 al frente + 1 atrás'], ['Filtros', 'Superior y frontal']],
        instalar: 'Se sacan los dos laterales, se revisan los standoffs ATX y se pasa el cableado por detrás de la bandeja antes de poner la tarjeta de video.',
        fallas: 'USB frontal sin conectar, filtros tapados que suben la temperatura, botón de encendido con el conector suelto.',
        alt: 'Corsair 4000D Airflow · NZXT H5 Flow · Lian Li Lancool 207 · Montech AIR 903',
      },
      cooler: {
        tipo: 'Disipador de CPU', logo: null, nombre: 'Cooler Master Hyper 212',
        desc: 'Torre clásica con 4 heatpipes de cobre en contacto directo y un ventilador de 120 mm. Rinde bien con procesadores de hasta 150 W.',
        specs: [['Altura', '158 mm'], ['Heatpipes', '4 × 6 mm, contacto directo'], ['Ventilador', '120 mm PWM'], ['Sockets', 'AM4 · AM5 · LGA1700']],
        instalar: 'Se monta el backplate y las patas según el socket, pasta térmica en el centro, y se aprieta en cruz hasta el tope.',
        fallas: 'Plástico protector de la base sin sacar, presión desigual que deja la CPU a 90 °C, ventilador soplando al revés.',
        alt: 'Thermalright Peerless Assassin 120 SE · DeepCool AK400 · Noctua NH-U12S',
      },
      gpu: {
        tipo: 'Tarjeta de video', logo: 'nvidia', nombre: 'Gigabyte GeForce RTX 4060 Gaming OC 8G',
        desc: 'Ada Lovelace de bajo consumo: ideal para edición en Premiere y DaVinci, render con CUDA y NVENC, y juegos en 1080p. Un solo conector de 8 pines.',
        specs: [['GPU', 'NVIDIA AD107'], ['Núcleos CUDA', '3.072'], ['Memoria', '8 GB GDDR6 · 128 bit'], ['Consumo', '115 W'], ['Conector', '1 × 8 pines'], ['Largo', '281 mm']],
        instalar: 'Se sacan 2 tapas traseras, entra en el PCIe x16 de arriba hasta el clic, se atornilla y se conecta el cable PCIe de 8 pines.',
        fallas: 'Monitor conectado a la placa en vez de a la tarjeta, drivers mezclados, cable PCIe a medio enchufar.',
        alt: 'RTX 4060 Ti 16 GB · Radeon RX 7600 · Intel Arc B580',
      },
    },
  },
  {
    id: 'chico', nombre: 'PC chico (ITX)', spec: 'Ryzen 9 5900X · RTX 4060 · placa Mini-ITX · Wraith Stealth · Ncase M1', case: 'ncase', board: 'itx', cpu: 'am4', cooler: 'wraith', ram: 'trident', gpu: 'rtx4060', fans: 'none',
    info: {
      case: {
        tipo: 'Gabinete', logo: null, nombre: 'Ncase M1 (Mini-ITX, 12,7 L)',
        desc: 'Uno de los gabinetes SFF más conocidos: aluminio, placa Mini-ITX, tarjeta de video de hasta 317 mm y fuente SFX, en el espacio de una caja de zapatos.',
        specs: [['Formato', 'Mini-ITX'], ['Volumen', '12,7 litros'], ['GPU máx.', '317 mm, 2 ranuras'], ['Fuente', 'SFX / SFX-L'], ['Material', 'Aluminio']],
        instalar: 'En un ITX el orden importa: primero la placa con CPU, RAM y M.2 fuera del gabinete, después la fuente y los cables cortos, y la tarjeta de video al final.',
        fallas: 'Temperaturas altas por poco flujo de aire, cables que tocan los ventiladores, tarjetas de video que no caben por el largo o el grosor.',
        alt: 'Cooler Master NR200P · Fractal Design Terra · Lian Li A4-H2O · SSUPD Meshroom S',
      },
      mb: {
        tipo: 'Placa madre', logo: 'asus', nombre: 'Placa Mini-ITX AMD X570 (AM4)',
        desc: 'Todo lo esencial en poco espacio: socket AM4, 2 slots de RAM, M.2 de cuarta generación, Wi-Fi y un PCIe x16 para la tarjeta de video.',
        specs: [['Socket', 'AM4'], ['Chipset', 'AMD X570'], ['Memoria', '2 × DDR4, hasta 64 GB'], ['PCIe', '1 × 4.0 x16'], ['M.2', '2 (uno atrás)']],
        instalar: 'Se arma fuera del gabinete (CPU, RAM, M.2 y disipador) y se entra completa; cuesta llegar a los conectores una vez adentro.',
        fallas: 'VRM caliente por poco flujo de aire, BIOS antigua sin soporte para Ryzen 5000, el conector de 8 pines difícil de enchufar.',
        alt: 'ASUS ROG STRIX B550-I · Gigabyte B650I AORUS ULTRA · MSI MPG B650I EDGE',
      },
      cooler: {
        tipo: 'Disipador de CPU', logo: 'amd', nombre: 'AMD Wraith Stealth',
        desc: 'El disipador que viene con muchos Ryzen: bajo (54 mm), ideal para gabinetes chicos y procesadores de hasta 65 W.',
        specs: [['Altura', '54 mm'], ['Ventilador', '92 mm'], ['TDP', 'hasta 65 W'], ['Socket', 'AM4']],
        instalar: 'Trae la pasta térmica puesta. Se atornillan las 4 esquinas en cruz, de a poco, sobre el backplate de la placa.',
        fallas: 'Con un Ryzen 9 se queda corto: recomendamos un disipador de perfil bajo mejor (Noctua NH-L12S) o un AIO de 240 mm.',
        alt: 'Noctua NH-L12S · Thermalright AXP90-X47 · ID-Cooling IS-55',
      },
      psu: {
        tipo: 'Fuente de poder', logo: 'corsair', nombre: 'Fuente SFX 750 W',
        desc: 'Formato SFX: la mitad del tamaño de una ATX, totalmente modular y 80 PLUS Platinum. Necesaria en gabinetes ITX.',
        specs: [['Potencia', '750 W'], ['Formato', 'SFX (125 × 63,5 × 100 mm)'], ['Eficiencia', '80 PLUS Platinum'], ['Modular', 'Total']],
        instalar: 'Va al frente, con cables cortos o a medida para que no estorben el flujo de aire.',
        fallas: 'Cables largos que tapan el ventilador de la tarjeta, ventilador de 92 mm ruidoso con carga alta.',
        alt: 'Corsair SF750 · Cooler Master V850 SFX · Lian Li SP750',
      },
      fans: {
        tipo: 'Ventilación', logo: null, nombre: 'Flujo de aire de un ITX',
        desc: 'En un gabinete chico el aire lo mueven la tarjeta de video, el disipador y la fuente; se pueden agregar 2 ventiladores delgados abajo.',
        specs: [['Opcional', '2 × 120 mm slim abajo'], ['Orientación', 'Meter aire desde abajo']],
        instalar: 'Ventiladores slim de 15 mm para no chocar con la tarjeta de video.',
        fallas: 'Tarjeta ahogada sin espacio bajo los ventiladores.',
        alt: 'Noctua NF-A12x15 · Arctic P12 Slim',
      },
      cables: {
        tipo: 'Cableado', logo: null, nombre: 'Cables cortos (a medida)',
        desc: 'En un ITX se usan cables cortos o hechos a medida: los de una fuente normal no caben y tapan el aire.',
        specs: [['ATX', '24 pines corto'], ['CPU', 'EPS 8 pines'], ['GPU', 'PCIe 8 pines']],
        instalar: 'Se conectan antes de entrar la tarjeta de video; después no se alcanza.',
        fallas: 'Equipo que no prende por el EPS mal enchufado detrás de la placa.',
        alt: 'Cables CableMod o los cortos de la misma fuente',
      },
      nvme: {
        tipo: 'Almacenamiento', logo: 'samsung', nombre: 'Samsung 990 PRO 2 TB',
        desc: 'Un solo SSD NVMe en el M.2 de la placa: rápido y sin cables.',
        specs: [['Interfaz', 'PCIe 4.0 x4'], ['Lectura', '7.450 MB/s'], ['Escritura', '6.900 MB/s']],
        instalar: 'Entra a 30° en el M.2 y se fija con el tornillo o el seguro.',
        fallas: 'Temperatura alta sin disipador en gabinetes chicos.',
        alt: 'WD_BLACK SN850X · Crucial T500',
      },
    },
  },
];
{
  const chico = VARIANTS.find((x) => x.id === 'chico').info;
  chico.ram = VARIANTS.find((x) => x.id === 'gamer').info.ram;
  const trabajo = VARIANTS.find((x) => x.id === 'trabajo').info;
  chico.gpu = trabajo.gpu;                      // la RTX 4060 (2 ranuras) cabe en el Ncase
  trabajo.gpu = {
    tipo: 'Tarjeta de video', logo: 'nvidia', nombre: 'Gigabyte GeForce RTX 4090 AERO OC 24G',
    desc: 'La 4090 en blanco y plata: 24 GB GDDR6X para render 3D, edición en 8K y modelos de IA local, con el disipador WINDFORCE de tres ventiladores.',
    specs: [['GPU', 'NVIDIA AD102'], ['Núcleos CUDA', '16.384'], ['Memoria', '24 GB GDDR6X · 384 bit'], ['Consumo', '450 W'], ['Conector', '12VHPWR (16 pines)'], ['Largo', '342 mm']],
    instalar: 'Se sacan 4 tapas traseras, entra en el PCIe x16 hasta el clic, se atornilla y se usa el soporte anti-pandeo que trae; el cable de 16 pines tiene que entrar hasta el fondo.',
    fallas: 'Conector de 16 pines a medio enchufar (se derrite), pandeo que daña el slot PCIe, fuente de menos de 850 W que se apaga con carga.',
    alt: 'ASUS ProArt RTX 4080 SUPER · RTX 4070 Ti SUPER · Radeon PRO W7800',
  };
}

export const BUILD_STEPS = [
  { id: 'mb', txt: 'Placa madre sobre los standoffs' },
  { id: 'cpu', txt: 'Procesador en el socket' },
  { id: 'nvme', txt: 'SSD: 2 NVMe en M.2 y 1 SATA atrás' },
  { id: 'ram', txt: 'RAM en A2 y B2 (dual channel)' },
  { id: 'cooler', txt: 'Pasta térmica y disipador' },
  { id: 'psu', txt: 'Fuente bajo la cubierta' },
  { id: 'gpu', txt: 'Tarjeta de video en el PCIe x16' },
  { id: 'fans', txt: 'Ventiladores: 3 entran, 1 sale' },
  { id: 'cables', txt: 'Cables y frontal' },
  { id: 'panels', txt: 'Cerrar y prueba de estrés' },
];

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.45, ...o });
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const rbox = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.01, h / 2.01, d / 2.01)), m);
const cyl = (r, h, m, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);

function tex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

// Plano con textura apoyado sobre una cara. dir: '+x' | '-x' | '+y' | '-y' | '+z' | '-z'
function decal(t, w, h, dir, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: o.roughness ?? 0.7, metalness: o.metalness ?? 0, envMapIntensity: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
  const r = { '+x': [0, Math.PI / 2, 0], '-x': [0, -Math.PI / 2, 0], '+y': [-Math.PI / 2, 0, 0], '-y': [Math.PI / 2, 0, 0], '+z': [0, 0, 0], '-z': [0, Math.PI, 0] }[dir];
  m.rotation.set(...r);
  m.userData.flip = true;
  return m;
}

// Une muchas cajas repetidas en una sola malla (aletas, pines, chips…)
function boxes(list, m) {
  const geos = list.map(([w, h, d, x, y, z, rx = 0, ry = 0, rz = 0]) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
    g.translate(x, y, z);
    return g;
  });
  return new THREE.Mesh(mergeGeometries(geos), m);
}

// Tornillos Phillips en 3D (cabeza + cruz), fusionados en dos mallas. list: [x, y, z, dir]
function screws(list, r = 0.022, headColor = 0x9a9a9a, crossColor = 0x1a1a1a) {
  const rot = { '+x': [0, 0, -Math.PI / 2], '-x': [0, 0, Math.PI / 2], '+y': [0, 0, 0], '-y': [Math.PI, 0, 0], '+z': [Math.PI / 2, 0, 0], '-z': [-Math.PI / 2, 0, 0] };
  const h = r * 0.55, heads = [], crosses = [];
  list.forEach(([x, y, z, dir]) => {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot[dir]));
    m.setPosition(x, y, z);
    const hg = new THREE.CylinderGeometry(r * 0.92, r, h, 20); hg.translate(0, h / 2, 0); hg.applyMatrix4(m); heads.push(hg);
    [0, Math.PI / 2].forEach((a) => { const cg = new THREE.BoxGeometry(r * 1.25, 0.003, r * 0.24); cg.rotateY(a); cg.translate(0, h + 0.0012, 0); cg.applyMatrix4(m); crosses.push(cg); });
  });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(mergeGeometries(heads), M(headColor, { metalness: 0.95, roughness: 0.3 })));
  g.add(new THREE.Mesh(mergeGeometries(crosses), M(crossColor, { metalness: 0.4, roughness: 0.7 })));
  return g;
}

// Muchos cilindros (condensadores, jacks…) en una sola malla. list: [x, y, z]; eje en X
function cyls(list, r, h, m, axis = 'x') {
  const geos = list.map(([x, y, z]) => { const g = new THREE.CylinderGeometry(r, r, h, 16); if (axis === 'x') g.rotateZ(Math.PI / 2); if (axis === 'z') g.rotateX(Math.PI / 2); g.translate(x, y, z); return g; });
  return new THREE.Mesh(mergeGeometries(geos), m);
}

// Luz real que emite una pieza con LED: se mueve con la pieza y toma su color
function ledLight(owner, list, phase, pos, intensity = 2.2, distance = 3.2) {
  const l = new THREE.PointLight(0xfff3e6, intensity, distance, 2);
  l.position.set(...pos); owner.add(l);
  list.push({ l, phase, base: intensity });
  return l;
}

function rgbMaterial(rgbList, phase = 0) {
  const m = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.35, transparent: true, opacity: 0.92 });
  m.userData.rgb = true;
  rgbList.push({ m, phase });
  return m;
}

/* ---------- Texturas reutilizables ---------- */
let TX = null;
function sharedTextures() {
  if (TX) return TX;
  const braid = tex(256, 64, (g, w, h) => {
    g.fillStyle = '#0d0d0d'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 3;
    for (let x = -h; x < w + h; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke(); g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke(); }
  });
  braid.wrapS = braid.wrapT = THREE.RepeatWrapping;
  const brushed = tex(1024, 64, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.08})`; g.fillRect(0, Math.random() * h, w, 1); }
  });
  brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping;
  brushed.colorSpace = THREE.NoColorSpace;
  // Perforado triangular del frontal del 4000D (alphaMap: blanco = opaco)
  const perf = tex(512, 1024, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#000';
    const s = 11;
    for (let y = 0, r = 0; y < h + s; y += s * 0.87, r++) for (let x = (r % 2) * s / 2; x < w + s; x += s) {
      g.beginPath();
      if ((r + Math.round(x / s)) % 2) { g.moveTo(x, y - 3.4); g.lineTo(x + 4, y + 3); g.lineTo(x - 4, y + 3); }
      else { g.moveTo(x, y + 3.4); g.lineTo(x + 4, y - 3); g.lineTo(x - 4, y - 3); }
      g.fill();
    }
  });
  perf.colorSpace = THREE.NoColorSpace;
  const hex = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#000';
    const r = 9;
    for (let y = 0, row = 0; y < h + r; y += r * 1.6, row++) for (let x = (row % 2) * r * 0.95; x < w + r; x += r * 1.9) {
      g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; g.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); } g.fill();
    }
  });
  hex.colorSpace = THREE.NoColorSpace;
  TX = { braid, brushed, perf, hex };
  return TX;
}

/* ---------- Ventilador realista ---------- */
function makeFan({ size = 1.2, blades = 7, frame = 0x151515, blade = 0x1c1c1c, rgbList = null, phase = 0, spinners, speed = 1, ring = false, hubTex = null, pads = false, noFrame = false, withScrews = false }) {
  const g = new THREE.Group();
  const s = size, d = 0.25 * (s / 1.2), half = s / 2, cr = s * 0.06;
  if (!noFrame) {
    // marco: cuadrado redondeado con agujero central y 4 agujeros de tornillo
    const sh = new THREE.Shape();
    sh.moveTo(-half + cr, -half); sh.lineTo(half - cr, -half); sh.quadraticCurveTo(half, -half, half, -half + cr);
    sh.lineTo(half, half - cr); sh.quadraticCurveTo(half, half, half - cr, half); sh.lineTo(-half + cr, half);
    sh.quadraticCurveTo(-half, half, -half, half - cr); sh.lineTo(-half, -half + cr); sh.quadraticCurveTo(-half, -half, -half + cr, -half);
    const hole = new THREE.Path(); hole.absarc(0, 0, s * 0.475, 0, Math.PI * 2, true); sh.holes.push(hole);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { const p = new THREE.Path(); p.absarc(a * s * 0.43, b * s * 0.43, s * 0.022, 0, Math.PI * 2, true); sh.holes.push(p); });
    const fg = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 48 });
    fg.translate(0, 0, -d / 2);
    g.add(new THREE.Mesh(fg, M(frame, { metalness: 0.05, roughness: 0.75 })));
    if (pads) {
      const padM = M(0x111111, { metalness: 0, roughness: 0.95 });
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { const p = rbox(s * 0.11, s * 0.11, d * 1.04, 0.012, padM); p.position.set(a * s * 0.44, b * s * 0.44, 0); g.add(p); });
    }
    // brazos del motor (atrás)
    const armM = M(frame, { metalness: 0.05, roughness: 0.75 });
    for (let i = 0; i < 4; i++) { const a = box(s * 0.33, s * 0.025, d * 0.18, armM); const ang = i * Math.PI / 2 + 0.6; a.position.set(Math.cos(ang) * s * 0.3, Math.sin(ang) * s * 0.3, -d * 0.4); a.rotation.z = ang; g.add(a); }
  }
  // rotor
  const rotor = new THREE.Group();
  const hubR = s * 0.165;
  const hub = cyl(hubR, d * 0.8, M(blade, { metalness: 0.1, roughness: 0.5 }), 48); hub.rotation.x = Math.PI / 2; rotor.add(hub);
  if (hubTex) { const st = new THREE.Mesh(new THREE.CircleGeometry(hubR * 0.92, 48), new THREE.MeshStandardMaterial({ map: hubTex, roughness: 0.4 })); st.position.z = d * 0.41; st.userData.flip = true; rotor.add(st); }
  const L = s * 0.47 - hubR - 0.008, wRoot = s * 0.16, wTip = s * 0.3;
  const bs = new THREE.Shape();
  bs.moveTo(0, -wRoot * 0.5);
  bs.bezierCurveTo(L * 0.35, -wRoot * 0.7, L * 0.75, -wTip * 0.75, L, -wTip * 0.25);
  bs.bezierCurveTo(L * 1.02, wTip * 0.1, L * 0.95, wTip * 0.5, L * 0.82, wTip * 0.55);
  bs.bezierCurveTo(L * 0.5, wTip * 0.35, L * 0.2, wRoot * 0.6, 0, wRoot * 0.5);
  const bg = new THREE.ExtrudeGeometry(bs, { depth: 0.008, bevelEnabled: false, curveSegments: 16 });
  const bladeM = M(blade, { metalness: 0.05, roughness: 0.42, side: THREE.DoubleSide });
  for (let i = 0; i < blades; i++) {
    const pivot = new THREE.Group();
    const b = new THREE.Mesh(bg, bladeM);
    b.position.x = hubR - 0.01; b.rotation.x = 0.62;
    pivot.add(b); pivot.rotation.z = (i / blades) * Math.PI * 2; rotor.add(pivot);
  }
  if (ring) rotor.add(new THREE.Mesh(new THREE.TorusGeometry(s * 0.462, 0.012, 8, 96), bladeM));
  rotor.userData.speed = speed;
  g.add(rotor); spinners.push(rotor);
  if (rgbList) {
    const led = new THREE.Mesh(new THREE.TorusGeometry(s * 0.475, 0.01, 8, 96), rgbMaterial(rgbList, phase)); led.position.z = d * 0.5; g.add(led);
  }
  if (withScrews) g.add(screws([[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => [a * s * 0.43, b * s * 0.43, d / 2 + 0.006, '+z']), 0.026, 0x2a2a2a, 0x0a0a0a));
  // cable del ventilador saliendo de un brazo
  if (!noFrame) { const cc = new THREE.CatmullRomCurve3([new THREE.Vector3(-s * 0.18, -s * 0.18, -d * 0.4), new THREE.Vector3(-s * 0.36, -s * 0.36, -d * 0.45), new THREE.Vector3(-s * 0.49, -s * 0.47, -d * 0.45)]); g.add(new THREE.Mesh(new THREE.TubeGeometry(cc, 16, 0.007, 6, false), M(0x111111, { metalness: 0, roughness: 0.8 }))); }
  return g;
}

/* ---------- Mazo de cables mallados ---------- */
// punto de cable dentro del espacio útil del gabinete (antes del marco frontal y bajo el techo)
const inCase = ([x, y, z]) => new THREE.Vector3(x, Math.min(y, 2.18), Math.min(z, 1.55));

function bundle(points, rows, cols, gap, r, opts = {}) {
  const T = sharedTextures();
  const curve = new THREE.CatmullRomCurve3(points.map(inCase), false, 'centripetal');
  const N = 80;
  // Marco fijo y plano: las filas del mazo van en X (contra la bandeja) y las columnas a lo ancho,
  // así el cable no se tuerce ni se para contra los paneles.
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);
  const frames = { tangents: [], normals: [], binormals: [] };
  for (let k = 0; k <= N; k++) {
    const t = curve.getTangentAt(k / N).normalize();
    let side = new THREE.Vector3().crossVectors(t, X);
    if (side.lengthSq() < 0.04) side.crossVectors(t, Y);
    side.normalize();
    const up = new THREE.Vector3().crossVectors(side, t).normalize();
    frames.tangents.push(t); frames.normals.push(up); frames.binormals.push(side);
  }
  const group = new THREE.Group();
  const sleeveTex = T.braid.clone(); sleeveTex.needsUpdate = true; sleeveTex.repeat.set(curve.getLength() * 22, 1);
  const wireM = new THREE.MeshStandardMaterial({ color: opts.color ?? 0x1a1a1a, map: sleeveTex, roughness: 0.85, metalness: 0 });
  const geos = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const oi = (i - (rows - 1) / 2) * gap, oj = (j - (cols - 1) / 2) * gap;
    const pts = [];
    for (let k = 0; k <= N; k++) {
      const p = curve.getPointAt(k / N);
      pts.push(p.add(frames.normals[k].clone().multiplyScalar(oi)).add(frames.binormals[k].clone().multiplyScalar(oj)));
    }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, r, 8, false));
  }
  group.add(new THREE.Mesh(mergeGeometries(geos), wireM));
  const W = rows * gap + 0.03, H = cols * gap + 0.03;
  const comb = M(0x0a0a0a, { metalness: 0.1, roughness: 0.6 });
  const place = (u, len) => {
    const k = Math.round(u * N);
    const b = box(len, W, H, comb);
    b.position.copy(curve.getPointAt(u));
    b.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(frames.tangents[k], frames.normals[k], frames.binormals[k]));
    group.add(b);
  };
  (opts.combs ?? [0.35, 0.6]).forEach((u) => place(u, 0.03));
  place(0.0, 0.12); place(1.0, 0.14);
  return group;
}

/* ------------------------------------------------------------------ */
/* Modelo                                                              */
/* ------------------------------------------------------------------ */
export class PCModel {
  constructor(L, variant = VARIANTS[0]) {
    this.L = L || {};
    this.variant = variant;
    this.info = { ...PARTS_INFO, ...(variant.info || {}) };
    this.floorY = -2.68;
    this.root = new THREE.Group();
    this.parts = {};
    this.spinners = [];
    this.rgb = [];
    this.rgbOn = false;
    this.leds = []; // luces puntuales que acompañan a los anillos ARGB, la RAM y la GPU
    this.build();
    // Disposición real del Corsair 4000D: mirando de frente, el vidrio queda a la izquierda.
    // La escena se refleja en z y cada texto hecho por código se vuelve a reflejar para leerse al derecho.
    this.root.scale.z = -1;
    this.root.traverse((o) => { if (o.userData.flip === 'y') o.scale.y *= -1; else if (o.userData.flip) o.scale.x *= -1; });
    this.screws = screws; // para los tornillos de las piezas reales
    this.real = applyRealParts(this, this.variant);
  }

  // después de cambiar piezas por modelos reales: listas de mallas, rotores y cable de la tarjeta
  afterSwap() {
    Object.values(this.parts).forEach((p) => {
      p.meshes = [];
      p.pieces.forEach(({ obj }) => obj.traverse((o) => { o.userData.partId = p.id; if (o.isMesh) p.meshes.push(o); }));
    });
    const inRoot = (o) => { while (o) { if (o === this.root) return true; o = o.parent; } return false; };
    this.spinners = this.spinners.filter(inRoot);
  }

  // 12V-2x6 desde la fuente, sube por el ojal de la cubierta pegado al vidrio y entra al conector de la tarjeta
  reroute12V([x, y, z]) {
    const cab = this.parts.cables.pieces[0].obj;
    cab.remove(this.cable12v);
    this.cable12v = bundle([[-0.1, -1.85, -0.53], [0.45, -1.72, -0.5], [0.82, -1.45, z], [0.82, -1.0, z], [0.82, y - 0.3, z], [0.78, y - 0.02, z], [0.6, y, z], [x + 0.05, y, z]], 2, 6, 0.022, 0.0095, { combs: [0.45, 0.62] });
    this.cable12v.traverse((o) => { o.userData.partId = 'cables'; o.castShadow = true; });
    cab.add(this.cable12v);
    this.gpuGrom.position.z = z;
    this.afterSwap();
  }

  addPart(id, pieces, opts = {}) {
    const part = { id, pieces: [], t: 0, target: 0, fade: !!opts.fade, meshes: [] };
    pieces.forEach(([obj, base, off]) => {
      obj.position.set(...base);
      obj.traverse((o) => {
        o.userData.partId = id;
        if (!o.isMesh) return;
        // las piezas que se desvanecen llevan su propia copia del material, para no apagar otras que lo comparten
        if (opts.fade) o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
        part.meshes.push(o); o.castShadow = true; o.receiveShadow = true;
      });
      this.root.add(obj);
      part.pieces.push({ obj, base: new THREE.Vector3(...base), off: new THREE.Vector3(...off) });
    });
    this.parts[id] = part;
  }

  build() {
    const L = this.L, rgb = this.rgb, sp = this.spinners, T = sharedTextures();
    const gold = M(0xd4a640, { metalness: 1, roughness: 0.25 });
    const silver = M(0xc8c8c8, { metalness: 0.95, roughness: 0.22 });

    /* ================= Gabinete Corsair 4000D Airflow ================= */
    const caseG = new THREE.Group();
    const steel = M(0x161616, { metalness: 0.35, roughness: 0.66, envMapIntensity: 0.32 }); // acero pintado negro satinado
    const inner = M(0x121212, { metalness: 0.3, roughness: 0.72, envMapIntensity: 0.28 });
    // ancho real: 2,3 de cámara principal + 0,3 de compartimiento de cables detrás de la bandeja (x de -1.45 a 1.15)
    // Pared trasera: chapa con aberturas reales (fuente, I/O, ventilador, 7 ranuras de expansión)
    const bs = new THREE.Shape(); bs.moveTo(-1.45, -2.35); bs.lineTo(1.15, -2.35); bs.lineTo(1.15, 2.35); bs.lineTo(-1.45, 2.35); bs.lineTo(-1.45, -2.35);
    const rectHole = (x0, y0, x1, y1) => { const h = new THREE.Path(); h.moveTo(x0, y0); h.lineTo(x0, y1); h.lineTo(x1, y1); h.lineTo(x1, y0); h.lineTo(x0, y0); bs.holes.push(h); };
    rectHole(-1.03, -2.29, 0.43, -1.47);                 // fuente
    rectHole(-1.07, 0.94, -0.67, 2.22);                  // panel I/O
    const fanHole = new THREE.Path(); fanHole.absarc(0.15, 1.6, 0.56, 0, Math.PI * 2, true); bs.holes.push(fanHole);
    for (let i = 0; i < 7; i++) rectHole(-0.97, 0.55 - i * 0.2 - 0.07, 0.03, 0.55 - i * 0.2 + 0.07);
    const backG = new THREE.ExtrudeGeometry(bs, { depth: 0.04, bevelEnabled: false, curveSegments: 48 }); backG.translate(0, 0, -2.27);
    caseG.add(new THREE.Mesh(backG, steel));
    // rejilla hexagonal del ventilador trasero y marco de ranuras
    const grille = new THREE.Mesh(new THREE.CircleGeometry(0.565, 64), M(0x1a1a1a, { metalness: 0.6, roughness: 0.48, alphaMap: T.hex, alphaTest: 0.5, side: THREE.DoubleSide }));
    grille.position.set(0.15, 1.6, -2.25); caseG.add(grille);
    // tapas de ranura con rendijas (las ranuras 1, 2 y 3 las ocupa la tarjeta de video)
    const slotTex = tex(512, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#000'; for (let x = 40; x < w - 40; x += 22) g.fillRect(x, 18, 10, 28); });
    slotTex.colorSpace = THREE.NoColorSpace;
    const coverM = M(0x1c1c1c, { metalness: 0.6, roughness: 0.45, alphaMap: slotTex, alphaTest: 0.5, side: THREE.DoubleSide });
    [0, 4, 5, 6].forEach((i) => { const c = box(1.02, 0.15, 0.008, coverM); c.position.set(-0.47, 0.55 - i * 0.2, -2.276); caseG.add(c); });
    // tornillos de las ranuras, de la fuente y del panel
    caseG.add(screws([...Array.from({ length: 7 }, (_, i) => [0.12, 0.55 - i * 0.2, -2.27, '-z']), [-0.98, -1.52, -2.27, '-z'], [0.38, -1.52, -2.27, '-z'], [-0.98, -2.24, -2.27, '-z'], [0.38, -2.24, -2.27, '-z']], 0.026, 0x2a2a2a, 0x0a0a0a));
    // puntos de amarre de cables (detrás de la bandeja) y rieles de ventiladores frontales
    const ties = []; [[1.85, 0.4], [1.2, 0.95], [0.4, 0.95], [-0.4, 0.95], [-1.2, 0.6], [1.85, -1.0], [0.6, -1.7], [-0.6, -1.9]].forEach(([y, z]) => ties.push(new THREE.TorusGeometry(0.03, 0.008, 6, 16).rotateY(Math.PI / 2).translate(-1.18, y, z)));
    caseG.add(new THREE.Mesh(mergeGeometries(ties), M(0x2a2a2a, { metalness: 0.6, roughness: 0.4 })));
    caseG.add(boxes([[0.06, 4.0, 0.04, -0.63, 0.2, 2.2], [0.06, 4.0, 0.04, 0.63, 0.2, 2.2]], M(0x151515, { metalness: 0.6, roughness: 0.5 })));
    // filtro de polvo inferior con lengüeta, y gomas de las patas
    const filt = box(1.6, 0.012, 2.5, M(0x222222, { metalness: 0.2, roughness: 0.8, alphaMap: T.hex, alphaTest: 0.5 })); filt.position.set(-0.3, -2.385, -1.0); caseG.add(filt);
    const tab = rbox(0.3, 0.02, 0.08, 0.01, M(0x111111, { metalness: 0.1, roughness: 0.7 })); tab.position.set(-0.3, -2.39, 0.28); caseG.add(tab);
    // bandeja de la placa con recorte detrás del socket y canal frontal para cables
    caseG.add(boxes([
      [0.04, 3.05, 4.1, -1.15, -0.825, -0.2], [0.04, 0.25, 4.1, -1.15, 2.225, -0.2],
      [0.04, 1.4, 0.85, -1.15, 1.4, -1.825], [0.04, 1.4, 2.15, -1.15, 1.4, 0.775],
    ], inner));
    // amarras de velcro en el compartimiento trasero
    caseG.add(boxes([[0.12, 0.05, 0.16, -1.3, 0.9, 0.95], [0.12, 0.05, 0.16, -1.3, -0.6, 0.95], [0.12, 0.05, 0.12, -1.3, 1.6, -0.75], [0.12, 0.16, 0.05, -1.3, -1.5, 0.3]], M(0x1a1a1a, { metalness: 0, roughness: 0.95 })));
    const grom = M(0x050505, { metalness: 0, roughness: 0.95 });
    [[1.0, 0.85, 0.12, 0.55], [-0.2, 0.85, 0.12, 0.55], [2.2, -1.2, 0.03, 0.5], [-1.15, -1.65, 0.12, 0.35]].forEach(([y, z, h, w]) => { const g = rbox(0.02, h + 0.05, w, 0.03, grom); g.position.set(-1.125, y, z); caseG.add(g); });
    const bottom = box(2.6, 0.05, 4.5, steel); bottom.position.set(-0.15, -2.35, 0); caseG.add(bottom);
    const shroudTop = box(2.22, 0.03, 3.4, inner); shroudTop.position.set(0, -1.25, -0.5); caseG.add(shroudTop);
    const shroudFront = box(2.22, 0.03, 0.62, M(0x0e0e0e, { metalness: 0.45, roughness: 0.6, alphaMap: T.hex, alphaTest: 0.5 })); shroudFront.position.set(0, -1.25, 1.53); caseG.add(shroudFront);
    const shroudCover = new THREE.Group();
    shroudCover.add(box(0.02, 1.08, 4.0, inner));
    if (L.corsair) {
      const t = tex(1024, 256, (g, w) => { drawLogo(g, L.corsair, w / 2, 60, 130, '#d8d8d8', 900, 'center'); });
      const d = decal(t, 0.9, 0.225, '+x'); d.position.set(0.012, 0.05, 1.2); shroudCover.add(d);
    }
    this.shroudCover = shroudCover;
    const footM = M(0x111111, { metalness: 0.2, roughness: 0.8 });
    [[0.7, 1.85], [-1.0, 1.85], [0.7, -1.85], [-1.0, -1.85]].forEach(([x, z]) => { const f = rbox(0.4, 0.1, 0.5, 0.04, footM); f.position.set(x, -2.43, z); caseG.add(f); });
    caseG.add(boxes([
      [2.6, 0.05, 0.05, -0.15, 2.35, 2.25], [2.6, 0.05, 0.05, -0.15, -2.35, 2.25], [2.6, 0.05, 0.05, -0.15, 2.35, -2.25],
      [0.05, 4.7, 0.05, 1.15, 0, 2.25], [0.05, 4.7, 0.05, 1.15, 0, -2.25], [0.05, 0.05, 4.5, 1.15, 2.35, 0], [0.05, 0.05, 4.5, 1.15, -2.35, 0],
      [0.05, 4.7, 0.05, -1.45, 0, 2.25], [0.05, 4.7, 0.05, -1.45, 0, -2.25], [0.05, 0.05, 4.5, -1.45, 2.35, 0], [0.05, 0.05, 4.5, -1.45, -2.35, 0],
    ], steel));
    this.addPart('case', [[caseG, [0, 0, 0], [0, 0, 0]]]);

    /* ================= Paneles ================= */
    const glass = box(0.04, 4.62, 4.42, new THREE.MeshPhysicalMaterial({ color: 0x1b1f22, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.02, envMapIntensity: 0.45, depthWrite: false }));
    glass.renderOrder = 10;
    glass.userData.isGlass = true;
    // borde serigrafiado negro (como un vidrio templado real) y 4 pernos de montaje
    const bandM = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.94 });
    const band = boxes([[0.044, 0.16, 4.42, 0, 2.23, 0], [0.044, 0.16, 4.42, 0, -2.23, 0], [0.044, 4.3, 0.16, 0, 0, 2.13], [0.044, 4.3, 0.16, 0, 0, -2.13]], bandM);
    band.userData.isGlass = true; glass.add(band);
    const gPins = screws([[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => [0.024, a * 2.2, b * 2.1, '+x']), 0.03, 0x1a1a1a, 0x0a0a0a);
    gPins.traverse((o) => { o.userData.isGlass = true; }); glass.add(gPins);
    const frontG = new THREE.Group();
    const fMesh = box(2.5, 4.6, 0.03, M(0x0b0b0b, { metalness: 0.55, roughness: 0.5, alphaMap: T.perf, alphaTest: 0.5, side: THREE.DoubleSide })); fMesh.position.x = -0.15; frontG.add(fMesh);
    frontG.add(boxes([[2.6, 0.08, 0.06, -0.15, 2.31, 0], [2.6, 0.08, 0.06, -0.15, -2.31, 0], [0.08, 4.7, 0.06, 1.11, 0, 0], [0.08, 4.7, 0.06, -1.41, 0, 0]], steel));
    if (L.corsair) {
      const t = tex(1024, 256, (g, w) => { drawLogo(g, L.corsair, w / 2, 70, 110, '#bdbdbd', 700, 'center'); });
      const plate = box(1.2, 0.3, 0.02, M(0x0b0b0b, { metalness: 0.55, roughness: 0.5 })); plate.position.set(-0.15, -2.05, 0.01); frontG.add(plate);
      const d = decal(t, 1.0, 0.25, '+z'); d.position.set(-0.15, -2.05, 0.025); frontG.add(d);
    }
    const topG = new THREE.Group();
    const topMesh = box(2.6, 0.04, 4.5, M(0x0b0b0b, { metalness: 0.55, roughness: 0.5, alphaMap: T.hex, alphaTest: 0.5 })); topMesh.position.x = -0.15; topG.add(topMesh);
    const topSolid = box(2.6, 0.045, 0.6, steel); topSolid.position.set(-0.15, 0, 1.95); topG.add(topSolid);
    const pwr = cyl(0.06, 0.03, M(0x1a1a1a, { metalness: 0.7, roughness: 0.3 }), 32); pwr.position.set(-0.6, 0.03, 1.95); topG.add(pwr);
    const pwrLed = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 6, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 })); pwrLed.rotation.x = Math.PI / 2; pwrLed.position.set(-0.6, 0.046, 1.95); topG.add(pwrLed);
    topG.add(boxes([[0.13, 0.03, 0.05, -0.25, 0.03, 1.95], [0.13, 0.03, 0.05, 0.05, 0.03, 1.95], [0.1, 0.03, 0.045, 0.32, 0.03, 1.95]], M(0x050505, { metalness: 0.2, roughness: 0.6 })));
    // panel trasero de acero: tapa el compartimiento de cables
    const rearPanel = new THREE.Group();
    rearPanel.add(box(0.035, 4.62, 4.42, M(0x121212, { metalness: 0.35, roughness: 0.68, envMapIntensity: 0.3 })));
    this.glass = glass;
    this.addPart('panels', [
      // Nada se desvanece: cada panel sale entero y queda a la vista. El vidrio queda más allá del disipador
      // (la pieza que más se aleja) y la tapa de la fuente más allá de la fuente, así nunca se cruzan.
      [glass, [1.17, 0, 0], [5.7, 0, 0]],
      [rearPanel, [-1.47, 0, 0], [-1.5, 0, 0]],
      [frontG, [0, 0, 2.27], [-2.0, 0, 3.0]],
      [topG, [0, 2.385, 0], [0, 1.4, 0]],
      [this.shroudCover, [1.11, -1.8, -0.2], [3.7, 0, 0]],
    ]);

    /* ================= Placa madre ASUS TUF GAMING X870-PLUS WIFI ================= */
    // locales: x sale de la placa, y = alto (3,05), z = ancho (2,44). En el mundo va en (-1.1, 0.75, -0.7)
    const mbG = new THREE.Group();
    const W = 2048, H = 2560;
    const toC = (y, z) => [(1.22 - z) / 2.44 * W, (1.525 - y) / 3.05 * H];
    const pcbTex = tex(W, H, (g) => {
      g.fillStyle = '#121312'; g.fillRect(0, 0, W, H);
      g.lineCap = 'round';
      for (let i = 0; i < 520; i++) {
        let x = Math.random() * W, y = Math.random() * H;
        g.strokeStyle = `rgba(150,160,150,${0.05 + Math.random() * 0.07})`; g.lineWidth = 1 + Math.random() * 2.5;
        g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 5; k++) { const len = 40 + Math.random() * 220; const dir = Math.floor(Math.random() * 8) * Math.PI / 4; x += Math.cos(dir) * len; y += Math.sin(dir) * len; g.lineTo(x, y); }
        g.stroke();
      }
      g.fillStyle = 'rgba(180,170,120,0.35)';
      for (let i = 0; i < 1600; i++) { g.beginPath(); g.arc(Math.random() * W, Math.random() * H, 2.2, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = 'rgba(70,72,70,0.55)';
      g.beginPath(); g.moveTo(W * 0.05, H * 0.78); g.lineTo(W * 0.45, H * 0.78); g.lineTo(W * 0.5, H * 0.83); g.lineTo(W * 0.05, H * 0.83); g.fill();
      g.beginPath(); g.moveTo(W * 0.62, H * 0.06); g.lineTo(W * 0.95, H * 0.06); g.lineTo(W * 0.95, H * 0.09); g.lineTo(W * 0.66, H * 0.09); g.fill();
      const lbl = (txt, y, z, size = 30) => { const [cx, cy] = toC(y, z); g.fillStyle = 'rgba(225,225,215,0.85)'; g.font = `600 ${size}px Consolas, "Courier New", monospace`; g.fillText(txt, cx, cy); };
      lbl('PCIEX16_1', -0.24, -0.15); lbl('M.2_1 (CPU)', 0.32, -0.12); lbl('DDR5_A1  A2  B1  B2', 1.42, 0.62, 24); lbl('CPU_FAN', 1.42, -0.55, 24);
      lbl('SATA6G_1-4', -0.25, 1.17, 22); lbl('F_PANEL', -1.42, 0.55, 22); lbl('USB4 · WIFI 7', 0.4, -1.15, 22); lbl('BIOS', -1.2, -0.95, 22);
      lbl('X870-PLUS WIFI', -0.98, 0.9, 40);
      const [tx, ty] = toC(-0.83, 1.1);
      g.fillStyle = '#e8e6df'; g.font = '800 92px Arial, Helvetica, sans-serif'; g.fillText('TUF GAMING', tx, ty);
      g.strokeStyle = 'rgba(200,200,190,0.25)'; g.lineWidth = 3; g.strokeRect(18, 18, W - 36, H - 36);
      [[1.4, 1.1], [1.4, -0.3], [1.4, -1.1], [0.2, 1.1], [0.2, -0.3], [0.2, -1.1], [-1.4, 1.1], [-1.4, -0.3], [-1.4, -1.1]].forEach(([y, z]) => {
        const [cx, cy] = toC(y, z); g.fillStyle = '#b9b39a'; g.beginPath(); g.arc(cx, cy, 30, 0, Math.PI * 2); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, 16, 0, Math.PI * 2); g.fill();
      });
    });
    mbG.add(box(0.045, 3.05, 2.44, M(0x121312, { metalness: 0.2, roughness: 0.75 })));
    const pcbFace = decal(pcbTex, 2.44, 3.05, '+x', { roughness: 0.7, metalness: 0.15 }); pcbFace.material.transparent = false; pcbFace.position.x = 0.0235; mbG.add(pcbFace);
    const darkAlu = M(0x3a3b3a, { metalness: 0.85, roughness: 0.38, roughnessMap: T.brushed });
    const blackPlastic = M(0x0b0b0b, { metalness: 0.05, roughness: 0.6 });
    // Socket AM5: base, marco de carga y palanca
    const sx = 0.03, sy = 0.8, sz = -0.15;
    const sockBase = box(0.04, 0.5, 0.5, M(0x1b1b1b, { metalness: 0.2, roughness: 0.6 })); sockBase.position.set(sx, sy, sz); mbG.add(sockBase);
    mbG.add(boxes([[0.03, 0.52, 0.05, sx + 0.03, sy, sz + 0.24], [0.03, 0.52, 0.05, sx + 0.03, sy, sz - 0.24], [0.03, 0.05, 0.52, sx + 0.03, sy + 0.24, sz], [0.03, 0.05, 0.52, sx + 0.03, sy - 0.24, sz]], silver));
    const lever = box(0.03, 0.62, 0.025, silver); lever.position.set(sx + 0.04, sy - 0.02, sz + 0.3); mbG.add(lever);
    // chokes y disipadores VRM con aletas
    const chokes = []; for (let i = 0; i < 8; i++) chokes.push([0.09, 0.09, 0.09, 0.07, 1.27, -0.55 + i * 0.12]); for (let i = 0; i < 6; i++) chokes.push([0.09, 0.09, 0.09, 0.07, 0.25 + i * 0.12, -0.72]);
    mbG.add(boxes(chokes, M(0x2b2b2b, { metalness: 0.5, roughness: 0.5 })));
    const vrmTop = new THREE.Group(); vrmTop.add(rbox(0.26, 0.24, 0.95, 0.02, darkAlu));
    vrmTop.add(boxes(Array.from({ length: 10 }, (_, i) => [0.1, 0.24, 0.025, 0.17, 0, -0.43 + i * 0.096]), darkAlu));
    vrmTop.position.set(0.14, 1.42, -0.22); mbG.add(vrmTop);
    const vrmLeft = new THREE.Group(); vrmLeft.add(rbox(0.26, 1.1, 0.26, 0.02, darkAlu));
    vrmLeft.add(boxes(Array.from({ length: 11 }, (_, i) => [0.1, 0.025, 0.26, 0.17, -0.5 + i * 0.1, 0]), darkAlu));
    vrmLeft.position.set(0.14, 0.72, -0.93); mbG.add(vrmLeft);
    // cubierta I/O con "TUF" y puertos traseros
    const io = rbox(0.42, 1.3, 0.3, 0.03, M(0x1c1d1c, { metalness: 0.6, roughness: 0.45 })); io.position.set(0.22, 0.83, -1.07); mbG.add(io);
    const ioTex = tex(256, 1024, (g, w, h) => { g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); g.fillStyle = '#d9d6cc'; g.font = '900 120px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TUF', 0, 0); g.restore(); });
    const ioDecal = decal(ioTex, 0.3, 1.2, '+x'); ioDecal.position.set(0.432, 0.83, -1.07); mbG.add(ioDecal);
    const ioPorts = []; for (let i = 0; i < 6; i++) ioPorts.push([0.06, 0.12, 0.02, 0.06 + (i % 2) * 0.1, 1.3 - Math.floor(i / 2) * 0.18, -1.225]);
    mbG.add(boxes(ioPorts, M(0x1d4ed8, { metalness: 0.3, roughness: 0.5 })));
    mbG.add(boxes([[0.14, 0.14, 0.02, 0.1, 0.62, -1.225], [0.06, 0.16, 0.02, 0.1, 0.42, -1.225]], blackPlastic));
    [0.95, 0.75].forEach((y) => { const a = cyl(0.025, 0.08, gold, 16); a.rotation.x = Math.PI / 2; a.position.set(0.32, y, -1.24); mbG.add(a); });
    ['#5bb0ff', '#7ee07e', '#ff8fb1'].forEach((c, i) => { const j = cyl(0.025, 0.03, M(c, { metalness: 0.2, roughness: 0.5 }), 16); j.rotation.x = Math.PI / 2; j.position.set(0.08, 0.2 - i * 0.07, -1.225); mbG.add(j); });
    // chipset con logo ASUS y disipador M.2 inferior
    const chip = new THREE.Group(); chip.add(rbox(0.1, 0.6, 0.62, 0.02, darkAlu));
    if (L.asus) { const t = tex(512, 512, (g, w, h) => { drawLogo(g, L.asus, w / 2, h / 2 - 50, 100, '#e7e5dc', 380, 'center'); }); const d = decal(t, 0.5, 0.5, '+x'); d.position.x = 0.051; chip.add(d); }
    chip.position.set(0.06, -1.05, 0.45); mbG.add(chip);
    const m2b = rbox(0.06, 0.3, 0.9, 0.015, darkAlu); m2b.position.set(0.045, -1.62, -0.35); mbG.add(m2b);
    mbG.add(boxes(Array.from({ length: 8 }, (_, i) => [0.012, 0.3, 0.02, 0.08, -1.62, -0.75 + i * 0.11]), darkAlu));
    // standoffs de M.2
    mbG.add(boxes([[0.03, 0.04, 0.04, 0.035, 0.17, -0.18], [0.03, 0.04, 0.04, 0.035, -1.2, -0.18]], M(0xb8b8b8, { metalness: 0.95, roughness: 0.3 })));
    // slots DIMM con seguros
    [0.48, 0.58, 0.72, 0.82].forEach((z, i) => {
      const s = box(0.09, 1.36, 0.05, M(i % 2 ? 0x2a2a2a : 0x4a4a48, { metalness: 0.1, roughness: 0.6 })); s.position.set(0.055, 0.8, z); mbG.add(s);
      mbG.add(boxes([[0.12, 0.06, 0.055, 0.07, 1.5, z], [0.12, 0.06, 0.055, 0.07, 0.1, z]], blackPlastic));
    });
    // PCIe x16 reforzado, x4 y x1
    const p16 = box(0.09, 0.075, 0.9, M(0xbdbdbd, { metalness: 0.9, roughness: 0.25 })); p16.position.set(0.055, -0.33, -0.55); mbG.add(p16);
    const latch = box(0.1, 0.09, 0.06, blackPlastic); latch.position.set(0.06, -0.33, -0.03); mbG.add(latch);
    [-0.93, -1.33].forEach((y, i) => { const s = box(0.08, 0.065, i ? 0.25 : 0.9, M(0x2a2a2a, { metalness: 0.1, roughness: 0.6 })); s.position.set(0.05, y, i ? -0.88 : -0.55); mbG.add(s); });
    // SATA, pines de headers, pila CMOS
    mbG.add(boxes([[0.1, 0.07, 0.09, 0.06, -0.4, 1.17], [0.1, 0.07, 0.09, 0.06, -0.5, 1.17], [0.1, 0.07, 0.09, 0.06, -0.6, 1.17], [0.1, 0.07, 0.09, 0.06, -0.7, 1.17]], blackPlastic));
    const pins = []; for (let i = 0; i < 10; i++) for (let j = 0; j < 2; j++) pins.push([0.06, 0.008, 0.008, 0.055, -1.47 + j * 0.025, 0.4 + i * 0.025]);
    for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) pins.push([0.06, 0.008, 0.008, 0.055, -1.47 + j * 0.025, -0.1 + i * 0.025]);
    mbG.add(boxes(pins, gold));
    const cmos = cyl(0.1, 0.03, silver, 40); cmos.rotation.z = Math.PI / 2; cmos.position.set(0.04, -0.55, 0.85); mbG.add(cmos);
    const atx24 = box(0.16, 0.6, 0.1, blackPlastic); atx24.position.set(0.08, 0.55, 1.15); mbG.add(atx24);
    const eps = box(0.13, 0.1, 0.27, blackPlastic); eps.position.set(0.07, 1.47, -0.8); mbG.add(eps);
    for (let i = 0; i < 6; i++) { const c = cyl(0.03, 0.08, M(0xc9a227, { metalness: 0.7, roughness: 0.3 }), 16); c.rotation.z = Math.PI / 2; c.position.set(0.065, -1.0 - (i % 3) * 0.09, -0.95 - Math.floor(i / 3) * 0.09); mbG.add(c); }
    // tornillos Phillips en los 9 agujeros de montaje
    mbG.add(screws([[1.4, 1.1], [1.4, -0.3], [1.4, -1.1], [0.2, 1.1], [0.2, -0.3], [0.2, -1.1], [-1.4, 1.1], [-1.4, -0.3], [-1.4, -1.1]].map(([y, z]) => [0.0235, y, z, '+x']), 0.032));
    // condensadores sólidos alrededor del VRM
    const caps = []; for (let i = 0; i < 9; i++) caps.push([0.05, 1.16, -0.52 + i * 0.1]); for (let i = 0; i < 7; i++) caps.push([0.05, 0.22 + i * 0.1, -0.6]);
    mbG.add(cyls(caps, 0.022, 0.055, M(0x2b2b2b, { metalness: 0.85, roughness: 0.3 })));
    mbG.add(cyls(caps.map(([x, y, z]) => [x + 0.029, y, z]), 0.02, 0.003, M(0x8a8a8a, { metalness: 0.9, roughness: 0.3 })));
    // contactos dorados dentro de los slots DIMM y PCIe, y pines de headers de ventilador
    mbG.add(boxes([...[0.48, 0.58, 0.72, 0.82].map((z) => [0.004, 1.28, 0.014, 0.101, 0.8, z]), [0.004, 0.014, 0.84, 0.101, -0.33, -0.55], [0.004, 0.012, 0.84, 0.091, -0.93, -0.55]], gold));
    const hp = []; [[1.43, -0.42], [1.43, 0.25]].forEach(([y, z]) => { for (let k = 0; k < 4; k++) hp.push([0.05, 0.006, 0.006, 0.075, y, z - 0.036 + k * 0.024]); }); mbG.add(boxes(hp, gold));
    // ranuras del disipador del chipset
    mbG.add(boxes(Array.from({ length: 6 }, (_, i) => [0.008, 0.5, 0.012, 0.112, -1.05, 0.2 + i * 0.1]), M(0x2a2b2a, { metalness: 0.85, roughness: 0.4 })));
    // panel I/O integrado (llega hasta la pared trasera) con puertos reales
    const ioG = new THREE.Group();
    ioG.add(boxes([[0.38, 1.26, 0.3, 0.23, 0.83, -1.385]], M(0x101010, { metalness: 0.4, roughness: 0.5 })));
    const ioPortTex = tex(760, 2520, (g, w, h) => {
      g.fillStyle = '#c9c9c9'; g.fillRect(0, 0, w, h);
      const port = (x, y, pw, ph, inner, label, r = 6) => { g.fillStyle = '#0c0c0c'; g.beginPath(); g.roundRect(x, y, pw, ph, r); g.fill(); if (inner) { g.fillStyle = inner; g.fillRect(x + pw * 0.15, y + ph * 0.32, pw * 0.7, ph * 0.3); } if (label) { g.fillStyle = '#2a2a2a'; g.font = '600 26px Arial, sans-serif'; g.fillText(label, x, y - 10); } };
      port(150, 120, 120, 120, null, 'FLASHBACK', 60); port(430, 120, 120, 120, null, 'CLR CMOS', 60);
      g.fillStyle = '#b8a038'; [[200, 360], [520, 360]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 62, 0, 7); g.fill(); g.fillStyle = '#7a6a20'; g.beginPath(); g.arc(x, y, 28, 0, 7); g.fill(); g.fillStyle = '#b8a038'; });
      port(170, 520, 400, 130, null, 'HDMI', 18);
      for (let i = 0; i < 2; i++) port(120 + i * 270, 760, 200, 90, '#3a3a3a', 'USB4 40Gbps', 45);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) port(110 + c * 290, 960 + r * 230, 240, 120, r < 2 ? '#c4302b' : '#1d4ed8', r === 0 && c === 0 ? 'USB 10Gbps' : r === 2 && c === 0 ? 'USB 5Gbps' : '');
      port(160, 1940, 280, 260, '#666', '2.5G LAN', 10);
      g.fillStyle = '#0c0c0c'; g.fillRect(500, 1960, 120, 110);
      [['#7ee07e', 2290], ['#ff8fb1', 2410]].forEach(([c, y]) => { g.fillStyle = c; g.beginPath(); g.arc(250, y, 52, 0, 7); g.fill(); g.fillStyle = '#0c0c0c'; g.beginPath(); g.arc(250, y, 22, 0, 7); g.fill(); });
      g.fillStyle = '#0c0c0c'; g.fillRect(420, 2250, 140, 120);
    });
    const ioFace = decal(ioPortTex, 0.38, 1.26, '-z', { metalness: 0.6, roughness: 0.4 }); ioFace.material.transparent = false; ioFace.position.set(0.23, 0.83, -1.536); ioG.add(ioFace);
    // carcasas metálicas de USB en relieve y conectores de antena
    const shells = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) shells.push([0.032, 0.012, 0.03, 0.09 + c * 0.29 * 0.5 + 0.06, 0.83 + 0.63 - (0.96 + r * 0.23) - 0.06, -1.545]);
    ioG.add(boxes(shells, M(0xb5b5b5, { metalness: 0.95, roughness: 0.25 })));
    ioG.add(cyls([[0.2 - 0.06, 0.83 + 0.63 - 0.36, -1.56], [0.2 + 0.26, 0.83 + 0.63 - 0.36, -1.56]], 0.022, 0.06, M(0xc9a227, { metalness: 1, roughness: 0.25 }), 'z'));
    mbG.add(ioG);
    // ---- relieve: cientos de componentes SMD, chips QFP con patas, conectores y módulo Wi-Fi ----
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const smdBlack = [], smdTan = [], smdGrey = [];
    for (let i = 0; i < 900; i++) {
      const y = -1.48 + rnd() * 2.96, z = -1.18 + rnd() * 2.36, k = rnd();
      if (k < 0.45) smdGrey.push([0.008, 0.012, 0.024, 0.027, y, z, 0, 0, rnd() > 0.5 ? Math.PI / 2 : 0]);
      else if (k < 0.8) smdTan.push([0.01, 0.014, 0.028, 0.028, y, z, rnd() > 0.5 ? Math.PI / 2 : 0, 0, 0]);
      else smdBlack.push([0.012, 0.03 + rnd() * 0.03, 0.03 + rnd() * 0.03, 0.029, y, z]);
    }
    mbG.add(boxes(smdGrey, M(0x6b6b6b, { metalness: 0.6, roughness: 0.4 })));
    mbG.add(boxes(smdTan, M(0x9c7a4a, { metalness: 0.2, roughness: 0.55 })));
    mbG.add(boxes(smdBlack, M(0x0d0d0d, { metalness: 0.2, roughness: 0.5 })));
    // chips QFP: códec de audio, LAN 2.5G, Super I/O, controlador USB4, chip de BIOS
    const qfp = (y, z, size, lbl) => {
      const g = new THREE.Group();
      g.add(box(0.025, size, size, M(0x161616, { metalness: 0.2, roughness: 0.45 })));
      const pinsQ = []; const n = Math.round(size / 0.018);
      for (let i = 0; i < n; i++) { const o = -size / 2 + 0.01 + i * (size - 0.02) / (n - 1);
        pinsQ.push([0.006, 0.006, 0.02, -0.008, o, size / 2 + 0.008], [0.006, 0.006, 0.02, -0.008, o, -size / 2 - 0.008], [0.006, 0.02, 0.006, -0.008, size / 2 + 0.008, o], [0.006, 0.02, 0.006, -0.008, -size / 2 - 0.008, o]); }
      g.add(boxes(pinsQ, M(0xb8b8b8, { metalness: 1, roughness: 0.3 })));
      if (lbl) { const t = tex(256, 256, (c, w, h) => { c.fillStyle = '#161616'; c.fillRect(0, 0, w, h); c.fillStyle = '#9a9a9a'; c.font = '600 34px Consolas, "Courier New", monospace'; c.textAlign = 'center'; c.fillText(lbl[0], w / 2, 110); c.font = '500 26px Consolas, "Courier New", monospace'; c.fillText(lbl[1], w / 2, 160); c.beginPath(); c.arc(40, 40, 12, 0, 7); c.fill(); });
        const d = decal(t, size * 0.92, size * 0.92, '+x'); d.position.x = 0.0135; g.add(d); }
      g.position.set(0.035, y, z); mbG.add(g);
    };
    qfp(-1.25, -0.8, 0.16, ['REALTEK', 'ALC1220P']);
    qfp(0.05, -0.98, 0.12, ['RTL8126', '2.5GbE']);
    qfp(-0.45, 0.85, 0.15, ['NUVOTON', 'NCT6701D']);
    qfp(-0.55, -0.2, 0.13, ['ASM4242', 'USB4']);
    qfp(-1.32, -1.05, 0.08, ['W25Q', 'BIOS']);
    // módulo Wi-Fi 7 (M.2 E-key) con cables de antena
    const wifi = new THREE.Group(); wifi.add(box(0.012, 0.22, 0.3, M(0x0f2a16, { metalness: 0.2 })));
    wifi.add(box(0.014, 0.16, 0.18, M(0xb5b5b5, { metalness: 0.9, roughness: 0.3 })));
    wifi.position.set(0.035, 0.32, -0.92); mbG.add(wifi);
    // headers de ventilador, ARGB y USB 3 / USB-C internos
    mbG.add(boxes([[0.07, 0.04, 0.1, 0.05, 1.43, -0.42], [0.07, 0.04, 0.1, 0.05, 1.43, 0.25], [0.07, 0.1, 0.04, 0.05, -1.4, -0.4], [0.07, 0.1, 0.04, 0.05, -1.4, 0.2], [0.09, 0.2, 0.06, 0.06, 0.1, 1.17], [0.09, 0.1, 0.06, 0.06, 0.4, 1.17]], M(0x0b0b0b, { metalness: 0.05, roughness: 0.6 })));
    // LEDs Q-LED de diagnóstico
    ['#ff3b30', '#ffcc00', '#ffffff', '#34c759'].forEach((c, i) => { const l = box(0.012, 0.02, 0.03, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.15 })); l.position.set(0.03, 1.1 - i * 0.04, 1.05); mbG.add(l); });
    // trasera: puntos de soldadura (se ve por el recorte de la bandeja) y backplate del socket
    const solderTex = tex(1024, 1280, (g, w, h) => {
      g.fillStyle = '#0f100f'; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(190,190,180,0.55)';
      for (let i = 0; i < 4000; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1.6 + Math.random() * 1.5, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(200,200,190,0.7)'; for (let r = 0; r < 40; r++) for (let c = 0; c < 40; c++) g.fillRect(680 + c * 5, 150 + r * 5, 3, 3);
    });
    const backFace = decal(solderTex, 2.44, 3.05, '-x', { roughness: 0.65 }); backFace.material.transparent = false; backFace.position.x = -0.0235; mbG.add(backFace);
    const sockBack = rbox(0.02, 0.5, 0.5, 0.02, M(0xb8b8b8, { metalness: 0.95, roughness: 0.3 })); sockBack.position.set(-0.033, 0.8, -0.15); mbG.add(sockBack);
    this.addPart('mb', [[mbG, [-1.1, 0.75, -0.7], [2.4, 0, 0]]]);
    const MBX = -1.075;
    const SOCK = [MBX, 1.55, -0.85];

    /* ================= CPU AMD Ryzen 7 9800X3D ================= */
    const cpuG = new THREE.Group();
    cpuG.add(box(0.025, 0.4, 0.4, M(0x1f4d2a, { metalness: 0.2, roughness: 0.6 })));
    const ihsS = new THREE.Shape(); const a = 0.17;
    ihsS.moveTo(-a, -a); ihsS.lineTo(-0.06, -a); ihsS.lineTo(-0.06, -a + 0.03); ihsS.lineTo(0.06, -a + 0.03); ihsS.lineTo(0.06, -a); ihsS.lineTo(a, -a);
    ihsS.lineTo(a, a); ihsS.lineTo(0.06, a); ihsS.lineTo(0.06, a - 0.03); ihsS.lineTo(-0.06, a - 0.03); ihsS.lineTo(-0.06, a); ihsS.lineTo(-a, a); ihsS.lineTo(-a, -a);
    const ihs = new THREE.Mesh(new THREE.ExtrudeGeometry(ihsS, { depth: 0.035, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 }), M(0xcfd1d4, { metalness: 1, roughness: 0.22, roughnessMap: T.brushed }));
    ihs.rotation.y = Math.PI / 2; ihs.position.x = 0.012; cpuG.add(ihs);
    const cpuTex = tex(1024, 1024, (g, w, h) => {
      if (L.amd) drawLogo(g, L.amd, w / 2, 230, 120, '#2a2a2a', 600, 'center');
      g.fillStyle = '#2a2a2a'; g.textAlign = 'center'; g.font = '800 120px Arial, Helvetica, sans-serif'; g.fillText('RYZEN 7', w / 2, 500);
      g.font = '600 74px Consolas, "Courier New", monospace'; g.fillText('9800X3D', w / 2, 610);
      g.font = '500 40px Consolas, "Courier New", monospace'; g.fillText('100-000001084', w / 2, 720); g.fillText('DIFFUSED IN TAIWAN', w / 2, 780);
      g.fillStyle = '#c9a227'; g.beginPath(); g.moveTo(60, h - 60); g.lineTo(160, h - 60); g.lineTo(60, h - 160); g.fill();
    });
    const cpuD = decal(cpuTex, 0.32, 0.32, '+x', { metalness: 0.4 }); cpuD.position.x = 0.056; cpuG.add(cpuD);
    this.addPart('cpu', [[cpuG, [SOCK[0] + 0.06, SOCK[1], SOCK[2]], [3.6, 0, 0]]]);

    /* ================= NVMe Samsung 990 PRO ================= */
    const ssdG = new THREE.Group();
    ssdG.add(box(0.02, 0.22, 0.8, M(0x0d0d0d, { metalness: 0.3, roughness: 0.5 })));
    ssdG.add(boxes(Array.from({ length: 13 }, (_, i) => [0.022, 0.012, 0.03, 0, -0.09 + i * 0.015, -0.39]), gold));
    const ssdTex = tex(2048, 560, (g, w, h) => {
      g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
      if (L.samsung) drawLogo(g, L.samsung, 360, 150, 120, '#f2f2f2', 900);
      g.fillStyle = '#f2f2f2'; g.font = '800 130px Arial, Helvetica, sans-serif'; g.fillText('990 PRO', 360, 420);
      g.fillStyle = '#ff6a00'; g.fillRect(1500, 120, 14, 320);
      g.fillStyle = '#9a9a9a'; g.font = '500 44px Consolas, "Courier New", monospace'; g.fillText('2TB · NVMe M.2', 1560, 220); g.fillText('MZ-V9P2T0', 1560, 300);
    });
    const ssdD = decal(ssdTex, 0.74, 0.2, '+x'); ssdD.position.set(0.0115, 0, 0.02); ssdG.add(ssdD);
    // fábrica de SSD NVMe M.2 2280 con chips de NAND y controlador en relieve
    const nvme = (brandDraw, dir = '+x') => {
      const g = new THREE.Group();
      g.add(box(0.02, 0.22, 0.8, M(0x0b1a10, { metalness: 0.2, roughness: 0.55 })));
      const s = dir === '+x' ? 1 : -1;
      g.add(boxes([[0.018, 0.16, 0.17, s * 0.018, 0, 0.18], [0.018, 0.16, 0.17, s * 0.018, 0, -0.02], [0.015, 0.12, 0.12, s * 0.016, 0, -0.2], [0.012, 0.08, 0.08, s * 0.015, 0, 0.33]], M(0x121212, { metalness: 0.25, roughness: 0.45 })));
      g.add(boxes(Array.from({ length: 13 }, (_, i) => [0.022, 0.012, 0.03, 0, -0.09 + i * 0.015, -0.39]), gold));
      const t = tex(2048, 560, brandDraw);
      const d = decal(t, 0.74, 0.2, dir); d.position.set(s * 0.028, 0, 0.02); g.add(d);
      return g;
    };
    const wd = nvme((g, w, h) => {
      g.fillStyle = '#0d0d0d'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#f2f2f2'; g.font = '800 120px Arial, Helvetica, sans-serif'; g.fillText('WD_BLACK', 360, 230);
      g.font = '700 110px Arial, Helvetica, sans-serif'; g.fillText('SN850X', 360, 400);
      g.fillStyle = '#9a9a9a'; g.font = '500 44px Consolas, "Courier New", monospace'; g.fillText('1TB · PCIe Gen4', 1500, 260);
    });
    const crucial = nvme((g, w, h) => {
      g.fillStyle = '#101010'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e6e6e6'; g.font = '800 120px Arial, Helvetica, sans-serif'; g.fillText('Crucial', 360, 230);
      g.font = '700 110px Arial, Helvetica, sans-serif'; g.fillText('T500', 360, 400);
      g.fillStyle = '#9a9a9a'; g.font = '500 44px Consolas, "Courier New", monospace'; g.fillText('2TB · PCIe Gen4', 1500, 260);
    }, '-x');
    // SSD SATA 2,5" en la parte trasera de la bandeja
    const sata = new THREE.Group();
    sata.add(rbox(0.07, 0.7, 1.0, 0.01, M(0x1d1d1d, { metalness: 0.7, roughness: 0.4 })));
    const sataTex = tex(1400, 1000, (g, w, h) => {
      g.fillStyle = '#1d1d1d'; g.fillRect(0, 0, w, h);
      if (L.samsung) drawLogo(g, L.samsung, 110, 140, 120, '#f0f0f0', 800);
      g.fillStyle = '#f0f0f0'; g.font = '800 170px Arial, Helvetica, sans-serif'; g.fillText('870 EVO', 110, 520);
      g.fillStyle = '#9a9a9a'; g.font = '500 54px Consolas, "Courier New", monospace'; g.fillText('SSD SATA 6Gb/s · 1TB', 110, 650); g.fillText('MZ-77E1T0', 110, 730);
    });
    const sd2 = decal(sataTex, 0.98, 0.68, '-x'); sd2.position.x = -0.036; sata.add(sd2);
    sata.add(boxes([[0.03, 0.06, 0.04, 0, -0.1, 0.51], [0.03, 0.12, 0.04, 0, 0.12, 0.51]], M(0x080808)));
    this.addPart('nvme', [
      [ssdG, [MBX + 0.02, 0.92, -0.95], [3.1, 0, 0]],
      [wd, [MBX + 0.02, -0.45, -0.95], [3.1, 0, 0]],
      [crucial, [-1.142, 0.9, -0.85], [1.9, 0, 0]],
      [sata, [-1.23, -0.55, -0.7], [-1.5, 0, 0]],
    ]);

    /* ================= RAM G.Skill Trident Z5 Neo RGB ================= */
    const ramPieces = [];
    const ramTex = tex(256, 1024, (g, w, h) => {
      g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#2b2b2b'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 140); g.lineTo(w, h); g.lineTo(0, h - 140); g.fill();
      g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2);
      g.fillStyle = '#e4e4e4'; g.font = '800 64px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('TRIDENT Z5 NEO', 0, -24); g.fillStyle = '#9a9a9a'; g.font = '500 30px Consolas, "Courier New", monospace'; g.fillText('G.SKILL · DDR5-6000 CL30', 0, 40);
      g.restore();
    });
    [[-0.12, 0], [0.12, 1]].forEach(([z, i]) => {
      const rg = new THREE.Group();
      rg.add(box(0.31, 1.33, 0.02, M(0x103018, { metalness: 0.2, roughness: 0.6 })));
      rg.add(boxes(Array.from({ length: 28 }, (_, k) => [0.04, 0.025, 0.022, -0.14, -0.64 + k * 0.047, 0]), gold));
      const spreader = rbox(0.34, 1.34, 0.075, 0.012, M(0x1d1d1d, { metalness: 0.9, roughness: 0.32, roughnessMap: T.brushed })); spreader.position.x = 0.03; rg.add(spreader);
      [1, -1].forEach((side) => { const d = decal(ramTex, 0.3, 1.24, side > 0 ? '+z' : '-z'); d.position.set(0.03, 0, side * 0.0385); rg.add(d); });
      const bar = rbox(0.075, 1.3, 0.07, 0.02, rgbMaterial(rgb, 0.2 + i * 0.1)); bar.position.x = 0.235; rg.add(bar);
      if (i === 1) ledLight(rg, this.leds, 0.3, [0.4, 0, 0.2], 1.2, 1.8);
      ramPieces.push([rg, [MBX + 0.19, 1.55, z], [3.9, 0, 0]]);
    });
    this.addPart('ram', ramPieces);

    /* ================= Disipador Noctua NH-U12A chromax.black ================= */
    const coolG = new THREE.Group();
    const nBlack = M(0x141414, { metalness: 0.75, roughness: 0.4 });
    const base = rbox(0.12, 0.42, 0.42, 0.01, M(0x1a1a1a, { metalness: 0.9, roughness: 0.3 })); base.position.x = 0.06; coolG.add(base);
    const hpGeos = [];
    for (let i = 0; i < 7; i++) {
      const off = (i - 3) * 0.055, zz = i % 2 ? 0.12 : -0.12;
      const c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.55, off * 2.6, zz), new THREE.Vector3(0.45, off * 2.6, zz), new THREE.Vector3(0.18, off * 1.6, zz * 0.5),
        new THREE.Vector3(0.08, off, 0), new THREE.Vector3(0.18, off * 1.6, -zz * 0.5), new THREE.Vector3(0.45, off * 2.6, -zz), new THREE.Vector3(1.55, off * 2.6, -zz),
      ]);
      hpGeos.push(new THREE.TubeGeometry(c, 64, 0.028, 12, false));
    }
    coolG.add(new THREE.Mesh(mergeGeometries(hpGeos), M(0x161616, { metalness: 0.9, roughness: 0.28 })));
    coolG.add(boxes(Array.from({ length: 42 }, (_, i) => [0.008, 1.25, 0.58, 0.32 + i * 0.03, 0, 0]), nBlack));
    const capTex = tex(1024, 512, (g, w, h) => { if (L.noctua) drawLogo(g, L.noctua, w / 2, h / 2 - 60, 120, '#cfcfcf', 700, 'center'); else { g.fillStyle = '#cfcfcf'; g.font = '700 130px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('noctua', w / 2, h / 2 + 40); } });
    const cap = rbox(0.05, 1.27, 0.6, 0.015, nBlack); cap.position.x = 1.6; coolG.add(cap);
    const capD = decal(capTex, 0.56, 0.28, '+x'); capD.position.set(1.627, 0, 0); capD.rotation.z = Math.PI / 2; capD.userData.flip = 'y'; coolG.add(capD);
    for (let i = 0; i < 7; i++) { const c = cyl(0.03, 0.02, M(0x222222, { metalness: 0.8 }), 16); c.rotation.z = Math.PI / 2; c.position.set(1.636, (i - 3) * 0.143, (i % 2 ? 1 : -1) * 0.12); coolG.add(c); }
    const nfTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#121212'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#bbb'; g.font = '700 30px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('NF-A12x25', w / 2, h / 2 + 10); });
    [0.43, -0.43].forEach((zz) => { const f = makeFan({ size: 1.2, blades: 9, frame: 0x121212, blade: 0x191919, spinners: sp, speed: 1.3, hubTex: nfTex, pads: true }); f.position.set(0.95, 0, zz); coolG.add(f); });
    coolG.add(boxes([[1.1, 0.012, 0.012, 0.95, 0.62, 0.56], [1.1, 0.012, 0.012, 0.95, -0.62, 0.56], [1.1, 0.012, 0.012, 0.95, 0.62, -0.56], [1.1, 0.012, 0.012, 0.95, -0.62, -0.56]], silver));
    this.addPart('cooler', [[coolG, [SOCK[0] + 0.065, SOCK[1], SOCK[2]], [4.9, 0, 0]]]);

    /* ================= Fuente Corsair RM850x ================= */
    const psuG = new THREE.Group();
    psuG.add(rbox(1.5, 0.86, 1.6, 0.025, M(0x111111, { metalness: 0.6, roughness: 0.5 })));
    const psuSide = tex(1600, 920, (g, w, h) => {
      g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
      if (L.corsair) drawLogo(g, L.corsair, 90, 110, 120, '#ededed', 700);
      g.fillStyle = '#ededed'; g.font = '800 230px Arial, Helvetica, sans-serif'; g.fillText('RM850x', 80, 520);
      g.fillStyle = '#9b9b9b'; g.font = '500 46px Consolas, "Courier New", monospace'; g.fillText('850 WATT · 80 PLUS GOLD · ATX 3.1', 90, 640); g.fillText('FULLY MODULAR · ZERO RPM', 90, 710);
      g.fillStyle = '#e8b600'; g.fillRect(90, 790, 260, 10);
    });
    const pd = decal(psuSide, 1.58, 0.84, '+x', { roughness: 0.6 }); pd.position.x = 0.752; psuG.add(pd);
    const grill = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), M(0x181818, { metalness: 0.8, roughness: 0.35, alphaMap: T.hex, alphaTest: 0.5, side: THREE.DoubleSide }));
    grill.rotation.x = Math.PI / 2; grill.position.y = -0.432; psuG.add(grill);
    const pfan = makeFan({ size: 1.36, blades: 7, frame: 0x0d0d0d, blade: 0x202020, spinners: sp, speed: 0.6, noFrame: true }); pfan.rotation.x = Math.PI / 2; pfan.position.y = -0.3; pfan.scale.z = 0.5; psuG.add(pfan);
    const modTex = tex(1024, 600, (g, w, h) => {
      g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, w, h);
      const sock = (x, y, cw, ch, label) => { g.fillStyle = '#1e1e1e'; g.fillRect(x, y, cw, ch); g.fillStyle = '#000'; for (let i = 0; i < cw / 26 - 1; i++) for (let j = 0; j < ch / 26 - 1; j++) g.fillRect(x + 8 + i * 26, y + 8 + j * 26, 16, 16); g.fillStyle = '#cfcfcf'; g.font = '600 22px Consolas, "Courier New", monospace'; g.fillText(label, x, y - 10); };
      sock(60, 90, 340, 80, '24/18 PIN'); sock(60, 260, 160, 80, '10 PIN'); sock(460, 90, 140, 80, 'CPU'); sock(640, 90, 140, 80, 'CPU'); sock(820, 90, 140, 80, 'PCIe');
      sock(460, 260, 200, 60, '12V-2x6'); sock(700, 260, 120, 80, 'SATA'); sock(860, 260, 120, 80, 'SATA');
      g.fillStyle = '#9b9b9b'; g.font = '500 24px Consolas, "Courier New", monospace'; g.fillText('USE ONLY CORSAIR TYPE 5 GEN 5 CABLES', 60, 520);
    });
    const md = decal(modTex, 1.4, 0.8, '+z'); md.position.z = 0.802; psuG.add(md);
    const psuRear = tex(1500, 860, (g, w, h) => {
      g.fillStyle = '#141414'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#050505'; const r = 16;
      for (let y = 30, row = 0; y < h - 20; y += r * 1.7, row++) for (let x = 560 + (row % 2) * r; x < w - 30; x += r * 2) { g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; g.lineTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); } g.fill(); }
      g.fillStyle = '#d0d0d0'; g.font = '600 26px Arial, sans-serif'; g.fillText('I/O', 360, 120); g.fillText('100-240V~ 10A 50/60Hz', 60, 760);
    });
    const pr = decal(psuRear, 1.5, 0.86, '-z', { roughness: 0.6 }); pr.material.transparent = false; pr.position.z = -0.802; psuG.add(pr);
    psuG.add(boxes([[0.32, 0.22, 0.04, 0.45, 0.12, -0.82], [0.1, 0.16, 0.05, 0.12, 0.12, -0.82]], M(0x050505, { metalness: 0.1, roughness: 0.6 })));
    psuG.add(boxes([[0.06, 0.04, 0.03, 0.12, 0.16, -0.85]], M(0xd0d0d0, { metalness: 0.2, roughness: 0.5 })));
    // 4 tornillos de la fuente en la cara trasera (atornillan la fuente al panel de atrás)
    psuG.add(screws([[-0.62, 0.3], [0.62, 0.3], [-0.62, -0.3], [0.62, -0.3]].map(([x, y]) => [x, y, -0.95, '-z']), 0.03, 0x2a2a2a, 0x0a0a0a));
    this.addPart('psu', [[psuG, [-0.3, -1.88, -1.35], [2.8, 0, 0]]]);

    /* ================= GPU ASUS TUF Gaming RTX 5070 Ti ================= */
    const gpuG = new THREE.Group();
    const tufMetal = M(0x2e2f30, { metalness: 0.85, roughness: 0.36, roughnessMap: T.brushed });
    const tufDark = M(0x161616, { metalness: 0.6, roughness: 0.45 });
    const shroud = rbox(1.36, 0.16, 3.05, 0.03, tufMetal); shroud.position.y = -0.28; gpuG.add(shroud);
    gpuG.add(boxes([[1.36, 0.04, 0.5, 0, -0.205, 1.28, 0.25, 0, 0], [1.36, 0.04, 0.5, 0, -0.205, -1.28, -0.25, 0, 0], [0.06, 0.14, 2.9, 0.66, -0.2, 0], [0.06, 0.14, 2.9, -0.66, -0.2, 0]], tufMetal));
    gpuG.add(boxes(Array.from({ length: 95 }, (_, i) => [1.24, 0.38, 0.01, 0, 0.0, -1.45 + i * 0.03]), M(0x6d6e70, { metalness: 0.9, roughness: 0.35 })));
    gpuG.add(boxes(Array.from({ length: 6 }, (_, i) => [1.3, 0.04, 0.04, 0, 0.04, -0.75 + i * 0.3]), M(0x9b6b3a, { metalness: 1, roughness: 0.3 })));
    const gpcb = box(1.3, 0.025, 2.75, M(0x0b1a10, { metalness: 0.2, roughness: 0.6 })); gpcb.position.set(-0.02, 0.215, -0.15); gpuG.add(gpcb);
    gpuG.add(boxes(Array.from({ length: 40 }, (_, i) => [0.06, 0.027, 0.012, -0.67, 0.215, -1.2 + i * 0.021]), gold));
    const backTex = tex(1024, 2048, (g, w, h) => {
      g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#262626'; g.lineWidth = 6; for (let y = -w; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w * 0.35); g.stroke(); }
      g.fillStyle = '#000'; g.fillRect(w * 0.15, h * 0.04, w * 0.7, h * 0.2);
      g.save(); g.translate(w / 2, h * 0.62); g.rotate(Math.PI / 2);
      g.fillStyle = '#d6d6d6'; g.font = '900 150px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('TUF GAMING', 0, 0);
      if (L.asus) drawLogo(g, L.asus, 0, 60, 70, '#bdbdbd', 400, 'center');
      g.restore();
    });
    const backplate = rbox(1.38, 0.025, 3.06, 0.01, M(0x141414, { metalness: 0.6, roughness: 0.55, envMapIntensity: 0.5 })); backplate.position.y = 0.24; gpuG.add(backplate);
    const bpD = decal(backTex, 1.34, 3.0, '+y'); bpD.position.y = 0.254; gpuG.add(bpD);
    const sideTex = tex(2048, 256, (g, w, h) => {
      g.fillStyle = '#2b2c2d'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1b1b1b'; g.fillRect(0, h - 40, w, 40);
      let x = 90;
      if (L.nvidia) x += drawLogo(g, L.nvidia, x, 60, 110, '#76b900') + 30;
      g.fillStyle = '#e6e6e6'; g.font = '800 92px Arial, Helvetica, sans-serif'; g.textBaseline = 'middle'; g.fillText('GEFORCE RTX 5070 Ti', x, 118);
      g.fillStyle = '#bdbdbd'; g.font = '800 70px Arial, Helvetica, sans-serif'; g.fillText('TUF GAMING', w - 560, 118);
    });
    const gTrim = rbox(0.04, 0.4, 3.05, 0.01, tufDark); gTrim.position.set(0.668, 0.03, 0); gpuG.add(gTrim);
    const sd = decal(sideTex, 3.0, 0.375, '+x'); sd.position.set(0.69, 0.03, 0); gpuG.add(sd);
    const strip = rbox(0.02, 0.025, 0.9, 0.01, rgbMaterial(rgb, 0.6)); strip.position.set(0.7, -0.15, 0.9); gpuG.add(strip);
    ledLight(gpuG, this.leds, 0.6, [0.85, -0.15, 0.9], 0.9, 1.6);
    const tufHub = tex(256, 256, (g, w, h) => { g.fillStyle = '#151515'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d0d0d0'; g.font = '900 64px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('TUF', w / 2, h / 2 + 22); });
    [-0.98, 0, 0.98].forEach((z, i) => {
      const f = makeFan({ size: 0.94, blades: 11, blade: 0x181818, spinners: sp, speed: i === 1 ? -1.6 : 1.6, ring: true, hubTex: tufHub, noFrame: true });
      f.rotation.x = Math.PI / 2; f.position.set(0, -0.36, z); f.scale.z = 0.6; gpuG.add(f);
    });
    const bracket = box(1.2, 0.62, 0.02, M(0xb0b0b0, { metalness: 0.95, roughness: 0.25 })); bracket.position.set(-0.08, -0.02, -1.69); gpuG.add(bracket);
    // salidas del bracket hacia afuera (3 DP + 2 HDMI) y rendijas
    gpuG.add(boxes([[0.2, 0.08, 0.16, -0.4, 0.12, -1.62], [0.2, 0.08, 0.16, -0.12, 0.12, -1.62], [0.2, 0.08, 0.16, 0.16, 0.12, -1.62], [0.18, 0.07, 0.16, -0.3, -0.05, -1.62], [0.18, 0.07, 0.16, 0.0, -0.05, -1.62]], M(0x9a9a9a, { metalness: 0.95, roughness: 0.3 })));
    gpuG.add(boxes(Array.from({ length: 18 }, (_, i) => [0.04, 0.14, 0.012, -0.55 + (i % 9) * 0.12, -0.15 - Math.floor(i / 9) * 0.08, -1.702]), M(0x050505)));
    gpuG.add(screws(Array.from({ length: 12 }, (_, i) => [(i % 2 ? 0.55 : -0.55), 0.2525, -1.35 + Math.floor(i / 2) * 0.52, '+y']), 0.022, 0x111111, 0x000000));
    // componentes del PCB visibles junto al bracket
    gpuG.add(cyls(Array.from({ length: 10 }, (_, i) => [-0.62 + i * 0.12, 0.2, -1.45]), 0.022, 0.05, M(0x2b2b2b, { metalness: 0.85, roughness: 0.3 }), 'y'));
    const conn16 = box(0.1, 0.09, 0.25, M(0x0a0a0a, { metalness: 0.1 })); conn16.position.set(0.7, 0.12, 0.35); gpuG.add(conn16);
    this.addPart('gpu', [[gpuG, [MBX + 0.73, 0.12, -0.53], [3.4, 0, 0]]]);

    /* ================= Ventiladores Arctic P12 PWM PST A-RGB ================= */
    const fanPieces = [];
    const arcTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#0f0f0f'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#dcdcdc'; g.font = '800 46px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('ARCTIC', w / 2, h / 2 + 16); });
    [1.55, 0.35, -0.85].forEach((y, i) => {
      const f = makeFan({ size: 1.2, blades: 5, frame: 0x101010, blade: 0x161616, rgbList: rgb, phase: 0.8 + i * 0.08, spinners: sp, speed: 1.0, hubTex: arcTex, withScrews: true });
      ledLight(f, this.leds, 0.8 + i * 0.08, [0, 0, -0.35], 2.4, 3.4);
      fanPieces.push([f, [0, y, 2.06], [0, 0, 1.9]]);
    });
    const rear = makeFan({ size: 1.2, blades: 5, frame: 0x101010, blade: 0x161616, rgbList: rgb, phase: 0.95, spinners: sp, speed: -1.0, hubTex: arcTex, withScrews: true });
    rear.rotation.y = Math.PI;
    ledLight(rear, this.leds, 0.95, [0, 0, -0.35], 1.6, 2.6);
    fanPieces.push([rear, [0.15, 1.6, -2.08], [3.2, 0, 0]]);
    this.addPart('fans', fanPieces);

    /* ================= Cables ================= */
    const cabG = new THREE.Group();
    // Todo el ruteo va por el compartimiento trasero (x ≈ -1.3, entre la bandeja y el panel de acero)
    // y entra a la cámara principal por los ojales de goma, en tramos cortos y rectos.
    // 24 pines: modular de la fuente → atrás → sube → ojal derecho → conector ATX
    cabG.add(bundle([[-0.35, -1.85, -0.53], [-0.8, -1.9, -0.45], [-1.3, -1.75, -0.1], [-1.3, -0.4, 0.95], [-1.3, 0.85, 0.95], [-1.13, 1.05, 0.95], [-1.04, 1.25, 0.8], [-1.02, 1.3, 0.55]], 2, 12, 0.026, 0.0115, { combs: [0.42, 0.62] }));
    // EPS 8 pines: atrás por el costado del socket, sale por el ojal superior
    cabG.add(bundle([[-0.6, -1.95, -0.53], [-1.28, -1.8, -0.7], [-1.32, 0.3, -1.6], [-1.32, 2.05, -1.35], [-1.13, 2.24, -1.32], [-1.04, 2.22, -1.42], [-1.03, 2.22, -1.5]], 2, 4, 0.026, 0.0115, { combs: [0.45, 0.7] }));
    // 12V-2x6: sube desde la fuente por el ojal de la cubierta, pegado al vidrio, y entra de lado al conector
    this.cable12v = bundle([[-0.1, -1.85, -0.53], [0.5, -1.72, -0.4], [0.8, -1.45, -0.22], [0.8, -1.0, -0.2], [0.74, -0.2, -0.18], [0.62, 0.2, -0.18], [0.5, 0.24, -0.18], [0.43, 0.24, -0.18]], 2, 6, 0.022, 0.0095, { combs: [0.45, 0.62] });
    cabG.add(this.cable12v);
    const gpuGrom = rbox(0.3, 0.035, 0.22, 0.03, M(0x050505, { metalness: 0, roughness: 0.95 })); gpuGrom.position.set(0.8, -1.25, -0.2); cabG.add(gpuGrom);
    this.gpuGrom = gpuGrom;
    // SATA: datos (placa → ojal → SSD) y energía (fuente → SSD), ambos por atrás
    const flat = (pts, w, c) => { const curve = new THREE.CatmullRomCurve3(pts.map(inCase), false, 'centripetal'); cabG.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, w, 4, false), M(c, { metalness: 0.05, roughness: 0.7 }))); };
    flat([[-1.04, -0.55, 0.47], [-1.08, -0.6, 0.75], [-1.13, -0.2, 0.85], [-1.28, -0.3, 0.6], [-1.26, -0.45, -0.18]], 0.012, 0x111111);
    cabG.add(bundle([[0.2, -1.85, -0.53], [-0.7, -2.05, -0.4], [-1.36, -1.9, -0.3], [-1.36, -0.9, -0.2], [-1.26, -0.62, -0.18]], 1, 5, 0.018, 0.008, { combs: [0.6] }));
    // cables delgados: frontal, USB 3, USB-C y ventiladores, con amarras, siempre por atrás
    const thin = (pts, c = 0x161616, r = 0.008) => { const curve = new THREE.CatmullRomCurve3(pts.map(inCase), false, 'centripetal'); cabG.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, r, 6, false), M(c, { metalness: 0, roughness: 0.8 }))); };
    thin([[-1.04, -0.73, 0.55], [-1.09, -1.0, 0.6], [-1.13, -1.15, 0.85], [-1.3, -1.25, 0.95], [-1.3, -1.25, 1.95], [-1.3, 2.0, 2.0], [-1.0, 2.3, 2.0]]);
    thin([[-1.04, -0.73, 0.6], [-1.09, -1.0, 0.68], [-1.13, -1.15, 0.88], [-1.31, -1.27, 0.98], [-1.31, -1.27, 1.97], [-1.31, 2.02, 2.02], [-0.9, 2.3, 2.0]]);
    thin([[-1.03, 0.85, 0.47], [-1.08, 0.85, 0.75], [-1.13, 1.0, 0.85], [-1.33, 1.1, 1.2], [-1.33, 1.8, 2.0], [-0.8, 2.3, 2.02]], 0x16255a, 0.012);
    // ventiladores frontales en cadena (PST) → canal frontal → atrás → header de la placa
    thin([[-0.55, 1.55, 1.95], [-1.1, 1.55, 1.95], [-1.3, 1.5, 1.9], [-1.3, 1.45, 1.0], [-1.13, 1.0, 0.85], [-1.04, 0.95, 0.65], [-1.04, 2.18, 0.25]]);
    thin([[-0.55, 0.35, 1.95], [-1.1, 0.35, 1.95], [-1.3, 0.4, 1.9], [-1.3, 1.4, 1.9]]);
    thin([[-0.55, -0.85, 1.95], [-1.1, -0.85, 1.95], [-1.3, -0.8, 1.9], [-1.3, 0.35, 1.9]]);
    // ventilador trasero y ventiladores del disipador → headers CPU_FAN / CHA_FAN
    thin([[-0.45, 1.75, -2.0], [-0.9, 2.0, -1.95], [-1.04, 2.18, -1.3], [-1.04, 2.18, -1.12]]);
    thin([[-0.15, 2.15, -0.42], [-0.6, 2.25, -0.4], [-1.04, 2.18, -0.42]]);
    // EPS 4 pines (segundo conector de CPU de la X570-PRO), paralelo al de 8 pines
    cabG.add(bundle([[-0.45, -1.95, -0.53], [-1.26, -1.8, -0.62], [-1.36, 0.3, -1.45], [-1.36, 2.0, -1.15], [-1.13, 2.2, -1.12], [-1.04, 2.2, -1.2], [-1.03, 2.2, -1.26]], 2, 2, 0.026, 0.0115, { combs: [0.5] }));
    // headers del borde inferior de la placa: audio HD, USB 2.0 y panel frontal (PWR, RST, LED, HDD),
    // bajan hasta la unión de la bandeja con la cubierta y pasan al compartimiento de atrás
    const header = (z, n, colors, r = 0.007) => {
      for (let k = 0; k < n; k++) {
        const dz = (k - (n - 1) / 2) * 0.018;
        thin([[-1.07, -0.74, z + dz], [-1.065, -0.95, z + dz], [-1.06, -1.18, z + dz], [-1.18, -1.235, z + dz], [-1.3, -1.2, z + dz + 0.05], [-1.31, -0.6, z + dz + 0.3], [-1.31, 0.2, z + dz + 0.45]], colors[k % colors.length], r);
      }
    };
    header(-1.78, 4, [0x111111, 0x1d1d1d], 0.008);                         // audio HD
    header(-0.62, 3, [0x111111], 0.008);                                    // USB 2.0
    header(0.3, 8, [0xd9d9d9, 0x111111, 0x3d7a1d, 0x111111, 0xb8321f, 0x111111, 0xd8a32a, 0x111111], 0.005); // panel frontal
    // amarras de velcro sobre los mazos del compartimiento trasero
    cabG.add(boxes([[0.1, 0.05, 0.3, -1.33, 0.9, -1.4], [0.1, 0.05, 0.3, -1.33, -0.4, -1.1], [0.1, 0.05, 0.34, -1.33, -0.9, 0.95], [0.1, 0.05, 0.3, -1.31, -0.2, 0.2]], M(0x1a1a1a, { metalness: 0, roughness: 0.95 })));
    this.addPart('cables', [[cabG, [0, 0, 0], [0, 0, 0]]]);
  }

  setAll(t) { Object.values(this.parts).forEach((p) => { if (p.id !== 'case') p.target = t; }); }
  setStage(n) {
    Object.values(this.parts).forEach((p) => {
      if (p.id === 'case') return;
      p.target = BUILD_STEPS.findIndex((s) => s.id === p.id) < n ? 0 : 1;
    });
  }

  update(dt, time) {
    const k = 1 - Math.pow(0.003, dt);
    Object.values(this.parts).forEach((p) => {
      p.t += (p.target - p.t) * k;
      if (Math.abs(p.target - p.t) < 0.0005) p.t = p.target;
      const e = p.t * p.t * (3 - 2 * p.t);
      p.pieces.forEach((pc) => pc.obj.position.copy(pc.base).addScaledVector(pc.off, e));
      if (p.id === 'panels') p.meshes.forEach((m) => { if (m.userData.forceHide !== undefined) m.visible = !m.userData.forceHide; });
      if (p.fade) {
        const op = Math.max(0, 1 - p.t * 4);
        p.meshes.forEach((m) => {
          if (m.userData.baseOp == null) m.userData.baseOp = m.material.opacity ?? 1;
          if (m.userData.baseTr == null) m.userData.baseTr = m.material.transparent;
          m.material.transparent = op < 1 || m.userData.baseTr;
          m.material.opacity = op * m.userData.baseOp;
          m.visible = op > 0.01 && !m.userData.forceHide;
        });
      }
    });
    this.spinners.forEach((r) => { r.rotation.z += dt * 7 * r.userData.speed; });
    this.leds.forEach(({ l, phase, base }) => {
      if (this.rgbOn) { l.color.setHSL((time * 0.06 + phase) % 1, 0.9, 0.55); l.intensity = base * 1.4; }
      else { l.color.setRGB(1, 0.95, 0.88); l.intensity = base * 0.55; }
    });
    this.rgb.forEach(({ m, phase }) => {
      if (this.rgbOn) { m.emissive.setHSL((time * 0.06 + phase) % 1, 0.9, 0.5); m.emissiveIntensity = 1.6; }
      else { m.emissive.setRGB(1, 0.97, 0.92); m.emissiveIntensity = 0.45; }
    });
  }
}

/* ------------------------------------------------------------------ */
/* Visor: estudio fotográfico negro                                    */
/* ------------------------------------------------------------------ */
class Viewer {
  constructor(canvas, { camPos, target, autoRotate = false, zoom = true }) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    // alta resolución: nunca por debajo de 1.5× aunque la pantalla sea 1×, hasta 2× en retina
    this.renderer.setPixelRatio(Math.min(2, Math.max(1.5, window.devicePixelRatio)));
    this.renderer.setClearColor(stageColor(), 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(stageColor());
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    this.scene.environmentIntensity = 0.95;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    this.camera.position.set(...camPos);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(...target);
    // la rueda del mouse NO hace zoom: así la página sigue bajando aunque el cursor pase por el 3D
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.07, enableZoom: false, enablePan: false, autoRotate, autoRotateSpeed: 0.5 });
    this.controls.maxPolarAngle = Math.PI * 0.53;
    this.controls.minPolarAngle = Math.PI * 0.12;
    this.home = new THREE.Vector3(...camPos).sub(new THREE.Vector3(...target)).normalize();
    // en pantallas táctiles, un dedo desplaza la página; dos dedos giran el modelo
    this.controls.touches = { ONE: null, TWO: THREE.TOUCH.ROTATE };
    canvas.style.touchAction = 'pan-y';

    const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(7, 11, -8); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8eeff, 1.1); fill.position.set(-8, 4, -6); this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xfff0e6, 1.1); rim.position.set(-4, 6, 9); this.scene.add(rim);
    // luz de contorno desde adelante a la izquierda: separa los bordes negros del fondo negro
    const edge = new THREE.DirectionalLight(0xffffff, 1.3); edge.position.set(-9, 5, -7); this.scene.add(edge);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.25));

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.55 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.68; floor.receiveShadow = true; this.scene.add(floor);
    this.floor = floor;

    this.visible = true;
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(canvas);
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.resize();
  }
  fitTo(pc, t, margin = 0.78) {
    this.fit = { pc, t, margin };
    Object.values(pc.parts).forEach((p) => p.pieces.forEach((pp) => pp.obj.position.copy(pp.base).addScaledVector(pp.off, p.id === 'case' ? 0 : t)));
    pc.root.updateMatrixWorld(true);
    // el giro es alrededor del centro del gabinete (donde está el procesador), no del centro del despiece
    const all = new THREE.Box3().setFromObject(pc.root);
    const center = new THREE.Box3().setFromObject(pc.parts.case.pieces[0].obj).getCenter(new THREE.Vector3());
    center.y += 0.3;
    // radio desde el centro del gabinete hasta la pieza más lejana (promediado con el radio propio del despiece
    // para que el equipo no quede chico cuando una pieza sale lejos hacia un lado)
    const sphere = all.getBoundingSphere(new THREE.Sphere());
    const far = Math.max(...[0, 1].flatMap((i) => [0, 1].flatMap((j) => [0, 1].map((k) => new THREE.Vector3(i ? all.max.x : all.min.x, j ? all.max.y : all.min.y, k ? all.max.z : all.min.z).distanceTo(center)))));
    const radius = (far * 0.8 + sphere.radius * 0.2);
    pc.update(0, 0);
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const fovH = 2 * Math.atan(Math.tan(fov / 2) * this.camera.aspect);
    const dist = (radius / Math.sin(Math.min(fov, fovH) / 2)) * margin;
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(dir, dist);
    this.controls.maxDistance = dist * 1.8;
    this.controls.minDistance = dist * 0.3;
  }
  resize() {
    const w = this.canvas.parentElement.clientWidth, h = this.canvas.parentElement.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.fit) this.fitTo(this.fit.pc, this.fit.t, this.fit.margin);
  }
  zoomBy(f) {
    const off = this.camera.position.clone().sub(this.controls.target);
    const d = THREE.MathUtils.clamp(off.length() * f, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(this.controls.target).addScaledVector(off.normalize(), d);
  }
  resetView() {
    this.camera.position.copy(this.controls.target).addScaledVector(this.home, 10);
    if (this.fit) this.fitTo(this.fit.pc, this.fit.t, this.fit.margin);
  }
  // cambia el equipo que se muestra (mantiene el ángulo de la cámara)
  setModel(pc, t) {
    if (this.pc) this.scene.remove(this.pc.root);
    this.pc = pc; this.scene.add(pc.root);
    this.floor.position.y = pc.floorY;
    if (this.fit) this.fitTo(pc, t ?? this.fit.t, this.fit.margin);
  }
  render() { this.controls.update(); this.renderer.render(this.scene, this.camera); }
}

/* ------------------------------------------------------------------ */
/* Arranque                                                            */
/* ------------------------------------------------------------------ */
const clock = new THREE.Clock();
const viewers = [];
// fondo del estudio según la versión de la página: negro o beige
const stageColor = () => (document.documentElement.dataset.theme === 'light' ? 0xefe8da : 0x000000);
window.addEventListener('edv-theme', () => viewers.forEach((v) => { v.renderer.setClearColor(stageColor(), 1); v.scene.background.set(stageColor()); }));

async function init() {
  try { await document.fonts.ready; } catch { /* sin fuentes */ }
  const names = ['asus', 'nvidia', 'amd', 'corsair', 'samsung', 'noctua'];
  const loaded = await Promise.all(names.map((n) => loadLogo(n, 1024)));
  const L = Object.fromEntries(names.map((n, i) => [n, loaded[i]]));

  // cada visor guarda sus equipos ya armados (se crean la primera vez que se muestran)
  const modelFor = (v, i) => {
    v.models ||= [];
    if (!v.models[i]) {
      const pc = new PCModel(L, VARIANTS[i]);
      v.models[i] = pc;
      pc.real.then((ok) => { if (ok && v.pc === pc) { v.floor.position.y = pc.floorY; v.resize(); } });
    }
    return v.models[i];
  };

  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    const v = new Viewer(heroCanvas, { camPos: [4.5, 3.0, -12.5], target: [1, 0, 0], autoRotate: true, zoom: false });
    v.hero = true; v.variant = 0; v.cycle = 0;
    v.modelFor = (i) => modelFor(v, i);
    v.setModel(v.modelFor(0));
    v.fitTo(v.pc, 0.7, 0.74);
    viewers.push(v);
  }
  const labCanvas = document.getElementById('labCanvas');
  if (labCanvas) {
    const v = new Viewer(labCanvas, { camPos: [3.2, 3.4, -13], target: [1.4, 0.3, -0.5] });
    v.variant = 0;
    v.modelFor = (i) => modelFor(v, i);
    v.setModel(v.modelFor(0));
    viewers.push(v);
    setupLab(v);
    v.fitTo(v.pc, 1, 0.72);
    const ld = document.getElementById('labLoading');
    if (ld) { ld.classList.add('done'); setTimeout(() => ld.remove(), 500); }
  }
  requestAnimationFrame(loop);
}

function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  viewers.forEach((v) => {
    if (!v.visible) return;
    if (v.hero) {
      const cyc = (Math.sin(t * 0.35 - Math.PI / 2) + 1) / 2;
      const n = Math.floor((t * 0.35) / (Math.PI * 2));
      if (n !== v.cycle) {                                   // terminó un despiece completo y está armado de nuevo
        v.cycle = n;
        v.variant = (v.variant + 1) % VARIANTS.length;
        v.setModel(v.modelFor(v.variant), 0.7);
        Object.values(v.pc.parts).forEach((p) => { p.t = 0; p.target = 0; });
        const cap = document.getElementById('heroSpec');
        if (cap) cap.textContent = `${VARIANTS[v.variant].nombre}: ${VARIANTS[v.variant].spec}`;
      }
      if (cyc > 0.5) v.modelFor((v.variant + 1) % VARIANTS.length); // prepara el siguiente mientras se ve este
      v.pc.setAll(Math.min(1, Math.max(0, (cyc - 0.2) / 0.6)) * 0.7);
    }
    v.pc.update(dt, t);
    v.render();
  });
  requestAnimationFrame(loop);
}

/* ------------------------------------------------------------------ */
/* Interacción del laboratorio                                         */
/* ------------------------------------------------------------------ */
function setupLab(v) {
  const card = document.getElementById('partCard');
  const stepsEl = document.getElementById('buildSteps');
  const banner = document.getElementById('stepBanner');
  const range = document.getElementById('explodeRange');
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null, selected = null, autoplay = null;

  stepsEl.innerHTML = BUILD_STEPS.map((s) => `<li>${s.txt}</li>`).join('');
  const markSteps = (n, cur = -1) => [...stepsEl.children].forEach((li, i) => { li.classList.toggle('done', i < n && i !== cur); li.classList.toggle('cur', i === cur); });

  const showBanner = (txt) => {
    banner.textContent = txt; banner.classList.add('show');
    clearTimeout(showBanner.t); showBanner.t = setTimeout(() => banner.classList.remove('show'), 2600);
  };
  const highlight = (id, color) => {
    if (!id) return;
    v.pc.parts[id].meshes.forEach((m) => [].concat(m.material).forEach((mt) => { if (!mt.userData.rgb && mt.emissive) { mt.emissive.setHex(color); mt.emissiveIntensity = 1; } }));
  };
  const refresh = () => {
    Object.keys(v.pc.parts).forEach((id) => highlight(id, 0x000000));
    if (hovered && hovered !== selected) highlight(hovered, 0x0d0d0d);
    if (selected) highlight(selected, 0x1c1c1c);
  };
  const showPart = async (id) => {
    const p = v.pc.info[id]; if (!p) return;
    card.innerHTML = `
      <span class="ptype">${p.tipo.toUpperCase()}</span>
      <span class="plogo-slot"></span>
      <h4>${p.nombre}</h4>
      <p>${p.desc}</p>
      <dl class="specs">${p.specs.map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join('')}</dl>
      <p class="note"><b>Cómo se instala</b>${p.instalar}</p>
      <p class="note"><b>Lo que vemos en el taller</b>${p.fallas}</p>
      <p class="alt">Alternativas: ${p.alt}</p>`;
    if (p.logo) {
      const lg = await loadLogo(p.logo, 512);
      const slot = card.querySelector('.plogo-slot');
      if (lg && slot) { const img = new Image(); img.className = 'plogo'; img.alt = ''; img.src = lg.toDataURL(); slot.replaceWith(img); }
    }
  };
  const pick = (e) => {
    const r = v.canvas.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, v.camera);
    const hit = ray.intersectObject(v.pc.root, true).find((h) => h.object.visible && h.object.userData.partId && h.object.userData.partId !== 'case' && !h.object.userData.isGlass);
    return hit ? hit.object.userData.partId : null;
  };

  let downAt = null;
  v.canvas.addEventListener('pointermove', (e) => { const id = pick(e); if (id !== hovered) { hovered = id; refresh(); } v.canvas.style.cursor = id ? 'pointer' : 'grab'; });
  v.canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  v.canvas.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
    selected = pick(e); refresh(); if (selected) showPart(selected);
  });
  v.canvas.addEventListener('pointerleave', () => { hovered = null; refresh(); });

  const stopAuto = () => { clearInterval(autoplay); autoplay = null; };
  const goStage = (n) => {
    v.pc.setStage(n); markSteps(n, n - 1);
    if (n > 0) { const s = BUILD_STEPS[n - 1]; showBanner(`Paso ${n} de ${BUILD_STEPS.length} — ${s.txt}`); selected = s.id; refresh(); showPart(s.id); }
    range.value = Math.round((1 - n / BUILD_STEPS.length) * 100);
  };
  stepsEl.addEventListener('click', (e) => { const li = e.target.closest('li'); if (!li) return; stopAuto(); goStage([...stepsEl.children].indexOf(li) + 1); });

  document.querySelectorAll('.lab-toolbar button').forEach((b) => b.addEventListener('click', () => {
    const act = b.dataset.act;
    if (act === 'assemble') { stopAuto(); v.pc.setAll(0); markSteps(BUILD_STEPS.length); range.value = 0; showBanner('Armado. Listo para la prueba de estrés.'); }
    if (act === 'explode') { stopAuto(); v.pc.setAll(1); markSteps(0); range.value = 100; showBanner('Despiece. Haz clic en una pieza.'); }
    if (act === 'step') { stopAuto(); v.pc.setStage(0); markSteps(0); let n = 0; autoplay = setInterval(() => { n++; goStage(n); if (n >= BUILD_STEPS.length) { stopAuto(); v.onStepsDone?.(); } }, 2000); }
    if (act === 'glass') { v.pc.glass.userData.forceHide = !v.pc.glass.userData.forceHide; b.classList.toggle('on', v.pc.glass.userData.forceHide); }
    if (act === 'rgb') { v.pc.rgbOn = !v.pc.rgbOn; b.classList.toggle('on', v.pc.rgbOn); }
    if (act === 'zin') v.zoomBy(0.8);
    if (act === 'zout') v.zoomBy(1.25);
    if (act === 'reset') { v.controls.autoRotate = false; document.querySelector('[data-act="spin"]')?.classList.remove('on'); v.resetView(); }
    if (act === 'spin') { v.controls.autoRotate = !v.controls.autoRotate; b.classList.toggle('on', v.controls.autoRotate); }
  }));
  range.addEventListener('input', () => { stopAuto(); v.pc.setAll(range.value / 100); markSteps(range.value < 5 ? BUILD_STEPS.length : 0); });

  // equipos: botones para elegir y, al terminar el paso a paso, pasa solo al siguiente
  const varEl = document.getElementById('labVariants');
  const title = document.getElementById('labTitle');
  const showVariant = (i, t = 1) => {
    stopAuto(); selected = hovered = null;
    v.variant = i;
    v.setModel(v.modelFor(i), 1);
    v.pc.setAll(t); Object.values(v.pc.parts).forEach((p) => { if (p.id !== 'case') p.t = t; });
    if (v.pc.glass) v.pc.glass.userData.forceHide = document.querySelector('[data-act="glass"]')?.classList.contains('on') || false;
    v.pc.rgbOn = document.querySelector('[data-act="rgb"]')?.classList.contains('on') || false;
    markSteps(t ? 0 : BUILD_STEPS.length); range.value = Math.round(t * 100);
    if (varEl) [...varEl.children].forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    if (title) title.textContent = `Despiece: ${VARIANTS[i].nombre}`;
    card.innerHTML = `<span class="ptype">${VARIANTS[i].nombre.toUpperCase()}</span><h4>${VARIANTS[i].spec}</h4><p>Haz clic en cualquier pieza para ver qué es, cómo se instala y qué falla vemos en el taller.</p>`;
  };
  if (varEl) {
    varEl.innerHTML = VARIANTS.map((x, k) => `<button type="button" aria-pressed="${k === 0}">${x.nombre}</button>`).join('');
    varEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showVariant([...varEl.children].indexOf(b)); });
  }
  v.onStepsDone = () => setTimeout(() => {
    if (autoplay) return;
    const nx = (v.variant + 1) % VARIANTS.length;
    showVariant(nx); showBanner(`Siguiente equipo: ${VARIANTS[nx].nombre}`);
  }, 3500);

  // parte en despiece para invitar a explorar
  showVariant(0);
}

init();
