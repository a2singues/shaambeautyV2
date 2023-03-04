//--- Sqlite3 db 
const sqlite3 = require('sqlite3').verbose();

//--- Initialise db
const dbsqlite = new sqlite3.Database('./datapersist/shaambdb.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connecté à la BDD shaambdb.');
  return "Ok";
});

/*===============
Helper functions
=================*/

//=== Open the database connection
exports.initDb = () => {
  dbsqlite.serialize(function () {
      dbsqlite.run("CREATE TABLE IF NOT EXISTS customer (phonenumber TEXT, email TEXT, creationdate DATETIME default (DATETIME('now','localtime')), PRIMARY KEY (phonenumber, email))", (err) => {
      //dbsqlite.run("CREATE TABLE IF NOT EXISTS customer (phonenumber TEXT PRIMARY KEY, username TEXT, password TEXT, profile INTEGER, creationdate DATETIME default (DATETIME('now','localtime')))", (err) => {
      if (err) {
        return console.error(err.message);
      }
      return null;
    });

      dbsqlite.run("CREATE TABLE IF NOT EXISTS booking (bookingcount INTEGER PRIMARY KEY AUTOINCREMENT, phonenumber TEXT, bookingdate TEXT, bookingtime TEXT, creationdate DATETIME default (DATETIME('now','localtime')))", (err) => {
      if (err) {
        return console.error(err.message);
      }
      return null;
    });

 });
 return "ok";                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
}

//=== Get a customer by the phone number and the email and add if missing
exports.getOrAddCustomer = (phonenumber, email, callback) => {
  dbsqlite.serialize(function () {
    var sqlreq = "SELECT * FROM customer WHERE phonenumber = ? AND email = ?";
    dbsqlite.get(sqlreq, [phonenumber,email], (err, rows) => {
      if (err) {
        console.log('*** ================> [phone/email] Err: '+err);
        console.error('*** Error message: '+err.message);
      }
      else {
        console.log('================> [phone/email] Rows: '+JSON.stringify(rows));
        //return rows;
        //callback(null, rows);
        if ( (rows == null) ||(rows === undefined) ) {
          sqlreq = "INSERT INTO customer (phonenumber, email) VALUES (?, ?)";
          dbsqlite.run(sqlreq, [phonenumber,email], (err) => {
            if (err) {
              console.log('*** SQL error: '+err);
              callback('*** Error inserting customer', null);
            }
            else {
              console.log('-> Customer inserted !');
              callback(null, {});
            }
          });
        }
        else {
          callback(null, {});
        }
      }
    });
  });
}

//=== Check booking if it's present
exports.isBookingExists = (phonenumber, bookingdate, bookingtime, callback) => {
  dbsqlite.serialize(function () {
    var sqlreq = "SELECT * FROM booking WHERE phonenumber = ? AND bookingdate = ? AND bookingtime = ?";
    dbsqlite.get(sqlreq, [phonenumber,bookingdate,bookingtime], (err, rows) => {
      if (err) {
        console.log('*** Err: '+err);
        console.error('*** Error message: '+err.message);

        callback(err.message, false);
      }
      else {
        console.log('-> Booking rows: '+JSON.stringify(rows));
        if ( (rows == null) && (rows === undefined) ) {
          console.log('-> *** Booking not found !');
            callback(null, false);
        }
        else {
          console.log('-> Booking found !');
          callback(null, true);
        }
      }
    });
  });
}

//=== Check booking if it's present
exports.addBooking = (phonenumber, bookingdate, bookingtime, callback) => {
  dbsqlite.serialize(function () {
    var sqlreq = "INSERT INTO booking (phonenumber, bookingdate, bookingtime) VALUES (?, ?, ?)";
    dbsqlite.run(sqlreq, [phonenumber,bookingdate, bookingtime], (err) => {
      if (err) {
        console.log('*** SQL error: '+err);
        callback('*** Error inserting booking');
      }
      else {
        console.log('-> booking inserted !');
        callback(null);
      }
    });

  });
}

//=== Get customer bookings by the phone number
exports.getCustomerBookings = (phonenumber, callback) => {
  dbsqlite.serialize(function () {
    var sqlreq = "SELECT * FROM booking WHERE phonenumber = ?";
    dbsqlite.all(sqlreq, [phonenumber], (err, rows) => {
      if (err) {
          console.error('*** Error message: '+err.message);
          callback(err.message,null);
      }
      else {
          //console.log('-> Bookings rows: '+JSON.stringify(rows));
          if ( (rows !== null) && (rows !== undefined) ) { 

            var custBookings = "[";
            for (let i in rows) {
              if (custBookings != "[") {
                custBookings += ",";
              }
              let bd = rows[i].bookingdate.split("/"); //--- Découpage de la date au format jj/mm/aaaa
              let ymdBDate = bd[2] + '-' + bd[1] + '-' + bd[0]; //--- Date au format yyyy-MM-dd
              //console.log("@@ Date au format yyyy-MM-dd: "+ymdBDate);
              //custBookings += "{\"phone\":\""+phonenumber+"\",\"bookingcount\":"+rows[i].bookingcount+",\"date\":\""+rows[i].bookingdate+",\"fdate\":\""+ymdBDate+"\",\"time\":\""+rows[i].bookingtime+"\"}";
              custBookings += "{\"phone\":\""+phonenumber+"\",\"bookingcount\":"+rows[i].bookingcount+",\"date\":\""+rows[i].bookingdate+"\",\"fdate\":\""+ymdBDate+"\",\"time\":\""+rows[i].bookingtime+"\"}";
            }
            custBookings += "]";
    
            console.log("@========================== RESULT: "+custBookings+"\n");
            var custBookingsObj = JSON.parse(custBookings);
            callback(null, custBookingsObj);
          }
          else {
            callback(null, null);
          }
       }
    });
  });
}


//=== Update booking =====
exports.updateCustomerBooking = (bookingid, bookingdate, bookingtime, callback) => {
  dbsqlite.serialize(function () {
    //var sqlreq = "INSERT INTO booking (phonenumber, bookingdate, bookingtime) VALUES (?, ?, ?)";
    var sqlreq = "UPDATE booking SET bookingdate = ?, bookingtime = ? WHERE bookingcount = ?";
    dbsqlite.run(sqlreq, [bookingdate, bookingtime,bookingid], (err) => {
      if (err) {
          console.log('*** SQL error: '+err);
          callback('*** Error updating booking ***');
      }
      else {
        console.log('-> booking updated !');
        callback(null);
      }
    });
  });
}

//=== Delete a booking
exports.deleteCustomerBooking = (bookingNum, callback) => {
  dbsqlite.serialize(function () {
    var sqlreq = "DELETE FROM booking WHERE bookingcount=?";
    dbsqlite.run(sqlreq, [bookingNum], (err) => {
      if (err) {
        console.log('*** SQL error: '+err);
        callback('*** SQL error: '+err);
      }
      else {
        console.log('-> booking deleted !');
        callback(null);
      }
    });

  });
}

//=== Get customer email by the phone number
exports.getMailByPhone = (phonenumber, callback) => {
  dbsqlite.serialize(function () {
    var sqlreq = "SELECT * FROM customer WHERE phonenumber = ?";
    dbsqlite.get(sqlreq, [phonenumber], (err, result) => {
      if (err) {
          console.error('*** Error message: '+err.message);
          callback(err.message,null);
      }
      else {
          if ( (result !== null) && (result !== undefined) ) { 
            callback(null, result);
          }
          else {
            callback("Customer email not found", null);
          }
       }
    });
  });
}

//=== Get customer phone by the email
exports.getPhoneByEmail = (email, callback) => {
  dbsqlite.serialize(function () {
    var sqlreq = "SELECT * FROM customer WHERE email = ?";
    dbsqlite.all(sqlreq, [email], (err, rows) => {
      if (err) {
          console.error('*** Error message: '+err.message);
          callback(err.message,null);
      }
      else {
          if ( (rows !== null) && (rows !== undefined) ) { 
            console.error('### Rows number: '+rows.length);
            if (rows.length > 1) {
              callback("Too roows fetched", null);
            }
            else {
              callback(null, rows[0]);
            }
          }
          else {
            callback("Customer phone not found", null);
          }
       }
    });
  });
}

//=== Close the database
exports.closeDb = () => {
    dbsqlite.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Déconnection de la BDD SQlite.');
    return null;

  });
}

module.exports.dbsqlite = dbsqlite;
console.log('@@ dbsqlite: '+dbsqlite);
