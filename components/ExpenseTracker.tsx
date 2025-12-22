
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseItemDetail } from '../types';
import { db, isFirebaseConfigured } from '../firebase';
import { ref, push, onValue, remove, set } from 'firebase/database';
import { Plus, Trash2, Calculator, Wallet, CreditCard, Banknote, Wifi, Smartphone, Search, X, CloudLightning, Users, Settings, ArrowRightLeft, Check, TrendingUp, HandCoins, Divide, MousePointer2, AlertCircle, AlertTriangle, Store, Receipt, Archive, ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#F08A5D', '#B83B5E', '#6A2C70', '#44403C', '#2B2B2B', '#E5E7EB'];
const DEFAULT_RATE = 4.15;

const PaymentIconMap: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-3 h-3" />,
  card: <CreditCard className="w-3 h-3" />,
  applepay: <Smartphone className="w-3 h-3" />,
  octopus: <Wifi className="w-3 h-3 rotate-90" />
};

const ExpenseTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'record' | 'settlement'>('record');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<string[]>(['Me']);
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_RATE);
  const [isLocalArchive, setIsLocalArchive] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [inputCurrency, setInputCurrency] = useState<'HKD' | 'TWD'>('HKD');
  const [category, setCategory] = useState<'food' | 'transport' | 'shopping' | 'other'>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'applepay' | 'octopus'>('cash');
  const [paidBy, setPaidBy] = useState<string>('Me');
  const [subItems, setSubItems] = useState<ExpenseItemDetail[]>([]);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);

  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load logic
  useEffect(() => {
    // 1. Check Local Archive First
    const localExpenses = localStorage.getItem('local_archive_expenses');
    const localUsers = localStorage.getItem('local_archive_users');
    const localConfig = localStorage.getItem('local_archive_config');

    if (localExpenses) {
        const parsed = JSON.parse(localExpenses);
        setExpenses(Object.entries(parsed).map(([id, val]: [string, any]) => ({ id, ...val })));
        setIsLocalArchive(true);
    }
    if (localUsers) {
        const parsedUsers = JSON.parse(localUsers);
        setUsers(Array.isArray(parsedUsers) ? parsedUsers : ['Me']);
    }
    if (localConfig) {
        const cfg = JSON.parse(localConfig);
        setExchangeRate(cfg.exchangeRate || DEFAULT_RATE);
    }

    // 2. Firebase Sync
    if (!isFirebaseConfigured) return;

    const unsubExp = onValue(ref(db, 'expenses'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setExpenses(Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, ...value })));
        setIsOnline(true);
        setIsLocalArchive(false);
      }
    });
    const unsubUsers = onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) setUsers(Array.isArray(data) ? data : Object.values(data));
    });

    return () => { unsubExp(); unsubUsers(); };
  }, []);

  useEffect(() => {
      if (users.length > 0 && selectedBeneficiaries.length === 0) setSelectedBeneficiaries(users);
  }, [users]);

  // Persistence
  const persistExpenses = (newExpensesObj: Record<string, any>) => {
      if (isLocalArchive || !isFirebaseConfigured) {
          localStorage.setItem('local_archive_expenses', JSON.stringify(newExpensesObj));
          setExpenses(Object.entries(newExpensesObj).map(([id, val]: [string, any]) => ({ id, ...val })));
      } else {
          set(ref(db, 'expenses'), newExpensesObj);
      }
  };

  const persistUsers = (newUsers: string[]) => {
      if (isLocalArchive || !isFirebaseConfigured) {
          localStorage.setItem('local_archive_users', JSON.stringify(newUsers));
          setUsers(newUsers);
      } else {
          set(ref(db, 'users'), newUsers);
      }
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !newAmount) return;

    const id = Date.now().toString();
    const newExp: Expense = {
      id,
      item: storeName,
      details: subItems,
      originalAmount: parseFloat(newAmount),
      currency: inputCurrency,
      paidBy,
      beneficiaries: selectedBeneficiaries,
      category,
      date,
      paymentMethod,
      timestamp: Date.now()
    };

    const currentMap = expenses.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});
    persistExpenses({ ...currentMap, [id]: newExp });

    setStoreName(''); setNewAmount(''); setSubItems([]);
  };

  const removeExpense = (id: string) => {
      if(!confirm('確定刪除此筆記錄？')) return;
      const currentMap = expenses.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});
      delete currentMap[id];
      persistExpenses(currentMap);
  };

  const addMember = () => {
      if (!newMemberName.trim()) return;
      const updated = [...users, newMemberName.trim()];
      persistUsers(updated);
      setNewMemberName('');
  };

  // --- Calculations ---
  
  const getConvertedAmount = (exp: Expense) => {
      return exp.currency === 'HKD' ? exp.originalAmount * exchangeRate : exp.originalAmount;
  };

  const totalHKD = expenses.filter(e => e.currency === 'HKD').reduce((a,c) => a + c.originalAmount, 0);
  const totalTWD = expenses.filter(e => e.currency === 'TWD').reduce((a,c) => a + c.originalAmount, 0);
  const grandTotalTWD = totalTWD + (totalHKD * exchangeRate);

  // Category Chart Data
  const chartData = [
    { name: '美食', value: expenses.filter(e => e.category === 'food').reduce((a,c) => a + getConvertedAmount(c), 0) },
    { name: '交通', value: expenses.filter(e => e.category === 'transport').reduce((a,c) => a + getConvertedAmount(c), 0) },
    { name: '購物', value: expenses.filter(e => e.category === 'shopping').reduce((a,c) => a + getConvertedAmount(c), 0) },
    { name: '其他', value: expenses.filter(e => e.category === 'other').reduce((a,c) => a + getConvertedAmount(c), 0) },
  ].filter(d => d.value > 0);

  // Debt Calculation
  const calculateBalances = () => {
      const balance: Record<string, number> = {};
      users.forEach(u => balance[u] = 0);

      expenses.forEach(exp => {
          const amount = getConvertedAmount(exp);
          // Payer gets credit
          balance[exp.paidBy] += amount;
          // Beneficiaries owe money
          const perPerson = amount / (exp.beneficiaries?.length || users.length);
          (exp.beneficiaries || users).forEach(b => {
              balance[b] -= perPerson;
          });
      });
      return balance;
  };

  const balances = calculateBalances();
  const sortedExpenses = [...expenses].sort((a,b) => b.timestamp - a.timestamp);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 pb-24 relative animate-fadeIn font-hand">
      {/* Tab Switcher */}
      <div className="flex bg-stone-200 p-1 rounded-xl">
          <button onClick={() => setActiveTab('record')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'record' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>
              <Wallet className="w-4 h-4" /> 記帳
          </button>
          <button onClick={() => setActiveTab('settlement')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'settlement' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>
              <TrendingUp className="w-4 h-4" /> 結算
          </button>
      </div>

      {/* Connection Bar */}
      <div className="flex justify-between items-center px-1">
          <span className={`text-[10px] font-bold flex items-center gap-1 ${isLocalArchive ? 'text-blue-600' : isOnline ? 'text-green-600' : 'text-stone-400'}`}>
             {isLocalArchive ? <Archive className="w-3 h-3"/> : <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-stone-300'}`}></div>}
             {isLocalArchive ? '本地封存資料' : isOnline ? '雲端同步中' : '離線模式'}
          </span>
          <button onClick={() => setShowMemberModal(true)} className="text-[10px] bg-white border border-stone-300 px-2 py-1 rounded-lg text-stone-600 flex items-center gap-1 shadow-sm">
              <Users className="w-3 h-3" /> 成員設定
          </button>
      </div>

      {activeTab === 'record' ? (
        <>
            {/* Summary Card */}
            <div className="bg-stone-800 text-white p-5 rounded-3xl shadow-sketch-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Calculator className="w-20 h-20" /></div>
                <h2 className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">Total Trip Expenses</h2>
                <div className="text-3xl font-black text-autumn-300">NT$ {grandTotalTWD.toFixed(0)}</div>
                <div className="text-xs text-stone-500 mt-2 font-sans">匯率：1 HKD = {exchangeRate} TWD</div>
            </div>

            {/* Entry Form */}
            <form onSubmit={addExpense} className="bg-white p-4 rounded-3xl border-2 border-stone-800 shadow-sketch space-y-3">
                <input type="text" placeholder="店家或項目名稱" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border-2 border-stone-200 outline-none focus:border-autumn-300" required />
                <div className="flex gap-2">
                    <input type="number" placeholder="金額" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="flex-1 p-3 bg-stone-50 rounded-xl border-2 border-stone-200" required />
                    <div className="flex bg-stone-200 p-1 rounded-xl">
                        <button type="button" onClick={() => setInputCurrency('HKD')} className={`px-3 rounded-lg text-xs font-bold transition-all ${inputCurrency === 'HKD' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>HKD</button>
                        <button type="button" onClick={() => setInputCurrency('TWD')} className={`px-3 rounded-lg text-xs font-bold transition-all ${inputCurrency === 'TWD' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>TWD</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="p-2.5 bg-stone-50 rounded-xl border-2 border-stone-200 text-sm">
                        {users.map(u => <option key={u} value={u}>{u} 付款</option>)}
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value as any)} className="p-2.5 bg-stone-50 rounded-xl border-2 border-stone-200 text-sm">
                        <option value="food">美食</option>
                        <option value="transport">交通</option>
                        <option value="shopping">購物</option>
                        <option value="other">其他</option>
                    </select>
                </div>

                <button type="submit" className="w-full bg-stone-800 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-sm active:scale-95 transition-transform">
                    <Plus className="w-5 h-5" /> 新增紀錄
                </button>
            </form>

            {/* List */}
            <div className="space-y-3">
                <h3 className="font-bold text-stone-500 text-xs px-1 flex items-center gap-2"><Receipt className="w-3 h-3" /> 最近消費紀錄</h3>
                {sortedExpenses.map((exp) => (
                    <div key={exp.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group">
                        <div className="p-4 flex justify-between items-center" onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}>
                            <div className="flex gap-3 items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${exp.category === 'food' ? 'bg-autumn-300' : exp.category === 'shopping' ? 'bg-autumn-400' : 'bg-stone-500'}`}>
                                    {exp.category === 'food' ? <Utensils className="w-5 h-5"/> : <Store className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <div className="font-bold text-stone-800">{exp.item}</div>
                                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                        {PaymentIconMap[exp.paymentMethod || 'cash']}
                                        {exp.date} · {exp.paidBy} 付
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <div>
                                    <div className="font-bold">{exp.currency === 'HKD' ? 'HK$' : 'NT$'} {exp.originalAmount}</div>
                                    <div className="text-[10px] text-stone-400">≈ NT$ {getConvertedAmount(exp).toFixed(0)}</div>
                                </div>
                                {expandedId === exp.id ? <ChevronUp className="w-4 h-4 text-stone-300" /> : <ChevronDown className="w-4 h-4 text-stone-300" />}
                            </div>
                        </div>

                        {/* Details Section */}
                        {expandedId === exp.id && (
                            <div className="px-4 pb-4 pt-2 border-t border-dashed border-stone-100 bg-stone-50 animate-fadeIn">
                                {exp.details && exp.details.length > 0 && (
                                    <div className="mb-3 space-y-1">
                                        <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">消費細目</div>
                                        {exp.details.map(d => (
                                            <div key={d.id} className="flex justify-between text-sm text-stone-600">
                                                <span>• {d.name}</span>
                                                <span>{exp.currency === 'HKD' ? 'HK$' : 'NT$'} {d.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] font-bold text-stone-400 uppercase">分帳對象</div>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {(exp.beneficiaries || users).map(b => (
                                                <span key={b} className="text-[10px] bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-600">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={(e) => {e.stopPropagation(); removeExpense(exp.id);}} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
      ) : (
        <div className="space-y-6 animate-fadeIn">
            {/* Charts */}
            <div className="bg-white p-5 rounded-3xl border-2 border-stone-800 shadow-sketch">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4" /> 分類支出比例</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(val: any) => `NT$ ${val.toFixed(0)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Individual Totals */}
            <div className="bg-white p-5 rounded-3xl border-2 border-stone-800 shadow-sketch">
                <h3 className="font-bold text-stone-800 mb-4">個人結算餘額 (NTD)</h3>
                <div className="space-y-3">
                    {Object.entries(balances).map(([user, bal]) => (
                        <div key={user} className="flex justify-between items-center border-b border-stone-100 pb-2">
                            <span className="font-bold text-stone-700">{user}</span>
                            <span className={`font-bold ${bal >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {bal >= 0 ? `+ ${bal.toFixed(0)}` : bal.toFixed(0)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Debt Settlement Suggestions */}
            <div className="bg-stone-800 text-white p-5 rounded-3xl shadow-sketch-lg">
                <h3 className="font-bold text-autumn-300 mb-4 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> 建議還款方式</h3>
                <div className="space-y-3">
                    {/* 這裡使用簡單的結算邏輯：正值收款，負值還款 */}
                    {Object.entries(balances).map(([user, bal]) => {
                        if (bal < -1) return (
                            <div key={user} className="flex items-center gap-3 bg-stone-700/50 p-3 rounded-xl border border-stone-600">
                                <AlertCircle className="w-4 h-4 text-autumn-200" />
                                <div className="text-sm">
                                    <span className="font-bold text-autumn-200">{user}</span> 需支付總計 <span className="font-bold">NT$ {Math.abs(bal).toFixed(0)}</span>
                                </div>
                            </div>
                        );
                        if (bal > 1) return (
                            <div key={user} className="flex items-center gap-3 bg-green-900/20 p-3 rounded-xl border border-green-800/30">
                                <Check className="w-4 h-4 text-green-400" />
                                <div className="text-sm">
                                    <span className="font-bold text-green-400">{user}</span> 應收回總計 <span className="font-bold">NT$ {bal.toFixed(0)}</span>
                                </div>
                            </div>
                        );
                        return null;
                    })}
                </div>
            </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-paper p-6 rounded-3xl border-2 border-stone-800 shadow-sketch-lg w-full max-w-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-200">
                    <h3 className="font-black text-xl">成員設定</h3>
                    <button onClick={() => setShowMemberModal(false)}><X/></button>
                </div>
                <div className="space-y-3 mb-6">
                    {users.map(u => (
                        <div key={u} className="flex justify-between items-center p-3 bg-white border border-stone-200 rounded-xl">
                            <span className="font-bold">{u}</span>
                            {u !== 'Me' && (
                                <button onClick={() => persistUsers(users.filter(name => name !== u))} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="新成員名字" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="flex-1 p-2 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none" />
                    <button onClick={addMember} className="bg-stone-800 text-white p-2 rounded-xl"><Plus/></button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
