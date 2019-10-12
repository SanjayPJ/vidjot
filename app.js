const express = require('express')
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var methodOverride = require('method-override')

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

app.get('/', function(req, res) {
    res.render('home');
});

app.put('/ideas/:id', function(req, res) {
    Idea.findOne({
            _id: req.params.id
        })
        .then(idea => {
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save().then(idea => {
                res.redirect('/ideas');
            });
        })
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