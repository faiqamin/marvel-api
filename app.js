"use strict";
const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");
const router = require("router");
var crypto = require('crypto');
var _ = require('underscore');
const { request } = require("http");
const { response } = require("express");
var secret = require('../secret');

const PORT = process.env.PORT || 8080;
const PORT_REDIS = process.env.PORT || 6379;
const app = express();
const redisClient = redis.createClient(PORT_REDIS);

//start swagger
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);
//end swagger

var marvelPublicKey = secret.marvelPublicKey;
var marvelPrivateKey = secret.marvelPrivateKey;
var ts = Date.now();
var hashString = ts + marvelPrivateKey + marvelPublicKey;
var hash = crypto.createHash('md5').update(hashString).digest('hex');

var marvelUrl = "https://gateway.marvel.com:443/v1/public";

// Assessment 1
var marvelAPILimit = 100;
var marvelAPIOffset = 0;

var marvelUrl1 = new URL(marvelUrl + "/characters");
marvelUrl1.searchParams.append("apikey", marvelPublicKey);
marvelUrl1.searchParams.append("ts", ts);
marvelUrl1.searchParams.append("hash", hash);
marvelUrl1.searchParams.append("limit", marvelAPILimit);

const set = (key, value) => {
   redisClient.set(key, JSON.stringify(value));
   redisClient.expire(key, 60000);
}
const get = async (req, res, next) => {

	let key = req.route.path;
    if(key === "characters"){
        key = "/public/characters";
    }
    redisClient.get(key, (error, data) => {
      if (error){
          res.status(400).send(err);
        }
      if (data !== null){
        res.status(200).send(JSON.parse(data));
      } else{
        next();
      }
 	});
}
var count = 0;
var tempData = [];

app.get("/characters", get, async (req, res) => {
    const data = await recursive();
    set(req.route.path, data);

    res.status(200).send(data);
});

const recursive = async () => {
    marvelUrl1.searchParams.delete("offset");
    marvelUrl1.searchParams.append("offset", marvelAPIOffset);

    const data = await fetch(marvelUrl1.href).then(response => response.json());

    marvelAPIOffset = marvelAPIOffset + 100;
    var total = data.data.total;
    var loopNeeded = Math.round(total / 100)-1;

    tempData = tempData.concat(data.data.results);

    if (count < loopNeeded) {
        count++;
        return recursive(); // call the function again
    }else{
        var characterID = _.pluck(tempData, "id");
        return characterID; // job done, return the data
    };
}


//Assessment 2
app.get("/characters/:id", async (req, res) => {
    var charID = req.params.id;
    var marvelUrl2 = new URL(marvelUrl + "/characters" + "/" + charID);

    marvelUrl2.searchParams.append("apikey", marvelPublicKey);
    marvelUrl2.searchParams.append("ts", ts);
    marvelUrl2.searchParams.append("hash", hash);

    const {data} = await fetch(marvelUrl2.href).then(response => response.json());

    var results = data.results;
    var formattedResponse = {
        "id":  _.pluck(results, "id")[0],
        "name": _.pluck(results, "name").toString(),
        "description": _.pluck(results, "description").toString()
    }

    res.status(200).send(formattedResponse);
});

var server = app.listen(PORT, () => console.log("App listening at http://localhost:8080"));

module.exports = server;