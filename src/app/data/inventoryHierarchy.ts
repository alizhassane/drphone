export interface ModelData {
    id: string;
    name: string;
}

export interface BrandData {
    id: string;
    name: string;
    models: string[];
}

export interface DeviceCategoryData {
    id: string;
    name: string;
    brands: BrandData[];
    parts: string[]; // NEW: Parts available for this specific device type
}

export const INVENTORY_HIERARCHY: DeviceCategoryData[] = [
    {
        id: 'phone',
        name: 'Téléphone',
        brands: [
            {
                id: 'apple',
                name: 'Apple',
                models: [
                    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
                    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
                    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
                    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
                    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
                    'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
                    'iPhone 8 Plus', 'iPhone 8', 'iPhone SE (2020)', 'iPhone SE (2022)'
                ]
            },
            {
                id: 'samsung',
                name: 'Samsung',
                models: [
                    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
                    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
                    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
                    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21',
                    'Galaxy A54', 'Galaxy A53', 'Galaxy A34', 'Galaxy A14'
                ]
            },
            {
                id: 'google',
                name: 'Google',
                models: [
                    'Pixel 8 Pro', 'Pixel 8',
                    'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
                    'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a'
                ]
            },
            {
                id: 'motorola',
                name: 'Motorola',
                models: ['Moto G Power', 'Moto G Stylus', 'Edge+', 'Razr+']
            }
        ],
        parts: [
            'Écran',
            'Batterie',
            'Connecteur de charge',
            'Vitre arrière',
            'Caméra arrière',
            'Caméra avant',
            'Lentille caméra',
            'Écouteur interne',
            'Haut-parleur',
            'Microphone',
            'Boutons (Power/Volume)',
            'Nappe',
            'Logement SIM',
            'Vibreur',
            'Antenne',
            'Autre'
        ]
    },
    {
        id: 'tablet',
        name: 'Tablette',
        brands: [
            {
                id: 'apple',
                name: 'Apple',
                models: [
                    'iPad Pro 12.9 (6th gen)', 'iPad Pro 11 (4th gen)',
                    'iPad Air (5th gen)', 'iPad (10th gen)', 'iPad mini (6th gen)'
                ]
            },
            {
                id: 'samsung',
                name: 'Samsung',
                models: ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9', 'Galaxy Tab S8', 'Galaxy Tab A8']
            }
        ],
        parts: [
            'Écran',
            'Batterie',
            'Connecteur de charge',
            'Vitre tactile',
            'Caméra',
            'Boutons',
            'Antenne WiFi',
            'Autre'
        ]
    },
    {
        id: 'console',
        name: 'Console',
        brands: [
            {
                id: 'sony',
                name: 'Sony',
                models: ['PlayStation 5', 'PlayStation 5 Digital', 'PlayStation 4 Pro', 'PlayStation 4 Slim', 'PlayStation 4']
            },
            {
                id: 'microsoft',
                name: 'Microsoft',
                models: ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S']
            },
            {
                id: 'nintendo',
                name: 'Nintendo',
                models: ['Switch OLED', 'Switch', 'Switch Lite']
            }
        ],
        parts: [
            'Port HDMI',
            'Lecteur Disque',
            'Ventilateur',
            'Alimentation',
            'Disque Dur / SSD',
            'Manette (Accessoire)',
            'Pâte Thermique',
            'Autre'
        ]
    },
    {
        id: 'laptop',
        name: 'Laptop',
        brands: [
            {
                id: 'apple',
                name: 'Apple',
                models: ['MacBook Pro 14 M3', 'MacBook Pro 16 M3', 'MacBook Air 15 M2', 'MacBook Air 13 M2', 'MacBook Air 13 M1']
            },
            {
                id: 'dell',
                name: 'Dell',
                models: ['XPS 15', 'XPS 13', 'Inspiron 15']
            },
            {
                id: 'hp',
                name: 'HP',
                models: ['Spectre x360', 'Envy', 'Pavilion']
            },
            {
                id: 'lenovo',
                name: 'Lenovo',
                models: ['ThinkPad X1 Carbon', 'IdeaPad']
            }
        ],
        parts: [
            'Écran (Dalle)',
            'Clavier',
            'Batterie',
            'Trackpad',
            'Ventilateur',
            'Disque SSD / NVMe',
            'Mémoire RAM',
            'Connecteur de charge (DC Jack)',
            'Charnières',
            'Autre'
        ]
    },
    {
        id: 'computer',
        name: 'Ordinateur',
        brands: [
            {
                id: 'custom',
                name: 'Custom / Gaming',
                models: ['Tower ATX', 'Mini ITX']
            },
            {
                id: 'apple',
                name: 'Apple',
                models: ['iMac 24 M3', 'Mac Studio', 'Mac mini']
            }
        ],
        parts: [
            'Carte Graphique (GPU)',
            'Processeur (CPU)',
            'Carte Mère',
            'Alimentation (PSU)',
            'Mémoire RAM',
            'Stockage (SSD/HDD)',
            'Boîtier',
            'Refroidissement (AIO/Air)',
            'Autre'
        ]
    }
];

// Fallback or generic parts list if needed, but we try to use the specific ones now
export const PARTS_CATEGORIES = [
    'Écran', 'Batterie', 'Autre'
];

export const QUALITY_OPTIONS = {
    'Écran': ['Premium', 'OLED Hard', 'OLED Soft', 'Incell', 'Original (Refurb)', 'OEM Pull'],
    'Écran (Dalle)': ['Original', 'Compatible', 'Matte', 'Glossy'],
    'Batterie': ['Premium', 'Original Capacity', 'High Capacity'],
    'default': ['Premium', 'OEM', 'Compatible']
};
