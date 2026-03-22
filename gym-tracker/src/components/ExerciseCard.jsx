import { Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

const ExerciseCard = ({exercise, requestDelete}) => {

    const navigator = useNavigate()
    
    return (
        <div className="relative shrink-0 bg-[#131313] w-45 h-40 border border-zinc-800 
                        rounded-2xl rounded-b-none hover:border-accent/50  cursor-pointer"
            onClick={() =>navigator(`exercise/${exercise.exercise_id}`)}>
                    <img 
                        src={exercise.image}
                        alt={exercise.name}
                        className=" w-full h-full rounded-t-xl object-cover "
                    />  
                    
            <div className=" w-45 h-13.5 bg-zinc-800 text-zinc-100 flex items-center justify-center text-center text-inter text-[17.5px] 
                            tracking-tighter rounded-b-xl ">{exercise.name}</div>
            <button 
                onClick={() => requestDelete(exercise)}
                className="absolute top-2 right-2 p-2 bg-black/70 backdrop-blur-md rounded-full 
                text-red-500 hover:bg-black hover:text-red-700 transition-all cursor-pointer"
                ><Trash2 size={16} />
            </button>
        </div>
    )
}

export default ExerciseCard
