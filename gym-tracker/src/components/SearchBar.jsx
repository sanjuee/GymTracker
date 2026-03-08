import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient" 


const SearchBar = () =>{

    const [searchKey, setSearchKey] = useState("")
    const [result, setResult] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchExercise = async () => {
            setLoading(true)

            if (searchKey.length < 3){
                setResult([])
                setLoading(false)
                return
            }

            const {error , data } = await supabase
                .from("exercises")
                .select("id, name")
                .ilike('name', `%${searchKey}%`)
                .limit(25)
            if (error){
                console.log("Error fetching data.", error)
            }else{
                setResult(data)
            }
            setLoading(false)
        }

        const timer = setTimeout(() =>{
            fetchExercise()
        },500)

        return () => clearTimeout(timer)
    },[searchKey])



    return(
         <div className="relative flex items-center gap-1">
                <Search size={20} className="text-zinc-500"/>
              <input type="text" 
                placeholder="Search exercise" 
                className="bg-transparent w-full border border-[#262626] rounded-full py-2 pl-2
                            outline-none focus-within:border-accent/50 focus-within:ring-1 
                            focus-within:ring-accent/20 transition-all duration-100 sm:w-80 sm:pl-3.5"
                onChange={(e) => setSearchKey(e.target.value)}
                />
                {(loading || result.length > 0 || (searchKey.length >= 3 && !loading)) && (
                    <div className="absolute top-full font-inter  left-6 mt-2 w-48 bg-card-bg border max-h-125 custom-scrollbar
                     border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-100 overflow-y-auto cursor-pointer py-1"> 

                    {loading && (
                        <div className="px-4 py-3 text-[14px] font-outfit text-zinc-500 flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-accent border-t-transparent  rounded-full animate-spin"></div>
                            Searching exercise...
                        </div>
                    )}

                    {!loading && result.map((items)=>(
                        <button  key={items.id} 
                                className="w-full text-left px-4 py-3 text-l text-zinc-300 hover:bg-zinc-800 hover:text-white 
                                                transition-colors border-b border-zinc-800 last:border-0">
                                {items.name }
                        </button>
                    ))}

                    {!loading && searchKey.length >= 3 && result.length === 0 && (
                    <div className="px-4 py-3 text-l text-zinc-500 italic">
                        No exercise found for "{searchKey}"
                    </div>
                    )}
                    </div> 
                )}

           </div>
    )
}

export default SearchBar