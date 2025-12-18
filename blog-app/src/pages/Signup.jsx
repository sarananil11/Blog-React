import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'

const schema = yup.object({
    name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const Signup = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema)
    })

    const onSubmit = async (data) => {
        setLoading(true)
        setError('')

        try {
            // 1. Check if user exists ✅ LOCAL JSON SERVER
            const users = await axios.get('http://localhost:3001/users')
            const userExists = users.data.find(user => user.email === data.email)

            if (userExists) {
                setError('Email already exists')
                setLoading(false)
                return
            }

            // 2. Create user ✅ LOCAL JSON SERVER
            const newUser = {
                id: Date.now(),
                name: data.name,
                email: data.email,
                password: data.password,
                joined: new Date().toISOString().split('T')[0]
            }

            await axios.post('http://localhost:3001/users', newUser)

            // 3. Direct localStorage + redirect ✅ WORKS LOCALLY
            localStorage.setItem('token', `user-${newUser.id}`)
            localStorage.setItem('user', JSON.stringify(newUser))

            setSuccess('Account created! Redirecting...')
            reset()

            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 1500)

        } catch (err) {
            setError('Signup failed: ' + err.message)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container className="py-12 min-vh-100 d-flex align-items-center">
            <Row className="justify-content-center w-100">
                <Col md={8} lg={6} xl={5}>
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <div className="bg-gradient-to-br from-primary to-purple-600 px-6 py-8 text-center text-white">
                            <div className="display-5 mb-3">👋</div>
                            <h2 className="fw-bold mb-1">Create Account</h2>
                        </div>

                        <Card.Body className="p-6 p-md-8">
                            {error && (
                                <Alert variant="danger" className="mb-4">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success" className="mb-4">
                                    <i className="fas fa-check-circle me-2"></i>
                                    {success}
                                    <Spinner size="sm" className="ms-2" />
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="John Doe"
                                        {...register('name')}
                                        isInvalid={!!errors.name}
                                        disabled={loading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="test@example.com"
                                        {...register('email')}
                                        isInvalid={!!errors.email}
                                        disabled={loading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="123456"
                                        {...register('password')}
                                        isInvalid={!!errors.password}
                                        disabled={loading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="w-100 py-3 fw-semibold shadow-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <small className="text-muted">
                                    Already have account? <Link to="/login" className="text-primary fw-semibold">Login</Link>
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Signup
