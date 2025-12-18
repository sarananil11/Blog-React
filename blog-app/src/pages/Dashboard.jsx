import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogs, createBlog, updateBlog, deleteBlog } from '../store/slices/blogSlice'
import { Row, Col, Card, Button, Modal, Form, Badge, Dropdown, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader } from '../components/Loader'

const schema = yup.object({
  title: yup.string().min(5, 'Title must be at least 5 characters').required('Title is required'),
  content: yup.string().min(20, 'Content must be at least 20 characters').required('Content is required'),
  author: yup.string().min(2, 'Author name required').required('Author is required'),
})

const Dashboard = () => {
  const dispatch = useDispatch()
  const { blogs, loading } = useSelector(state => state.blogs)
  const { user } = useSelector(state => state.auth)
  const [showModal, setShowModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState(null)
  const [editingBlog, setEditingBlog] = useState(null)

  // ✅ Define currentUser HERE
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const handleEditBlog = (blog) => {
    setEditingBlog(blog)
    setShowModal(true)
    // Pre-fill form
    setValue('title', blog.title)
    setValue('content', blog.content)
    setValue('author', blog.author)
  }

  useEffect(() => {
    dispatch(fetchBlogs())
  }, [dispatch])

  // ✅ FIXED: Handles BOTH create AND edit (no more duplicates!)
  const onSubmit = async (data) => {
    const today = new Date().toISOString().split('T')[0]
    
    if (editingBlog) {
      // ✅ UPDATE EXISTING BLOG
      await dispatch(updateBlog({ 
        id: editingBlog.id,
        ...data,
        ownerId: currentUser.id,
        ownerEmail: currentUser.email,
        date: today 
      }))
      setEditingBlog(null)
    } else {
      // ✅ CREATE NEW BLOG
      await dispatch(createBlog({ 
        ...data,
        ownerId: currentUser.id,
        ownerEmail: currentUser.email,
        date: today 
      }))
    }
    
    reset()
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteBlog(id))
    setDeleteModal(false)
    setBlogToDelete(null)
  }

  if (loading) return <Loader />

  return (
    <div className="py-8">
      <div className="d-flex justify-content-between align-items-center mb-8">
        <div>
          <h1 className="h2 fw-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-muted">Welcome back, {currentUser.name || user?.name}!</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="btn-primary px-5 py-2 fw-semibold shadow-lg">
          <i className="fas fa-plus me-2"></i>New Blog
        </Button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20">
          <div className="display-1 text-muted mb-4">📝</div>
          <h3 className="fw-bold mb-3">No blogs yet</h3>
          <p className="text-muted mb-4">Create your first blog post!</p>
          <Button onClick={() => setShowModal(true)} className="btn-primary px-5 py-2">
            Create First Blog
          </Button>
        </div>
      ) : (
        <Row>
          {blogs.map(blog => (
            <Col md={6} lg={4} xl={3} key={blog.id} className="mb-5">
              <Card className="h-100 shadow-xl border-0 hover:shadow-2xl transition-all">
                <Card.Body className="p-5">
                  <div className="d-flex justify-content-between mb-3">
                    <Badge bg={blog.featured ? "warning" : "info"} className="fw-semibold">
                      {blog.featured ? "Featured" : "Draft"}
                    </Badge>
                    
                    {/* ✅ Owner-only actions */}
                    {blog.ownerId === currentUser.id && (
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" className="shadow-none border-0">
                          <i className="fas fa-ellipsis-v"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item as={Link} to={`/blogs/${blog.id}`} className="text-decoration-none">
                            <i className="fas fa-eye me-2"></i>View
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEditBlog(blog)}>
                            <i className="fas fa-edit me-2"></i>Edit
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => {
                              setBlogToDelete(blog.id)
                              setDeleteModal(true)
                            }}
                            className="text-danger"
                          >
                            <i className="fas fa-trash me-2"></i>Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>

                  <Card.Title className="h5 fw-bold mb-3 line-clamp-2">{blog.title}</Card.Title>
                  <Card.Text className="text-muted small mb-3 line-clamp-2">
                    {blog.content}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-end">
                    <div>
                      <small className="text-muted d-block">By {blog.author}</small>
                      {blog.ownerEmail === currentUser.email && (
                        <Badge bg="success" className="mt-1">👑 Yours</Badge>
                      )}
                      <small className="text-muted d-block">{new Date(blog.date).toLocaleDateString()}</small>
                    </div>
                    <Link to={`/blogs/${blog.id}`} className="btn btn-sm btn-outline-primary">
                      View →
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ✅ Create/Edit Modal - Dynamic title/button */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light border-bottom-0">
          <Modal.Title>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter blog title"
                {...register('title')}
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Write your blog content..."
                {...register('content')}
                isInvalid={!!errors.content}
              />
              <Form.Control.Feedback type="invalid">{errors.content?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Author</Form.Label>
              <Form.Control
                type="text"
                placeholder={currentUser.name || "Enter author name"}
                defaultValue={currentUser.name || ""}
                {...register('author')}
                isInvalid={!!errors.author}
              />
              <Form.Control.Feedback type="invalid">{errors.author?.message}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" className="w-100 py-3 fw-semibold btn-gradient">
              <i className="fas fa-save me-2"></i>
              {editingBlog ? 'Update Blog' : 'Create Blog'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={deleteModal} onHide={() => setDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Blog?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This action cannot be undone. Are you sure?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(blogToDelete)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Dashboard
