import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Alert, Card, Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap'
import { loginSuccess } from '../store/slices/authSlice'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', data.email)

      // ✅ LOCAL JSON SERVER (works perfectly)
      const response = await axios.get('http://localhost:3001/users', {
        params: { email: data.email }
      })

      console.log('Users response:', response.data)

      const user = response.data[0]

      if (user && user.password === data.password) {
        console.log('Login successful for:', user.email)
        
        dispatch(loginSuccess({
          user: { id: user.id, name: user.name, email: user.email },
          token: `token-${user.id}-${Date.now()}`
        }))
        
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email
        }))
        
        navigate('/dashboard')
      } else {
        setError('❌ Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('❌ Login failed. Server might be down.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-12">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-xl border-0">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4 fw-bold fs-2">Login</h2>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="admin@example.com"
                    {...register('email')}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="password123"
                    {...register('password')}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <small className="text-muted">
                  Test: admin@example.com / password123
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Login
