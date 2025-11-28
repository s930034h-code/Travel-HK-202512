import React, { useState, useEffect } from 'react';
import { Expense } from './types';
import { EXCHANGE_RATE } from './constants';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';
import { Plus, Trash2, Calculator, Wallet, CreditCard, Banknote, Wifi, Smartphone, Search, X, CloudLightning } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#F08A5D', '#B83B5E', '#6A2C70', '#44403C'];

const PaymentIconMap = {
  cash: <Banknote className="w-3 h-3" />,
  card: <CreditCard className="w-3 h-3" />,
  applepay: <Smartphone className="w-3 h-3" />,
  octopus: <Wifi className="w-3 h-3 rotate-90" />
};

const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Form State
  const [newItem, setNewItem] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [category, setCategory] = useState<'food' | 'transport' | 'shopping' | 'other'>('food');
  const [date, setDate] = useState('2025-12-12');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'applepay' | 'octopus'>('cash');

  // Filter State
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isOnline, setIsOnline] = useState(false);

  // Sync with Firebase
  useEffect(() => {
    const expensesRef = ref(db, 'expenses');
    
    // Listen for data changes
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to Array
        const expenseList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
        setExpenses(expenseList);
      } else {
        setExpenses([]);
      }
      setIsOnline(true);
    }, (error) => {
      console.error("Firebase Read Error:", error);
      setIsOnline(false);
    });

    return () => unsubscribe();
  }, []);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem || !newAmount) return;

    const newExpense = {
      item: newItem,
      amountHKD: parseFloat(newAmount),
      paidBy: 'Me',
      category,
      date,
      paymentMethod,
      timestamp: Date.now() // For sorting
    };

    // Push to Firebase
    push(ref(db, 'expenses'), newExpense);

    setNewItem('');
    setNewAmount('');
  };

  const removeExpense = (id: string) => {
    // Remove from Firebase
    remove(ref(db, `expenses/${id}`));
  };

  // Filter and Sort Logic
  const filteredExpenses = expenses
    .filter(e => {
       if (filterDate && e.date !== filterDate) return false;
       if (filterCategory !== 'all' && e.category !== filterCategory) return false;
       return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalHKD = filteredExpenses.reduce((acc, curr) => acc + curr.amountHKD, 0);
  const totalTWD = totalHKD * EXCHANGE_RATE;

  // Chart Data (based on filtered results)
  const categoryData = [
    { name: '食', value: filteredExpenses.filter(e => e.category === 'food').reduce((a,c) => a+c.amountHKD, 0) },
    { name: '行', value: filteredExpenses.filter(e => e.category === 'transport').reduce((a,c) => a+c.amountHKD, 0) },
    { name: '購', value: filteredExpenses.filter(e => e.category === 'shopping').reduce((a,c) => a+c.amountHKD, 0) },
    { name: '雜', value: filteredExpenses.filter(e => e.category === 'other').reduce((a,c) => a+c.amountHKD, 0) },
  ].filter(d => d.value > 0);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 pb-24">
      
      {/* Sync Status / Filter Bar */}
      <div className="bg-stone-100 rounded-xl border border-stone-200 p-3 shadow-inner">
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-500" />
                <span className="text-sm font-bold text-stone-500">查詢紀錄</span>
            </div>
            <div className={`text-xs flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-stone-400'}`}>
                <CloudLightning className="w-3 h-3" />
                {isOnline ? '已同步' : '連線中...'}
            </div>
         </div>
         <div className="flex gap-2">
             <input 
                type="date" 
                value={filterDate} 
                onChange={e => setFilterDate(e.target.value)}
                className="flex-1 p-2 text-sm bg-white rounded-lg border border-stone-300 outline-none focus:border-autumn-300"
                placeholder="日期"
             />
             <select 
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="flex-1 p-2 text-sm bg-white rounded-lg border border-stone-300 outline-none focus:border-autumn-300"
             >
                <option value="all">所有分類</option>
                <option value="food">美食</option>
                <option value="transport">交通</option>
                <option value="shopping">購物</option>
                <option value="other">其他</option>
             </select>
             {(filterDate || filterCategory !== 'all') && (
                <button 
                  onClick={() => {setFilterDate(''); setFilterCategory('all');}} 
                  className="p-2 bg-stone-300 rounded-lg text-stone-700 hover:bg-stone-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
             )}
         </div>
      </div>

      <div className="bg-stone-800 text-white p-6 rounded-2xl shadow-sketch-lg relative overflow-hidden flex-shrink-0">
         <div className="absolute top-0 right-0 p-4 opacity-10">
           <Wallet className="w-24 h-24" />
         </div>
         <div className="flex justify-between items-start">
             <div>
                <h2 className="text-stone-300 text-sm uppercase tracking-widest mb-1 font-sans">Total Spent</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-hand font-bold">HK$ {totalHKD.toFixed(1)}</span>
                </div>
                <div className="text-autumn-300 font-bold mt-1 text-xl">
                  ≈ NT$ {totalTWD.toFixed(0)}
                </div>
             </div>
         </div>
         
         <div className="mt-4 text-xs text-stone-400 font-sans">
           匯率: 1 HKD = {EXCHANGE_RATE} TWD
         </div>
      </div>

      {/* Add Expense Form - Mobile Optimized */}
      <form onSubmit={addExpense} className="bg-white p-4 rounded-2xl border-2 border-stone-800 shadow-sketch space-y-3">
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="項目 (e.g. 雞蛋仔)" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 min-w-0 p-3 bg-stone-50 rounded-xl border-2 border-stone-200 focus:border-autumn-300 outline-none text-stone-800 placeholder:text-stone-400 text-lg transition-colors"
          />
          <input 
            type="number" 
            placeholder="$" 
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="w-24 flex-shrink-0 p-3 bg-stone-50 rounded-xl border-2 border-stone-200 focus:border-autumn-300 outline-none text-lg text-center text-stone-800 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <input 
             type="date"
             value={date}
             onChange={(e) => setDate(e.target.value)}
             className="flex-1 min-w-0 p-3 bg-stone-50 rounded-xl border-2 border-stone-200 text-sm text-stone-800 outline-none focus:border-autumn-300 transition-colors"
          />
          <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="flex-1 min-w-0 p-3 rounded-xl bg-stone-50 border-2 border-stone-200 text-sm text-stone-800 outline-none focus:border-autumn-300 transition-colors"
            >
              <option value="cash">現金 Cash</option>
              <option value="octopus">八達通</option>
              <option value="card">信用卡</option>
              <option value="applepay">Apple Pay</option>
            </select>
        </div>

        <div className="flex gap-3 items-center">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-1/3 min-w-[80px] p-3 rounded-xl bg-stone-50 border-2 border-stone-200 text-sm text-stone-800 outline-none focus:border-autumn-300 transition-colors"
            >
              <option value="food">美食</option>
              <option value="transport">交通</option>
              <option value="shopping">購物</option>
              <option value="other">其他</option>
            </select>
            <button 
              type="submit" 
              className="flex-1 bg-stone-800 text-white p-3 rounded-xl font-bold hover:bg-stone-700 transition-colors flex justify-center items-center gap-2 shadow-sm active:translate-y-0.5 active:shadow-none"
            >
              <Plus className="w-5 h-5" /> 
              <span>記一筆</span>
            </button>
        </div>
      </form>

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="h-48 w-full bg-white rounded-2xl border-2 border-stone-800 shadow-sketch p-2">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `HK$ ${value}`} />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm relative group">
            <div className="flex justify-between items-start">
               <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-8 rounded-full flex-shrink-0 ${
                    expense.category === 'food' ? 'bg-autumn-300' :
                    expense.category === 'transport' ? 'bg-autumn-400' :
                    expense.category === 'shopping' ? 'bg-autumn-500' : 'bg-stone-500'
                  }`}></div>
                  
                  <div>
                    <div className="font-bold text-stone-800 text-lg leading-tight">{expense.item}</div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">
                        {expense.date.slice(5)}
                      </span>
                      <span className="text-xs flex items-center gap-1 text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded-full">
                        {PaymentIconMap[expense.paymentMethod]}
                        <span className="capitalize">{expense.paymentMethod === 'octopus' ? '八達通' : expense.paymentMethod}</span>
                      </span>
                    </div>
                  </div>
               </div>

               <div className="text-right">
                  <div className="font-bold text-xl">HK$ {expense.amountHKD}</div>
                  <div className="text-xs text-stone-400">NT$ {(expense.amountHKD * EXCHANGE_RATE).toFixed(0)}</div>
               </div>
            </div>
            
            <button 
              onClick={() => removeExpense(expense.id)} 
              className="absolute -top-2 -right-2 bg-red-400 text-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {filteredExpenses.length === 0 && (
          <div className="text-center text-stone-400 py-10 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
            <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-hand text-xl">
               {expenses.length === 0 ? (isOnline ? '還沒有記帳紀錄喔' : '連線中...') : '沒有符合查詢的紀錄'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;