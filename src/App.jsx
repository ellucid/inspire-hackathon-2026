import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, ChevronRight, Star, Award, TrendingDown, Clock, AlertCircle, Check, Gift, Trophy, Target, Flame, Upload, X, Edit } from 'lucide-react';
import Tesseract from 'tesseract.js';
import axios from 'axios';

const FreshKeepApp = () => {
  console.log('FreshKeepApp component rendering...');
  console.log('React version:', React.version);
  
  const [activeTab, setActiveTab] = useState('kitchen');
  const [userPoints, setUserPoints] = useState(250);
  const [badges, setBadges] = useState(['Waste Warrior', 'Recipe Rescuer']);
  const [wastePreventedKg, setWastePreventedKg] = useState(3.2);
  const [recipesCookedCount, setRecipesCookedCount] = useState(8);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [addMethod, setAddMethod] = useState('scan'); // 'scan' or 'manual'
  const [notification, setNotification] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedItems, setScannedItems] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [leftoverName, setLeftoverName] = useState('');
  const [leftoverPortions, setLeftoverPortions] = useState(1);
  const [servings, setServings] = useState(2);

  // Manual add food form state
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualFoodType, setManualFoodType] = useState('');
  const [manualQuantity, setManualQuantity] = useState('1 unit');
  const [manualStorage, setManualStorage] = useState('Fridge');
  const [manualExpiryDays, setManualExpiryDays] = useState(7);
  const [useCustomExpiry, setUseCustomExpiry] = useState(false);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  const [foodItems, setFoodItems] = useState([
    {
      id: 1,
      name: 'Strawberries',
      category: 'Fruits',
      emoji: '🍓',
      purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      storage: 'Fridge',
      quantity: '1 lb',
      condition: 'Fresh',
      daysUntilExpiry: 1
    },
    {
      id: 2,
      name: 'Chicken Breast',
      category: 'Meat',
      emoji: '🍗',
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      storage: 'Fridge',
      quantity: '2 lbs',
      condition: 'Fresh',
      daysUntilExpiry: 2
    },
    {
      id: 3,
      name: 'Spinach',
      category: 'Vegetables',
      emoji: '🥬',
      purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now()),
      storage: 'Fridge',
      quantity: '1 bag',
      condition: 'Fresh',
      daysUntilExpiry: 0
    },
  ]);

  const [leftovers, setLeftovers] = useState([
    {
      id: 1,
      name: 'Pasta from Monday dinner',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      portions: 2,
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      daysLeft: 2
    }
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedFoodItems = localStorage.getItem('freshkeep_foodItems');
      const savedLeftovers = localStorage.getItem('freshkeep_leftovers');
      const savedUserPoints = localStorage.getItem('freshkeep_userPoints');
      const savedBadges = localStorage.getItem('freshkeep_badges');
      const savedWastePreventedKg = localStorage.getItem('freshkeep_wastePreventedKg');
      const savedRecipesCookedCount = localStorage.getItem('freshkeep_recipesCookedCount');
      
      if (savedFoodItems) {
        const items = JSON.parse(savedFoodItems);
        // Convert date strings back to Date objects
        const parsedItems = items.map(item => ({
          ...item,
          purchaseDate: new Date(item.purchaseDate),
          expiryDate: new Date(item.expiryDate)
        }));
        setFoodItems(parsedItems);
      }
      
      if (savedLeftovers) {
        const items = JSON.parse(savedLeftovers);
        const parsedItems = items.map(item => ({
          ...item,
          date: new Date(item.date),
          expiryDate: new Date(item.expiryDate)
        }));
        setLeftovers(parsedItems);
      }
      
      if (savedUserPoints) setUserPoints(parseInt(savedUserPoints));
      if (savedBadges) setBadges(JSON.parse(savedBadges));
      if (savedWastePreventedKg) setWastePreventedKg(parseFloat(savedWastePreventedKg));
      if (savedRecipesCookedCount) setRecipesCookedCount(parseInt(savedRecipesCookedCount));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('freshkeep_foodItems');
      localStorage.removeItem('freshkeep_leftovers');
      localStorage.removeItem('freshkeep_userPoints');
      localStorage.removeItem('freshkeep_badges');
      localStorage.removeItem('freshkeep_wastePreventedKg');
      localStorage.removeItem('freshkeep_recipesCookedCount');
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, []);

  // Save foodItems to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem('freshkeep_foodItems', JSON.stringify(foodItems));
    }
  }, [foodItems, hasLoadedFromStorage]);

  // Save leftovers to localStorage whenever they change
  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem('freshkeep_leftovers', JSON.stringify(leftovers));
    }
  }, [leftovers, hasLoadedFromStorage]);

  // Save user stats to localStorage
  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem('freshkeep_userPoints', userPoints.toString());
    }
  }, [userPoints, hasLoadedFromStorage]);

  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem('freshkeep_badges', JSON.stringify(badges));
    }
  }, [badges, hasLoadedFromStorage]);

  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem('freshkeep_wastePreventedKg', wastePreventedKg.toString());
    }
  }, [wastePreventedKg, hasLoadedFromStorage]);

  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem('freshkeep_recipesCookedCount', recipesCookedCount.toString());
    }
  }, [recipesCookedCount, hasLoadedFromStorage]);

  // Track recipe count and notify when new AI recipes become available
  const [previousRecipeCount, setPreviousRecipeCount] = useState(0);

  // Expanded food database
  const FOOD_DATABASE = {
    'Strawberries': { days: 3, fridge: 7, freezer: 365, category: 'Fruits', emoji: '🍓' },
    'Bananas': { days: 5, fridge: 7, freezer: 60, category: 'Fruits', emoji: '🍌' },
    'Apples': { days: 7, fridge: 30, freezer: 365, category: 'Fruits', emoji: '🍎' },
    'Peaches': { days: 3, fridge: 5, freezer: 365, category: 'Fruits', emoji: '🍑' },
    'Oranges': { days: 7, fridge: 21, freezer: 180, category: 'Fruits', emoji: '🍊' },
    'Grapes': { days: 3, fridge: 7, freezer: 365, category: 'Fruits', emoji: '🍇' },
    'Blueberries': { days: 3, fridge: 10, freezer: 365, category: 'Fruits', emoji: '🫐' },
    'Raspberries': { days: 3, fridge: 5, freezer: 365, category: 'Fruits', emoji: '🍒' },
    'Blackberries': { days: 3, fridge: 7, freezer: 365, category: 'Fruits', emoji: '🫐' },
    'Avocado': { days: 3, fridge: 7, freezer: 180, category: 'Fruits', emoji: '🥑' },
    'Watermelon': { days: 3, fridge: 7, freezer: 365, category: 'Fruits', emoji: '🍉' },
    
    'Chicken': { days: 2, fridge: 2, freezer: 270, category: 'Meat', emoji: '🍗' },
    'Ground Beef': { days: 2, fridge: 2, freezer: 120, category: 'Meat', emoji: '🥩' },
    'Pork Chops': { days: 2, fridge: 3, freezer: 180, category: 'Meat', emoji: '🥓' },
    'Salmon': { days: 1, fridge: 2, freezer: 90, category: 'Meat', emoji: '🐟' },
    'Bacon': { days: 7, fridge: 14, freezer: 180, category: 'Meat', emoji: '🥓' },
    
    'Milk': { days: 7, fridge: 7, freezer: 90, category: 'Dairy', emoji: '🥛' },
    'Eggs': { days: 21, fridge: 35, freezer: 365, category: 'Dairy', emoji: '🥚' },
    'Yogurt': { days: 14, fridge: 21, freezer: 60, category: 'Dairy', emoji: '🥄' },
    'Cheese': { days: 14, fridge: 30, freezer: 180, category: 'Dairy', emoji: '🧀' },
    'Butter': { days: 30, fridge: 90, freezer: 365, category: 'Dairy', emoji: '🧈' },
    
    'Spinach': { days: 3, fridge: 7, freezer: 180, category: 'Vegetables', emoji: '🥬' },
    'Collard Greens': { days: 3, fridge: 7, freezer: 365, category: 'Vegetables', emoji: '🥬' },
    'Tomatoes': { days: 5, fridge: 10, freezer: 60, category: 'Vegetables', emoji: '🍅' },
    'Carrots': { days: 14, fridge: 30, freezer: 365, category: 'Vegetables', emoji: '🥕' },
    'Broccoli': { days: 3, fridge: 7, freezer: 365, category: 'Vegetables', emoji: '🥦' },
    'Lettuce': { days: 3, fridge: 7, freezer: 30, category: 'Vegetables', emoji: '🥬' },
    'Peppers': { days: 5, fridge: 10, freezer: 365, category: 'Vegetables', emoji: '🫑' },
    'Onions': { days: 30, fridge: 60, freezer: 180, category: 'Vegetables', emoji: '🧅' },
    'Garlic': { days: 90, fridge: 180, freezer: 365, category: 'Vegetables', emoji: '🧄' },
    'Potatoes': { days: 30, fridge: 60, freezer: 365, category: 'Vegetables', emoji: '🥔' },
    'Cucumber': { days: 5, fridge: 7, freezer: 60, category: 'Vegetables', emoji: '🥒' },
    'Mushrooms': { days: 5, fridge: 7, freezer: 365, category: 'Vegetables', emoji: '🍄' },
    
    'Bread': { days: 5, fridge: 7, freezer: 90, category: 'Grains', emoji: '🍞' },
    'Rice': { days: 365, fridge: 365, freezer: 730, category: 'Grains', emoji: '🍚' },
    'Pasta': { days: 365, fridge: 365, freezer: 730, category: 'Grains', emoji: '🍝' },
    'Cereal': { days: 180, fridge: 180, freezer: 365, category: 'Grains', emoji: '🥣' },
    'Tortillas': { days: 7, fridge: 14, freezer: 90, category: 'Grains', emoji: '🌯' },
    
    'Peanut Butter': { days: 180, fridge: 365, freezer: 730, category: 'Other', emoji: '🥜' },
    
    'Orange Juice': { days: 7, fridge: 14, freezer: 365, category: 'Beverages', emoji: '🧃' },
    'Soda': { days: 180, fridge: 180, freezer: 365, category: 'Beverages', emoji: '🥤' },
  };

  const recipes = [
    {
      id: 1,
      name: 'Strawberry Spinach Salad',
      ingredients: ['Strawberries', 'Spinach'],
      detailedIngredients: [
        '2 cups fresh strawberries, sliced',
        '4 cups baby spinach',
        '1/4 cup crumbled feta cheese',
        '1/4 cup sliced almonds',
        '2 tbsp balsamic vinegar',
        '3 tbsp olive oil',
        'Salt and pepper to taste'
      ],
      time: 15,
      difficulty: 'Easy',
      cuisine: 'American',
      steps: [
        'Wash and slice strawberries',
        'Place spinach in a large bowl',
        'Add sliced strawberries on top',
        'Sprinkle with crumbled feta cheese and sliced almonds',
        'In a small bowl, whisk together balsamic vinegar and olive oil',
        'Drizzle dressing over salad',
        'Season with salt and pepper',
        'Toss gently and serve immediately'
      ],
      emoji: '🥗',
      isAiGenerated: false
    },
    {
      id: 2,
      name: 'Garlic Spinach Chicken',
      ingredients: ['Chicken Breast', 'Spinach'],
      detailedIngredients: [
        '2 large chicken breasts',
        '3 cups fresh spinach',
        '4 cloves garlic, minced',
        '1/2 cup heavy cream',
        '1/4 cup parmesan cheese, grated',
        '2 tbsp olive oil',
        'Salt and pepper to taste',
        '1/2 tsp Italian seasoning'
      ],
      time: 25,
      difficulty: 'Medium',
      cuisine: 'Italian',
      steps: [
        'Season chicken breasts with salt, pepper, and Italian seasoning',
        'Heat olive oil in a large skillet over medium-high heat',
        'Add chicken and cook 6-8 minutes per side until golden and cooked through',
        'Remove chicken and set aside',
        'In the same pan, add minced garlic and sauté for 1 minute until fragrant',
        'Add spinach and cook until wilted, about 2-3 minutes',
        'Pour in heavy cream and bring to a simmer',
        'Stir in parmesan cheese until melted',
        'Return chicken to pan and coat with sauce',
        'Simmer for 5 minutes',
        'Serve hot with pasta or rice'
      ],
      emoji: '🍗',
      isAiGenerated: false
    },
    {
      id: 3,
      name: 'Quick Berry Smoothie',
      ingredients: ['Strawberries'],
      detailedIngredients: [
        '1 cup fresh strawberries, hulled',
        '1 cup Greek yogurt',
        '1/2 cup milk or almond milk',
        '2 tbsp honey',
        '1 cup ice cubes',
        '1/2 tsp vanilla extract (optional)'
      ],
      time: 5,
      difficulty: 'Easy',
      cuisine: 'American',
      steps: [
        'Hull and wash strawberries',
        'Add strawberries to blender',
        'Add Greek yogurt, milk, and honey',
        'Add vanilla extract if using',
        'Add ice cubes',
        'Blend on high until smooth and creamy',
        'Taste and add more honey if desired',
        'Pour into glasses and serve immediately',
        'Optional: garnish with a strawberry slice'
      ],
      emoji: '🥤',
      isAiGenerated: false
    }
  ];

  // AI Recipe Generator - generates recipes based on available ingredients
  const generateAIRecipes = () => {
    const aiRecipeTemplates = [
      {
        id: 100,
        name: 'Honey Garlic Chicken Stir-Fry',
        ingredients: ['Chicken Breast'],
        detailedIngredients: [
          '1 lb chicken breast, cubed',
          '3 tbsp honey',
          '3 cloves garlic, minced',
          '2 tbsp soy sauce',
          '1 tbsp olive oil',
          '1 tsp ginger, minced',
          '2 cups mixed vegetables',
          'Sesame seeds for garnish'
        ],
        time: 20,
        difficulty: 'Easy',
        cuisine: 'Asian',
        steps: [
          'Heat oil in a wok or large skillet over high heat',
          'Add chicken and cook until golden, about 5-6 minutes',
          'Add garlic and ginger, stir for 30 seconds',
          'Mix honey and soy sauce in a bowl',
          'Pour sauce over chicken',
          'Add vegetables and stir-fry for 3-4 minutes',
          'Garnish with sesame seeds',
          'Serve over rice or noodles'
        ],
        emoji: '🍜',
        isAiGenerated: true
      },
      {
        id: 101,
        name: 'Creamy Tomato Pasta',
        ingredients: ['Tomatoes'],
        detailedIngredients: [
          '4 large tomatoes, diced',
          '8 oz pasta of choice',
          '1/2 cup heavy cream',
          '3 cloves garlic, minced',
          '2 tbsp olive oil',
          '1/4 cup fresh basil',
          '1/4 cup parmesan cheese',
          'Salt and pepper to taste'
        ],
        time: 25,
        difficulty: 'Easy',
        cuisine: 'Italian',
        steps: [
          'Cook pasta according to package directions',
          'Heat olive oil in a large pan',
          'Sauté garlic until fragrant',
          'Add diced tomatoes and cook until soft, about 8 minutes',
          'Stir in heavy cream and simmer for 5 minutes',
          'Add cooked pasta to sauce',
          'Toss with fresh basil and parmesan',
          'Season with salt and pepper and serve'
        ],
        emoji: '🍝',
        isAiGenerated: true
      },
      {
        id: 102,
        name: 'Spinach and Feta Quesadilla',
        ingredients: ['Spinach'],
        detailedIngredients: [
          '2 cups fresh spinach',
          '4 large tortillas',
          '1 cup shredded cheese',
          '1/2 cup crumbled feta',
          '2 tbsp olive oil',
          '1/4 cup diced onion',
          'Sour cream for serving',
          'Salsa for serving'
        ],
        time: 15,
        difficulty: 'Easy',
        cuisine: 'Mexican',
        steps: [
          'Sauté onion in olive oil until soft',
          'Add spinach and cook until wilted',
          'Place tortilla in a pan',
          'Spread spinach mixture on half of the tortilla',
          'Sprinkle with cheese and feta',
          'Fold tortilla in half',
          'Cook until golden brown on both sides, about 3 minutes per side',
          'Cut into wedges and serve with sour cream and salsa'
        ],
        emoji: '🌮',
        isAiGenerated: true
      },
      {
        id: 103,
        name: 'Baked Salmon with Lemon',
        ingredients: ['Salmon'],
        detailedIngredients: [
          '2 salmon fillets',
          '2 lemons, sliced',
          '3 cloves garlic, minced',
          '2 tbsp olive oil',
          '1 tbsp fresh dill',
          'Salt and pepper to taste',
          '1/4 cup white wine (optional)'
        ],
        time: 30,
        difficulty: 'Easy',
        cuisine: 'American',
        steps: [
          'Preheat oven to 400°F (200°C)',
          'Place salmon in a baking dish',
          'Drizzle with olive oil',
          'Top with garlic, lemon slices, and dill',
          'Season with salt and pepper',
          'Pour white wine around the salmon if using',
          'Bake for 15-20 minutes until fish flakes easily',
          'Serve with roasted vegetables or rice'
        ],
        emoji: '🐟',
        isAiGenerated: true
      },
      {
        id: 104,
        name: 'Banana Oat Pancakes',
        ingredients: ['Bananas'],
        detailedIngredients: [
          '2 ripe bananas, mashed',
          '2 eggs',
          '1 cup rolled oats',
          '1 tsp vanilla extract',
          '1 tsp baking powder',
          '1/2 tsp cinnamon',
          'Butter for cooking',
          'Maple syrup for serving'
        ],
        time: 20,
        difficulty: 'Easy',
        cuisine: 'American',
        steps: [
          'Mash bananas in a bowl',
          'Add eggs and vanilla, mix well',
          'Blend oats in a food processor until flour-like',
          'Add oat flour, baking powder, and cinnamon to banana mixture',
          'Heat butter in a pan over medium heat',
          'Pour batter to form pancakes',
          'Cook until bubbles form, then flip',
          'Cook until golden brown',
          'Serve with maple syrup and fresh fruit'
        ],
        emoji: '🥞',
        isAiGenerated: true
      },
      {
        id: 105,
        name: 'Caprese Salad',
        ingredients: ['Tomatoes'],
        detailedIngredients: [
          '3 large tomatoes, sliced',
          '8 oz fresh mozzarella, sliced',
          '1/4 cup fresh basil leaves',
          '3 tbsp balsamic glaze',
          '2 tbsp extra virgin olive oil',
          'Sea salt to taste',
          'Black pepper to taste'
        ],
        time: 10,
        difficulty: 'Easy',
        cuisine: 'Italian',
        steps: [
          'Slice tomatoes and mozzarella into 1/4 inch slices',
          'Arrange alternating slices on a platter',
          'Tuck basil leaves between slices',
          'Drizzle with olive oil',
          'Drizzle with balsamic glaze',
          'Sprinkle with sea salt and black pepper',
          'Serve immediately at room temperature'
        ],
        emoji: '🍅',
        isAiGenerated: true
      },
      {
        id: 106,
        name: 'Apple Cinnamon Oatmeal',
        ingredients: ['Apples'],
        detailedIngredients: [
          '2 apples, diced',
          '2 cups rolled oats',
          '4 cups water or milk',
          '2 tsp cinnamon',
          '2 tbsp brown sugar',
          '1 tsp vanilla extract',
          '1/4 cup raisins (optional)',
          'Chopped walnuts for topping'
        ],
        time: 15,
        difficulty: 'Easy',
        cuisine: 'American',
        steps: [
          'Bring water or milk to a boil',
          'Add oats and reduce heat to simmer',
          'Stir in diced apples and cinnamon',
          'Cook for 5-7 minutes, stirring occasionally',
          'Add brown sugar, vanilla, and raisins',
          'Cook until oats are creamy',
          'Serve in bowls topped with walnuts',
          'Drizzle with honey if desired'
        ],
        emoji: '🍎',
        isAiGenerated: true
      },
      {
        id: 107,
        name: 'Veggie Egg Scramble',
        ingredients: ['Eggs', 'Spinach', 'Tomatoes'],
        detailedIngredients: [
          '4 eggs',
          '1 cup spinach, chopped',
          '1 tomato, diced',
          '1/4 cup cheese, shredded',
          '2 tbsp milk',
          '1 tbsp butter',
          'Salt and pepper to taste',
          'Hot sauce (optional)'
        ],
        time: 10,
        difficulty: 'Easy',
        cuisine: 'American',
        steps: [
          'Whisk eggs with milk, salt, and pepper',
          'Melt butter in a non-stick pan',
          'Add spinach and tomato, sauté for 2 minutes',
          'Pour in egg mixture',
          'Stir gently as eggs cook',
          'When nearly set, add cheese',
          'Continue stirring until eggs are fully cooked',
          'Serve hot with toast'
        ],
        emoji: '🍳',
        isAiGenerated: true
      },
      {
        id: 108,
        name: 'Teriyaki Beef Bowl',
        ingredients: ['Beef'],
        detailedIngredients: [
          '1 lb beef sirloin, sliced thin',
          '1/4 cup teriyaki sauce',
          '2 tbsp sesame oil',
          '3 cloves garlic, minced',
          '1 tbsp fresh ginger, grated',
          '2 cups cooked rice',
          '2 green onions, sliced',
          'Sesame seeds for garnish'
        ],
        time: 25,
        difficulty: 'Easy',
        cuisine: 'Asian',
        steps: [
          'Heat sesame oil in a large skillet or wok',
          'Add garlic and ginger, sauté for 1 minute',
          'Add beef slices and cook until browned',
          'Pour teriyaki sauce over beef',
          'Simmer for 3-5 minutes until sauce thickens',
          'Serve over hot rice',
          'Garnish with green onions and sesame seeds',
          'Optional: add steamed vegetables'
        ],
        emoji: '🥩',
        isAiGenerated: true
      },
      {
        id: 109,
        name: 'Mediterranean Quinoa Bowl',
        ingredients: ['Cucumbers', 'Tomatoes'],
        detailedIngredients: [
          '1 cup quinoa, cooked',
          '1 cucumber, diced',
          '2 tomatoes, diced',
          '1/2 cup feta cheese, crumbled',
          '1/4 cup kalamata olives',
          '3 tbsp olive oil',
          '2 tbsp lemon juice',
          'Fresh parsley for garnish'
        ],
        time: 15,
        difficulty: 'Easy',
        cuisine: 'Mediterranean',
        steps: [
          'Cook quinoa according to package directions',
          'Let quinoa cool slightly',
          'Dice cucumber and tomatoes',
          'In a large bowl, combine quinoa and vegetables',
          'Add feta cheese and olives',
          'Drizzle with olive oil and lemon juice',
          'Toss gently to combine',
          'Garnish with fresh parsley and serve'
        ],
        emoji: '🥗',
        isAiGenerated: true
      },
      {
        id: 110,
        name: 'BBQ Pulled Pork Sandwich',
        ingredients: ['Pork'],
        detailedIngredients: [
          '2 lbs pork shoulder',
          '1 cup BBQ sauce',
          '1/2 cup apple cider vinegar',
          '2 tbsp brown sugar',
          '1 tbsp paprika',
          '1 tsp garlic powder',
          '4 hamburger buns',
          'Coleslaw for topping'
        ],
        time: 45,
        difficulty: 'Medium',
        cuisine: 'American',
        steps: [
          'Season pork with paprika, garlic powder, and brown sugar',
          'Place in slow cooker or pot',
          'Add vinegar and half the BBQ sauce',
          'Cook on low for 4-6 hours until tender',
          'Shred pork with two forks',
          'Mix in remaining BBQ sauce',
          'Toast buns lightly',
          'Serve pork on buns topped with coleslaw'
        ],
        emoji: '🥪',
        isAiGenerated: true
      },
      {
        id: 111,
        name: 'Shrimp Fried Rice',
        ingredients: ['Shrimp', 'Rice'],
        detailedIngredients: [
          '1 lb shrimp, peeled and deveined',
          '3 cups cooked rice (day-old works best)',
          '2 eggs, beaten',
          '1 cup mixed vegetables',
          '3 tbsp soy sauce',
          '2 tbsp sesame oil',
          '3 cloves garlic, minced',
          'Green onions for garnish'
        ],
        time: 20,
        difficulty: 'Easy',
        cuisine: 'Asian',
        steps: [
          'Heat sesame oil in a large wok',
          'Add shrimp and cook until pink, set aside',
          'Scramble eggs in the wok, set aside',
          'Add garlic and mixed vegetables, stir-fry 3 minutes',
          'Add cold rice, breaking up clumps',
          'Return shrimp and eggs to wok',
          'Pour soy sauce over everything',
          'Toss well and serve hot with green onions'
        ],
        emoji: '🍤',
        isAiGenerated: true
      },
      {
        id: 112,
        name: 'Mushroom Risotto',
        ingredients: ['Mushrooms', 'Rice'],
        detailedIngredients: [
          '2 cups arborio rice',
          '2 cups mushrooms, sliced',
          '6 cups chicken or vegetable broth',
          '1/2 cup white wine',
          '1/2 cup parmesan cheese',
          '2 tbsp butter',
          '1 onion, diced',
          'Fresh thyme for garnish'
        ],
        time: 40,
        difficulty: 'Medium',
        cuisine: 'Italian',
        steps: [
          'Heat broth in a pot and keep warm',
          'Sauté onion in butter until soft',
          'Add mushrooms and cook until browned',
          'Add rice and stir for 2 minutes',
          'Add wine and stir until absorbed',
          'Add broth one ladle at a time, stirring constantly',
          'Continue until rice is creamy and al dente',
          'Stir in parmesan and serve with thyme'
        ],
        emoji: '🍄',
        isAiGenerated: true
      },
      {
        id: 113,
        name: 'Fish Tacos',
        ingredients: ['Fish', 'Cabbage'],
        detailedIngredients: [
          '1 lb white fish fillets',
          '2 cups cabbage, shredded',
          '8 corn tortillas',
          '1/2 cup sour cream',
          '1 lime, juiced',
          '1 tsp cumin',
          '1 tsp chili powder',
          'Fresh cilantro for garnish'
        ],
        time: 25,
        difficulty: 'Easy',
        cuisine: 'Mexican',
        steps: [
          'Season fish with cumin and chili powder',
          'Grill or pan-fry fish until cooked through',
          'Break fish into chunks',
          'Warm tortillas in a dry pan',
          'Mix sour cream with lime juice',
          'Place fish on tortillas',
          'Top with shredded cabbage',
          'Drizzle with lime crema and garnish with cilantro'
        ],
        emoji: '🌮',
        isAiGenerated: true
      },
      {
        id: 114,
        name: 'Berry Smoothie Bowl',
        ingredients: ['Strawberries', 'Bananas'],
        detailedIngredients: [
          '1 cup frozen strawberries',
          '1 frozen banana',
          '1/2 cup Greek yogurt',
          '1/4 cup milk',
          '1 tbsp honey',
          'Granola for topping',
          'Fresh berries for topping',
          'Chia seeds for topping'
        ],
        time: 10,
        difficulty: 'Easy',
        cuisine: 'American',
        steps: [
          'Add frozen fruit, yogurt, and milk to blender',
          'Blend until smooth and thick',
          'Pour into a bowl',
          'Arrange fresh berries on top',
          'Sprinkle with granola',
          'Add chia seeds',
          'Drizzle with honey',
          'Serve immediately with a spoon'
        ],
        emoji: '🍓',
        isAiGenerated: true
      },
      {
        id: 115,
        name: 'Chicken Curry',
        ingredients: ['Chicken Breast', 'Potatoes'],
        detailedIngredients: [
          '1.5 lbs chicken breast, cubed',
          '2 potatoes, cubed',
          '1 can coconut milk',
          '3 tbsp curry powder',
          '1 onion, diced',
          '3 cloves garlic, minced',
          '1 tbsp ginger, grated',
          'Fresh cilantro for garnish'
        ],
        time: 35,
        difficulty: 'Medium',
        cuisine: 'Asian',
        steps: [
          'Heat oil in a large pot',
          'Sauté onion until soft',
          'Add garlic, ginger, and curry powder',
          'Add chicken and brown on all sides',
          'Add potatoes and stir to coat',
          'Pour in coconut milk',
          'Simmer for 20-25 minutes until potatoes are tender',
          'Garnish with cilantro and serve over rice'
        ],
        emoji: '🍛',
        isAiGenerated: true
      },
      {
        id: 116,
        name: 'Greek Pita Pocket',
        ingredients: ['Cucumbers', 'Tomatoes', 'Lettuce'],
        detailedIngredients: [
          '4 pita breads',
          '1 cucumber, sliced',
          '2 tomatoes, diced',
          '1 cup lettuce, shredded',
          '1/2 cup feta cheese',
          '1/2 cup hummus',
          '1/4 cup tzatziki sauce',
          'Fresh mint for garnish'
        ],
        time: 15,
        difficulty: 'Easy',
        cuisine: 'Mediterranean',
        steps: [
          'Warm pita breads slightly',
          'Slice pita to create pockets',
          'Spread hummus inside each pocket',
          'Layer cucumber, tomatoes, and lettuce',
          'Crumble feta cheese on top',
          'Drizzle with tzatziki sauce',
          'Add fresh mint leaves',
          'Serve immediately'
        ],
        emoji: '🥙',
        isAiGenerated: true
      },
      {
        id: 117,
        name: 'Sweet Potato Hash',
        ingredients: ['Sweet Potatoes', 'Eggs'],
        detailedIngredients: [
          '2 sweet potatoes, diced',
          '4 eggs',
          '1 onion, diced',
          '1 bell pepper, diced',
          '2 tbsp olive oil',
          '1 tsp paprika',
          'Salt and pepper to taste',
          'Fresh parsley for garnish'
        ],
        time: 30,
        difficulty: 'Easy',
        cuisine: 'American',
        steps: [
          'Heat olive oil in a large skillet',
          'Add sweet potatoes and cook for 10 minutes',
          'Add onion and bell pepper',
          'Season with paprika, salt, and pepper',
          'Cook until potatoes are crispy and tender',
          'Make 4 wells in the hash',
          'Crack an egg into each well',
          'Cover and cook until eggs are set, garnish with parsley'
        ],
        emoji: '🍠',
        isAiGenerated: true
      },
      {
        id: 118,
        name: 'Pesto Pasta with Chicken',
        ingredients: ['Chicken Breast', 'Tomatoes'],
        detailedIngredients: [
          '12 oz pasta',
          '2 chicken breasts, sliced',
          '1/2 cup pesto sauce',
          '1 cup cherry tomatoes, halved',
          '1/4 cup parmesan cheese',
          '2 tbsp olive oil',
          'Fresh basil for garnish',
          'Salt and pepper to taste'
        ],
        time: 25,
        difficulty: 'Easy',
        cuisine: 'Italian',
        steps: [
          'Cook pasta according to package directions',
          'Season chicken with salt and pepper',
          'Heat olive oil in a pan',
          'Cook chicken until golden and cooked through',
          'Add cherry tomatoes and cook for 2 minutes',
          'Drain pasta and return to pot',
          'Toss pasta with pesto sauce',
          'Add chicken and tomatoes, serve with parmesan'
        ],
        emoji: '🍝',
        isAiGenerated: true
      },
      {
        id: 119,
        name: 'Black Bean Burrito',
        ingredients: ['Black Beans', 'Rice'],
        detailedIngredients: [
          '2 cups black beans, cooked',
          '2 cups rice, cooked',
          '4 large tortillas',
          '1 cup shredded cheese',
          '1 cup salsa',
          '1/2 cup sour cream',
          '1 avocado, sliced',
          'Fresh cilantro for garnish'
        ],
        time: 15,
        difficulty: 'Easy',
        cuisine: 'Mexican',
        steps: [
          'Warm tortillas in a pan',
          'Layer rice in the center of each tortilla',
          'Add black beans on top of rice',
          'Sprinkle with shredded cheese',
          'Add salsa and sour cream',
          'Place avocado slices',
          'Fold sides in and roll tightly',
          'Serve with cilantro garnish'
        ],
        emoji: '🌯',
        isAiGenerated: true
      }
    ];

    // Filter AI recipes based on available ingredients
    const availableIngredients = foodItems.map(item => item.name);
    const matchingRecipes = aiRecipeTemplates.filter(recipe => 
      recipe.ingredients.some(ing => availableIngredients.includes(ing))
    );

    // Combine base recipes with matching AI recipes
    return [...recipes, ...matchingRecipes];
  };

  // Function to scale recipe ingredients based on servings
  const scaleIngredient = (ingredient, servings) => {
    const baseServings = 2; // Default servings for recipes
    const scaleFactor = servings / baseServings;
    
    // Extract numbers from ingredient string
    const numberPattern = /(\d+\.?\d*|\d*\.?\d+)/g;
    const numbers = ingredient.match(numberPattern);
    
    if (!numbers) return ingredient; // No numbers to scale
    
    let scaledIngredient = ingredient;
    numbers.forEach(num => {
      const originalNum = parseFloat(num);
      const scaledNum = (originalNum * scaleFactor).toFixed(2).replace(/\.?0+$/, ''); // Remove trailing zeros
      // Replace the first occurrence of this number
      scaledIngredient = scaledIngredient.replace(num, scaledNum);
    });
    
    return scaledIngredient;
  };

  const scaleRecipeIngredients = (recipe, servings) => {
    return {
      ...recipe,
      detailedIngredients: recipe.detailedIngredients.map(ing => scaleIngredient(ing, servings))
    };
  };

  // Get all recipes (base + AI generated)
  const allRecipes = generateAIRecipes();

  // Filter recipes by cuisine
  const filteredRecipes = cuisineFilter === 'All' 
    ? allRecipes 
    : allRecipes.filter(recipe => recipe.cuisine === cuisineFilter);

  // Notify when new AI recipes become available (DISABLED - removed popup)
  useEffect(() => {
    const aiRecipeCount = allRecipes.filter(r => r.isAiGenerated).length;
    // Removed notification popup
    setPreviousRecipeCount(aiRecipeCount);
  }, [foodItems.length]);

  const challenges = [
    {
      id: 1,
      name: 'Zero Waste Week',
      description: "Don't waste any food for 7 days",
      progress: 4,
      total: 7,
      reward: '500 points + Zero Waste Champion badge',
      icon: '♻️'
    },
    {
      id: 2,
      name: 'Recipe Rescuer',
      description: 'Cook 10 recipes using expiring ingredients',
      progress: recipesCookedCount,
      total: 10,
      reward: '300 points + Chef badge',
      icon: '👨‍🍳'
    },
    {
      id: 3,
      name: 'Weekly Waste Goal',
      description: 'Prevent 5kg of food waste this week',
      progress: wastePreventedKg,
      total: 5.0,
      reward: '200 points',
      icon: '🎯'
    }
  ];

  const getFreshnessStatus = (days) => {
    if (days < 0) return { status: 'expired', color: 'bg-gray-400', text: 'Expired', emoji: '💀' };
    if (days === 0) return { status: 'today', color: 'bg-orange-500', text: 'Expires Today', emoji: '⚠️' };
    if (days <= 2) return { status: 'soon', color: 'bg-red-500', text: 'Expiring Soon', emoji: '🔴' };
    if (days <= 5) return { status: 'moderate', color: 'bg-yellow-500', text: 'Use Soon', emoji: '🟡' };
    return { status: 'fresh', color: 'bg-green-500', text: 'Fresh', emoji: '🟢' };
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const deleteFood = (id) => {
    setFoodItems(foodItems.filter(f => f.id !== id));
    showNotification('Item removed from inventory');
  };

  const startEditingFood = (item) => {
    setEditingItem(item);
    setManualFoodName(item.name);
    setManualFoodType(item.category || '');
    setManualQuantity(item.quantity);
    setManualStorage(item.storage);
    setManualExpiryDays(item.daysUntilExpiry);
    setUseCustomExpiry(true);
    setShowAddFood(true);
    setAddMethod('manual');
    
    // Scroll to top to show the edit form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const saveEditedFood = () => {
    if (!manualFoodName.trim()) {
      showNotification('⚠️ Please enter a food name');
      return;
    }

    let foodData = FOOD_DATABASE[manualFoodName];
    const finalCategory = manualFoodType.trim() || (foodData ? foodData.category : 'Custom');
    
    if (!foodData && manualFoodName.trim()) {
      foodData = {
        days: manualExpiryDays,
        fridge: manualExpiryDays,
        freezer: manualExpiryDays * 2,
        category: finalCategory,
        emoji: editingItem?.emoji || '🍽️'
      };
    }

    const days = useCustomExpiry ? manualExpiryDays : (foodData[manualStorage.toLowerCase()] || foodData.days);

    const updatedItem = {
      ...editingItem,
      name: manualFoodName,
      category: finalCategory,
      emoji: foodData.emoji,
      expiryDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      storage: manualStorage,
      quantity: manualQuantity,
      daysUntilExpiry: days
    };

    setFoodItems(foodItems.map(f => f.id === editingItem.id ? updatedItem : f));
    showNotification(`✅ Updated ${manualFoodName}!`);
    
    // Reset form
    setEditingItem(null);
    setManualFoodName('');
    setManualFoodType('');
    setManualQuantity('1 unit');
    setManualStorage('Fridge');
    setManualExpiryDays(7);
    setUseCustomExpiry(false);
    setShowAddFood(false);
  };

  const updateCondition = (id, newCondition) => {
    setFoodItems(foodItems.map(f => 
      f.id === id ? { ...f, condition: newCondition } : f
    ));
    showNotification(`Condition updated to ${newCondition}`);
  };

  // Veryfi Receipt Scanning with backend API
  const simulateReceiptScan = async (file) => {
    if (!file) {
      showNotification('⚠️ Please select an image file');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    showNotification('📸 Scanning receipt with OCR...');
    
    try {
      // Use Tesseract.js for free local OCR with improved settings
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 60);
            setScanProgress(progress);
            console.log(`OCR Progress: ${progress}%`);
          }
        },
      });

      // Enhanced Tesseract parameters for better receipt recognition
      await worker.setParameters({
        // Expanded character whitelist including more special characters
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.,/-% &\'()@#:;!*',
        preserve_interword_spaces: '1',
        // Use SPARSE_TEXT mode for receipts (better for varied layouts)
        tessedit_pageseg_mode: '11',
        // Enable text order correction
        textord_heavy_nr: '1',
        // Improve character recognition
        tessedit_char_blacklist: '',
        // Enable dictionary and context-based correction
        load_system_dawg: '1',
        load_freq_dawg: '1',
        // Better line detection
        textord_min_linesize: '2.0',
        // Character confidence
        tessedit_reject_alphas_in_number_mode: '0',
      });

      console.log('🔍 Processing receipt image with enhanced OCR...');
      const { data: { text } } = await worker.recognize(file, {
        rotateAuto: true,
      });
      await worker.terminate();
      
      setScanProgress(70);
      console.log('✅ OCR Complete! Extracted text:', text);
      
      // Store the raw OCR text
      setOcrText(text);
      
      // Parse the text to find food items - improved parsing
      // Clean up common OCR errors
      const cleanedText = text
        .replace(/[|]/g, 'I')  // Replace pipes with I
        .replace(/[0O]/g, (match) => match === '0' ? '0' : 'O')  // Context-aware O/0
        .replace(/\s+/g, ' ');  // Normalize whitespace
      
      // Split by newlines, but also try to split by common receipt patterns
      let lines = cleanedText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 2);
      
      // If we got very few lines, try splitting on price patterns ($ followed by numbers)
      if (lines.length < 5) {
        console.log('⚠️ Few newlines detected, splitting on price patterns...');
        // Split before each price pattern ($X.XX)
        const pricePattern = /(\$\d+\.\d{2})/g;
        const segments = cleanedText.split(pricePattern);
        lines = [];
        
        for (let i = 0; i < segments.length - 1; i += 2) {
          // Combine text segment with its price
          const line = (segments[i] + (segments[i + 1] || '')).trim();
          if (line.length > 2) {
            lines.push(line);
          }
        }
        
        // Also try splitting on common uppercase food words
        if (lines.length < 5) {
          console.log('⚠️ Trying word-by-word scanning...');
          // Split into words and check each word/phrase
          const words = cleanedText.split(/\s+/);
          lines = [];
          
          // Create overlapping phrases (1-5 words)
          for (let i = 0; i < words.length; i++) {
            for (let len = 1; len <= 5 && i + len <= words.length; len++) {
              const phrase = words.slice(i, i + len).join(' ');
              if (phrase.length > 2) {
                lines.push(phrase);
              }
            }
          }
        }
      }
      
      console.log('📝 Processing', lines.length, 'lines/phrases...');
      console.log('📄 Full OCR text:', text);
      
      setScanProgress(75);
      
      const extractedItems = [];
      
      // Try both original and cleaned lines for better matching
      for (const line of lines) {
        console.log('🔍 Checking line:', line);
        
        // Try to match with our food database - check for ALL possible matches in the line
        const words = line.toLowerCase().split(/\s+/);
        
        // Create overlapping phrases from the line to catch all food items
        const phrasesToCheck = [];
        
        // Add the full line
        phrasesToCheck.push(line);
        
        // Add single words (important for catching individual food names)
        words.forEach(word => {
          if (word.length > 3) {  // Skip very short words
            phrasesToCheck.push(word);
          }
        });
        
        // Add 2-5 word phrases
        for (let i = 0; i < words.length; i++) {
          for (let len = 2; len <= 5 && i + len <= words.length; len++) {
            const phrase = words.slice(i, i + len).join(' ');
            phrasesToCheck.push(phrase);
          }
        }
        
        // Check each phrase for food matches
        for (const phrase of phrasesToCheck) {
          const matchedFood = matchFoodItem(phrase);
          
          if (matchedFood) {
            // Check if we already have this item
            const existingItem = extractedItems.find(item => item.name === matchedFood.name);
            
            if (!existingItem) {
              // Try to extract quantity from the original line
              const quantityMatch = line.match(/(\d+\.?\d*)\s*(lb|lbs|pound|pounds|kg|g|oz|unit|units|ct|count|ea|each|x)?/i);
              let quantity = '1 unit';
              
              if (quantityMatch) {
                const num = parseFloat(quantityMatch[1]);
                const unit = quantityMatch[2] || 'unit';
                quantity = `${num} ${unit}`;
              }
              
              // Try to extract price
              const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
              const price = priceMatch ? `$${priceMatch[1]}` : '$0.00';
              
            extractedItems.push({
              name: matchedFood.name,
              quantity: quantity,
              price: price,
              originalLine: line,
              confidence: 'high',
              category: matchedFood.category
            });
            
            console.log(`✅ Found: ${matchedFood.name} (${matchedFood.category})`);
          }
        }
      }
        
        setScanProgress(75 + (lines.indexOf(line) / lines.length) * 20);
      }
      
      setScanProgress(100);
      
      if (extractedItems.length === 0) {
        setIsScanning(false);
        showNotification('⚠️ No food items detected in receipt. Try a clearer photo or add items manually.');
        return;
      }
      
      // Map to our format
      setScannedItems(extractedItems.map((item, idx) => ({
        ...item,
        id: `ocr-${Date.now()}-${idx}`,
        storage: 'Fridge',
        selected: true
      })));
      
      setIsScanning(false);
      showNotification(`✅ Found ${extractedItems.length} food item(s) in receipt!`);
      
    } catch (error) {
      console.error('❌ OCR Error:', error);
      setIsScanning(false);
      showNotification(`❌ Failed to scan receipt: ${error.message}. Try a clearer photo.`);
    }
  };
  
  // Match food item against database with fuzzy matching
  const matchFoodItem = (description) => {
    const descLower = description.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')  // Remove special chars
      .replace(/\s+/g, ' ')           // Normalize spaces
      .trim();
    
    // Define comprehensive food keyword mappings with confidence scores
    // Order matters: More specific items should come first
    const foodKeywordMap = {
      // Fruits - specific items first
      'Bananas': { keywords: ['banana', 'bananas', 'bnana', 'bnna', 'banan'], category: 'Fruits' },
      'Strawberries': { keywords: ['strawberry', 'strawberries', 'strwbry', 'strwberry', 'strawbry', 'stberry'], category: 'Fruits' },
      'Blueberries': { keywords: ['blueberry', 'blueberries', 'blubry', 'bluebry', 'blberry', 'blubery'], category: 'Fruits' },
      'Blackberries': { keywords: ['blackberry', 'blackberries', 'blkberry', 'blackbry', 'blckberry', 'blkbry'], category: 'Fruits' },
      'Raspberries': { keywords: ['raspberry', 'raspberries', 'raspbry', 'rasberry', 'rasberries', 'rspbry', 'raspberies', 'raspberrys'], category: 'Fruits' },
      'Apples': { keywords: ['apple', 'apples', 'aple', 'appl', 'gala', 'fuji', 'granny', 'honeycrisp', 'grny'], category: 'Fruits' },
      'Peaches': { keywords: ['peach', 'peaches', 'peche', 'pech'], category: 'Fruits' },
      'Oranges': { keywords: ['orange', 'oranges', 'orng', 'ornge', 'navel'], category: 'Fruits' },
      'Grapes': { keywords: ['grape', 'grapes', 'grp', 'grpe'], category: 'Fruits' },
      'Avocado': { keywords: ['avocado', 'avocados', 'avcd', 'avcdo'], category: 'Fruits' },
      'Watermelon': { keywords: ['watermelon', 'watermelons', 'wtrmelon', 'wmelon'], category: 'Fruits' },
      
      // Meat - specific items first
      'Chicken': { keywords: ['chicken', 'chkn', 'chckn', 'poultry', 'chicken breast', 'chkn breast', 'pot pie', 'chicken pot'], category: 'Meat' },
      'Ground Beef': { keywords: ['ground beef', 'beef', 'grd beef', 'hamburger', 'grnd beef', 'grnd', 'bef'], category: 'Meat' },
      'Bacon': { keywords: ['bacon', 'bcn', 'bacn'], category: 'Meat' },
      'Salmon': { keywords: ['salmon', 'salmn', 'samon'], category: 'Seafood' },
      'Pork Chops': { keywords: ['pork chop', 'pork', 'prk chop', 'prk'], category: 'Meat' },
      
      // Dairy
      'Milk': { keywords: ['milk', 'mlk', 'whole milk', '2 milk', 'skim milk', 'dairy', 'milf', 'mllk'], category: 'Dairy' },
      'Eggs': { keywords: ['egg', 'eggs', 'large eggs', 'dozen eggs', 'dz egg', 'egs'], category: 'Dairy' },
      'Cheese': { keywords: ['cheese', 'cheddar', 'chz', 'mozzarella', 'swiss', 'chees', 'chse'], category: 'Dairy' },
      'Yogurt': { keywords: ['yogurt', 'yoghurt', 'ygt', 'yoghrt', 'yourt'], category: 'Dairy' },
      'Butter': { keywords: ['butter', 'bttr', 'buttr'], category: 'Dairy' },
      
      // Grains
      'Tortillas': { keywords: ['tortilla', 'tortillas', 'wraps', 'wrap', 'grain wrap', 'flour tortilla', 'tortila'], category: 'Grains' },
      'Bread': { keywords: ['bread', 'loaf', 'wheat bread', 'white bread', 'brd', 'bred'], category: 'Grains' },
      'Rice': { keywords: ['rice', 'white rice', 'brown rice', 'rce'], category: 'Grains' },
      'Pasta': { keywords: ['pasta', 'spaghetti', 'penne', 'noodles', 'macaroni', 'psta'], category: 'Grains' },
      'Cereal': { keywords: ['cereal', 'creal', 'cerel'], category: 'Grains' },
      
      // Vegetables
      'Cucumber': { keywords: ['cucumber', 'cucumbers', 'ccmbr', 'cucumbr'], category: 'Vegetables' },
      'Collard Greens': { keywords: ['collard', 'collards'], category: 'Vegetables' },
      'Garlic': { keywords: ['garlic', 'garlc'], category: 'Vegetables' },
      'Lettuce': { keywords: ['lettuce', 'lettce', 'romaine', 'iceberg', 'letuce'], category: 'Vegetables' },
      'Tomatoes': { keywords: ['tomato', 'tomatoes', 'tmto', 'tomatos', 'tomat'], category: 'Vegetables' },
      'Carrots': { keywords: ['carrot', 'carrots', 'crrt', 'carot'], category: 'Vegetables' },
      'Onions': { keywords: ['onion', 'onions', 'onon'], category: 'Vegetables' },
      'Potatoes': { keywords: ['potato', 'potatoes', 'ptato', 'russet', 'potat'], category: 'Vegetables' },
      'Spinach': { keywords: ['spinach', 'spnch', 'spinch'], category: 'Vegetables' },
      'Broccoli': { keywords: ['broccoli', 'brocoli', 'brcli', 'broccli'], category: 'Vegetables' },
      'Peppers': { keywords: ['pepper', 'peppers', 'pepr'], category: 'Vegetables' },
      'Mushrooms': { keywords: ['mushroom', 'mushrooms', 'mshrm', 'mushrm'], category: 'Vegetables' },
      
      // Other
      'Peanut Butter': { keywords: ['peanut', 'pnut'], category: 'Other' },
      
      // Beverages
      'Orange Juice': { keywords: ['orange juice', 'oj', 'orng juice', 'ornge juice', 'juice'], category: 'Beverages' },
    };
    
    console.log('🔍 Matching line:', description, '→ cleaned:', descLower);
    
    // First pass: Check for exact or partial matches
    let bestMatch = null;
    let bestMatchLength = 0;
    
    for (const [foodName, { keywords, category }] of Object.entries(foodKeywordMap)) {
      for (const keyword of keywords) {
        // Check if keyword is in description
        if (descLower.includes(keyword)) {
          // Prefer longer keyword matches (more specific)
          if (keyword.length > bestMatchLength) {
            console.log(`  ✅ Matched "${keyword}" → ${foodName}`);
            bestMatch = { name: foodName, category: category, confidence: 'high' };
            bestMatchLength = keyword.length;
          }
        }
        
        // Also try fuzzy matching for very close matches (1-2 char difference)
        // BUT only for longer keywords (6+ chars) to avoid false positives
        else if (keyword.length >= 6) {
          const words = descLower.split(' ');
          for (const word of words) {
            // Word must be very close in length (within 1 char)
            if (word.length >= keyword.length - 1 && word.length <= keyword.length + 1) {
              // Calculate similarity (simple character overlap)
              let matches = 0;
              const minLen = Math.min(word.length, keyword.length);
              for (let i = 0; i < minLen; i++) {
                if (word[i] === keyword[i]) matches++;
              }
              
              // Require 80% similarity for fuzzy match (stricter)
              const similarity = matches / keyword.length;
              if (similarity >= 0.8 && keyword.length > bestMatchLength) {
                console.log(`  ✅ Fuzzy matched "${word}" ≈ "${keyword}" (${Math.round(similarity*100)}%) → ${foodName}`);
                bestMatch = { name: foodName, category: category, confidence: 'high' };
                bestMatchLength = keyword.length;
              }
            }
          }
        }
      }
    }
    
    if (!bestMatch) {
      console.log('  ❌ No match found');
    }
    
    return bestMatch;
  };

  const addScannedItemsToInventory = () => {
    const selectedItems = scannedItems.filter(item => item.selected);
    
    selectedItems.forEach(item => {
      const foodData = FOOD_DATABASE[item.name];
      if (foodData) {
        const days = foodData[item.storage.toLowerCase()] || foodData.days;
        const newItem = {
          id: Date.now() + Math.random(),
          name: item.name,
          category: foodData.category,
          emoji: foodData.emoji,
          purchaseDate: new Date(),
          expiryDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          storage: item.storage,
          quantity: item.quantity,
          condition: 'Fresh',
          daysUntilExpiry: days
        };
        setFoodItems(prev => [...prev, newItem]);
      }
    });
    
    setUserPoints(prev => prev + (selectedItems.length * 10));
    showNotification(`✅ Added ${selectedItems.length} items! +${selectedItems.length * 10} points`);
    setScannedItems([]);
    setOcrText('');
    setScanProgress(0);
    setShowAddFood(false);
  };

  const addManualFood = () => {
    // If editing, use the save edited function instead
    if (editingItem) {
      saveEditedFood();
      return;
    }

    let foodData = FOOD_DATABASE[manualFoodName];
    const finalCategory = manualFoodType.trim() || (foodData ? foodData.category : 'Custom');
    
    // If it's a custom food not in database
    if (!foodData && manualFoodName.trim()) {
      foodData = {
        days: manualExpiryDays,
        fridge: manualExpiryDays,
        freezer: manualExpiryDays * 2,
        category: finalCategory,
        emoji: '🍽️'
      };
    }
    
    if (!manualFoodName.trim()) {
      showNotification('⚠️ Please enter a food name');
      return;
    }
    
    const days = useCustomExpiry ? manualExpiryDays : (foodData[manualStorage.toLowerCase()] || foodData.days);
    
    const newItem = {
      id: Date.now() + Math.random(),
      name: manualFoodName,
      category: finalCategory,
      emoji: foodData.emoji,
      purchaseDate: new Date(),
      expiryDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      storage: manualStorage,
      quantity: manualQuantity,
      condition: 'Fresh',
      daysUntilExpiry: days
    };
    
    setFoodItems(prev => [...prev, newItem]);
    setUserPoints(prev => prev + 10);
    showNotification(`✅ Added ${manualFoodName}! +10 points`);
    
    // Reset form
    setManualFoodName('');
    setManualFoodType('');
    setManualQuantity('1 unit');
    setManualStorage('Fridge');
    setManualExpiryDays(7);
    setUseCustomExpiry(false);
    setShowAddFood(false);
  };

  const cookRecipe = (recipe) => {
    const pointsEarned = 100;
    const wastePreventedAmount = 0.5;
    
    setUserPoints(prev => prev + pointsEarned);
    setWastePreventedKg(prev => prev + wastePreventedAmount);
    setRecipesCookedCount(prev => prev + 1);
    
    const usedIngredients = recipe.ingredients;
    setFoodItems(foodItems.filter(f => !usedIngredients.includes(f.name)));
    
    showNotification(`🎉 Recipe cooked! +${pointsEarned} points, +${wastePreventedAmount}kg saved!`);
    setSelectedRecipe(null);
  };

  const consumeLeftover = (id) => {
    setUserPoints(prev => prev + 30);
    setWastePreventedKg(prev => prev + 0.3);
    setLeftovers(leftovers.filter(l => l.id !== id));
    showNotification('Great! Leftover consumed! +30 points');
  };

  const expiringItems = foodItems.filter(f => f.daysUntilExpiry <= 2);

  console.log('About to render, foodItems:', foodItems.length);
  console.log('expiringItems:', expiringItems.length);

  // Temporary test - remove this once working
  // return (
  //   <div style={{ padding: '50px', backgroundColor: 'lightblue', fontSize: '20px' }}>
  //     <h1>FreshKeep App Loading...</h1>
  //     <p>Food items: {foodItems.length}</p>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-5 rounded-2xl shadow-2xl border-2 border-white/30">
          <span className="text-lg font-semibold">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
                🥗 FreshKeep
              </h1>
              <p className="text-green-50 text-lg">Your AI-Powered Food Waste Reducer</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-green-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ⭐ {userPoints}
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">Rescue Points</div>
            </div>
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-green-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                🍽️ {recipesCookedCount}
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">Meals Rescued</div>
            </div>
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-green-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ♻️ {wastePreventedKg.toFixed(1)}kg
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">Waste Prevented</div>
            </div>
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-green-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                🏆 {badges.length}
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">Badges Earned</div>
            </div>
          </div>

          {/* Alert for expiring foods */}
          {expiringItems.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-2xl p-6 shadow-lg">
              <h3 className="text-red-800 font-bold text-2xl mb-3 flex items-center gap-2">
                🚨 {expiringItems.length} item(s) expiring soon!
              </h3>
              <p className="text-red-700 text-lg">
                Ready to rescue: {expiringItems.map(f => f.emoji + ' ' + f.name).join(', ')}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mt-8 overflow-x-auto pb-2">
            {['kitchen', 'recipes', 'leftovers', 'challenges'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 rounded-xl font-bold capitalize whitespace-nowrap transition-all transform ${
                  activeTab === tab
                    ? 'bg-white text-green-700 shadow-2xl scale-105 border-2 border-green-300'
                    : 'bg-white/30 text-white hover:bg-white/40 border-2 border-white/50 hover:scale-105'
                }`}
              >
                {tab === 'kitchen' && '📦'} {tab === 'recipes' && '🤖'} {tab === 'leftovers' && '🥡'} {tab === 'challenges' && '🎮'} {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 mt-6">
        {activeTab === 'kitchen' && (
          <div>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-bold text-gray-800">🗄️ Food Inventory</h2>
              <button
                onClick={() => {
                  setShowAddFood(!showAddFood);
                  setAddMethod('scan');
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-xl font-bold flex items-center gap-3 hover:shadow-2xl transition-all text-xl shadow-lg hover:scale-105"
              >
                <Plus className="w-7 h-7" />
                Add Food
              </button>
            </div>

            {showAddFood && (
              <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-10 mb-10 shadow-2xl border-2 border-green-300">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-800">
                    {editingItem ? '✏️ Edit Food Item' : '➕ Add New Food'}
                  </h3>
                  <button onClick={() => {
                    setShowAddFood(false);
                    setEditingItem(null);
                    setManualFoodName('');
                    setManualFoodType('');
                    setManualQuantity('1 unit');
                    setManualStorage('Fridge');
                    setManualExpiryDays(7);
                    setUseCustomExpiry(false);
                  }} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Method selection - hide when editing */}
                {!editingItem && (
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setAddMethod('scan')}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        addMethod === 'scan'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                      Scan Receipt
                    </button>
                    <button
                      onClick={() => setAddMethod('manual')}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        addMethod === 'manual'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      Manual Entry
                    </button>
                  </div>
                )}

                {!editingItem && addMethod === 'scan' && (
                  <div>
                    {scannedItems.length === 0 ? (
                      <div className="border-2 border-dashed border-green-300 rounded-2xl p-8 text-center bg-green-50">
                        <Camera className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <h4 className="text-xl font-bold text-gray-800 mb-2">📸 Upload Receipt Photo</h4>
                        <p className="text-gray-600 mb-4">
                          Powered by Veryfi AI - Industry-leading receipt parsing and data extraction
                        </p>
                        
                        {isScanning && (
                          <div className="mb-6">
                            <div className="bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300 flex items-center justify-center"
                                style={{ width: `${scanProgress}%` }}
                              >
                                <span className="text-xs text-white font-bold">{scanProgress}%</span>
                              </div>
                            </div>
                            <p className="text-sm text-green-700 font-semibold animate-pulse">
                              {scanProgress < 60 && '📸 Extracting text with OCR...'}
                              {scanProgress >= 60 && scanProgress < 75 && '� Parsing receipt structure...'}
                              {scanProgress >= 75 && scanProgress < 90 && '🔍 Matching food items...'}
                              {scanProgress >= 90 && '✨ Finalizing results...'}
                            </p>
                          </div>
                        )}
                        
                        <label className="inline-block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isScanning}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                simulateReceiptScan(e.target.files[0]);
                              }
                            }}
                          />
                          <span className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold cursor-pointer inline-flex items-center gap-2 hover:shadow-lg transition-all ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Upload className="w-5 h-5" />
                            {isScanning ? 'Scanning... 🤖' : 'Upload Receipt'}
                          </span>
                        </label>
                        <p className="text-sm text-gray-500 mt-4">
                          📱 JPG, PNG supported • OCR text extraction • Smart parsing • UPC barcode lookup
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3">✅ AI Scanned Items ({scannedItems.length})</h4>
                        
                        {/* Show extracted OCR text for debugging */}
                        {ocrText && (
                          <div className="mb-4 p-4 bg-gray-100 rounded-xl border border-gray-300">
                            <details>
                              <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                                📄 View Raw OCR Text (Click to expand)
                              </summary>
                              <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {ocrText || "No text extracted"}
                              </pre>
                            </details>
                          </div>
                        )}
                        
                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                          {scannedItems.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-green-50 p-3 rounded-xl">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) => {
                                  setScannedItems(scannedItems.map(i => 
                                    i.id === item.id ? { ...i, selected: e.target.checked } : i
                                  ));
                                }}
                                className="w-5 h-5"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-600">
                                  {item.quantity}
                                </p>
                              </div>
                              <select
                                value={item.storage}
                                onChange={(e) => {
                                  setScannedItems(scannedItems.map(i => 
                                    i.id === item.id ? { ...i, storage: e.target.value } : i
                                  ));
                                }}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                              >
                                <option>Fridge</option>
                                <option>Freezer</option>
                                <option>Pantry</option>
                              </select>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={addScannedItemsToInventory}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                          >
                            Add Selected Items ({scannedItems.filter(i => i.selected).length})
                          </button>
                          <button
                            onClick={() => {
                              setScannedItems([]);
                              setOcrText('');
                              setScanProgress(0);
                            }}
                            className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(addMethod === 'manual' || editingItem) && (
                  <div>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Food Item</label>
                        <input
                          type="text"
                          list="food-name-suggestions"
                          value={manualFoodName}
                          onChange={(e) => setManualFoodName(e.target.value)}
                          placeholder="Type any food name..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                        />
                        <datalist id="food-name-suggestions">
                          {Object.keys(FOOD_DATABASE).map(food => (
                            <option key={food} value={food} />
                          ))}
                        </datalist>
                        <p className="text-xs text-gray-500 mt-1">💡 Type your own or select from list</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Food Type</label>
                        <input
                          type="text"
                          list="food-type-suggestions"
                          value={manualFoodType}
                          onChange={(e) => setManualFoodType(e.target.value)}
                          placeholder="e.g., Fruits, Vegetables..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                        />
                        <datalist id="food-type-suggestions">
                          <option value="Fruits" />
                          <option value="Vegetables" />
                          <option value="Meat" />
                          <option value="Dairy" />
                          <option value="Grains" />
                          <option value="Seafood" />
                          <option value="Bakery" />
                          <option value="Snacks" />
                          <option value="Beverages" />
                          <option value="Condiments" />
                          <option value="Custom" />
                        </datalist>
                        <p className="text-xs text-gray-500 mt-1">💡 Type your own or select from list</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
                        <input
                          type="text"
                          value={manualQuantity}
                          onChange={(e) => setManualQuantity(e.target.value)}
                          placeholder="e.g., 1 lb, 500g, 3 pieces"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Storage Location</label>
                        <select
                          value={manualStorage}
                          onChange={(e) => setManualStorage(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                        >
                          <option>Fridge</option>
                          <option>Freezer</option>
                          <option>Pantry</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          <input
                            type="checkbox"
                            checked={useCustomExpiry}
                            onChange={(e) => setUseCustomExpiry(e.target.checked)}
                            className="mr-2"
                          />
                          Custom Expiry Date
                        </label>
                        {useCustomExpiry ? (
                          <input
                            type="number"
                            value={manualExpiryDays}
                            onChange={(e) => setManualExpiryDays(parseInt(e.target.value) || 1)}
                            placeholder="Days until expiry"
                            min="1"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl text-green-700">
                            AI will calculate based on storage
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={addManualFood}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      {editingItem ? 'Save Changes' : 'Add to Inventory'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6 mt-12">
              {foodItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry).map(item => {
                const status = getFreshnessStatus(item.daysUntilExpiry);
                const isEditing = editingItem?.id === item.id;
                
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-l-8 ${
                      status.status === 'soon' || status.status === 'today' ? 'border-red-500' :
                      status.status === 'moderate' ? 'border-yellow-500' : 'border-green-500'
                    } ${isEditing ? 'ring-4 ring-blue-400' : ''}`}
                  >
                    <div className="flex items-start gap-6">
                      {/* Emoji Section */}
                      <div className="flex-shrink-0">
                        <div className="text-7xl">{item.emoji}</div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1">
                        {isEditing ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2 text-sm">Food Name</label>
                                <input
                                  type="text"
                                  value={manualFoodName}
                                  onChange={(e) => setManualFoodName(e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2 text-sm">Food Type</label>
                                <input
                                  type="text"
                                  list="food-type-suggestions-inline"
                                  value={manualFoodType}
                                  onChange={(e) => setManualFoodType(e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2 text-sm">Quantity</label>
                                <input
                                  type="text"
                                  value={manualQuantity}
                                  onChange={(e) => setManualQuantity(e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2 text-sm">Storage</label>
                                <select
                                  value={manualStorage}
                                  onChange={(e) => setManualStorage(e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                                >
                                  <option>Fridge</option>
                                  <option>Freezer</option>
                                  <option>Pantry</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2 text-sm">Days Until Expiry</label>
                                <input
                                  type="number"
                                  value={manualExpiryDays}
                                  onChange={(e) => setManualExpiryDays(parseInt(e.target.value) || 1)}
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                              <span className="text-3xl">{status.emoji}</span>
                            </div>
                            <p className="text-gray-600 mb-4 text-lg font-medium">
                              {item.category} • {item.quantity} • {item.storage}
                            </p>
                            <div className="flex flex-wrap gap-3 mb-5">
                              <span className="text-gray-700 bg-gray-100 px-4 py-2 rounded-xl font-semibold text-sm border border-gray-200">
                                📅 Purchased: {item.purchaseDate.toLocaleDateString()}
                              </span>
                              <span className={`font-bold px-4 py-2 rounded-xl text-sm border-2 ${item.daysUntilExpiry <= 2 ? 'bg-red-50 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-300'}`}>
                                ⏰ Expires: {item.expiryDate.toLocaleDateString()} ({item.daysUntilExpiry} days)
                              </span>
                              <span className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-xl text-gray-700 font-bold text-sm border-2 border-emerald-300">
                                ✓ {item.condition}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Buttons Section */}
                      <div className="flex flex-col gap-3 min-w-[240px]">
                        {!isEditing && (
                          <select
                            value={item.condition}
                            onChange={(e) => updateCondition(item.id, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:border-green-600 focus:outline-none font-semibold hover:border-green-400 transition-colors bg-white"
                          >
                            <option>Fresh</option>
                            <option>Opened</option>
                            <option>Cooked</option>
                            <option>Frozen</option>
                            <option>Resealed</option>
                          </select>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {
                                  saveEditedFood();
                                  setEditingItem(null);
                                }}
                                className="bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1.5 justify-center font-bold shadow-md hover:shadow-lg hover:scale-105 text-sm"
                              >
                                <Check className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingItem(null);
                                  setManualFoodName('');
                                  setManualFoodType('');
                                }}
                                className="bg-gradient-to-br from-gray-500 to-gray-600 text-white px-3 py-2.5 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all flex items-center gap-1.5 justify-center font-bold shadow-md hover:shadow-lg hover:scale-105 text-sm"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setManualFoodName(item.name);
                                  setManualFoodType(item.category || '');
                                  setManualQuantity(item.quantity);
                                  setManualStorage(item.storage);
                                  setManualExpiryDays(item.daysUntilExpiry);
                                  setUseCustomExpiry(true);
                                }}
                                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1.5 justify-center font-bold shadow-md hover:shadow-lg hover:scale-105 text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteFood(item.id)}
                                className="bg-gradient-to-br from-red-500 to-red-600 text-white px-3 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1.5 justify-center font-bold shadow-md hover:shadow-lg hover:scale-105 text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800">🤖 AI Recipe Suggestions</h2>
              <select 
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value)}
                className="px-7 py-4 rounded-xl border-2 border-green-400 focus:outline-none focus:border-green-600 font-bold text-gray-700 shadow-md hover:shadow-lg transition-all"
              >
                <option value="All">All Cuisines</option>
                <option value="American">American</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
              </select>
            </div>
            
            {expiringItems.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 mb-10 shadow-lg">
                <h3 className="text-green-800 font-bold text-2xl mb-3 flex items-center gap-2">
                  🎯 {expiringItems.length} ingredient(s) ready to be rescued!
                </h3>
                <p className="text-green-700 mb-6 text-lg">
                  Let's turn them into delicious meals before they expire.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-green-800 font-bold mb-2 text-sm">👥 Number of People</label>
                    <select
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value))}
                      className="w-full px-6 py-4 rounded-xl border-2 border-green-400 focus:outline-none focus:border-green-600 shadow-sm font-semibold bg-white"
                    >
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5 people</option>
                      <option value="6">6 people</option>
                      <option value="7">7 people</option>
                      <option value="8">8 people</option>
                      <option value="9">9 people</option>
                      <option value="10">10 people</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <p className="text-green-800 font-bold text-xl">
                      {filteredRecipes.length} {cuisineFilter === 'All' ? '' : cuisineFilter} recipe{filteredRecipes.length !== 1 ? 's' : ''} available!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-8">
              {filteredRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all border-2 border-green-300 hover:border-green-500">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <div className="text-6xl">{recipe.emoji}</div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">
                          {recipe.name}
                          {recipe.isAiGenerated && <span className="ml-3 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-full font-semibold border border-purple-300">✨ AI Generated</span>}
                        </h3>
                        <div className="flex gap-5 mt-3 text-base">
                          <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-lg">⏱️ {recipe.time} min</span>
                          <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-lg">👨‍🍳 {recipe.difficulty}</span>
                          <span className="text-amber-600 font-semibold bg-amber-50 px-3 py-1 rounded-lg">🌍 {recipe.cuisine}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRecipe(recipe.id === selectedRecipe ? null : recipe.id)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-lg"
                    >
                      {selectedRecipe === recipe.id ? 'Hide' : 'View'}
                    </button>
                  </div>

                  {selectedRecipe === recipe.id && (
                    <div className="border-t-2 border-gray-200 pt-4 mt-4">
                      <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <p className="text-blue-800 font-semibold text-center">
                          📊 Recipe scaled for {servings} {servings === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-800 mb-2 text-lg">📋 Detailed Ingredients:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                          {scaleRecipeIngredients(recipe, servings).detailedIngredients.map((ing, idx) => (
                            <li key={idx}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-800 mb-2 text-lg">👨‍🍳 Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                          {recipe.steps.map((step, idx) => (
                            <li key={idx} className="mb-2">{step}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => cookRecipe(recipe)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          👍 Cooked It! (+100 points)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leftovers' && (
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-10">🥡 Leftover Management</h2>
            
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-10 mb-10 shadow-xl border-2 border-green-300">
              <h3 className="text-3xl font-bold text-gray-800 mb-8">➕ Add New Leftover</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <input
                  type="text"
                  placeholder="e.g., Pasta from Monday dinner"
                  value={leftoverName}
                  onChange={(e) => setLeftoverName(e.target.value)}
                  className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none font-semibold shadow-sm"
                />
                <input
                  type="number"
                  placeholder="Number of portions"
                  min="1"
                  value={leftoverPortions}
                  onChange={(e) => setLeftoverPortions(parseInt(e.target.value) || 1)}
                  className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none font-semibold shadow-sm"
                />
              </div>
              <button
                onClick={() => {
                  if (leftoverName.trim()) {
                    const newLeftover = {
                      id: Date.now(),
                      name: leftoverName,
                      date: new Date(),
                      portions: leftoverPortions,
                      expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                      daysLeft: 4
                    };
                    setLeftovers([...leftovers, newLeftover]);
                    showNotification('✅ Leftover added!');
                    setLeftoverName('');
                    setLeftoverPortions(1);
                  } else {
                    showNotification('⚠️ Please enter a leftover name');
                  }
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-xl font-bold hover:shadow-xl transition-all text-xl shadow-lg"
              >
                ➕ Add Leftover
              </button>
            </div>

            <div className="space-y-8">
              {leftovers.map(leftover => (
                <div key={leftover.id} className="bg-gradient-to-r from-white to-yellow-50 rounded-2xl p-8 shadow-xl border-l-8 border-yellow-500 hover:shadow-2xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">🥡 {leftover.name}</h3>
                      <p className="text-gray-600 text-lg flex flex-wrap gap-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-lg font-semibold">Portions: {leftover.portions}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-lg font-semibold">Cooked: {leftover.date.toLocaleDateString()}</span>
                        <span className="bg-yellow-100 px-3 py-1 rounded-lg font-semibold">Use by: {leftover.expiryDate.toLocaleDateString()} ({leftover.daysLeft} days left)</span>
                      </p>
                    </div>
                    <button
                      onClick={() => consumeLeftover(leftover.id)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl text-lg"
                    >
                      ✅ Eaten (+30 points)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-8">🎮 Challenges & Achievements</h2>
            
            <div className="space-y-6 mb-8">
              {challenges.map(challenge => {
                const progress = (challenge.progress / challenge.total) * 100;
                return (
                  <div key={challenge.id} className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-green-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {challenge.icon} {challenge.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{challenge.description}</p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-green-700 font-bold">
                            {typeof challenge.progress === 'number' && challenge.progress % 1 !== 0 
                              ? challenge.progress.toFixed(1) 
                              : challenge.progress}
                            /{typeof challenge.total === 'number' && challenge.total % 1 !== 0 
                              ? challenge.total.toFixed(1) 
                              : challenge.total}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="mt-4 bg-yellow-100 border-2 border-yellow-500 rounded-xl p-3">
                          <span className="text-yellow-800 font-bold">🎁 {challenge.reward}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">🏆 Your Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Waste Warrior', emoji: '♻️', earned: true },
                { name: 'Recipe Rescuer', emoji: '👨‍🍳', earned: true },
                { name: 'Zero Waste Champion', emoji: '🏆', earned: false },
                { name: 'Chef Master', emoji: '⭐', earned: false },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 text-center ${
                    badge.earned
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <div className="text-5xl mb-3">{badge.earned ? badge.emoji : '🔒'}</div>
                  <p className="font-bold text-sm">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreshKeepApp;