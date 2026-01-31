import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, ChevronRight, Star, Award, TrendingDown, Clock, AlertCircle, Check, Gift, Trophy, Target, Flame, Upload, X } from 'lucide-react';

const FreshKeepApp = () => {
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
  const [scannedItems, setScannedItems] = useState([]);

  // Manual add food form state
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualQuantity, setManualQuantity] = useState('1 unit');
  const [manualStorage, setManualStorage] = useState('Fridge');
  const [manualExpiryDays, setManualExpiryDays] = useState(7);
  const [useCustomExpiry, setUseCustomExpiry] = useState(false);

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

  // Expanded food database
  const FOOD_DATABASE = {
    'Strawberries': { days: 3, fridge: 7, freezer: 365, category: 'Fruits', emoji: '🍓' },
    'Bananas': { days: 5, fridge: 7, freezer: 60, category: 'Fruits', emoji: '🍌' },
    'Apples': { days: 7, fridge: 30, freezer: 365, category: 'Fruits', emoji: '🍎' },
    'Oranges': { days: 7, fridge: 21, freezer: 180, category: 'Fruits', emoji: '🍊' },
    'Grapes': { days: 3, fridge: 7, freezer: 365, category: 'Fruits', emoji: '🍇' },
    'Blueberries': { days: 3, fridge: 10, freezer: 365, category: 'Fruits', emoji: '🫐' },
    'Avocado': { days: 3, fridge: 7, freezer: 180, category: 'Fruits', emoji: '🥑' },
    'Watermelon': { days: 3, fridge: 7, freezer: 365, category: 'Fruits', emoji: '🍉' },
    
    'Chicken Breast': { days: 2, fridge: 2, freezer: 270, category: 'Meat', emoji: '🍗' },
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
    'Tomatoes': { days: 5, fridge: 10, freezer: 60, category: 'Vegetables', emoji: '🍅' },
    'Carrots': { days: 14, fridge: 30, freezer: 365, category: 'Vegetables', emoji: '🥕' },
    'Broccoli': { days: 3, fridge: 7, freezer: 365, category: 'Vegetables', emoji: '🥦' },
    'Lettuce': { days: 3, fridge: 7, freezer: 30, category: 'Vegetables', emoji: '🥬' },
    'Peppers': { days: 5, fridge: 10, freezer: 365, category: 'Vegetables', emoji: '🫑' },
    'Onions': { days: 30, fridge: 60, freezer: 180, category: 'Vegetables', emoji: '🧅' },
    'Potatoes': { days: 30, fridge: 60, freezer: 365, category: 'Vegetables', emoji: '🥔' },
    'Cucumber': { days: 5, fridge: 7, freezer: 60, category: 'Vegetables', emoji: '🥒' },
    'Mushrooms': { days: 5, fridge: 7, freezer: 365, category: 'Vegetables', emoji: '🍄' },
    
    'Bread': { days: 5, fridge: 7, freezer: 90, category: 'Grains', emoji: '🍞' },
    'Rice': { days: 365, fridge: 365, freezer: 730, category: 'Grains', emoji: '🍚' },
    'Pasta': { days: 365, fridge: 365, freezer: 730, category: 'Grains', emoji: '🍝' },
    'Cereal': { days: 180, fridge: 180, freezer: 365, category: 'Grains', emoji: '🥣' },
    
    'Orange Juice': { days: 7, fridge: 14, freezer: 365, category: 'Beverages', emoji: '🧃' },
    'Soda': { days: 180, fridge: 180, freezer: 365, category: 'Beverages', emoji: '🥤' },
  };

  const recipes = [
    {
      id: 1,
      name: 'Strawberry Spinach Salad',
      ingredients: ['Strawberries', 'Spinach'],
      time: 15,
      difficulty: 'Easy',
      cuisine: 'American',
      steps: [
        'Wash and slice strawberries',
        'Mix spinach with strawberries',
        'Crumble feta cheese on top',
        'Drizzle with balsamic vinegar and olive oil',
        'Toss and serve immediately'
      ],
      emoji: '🥗'
    },
    {
      id: 2,
      name: 'Garlic Spinach Chicken',
      ingredients: ['Chicken Breast', 'Spinach'],
      time: 25,
      difficulty: 'Medium',
      cuisine: 'Italian',
      steps: [
        'Season chicken with salt and pepper',
        'Pan-fry chicken until golden (6-8 min per side)',
        'Sauté garlic until fragrant',
        'Add spinach and wilt',
        'Add cream and parmesan, simmer 5 minutes',
        'Serve chicken topped with creamy spinach'
      ],
      emoji: '🍗'
    },
    {
      id: 3,
      name: 'Quick Berry Smoothie',
      ingredients: ['Strawberries'],
      time: 5,
      difficulty: 'Easy',
      cuisine: 'American',
      steps: [
        'Hull strawberries',
        'Blend strawberries with yogurt',
        'Add honey to taste',
        'Add ice and blend until smooth',
        'Serve immediately'
      ],
      emoji: '🥤'
    }
  ];

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

  const updateCondition = (id, newCondition) => {
    setFoodItems(foodItems.map(f => 
      f.id === id ? { ...f, condition: newCondition } : f
    ));
    showNotification(`Condition updated to ${newCondition}`);
  };

  // AI Receipt Scanning simulation
  const simulateReceiptScan = async (file) => {
    setIsScanning(true);
    showNotification('AI is scanning your receipt... 🤖');
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated AI-extracted items from receipt
    const extractedItems = [
      { name: 'Bananas', quantity: '6 pieces', barcode: '1234567890' },
      { name: 'Milk', quantity: '1 gallon', barcode: '0987654321' },
      { name: 'Eggs', quantity: '1 dozen', barcode: '1122334455' },
      { name: 'Bread', quantity: '1 loaf', barcode: '5544332211' },
      { name: 'Chicken Breast', quantity: '2 lbs', barcode: '9988776655' }
    ];
    
    setScannedItems(extractedItems.map((item, idx) => ({
      ...item,
      id: `scanned-${Date.now()}-${idx}`,
      storage: 'Fridge',
      selected: true
    })));
    
    setIsScanning(false);
    showNotification('✅ Receipt scanned! Review and confirm items below.');
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
    setShowAddFood(false);
  };

  const addManualFood = () => {
    let foodData = FOOD_DATABASE[manualFoodName];
    
    // If it's a custom food not in database
    if (!foodData && manualFoodName.trim()) {
      foodData = {
        days: manualExpiryDays,
        fridge: manualExpiryDays,
        freezer: manualExpiryDays * 2,
        category: 'Custom',
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
      category: foodData.category,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                🥗 FreshKeep
              </h1>
              <p className="text-green-50 text-lg">Your AI-Powered Food Waste Reducer</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                ⭐ {userPoints}
              </div>
              <div className="text-sm text-gray-600 mt-1">Rescue Points</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                🍽️ {recipesCookedCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Meals Rescued</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                ♻️ {wastePreventedKg.toFixed(1)}kg
              </div>
              <div className="text-sm text-gray-600 mt-1">Waste Prevented</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                🏆 {badges.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Badges Earned</div>
            </div>
          </div>

          {/* Alert for expiring foods */}
          {expiringItems.length > 0 && (
            <div className="mt-6 bg-red-100 border-2 border-red-500 rounded-2xl p-4">
              <h3 className="text-red-800 font-bold text-xl mb-2">
                🚨 {expiringItems.length} item(s) expiring soon!
              </h3>
              <p className="text-red-700">
                Ready to rescue: {expiringItems.map(f => f.emoji + ' ' + f.name).join(', ')}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {['kitchen', 'recipes', 'leftovers', 'challenges'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-white text-green-700 shadow-lg'
                    : 'bg-green-600 text-white hover:bg-green-500'
                }`}
              >
                {tab === 'kitchen' && '📦'} {tab === 'recipes' && '🤖'} {tab === 'leftovers' && '🥡'} {tab === 'challenges' && '🎮'} {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'kitchen' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">🗄️ Food Inventory</h2>
              <button
                onClick={() => {
                  setShowAddFood(!showAddFood);
                  setAddMethod('scan');
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Food
              </button>
            </div>

            {showAddFood && (
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl border-2 border-green-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">➕ Add New Food</h3>
                  <button onClick={() => setShowAddFood(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Method selection */}
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

                {addMethod === 'scan' && (
                  <div>
                    {scannedItems.length === 0 ? (
                      <div className="border-2 border-dashed border-green-300 rounded-2xl p-8 text-center bg-green-50">
                        <Camera className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <h4 className="text-xl font-bold text-gray-800 mb-2">📸 Upload Receipt Photo</h4>
                        <p className="text-gray-600 mb-4">
                          Our AI will scan and extract all food items automatically
                        </p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                simulateReceiptScan(e.target.files[0]);
                              }
                            }}
                          />
                          <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold cursor-pointer inline-flex items-center gap-2 hover:shadow-lg transition-all">
                            <Upload className="w-5 h-5" />
                            {isScanning ? 'Scanning... 🤖' : 'Upload Receipt'}
                          </span>
                        </label>
                        <p className="text-sm text-gray-500 mt-4">
                          Supports JPG, PNG - AI extracts items in seconds
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3">✅ AI Scanned Items ({scannedItems.length})</h4>
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
                                <p className="text-sm text-gray-600">{item.quantity}</p>
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
                            onClick={() => setScannedItems([])}
                            className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {addMethod === 'manual' && (
                  <div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Food Item</label>
                        <input
                          type="text"
                          list="food-suggestions"
                          value={manualFoodName}
                          onChange={(e) => setManualFoodName(e.target.value)}
                          placeholder="Type food name or select from list..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                        />
                        <datalist id="food-suggestions">
                          {Object.keys(FOOD_DATABASE).map(food => (
                            <option key={food} value={food} />
                          ))}
                        </datalist>
                        <p className="text-xs text-gray-500 mt-1">💡 Type your own or select from suggestions</p>
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
                      Add to Inventory
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {foodItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry).map(item => {
                const status = getFreshnessStatus(item.daysUntilExpiry);
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 ${
                      status.status === 'soon' || status.status === 'today' ? 'border-red-500' :
                      status.status === 'moderate' ? 'border-yellow-500' : 'border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-6xl">{item.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                            <span className="text-2xl">{status.emoji}</span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {item.category} • {item.quantity} • {item.storage}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600">
                              <strong>Purchased:</strong> {item.purchaseDate.toLocaleDateString()}
                            </span>
                            <span className={`font-bold ${item.daysUntilExpiry <= 2 ? 'text-red-600' : 'text-green-600'}`}>
                              <strong>Expires:</strong> {item.expiryDate.toLocaleDateString()} ({item.daysUntilExpiry} days)
                            </span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                              {item.condition}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <select
                          value={item.condition}
                          onChange={(e) => updateCondition(item.id, e.target.value)}
                          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-green-600 focus:outline-none"
                        >
                          <option>Fresh</option>
                          <option>Opened</option>
                          <option>Cooked</option>
                          <option>Frozen</option>
                          <option>Resealed</option>
                        </select>
                        <button
                          onClick={() => deleteFood(item.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🤖 AI Recipe Suggestions</h2>
            
            {expiringItems.length > 0 && (
              <div className="bg-green-100 border-2 border-green-600 rounded-2xl p-6 mb-6">
                <h3 className="text-green-800 font-bold text-xl mb-2">
                  🎯 {expiringItems.length} ingredient(s) ready to be rescued!
                </h3>
                <p className="text-green-700 mb-4">
                  Let's turn them into delicious meals before they expire.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="How many people eating?"
                    min="1"
                    max="10"
                    defaultValue="2"
                    className="px-4 py-3 rounded-xl border-2 border-green-300 focus:outline-none focus:border-green-600"
                  />
                  <select className="px-4 py-3 rounded-xl border-2 border-green-300 focus:outline-none focus:border-green-600">
                    <option>Any Cuisine</option>
                    <option>Italian</option>
                    <option>Mexican</option>
                    <option>Asian</option>
                    <option>American</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {recipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border-2 border-green-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{recipe.emoji}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{recipe.name}</h3>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-green-600">⏱️ {recipe.time} min</span>
                          <span className="text-blue-600">👨‍🍳 {recipe.difficulty}</span>
                          <span className="text-amber-600">🌍 {recipe.cuisine}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRecipe(recipe.id === selectedRecipe ? null : recipe.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {selectedRecipe === recipe.id ? 'Hide' : 'View'}
                    </button>
                  </div>

                  {selectedRecipe === recipe.id && (
                    <div className="border-t-2 border-gray-200 pt-4 mt-4">
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-800 mb-2">Ingredients:</h4>
                        <div className="flex flex-wrap gap-2">
                          {recipe.ingredients.map((ing, idx) => (
                            <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-800 mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                          {recipe.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => cookRecipe(recipe)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          👍 Cooked It! (+100 points)
                        </button>
                        <button 
                          onClick={() => {
                            setUserPoints(prev => prev + 50);
                            showNotification('Recipe rated! +50 points');
                          }}
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          ⭐ Rate 5 Stars (+50 points)
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
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🥡 Leftover Management</h2>
            
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📸 Add New Leftover</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="e.g., Pasta from Monday dinner"
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                  id="leftover-name"
                />
                <input
                  type="number"
                  placeholder="Number of portions"
                  min="1"
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                  id="leftover-portions"
                />
              </div>
              <button
                onClick={() => {
                  const name = document.getElementById('leftover-name').value;
                  const portions = parseInt(document.getElementById('leftover-portions').value) || 1;
                  
                  if (name.trim()) {
                    const newLeftover = {
                      id: Date.now(),
                      name: name,
                      date: new Date(),
                      portions: portions,
                      expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                      daysLeft: 4
                    };
                    setLeftovers([...leftovers, newLeftover]);
                    setUserPoints(prev => prev + 20);
                    showNotification('Leftover added! +20 points');
                    document.getElementById('leftover-name').value = '';
                    document.getElementById('leftover-portions').value = '';
                  }
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                📸 Add Leftover (+20 points)
              </button>
            </div>

            <div className="space-y-4">
              {leftovers.map(leftover => (
                <div key={leftover.id} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">🥡 {leftover.name}</h3>
                      <p className="text-gray-600">
                        Portions: {leftover.portions} | Cooked: {leftover.date.toLocaleDateString()} | 
                        Use by: {leftover.expiryDate.toLocaleDateString()} ({leftover.daysLeft} days left)
                      </p>
                    </div>
                    <button
                      onClick={() => consumeLeftover(leftover.id)}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
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
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🎮 Challenges & Achievements</h2>
            
            <div className="space-y-6 mb-8">
              {challenges.map(challenge => {
                const progress = (challenge.progress / challenge.total) * 100;
                return (
                  <div key={challenge.id} className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-green-600">
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