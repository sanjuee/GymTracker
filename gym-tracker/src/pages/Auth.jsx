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
    const [validate, setValidate] = useState({})

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

        const newValidate = {}
        
        if (isSignUp && (!username.trim())) newValidate.username = "Username is required!"

        if (!email.trim())  newValidate.email = "Email is required!";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newValidate.email = "Enter a valid email!";
        
        if (!password.trim()) newValidate.password = "Password is required"
            else if (password.length < 6) newValidate.password = "Password must contain atleast 6 charecter."

        if (Object.keys(newValidate).length > 0){
            setValidate(newValidate)
            return
        }

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
                            <div className="text-4xl text-accent font-black text-primary font-headline 
                            italic tracking-tighter">GYM<span className="text-zinc-50/80">LOG</span></div>
                        </div>
                        <h1 className="text-3xl font-semibold font-inter text-white/90 tracking-tight">Create your account </h1>
                    </div>
                ) : (
                    <div className="mb-5">
                        <div className="flex   items-center mb-4">
                            <div className="text-4xl text-accent font-black text-primary font-headline 
                                            italic tracking-tighter">GYM<span className="text-zinc-50/80">LOG</span></div>
                            </div>
                        <h1 className="text-3xl font-semibold font-inter text-white/90 tracking-tight">Sign In </h1>
                    </div>
                )}


                <form className="space-y-4">
                    {isSignUp && (
                        <div>
                            <div className="font-medium text-zinc-500 tracking-tight">
                                <label className="font-medium text-zinc-400  tracking-tight">Username</label>
                                <input
                                   className={`w-full bg-zinc-800/50 border rounded-lg p-3 text-white focus:outline-none transition-colors 
                                                ${validate.username 
                                                ? "border-red-700 focus:border-red-700" 
                                                : "border-zinc-700 focus:border-blue-500"
                                    }`}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                        if (validate.username) setValidate(prev => ({ ...prev, username: null }))
                                    }}
                                />
                            </div>
                            {validate.username && <p className="text-red-800 text-l ml-1.5 -mb-3">{validate.username}</p>}
                        </div>
                    )}
                    <div>
                        <label className="font-medium text-zinc-400  tracking-tight">Email</label>
                        <input
                            className={`w-full bg-zinc-800/50 border rounded-lg p-3 text-white focus:outline-none transition-colors 
                                        ${validate.email 
                                        ? "border-red-700 focus:border-red-700" 
                                        : "border-zinc-700 focus:border-blue-500"
                            }`}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (validate.email) setValidate(prev => ({ ...prev, email: null }))
                            }}
                        />
                        {validate.email && <p className="text-red-800 text-l ml-1.5 -mb-3">{validate.email}</p>}
                    </div>
                    <div>
                        <label className="font-medium text-zinc-400  tracking-tight">Password</label>
                        <input
                            type="password"
                            className={`w-full bg-zinc-800/50 border rounded-lg p-3 text-white focus:outline-none transition-colors 
                                        ${validate.password 
                                        ? "border-red-700 focus:border-red-700" 
                                        : "border-zinc-700 focus:border-blue-500"
                            }`}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (validate.password) setValidate(prev => ({ ...prev, password: null }))
                            }}
                        />
                    </div>
                    {validate.password && <p className="text-red-800 text-l ml-1.5 -my-2">{validate.password}</p>}
                    {!isLoading ? (
                        <button className="w-full  bg-blue-700 text-zinc-100 font-bold p-3 rounded-lg mt-4 hover:bg-blue-400 transition-all"
                                    onClick={handleSignup}>
                            {isSignUp ? "Create new account" : "Sign In"}
                        </button>
                    ) : (
                        <div className="w-full bg-blue-900 text-zinc-400 font-bold p-3 rounded-lg mt-8 
                                        flex items-center justify-center gap-2 cursor-not-allowed ">
                            <div className=" border-t-transparent border-2 border-zinc-400 animate-spin w-6 h-6 rounded-full "></div>
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
                        <button type="button" 
                        onClick={() => {setIsSignUp(!isSignUp)
                                        setError(null) 
                                        setValidate({}) 
                        }} 
                        className="text-accent cursor-pointer text-l">{isSignUp ? "Sign In" : "Create account"}</button>
                    </p>
                </div>
                

                
            </div>
        </div>
    )
}

export default Auth