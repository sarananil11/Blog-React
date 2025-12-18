import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar, Container } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import About from './pages/About'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import { ProtectedRoute } from './contexts/AuthContext'
import { NavbarComponent } from './components/Navbar'
import { FloatingActionButton } from './components/FloatingActionButton'

function App() {
  const isAuthenticated = localStorage.getItem('token') !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavbarComponent />
      <Container className="py-8 px-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Container>
      <FloatingActionButton />

    </div>
  )
}

export default App
