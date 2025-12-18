
import React, { useState, useEffect } from 'react';
import { GENERAL_INFO } from '../constants';
import { GeneralInfo, FlightDetail, Expense, DailyItinerary } from '../types';
import { Plane, Home, Lightbulb, Info, Map, Terminal, CheckCircle2, XCircle, RefreshCw, Edit3, Save, Check, Trash2, Plus, Database, FileJson, FileSpreadsheet, Download } from 'lucide-react';
import { getDebugInfo, db, isFirebaseConfigured } from '../firebase';
import { ref, set, remove, onValue, get, child } from 'firebase/database';

type InfoTab = 'flight' | 'hotel' | 'tips' | 'code' | 'data';

// 精細素描風格飯店插圖 (藍天白雲版)
const HotelIllustration = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
    <defs>
      {/* 模擬鉛筆線條的抖動效果 */}
      <filter id="pencil-roughness">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
      
      {/* 淺色排線 (陰影) */}
      <pattern id="hatch-light" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="#57534E" strokeWidth="0.5" opacity="0.3" />
      </pattern>
      
      {/* 深色交叉排線 (深陰影) */}
      <pattern id="hatch-heavy" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
         <line x1="0" y1="0" x2="0" y2="4" stroke="#44403C" strokeWidth="0.8" opacity="0.5" />
         <line x1="0" y1="0" x2="4" y2="0" stroke="#44403C" strokeWidth="0.8" opacity="0.5" />
      </pattern>

      {/* 藍天漸層 */}
      <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" /> {/* Sky Blue */}
        <stop offset="100%" stopColor="#BAE6FD" /> {/* Lighter Blue */}
      </linearGradient>

      {/* 暖色燈光光暈 (放射狀) */}
      <radialGradient id="lamp-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" /> {/* Amber */}
        <stop offset="60%" stopColor="#FCD34D" stopOpacity="0.4" /> {/* Yellow */}
        <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Blue Sky Background */}
    <rect width="100%" height="100%" fill="url(#sky-gradient)" />
    
    {/* Clouds (White shapes) */}
    <g fill="#FFFFFF" opacity="0.8">
       <path d="M50,40 Q70,20 90,40 T130,40 T170,50 Q150,70 120,65 T50,40 Z" />
       <path d="M280,30 Q300,10 330,30 T380,30 T420,50 Q400,70 360,65 T280,30 Z" />
       <circle cx="200" cy="80" r="15" opacity="0.5" filter="blur(5px)" />
       <circle cx="230" cy="75" r="20" opacity="0.6" filter="blur(8px)" />
    </g>

    {/* Main Drawing Group with Roughness Filter */}
    <g filter="url(#pencil-roughness)" stroke="#292524" strokeLinecap="round" strokeLinejoin="round" fill="none">
        
        {/* Building Group - Shifted to x=200 (Right Side) */}
        <g transform="translate(200, 35)">
            {/* Building Side Shadow (Right) */}
            <rect x="125" y="25" width="10" height="185" fill="url(#hatch-heavy)" strokeWidth="0" />
            <line x1="125" y1="25" x2="125" y2="210" strokeWidth="1" />
            <line x1="135" y1="25" x2="135" y2="210" strokeWidth="1" />

            {/* Main Facade */}
            <rect x="25" y="20" width="100" height="190" strokeWidth="2" fill="white" />
            
            {/* Roof Details */}
            <line x1="75" y1="20" x2="75" y2="10" strokeWidth="1.5" />
            <line x1="75" y1="10" x2="90" y2="10" strokeWidth="1.5" />
            <line x1="82" y1="10" x2="82" y2="5" strokeWidth="1" />
            
            {/* Windows Grid */}
            {[...Array(6)].map((_, r) => 
               [...Array(3)].map((_, c) => (
                 <g key={`w-${r}-${c}`}>
                   <rect 
                     x={40 + c * 28} 
                     y={40 + r * 24} 
                     width="18" 
                     height="16" 
                     strokeWidth="1" 
                     fill={Math.random() > 0.6 ? "url(#hatch-light)" : "#E0F2FE"} // Slightly blueish windows reflecting sky
                   />
                   {/* Window Frame Detail */}
                   <line x1={40 + c * 28} y1={48 + r * 24} x2={58 + c * 28} y2={48 + r * 24} strokeWidth="0.5" opacity="0.5" />
                   <line x1={49 + c * 28} y1={40 + r * 24} x2={49 + c * 28} y2={56 + r * 24} strokeWidth="0.5" opacity="0.5" />
                 </g>
               ))
            )}
            
            {/* Left Side Wing */}
            <rect x="-5" y="70" width="30" height="140" strokeWidth="2" fill="white" />
            {/* Side Wing Windows */}
            {[...Array(5)].map((_, i) => (
                <line key={`sw-${i}`} x1="0" y1={85 + i*25} x2="20" y2={85 + i*25} strokeWidth="0.5" opacity="0.5" />
            ))}

            {/* Vertical Sign on Side Wing */}
            <g transform="translate(5, 80)">
                <rect x="0" y="0" width="12" height="70" strokeWidth="1.5" fill="#B91C1C" /> {/* Red Sign Background */}
                <rect x="2" y="2" width="8" height="66" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <text x="6" y="35" fontSize="7" fill="white" fontWeight="bold" transform="rotate(90 6,35)" textAnchor="middle" style={{fontFamily: 'serif', stroke:'none'}}>
                    CITY VIEW
                </text>
            </g>

            {/* Entrance Canopy */}
            <path d="M30,185 L120,185 L125,200 L25,200 Z" strokeWidth="1.5" fill="#44403C" /> {/* Dark Canopy */}
            <line x1="35" y1="185" x2="35" y2="200" strokeWidth="0.5" stroke="white" />
            <line x1="115" y1="185" x2="115" y2="200" strokeWidth="0.5" stroke="white" />

             {/* Main Sign Board */}
            <g transform="translate(45, 162)">
                <rect x="0" y="0" width="60" height="14" fill="white" strokeWidth="1" />
                <rect x="2" y="2" width="56" height="10" strokeWidth="0.5" opacity="0.5" />
                <text x="30" y="9" fontSize="6.5" fill="#292524" fontWeight="bold" textAnchor="middle" style={{fontFamily: 'serif', stroke:'none', letterSpacing: '0.5px'}}>
                    The CITY VIEW
                </text>
            </g>
        </g>
        
        {/* Street Lamp - Shifted to x=150 */}
         <g transform="translate(150, 140)">
           {/* Light Glow Effect (Behind the lamp structure) */}
           <circle cx="15" cy="10" r="18" fill="url(#lamp-glow)" stroke="none" filter="blur(2px)" />
           
           <line x1="0" y1="0" x2="0" y2="100" strokeWidth="2" stroke="#44403C" />
           <path d="M0,0 C0,-10 15,-5 15,5" strokeWidth="1.5" fill="none" stroke="#44403C" />
           <path d="M15,5 L10,12 L20,12 Z" strokeWidth="1" fill="#FEF3C7" stroke="#44403C" /> {/* Bulb Housing */}
           
           {/* Rays of light */}
           <line x1="15" y1="15" x2="15" y2="25" stroke="#FBBF24" strokeWidth="0.5" />
           <line x1="10" y1="14" x2="5" y2="20" stroke="#FBBF24" strokeWidth="0.5" />
           <line x1="20" y1="14" x2="25" y2="20" stroke="#FBBF24" strokeWidth="0.5" />
        </g>

        {/* Taxi - Shifted to Right (x=320) */}
        <g transform="translate(320, 220)">
            {/* Wheels */}
            <circle cx="8" cy="25" r="3.5" strokeWidth="1.5" fill="#292524" />
            <circle cx="8" cy="25" r="1" fill="#57534E" stroke="none" />
            <circle cx="32" cy="25" r="3.5" strokeWidth="1.5" fill="#292524" />
            <circle cx="32" cy="25" r="1" fill="#57534E" stroke="none" />
            
            {/* Car Body - Red Taxi Color */}
            <path d="M0,15 L5,5 L35,5 L40,15 L40,25 L35,25 M5,25 L0,25 Z" strokeWidth="1.5" fill="#DC2626" />
            {/* Roof - Silver/White */}
            <path d="M5,5 L35,5 L33,3 L7,3 Z" fill="#E5E5E5" stroke="none" />

            {/* Windows */}
            <path d="M7,6 L18,6 L18,14 L2,14 Z" strokeWidth="1" fill="#E0F2FE" />
            <path d="M22,6 L33,6 L38,14 L22,14 Z" strokeWidth="1" fill="#E0F2FE" />
            
            {/* Taxi Sign */}
            <rect x="15" y="2" width="10" height="3" fill="white" strokeWidth="1" />
            <text x="20" y="4.5" fontSize="2" fill="red" textAnchor="middle" stroke="none" fontWeight="bold">TAXI</text>
            
            {/* Stripe */}
            <line x1="0" y1="18" x2="40" y2="18" strokeWidth="1" strokeDasharray="40,0" stroke="white" opacity="0.3" />
        </g>

        {/* Foreground Vegetation (Scribbles) - Greenish now */}
        <g strokeWidth="0.8" stroke="#166534">
             <path d="M300,240 Q310,225 320,240 T340,240" fill="#DCFCE7" />
             <path d="M350,240 Q360,220 370,240 T390,240" fill="#DCFCE7" />
             <path d="M310,240 L315,225 L320,240" opacity="0.6" />
        </g>
        
        {/* Ground Line */}
        <path d="M0,240 L400,240" strokeWidth="2" stroke="#57534E" />
    </g>
  </svg>
);

// 登機證組件 (Data Driven)
const BoardingPass: React.FC<{
  type: 'Outbound' | 'Inbound';
  data: FlightDetail;
}> = ({ type, data }) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-stone-800 shadow-sketch relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      {/* Top Section: Main Info */}
      <div className="p-5 pb-6 bg-white relative z-10">
        
        {/* Header: Logo & Tag */}
        <div className="flex justify-between items-center mb-4">
           {/* Cathay Logo - Smaller and Left Aligned */}
           <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Cathay_Pacific_logo.svg/300px-Cathay_Pacific_logo.svg.png" 
              alt="Cathay Pacific" 
              className="h-6 w-auto object-contain" 
           />
           
           <div className="bg-autumn-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
             {type}
           </div>
        </div>

        {/* Date + Flight No - Bold & Larger */}
        <div className="mb-5 border-b-2 border-dashed border-stone-100 pb-4">
           <div className="text-2xl font-black text-stone-800 leading-tight">
              {data.date} <span className="text-autumn-500 whitespace-nowrap">- {data.flightNo}</span>
           </div>
        </div>

        {/* Route Info */}
        <div className="flex justify-between items-center px-1">
          <div className="text-center">
            <div className="text-4xl font-black text-stone-800 font-sans tracking-wider">{data.fromCode}</div>
            <div className="text-xl font-bold text-stone-500 mt-1">{data.depTime}</div>
          </div>
          
          <div className="flex-1 px-4 flex flex-col items-center">
             <div className="w-full h-0.5 bg-stone-300 relative">
               <Plane className="w-5 h-5 text-autumn-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 transform rotate-90" />
             </div>
             <div className="text-xs text-stone-400 mt-2 font-sans">{data.duration}</div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-black text-stone-800 font-sans tracking-wider">{data.toCode}</div>
            <div className="text-xl font-bold text-stone-500 mt-1">{data.arrTime}</div>
          </div>
        </div>
      </div>

      {/* Divider with Cutouts */}
      <div className="relative h-6 bg-stone-50 border-t-2 border-dashed border-stone-300 flex items-center justify-between">
        <div className="w-4 h-4 bg-paper rounded-full border-r-2 border-stone-300 absolute -left-2 top-1/2 -translate-y-1/2"></div>
        <div className="w-4 h-4 bg-paper rounded-full border-l-2 border-stone-300 absolute -right-2 top-1/2 -translate-y-1/2"></div>
      </div>

      {/* Bottom Section: Footer Info */}
      <div className="bg-stone-50 p-4 pt-2 flex justify-between items-end border-t-0">
         <div className="flex gap-4">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Terminal</span>
              <span className="text-lg font-bold text-stone-800">{data.terminal}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Gate</span>
              <span className="text-lg font-bold text-stone-800">--</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Seat</span>
              <span className="text-lg font-bold text-stone-800">--</span>
            </div>
         </div>
         
         {/* Fake Barcode */}
         <div className="h-8 flex items-end gap-[2px] opacity-60">
            {[...Array(15)].map((_,i) => (
              <div key={i} className={`bg-stone-800 h-full ${i%2===0 ? 'w-1' : 'w-0.5'}`}></div>
            ))}
         </div>
      </div>
    </div>
  );
};

// Form Helper Component
const EditInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
    <div className="mb-2">
        <label className="block text-xs font-bold text-stone-500 mb-1">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={e => onChange(e.target.value)}
            className="w-full bg-stone-50 p-2 border border-stone-300 rounded-lg focus:border-autumn-300 outline-none text-sm"
            placeholder={placeholder}
        />
    </div>
);

const InfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InfoTab>('flight');
  const [testStatus, setTestStatus] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [infoData, setInfoData] = useState<GeneralInfo>(GENERAL_INFO);
  const [isOnline, setIsOnline] = useState(false);
  
  const debugInfo = getDebugInfo();

  // Sync data from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const infoRef = ref(db, 'general_info');
    
    const unsub = onValue(infoRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setInfoData(data);
            setIsOnline(true);
        } else {
            // If empty, sync default data
            set(infoRef, GENERAL_INFO);
            setIsOnline(true);
        }
    }, (error) => {
        console.error(error);
        setIsOnline(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!isFirebaseConfigured) {
        alert("請設定 Firebase Key");
        return;
    }
    try {
        await set(ref(db, 'general_info'), infoData);
        setIsEditing(false);
    } catch (e: any) {
        alert("儲存失敗: " + e.message);
    }
  };

  // Helper to update specific flight fields
  const updateFlight = (type: 'outbound' | 'inbound', field: keyof FlightDetail, value: string) => {
      setInfoData(prev => ({
          ...prev,
          flights: {
              ...prev.flights,
              [type]: {
                  ...prev.flights[type],
                  [field]: value
              }
          }
      }));
  };

  // Helper functions for tips
  const updateTip = (index: number, value: string) => {
      const newTips = [...(infoData.tips || [])];
      newTips[index] = value;
      setInfoData({ ...infoData, tips: newTips });
  };

  const addTip = () => {
      setInfoData({ ...infoData, tips: [...(infoData.tips || []), ""] });
  };

  const deleteTip = (index: number) => {
      const newTips = (infoData.tips || []).filter((_, i) => i !== index);
      setInfoData({ ...infoData, tips: newTips });
  };

  const runConnectionTest = async () => {
    setTestStatus('Testing...');
    try {
        const testRef = ref(db, 'connection_test');
        await set(testRef, { timestamp: Date.now(), status: 'ok' });
        await remove(testRef);
        setTestStatus('✅ 連線成功 (Write/Delete OK)');
    } catch (e: any) {
        console.error(e);
        if (e.code === 'PERMISSION_DENIED') {
            setTestStatus('❌ 權限不足 (請檢查 Database Rules)');
        } else {
            setTestStatus(`❌ 失敗: ${e.message}`);
        }
    }
  };

  // --- Export Functions ---

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExportJSON = async () => {
    if (!isFirebaseConfigured) {
        alert("未連線至資料庫，無法下載完整資料。");
        return;
    }
    
    try {
        const dbRef = ref(db);
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const jsonString = JSON.stringify(data, null, 2);
            downloadFile(jsonString, `hk_trip_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        } else {
            alert("資料庫中沒有資料。");
        }
    } catch (error) {
        console.error(error);
        alert("匯出失敗，請檢查網路。");
    }
  };

  const handleExportCSV = async () => {
    if (!isFirebaseConfigured) {
        alert("未連線至資料庫。");
        return;
    }

    try {
        const snapshot = await get(child(ref(db), 'expenses'));
        if (snapshot.exists()) {
            const expensesData = snapshot.val();
            const expenses: Expense[] = Object.values(expensesData);

            // CSV Header
            let csvContent = '\uFEFF'; // Add BOM for Excel UTF-8 compatibility
            csvContent += "日期,類別,店家名稱,總金額(原幣),幣別,付款人,付款方式,分帳成員,細項內容\n";

            expenses.forEach(exp => {
                const subItemText = exp.details 
                    ? exp.details.map(d => `${d.name}($${d.amount})`).join('; ') 
                    : '';
                
                const beneficiariesText = (exp.beneficiaries || []).join('; ');

                const row = [
                    exp.date,
                    exp.category,
                    `"${exp.item.replace(/"/g, '""')}"`, // Handle quotes in store name
                    exp.originalAmount,
                    exp.currency,
                    exp.paidBy,
                    exp.paymentMethod,
                    `"${beneficiariesText}"`,
                    `"${subItemText.replace(/"/g, '""')}"`
                ].join(",");
                csvContent += row + "\n";
            });

            downloadFile(csvContent, `expenses_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        } else {
            alert("沒有記帳資料可匯出。");
        }
    } catch (error) {
        console.error(error);
        alert("匯出失敗。");
    }
  };


  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header with Edit Toggle */}
      <div className="flex justify-between items-center px-4 py-2 bg-stone-50 border-b border-stone-200">
         <span className={`text-xs flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-stone-400'}`}>
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-stone-300'}`}></div>
             {isOnline ? '已同步' : (isFirebaseConfigured ? '離線' : '未連線')}
         </span>
         {activeTab !== 'data' && (
            <button 
                onClick={() => {
                    if(isEditing) handleSave();
                    else setIsEditing(true);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isEditing 
                    ? 'bg-autumn-400 text-white shadow-sketch' 
                    : 'bg-white border border-stone-300 text-stone-500'
                }`}
            >
                {isEditing ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                {isEditing ? '儲存變更' : '編輯資訊'}
            </button>
         )}
      </div>

      {/* Tab Navigation */}
      <div className="flex p-2 bg-autumn-100/50 border-b-2 border-stone-800 border-dashed gap-2 overflow-x-auto no-scrollbar">
        <TabButton 
          active={activeTab === 'flight'} 
          onClick={() => setActiveTab('flight')} 
          label="航班" 
          icon={<Plane className="w-4 h-4" />}
        />
        <TabButton 
          active={activeTab === 'hotel'} 
          onClick={() => setActiveTab('hotel')} 
          label="住宿" 
          icon={<Home className="w-4 h-4" />}
        />
        <TabButton 
          active={activeTab === 'tips'} 
          onClick={() => setActiveTab('tips')} 
          label="貼士" 
          icon={<Lightbulb className="w-4 h-4" />}
        />
        <TabButton 
          active={activeTab === 'code'} 
          onClick={() => setActiveTab('code')} 
          label="花碼" 
          icon={<Info className="w-4 h-4" />}
        />
        <TabButton 
          active={activeTab === 'data'} 
          onClick={() => setActiveTab('data')} 
          label="備份" 
          icon={<Database className="w-4 h-4" />}
        />
      </div>

      {/* Content Container - Added h-full and overflow-y-auto to fix scrolling */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* Flight Content */}
        {activeTab === 'flight' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-300 pl-3">航班資訊</h2>
            
            {/* Outbound */}
            {isEditing ? (
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-autumn-300 mb-4">
                    <h3 className="font-bold text-autumn-500 mb-2">去程 (Outbound) 編輯</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <EditInput label="航班號" value={infoData.flights.outbound.flightNo} onChange={v => updateFlight('outbound', 'flightNo', v)} />
                        <EditInput label="日期" value={infoData.flights.outbound.date} onChange={v => updateFlight('outbound', 'date', v)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <EditInput label="出發地" value={infoData.flights.outbound.fromCode} onChange={v => updateFlight('outbound', 'fromCode', v)} />
                        <EditInput label="起飛時間" value={infoData.flights.outbound.depTime} onChange={v => updateFlight('outbound', 'depTime', v)} />
                        <EditInput label="飛行時間" value={infoData.flights.outbound.duration} onChange={v => updateFlight('outbound', 'duration', v)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                         <EditInput label="目的地" value={infoData.flights.outbound.toCode} onChange={v => updateFlight('outbound', 'toCode', v)} />
                         <EditInput label="抵達時間" value={infoData.flights.outbound.arrTime} onChange={v => updateFlight('outbound', 'arrTime', v)} />
                         <EditInput label="航廈" value={infoData.flights.outbound.terminal} onChange={v => updateFlight('outbound', 'terminal', v)} />
                    </div>
                </div>
            ) : (
                <BoardingPass 
                  type="Outbound"
                  data={infoData.flights.outbound}
                />
            )}

            {/* Inbound */}
            {isEditing ? (
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-autumn-300">
                    <h3 className="font-bold text-autumn-500 mb-2">回程 (Inbound) 編輯</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <EditInput label="航班號" value={infoData.flights.inbound.flightNo} onChange={v => updateFlight('inbound', 'flightNo', v)} />
                        <EditInput label="日期" value={infoData.flights.inbound.date} onChange={v => updateFlight('inbound', 'date', v)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <EditInput label="出發地" value={infoData.flights.inbound.fromCode} onChange={v => updateFlight('inbound', 'fromCode', v)} />
                        <EditInput label="起飛時間" value={infoData.flights.inbound.depTime} onChange={v => updateFlight('inbound', 'depTime', v)} />
                        <EditInput label="飛行時間" value={infoData.flights.inbound.duration} onChange={v => updateFlight('inbound', 'duration', v)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                         <EditInput label="目的地" value={infoData.flights.inbound.toCode} onChange={v => updateFlight('inbound', 'toCode', v)} />
                         <EditInput label="抵達時間" value={infoData.flights.inbound.arrTime} onChange={v => updateFlight('inbound', 'arrTime', v)} />
                         <EditInput label="航廈" value={infoData.flights.inbound.terminal} onChange={v => updateFlight('inbound', 'terminal', v)} />
                    </div>
                </div>
            ) : (
                <BoardingPass 
                  type="Inbound"
                  data={infoData.flights.inbound}
                />
            )}
            
            <div className="bg-stone-100 p-3 rounded-xl border border-stone-200 text-stone-500 text-xs text-center">
                請務必於起飛前 2.5 小時抵達機場辦理登機手續
            </div>
          </div>
        )}

        {/* Hotel Content */}
        {activeTab === 'hotel' && (
          <div className="space-y-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-400 pl-3">住宿資訊</h2>
             
             {/* Hotel Card */}
             {isEditing ? (
                 <div className="bg-white p-4 rounded-3xl border-2 border-dashed border-stone-800">
                     <EditInput label="飯店名稱 (中文)" value={infoData.accommodation.name} onChange={v => setInfoData({...infoData, accommodation: {...infoData.accommodation, name: v}})} />
                     <EditInput label="飯店名稱 (英文)" value={infoData.accommodation.enName} onChange={v => setInfoData({...infoData, accommodation: {...infoData.accommodation, enName: v}})} />
                     <EditInput label="位置" value={infoData.accommodation.location} onChange={v => setInfoData({...infoData, accommodation: {...infoData.accommodation, location: v}})} />
                     <EditInput label="Google Map 連結" value={infoData.accommodation.googleMapLink} onChange={v => setInfoData({...infoData, accommodation: {...infoData.accommodation, googleMapLink: v}})} />
                     
                     <label className="block text-xs font-bold text-stone-500 mb-1">描述</label>
                     <textarea 
                        value={infoData.accommodation.description}
                        onChange={e => setInfoData({...infoData, accommodation: {...infoData.accommodation, description: e.target.value}})}
                        className="w-full bg-stone-50 p-2 border border-stone-300 rounded-lg focus:border-autumn-300 outline-none text-sm h-24"
                     />
                 </div>
             ) : (
             <div className="bg-white p-0 rounded-3xl border-2 border-stone-800 shadow-sketch overflow-hidden">
                {/* Hotel Image with Fallback */}
                <div className="h-48 w-full bg-stone-300 relative flex items-center justify-center overflow-hidden">
                   {/* Watercolor SVG Illustration */}
                   <HotelIllustration />
                   
                   {/* Gradient Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-4 z-20 pointer-events-none">
                      <div className="text-white">
                         <h3 className="text-2xl font-bold leading-none shadow-black drop-shadow-md">{infoData.accommodation.name}</h3>
                         <h4 className="text-sm font-sans opacity-90 drop-shadow-sm">{infoData.accommodation.enName}</h4>
                      </div>
                   </div>
                </div>

                <div className="p-5">
                   {/* Actions */}
                   <div className="flex gap-2 mb-4">
                      <a 
                        href={infoData.accommodation.googleMapLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-stone-800 text-white py-2.5 rounded-xl font-bold hover:bg-stone-700 transition-colors shadow-sm text-sm"
                      >
                          <Map className="w-4 h-4" />
                          <span>Google Map</span>
                      </a>
                   </div>

                   <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                      <div className="flex items-start gap-2 mb-2">
                         <Map className="w-4 h-4 text-autumn-400 mt-1 flex-shrink-0" />
                         <span className="text-stone-700 font-bold">{infoData.accommodation.location}</span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed whitespace-pre-line">
                          {infoData.accommodation.description}
                      </p>
                   </div>
                </div>
             </div>
             )}
          </div>
        )}

        {/* Tips Content */}
        {activeTab === 'tips' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-200 pl-3">旅遊小貼士</h2>
            
            {isEditing ? (
              <div className="space-y-3">
                 {/* Tips Edit List */}
                 {(infoData.tips || []).map((tip, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded-xl border border-stone-300">
                        <div className="bg-autumn-200 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-2">
                           {idx + 1}
                        </div>
                        <textarea
                           value={tip}
                           onChange={(e) => updateTip(idx, e.target.value)}
                           className="flex-1 bg-transparent outline-none p-2 text-stone-700 text-sm resize-none h-20 border-b border-dashed border-stone-200 focus:border-autumn-300"
                           placeholder="輸入貼士內容..."
                        />
                        <button 
                          onClick={() => deleteTip(idx)}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                 ))}
                 
                 {/* Add Tip Button */}
                 <button 
                   onClick={addTip}
                   className="w-full py-3 border-2 border-dashed border-stone-400 rounded-xl text-stone-500 font-bold flex items-center justify-center gap-2 hover:bg-stone-50 hover:border-autumn-300 hover:text-autumn-300 transition-colors"
                 >
                     <Plus className="w-5 h-5" /> 新增一條貼士
                 </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {infoData.tips.map((tip, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-sm flex gap-3 items-start">
                    <div className="text-autumn-300 font-bold text-xl mt-[-2px]">{idx + 1}.</div>
                    <div className="text-stone-700 text-lg leading-snug">{tip}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flower Code Content */}
        {activeTab === 'code' && (
          <div className="space-y-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-stone-500 pl-3">香港花碼字</h2>
             <div className="bg-stone-800 text-paper p-6 rounded-2xl shadow-sketch-lg">
                <p className="text-lg opacity-90 mb-6 leading-relaxed">
                  花碼字 (蘇州碼子) 是香港傳統街市或小巴價錢牌上常見的數字寫法，充滿懷舊情懷。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                      { code: '〡', num: 1 }, { code: '〢', num: 2 },
                      { code: '〣', num: 3 }, { code: '〤', num: 4 },
                      { code: '〥', num: 5 }, { code: '〦', num: 6 },
                      { code: '〧', num: 7 }, { code: '〨', num: 8 },
                      { code: '〩', num: 9 }, { code: '十', num: 10 }
                  ].map((item) => (
                      <div key={item.num} className="bg-stone-700/50 p-3 rounded-lg flex items-center justify-between border border-stone-600">
                          <span className="text-3xl font-serif text-autumn-200">{item.code}</span>
                          <span className="text-xl font-bold opacity-50">{item.num}</span>
                      </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* Data Backup Content */}
        {activeTab === 'data' && (
           <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-blue-500 pl-3">資料備份</h2>
              <div className="bg-stone-100 p-4 rounded-xl text-stone-600 text-sm">
                 <p className="mb-2 font-bold flex items-center gap-2">
                     <Info className="w-4 h-4 text-blue-500" />
                     為什麼需要備份？
                 </p>
                 <p>目前的資料庫可能有使用期限。建議在旅程結束後，將珍貴的記帳與行程資料匯出保存。</p>
              </div>

              <div className="grid gap-4">
                  {/* CSV Export */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sketch flex flex-col gap-3">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="bg-green-100 p-2 rounded-lg text-green-600">
                              <FileSpreadsheet className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-stone-800">匯出記帳 (CSV)</h3>
                              <p className="text-xs text-stone-500">適合用 Excel 或 Google Sheets 開啟整理。</p>
                          </div>
                      </div>
                      <button 
                        onClick={handleExportCSV}
                        className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                          <Download className="w-4 h-4" /> 下載 CSV 表格
                      </button>
                  </div>

                  {/* JSON Export */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sketch flex flex-col gap-3">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="bg-orange-100 p-2 rounded-lg text-orange-500">
                              <FileJson className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-stone-800">完整備份 (JSON)</h3>
                              <p className="text-xs text-stone-500">包含行程、記帳、設定等所有資料，格式為 JSON。</p>
                          </div>
                      </div>
                      <button 
                        onClick={handleExportJSON}
                        className="w-full bg-white border-2 border-stone-300 text-stone-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
                      >
                          <Download className="w-4 h-4" /> 下載完整資料包
                      </button>
                  </div>
              </div>
           </div>
        )}

        {/* System Diagnostic Footer */}
        <div className="mt-8 pt-4 border-t-2 border-dashed border-stone-300 text-center space-y-2 pb-6">
            <div className="inline-flex items-center gap-2 bg-stone-200 px-3 py-1 rounded-full text-[10px] text-stone-600 font-mono tracking-wider">
               <Terminal className="w-3 h-3" />
               SYSTEM DIAGNOSTIC (v1.3)
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-left">
                <div className={`p-2 rounded-lg border ${debugInfo.configured ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <div className="font-bold flex items-center justify-center gap-1 mb-1">
                        {debugInfo.configured ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                        Firebase SDK
                    </div>
                    <div className="text-center">{debugInfo.configured ? 'Config Loaded' : 'Missing Key'}</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 font-mono flex flex-col justify-center text-center">
                    <div className="font-bold text-[10px] text-stone-400">Key Preview</div>
                    <div className="break-all font-bold">{debugInfo.keyPreview}</div>
                </div>
            </div>

            {/* Test Connection Button */}
            <div className="bg-white p-2 rounded-xl border border-stone-200 mt-2">
                <button 
                  onClick={runConnectionTest}
                  className="w-full bg-stone-800 text-white text-xs font-bold py-2 rounded-lg hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-3 h-3" />
                    測試寫入權限 (Test Write)
                </button>
                {testStatus && (
                    <div className={`mt-2 text-xs font-bold ${testStatus.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>
                        {testStatus}
                    </div>
                )}
            </div>

            <p className="text-[10px] text-stone-400 px-4">
                若測試結果為 "Permission Denied"，請至 Firebase Console 修改 Rules 為 true。
            </p>
        </div>

      </div>
    </div>
  );
};

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
}> = ({ active, onClick, label, icon }) => (
    <button 
        onClick={onClick}
        className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
          active 
            ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch' 
            : 'bg-white border-stone-300 text-stone-500 hover:bg-stone-50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default InfoView;
