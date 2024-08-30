'use strict';

// open the database
const db = require('./db');

//get all surveys
exports.listSurvey = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM survey';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows.length) {
                const surveys = rows.map((e) =>
                ({
                    idSurvey: e.IdSurvey,
                    title: e.Title,
                    idAdmin: e.IdAdmin
                }));
                resolve(surveys);
            } else {
                resolve({ error: 'Surveys not found or empty.' });
            }
        })
    });
};

//get question of survey by IdSurvey
exports.listSurveyById = (idSurvey) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT survey.IdSurvey, IdQuestion, Question, Type, Min, Max, IsOptional FROM survey LEFT JOIN question on survey.IdSurvey = question.IdSurvey WHERE survey.IdSurvey = ?';
        db.all(sql, [idSurvey], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows.length) {
                const questionList = rows.map((e) =>
                ({
                    idSurvey: e.IdSurvey,
                    idQuestion: e.IdQuestion,
                    question: e.Question,
                    type: e.Type,
                    min: e.Min,
                    max: e.Max,
                    isOptional: e.IsOptional,
                    openAnswer: "",
                    errorMessageOA: "",
                    errorMessageCA: ""
                }));
                resolve(questionList);
            } else {
                resolve({ error: 'Survey not found.' });
            }
        });
    });
};

//get option of question by IdQuestion
exports.listOption = (idQuestion) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT IdOption, Option FROM option WHERE IdQuestion = ?';
        db.all(sql, [idQuestion], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows.length) {
                const optionList = rows.map((e) =>
                ({
                    idOption: e.IdOption,
                    option: e.Option,
                    isChecked: false
                }));
                resolve(optionList);
            } else {
                resolve({ error: 'Option not found.' });
            }
        });
    });
};