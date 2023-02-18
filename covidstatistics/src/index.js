const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const data=require('./data');
const { connection } = require('./connector')
app.get("/getdata",(req,res)=>{
    res.send(data);
})

//GET localhost:8080/totalRecovered should calculate the total number of recovered patients across all the given states(also UTs)

app.get("/totalRecovered",async (req,res)=>{
    const data=await connection.aggregate([{$group:{_id:'total',recovered:{$sum:'$recovered'},},},]);
    res.json({
       data
    })
})


//GET localhost:8080/totalActive should calculate the total number of active patients across all the given states(also UTs).


app.get("/totalActive",async (req,res)=>{
    const data=await connection.aggregate([{$group:{_id:'total',active:{$sum:{$subtract:['$infected','$recovered']},},},}]);
    res.json({
        data
    })
})


//GET localhost:8080/totalDeath should calculate the total number of deaths across all the given states(also UTs)
app.get("/totalDeath", async (req,res)=>{
    const data=await connection.aggregate([{$group:{_id:'total',death:{$sum:'$death'},},},]);
    res.json({
        data
    })
})

//GET localhost:8080/hotspotStates Every state is declared as a hotspot of its rate value is greater than 0.1.

app.get("/hotspotStates",async (req,res)=>{
    const data=await connection.aggregate([{$project:{_id:0,state:1,rate:{$round:[{$subtract:[1,{$divide:['$recovered','$infected']}]},5]}}}, {
        $match: {
          rate: {
            $gt: 0.1
          }
        }
      }]);
    res.json({
        data
    })
})


//GET localhost:8080/healthyStates Every state is declared as a healthy state whose mortality value is less than 0.005.

app.get("/healthyStates",async (req,res)=>{
    const data=await connection.aggregate([{$project:{_id:0,state:1,mortality:{$round:[{$divide:["$death","$infected"]},5]}}}, {
        $match: {
          mortality: {
            $lt: 0.005
          }
        }
      }]);
      res.json({
        data
      })
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;