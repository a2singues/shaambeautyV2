const dbsqlite = require('../datapersist/dbsqlite');

var dbInitRet = dbsqlite.initDb();
console.log('@@ DB init: ret='+dbInitRet);

var galleryImages = "[" +
		"{\"num\":0, \"txt\":\"Vitrine SHAA'M Beauty et entrée du salon\"}," +
		"{\"num\":1, \"txt\":\"Entrée du salon de coiffure\"}," +
		"{\"num\":2, \"txt\":\"Salle principale du salon de coiffure\"}," +
		"{\"num\":3, \"txt\":\"Salle d'onglerie du salon de coiffure\"}," +
		"{\"num\":4, \"txt\":\"Poste de pédicure du salon de coiffure\"}," +
		"{\"num\":5, \"txt\":\"Poste d'accueil du salon de coiffure\"}," +
		"{\"num\":6, \"txt\":\"Coin boutique du salon de coiffure\"}," +
		"{\"num\":7, \"txt\":\"Postes de travail du salon de coiffure\"}," +
		"{\"num\":8, \"txt\":\"Poste de pédicure du salon de coiffure\"}," +
		"{\"num\":9, \"txt\":\"Coin boutique du salon de coiffure\"}," +
		"{\"num\":10, \"txt\":\"Sièges d'attente et coin boutique du salon de coiffure\"}," +
		"{\"num\":11, \"txt\":\"Equipement de coiffure d'un poste de travail du salon de coiffure\"}," +
		"{\"num\":12, \"txt\":\"Postes de travail vus de dos\"}," +
		"{\"num\":13, \"txt\":\"Postes de travail du salon de coiffure\"}," +
		"{\"num\":14, \"txt\":\"Salle principale vue du fond du salon\"}," +
		"{\"num\":15, \"txt\":\"Salle d'onglerie du salon de coiffure\"}," +
		"{\"num\":16, \"txt\":\"Coiffures afro\"}" +
		"]";
var galleryImgesObj = JSON.parse(galleryImages);

/*=========================
show the home page
==========================*/
exports.getHome = (req, res, next) => {
	console.log('@@ HOME/Body: '+JSON.stringify(req.body));

	// console.log('@@ HOME/Session: '+JSON.stringify(req.session));
	// if (req.session.connectedUser){
	// 	res.render('home', {itemACC:1, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}, csrf: 'CSRF token goes here' });
	// }
	// else {
	// 	req.session.destroy();

	// 	res.render('home', {itemACC:1, csrf: 'CSRF token goes here' });
    // }
    
    res.render('home', {itemACC:1, csrf: 'CSRF token goes here' });
}

/*=======================
Booking
==========================*/
/*---Booking page ---*/
exports.getBooking = (req, res, next) => {
	console.log('@@ BOOKING/Body: '+JSON.stringify(req.body));

    res.render('booking', {itemCBO:1, csrf: 'CSRF token goes here' });
}

/*--- Booking ---*/
exports.postBooking = (req, res, next) => {
    console.log("@@ postBooking/Body="+JSON.stringify(req.body));
    let fbdArr = req.body.bookingdate.split("-");
    let bookDate = fbdArr[2]+"/"+fbdArr[1]+"/"+fbdArr[0];
    
    let bookTime = req.body.bookingtime
    if (bookTime.split(":").length < 3)
        bookTime += ":00";

    //console.log("@@ postBooking: phonenumber="+req.body.phonenumber+", email="+req.body.email+", bookingdate="+req.body.bookingdate+", bookingtime="+req.body.bookingtime);
    console.log("@@ postBooking: phonenumber="+req.body.phonenumber+", email="+req.body.email+", bookingdate="+bookDate+", bookingtime="+bookTime);

    dbsqlite.getOrAddCustomer(req.body.phonenumber, req.body.email, (err)=> {
        if (err) {
            console.log("*** Erreur: "+err);
            res.render('booking', {itemCBO:1, err: 'Erreur relative à votre téléphone',csrf: 'CSRF token goes here' });
        }
        else {
            console.log("## Customer OK");
            dbsqlite.isBookingExists(req.body.phonenumber, bookDate, bookTime, (err, found)=> {
                if (err) {
                    console.log("*** "+err);
                    res.render('booking', {itemCBO:1, err: 'Erreur relative à votre réservation',csrf: 'CSRF token goes here' });
                }
                else {
                    console.log("## Found: "+found);
                    if (! found) {
                        dbsqlite.addBooking(req.body.phonenumber, bookDate, bookTime, (err)=> {
                            if (err) {
                                console.log("*** Error adding booking: "+err);
                                res.render('booking', {itemCBO:1, err: 'Erreur d\'insertion du rendez-vous',csrf: 'CSRF token goes here' });
                            }
                            else {
                                console.log("## Booking added !");

                                /*--- Chargement des réservation du user ---*/
                                dbsqlite.getCustomerBookings(req.body.phonenumber, (err, custBookingsObj)=> {
                                    if (err) {
                                        console.log("*** Erreur: "+err);
                                        res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
                                    }
                                    else {
                                        console.log('@@ getCustomerBookings: Display view ...');
                                        res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber, csrf: 'CSRF token goes here'});
                                   }
                                });
                             } 
                            });
                    }
                    else {
                        res.render('booking', {itemCBO:1, msg: 'Réservation déjà faite',csrf: 'CSRF token goes here' });
                    }
                }
            }); 
        }           
    });
}


/*---Customer bookings list page ---*/
exports.getCustomerBookings = (req, res, next) => {
	console.log('@@ getCustomerBookings: PRM.customerphone='+req.params.customerphone);

    dbsqlite.getCustomerBookings(req.params.customerphone, (err, custBookingsObj)=> {
        if (err) {
            console.log("*** Erreur: "+err);
            res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
        }
        else {
            console.log('@@ getCustomerBookings: Display view ...');
            //let r = "[{\"bookingcount\":1,\"date\":\"12/02/2023\", \"time\":\"12:00:00\"}]"
            //let objR = JSON.parse(r);
            res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.params.customerphone, csrf: 'CSRF token goes here'});
            
/*        if ((rows !== undefined) && (rows !== null) && (rows !== [])) {
                console.log('@@ getCustomerBookings: Display view ...');
                res.render('customerbookings', {itemCBO:1, custbookings:rows, csrf: 'CSRF token goes here'});
            }
            else {
                //res.render('customerbookings/'+req.params.customerphone, {itemCBO:1, csrf: 'CSRF token goes here'});
                return;
            }
*/            
        }
    });
}

/*---My bookings page ---*/
exports.getMyBookings = (req, res, next) => {
	console.log('@@ getMyBookings/Body: '+JSON.stringify(req.body));

    res.render('mybookings', {itemMBO:1, csrf: 'CSRF token goes here' });
}

/*--- My Bookings ---*/
exports.postMyBookings = (req, res, next) => {
	console.log("@@ postMyBookings/Body="+JSON.stringify(req.body));
    console.log("@@ postMyBookings: phonenumber="+req.body.phonenumber+", email="+req.body.email);

    dbsqlite.getCustomerBookings(req.body.phonenumber, (err, custBookingsObj)=> {
        if (err) {
            console.log("*** Erreur: "+err);
            res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
        }
        else {
            console.log('@@ getCustomerBookings: Display view ...');
            res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber, csrf: 'CSRF token goes here'});
        }
    });
}

/*--- My Bookings ---*/
exports.viewMyBookings = (req, res, next) => {
    console.log("@@ viewMyBookings: phonenumber="+req.params.customerphone);

    dbsqlite.getCustomerBookings(req.params.customerphone, (err, custBookingsObj)=> {
        if (err) {
            console.log("*** Erreur: "+err);
            res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
        }
        else {
            console.log('@@ getCustomerBookings: Display view ...');
            res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber, csrf: 'CSRF token goes here'});
        }
    });
}

/*------ Update booking ----*/
exports.postUpdateBooking = (req, res, next) => {
    console.log("@@ postUpdateBooking: BookingId="+req.body.bookingid+", Phone="+req.body.userphone+", bookingdate="+req.body.bookingdate+", bookingtime="+req.body.bookingtime);
    let bDateArr = req.body.bookingdate.split('-');
    let bookDate = bDateArr[2]+'/'+bDateArr[1]+'/'+bDateArr[0];
    let bookTime = req.body.bookingtime;
    if (bookTime.split(':').length < 3)
        bookTime = bookTime+':00';

        console.log("@@ postUpdateBooking: ------------------------- BookingId="+req.body.bookingid+", Phone="+req.body.userphone+", bookDate="+bookDate+", bookTime="+bookTime);

    dbsqlite.isBookingExists(req.body.userphone, bookDate, bookTime, (err, found)=> {
        if (found == true) {
            console.log("### Booking exists: "+err);
            reloadCustomerBookings(req.body.userphone, req, res, 'Réservation déjà effectuée');
        }
        else {
            dbsqlite.updateCustomerBooking(req.body.bookingid, bookDate, bookTime, (err)=> {
                if (err) {
                    console.log("*** Erreur: "+err);
                    reloadCustomerBookings(req.body.userphone, req, res, 'Ereur de mise à jour de la réservation');
                }
                else {
                    reloadCustomerBookings(req.body.userphone, req, res);
                }
            });
        }
    });
}

/*------ Update booking ----
exports.postUpdateBooking = (req, res, next) => {
   // console.log("@@ updateBooking: BookingId="+req.body.bookingid+", Phone="+req.body.phonenumber+", bookingdate="+req.body.bookingdate+", bookingtime="+req.body.bookingtime);
    console.log('@@ postUpdateBooking/Body: '+JSON.stringify(req.body));
    console.log('@@ postUpdateBooking/Phonenumber: '+JSON.stringify(req.body.phonenumber));
    console.log("@@ postUpdateBooking: phonenumber="+JSON.stringify(req.params));
/*
    dbsqlite.getCustomerBookings(req.body.phonenumber, (err, custBookingsObj)=> {
        if (err) {
            console.log("*** Erreur: "+err);
            res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
        }
        else {
            console.log('@@ getCustomerBookings: Display view ...');
            res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber, csrf: 'CSRF token goes here'});
        }
    });
    *
   res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
}
*/

/*------ delete a booking ----
exports.postDeleteBooking = (req, res, next) => {
    // console.log("@@ updateBooking: BookingId="+req.body.bookingid+", Phone="+req.body.phonenumber+", bookingdate="+req.body.bookingdate+", bookingtime="+req.body.bookingtime);
     console.log('@@ postDeleteBooking/Body: '+JSON.stringify(req.body));
     console.log('@@ postDeleteBooking/Phonenumber: '+JSON.stringify(req.body.userphone));
     console.log('@@ postDeleteBooking/Bookingid: '+JSON.stringify(req.body.bookingid));
 
 /*
     dbsqlite.getCustomerBookings(req.body.phonenumber, (err, custBookingsObj)=> {
         if (err) {
             console.log("*** Erreur: "+err);
             res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
         }
         else {
             console.log('@@ getCustomerBookings: Display view ...');
             res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber, csrf: 'CSRF token goes here'});
         }
     });
     *
    //res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
 }
 */

/*------ delete booking ---------*/
exports.getDeleteBooking =(req,res,next)=>{
	console.log('@@ deleteBooking: PRM.Id='+req.params.id);
	console.log('@@ deleteBooking: PRM.phone='+req.params.phone);
	
	//var queryStr = "DELETE FROM booking WHERE bookingcount="+req.params.id;

    /*
	console.log('@@ deleteBooking/Request: queryStr='+queryStr);

	db.mysqlCon.query(queryStr, (err, result) => {
	if (err) {
		console.log("*** updateBooking.Err="+JSON.stringify(err)+" ***");
	}
	else {
		console.log("@@ updateBooking/RESULT="+JSON.stringify(result[0]));
      }
   })
   */

    //res.redirect('/mybookings');
    dbsqlite.deleteCustomerBooking(req.params.id, (err) => {
        if (err) {
            console.log("*** Erreur: "+err);
         }
         reloadCustomerBookings(req.params.phone, req, res);
    })
    
}

//======= Show salon gallery
exports.showGallery =(req,res,next)=>{
	console.log('@@ showGallery: PRM.ImgNum=0');
	
	console.log('@@ showGallery: Session='+JSON.stringify(req.session));
   /*
	if (req.session.connectedUser) {
		if (galleryImgesObj.length > 1)
			res.render('showGallery', {itemGAL:1, moreImg:1, imgnum:0, imgtxt: galleryImgesObj[0].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
		else
			res.render('showGallery', {itemGAL:1, imgnum:0, imgtxt: galleryImgesObj[0].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
	}
	else {
		req.session.destroy();

		if (galleryImgesObj.length > 1)
			res.render('showGallery', {itemGAL:1, moreImg:1, imgnum:0, imgtxt: galleryImgesObj[0].txt});
		else
			res.render('showGallery', {itemGAL:1, imgnum:0, imgtxt: galleryImgesObj[0].txt});
    }
*/      
    if (galleryImgesObj.length > 1)
        res.render('showGallery', {itemGAL:1, moreImg:1, imgnum:0, imgtxt: galleryImgesObj[0].txt});
    else
        res.render('showGallery', {itemGAL:1, imgnum:0, imgtxt: galleryImgesObj[0].txt});

}

//--- Show gallery next image
exports.showGalleryNext =(req,res,next)=>{
	console.log('@@ showGalleryNext: PRM.ImgNum='+req.params.imgnum);
	console.log('@@ showGallery: ImgNum-1='+req.params.imgnum);
	console.log('## showGallery: image number='+galleryImgesObj.length);
   
	var imgNum = parseInt(req.params.imgnum) + 1;

	if (imgNum > (galleryImgesObj.length-1))
		imgNum = (galleryImgesObj.length-1);

	console.log('@@ showGallery: ImgNum-2='+imgNum);
	/*
	if (req.session.connectedUser) {
		if (imgNum < (galleryImgesObj.length-1))
			res.render('showGallery', {itemGAL:1, extImg:1, moreImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
		else
			res.render('showGallery', {itemGAL:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
	}
	else {
		req.session.destroy();

		if (imgNum < (galleryImgesObj.length-1))
			res.render('showGallery', {itemGAL:1, extImg:1, moreImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
		else {
			res.render('showGallery', {itemGAL:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
		}
    }
    */
    if (imgNum < (galleryImgesObj.length-1))
        res.render('showGallery', {itemGAL:1, extImg:1, moreImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
    else 
        res.render('showGallery', {itemGAL:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
}

//--- Show gallery previous image
exports.showGalleryPrev =(req,res,next)=>{
	console.log('@@ showGalleryPrev: PRM.ImgNum='+req.params.imgnum);
	
	console.log('@@ showGallery: ImgNum-1='+req.params.imgnum);
   
	var imgNum = parseInt(req.params.imgnum) - 1;
	if (imgNum < 0)
		imgNum = 0;

	console.log('@@ showGallery: ImgNum-2='+imgNum);
    
    /*
	if (req.session.connectedUser) {
		if (imgNum > 0) {
			if (galleryImgesObj.length > 1)
				res.render('showGallery', {itemGAL:1, extImg:1, moreImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
			else
				res.render('showGallery', {itemGAL:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
		}
		else {
			if (galleryImgesObj.length > 1)
				res.render('showGallery', {itemGAL:1, moreImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
			else
				res.render('showGallery', {itemGAL:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt, user: {name: req.session.connectedUser.name, phonenumber: req.session.connectedUser.phone}});
		}
	}
	else {
		req.session.destroy();
		if (imgNum > 0) {
			if (galleryImgesObj.length > 1)
				res.render('showGallery', {itemGAL:1, moreImg:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
			else
				res.render('showGallery', {itemGAL:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
		}
		else {
			if (galleryImgesObj.length > 1)
				res.render('showGallery', {itemGAL:1, moreImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
			else
				res.render('showGallery', {itemGAL:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
		}
    }
    */

    if (imgNum > 0) {
        if (galleryImgesObj.length > 1)
            res.render('showGallery', {itemGAL:1, moreImg:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
        else
            res.render('showGallery', {itemGAL:1, extImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
    }
    else {
        if (galleryImgesObj.length > 1)
            res.render('showGallery', {itemGAL:1, moreImg:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
        else
            res.render('showGallery', {itemGAL:1, imgnum: imgNum, imgtxt: galleryImgesObj[imgNum].txt});
    }
}

/*=======================
Utility functions
==========================*/
/*---Get the phone number by the email ---*/
exports.postPhoneNumber = (req, res, next) => {
    console.log('@@ postPhoneNumber/Body: '+JSON.stringify(req.body));

    dbsqlite.getPhoneByEmail(req.body.email, (err, result)=> {
        if (err) {
            console.log("*** getEMail: Erreur: "+err);
            //res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations',csrf: 'CSRF token goes here'});
            res.json({
                phonenumber: '',
                email: req.body.email
            });
        }
        else {
            if ((result !== undefined) && (result !== null)) {
                console.log('@@ getMail: result='+JSON.stringify(result));
                console.log('@@ getMail: mail='+result.email);
            //res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber, csrf: 'CSRF token goes here'});
                res.json({
                    phonenumber: result.phonenumber,
                    email: req.body.email
                });
            }
            else {
                res.json({
                    phonenumber: '',
                    email: req.body.email
                });
            }
        }
    });
/*
    res.json({
        email: 'a.ngues@free.fr',
        phonenumber: '0645895100'
    });
    */
}

/*---Get the email by the phone number ---*/
exports.getEMail = (req, res, next) => {
    console.log('@@ getEMail/Body: '+JSON.stringify(req.body));
    
    dbsqlite.getMailByPhone(req.body.phone, (err, result)=> {
        if (err) {
            console.log("*** getEMail: Erreur: "+err);
            res.json({
                phonenumber: req.body.phone,
                email: ''
            });
        }
        else {
            if ((result !== undefined) && (result !== null)) {
                console.log('@@ getMail: mail='+result.email);
                res.json({
                    phonenumber: req.body.phone,
                    email: result.email
                });
            }
            else {
                res.json({
                    phonenumber: req.body.phone,
                    email: ''
                });
            }
        }
    });

}

/*--- Reload the customer bookings ----*/
function reloadCustomerBookings(customerPhone, req, res, msg = null) {
    dbsqlite.getCustomerBookings(customerPhone, (err, custBookingsObj)=> {
        if (err) {
            console.log("*** Erreur: "+err);
            res.render('customerbookings', {itemMBO:1, custbookings:{}, err:'Erreur de chargement de vos réservations'});
        }
        else {
            console.log('@@ getCustomerBookings: Display view ...');
            if ( (msg == null) || (msg == undefined) ) {
                res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber});
            }
            else {
                res.render('customerbookings', {itemMBO:1, custbookings:custBookingsObj, customerPhone: req.body.phonenumber, bookingMsg: msg});
            }
        }
    });
}
