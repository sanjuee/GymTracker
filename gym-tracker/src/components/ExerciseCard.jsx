import { Trash2 } from "lucide-react"

const ExerciseCard = ({exercise, requestDelete}) => {


    return (
        <div className="relative shrink-0 bg-[#131313] w-45 h-40 
                        border border-zinc-800 rounded-2xl hover:border-accent/50 ">
                <img 
                    src={exercise.image}
                    alt={exercise.name}
                    className=" w-full h-full rounded-t-xl object-cover "
                />
        <div className=" bg-zinc-800 text-zinc-100 text-center text-outfit text-[17.5px] 
                        tracking-tighter rounded-b-xl ">{exercise.name}</div>
        <button 
            onClick={() => requestDelete(exercise, exercise.muscle)}
            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-full 
             hover:text-red-500 hover:bg-black/60 transition-all"
            ><Trash2 size={16} />
        </button>
        </div>
    )
}

export default ExerciseCard
