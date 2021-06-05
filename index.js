/*
Copyright (c) 2021 Frigyes06

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/

const elliptic = require('elliptic');
const MicroCoin = require('micro_coin')
const bs58 = require('bs58');
const Discord = require('discord.js');

// PARAMETERS
// TODO: Get all from environment variables
const DISCORD_TOKEN = "YOUR_DISCORD_TOKEN";
const PRIVATE_KEY = "YOUR_PRIVATE_KEY";
const DISCORD_CHANNELS = ["465583027217760266", "477490233370214400", "465573630282039296"];

var ec = new elliptic.ec("secp256k1");
var myKey = ec.keyPair({ "priv": PRIVATE_KEY, "privEnc": "hex" });

var accountApi = new MicroCoin.AccountApi();
var request = new MicroCoin.ChangeKeyRequest();

const client = new Discord.Client();

function hexFromBase58(base58) {
    return bs58.decode(base58).toString('hex').toUpperCase();
}

try {
    
    client.on('message', message => {

        if (message.author.bot) {
            return;
        }

        if (DISCORD_CHANNELS.indexOf(message.channel.id) < 0) {     //channel id is set to Microcoin's 
            console.log("sent into wrong channel " + message.channel.id);
            return;
        }

        const msg = message.content;

        var words = msg.split(" ");

        if (words.length > 1) {
            message.channel.send('Csak a publikus kulcsodat küld!');
            console.log('multiple word');
            return;
        }
        else {
            var decoded = "";
            try {
                decoded = hexFromBase58(msg);
            }
            catch (err) {
                message.channel.send("Rossz a kulcsod!");
                console.log(err);
                return
            }

            console.log(decoded)

            if (decoded[1] !== '1' || decoded[2] !== 'C' || decoded[3] !== 'A') {
                message.channel.send("Rossz a kulcsod!");
                console.log("wrong key");
                return;
            }

            var sliced = decoded.slice(6, decoded.length - 8);
            var length = sliced.length;
            var X = sliced.slice(4, 68);
            var Y = sliced.slice(length - 64, length);

            accountApi.myAccounts({
                "curveType": "secp256k1",
                "x": myKey.getPublic().getX("hex"),
                "y": myKey.getPublic().getY("hex")
            }).then(myAccounts => {

                var AccToChange = "";
                var Accounts = myAccounts;

                for (var i = 1; i < Accounts.length; i++) {
                    if (Accounts[i].balance == 0) {
                        AccToChange = Accounts[i].accountNumber;
                        break;
                    }
                }
                if (AccToChange === "") {
                    message.channel.send("Sajnos nincs most szabad számlám. Próbáld meg később!");
                    console.log(Accounts);
                    return;
                }
                request.setAccountNumber(AccToChange);

                console.log("will give " + AccToChange);

                request.setNewOwnerPublicKey({
                    "curveType": "secp256k1",
                    "x": X,
                    "y": Y
                });

                console.log("set new owner");

                try {
                    accountApi.startChangeKey(request).then(function (transaction) {
                        var signature = myKey.sign(transaction.getHash());
                        transaction.signature = { "r": signature.r, "s": signature.s };
                        accountApi.commitChangeKey(transaction).then((response) => console.log(response)).catch(err => {
                            console.log("Api error: " + err);
                            message.channel.send("Hoppá! Valami hiba volt a tranzakció feldolgozásában. Kérlek próbálkozz újra kb. 4 perc múlva!");
                            return;
                        });
                    });
                    console.log("executed transaction");
                    message.channel.send("A(z) " + AccToChange + " számla mostantól a tied!");
                }
                catch (err) {
                    console.error(err);
                    return;
                }

            }).catch(err => {
                console.error(err);
                message.channel.send("Hoppá! Valami hipa volt a tranzakció feldolgozásában. Kérlek próbálkozz újra kb. 4 perc múlva!");
                return;
            });
        }
    });
}
catch (err) {
    console.error(err);
    return;
}

try {
    client.login(DISCORD_TOKEN);
    console.log('The bot is up and running!')
}
catch (err) {
    console.error(err);
}
