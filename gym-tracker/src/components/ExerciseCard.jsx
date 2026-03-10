import { Trash2 } from "lucide-react"

const ExerciseCard = ({exercise, requestDelete}) => {


    return (
        <div className="relative shrink-0 bg-[#131313] w-45 h-40 
                        border border-zinc-800 rounded-2xl rounded-b-none hover:border-accent/50 ">
                <img 
                    src={exercise.image}
                    alt={exercise.name}
                    className=" w-full h-full rounded-t-xl object-cover "
                />  
                
        <div className=" w-45 h-13.5 bg-zinc-800 text-zinc-100 flex items-center justify-center text-center text-inter text-[17.5px] 
                        tracking-tighter rounded-b-xl ">{exercise.name}</div>
        <button 
            onClick={() => requestDelete(exercise, exercise.muscle)}
            className="absolute top-2 right-2 p-2 bg-black/80 backdrop-blur-md rounded-full 
             text-red-500 hover:bg-black/60 transition-all cursor-pointer"
            ><Trash2 size={16} />
        </button>
        </div>
    )
}

export default ExerciseCard
