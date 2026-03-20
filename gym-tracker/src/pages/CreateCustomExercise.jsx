import {React,  useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Search, X, CircleArrowLeft, Info } from 'lucide-react'
import Header from '../components/layouts/Header'
import { useNavigate } from 'react-router-dom'

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

const categoryMap = {
  "Lats": "Back",
  "Lower Back": "Back",
  "Middle Back": "Back",
  "Traps": "Shoulders",
  "Quadriceps": "Legs",
  "Quads": "Legs", 
  "Hamstrings": "Legs",
  "Glutes": "Legs",
  "Calves": "Legs",
  "Biceps": "Arms",
  "Triceps": "Arms",
  "Forearms": "Arms",
  "Chest": "Chest"
}
const toTitleCase = (str) => {
  return str.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

const mechanismOption = ["Compound", "Isolate"]

const CreateCustomExercise = () => {

    const navigate = useNavigate()
    
    const [user, setUser] = useState(null)
    const [exerciseName, setExerciseName] = useState('')
    const [mainMuscle, setMainMuscle] = useState('')
    const [secondaryMuscles, setSecondaryMuscles] = useState([])
    const [equipment, setEquipment] =  useState("")
    const [mechanism, setMechanism] = useState("")
    const [instructions, setInstruction] = useState("")
    const [muscleSearch, setMuscleSearch] = useState('')
    const [secondarySearch, setSecondarySearch] = useState('')
    const [showMuscleList, setShowMuscleList] = useState(false)
    const [mechanismInputFocus, setMechanismInputFocus] = useState(false)
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

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
              const newErrors = {}
              
              if (!exerciseName.trim()) newErrors.exerciseName = "Exercise name is required"
              if (!mainMuscle) newErrors.mainMuscle = "Please select a main muscle"
              if (!equipment.trim()) newErrors.equipment = "Equipment is required"
              if (!mechanism.trim()) newErrors.mechanism = "Please Select Mechanism"

              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors)
                window.scrollTo({ top: 0, behavior: 'smooth' })
                return
              }
              
              setErrors({})
              setIsLoading(true)
              const category = categoryMap[mainMuscle] || "Other"
              const exerciseImageUrl = `https://placehold.co/600x400/141414/white?text=${exerciseName.trim().split().join("+")}`

              const { error: insertExerciseError, data } = await supabase
                                  .from("exercises")
                                  .insert([{
                                    name : toTitleCase(exerciseName.trim()),
                                    main_muscle : mainMuscle,
                                    secondary_muscles : secondaryMuscles,
                                    equipment : toTitleCase(equipment.trim()),
                                    instructions: instructions.trim(),
                                    mechanic : mechanism,
                                    category: category,
                                    image_urls : [exerciseImageUrl],
                                    created_by : user.id,
                                  }]).select("id")
                                  .single()
              console.log(data)
              const { error :insertUserExerciseError } = await supabase
                                                 .from("user_exercises")
                                                 .insert([{
                                                     user_id : user.id,
                                                     exercise_id : data.id
                                                 }])
              if (insertUserExerciseError ) {
                console.log("Error inserting data.", insertUserExerciseError.message)
              }

              setIsLoading(false)
              navigate("/", {state : { created: true}})
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
          <div className="flex flex-row justify-between  items-center mr-1.5 ">
            <header>
              <h1 className="text-3xl font-bold">Create Exercise</h1>
              <p className="text-zinc-500 text-sm">Define your custom movement details.</p>
            </header>
            <CircleArrowLeft size={27}
              onClick={() => navigate("/")}
              className="hover:text-zinc-300 -mt-4"/>
          </div>

          <div className="space-y-6">
            {/* Exercise Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Name</label>
              <input 
                type="text"
                value={exerciseName}
                onChange={(e) => {setExerciseName(e.target.value)
                                if (errors.exerciseName) setErrors(prev => ({...prev, exerciseName: null}))}
                }
                placeholder="e.g. Archer Pushups"
                className={`w-full bg-zinc-900/80 border rounded-2xl py-4 px-4 outline-none transition-all ${
                  errors.exerciseName ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-accent/50"}`}
              />
              {(errors.exerciseName) && <p className="text-red-800 text-sm ml-2.5 -mb-4">{errors.exerciseName}</p>}
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
                  className={`w-full bg-zinc-900/80 border  rounded-2xl py-4 pl-12 pr-4 outline-none transition-all
                            ${errors.mainMuscle ? "border-red-500" : "border-zinc-800focus:border-accent/50 "}`}
                />
              </div>
              {(errors.mainMuscle) && <p className="text-red-800 text-sm ml-2.5 -mb-4">{errors.mainMuscle}</p>}
              
              {showMuscleList && (
                <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900/98 border border-zinc-800
                              rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto p-2 custom-scrollbar">
                  {filteredMainMuscles.map((m) => (
                    <button 
                      key={m}
                      onClick={() => {
                        setMainMuscle(m)
                        setMuscleSearch('')
                        setShowMuscleList(false)
                        if (errors.mainMuscle) setErrors(prev => ({...prev, mainMuscle: null}))
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
                      className="bg-accent/10 text-accent border border-accent/20 px-3 py-2 rounded-full 
                                  text-sm font-bold flex items-center gap-2 group hover:bg-accent 
                                  hover:text-black transition-all"
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
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm outline-none
                               focus:border-accent transition-all"
                  
                />
              </div>

              {/* 5. Horizontal scroll or small grid for suggestions */}
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto py-1 custom-scrollbar">
                {filteredSecondarySuggestions.map((m) => {
                  if (mainMuscle !== m) return (
                  <button
                    key={m}
                    onClick={() => {
                        toggleSecondaryMuscle(m);
                        setSecondarySearch('') 
                    }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border border-zinc-800
                               text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
                  >
                    + {m}
                  </button>)
                })}
                {(filteredSecondarySuggestions.length === 0) && 
                    <button  className="px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-800
                               text-red-700 cursor-not-allowed  flex flex-row items-center gap-0.5">
                                  <Info size={15}/>
                                  No muscle found!</button>}
              </div>
            </div>

            {/* Equipment & Instructions  */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Equipment</label>
                    <input type="text" 
                      placeholder="Barbell" 
                      onChange={(e) => {
                        setEquipment(e.target.value)
                        if (errors.equipment) setErrors(prev => ({...prev, equipment: null}))
                      }}
                      className={`w-full bg-zinc-900/80 border  rounded-2xl py-3 px-4 outline-none text-sm
                        ${errors.equipment ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-accent/50"}`}/>
                </div>
                {(errors.equipment) && <p className="text-red-800 text-xs ml-3 -mb-4.5 mt-0.5"> {errors.equipment}</p>}
              </div>
              <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Machanism</label>
                  <input type="text" 
                      value={mechanism}
                      placeholder="Compount/Isolate"
                      onChange={(e) => setMechanism(e.target.value)}
                      onClick={() => setMechanismInputFocus(true)}
                      className={`w-full bg-zinc-900/80 border  rounded-2xl py-3 px-4 outline-none text-sm
                        ${errors.mechanism ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-accent/50"}`}/>

                      {mechanismInputFocus && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900/98 border border-zinc-800
                              rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto p-2 custom-scrollbar"> 
                            {mechanismOption.map( (m) => (
                              <button className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl transition-colors text-sm"
                                      key={m}
                                      onClick={() => {
                                        setMechanismInputFocus(false) 
                                        setMechanism(m)
                                        if (errors.mechanism) setErrors(prev => ({...prev, mechanism: null}))
                                }}>
                                    {m}
                              </button>
                            ))}
                          </div>
                      )} 
              {(errors.mechanism) && <p className="text-red-800 text-xs ml-4 -mt-[4.5px] -mb-4.5">{errors.mechanism}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Instructions</label>
              <textarea rows="3" 
              placeholder="Describe the movement"
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 
                          rounded-2xl py-4 px-4 outline-none focus:border-accent/50 resize-none text-sm"/>
            </div>

            {/* Action */}
            {!isLoading ? (
                <button 
                  onClick={addCustomExercise}
                  className="w-full bg-accent text-black font-bold py-4 rounded-2xl 
                                    shadow-lg shadow-accent/10 hover:opacity-90 active:scale-[0.99] transition-all">
                    Save Exercise
                </button>
                  ) : (
                <button className="w-full bg-blue-900/80 text-black py-4 rounded-xl font-bold
                        transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/10 cursor-not-allowed">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent  rounded-full animate-spin"></div>
                </button>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCustomExercise