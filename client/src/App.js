import { React, useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Container, Row, Toast } from 'react-bootstrap/';

import Navigation from './components/Navigation';
import SurveyList from './components/SurveyList';
import PageQuestionList from './components/PageQuestionList';
import { LoginForm } from './components/Login';
import MenuAdmin from './components/MenuAdmin';
import PageCreateSurvey from './components/PageCreateSurvey';

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import API from './API';

const App = () => {
  const [surveyList, setSurveyList] = useState([]);

  const [message, setMessage] = useState({ msg: '', type: 'danger' });

  const [admin, setAdmin] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  const [adminSurveyList, setAdminSurveyList] = useState([]);

  const [dirtyList, setDirtyList] = useState(true);
  const [dirtyAdminList, setDirtyAdminList] = useState(true);

  // check if admin is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the admin info, if already logged in
        const admin = await API.getUserInfo();
        setAdmin(admin);
        setLoggedIn(true);
      } catch (err) {
        console.log(err.error); // mostly unauthenticated user
      }
    };
    checkAuth();
  }, []);

  // carico l'elenco dei questionari all'avvio dell'applicazione
  useEffect(() => {
    if (dirtyList)
      API.getSurveyList()
        .then(surveyList => {
          setSurveyList(surveyList);
          setDirtyList(false);
        })
        .catch(e => handleErrors(e));
  }, [dirtyList]);

  // carico l'elenco dei questionari dell'amministratore ad utente loggato
  useEffect(() => {
    if (loggedIn && dirtyAdminList)
      API.getAdminSurveyList(admin.id)
        .then(adminSurveyList => {
          setAdminSurveyList(adminSurveyList);
          setDirtyAdminList(false);
        })
        .catch(e => handleErrors(e));
  }, [loggedIn, admin.id, dirtyAdminList]);

  // show error message in toast
  const handleErrors = (err) => {
    setMessage({ msg: err.error, type: 'danger' });
    console.log(err);
  }

  /* AREA RISERVATA */

  const doLogIn = async (credentials) => {
    try {
      const admin = await API.logIn(credentials);
      // mantiene la dipendenza nello useEffect admin, altrimenti effettua 2 chiamate
      setAdmin(admin);
      setLoggedIn(true);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  }

  const doLogOut = async () => {
    await API.logOut();
    // clean up everything
    setLoggedIn(false);
    setAdminSurveyList([]);
    setDirtyList(true);
    setDirtyAdminList(true);
    setAdmin({});
  }

  return (
    <>
      <Router>
        <Row>
          <Navigation loggedIn={loggedIn} logout={doLogOut} admin={admin} />
        </Row>

        <Container fluid>

          <Row className="justify-content-center">

            <Toast className="text-center m-5" show={message.msg !== ''} onClose={() => setMessage({ msg: '', type: 'danger' })} delay={3000} autohide >
              <Toast.Body>{message?.msg}</Toast.Body>
            </Toast>

            <Switch>

              <Route path={"/surveys/:idsurvey"} render={() =>
                <PageQuestionList
                  disabled={false}
                  preview={false}
                  isAdmin={false}
                  admin={admin}
                  surveyList={surveyList}
                  loggedIn={loggedIn}
                  setDirtyAdminList={setDirtyAdminList}
                  handleErrors={handleErrors} />
              } />

              <Route path={"/surveys"} render={() =>
                <SurveyList
                  loggedIn={false}
                  surveyList={surveyList} />
              } />
              <Route path="/cms/login" render={() =>
                loggedIn ? <Redirect to="/cms/menu" /> : <LoginForm login={doLogIn} />
              } />

              {
                loggedIn ?
                  <>
                    <Switch>

                      <Route path={"/cms/menu/newsurvey"} render={() =>
                        <PageCreateSurvey
                          admin={admin}
                          setDirtyList={setDirtyList}
                          setDirtyAdminList={setDirtyAdminList}
                          handleErrors={handleErrors} />
                      } />

                      <Route path={"/cms/menu/viewsurveys/:idsurvey"} render={() =>
                        <PageQuestionList
                          disabled={true}
                          preview={false}
                          isAdmin={true}
                          admin={admin}
                          loggedIn={loggedIn}
                          surveyList={adminSurveyList}
                          handleErrors={handleErrors} />
                      } />

                      <Route path={"/cms/menu/viewsurveys"} render={() =>
                        <SurveyList
                          loggedIn={loggedIn}
                          surveyList={adminSurveyList} />
                      } />

                      <Route path={"/cms/menu"} render={() =>
                        <MenuAdmin></MenuAdmin>
                      } />

                    </Switch>
                  </>
                  :
                  <Route render={() =>
                    <Redirect to="/surveys" />
                  } />
              }

            </Switch>
          </Row>
        </Container>
      </Router>
    </>
  );

}

export default App;
