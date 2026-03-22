import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

const ExerciseDetails = () => {
    const [user, setUser] = useState(null)
    const [exerciseDetails, setExerciseDetails] = useState(null) 
    const { id } = useParams() // exercise id

  
    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUserData()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    
    useEffect(() => {
        if (!id) return;

        const fetchDetails = async () => {
            const { error, data } = await supabase
                .from("exercises")
                .select("*")
                .eq("id", id)
                .single()

            if (error) {
                console.error("Error fetching data:", error.message)
                return
            }
            setExerciseDetails(data)
        }

        fetchDetails()
    }, [id]) 

    if (!exerciseDetails) return <div className="bg-black text-white p-10">Loading...</div>

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <h1 className="text-3xl font-bold text-accent">{exerciseDetails.name}</h1>
            <p className="text-zinc-400 uppercase tracking-widest text-xs mt-2">{exerciseDetails.main_muscle}</p>
            {/* Render the rest of your details here */}
        </div>
    )
}

export default ExerciseDetails