import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner 
} from 'react-bootstrap'
import { Link } from 'react-router-dom'

// ✅ NEW: Custom validation functions
const hasMinimumAlphabets = (value) => {
  const alphabets = (value || '').match(/[a-zA-Z]/g) || []
  return alphabets.length >= 3
}

const hasValidContent = (value) => {
  // Block if ONLY special characters (. / \ - _ etc.) - must have alphabets
  const specialOnly = /^[.,\/\\\-_!@#$%^&*()+=\[\]{}|<>?~`]*$/.test(value)
  return !specialOnly && hasMinimumAlphabets(value)
}

// ✅ UPDATED: Strict Schema with custom validation
const schema = yup.object({
  name: yup.string()
    .min(3, 'Name must be at least 3 characters')
    .test('alphabets-check', 'Name must contain at least 3 alphabets (no special chars only)', hasValidContent)
    .required('Name is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  subject: yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .test('alphabets-check', 'Subject must contain at least 3 alphabets', hasValidContent)
    .required('Subject is required'),
  message: yup.string()
    .min(10, 'Message must be at least 10 characters')
    .test('alphabets-check', 'Message must contain at least 3 alphabets', hasValidContent)
    .required('Message is required')
})

const Contact = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validationWarnings, setValidationWarnings] = useState('')

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange' // Real-time validation
  })

  // Watch all fields for real-time validation feedback
  const formValues = watch()

  const onSubmit = async (data) => {
    // ✅ FINAL VALIDATION before submit
    const finalCheck = {
      name: hasValidContent(data.name),
      subject: hasValidContent(data.subject),
      message: hasValidContent(data.message)
    }

    if (!finalCheck.name || !finalCheck.subject || !finalCheck.message) {
      setError('All fields must contain at least 3 alphabets. Special characters alone are not allowed.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Real-time validation feedback
  const getFieldStatus = (fieldValue) => {
    if (!fieldValue) return 'neutral'
    if (hasValidContent(fieldValue)) return 'valid'
    return 'invalid'
  }

  if (success) {
    // ... (keep the success animation code as before)
    return (
      <Container className="py-12 min-vh-100 d-flex align-items-center justify-content-center">
        {/* Your existing success animation code here */}
        <div className="text-center">
          <h1 className="display-3 fw-bold mb-4 text-gradient-success">Message Sent!</h1>
          <p className="lead mb-5 text-muted fs-4">Your message has been successfully delivered!</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12">
      <Row className="justify-content-center">
        <Col lg={10}>
          <div className="text-center mb-12">
            <h1 className="display-4 fw-bold mb-4 text-gradient">Get In Touch</h1>
            <p className="lead text-muted mb-0">Send us a message (must contain at least 3 alphabets per field)</p>
          </div>

          <Row className="g-6">
            <Col lg={7}>
              <Card className="shadow-2xl border-0 h-100">
                <Card.Body className="p-8">
                  {error && (
                    <Alert variant="danger" className="mb-6">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold fs-5">
                            Full Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your name (min 3 alphabets)"
                            className={`border-${getFieldStatus(formValues.name)}`}
                            {...register('name')}
                            isInvalid={!!errors.name}
                            disabled={loading}
                          />
                          {errors.name && (
                            <Form.Control.Feedback type="invalid">
                              {errors.name.message}
                            </Form.Control.Feedback>
                          )}
                          <small className={`mt-1 d-block ${
                            getFieldStatus(formValues?.name) === 'valid' 
                              ? 'text-success' 
                              : 'text-warning'
                          }`}>
                            {formValues?.name 
                              ? hasValidContent(formValues.name) 
                                ? '✅ Valid' 
                                : `⚠️ Need ${3 - ((formValues.name.match(/[a-zA-Z]/g) || []).length)} more alphabets`
                              : 'Enter at least 3 alphabets'
                            }
                          </small>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold fs-5">
                            Email <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="your@email.com"
                            {...register('email')}
                            isInvalid={!!errors.email}
                            disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold fs-5">
                        Subject <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Your subject (min 3 alphabets)"
                        className={`border-${getFieldStatus(formValues.subject)}`}
                        {...register('subject')}
                        isInvalid={!!errors.subject}
                        disabled={loading}
                      />
                      {errors.subject && (
                        <Form.Control.Feedback type="invalid">
                          {errors.subject.message}
                        </Form.Control.Feedback>
                      )}
                      <small className={`mt-1 d-block ${
                        getFieldStatus(formValues?.subject) === 'valid' 
                          ? 'text-success' 
                          : 'text-warning'
                      }`}>
                        {formValues?.subject 
                          ? hasValidContent(formValues.subject) 
                            ? '✅ Valid' 
                            : `⚠️ Need ${3 - ((formValues.subject.match(/[a-zA-Z]/g) || []).length)} more alphabets`
                          : 'Enter at least 3 alphabets'
                        }
                      </small>
                    </Form.Group>

                    <Form.Group className="mb-5">
                      <Form.Label className="fw-semibold fs-5">
                        Message <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        placeholder="Your message (min 3 alphabets, 10 chars total)"
                        className={`border-${getFieldStatus(formValues.message)}`}
                        {...register('message')}
                        isInvalid={!!errors.message}
                        disabled={loading}
                      />
                      {errors.message && (
                        <Form.Control.Feedback type="invalid">
                          {errors.message.message}
                        </Form.Control.Feedback>
                      )}
                      <small className={`mt-1 d-block ${
                        getFieldStatus(formValues?.message) === 'valid' 
                          ? 'text-success' 
                          : 'text-warning'
                      }`}>
                        {formValues?.message 
                          ? hasValidContent(formValues.message) 
                            ? '✅ Valid' 
                            : `⚠️ Need ${3 - ((formValues.message.match(/[a-zA-Z]/g) || []).length)} more alphabets`
                          : 'Enter at least 3 alphabets'
                        }
                      </small>
                    </Form.Group>

                    <Button 
                      type="submit" 
                      className="w-100 py-4 fw-bold fs-5 shadow-xl btn-gradient"
                      disabled={loading || !hasValidContent(formValues?.name) || !hasValidContent(formValues?.subject) || !hasValidContent(formValues?.message)}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Send Message
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Keep your existing contact info column */}
            <Col lg={5}>
              {/* Your existing contact cards */}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default Contact
