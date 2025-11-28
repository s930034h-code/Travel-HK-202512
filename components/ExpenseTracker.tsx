
import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { db } from '../firebase';
import { ref, push, onValue, remove, set } from 'firebase/database';
import { Plus, Trash2, Calculator, Wallet, CreditCard, Banknote, Wifi, Smartphone, Search, X, CloudLightning, Users, Settings, ArrowRightLeft, Check, TrendingUp, HandCoins } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#F08A5D', '#B83B5E', '#6A2C70', '#44403C'];
const DEFAULT_RATE = 4.15;

const PaymentIconMap = {
  cash: <Banknote className="w-3 h-3" />,
  card: <CreditCard className="w-3 h-3" />,
  applepay: <Smartphone className="w-3 h-3" />,
  octopus: <Wifi className="w-3 h-3 rotate-90" />
};

const ExpenseTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'record' | 'settlement'>('record');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_RATE);
  
  // Form State
  const [newItem, setNewItem] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [inputCurrency, setInputCurrency] = useState<'HKD' | 'TWD'>('HKD');
  const [category, setCategory] = useState<'food' | 'transport' | 'shopping' | 'other'>('food');
  const [date, setDate] = useState('2025-12-12');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'applepay' | 'octopus'>('cash');
  const [paidBy, setPaidBy] = useState<string>('Me');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);

  // UI State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newRateInput, setNewRateInput] = useState('');

  // Filter State
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isOnline, setIsOnline] = useState(false);

  // Sync Data
  useEffect(() => {
    const expensesRef = ref(db, 'expenses');
    const usersRef = ref(db, 'users');
    const configRef = ref(db, 'config');
    
    // Expenses Listener
    const unsubExpenses = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expenseList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
          currency: value.currency || 'HKD',
          originalAmount: value.originalAmount || value.amountHKD || 0,
          beneficiaries: value.beneficiaries || []
        }));
        setExpenses(expenseList);
      } else {
        setExpenses([]);
      }
      setIsOnline(true);
    }, (error) => setIsOnline(false));

    // Users Listener
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
         const userList = Object.values(data) as string[];
         setUsers(userList);
         // Set default payer if "Me" is not valid or just init
         if (userList.length > 0 && paidBy === 'Me') setPaidBy(userList[0]);
      }
    });

    // Config (Exchange Rate) Listener
    const unsubConfig = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.exchangeRate) {
            setExchangeRate(data.exchangeRate);
            setNewRateInput(data.exchangeRate.toString());
        } else {
            setNewRateInput(DEFAULT_RATE.toString());
        }
    });

    return () => { unsubExpenses(); unsubUsers(); unsubConfig(); };
  }, []);

  // Auto-select all beneficiaries when users list loads or changes if list was empty
  useEffect(() => {
      if (selectedBeneficiaries.length === 0 && users.length > 0) {
          setSelectedBeneficiaries(users);
      }
  }, [users]);

  const toggleBeneficiary = (user: string) => {
      if (selectedBeneficiaries.includes(user)) {
          // Prevent deselecting if only 1 left (someone must pay)
          if (selectedBeneficiaries.length > 1) {
             setSelectedBeneficiaries(selectedBeneficiaries.filter(u => u !== user));
          }
      } else {
          setSelectedBeneficiaries([...selectedBeneficiaries, user]);
      }
  };

  const selectAllBeneficiaries = () => setSelectedBeneficiaries(users);

  const updateExchangeRate = (e: React.FormEvent) => {
      e.preventDefault();
      const rate = parseFloat(newRateInput);
      if (rate > 0) {
          set(ref(db, 'config/exchangeRate'), rate);
          setShowRateModal(false);
      }
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem || !newAmount) return;
    if (users.length === 0) {
        alert("請先新增成員才能記帳 (為了分帳功能)");
        setShowMemberModal(true);
        return;
    }

    const amountVal = parseFloat(newAmount);
    
    // Default beneficiaries to everyone if somehow empty
    const finalBeneficiaries = selectedBeneficiaries.length > 0 ? selectedBeneficiaries : users;

    const newExpense: Omit<Expense, 'id'> = {
      item: newItem,
      originalAmount: amountVal,
      currency: inputCurrency,
      paidBy: paidBy,
      beneficiaries: finalBeneficiaries,
      category,
      date,
      paymentMethod,
      timestamp: Date.now()
    };

    push(ref(db, 'expenses'), newExpense);
    setNewItem('');
    setNewAmount('');
    setSelectedBeneficiaries(users); // Reset to all
  };

  const removeExpense = (id: string) => remove(ref(db, `expenses/${id}`));

  const addMember = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newMemberName.trim()) return;
      const updatedUsers = [...users, newMemberName.trim()];
      set(ref(db, 'users'), updatedUsers);
      setNewMemberName('');
      if (paidBy === 'Me') setPaidBy(newMemberName.trim());
  };

  const removeMember = (nameToRemove: string) => {
      if (!confirm(`確定要刪除 ${nameToRemove} 嗎？這可能會影響歷史帳務顯示。`)) return;
      const updatedUsers = users.filter(u => u !== nameToRemove);
      set(ref(db, 'users'), updatedUsers);
  };

  // --- Calculations ---

  const filteredExpenses = expenses
    .filter(e => {
       if (filterDate && e.date !== filterDate) return false;
       if (filterCategory !== 'all' && e.category !== filterCategory) return false;
       return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  // Totals Calculation (Separate HKD and TWD original amounts)
  const totalOriginalHKD = filteredExpenses
    .filter(e => e.currency === 'HKD')
    .reduce((acc, curr) => acc + curr.originalAmount, 0);

  const totalOriginalTWD = filteredExpenses
    .filter(e => e.currency === 'TWD')
    .reduce((acc, curr) => acc + curr.originalAmount, 0);
  
  // Grand Total in TWD (Live calculation based on current rate)
  const grandTotalTWD = totalOriginalTWD + (totalOriginalHKD * exchangeRate);

  // Settlement Logic (All converted to TWD for calculation)
  const calculateSettlement = () => {
      const balances: Record<string, number> = {};
      users.forEach(u => balances[u] = 0);

      // 1. Calculate Balances
      expenses.forEach(exp => {
          // Normalize expense to TWD using CURRENT rate
          const amountInTWD = exp.currency === 'TWD' ? exp.originalAmount : (exp.originalAmount * exchangeRate);
          
          // Payer gets positive balance (they paid, so they are owed money)
          if (balances[exp.paidBy] !== undefined) {
              balances[exp.paidBy] += amountInTWD;
          }

          // Beneficiaries get negative balance (consumption)
          // Handle legacy data where beneficiaries might be missing
          const involvedUsers = exp.beneficiaries && exp.beneficiaries.length > 0 ? exp.beneficiaries : users;
          
          if (involvedUsers.length > 0) {
            const splitAmount = amountInTWD / involvedUsers.length;
            involvedUsers.forEach(person => {
                if (balances[person] !== undefined) {
                    balances[person] -= splitAmount;
                }
            });
          }
      });

      // 2. Separate into debtors and creditors
      let debtors: { name: string, amount: number }[] = [];
      let creditors: { name: string, amount: number }[] = [];

      Object.entries(balances).forEach(([name, amount]) => {
          if (amount < -0.1) debtors.push({ name, amount }); // Using 0.1 to avoid float errors
          else if (amount > 0.1) creditors.push({ name, amount });
      });

      debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
      creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

      const transactions: { from: string, to: string, amount: number }[] = [];

      // 3. Match debts
      let i = 0; // debtor index
      let j = 0; // creditor index

      while (i < debtors.length && j < creditors.length) {
          const debtor = debtors[i];
          const creditor = creditors[j];
          
          const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
          
          transactions.push({ from: debtor.name, to: creditor.name, amount });
          
          debtor.amount += amount;
          creditor.amount -= amount;

          if (Math.abs(debtor.amount) < 0.1) i++;
          if (creditor.amount < 0.1) j++;
      }

      return { balances, transactions };
  };

  const settlementData = calculateSettlement();

  // Chart Data (Live conversion for consistent chart)
  const categoryData = [
    { name: '食', value: filteredExpenses.filter(e => e.category === 'food').reduce((a,c) => a + (c.currency === 'HKD' ? c.originalAmount * exchangeRate : c.originalAmount), 0) },
    { name: '行', value: filteredExpenses.filter(e => e.category === 'transport').reduce((a,c) => a + (c.currency === 'HKD' ? c.originalAmount * exchangeRate : c.originalAmount), 0) },
    { name: '購', value: filteredExpenses.filter(e => e.category === 'shopping').reduce((a,c) => a + (c.currency === 'HKD' ? c.originalAmount * exchangeRate : c.originalAmount), 0) },
    { name: '雜', value: filteredExpenses.filter(e => e.category === 'other').reduce((a,c) => a + (c.currency === 'HKD' ? c.originalAmount * exchangeRate : c.originalAmount), 0) },
  ].filter(d => d.value > 0);


  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 pb-24 relative">
      
      {/* Top Tabs */}
      <div className="flex bg-stone-200 p-1 rounded-xl mb-2">
          <button 
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'record' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
          >
              <Wallet className="w-4 h-4" /> 記帳
          </button>
          <button 
            onClick={() => setActiveTab('settlement')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'settlement' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
          >
              <HandCoins className="w-4 h-4" /> 結算
          </button>
      </div>

      {activeTab === 'record' && (
      <>
        {/* Sync Status / Filter Bar */}
        <div className="bg-stone-100 rounded-xl border border-stone-200 p-3 shadow-inner">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-stone-500" />
                    <span className="text-sm font-bold text-stone-500">查詢紀錄</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowMemberModal(true)}
                        className="text-xs flex items-center gap-1 bg-stone-200 hover:bg-stone-300 px-2 py-1 rounded-lg text-stone-600 transition-colors"
                    >
                        <Users className="w-3 h-3" />
                        <span>{users.length > 0 ? `${users.length}人` : '成員'}</span>
                    </button>
                    <div className={`text-xs flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-stone-400'}`}>
                        <CloudLightning className="w-3 h-3" />
                        {isOnline ? '已同步' : '連線中'}
                    </div>
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

        {/* Detailed Totals Card */}
        <div className="bg-stone-800 text-white p-5 rounded-2xl shadow-sketch-lg relative overflow-hidden flex-shrink-0">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-stone-400 text-xs uppercase tracking-widest mb-1">Total Spent</h2>
                        <div className="text-3xl font-hand font-bold text-autumn-300">
                            NT$ {grandTotalTWD.toFixed(0)}
                        </div>
                    </div>
                    <button onClick={() => setShowRateModal(true)} className="bg-stone-700 p-2 rounded-lg hover:bg-stone-600 transition-colors">
                        <Settings className="w-4 h-4 text-stone-300" />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-stone-700 pt-3">
                    <div>
                        <div className="text-xs text-stone-400 mb-1">原始港幣花費</div>
                        <div className="font-bold font-sans">HK$ {totalOriginalHKD.toFixed(1)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-stone-400 mb-1">原始台幣花費</div>
                        <div className="font-bold font-sans">NT$ {totalOriginalTWD.toFixed(0)}</div>
                    </div>
                </div>

                <div className="text-[10px] text-stone-500 font-sans text-center bg-stone-900/50 py-1 rounded">
                    目前匯率: 1 HKD = {exchangeRate} TWD
                </div>
            </div>
        </div>

        {/* Add Expense Form */}
        <form onSubmit={addExpense} className="bg-white p-4 rounded-2xl border-2 border-stone-800 shadow-sketch space-y-3 relative z-0">
            <div className="flex gap-3">
            <input 
                type="text" 
                placeholder="項目 (e.g. 雞蛋仔)" 
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1 min-w-0 p-3 bg-stone-50 rounded-xl border-2 border-stone-200 focus:border-autumn-300 outline-none text-stone-800 placeholder:text-stone-400 text-lg transition-colors"
            />
            </div>
            
            {/* Amount & Currency Row */}
            <div className="flex gap-2">
                <div className="flex-1 flex bg-stone-50 rounded-xl border-2 border-stone-200 focus-within:border-autumn-300 overflow-hidden relative">
                    <input 
                        type="number" 
                        placeholder="0" 
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full p-3 bg-transparent outline-none text-lg text-stone-800"
                    />
                    {newAmount && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none font-sans">
                            ≈ {inputCurrency === 'HKD' ? 'NT$' : 'HK$'} 
                            {inputCurrency === 'HKD' 
                                ? (parseFloat(newAmount) * exchangeRate).toFixed(0) 
                                : (parseFloat(newAmount) / exchangeRate).toFixed(1)}
                        </div>
                    )}
                </div>
                
                <div className="flex bg-stone-200 p-1 rounded-xl flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setInputCurrency('HKD')}
                        className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${inputCurrency === 'HKD' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
                    >
                        HKD
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputCurrency('TWD')}
                        className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${inputCurrency === 'TWD' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
                    >
                        TWD
                    </button>
                </div>
            </div>

            {/* Payer Selection */}
            <div className="space-y-1">
                <div className="text-xs text-stone-400 font-bold ml-1">誰付錢?</div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {users.length === 0 && (
                        <button type="button" onClick={() => setShowMemberModal(true)} className="flex-shrink-0 px-3 py-1.5 rounded-full border border-dashed border-stone-400 text-stone-500 text-xs font-bold flex items-center gap-1">
                            <Plus className="w-3 h-3" /> 新增成員
                        </button>
                    )}
                    {users.length === 0 && (
                        <button type="button" className="flex-shrink-0 px-3 py-1.5 rounded-full border-2 text-xs font-bold bg-stone-800 text-white border-stone-800">Me</button>
                    )}
                    {users.map(u => (
                        <button
                            key={u}
                            type="button"
                            onClick={() => setPaidBy(u)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
                                paidBy === u 
                                ? 'bg-stone-800 text-white border-stone-800 shadow-md transform scale-105' 
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                            }`}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split Selection */}
            {users.length > 0 && (
                <div className="space-y-1 bg-stone-50 p-2 rounded-xl border border-stone-100">
                    <div className="flex justify-between items-center mb-1">
                        <div className="text-xs text-stone-400 font-bold ml-1">幫誰付? (分給誰)</div>
                        <button type="button" onClick={selectAllBeneficiaries} className="text-[10px] text-autumn-400 font-bold underline">全選</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {users.map(u => (
                            <button
                                key={`split-${u}`}
                                type="button"
                                onClick={() => toggleBeneficiary(u)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border transition-all ${
                                    selectedBeneficiaries.includes(u)
                                    ? 'bg-autumn-100 text-autumn-500 border-autumn-300'
                                    : 'bg-white text-stone-400 border-stone-200'
                                }`}
                            >
                                {selectedBeneficiaries.includes(u) && <Check className="w-3 h-3" />}
                                {u}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                <Tooltip formatter={(value: number) => `NT$ ${value.toFixed(0)}`} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
            </div>
        )}

        {/* Expense List */}
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
                        <div className="font-bold text-stone-800 text-lg leading-tight flex items-center gap-2">
                            {expense.item}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">
                                {expense.date.slice(5)}
                            </span>
                            <span className="text-xs flex items-center gap-1 text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded-full">
                                {PaymentIconMap[expense.paymentMethod]}
                                <span className="capitalize">{expense.paymentMethod === 'octopus' ? '八達通' : expense.paymentMethod}</span>
                            </span>
                            {expense.paidBy && expense.paidBy !== 'Me' && (
                                <span className="text-xs font-bold text-autumn-500 bg-autumn-100 px-1.5 py-0.5 rounded">
                                    {expense.paidBy}先墊
                                </span>
                            )}
                        </div>
                        {/* Show split info if not everyone */}
                        {users.length > 0 && expense.beneficiaries && expense.beneficiaries.length < users.length && (
                             <div className="text-[10px] text-stone-400 mt-1 flex flex-wrap gap-1">
                                <span>分給:</span>
                                {expense.beneficiaries.map(b => <span key={b} className="bg-stone-50 px-1 rounded">{b}</span>)}
                             </div>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="font-bold text-xl flex items-baseline justify-end gap-1">
                        <span className="text-xs text-stone-400 font-normal">
                            {expense.currency === 'TWD' ? 'NT$' : 'HK$'}
                        </span>
                        {expense.originalAmount}
                    </div>
                    <div className="text-xs text-stone-400 flex items-center justify-end gap-1">
                        <ArrowRightLeft className="w-3 h-3" />
                        {expense.currency === 'TWD' 
                            ? `HK$ ${(expense.originalAmount / exchangeRate).toFixed(1)}` 
                            : `NT$ ${(expense.originalAmount * exchangeRate).toFixed(0)}`
                        }
                    </div>
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
      </>
      )}

      {/* Settlement Tab */}
      {activeTab === 'settlement' && (
          <div className="animate-fadeIn space-y-4">
              {users.length === 0 ? (
                  <div className="text-center p-8 bg-white rounded-2xl border-2 border-stone-200 border-dashed">
                      <p className="text-stone-500">請先到「記帳」頁面新增成員，才能開始分帳喔！</p>
                  </div>
              ) : (
                  <>
                    <div className="bg-stone-800 text-white p-5 rounded-2xl shadow-sketch-lg relative">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-autumn-300" /> 目前餘額 (NT$)
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(settlementData.balances).map(([name, balance]) => (
                                <div key={name} className="flex justify-between items-center border-b border-stone-700 pb-2 last:border-0 last:pb-0">
                                    <span className="font-bold text-lg">{name}</span>
                                    <span className={`font-mono font-bold text-lg ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {balance > 0 ? '+' : ''}{balance.toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-[10px] text-stone-500 text-center">
                            正數代表別人欠你錢，負數代表你欠別人錢
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sketch">
                         <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800">
                             <ArrowRightLeft className="w-5 h-5 text-autumn-400" /> 建議轉帳方案
                        </h3>
                        {settlementData.transactions.length === 0 ? (
                            <div className="text-center py-4 text-stone-500 bg-stone-50 rounded-xl">
                                目前沒有需要結算的款項 🎉
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {settlementData.transactions.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-stone-700">{t.from}</span>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-stone-400">給</span>
                                                <ArrowRightLeft className="w-4 h-4 text-stone-400" />
                                            </div>
                                            <span className="font-bold text-stone-700">{t.to}</span>
                                        </div>
                                        <div className="font-bold text-autumn-500 font-sans text-xl">
                                            ${t.amount.toFixed(0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="mt-4 text-xs text-stone-400">
                            *此方案為最小化轉帳次數的建議，所有金額已換算為台幣。
                        </p>
                    </div>
                  </>
              )}
          </div>
      )}

      {/* Member Management Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-paper p-6 rounded-2xl border-2 border-stone-800 shadow-sketch-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-autumn-300" /> 成員管理
                    </h3>
                    <button onClick={() => setShowMemberModal(false)} className="text-stone-400 hover:text-stone-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={addMember} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="輸入名字 (e.g. 媽媽)"
                        className="flex-1 p-2 border-2 border-stone-300 rounded-lg outline-none focus:border-autumn-300 bg-white"
                        autoFocus
                    />
                    <button type="submit" className="bg-stone-800 text-white px-4 rounded-lg font-bold">
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {users.map(u => (
                        <div key={u} className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                            <span className="font-bold text-stone-700">{u}</span>
                            <button onClick={() => removeMember(u)} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <p className="text-center text-stone-400 py-2 text-sm">還沒有新增成員，這樣怎麼分帳呢？</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Exchange Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-paper p-6 rounded-2xl border-2 border-stone-800 shadow-sketch-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-autumn-300" /> 設定匯率
                    </h3>
                    <button onClick={() => setShowRateModal(false)} className="text-stone-400 hover:text-stone-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={updateExchangeRate} className="space-y-4">
                    <div>
                        <label className="block text-stone-500 text-sm mb-1">1 港幣 (HKD) 等於多少台幣?</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={newRateInput}
                            onChange={(e) => setNewRateInput(e.target.value)}
                            className="w-full p-3 border-2 border-stone-300 rounded-xl outline-none focus:border-autumn-300 bg-white text-xl font-bold text-center"
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="w-full bg-stone-800 text-white p-3 rounded-xl font-bold hover:bg-stone-700 transition-colors">
                        更新匯率
                    </button>
                </form>
                <p className="mt-4 text-xs text-stone-400 text-center">
                    更新後，所有歷史記帳金額的台幣估算值也會同步更新顯示。
                </p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
