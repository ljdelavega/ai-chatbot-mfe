import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { IntegratedWidget, ComponentTests } from './pages'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntegratedWidget />} />
        <Route path="/components" element={<ComponentTests />} />
      </Routes>
    </Router>
  )
}

export default App
