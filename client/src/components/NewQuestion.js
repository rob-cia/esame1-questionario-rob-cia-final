import { useEffect, useState } from 'react';

import { Form, ListGroup, Card, Row, Col, Button, Alert } from 'react-bootstrap/';
import { PlusLg, Trash, Dash, Plus } from 'react-bootstrap-icons';


const OpenQuestion = (props) => {
    const { question, setQuestion, isOptional, setIsOptional, errorMessageQ } = props;

    return (
        <>
            <Row className="p-2 justify-content-center" >
                <Card border="success" className="cardDim">
                    <Card.Header>
                        <Form.Control
                            as="textarea"
                            className={errorMessageQ !== '' ? "is-invalid" : ""}
                            rows={1}
                            maxLength="200"
                            placeholder="scrivi la domanda..."
                            value={question}
                            onChange={ev => setQuestion(ev.target.value)} />
                        <Form.Control.Feedback type="invalid">{errorMessageQ}</Form.Control.Feedback>
                    </Card.Header>
                    <Card.Body>
                        <Form.Control
                            as="textarea"
                            disabled
                            rows={3}
                            maxLength="200"
                            placeholder="Area di testo libero di massimo 200 caratteri" />
                    </Card.Body>
                    <Card.Footer>
                        <Form.Group controlId="formBasicCheckbox">
                            <Form.Check
                                inline
                                type="checkbox"
                                label="Rendi la domanda obbligatoria all'utilizzatore"
                                defaultChecked={!isOptional}
                                value={!isOptional}
                                onChange={() => setIsOptional(!isOptional)} />
                        </Form.Group>
                    </Card.Footer>
                </Card>
            </Row>
        </>
    )
}

const Counter = (props) => {
    const { count, setCount, text, min, max } = props;
    // if (count > max && count > min)
    //     setCount(max);
    return (
        <>
            <Row className="p-2 justify-content-center" >
                <div className="cardDim">
                    <div>
                        {text}
                    </div>
                    <div className="input-group">
                        <span className="input-group-prepend">
                            <Button variant="outline-secondary" onClick={() => setCount(prevCount => { return ((prevCount > min) ? prevCount - 1 : prevCount) })}><Dash></Dash></Button>
                        </span>
                        <span className="input-group-text">
                            {count}
                        </span>
                        <span className="input-group-append">
                            <Button variant="outline-secondary" onClick={() => setCount(prevCount => { return ((prevCount < max) ? prevCount + 1 : prevCount) })}><Plus></Plus></Button>
                        </span>
                    </div>
                </div>
            </Row>
        </>
    );
}

const ClosedQuestion = (props) => {
    const { question, setQuestion, optionList, setOptionList, min, setMin, max, setMax, errorMessageQ, errorMessageO, setErrorMessageO } = props;

    const [option, setOption] = useState('');

    const addOption = (option) => {
        if (option !== '') {
            setOptionList([...optionList, { option: option }]);
            setOption('');
            setErrorMessageO('');
        } else {
            setErrorMessageO('Campo vuoto, inserire una risposta!');
        }
    }

    const deleteOption = (index) => {
        if (index >= 0) {
            setOptionList(optionList.filter((o, i) => i !== index));
        }
    }

    return (
        <>
            <Row className="p-2 justify-content-center" >
                <Card border="success" className="cardDim">
                    <Card.Header>
                        <Form.Control
                            as="textarea"
                            className={errorMessageQ !== '' ? "is-invalid" : ""}
                            rows={1}
                            maxLength="200"
                            placeholder="scrivi la domanda..."
                            value={question}
                            onChange={ev => setQuestion(ev.target.value)} />
                        <Form.Control.Feedback type="invalid">{errorMessageQ}</Form.Control.Feedback>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup as="ul" variant="flush">
                            {
                                optionList.map((o, i) => {
                                    return (<ListGroup.Item as="li" className="p-2" key={i}>
                                        <div className="d-flex">
                                            <div className="flex-grow-1 align-self-center py-2">{o.option}</div>
                                            <Button variant="outline-danger" className="mr-0 mt-0 mb-0 m-2" onClick={() => deleteOption(i)}><Trash></Trash></Button>
                                        </div>
                                    </ListGroup.Item>
                                    );
                                })
                            }
                            {
                                (optionList.length < 10) ?
                                    <ListGroup.Item as="li" className="p-2">
                                        <div className="d-flex">
                                            <div className={"w-100"}>
                                                <Form.Control type="text" className={errorMessageO !== '' ? "is-invalid" : ""} placeholder="risposta" maxLength="200" value={option} onChange={ev => setOption(ev.target.value)} />
                                                <Form.Control.Feedback type="invalid">
                                                    {errorMessageO}
                                                </Form.Control.Feedback>
                                            </div>

                                            <Button variant="outline-success" className="mr-0 mt-0 mb-0 m-2" onClick={() => addOption(option)}><PlusLg></PlusLg></Button>
                                        </div>
                                    </ListGroup.Item>
                                    : <><Alert className="w-100" variant='warning'>Limite massimo di risposte raggiunto</Alert></>
                            }
                        </ListGroup>
                    </Card.Body>
                    <Card.Footer>
                        <Counter
                            count={min}
                            setCount={setMin}
                            text="Minimo numero di domande a cui rispondere (non può essere maggiore di max)"
                            min={0}
                            max={max} />
                        <Counter
                            count={max}
                            setCount={setMax}
                            text="Massimo numero di domande a cui rispondere"
                            min={1}
                            max={optionList.length} />
                    </Card.Footer>
                </Card>
            </Row>
        </>
    )
}

const NewQuestion = (props) => {
    const { setQuestionList, errorMessageL, setErrorMessageL } = props;
    const [type, setType] = useState('');
    const [question, setQuestion] = useState('');
    const [optionList, setOptionList] = useState([]);
    const [isOptional, setIsOptional] = useState(true);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(1);
    const [errorMessageQ, setErrorMessageQ] = useState('');
    const [errorMessageO, setErrorMessageO] = useState('');

    const undoNewQuestion = () => {
        setQuestion('');
        setOptionList([]);
        setIsOptional(true);
        setMin(0);
        setMax(1);
        setType('');
        setErrorMessageQ('');
        setErrorMessageO('');
    }

    const ButtonUndo = () => {
        return (<div className="div-survey p-2 d-flex align-items-center justify-content-end">
            <Button className="p-3 h-100 w-50 align-middle d-flex align-items-baseline" variant="outline-danger" onClick={() => undoNewQuestion()}>
                <span className="m-auto">
                    Annulla
                </span>
            </Button>
        </div>);
    }

    const ButtonAdd = () => {
        const addNewQuestion = () => {
            let error = 0;
            if (question === '') {
                error = 1;
                setErrorMessageQ('Campo vuoto, inserire una domanda!');
            }
            if (type === "C" && optionList.length === 0) {
                error = 1;
                setErrorMessageO('Devi inserire almeno una risposta!');
            }
            if (!error) {
                setQuestionList( (oldQuestionList) => [...oldQuestionList, { question: question, type: type, min: min, max: max, isOptional: isOptional, optionList: optionList }]);
                setErrorMessageL('');
                undoNewQuestion();
            }
        }

        return (<div className="div-survey p-2 d-flex align-items-center">
            <Button className="p-3 h-100 w-50 align-middle d-flex align-items-baseline" variant="outline-warning" onClick={() => addNewQuestion()}>
                <span className="m-auto">
                    Aggiungi
                </span>
            </Button>
        </div>);
    }

    useEffect( () => {
        if (min > max)
            setMin(max);
    }, [max, min])

    useEffect( () => {
        if(max > optionList.length && max > 1)
            setMax(optionList.length);
    }, [max, optionList.length])

    const HandleTypeNewQuestion = () => {
        return (
            <>
                <div className="p-2 text-center mb-4">
                    <h5 className="text-center">Scegli la tipologia di domanda</h5>
                </div>
                <Row className="justify-content-center">
                    <Col className="col-lg-8 d-flex flex-wrap">
                        <div className="div-survey p-2 d-flex align-items-center">
                            <Button className="p-3 h-100 w-100 align-middle d-flex align-items-baseline" variant={errorMessageL === '' ? "outline-success" : "outline-danger"} onClick={() => setType("A")}>
                                <span className="m-auto">
                                    Nuova Domanda Aperta
                                </span>
                            </Button>
                        </div>
                        <div className="div-survey p-2 d-flex align-items-center">
                            <Button className="p-3 h-100 w-100 align-middle d-flex align-items-baseline" variant={errorMessageL === '' ? "outline-success" : "outline-danger"} onClick={() => setType("C")}>
                                <span className="m-auto">
                                    Nuova Domanda Chiusa
                                </span>
                            </Button>
                        </div>
                    </Col>
                </Row>
            </>
        );
    }

    return (
        <>
            <Row className="justify-content-center">
                <hr className="mb-3"></hr>
                {
                    (type === '') ?
                        <HandleTypeNewQuestion />
                        :
                        <>
                            <div className="p-2 text-center mb-4">
                                <h5 className="text-center">Compila la domanda a risposta aperta</h5>
                            </div>
                            {type === 'A' ?
                                <OpenQuestion question={question} setQuestion={setQuestion} isOptional={isOptional} setIsOptional={setIsOptional} errorMessageQ={errorMessageQ}></OpenQuestion>
                                : <ClosedQuestion question={question} setQuestion={setQuestion} optionList={optionList} setOptionList={setOptionList} min={min} setMin={setMin} max={max} setMax={setMax} errorMessageQ={errorMessageQ} errorMessageO={errorMessageO} setErrorMessageO={setErrorMessageO}></ClosedQuestion>}
                            <Row className="justify-content-center">
                                <Col className="col-lg-8 d-flex flex-wrap">
                                    <ButtonUndo></ButtonUndo>
                                    <ButtonAdd></ButtonAdd>
                                </Col>
                            </Row>
                        </>
                }
                {errorMessageL !== '' ? <Alert className="w-75" variant='danger'>{errorMessageL}</Alert> : <></>}
                <hr className="mb-3"></hr>
            </Row>
        </>
    )
}

export default NewQuestion;