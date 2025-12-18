import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogs } from '../store/slices/blogSlice'
import { Row, Col, Card, Button, Badge, Pagination, Form, Dropdown, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Loader } from '../components/Loader'
import { useState } from 'react'

const Blogs = () => {
  const dispatch = useDispatch()
  const { blogs, loading } = useSelector(state => state.blogs)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    dispatch(fetchBlogs())
  }, [dispatch])

  // Filter and sort blogs
  const filteredBlogs = blogs
    .filter(blog => 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      
      if (sortBy === 'newest') return dateB - dateA
      if (sortBy === 'oldest') return dateA - dateB
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return dateB - dateA
      }
      return 0
    })

  const blogsPerPage = 9
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage)
  const startIndex = (currentPage - 1) * blogsPerPage
  const currentBlogs = filteredBlogs.slice(startIndex, startIndex + blogsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return <Loader />

  return (
    <Container className="py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="display-4 fw-bold mb-4 text-gradient">All Blogs</h1>
        <p className="lead text-muted mb-0">Discover inspiring stories and insights from our community</p>
      </div>

      {/* Search & Filter Section */}
      <div className="row g-4 mb-8">
        <div className="col-lg-6">
          <Form.Control
            type="text"
            placeholder="Search blogs by title, content, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-sm"
          />
        </div>
        <div className="col-lg-3">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start">
              Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Featured'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortBy('newest')}>Newest First</Dropdown.Item>
              <Dropdown.Item onClick={() => setSortBy('oldest')}>Oldest First</Dropdown.Item>
              <Dropdown.Item onClick={() => setSortBy('featured')}>Featured First</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="col-lg-3">
          <div className="d-flex gap-2">
            <span className="align-self-center text-muted">
              Showing {currentBlogs.length} of {filteredBlogs.length} blogs
            </span>
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      {currentBlogs.length > 0 ? (
        <>
          <Row>
            {currentBlogs.map(blog => (
              <Col lg={4} md={6} key={blog.id} className="mb-6">
                <Card className="blog-card h-100 shadow-lg border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="position-relative overflow-hidden">
                    <div className="blog-image-placeholder h-48 bg-gradient-to-br from-blue-400 to-purple-500 d-flex align-items-center justify-content-center">
                      <div className="text-white fs-1 opacity-75">📝</div>
                    </div>
                    <Badge 
                      bg={blog.featured ? "warning" : "info"} 
                      className="position-absolute top-3 end-3 shadow fw-semibold"
                    >
                      {blog.featured ? "Featured" : "New"}
                    </Badge>
                  </div>
                  
                  <Card.Body className="p-6 d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill small fw-semibold">
                        {blog.author}
                      </div>
                    </div>
                    
                    <Card.Title className="h4 fw-bold mb-3 line-clamp-2">
                      {blog.title}
                    </Card.Title>
                    
                    <Card.Text className="flex-grow-1 text-muted mb-4 line-clamp-3">
                      {blog.content}
                    </Card.Text>
                    
                    <div className="d-flex justify-content-between align-items-end mt-auto">
                      <div>
                        <small className="text-muted">
                          {new Date(blog.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </small>
                      </div>
                      <Link to={`/blogs/${blog.id}`} className="btn btn-outline-primary btn-sm fw-semibold">
                        Read More →
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-12">
              <Pagination className="mb-0">
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="display-1 text-muted mb-4">📭</div>
          <h3 className="fw-bold text-gray-600 mb-3">No blogs found</h3>
          <p className="text-muted mb-4">
            Try adjusting your search or filter options above.
          </p>
          <Link to="/" className="btn btn-primary px-5 py-2 fw-semibold">
            Back to Home
          </Link>
        </div>
      )}
    </Container>
  )
}

export default Blogs
