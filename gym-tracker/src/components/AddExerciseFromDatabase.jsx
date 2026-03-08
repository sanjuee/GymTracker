import { Search, X, Plus } from "lucide-react"
import SearchBar from "./SearchBar"

const AddExerciseFromDatabase = ({ onClose }) => {
    return (
        <div className="z-[9999] fixed inset-0 bg-black/80 backdrop-blur-md
                        flex justify-center items-center p-4">
            
           
            <div className="bg-[#121212] border border-zinc-800 shadow-2xl w-full max-w-md 
                            relative flex flex-col p-6 rounded-2xl gap-4 overflow-visible">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-po">
                    <X size={20} />
                </button>

                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                        Add Exercise
                    </h2>
                    <p className="text-zinc-500 text-sm">
                        Search our database of over 1,000 movements
                    </p>
                </div>

                <SearchBar />

                <button className="w-full bg-accent text-black py-3 rounded-xl font-bold
                                 hover:opacity-90 transition-all flex items-center justify-center gap-2
                                 shadow-lg shadow-accent/10 active:scale-[0.98]">
                    <Plus size={18} strokeWidth={3} />
                    Add to Log
                </button>

                
                <div className="pt-2 border-t border-zinc-800/50 mt-2 text-center">
                    <p className="text-zinc-500 text-sm">
                        Cant find it? 
                        <button className="text-accent font-medium ml-1 hover:underline underline-offset-4"> 
                            Create custom exercise
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AddExerciseFromDatabase