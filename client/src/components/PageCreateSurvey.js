import { useHistory } from "react-router-dom";
import { useState } from 'react';
import QuestionList from './QuestionList';
import NewQuestion from './NewQuestion';

import { Form, Row, Col, Button, Modal } from 'react-bootstrap/';
import API from "../API";

const ModalSend = (props) => {
    const { title, questionList, setErrorMessageT, setErrorMessageL, idAdmin, setDirtyList, setDirtyAdminList, handleErrors } = props;
    const [show, setShow] = useState(false);

    let history = useHistory();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = () => {
        let error = 0;

        if (title === '') {
            error = 1;
            setErrorMessageT("Campo vuoto, inserire un titolo!");
        } else {
            setErrorMessageT("");
        }

        if (questionList.length === 0) {
            error = 1;
            setErrorMessageL("Non hai ancora inserito alcuna domanda!");
        } else {
            setErrorMessageL("");
        }

        if (!error) {
            setErrorMessageT("");
            API.addSurvey(idAdmin, title, questionList)
                .then(() => {
                    history.push("/cms/menu");
                    setDirtyAdminList(true);
                    setDirtyList(true);
                })
                .catch(e => handleErrors(e));
        }

        setShow(false);
    };

    return (
        <>
            <div className="p-2 d-flex align-items-center justify-content-center w-100">
                <Button className="p-3 h-100 w-25 align-middle d-flex align-items-baseline" variant="warning" onClick={handleShow}>
                    <span className="m-auto">
                        Pubblica Sondaggio!
                    </span>
                </Button>
            </div>

            <Modal centered show={show} animation={false} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Pubblicare il questionario?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Da questo momento, il questionario non sarà più modificabile,
                    e diventerà visibile agli utilizzatori nella pagina principale del sito.</Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={handleClose}>
                        Annulla
                    </Button>
                    <Button variant="outline-primary" onClick={handleSubmit}>
                        Pubblica
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

const PageCreateSurvey = (props) => {
    const { admin, setDirtyList, setDirtyAdminList, handleErrors } = props;
    const [questionList, setQuestionList] = useState([]);
    const [title, setTitle] = useState('');
    const [errorMessageT, setErrorMessageT] = useState('');
    const [errorMessageL, setErrorMessageL] = useState('');

    return (
        <>
            <Row className="minHeight100">
                {/* CREAZIONE SONDAGGIO */}
                <Col className="col-8">
                    <Col >
                        <Row className="p-2 text-center mb-4">
                            <h3 className="text-center">Crea un nuovo sondaggio</h3>
                            <hr className="mb-3"></hr>
                        </Row>
                        <h5 className="text-center">Titolo del sondaggio</h5>
                        <Row className="p-2 justify-content-center" >
                            <Form className="cardDim">
                                <Form.Control
                                    as="textarea"
                                    className={errorMessageT !== '' ? "is-invalid" : ""}
                                    rows={1}
                                    maxLength="200"
                                    placeholder="scrivi il titolo del questionario..."
                                    value={title}
                                    onChange={ev => setTitle(ev.target.value)} />
                                <Form.Control.Feedback type="invalid">{errorMessageT}</Form.Control.Feedback>
                            </Form>
                        </Row>
                        <NewQuestion setQuestionList={setQuestionList} errorMessageL={errorMessageL} setErrorMessageL={setErrorMessageL}></NewQuestion>
                        <ModalSend setDirtyList={setDirtyList} setDirtyAdminList={setDirtyAdminList} idAdmin={admin.id} title={title} questionList={questionList} setErrorMessageT={setErrorMessageT} setErrorMessageL={setErrorMessageL} handleErrors={handleErrors}></ModalSend>
                    </Col>
                </Col>
                {/* ANTEPRIMA SONDAGGIO */}
                <Col className="col-4 backgroundSecondary" >
                    <Row className="p-2 text-center mb-4">
                        <h3 className="text-center">Anteprima Sondaggio</h3>
                        <hr className="mb-3"></hr>
                    </Row>
                    <Row >
                        <QuestionList title={title} questionList={questionList} setQuestionList={setQuestionList} preview={true} editMode={true} disabled={true}></QuestionList>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default PageCreateSurvey;