
import React, { useState, useEffect } from 'react';
import { ITINERARY_DATA } from '../constants';
import { DailyItinerary, ItineraryEvent } from '../types';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { MapPin, Utensils, Bus, ShoppingBag, BedDouble, Plane, Sparkles, Map, Info, Edit3, Plus, Trash2, Save, X, Check, Loader2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null); // null means adding new
  const [editFormData, setEditFormData] = useState<Partial<ItineraryEvent>>({});

  // Sync with Firebase
  useEffect(() => {
    const itineraryRef = ref(db, 'itinerary');
    
    const unsubscribe = onValue(itineraryRef, (snapshot) => {
      const data = snapshot.val();
      setIsLoading(false);
      if (data) {
        // Firebase returns array-like objects if keys are integers, ensure it's an array
        const loadedItinerary = Array.isArray(data) ? data : Object.values(data);
        
        // Ensure events array exists for each day (Firebase might strip empty arrays)
        const sanitizedItinerary = loadedItinerary.map((day: any) => ({
          ...day,
          events: day.events ? (Array.isArray(day.events) ? day.events : Object.values(day.events)) : []
        }));
        
        setItinerary(sanitizedItinerary);
        setIsOnline(true);
      } else {
        // First time initialization: Upload default data from constants
        set(ref(db, 'itinerary'), ITINERARY_DATA);
        setItinerary(ITINERARY_DATA);
        setIsOnline(true);
      }
    }, (error) => {
      console.error("Firebase Sync Error", error);
      setIsOnline(false);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const currentDayIndex = itinerary.findIndex(d => d.day === activeDay);
  const currentItinerary = itinerary[currentDayIndex];

  // --- CRUD Operations ---

  const handleEditClick = (event: ItineraryEvent, index: number) => {
    setEditingEventIndex(index);
    setEditFormData({ ...event });
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingEventIndex(null);
    setEditFormData({
      time: '00:00',
      activity: '',
      location: '',
      icon: 'sightseeing',
      description: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (index: number) => {
    if (!window.confirm("確定要刪除這個行程嗎？")) return;
    
    const updatedItinerary = [...itinerary];
    updatedItinerary[currentDayIndex].events.splice(index, 1);
    
    // Optimistic update
    setItinerary(updatedItinerary);
    // Push to Firebase
    set(ref(db, 'itinerary'), updatedItinerary);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedItinerary = [...itinerary];
    const newEvent = editFormData as ItineraryEvent;

    if (editingEventIndex !== null) {
      // Edit existing
      updatedItinerary[currentDayIndex].events[editingEventIndex] = newEvent;
    } else {
      // Add new
      // Sort by time roughly (optional, but good for UX)
      updatedItinerary[currentDayIndex].events.push(newEvent);
      updatedItinerary[currentDayIndex].events.sort((a, b) => a.time.localeCompare(b.time));
    }

    setItinerary(updatedItinerary);
    set(ref(db, 'itinerary'), updatedItinerary);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Edit Toggle Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-stone-50 border-b border-stone-200">
         <span className={`text-xs flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-stone-400'}`}>
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-stone-300'}`}></div>
             {isOnline ? '已同步' : '離線'}
         </span>
         <button 
           onClick={() => setIsEditing(!isEditing)}
           className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
             isEditing 
               ? 'bg-autumn-400 text-white shadow-sketch' 
               : 'bg-white border border-stone-300 text-stone-500'
           }`}
         >
           {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
           {isEditing ? '完成編輯' : '編輯行程'}
         </button>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto p-4 gap-3 bg-autumn-100/50 border-b-2 border-stone-800 border-dashed no-scrollbar">
        {itinerary.map((day) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(day.day)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 font-bold transition-all ${
              activeDay === day.day
                ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch'
                : 'bg-white border-stone-400 text-stone-500'
            }`}
          >
            Day {day.day}
            <span className="block text-xs font-normal">{day.date.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>讀取行程中...</p>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-stone-800 border-b-4 border-autumn-200 inline-block">
                {currentItinerary?.title}
                </h2>
                
                <div className="relative border-l-2 border-stone-400 ml-4 space-y-8 pb-10">
                {currentItinerary?.events.map((event, idx) => (
                    <div key={idx} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-stone-800 ${
                        event.icon === 'food' ? 'bg-autumn-400' : 
                        event.icon === 'shopping' ? 'bg-autumn-500' : 'bg-autumn-300'
                    } z-10`}></div>

                    {/* Card */}
                    <div 
                        onClick={() => isEditing && handleEditClick(event, idx)}
                        className={`bg-white p-3 rounded-2xl border-2 border-stone-800 shadow-sketch relative group transition-transform ${
                        isEditing ? 'cursor-pointer hover:-translate-y-1 hover:border-autumn-300 hover:shadow-autumn-300' : ''
                        }`}
                    >
                        {/* Delete Button (Edit Mode Only) */}
                        {isEditing && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(idx); }}
                            className="absolute -top-3 -right-2 bg-red-500 text-white p-1.5 rounded-full border-2 border-stone-800 shadow-sm hover:scale-110 transition-transform z-20"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                        )}

                        <div className="flex justify-between items-start mb-1">
                        <span className="inline-block px-2 py-0.5 bg-stone-200 rounded-md text-xs font-bold text-stone-700">
                            {event.time}
                        </span>
                        <div className="flex gap-2">
                            {event.googleMapLink && !isEditing && (
                            <a href={event.googleMapLink} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-autumn-300 transition-colors">
                                <Map className="w-4 h-4" />
                            </a>
                            )}
                            <div className="text-stone-500">
                                {event.icon && IconMap[event.icon]}
                            </div>
                        </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1">
                        {event.activity}
                        </h3>
                        
                        <div className="flex items-center text-stone-600 text-sm mb-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                        </div>
                        
                        {/* Description / Highlights */}
                        {event.description && (
                        <div className="mt-2 text-stone-600 text-sm flex items-start gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <Info className="w-4 h-4 text-autumn-300 flex-shrink-0 mt-0.5" />
                            <span>{event.description}</span>
                        </div>
                        )}

                        {/* Recommended Food */}
                        {event.recommendedFood && (
                        <div className="mt-2 text-stone-600 text-sm flex items-start gap-1 bg-autumn-50 p-2 rounded-lg border border-autumn-100">
                            <Utensils className="w-4 h-4 text-autumn-400 flex-shrink-0 mt-0.5" />
                            <span><span className="font-bold text-autumn-400">必點：</span>{event.recommendedFood}</span>
                        </div>
                        )}

                        {(event.transport || event.notes) && (
                        <div className="mt-2 pt-2 border-t border-stone-200 text-xs text-stone-500 space-y-1">
                            {event.transport && (
                            <div className="flex items-center">
                                <Bus className="w-3 h-3 mr-1 inline" /> 
                                {event.transport}
                            </div>
                            )}
                            {event.notes && (
                            <div className="italic text-autumn-400">
                                "{event.notes}"
                            </div>
                            )}
                        </div>
                        )}
                    </div>
                    </div>
                ))}

                {/* Add Event Button (Edit Mode) */}
                {isEditing && (
                    <div className="pl-6 relative mt-4">
                        <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 border-stone-400 bg-white"></div>
                        <button 
                        onClick={handleAddClick}
                        className="w-full py-3 border-2 border-dashed border-stone-400 rounded-2xl text-stone-500 font-bold flex items-center justify-center gap-2 hover:bg-stone-50 hover:border-autumn-300 hover:text-autumn-300 transition-colors"
                        >
                            <Plus className="w-5 h-5" /> 新增行程
                        </button>
                    </div>
                )}
                </div>

                {/* Suggestion Block */}
                {currentItinerary?.suggestion && (
                <div className="bg-stone-800 text-paper p-4 rounded-2xl shadow-sketch-lg relative mt-8">
                    <div className="flex items-center gap-2 mb-2 text-autumn-300">
                        <Sparkles className="w-5 h-5" />
                        <h3 className="font-bold">導遊小叮嚀</h3>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">
                    {currentItinerary.suggestion}
                    </p>
                </div>
                )}
            </>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-paper w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-stone-800 shadow-sketch-lg p-5">
                <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-stone-300 pb-3">
                    <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
                        {editingEventIndex !== null ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {editingEventIndex !== null ? '編輯行程' : '新增行程'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="bg-stone-200 p-1.5 rounded-full hover:bg-stone-300 text-stone-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSaveForm} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-stone-500 mb-1">時間</label>
                            <input 
                                type="text" 
                                value={editFormData.time} 
                                onChange={e => setEditFormData({...editFormData, time: e.target.value})}
                                placeholder="10:00"
                                className="w-full bg-white p-2 border-2 border-stone-300 rounded-xl focus:border-autumn-300 outline-none font-bold text-center"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-stone-500 mb-1">活動名稱</label>
                            <input 
                                type="text" 
                                value={editFormData.activity} 
                                onChange={e => setEditFormData({...editFormData, activity: e.target.value})}
                                placeholder="例：吃早餐"
                                className="w-full bg-white p-2 border-2 border-stone-300 rounded-xl focus:border-autumn-300 outline-none font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">地點</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                            <input 
                                type="text" 
                                value={editFormData.location} 
                                onChange={e => setEditFormData({...editFormData, location: e.target.value})}
                                placeholder="例：旺角"
                                className="w-full bg-white pl-9 p-2 border-2 border-stone-300 rounded-xl focus:border-autumn-300 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-stone-500 mb-2">圖示類別</label>
                         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                             {Object.keys(IconMap).map((iconKey) => (
                                 <button
                                    key={iconKey}
                                    type="button"
                                    onClick={() => setEditFormData({...editFormData, icon: iconKey as any})}
                                    className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                                        editFormData.icon === iconKey 
                                            ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch' 
                                            : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400'
                                    }`}
                                 >
                                     {IconMap[iconKey]}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">必吃推薦 (選填)</label>
                            <input 
                                type="text" 
                                value={editFormData.recommendedFood || ''} 
                                onChange={e => setEditFormData({...editFormData, recommendedFood: e.target.value})}
                                className="w-full bg-white p-2 border border-stone-300 rounded-xl focus:border-autumn-300 outline-none text-sm"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">交通方式 (選填)</label>
                            <input 
                                type="text" 
                                value={editFormData.transport || ''} 
                                onChange={e => setEditFormData({...editFormData, transport: e.target.value})}
                                className="w-full bg-white p-2 border border-stone-300 rounded-xl focus:border-autumn-300 outline-none text-sm"
                            />
                         </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">詳細描述 (灰底框)</label>
                        <textarea 
                            value={editFormData.description || ''} 
                            onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                            className="w-full bg-white p-2 border border-stone-300 rounded-xl focus:border-autumn-300 outline-none text-sm h-20 resize-none"
                            placeholder="輸入景點介紹或詳細內容..."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">底部備註 (紅字/小提醒)</label>
                        <input 
                            type="text"
                            value={editFormData.notes || ''} 
                            onChange={e => setEditFormData({...editFormData, notes: e.target.value})}
                            className="w-full bg-white p-2 border border-stone-300 rounded-xl focus:border-autumn-300 outline-none text-sm text-autumn-500 font-bold"
                            placeholder="例：營業時間、出口資訊..."
                        />
                    </div>
                    
                    <div>
                         <label className="block text-xs font-bold text-stone-500 mb-1">Google Maps 連結</label>
                         <input 
                             type="url" 
                             value={editFormData.googleMapLink || ''} 
                             onChange={e => setEditFormData({...editFormData, googleMapLink: e.target.value})}
                             placeholder="https://maps.google.com/..."
                             className="w-full bg-white p-2 border border-stone-300 rounded-xl focus:border-autumn-300 outline-none text-sm text-blue-500"
                         />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-stone-800 text-white font-bold text-lg py-3 rounded-xl hover:bg-stone-700 transition-colors shadow-sketch flex items-center justify-center gap-2 mt-2"
                    >
                        <Save className="w-5 h-5" /> 儲存行程
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;
