import SearchBar from "../SearchBar"
import { CircleUserRound, LogOut  } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"



const Header = () => {

    const [isSignedIn, setIsSignedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const [navAuthPage, setNavAuthPage] = useState(false)
    const [username, setUsername] = useState("")

    const checkUserStatus = async() => {
        const { data : {user}} = await supabase.auth.getUser()
        if (user) {
            setIsSignedIn(true)
            setUsername(user.user_metadata.display_name)
        } else {
            setIsSignedIn(false)
        }
    }

    const handleSignOut = async() => {
        setIsLoading(true)

        await supabase.auth.signOut()
        setIsSignedIn(false)
        setNavAuthPage(false)
        setIsLoading(false)
        navigate("/auth")
    }

    useEffect(() => {
        checkUserStatus()
    }, [])

    useEffect(() => {
        if (navAuthPage && !isSignedIn) {
            navigate("/auth")
        }
    }, [navAuthPage, isSignedIn, navigate]) 
            
    return (
        <header className="bg-app-bg-dark/95 backdrop-blur-md px-7 border-b border-[#1B1B1B] h-16
                            flex items-center justify-between sticky top-0 z-50 gap-2 sm:px-20  ">
            <h1 className="text-accent text-2xl  font-montserrat font-light tracking-tighter cursor-pointer">
                            GYM<span className="font-bold text-zinc-100">LOG</span>
            </h1>
            <SearchBar/>
           <button onClick={()=> setNavAuthPage(!navAuthPage) }>
                <CircleUserRound size={25} className="relative cursor-pointer text-zinc-300"/>
           </button>
           {(navAuthPage && isSignedIn) && (
                <div className="absolute z-100 top-13 bg-zinc-800  rounded-xl right-9">
                        <div className="border-b border-b-zinc-600 p-3 flex justify-center">
                            <p className="text-md text-zinc-300 font-outfit">Hey!<span className="ml-0.5 text-accent/80"> {username}</span></p>
                        </div>
                        <div className="boder-1 border-b-zinc-600">
                        {isLoading ? (
                            <div className="text-red-900/80 cursor-pointer md:right-18 p-3 flex flex-row justify-center items-center gap-1">
                                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent  rounded-full animate-spin"></div>  
                            </div>
                        ):(

                            <button className="text-red-500/80 cursor-pointer  md:right-18 p-3 flex flex-row items-center gap-1"
                                    onClick={handleSignOut}>
                                    <LogOut size={20}/> Sign Out</button>
                        )}
                    </div>
                </div>
           )}
          
        </header>

    )
}

export default Header