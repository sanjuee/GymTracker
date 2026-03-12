import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import CreateCustomExercise from "./pages/CreateCustomExercise"

const App = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route  path="/" element= { <Home/>} />
        <Route  path="/auth" element= { <Auth/>} />
        <Route path= "/create-custom-exercise"  element={ <CreateCustomExercise/>} />
      </Routes> 
    </BrowserRouter>
  )
}

export default App