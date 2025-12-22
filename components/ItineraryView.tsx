
import React, { useState, useEffect } from 'react';
import { ITINERARY_DATA } from '../constants';
import { DailyItinerary, ItineraryEvent } from '../types';
import { db, isFirebaseConfigured } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { MapPin, Utensils, Bus, ShoppingBag, BedDouble, Plane, Sparkles, Map, Info, Edit3, Plus, Trash2, Save, X, Check, Loader2, AlertTriangle, Archive } from 'lucide-react';

const IconMap: Record<string, React.ReactNode> = {
  food: <Utensils className="w-4 h-4" />,
  transport: <Bus className="w-4 h-4" />,
  sightseeing: <MapPin className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  hotel: <BedDouble className="w-4 h-4" />,
  flight: <Plane className="w-4 h-4" />,
};

const ItineraryView: React.FC = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [itinerary, setItinerary] = useState<DailyItinerary[]>(ITINERARY_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isLocalArchive, setIsLocalArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ItineraryEvent>>({});

  // Sync logic
  useEffect(() => {
    // Check local archive first
    const localData = localStorage.getItem('local_archive_itinerary');
    if (localData) {
        setItinerary(JSON.parse(localData));
        setIsLocalArchive(true);
        setIsLoading(false);
        // If we have local archive, we don't strictly need to wait for firebase
    }

    if (!isFirebaseConfigured) {
        if (!localData) {
            setItinerary(ITINERARY_DATA);
            setIsLoading(false);
        }
        return;
    }

    const itineraryRef = ref(db, 'itinerary');
    const unsubscribe = onValue(itineraryRef, (snapshot) => {
      const data = snapshot.val();
      setIsLoading(false);
      if (data) {
        const loadedItinerary = Array.isArray(data) ? data : Object.values(data);
        const sanitizedItinerary = loadedItinerary.map((day: any) => ({
          ...day,
          events: day.events ? (Array.isArray(day.events) ? day.events : Object.values(day.events)) : []
        }));
        setItinerary(sanitizedItinerary);
        setIsOnline(true);
        setIsLocalArchive(false); // Cloud data takes precedence if it exists
      } else if (!localData) {
        set(ref(db, 'itinerary'), ITINERARY_DATA);
        setItinerary(ITINERARY_DATA);
        setIsOnline(true);
      }
    }, (error) => {
      setIsOnline(false);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const currentDayIndex = itinerary.findIndex(d => d.day === activeDay);
  const currentItinerary = itinerary[currentDayIndex];

  // Save changes (to cloud if online, to local if in archive mode)
  const persistChanges = (updatedItinerary: DailyItinerary[]) => {
      if (isLocalArchive || !isFirebaseConfigured) {
          localStorage.setItem('local_archive_itinerary', JSON.stringify(updatedItinerary));
          setItinerary(updatedItinerary);
      } else {
          set(ref(db, 'itinerary'), updatedItinerary);
          setItinerary(updatedItinerary);
      }
  };

  const handleEditClick = (event: ItineraryEvent, index: number) => {
    setEditingEventIndex(index);
    setEditFormData({ ...event });
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingEventIndex(null);
    setEditFormData({ time: '00:00', activity: '', location: '', icon: 'sightseeing' });
    setShowModal(true);
  };

  const handleDeleteClick = (index: number) => {
    if (!confirm("確定要刪除嗎？")) return;
    const updated = [...itinerary];
    updated[currentDayIndex].events.splice(index, 1);
    persistChanges(updated);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...itinerary];
    const newEvent = editFormData as ItineraryEvent;
    if (editingEventIndex !== null) updated[currentDayIndex].events[editingEventIndex] = newEvent;
    else {
        updated[currentDayIndex].events.push(newEvent);
        updated[currentDayIndex].events.sort((a, b) => a.time.localeCompare(b.time));
    }
    persistChanges(updated);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex justify-between items-center px-4 py-2 bg-stone-50 border-b border-stone-200">
         <span className={`text-[10px] font-bold flex items-center gap-1 ${isLocalArchive ? 'text-blue-600' : isOnline ? 'text-green-600' : 'text-stone-400'}`}>
             {isLocalArchive ? <Archive className="w-3 h-3"/> : <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-stone-300'}`}></div>}
             {isLocalArchive ? '本地封存' : isOnline ? '已同步' : '離線模式'}
         </span>
         <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${isEditing ? 'bg-autumn-400 text-white shadow-sketch' : 'bg-white border border-stone-300 text-stone-500'}`}>
           {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
           {isEditing ? '完成編輯' : '編輯行程'}
         </button>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto p-4 gap-3 bg-autumn-100/50 border-b-2 border-stone-800 border-dashed no-scrollbar">
        {itinerary.map((day) => (
          <button key={day.day} onClick={() => setActiveDay(day.day)} className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 font-bold transition-all ${activeDay === day.day ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch' : 'bg-white border-stone-400 text-stone-500'}`}>
            Day {day.day}
            <span className="block text-xs font-normal">{day.date.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400"><Loader2 className="w-8 h-8 animate-spin mb-2" /><p>讀取行程中...</p></div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-stone-800 border-b-4 border-autumn-200 inline-block">{currentItinerary?.title}</h2>
                <div className="relative border-l-2 border-stone-400 ml-4 space-y-8 pb-10">
                {currentItinerary?.events.map((event, idx) => (
                    <div key={idx} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-stone-800 ${event.icon === 'food' ? 'bg-autumn-400' : event.icon === 'shopping' ? 'bg-autumn-500' : 'bg-autumn-300'} z-10`}></div>
                    <div onClick={() => isEditing && handleEditClick(event, idx)} className={`bg-white p-3 rounded-2xl border-2 border-stone-800 shadow-sketch relative group transition-transform ${isEditing ? 'cursor-pointer hover:-translate-y-1' : ''}`}>
                        {isEditing && <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(idx); }} className="absolute -top-3 -right-2 bg-red-500 text-white p-1.5 rounded-full border-2 border-stone-800 shadow-sm z-20"><Trash2 className="w-3 h-3" /></button>}
                        <div className="flex justify-between items-start mb-1">
                        <span className="inline-block px-2 py-0.5 bg-stone-200 rounded-md text-xs font-bold text-stone-700">{event.time}</span>
                        <div className="flex gap-2">
                            {event.googleMapLink && !isEditing && <a href={event.googleMapLink} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-autumn-300"><Map className="w-4 h-4" /></a>}
                            <div className="text-stone-500">{event.icon && IconMap[event.icon]}</div>
                        </div>
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1">{event.activity}</h3>
                        <div className="flex items-center text-stone-600 text-sm mb-1"><MapPin className="w-3 h-3 mr-1" />{event.location}</div>
                        {event.description && <div className="mt-2 text-stone-600 text-sm flex items-start gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100"><Info className="w-4 h-4 text-autumn-300 flex-shrink-0 mt-0.5" /><span>{event.description}</span></div>}
                        {event.recommendedFood && <div className="mt-2 text-stone-600 text-sm flex items-start gap-1 bg-autumn-50 p-2 rounded-lg border border-autumn-100"><Utensils className="w-4 h-4 text-autumn-400 flex-shrink-0 mt-0.5" /><span><span className="font-bold text-autumn-400">必點：</span>{event.recommendedFood}</span></div>}
                    </div>
                    </div>
                ))}
                {isEditing && (
                    <div className="pl-6 relative mt-4">
                        <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 border-stone-400 bg-white"></div>
                        <button onClick={handleAddClick} className="w-full py-3 border-2 border-dashed border-stone-400 rounded-2xl text-stone-500 font-bold flex items-center justify-center gap-2 hover:bg-stone-50 hover:text-autumn-300 transition-colors"><Plus className="w-5 h-5" /> 新增行程</button>
                    </div>
                )}
                </div>
            </>
        )}
      </div>

      {/* Modal (保持不變) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-paper w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-stone-800 shadow-sketch-lg p-5">
                <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-stone-300 pb-3">
                    <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">{editingEventIndex !== null ? '編輯行程' : '新增行程'}</h3>
                    <button onClick={() => setShowModal(false)} className="bg-stone-200 p-1.5 rounded-full text-stone-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveForm} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <input type="text" value={editFormData.time} onChange={e => setEditFormData({...editFormData, time: e.target.value})} placeholder="10:00" className="w-full bg-white p-2 border-2 border-stone-300 rounded-xl outline-none font-bold text-center" required />
                        <input type="text" value={editFormData.activity} onChange={e => setEditFormData({...editFormData, activity: e.target.value})} placeholder="活動名稱" className="col-span-2 w-full bg-white p-2 border-2 border-stone-300 rounded-xl outline-none font-bold" required />
                    </div>
                    <button type="submit" className="w-full bg-stone-800 text-white font-bold text-lg py-3 rounded-xl shadow-sketch flex items-center justify-center gap-2 mt-2"><Save className="w-5 h-5" /> 儲存行程</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;
