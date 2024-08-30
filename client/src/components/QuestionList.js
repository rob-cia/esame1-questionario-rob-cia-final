import { useHistory } from "react-router-dom";
import { useState } from 'react';
import { Form, Card, Row, Button, Alert } from 'react-bootstrap/';
import { XLg, CaretUp, CaretDown } from 'react-bootstrap-icons';
import API from "../API";

const arrayMove = require('array-move');

const ButtonSend = (props) => {
    const { name, questionList, setQuestionList, disabled, loggedIn, setDirtyAdminList, handleErrors } = props;
    let history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();
        let error = 0;

        for (const q of questionList) {
            if (q.type === 'A' && !q.isOptional) {
                if (q.openAnswer === '') {
                    q.errorMessageOA = "Campo vuoto, inserire una risposta!";
                    error = 1;
                } else {
                    q.errorMessageOA = "";
                }
            } else if (q.type === "C" && q.min > 0) { // se min vale > 0 significa che è obbligatoria
                if (q.optionList.filter(o => o.isChecked).length < q.min) {
                    q.errorMessageCA = "Numero minimo di campi selezionati non valido!";
                    error = 1;
                } else {
                    q.errorMessageCA = "";
                }
            }
        }

        // aggiorno lo stato per salvare gli errorMessage- incontrati nel questionario
        if (error) {
            setQuestionList([...questionList]);
        }

        // gestione salvataggio e redirect
        if (!error) {
            API.addAnswer(name, questionList)
                .then(() => {
                    if (loggedIn)
                        setDirtyAdminList(true);
                    history.push("/surveys");
                })
                .catch(e => handleErrors(e));
        }
    };

    return (<div className="p-2 d-flex align-items-center justify-content-center w-100">
        <Button type="submit" disabled={disabled} className="p-3 h-100 w-25 align-middle d-flex align-items-baseline" variant="warning" onClick={handleSubmit}>
            <span className="m-auto">
                Invia Sondaggio!
            </span>
        </Button>
    </div>);
}

// usata solo in edit mode
const HandleQuestion = (props) => {
    const { i, questionList, setQuestionList } = props;

    let len = questionList.length;

    const deleteQuestion = (index) => {
        if (index >= 0) {
            setQuestionList((oldQuestionList) => oldQuestionList.filter((q, i) => i !== index));
        }
    }

    const moveUpQuestion = (index, len) => {
        if (index >= 0 && index < len) {
            setQuestionList((oldQuestionList) => arrayMove(oldQuestionList, index, index - 1));
        }
    }

    const moveDownQuestion = (index, len) => {
        if (index >= 0 && index < len) {
            setQuestionList((oldQuestionList) => arrayMove(oldQuestionList, index, index + 1));
        }
    }

    return (
        <>
            {(i !== 0) ? <Button variant="secondary moveUpQuestion" onClick={() => moveUpQuestion(i, len)}><CaretUp /></Button> : <></>}
            <Button variant="danger deleteQuestion" onClick={() => deleteQuestion(i)}><XLg /></Button>
            {(i !== (len - 1)) ? <Button variant="secondary moveDownQuestion" onClick={() => moveDownQuestion(i, len)}><CaretDown /></Button> : <></>}
        </>
    );

}

const BodyOpenAnswer = (props) => {
    const { disabled, q, handleOpenAnswer } = props;

    return (
        <Form.Group className="mb-3" controlId={q.idOption}>
            <Form.Control
                disabled={disabled}
                className={q.errorMessageOA !== '' && !disabled ? "is-invalid" : ""}
                maxLength="200"
                as="textarea"
                rows={3}
                placeholder="scrivi la risposta..."
                value={q.openAnswer}
                onChange={ev => handleOpenAnswer(ev.target.value)} />
            <Form.Control.Feedback type="invalid">
                {q.errorMessageOA}
            </Form.Control.Feedback>
        </Form.Group>
    );
}

const BodyClosedAnswer = (props) => {
    const { q, disabled, isAdmin, disabledCheckbox, handleClosedAnswer } = props;

    return (
        <Row className="list-group">
            {
                q.optionList.map((o, i) => {
                    return (<Form.Group key={i} controlId={"formBasicCheckbox" + i} className={"list-group-item"} >
                        {isAdmin ?
                            <Form.Check
                                isInvalid={q.errorMessageCA !== '' && !disabled ? true : false}
                                type="checkbox"
                                disabled={disabled || (disabledCheckbox && !o.isChecked)}
                                label={o.option}
                                checked={o.isChecked}
                                value={o.isChecked}
                                onChange={() => handleClosedAnswer(i)}
                            />
                            :
                            <Form.Check
                                isInvalid={q.errorMessageCA !== '' && !disabled ? true : false}
                                type="checkbox"
                                disabled={disabled || (disabledCheckbox && !o.isChecked)}
                                label={o.option}
                                defaultChecked={o.isChecked}
                                value={o.isChecked}
                                onChange={() => handleClosedAnswer(i)}
                            />}
                    </Form.Group>
                    );
                })
            }
            {q.errorMessageCA !== '' && !disabled ? <Alert className="mt-2 w-100" variant='danger'>{q.errorMessageCA}</Alert> : <></>}
        </Row>
    );
}

const Question = (props) => {
    const { q, i, questionList, setQuestionList, editMode, disabled, isAdmin } = props;

    const [disabledCheckbox, setDisabledCheckbox] = useState(false);

    const handleOpenAnswer = (val) => {
        q.openAnswer = val;
        setQuestionList([...questionList]);
    }

    const handleClosedAnswer = (index) => {
        q.optionList[index].isChecked = !q.optionList[index].isChecked;

        // gestione vincolo max
        if (q.optionList.filter(o => o.isChecked).length >= q.max)
            setDisabledCheckbox(true);
        else
            setDisabledCheckbox(false);

        setQuestionList([...questionList]);
    }

    return (
        <Row className="p-2 justify-content-center"  >
            <Card border="success" className="cardDim" style={{ position: "relative" }}>
                {editMode ? <HandleQuestion i={i} questionList={questionList} setQuestionList={setQuestionList} /> : <></>}
                <Card.Header><Card.Title>{q.question}</Card.Title></Card.Header>
                <Card.Body>
                    {q.type === 'A' ?
                        <BodyOpenAnswer
                            q={q}
                            handleOpenAnswer={handleOpenAnswer}
                            disabled={disabled} />
                        : <BodyClosedAnswer
                            q={q}
                            handleClosedAnswer={handleClosedAnswer}
                            disabled={disabled}
                            isAdmin={isAdmin}
                            disabledCheckbox={disabledCheckbox} />
                    }
                </Card.Body>
                <Card.Footer className="text-muted">{
                    (q.type === "C") ?
                        ((q.min >= 1) ?
                            " - Obbligatoria - № minimo: " + q.min + " - "
                            : "- Opzionale - ")
                        + "№ massimo: " + q.max
                        : (q.isOptional) ?
                            "- Risposta aperta opzionale -"
                            : "- Risposta aperta obbligatoria -"}
                </Card.Footer>
            </Card>
        </Row>
    )
}

const QuestionList = (props) => {
    const { name, title, questionList, setQuestionList, preview, editMode, disabled, isAdmin, loggedIn, setDirtyAdminList, handleErrors } = props;

    return (
        <Row className={"justify-content-center " + (preview ? "preview" : "")}>
            <Row className="p-2 text-center mb-4">
                <h3>{title}</h3>
            </Row>
            {
                questionList.map((q, i) => {
                    return (<Question
                        key={i}
                        q={q}
                        i={i}
                        questionList={questionList}
                        setQuestionList={setQuestionList}
                        editMode={editMode}
                        disabled={disabled}
                        isAdmin={isAdmin} />
                    );
                })
            }
            <ButtonSend
                name={name}
                questionList={questionList}
                setQuestionList={setQuestionList}
                disabled={disabled}
                loggedIn={loggedIn}
                setDirtyAdminList={setDirtyAdminList}
                handleErrors={handleErrors} />
        </Row>
    )
}

export default QuestionList;