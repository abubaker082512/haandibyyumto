import type { MenuItem } from '../types';

export const HAANDI_MENU: MenuItem[] = [
  // ─── Soup ──────────────────────────────────────────────────────────
  {
    id: 'soup-1',
    name: 'Hot & Sour Soup',
    price: 490,
    description: 'Classic spicy & sour broth with shredded chicken and fresh vegetables',
    category: 'Soup',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Single', price: 490 },
      { name: 'Full', price: 1490 }
    ]
  },
  {
    id: 'soup-2',
    name: 'Chicken Corn Soup',
    price: 490,
    description: 'Creamy sweet corn soup with shredded chicken and egg drops',
    category: 'Soup',
    imageUrl: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Single', price: 490 },
      { name: 'Full', price: 1490 }
    ]
  },
  {
    id: 'soup-3',
    name: 'Handi Special Soup',
    price: 660,
    description: 'Chef special rich soup with mixed meats and seasonal spices (Seasonal)',
    category: 'Soup',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Single', price: 660 },
      { name: 'Full', price: 1990 }
    ]
  },

  // ─── Salad ─────────────────────────────────────────────────────────
  {
    id: 'salad-1',
    name: 'Greek Salad',
    price: 350,
    description: 'Fresh crisp lettuce, cucumber, olives, tomatoes and feta cheese',
    category: 'Salad',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'salad-2',
    name: 'Kachumar Salad',
    price: 350,
    description: 'Diced onions, tomatoes, and cucumbers tossed with lemon and green chillies',
    category: 'Salad',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'salad-3',
    name: 'Pineapple Salad',
    price: 790,
    description: 'Juicy pineapple chunks with cream dressing and seasonal fruits',
    category: 'Salad',
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'salad-4',
    name: 'Fresh Green Salad',
    price: 250,
    description: 'Farm fresh seasonal garden vegetables with sliced lemons',
    category: 'Salad',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'salad-5',
    name: 'Zeera Raita',
    price: 220,
    description: 'Chilled spiced yogurt tempered with roasted cumin seeds',
    category: 'Salad',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'salad-6',
    name: 'Russian Salad',
    price: 690,
    description: 'Diced apples, potatoes, carrots, and sweet peas in rich creamy mayonnaise',
    category: 'Salad',
    imageUrl: 'https://images.unsplash.com/photo-1529312266912-b33cfce2eefd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Burger ────────────────────────────────────────────────────────
  {
    id: 'burger-1',
    name: 'Chicken Special Burger',
    price: 1090,
    description: 'Signature double chicken patty with melted cheese, served with french fries & salad',
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'burger-2',
    name: 'Chicken Burger',
    price: 690,
    description: 'Grilled seasoned chicken patty in a toasted sesame bun, served with fries & salad',
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'burger-3',
    name: 'Chicken Cheese Burger',
    price: 770,
    description: 'Chicken patty topped with melted cheddar cheese slice, fries & salad',
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'burger-4',
    name: 'Zinger Burger',
    price: 690,
    description: 'Crispy deep-fried spicy chicken breast with special sauce, fries & salad',
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'burger-5',
    name: 'Beef Burger',
    price: 750,
    description: 'Juicy flame-grilled seasoned beef patty with fresh lettuce, tomato, fries & salad',
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1583032015879-670146059c29?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Sandwich ──────────────────────────────────────────────────────
  {
    id: 'sandwich-1',
    name: 'Special Sandwich',
    price: 1090,
    description: 'Triple-decker signature chicken & egg sandwich, served with french fries & salad',
    category: 'Sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'sandwich-2',
    name: 'Chicken Sandwich',
    price: 690,
    description: 'Tender shredded chicken with seasoned mayonnaise, served with fries & salad',
    category: 'Sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'sandwich-3',
    name: 'Chicken Cheese Sandwich',
    price: 770,
    description: 'Toasted chicken sandwich layered with melted cheese, served with fries & salad',
    category: 'Sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'sandwich-4',
    name: 'Club Sandwich',
    price: 690,
    description: 'Classic toasted club sandwich with chicken, fried egg, cucumber and cheese, fries & salad',
    category: 'Sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Snacks ────────────────────────────────────────────────────────
  {
    id: 'snack-1',
    name: 'French Fries',
    price: 440,
    description: 'Crispy hot golden potato fries with seasoning',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'snack-2',
    name: 'Steam Roast',
    price: 950,
    description: 'Traditional slow-steamed marinated chicken roast with spices',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 950 },
      { name: 'Full', price: 1850 }
    ]
  },
  {
    id: 'snack-3',
    name: 'Fried Chicken (4 Pcs)',
    price: 850,
    description: 'Golden crispy southern-style spiced fried chicken pieces (4 pcs)',
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Chinese ───────────────────────────────────────────────────────
  {
    id: 'chinese-1',
    name: 'Chicken Chowmein',
    price: 1150,
    description: 'Stir-fried egg noodles with seasoned chicken, cabbage, and crisp wok vegetables',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-2',
    name: 'Chicken Manchurian',
    price: 1690,
    description: 'Classic Chinese chicken cubes in rich ginger garlic Manchurian red gravy with choice of rice',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-3',
    name: 'Sweet & Sour Chicken',
    price: 1690,
    description: 'Crispy chicken cubes in pineapple and bell pepper sweet & sour sauce with choice of rice',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-4',
    name: 'Chicken Chilli Dry',
    price: 1690,
    description: 'Wok-tossed boneless chicken slices with fresh green chillies, ginger, and scallions',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-5',
    name: 'Cashew Nut Chicken',
    price: 1890,
    description: 'Succulent chicken pieces tossed with roasted crunchy cashews in savory Chinese brown sauce',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-6',
    name: 'Beef Chilli Dry',
    price: 1790,
    description: 'Crispy marinated beef strips wok-tossed with spicy green chillies and onions',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-7',
    name: 'Drum Sticks (6 pcs)',
    price: 1490,
    description: 'Crispy seasoned chicken drumsticks served with spicy dip (6 pcs)',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-8',
    name: 'Fish Finger (6 pcs)',
    price: 1590,
    description: 'Golden crumb-fried tender fish fingers served with tartar sauce (6 pcs)',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'chinese-9',
    name: 'Fried Fish (2 Fillet)',
    price: 1590,
    description: 'Crispy battered golden fried fish fillets (2 large fillets)',
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Chinese Combos ────────────────────────────────────────────────
  {
    id: 'combo-1',
    name: 'Chinese Combo 1',
    price: 1290,
    description: 'Egg Fried Rice + Chicken Manchurian + Drumstick 1 Pc',
    category: 'Chinese Combos',
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'combo-2',
    name: 'Chinese Combo 2',
    price: 1290,
    description: 'Vegetable Fried Rice + Chicken Chili Dry + Fried Wings 2 Pcs',
    category: 'Chinese Combos',
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'combo-3',
    name: 'Chinese Combo 3',
    price: 1290,
    description: 'Vegetable Fried Rice + Sweet & Sour Chicken + Fried Wings 2 Pcs',
    category: 'Chinese Combos',
    imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Rice ──────────────────────────────────────────────────────────
  {
    id: 'rice-1',
    name: 'Steam Rice',
    price: 690,
    description: 'Fluffy long-grain aromatic steamed basmati rice',
    category: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'rice-2',
    name: 'Masala Rice',
    price: 1090,
    description: 'Aromatic basmati rice cooked with whole garam masalas and herbs',
    category: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'rice-3',
    name: 'Egg Fried Rice',
    price: 890,
    description: 'Wok-tossed basmati rice with scrambled egg, spring onions, and pepper',
    category: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'rice-4',
    name: 'Chicken Fried Rice',
    price: 1090,
    description: 'Wok-fried rice loaded with shredded chicken and garden vegetables',
    category: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'rice-5',
    name: 'Chicken Pulao',
    price: 1240,
    description: 'Traditional spiced aromatic yakhni basmati pulao with succulent chicken',
    category: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'rice-6',
    name: 'Chicken Biryani',
    price: 1290,
    description: 'Fragrant saffron basmati rice layered with rich spicy chicken and whole spices',
    category: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: '1 Plate', price: 650 },
      { name: 'Full Platter', price: 1290 }
    ]
  },

  // ─── Handi - Chicken ───────────────────────────────────────────────
  {
    id: 'handi-c1',
    name: 'Chicken Handi',
    price: 1690,
    description: 'Boneless tender chicken cooked slowly in an authentic clay handi with rich aromatic gravy',
    category: 'Handi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-c2',
    name: 'Rajhistani Handi (Chicken)',
    price: 1850,
    description: 'Royal Rajasthani style chicken handi cooked in a rich, spiced red curry sauce',
    category: 'Handi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-c3',
    name: 'Achari Handi (Chicken)',
    price: 1790,
    description: 'Boneless chicken handi infused with zesty pickling spices and green chillies',
    category: 'Handi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-c4',
    name: 'Mughlai Makhni Handi',
    price: 1990,
    description: 'Luxurious velvety butter gravy cooked with tender chicken, heavy cream, and nuts',
    category: 'Handi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-c5',
    name: 'Chicken Ginger',
    price: 1790,
    description: 'Boneless chicken strips wok-tossed in a robust tomato gravy with julienned fresh ginger',
    category: 'Handi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-c6',
    name: 'Chicken Patyala (White)',
    price: 2250,
    description: 'Mild, rich white gravy handi prepared with cashew paste, cream, and green cardamom',
    category: 'Handi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-c7',
    name: 'Chicken Jalfrezi',
    price: 1690,
    description: 'Boneless chicken cubes stir-fried with capsicum, sweet onions, tomatoes and egg ribbons',
    category: 'Handi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Handi - Mutton ────────────────────────────────────────────────
  {
    id: 'handi-m1',
    name: 'Mutton Handi',
    price: 2890,
    description: 'Mutton simmered low and slow in a sealed earthenware handi with traditional spices',
    category: 'Handi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-m2',
    name: 'Achari Handi (Mutton)',
    price: 2990,
    description: 'Succulent mutton slow-cooked with fenugreek, mustard seeds, and pickling masalas',
    category: 'Handi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-m3',
    name: 'Rajhistani Handi (Mutton)',
    price: 2990,
    description: 'Traditional Rajasthani red mutton curry in a clay handi with rich roasted spices',
    category: 'Handi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'handi-m4',
    name: 'Mughlai Handi (Mutton)',
    price: 3290,
    description: 'Royal court specialty mutton handi cooked in a rich, nutty gravy with cream and saffron',
    category: 'Handi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Karahi - Chicken ──────────────────────────────────────────────
  {
    id: 'karahi-c1',
    name: 'Chicken Karahi',
    price: 2590,
    description: 'Prepared in pure butter & crushed black pepper in an iron wok',
    category: 'Karahi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 1390 },
      { name: 'Full', price: 2590 }
    ]
  },
  {
    id: 'karahi-c2',
    name: 'Lahori Chicken Karahi',
    price: 2250,
    description: 'Famous spicy red sauce Lahori karahi with tomatoes, green chillies and fresh ginger',
    category: 'Karahi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 1240 },
      { name: 'Full', price: 2250 }
    ]
  },
  {
    id: 'karahi-c3',
    name: 'Rajhistani Chicken Karahi',
    price: 2390,
    description: 'Infused with roasted Rajasthani whole spices and whole dried red chillies',
    category: 'Karahi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 1340 },
      { name: 'Full', price: 2390 }
    ]
  },
  {
    id: 'karahi-c4',
    name: 'Desi Chicken Karahi',
    price: 3590,
    description: 'Organic free-range Desi Murgh prepared in country butter and fresh black pepper',
    category: 'Karahi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 1890 },
      { name: 'Full', price: 3590 }
    ]
  },
  {
    id: 'karahi-c5',
    name: 'Mughlai Karahi (Chicken)',
    price: 2790,
    description: 'Rich royal chicken karahi finished with almonds, yogurt, and fresh cream',
    category: 'Karahi (Chicken)',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 1490 },
      { name: 'Full', price: 2790 }
    ]
  },

  // ─── Karahi - Mutton ───────────────────────────────────────────────
  {
    id: 'karahi-m1',
    name: 'Mutton Karahi',
    price: 4990,
    description: 'Tender mutton prepared in pure butter and crushed black pepper in an iron karahi',
    category: 'Karahi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 2590 },
      { name: 'Full', price: 4990 }
    ]
  },
  {
    id: 'karahi-m2',
    name: 'Lahori Mutton Karahi',
    price: 4690,
    description: 'Spicy red tomato and ginger gravy mutton karahi Lahori style',
    category: 'Karahi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 2390 },
      { name: 'Full', price: 4690 }
    ]
  },
  {
    id: 'karahi-m3',
    name: 'Rajhistani Mutton Karahi',
    price: 4890,
    description: 'Spicy Rajasthani whole spice mutton karahi with crushed coriander and cumin',
    category: 'Karahi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 2490 },
      { name: 'Full', price: 4890 }
    ]
  },
  {
    id: 'karahi-m4',
    name: 'Mughlai Karahi (Mutton)',
    price: 4990,
    description: 'Imperial cream and almond rich mutton karahi fit for royalty',
    category: 'Karahi (Mutton)',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 2590 },
      { name: 'Full', price: 4990 }
    ]
  },

  // ─── BBQ ───────────────────────────────────────────────────────────
  {
    id: 'bbq-1',
    name: 'Ch. Tikka Boti (8 pcs)',
    price: 990,
    description: 'Charcoal-grilled tender chicken boneless cubes in red tandoori marinade (8 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-2',
    name: 'Ch. Malai Boti (8 pcs)',
    price: 1290,
    description: 'Melt-in-mouth creamy marinated boneless chicken skewers grilled over coals (8 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-3',
    name: 'Ch. & Cheez Kastoori Kabab',
    price: 1590,
    description: 'Minced chicken kabab infused with fragrant kasoori methi and stuffed with melted cheese',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-4',
    name: 'Ch. Seekh Kabab (4 pcs)',
    price: 1090,
    description: 'Spiced minced chicken skewers flame-grilled over burning charcoal (4 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-5',
    name: 'Chicken Tikka Leg/Chest',
    price: 650,
    description: 'Whole quarter chicken piece marinated in traditional red spices and charcoal roasted',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-6',
    name: 'Handi Special Seekh Kabab',
    price: 1490,
    description: 'Signature large seekh kababs prepared with hand-chopped spiced meat and herbs',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-7',
    name: 'Beef Seekh Kabab (4 pcs)',
    price: 1290,
    description: 'Juicy spiced minced beef skewers grilled over open charcoal (4 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-8',
    name: 'Mutton Chops Grilled (6 pcs)',
    price: 2990,
    description: 'Succulent tender mutton chops marinated in raw papaya and spices, grilled to perfection (6 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-9',
    name: 'Chicken Hot Wings (12 pcs)',
    price: 850,
    description: 'Charcoal grilled chicken wings glazed with hot peri-peri sauce (12 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-10',
    name: 'Btair / Quail (4 pcs)',
    price: 990,
    description: 'Whole spiced marinated quails barbecued over charcoal (4 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-11',
    name: 'Fish Tikka Grilled (8 pcs)',
    price: 1590,
    description: 'Boneless fish fillets seasoned with carom seeds and lemon, char-grilled (8 pcs)',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bbq-12',
    name: 'Reshmi Kabab',
    price: 1240,
    description: 'Silky smooth chicken mince blended with cream, eggs, and mild spices',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── BBQ Platters ──────────────────────────────────────────────────
  {
    id: 'platter-1',
    name: 'BBQ Platter Large (4 Persons)',
    price: 4990,
    description: '36 Pcs Rich Variety of BBQ Served with Aromatic Rice & 2 Tandoori Naan (Feeds 4)',
    category: 'BBQ Platters',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'platter-2',
    name: 'BBQ Platter Small (2 Persons)',
    price: 2690,
    description: '18 Pcs Rich Variety of BBQ Served with Aromatic Rice & 2 Tandoori Naan (Feeds 2)',
    category: 'BBQ Platters',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'platter-3',
    name: 'Shehnsha Platter Large',
    price: 2690,
    description: '12 Pcs Rich Variety of BBQ Served with Aromatic Rice & 2 Tandoori Naan',
    category: 'BBQ Platters',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'platter-4',
    name: 'Shehnsha Platter Small',
    price: 2890,
    description: '6 Pcs Rich Variety of BBQ Served with Aromatic Rice & 2 Tandoori Naan',
    category: 'BBQ Platters',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Vegetable Daal ────────────────────────────────────────────────
  {
    id: 'veg-1',
    name: 'Mix Vegetable',
    price: 990,
    description: 'Fresh seasonal vegetables cooked with cumin, coriander, and gentle aromatic spices',
    category: 'Vegetable & Daal',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'veg-2',
    name: 'Daal Mash',
    price: 990,
    description: 'Dry white lentils tempered with desi ghee, ginger juliennes and fresh green chillies',
    category: 'Vegetable & Daal',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'veg-3',
    name: 'Palak Paneer',
    price: 1050,
    description: 'Fresh cottage cheese cubes simmered in a spiced creamy spinach purée',
    category: 'Vegetable & Daal',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'veg-4',
    name: 'Daal Makhni',
    price: 1400,
    description: 'Slow-cooked whole black lentils simmered overnight with butter, cream and tomatoes',
    category: 'Vegetable & Daal',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'veg-5',
    name: 'Daal Mash Achari',
    price: 1050,
    description: 'Savory white lentils infused with tangy pickling spices and green chillies',
    category: 'Vegetable & Daal',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Add ons (Breads) ──────────────────────────────────────────────
  {
    id: 'bread-1',
    name: 'Cheese Naan (Starter)',
    price: 490,
    description: 'Fresh tandoori naan overflowing with melted mozzarella cheese',
    category: 'Add ons (Breads)',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bread-2',
    name: 'Roti',
    price: 30,
    description: 'Fresh whole wheat tandoori flatbread',
    category: 'Add ons (Breads)',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bread-3',
    name: 'Haandi Special Naan',
    price: 190,
    description: 'Signature soft tandoori naan brushed with butter and sesame seeds',
    category: 'Add ons (Breads)',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bread-4',
    name: 'Roghni Naan',
    price: 150,
    description: 'Soft pillowy naan prepared with milk, egg, and brushed with desi ghee',
    category: 'Add ons (Breads)',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bread-5',
    name: 'Kalwanji Naan',
    price: 180,
    description: 'Tandoori naan topped with aromatic black nigella seeds',
    category: 'Add ons (Breads)',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bread-6',
    name: 'Garlic Naan',
    price: 185,
    description: 'Tandoori naan brushed with roasted garlic butter and fresh coriander',
    category: 'Add ons (Breads)',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bread-7',
    name: 'Khamiri Roti',
    price: 50,
    description: 'Traditional leavened thick tandoori flatbread',
    category: 'Add ons (Breads)',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Dessert ───────────────────────────────────────────────────────
  {
    id: 'dessert-1',
    name: 'Kheer',
    price: 350,
    description: 'Slow-cooked traditional rice and milk pudding with crushed cardamom and pistachio',
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'dessert-2',
    name: 'Ghulab Jamon',
    price: 490,
    description: 'Warm soft milk dumplings soaked in cardamom rose syrup, garnished with nuts',
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'dessert-3',
    name: 'Rasmalai',
    price: 390,
    description: 'Delicate cottage cheese discs soaked in sweetened thickened saffron milk',
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'dessert-4',
    name: 'Suji Halwa',
    price: 300,
    description: 'Traditional semolina halwa cooked in pure desi ghee with roasted dry fruits',
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },

  // ─── Bar (Drinks & Mocktails) ──────────────────────────────────────
  {
    id: 'bar-1',
    name: 'Mojito',
    price: 450,
    description: 'Crushed fresh mint, lime, cane sugar, and sparkling soda over crushed ice',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-2',
    name: 'Fresh Lime',
    price: 250,
    description: 'Freshly squeezed lime juice with sparkling water or 7Up',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-3',
    name: 'Lemonade',
    price: 350,
    description: 'Chilled freshly prepared sweet & zesty lemon cooler',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-4',
    name: 'Cocktail',
    price: 490,
    description: 'Exotic blend of tropical fruit juices over crushed ice',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-5',
    name: 'Margarita',
    price: 350,
    description: 'Zesty frozen citrus mocktail served in a salt-rimmed glass',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-6',
    name: 'Smoothie',
    price: 490,
    description: 'Thick, creamy blend of fresh yogurt and seasonal fruits',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-7',
    name: 'Cold Coffee',
    price: 490,
    description: 'Chilled blended espresso with creamy milk and vanilla ice cream',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-8',
    name: 'Fresh Seasonal Juices',
    price: 550,
    description: '100% natural, freshly squeezed seasonal fruit juice',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-9',
    name: 'Pina Colada',
    price: 410,
    description: 'Creamy pineapple juice blended with rich coconut cream and crushed ice',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bar-10',
    name: 'Saudi Shampion',
    price: 1600,
    description: 'Sparkling apple cider punch infused with sliced fresh oranges, apples, and mint',
    category: 'Bar',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr'],
    variations: [
      { name: 'Half', price: 800 },
      { name: 'Full', price: 1600 }
    ]
  },

  // ─── Beverages ─────────────────────────────────────────────────────
  {
    id: 'bev-1',
    name: 'Mineral Small Water',
    price: 80,
    description: 'Small bottled natural drinking water (500ml)',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bev-2',
    name: 'Mineral Large Water',
    price: 180,
    description: 'Large bottled natural drinking water (1.5L)',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bev-3',
    name: 'Soft Drink Can',
    price: 180,
    description: 'Chilled carbonated beverage can (250ml) - Coke, Sprite, Fanta',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bev-4',
    name: 'Green Tea',
    price: 170,
    description: 'Light fragrant herbal green tea brewed with cardamom',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  },
  {
    id: 'bev-5',
    name: 'Karak Tea',
    price: 250,
    description: 'Rich, creamy strong spiced milk tea simmered with cardamom and saffron',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    branchesAvailable: ['br-isb', 'br-lhr']
  }
];
