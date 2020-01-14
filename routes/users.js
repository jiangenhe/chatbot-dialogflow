var express = require('express');
var router = express.Router();
var mysql = require('mysql');




/* GET users listing. */
router.post('/', function(req, res, next) {
  res.send('respond with a resource');
  var data_id = req.body.data_id;
  var data = req.body.data;
  var sql;
  if (data_id === "Steps") {
    var con = mysql.createConnection({
      host: "voice.cl8gdu1grywy.us-east-2.rds.amazonaws.com",
      user: "jiangen",
      password: "bdA-ueN-Jxt-4eL",
      database: 'chatbot'
    });

    function handleDisconnect() {
      con.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
          console.log('error when connecting to db:', err);
          setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
      });                                     // process asynchronous requests in the meantime.
                                              // If you're also serving http, display a 503 error.
      con.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
          handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
          throw err;                                 // server variable configures this)
        }
      })
    }

    // con.connect(function(err) {
    //   if (!err)
    //     console.log("Connected!");
    //   else
    //     console.log(err,"Connection failed.");
    // });



    if (data.StudyId === undefined || data.StepType === undefined || data.StepNum === undefined || data.RId === undefined || data.StudyGroup === undefined) return;
    sql = `INSERT INTO Steps (StudyId, StepTime, StepType, Data, StepNum, RId, StudyGroup) VALUES ('${data.StudyId}', CURRENT_TIME(), '${data.StepType}', ${data.Data !== undefined ? `'${data.Data}'` : 'null' }, ${data.StepNum}, '${data.RId}', '${data.StudyGroup}')`;
    con.query(sql, function (err, result) {
      if (!err) {
        console.log('Add Step.');
      } else {
        console.log(err);
      }
    })
    con.end();
  } else if (data_id === "Studies") {
    
  }



});

module.exports = router;
