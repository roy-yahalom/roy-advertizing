// src/adSpec.ts
import type {AdSpec} from './schema';

export const demoSpec: AdSpec = {
  brand: {
    primary: '#ffffff',
    secondary: '#00E0FF',
    background: '#0F0F0F',
    fontFamily: 'Inter, Arial, sans-serif',
    logo: 'logo.png'
  },
  scenes: [
    { type: 'hero_text',
      headline: 'Your money. Your rules.',
      subheadline: 'Cash, crypto, investments — one dashboard.',
      durationMs: 3200
    },
    { type: 'icon_list',
      title: 'Why people love our product',
      items: [
        {icon: 'icons/check.svg', label: 'Easy to use'},
        {icon: 'icons/star.svg',  label: 'Trusted by thousands'},
        {icon: 'icons/bolt.svg',  label: 'Super fast'}
      ],
      columns: 3,
      durationMs: 3600
    },
    { type: 'stat_counter',
      title: 'Trusted by teams',
      items: [
        {label: 'Customers',  value: 12800, suffix: '+'},
        {label: 'Avg. Uplift',value: 37,    suffix: '%'},
        {label: 'Countries',  value: 22},
        {label: 'NPS',        value: 72}
      ],
      durationMs: 2600
    },
    { type: 'split_feature',
      title: 'Plan, track, and grow',
      body: 'Connect accounts. See cash, crypto, and investments in one clean view.',
      media: {type: 'image', src: 'demo/product-shot.png'},
      durationMs: 3000
    },
    { type: 'carousel',
      title: 'Built for modern teams',
      images: ['demo/shot-1.jpg','demo/shot-2.jpg','demo/shot-3.jpg'],
      durationMs: 3000
    },
    { type: 'testimonial',
      quote: 'This product gave us clarity and speed. Our team ships twice as fast.',
      name: 'Alex Cohen',
      role: 'COO, Nimbus',
      avatar: 'demo/avatar.png',
      durationMs: 2600
    },
    { type: 'cta',
      headline: 'Run your business with clarity.',
      button: 'Get Started',
      durationMs: 2400
    },
    { type: 'cta_outro',
      url: 'lumi.shop',
      durationMs: 1400
    }
  ]
};
