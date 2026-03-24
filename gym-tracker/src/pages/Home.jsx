import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { Plus } from "lucide-react"
import ExerciseRow from "../components/ExerciseRow"
import ConfirmDelete from "../components/ConfirmDelete"
import ToastMessage from "../components/toastMessage"
import Header from "../components/layouts/Header"
import AddExerciseFromDatabase from "../components/AddExerciseFromDatabase"

const muscleGroupList = [
    "Back",
    "Chest",
    "Legs",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Abdominals",
    "Other"
]

const Home = () => {

    const location = useLocation()
    const muscleGroupRef = useRef()

    const [user,setUser] = useState(null)
    const [exerciseData, setExerciseData] = useState({})
    const [exerciseToDelete, setExerciseToDelete ] = useState(null)
    const [showDeleteToast, setShowDeleteToast] = useState(false)
    const [showSignInToast, setShowSignInToast] = useState(false)
    const [signInMessageToast, setSignInMessageToast] = useState("")
    const [showAddExerciseToast,setAddExerciseToast] = useState(false)
    const [addExerciseButton, setAddExerciseButton] = useState(false)
    const [exerciseCategory, setExerciseCategory] = useState(null)
    const [loadingExercsie, setLoadingExercise] = useState(false)
    const [showCustomAddToast, setShowCustomAddToast] = useState(false)
    // const [existingCategory, setExistingCategoryList] = useState([])
    const [showMuscleGoupList, setShowMuscleGroupList] = useState(false)
    const [showMuscleGoupListAbove, setShowMuscleGroupListAbove] = useState(true)



    useEffect(()=>{
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

    useEffect(() =>{

        if (!user) return
        
        setLoadingExercise(true)
        const getUserExerciseData = async () => {
            try {
                const { error, data } = await supabase
                    .from("user_exercises")
                    .select(`
                        id, 
                        exercise_id, 
                            exercises (
                                name, 
                                image_urls, 
                                category,
                                main_muscle
                            )
                    `)
                    .eq("user_id", user.id)     
                
                if (error) {
                    console.error("Query Error:", error.message)
                    return
                }
                const grouped = data.reduce((acc, item) => {
                    const category = item.exercises?.category || "Other"
                    if (!acc[category]) acc[category] = []
                    
                    acc[category].push({
                        id: item.id,
                        exercise_id: item.exercise_id,
                        name: item.exercises?.name,
                        muscle: item.exercises?.main_muscle,
                        image: item.exercises?.image_urls?.[0]
                    })
                    return acc
                }, {})
                setExerciseData(grouped)
            } finally {
                setLoadingExercise(false)
            }
        }
        getUserExerciseData()
    },[user])

    useEffect(() => {
        if (location.state?.toastMsg){
            setSignInMessageToast(location.state.toastMsg)
            setShowSignInToast(true)
            const timer = setTimeout(() => setShowSignInToast(false), 3000)
            window.history.replaceState({}, document.title)
            return () => clearTimeout(timer)
        }
        
        if (location.state?.created){
            setShowCustomAddToast(true)
            const timer = setTimeout(() => setShowCustomAddToast(false), 3000)
            window.history.replaceState({}, document.title)
            return () => clearTimeout(timer)
        }

    },[location])

    useEffect(() => {
        if ( showMuscleGoupList && muscleGroupRef.current){
            const rect = muscleGroupRef.current.getBoundingClientRect()

            if  (rect.top < 20) setShowMuscleGroupListAbove(false)
            else setShowMuscleGroupListAbove(true)

        }
    },[showMuscleGoupList])

    // useEffect(()=> {
    //         setExistingCategoryList(Object.keys(exerciseData))
    // },[exerciseData])

    const requestDelete = (exerciseID) => {
        setExerciseToDelete(exerciseID)
    } 

    const deleteExercise = async(id) => {

        const { error } = await supabase
                          .from("user_exercises")
                          .delete()
                          .eq("id", id)
                          .eq("user_id", user.id)

          if (error) {
                console.error("Query Error:", error.message)
                return
            }
        setExerciseData((prevData) => {
            const newData = {...prevData}

            for( const category in newData ){
                newData[category] = newData[category].filter((exe) => (exe.id !== id))
            }

        return newData;
    })
                          
        setShowDeleteToast(true)
        setTimeout(() => setShowDeleteToast(false), 15000)
        setExerciseToDelete(null)
    }

   const onExerciseAdded = (newExercise) => {

            const category = newExercise.category
            setExerciseData( (prevData) => {
                const currentCategoryList = prevData[category] || []
                return {
                    ...prevData,
                    [category] : [...currentCategoryList, newExercise ]
                }
            })
   }

   

   const addMusclegroup = (newMuscleGroup) => {

            if (exerciseData[newMuscleGroup]) return;

            setExerciseData( (prev) => ({
                ...prev, 
                [newMuscleGroup] : []
            }))
            
            setShowMuscleGroupList(!showMuscleGoupList)
            setAddExerciseButton(true)
   }

    return (
            <>  
                <Header/>
                {loadingExercsie && 
                    <div className="flex min-h-screen items-center justify-center -mt-20">
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-6 h-6 border-3 border-accent border-t-transparent 
                                            rounded-full animate-spin"></div>
                            <p className="text-xl font-outfit">Loading</p>
                        </div>
                    </div>}
                {Object.entries(exerciseData).map(([category, exercises])=>(
                        <ExerciseRow
                            key={category}
                            title={category}
                            exercises={exercises}
                            requestDelete = {requestDelete}
                            setAddExercise={setAddExerciseButton}
                            setExerciseCategory = {setExerciseCategory}
                        />
                ))}
                {exerciseToDelete && (
                    <ConfirmDelete 
                        exercise = {exerciseToDelete}
                        onDelete = { () => deleteExercise(exerciseToDelete.id)}
                        onCancel = { () => setExerciseToDelete(null)}
                    />
                )}
                {(addExerciseButton && user) && (
                        <AddExerciseFromDatabase 
                            exerciseCategory={exerciseCategory} 
                            toast={setAddExerciseToast} 
                            userData={user} 
                            onExerciseAdded={onExerciseAdded}
                            onClose={() => setAddExerciseButton(false)}
                        />
                )}
                <div className="max-w-xl mx-auto p-4 mb-20">
                    <div className="relative">
                        {showMuscleGoupList && (
                            <div  ref={muscleGroupRef}
                                  className={`absolute left-0 w-full z-50 p-3 bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-md transition-all duration-200
                                            ${showMuscleGoupListAbove 
                                                ? "bottom-full mb-4 animate-in fade-in slide-in-from-bottom-2" 
                                                : "top-full mt-4 animate-in fade-in slide-in-from-top-2"}`}>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
                                        Available Groups
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {muscleGroupList
                                        .filter((m) => !Object.keys(exerciseData).includes(m))
                                        .map((m) => (
                                            <button
                                            key={m}
                                            onClick={() => addMusclegroup(m)}
                                            className="text-left px-4 py-3 hover:bg-blue-800  rounded-2xl transition-all
                                                        text-sm font-medium bg-zinc-700/50 cursor-pointer"
                                            >
                                            {m}
                                            </button>
                                        ))}
                                </div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowMuscleGroupList(!showMuscleGoupList)}
                        className="w-full border-2 border-dashed border-zinc-800 rounded-3xl p-8 group hover:border-accent/30
                                 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer"
                    >
                        <div className="p-3 bg-zinc-900 rounded-full transition-transform border border-zinc-800">
                            <Plus size={24} className="text-zinc-500" />
                        </div>
                        <p className="font-outfit text-zinc-500 group-hover:text-zinc-300 font-medium">
                            Add Muscle Group
                        </p>
                    </button>
                    </div>
      </div>


                {showDeleteToast && <ToastMessage message="Exercise Deleted !"/>}
                {showSignInToast && <ToastMessage message={signInMessageToast}/>}
                {showAddExerciseToast && <ToastMessage message={"Exercise Added!"}/>}
                {showCustomAddToast && <ToastMessage message={"Exercise Created!"}/>}
            
            </>
        
    )
}

export default Home