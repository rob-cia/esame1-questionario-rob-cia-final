'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const dao = require('./dao'); // module for accessing the DB
const { check, validationResult } = require('express-validator'); // validation middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const adminDao = require('./admin-dao'); // module for accessing the administrator in the DB


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    adminDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  adminDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // Format express-validate errors as strings
  return `${location}[${param}]: ${msg}`;
};

// init express
const app = new express();
const port = 3001;

//setup middlewares here
app.use(morgan('dev'));
app.use(express.json());

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());



/***** APIs *****/

//GET /api/surveys
app.get('/api/surveys',
  async (req, res) => {
    try {
      const result = await dao.listSurvey();
      if (result.error)
        res.status(404).json(result);
      else
        res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'DB error' });
    }
  }
);

//GET /api/surveys/<idsurvey>
app.get('/api/surveys/:idsurvey',
  [check('idsurvey').isInt({ min: 1 })],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    try {
      let questionList = [];
      let questions = await dao.listSurveyById(req.params.idsurvey);
      if (questions.error) {
        res.status(404).json(questions);
      } else {
        for (const q of questions) {
          // for each closed question get option with selected status
          if (q.type === 'C') {
            const options = await dao.listOption(q.idQuestion);
            if (options.error) {
              return res.status(404).json(options);
            }
            q.optionList = [...options];
          }
          questionList.push(q);
        }
        res.json(questionList);
      }
    } catch (err) {
      res.status(500).json({ error: 'DB error' });
    }
  }
);


/*** Users APIs ***/

// Login --> POST /sessions
app.post('/api/sessions',
  [
    check('username').isEmail(),
    check('password').isLength({ min: 6, max: 200 })
  ],
  function (req, res, next) {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);

        // req.user contains the authenticated user, we send all the user info back
        // this is coming from adminDao.getUser()
        return res.json(req.user);
      });
    })(req, res, next);
  });

// Logout --> DELETE /sessions/current 
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated administrator!' });
});

//GET /api/administrators/<idadmin>/surveys
app.get('/api/administrators/:idadmin/surveys',
  isLoggedIn,
  [check('idadmin').isInt({ min: 1 })],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    try {
      let result = await adminDao.listAdminSurvey(req.params.idadmin);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'DB error' });
    }
  });

//GET /api/administrators/<idadmin>/surveys/<idsurvey>
app.get('/api/administrators/:idadmin/surveys/:idsurvey',
  isLoggedIn,
  [
    check('idadmin').isInt({ min: 1 }),
    check('idsurvey').isInt({ min: 1 })
  ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    try {
      let surveyCompiled = [];
      let questionList = [];
      // get id utilizer
      let utilizerList = await adminDao.listUtilizer(req.params.idsurvey);
      if (utilizerList.error) {
        res.status(404).json(utilizerList);
      } else {
        for (const utilizer of utilizerList) {
          // get question of utilizer with openAnwer
          let questions = await adminDao.listQuestionByIdUtilizer(utilizer.idUtilizer);
          if (questions.error) {
            return res.status(404).json(questions);
          } else {
            for (const question of questions) {
              // for each closed question get option with selected status
              if (question.type === 'C') {
                const options = await adminDao.listOptionByIdUtilizer(utilizer.idUtilizer, question.idQuestion);
                if (options.error) {
                  return res.status(404).json(options);
                }
                question.optionList = [...options];
              }
              questionList.push(question);
            }
            surveyCompiled.push({ utilizer: utilizer, questionList: questionList });
            questionList = [];
          }
        }
        res.json(surveyCompiled);
      }
    } catch (err) {
      res.status(500).json({ error: 'DB error' });
    }
  });

//POST /api/surveys
app.post('/api/surveys',
  isLoggedIn,
  [
    check('idAdmin').isInt({ min: 1 }),
    check('title').isLength({ min: 1, max: 200 }),
    check('questionList.*.isOptional').isBoolean(),
    check('questionList.*.max').isInt({ min: 0, max: 10 }),
    check('questionList.*.min').isInt({ min: 0, max: 10 }),
    check('questionList.*.question').isLength({ min: 1 }),
    check('questionList.*.type').isLength({ min: 1, max: 1 }),
    check('questionList.*.optionList.*.option').isLength({ min: 1, max: 200 })
  ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    const survey = {
      idAdmin: req.body.idAdmin,
      title: req.body.title,
      questionList: req.body.questionList.map((q) => {
        if (q.type === 'C') {
          return { question: q.question, type: q.type, min: q.min, max: q.max, optionList: q.optionList.map((o) => { return { option: o.option } }) };
        } else if (q.type === 'A') {
          return { question: q.question, type: q.type, isOptional: q.isOptional };
        }
      })
    };

    try {
      let idSurvey = await adminDao.createSurvey(survey.idAdmin, survey.title);
      for (const question of survey.questionList) {
        let idQuestion;
        if (question.type === 'A') {
          idQuestion = await adminDao.createQuestion(question.question, idSurvey, question.type, 0, 0, question.isOptional);
        } else if (question.type === 'C') {
          idQuestion = await adminDao.createQuestion(question.question, idSurvey, question.type, question.min, question.max, 0);
          for (const option of question.optionList) {
            await adminDao.createOption(option, idQuestion);
          }
        }
      }
      res.status(201).end();
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new survey` });
    }

  });

//POST /api/answers
app.post('/api/answers',
  [
    check('name').isLength({ min: 1, max: 200 }),
    check('questionList.*.idQuestion').isInt({ min: 0 }),
    check('questionList.*.idSurvey').isInt({ min: 0 }),
    check('questionList.*.type').isLength({ min: 1, max: 1 }),
    check('questionList.*.optionList.*.idOption').isInt({ min: 0 }),
    check('questionList.*.optionList.*.isChecked').isBoolean()
  ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    const survey = {
      name: req.body.name,
      questionList: req.body.questionList.map((q) => {
        if (q.type === 'C') {
          return { idSurvey: q.idSurvey, idQuestion: q.idQuestion, type: q.type, optionList: q.optionList.map((o) => { return { idOption: o.idOption, isChecked: o.isChecked } }) };
        } else if (q.type === 'A') {
          return { idSurvey: q.idSurvey, idQuestion: q.idQuestion, type: q.type, openAnswer: q.openAnswer };
        }
      })
    };

    try {
      let idUtilizer = await adminDao.createUtilizer(survey.name);
      for (const question of survey.questionList) {
        if (question.type === 'C') {
          for (const option of question.optionList) {
            await adminDao.createAnswer(idUtilizer, question.idSurvey, question.idQuestion, option.idOption, option.isChecked, "");
          }
        } else if (question.type === 'A') {
          await adminDao.createAnswer(idUtilizer, question.idSurvey, question.idQuestion, "", "", question.openAnswer);
        }
      }
      res.status(201).end();
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new answer` });
    }

  });


/*** Other express-related instructions ***/

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});