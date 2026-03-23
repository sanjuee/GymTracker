import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { ChevronDown, Trash2, ArrowLeft, Plus } from "lucide-react"
import ImageView from "../components/ImageView"

const ExerciseDetails = () => {


    const navigate = useNavigate()
    const [exerciseDetails, setExerciseDetails] = useState(null) 
    const { id : exerciseId } = useParams() 
    const [loading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [exerciseSets, setExerciseSets] = useState(() => {
            const savedSets = localStorage.getItem(`workout_${exerciseId}`)
            return savedSets ? JSON.parse(savedSets) : [
                { id: 1, weight: "", reps: "" }
            ]
    })
    const [showImage, setShowImage] = useState(null)

    
    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUserData()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        const getWorkoutLog = async() => {
            const { data: workoutLog , error } = await supabase
                                                .from("workout_log") 
                                                .select("*")
                                                .eq("user_id", user.id)
                                                .eq("exercise_id", exerciseId)
                                                .order("created_at", {ascending : true})
        }
        if (error){ console.log("Error fetching data", error.message)}
        getWorkoutLog()
        
    },[exerciseId])

    
    useEffect(() => {
        localStorage.setItem(`workout_${exerciseId}` , JSON.stringify(exerciseSets))
    },[exerciseSets,exerciseId])
    
    useEffect(() => {
        if (!exerciseId) return;

        const fetchDetails = async () => {
            const { error, data } = await supabase
            .from("exercises")
            .select("*")
            .eq("id", exerciseId)
                .single()
                
                if (error) {
                    console.error("Error fetching data:", error.message)
                    return
                }
                setExerciseDetails(data)
            }
            
            fetchDetails()
    }, [exerciseId]) 

    const addNewExerciseSet = () => {
        const newExerciseSet = {
            id : exerciseSets.length + 1 ,
            weight : exerciseSets[exerciseSets.length -1]?.weight || "" ,
            rep : exerciseSets[exerciseSets.length -1]?.rep || ""
        }
        setExerciseSets([...exerciseSets, newExerciseSet])
    }

    const handleSetChange = (index, field, value) => {
            const updatedSets = [...exerciseSets]
            updatedSets[index][field] = value
            setExerciseSets(updatedSets)
    }

    const addWorkoutLog = async() => {

        setIsLoading(true)

        const logsToInsert = exerciseSets.map((set,index) => ({
            exercise_id : exerciseId,
            user_id : user.id,
            weight : parseFloat(set.weight),
            reps : parseInt(set.reps),
            set_number : index + 1
        }))
        
        const {error} = await supabase
                        .from("workout_log")
                        .insert(logsToInsert)

        if (error){
            console.log("Error inserting data", error.message)
            return
        }
        else {
            localStorage.removeItem(`workout_${exerciseId}`)
            navigate("/", {state :{ toastMsg: "Workout Logged! "}})
        }
        setIsLoading(false)
    }

        
    if (!exerciseDetails) return (
        <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-row items-center gap-2">
                    <div className="w-6 h-6 border-3 border-accent border-t-transparent 
                                    rounded-full animate-spin"></div>
                    <p className="text-xl font-outfit">Loading..</p>
                </div>
        </div>
    )

    return (
        <>
            <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 h-16 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button className="text-white active:scale-95 duration-200">
                        <ArrowLeft className="cursor-pointer" 
                            onClick={() => navigate("/")}/>
                    </button>
                    <h1 className="text-zinc-100 font-headline font-bold text-lg tracking-tight uppercase">Exercise Details</h1>
                </div>
                <div className="text-2xl font-black text-primary font-headline italic tracking-tighter cursor-pointer"
                     onClick={() => navigate("/")}>
                    GYM<span className="text-accent">LOG</span>
                </div>
            </header>
            <main className="pt-20 px-4 max-w-2xl mx-auto space-y-8 pb-20">
                {showImage && <ImageView imageUrl={showImage} onClose={() => setShowImage(null)}/>}
                <section className="">
                    <h1 className="text-5xl font-outfit font-semibold tex">{exerciseDetails.name}</h1>
                    <p className="text-accent uppercase tracking-widest text-md mt-1 ml-1 font-semibold">{exerciseDetails.category}</p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="aspect-4/5 rounded-xl overflow-hidden bg-surface-bright relative cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={() => setShowImage(exerciseDetails.image_urls[0])}>
                            <img    alt="Start Position" 
                                    className="w-full h-full object-cover" 
                                    src={exerciseDetails.image_urls[0]}
                                    onClick={(e) => {e.stopPropagation()
                                                    setShowImage(exerciseDetails.image_urls[0])}}/>
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] 
                                    font-bold uppercase tracking-widest ">Start</div>
                        </div>
                        <div className="aspect-4/5 rounded-xl overflow-hidden bg-surface-bright relative cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={() => setShowImage(exerciseDetails.image_urls[1])}>
                            <img    alt="End Position" 
                                    className="w-full h-full object-cover" 
                                    src={exerciseDetails.image_urls[1]}
                                    onClick={(e) => {e.stopPropagation()
                                                    setShowImage(exerciseDetails.image_urls[1])}}
                                    />
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] 
                            font-bold uppercase tracking-widest">Finish</div>
                        </div>
                        </div>                
                </section>
                <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
                        <span className="text-[13px] font-outfit  uppercase text-zinc-400 tracking-wide">Main Target</span>
                        <p className="font-outfit font-bold text-2xl text-accent capitalize">{exerciseDetails.main_muscle}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
                        <span className="text-[13px] font-outfit  uppercase text-zinc-400 tracking-wide">Secondary </span>
                        <div className="">
                            {exerciseDetails.secondary_muscles && exerciseDetails.secondary_muscles.length > 0 ? 
                                exerciseDetails.secondary_muscles.map((m) => (
                            <p  key={m}
                                className="font-outfit font-bold text-l capitalize">
                                    {m}
                            </p>
                            )) : <p className="font-outfit font-bold text-xl text-zinc-400 capitalize">None</p>}
                        </div>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-white/5 ">
                        <span className="text-[13px] font-outfit  uppercase text-zinc-400 tracking-wide">Equipment</span>
                        <p className="font-outfit font-bold text-xl capitalize">{exerciseDetails.equipment}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
                        <span className="text-[13px] font-outfit  uppercase text-zinc-400 tracking-">Mechanism</span>
                        <p className="font-outfit font-bold text-xl uppercase">{exerciseDetails.mechanic}</p>
                    </div>
                </section>

                <section className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
                    <details className="group">
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                            <span className="font-outfit font-bold uppercase tracking-wider text-lg">Exercise Instructions</span>
                            <ChevronDown className="material-symbols-outlined group-open:rotate-180 
                                        transition-transform text-accent"/>
                        </summary>
                        <ol className="pr-3 pl-6 pb-4 mt-3 space-y-3  text-on-surface-variant leading-relaxed list-decimal ">
                            {exerciseDetails.instructions.map((i) => (
                                <li className="font-outfit"
                                    key={i}>
                                    {i}
                                </li>
                            ))}
                        </ol>
                    </details>
                </section>
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-outfit font-bold text-2xl uppercase tracking-tight">Workout Log</h3>
                        <button className="bg-surface-bright text-accent text-l font-bold uppercase px-4 py-1.5 rounded-full 
                                            border border-primary/30 active:scale-95 transition-all"
                                onClick={addNewExerciseSet}>
                                    <span className="flex flex-row items-center gap-1">
                                        <Plus size={20}/>
                                        Add Set
                                    </span> 
                        </button>
                    </div>
                    {exerciseSets.map((set,i) => ( 
                        <div key={i} 
                            className="space-y-3">
                            <div  className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-white/5">
                                <div className="w-10 h-10 flex items-center justify-center bg-black rounded-xl font-outfit font-bold 
                                            text-accent border border-accent/50">
                                                {set.id}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Weight (Kg)</label>
                                        <input  className="w-full bg-black border border-white/10 rounded-lg p-2 font-outfit 
                                                            font-bold text-white text-lg outline-none focus:ring-1 focus:ring-accent/50 
                                                            focus:border-accent/60 transition-all" 
                                                value={exerciseSets[i]["weight"]}
                                                onChange={(e) => handleSetChange(i,"weight",e.target.value)}
                                                type="number" 
                                                />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Reps</label>
                                        <input className="w-full bg-black border border-white/10 rounded-lg p-2 font-outfit 
                                                            font-bold text-white  text-lg outline-none focus:ring-1 focus:ring-accent/50 
                                                            focus:border-accent/60 transition-all"
                                                value={exerciseSets[i]["rep"]}
                                                onChange={(e) => handleSetChange(i,"rep",e.target.value)}
                                                type="number"/>
                                    </div>
                                </div>
                                {(exerciseSets.length > 1 && i === (exerciseSets.length - 1)) && 
                                    <button className="w-12 h-12  border border-zinc-800 flex items-center justify-center 
                                            bg-primarytext-white rounded-xl active:scale-95 active:border-red-500 transition-transform 
                                            shadow-lg shadow-primary/20"
                                        onClick={() => setExerciseSets(exerciseSets.filter((_, index) => index !== i))}>
                                        <Trash2 className="material-symbols-outlined font-black text-red-700"/>
                                    </button>}
                            </div>
                        </div>))}
                </section>
                <button className="w-full bg-accent text-zinc-100 font-outfit font-bold py-4 rounded-xl uppercase tracking-wider 
                                text-xl shadow-xl shadow-accent/20 active:scale-[0.98] transition-all"
                        onClick={addWorkoutLog}>
                    Add Sets
                </button>
            </main>
        </>
    )
}

export default ExerciseDetails