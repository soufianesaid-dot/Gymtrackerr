
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BodyPart, Exercise, ExerciseLog, SetLog } from './types';
import { BODY_PARTS, EXERCISES } from './constants';
import { getExerciseTip } from './services/geminiService';

type View = 'log' | 'history' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('log');
  const [currentBodyPart, setCurrentBodyPart] = useState<BodyPart | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>(() => {
    const saved = localStorage.getItem('aura_strength_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSets, setCurrentSets] = useState<SetLog[]>([]);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('aura_strength_logs', JSON.stringify(logs));
  }, [logs]);

  const handleSelectExercise = async (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setAiTip("Loading insight...");
    setCurrentSets([{ weight: 0, reps: 0 }]);
    const tip = await getExerciseTip(exercise.name);
    setAiTip(tip);
  };

  const addSet = () => {
    setCurrentSets([...currentSets, { weight: 0, reps: 0 }]);
  };

  const updateSet = (index: number, field: keyof SetLog, value: number) => {
    const newSets = [...currentSets];
    newSets[index] = { ...newSets[index], [field]: value };
    setCurrentSets(newSets);
  };

  const removeSet = (index: number) => {
    if (currentSets.length > 1) {
      setCurrentSets(currentSets.filter((_, i) => i !== index));
    }
  };

  const saveWorkout = () => {
    if (!selectedExercise) return;
    const validSets = currentSets.filter(s => s.reps > 0 || s.weight > 0);
    if (validSets.length === 0) return;

    const newLog: ExerciseLog = {
      id: Date.now().toString(),
      exerciseId: selectedExercise.id,
      date: new Date().toISOString(),
      sets: validSets,
    };
    
    setLogs([newLog, ...logs]);
    setSelectedExercise(null);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `aura_strength_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setLogs(json);
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const previousLog = useMemo(() => {
    if (!selectedExercise) return null;
    return logs.find(log => log.exerciseId === selectedExercise.id);
  }, [selectedExercise, logs]);

  const filteredExercises = useMemo(() => {
    if (!currentBodyPart) return [];
    return EXERCISES.filter(ex => ex.bodyPart === currentBodyPart);
  }, [currentBodyPart]);

  const resetSelection = () => {
    if (selectedExercise) {
      setSelectedExercise(null);
    } else {
      setCurrentBodyPart(null);
    }
  };

  const groupedLogs = useMemo(() => {
    const groups: { [date: string]: ExerciseLog[] } = {};
    logs.forEach(log => {
      const dateKey = new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [logs]);

  const getExerciseName = (id: string) => EXERCISES.find(e => e.id === id)?.name || "Unknown Exercise";

  return (
    <div className="min-h-screen pb-32 pt-10 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aura Strength</h1>
          <p className="text-gray-500 font-light mt-1">
            {activeView === 'history' ? "Your Training History" :
             activeView === 'settings' ? "Settings & Backup" :
             selectedExercise ? selectedExercise.name : 
             currentBodyPart ? `${currentBodyPart} Training` : "Focus on your progress."}
          </p>
        </div>
        {(activeView === 'log' && (currentBodyPart || selectedExercise)) && (
          <button 
            onClick={resetSelection}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </header>

      {/* Main Content Switcher */}
      {activeView === 'log' && (
        <>
          {!currentBodyPart ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {BODY_PARTS.map((part) => (
                <button
                  key={part}
                  onClick={() => setCurrentBodyPart(part)}
                  className="glass p-8 rounded-3xl flex flex-col items-center justify-center space-y-3 hover:scale-105 transition-transform active:scale-95 shadow-sm"
                >
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-bold">
                    {part[0]}
                  </div>
                  <span className="font-semibold">{part}</span>
                </button>
              ))}
            </div>
          ) : !selectedExercise ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className="glass p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:bg-white transition-all shadow-sm group active:scale-[0.98]"
                >
                  <img 
                    src={ex.image} 
                    alt={ex.name} 
                    className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-black">{ex.name}</h3>
                    <p className="text-sm text-gray-400">Log today's set</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl">
                <div className="flex items-start gap-3">
                  <span className="text-xl">✨</span>
                  <p className="text-sm text-indigo-900 leading-relaxed italic">{aiTip}</p>
                </div>
              </div>

              {previousLog && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Last Time</h4>
                  <div className="glass p-5 rounded-3xl">
                    <div className="grid grid-cols-3 gap-2">
                      {previousLog.sets.map((set, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded-xl text-center">
                          <div className="text-sm font-bold">{set.weight}kg</div>
                          <div className="text-xs text-gray-400">{set.reps} reps</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">New Entry</h4>
                <div className="space-y-3">
                  {currentSets.map((set, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {idx + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="Weight"
                            value={set.weight || ''}
                            onChange={(e) => updateSet(idx, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-center focus:ring-2 focus:ring-gray-900 outline-none font-medium"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">KG</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="Reps"
                            value={set.reps || ''}
                            onChange={(e) => updateSet(idx, 'reps', parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-center focus:ring-2 focus:ring-gray-900 outline-none font-medium"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">RPS</span>
                        </div>
                      </div>
                      <button onClick={() => removeSet(idx)} className="p-2 text-gray-300 hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={addSet} className="w-full py-4 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all font-medium flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Add Set
                </button>

                <div className="pt-6">
                  <button onClick={saveWorkout} className="w-full py-5 bg-gray-900 text-white rounded-3xl font-bold shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Save Performance
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {Object.keys(groupedLogs).length === 0 ? (
            <div className="text-center py-20 text-gray-400">No records yet. Start training!</div>
          ) : (
            (Object.entries(groupedLogs) as [string, ExerciseLog[]][]).map(([date, dayLogs]) => (
              <div key={date} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">{date}</h4>
                {dayLogs.map((log) => (
                  <div key={log.id} className="glass p-5 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{getExerciseName(log.exerciseId)}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full font-bold text-gray-500">{log.sets.length} Sets</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {log.sets.map((set, idx) => (
                        <div key={idx} className="bg-gray-50 px-3 py-1 rounded-xl text-[11px] font-medium">
                          {set.weight}kg × {set.reps}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'settings' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Data Management</h3>
              <p className="text-sm text-gray-400">Your data is stored locally in this browser. Export it regularly to keep a safe backup.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={exportData}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Backup (.json)
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-gray-100 hover:border-gray-900 text-gray-500 hover:text-gray-900 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Restore from File
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={importData} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
             <h3 className="font-bold mb-4">About Aura</h3>
             <p className="text-sm text-gray-500 leading-relaxed">
               Aura Strength is built for lifters who want focus, not features. 
               No subscriptions, no ads, just progress.
             </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-50">
         <div className="glass shadow-2xl rounded-full p-2 flex items-center justify-between gap-1">
           <button onClick={() => setActiveView('log')} className={`flex-1 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'log' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400'}`}>Log</button>
           <button onClick={() => setActiveView('history')} className={`flex-1 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400'}`}>History</button>
           <button onClick={() => setActiveView('settings')} className={`flex-1 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'settings' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400'}`}>Settings</button>
         </div>
      </div>
    </div>
  );
};

export default App;
