
import React, { useState, useEffect, useRef } from 'react';
import { GENERAL_INFO } from '../constants';
import { GeneralInfo, FlightDetail, Expense, DailyItinerary } from '../types';
import { Plane, Home, Lightbulb, Info, Map, Terminal, CheckCircle2, XCircle, RefreshCw, Edit3, Save, Check, Trash2, Plus, Database, FileJson, FileSpreadsheet, Download, Upload, Archive } from 'lucide-react';
import { getDebugInfo, db, isFirebaseConfigured } from '../firebase';
import { ref, set, remove, onValue, get, child } from 'firebase/database';

type InfoTab = 'flight' | 'hotel' | 'tips' | 'code' | 'data';

// Hotel Illustration (保持一致)
const HotelIllustration = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="pencil-roughness"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="2"/></filter>
      <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#BAE6FD"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#sky-gradient)" />
    <g filter="url(#pencil-roughness)" stroke="#292524" fill="none">
        <rect x="225" y="55" width="100" height="190" strokeWidth="2" fill="white" />
        <path d="M0,240 L400,240" strokeWidth="2" stroke="#57534E" />
    </g>
  </svg>
);

const BoardingPass: React.FC<{ type: 'Outbound' | 'Inbound'; data: FlightDetail }> = ({ type, data }) => (
    <div className="bg-white rounded-3xl border-2 border-stone-800 shadow-sketch relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="p-5 pb-6 bg-white relative z-10">
        <div className="flex justify-between items-center mb-4">
           <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Cathay_Pacific_logo.svg/300px-Cathay_Pacific_logo.svg.png" alt="Cathay Pacific" className="h-6 w-auto object-contain" />
           <div className="bg-autumn-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{type}</div>
        </div>
        <div className="mb-5 border-b-2 border-dashed border-stone-100 pb-4">
           <div className="text-2xl font-black text-stone-800">{data.date} <span className="text-autumn-500">- {data.flightNo}</span></div>
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="text-center"><div className="text-4xl font-black text-stone-800">{data.fromCode}</div><div className="text-xl font-bold text-stone-500 mt-1">{data.depTime}</div></div>
          <div className="flex-1 px-4 flex flex-col items-center"><div className="w-full h-0.5 bg-stone-300 relative"><Plane className="w-5 h-5 text-autumn-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 transform rotate-90" /></div><div className="text-xs text-stone-400 mt-2">{data.duration}</div></div>
          <div className="text-center"><div className="text-4xl font-black text-stone-800">{data.toCode}</div><div className="text-xl font-bold text-stone-500 mt-1">{data.arrTime}</div></div>
        </div>
      </div>
      <div className="bg-stone-50 p-4 pt-2 flex justify-between items-end border-t-2 border-dashed border-stone-300">
         <div className="flex gap-4">
            <div><span className="text-[10px] text-stone-400 font-bold block uppercase">Terminal</span><span className="text-lg font-bold text-stone-800">{data.terminal}</span></div>
            <div><span className="text-[10px] text-stone-400 font-bold block uppercase">Gate</span><span className="text-lg font-bold text-stone-800">--</span></div>
         </div>
         <div className="h-8 flex items-end gap-[2px] opacity-60">{[...Array(15)].map((_,i) => <div key={i} className={`bg-stone-800 h-full ${i%2===0 ? 'w-1' : 'w-0.5'}`}></div>)}</div>
      </div>
    </div>
);

const EditInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
    <div className="mb-2">
        <label className="block text-xs font-bold text-stone-500 mb-1">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-stone-50 p-2 border border-stone-300 rounded-lg outline-none text-sm" />
    </div>
);

const InfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InfoTab>('flight');
  const [isEditing, setIsEditing] = useState(false);
  const [infoData, setInfoData] = useState<GeneralInfo>(GENERAL_INFO);
  const [dataSource, setDataSource] = useState<'cloud' | 'local'>('cloud');
  const [isOnline, setIsOnline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const debugInfo = getDebugInfo();

  useEffect(() => {
    const localInfo = localStorage.getItem('local_archive_general_info');
    if (localInfo) {
        setInfoData(JSON.parse(localInfo));
        setDataSource('local');
    }

    if (!isFirebaseConfigured) return;
    const unsub = onValue(ref(db, 'general_info'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setInfoData(data);
            setDataSource('cloud');
            setIsOnline(true);
        }
    }, () => setIsOnline(false));
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (dataSource === 'local') {
        localStorage.setItem('local_archive_general_info', JSON.stringify(infoData));
        setIsEditing(false);
        return;
    }
    if (isFirebaseConfigured) {
        await set(ref(db, 'general_info'), infoData);
        setIsEditing(false);
    }
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const handleExportJSON = async () => {
    try {
        let dataToExport: any = {};
        if (isFirebaseConfigured) {
            const snapshot = await get(ref(db));
            dataToExport = snapshot.val() || {};
        } else {
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
            const data = JSON.parse(event.target?.result as string);
            if (confirm("這將覆蓋目前的在地存檔，並切換為封存模式。確定嗎？")) {
                if (data.general_info) localStorage.setItem('local_archive_general_info', JSON.stringify(data.general_info));
                if (data.itinerary) localStorage.setItem('local_archive_itinerary', JSON.stringify(data.itinerary));
                if (data.expenses) localStorage.setItem('local_archive_expenses', JSON.stringify(data.expenses));
                if (data.users) localStorage.setItem('local_archive_users', JSON.stringify(data.users));
                if (data.config) localStorage.setItem('local_archive_config', JSON.stringify(data.config));

                alert("還原成功！正在重新載入回憶...");
                window.location.reload();
            }
        } catch (err) { alert("讀取失敗，請確認檔案格式。"); }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = async () => {
    try {
        let expensesData: any = {};
        if (isFirebaseConfigured) {
            const snapshot = await get(child(ref(db), 'expenses'));
            expensesData = snapshot.val() || {};
        } else {
            expensesData = JSON.parse(localStorage.getItem('local_archive_expenses') || '{}');
        }
        const expenses: Expense[] = Object.values(expensesData);
        if (expenses.length === 0) return alert("無資料可匯出");

        let csv = '\uFEFF日期,類別,店家,金額,幣別,付款人,細目\n';
        expenses.forEach(exp => {
            const detailsText = exp.details ? exp.details.map(d => `${d.name}($${d.amount})`).join('; ') : '';
            csv += `${exp.date},${exp.category},"${exp.item}",${exp.originalAmount},${exp.currency},${exp.paidBy},"${detailsText}"\n`;
        });
        downloadFile(csv, `hk_expenses.csv`, 'text/csv');
    } catch (e) { alert("匯出失敗"); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative font-hand">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-stone-50 border-b border-stone-200">
         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${dataSource === 'cloud' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {dataSource === 'cloud' ? <RefreshCw className="w-2.5 h-2.5" /> : <Archive className="w-2.5 h-2.5" />}
            {dataSource === 'cloud' ? '連線同步' : '在地封存'}
         </span>
         {activeTab !== 'data' && (
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="flex items-center gap-1 px-3 py-1 bg-white border border-stone-300 rounded-full text-xs font-bold shadow-sm">
                {isEditing ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                {isEditing ? '儲存' : '編輯'}
            </button>
         )}
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-autumn-100/50 gap-2 overflow-x-auto no-scrollbar border-b-2 border-stone-800 border-dashed">
        {['flight', 'hotel', 'tips', 'code', 'data'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as InfoTab)} className={`flex-1 min-w-[65px] py-2 rounded-xl border-2 font-bold transition-all text-xs flex flex-col items-center gap-1 ${activeTab === tab ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch' : 'bg-white border-stone-300 text-stone-500'}`}>
                {tab === 'flight' && <Plane className="w-4 h-4"/>}
                {tab === 'hotel' && <Home className="w-4 h-4"/>}
                {tab === 'tips' && <Lightbulb className="w-4 h-4"/>}
                {tab === 'code' && <Info className="w-4 h-4"/>}
                {tab === 'data' && <Database className="w-4 h-4"/>}
                {tab === 'flight' ? '航班' : tab === 'hotel' ? '住宿' : tab === 'tips' ? '貼士' : tab === 'code' ? '花碼' : '備份'}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {activeTab === 'flight' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-300 pl-3">航班資訊</h2>
            {isEditing ? (
              <div className="space-y-4"><div className="bg-white p-4 rounded-xl border-2 border-dashed border-stone-300"><h3 className="font-bold text-autumn-500 mb-2">去程</h3><EditInput label="航班" value={infoData.flights.outbound.flightNo} onChange={v => setInfoData({...infoData, flights: {...infoData.flights, outbound: {...infoData.flights.outbound, flightNo: v}}})} /></div></div>
            ) : (
              <><BoardingPass type="Outbound" data={infoData.flights.outbound} /><BoardingPass type="Inbound" data={infoData.flights.inbound} /></>
            )}
          </div>
        )}

        {activeTab === 'hotel' && (
          <div className="space-y-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-400 pl-3">住宿資訊</h2>
             <div className="bg-white rounded-3xl border-2 border-stone-800 shadow-sketch overflow-hidden">
                <div className="h-40 bg-stone-200"><HotelIllustration /></div>
                <div className="p-5">
                   <h3 className="text-2xl font-bold">{infoData.accommodation.name}</h3>
                   <p className="text-stone-500 text-sm mb-4">{infoData.accommodation.location}</p>
                   <a href={infoData.accommodation.googleMapLink} target="_blank" className="w-full flex items-center justify-center gap-2 bg-stone-800 text-white py-3 rounded-xl font-bold shadow-sm"><Map className="w-4 h-4" /> Google Map</a>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'data' && (
           <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-blue-500 pl-3">備份與還原</h2>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Archive className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="text-xs text-blue-800 leading-relaxed">
                      <p className="font-bold mb-1">永久保存回憶</p>
                      <p>下載 JSON 檔案後，即使資料庫過期，您隨時可以透過「選取還原」將資料找回來。</p>
                  </div>
              </div>
              <div className="grid gap-3">
                  <button onClick={handleExportJSON} className="w-full bg-stone-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sketch">
                      <Download className="w-5 h-5" /> 下載完整備份 (JSON)
                  </button>
                  <button onClick={handleExportCSV} className="w-full bg-white border-2 border-stone-800 text-stone-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sketch">
                      <FileSpreadsheet className="w-5 h-5" /> 匯出記帳表格 (CSV)
                  </button>
                  <div className="pt-4 border-t border-dashed border-stone-300">
                    <input type="file" ref={fileInputRef} onChange={handleImportJSON} className="hidden" accept=".json" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-autumn-50 border-2 border-dashed border-autumn-400 text-autumn-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                        <Upload className="w-5 h-5" /> 選取備份檔並還原
                    </button>
                  </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default InfoView;
