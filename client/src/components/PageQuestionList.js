import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Row, Col, Spinner, Button, Card, Form, ProgressBar } from 'react-bootstrap/';
import QuestionList from './QuestionList';

import API from './../API';

const validator = require('validator');

const HandlePages = (props) => {
    const { numPage, setNumPage, len } = props;

    return (
        <Row className="handlePages">
            <Col className="col-4 d-flex justify-content-center p-2 align-items-center">
                <Button className="p-3 h-100 w-50 align-middle d-flex align-items-baseline" variant="outline-light" onClick={() => setNumPage(numPage => numPage <= 0 ? numPage : numPage - 1)}>
                    <span className="m-auto">
                        Indietro
                    </span>
                </Button>
            </Col>
            <Col className="col-4 d-flex justify-content-center">
                <ProgressBar variant="info" className="w-100 mt-4" now={100 / (len + 1) * (numPage + 1)} label={`${numPage + 1}/${len + 1}`} />
            </Col>
            <Col className="col-4 d-flex justify-content-center p-2 align-items-center">
                <Button className="p-3 h-100 w-50 align-middle d-flex align-items-baseline" variant="outline-light" onClick={() => setNumPage(numPage => numPage >= len ? numPage : numPage + 1)}>
                    <span className="m-auto">
                        Avanti
                    </span>
                </Button>
            </Col>
        </Row>
    );
}

const Loading = () => {
    return (<Row className="p-2 justify-content-md-center cardDim" style={{ marginTop: "30px", position: "relative" }} >
        <Col lg="1">
            <Spinner className="" animation="border" variant="success" />
        </Col>
        <Col md="auto">
            <h5>Caricamento del questionario in corso...</h5>
        </Col>
    </Row>
    );
}

const QuestionName = (props) => {
    const { name, setName, setDefinedName } = props;

    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = () => {
        let valid = true;
        if (validator.isEmpty(name)) {
            valid = false;
            setErrorMessage('Empty field');
        }
        else if (!validator.isLength(name, { min: 3 })) {
            valid = false;
            setErrorMessage('Name is too short, min 3 characters!');
        }

        if (valid) {
            setDefinedName(true);
        }
    }

    return (<div className="p-2 text-left mb-4">
        <h3 className="text-center">Prima di proseguire inserisci il tuo nome</h3>

        <Row className="p-2 justify-content-center"  >
            <Card border="success" className="cardDim" style={{ position: "relative" }}>
                <Card.Header><Card.Title>Inserisci il tuo nome</Card.Title></Card.Header>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Control className={errorMessage !== '' ? "is-invalid" : ""} maxLength="200" as="textarea" rows={3} placeholder="scrivi il tuo nome..." value={name} onChange={ev => setName(ev.target.value)} />
                        <Form.Control.Feedback className="text-left" type="invalid">
                            {errorMessage}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Card.Body>
            </Card>
        </Row>

        <Row className="p-2 justify-content-center">
            <Button className="p-3 h-100 w-25 align-middle d-flex align-items-baseline" variant="outline-warning" onClick={handleSubmit}>
                <span className="m-auto">
                    Conferma Nome
                </span>
            </Button>
        </Row>
    </div>
    );
}

const PageQuestionList = (props) => {
    const { surveyList, loggedIn, admin, isAdmin, preview, disabled, setDirtyAdminList, handleErrors } = props;

    const [definedName, setDefinedName] = useState(false);
    const [name, setName] = useState('');

    const [loading, setLoading] = useState(true);

    const [questionList, setQuestionList] = useState([]);
    const [adminQuestionList, setAdminQuestionList] = useState([]);
    const [utilizer, setUtilizer] = useState({});

    const params = useParams();

    let history = useHistory();
    if (!validator.isInt(params.idsurvey) || (!loading && questionList.length === 0)) {
        history.push("/surveys");
    }

    const survey = surveyList.filter((s) => s.idSurvey.toString() === params.idsurvey)[0];

    const [numPage, setNumPage] = useState(0);

    useEffect(() => {
        if (!isAdmin)
            API.getQuestionList(params.idsurvey)
                .then((list) => {
                    setQuestionList(list);
                    setLoading(false);
                })
                .catch(e => handleErrors(e));
    }, [params.idsurvey, isAdmin]);// handleErrors 

    useEffect(() => {
        if (loggedIn && isAdmin)
            API.getAdminQuestionList(admin.id, params.idsurvey)
                .then(list => {
                    setAdminQuestionList(list);
                    setLoading(false);
                })
                .catch(e => handleErrors(e));
    }, [loggedIn, params.idsurvey, isAdmin, admin.id]);//, handleErrors

    useEffect(() => {
        const changePage = async (numPage) => {
            let i = 0;
            for (const q of adminQuestionList) {
                if (i === numPage) {
                    setQuestionList(q.questionList);
                    setUtilizer(q.utilizer)
                    break;
                }
                i++;
            }
        }
        changePage(numPage);
    }, [numPage, adminQuestionList]);

    return (
        <>
            {
                loading ?
                    <Loading />
                    :
                    !definedName && !isAdmin ?
                        <QuestionName
                            name={name}
                            setName={setName}
                            setDefinedName={setDefinedName} />
                        :
                        <>
                            {isAdmin ? <>
                                <HandlePages numPage={numPage} setNumPage={setNumPage} len={adminQuestionList.length - 1} />
                                <Row className="text-center m-3"><h4>Questionario compilato da</h4><h2>{utilizer.name}</h2></Row></> : <></>}

                            <QuestionList
                                name={name}
                                title={survey.title}
                                questionList={questionList}
                                setQuestionList={setQuestionList}
                                disabled={disabled}
                                preview={preview}
                                editMode={false}
                                isAdmin={isAdmin}
                                loggedIn={loggedIn}
                                setDirtyAdminList={setDirtyAdminList}
                                handleErrors={handleErrors} />
                        </>
            }
        </>
    )
}

export default PageQuestionList;