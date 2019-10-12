const express = require('express')
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const flash = require('connect-flash');
const session = require('express-session')

const app = express()
const port = 3000

mongoose.connect('mongodb://localhost/vidjot', { useNewUrlParser: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

require('./models/Idea');
const Idea = mongoose.model("Ideas");

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(methodOverride('_method'))

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', function(req, res) {
    res.render('home');
});

app.put('/ideas/:id', function(req, res) {
    Idea.updateOne({ _id: req.params.id }, { title: req.body.title, details: req.body.details }).then(() => {
        req.flash('success_msg', 'Idea updated successfully');
        res.redirect('/ideas');
    });
});

app.delete('/ideas/:id', function(req, res) {
    Idea.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('error_msg', 'Idea deleted successfully')
        res.redirect('/ideas');
    });
});

app.get('/ideas', function(req, res) {
    Idea.find({})
        .sort({ date: 'desc' }).then(ideas => {
            res.render('index', {
                ideas: ideas
            });
        });
});

app.get('/ideas/edit/:id', (req, res) => {
    Idea.findById(req.params.id).then(idea => {
        res.render('edit', {
            idea: idea
        });
    });
})

app.post('/ideas', function(req, res) {
    let errors = [];

    if (!req.body.title) {
        errors.push({ text: 'Title is required.' })
    }

    if (!req.body.details) {
        errors.push({ text: 'Details is required.' })
    }

    if (errors.length > 0) {
        res.render('add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        })
    } else {
        let newIdea = new Idea({
            title: req.body.title,
            details: req.body.details
        })

        newIdea.save((err) => {
            if (err) return handleError(err);
            req.flash('success_msg', 'Idea inserted successfully')
            res.redirect('/ideas');
        })
    }
})

app.get('/about', function(req, res) {
    res.render('about');
});

app.get('/ideas/add', function(req, res) {
    res.render('add');
});

app.listen(port, () => console.log(`Server started on port ${port}!`))