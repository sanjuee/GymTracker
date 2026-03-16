import {React,  useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Search, X } from 'lucide-react'
import Header from '../components/layouts/Header'

const allMuscles = [
  'Abductors',
  'Adductors',
  'Biceps',
  'Calves',
  'Chest',
  'Forearms',
  'Glutes',
  'Hamstrings',
  'Lats',
  'Lower Back',
  'Middle Back',
  'Quadriceps',
  'Quads',
  'Rear Delts',
  'Shoulders',
  'Traps',
  'Triceps',
]

const CreateCustomExercise = () => {

  const [user, setUser] = useState(null)

  const [exerciseName, setExerciseName] = useState('')
  const [mainMuscle, setMainMuscle] = useState('')
  const [secondaryMuscles, setSecondaryMuscles] = useState([])
  const [equipment, setEquipment] =  useState("")
  const [machanism, setMachanism] = useState("")
  const [instructions, setInstruction] = useState("")

  const [muscleSearch, setMuscleSearch] = useState('')
  const [secondarySearch, setSecondarySearch] = useState('')
  const [showMuscleList, setShowMuscleList] = useState(false)

  useEffect(() => {
          try{
              const getUserData = async() => {
                  const { data : {user}} = await supabase.auth.getUser()
                  setUser(user)
              }
              getUserData()
      
              const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                  setUser(session?.user ?? null)
              })
              return () => subscription.unsubscribe()
          }
          catch(err){
              console.log(err)
          }
      },[])

  const addCustomExercise = async() => {

    const categoryMap = {
      "Lower back": "Back", "Middle back": "Back", "Lats": "Back", "Traps": "Shoulders",
      "Quadriceps": "Legs", "Hamstrings": "Legs", "Glutes": "Legs", "Calves": "Legs",
    }

    const category = categoryMap[exerciseName] || "Other"

    const { error } = await supabase
                        .from("exercises")
                        .insert([{
                          name : exerciseName,
                          main_muscle : mainMuscle,
                          secondary_muscles : secondaryMuscles,
                          equipment : equipment,
                          instructions: instructions,
                          mechanic : machanism,
                          category: category,
                          created_by : user.id,
                        }])
       if (error) {
          console.log("Error inserting data.",error)
        }
  }
  

  const filteredMainMuscles = allMuscles.filter((m) =>
    m.toLowerCase().includes(muscleSearch.toLowerCase())
  )

  const filteredSecondarySuggestions = allMuscles
    .filter((m) => m.toLowerCase().includes(secondarySearch.toLowerCase()))
    .filter((m) => !secondaryMuscles.includes(m))
    .slice(0, 8)

  const toggleSecondaryMuscle = (muscle) => {
    setSecondaryMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    )
  }

  

  return (
    <div>

      <Header/>
      <div className="min-h-screen bg-black text-zinc-100 p-4 font-inter">
        <div className="max-w-xl mx-auto space-y-8 ">
          
          <header>
            <h1 className="text-3xl font-bold">Create Exercise</h1>
            <p className="text-zinc-500 text-sm">Define your custom movement details.</p>
          </header>

          <div className="space-y-6">
            {/* Exercise Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Name</label>
              <input 
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Archer Pushups"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-4 
                          outline-none focus:border-accent/50 transition-all"
                required
              />
            </div>

            {/* Main Muscle - Searchable Input */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Main Muscle Group</label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  value={mainMuscle || muscleSearch}
                  onChange={(e) => {
                      setMuscleSearch(e.target.value)
                      setMainMuscle('')
                      setShowMuscleList(true)
                  }}
                  onFocus={() => setShowMuscleList(true)}
                  placeholder="Search muscle group..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none 
                            focus:border-accent/50 transition-all"
                  required
                />
              </div>
              
              {showMuscleList && (
                <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-800
                              rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto p-2 custom-scrollbar">
                  {filteredMainMuscles.map((m) => (
                    <button 
                      key={m}
                      onClick={() => {
                        setMainMuscle(m)
                        setMuscleSearch('')
                        setShowMuscleList(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl transition-colors text-sm"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Secondary Muscles - Multi-select Tags */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Secondary Muscles
              </label>

              {/* 3. Show SELECTED muscles as removable tags */}
              {secondaryMuscles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1 mb-3 animate-in fade-in duration-300">
                  {secondaryMuscles.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleSecondaryMuscle(m)}
                      className="bg-accent/10 text-accent border border-accent/20 px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 group hover:bg-accent hover:text-black transition-all"
                    >
                      {m} <X size={16} />
                    </button>
                  ))}
                </div>
              )}

              {/* 4. A subtle inline search for the others */}
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Add secondary muscles..."
                  value={secondarySearch}
                  onChange={(e) => setSecondarySearch(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm outline-none focus:border-zinc-600 transition-all"
                />
              </div>

              {/* 5. Horizontal scroll or small grid for suggestions */}
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto py-1 custom-scrollbar">
                {filteredSecondarySuggestions.map((m) => ( // Show top 8 suggestions
                  <button
                    key={m}
                    onClick={() => {
                        toggleSecondaryMuscle(m);
                        setSecondarySearch('') // Clear search after picking
                    }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
                  >
                    + {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment & Instructions (Simplified for this view) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Equipment</label>
                  <input type="text" 
                    placeholder="Barbell" 
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 outline-none text-sm"/>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Machanism</label>
                  <input type="text" 
                      placeholder="Compount/Isolate"
                      onChange={(e) => setMachanism(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 outline-none text-sm"/>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Instructions</label>
              <textarea rows="3" 
              placeholder="Describe the movement"
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 
                                  rounded-2xl py-4 px-4 outline-none focus:border-accent/50 resize-none text-sm"/>
            </div>

            {/* Action */}
            <button 
            onClick={addCustomExercise}
            className="w-full bg-accent text-black font-bold py-4 rounded-2xl 
                              shadow-lg shadow-accent/10 hover:opacity-90 active:scale-[0.99] transition-all">
              Save Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomExercise