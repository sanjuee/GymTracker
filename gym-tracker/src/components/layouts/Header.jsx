import { CircleUserRound, Search } from "lucide-react"

const Header = () => {
    return (
        <header className="bg-[#0a0a0a] px-7 border-b border-[#1B1B1B] h-15 flex items-center justify-between sm:px-20">
           <h1 className="text-white text-xl  font-outfit tracking-tighter  ">GYM<span className="font-bold">LOG</span></h1>
           <div className="relative flex items-center gap-1">
                <Search size={20} className="text-zinc-500"/>
                <input type="text" 
                placeholder="Search exercise" 
                className="bg-transparent w-full border border-[#262626] rounded-full py-1 pl-2.5
                            outline-none focus-within:border-accent/50 focus-within:ring-1 
                            focus-within:ring-accent/20 transition-all duration-300 sm:w-80"/>
           </div>
           <div>
                <CircleUserRound size={22}/>
           </div>
        </header>

    )
}

export default Header