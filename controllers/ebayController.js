let eBay = require('ebay-node-api');

let ebay = new eBay({

    clientID: "JerameeO-Wrapped-SBX-1cd640c06-899560ef",
    clientSecret: "SBX-cd640c06b010-fee2-48b3-b013-0ed7",
    env: "SANDBOX",
    limit: 6,
    headers:{}


});

const getLiterallyAnything = async (req, res) => {

    ebay.FindItemsByKeywords('iphone').then((data) => {
        
        console.log(data);

    }, (error) => {
        console.log(error)
    });



}

module.exports = getLiterallyAnything;