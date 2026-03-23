import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient" 
import { useNavigate } from "react-router-dom"


const SearchBar = ({onSelect, searchFilterCategory}) =>{

    const [searchKey, setSearchKey] = useState("")
    const [result, setResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isSelected, setIsSelected] = useState(false)

    useEffect(() => {
        const fetchExercise = async () => {
            
            if (isSelected){
                setIsSelected(false)
                return
            }

            if (searchKey.length < 3){
                setResult([])
                setLoading(false)
                setShowDropdown(false)
                return
            }
            
            setLoading(true)
            setShowDropdown(true)

            let query = supabase
                    .from("exercises")
                    .select("id, name")
                    .ilike('name', `%${searchKey}%`)
            
            if (searchFilterCategory){
                query = query.eq("category", searchFilterCategory)
            }

            const { error, data } = await query.limit(25)

            if (error){
                console.log("Error fetching data.", error)
            }else{
                setResult(data || [])
            }
            setLoading(false)
        }

        const timer = setTimeout(() =>{
            fetchExercise()
        },500)

        return () => clearTimeout(timer)
    },[searchKey])





    return(
         <div className="relative flex items-center gap-1 ">
                <Search size={20} className=" absolute ml-2 text-zinc-400 pointer-events-none"/>
                <input type="text" 
                    value={searchKey}
                    placeholder="Search exercise" 
                    className="bg-transparent w-full max-w-xl border border-[#262626] rounded-full py-2 pl-8
                                outline-none focus-within:border-accent/50 focus-within:ring-1 
                                focus-within:ring-accent/20 transition-all duration-100 sm:w-100"
                    onChange={(e) => {setSearchKey(e.target.value)
                                    setShowDropdown(true)
                    }}
                />
                {showDropdown && (searchKey.length >= 3) && (
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
                                onClick={() => {
                                    onSelect(items)
                                    setResult([])
                                    setShowDropdown(false)
                                    setSearchKey(items.name)
                                    setIsSelected(true)
                                }}
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