var express = require('express');
var app = express();
var mongoose = require('mongoose');
var mysql = require('./mysql/mySqlConnection.js');
var elasticsearch = require('./elasticsearch/esF1.js');
var postgres = require('./postgres/postgresConnection.js');
var count1 = 0;
// const router = express.Router();
const path = require('path');

console.log(process.env.mySQLHost);
const PORT_NUMBER = 80;

// mongoose.connect('mongodb://mongo.q/tenantData');

app.use(express.static(__dirname + 'client/'));
app.use('/scripts', express.static(__dirname + 'node_modules/'));
elasticsearch.createIndex('items');

// The 5 endpoints are defined below

/*
AD HOC Documentation:
V2 - Changed the elastic endpoint method. Instead of recursive calls, the bulk of the work is shifted to the node server.
V2.2 - Changed the iterations of randomly genereated names (within elastic endpoint) from 10 to 20
V2.3 - Changed the iterations of randomly generated names (within elastic endpoint) from 20 to 50
V2.4 - Increased CPU loads of the generation of the random strings (within elastic endpoint)
V3 - Changed the elastic endpoint implementation. Modified the method calls to balance out the work between the elastic and node.
V3.1 - Added more randomly generated names within the elastic endpoint (from 1 to 3 calls)
V3.2 - Added more randomly generated names within the elastic endpoint (from 3 to 9 calls)
V4 - Changed elastic endpoint method. Modified method calls to increase CPU loads with large integer multiplication.
V4.1 - Increased limit size to 1,000,000,000
V4.2 - Increased limit size to 1,000,000,000,000
V4.3 - Modified method to be less predictable
V5 - Modified function to remove asynchronous calls
*/

app.get('/app/users', function(req, res) {
    res.send('Welcome to the multiservice application V5!');
});

app.get('/app/psql/users', function(req, res, next) {
    const results = [];
    const query = postgres.query('SELECT * FROM items ORDER BY id ASC');

    query.on('row', function(row) {
        results.push(row);
    });

    query.on('end', function() {
        return res.json(results);
    });

    query.on('error', (err) => {
        console.error(err.stack)
    })
});

app.post('/app/psql/users', function(req, res, next) {
    const results = [];
    // const data = {text: req.body.text};
    postgres.query("INSERT INTO items (text) values('RandomTextFillerTestRandomTextFillerTestRandomTextFillerTestRandomTextFillerTest')");
    const query = postgres.query('SELECT * FROM items ORDER BY id ASC');

    query.on('row', function(row) {
        results.push(row);
    });

    query.on('end', function() {
        return res.json(results);
    });

    query.on('error', (err) => {
        console.error(err.stack)
    })
});

app.delete('/app/psql/users', function(req, res, next) {
    const results = [];
    // const data = {text: req.body.text};
    postgres.query('DELETE FROM items');
    const query = postgres.query('SELECT * FROM items ORDER BY id ASC');

    query.on('row', function(row) {
        results.push(row);
    });

    query.on('end', function() {
        return res.json(results);
    });

    query.on('error', (err) => {
        console.error(err.stack)
    })
});

app.get('/app/mysql/users', function(req, res, next) {
    const query = 'SELECT * FROM people';

    mysql.query(query, function(err, result, fields) {
        if (err) throw err;
        return res.json(result);
    });
});

app.post('/app/mysql/users', function(req, res, next) {
    // const data = {text: req.body.text};
    // const query = "INSERT INTO people (text) VALUES ('$1')", [data.text];
    const query = "INSERT INTO people (text) VALUES ('RandomTextFillerTestRandomTextFillerTestRandomTextFillerTestRandomTextFillerTest')";

    mysql.query(query, function(err, result, fields) {
        if (err) throw err;
        return res.json(result);
    });
});

app.delete('/app/mysql/users', function(req, res, next) {
    // const data = {text: req.body.text};
    const query = "DELETE FROM people";

    mysql.query(query, function(err, result, fields) {
        if (err) throw err;
        return res.json(result);
    });
});

// var contiuneElasticGet = function(req, res, name) {
//     elasticsearch.search('items', name).then(function(result) {
//         if (result.hits.total == 0) {
//             contiuneElasticGet(req, res, name);
//         } else {
//             res.json(result);
//         }
//     });
// }
//
// var responseHitsNone = function(req, res, name) {
//     console.log(name);
//     const query = postgres.query("INSERT INTO items (text) values('" + name + "')");
//     query.on('end', () => {
//     	contiuneElasticGet(req, res, name)
//     })
//     query.on('error', (err) => {
//     	console.error(err.stack)
//     })
// }


// V1
// var continueElasticGet = function(req, res, name) {
//     var count = req.params.count;
//     // Generating unused random name
//     uname = Math.random().toString(36).substring(7);
//     const query = postgres.query("INSERT INTO items (text) values('" + name + "')");
//     count1 += 1;
//     query.on('end', () => {
//         elasticsearch.search('items', name).then(function(result) {
//             console.log(result.hits.total);
//             if (result.hits.total < parseInt(count)) {
//                 continueElasticGet(req, res, name);
//             } else {
//                 console.log("END" + count1.toString());
//                 res.json(result);
//             }
//         });
//     });
// }

/* V2 */
// app.get('/app/elastic/users/:count', function(req, res, next) {
//     var count = req.params.count;
//     count1 = 0;
//     name = Math.random().toString(36).substring(7);
//     console.log(name);
//     elasticsearch.search('items', name).then(function(result) {
//         console.log(result.hits.total);
//         if (result.hits.total < parseInt(count)) {
//             continueElasticGet(req, res, name);
//         } else {
//             res.json(result);
//         }
//     });
// });


// /* V2 */
// app.get('/app/elastic/users/:count', function(req, res, next) {
//     var count = req.params.count;
//     name = Math.random().toString(36).substring(7);
//     console.log(name);
//     var iterations = 0;
//     while (iterations < count) {
//         postgres.query("INSERT INTO items (text) values('" + name + "')").then(function(result)
//         {
//             elasticsearch.search('items', name).then(function(result) {
//                 // Pass
//             });
//             var i;
//             for (i = 0; i < 50; i++) {
//                 uname = Math.random().toString(1000).substring(800);
//             }
//         });
//         iterations = iterations + 1;
//     }
//     res.json(res);
// });

/* V3 */
// app.get('/app/elastic/users/:count', function(req, res, next) {
//     var count = req.params.count;
//     name = Math.random().toString(36).substring(7);
//     console.log(name);
//     var iterations = 0;
//     while (iterations < count) {
//         postgres.query("INSERT INTO items (text) values('" + name + "')").then(function(result)
//         {
//             var i;
//             for (i = 0; i < 50; i++) {
//                 elasticsearch.search('items', name).then(function(result) {
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                     uname = Math.random().toString(36).substring(7);
//                 });
//             }
//         });
//         iterations = iterations + 1;
//     }
//     res.json(res);
// });

/* V4 */
// app.get('/app/elastic/users/:count', function(req, res, next) {
//     var count = req.params.count;
//     var name = Math.random().toString(36).substring(7);
//     console.log(name);
//     var iterations = 0;
//     while (iterations < count) {
//         postgres.query("INSERT INTO items (text) values('" + name + "')").then(function(result)
//         {
//             elasticsearch.search('items', name).then(function(result) {
//                 // Pass
//             });
//             var i = 1;
//             var limit = parseInt(Math.random()*1000000000000, 13);
//             var count1 = 1;
//             var rand1;
//             var rand2;
//             var rand3;
//             var uname;
//             for (; i < limit; i++) {
//                 rand1 = parseInt(Math.random()*1000000000000, 13);
//                 rand2 = parseInt(Math.random()*1000000000000, 13);
//                 rand3 = rand1 * rand2;
//                 uname = Math.random().toString(1000000).substring(800000);
//             }
//         });
//         iterations = iterations + 1;
//     }
//     res.json(iterations);
// });

/* V5 */
app.get('/app/elastic/users/:count', function(req, res, next) {
    var count = req.params.count;
    var name = Math.random().toString(36).substring(7);
    console.log(name);
    postgres.query("INSERT INTO items (text) values('" + name + "')").then(function(result)
    {
        elasticsearch.search('items', name).then(function(result) {
            //Pass
            console.log("finished search");
        });
    });

    var rand1;
    var rand2;
    var rand3;
    var uname;
    var ticks = 0;
    var limit = 1000000;
    for (var j = 0; j < count; j++) {
        for (var i = 0; i < limit; i++) {
            rand1 = parseInt(Math.random()*1000000, 7);
            rand2 = parseInt(Math.random()*1000000, 7);
            rand3 = rand1 * rand2;
            uname = Math.random().toString(36).substring(800000);
            ticks++;
        }
    }
    console.log(ticks);
    res.json(ticks);
});

app.get('/app/elastic/count/:word', function(req, res, next) {
    var name = req.params.word;
    elasticsearch.search('items', name).then(function(result) {
            res.json(result);
    });
    //elasticsearch.ping();
    // esRes = JSON.parse(elasticsearch.search('items', name));
    // if (esRes is true) {
    //     return res.join(elasticsearch.search('items', name));
    // }
    // postgres.query("INSERT INTO items (text) values($1)", [name]);
    // while esRes is still false
    //     esRes = JSON.parse(elasticsearch.search('items', name));
    // return res.json(elasticsearch.search('items', name));
});

app.get('/app/elastic/reset', function(req, res, next) {
    elasticsearch.deleteIndex('items');
    elasticsearch.createIndex('items');
});


app.listen(PORT_NUMBER);
// console.log('Navigate to http://localhost:3000/app/users');
