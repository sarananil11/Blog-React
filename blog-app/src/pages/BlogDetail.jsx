import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchBlogs } from '../store/slices/blogSlice'
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form, Dropdown, Breadcrumb, Spinner } from 'react-bootstrap'
import { Loader } from '../components/Loader'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'

const schema = yup.object({
    title: yup.string().required('Title is required'),
    content: yup.string().required('Content is required'),
    author: yup.string().required('Author is required'),
})

const BlogDetail = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { blogs, loading: blogsLoading } = useSelector(state => state.blogs)
    const [currentBlog, setCurrentBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState('')
    const [editError, setEditError] = useState('')
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editLoading, setEditLoading] = useState(false)

    const { register, handleSubmit, reset, setValue } = useForm({
        resolver: yupResolver(schema)
    })

    // ✅ MOVED INSIDE COMPONENT - Now works!
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const isAuthenticated = localStorage.getItem('token') !== null
    const isOwner = currentBlog && currentUser.id && currentBlog.ownerId === currentUser.id

    useEffect(() => {
        dispatch(fetchBlogs())
    }, [dispatch])

    useEffect(() => {
        const loadBlog = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`http://localhost:3001/blogs/${id}`)
                setCurrentBlog(response.data)
                
                // ✅ Pre-fill edit form when blog loads
                if (response.data) {
                    setValue('title', response.data.title)
                    setValue('content', response.data.content)
                    setValue('author', response.data.author)
                    setValue('featured', response.data.featured || false)
                }
            } catch (error) {
                console.error('Blog not found:', error)
                navigate('/blogs')
            } finally {
                setLoading(false)
            }
        }
        loadBlog()
    }, [id, navigate, setValue])

    const handleEdit = async (data) => {
        setEditLoading(true)
        setEditError('')
        try {
            await axios.put(`http://localhost:3001/blogs/${parseInt(id)}`, {
                ...currentBlog,
                ...data,
                date: new Date().toISOString().split('T')[0]
            })
            
            dispatch(fetchBlogs())
            setCurrentBlog({ ...currentBlog, ...data })
            setShowEditModal(false)
            setSuccess('Blog updated successfully!')
        } catch (error) {
            console.error('Edit error:', error)
            setEditError('Failed to update blog')
        } finally {
            setEditLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3001/blogs/${parseInt(id)}`)
            dispatch(fetchBlogs())
            navigate('/blogs')
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    // ✅ SINGLE LOADING CHECK
    if (loading || !currentBlog) {
        return (
            <Container className="py-12">
                <div className="text-center">
                    <Spinner animation="border" className="mb-3" />
                    <h3>Loading blog...</h3>
                </div>
            </Container>
        )
    }

    return (
        <Container className="py-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <Breadcrumb.Item as={Link} to="/">Home</Breadcrumb.Item>
                <Breadcrumb.Item as={Link} to="/blogs">Blogs</Breadcrumb.Item>
                <Breadcrumb.Item active>{currentBlog.title}</Breadcrumb.Item>
            </Breadcrumb>

            {success && (
                <Alert variant="success" className="mb-4" onClose={() => setSuccess('')} dismissible>
                    {success}
                </Alert>
            )}
            {editError && (
                <Alert variant="danger" className="mb-4" onClose={() => setEditError('')} dismissible>
                    {editError}
                </Alert>
            )}

            <Row className="g-5">
                {/* Main Blog Content */}
                <Col lg={8}>
                    <article className="blog-detail-card shadow-xl border-0 bg-white rounded-3xl overflow-hidden">
                        {/* Blog Header */}
                        <div className="blog-header position-relative overflow-hidden">
                            <div className="blog-image-placeholder h-96 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 d-flex align-items-end justify-content-center p-8">
                                <div className="text-white text-center">
                                    <Badge 
                                        bg="light" 
                                        text="dark" 
                                        className="fs-6 px-3 py-2 mb-3 fw-semibold shadow-lg"
                                    >
                                        {currentBlog.featured ? "🔥 FEATURED" : "📝 BLOG"}
                                    </Badge>
                                    <div className="fs-1 mb-2 opacity-90">✨</div>
                                </div>
                            </div>
                        </div>

                        {/* Blog Content */}
                        <div className="p-8 pb-4">
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-pill fw-semibold fs-6">
                                        {currentBlog.author}
                                    </div>
                                    <div className="text-muted">
                                        <i className="fas fa-calendar me-1"></i>
                                        {new Date(currentBlog.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                {/* ✅ FIXED OWNER CHECK - Only shows for blog owner */}
                                {isAuthenticated && isOwner && (
                                    <Dropdown className="ms-auto">
                                        <Dropdown.Toggle variant="outline-light" size="sm" className="border-0 shadow-sm">
                                            <i className="fas fa-ellipsis-v"></i>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => setShowEditModal(true)}>
                                                ✏️ Edit Blog
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                                                🗑️ Delete Blog
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                            </div>

                            <h1 className="display-4 fw-bold mb-6 lh-1-2 text-gray-900">
                                {currentBlog.title}
                            </h1>

                            <div 
                                className="blog-content fs-5 lh-lg text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: currentBlog.content.replace(/\n/g, '<br/>') }}
                            />

                            {/* Tags & Actions */}
                            <div className="d-flex flex-wrap gap-2 mt-8 pt-6 border-top">
                                <span className="badge bg-light text-dark px-3 py-2 fw-semibold">#Blogging</span>
                                <span className="badge bg-light text-dark px-3 py-2 fw-semibold">#Technology</span>
                                <div className="ms-auto d-flex gap-2">
                                    <Link to="/blogs" className="btn btn-outline-primary px-4 py-2">
                                        ← Back to Blogs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>
                </Col>

                {/* Sidebar */}
                <Col lg={4}>
                    <div className="sticky-top" style={{ top: '100px' }}>
                        {/* Recent Blogs */}
                        <Card className="shadow-lg border-0 mb-6">
                            <Card.Header className="bg-gradient-to-r from-gray-50 to-gray-100 border-0 py-4">
                                <h5 className="mb-0 fw-bold text-gray-800">Recent Blogs</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {blogs.slice(-3).map(blog => (
                                    <Link 
                                        key={blog.id}
                                        to={`/blogs/${blog.id}`}
                                        className="d-flex p-4 border-bottom hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg p-3 me-3 flex-shrink-0">
                                            <div className="text-white fs-4 opacity-75">📄</div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1 line-clamp-1">{blog.title}</h6>
                                            <small className="text-muted">{blog.author}</small>
                                        </div>
                                    </Link>
                                ))}
                            </Card.Body>
                        </Card>

                        {/* Quick Actions */}
                        {isAuthenticated && (
                            <Card className="shadow-lg border-0">
                                <Card.Body className="text-center p-6">
                                    <div className="mb-4">
                                        <div className="bg-primary bg-opacity-10 p-4 rounded-3xl mb-3">
                                            <i className="fas fa-plus-circle text-primary fs-1"></i>
                                        </div>
                                    </div>
                                    <h6 className="fw-bold mb-3">Create New Post</h6>
                                    <Link to="/dashboard" className="btn btn-primary w-100">
                                        Write Blog
                                    </Link>
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Blog</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(handleEdit)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control {...register('title')} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                {...register('content')}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Author</Form.Label>
                            <Form.Control {...register('author')} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Featured Blog"
                                {...register('featured')}
                            />
                        </Form.Group>
                        <Button
                            type="submit"
                            className="w-100"
                            disabled={editLoading}
                        >
                            {editLoading ? 'Updating...' : 'Update Blog'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        Are you sure you want to delete "<strong>{currentBlog?.title}</strong>"?
                        This action cannot be undone.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete Blog
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default BlogDetail
