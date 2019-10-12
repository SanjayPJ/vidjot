const express = require('express')
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');

const app = express()
const port = 3000

mongoose.connect('mongodb://localhost/vidjot', { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

require('./models/Idea');
const Idea = mongoose.model("Ideas");

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/about', function (req, res) {
  res.render('about');
});

app.listen(port, () => console.log(`Server started on port ${port}!`))