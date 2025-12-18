import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'

export const FloatingActionButton = () => {
    const { isAuthenticated } = useSelector(state => state.auth)

    if (!isAuthenticated) return null

    return (
        <Link to="/dashboard" className="floating-action-btn">
            <Button variant="primary" size="lg" className="rounded-circle shadow-xl d-flex align-items-center justify-content-center ">
                <i className="fas fa-plus fs-4">Dashboard</i>
            </Button>
        </Link>
    )
}
