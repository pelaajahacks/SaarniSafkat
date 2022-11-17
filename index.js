const Twitter = require('twitter');
require('dotenv/config')
const https = require("https");
const CronJob = require('cron').CronJob;
const querystring = require("querystring")

const fiksu_ai = require('./rating');

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

const apikey = process.env.apikey
const apiSecretKey = process.env.apikeysecret
const accessToken = process.env.accesstoken
const accessTokenSecret = process.env.accesstokensecret



var client = new Twitter({
    consumer_key: apikey,
    consumer_secret: apiSecretKey,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
});

function postInfoDiscord(message) {
    var url = process.env.webhookurl
    var postData = querystring.stringify(JSON.parse(JSON.stringify({
        content: message,
        username: "Saarni Safkat",
        tts: false,

    })));


    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,

        },
        timeout: 69000, // in ms
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode < 200 || res.statusCode > 299) {

                return "Failed!"
            };

            const body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                const resString = Buffer.concat(body).toString();

                resolve(resString);
            });
        });

        req.on('error', (err) => {
            console.log(err)
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(err)
        });
        console.log(postData)
        req.write(postData);
        req.end();
    });
};



function postFoodList() {
    https.get("https://kouluruoka.fi/page-data/menu/espoo_saarnilaaksonkoulu/page-data.json", (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                try {
                    let foodlist = JSON.parse(data).result.pageContext.menu.Days;
                    // do something with JSON

                    var d = new Date();
                    var utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());

                    console.dir(foodlist)
                    const dayOfWeekDigit = utcDate.getDay()
                    console.log(dayOfWeekDigit)


                    for (const food of foodlist[dayOfWeekDigit].Meals) {


                        if (JSON.stringify(food.MealType).includes("KASVIS")) {
                            var kasvis_lounas = food.Name
                            var rating = fiksu_ai.get_rating(food.Name)
                        } else {
                            var syötävä_ruoka = food.Name
                            var rating = fiksu_ai.get_rating(food.Name)
                        }
                    }
                    let foodtweet = `Tänään lounaaksi on ${syötävä_ruoka.split(",")[0]}.
Super fiksu A.I sanoo ruokaa ${rating}

Kasvis lounaaksi on tänään ${kasvis_lounas.split(",")[0]}. 
Super fiksu A.I sanoo ruokaa ${rating}`
                    var params = { status: foodtweet };
                    client.post('statuses/update', params, function(error, tweet, response) {
                        console.log(tweet);
                        console.log(response.body);
                        var tweetid = tweet.id_str
                        console.log(tweetid);
                        var params2 = { id: tweetid };
                        client.post(`account/pin_tweet`, params2, function(error, pinned, response) {
                            console.log(pinned)
                        });
                    });
                    console.log(foodtweet)
                    postInfoDiscord(foodtweet)

                } catch (error) {
                    console.log(error.message);
                };
            });

        })
        .on("error", (error) => {
            console.log(error);
        });


}
postInfoDiscord(`Bot has started again!`)
const postFoodListEveryday = new CronJob({

    cronTime: '01 00 * * *',
    onTick: function() {
        console.log("Posting foodlist!!!")
        postFoodList()
    },
    start: true,
    runOnInit: false
});