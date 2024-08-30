import { Col, Row } from 'react-bootstrap/';
import { Link } from 'react-router-dom';

const MenuAdmin = () => {

    return (
        <>
            <Row className="justify-content-center">
                <div className="p-2 text-center mb-4">
                    <h3 className="text-center">Benvenuto nell'area riservata!</h3>
                    <hr className="mb-3"></hr>
                </div>
                <Col className="col-lg-8 d-flex flex-wrap">
                    <div className="div-survey p-2 d-flex align-items-center">
                        <Link to={"/cms/menu/newsurvey"} className="btn btn-outline-warning p-3 h-100 w-100 align-middle d-flex align-items-baseline">
                            <span className="m-auto">
                                Nuovo Questionario
                            </span>
                        </Link>
                    </div>
                    <div className="div-survey p-2 d-flex align-items-center">
                        <Link to={"/cms/menu/viewsurveys"} className="btn btn-outline-info p-3 h-100 w-100 align-middle d-flex align-items-baseline">
                            <span className="m-auto">
                                Visualizza Questionari
                            </span>
                        </Link>
                    </div>
                </Col>
            </Row>
        </>
    )
}

export default MenuAdmin;