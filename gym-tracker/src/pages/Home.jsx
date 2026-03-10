import { useEffect, useState } from "react"
import ExerciseRow from "../components/ExerciseRow"
import { exerciseDataObj } from "../data/exercises"
import ConfirmDelete from "../components/ConfirmDelete"
import ToastMessage from "../components/toastMessage"
import Header from "../components/layouts/Header"
import { useLocation } from "react-router-dom"
import AddExerciseFromDatabase from "../components/AddExerciseFromDatabase"
import { supabase } from "../lib/supabaseClient"

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
        
        const getUserExerciseData = async () => {
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
    },[location])

    const requestDelete = (exercise, category) => {
        setExerciseToDelete({...exercise, category})
    } 

    const deleteExercise = async(id, category) => {

        const { error } = supabase
                          .delete()
                          .eq("id", id)
        setExerciseData({
            ...exerciseData,
            [category]: updatedList
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
            <>  <Header/>
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
                        onDelete = { () => deleteExercise(exerciseToDelete.id, exerciseToDelete.category)}
                        onCancel = { () => setExerciseToDelete(null)}
                    />
                )}
                {(addExerciseButton && user) && (
                        <AddExerciseFromDatabase 
                            exerciseCategory={exerciseCategory} 
                            toast={setAddExerciseToast} userData={user} 
                            onExerciseAdded={onExerciseAdded}
                            onClose={() => setAddExerciseButton(false)}
                        />
                )}

                {showDeleteToast && <ToastMessage message="Exercise Deleted !"/>}
                {showSignInToast && <ToastMessage message={signInMessageToast}/>}
                {showAddExerciseToast && <ToastMessage message={"Exercise Added!"}/>}
            
            </>
        
    )
}

export default Home