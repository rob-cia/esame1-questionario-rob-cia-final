'use strict';
/* Data Access Object (DAO) module for accessing administrators */

const db = require('./db');
const bcrypt = require('bcrypt');

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM administrator WHERE IdAdmin = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'Administrator not found.' });
      else {
        // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
        const user = { id: row.IdAdmin, username: row.email, name: row.name }
        resolve(user);
      }
    });
  });
};

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM administrator WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined) {
        resolve(false);
      }
      else {
        const user = { id: row.IdAdmin, username: row.email, name: row.name };
        // check the hashes with an async call, given that the operation may be CPU-intensive (and we don't want to block the server)
        bcrypt.compare(password, row.hash).then(result => {
          if (result)
            resolve(user);
          else
            resolve(false);
        });
      }
    });
  });
};

//get survey of admin by IdAdmin
exports.listAdminSurvey = (IdAdmin) => {
  return new Promise((resolve, reject) => {
    // const sql = 'select IdSurvey, Title, administrator.IdAdmin from survey join administrator on survey.IdAdmin = administrator.IdAdmin where administrator.IdAdmin = ?';
    const sql = ' select distinct survey.IdSurvey, survey.Title, administrator.IdAdmin, count(IdAnswer) over(partition by answer.IdSurvey) as NumCompiled ' +
      ' from survey ' +
      ' left join answer on survey.IdSurvey = answer.IdSurvey ' +
      ' left join administrator on survey.IdAdmin = administrator.IdAdmin ' +
      ' where administrator.IdAdmin = ? ' +
      ' group by survey.IdSurvey, answer.IdUtilizer '
    db.all(sql, [IdAdmin], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows.length) {
        const surveyList = rows.map((e) => ({ idSurvey: e.IdSurvey, title: e.Title, idAdmin: e.IdAdmin, numCompiled: e.NumCompiled }));
        resolve(surveyList);
      } else {
        resolve({ error: 'Admin - Surveys not found or empty.' });
      }
    });
  });
};

//get option of question by IdUtilizer and IdQUestion
exports.listOptionByIdUtilizer = (idUtilizer, idQuestion) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answer.IdOption, Option, Selected FROM answer JOIN option ON answer.IdOption = option.IdOption WHERE answer.IdUtilizer = ? AND answer.IdQuestion = ?';
    db.all(sql, [idUtilizer, idQuestion], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows.length) {
        const optionList = rows.map((e) => ({ idOption: e.IdOption, option: e.Option, isChecked: e.Selected == 1 ? true : false }));
        resolve(optionList);
      } else {
        resolve({ error: 'Admin - Option not found.' });
      }
    });
  });
};

//get question
exports.listQuestionByIdUtilizer = (idUtilizer) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT DISTINCT answer.IdSurvey, answer.IdQuestion, Question, Type, Min, Max, IsOptional, FreeText FROM answer JOIN question on answer.IdQuestion = question.IdQuestion WHERE answer.IdUtilizer = ?';
    db.all(sql, [idUtilizer], (err, rows) => {
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
          openAnswer: e.FreeText
        }));
        resolve(questionList);
      } else {
        resolve({ error: 'Admin - Question not found.' });
      }
    });
  });
};

//get utilizer list
exports.listUtilizer = (idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT IdUtilizer, Name FROM utilizer WHERE IdUtilizer IN (SELECT DISTINCT IdUtilizer FROM answer WHERE IdSurvey = ?)';
    db.all(sql, [idSurvey], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows.length) {
        const utilizerList = rows.map((e) =>
        ({
          idUtilizer: e.IdUtilizer,
          name: e.Name
        }));
        resolve(utilizerList);
      } else {
        resolve({ error: 'Admin - Utilizer not found.' });
      }
    });
  });
};

//add a new option
exports.createOption = (option, idQuestion) => {
  return new Promise((resolve, reject) => {

    const sql = 'INSERT INTO option(Option, IdQuestion) VALUES(?, ?)';

    db.run(sql, [option.option, idQuestion], function (err) {
      if (err) {
        reject(err);
      }

      resolve(this.lastID);
    });
  });
};

//add a new question
exports.createQuestion = (question, idSurvey, type, min, max, isOptional) => {
  return new Promise((resolve, reject) => {

    const sql = 'INSERT INTO question(Question, IdSurvey, Type, Min, Max, IsOptional) VALUES(?, ?, ?, ?, ?, ?)';

    db.run(sql, [question, idSurvey, type, min, max, isOptional], function (err) {
      if (err) {
        reject(err);
      }

      resolve(this.lastID);
    });
  });
};

//add a new survey
exports.createSurvey = (idAdmin, title) => {
  return new Promise((resolve, reject) => {

    const sql = 'INSERT INTO survey(Title, IdAdmin) VALUES(?, ?)';

    db.run(sql, [title, idAdmin], function (err) {
      if (err) {
        reject(err);
      }

      resolve(this.lastID);
    });
  });
};

//add a new answer
exports.createAnswer = (idUtilizer, idSurvey, idQuestion, idOption, isChecked, openAnswer) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO answer(IdUtilizer, IdSurvey, IdQuestion, IdOption, Selected, FreeText) VALUES(?, ?, ?, ?, ?, ?)';

    db.run(sql, [idUtilizer, idSurvey, idQuestion, idOption, isChecked, openAnswer], function (err) {
      if (err) {
        reject(err);
      }

      resolve(this.lastID);
    });
  });
};

//add a new utilizer
exports.createUtilizer = (name) => {
  return new Promise((resolve, reject) => {

    const sql = 'INSERT INTO utilizer(Name) VALUES(?)';

    db.run(sql, [name], function (err) {
      if (err) {
        reject(err);
      }

      resolve(this.lastID);
    });
  });
};
