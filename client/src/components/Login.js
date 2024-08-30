import { Form, Button, Alert, Col, Row } from 'react-bootstrap';
import { useState } from 'react';

const validator = require('validator');

function LoginForm(props) {
    const { login } = props;
    const [username, setUsername] = useState('es@gmail.com');
    const [password, setPassword] = useState('password');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        const credentials = { username, password };

        let valid = true;
        if (validator.isEmpty(username) || validator.isEmpty(password)) {
            valid = false;
            setErrorMessage('Empty field(s)');
        }
        else if (!validator.isEmail(username)) {
            valid = false;
            setErrorMessage('Invalid email');
        }
        else if (!validator.isLength(password, { min: 6 })) {
            valid = false;
            setErrorMessage('Password is too short, min 6 characters!');
        }

        if (valid) {
            login(credentials).catch((err) => setErrorMessage(err));
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="form-signin">
            {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
            <h2 className="h2 mt-5 mb-3 font-weight-normal text-center">Survey App</h2>
            <h3 className="h3 mt-5 mb-3 font-weight-bold text-center"> Login </h3>
            <Form.Group controlId="email">
                <Form.Control
                    type="email"
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    className="text-center"
                    placeholder="Email address"
                />
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Control
                    type="password"
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    className="text-center"
                    placeholder="Password"
                />
            </Form.Group>
            <Button type="submit" variant="success" className="btn btn-lg btn-block w-100">Login</Button>
            <Row>
                <p className="mt-5 mb-0 text-muted text-center">Primo Account</p>
                <p className="text-center">
                    <span>- es@gmail.com- password -</span>
                </p>
                <p className="mt-1 mb-0 text-muted text-center">Secondo Account</p>
                <p className="text-center">
                    <span>- john.doe@polito.it- password -</span>
                </p>
            </Row>
        </Form>
    );
}

function LogoutButton(props) {
    const { logout } = props;

    return (
        <Col>
            <Button variant='outline-light' onClick={logout}>Logout</Button>
        </Col>
    );
}

export { LoginForm, LogoutButton };