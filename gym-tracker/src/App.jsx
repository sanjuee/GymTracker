import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import CreateCustomExercise from "./pages/CreateCustomExercise"
import ExerciseDetails from "./pages/exerciseDetails"

const App = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route  path="/" element= { <Home/>} />
        <Route  path="/auth" element= { <Auth/>} />
        <Route  path="/create-custom-exercise"  element={ <CreateCustomExercise/>} />
        <Route  path="/exercise/:id" element={<ExerciseDetails/>} />
      </Routes> 
    </BrowserRouter>
  )
}

export default App