
import React, { useState, useEffect, useRef } from 'react';
import { GENERAL_INFO } from '../constants';
import { GeneralInfo, FlightDetail, Expense, DailyItinerary } from '../types';
import { Plane, Home, Lightbulb, Info, Map, Terminal, CheckCircle2, XCircle, RefreshCw, Edit3, Save, Check, Trash2, Plus, Database, FileJson, FileSpreadsheet, Download, Upload, Archive } from 'lucide-react';
import { getDebugInfo, db, isFirebaseConfigured } from '../firebase';
import { ref, set, remove, onValue, get, child } from 'firebase/database';

type InfoTab = 'flight' | 'hotel' | 'tips' | 'code' | 'data';

// 精細素描風格飯店插圖 (略過以節省篇幅，保持與原版一致)
const HotelIllustration = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="pencil-roughness">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
      <pattern id="hatch-light" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="#57534E" strokeWidth="0.5" opacity="0.3" />
      </pattern>
      <pattern id="hatch-heavy" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
         <line x1="0" y1="0" x2="0" y2="4" stroke="#44403C" strokeWidth="0.8" opacity="0.5" />
         <line x1="0" y1="0" x2="4" y2="0" stroke="#44403C" strokeWidth="0.8" opacity="0.5" />
      </pattern>
      <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#BAE6FD" />
      </linearGradient>
      <radialGradient id="lamp-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#FCD34D" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#sky-gradient)" />
    <g fill="#FFFFFF" opacity="0.8">
       <path d="M50,40 Q70,20 90,40 T130,40 T170,50 Q150,70 120,65 T50,40 Z" />
       <path d="M280,30 Q300,10 330,30 T380,30 T420,50 Q400,70 360,65 T280,30 Z" />
    </g>
    <g filter="url(#pencil-roughness)" stroke="#292524" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <g transform="translate(200, 35)">
            <rect x="125" y="25" width="10" height="185" fill="url(#hatch-heavy)" strokeWidth="0" />
            <line x1="125" y1="25" x2="125" y2="210" strokeWidth="1" />
            <line x1="135" y1="25" x2="135" y2="210" strokeWidth="1" />
            <rect x="25" y="20" width="100" height="190" strokeWidth="2" fill="white" />
            {[...Array(6)].map((_, r) => 
               [...Array(3)].map((_, c) => (
                 <rect key={`${r}-${c}`} x={40 + c * 28} y={40 + r * 24} width="18" height="16" strokeWidth="1" fill="#E0F2FE" />
               ))
            )}
            <rect x="-5" y="70" width="30" height="140" strokeWidth="2" fill="white" />
            <path d="M30,185 L120,185 L125,200 L25,200 Z" strokeWidth="1.5" fill="#44403C" />
        </g>
        <path d="M0,240 L400,240" strokeWidth="2" stroke="#57534E" />
    </g>
  </svg>
);

const BoardingPass: React.FC<{ type: 'Outbound' | 'Inbound'; data: FlightDetail }> = ({ type, data }) => (
    <div className="bg-white rounded-3xl border-2 border-stone-800 shadow-sketch relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="p-5 pb-6 bg-white relative z-10">
        <div className="flex justify-between items-center mb-4">
           <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Cathay_Pacific_logo.svg/300px-Cathay_Pacific_logo.svg.png" alt="Cathay Pacific" className="h-6 w-auto object-contain" />
           <div className="bg-autumn-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">{type}</div>
        </div>
        <div className="mb-5 border-b-2 border-dashed border-stone-100 pb-4">
           <div className="text-2xl font-black text-stone-800 leading-tight">{data.date} <span className="text-autumn-500 whitespace-nowrap">- {data.flightNo}</span></div>
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="text-center">
            <div className="text-4xl font-black text-stone-800 font-sans tracking-wider">{data.fromCode}</div>
            <div className="text-xl font-bold text-stone-500 mt-1">{data.depTime}</div>
          </div>
          <div className="flex-1 px-4 flex flex-col items-center">
             <div className="w-full h-0.5 bg-stone-300 relative"><Plane className="w-5 h-5 text-autumn-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 transform rotate-90" /></div>
             <div className="text-xs text-stone-400 mt-2 font-sans">{data.duration}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-stone-800 font-sans tracking-wider">{data.toCode}</div>
            <div className="text-xl font-bold text-stone-500 mt-1">{data.arrTime}</div>
          </div>
        </div>
      </div>
      <div className="relative h-6 bg-stone-50 border-t-2 border-dashed border-stone-300 flex items-center justify-between">
        <div className="w-4 h-4 bg-paper rounded-full border-r-2 border-stone-300 absolute -left-2 top-1/2 -translate-y-1/2"></div>
        <div className="w-4 h-4 bg-paper rounded-full border-l-2 border-stone-300 absolute -right-2 top-1/2 -translate-y-1/2"></div>
      </div>
      <div className="bg-stone-50 p-4 pt-2 flex justify-between items-end border-t-0">
         <div className="flex gap-4">
            <div><span className="text-[10px] text-stone-400 uppercase font-bold block">Terminal</span><span className="text-lg font-bold text-stone-800">{data.terminal}</span></div>
            <div><span className="text-[10px] text-stone-400 uppercase font-bold block">Gate</span><span className="text-lg font-bold text-stone-800">--</span></div>
            <div><span className="text-[10px] text-stone-400 uppercase font-bold block">Seat</span><span className="text-lg font-bold text-stone-800">--</span></div>
         </div>
         <div className="h-8 flex items-end gap-[2px] opacity-60">
            {[...Array(15)].map((_,i) => <div key={i} className={`bg-stone-800 h-full ${i%2===0 ? 'w-1' : 'w-0.5'}`}></div>)}
         </div>
      </div>
    </div>
);

const EditInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
    <div className="mb-2">
        <label className="block text-xs font-bold text-stone-500 mb-1">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-stone-50 p-2 border border-stone-300 rounded-lg focus:border-autumn-300 outline-none text-sm" placeholder={placeholder} />
    </div>
);

const InfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InfoTab>('flight');
  const [testStatus, setTestStatus] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [infoData, setInfoData] = useState<GeneralInfo>(GENERAL_INFO);
  const [dataSource, setDataSource] = useState<'cloud' | 'local'>('cloud');
  const [isOnline, setIsOnline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const debugInfo = getDebugInfo();

  // Sync data
  useEffect(() => {
    // Check Local Backup first
    const localInfo = localStorage.getItem('local_archive_general_info');
    if (localInfo) {
        setInfoData(JSON.parse(localInfo));
        setDataSource('local');
    }

    if (!isFirebaseConfigured) return;
    const infoRef = ref(db, 'general_info');
    
    const unsub = onValue(infoRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setInfoData(data);
            setDataSource('cloud');
            setIsOnline(true);
        } else if (!localInfo) {
            set(infoRef, GENERAL_INFO);
            setIsOnline(true);
        }
    }, (error) => {
        setIsOnline(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (dataSource === 'local') {
        localStorage.setItem('local_archive_general_info', JSON.stringify(infoData));
        setIsEditing(false);
        return;
    }
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

  // Export/Import logic
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExportJSON = async () => {
    try {
        let dataToExport = {};
        if (isFirebaseConfigured) {
            const snapshot = await get(ref(db));
            dataToExport = snapshot.val() || {};
        } else {
            // Fallback to local keys if offline
            dataToExport = {
                general_info: JSON.parse(localStorage.getItem('local_archive_general_info') || 'null'),
                itinerary: JSON.parse(localStorage.getItem('local_archive_itinerary') || 'null'),
                expenses: JSON.parse(localStorage.getItem('local_archive_expenses') || 'null'),
                users: JSON.parse(localStorage.getItem('local_archive_users') || 'null'),
            };
        }
        downloadFile(JSON.stringify(dataToExport, null, 2), `hk_trip_archive.json`, 'application/json');
    } catch (e) { alert("匯出失敗"); }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const content = event.target?.result as string;
            const data = JSON.parse(content);
            
            if (confirm("這將會覆蓋目前的在地存檔，確定要還原嗎？")) {
                // Save to LocalStorage to ensure "Forever View"
                if (data.general_info) localStorage.setItem('local_archive_general_info', JSON.stringify(data.general_info));
                if (data.itinerary) localStorage.setItem('local_archive_itinerary', JSON.stringify(data.itinerary));
                if (data.expenses) localStorage.setItem('local_archive_expenses', JSON.stringify(data.expenses));
                if (data.users) localStorage.setItem('local_archive_users', JSON.stringify(data.users));
                if (data.config) localStorage.setItem('local_archive_config', JSON.stringify(data.config));

                // If Firebase is active, optionally sync back
                if (isFirebaseConfigured) {
                    await set(ref(db), data);
                }

                alert("還原成功！App 已切換至「在地封存」模式。");
                window.location.reload(); // Reload to refresh all views
            }
        } catch (err) { alert("讀取檔案失敗，請確保這是有效的備份 JSON。"); }
    };
    reader.readAsText(file);
  };

  const clearLocalArchive = () => {
      if (confirm("確定要刪除在地存檔嗎？這將會恢復讀取雲端或預設資料。")) {
          localStorage.removeItem('local_archive_general_info');
          localStorage.removeItem('local_archive_itinerary');
          localStorage.removeItem('local_archive_expenses');
          localStorage.removeItem('local_archive_users');
          localStorage.removeItem('local_archive_config');
          window.location.reload();
      }
  };

  const handleExportCSV = async () => {
    try {
        let expensesData = {};
        if (isFirebaseConfigured) {
            const snapshot = await get(child(ref(db), 'expenses'));
            expensesData = snapshot.val() || {};
        } else {
            expensesData = JSON.parse(localStorage.getItem('local_archive_expenses') || '{}');
        }

        const expenses: Expense[] = Object.values(expensesData);
        if (expenses.length === 0) { alert("沒有記帳資料"); return; }

        let csv = '\uFEFF日期,類別,店家名稱,金額,幣別,付款人,方式,分帳成員,細項\n';
        expenses.forEach(exp => {
            const details = exp.details ? exp.details.map(d => `${d.name}($${d.amount})`).join('; ') : '';
            csv += `${exp.date},${exp.category},"${exp.item}",${exp.originalAmount},${exp.currency},${exp.paidBy},${exp.paymentMethod},"${(exp.beneficiaries || []).join(';')}", "${details}"\n`;
        });
        downloadFile(csv, `expenses_export.csv`, 'text/csv');
    } catch (e) { alert("匯出 CSV 失敗"); }
  };

  // Helper updates
  const updateFlight = (type: 'outbound' | 'inbound', field: keyof FlightDetail, value: string) => {
      setInfoData(prev => ({ ...prev, flights: { ...prev.flights, [type]: { ...prev.flights[type], [field]: value } } }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-stone-50 border-b border-stone-200">
         <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${dataSource === 'cloud' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {dataSource === 'cloud' ? <RefreshCw className="w-2.5 h-2.5" /> : <Archive className="w-2.5 h-2.5" />}
                {dataSource === 'cloud' ? '雲端同步中' : '在地封存模式'}
            </span>
         </div>
         {activeTab !== 'data' && (
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${isEditing ? 'bg-autumn-400 text-white shadow-sketch' : 'bg-white border border-stone-300 text-stone-500'}`}>
                {isEditing ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                {isEditing ? '儲存變更' : '編輯資訊'}
            </button>
         )}
      </div>

      {/* Tab Nav */}
      <div className="flex p-2 bg-autumn-100/50 border-b-2 border-stone-800 border-dashed gap-2 overflow-x-auto no-scrollbar">
        {['flight', 'hotel', 'tips', 'code', 'data'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as InfoTab)} className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === tab ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch' : 'bg-white border-stone-300 text-stone-500'}`}>
            {tab === 'flight' && <Plane className="w-4 h-4" />}
            {tab === 'hotel' && <Home className="w-4 h-4" />}
            {tab === 'tips' && <Lightbulb className="w-4 h-4" />}
            {tab === 'code' && <Info className="w-4 h-4" />}
            {tab === 'data' && <Database className="w-4 h-4" />}
            <span className="text-xs">{tab === 'flight' ? '航班' : tab === 'hotel' ? '住宿' : tab === 'tips' ? '貼士' : tab === 'code' ? '花碼' : '備份'}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {activeTab === 'flight' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-300 pl-3">航班資訊</h2>
            {isEditing ? (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-autumn-300">
                        <h3 className="font-bold text-autumn-500 mb-2">去程編輯</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <EditInput label="航班號" value={infoData.flights.outbound.flightNo} onChange={v => updateFlight('outbound', 'flightNo', v)} />
                            <EditInput label="日期" value={infoData.flights.outbound.date} onChange={v => updateFlight('outbound', 'date', v)} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <EditInput label="出發" value={infoData.flights.outbound.fromCode} onChange={v => updateFlight('outbound', 'fromCode', v)} />
                            <EditInput label="時間" value={infoData.flights.outbound.depTime} onChange={v => updateFlight('outbound', 'depTime', v)} />
                            <EditInput label="抵達" value={infoData.flights.outbound.arrTime} onChange={v => updateFlight('outbound', 'arrTime', v)} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-autumn-300">
                        <h3 className="font-bold text-autumn-500 mb-2">回程編輯</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <EditInput label="航班號" value={infoData.flights.inbound.flightNo} onChange={v => updateFlight('inbound', 'flightNo', v)} />
                            <EditInput label="日期" value={infoData.flights.inbound.date} onChange={v => updateFlight('inbound', 'date', v)} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <BoardingPass type="Outbound" data={infoData.flights.outbound} />
                    <BoardingPass type="Inbound" data={infoData.flights.inbound} />
                </>
            )}
          </div>
        )}

        {activeTab === 'hotel' && (
          <div className="space-y-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-400 pl-3">住宿資訊</h2>
             <div className="bg-white rounded-3xl border-2 border-stone-800 shadow-sketch overflow-hidden">
                <div className="h-48 w-full bg-stone-300 relative"><HotelIllustration /></div>
                <div className="p-5">
                   <h3 className="text-2xl font-bold">{infoData.accommodation.name}</h3>
                   <p className="text-stone-500 text-sm mb-4">{infoData.accommodation.location}</p>
                   <a href={infoData.accommodation.googleMapLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-stone-800 text-white py-2.5 rounded-xl font-bold text-sm"><Map className="w-4 h-4" /> Google Map</a>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-200 pl-3">旅遊小貼士</h2>
            <div className="grid gap-3">
              {infoData.tips.map((tip, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-sm flex gap-3">
                  <div className="text-autumn-300 font-bold text-xl">{idx + 1}.</div>
                  <div className="text-stone-700 text-lg">{tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
           <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-blue-500 pl-3">資料封存與還原</h2>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Archive className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="text-xs text-blue-800 leading-relaxed">
                      <p className="font-bold mb-1">如何永久保存旅程？</p>
                      <p>1. 下載下方 <b>JSON 完整備份</b>。</p>
                      <p>2. 未來若資料庫過期，點擊 <b>「還原備份」</b> 上傳檔案。</p>
                      <p>3. App 會轉為在地模式，你可以隨時打開瀏覽回憶。</p>
                  </div>
              </div>

              <div className="grid gap-4">
                  {/* Export Group */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sketch flex flex-col gap-3">
                      <h3 className="font-bold text-stone-800 flex items-center gap-2"><Download className="w-4 h-4" /> 下載備份</h3>
                      <div className="flex gap-2">
                        <button onClick={handleExportJSON} className="flex-1 bg-stone-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                            <FileJson className="w-4 h-4" /> JSON 完整包
                        </button>
                        <button onClick={handleExportCSV} className="flex-1 border-2 border-stone-300 text-stone-600 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" /> CSV 表格
                        </button>
                      </div>
                  </div>

                  {/* Import Group */}
                  <div className="bg-autumn-50 p-5 rounded-2xl border-2 border-dashed border-stone-800 flex flex-col gap-3">
                      <h3 className="font-bold text-stone-800 flex items-center gap-2"><Upload className="w-4 h-4 text-autumn-500" /> 還原備份檔</h3>
                      <p className="text-[10px] text-stone-500">上傳之前的 .json 檔案，將 App 切換至「在地封存」模式。</p>
                      <input type="file" ref={fileInputRef} onChange={handleImportJSON} className="hidden" accept=".json" />
                      <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white border-2 border-stone-800 text-stone-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sketch">
                          選取 JSON 檔案並還原
                      </button>
                  </div>

                  {/* Reset Local Data */}
                  {dataSource === 'local' && (
                      <button onClick={clearLocalArchive} className="text-xs text-red-500 font-bold py-2 underline">
                          刪除在地存檔，恢復連線模式
                      </button>
                  )}
              </div>
           </div>
        )}

        <div className="mt-8 pt-4 border-t-2 border-dashed border-stone-300 text-center space-y-2 pb-6">
            <div className="inline-flex items-center gap-2 bg-stone-200 px-3 py-1 rounded-full text-[10px] text-stone-600 font-mono tracking-wider">
               <Terminal className="w-3 h-3" /> ARCHIVE SYSTEM (v1.5)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-left">
                <div className="p-2 rounded-lg bg-stone-100 border border-stone-200">
                    <b>Storage:</b> {dataSource === 'local' ? 'LocalStorage' : 'Firebase Cloud'}
                </div>
                <div className="p-2 rounded-lg bg-stone-100 border border-stone-200">
                    <b>Offline Mode:</b> {isFirebaseConfigured ? 'Ready' : 'Forced'}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
    <button onClick={onClick} className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${active ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch' : 'bg-white border-stone-300 text-stone-500 hover:bg-stone-50'}`}>
        {icon} <span className="text-xs">{label}</span>
    </button>
);

export default InfoView;
