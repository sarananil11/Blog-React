import { Spinner } from 'react-bootstrap'

export const Loader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
    <Spinner animation="border" role="status" variant="primary" />
  </div>
)
