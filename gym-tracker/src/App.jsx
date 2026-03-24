import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import CreateCustomExercise from "./pages/CreateCustomExercise"
import ExerciseDetails from "./pages/ExerciseDetails"
import { useAuth } from "./context/AuthContext"

const App = () => {

  const { user, loading } = useAuth()

  if (loading) return (
       <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-row items-center gap-2">
                    <div className="w-6 h-6 border-3 border-accent border-t-transparent 
                                    rounded-full animate-spin"></div>
                    <p className="text-xl font-outfit">Loading..</p>
                </div>
        </div>
  )
  
  return (
      <BrowserRouter>
          <Routes>
              <Route  path="/" 
                      element= {user ? <Home/> : <Auth/>} 
              />
              <Route  path="/auth" 
                      element= {!user ? <Auth/> : <Navigate to="/" />} 
              />
              <Route  path="/create-custom-exercise" 
                      element={user ? <CreateCustomExercise/> : <Navigate to="/auth" />} 
              />
              <Route  path="/exercise/:id" 
                      element={user ? <ExerciseDetails/> : <Navigate to="/auth" />} 
              />
          </Routes> 
      </BrowserRouter>
  )
}

export default App