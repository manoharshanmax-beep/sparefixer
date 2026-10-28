/* ==========================================================================
   SPAREFIXER — script.js
   Vanilla JS. No frameworks, no build step. Organized top-to-bottom as:
   state/storage -> utils -> compat engine -> render helpers -> page modules
   -> global UI (nav, theme, modals, toasts, animations) -> router -> init.
   ========================================================================== */

'use strict';

/* ==========================================================================
   SECTION 1 — DEMO DATA
   All catalogue content is illustrative demo data: brands, prices, part
   numbers and fitment rules are examples for the interface, not a live
   catalogue.
   ========================================================================== */

const DATA = {
  brand: {
    name: 'SpareFixer',
    tagline: 'Find the Right Part. Fix It Right.',
    whatsapp: '919876543210',
    phone: '+91 98765 43210',
    email: 'help@sparefixer.example'
  },

  types: [
    { id: 'car', label: 'Car' },
    { id: 'suv', label: 'SUV' },
    { id: 'bike', label: 'Motorcycle' },
    { id: 'scooter', label: 'Scooter' }
  ],

  /* type -> make -> [model, fromYear, toYear, 'variant|variant|…'] */
  vehicles: {
    car: {
      'Maruti Suzuki': [
        ['Swift', 2011, 2025, '1.2L Petrol MT|1.2L Petrol AMT|1.2L CNG|1.3L Diesel MT'],
        ['Baleno', 2015, 2025, '1.2L Petrol MT|1.2L Petrol AMT|1.2L CNG|1.3L Diesel MT'],
        ['Dzire', 2012, 2025, '1.2L Petrol MT|1.2L Petrol AMT|1.2L CNG|1.3L Diesel MT'],
        ['Alto K10', 2010, 2025, '1.0L Petrol MT|1.0L Petrol AMT|1.0L CNG'],
        ['Ertiga', 2012, 2025, '1.5L Petrol MT|1.5L CNG|1.3L Diesel MT']
      ],
      Hyundai: [
        ['i20', 2014, 2025, '1.2L Petrol MT|1.0L Turbo Petrol DCT|1.4L Diesel MT'],
        ['Grand i10 Nios', 2019, 2025, '1.2L Petrol MT|1.2L Petrol AMT|1.2L CNG'],
        ['Verna', 2011, 2025, '1.5L Petrol MT|1.5L Petrol IVT|1.5L Diesel MT']
      ],
      Tata: [
        ['Tiago', 2016, 2025, '1.2L Petrol MT|1.2L Petrol AMT|1.2L CNG'],
        ['Altroz', 2020, 2025, '1.2L Petrol MT|1.5L Diesel MT|1.2L CNG']
      ],
      Honda: [
        ['City', 2012, 2025, '1.5L Petrol MT|1.5L Petrol CVT|1.5L Diesel MT'],
        ['Amaze', 2013, 2025, '1.2L Petrol MT|1.2L Petrol CVT|1.5L Diesel MT']
      ],
      Toyota: [
        ['Glanza', 2019, 2025, '1.2L Petrol MT|1.2L Petrol AMT|1.2L CNG'],
        ['Innova Crysta', 2016, 2025, '2.4L Diesel MT|2.4L Diesel AT|2.7L Petrol AT']
      ],
      Volkswagen: [
        ['Polo', 2010, 2022, '1.2L Petrol MT|1.0L TSI Petrol AT|1.5L Diesel MT'],
        ['Virtus', 2022, 2025, '1.0L TSI Petrol MT|1.5L TSI Petrol DSG']
      ],
      Skoda: [
        ['Rapid', 2011, 2020, '1.6L Petrol MT|1.5L Diesel MT|1.0L TSI Petrol AT'],
        ['Slavia', 2022, 2025, '1.0L TSI Petrol MT|1.5L TSI Petrol DSG']
      ],
      Ford: [
        ['Figo', 2010, 2021, '1.2L Petrol MT|1.5L Diesel MT'],
        ['Aspire', 2015, 2021, '1.2L Petrol MT|1.5L Diesel MT']
      ],
      Nissan: [['Micra', 2010, 2019, '1.2L Petrol MT|1.5L Diesel MT']],
      Renault: [
        ['Kwid', 2015, 2025, '0.8L Petrol MT|1.0L Petrol AMT'],
        ['Triber', 2019, 2025, '1.0L Petrol MT|1.0L Petrol AMT']
      ],
      Kia: [['Carens', 2022, 2025, '1.5L Petrol MT|1.5L Diesel MT|1.5L Diesel AT']],
      BMW: [['3 Series', 2012, 2025, '320d Diesel AT|330i Petrol AT']],
      'Mercedes-Benz': [['C-Class', 2012, 2025, 'C 200 Petrol AT|C 220d Diesel AT']],
      Audi: [['A4', 2012, 2025, '35 TFSI Petrol AT|2.0 TDI Diesel AT']],
      MG: [['Comet EV', 2023, 2025, '17.3 kWh Electric']],
      BYD: [['e6', 2021, 2025, '71.7 kWh Electric']]
    },
    suv: {
      Hyundai: [
        ['Creta', 2015, 2025, '1.5L Petrol MT|1.5L Petrol IVT|1.5L Diesel MT|1.5L Diesel AT'],
        ['Venue', 2019, 2025, '1.2L Petrol MT|1.0L Turbo Petrol DCT|1.5L Diesel MT']
      ],
      Kia: [
        ['Seltos', 2019, 2025, '1.5L Petrol MT|1.5L Petrol IVT|1.5L Diesel MT|1.5L Turbo Petrol DCT'],
        ['Sonet', 2020, 2025, '1.2L Petrol MT|1.0L Turbo Petrol DCT|1.5L Diesel MT']
      ],
      Tata: [
        ['Nexon', 2017, 2025, '1.2L Turbo Petrol MT|1.5L Diesel MT|1.2L Turbo Petrol AMT'],
        ['Harrier', 2019, 2025, '2.0L Diesel MT|2.0L Diesel AT']
      ],
      Mahindra: [
        ['XUV700', 2021, 2025, '2.0L Turbo Petrol AT|2.2L Diesel MT|2.2L Diesel AT'],
        ['Scorpio-N', 2022, 2025, '2.0L Turbo Petrol MT|2.2L Diesel MT|2.2L Diesel AT'],
        ['Thar', 2020, 2025, '2.0L Petrol MT|2.2L Diesel MT|1.5L Diesel RWD'],
        ['XUV300', 2019, 2024, '1.2L Turbo Petrol MT|1.5L Diesel MT|1.5L Diesel AMT']
      ],
      'Maruti Suzuki': [
        ['Brezza', 2016, 2025, '1.5L Petrol MT|1.5L Petrol AT|1.5L CNG|1.3L Diesel MT'],
        ['Grand Vitara', 2022, 2025, '1.5L Petrol MT|1.5L Strong Hybrid|1.5L CNG']
      ],
      Toyota: [
        ['Fortuner', 2016, 2025, '2.8L Diesel MT|2.8L Diesel AT|2.7L Petrol AT'],
        ['Urban Cruiser Hyryder', 2022, 2025, '1.5L Petrol MT|1.5L Strong Hybrid']
      ],
      Honda: [['Elevate', 2023, 2025, '1.5L Petrol MT|1.5L Petrol CVT']],
      Volkswagen: [['Taigun', 2021, 2025, '1.0L TSI Petrol MT|1.5L TSI Petrol DSG']],
      Skoda: [['Kushaq', 2021, 2025, '1.0L TSI Petrol MT|1.5L TSI Petrol DSG']],
      Ford: [
        ['EcoSport', 2013, 2021, '1.5L Petrol MT|1.5L Diesel MT|1.0L EcoBoost Petrol'],
        ['Endeavour', 2016, 2022, '2.0L Diesel AT|3.2L Diesel AT']
      ],
      Nissan: [['Magnite', 2020, 2025, '1.0L Petrol MT|1.0L Turbo Petrol CVT']],
      Renault: [
        ['Kiger', 2021, 2025, '1.0L Petrol MT|1.0L Turbo Petrol CVT'],
        ['Duster', 2012, 2022, '1.5L Petrol MT|1.5L Diesel MT|1.3L Turbo Petrol']
      ],
      Jeep: [
        ['Compass', 2017, 2025, '1.4L Turbo Petrol MT|2.0L Diesel MT|2.0L Diesel AT'],
        ['Meridian', 2022, 2025, '2.0L Diesel MT|2.0L Diesel AT']
      ],
      MG: [
        ['Hector', 2019, 2025, '1.5L Turbo Petrol MT|2.0L Diesel MT|1.5L Turbo Petrol CVT'],
        ['Astor', 2021, 2025, '1.5L Petrol MT|1.3L Turbo Petrol AT'],
        ['ZS EV', 2020, 2025, '50.3 kWh Electric']
      ],
      BMW: [['X1', 2016, 2025, 'sDrive20d Diesel AT|sDrive18i Petrol AT']],
      'Mercedes-Benz': [['GLA', 2015, 2025, 'GLA 200 Petrol AT|GLA 220d Diesel AT']],
      Audi: [['Q3', 2012, 2025, '35 TFSI Petrol AT|2.0 TDI Diesel AT']],
      BYD: [['Atto 3', 2022, 2025, '60.5 kWh Electric']]
    },
    bike: {
      Hero: [['Splendor Plus', 2011, 2025, '97.2cc Petrol']],
      Honda: [
        ['Shine', 2010, 2025, '125cc Petrol'],
        ['Unicorn', 2010, 2025, '160cc Petrol']
      ],
      Bajaj: [
        ['Pulsar 150', 2010, 2025, '149.5cc Petrol'],
        ['Pulsar NS200', 2012, 2025, '199.5cc Petrol']
      ],
      TVS: [
        ['Apache RTR 160', 2012, 2025, '159.7cc Petrol'],
        ['Apache RTR 200 4V', 2016, 2025, '197.75cc Petrol']
      ],
      'Royal Enfield': [
        ['Classic 350', 2010, 2025, '349cc Petrol'],
        ['Hunter 350', 2022, 2025, '349cc Petrol']
      ],
      KTM: [['Duke 200', 2012, 2025, '199.5cc Petrol']],
      Yamaha: [
        ['FZ-S', 2012, 2025, '149cc Petrol'],
        ['R15 V4', 2021, 2025, '155cc Petrol']
      ]
    },
    scooter: {
      Honda: [
        ['Activa 6G', 2020, 2025, '109.5cc Petrol'],
        ['Dio', 2010, 2025, '109.5cc Petrol'],
        
        
      ],
      TVS: [
        ['Jupiter', 2013, 2025, '109.7cc Petrol'],
        ['Ntorq 125', 2018, 2025, '124.8cc Petrol']
      ],
      Suzuki: [['Access 125', 2016, 2025, '124cc Petrol']],
      Yamaha: [['Fascino 125', 2015, 2025, '125cc Petrol']],
      Hero: [['Maestro Edge 125', 2015, 2025, '124.6cc Petrol']]
    }
  },

  categories: [
    { id: 'engine', name: 'Engine', blurb: 'Belts, plugs, gaskets' },
    { id: 'brakes', name: 'Brakes', blurb: 'Pads, discs, calipers' },
    { id: 'suspension', name: 'Suspension', blurb: 'Shocks, links, bushes' },
    { id: 'steering', name: 'Steering', blurb: 'Tie rods, racks, pumps' },
    { id: 'clutch', name: 'Clutch', blurb: 'Kits, plates, bearings' },
    { id: 'transmission', name: 'Transmission', blurb: 'Gear oil, chains, belts' },
    { id: 'electrical', name: 'Electrical', blurb: 'Alternators, starters, coils' },
    { id: 'battery', name: 'Battery', blurb: 'Car and bike batteries' },
    { id: 'filters', name: 'Filters', blurb: 'Air, oil, fuel' },
    { id: 'cooling', name: 'Cooling', blurb: 'Radiators, coolant, hoses' },
    { id: 'body', name: 'Body', blurb: 'Mirrors, wipers, panels' },
    { id: 'lighting', name: 'Lighting', blurb: 'Headlamps, bulbs, fogs' },
    { id: 'ac', name: 'AC', blurb: 'Compressors, cabin filters' },
    { id: 'accessories', name: 'Accessories', blurb: 'Mats, covers, gadgets' },
    { id: 'wheels', name: 'Wheels & Tyres', blurb: 'Tyres, bearings, rims' },
    { id: 'lubricants', name: 'Lubricants', blurb: 'Engine oil, grease, fluids' }
  ],

  vehicleBrands: [
    'Toyota', 'Honda', 'Hyundai', 'Kia', 'Tata', 'Mahindra', 'Maruti Suzuki', 'BMW', 'Mercedes-Benz',
    'Audi', 'Volkswagen', 'Ford', 'Nissan', 'Renault', 'Jeep', 'Skoda', 'MG', 'BYD'
  ],

  /* fits rule: 'Make|Model,Model|fromYear-toYear|fuel,fuel' (* = any) */
  products: [
    {
      id: 'p01', name: 'Ceramic Front Brake Pad Set', brand: 'Brembo', cat: 'brakes', price: 2450, mrp: 3100,
      partNo: 'BR-P-2041', oem: '55810-68P00', stock: 42, rating: 4.7, count: 318, seller: 's1', warranty: '12 months',
      tpl: 'pads', tint: '#c9773a',
      fits: ['Maruti Suzuki|Swift,Baleno,Dzire|2015-2025|*', 'Hyundai|i20,Grand i10 Nios|2014-2025|*', 'Tata|Tiago,Altroz|2016-2025|*'],
      specs: [['Material', 'Low-dust ceramic'], ['Position', 'Front axle'], ['Pieces', '4 pads with wear sensor'], ['Noise', 'Shimmed, low squeal'], ['Fitment note', 'Compare caliper type before ordering']],
      about: 'Low-dust ceramic compound that stays quiet under repeated braking. Ships with shims and a fresh set of clips.'
    },
    {
      id: 'p02', name: 'Ventilated Front Brake Disc (Pair)', brand: 'Bosch', cat: 'brakes', price: 5890, mrp: 7200,
      partNo: 'BS-D-0986', oem: '51712-2S000', stock: 18, rating: 4.6, count: 204, seller: 's3', warranty: '12 months',
      tpl: 'disc', tint: '#8a97a6',
      fits: ['Hyundai|Creta,Venue|2015-2025|*', 'Kia|Seltos,Sonet|2019-2025|*'],
      specs: [['Diameter', '280 mm'], ['Thickness', '24 mm'], ['Type', 'Vented, coated'], ['Bolt holes', '5'], ['Sold as', 'Pair (left and right)']],
      about: 'Zinc-coated vented discs machined to a tight run-out tolerance for smooth, vibration-free stops.'
    },
    {
      id: 'p03', name: 'Panel Air Filter', brand: 'Mann-Filter', cat: 'filters', price: 640, mrp: 820,
      partNo: 'MF-C-2757', oem: '13780-M68K00', stock: 120, rating: 4.8, count: 912, seller: 's2', warranty: '6 months',
      tpl: 'airfilter', tint: '#5ea4c8',
      fits: ['Maruti Suzuki|Swift,Baleno,Dzire|2017-2025|petrol,cng', 'Hyundai|i20,Grand i10 Nios|2018-2025|petrol'],
      specs: [['Media', 'Multi-layer cellulose'], ['Length', '236 mm'], ['Width', '181 mm'], ['Height', '48 mm'], ['Change interval', 'About 15,000 km']],
      about: 'High-flow pleated media that traps fine dust without starving the engine of air.'
    },
    {
      id: 'p04', name: 'Spin-on Oil Filter', brand: 'Mahle', cat: 'filters', price: 355, mrp: 450,
      partNo: 'MH-OC-1224', oem: '15400-RTA-003', stock: 260, rating: 4.7, count: 1406, seller: 's2', warranty: '6 months',
      tpl: 'oilfilter', tint: '#3b78b5',
      fits: ['Honda|City,Amaze|2013-2025|petrol', 'Toyota|Glanza|2019-2025|petrol,cng', 'Maruti Suzuki|Baleno,Swift|2015-2025|petrol'],
      specs: [['Thread', 'M20 x 1.5'], ['Height', '79 mm'], ['Anti-drain valve', 'Yes'], ['Bypass valve', 'Yes'], ['Oil capacity', '0.35 L']],
      about: 'Full-flow spin-on filter with anti-drain valve so the engine gets oil pressure the moment you start it.'
    },
    {
      id: 'p05', name: 'Maintenance-Free Battery 12V 45Ah', brand: 'Exide', cat: 'battery', price: 5299, mrp: 6400,
      partNo: 'EX-B-45L', oem: 'N/A', stock: 24, rating: 4.6, count: 642, seller: 's5', warranty: '48 months',
      tpl: 'battery', tint: '#d9b13b',
      fits: ['Maruti Suzuki|Swift,Baleno,Dzire,Alto K10|2010-2025|petrol,cng', 'Hyundai|i20,Grand i10 Nios|2014-2025|petrol', 'Tata|Tiago|2016-2025|petrol', 'Renault|Kwid|2015-2025|petrol'],
      specs: [['Voltage', '12 V'], ['Capacity', '45 Ah'], ['Cold cranking', '350 A'], ['Terminal', 'Left positive'], ['Size', '238 x 129 x 227 mm']],
      about: 'Sealed maintenance-free battery. No topping up with distilled water. Comes charged and ready to fit.'
    },
    {
      id: 'p06', name: 'Iridium Spark Plug Set (4 pcs)', brand: 'NGK', cat: 'engine', price: 1680, mrp: 2100,
      partNo: 'NG-IR-5544', oem: '09482-00610', stock: 75, rating: 4.9, count: 301, seller: 's4', warranty: '12 months',
      tpl: 'sparkplug', tint: '#e0d8a8',
      fits: ['Honda|City,Amaze|2014-2025|petrol', 'Maruti Suzuki|Swift,Baleno|2015-2025|petrol', 'Hyundai|i20|2014-2025|petrol'],
      specs: [['Electrode', 'Iridium tip'], ['Thread', '14 mm, 19 mm reach'], ['Hex size', '16 mm'], ['Gap', '1.0 mm, pre-set'], ['Pack', '4 plugs']],
      about: 'Fine-wire iridium electrode for reliable cold starts and a steadier idle across the plug life.'
    },
    {
      id: 'p07', name: 'Gas Shock Absorber, Front (Pair)', brand: 'KYB', cat: 'suspension', price: 4980, mrp: 6200,
      partNo: 'KY-S-3345', oem: '54661-3X000', stock: 16, rating: 4.5, count: 187, seller: 's7', warranty: '12 months',
      tpl: 'shock', tint: '#e7b53d',
      fits: ['Hyundai|Creta|2015-2025|*', 'Kia|Seltos|2019-2025|*', 'Hyundai|Venue|2019-2025|*'],
      specs: [['Type', 'Twin-tube gas'], ['Position', 'Front, left and right'], ['Extended length', '507 mm'], ['Piston rod', '22 mm'], ['Sold as', 'Pair']],
      about: 'Gas-charged twin-tube dampers tuned for Indian road surfaces. Firm on highways, forgiving over broken tarmac.'
    },
    {
      id: 'p08', name: 'LED Headlamp Assembly, Right', brand: 'Uno Minda', cat: 'lighting', price: 8450, mrp: 10900,
      partNo: 'UM-H-7710', oem: '92102-C1100', stock: 6, rating: 4.4, count: 93, seller: 's6', warranty: '12 months',
      tpl: 'headlamp', tint: '#9fc5ff',
      fits: ['Hyundai|Creta|2015-2019|*', 'Tata|Nexon|2017-2020|*'],
      specs: [['Side', 'Right (driver side, India)'], ['Light source', 'Projector with LED DRL'], ['Includes', 'Wiring harness, no bulbs'], ['Adjuster', 'Manual'], ['Finish', 'Clear lens, black bezel']],
      about: 'Direct-fit projector headlamp with a crisp cut-off line and a daytime running strip.'
    },
    {
      id: 'p09', name: 'Radial Tubeless Tyre 185/65 R15', brand: 'MRF', cat: 'wheels', price: 5150, mrp: 5900,
      partNo: 'MR-T-18565', oem: 'N/A', stock: 60, rating: 4.6, count: 528, seller: 's8', warranty: '60 months',
      tpl: 'tyre', tint: '#4a5561',
      fits: ['Honda|City|2014-2019|*', 'Hyundai|Verna|2011-2017|*', 'Toyota|Glanza|2019-2025|petrol'],
      specs: [['Size', '185/65 R15'], ['Load index', '88'], ['Speed rating', 'H (210 km/h)'], ['Type', 'Tubeless radial'], ['Tread', 'Asymmetric']],
      about: 'Long-wearing radial with a stiff sidewall for stable cornering and shorter wet braking distances.'
    },
    {
      id: 'p10', name: 'Fully Synthetic Engine Oil 5W-30 (3.5 L)', brand: 'Castrol', cat: 'lubricants', price: 3290, mrp: 3850,
      partNo: 'CS-E-5W30', oem: 'N/A', stock: 300, rating: 4.8, count: 2304, seller: 's1', warranty: 'Sealed pack',
      tpl: 'jug', tint: '#e2413d', universal: true,
      fits: [],
      specs: [['Grade', 'SAE 5W-30'], ['Spec', 'API SP / ACEA C3'], ['Base', 'Fully synthetic'], ['Pack', '3.5 litres'], ['Check', 'Match the grade in your owner manual']],
      about: 'Low-viscosity synthetic for modern petrol and diesel engines. Confirm the grade in your manual before buying.'
    },
    {
      id: 'p11', name: 'Clutch Kit: Plate, Cover and Release Bearing', brand: 'LuK', cat: 'clutch', price: 9850, mrp: 12500,
      partNo: 'LK-CK-6210', oem: '41100-4A000', stock: 9, rating: 4.7, count: 142, seller: 's9', warranty: '12 months',
      tpl: 'clutch', tint: '#b9873a',
      fits: ['Maruti Suzuki|Swift,Dzire|2011-2017|diesel', 'Hyundai|i20|2014-2018|diesel', 'Ford|Figo,Aspire|2010-2021|diesel'],
      specs: [['Disc diameter', '215 mm'], ['Splines', '24'], ['Includes', 'Disc, pressure plate, bearing'], ['Damper', 'Torsion damped hub'], ['Note', 'Replace flywheel surface while fitting']],
      about: 'Complete three-piece kit so plate, cover and bearing wear together and you only open the gearbox once.'
    },
    {
      id: 'p12', name: 'Aluminium Radiator', brand: 'Valeo', cat: 'cooling', price: 7120, mrp: 8900,
      partNo: 'VL-R-3320', oem: '25310-1R000', stock: 11, rating: 4.5, count: 76, seller: 's3', warranty: '12 months',
      tpl: 'radiator', tint: '#8fb3d6',
      fits: ['Honda|City|2014-2019|petrol', 'Hyundai|Verna|2011-2017|*'],
      specs: [['Core', 'Aluminium, brazed'], ['Core size', '580 x 350 x 26 mm'], ['Rows', '1'], ['Transmission', 'Manual'], ['Includes', 'Drain plug, rubber mounts']],
      about: 'Brazed aluminium core with plastic tanks. Sheds engine heat quickly in stop-and-go traffic.'
    },
    {
      id: 'p13', name: 'Long-Life Coolant Concentrate (1 L)', brand: 'Prestone', cat: 'cooling', price: 520, mrp: 650,
      partNo: 'PR-C-1001', oem: 'N/A', stock: 180, rating: 4.6, count: 388, seller: 's2', warranty: 'Sealed pack',
      tpl: 'jug', tint: '#39b58a', universal: true, variant: 'coolant',
      fits: [],
      specs: [['Type', 'OAT long-life'], ['Colour', 'Green'], ['Mix', '1 : 1 with demineralised water'], ['Pack', '1 litre'], ['Check', 'Match the coolant colour and spec in your manual']],
      about: 'Corrosion-protecting coolant concentrate. Mix with demineralised water in equal parts.'
    },
    {
      id: 'p14', name: 'Alternator 90A', brand: 'Bosch', cat: 'electrical', price: 11300, mrp: 14000,
      partNo: 'BS-A-9012', oem: '37300-4X100', stock: 5, rating: 4.6, count: 58, seller: 's5', warranty: '12 months',
      tpl: 'alternator', tint: '#6f7f91',
      fits: ['Toyota|Innova Crysta|2016-2025|diesel', 'Mahindra|Scorpio-N,XUV700|2021-2025|diesel'],
      specs: [['Output', '12 V, 90 A'], ['Pulley', '6-rib'], ['Regulator', 'Built-in'], ['Rotation', 'Clockwise'], ['Condition', 'New, not remanufactured']],
      about: 'New alternator with an integrated regulator. Holds charging voltage steady at idle and at speed.'
    },
    {
      id: 'p15', name: 'Aero Wiper Blade Set (24 in / 16 in)', brand: 'Bosch', cat: 'body', price: 1150, mrp: 1450,
      partNo: 'BS-W-A3-24', oem: 'N/A', stock: 90, rating: 4.5, count: 445, seller: 's4', warranty: '6 months',
      tpl: 'wiper', tint: '#6d7883',
      fits: ['Hyundai|Creta,Venue|2015-2025|*', 'Kia|Seltos,Sonet|2019-2025|*', 'Tata|Nexon|2017-2025|*'],
      specs: [['Sizes', '24 in driver, 16 in passenger'], ['Type', 'Flat beam'], ['Connector', 'Hook arm'], ['Rubber', 'Graphite-coated'], ['Pack', '2 blades']],
      about: 'Flat-beam blades that stay in contact on curved windscreens and clear rain in a single wipe.'
    },
    {
      id: 'p16', name: 'Timing Belt Kit with Tensioner', brand: 'Gates', cat: 'engine', price: 4460, mrp: 5600,
      partNo: 'GT-TB-1178', oem: '04E109119', stock: 22, rating: 4.8, count: 167, seller: 's10', warranty: '12 months',
      tpl: 'belt', tint: '#c89a3a',
      fits: ['Volkswagen|Polo|2010-2022|petrol', 'Skoda|Rapid|2011-2020|petrol', 'Ford|Figo|2010-2021|petrol'],
      specs: [['Teeth', '113'], ['Width', '25 mm'], ['Includes', 'Belt, tensioner, idler'], ['Material', 'HNBR with glass cord'], ['Change interval', 'About 90,000 km']],
      about: 'Kit includes belt and tensioner so the whole timing drive is renewed together.'
    },
    {
      id: 'p17', name: 'Tie Rod End, Outer', brand: 'TRW', cat: 'steering', price: 890, mrp: 1150,
      partNo: 'TR-T-0451', oem: '48520-M68K00', stock: 64, rating: 4.4, count: 132, seller: 's7', warranty: '12 months',
      tpl: 'tierod', tint: '#7a8794',
      fits: ['Maruti Suzuki|Swift,Dzire|2011-2025|*', 'Hyundai|i20|2014-2025|*'],
      specs: [['Position', 'Outer, left or right'], ['Thread', 'M14 x 1.5'], ['Stud taper', '12.3 mm'], ['Includes', 'Castle nut, split pin'], ['Note', 'Get a wheel alignment after fitting']],
      about: 'Forged steel body with a greased ball joint and dust boot. Restores sharp steering response.'
    },
    {
      id: 'p18', name: 'Manual Gearbox Oil 75W-85 (1 L)', brand: 'Motul', cat: 'transmission', price: 890, mrp: 1050,
      partNo: 'MT-G-7585', oem: 'N/A', stock: 140, rating: 4.7, count: 211, seller: 's1', warranty: 'Sealed pack',
      tpl: 'jug', tint: '#2f6fb0', universal: true, variant: 'gear',
      fits: [],
      specs: [['Grade', 'SAE 75W-85'], ['Spec', 'API GL-4'], ['Use', 'Manual gearboxes'], ['Pack', '1 litre'], ['Check', 'Match the grade in your owner manual']],
      about: 'Synthetic gear oil for smoother shifts. Confirm the grade and capacity for your gearbox first.'
    },
    {
      id: 'p19', name: 'Side Mirror Assembly, Left, Electric', brand: 'Minda', cat: 'body', price: 3650, mrp: 4600,
      partNo: 'MD-M-2210', oem: '87610-M68K01', stock: 14, rating: 4.3, count: 69, seller: 's6', warranty: '6 months',
      tpl: 'mirror', tint: '#59636e',
      fits: ['Maruti Suzuki|Baleno|2015-2021|*', 'Hyundai|i20|2014-2020|*'],
      specs: [['Side', 'Left (passenger side)'], ['Adjustment', 'Electric'], ['Indicator', 'Integrated LED'], ['Folding', 'Manual'], ['Finish', 'Primed, ready to paint']],
      about: 'Complete mirror with glass, motor and indicator. Comes primed so it can be colour-matched.'
    },
    {
      id: 'p20', name: 'AC Compressor', brand: 'Denso', cat: 'ac', price: 14900, mrp: 18500,
      partNo: 'DN-AC-6SEU', oem: '88320-0K150', stock: 4, rating: 4.6, count: 41, seller: 's9', warranty: '12 months',
      tpl: 'compressor', tint: '#7b8ea1',
      fits: ['Honda|City|2014-2019|petrol', 'Toyota|Innova Crysta|2016-2025|diesel'],
      specs: [['Type', 'Swash plate, 7 cylinder'], ['Clutch', '12 V electromagnetic'], ['Refrigerant', 'R134a'], ['Pulley', '6-groove'], ['Includes', 'PAG oil pre-filled']],
      about: 'Pre-charged with compressor oil. Restores full cooling on hot afternoons.'
    },
    {
      id: 'p21', name: 'Activated Carbon Cabin Air Filter', brand: 'Purolator', cat: 'ac', price: 520, mrp: 690,
      partNo: 'PU-CF-2210', oem: '97133-3X000', stock: 210, rating: 4.7, count: 683, seller: 's2', warranty: '6 months',
      tpl: 'airfilter', tint: '#4f6e5b', variant: 'cabin',
      fits: ['Hyundai|Creta|2015-2025|*', 'Kia|Seltos|2019-2025|*', 'Tata|Nexon|2017-2025|*'],
      specs: [['Media', 'Activated carbon'], ['Length', '215 mm'], ['Width', '196 mm'], ['Height', '30 mm'], ['Change interval', 'About 10,000 km']],
      about: 'Carbon layer cuts traffic odour, pollen and fine dust before it reaches the cabin.'
    },
    {
      id: 'p22', name: '3D Floor Mat Set (5 pcs)', brand: 'Autoform', cat: 'accessories', price: 3900, mrp: 5200,
      partNo: 'AF-FM-3D5', oem: 'N/A', stock: 33, rating: 4.5, count: 254, seller: 's8', warranty: '12 months',
      tpl: 'mat', tint: '#4a5561',
      fits: ['Hyundai|Creta|2020-2025|*', 'Kia|Seltos|2019-2025|*'],
      specs: [['Material', 'TPE, odourless'], ['Pieces', '5 (front, rear, boot lip)'], ['Edges', 'Raised 30 mm'], ['Fit', 'Vehicle-specific moulding'], ['Care', 'Hose down and dry']],
      about: 'Laser-measured TPE mats with raised edges that hold rain, mud and spills off the carpet.'
    },
    {
      id: 'p23', name: 'LED Headlight Bulb H4 (Pair)', brand: 'Philips', cat: 'lighting', price: 2750, mrp: 3400,
      partNo: 'PH-L-H4X2', oem: 'N/A', stock: 88, rating: 4.5, count: 497, seller: 's4', warranty: '24 months',
      tpl: 'bulb', tint: '#cfe3ff',
      fits: ['Maruti Suzuki|Alto K10,Swift|2010-2017|*', 'Hyundai|Verna|2011-2017|*', 'Honda|Shine,Unicorn|2010-2025|*'],
      specs: [['Base', 'H4 (P43t)'], ['Output', '2,000 lumens each'], ['Colour', '6,000 K white'], ['Cooling', 'Passive heat sink'], ['Pack', '2 bulbs']],
      about: 'Plug-in H4 upgrade with a clean beam pattern. Fits halogen housings without cutting or drilling.'
    },
    {
      id: 'p24', name: 'Chain and Sprocket Kit', brand: 'Rolon', cat: 'transmission', price: 1890, mrp: 2350,
      partNo: 'RL-CS-428', oem: 'N/A', stock: 47, rating: 4.4, count: 122, seller: 's10', warranty: '6 months',
      tpl: 'chainkit', tint: '#c9a24a',
      fits: ['Bajaj|Pulsar 150|2010-2025|*', 'TVS|Apache RTR 160|2012-2025|*', 'Hero|Splendor Plus|2011-2025|*'],
      specs: [['Chain', '428H, 132 links'], ['Front sprocket', '15T'], ['Rear sprocket', '43T'], ['Finish', 'Gold, X-ring'], ['Includes', 'Chain, 2 sprockets, clip link']],
      about: 'Matched chain and both sprockets so they wear evenly and stay quiet.'
    },
    {
      id: 'p25', name: 'Front Disc Brake Pad Set (Motorcycle)', brand: 'Ferodo', cat: 'brakes', price: 690, mrp: 890,
      partNo: 'FR-B-2211', oem: 'N/A', stock: 110, rating: 4.6, count: 376, seller: 's7', warranty: '6 months',
      tpl: 'pads', tint: '#b8642f', variant: 'bike',
      fits: ['Bajaj|Pulsar NS200|2012-2025|*', 'KTM|Duke 200|2012-2025|*', 'Yamaha|FZ-S|2012-2025|*'],
      specs: [['Material', 'Sintered'], ['Position', 'Front'], ['Pieces', '2 pads'], ['Thickness', '7 mm'], ['Note', 'Bed in over the first 200 km']],
      about: 'Sintered pads with strong initial bite and steady feel in wet and dry conditions.'
    },
    {
      id: 'p26', name: 'CVT Drive Belt (Scooter)', brand: 'Gates', cat: 'transmission', price: 1290, mrp: 1600,
      partNo: 'GT-CVT-2510', oem: 'N/A', stock: 58, rating: 4.5, count: 98, seller: 's8', warranty: '12 months',
      tpl: 'cvtbelt', tint: '#8a9098',
      fits: ['Honda|Activa 6G,Dio|2010-2025|*', 'TVS|Jupiter|2013-2025|*', 'Suzuki|Access 125|2016-2025|*'],
      specs: [['Width', '18.5 mm'], ['Length', '669 mm'], ['Construction', 'Aramid cord, rubber teeth'], ['Use', 'Automatic scooters'], ['Change interval', 'About 20,000 km']],
      about: 'Kevlar-corded variator belt for smooth acceleration and quiet cruising.'
    },
    {
      id: 'p27', name: 'Front Stabiliser Link (Pair)', brand: 'Moog', cat: 'suspension', price: 1380, mrp: 1750,
      partNo: 'MG-SL-5520', oem: '54830-3X000', stock: 52, rating: 4.5, count: 176, seller: 's7', warranty: '12 months',
      tpl: 'tierod', tint: '#73808c', variant: 'link',
      fits: ['Hyundai|Creta,Venue|2015-2025|*', 'Kia|Seltos,Sonet|2019-2025|*', 'Maruti Suzuki|Baleno|2015-2025|*'],
      specs: [['Position', 'Front, left and right'], ['Length', '265 mm'], ['Joints', 'Two greased ball joints'], ['Thread', 'M12 x 1.25'], ['Fixes', 'Knocking over speed breakers']],
      about: 'Ends the rattle over speed breakers. Sealed ball joints keep grease in and grit out.'
    },
    {
      id: 'p28', name: 'Ignition Coil Set (4 pcs)', brand: 'Delphi', cat: 'electrical', price: 3980, mrp: 4900,
      partNo: 'DP-IC-1044', oem: '33400-M68K01', stock: 27, rating: 4.6, count: 119, seller: 's5', warranty: '12 months',
      tpl: 'coil', tint: '#6b7fa0',
      fits: ['Maruti Suzuki|Swift,Baleno,Dzire|2015-2025|petrol', 'Toyota|Glanza|2019-2025|petrol'],
      specs: [['Type', 'Pencil coil-on-plug'], ['Voltage', '12 V'], ['Connector', '3-pin'], ['Pack', '4 coils'], ['Fixes', 'Misfire, rough idle']],
      about: 'Coil-on-plug units that put a full spark on every cylinder. Cures misfires from worn coils.'
    },
    {
      id: 'p29', name: 'Motorcycle Battery 12V 5Ah', brand: 'Amaron', cat: 'battery', price: 1690, mrp: 2050,
      partNo: 'AM-BB-12N5', oem: 'N/A', stock: 66, rating: 4.5, count: 233, seller: 's5', warranty: '24 months',
      tpl: 'battery', tint: '#3fa66a', variant: 'bike',
      fits: ['Hero|Splendor Plus|2011-2025|*', 'Honda|Shine|2010-2025|*', 'Bajaj|Pulsar 150|2010-2025|*'],
      specs: [['Voltage', '12 V'], ['Capacity', '5 Ah'], ['Type', 'Sealed, maintenance free'], ['Terminal', 'Left positive'], ['Size', '120 x 60 x 130 mm']],
      about: 'Sealed lead-calcium battery with strong cranking on cold mornings. No acid topping up.'
    },
    {
      id: 'p30', name: 'Front Wheel Bearing Kit', brand: 'SKF', cat: 'wheels', price: 2290, mrp: 2850,
      partNo: 'SK-WB-7108', oem: '51720-1R000', stock: 38, rating: 4.7, count: 154, seller: 's3', warranty: '12 months',
      tpl: 'bearing', tint: '#8590a0',
      fits: ['Hyundai|i20,Verna|2014-2025|*', 'Kia|Seltos|2019-2025|*', 'Honda|City|2014-2025|*'],
      specs: [['Type', 'Double-row ball bearing'], ['Inner diameter', '35 mm'], ['Outer diameter', '68 mm'], ['Includes', 'Circlip, hub nut'], ['Fixes', 'Humming that rises with speed']],
      about: 'Pre-greased sealed bearing with everything needed for the swap in the box.'
    }
  ],

  sellers: [
    { id: 's1', name: 'Anna Nagar Auto Hub', city: 'Chennai', since: 2012, rating: 4.8, reviews: 1860, reply: '10 min', verified: true, hue: 22, focus: 'Brakes, lubricants and service kits', about: 'Family-run parts counter serving Chennai workshops for over a decade. Ships the same day before 4 pm.' },
    { id: 's2', name: 'Velachery Filter House', city: 'Chennai', since: 2015, rating: 4.7, reviews: 1420, reply: '15 min', verified: true, hue: 200, focus: 'Filters, coolants and AC', about: 'Specialist in filtration for petrol and diesel cars. Every filter is matched to the engine code.' },
    { id: 's3', name: 'Coimbatore Autoparts Co.', city: 'Coimbatore', since: 2009, rating: 4.6, reviews: 980, reply: '30 min', verified: true, hue: 140, focus: 'Discs, radiators and bearings', about: 'Authorised stockist for cooling and brake systems across Tamil Nadu and Kerala.' },
    { id: 's4', name: 'Bengaluru Torque Mart', city: 'Bengaluru', since: 2016, rating: 4.9, reviews: 1120, reply: '8 min', verified: true, hue: 262, focus: 'Ignition, wipers and lighting', about: 'Enthusiast-run store known for careful packing and quick answers on fitment.' },
    { id: 's5', name: 'Hyderabad Voltline Traders', city: 'Hyderabad', since: 2011, rating: 4.6, reviews: 860, reply: '20 min', verified: true, hue: 48, focus: 'Batteries and electricals', about: 'Battery and electrical specialists. Old battery pickup available in Hyderabad.' },
    { id: 's6', name: 'Pune Lumen Auto', city: 'Pune', since: 2018, rating: 4.4, reviews: 410, reply: '45 min', verified: false, hue: 320, focus: 'Headlamps and body parts', about: 'Lighting and body-panel specialists with a large stock of headlamp assemblies.' },
    { id: 's7', name: 'Kashmere Gate Spares', city: 'New Delhi', since: 2005, rating: 4.5, reviews: 2210, reply: '25 min', verified: true, hue: 8, focus: 'Suspension, steering and two-wheeler brakes', about: 'From the heart of Delhi\'s parts market. Deep stock of steering and suspension parts.' },
    { id: 's8', name: 'Mumbai Wheelhouse', city: 'Mumbai', since: 2013, rating: 4.7, reviews: 1340, reply: '12 min', verified: true, hue: 180, focus: 'Tyres, mats and scooter parts', about: 'Tyre and accessories dealer with fitting partners across Mumbai and Thane.' },
    { id: 's9', name: 'Chowringhee Motors', city: 'Kolkata', since: 2008, rating: 4.5, reviews: 720, reply: '35 min', verified: true, hue: 30, focus: 'Clutches and air conditioning', about: 'Clutch and AC repair parts, sold with fitting advice for local workshops.' },
    { id: 's10', name: 'Ahmedabad Gearline', city: 'Ahmedabad', since: 2014, rating: 4.6, reviews: 640, reply: '18 min', verified: true, hue: 96, focus: 'Belts, chains and drivetrain', about: 'Drivetrain specialists supplying belts, chains and sprockets to dealers across Gujarat.' }
  ],

  reviews: [
    { name: 'Karthik Raman', city: 'Chennai', vehicle: 'Hyundai Creta 2019', rating: 5, product: 'p02', text: 'Chose my Creta, got a green tick on the discs, and they fit without any filing. Brakes feel new and the vibration at 100 km/h is gone.' },
    { name: 'Priya Nair', city: 'Kochi', vehicle: 'Maruti Swift 2018', rating: 5, product: 'p01', text: 'The site told me plainly which pad set matched my Swift. Delivered in two days with clips included. My mechanic was impressed.' },
    { name: 'Aditya Sharma', city: 'New Delhi', vehicle: 'Honda City 2016', rating: 4, product: 'p06', text: 'Idle is smoother and mileage is up by a bit. Delivery was a day late but the seller messaged me the moment it slipped.' },
    { name: 'Meera Iyer', city: 'Bengaluru', vehicle: 'Kia Seltos 2021', rating: 5, product: 'p22', text: 'Mats fit the Seltos perfectly, edges hold the mud from monsoon commutes. Worth it over the generic ones.' },
    { name: 'Faisal Khan', city: 'Hyderabad', vehicle: 'Toyota Innova Crysta 2018', rating: 5, product: 'p14', text: 'Alternator was flagged as compatible for my diesel. Fitted by my workshop in an hour. Battery light gone.' },
    { name: 'Lakshmi Venkat', city: 'Coimbatore', vehicle: 'Tata Nexon 2020', rating: 4, product: 'p21', text: 'Cabin filter change made the AC smell fresh again. Simple ordering and honest fit info for the Nexon.' },
    { name: 'Rohan Deshmukh', city: 'Pune', vehicle: 'Bajaj Pulsar NS200', rating: 5, product: 'p25', text: 'Pads have strong bite from day one. Cheaper than the local shop and the part number matched exactly.' },
    { name: 'Sunita Patel', city: 'Ahmedabad', vehicle: 'Volkswagen Polo 2015', rating: 5, product: 'p16', text: 'Timing belt kit came as a full set with the tensioner. Workshop appreciated not having to hunt for extra parts.' },
    { name: 'Arjun Menon', city: 'Chennai', vehicle: 'Maruti Baleno 2019', rating: 4, product: 'p05', text: 'Battery arrived charged and the old one was picked up on delivery. Cranks instantly now, even on cold mornings.' },
    { name: 'Neha Kulkarni', city: 'Mumbai', vehicle: 'Honda Activa 6G', rating: 5, product: 'p26', text: 'Belt replaced, the scooter no longer judders off the line. The fitment badge saved me a wrong purchase.' },
    { name: 'Vikram Singh', city: 'Jaipur', vehicle: 'Mahindra Scorpio-N 2023', rating: 4, product: 'p14', text: 'Good packaging and a proper invoice with GST for my workshop. Support answered my fitment question within minutes.' },
    { name: 'Deepa Krishnan', city: 'Chennai', vehicle: 'Hyundai i20 2017', rating: 5, product: 'p17', text: 'Steering felt loose after potholes. New tie rod ends and an alignment fixed it. Straightforward, honest listing.' }
  ],

  workshops: [
    { id: 'w1', name: 'TorqueLab Garage', city: 'Chennai', area: 'Guindy', rating: 4.8, reviews: 612, from: 1499, brands: 'All makes', services: ['General service', 'Brake service', 'AC service', 'Wheel alignment', 'Battery replacement'], hours: 'Mon to Sat, 9 am to 7 pm', pickup: true },
    { id: 'w2', name: 'PitStop Motors', city: 'Bengaluru', area: 'Indiranagar', rating: 4.7, reviews: 438, from: 1799, brands: 'Hatchbacks, sedans, SUVs', services: ['General service', 'Brake service', 'Clutch repair', 'Suspension check', 'Wheel alignment'], hours: 'Mon to Sun, 8 am to 8 pm', pickup: true },
    { id: 'w3', name: 'Gearhead Auto Clinic', city: 'Hyderabad', area: 'Banjara Hills', rating: 4.6, reviews: 297, from: 1299, brands: 'All makes', services: ['General service', 'AC service', 'Battery replacement', 'Electrical diagnosis'], hours: 'Mon to Sat, 9 am to 6 pm', pickup: false },
    { id: 'w4', name: 'Apex Motor Works', city: 'Mumbai', area: 'Andheri East', rating: 4.7, reviews: 521, from: 1999, brands: 'Premium and luxury', services: ['General service', 'Brake service', 'Suspension check', 'Clutch repair', 'Electrical diagnosis'], hours: 'Mon to Sat, 9 am to 7 pm', pickup: true },
    { id: 'w5', name: 'Ring Road Car Care', city: 'New Delhi', area: 'Sarita Vihar', rating: 4.5, reviews: 356, from: 1399, brands: 'All makes', services: ['General service', 'AC service', 'Wheel alignment', 'Brake service', 'Battery replacement'], hours: 'Mon to Sun, 9 am to 8 pm', pickup: true }
  ],

  serviceTypes: ['General service', 'Brake service', 'AC service', 'Clutch repair', 'Suspension check', 'Wheel alignment', 'Battery replacement', 'Electrical diagnosis'],

  blog: [
    {
      id: 'b1', title: 'How to find the right spare part for your car', tag: 'Buying guide', read: 6, date: '12 Sep 2026', art: 'b1',
      excerpt: 'Model, year and engine all decide what fits. Here is the four-step check we use before we say a part is compatible.',
      body: ['Start with the exact model and year, then the engine. Two cars with the same badge can use different brake calipers, belts or filters depending on the month they were built.', 'Next, read the part number printed on the old part. Match it with the OEM number in the listing, or with the cross-reference number the seller shows.', 'Third, check the physical specs. Diameter, length and thread size are usually printed in the specification table, and a two-minute check with a tape measure saves a return.', 'Finally, ask the seller. A good seller answers fitment questions quickly and will tell you when a part is not right for your car.']
    },
    {
      id: 'b2', title: 'OEM or aftermarket: what really matters', tag: 'Parts explained', read: 5, date: '05 Sep 2026', art: 'b2',
      excerpt: 'Genuine parts cost more, but not every aftermarket part is a compromise. When to spend and when to save.',
      body: ['OEM parts are made to the carmaker\'s specification and usually carry the carmaker\'s warranty. They are the safest choice for safety and electronic parts.', 'Reputed aftermarket makers often supply the same factory lines under their own brand. Filters, belts, pads and plugs from these makers match OEM performance for less.', 'Avoid unbranded parts for anything that keeps the car on the road: brakes, tyres, steering and suspension. Look for a brand, a part number and a warranty card.', 'When you compare, look at the warranty period and return policy along with the price.']
    },
    {
      id: 'b3', title: 'Brake pads and discs: when to replace which', tag: 'Maintenance', read: 7, date: '28 Aug 2026', art: 'b3',
      excerpt: 'Squeal, judder or a long pedal? Each symptom points to a different part. A simple guide to reading them.',
      body: ['A high squeal at low speed usually means the wear indicator is touching the disc. That is your cue to change the pads soon.', 'A steering-wheel shake under braking points to warped or uneven discs. Pads alone will not cure it.', 'A soft, low pedal can mean air in the brake fluid or a leaking hose. Have the system checked before driving on.', 'Replace pads on both wheels of an axle together, and fit new discs when they are below the minimum thickness stamped on the edge.']
    },
    {
      id: 'b4', title: 'Engine oil grades explained: 5W-30, 0W-20, 10W-40', tag: 'Fluids', read: 5, date: '19 Aug 2026', art: 'b4',
      excerpt: 'The numbers describe how oil flows cold and hot. Choose the grade in your manual, then choose a brand.',
      body: ['The first number with a W is how thick the oil is in the cold. A lower number flows faster at start-up, which is when most engine wear happens.', 'The second number is thickness at operating temperature. Higher numbers give a thicker film in hot Indian summers and heavy traffic.', 'Always start with the grade your owner manual lists. Using a much thinner or thicker oil can reduce mileage or raise wear.', 'Between grades, look at the approval codes: API and ACEA specs tell you the oil passed the tests your engine needs.']
    },
    {
      id: 'b5', title: 'Monsoon car care: a pre-rain checklist', tag: 'Seasonal', read: 4, date: '08 Aug 2026', art: 'b5',
      excerpt: 'Wipers, tyres, brakes and lights matter most when the road is wet. Ten minutes of checks before the first storm.',
      body: ['Check the wipers first. Cracked or streaking rubber should be replaced before the rains, not during them.', 'Look at tyre tread depth. Below 3 mm, grip on wet roads falls sharply and stopping distances grow.', 'Test the headlamps, fog lamps and brake lights, and clean the lenses. Good visibility is the cheapest safety upgrade.', 'Finally, check the battery terminals for corrosion and keep the AC drain clear so water does not collect in the cabin.']
    }
  ],

  coupons: { FIXIT10: { pct: 10, label: '10% off parts' }, WELCOME5: { pct: 5, label: '5% off your first order' } },

  demoAccounts: {
    customer: { name: 'Demo Customer', email: 'customer@demo.in', role: 'customer', city: 'Chennai' },
    seller: { name: 'Anna Nagar Auto Hub', email: 'seller@demo.in', role: 'seller', city: 'Chennai', sellerId: 's1' },
    admin: { name: 'SpareFixer Admin', email: 'admin@demo.in', role: 'admin', city: 'Chennai' }
  }
};


/* ------------------------------- storage ------------------------------- */
const LS = {
  get(key, fallback) {
    try { const v = localStorage.getItem('sf_' + key); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('sf_' + key, JSON.stringify(val)); } catch (e) { /* storage full or blocked */ }
  }
};

/* --------------------------------- state -------------------------------- */
const state = {
  theme: LS.get('theme', null),
  user: LS.get('user', null),
  vehicle: LS.get('vehicle', null),               // {type, make, model, year, variant}
  cart: LS.get('cart', []),                        // [{id, qty}]
  wishlist: LS.get('wishlist', []),                 // [productId]
  compare: LS.get('compare', []),                   // [productId], max 4
  addresses: LS.get('addresses', []),
  orders: LS.get('orders', []),
  recentlyViewed: LS.get('recent', []),
  products: null,                                   // mutable working copy of DATA.products
  sellers: null,                                    // mutable working copy of DATA.sellers
  shop: { cat: new Set(), brand: new Set(), rating: 0, priceMin: null, priceMax: null, inStock: false, sort: 'relevance', view: 'grid', page: 1, perPage: 9, query: '' },
  checkoutStep: 'address',
  selectedAddressId: null,
  selectedSlot: null,
  selectedPay: 'upi',
  pendingCartItem: null,
  productModalId: null,
  productModalImgIdx: 0,
  chatSellerId: null,
  bookingWorkshopId: null,
  confirmCb: null
};

function persist(key) { LS.set(key, state[key]); }
function initWorkingCopies() {
  state.products = DATA.products.map(p => ({ ...p, status: 'active' }));
  state.sellers = DATA.sellers.map(s => ({ ...s, status: s.verified ? 'Verified' : 'Pending' }));
}

/* --------------------------------- utils --------------------------------- */
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const on = (el, ev, fn, opts) => { if (el) el.addEventListener(ev, fn, opts); };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const uid = p => p + Math.random().toString(36).slice(2, 8);

function debounce(fn, ms) {
  let t; return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}
function inr(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(d) {
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function starIcons(rating, size = '') {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    const off = rating < i - 0.5;
    s += `<svg class="icon ${size} ${off ? 'off' : ''}" style="fill:currentColor"><use href="#i-star"/></svg>`;
  }
  return s;
}
function findProduct(id) { return state.products.find(p => p.id === id); }
function findSeller(id) { return state.sellers.find(s => s.id === id); }
function productImg(p, view) { return p.placeholder ? 'assets/images/ui/placeholder-product.svg' : `assets/images/products/${p.id}-${view}.svg`; }
function initials(name) { return (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

/* toast system */
function toast(msg, opts = {}) {
  const stack = qs('#toastStack');
  if (!stack) return;
  const type = opts.type || 'info';
  const icon = type === 'success' ? 'i-check-circle' : type === 'error' ? 'i-x-circle' : 'i-info';
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<svg class="icon t-icon"><use href="#${icon}"/></svg>
    <div class="t-body">${opts.title ? `<div class="t-title">${esc(opts.title)}</div>` : ''}${esc(msg)}</div>
    <button class="t-close" aria-label="Dismiss"><svg class="icon icon-sm"><use href="#i-close"/></svg></button>`;
  stack.appendChild(el);
  void el.offsetWidth; // force layout so the entrance transition always runs, even if rAF is throttled (e.g. backgrounded tab)
  el.classList.add('show');
  const remove = () => { el.classList.remove('show'); setTimeout(() => el.remove(), 240); };
  on(qs('.t-close', el), 'click', remove);
  setTimeout(remove, opts.duration || 3600);
}

/* ------------------------------ compat engine ----------------------------- */
const FUEL_WORDS = ['petrol', 'diesel', 'cng', 'electric', 'hybrid'];
function fuelFromVariant(variant) {
  const v = (variant || '').toLowerCase();
  return FUEL_WORDS.find(f => v.includes(f)) || '';
}
function ruleMatches(rule, vehicle) {
  if (rule === '*') return true;
  const [makes, models, years, fuels] = rule.split('|');
  if (makes !== '*' && makes !== vehicle.make) return false;
  if (models !== '*' && !models.split(',').includes(vehicle.model)) return false;
  if (years !== '*') {
    const [from, to] = years.split('-').map(Number);
    const y = Number(vehicle.year);
    if (y < from || y > to) return false;
  }
  if (fuels !== '*') {
    const fuel = fuelFromVariant(vehicle.variant);
    if (fuel && !fuels.split(',').map(f => f.toLowerCase()).includes(fuel)) return false;
  }
  return true;
}
/** Returns {state:'compatible'|'unconfirmed'|'universal'|'unknown', label, note} — never asserts a false positive. */
function checkFit(product, vehicle) {
  if (product.universal) {
    return { state: 'universal', label: 'Check your manual', note: 'This is a universal fluid — confirm the grade or spec in your owner\u2019s manual before ordering.' };
  }
  if (!vehicle) {
    return { state: 'unknown', label: 'Set your vehicle to check fit', note: 'Tell us your vehicle to see whether this part is confirmed for it.' };
  }
  const ok = (product.fits || []).some(r => ruleMatches(r, vehicle));
  if (ok) {
    return { state: 'compatible', label: `Compatible with your ${vehicle.make} ${vehicle.model}`, note: 'This exact part is listed as fitting your selected vehicle.' };
  }
  return { state: 'unconfirmed', label: 'Not confirmed for your vehicle', note: 'We don\u2019t have this exact fitment confirmed. Message the seller with your variant before ordering.' };
}
function fitBadgeHtml(fit, compact) {
  if (fit.state === 'compatible') return `<span class="badge badge-good"><svg class="icon"><use href="#i-check-circle"/></svg> ${compact ? 'Compatible' : esc(fit.label)}</span>`;
  if (fit.state === 'universal') return `<span class="badge badge-warn"><svg class="icon"><use href="#i-info"/></svg> Check your manual</span>`;
  if (fit.state === 'unconfirmed') return `<span class="badge badge-warn"><svg class="icon"><use href="#i-alert"/></svg> Not confirmed</span>`;
  return `<span class="badge badge-neutral"><svg class="icon"><use href="#i-car"/></svg> Set vehicle</span>`;
}

/* ============================== RENDER: shared cards ============================== */
function productCardHtml(p) {
  const fit = checkFit(p, state.vehicle);
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const wished = state.wishlist.includes(p.id);
  const compared = state.compare.includes(p.id);
  const stockBadge = p.stock === 0 ? `<span class="badge badge-bad">Out of stock</span>` : p.stock <= 6 ? `<span class="badge badge-warn">Only ${p.stock} left</span>` : '';
  return `<article class="p-card" data-product-id="${p.id}">
    <div class="p-media" data-open-product="${p.id}">
      <img src="${productImg(p, 1)}" alt="${esc(p.name)}" loading="lazy" width="640" height="640">
      <div class="p-badges">${fitBadgeHtml(fit, true)}${stockBadge}</div>
      <button class="p-wish ${wished ? 'active' : ''}" data-wish-toggle="${p.id}" aria-label="${wished ? 'Remove from wishlist' : 'Save to wishlist'}" aria-pressed="${wished}">
        <svg class="icon icon-sm"><use href="#i-heart"/></svg>
      </button>
      <div class="p-quick"><button class="btn btn-primary btn-sm btn-block" data-add-cart="${p.id}" ${p.stock === 0 ? 'disabled' : ''}><svg class="icon icon-sm"><use href="#i-cart"/></svg> Add to cart</button></div>
    </div>
    <div class="p-body" data-open-product="${p.id}">
      <span class="p-brand">${esc(p.brand)}</span>
      <h4 class="p-name">${esc(p.name)}</h4>
      <div class="rating-line"><span class="stars">${starIcons(p.rating, 'icon-sm')}</span><span>${p.rating}</span><span class="faint">(${p.count})</span></div>
      <div class="p-price-row">
        <span class="p-price num">${inr(p.price)}</span>
        ${p.mrp > p.price ? `<span class="p-mrp num">${inr(p.mrp)}</span><span class="p-off">${off}% off</span>` : ''}
      </div>
    </div>
    <div class="p-foot">
      <label class="p-compare"><input type="checkbox" data-compare-toggle="${p.id}" ${compared ? 'checked' : ''}> Compare</label>
      <span class="small">${esc(findSeller(p.seller)?.name || '')}</span>
    </div>
  </article>`;
}
function categoryTileHtml(c) {
  return `<button class="cat-tile" data-cat-open="${c.id}">
    <span class="cat-icon-wrap"><svg class="cat-icon" viewBox="0 0 48 48"><use href="#c-${c.id}"/></svg></span>
    <div><h4>${esc(c.name)}</h4><p>${esc(c.blurb)}</p></div>
  </button>`;
}
function sellerCardHtml(s) {
  return `<article class="p-card" data-seller-open="${s.id}">
    <div class="p-media" style="aspect-ratio:16/8"><img src="assets/images/sellers/${s.id}.svg" alt="${esc(s.name)}" loading="lazy"></div>
    <div class="p-body">
      <div class="flex items-center gap-8">
        <h4 class="p-name" style="min-height:0">${esc(s.name)}</h4>
        ${s.verified ? '<svg class="icon icon-sm accent-text" aria-label="Verified"><use href="#i-badge-check"/></svg>' : ''}
      </div>
      <span class="small">${esc(s.city)} · Since ${s.since}</span>
      <div class="rating-line"><span class="stars">${starIcons(s.rating, 'icon-sm')}</span><span>${s.rating}</span><span class="faint">(${s.reviews})</span></div>
      <p class="small">${esc(s.focus)}</p>
    </div>
    <div class="p-foot"><span class="small">Replies in ~${s.reply}</span><span class="link-arrow small">Visit store <svg class="icon icon-sm"><use href="#i-chevron-right"/></svg></span></div>
  </article>`;
}
function reviewCardHtml(r) {
  return `<article class="review-card">
    <svg class="icon quote-ic"><use href="#i-quote"/></svg>
    <div class="stars">${starIcons(r.rating)}</div>
    <p>"${esc(r.text)}"</p>
    <div class="r-who">
      <div class="r-avatar">${initials(r.name)}</div>
      <div><div class="r-name">${esc(r.name)}</div><div class="r-meta">${esc(r.vehicle)} · ${esc(r.city)}</div></div>
    </div>
  </article>`;
}
function workshopCardHtml(w) {
  return `<article class="w-card">
    <div class="w-top"><h4>${esc(w.name)}</h4><span class="badge badge-good">${w.pickup ? 'Pickup available' : 'Drop-in'}</span></div>
    <span class="w-loc"><svg class="icon icon-sm"><use href="#i-map-pin"/></svg> ${esc(w.area)}, ${esc(w.city)}</span>
    <div class="rating-line"><span class="stars">${starIcons(w.rating, 'icon-sm')}</span><span>${w.rating}</span><span class="faint">(${w.reviews})</span></div>
    <div class="w-services">${w.services.slice(0, 3).map(s => `<span class="chip" style="cursor:default;pointer-events:none;padding:5px 11px;font-size:.76rem">${esc(s)}</span>`).join('')}</div>
    <div class="w-from"><div><span class="small">Starts from</span><div style="font-weight:800" class="num">${inr(w.from)}</div></div><button class="btn btn-primary btn-sm" data-book-workshop="${w.id}">Book slot</button></div>
  </article>`;
}
function blogCardHtml(a, big) {
  return `<article class="b-card" data-blog-open="${a.id}">
    <div class="b-img"><img src="assets/images/blog/${a.id}.svg" alt="${esc(a.title)}" loading="lazy"></div>
    <div class="b-body">
      <span class="b-tag">${esc(a.tag)}</span>
      <h3>${esc(a.title)}</h3>
      ${big ? `<p>${esc(a.excerpt)}</p>` : ''}
      <div class="b-meta"><span>${esc(a.date)}</span><span class="dot-sep"></span><span>${a.read} min read</span></div>
    </div>
  </article>`;
}
function specTableRows(specs) {
  return specs.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('');
}

/* ============================== HOME PAGE ============================== */
function renderHome() {
  qs('#categoryGrid').innerHTML = DATA.categories.map(categoryTileHtml).join('');
  const featured = [...state.products].sort((a, b) => b.count - a.count).slice(0, 6);
  qs('#homeProductGrid').innerHTML = featured.map(productCardHtml).join('');
  qs('#homeWorkshopGrid').innerHTML = DATA.workshops.slice(0, 3).map(workshopCardHtml).join('');
  qs('#reviewsTrack').innerHTML = DATA.reviews.map(reviewCardHtml).join('');
  qs('#brandStrip').innerHTML = DATA.vehicleBrands.map(b => `<div class="brand-cell">${esc(b)}</div>`).join('');
  qs('#homeBlogGrid').innerHTML = DATA.blog.slice(0, 3).map((a, i) => blogCardHtml(a, i === 0)).join('');
  initReveal();
}

function animateStats() {
  qsa('.num[data-count]').forEach(el => {
    if (el.dataset.done) return;
    const target = parseFloat(el.dataset.count);
    const isFloat = String(target).includes('.');
    const dur = 1200; const start = performance.now();
    function tick(now) {
      const p = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick); else el.dataset.done = '1';
    }
    requestAnimationFrame(tick);
  });
}

/* reviews carousel controls */
function initReviewsCarousel() {
  const track = qs('#reviewsTrack');
  if (!track) return;
  on(qs('#reviewNext'), 'click', () => track.scrollBy({ left: 340, behavior: 'smooth' }));
  on(qs('#reviewPrev'), 'click', () => track.scrollBy({ left: -340, behavior: 'smooth' }));
}

/* ============================== SCROLL REVEAL ============================== */
let revealObserver;
function initReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  qsa('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
  qsa('.reveal-stagger').forEach(group => {
    Array.from(group.children).forEach((el, i) => {
      el.classList.add('reveal'); el.style.setProperty('--i', i);
      revealObserver.observe(el);
    });
  });
  animateStats();
}

/* ============================== VEHICLE FINDER ============================== */
const finder = { type: 'car' };
function fillSelect(sel, items, placeholder) {
  sel.innerHTML = `<option value="">${placeholder}</option>` + items.map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('');
  sel.disabled = items.length === 0;
}
function finderMakes() { return Object.keys(DATA.vehicles[finder.type] || {}).sort(); }
function initFinder() {
  const typeTabs = qs('#finderTypeTabs');
  const makeSel = qs('#finderMake'), modelSel = qs('#finderModel'), yearSel = qs('#finderYear'), variantSel = qs('#finderVariant');
  fillSelect(makeSel, finderMakes(), 'Select make');

  on(typeTabs, 'click', (e) => {
    const btn = e.target.closest('button[data-type]'); if (!btn) return;
    qsa('button', typeTabs).forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn); });
    finder.type = btn.dataset.type;
    fillSelect(makeSel, finderMakes(), 'Select make');
    fillSelect(modelSel, [], 'Select model'); fillSelect(yearSel, [], 'Select year'); fillSelect(variantSel, [], 'Select variant');
  });
  on(makeSel, 'change', () => {
    const models = (DATA.vehicles[finder.type][makeSel.value] || []).map(m => m[0]);
    fillSelect(modelSel, models, 'Select model');
    fillSelect(yearSel, [], 'Select year'); fillSelect(variantSel, [], 'Select variant');
  });
  on(modelSel, 'change', () => {
    const rec = (DATA.vehicles[finder.type][makeSel.value] || []).find(m => m[0] === modelSel.value);
    if (!rec) return;
    const years = []; for (let y = rec[2]; y >= rec[1]; y--) years.push(String(y));
    fillSelect(yearSel, years, 'Select year');
    fillSelect(variantSel, rec[3].split('|'), 'Select variant');
  });
  on(qs('#finderForm'), 'submit', (e) => {
    e.preventDefault();
    if (!makeSel.value || !modelSel.value || !yearSel.value || !variantSel.value) { toast('Please select make, model, year and variant.', { type: 'error' }); return; }
    setVehicle({ type: finder.type, make: makeSel.value, model: modelSel.value, year: yearSel.value, variant: variantSel.value });
    navigate('#/shop');
    toast(`Showing parts confirmed for your ${makeSel.value} ${modelSel.value}.`, { type: 'success' });
  });

  initQuickSearch();
}
function setVehicle(v) {
  state.vehicle = v; persist('vehicle');
  const summary = qs('#fitFilterSummary');
  if (summary) summary.textContent = v ? `Showing fit for your ${v.make} ${v.model} (${v.year}).` : 'Showing parts for all vehicles.';
  const clearBtn = qs('#filterClearFit'); if (clearBtn) clearBtn.hidden = !v;
  refreshAllFitBadges();
}
function refreshAllFitBadges() {
  // cheap full re-render of currently visible grids keeps fit badges honest after vehicle changes
  if (currentPage() === 'home') renderHome();
  if (currentPage() === 'shop') renderShopGrid();
  if (qs('#productOverlay').classList.contains('open') && state.productModalId) renderProductModal(state.productModalId);
}

/* quick search with debounced suggestions */
function searchIndex() {
  return state.products.map(p => ({ p, hay: (p.name + ' ' + p.brand + ' ' + p.partNo + ' ' + p.oem + ' ' + p.cat).toLowerCase() }));
}
function runSearch(qStr) {
  const q = qStr.trim().toLowerCase();
  if (!q) return [];
  return searchIndex().filter(x => x.hay.includes(q)).slice(0, 8).map(x => x.p);
}
function highlight(text, q) {
  if (!q) return esc(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
}
function initQuickSearch() {
  const input = qs('#quickSearch'), box = qs('#quickSuggest');
  const doSearch = debounce(() => {
    const q = input.value.trim();
    if (!q) { box.hidden = true; return; }
    const results = runSearch(q);
    box.hidden = false;
    box.innerHTML = results.length ? results.map(p => `
      <div class="s-item" data-open-product="${p.id}">
        <img src="${productImg(p, 1)}" alt="" loading="lazy">
        <div style="flex:1"><div>${highlight(p.name, q)}</div><div class="meta">${esc(p.brand)} · ${esc(p.partNo)}</div></div>
        <span class="num small">${inr(p.price)}</span>
      </div>`).join('') : `<div class="s-empty">No parts match "${esc(q)}" — try a broader term.</div>`;
  }, 220);
  on(input, 'input', doSearch);
  on(input, 'focus', () => { if (input.value.trim()) box.hidden = false; });
  on(document, 'click', (e) => { if (!e.target.closest('.finder-search')) box.hidden = true; });
  on(box, 'click', (e) => {
    const item = e.target.closest('[data-open-product]'); if (!item) return;
    box.hidden = true; input.value = '';
    openProductModal(item.dataset.openProduct);
  });
  on(input, 'keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); state.shop.query = input.value.trim(); navigate('#/shop'); box.hidden = true; }
  });
}

/* ============================== SHOP / MARKETPLACE ============================== */
function shopFilteredList() {
  const s = state.shop;
  let list = state.products.filter(p => p.status !== 'removed');
  if (s.query) { const q = s.query.toLowerCase(); list = list.filter(p => (p.name + p.brand + p.partNo).toLowerCase().includes(q)); }
  if (s.cat.size) list = list.filter(p => s.cat.has(p.cat));
  if (s.brand.size) list = list.filter(p => s.brand.has(p.brand));
  if (s.rating) list = list.filter(p => p.rating >= s.rating);
  if (s.priceMin != null) list = list.filter(p => p.price >= s.priceMin);
  if (s.priceMax != null) list = list.filter(p => p.price <= s.priceMax);
  if (s.inStock) list = list.filter(p => p.stock > 0);
  switch (s.sort) {
    case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
    case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
    case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break;
    case 'new': list = [...list].sort((a, b) => b.id.localeCompare(a.id)); break;
    default: break;
  }
  return list;
}
function buildFilterPanels() {
  const catCounts = {}, brandCounts = {};
  state.products.forEach(p => { catCounts[p.cat] = (catCounts[p.cat] || 0) + 1; brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });
  qs('#catFilterList').innerHTML = DATA.categories.map(c => `
    <label class="f-option"><span class="lbl"><input type="checkbox" data-filter-cat="${c.id}" ${state.shop.cat.has(c.id) ? 'checked' : ''}> ${esc(c.name)}</span><span class="count">${catCounts[c.id] || 0}</span></label>`).join('');
  const brands = Object.keys(brandCounts).sort();
  qs('#brandFilterList').innerHTML = brands.map(b => `
    <label class="f-option"><span class="lbl"><input type="checkbox" data-filter-brand="${esc(b)}" ${state.shop.brand.has(b) ? 'checked' : ''}> ${esc(b)}</span><span class="count">${brandCounts[b]}</span></label>`).join('');
  qs('#ratingFilterList').innerHTML = [4, 3].map(r => `
    <label class="f-option"><span class="lbl"><input type="radio" name="ratingFilter" data-filter-rating="${r}" ${state.shop.rating === r ? 'checked' : ''}> <span class="stars">${starIcons(r, 'icon-sm')}</span> &amp; up</span></label>`).join('')
    + `<label class="f-option"><span class="lbl"><input type="radio" name="ratingFilter" data-filter-rating="0" ${state.shop.rating === 0 ? 'checked' : ''}> Any rating</span></label>`;
}
function renderActiveChips() {
  const chips = [];
  state.shop.cat.forEach(c => chips.push({ label: DATA.categories.find(x => x.id === c)?.name, clear: () => state.shop.cat.delete(c) }));
  state.shop.brand.forEach(b => chips.push({ label: b, clear: () => state.shop.brand.delete(b) }));
  if (state.shop.rating) chips.push({ label: state.shop.rating + '★ & up', clear: () => state.shop.rating = 0 });
  if (state.shop.inStock) chips.push({ label: 'In stock only', clear: () => state.shop.inStock = false });
  if (state.shop.query) chips.push({ label: `"${state.shop.query}"`, clear: () => { state.shop.query = ''; qs('#quickSearch').value = ''; } });
  const wrap = qs('#activeFilters');
  wrap.innerHTML = chips.map((c, i) => `<span class="chip active" data-chip="${i}">${esc(c.label)} <span class="x">✕</span></span>`).join('') +
    (chips.length ? `<button class="chip" id="chipClearAll">Clear all</button>` : '');
  qsa('[data-chip]', wrap).forEach((el, i) => on(el, 'click', () => { chips[i].clear(); state.shop.page = 1; renderShopFull(); }));
  on(qs('#chipClearAll'), 'click', clearAllFilters);
}
function clearAllFilters() {
  state.shop.cat.clear(); state.shop.brand.clear(); state.shop.rating = 0; state.shop.priceMin = null; state.shop.priceMax = null;
  state.shop.inStock = false; state.shop.query = ''; state.shop.page = 1;
  const qi = qs('#quickSearch'); if (qi) qi.value = '';
  renderShopFull();
}
function renderShopGrid() {
  const list = shopFilteredList();
  const shown = list.slice(0, state.shop.page * state.shop.perPage);
  const grid = qs('#shopProductGrid');
  grid.className = 'product-grid' + (state.shop.view === 'list' ? ' list-view' : '');
  grid.innerHTML = shown.map(productCardHtml).join('');
  qs('#resultCount').textContent = `${list.length} part${list.length === 1 ? '' : 's'}`;
  qs('#shopEmpty').hidden = list.length !== 0;
  qs('#loadMoreWrap').style.display = shown.length < list.length ? 'flex' : 'none';
  initReveal();
}
function renderShopFull() {
  buildFilterPanels();
  renderActiveChips();
  renderShopGrid();
}
function initShopPage() {
  const panel = qs('[data-page="shop"]');
  on(panel, 'change', (e) => {
    const t = e.target;
    if (t.matches('[data-filter-cat]')) { t.checked ? state.shop.cat.add(t.dataset.filterCat) : state.shop.cat.delete(t.dataset.filterCat); }
    if (t.matches('[data-filter-brand]')) { t.checked ? state.shop.brand.add(t.dataset.filterBrand) : state.shop.brand.delete(t.dataset.filterBrand); }
    if (t.matches('[data-filter-rating]')) { state.shop.rating = Number(t.dataset.filterRating); }
    if (t.id === 'inStockOnly') state.shop.inStock = t.checked;
    if (t.id === 'priceMin') state.shop.priceMin = t.value ? Number(t.value) : null;
    if (t.id === 'priceMax') state.shop.priceMax = t.value ? Number(t.value) : null;
    if (t.id === 'sortSelect') state.shop.sort = t.value;
    state.shop.page = 1; renderShopFull();
  });
  on(qs('#loadMoreBtn'), 'click', () => { state.shop.page++; renderShopGrid(); });
  on(qs('#viewGridBtn'), 'click', () => { state.shop.view = 'grid'; qs('#viewGridBtn').classList.add('active'); qs('#viewListBtn').classList.remove('active'); renderShopGrid(); });
  on(qs('#viewListBtn'), 'click', () => { state.shop.view = 'list'; qs('#viewListBtn').classList.add('active'); qs('#viewGridBtn').classList.remove('active'); renderShopGrid(); });
  on(qs('#clearAllFilters'), 'click', clearAllFilters);
  on(qs('#filterUseFinder'), 'click', () => { navigate('#/'); setTimeout(() => qs('.finder-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); });
  on(qs('#filterClearFit'), 'click', () => { setVehicle(null); });
  on(qs('#openMobileFilters'), 'click', () => { qs('#filtersPanel').classList.add('open'); qs('#closeMobileFilters').style.display = 'flex'; qs('#applyMobileFilters').style.display = 'block'; });
  const closeMobileFilters = () => qs('#filtersPanel').classList.remove('open');
  on(qs('#closeMobileFilters'), 'click', closeMobileFilters);
  on(qs('#applyMobileFilters'), 'click', closeMobileFilters);
}

/* ============================== PRODUCT MODAL ============================== */
function openOverlay(id) { const el = qs('#' + id); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeOverlay(id) { const el = qs('#' + id); el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); if (!qsa('.overlay.open').length) document.body.style.overflow = ''; }

function openProductModal(id) {
  state.productModalId = id; state.productModalImgIdx = 0;
  renderProductModal(id);
  openOverlay('productOverlay');
  if (!state.recentlyViewed.includes(id)) { state.recentlyViewed.unshift(id); state.recentlyViewed = state.recentlyViewed.slice(0, 12); persist('recentlyViewed'); }
}
function renderProductModal(id) {
  const p = findProduct(id); if (!p) return;
  const seller = findSeller(p.seller);
  const fit = checkFit(p, state.vehicle);
  const cat = DATA.categories.find(c => c.id === p.cat);
  qs('#pmBreadcrumb').textContent = `${cat ? cat.name : ''} / ${p.brand}`;
  const views = [1, 2, 3];
  qs('#pmMainImg').src = productImg(p, views[state.productModalImgIdx]);
  qs('#pmMainImg').alt = p.name;
  qs('#pmThumbs').innerHTML = views.map((v, i) => `<button class="${i === state.productModalImgIdx ? 'active' : ''}" data-thumb="${i}"><img src="${productImg(p, v)}" alt="View ${i + 1}" loading="lazy"></button>`).join('');
  qs('#pmBrand').textContent = p.brand;
  qs('#pmName').textContent = p.name;
  qs('#pmStars').innerHTML = starIcons(p.rating);
  qs('#pmRating').textContent = p.rating;
  qs('#pmReviewCount').textContent = `(${p.count} reviews)`;
  qs('#pmPrice').textContent = inr(p.price);
  qs('#pmMrp').textContent = p.mrp > p.price ? inr(p.mrp) : '';
  qs('#pmOff').textContent = p.mrp > p.price ? `${Math.round((1 - p.price / p.mrp) * 100)}% off` : '';
  const fitBox = qs('#pmFitBox');
  fitBox.className = 'pm-fit-box ' + (fit.state === 'compatible' ? 'ok' : 'unsure');
  fitBox.innerHTML = `<div class="row"><svg class="icon"><use href="#${fit.state === 'compatible' ? 'i-check-circle' : fit.state === 'universal' ? 'i-info' : 'i-alert'}"/></svg>
    <div><b>${esc(fit.label)}</b><p>${esc(fit.note)}</p></div></div>`;
  qs('#pmSellerAvatar').textContent = initials(seller?.name);
  qs('#pmSellerName').textContent = seller?.name || '';
  qs('#pmSellerMeta').textContent = `${seller?.city || ''} · ${seller?.rating || ''}★ · replies in ~${seller?.reply || ''}`;
  qs('#pmSellerLink').onclick = (e) => { e.preventDefault(); closeOverlay('productOverlay'); navigate('#/seller/' + p.seller); };
  qs('#pmQty').textContent = '1';
  qs('#pmWarranty').textContent = p.warranty;
  const wished = state.wishlist.includes(p.id);
  qs('#pmWishBtn').classList.toggle('active', wished);
  qs('#pmWishBtn').setAttribute('aria-pressed', wished);
  qs('#pmCompareBtn').classList.toggle('active', state.compare.includes(p.id));
  qs('#pmSpecTable').innerHTML = specTableRows(p.specs);
  qs('#pmAbout').textContent = p.about;
  qs('#pmFitList').innerHTML = p.universal
    ? `<span class="badge badge-warn"><svg class="icon"><use href="#i-info"/></svg> Universal — confirm spec in your manual</span>`
    : (p.fits.map(r => { const [mk, md] = r.split('|'); return `<span class="badge badge-neutral">${esc(mk)} ${esc(md.replace(/,/g, ', '))}</span>`; }).join('') || '<span class="small">No fitment data listed yet — ask the seller.</span>');
}
function initProductModal() {
  on(qs('#pmThumbs'), 'click', (e) => { const b = e.target.closest('[data-thumb]'); if (!b) return; state.productModalImgIdx = Number(b.dataset.thumb); renderProductModal(state.productModalId); });
  on(qs('#pmQtyMinus'), 'click', () => { const el = qs('#pmQty'); el.textContent = Math.max(1, Number(el.textContent) - 1); });
  on(qs('#pmQtyPlus'), 'click', () => { const el = qs('#pmQty'); el.textContent = Math.min(20, Number(el.textContent) + 1); });
  on(qs('#pmAddToCart'), 'click', () => { addToCart(state.productModalId, Number(qs('#pmQty').textContent)); });
  on(qs('#pmWishBtn'), 'click', () => toggleWishlist(state.productModalId));
  on(qs('#pmCompareBtn'), 'click', () => toggleCompare(state.productModalId));
  on(qs('#pmAskSeller'), 'click', () => { const p = findProduct(state.productModalId); closeOverlay('productOverlay'); openChat(p.seller, p); });
  on(qs('#pmWhatsapp'), 'click', () => { const p = findProduct(state.productModalId); openWhatsapp(`Hi, I'm interested in ${p.name} (Part no. ${p.partNo}) listed on SpareFixer for ${inr(p.price)}. Is it in stock?`); });
  on(qs('#pmTabs'), 'click', (e) => {
    const b = e.target.closest('button[data-tab]'); if (!b) return;
    qsa('button', qs('#pmTabs')).forEach(x => x.classList.toggle('active', x === b));
    qsa('[data-tabpanel]').forEach(p => p.hidden = p.dataset.tabpanel !== b.dataset.tab);
  });
}
function openWhatsapp(msg) { window.open(`https://wa.me/${DATA.brand.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener'); }

/* ============================== WISHLIST / COMPARE ============================== */
function toggleWishlist(id) {
  const i = state.wishlist.indexOf(id);
  if (i === -1) { state.wishlist.push(id); toast('Saved to wishlist', { type: 'success' }); }
  else { state.wishlist.splice(i, 1); toast('Removed from wishlist'); }
  persist('wishlist');
  syncWishUI();
}
function syncWishUI() {
  const n = state.wishlist.length;
  const c = qs('#wishCount'); c.hidden = n === 0; c.textContent = n;
  qsa('[data-wish-toggle]').forEach(btn => { const on_ = state.wishlist.includes(btn.dataset.wishToggle); btn.classList.toggle('active', on_); btn.setAttribute('aria-pressed', on_); });
  if (qs('#pmWishBtn') && state.productModalId) { const w = state.wishlist.includes(state.productModalId); qs('#pmWishBtn').classList.toggle('active', w); }
  if (currentPage() === 'wishlist') renderWishlistPage();
}
function toggleCompare(id) {
  const i = state.compare.indexOf(id);
  if (i === -1) {
    if (state.compare.length >= 4) { toast('You can compare up to 4 parts at a time.', { type: 'error' }); return; }
    state.compare.push(id);
  } else state.compare.splice(i, 1);
  persist('compare');
  syncCompareUI();
}
function syncCompareUI() {
  qsa('[data-compare-toggle]').forEach(cb => cb.checked = state.compare.includes(cb.dataset.compareToggle));
  if (qs('#pmCompareBtn') && state.productModalId) qs('#pmCompareBtn').classList.toggle('active', state.compare.includes(state.productModalId));
  const bar = qs('#compareBar');
  bar.classList.toggle('show', state.compare.length > 0);
  qs('#compareBarCount').textContent = state.compare.length;
  qs('#compareBarThumbs').innerHTML = state.compare.map(id => { const p = findProduct(id); return p ? `<img src="${productImg(p, 1)}" alt="">` : ''; }).join('');
}
function renderCompareModal() {
  const items = state.compare.map(findProduct).filter(Boolean);
  const allSpecs = Array.from(new Set(items.flatMap(p => p.specs.map(s => s[0]))));
  let html = `<thead><tr><th></th>${items.map(p => `<td><img src="${productImg(p, 1)}" alt="${esc(p.name)}"><div style="font-weight:700">${esc(p.name)}</div><div class="small">${esc(p.brand)}</div></td>`).join('')}</tr></thead><tbody>`;
  html += `<tr><th>Price</th>${items.map(p => `<td class="num" style="font-weight:800">${inr(p.price)}</td>`).join('')}</tr>`;
  html += `<tr><th>Rating</th>${items.map(p => `<td>${p.rating}★ (${p.count})</td>`).join('')}</tr>`;
  html += `<tr><th>Warranty</th>${items.map(p => `<td>${esc(p.warranty)}</td>`).join('')}</tr>`;
  html += `<tr><th>Fitment</th>${items.map(p => `<td>${fitBadgeHtml(checkFit(p, state.vehicle), true)}</td>`).join('')}</tr>`;
  allSpecs.forEach(label => { html += `<tr><th>${esc(label)}</th>${items.map(p => { const s = p.specs.find(x => x[0] === label); return `<td>${s ? esc(s[1]) : '—'}</td>`; }).join('')}</tr>`; });
  html += `<tr><th></th>${items.map(p => `<td><button class="btn btn-primary btn-sm" data-add-cart="${p.id}">Add to cart</button></td>`).join('')}</tr>`;
  html += '</tbody>';
  qs('#compareTable').innerHTML = html;
}
function initCompareBar() {
  on(qs('#compareOpenBtn'), 'click', () => { if (state.compare.length < 2) { toast('Add at least 2 parts to compare.', { type: 'error' }); return; } renderCompareModal(); openOverlay('compareOverlay'); });
  on(qs('#compareClearBtn'), 'click', () => { state.compare = []; persist('compare'); syncCompareUI(); });
}

/* ============================== CART ============================== */
function addToCart(id, qty = 1) {
  const p = findProduct(id); if (!p || p.stock === 0) return;
  const item = state.cart.find(c => c.id === id);
  if (item) item.qty = Math.min(20, item.qty + qty); else state.cart.push({ id, qty });
  persist('cart'); syncCartUI();
  toast(`${p.name} added to cart`, { type: 'success', title: 'Added to cart' });
}
function setCartQty(id, qty) {
  const item = state.cart.find(c => c.id === id); if (!item) return;
  if (qty <= 0) { state.cart = state.cart.filter(c => c.id !== id); } else item.qty = Math.min(20, qty);
  persist('cart'); syncCartUI();
}
function removeFromCart(id) { state.cart = state.cart.filter(c => c.id !== id); persist('cart'); syncCartUI(); toast('Removed from cart'); }
function cartLines() { return state.cart.map(c => ({ ...c, p: findProduct(c.id) })).filter(l => l.p); }
function cartSubtotal() { return cartLines().reduce((sum, l) => sum + l.p.price * l.qty, 0); }
function syncCartUI() {
  const n = state.cart.reduce((s, c) => s + c.qty, 0);
  const badge = qs('#cartCount'); badge.hidden = n === 0; badge.textContent = n;
  qs('#cartDrawerCount').textContent = n;
  const lines = cartLines();
  const body = qs('#cartDrawerBody');
  if (!lines.length) {
    body.innerHTML = `<div class="cart-empty"><svg class="icon"><use href="#i-cart"/></svg><p>Your cart is empty.</p><a href="#/shop" class="btn btn-primary btn-sm" data-nav data-close="cartOverlay">Browse parts</a></div>`;
    qs('#cartDrawerFoot').style.display = 'none';
  } else {
    qs('#cartDrawerFoot').style.display = 'block';
    body.innerHTML = lines.map(l => `
      <div class="cart-item" data-cart-line="${l.id}">
        <img src="${productImg(l.p, 1)}" alt="" loading="lazy">
        <div class="ci-info">
          <div class="ci-name">${esc(l.p.name)}</div>
          <div class="ci-meta">${esc(l.p.brand)} · ${inr(l.p.price)}</div>
          <div class="ci-row">
            <div class="pm-qty"><button data-cart-minus="${l.id}" aria-label="Decrease">−</button><span>${l.qty}</span><button data-cart-plus="${l.id}" aria-label="Increase">+</button></div>
            <button class="ci-remove" data-cart-remove="${l.id}">Remove</button>
          </div>
        </div>
      </div>`).join('');
    qs('#cartSubtotal').textContent = inr(cartSubtotal());
  }
  if (currentPage() === 'checkout') renderCheckoutSummary();
}
function initCart() {
  on(qs('#cartDrawerBody'), 'click', (e) => {
    const minus = e.target.closest('[data-cart-minus]'), plus = e.target.closest('[data-cart-plus]'), rm = e.target.closest('[data-cart-remove]');
    if (minus) { const l = state.cart.find(c => c.id === minus.dataset.cartMinus); setCartQty(l.id, l.qty - 1); }
    if (plus) { const l = state.cart.find(c => c.id === plus.dataset.cartPlus); setCartQty(l.id, l.qty + 1); }
    if (rm) removeFromCart(rm.dataset.cartRemove);
  });
  on(qs('#cartCheckoutBtn'), 'click', () => {
    if (!cartLines().length) { toast('Your cart is empty.', { type: 'error' }); return; }
    closeOverlay('cartOverlay'); navigate('#/checkout');
  });
}

/* ============================== CHECKOUT ============================== */
const DELIVERY_FEE = 79, FREE_DELIVERY_OVER = 999;
let appliedCoupon = null;
function checkoutTotals() {
  const sub = cartSubtotal();
  const discount = appliedCoupon ? Math.round(sub * DATA.coupons[appliedCoupon].pct / 100) : 0;
  const delivery = sub === 0 || sub - discount >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const total = sub - discount + delivery;
  return { sub, discount, delivery, total };
}
function renderCheckoutSummary() {
  const items = qs('#checkoutSummaryItems'), totalsEl = qs('#checkoutSummaryTotals');
  if (!items) return;
  items.innerHTML = cartLines().map(l => `<div class="summary-row"><span>${esc(l.p.name)} × ${l.qty}</span><span class="num">${inr(l.p.price * l.qty)}</span></div>`).join('');
  const t = checkoutTotals();
  totalsEl.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span class="num">${inr(t.sub)}</span></div>
    ${appliedCoupon ? `<div class="summary-row discount"><span>Coupon ${appliedCoupon}</span><span class="num">−${inr(t.discount)}</span></div>` : ''}
    <div class="summary-row"><span>Delivery</span><span class="num">${t.delivery === 0 ? 'Free' : inr(t.delivery)}</span></div>
    <div class="summary-row total"><span>Total</span><span class="num">${inr(t.total)}</span></div>`;
  const sumItems = qs('#reviewItems');
  if (sumItems) sumItems.innerHTML = cartLines().map(l => `
    <div class="cart-item"><img src="${productImg(l.p, 1)}" alt="" loading="lazy"><div class="ci-info"><div class="ci-name">${esc(l.p.name)}</div><div class="ci-meta">Qty ${l.qty} · ${inr(l.p.price)} each</div></div><div class="num" style="font-weight:700">${inr(l.p.price * l.qty)}</div></div>`).join('');
}
function goCheckoutStep(step) {
  state.checkoutStep = step;
  qsa('#checkoutSteps .step').forEach(s => {
    const order = ['address', 'delivery', 'payment', 'review'];
    s.classList.toggle('active', s.dataset.step === step);
    s.classList.toggle('done', order.indexOf(s.dataset.step) < order.indexOf(step));
  });
  qsa('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== step);
  qs('.checkout-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderAddressList() {
  const wrap = qs('#addressList'); if (!wrap) return;
  if (!state.addresses.length) { wrap.innerHTML = `<p class="small">No saved addresses yet — add one below.</p>`; return; }
  wrap.innerHTML = state.addresses.map(a => `
    <div class="addr-card ${state.selectedAddressId === a.id ? 'selected' : ''}" data-select-addr="${a.id}">
      <b>${esc(a.name)}</b> <span class="small">${esc(a.phone)}</span>
      <p class="small" style="margin-top:6px">${esc(a.line)}, ${esc(a.city)} – ${esc(a.pin)}</p>
      ${state.selectedAddressId === a.id ? `<span class="tag badge badge-accent">Selected</span>` : ''}
    </div>`).join('');
}
function renderDeliverySlots() {
  const wrap = qs('#deliverySlots'); if (!wrap) return;
  const slots = [];
  const days = ['Today', 'Tomorrow']; const now = new Date();
  for (let i = 2; i < 5; i++) { const d = new Date(now); d.setDate(d.getDate() + i); days.push(d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })); }
  const times = ['9 AM–12 PM', '12–4 PM', '4–8 PM'];
  days.forEach((d, di) => times.forEach((t, ti) => { const key = d + '|' + t; const disabled = di === 0 && ti === 0; slots.push({ key, label: `${d}, ${t}`, disabled }); }));
  wrap.innerHTML = slots.slice(0, 8).map(s => `<button type="button" class="slot-btn ${state.selectedSlot === s.key ? 'selected' : ''}" data-slot="${s.key}" ${s.disabled ? 'disabled' : ''}>${esc(s.label)}</button>`).join('');
}
function initCheckoutPage() {
  const page = qs('[data-page="checkout"]');
  on(qs('#addAddressBtn'), 'click', () => qs('#newAddressForm').hidden = !qs('#newAddressForm').hidden);
  on(qs('#addressList'), 'click', (e) => { const c = e.target.closest('[data-select-addr]'); if (!c) return; state.selectedAddressId = c.dataset.selectAddr; renderAddressList(); });
  on(qs('#toDeliveryBtn'), 'click', () => {
    if (!state.selectedAddressId && !qs('#addrLine').value.trim()) { toast('Add or select a delivery address.', { type: 'error' }); return; }
    if (!state.selectedAddressId && qs('#addrLine').value.trim()) {
      const a = { id: uid('addr_'), name: qs('#addrName').value || 'Customer', phone: qs('#addrPhone').value, line: qs('#addrLine').value, city: qs('#addrCity').value, pin: qs('#addrPin').value };
      state.addresses.push(a); state.selectedAddressId = a.id; persist('addresses'); renderAddressList();
    }
    goCheckoutStep('delivery');
  });
  on(qs('#deliverySlots'), 'click', (e) => { const b = e.target.closest('[data-slot]'); if (!b || b.disabled) return; state.selectedSlot = b.dataset.slot; renderDeliverySlots(); });
  on(qs('#toPaymentBtn'), 'click', () => { if (!state.selectedSlot) { toast('Choose a delivery slot.', { type: 'error' }); return; } goCheckoutStep('payment'); });
  on(qs('#payOptions'), 'click', (e) => { const opt = e.target.closest('.pay-opt'); if (!opt) return; qsa('.pay-opt', page).forEach(o => o.classList.toggle('selected', o === opt)); state.selectedPay = qs('input', opt).value; });
  on(qs('#toReviewBtn'), 'click', () => { renderCheckoutSummary(); goCheckoutStep('review'); });
  on(qs('#checkoutCouponBtn'), 'click', () => {
    const code = qs('#checkoutCoupon').value.trim().toUpperCase();
    if (DATA.coupons[code]) { appliedCoupon = code; toast(`Coupon applied: ${DATA.coupons[code].label}`, { type: 'success' }); } else { toast('Invalid coupon code.', { type: 'error' }); }
    renderCheckoutSummary();
  });
  on(qs('#placeOrderBtn'), 'click', placeOrder);
}
function initCheckoutPageEnter() {
  if (!cartLines().length) { navigate('#/shop'); toast('Add a part to your cart before checking out.', { type: 'error' }); return; }
  appliedCoupon = null;
  state.selectedAddressId = state.addresses[0]?.id || null;
  state.selectedSlot = null;
  goCheckoutStep('address');
  renderAddressList(); renderDeliverySlots(); renderCheckoutSummary();
}

/* order placement with the required multi-stage processing animation */
const ORDER_STEPS = [
  { key: 'processing', label: 'Processing order…' },
  { key: 'payment', label: 'Verifying payment…' },
  { key: 'inventory', label: 'Confirming inventory…' },
  { key: 'placing', label: 'Placing order…' },
  { key: 'done', label: 'Order placed!' }
];
function placeOrder() {
  const overlay = qs('#orderProcessing'), ring = qs('#opRing'), status = qs('#opStatus'), sub = qs('#opSub');
  overlay.classList.add('show');
  ring.className = 'op-ring'; ring.innerHTML = '';
  qsa('.op-step', overlay).forEach(s => s.classList.remove('active', 'done'));
  let i = 0;
  function step() {
    if (i > 0) qs(`.op-step[data-op="${ORDER_STEPS[i - 1].key}"]`).classList.replace('active', 'done'), qs(`.op-step[data-op="${ORDER_STEPS[i - 1].key}"] .dot`).innerHTML = '<svg class="icon"><use href="#i-check"/></svg>';
    if (i >= ORDER_STEPS.length) {
      ring.classList.add('done'); ring.innerHTML = '<svg class="icon"><use href="#i-check"/></svg>';
      status.textContent = 'Order placed!'; sub.textContent = 'Redirecting you to order tracking…';
      const order = createOrder();
      setTimeout(() => { overlay.classList.remove('show'); navigate('#/track/' + order.id); }, 900);
      return;
    }
    const s = ORDER_STEPS[i];
    qs(`.op-step[data-op="${s.key}"]`).classList.add('active');
    status.textContent = s.label; sub.textContent = "Please don't close this window.";
    i++; setTimeout(step, s.key === 'done' ? 500 : 800 + Math.random() * 400);
  }
  step();
}
function createOrder() {
  const t = checkoutTotals();
  const addr = state.addresses.find(a => a.id === state.selectedAddressId);
  const order = {
    id: 'SPF-' + Math.floor(10000 + Math.random() * 89999),
    items: cartLines().map(l => ({ id: l.p.id, name: l.p.name, qty: l.qty, price: l.p.price, img: productImg(l.p, 1) })),
    total: t.total, address: addr || null, slot: state.selectedSlot, pay: state.selectedPay,
    status: 'Placed', createdAt: Date.now()
  };
  state.orders.unshift(order); persist('orders');
  state.cart = []; persist('cart'); syncCartUI();
  return order;
}

/* ============================== DEMO ORDER SEED (for tracking + dashboards) ============================== */
const CUSTOMER_NAMES = ['Karthik Raman', 'Priya Nair', 'Aditya Sharma', 'Meera Iyer', 'Faisal Khan', 'Lakshmi Venkat', 'Rohan Deshmukh', 'Sunita Patel', 'Arjun Menon', 'Neha Kulkarni', 'Vikram Singh', 'Deepa Krishnan', 'Sanjay Gupta', 'Ritu Bhatia', 'Manoj Pillai', 'Anjali Reddy', 'Suresh Kumar', 'Divya Shah'];
const CUSTOMER_CITIES = ['Chennai', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Pune', 'New Delhi', 'Kolkata', 'Ahmedabad', 'Coimbatore', 'Kochi'];
const ORDER_STATUS_FLOW = ['Placed', 'Packed', 'Shipped', 'Delivered'];
function seedRandom(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function buildDemoOrders() {
  const rand = seedRandom(42);
  const orders = [];
  for (let i = 0; i < 46; i++) {
    const daysAgo = Math.floor(rand() * 45);
    const createdAt = Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000);
    const n = 1 + Math.floor(rand() * 3);
    const items = []; let total = 0;
    for (let j = 0; j < n; j++) {
      const p = DATA.products[Math.floor(rand() * DATA.products.length)];
      const qty = 1 + Math.floor(rand() * 2);
      items.push({ id: p.id, name: p.name, qty, price: p.price, seller: p.seller });
      total += p.price * qty;
    }
    let status;
    if (daysAgo > 4) status = rand() < 0.06 ? 'Cancelled' : 'Delivered';
    else if (daysAgo > 2) status = 'Shipped';
    else if (daysAgo > 1) status = 'Packed';
    else status = 'Placed';
    orders.push({
      id: 'SPF-' + (20000 + i * 137 + Math.floor(rand() * 90)),
      sellerId: items[0].seller,
      customerName: CUSTOMER_NAMES[Math.floor(rand() * CUSTOMER_NAMES.length)],
      customerCity: CUSTOMER_CITIES[Math.floor(rand() * CUSTOMER_CITIES.length)],
      items, total: Math.round(total * (0.95 + rand() * 0.1)),
      status, createdAt
    });
  }
  orders.unshift({
    id: 'SPF-48213', sellerId: 's1', customerName: state.user?.name || 'Demo Customer', customerCity: 'Chennai',
    items: [{ id: 'p01', name: 'Ceramic Front Brake Pad Set', qty: 1, price: 2450, seller: 's1' }],
    total: 2529, status: 'Shipped', createdAt: Date.now() - 30 * 3600000
  });
  return orders;
}
function getDemoOrders() {
  if (!state.demoOrders) { state.demoOrders = LS.get('demoOrders', null) || buildDemoOrders(); LS.set('demoOrders', state.demoOrders); }
  return state.demoOrders;
}

/* ============================== ORDER TRACKING ============================== */
const TRACK_STAGES = [
  { key: 'Placed', label: 'Order placed', offsetH: 0, desc: 'We\u2019ve received your order and notified the seller.' },
  { key: 'Packed', label: 'Packed', offsetH: 5, desc: 'Your items have been packed and are ready for pickup.' },
  { key: 'Shipped', label: 'Shipped', offsetH: 22, desc: 'Your order has left the seller\u2019s facility.' },
  { key: 'Out for delivery', label: 'Out for delivery', offsetH: 44, desc: 'Your order is out with the delivery partner.' },
  { key: 'Delivered', label: 'Delivered', offsetH: 50, desc: 'Delivered. We hope it\u2019s the right fit.' }
];
function findAnyOrder(id) {
  return state.orders.find(o => o.id === id) || getDemoOrders().find(o => o.id === id);
}
function renderTrackResult(order) {
  const wrap = qs('#trackResult');
  if (!order) { wrap.innerHTML = `<div class="empty-state"><svg class="icon"><use href="#i-search"/></svg><h3>No order found</h3><p>Double check the order ID, or try the sample ID <b>SPF-48213</b>.</p></div>`; return; }
  if (order.status === 'Cancelled') {
    wrap.innerHTML = `<div class="card card-pad"><div class="badge badge-bad" style="margin-bottom:12px">Cancelled</div><p>Order <b>${esc(order.id)}</b> was cancelled. Contact support if this seems wrong.</p></div>`;
    return;
  }
  const now = Date.now();
  const doneUpTo = order.status === 'Delivered' ? 4 : ORDER_STATUS_FLOW.indexOf(order.status);
  let html = `<div class="card card-pad" style="margin-bottom:20px">
    <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:10px">
      <div><b class="num">${esc(order.id)}</b><p class="small">Placed ${fmtDateTime(order.createdAt)}</p></div>
      <span class="badge badge-accent">${esc(order.status)}</span>
    </div>
  </div><div class="card card-pad"><div class="track-timeline">`;
  TRACK_STAGES.forEach((s, i) => {
    const done = i <= doneUpTo;
    const active = i === doneUpTo + 1 && order.status !== 'Delivered' && i <= doneUpTo + 1 && !done;
    const isNext = i === clamp(doneUpTo + 1, 0, 4) && !done;
    const scheduled = order.createdAt + s.offsetH * 3600000;
    html += `<div class="t-step ${done ? 'done' : isNext ? 'active' : ''}"><span class="t-line"></span>
      <span class="t-dot">${done ? '<svg class="icon icon-sm"><use href="#i-check"/></svg>' : `<span style="font-size:.7rem;font-weight:800">${i + 1}</span>`}</span>
      <div><div class="t-title">${esc(s.label)}</div><div class="t-time">${done ? fmtDateTime(scheduled) : isNext ? 'Expected ' + fmtDateTime(scheduled) : fmtDateTime(scheduled)}</div><p>${esc(s.desc)}</p></div>
    </div>`;
  });
  html += '</div></div>';
  if (order.items) {
    html += `<div class="card card-pad" style="margin-top:20px"><h4 style="margin-bottom:12px">Items</h4>` +
      order.items.map(it => `<div class="summary-row"><span>${esc(it.name)} × ${it.qty}</span><span class="num">${inr(it.price * it.qty)}</span></div>`).join('') +
      `<div class="summary-row total"><span>Total</span><span class="num">${inr(order.total)}</span></div></div>`;
  }
  wrap.innerHTML = html;
}
function initTrackPage() {
  on(qs('#trackBtn'), 'click', doTrack);
  on(qs('#trackInput'), 'keydown', (e) => { if (e.key === 'Enter') doTrack(); });
  function doTrack() {
    const id = qs('#trackInput').value.trim().toUpperCase();
    if (!id) { toast('Enter an order ID.', { type: 'error' }); return; }
    renderTrackResult(findAnyOrder(id));
  }
}
function enterTrackPage(param) {
  if (param) { qs('#trackInput').value = param; renderTrackResult(findAnyOrder(param)); }
  else if (state.orders[0]) { qs('#trackInput').value = state.orders[0].id; renderTrackResult(state.orders[0]); }
  else { qs('#trackInput').value = ''; qs('#trackResult').innerHTML = `<div class="empty-state"><svg class="icon"><use href="#i-truck"/></svg><p>Enter an order ID to see live tracking, or try the sample ID <b>SPF-48213</b>.</p></div>`; }
}

/* ============================== WISHLIST PAGE ============================== */
function renderWishlistPage() {
  const items = state.wishlist.map(findProduct).filter(Boolean);
  qs('#wishlistGrid').innerHTML = items.map(productCardHtml).join('');
  qs('#wishlistEmpty').hidden = items.length !== 0;
}

/* ============================== SELLERS DIRECTORY + PROFILE ============================== */
function renderSellersPage() { qs('#sellerGrid').innerHTML = state.sellers.map(sellerCardHtml).join(''); initReveal(); }
function renderSellerProfile(id) {
  const s = findSeller(id); if (!s) { navigate('#/sellers'); return; }
  qs('#sellerBannerImg').src = `assets/images/sellers/${s.id}.svg`;
  qs('#sellerAvatar').textContent = initials(s.name);
  qs('#sellerName').textContent = s.name;
  qs('#sellerVerifiedBadge').style.display = s.verified ? 'inline-flex' : 'none';
  qs('#sellerCity').textContent = s.city;
  qs('#sellerRating').textContent = `${s.rating} (${s.reviews} reviews)`;
  qs('#sellerReply').textContent = s.reply;
  qs('#sellerSince').textContent = s.since;
  qs('#sellerAbout').textContent = s.about;
  qs('#sellerMessageBtn').onclick = () => openChat(s.id);
  const items = state.products.filter(p => p.seller === s.id);
  qs('#sellerProductGrid').innerHTML = items.map(productCardHtml).join('');
  initReveal();
}

/* ============================== AUTH ============================== */
const auth = { tab: 'login', role: 'customer' };
function updateAccountBtn() {
  const label = qs('#accountBtnLabel');
  const mLabel = qs('#mobileAccountLabel');
  const text = state.user ? state.user.name.split(' ')[0] : 'Sign in';
  if (label) label.textContent = text;
  if (mLabel) mLabel.textContent = text;
}
function openAuth(role) {
  auth.role = role || 'customer'; auth.tab = 'login';
  qs('#authTitle').textContent = 'Welcome back';
  qsa('.auth-tabs button').forEach(b => b.classList.toggle('active', b.dataset.authTab === 'login'));
  qs('#authNameField').hidden = true;
  qs('#authSubmitBtn').textContent = 'Sign in';
  qsa('.auth-role', qs('#authRoleRow')).forEach(b => b.classList.toggle('active', b.dataset.role === auth.role));
  qs('#authDemoRole').textContent = auth.role;
  openOverlay('authOverlay');
}
function initAuth() {
  on(qs('#accountBtn'), 'click', () => { if (state.user) openAccountMenu(); else openAuth('customer'); });
  on(qs('#mobileAccountBtn'), 'click', () => { qs('#mobileNav').classList.remove('open'); if (state.user) openAccountMenu(); else openAuth('customer'); });
  on(qs('#authRoleRow'), 'click', (e) => { const b = e.target.closest('.auth-role'); if (!b) return; auth.role = b.dataset.role; qsa('.auth-role', e.currentTarget).forEach(x => x.classList.toggle('active', x === b)); qs('#authDemoRole').textContent = auth.role; });
  on(qs('.auth-tabs'), 'click', (e) => {
    const b = e.target.closest('button[data-auth-tab]'); if (!b) return;
    auth.tab = b.dataset.authTab;
    qsa('.auth-tabs button').forEach(x => x.classList.toggle('active', x === b));
    qs('#authNameField').hidden = auth.tab !== 'register';
    qs('#authSubmitBtn').textContent = auth.tab === 'register' ? 'Create account' : 'Sign in';
    qs('#authTitle').textContent = auth.tab === 'register' ? 'Create your account' : 'Welcome back';
  });
  on(qs('#authForm'), 'submit', (e) => {
    e.preventDefault();
    const email = qs('#authEmail').value.trim();
    const name = qs('#authName').value.trim() || email.split('@')[0] || 'Customer';
    signIn({ name, email, role: auth.role, city: 'Chennai', sellerId: auth.role === 'seller' ? 's1' : undefined });
  });
  on(qs('#authDemoBtn'), 'click', () => { const acc = DATA.demoAccounts[auth.role]; signIn({ ...acc }); });
}
function signIn(user) {
  state.user = user; persist('user');
  closeOverlay('authOverlay'); updateAccountBtn();
  toast(`Signed in as ${user.name}`, { type: 'success' });
  if (user.role === 'seller') navigate('#/seller-dashboard');
  else if (user.role === 'admin') navigate('#/admin');
}
function signOut() { state.user = null; persist('user'); updateAccountBtn(); navigate('#/'); toast('Signed out'); }
function openAccountMenu() {
  if (state.user.role === 'seller') { navigate('#/seller-dashboard'); return; }
  if (state.user.role === 'admin') { navigate('#/admin'); return; }
  navigate('#/wishlist');
}
function requireRole(role) {
  if (!state.user || state.user.role !== role) { openAuth(role); toast(`Sign in with a ${role} account to view this page.`); return false; }
  return true;
}

/* ============================== WORKSHOPS + BOOKING ============================== */
function renderWorkshopsPage() { qs('#workshopGrid').innerHTML = DATA.workshops.map(workshopCardHtml).join(''); initReveal(); }
function openBooking(id) {
  const w = DATA.workshops.find(x => x.id === id); if (!w) return;
  state.bookingWorkshopId = id;
  qs('#bookWorkshopAvatar').textContent = initials(w.name);
  qs('#bookWorkshopName').textContent = w.name;
  qs('#bookWorkshopLoc').textContent = `${w.area}, ${w.city}`;
  qs('#bookServiceType').innerHTML = w.services.map(s => `<option>${esc(s)}</option>`).join('');
  qs('#bookDate').min = new Date().toISOString().slice(0, 10);
  qs('#bookDate').value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  qs('#bookTimeSlots').innerHTML = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '6:30 PM'].map((t, i) => `<button type="button" class="slot-btn" data-book-slot="${t}">${t}</button>`).join('');
  qs('#bookPickup').checked = false; qs('#bookPhone').value = '';
  openOverlay('bookingOverlay');
}
function initBooking() {
  on(qs('#bookTimeSlots'), 'click', (e) => { const b = e.target.closest('[data-book-slot]'); if (!b) return; qsa('[data-book-slot]').forEach(x => x.classList.toggle('selected', x === b)); });
  on(qs('#bookConfirmBtn'), 'click', () => {
    const slot = qs('.slot-btn.selected'); 
    if (!slot) { toast('Pick a time slot.', { type: 'error' }); return; }
    if (!qs('#bookPhone').value.trim()) { toast('Add a phone number so the workshop can reach you.', { type: 'error' }); return; }
    closeOverlay('bookingOverlay');
    toast(`Booked for ${qs('#bookDate').value} at ${slot.textContent}. The workshop will confirm shortly.`, { type: 'success', title: 'Booking requested' });
  });
}

/* ============================== CHAT / ENQUIRY (mock) ============================== */
const CHAT_AUTOREPLIES = [
  "Thanks for reaching out — yes, this is currently in stock.",
  "Good question. Could you share your exact variant so I can double check fitment?",
  "That ships within 1–2 business days from our Chennai warehouse.",
  "We can offer a small discount on 2 or more units — want me to apply that?",
  "Yes, it comes with the standard warranty listed on the page."
];
function openChat(sellerId, product) {
  const s = findSeller(sellerId); if (!s) return;
  state.chatSellerId = sellerId;
  qs('#chatAvatar').textContent = initials(s.name);
  qs('#chatSellerName').textContent = s.name;
  qs('#chatStatus').textContent = 'Typically replies in ~' + s.reply;
  const body = qs('#chatBody');
  const opener = product ? `Hi! I saw your listing for <b>${esc(product.name)}</b>. Ask me anything about fit, stock or delivery.` : `Hi! Ask me anything about fit, stock or delivery.`;
  body.innerHTML = `<div class="msg them">${opener}</div><div class="msg-time">Just now</div>`;
  openOverlay('chatOverlay');
  qs('#chatInput').focus();
}
function initChat() {
  on(qs('#chatForm'), 'submit', (e) => {
    e.preventDefault();
    const input = qs('#chatInput'); const text = input.value.trim(); if (!text) return;
    const body = qs('#chatBody');
    body.insertAdjacentHTML('beforeend', `<div class="msg me">${esc(text)}</div><div class="msg-time">Just now</div>`);
    input.value = ''; body.scrollTop = body.scrollHeight;
    const typing = document.createElement('div'); typing.className = 'msg them'; typing.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    setTimeout(() => { body.appendChild(typing); body.scrollTop = body.scrollHeight; }, 350);
    setTimeout(() => {
      typing.remove();
      const reply = CHAT_AUTOREPLIES[Math.floor(Math.random() * CHAT_AUTOREPLIES.length)];
      body.insertAdjacentHTML('beforeend', `<div class="msg them">${esc(reply)}</div><div class="msg-time">Just now</div>`);
      body.scrollTop = body.scrollHeight;
    }, 1300);
  });
}

/* ============================== QUOTE / BULK ORDER ============================== */
function initQuoteBulk() {
  on(qs('#quoteForm'), 'submit', (e) => {
    e.preventDefault();
    closeOverlay('quoteOverlay'); e.target.reset();
    toast('Your quotation request has been sent. A team member will reply within a business day.', { type: 'success', title: 'Request sent' });
  });
  function bulkRow() {
    return `<div class="bulk-row">
      <div class="field"><label>Part name or number</label><input class="input" data-bulk-part placeholder="e.g. Brake pads, Swift 2019"></div>
      <div class="field"><label>Quantity</label><input class="input" type="number" min="1" value="10" data-bulk-qty></div>
      <div class="field"><label>Target price</label><input class="input" placeholder="Optional" data-bulk-price></div>
      <button class="btn-icon sm" data-bulk-remove aria-label="Remove row" style="margin-bottom:2px"><svg class="icon icon-sm"><use href="#i-trash"/></svg></button>
    </div>`;
  }
  const rowsWrap = qs('#bulkRows');
  function resetBulkRows() { rowsWrap.innerHTML = bulkRow() + bulkRow(); }
  resetBulkRows();
  on(qs('#bulkAddRow'), 'click', () => rowsWrap.insertAdjacentHTML('beforeend', bulkRow()));
  on(rowsWrap, 'click', (e) => { const b = e.target.closest('[data-bulk-remove]'); if (!b) return; if (qsa('.bulk-row', rowsWrap).length > 1) b.closest('.bulk-row').remove(); });
  on(qs('#bulkSubmitBtn'), 'click', () => {
    if (!qs('#bulkBusiness').value.trim()) { toast('Add your business or workshop name.', { type: 'error' }); return; }
    closeOverlay('bulkOverlay'); resetBulkRows(); qs('#bulkBusiness').value = ''; qs('#bulkGst').value = '';
    toast('Bulk order request submitted. Expect a discounted quote within a business day.', { type: 'success', title: 'Request sent' });
  });
  on(qs('#footerBulkLink'), 'click', (e) => { e.preventDefault(); openOverlay('bulkOverlay'); });
  on(qs('#footerContactLink'), 'click', (e) => { e.preventDefault(); openOverlay('quoteOverlay'); });
  on(qs('#footerReturnsLink'), 'click', (e) => { e.preventDefault(); toast('Returns are accepted within 7 days of delivery for unused parts in original packaging.'); });
  on(qs('#footerFaqLink'), 'click', (e) => { e.preventDefault(); toast('This is a frontend demo — a full FAQ page would live here.'); });
  on(qs('#footerPrivacyLink'), 'click', (e) => { e.preventDefault(); toast('This is a frontend demo — a privacy policy would live here.'); });
  on(qs('#footerTermsLink'), 'click', (e) => { e.preventDefault(); toast('This is a frontend demo — terms of service would live here.'); });
}

/* ============================== BLOG ============================== */
function renderBlogListPage() { qs('#blogListGrid').innerHTML = DATA.blog.map((a, i) => blogCardHtml(a, i === 0)).join(''); initReveal(); }
function renderArticlePage(id) {
  const a = DATA.blog.find(x => x.id === id); if (!a) { navigate('#/blog'); return; }
  qs('#articleTag').textContent = a.tag;
  qs('#articleTitle').textContent = a.title;
  qs('#articleMeta').textContent = `${a.date} · ${a.read} min read`;
  qs('#articleCover').src = `assets/images/blog/${a.id}.svg`;
  qs('#articleCover').alt = a.title;
  qs('#articleBody').innerHTML = a.body.map(p => `<p>${esc(p)}</p>`).join('');
  qs('#articleMoreGrid').innerHTML = DATA.blog.filter(x => x.id !== id).slice(0, 3).map(x => blogCardHtml(x, false)).join('');
  window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  initReveal();
}

/* ============================== GENERIC TABLE HELPERS ============================== */
function paginate(list, page, perPage) {
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  page = clamp(page, 1, totalPages);
  return { items: list.slice((page - 1) * perPage, page * perPage), page, totalPages };
}
function renderPagination(el, page, totalPages, onPage) {
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  let pages = [];
  for (let i = 1; i <= totalPages; i++) if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i); else if (pages[pages.length - 1] !== '…') pages.push('…');
  el.innerHTML = `<span class="small">Page ${page} of ${totalPages}</span><div class="pages">
    <button data-pg="prev" ${page === 1 ? 'disabled' : ''}><svg class="icon icon-sm"><use href="#i-chevron-left"/></svg></button>
    ${pages.map(p => p === '…' ? `<span style="padding:0 4px;color:var(--ink-faint)">…</span>` : `<button data-pg="${p}" class="${p === page ? 'active' : ''}">${p}</button>`).join('')}
    <button data-pg="next" ${page === totalPages ? 'disabled' : ''}><svg class="icon icon-sm"><use href="#i-chevron-right"/></svg></button>
  </div>`;
  qsa('[data-pg]', el).forEach(b => on(b, 'click', () => {
    const v = b.dataset.pg; onPage(v === 'prev' ? page - 1 : v === 'next' ? page + 1 : Number(v));
  }));
}
function sortIcon(active, dir) { return active ? `<svg class="icon sort-ic" style="opacity:1"><use href="#i-${dir === 1 ? 'chevron-up' : 'chevron-down'}"/></svg>` : `<svg class="icon sort-ic"><use href="#i-chevron-down"/></svg>`; }
function sortRows(rows, key, dir) {
  if (!key) return rows;
  return [...rows].sort((a, b) => {
    let av = typeof key === 'function' ? key(a) : a[key], bv = typeof key === 'function' ? key(b) : b[key];
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
}

/* generic confirm dialog */
function askConfirm({ title, body, danger = true, confirmLabel = 'Confirm', onConfirm }) {
  qs('#confirmTitle').textContent = title;
  qs('#confirmBody').textContent = body;
  qs('#confirmActionBtn').textContent = confirmLabel;
  qs('#confirmActionBtn').className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  const wrap = qs('#confirmIconWrap');
  wrap.style.background = danger ? 'var(--bad-wash)' : 'var(--accent-wash)';
  qs('#confirmIcon').style.color = danger ? 'var(--bad)' : 'var(--accent)';
  state.confirmCb = onConfirm;
  openOverlay('confirmOverlay');
}
function initConfirmModal() {
  on(qs('#confirmActionBtn'), 'click', () => { const cb = state.confirmCb; closeOverlay('confirmOverlay'); if (cb) cb(); });
}
function statusBadge(status) {
  const map = { Delivered: 'good', Verified: 'good', Active: 'good', Published: 'good', Approved: 'good',
    Placed: 'accent', Packed: 'accent', Shipped: 'accent', Pending: 'warn', Flagged: 'warn',
    Cancelled: 'bad', Suspended: 'bad', Removed: 'bad', Rejected: 'bad' };
  return `<span class="badge badge-${map[status] || 'neutral'}">${esc(status)}</span>`;
}

/* ============================== SELLER DASHBOARD ============================== */
const sellerDash = { tab: 'overview', prodSearch: '', prodPage: 1, orderSearch: '', orderStatus: '', orderPage: 1, custSearch: '' };
function currentSellerId() { return state.user?.sellerId || 's1'; }
function sellerOrders() { return getDemoOrders().filter(o => o.sellerId === currentSellerId()); }
function sellerProducts() { return state.products.filter(p => p.seller === currentSellerId() && p.status !== 'removed'); }

function renderSellerKpis() {
  const orders = sellerOrders();
  const last30 = orders.filter(o => o.createdAt > Date.now() - 30 * 86400000 && o.status !== 'Cancelled');
  const revenue = last30.reduce((s, o) => s + o.total, 0);
  const products = sellerProducts();
  const avgRating = (products.reduce((s, p) => s + p.rating, 0) / (products.length || 1)).toFixed(1);
  const cards = [
    { icon: 'i-banknote', label: 'Revenue (30 days)', val: inr(revenue), delta: '+12.4%', up: true },
    { icon: 'i-inbox', label: 'Orders (30 days)', val: last30.length, delta: '+6.1%', up: true },
    { icon: 'i-package', label: 'Active listings', val: products.length, delta: `${products.filter(p => p.stock <= 6).length} low stock`, up: null },
    { icon: 'i-star', label: 'Average rating', val: avgRating + '★', delta: 'Across ' + products.length + ' products', up: null }
  ];
  qs('#sellerKpis').innerHTML = cards.map(c => `<div class="kpi-card"><div class="k-top"><span class="icon-wrap"><svg class="icon icon-sm"><use href="#${c.icon}"/></svg></span>
    ${c.up === null ? '' : `<span class="k-delta ${c.up ? 'up' : 'down'}"><svg class="icon icon-sm"><use href="#i-trending-${c.up ? 'up' : 'down'}"/></svg>${c.delta}</span>`}</div>
    <div class="k-val num">${c.val}</div><div class="k-label">${c.up === null ? c.delta : c.label}</div></div>`).join('');
}
function renderSellerCharts() {
  const orders = sellerOrders().filter(o => o.status !== 'Cancelled');
  const days = []; for (let i = 6; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000));
  const totals = days.map(d => {
    const key = d.toDateString();
    return orders.filter(o => new Date(o.createdAt).toDateString() === key).reduce((s, o) => s + o.total, 0);
  });
  const max = Math.max(...totals, 1);
  qs('#sellerRevBars').innerHTML = totals.map(v => `<div class="bar" style="height:${Math.max(4, v / max * 160)}px"><span class="bv">${v ? inr(v) : ''}</span></div>`).join('');
  qs('#sellerRevLabels').innerHTML = days.map(d => `<span>${d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>`).join('');
  const trend = totals[6] >= totals[0] ? '+' : '−';
  qs('#sellerRevTrend').textContent = trend + Math.abs(Math.round((totals[6] - totals[0]) / (totals[0] || 1) * 100)) + '%';
  qs('#sellerRevTrend').className = 'badge ' + (trend === '+' ? 'badge-good' : 'badge-bad');

  const byCat = {};
  orders.forEach(o => o.items.forEach(it => { const p = findProduct(it.id); if (!p) return; byCat[p.cat] = (byCat[p.cat] || 0) + it.price * it.qty; }));
  renderDonut('#sellerDonut', '#sellerDonutLegend', byCat);
}
function renderDonut(svgSel, legendSel, dataObj) {
  const entries = Object.entries(dataObj).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = entries.reduce((s, e) => s + e[1], 0) || 1;
  const colors = ['#ff5a1f', '#3fb573', '#e3b341', '#5b8fd6', '#a377d6'];
  let acc = 0, paths = '';
  const r = 50, cx = 60, cy = 60;
  entries.forEach(([k, v], i) => {
    const frac = v / total; const a0 = acc * Math.PI * 2 - Math.PI / 2, a1 = (acc + frac) * Math.PI * 2 - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    paths += `<path d="M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${colors[i % colors.length]}"/>`;
    acc += frac;
  });
  qs(svgSel).innerHTML = paths + `<circle cx="${cx}" cy="${cy}" r="28" fill="var(--bg-1)"/>`;
  qs(legendSel).innerHTML = entries.map(([k, v], i) => `<div class="lg-item"><span class="sw" style="background:${colors[i % colors.length]}"></span>${esc(DATA.categories.find(c => c.id === k)?.name || k)} <span class="faint">${Math.round(v / total * 100)}%</span></div>`).join('') || '<p class="small">No sales data yet.</p>';
}
function renderSellerRecentOrders() {
  const rows = sellerOrders().slice(0, 6);
  qs('#sellerRecentOrders').innerHTML = `<thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>${
    rows.map(o => `<tr style="cursor:pointer" data-track="${o.id}"><td class="num">${o.id}</td><td>${esc(o.customerName)}</td><td>${o.items.length}</td><td class="num">${inr(o.total)}</td><td>${statusBadge(o.status)}</td><td>${fmtDate(o.createdAt)}</td></tr>`).join('')
  }</tbody>`;
}
function renderSellerProductTable() {
  let rows = sellerProducts();
  if (sellerDash.prodSearch) { const q = sellerDash.prodSearch.toLowerCase(); rows = rows.filter(p => p.name.toLowerCase().includes(q) || p.partNo.toLowerCase().includes(q)); }
  const { items, page, totalPages } = paginate(rows, sellerDash.prodPage, 6);
  qs('#sellerProductTable').innerHTML = `<thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead><tbody>${
    items.map(p => `<tr><td><div class="table-thumb"><img src="${productImg(p, 1)}" alt=""><div><div style="font-weight:600">${esc(p.name)}</div><div class="small">${esc(p.partNo)}</div></div></div></td>
      <td>${esc(DATA.categories.find(c => c.id === p.cat)?.name || p.cat)}</td><td class="num">${inr(p.price)}</td>
      <td>${p.stock === 0 ? statusBadge('Cancelled') : p.stock}</td><td>${p.rating}★</td>
      <td><div class="row-actions"><button data-edit-product="${p.id}" aria-label="Edit"><svg class="icon icon-sm"><use href="#i-edit"/></svg></button><button data-delete-product="${p.id}" aria-label="Remove"><svg class="icon icon-sm"><use href="#i-trash"/></svg></button></div></td></tr>`).join('') || `<tr><td colspan="6" class="small" style="text-align:center;padding:30px">No products match.</td></tr>`
  }</tbody>`;
  renderPagination(qs('#sellerProductPagination'), page, totalPages, (p) => { sellerDash.prodPage = p; renderSellerProductTable(); });
}
function renderSellerOrderTable() {
  let rows = sellerOrders();
  if (sellerDash.orderStatus) rows = rows.filter(o => o.status === sellerDash.orderStatus);
  if (sellerDash.orderSearch) { const q = sellerDash.orderSearch.toLowerCase(); rows = rows.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)); }
  const { items, page, totalPages } = paginate(rows, sellerDash.orderPage, 8);
  qs('#sellerOrderTable').innerHTML = `<thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${
    items.map(o => `<tr><td class="num">${o.id}</td><td>${esc(o.customerName)}<div class="small">${esc(o.customerCity)}</div></td><td>${o.items.length}</td><td class="num">${inr(o.total)}</td><td>${statusBadge(o.status)}</td><td>${fmtDate(o.createdAt)}</td>
      <td><button class="btn btn-secondary btn-sm" data-track="${o.id}">Track</button></td></tr>`).join('') || `<tr><td colspan="7" class="small" style="text-align:center;padding:30px">No orders match.</td></tr>`
  }</tbody>`;
  renderPagination(qs('#sellerOrderPagination'), page, totalPages, (p) => { sellerDash.orderPage = p; renderSellerOrderTable(); });
}
function renderSellerCustomerTable() {
  const map = new Map();
  sellerOrders().forEach(o => {
    const k = o.customerName;
    if (!map.has(k)) map.set(k, { name: o.customerName, city: o.customerCity, orders: 0, spent: 0 });
    const e = map.get(k); e.orders++; if (o.status !== 'Cancelled') e.spent += o.total;
  });
  let rows = Array.from(map.values());
  if (sellerDash.custSearch) { const q = sellerDash.custSearch.toLowerCase(); rows = rows.filter(r => r.name.toLowerCase().includes(q)); }
  rows.sort((a, b) => b.spent - a.spent);
  qs('#sellerCustomerTable').innerHTML = `<thead><tr><th>Customer</th><th>City</th><th>Orders</th><th>Total spent</th></tr></thead><tbody>${
    rows.map(r => `<tr><td><div class="table-thumb"><div class="chat-avatar" style="width:32px;height:32px;font-size:.7rem">${initials(r.name)}</div>${esc(r.name)}</div></td><td>${esc(r.city)}</td><td>${r.orders}</td><td class="num">${inr(r.spent)}</td></tr>`).join('') || `<tr><td colspan="4" class="small" style="text-align:center;padding:30px">No customers yet.</td></tr>`
  }</tbody>`;
}
function openSellerProductForm(editId) {
  const form = qs('#productForm'); form.reset();
  qs('#productFormTitle').textContent = editId ? 'Edit product' : 'Add product';
  qs('#pfCategory').innerHTML = DATA.categories.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  form.dataset.editId = editId || '';
  if (editId) {
    const p = findProduct(editId);
    qs('#pfName').value = p.name; qs('#pfBrand').value = p.brand; qs('#pfCategory').value = p.cat; qs('#pfPartNo').value = p.partNo;
    qs('#pfPrice').value = p.price; qs('#pfMrp').value = p.mrp; qs('#pfStock').value = p.stock; qs('#pfWarranty').value = p.warranty; qs('#pfAbout').value = p.about;
  }
  openOverlay('productFormOverlay');
}
function initSellerDashboard() {
  const panel = qs('[data-page="seller-dashboard"]');
  on(qsa('.dash-nav-link[data-dash-tab]', panel)[0]?.closest('.dash-sidebar') || panel, 'click', (e) => {
    const b = e.target.closest('[data-dash-tab]'); if (!b) return;
    sellerDash.tab = b.dataset.dashTab;
    qsa('[data-dash-tab]', panel).forEach(x => x.classList.toggle('active', x.dataset.dashTab === sellerDash.tab));
    qsa('[data-dash-panel]', panel).forEach(p => p.hidden = p.dataset.dashPanel !== sellerDash.tab);
    qs('#sellerDashTitle').textContent = b.textContent.trim();
    qs('#sellerSidebar').classList.remove('open');
    if (sellerDash.tab === 'settings') fillSellerSettings();
  });
  on(qs('#sellerMenuBtn'), 'click', () => qs('#sellerSidebar').classList.toggle('open'));
  on(panel, 'click', (e) => { if (e.target.closest('[data-track]')) navigate('#/track/' + e.target.closest('[data-track]').dataset.track); });
  on(qs('#sellerProductSearch'), 'input', debounce(e => { sellerDash.prodSearch = e.target.value; sellerDash.prodPage = 1; renderSellerProductTable(); }, 200));
  on(qs('#sellerOrderSearch'), 'input', debounce(e => { sellerDash.orderSearch = e.target.value; sellerDash.orderPage = 1; renderSellerOrderTable(); }, 200));
  on(qs('#sellerOrderStatusFilter'), 'change', e => { sellerDash.orderStatus = e.target.value; sellerDash.orderPage = 1; renderSellerOrderTable(); });
  on(qs('#sellerCustomerSearch'), 'input', debounce(e => { sellerDash.custSearch = e.target.value; renderSellerCustomerTable(); }, 200));
  on(qs('#sellerAddProductBtn'), 'click', () => openSellerProductForm());
  on(qs('#sellerAddProductTopBtn'), 'click', () => openSellerProductForm());
  on(qs('#sellerProductTable'), 'click', (e) => {
    const ed = e.target.closest('[data-edit-product]'), rm = e.target.closest('[data-delete-product]');
    if (ed) openSellerProductForm(ed.dataset.editProduct);
    if (rm) askConfirm({ title: 'Remove this product?', body: 'It will be hidden from the marketplace. You can\u2019t undo this in the demo.', confirmLabel: 'Remove', onConfirm: () => { findProduct(rm.dataset.deleteProduct).status = 'removed'; renderSellerProductTable(); toast('Product removed from your store.'); } });
  });
  on(qs('#productForm'), 'submit', (e) => {
    e.preventDefault();
    const editId = e.target.dataset.editId;
    const vals = { name: qs('#pfName').value, brand: qs('#pfBrand').value, cat: qs('#pfCategory').value, partNo: qs('#pfPartNo').value || 'N/A',
      price: Number(qs('#pfPrice').value), mrp: Number(qs('#pfMrp').value) || Number(qs('#pfPrice').value), stock: Number(qs('#pfStock').value),
      warranty: qs('#pfWarranty').value || 'No warranty listed', about: qs('#pfAbout').value || 'No description provided yet.' };
    if (editId) { Object.assign(findProduct(editId), vals); toast('Product updated.', { type: 'success' }); }
    else {
      const id = uid('p_new_');
      state.products.push({ id, ...vals, oem: 'N/A', seller: currentSellerId(), rating: 0, count: 0, tpl: 'pads', tint: '#888', placeholder: true, fits: [], specs: [['Category', DATA.categories.find(c => c.id === vals.cat)?.name || vals.cat]], status: 'active' });
      toast('Product added to your store.', { type: 'success' });
    }
    closeOverlay('productFormOverlay'); renderSellerProductTable(); renderSellerKpis();
  });
  on(qs('#saveStoreSettingsBtn'), 'click', () => {
    const s = findSeller(currentSellerId());
    s.name = qs('#setStoreName').value || s.name; s.city = qs('#setStoreCity').value || s.city;
    s.focus = qs('#setStoreFocus').value || s.focus; s.about = qs('#setStoreAbout').value || s.about;
    qs('#sellerDashSub').textContent = `${s.name} · ${s.city}`;
    toast('Store settings saved.', { type: 'success' });
  });
  on(qs('#sellerLogoutBtn'), 'click', signOut);
}
function fillSellerSettings() {
  const s = findSeller(currentSellerId());
  qs('#setStoreName').value = s.name; qs('#setStoreCity').value = s.city; qs('#setStoreFocus').value = s.focus; qs('#setStoreAbout').value = s.about;
}
function enterSellerDashboard() {
  const s = findSeller(currentSellerId());
  qs('#sellerDashSub').textContent = `${s.name} · ${s.city}`;
  renderSellerKpis(); renderSellerCharts(); renderSellerRecentOrders(); renderSellerProductTable(); renderSellerOrderTable(); renderSellerCustomerTable();
}

/* ============================== ADMIN: seed users ============================== */
function buildUsers() {
  const rand = seedRandom(7);
  const names = Array.from(new Set([...CUSTOMER_NAMES, ...DATA.reviews.map(r => r.name)]));
  return names.map((name, i) => ({
    id: 'u_' + i, name, email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.in',
    city: CUSTOMER_CITIES[Math.floor(rand() * CUSTOMER_CITIES.length)],
    joinedAt: Date.now() - Math.floor(rand() * 500) * 86400000,
    orders: 1 + Math.floor(rand() * 9),
    status: rand() < 0.05 ? 'Suspended' : 'Active'
  }));
}
function getUsers() { if (!state.users) state.users = LS.get('users', null) || buildUsers(); return state.users; }
function persistUsers() { LS.set('users', state.users); }
function persistSellers() { LS.set('sellersOverride', state.sellers.map(s => ({ id: s.id, status: s.status, name: s.name, city: s.city, focus: s.focus, about: s.about }))); }

/* ============================== ADMIN DASHBOARD ============================== */
const adminDash = {
  tab: 'overview',
  users: { search: '', page: 1, sortKey: 'name', sortDir: 1 },
  sellers: { search: '', status: '', page: 1 },
  products: { search: '', cat: '', page: 1 },
  vehicles: { search: '', page: 1 },
  orders: { search: '', status: '', page: 1 },
  reviews: { search: '', page: 1 }
};
function renderAdminKpis() {
  const orders = getDemoOrders();
  const last7 = orders.filter(o => o.createdAt > Date.now() - 7 * 86400000);
  const gmv = last7.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  const cards = [
    { icon: 'i-banknote', label: 'GMV (7 days)', val: inr(gmv) },
    { icon: 'i-inbox', label: 'Orders (7 days)', val: last7.length },
    { icon: 'i-store', label: 'Active sellers', val: state.sellers.filter(s => s.status !== 'Suspended').length + ' / ' + state.sellers.length },
    { icon: 'i-users', label: 'Registered users', val: getUsers().length }
  ];
  qs('#adminKpis').innerHTML = cards.map(c => `<div class="kpi-card"><div class="k-top"><span class="icon-wrap"><svg class="icon icon-sm"><use href="#${c.icon}"/></svg></span></div><div class="k-val num">${c.val}</div><div class="k-label">${c.label}</div></div>`).join('');
}
function renderAdminCharts() {
  const orders = getDemoOrders().filter(o => o.status !== 'Cancelled');
  const days = []; for (let i = 6; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000));
  const counts = days.map(d => orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString()).length);
  const max = Math.max(...counts, 1);
  qs('#adminOrderBars').innerHTML = counts.map(v => `<div class="bar" style="height:${Math.max(4, v / max * 160)}px"><span class="bv">${v || ''}</span></div>`).join('');
  qs('#adminOrderLabels').innerHTML = days.map(d => `<span>${d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>`).join('');
  const byCity = {}; state.sellers.forEach(s => byCity[s.city] = (byCity[s.city] || 0) + 1);
  renderDonut('#adminDonut', '#adminDonutLegend', byCity);
}
function tableToolbarHeader(cols) { return `<thead><tr>${cols.map(c => `<th ${c.key ? `data-sort="${c.key}"` : ''}>${c.label}${c.key ? '<svg class="icon sort-ic"><use href="#i-chevron-down"/></svg>' : ''}</th>`).join('')}</tr></thead>`; }

function renderAdminUsers() {
  const st = adminDash.users;
  let rows = getUsers();
  if (st.search) { const q = st.search.toLowerCase(); rows = rows.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)); }
  rows = sortRows(rows, st.sortKey, st.sortDir);
  const { items, page, totalPages } = paginate(rows, st.page, 8);
  qs('#adminUserTable').innerHTML = tableToolbarHeader([{ label: 'Name', key: 'name' }, { label: 'Email' }, { label: 'City', key: 'city' }, { label: 'Joined', key: 'joinedAt' }, { label: 'Orders', key: 'orders' }, { label: 'Status' }, { label: '' }]) +
    `<tbody>${items.map(u => `<tr><td><div class="table-thumb"><div class="chat-avatar" style="width:30px;height:30px;font-size:.68rem">${initials(u.name)}</div>${esc(u.name)}</div></td><td class="small">${esc(u.email)}</td><td>${esc(u.city)}</td><td>${fmtDate(u.joinedAt)}</td><td>${u.orders}</td><td>${statusBadge(u.status)}</td>
      <td><div class="row-actions"><button data-user-toggle="${u.id}" aria-label="Toggle status"><svg class="icon icon-sm"><use href="#i-${u.status === 'Active' ? 'ban' : 'check-circle'}"/></svg></button><button data-user-delete="${u.id}" aria-label="Delete"><svg class="icon icon-sm"><use href="#i-trash"/></svg></button></div></td></tr>`).join('') || emptyRow(7)}</tbody>`;
  renderPagination(qs('#adminUserPagination'), page, totalPages, p => { st.page = p; renderAdminUsers(); });
}
function renderAdminSellers() {
  const st = adminDash.sellers;
  let rows = state.sellers;
  if (st.status) rows = rows.filter(s => s.status === st.status);
  if (st.search) { const q = st.search.toLowerCase(); rows = rows.filter(s => s.name.toLowerCase().includes(q)); }
  const { items, page, totalPages } = paginate(rows, st.page, 8);
  qs('#adminSellerTable').innerHTML = `<thead><tr><th>Store</th><th>City</th><th>Rating</th><th>Since</th><th>Status</th><th></th></tr></thead><tbody>${
    items.map(s => `<tr><td><div class="table-thumb"><img src="assets/images/sellers/${s.id}.svg" alt="" style="width:38px;height:38px;border-radius:6px;object-fit:cover">${esc(s.name)}</div></td><td>${esc(s.city)}</td><td>${s.rating}★ (${s.reviews})</td><td>${s.since}</td><td>${statusBadge(s.status)}</td>
      <td><div class="row-actions">
        ${s.status === 'Pending' ? `<button data-seller-verify="${s.id}" aria-label="Verify"><svg class="icon icon-sm"><use href="#i-badge-check"/></svg></button>` : ''}
        <button data-seller-toggle="${s.id}" aria-label="Suspend"><svg class="icon icon-sm"><use href="#i-${s.status === 'Suspended' ? 'check-circle' : 'ban'}"/></svg></button>
        <button data-seller-delete="${s.id}" aria-label="Delete"><svg class="icon icon-sm"><use href="#i-trash"/></svg></button>
      </div></td></tr>`).join('') || emptyRow(6)
  }</tbody>`;
  renderPagination(qs('#adminSellerPagination'), page, totalPages, p => { st.page = p; renderAdminSellers(); });
}
function renderAdminProducts() {
  const st = adminDash.products;
  let rows = state.products;
  if (st.cat) rows = rows.filter(p => p.cat === st.cat);
  if (st.search) { const q = st.search.toLowerCase(); rows = rows.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)); }
  const { items, page, totalPages } = paginate(rows, st.page, 8);
  qs('#adminProductTable').innerHTML = `<thead><tr><th>Product</th><th>Seller</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>${
    items.map(p => `<tr><td><div class="table-thumb"><img src="${productImg(p, 1)}" alt="" style="width:38px;height:38px;border-radius:6px;object-fit:cover">${esc(p.name)}</div></td><td class="small">${esc(findSeller(p.seller)?.name || '—')}</td><td>${esc(DATA.categories.find(c => c.id === p.cat)?.name || p.cat)}</td><td class="num">${inr(p.price)}</td><td>${statusBadge(p.status === 'removed' ? 'Removed' : 'Active')}</td>
      <td><div class="row-actions"><button data-product-toggle="${p.id}" aria-label="Toggle"><svg class="icon icon-sm"><use href="#i-${p.status === 'removed' ? 'check-circle' : 'ban'}"/></svg></button><button data-product-delete="${p.id}" aria-label="Delete"><svg class="icon icon-sm"><use href="#i-trash"/></svg></button></div></td></tr>`).join('') || emptyRow(6)
  }</tbody>`;
  renderPagination(qs('#adminProductPagination'), page, totalPages, p => { st.page = p; renderAdminProducts(); });
  if (!qs('#adminProductCatFilter').dataset.filled) { qs('#adminProductCatFilter').insertAdjacentHTML('beforeend', DATA.categories.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')); qs('#adminProductCatFilter').dataset.filled = '1'; }
}
function renderAdminCatalogue() {
  const catCounts = {}; state.products.forEach(p => catCounts[p.cat] = (catCounts[p.cat] || 0) + 1);
  qs('#adminCategoryTable').innerHTML = `<thead><tr><th>Category</th><th>Listings</th></tr></thead><tbody>${DATA.categories.map(c => `<tr><td>${esc(c.name)}</td><td>${catCounts[c.id] || 0}</td></tr>`).join('')}</tbody>`;
  const brandCounts = {}; state.products.forEach(p => brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1);
  qs('#adminBrandTable').innerHTML = `<thead><tr><th>Brand</th><th>Listings</th></tr></thead><tbody>${Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).map(([b, n]) => `<tr><td>${esc(b)}</td><td>${n}</td></tr>`).join('')}</tbody>`;
}
function flatVehicles() {
  const rows = [];
  Object.entries(DATA.vehicles).forEach(([type, makes]) => Object.entries(makes).forEach(([make, models]) => models.forEach(m => rows.push({ type, make, model: m[0], from: m[1], to: m[2], variants: m[3].split('|').length }))));
  return rows;
}
function renderAdminVehicles() {
  const st = adminDash.vehicles;
  let rows = flatVehicles();
  if (st.search) { const q = st.search.toLowerCase(); rows = rows.filter(r => r.make.toLowerCase().includes(q) || r.model.toLowerCase().includes(q)); }
  const { items, page, totalPages } = paginate(rows, st.page, 10);
  qs('#adminVehicleTable').innerHTML = `<thead><tr><th>Type</th><th>Make</th><th>Model</th><th>Years</th><th>Variants</th></tr></thead><tbody>${
    items.map(r => `<tr><td style="text-transform:capitalize">${r.type}</td><td>${esc(r.make)}</td><td>${esc(r.model)}</td><td>${r.from}–${r.to}</td><td>${r.variants}</td></tr>`).join('') || emptyRow(5)
  }</tbody>`;
  renderPagination(qs('#adminVehiclePagination'), page, totalPages, p => { st.page = p; renderAdminVehicles(); });
}
function renderAdminOrders() {
  const st = adminDash.orders;
  let rows = getDemoOrders();
  if (st.status) rows = rows.filter(o => o.status === st.status);
  if (st.search) { const q = st.search.toLowerCase(); rows = rows.filter(o => o.id.toLowerCase().includes(q)); }
  const { items, page, totalPages } = paginate(rows, st.page, 8);
  qs('#adminOrderTable').innerHTML = `<thead><tr><th>Order</th><th>Customer</th><th>Seller</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${
    items.map(o => `<tr><td class="num">${o.id}</td><td>${esc(o.customerName)}</td><td class="small">${esc(findSeller(o.sellerId)?.name || '—')}</td><td class="num">${inr(o.total)}</td><td>${statusBadge(o.status)}</td><td>${fmtDate(o.createdAt)}</td>
      <td><div class="row-actions"><button data-track="${o.id}" aria-label="Track"><svg class="icon icon-sm"><use href="#i-eye"/></svg></button>${o.status !== 'Delivered' && o.status !== 'Cancelled' ? `<button data-order-cancel="${o.id}" aria-label="Cancel"><svg class="icon icon-sm"><use href="#i-ban"/></svg></button>` : ''}</div></td></tr>`).join('') || emptyRow(7)
  }</tbody>`;
  renderPagination(qs('#adminOrderPagination'), page, totalPages, p => { st.page = p; renderAdminOrders(); });
}
function reviewsWithFlags() { if (!state.reviewFlags) state.reviewFlags = DATA.reviews.map((r, i) => ({ ...r, id: 'rv_' + i, flagged: i === 3 || i === 9, removed: false })); return state.reviewFlags; }
function renderAdminReviews() {
  const st = adminDash.reviews;
  let rows = reviewsWithFlags().filter(r => !r.removed);
  if (st.search) { const q = st.search.toLowerCase(); rows = rows.filter(r => r.text.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)); }
  const { items, page, totalPages } = paginate(rows, st.page, 6);
  qs('#adminReviewTable').innerHTML = `<thead><tr><th>Review</th><th>Product</th><th>Rating</th><th>Status</th><th></th></tr></thead><tbody>${
    items.map(r => `<tr><td style="max-width:340px"><b>${esc(r.name)}</b><div class="small">"${esc(r.text.slice(0, 90))}${r.text.length > 90 ? '…' : ''}"</div></td><td class="small">${esc(findProduct(r.product)?.name || '—')}</td><td>${r.rating}★</td><td>${statusBadge(r.flagged ? 'Flagged' : 'Published')}</td>
      <td><div class="row-actions">${r.flagged ? `<button data-review-approve="${r.id}" aria-label="Approve"><svg class="icon icon-sm"><use href="#i-check-circle"/></svg></button>` : ''}<button data-review-delete="${r.id}" aria-label="Delete"><svg class="icon icon-sm"><use href="#i-trash"/></svg></button></div></td></tr>`).join('') || emptyRow(5)
  }</tbody>`;
  renderPagination(qs('#adminReviewPagination'), page, totalPages, p => { st.page = p; renderAdminReviews(); });
}
function emptyRow(cols) { return `<tr><td colspan="${cols}" class="small" style="text-align:center;padding:30px">No results.</td></tr>`; }

function initAdminDashboard() {
  const panel = qs('[data-page="admin"]');
  on(qs('#adminSidebar'), 'click', (e) => {
    const b = e.target.closest('[data-admin-tab]'); if (!b) return;
    adminDash.tab = b.dataset.adminTab;
    qsa('[data-admin-tab]', panel).forEach(x => x.classList.toggle('active', x.dataset.adminTab === adminDash.tab));
    qsa('[data-admin-panel]', panel).forEach(p => p.hidden = p.dataset.adminPanel !== adminDash.tab);
    qs('#adminDashTitle').textContent = b.textContent.trim();
    qs('#adminSidebar').classList.remove('open');
  });
  on(qs('#adminMenuBtn'), 'click', () => qs('#adminSidebar').classList.toggle('open'));
  on(qs('#adminLogoutBtn'), 'click', signOut);
  on(panel, 'click', (e) => { if (e.target.closest('[data-track]')) navigate('#/track/' + e.target.closest('[data-track]').dataset.track); });

  on(qs('#adminUserSearch'), 'input', debounce(e => { adminDash.users.search = e.target.value; adminDash.users.page = 1; renderAdminUsers(); }, 200));
  on(qs('#adminUserTable'), 'click', (e) => {
    const t = e.target.closest('[data-user-toggle]'), d = e.target.closest('[data-user-delete]'), h = e.target.closest('th[data-sort]');
    if (h) { const k = h.dataset.sort; adminDash.users.sortDir = adminDash.users.sortKey === k ? -adminDash.users.sortDir : 1; adminDash.users.sortKey = k; renderAdminUsers(); }
    if (t) { const u = getUsers().find(x => x.id === t.dataset.userToggle); u.status = u.status === 'Active' ? 'Suspended' : 'Active'; persistUsers(); renderAdminUsers(); toast(`${u.name} ${u.status === 'Active' ? 'reactivated' : 'suspended'}.`); }
    if (d) askConfirm({ title: 'Delete this user?', body: 'This removes them from the users table in this demo session.', confirmLabel: 'Delete', onConfirm: () => { state.users = getUsers().filter(x => x.id !== d.dataset.userDelete); persistUsers(); renderAdminUsers(); toast('User deleted.'); } });
  });

  on(qs('#adminSellerSearch'), 'input', debounce(e => { adminDash.sellers.search = e.target.value; adminDash.sellers.page = 1; renderAdminSellers(); }, 200));
  on(qs('#adminSellerStatusFilter'), 'change', e => { adminDash.sellers.status = e.target.value; adminDash.sellers.page = 1; renderAdminSellers(); });
  on(qs('#adminSellerTable'), 'click', (e) => {
    const v = e.target.closest('[data-seller-verify]'), t = e.target.closest('[data-seller-toggle]'), d = e.target.closest('[data-seller-delete]');
    if (v) { findSeller(v.dataset.sellerVerify).status = 'Verified'; persistSellers(); renderAdminSellers(); toast('Seller verified.', { type: 'success' }); }
    if (t) { const s = findSeller(t.dataset.sellerToggle); s.status = s.status === 'Suspended' ? 'Verified' : 'Suspended'; persistSellers(); renderAdminSellers(); toast(`${s.name} ${s.status === 'Suspended' ? 'suspended' : 'reactivated'}.`); }
    if (d) askConfirm({ title: 'Delete this seller?', body: 'Their listings will be removed from the marketplace in this demo session.', confirmLabel: 'Delete', onConfirm: () => { const id = d.dataset.sellerDelete; state.sellers = state.sellers.filter(s => s.id !== id); state.products.forEach(p => { if (p.seller === id) p.status = 'removed'; }); persistSellers(); renderAdminSellers(); toast('Seller deleted.'); } });
  });

  on(qs('#adminProductSearch'), 'input', debounce(e => { adminDash.products.search = e.target.value; adminDash.products.page = 1; renderAdminProducts(); }, 200));
  on(qs('#adminProductCatFilter'), 'change', e => { adminDash.products.cat = e.target.value; adminDash.products.page = 1; renderAdminProducts(); });
  on(qs('#adminProductTable'), 'click', (e) => {
    const t = e.target.closest('[data-product-toggle]'), d = e.target.closest('[data-product-delete]');
    if (t) { const p = findProduct(t.dataset.productToggle); p.status = p.status === 'removed' ? 'active' : 'removed'; renderAdminProducts(); toast(`Listing ${p.status === 'removed' ? 'removed' : 'restored'}.`); }
    if (d) askConfirm({ title: 'Delete this listing permanently?', body: 'This cannot be undone in this demo session.', confirmLabel: 'Delete', onConfirm: () => { state.products = state.products.filter(p => p.id !== d.dataset.productDelete); renderAdminProducts(); toast('Listing deleted.'); } });
  });

  on(qs('#adminVehicleSearch'), 'input', debounce(e => { adminDash.vehicles.search = e.target.value; adminDash.vehicles.page = 1; renderAdminVehicles(); }, 200));
  on(qs('#adminOrderSearch'), 'input', debounce(e => { adminDash.orders.search = e.target.value; adminDash.orders.page = 1; renderAdminOrders(); }, 200));
  on(qs('#adminOrderStatusFilter'), 'change', e => { adminDash.orders.status = e.target.value; adminDash.orders.page = 1; renderAdminOrders(); });
  on(qs('#adminOrderTable'), 'click', (e) => {
    const c = e.target.closest('[data-order-cancel]'); if (!c) return;
    askConfirm({ title: 'Cancel this order?', body: 'The customer will see it as cancelled when tracking.', confirmLabel: 'Cancel order', onConfirm: () => { const o = getDemoOrders().find(x => x.id === c.dataset.orderCancel); o.status = 'Cancelled'; LS.set('demoOrders', state.demoOrders); renderAdminOrders(); toast('Order cancelled.'); } });
  });

  on(qs('#adminReviewSearch'), 'input', debounce(e => { adminDash.reviews.search = e.target.value; adminDash.reviews.page = 1; renderAdminReviews(); }, 200));
  on(qs('#adminReviewTable'), 'click', (e) => {
    const a = e.target.closest('[data-review-approve]'), d = e.target.closest('[data-review-delete]');
    if (a) { reviewsWithFlags().find(r => r.id === a.dataset.reviewApprove).flagged = false; renderAdminReviews(); toast('Review approved.', { type: 'success' }); }
    if (d) askConfirm({ title: 'Delete this review?', body: 'It will no longer be shown on the site.', confirmLabel: 'Delete', onConfirm: () => { reviewsWithFlags().find(r => r.id === d.dataset.reviewDelete).removed = true; renderAdminReviews(); toast('Review deleted.'); } });
  });
}
function enterAdminDashboard() {
  renderAdminKpis(); renderAdminCharts(); renderAdminUsers(); renderAdminSellers(); renderAdminProducts(); renderAdminCatalogue(); renderAdminVehicles(); renderAdminOrders(); renderAdminReviews();
}

/* ============================== GLOBAL UI: nav, theme, overlays, misc ============================== */
function initGlobalUI() {
  // generic overlay close (scrim + [data-close])
  qsa('[data-close]').forEach(el => on(el, 'click', () => closeOverlay(el.dataset.close)));
  qsa('.overlay').forEach(ov => on(ov, 'keydown', (e) => { if (e.key === 'Escape') closeOverlay(ov.id); }));
  on(document, 'keydown', (e) => { if (e.key === 'Escape') { qsa('.overlay.open').forEach(ov => closeOverlay(ov.id)); qs('#mobileNav').classList.remove('open'); } });

  on(qs('#cartOpenBtn'), 'click', () => openOverlay('cartOverlay'));
  on(qs('#searchOpenBtn'), 'click', () => { navigate('#/'); setTimeout(() => { qs('#quickSearch')?.focus(); qs('.finder-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); });

  // mobile nav
  on(qs('#hamburgerBtn'), 'click', () => qs('#mobileNav').classList.add('open'));
  qsa('[data-close-mobilenav]').forEach(el => on(el, 'click', () => qs('#mobileNav').classList.remove('open')));

  // header scroll state + back to top
  const header = qs('#siteHeader'), backTop = qs('#backToTop');
  on(window, 'scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
    backTop.classList.toggle('show', window.scrollY > 900);
  }, { passive: true });
  on(backTop, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // theme toggle — brand default is dark regardless of system preference; light is an explicit opt-in
  applyTheme(state.theme || 'dark');
  on(qs('#themeToggle'), 'click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  on(qs('#mobileThemeToggle'), 'click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));

  // whatsapp float
  qs('#waFloat').href = `https://wa.me/${DATA.brand.whatsapp}?text=${encodeURIComponent('Hi! I have a question about a part on SpareFixer.')}`;

  // delegated content interactions
  on(document, 'click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav && nav.tagName === 'A') { e.preventDefault(); qs('#mobileNav').classList.remove('open'); navigate(nav.getAttribute('href')); return; }

    const addCart = e.target.closest('[data-add-cart]'); if (addCart) { e.preventDefault(); e.stopPropagation(); addToCart(addCart.dataset.addCart, 1); return; }
    const wish = e.target.closest('[data-wish-toggle]'); if (wish) { e.preventDefault(); e.stopPropagation(); toggleWishlist(wish.dataset.wishToggle); return; }
    const openP = e.target.closest('[data-open-product]'); if (openP) { openProductModal(openP.dataset.openProduct); return; }
    const catOpen = e.target.closest('[data-cat-open]'); if (catOpen) { clearAllFilters(); state.shop.cat.add(catOpen.dataset.catOpen); navigate('#/shop'); return; }
    const sellerOpen = e.target.closest('[data-seller-open]'); if (sellerOpen) { navigate('#/seller/' + sellerOpen.dataset.sellerOpen); return; }
    const blogOpen = e.target.closest('[data-blog-open]'); if (blogOpen) { navigate('#/blog/' + blogOpen.dataset.blogOpen); return; }
    const bookOpen = e.target.closest('[data-book-workshop]'); if (bookOpen) { openBooking(bookOpen.dataset.bookWorkshop); return; }
  });
  on(document, 'change', (e) => { const cmp = e.target.closest('[data-compare-toggle]'); if (cmp) toggleCompare(cmp.dataset.compareToggle); });

  on(qs('#sellStartBtn'), 'click', () => openAuth('seller'));

  initCursorAndMagnetic();
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  state.theme = theme; persist('theme');
  qsa('.theme-toggle').forEach(t => t.setAttribute('aria-pressed', theme === 'light'));
}

/* cursor halo + magnetic buttons (desktop, fine pointer, motion allowed)
   The native cursor stays visible so pointer movement is never delayed;
   the ring is only a light, fast-following accent. */
function initCursorAndMagnetic() {
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;
  document.body.classList.add('has-cursor');
  const ring = qs('#cursorRing');
  let rx = 0, ry = 0, mx = 0, my = 0, running = false, last = 0;
  function loop(t) {
    const k = 1 - Math.pow(0.0005, Math.min(t - last, 50) / 1000); // frame-rate independent, ~tight follow
    last = t;
    rx += (mx - rx) * k; ry += (my - ry) * k;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) requestAnimationFrame(loop); else running = false;
  }
  on(window, 'mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
  }, { passive: true });
  on(document, 'mouseover', (e) => { if (e.target.closest('a,button,input,select,textarea,[data-open-product]')) ring.classList.add('hover'); });
  on(document, 'mouseout', (e) => { if (e.target.closest('a,button,input,select,textarea,[data-open-product]')) ring.classList.remove('hover'); });
  qsa('.magnetic').forEach(el => {
    on(el, 'mousemove', (e) => { const r = el.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; el.style.transform = `translate(${x * 0.15}px, ${y * 0.18}px)`; }, { passive: true });
    on(el, 'mouseleave', () => { el.style.transform = ''; });
  });
}

/* ============================== ROUTER ============================== */
let activePage = 'home';
function currentPage() { return activePage; }
function showPage(name) { if (activePage === 'live-map' && name !== 'live-map') window.SparefixerLiveMap?.leave(); qsa('.page').forEach(p => { p.hidden = p.dataset.page !== name; }); activePage = name; }
function navigate(hash) {
  if (location.hash === hash) router(); else location.hash = hash;
}
function router() {
  qsa('.overlay.open').forEach(ov => closeOverlay(ov.id));
  const raw = (location.hash || '#/').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  const [seg, param] = parts;

  const routes = {
    undefined: () => showPage('home'),
    shop: () => { showPage('shop'); renderShopFull(); },
    sellers: () => { showPage('sellers'); renderSellersPage(); },
    seller: () => { showPage('seller-profile'); renderSellerProfile(param); },
    'live-map': () => { showPage('live-map'); window.SparefixerLiveMap?.enter(); },
    workshops: () => { showPage('workshops'); renderWorkshopsPage(); },
    blog: () => { param ? (showPage('blog-article'), renderArticlePage(param)) : (showPage('blog'), renderBlogListPage()); },
    about: () => showPage('about'),
    sell: () => showPage('sell'),
    wishlist: () => { showPage('wishlist'); renderWishlistPage(); },
    checkout: () => { showPage('checkout'); initCheckoutPageEnter(); },
    track: () => { showPage('track'); enterTrackPage(param); },
    'seller-dashboard': () => { showPage('seller-dashboard'); enterSellerDashboard(); },
    admin: () => { showPage('admin'); enterAdminDashboard(); }
  };
  (routes[seg] || routes.undefined)();
  window.scrollTo({ top: 0 });
  qsa('.nav-links a[data-nav]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + seg));
  initReveal();
}

/* ============================== INIT ============================== */
function main() {
  initWorkingCopies();
  updateAccountBtn();
  syncCartUI(); syncWishUI(); syncCompareUI();
  initFinder();
  initShopPage();
  initProductModal();
  initCompareBar();
  initCart();
  initCheckoutPage();
  initTrackPage();
  initAuth();
  initBooking();
  initChat();
  initQuoteBulk();
  initSellerDashboard();
  initAdminDashboard();
  initConfirmModal();
  initReviewsCarousel();
  initGlobalUI();
  renderHome();
  window.addEventListener('hashchange', router);
  router();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();
