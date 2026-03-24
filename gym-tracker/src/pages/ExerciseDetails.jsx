import { useEffect, useState } from "react"
import {  useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { ChevronDown, Trash2, ArrowLeft, Plus } from "lucide-react"
import { Line, Tooltip, XAxis, YAxis, LineChart, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import ImageView from "../components/ImageView"

const ExerciseDetails = () => {


    const navigate = useNavigate()
    const { id : exerciseId } = useParams() 
    const [exerciseDetails, setExerciseDetails] = useState(null) 
    const [loading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [exerciseSets, setExerciseSets] = useState(() => {
            const savedSets = localStorage.getItem(`workout_${exerciseId}`)
            return savedSets ? JSON.parse(savedSets) : [
                { id: 1, weight: "", reps: "" }
            ]
    })
    const [showImage, setShowImage] = useState(null)
    const [workoutLog, setWorkoutLog] = useState([])
    const [isWorkoutLogEmpty, setIsWorkoutLogEmpty] = useState(false)

    
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
        const getWorkoutLog = async () => {
            if (!user) return // Safety check for null user

            const { data: workoutLogData, error } = await supabase
                                                .from("workout_log")
                                                .select("*")
                                                .eq("user_id", user.id)
                                                .eq("exercise_id", exerciseId)
                                                .order("created_at", { ascending: true })

            if (error) {
                    console.error("Error fetching data", error.message)
            } else if (workoutLogData) {
                    const chartFriendlyData = transformDataForChart(workoutLogData)
                    setWorkoutLog(chartFriendlyData)
            }else{
                setIsWorkoutLogEmpty(true)
            }
        }
        getWorkoutLog()
    }, [exerciseId, user])
    
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
    }, [ exerciseId]) 

    const transformDataForChart = (logs) => {
        const dailyMaxMap = logs.reduce((acc, log) => {
            const date = new Date(log.created_at)
                        .toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                        })

            if (!acc[date] || log.weight > acc[date].weight) {
                acc[date] = {
                    date: date,
                    weight: log.weight,
                    fullDate: log.created_at 
                }
            }
            return acc
        }, {})

        return Object.values(dailyMaxMap);
    }

    const addNewExerciseSet = () => {
        const newExerciseSet = {
            id : Date.now(),
            weight : exerciseSets[exerciseSets.length -1]?.weight || "" ,
            reps : exerciseSets[exerciseSets.length -1]?.reps || ""
        }
        setExerciseSets([...exerciseSets, newExerciseSet])
    }

    const handleSetChange = (index, field, value) => {
            setExerciseSets((prevSets) => {
                const newSets = [...prevSets];
                newSets[index] = { 
                    ...newSets[index], 
                    [field]: value 
                };
                return newSets;
            })
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

    const stats = (() => {
        if (!workoutLog || workoutLog.length < 2) return { max: 0, progress: 0 };

        // 1. Get All-Time Max
        const allWeights = workoutLog.map(log => log.weight);
        const maxWeight = Math.max(...allWeights);

        // 2. Calculate Progress Percentage
        // (Latest Weight - First Weight) / First Weight * 100
        const firstWeight = workoutLog[0].weight;
        const latestWeight = workoutLog[workoutLog.length - 1].weight;
        
        const progressPercent = firstWeight > 0 
            ? ((latestWeight - firstWeight) / firstWeight) * 100 
            : 0;

        return {
            max: maxWeight,
            progress: progressPercent.toFixed(1) // Keep one decimal point
        }
    })()
        
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

                    <section className="mx-2  mb-5">
                        
                    
                        {workoutLog && workoutLog.length > 0 ? (
                        <div>
                            <div className="flex items-end justify-between mx-2 my-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-accent tracking-widest">Personal Record</span>
                                    <h3 className="font-headline font-black text-4xl">{stats.max} <span className="text-xs text-on-surface-variant font-medium -ml-2">Kg</span></h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Progress</span>
                                    <p className="font-headline font-bold text-sm text-accent">{stats.progress}%</p>
                                </div>
                            </div>
                            <div className="h-75 w-full bg-zinc-800/30 p-4 pl-0  rounded-2xl border border-white/5">
                                <ResponsiveContainer width="100%" height={270} >
                                    <LineChart data={workoutLog}
                                                margin={{top: 15, right: 10, left: -15,bottom: 0}}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#71717a" 
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            stroke="#71717a" 
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}kg`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} 
                                            itemStyle={{ color: '#3b82f6' }}
                                        />
                                        <Legend/>
                                        <Line
                                            type="monotone" 
                                            dataKey="weight" 
                                            stroke="#3b82f6" 
                                            strokeWidth={3} 
                                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} 
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-400 italic p-10 text-center bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
                            Log sets to view progress charts.
                        </div>
                    )}
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
                        <div key={set.id} 
                            className="space-y-3">
                            <div  className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-white/5">
                                <div className="w-10 h-10 flex items-center justify-center bg-black rounded-xl font-outfit font-bold 
                                            text-accent border border-accent/50">
                                                {i + 1}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Weight (Kg)</label>
                                        <input  className="w-full bg-black border border-white/10 rounded-lg p-2 font-outfit 
                                                            font-bold text-white text-lg outline-none focus:ring-1 focus:ring-accent/50 
                                                            focus:border-accent/60 transition-all" 
                                                value={set.weight}
                                                onChange={(e) => handleSetChange(i,"weight",e.target.value)}
                                                type="number"
                                                min="0" 
                                                />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Reps</label>
                                        <input className="w-full bg-black border border-white/10 rounded-lg p-2 font-outfit 
                                                            font-bold text-white  text-lg outline-none focus:ring-1 focus:ring-accent/50 
                                                            focus:border-accent/60 transition-all"
                                                value={set.reps}
                                                onChange={(e) => handleSetChange(i,"reps",e.target.value)}
                                                type="number"
                                                min="0"/>
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
                {setIsLoading ? 
                    (<button className="w-full bg-accent text-zinc-100 font-outfit font-bold py-4 rounded-xl uppercase tracking-wider 
                                text-xl shadow-xl shadow-accent/20 active:scale-[0.98] transition-all"
                                onClick={addWorkoutLog}>
                            Add Sets
                    </button>) :
                     (<div className="w-full bg-blue-800 text-zinc-300 font-outfit font-bold py-4 rounded-xl uppercase tracking-wider 
                                text-xl shadow-xl shadow-accent/20 active:scale-[0.98] transition-all">
                                    <span className="uppercase flex flex-row gap-2 items-center justify-center">
                                 <div className="w-6 h-6 border-3 border-zinc-300 border-t-transparent 
                                                rounded-full animate-spin"/>Adding Sets..</span>
                    </div>)}
            </main>
        </>
    )
}

export default ExerciseDetails