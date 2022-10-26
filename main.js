const Twitter = require('twitter');
require('dotenv/config')
const https = require("https");
const CronJob=require('cron').CronJob;
const querystring = require("querystring")

const unicode = require("./unicode")

const fiksu_ai = require('./rating');



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
    var url = "https://discord.com/api/webhooks/1034590470287929444/ceWSrNB52x_v8vTH-YI9cSXhUfnvK6qDb7YrSEPxg0ZnjsnS7P7cBRoV-wF3gZRgDgzz"
    var postData = encodeURIComponent(JSON.stringify({
        content: message,
        username: "Saarni Safkat",
        tts: false,

    }));

    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        },
        timeout: 1000, // in ms
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
            console.log(res)
            return reject(new Error(`HTTP status code ${res.statusCode}`));
        };

        const body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', () => {
            const resString = Buffer.concat(body).toString();
            resolve(resString);
        });
        });

        req.on('error', (err) => {
        reject(err);
        });

        req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request time out'));
        });

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
                const dayOfWeekDigit = new Date().getDay();
                
                for(const food of foodlist[dayOfWeekDigit].Meals) {
                    
                        
                    if(JSON.stringify(food.MealType).includes("KASVIS")) {
                        var kasvis_lounas = food.Name
                        var rating = fiksu_ai.get_rating(food.Name)
                    }
                    else {
                        var syötävä_ruoka = food.Name
                        var rating = fiksu_ai.get_rating(food.Name)
                    }
                }
                let foodtweet = `Tänään lounaaksi on ${syötävä_ruoka.split(",")[0]}.
Super fiksu A.I sanoo ruokaa ${rating}

Kasvis lounaaksi on tänään ${kasvis_lounas.split(",")[0]}. 
Super fiksu A.I sanoo ruokaa ${rating}
    `
                let discord_msg = `Tanaan lounaaksi on ${syötävä_ruoka.split(",")[0]}.
Super fiksu A.I sanoo ruokaa ${rating}

Kasvis lounaaksi on tanaan ${kasvis_lounas.split(",")[0]}. 
Super fiksu A.I sanoo ruokaa ${rating}
                    `
                var params = { status: foodtweet };
                client.post('statuses/update', params, function(error, tweet, response) {
                    if (error) throw error;
                    console.log(tweet);
                    console.log(response.body);
                    var tweetid = tweet.id_str
                    console.log(tweetid);
                    var params2 = { id: tweetid};
                    client.post(`account/pin_tweet`, params2, function(error, pinned, response) {
                        if (error) throw error;
                        console.log(pinned)
                    });
                }
                );
                console.log(foodtweet)
                postInfoDiscord(discord_msg)
                
            } catch (error) {
                console.error(error.message);
            };
        });
    
    })
    .on("error", (error) => {
        console.log(error);
    });

    
}
postInfoDiscord(`Bot has started again!`)
const postFoodListEveryday = new CronJob({

    cronTime: '00 00 00 * * * ',
    onTick: function () {
        console.log("Posting foodlist!!!")
        postFoodList()
    },
    start: true,
    runOnInit: true
});
