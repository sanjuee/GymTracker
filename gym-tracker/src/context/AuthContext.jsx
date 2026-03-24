import { useState, useContext, createContext, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

const AuthContext = createContext({})

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        try{
            const getUserData = async() => {
                const { data : {user}} = await supabase.auth.getUser()
                setUser(user)
                setLoading(false)
            }
            getUserData()
            
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            })
            return () => subscription.unsubscribe()
        }
        catch(err){
            console.log("Error fetching user. ",err)
        }

    },[])

    const value = {
        user,
        loading,
        signOut : () => supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
