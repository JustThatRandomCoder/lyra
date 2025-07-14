import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

//pages
import Home from './pages/home.jsx'
import Briefing from './pages/briefing.jsx'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Briefing />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
