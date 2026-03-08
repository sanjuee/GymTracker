import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { AlertCircle, CircleArrowLeft} from "lucide-react"
import { useNavigate } from "react-router-dom"

const Auth = () => {

    const navigate = useNavigate()

    const [isSignUp, setIsSignUp] = useState(true)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")

    
    const handleBack = () => {
        (window.history.length > 1)
            ? navigate(-1)
            : navigate("/")
    }
    
    const getFriendlyErrorMessage = (msg) => {
        if (msg.includes("Invalid login credentials")) return "The email or password doesn't match. Please try again.";
        if (msg.includes("Email not confirmed")) return "Check your inbox! You need to verify your email first.";
        if (msg.includes("User already registered")) return "You already have an account! Try logging in instead.";
        if (msg.includes("Password should be at least")) return "Your password is too short. Use at least 6 characters.";
        if (msg.includes("rate limit")) return "Slow down! You've tried too many times. Wait a minute.";
        if (msg.includes("Failed to fetch")) return "Check your Internet; Failed to fetch"
        return msg; 
    };

    const handleSignup = async(e) => {
        e.preventDefault()
        setIsLoading(true)
        
        
        
        const {data, error: authError} = isSignUp 
                        ? (await supabase.auth.signUp({
                                email,
                                password,
                                options : {
                                    data : {
                                        display_name : username,
                                    },
                                },
                            })
                        ) : await supabase.auth.signInWithPassword({email, password})
        
        if (authError) {
            setError(authError.message)
            setIsLoading(false)
        } else {
            setError(null)
            setIsLoading(false)

            if (data?.session) {
                navigate('/', {state: {toastMsg: `Signed In as " ${data.user?.user_metadata?.display_name} "`}})
            }
        }
    }


    return(
        <div className="  min-h-screen bg-app-bg-dark flex items-center justify-center p-4">

            
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
            
                {isSignUp ? (
                    <div className="mb-5">
                        <div className="flex justify-between  items-center mb-4">
                            <h1 className="text-white/70 text-4xl  font-montserrat font-light tracking-tighter cursor-pointer ">
                                                GYM<span className="font-bold">LOG</span></h1>
                            <button onClick={handleBack} className="cursor-pointer text-white/70  ">
                                    <CircleArrowLeft size={25}/> </button>
                        </div>
                        <h1 className="text-3xl font-semibold font-inter text-white/90 tracking-tight">Create your account </h1>
                    </div>

                ) : (
                    <div className="mb-5">
                        <div className="flex justify-between  items-center mb-4">
                            <h1 className="text-white/70 text-4xl  font-montserrat font-light tracking-tighter cursor-pointer ">
                                                GYM<span className="font-bold">LOG</span></h1>
                            <button onClick={handleBack} className="cursor-pointer text-white/70 mr-2">
                                    <CircleArrowLeft size={25}/> </button>
                        </div>
                        <h1 className="text-3xl font-semibold font-inter text-white/90 tracking-tight">Sign In </h1>
                    </div>
                )}


                <form className="space-y-4">
                    {isSignUp && (
                        <div className="font-medium text-zinc-500 tracking-tight">
                            <label className="font-medium text-zinc-400  tracking-tight">Username</label>
                            <input className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 
                                            text-white focus:outline-none focus:border-blue-500 transition-colors" 
                                            onChange={(e)=>setUsername(e.target.value)}/>
                        </div>
                    )}
                    <div>
                    <label className="font-medium text-zinc-400  tracking-tight">Email</label>
                    <input className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 
                                    text-white focus:outline-none focus:border-blue-500 transition-colors" 
                            onChange={(e)=>setEmail(e.target.value)}
                            />
                </div>
                    <div>
                        <label className="font-medium text-zinc-400  tracking-tight">Password</label>
                        <input className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 
                                        text-white focus:outline-none focus:border-blue-500 transition-colors" type="password"
                                onChange={(e)=>setPassword(e.target.value)}
                        />
                    </div>

                    {!isLoading ? (
                        <button className="w-full bg-white text-black font-bold p-3 rounded-lg mt-4 hover:bg-zinc-200 transition-all"
                                    onClick={handleSignup}>
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    ) : (
                        <div className="w-full bg-zinc-500 text-zinc-800 font-bold p-3 rounded-lg mt-4 
                                        flex items-center justify-center gap-2 cursor-not-allowed ">
                            <div className=" border-t-transparent border-2 border-zinc-950 animate-spin w-6 h-6 rounded-full "></div>
                            {isSignUp ? "Creating  new account.." : "Signing In.."}
                        </div>
                    )}
                    {error  && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3 animate-shake">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                            <span className="font-bold">Authentication Error</span>
                            <p className="opacity-90">{getFriendlyErrorMessage(error)}</p>
                        </div>
                    </div>
                )}
                </form>

                
                <div className="pt-4 border-t border-zinc-700/50 mt-7 text-center">
                    <p className=" text-center text-zinc-500 text-[18px] ">
                        {isSignUp ? "Already have an account? " : "New to GymLog? "} 
                        <button type="button" onClick={() => (setIsSignUp(!isSignUp), setError(null))} className="text-accent underline cursor-pointer text-l">{isSignUp ? "Sign In" : "Create account"}</button>
                    </p>
                </div>
                

                
            </div>
        </div>
    )
}

export default Auth