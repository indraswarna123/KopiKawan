var express = require("express");
var app = express();
var moment = require("moment");
var bodyParser = require("body-parser");
var http = require('http');
var fs = require('fs');
var url = require('url');
var DB = require('./callFunction.js');
var cors = require('cors');
var productDetails;
var transactionPerDay;
var totalTransaction = [];

var currentDate = moment().format('YYYY-MM-DD');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());




app.get("/showTodayTransaction",function(req,res){
    console.log(currentDate);
    DB.query('select a.product_id , count(a.product_id) as total_product , b.price*count(a.product_id) as total_price_product from transaction a left join product b on a.product_id = b.id where a.date = "'+currentDate+'" GROUP by a.product_id', 
        function (error, result, fields){
        if(error){
            console.log(error)
        } else{
            res.json(result);
        }
    });
});




app.get("/showUser", function(req, res) {
    DB.query('SELECT * FROM product', function (error, result, fields){
        if(error){
            console.log(error)
        } else{
            productDetails = result;
            console.log(productDetails[0]);
            res.json(result);
        }
    });
    
});

app.get("/showTransaction", function(req, res) {
    DB.query('SELECT * FROM transaction', function (error, result, fields){
        if(error){
            console.log(error)
        } else{
            res.json(result);
        }
    });
});

app.post('/queryTransaction',function(req,res){
    var tanggalAwal = req.body.tanggalAwal;
    var tanggalAkhir = req.body.tanggalAkhir;
    DB.query('select a.product_id , count(a.product_id) as total_product , b.price*count(a.product_id) as total_price_product from transaction a left join product b on a.product_id = b.id where a.date between "'+tanggalAwal+'" and "'+tanggalAkhir+'" GROUP by a.product_id', function (error, result, fields){
        if(error){
            console.log(error)
        } else{
            console.log(result);
            res.json(result);
        }
    });

});

app.post('/insertTransaction',function(req,res){
    var transactionId = 0;
    var productId = req.body.id;
    var date = currentDate;
    var stoppingCondition = productId.length-1;
    DB.query('SELECT * FROM transaction WHERE id=(SELECT MAX(id) FROM transaction);', function (error, result, fields){
        if(error){
            console.log(error)
        } else{
           console.log(result[0].id);
           console.log(req.body.id.length);
           console.log(stoppingCondition);
           for(var i=0;i<productId.length;i++){
               console.log(i);
               DB.query('INSERT INTO transaction values('+(result[0].id+1)+', "'+productId[i]+'" , "'+date+'" )', function (errors, results, fieldss){
                    if(error){
                        console.log(errors)
                    } else{
                        console.log("Succesfully Inserted Data");       
                    }
                });
               if(i == stoppingCondition){
                           console.log("success");
                           res.send("done"); 
                }
           }
        }
    });
    
    // console.log(transactionId);
    
});



// app.post('/searchUser',function(req,res){
//     var id=req.body.id;
//     var type=req.body.type;
//     var sql;
//     if(type=="ID"){
//         if(id){
//             sql = 'SELECT * FROM customer where id like '+id+' ';
//         }else{
//             sql = 'SELECT * FROM customer ';
//         }
//     }
//     if(type=="Name"){
//         if(id){
//             var like= "%";
//             id=id+like;
//             sql = 'SELECT * FROM customer where name like "'+id+'" ';
//         }else{
//             sql = 'SELECT * FROM customer ';
//         }
//     }
//     if(type=="Gender"){
//         if(id){
//             sql = 'SELECT * FROM customer where gender like "'+id+'" ';
//         }else{
//             sql = 'SELECT * FROM customer ';
//         }
//     }
//     if(type=="Email"){
//         if(id){
//             var like= "%";
//             id=id+like;
//             sql = 'SELECT * FROM customer where email like "'+id+'" ';
//         }else{
//             sql = 'SELECT * FROM customer ';
//         }
//     }
//     if(type=="Address"){
//         if(id){
//             var like= "%";
//             id=id+like;
//             console.log(like);
//             sql = 'SELECT * FROM customer where address like "'+like+'" ';
//         }else{
//             sql = 'SELECT * FROM customer ';
//         }
//     }
//     if(type=="Status"){
//         if(id){
//             sql = 'SELECT * FROM customer where status like "'+id+'" ';
//         }else{
//             sql = 'SELECT * FROM customer ';
//         }
//     }


//     DB.query(sql, function (error, result, fields){
//         if(error){
//             console.log(error)
//         } else{
//             res.json(result);
//         }
//     });
// });

// app.post('/insertUser',function(req,res){
//     var id= req.body.id;
//     var name = req.body.name ;
//     var gender= req.body.gender;
//     var email = req.body.email;
//     var address = req.body.address;
//     var status = req.body.status;
//     DB.query('INSERT INTO customer values('+id+', "'+name+'" , "'+address+'" , "'+gender+'" , "'+email+'" , '+status+' )', function (error, result, fields){
//         if(error){
//             console.log(error)
//         } else{
//            console.log("success");
//            res.send("done");
//         }
//     });
// });

// app.post('/deleteUser',function(req,res){
//     var id= req.body.id;
//     DB.query('DELETE FROM customer WHERE id = '+id+'', function (error, result, fields){
//         if(error){
//             res.send("fail");
//         } else{
//             res.send("done");

//         }
//     });
// });

// app.post('/updateUser',function(req,res){
//     var id= req.body.id;
//     var name = req.body.name ;
//     var gender= req.body.gender;
//     var email = req.body.email;
//     var address = req.body.address;
//     var status = req.body.status;
//     DB.query('UPDATE customer SET name= "'+name+'", gender = "'+gender+'" , email = "'+email+'" , address = "'+address+'", status="'+status+'" where id="'+id+'"', function (error, result, fields){
//         if(error){
//             res.send("failed");
//         } else{
//             res.send("done");
//         }
//     });
// });



app.get("/index.html", function(req, res) {
    res.sendFile( __dirname+'/index.html')
});

app.get(/^(.+)$/, function(req, res){
    // console.log('static file request : ' + req.params);
    res.sendFile( __dirname + req.params[0]);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});


