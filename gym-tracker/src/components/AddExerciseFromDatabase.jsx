import SearchBar from "./SearchBar"
import { X, Plus } from "lucide-react"
import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"


const AddExerciseFromDatabase = ({ onClose, userData , toast, exerciseCategory, onExerciseAdded}) => {

    const [selectedExercise,setSelectedExercise] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleAddToLog = async() =>{

        if(!selectedExercise) return 

        setIsLoading(true)

        const { data, error } = await supabase
                                .from("user_exercises")
                                .insert([{
                                   user_id : userData.id ,
                                   exercise_id : selectedExercise.id
                                }])
                                .select(`
                                    id, 
                                    exercise_id, 
                                        exercises (
                                            name, 
                                            image_urls, 
                                            category,
                                            main_muscle
                                        )`)
        
        if(error){
            console.error("Error adding exercise:", error)
            alert("Failed to add exercise. Please try again.")
            return
        }

        const flatData = {
            "id" : data[0].id,
            "name": data[0].exercises.name,
            "muscle" : data[0].exercises.main_muscle,
            "category" : data[0].exercises.category,
            "image" : data[0].exercises.image_urls[0]
        }

        onExerciseAdded(flatData)
        setIsLoading(false)
        onClose()
        toast(true)
    }

    return (
        <div className="z-9999 fixed inset-0 bg-black/80 backdrop-blur-md
                        flex justify-center items-center p-4">
            
           
            <div className="bg-[#121212] border border-zinc-800 shadow-2xl w-full max-w-md 
                            relative flex flex-col p-6 rounded-2xl gap-4 overflow-visible">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                    <X size={20} />
                </button>

                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                        Add {exerciseCategory} Movements
                    </h2>
                    <p className="text-zinc-500 text-sm">
                        Search our database for popular {exerciseCategory} exercise
                    </p>
                </div>

                <SearchBar onSelect={(item) => setSelectedExercise(item)}
                           searchFilterCategory={exerciseCategory}/>
                {!isLoading ? (
                    <button onClick={handleAddToLog} 
                            className="w-full bg-accent text-zinc-900 py-3 rounded-xl font-bold font-outfit
                                    hover:opacity-90 transition-all flex items-center justify-center gap-2
                                    shadow-lg shadow-accent/10 active:scale-[0.98] cursor-pointer">
                        <Plus size={18} strokeWidth={3} />
                        Add to Log
                    </button>
                    ) : (
                        <button className="w-full bg-blue-900 text-black py-3 rounded-xl font-bold
                                    hover:opacity-90 transition-all flex items-center justify-center gap-2
                                    shadow-lg shadow-accent/10 active:scale-[0.98]">
                                <div className="w-6 h-6 border-2 border-black border-t-transparent  rounded-full animate-spin"></div>
                        </button>
                    )}

                
                <div className="pt-2 border-t border-zinc-800/50 mt-2 text-center">
                    <p className="text-zinc-500 text-sm">
                        Cant find it? 
                        <button className="text-accent font-medium ml-1.5 cursor-pointer tracking-tight"
                                onClick={() => navigate("/create-custom-exercise")}> 
                            Create custom exercise
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AddExerciseFromDatabase