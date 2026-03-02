import ExerciseCard from "./ExerciseCard"
import { CirclePlus } from "lucide-react"

function ExerciseRow({ title, exercises }) {
    return (
        <section className="mb-2">
            <div className="flex items-center justify-between mt-2.5 px-6 mb-1">
                <h2 className="font-outfit text-zinc-100 uppercase font-semibold text-xl 
                                tracking-tight">{title}</h2>
                <span className="ml-2 text-zinc-500 text-l">({exercises.length})</span>
            </div>

            <div className="flex flex-row overflow-x-auto gap-2 scrollbar-hide pb-7.5 px-2 overflow-hidden">
            {exercises.map((exercise) => (
                <ExerciseCard 
                    key={exercise.id}
                    exercise={exercise}
                />
            ))}
                <div className="flex flex-col justify-center items-center relative shrink-0 bg-[#131313] w-45 h-46
                        border-2 border-dashed border-zinc-600 rounded-2xl text-zinc-400">
                            <CirclePlus size={45}/> 
                            <span className="font-outfit text-l tracking-tight m-0.5">Add Exercise</span>
                </div>
            </div>
            <hr className="text-zinc-800 mt-1"/>
        </section>

        
    )
}

export default ExerciseRow