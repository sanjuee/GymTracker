import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/Home"
import Header from "./components/layouts/Header"

const App = () => {
  
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route  path="/" element= { <Home/>} />
      </Routes> 
    </BrowserRouter>
  )
}

export default App