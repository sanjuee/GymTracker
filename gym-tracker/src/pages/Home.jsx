import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import ExerciseRow from "../components/ExerciseRow"
import ConfirmDelete from "../components/ConfirmDelete"
import ToastMessage from "../components/toastMessage"
import Header from "../components/layouts/Header"
import AddExerciseFromDatabase from "../components/AddExerciseFromDatabase"

const Home = () => {

    const location = useLocation()
    
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
                    });
                    return acc;
                }, {});
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


    return (
            <>  
                <Header/>
                {loadingExercsie && 
                    <div className="flex min-h-screen items-center justify-center -mt-20">
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
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

                {showDeleteToast && <ToastMessage message="Exercise Deleted !"/>}
                {showSignInToast && <ToastMessage message={signInMessageToast}/>}
                {showAddExerciseToast && <ToastMessage message={"Exercise Added!"}/>}
                {showCustomAddToast && <ToastMessage message={"Exercise Created!"}/>}
            
            </>
        
    )
}

export default Home