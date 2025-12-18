import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogs } from '../store/slices/blogSlice'
import { Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Loader } from '../components/Loader'

const Home = () => {
  const dispatch = useDispatch()
  const { blogs, loading } = useSelector(state => state.blogs)

  useEffect(() => {
    dispatch(fetchBlogs())
  }, [dispatch])

  const featuredBlogs = blogs.filter(blog => blog.featured).slice(0, 3)

  if (loading) return <Loader />

  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-20 mb-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl">
        <h1 className="display-4 fw-bold mb-4">Welcome to BlogHub</h1>
        <p className="lead mb-5">Discover amazing stories, insights, and knowledge from our community of writers.</p>
        <Link to="/blogs">
          <Button variant="light" size="lg" className="px-5 py-3 fw-semibold">
            Explore Blogs
          </Button>
        </Link>
      </section>

      {/* Featured Blogs */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Featured Blogs</h2>
        <Row>
          {featuredBlogs.map(blog => (
            <Col md={4} key={blog.id} className="mb-6">
              <Card className="h-100 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <Card.Body className="p-6">
                  <Badge bg="primary" className="mb-3">Featured</Badge>
                  <Card.Title className="h5 fw-bold mb-3">{blog.title}</Card.Title>
                  <Card.Text className="text-muted mb-4" style={{ height: '80px', overflow: 'hidden' }}>
                    {blog.content}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">By {blog.author}</small>
                    <Link to={`/blogs/${blog.id}`}>
                      <Button variant="outline-primary" size="sm">Read More</Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </>
  )
}

export default Home
