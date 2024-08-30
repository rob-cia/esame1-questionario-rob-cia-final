/**
 * All the API calls
 */

//  import { TaskList, Task } from './MyData.js';

const BASEURL = '/api';

function getSurveyList() {
    // call: GET /api/surveys
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/surveys')
            .then((response) => {
                if (response.ok) {
                    response.json()
                        .then(json => resolve(json))
                        .catch(err => reject({ error: "Cannot parse server response" }))
                } else {
                    // analyze the cause of error
                    response.json()
                        .then((obj) => { reject(obj); }) // error msg in the response body
                        .catch(err => reject({ error: "Cannot parse server response" })) // something else
                }
            })
            .catch(err => reject({ error: "Cannot communicate" })) // connection error
    });
}

function getQuestionList(idSurvey) {
    //GET /api/surveys/<idsurvey>
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/surveys/' + idSurvey)
            .then((response) => {
                if (response.ok) {
                    response.json()
                        .then(json => resolve(json))
                        .catch(err => reject({ error: "Cannot parse server response" }))
                } else {
                    // analyze the cause of error
                    response.json()
                        .then((obj) => { reject(obj); }) // error msg in the response body
                        .catch(err => reject({ error: "Cannot parse server response" })) // something else
                }
            })
            .catch(err => reject({ error: "Cannot communicate" })) // connection error
    });
}

/* AREA RISERVATA */

async function logIn(credentials) {
    let response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    }
    else {
        try {
            const errDetail = await response.json();
            throw errDetail.message;
        }
        catch (err) {
            throw err;
        }
    }
}

async function logOut() {
    await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
    const response = await fetch(BASEURL + '/sessions/current');
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server, mostly unauthenticated user
    }
}

function getAdminSurveyList(idAdmin) {
    // call: GET /api/administrators/<idadmin>/surveys
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/administrators/' + idAdmin + '/surveys')
            .then((response) => {
                if (response.ok) {
                    response.json()
                        .then(json => resolve(json))
                        .catch(err => reject({ error: "Cannot parse server response" }))
                } else {
                    // analyze the cause of error
                    response.json()
                        .then((obj) => { reject(obj); }) // error msg in the response body
                        .catch(err => reject({ error: "Cannot parse server response" })) // something else
                }
            })
            .catch(err => reject({ error: "Cannot communicate" })) // connection error
    });
}

function getAdminQuestionList(idAdmin, idSurvey) {
    //GET /api/administrators/<idadmin>/surveys/<idsurvey>
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/administrators/' + idAdmin + '/surveys/' + idSurvey)
            .then((response) => {
                if (response.ok) {
                    response.json()
                        .then(json => resolve(json))
                        .catch(err => reject({ error: "Cannot parse server response" }))
                } else {
                    // analyze the cause of error
                    response.json()
                        .then((obj) => { reject(obj); }) // error msg in the response body
                        .catch(err => reject({ error: "Cannot parse server response" })) // something else
                }
            })
            .catch(err => reject({ error: "Cannot communicate" })) // connection error
    });
}

function addSurvey(idAdmin, title, questionList) {
    //POST /api/surveys
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/surveys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idAdmin: idAdmin, title: title, questionList: questionList }),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch(err => reject({ error: "Cannot parse server response" })) // something else
            }
        })
            .catch(err => reject({ error: "Cannot communicate" })) // connection error
    });
}

function addAnswer(name, questionList) {
    //POST /api/answers
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name, questionList: questionList }),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch(err => reject({ error: "Cannot parse server response" })) // something else
            }
        })
            .catch(err => reject({ error: "Cannot communicate" })) // connection error
    });
}


const API = { getSurveyList, getQuestionList, logIn, logOut, getUserInfo, getAdminSurveyList, getAdminQuestionList, addSurvey, addAnswer };
export default API;
