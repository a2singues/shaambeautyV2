const express =  require('express');
const path    =  require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

//const credentials = require('./credentials')

const app = express();

//const formidable = require('formidable');

//const dbsqlite = require('./datapersist/dbsqlite');

const customerControler = require('./controllers/customer');

/*--- Views engine ---*/
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

/*--- Application paths ---*/
app.use(express.static(__dirname + '/public'));

app.use('/ncss', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/ncss', express.static(path.join(__dirname, 'node_modules/bootstrap-datetime-picker/css')))
app.use('/ncss', express.static(path.join(__dirname, 'node_modules/bootstrap-themes/dist')))
//app.use('/ncss', express.static(path.join(__dirname, 'node_modules/jquery/dist/css')))
app.use('/njs', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/njs', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/njs', express.static(path.join(__dirname, 'node_modules/bootstrap-datetime-picker/js')))
app.use('/njs', express.static(path.join(__dirname, 'node_modules/moment/')))
//app.use('/njs', express.static(path.join(__dirname, 'node_modules/moment/min')))

// parse application/json
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('port', process.env.PORT || 3300);

/*=== REST endpoints ===*/
/*--- App home (empty path)---*/
app.get('/', function(req, res) {
	res.redirect('home');
});

/*--- App home ---*/
 app.get('/home', customerControler.getHome);

/*--- Booking ---*/
app.get('/booking', customerControler.getBooking);
app.post('/booking', customerControler.postBooking);
app.get('/deleteBooking/:id/:phone', customerControler.getDeleteBooking);
//app.post('/deleteBooking', customerControler.postDeleteBooking);

/*--- Customer bookings list ---*/
app.get('/customerbookings/:customerphone', customerControler.getCustomerBookings);

/*--- Display customer bookings list ---*/
app.get('/mybookings', customerControler.getMyBookings);
app.post('/mybookings', customerControler.postMyBookings);
app.get('/viewmybookings/:phonenumber', customerControler.viewMyBookings);
app.post('/updateBooking', customerControler.postUpdateBooking);
//app.get('/updateSelectedBooking', customerControler.postUpdateBooking);

/*--- Photos gallery ---*/
app.get('/showGallery', customerControler.showGallery);
app.get('/showGalleryNext/:imgnum', customerControler.showGalleryNext);
app.get('/showGalleryPrevious/:imgnum', customerControler.showGalleryPrev);

/*--- Get customer phone number ---*/
app.post('/getPhoneNumber', customerControler.postPhoneNumber);

/*--- Get customer email ---*/
app.post('/getEmail', customerControler.getEMail);

/*=== Start the server ===*/
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' +  app.get('port') + '; press Ctrl-C to terminate.' );
});
