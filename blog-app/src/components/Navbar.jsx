import { useSelector, useDispatch } from 'react-redux'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
// import { useSelector } from 'react-redux'

export const NavbarComponent = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('token') !== null
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <Navbar bg="white" expand="lg" className="shadow-lg sticky top-0 z-50">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
          BlogHub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="mx-2">Home</Nav.Link>
            <Nav.Link as={Link} to="/about" className="mx-2">About</Nav.Link>
            <Nav.Link as={Link} to="/blogs" className="mx-2">Blogs</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="mx-2">Contact</Nav.Link>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/dashboard" className="mx-2">Dashboard</Nav.Link>
                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="ms-2">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="mx-2">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup" className="mx-2">Signup</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
