import { Col, Row, Badge, Button, Modal } from 'react-bootstrap/';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function ModalVoidSurvey(props) {
    const { show, setShow } = props;

    return (
        <Modal centered show={show} animation={false} >
            <Modal.Header>
                <Modal.Title>Attenzione</Modal.Title>
            </Modal.Header>
            <Modal.Body>Il sondaggio non contiene compilazioni!</Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const SurveyList = (props) => {
    const { loggedIn, surveyList } = props;

    const [show, setShow] = useState(false);

    return (
        <>
            <Row className="justify-content-center">
                <Row className="p-2 text-center mb-4">
                    <h3>{loggedIn ? "I tuoi sondaggi (sondaggi compilati)" : "Compila un questionario"}</h3>
                </Row>
                <ModalVoidSurvey show={show} setShow={setShow}/>
                <Col className="col-lg-8 d-flex flex-wrap">
                    {
                        surveyList.map((s, i) => {
                            return (
                                <div key={i} className="div-survey p-2 d-flex align-items-center" >
                                    {loggedIn ?
                                        s.numCompiled > 0 ?
                                            <Link to={"/cms/menu/viewsurveys/" + s.idSurvey} className="btn btn-outline-success p-3 h-100 w-100 align-middle d-flex align-items-baseline">
                                                <span className="m-auto">
                                                    {s.title}
                                                </span>
                                                <Badge className="badge badge-pill">{s.numCompiled}</Badge>
                                            </Link>
                                            :
                                            <Button onClick={() => setShow(true)} variant="outline-success" className="p-3 h-100 w-100 align-middle d-flex align-items-baseline">
                                                <span className="m-auto">
                                                    {s.title}
                                                </span>
                                                <Badge className="badge badge-pill">{s.numCompiled}</Badge>
                                            </Button>
                                        :
                                        <Link to={"/surveys/" + s.idSurvey} className="btn btn-outline-success p-3 h-100 w-100 align-middle d-flex align-items-baseline">
                                            <span className="m-auto">
                                                {s.title}
                                            </span>
                                        </Link>
                                    }
                                </div>
                            );
                        })
                    }
                </Col>
            </Row>
        </>
    )
}

export default SurveyList;