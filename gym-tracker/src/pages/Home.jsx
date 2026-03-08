import { useEffect, useState } from "react"
import ExerciseRow from "../components/ExerciseRow"
import { exerciseDataObj } from "../data/exercises"
import ConfirmDelete from "../components/ConfirmDelete"
import ToastMessage from "../components/toastMessage"
import Header from "../components/layouts/Header"
import { useLocation } from "react-router-dom"
import AddExerciseFromDatabase from "../components/AddExerciseFromDatabase"

const Home = () => {

    const location = useLocation()
    
    const [exerciseData, setExerciseData] = useState(exerciseDataObj)
    const [exerciseToDelete, setExerciseToDelete ] = useState(null)
    const [showDeleteToast, setShowDeleteToast] = useState(false)
    const [showSignInToast, setShowSignInToast] = useState(false)
    const [toastSignInMessage, setToastSignInMessage] = useState("")

    const [addExercise, setAddExercise] = useState(false)

    useEffect(() => {
        if (location.state?.toastMsg){
            setToastSignInMessage(location.state.toastMsg)
            setShowSignInToast(true)

            const timer = setTimeout(() => setShowSignInToast(false), 3000)

            window.history.replaceState({}, document.title)

            return () => clearTimeout(timer)
        }
    },[location])

    const requestDelete = (exercise, category) => {
        setExerciseToDelete({...exercise, category})
    } 

    const deleteExercise = (id, category) => {

        const categoryToUpdate = exerciseData[category]
        const updatedList = categoryToUpdate.filter((exe) => exe.id !== id)

        setExerciseData({
            ...exerciseData,
            [category]: updatedList
        })
        setShowDeleteToast(true)
        setTimeout(() => setShowDeleteToast(false), 15000)
        setExerciseToDelete(null)

    }


    return (
            <>  <Header/>
                {Object.entries(exerciseData).map(([category, exercises])=>(
                        <ExerciseRow
                            key={category}
                            title={category}
                            exercises={exercises}
                            requestDelete = {requestDelete}
                            setAddExercise={setAddExercise}
                        />
                ))}
                {exerciseToDelete && (
                    <ConfirmDelete 
                        exercise = {exerciseToDelete}
                        onDelete = { () => deleteExercise(exerciseToDelete.id, exerciseToDelete.category)}
                        onCancel = { () => setExerciseToDelete(null)}
                    />
                )}
                {showDeleteToast && <ToastMessage message="Exercise Deleted !"/>}
                {showSignInToast && <ToastMessage message={toastSignInMessage}/>}
                {addExercise && <AddExerciseFromDatabase onClose={() => setAddExercise(false)}/>}
            </>
        
    )
}

export default Home