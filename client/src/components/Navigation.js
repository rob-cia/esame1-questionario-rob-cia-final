import { Navbar, Nav, Form } from 'react-bootstrap/';
import { PersonCircle, CheckAll } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { LogoutButton } from './Login';


const Navigation = (props) => {
  const { loggedIn, admin, logout } = props;

  return (
    <Navbar bg="success" variant="dark" className="d-flex justify-content-between">
      <Nav>
        <Navbar.Toggle aria-controls="left-sidebar" />
        <Link to="/surveys" className="navbar-brand">
          <CheckAll className="mr-1" size="30" /> Survey App
        </Link>
        <Link to={"/surveys"} className="nav-link">Surveys</Link>
        {loggedIn ?
          <>
            <Link to={"/cms/menu"} className="nav-link">Menu</Link>
            <Link to={"/cms/menu/newsurvey"} className="nav-link">New</Link>
            <Link to={"/cms/menu/viewsurveys"} className="nav-link">View</Link>
          </> : <></>
        }
      </Nav>

      <Nav>
        {loggedIn ?
          <>
            <Navbar.Text className="mx-2">
              {admin && admin.name && `Welcome, ${admin?.name}!`}
            </Navbar.Text>
            <Form inline className="mx-2">
              <LogoutButton logout={logout} />
            </Form>
          </>
          : <Nav.Item>
            <Link to={"/cms/login"} className="loginLink d-flex">
              <span><PersonCircle size="30" /> Area Riservata</span>
            </Link>
          </Nav.Item>
        }
      </Nav>
    </Navbar>
  )
}

export default Navigation;