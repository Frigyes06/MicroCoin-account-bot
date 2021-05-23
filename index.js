const elliptic = require('elliptic');
const MicroCoin = require('micro_coin')
const bs58 = require('bs58');

var ec = new elliptic.ec("secp256k1");
var myKey = ec.keyPair({ "priv":"YOUR PRIVATE KEY IN HEX", "privEnc":"hex" });

var accountApi = new MicroCoin.AccountApi();
var request = new MicroCoin.ChangeKeyRequest();

var Accounts = [];

const Discord = require('discord.js');
const client = new Discord.Client();

function hexFromBase58(base58) {
    return bs58.decode(base58).toString('hex').toUpperCase();
}

client.on('message', message => {
    if(message.channel.id !== "465583027217760266" || message.author.bot) {     //channel id is set to Microcoin's 
        console.log("sent into wrong channel " + message.channel.id);
        return;
    }

    const msg = message.content;

    var words = msg.split(" ");

    if(words.length > 1){
        message.channel.send('Csak a publikus kulcsodat küld!');
        console.log('multiple word');
        return;
    }
    else {
        var decoded = hexFromBase58(msg)

        console.log(decoded)
        if(decoded[1] !== '1' || decoded[2] !== 'C' || decoded[3] !== 'A'){
            message.channel.send("Rossz a kulcsod!")
            console.log("wrong key")
            return;
        }

        var sliced = decoded.slice(6, decoded.length - 4);

        var length = sliced.length;
        var X = sliced.slice(0, 64);
        var Y = sliced.slice(length-64, length);
        //console.hex(X)
        //console.hex(Y)

        accountApi.myAccounts({
            "curveType":"secp256k1",
            "x": myKey.getPublic().getX("hex"),
            "y": myKey.getPublic().getY("hex")
        }).then(myAccounts => {
            var i = 0
            var tmp = true
            var AccToChange = ""
            Accounts = myAccounts


            for( i = 1; tmp; i++){
                if(Accounts[i].balance == 0){
                    AccToChange = Accounts[i].accountNumber;
                    tmp = false
                }
                else {
                    tmp = true
                }
            }
            
            request.setAccountNumber(AccToChange);

            console.log("will give " + AccToChange);

            request.setNewOwnerPublicKey({
                "curveType":"secp256k1",
                "x": X,
                "y": Y
            });

            console.log("set new owner")
            try{
            accountApi.startChangeKey(request).then(function (transaction) { 
                var signature = myKey.sign(transaction.getHash());
                transaction.signature = { "r": signature.r, "s": signature.s };
                accountApi.commitChangeKey(transaction).then((response)=>console.log(response), e => console.error("Error!!! " + e));
            });
            console.log(request)
            message.channel.send("A " + AccToChange + " számla mostantól a tied!")
            console.log("executed transaction")
            }
            catch(err){
                console.log("Error" + err)
            }

        }).catch(err => console.log("ERROR! " + err ));
    }
});

try {
    client.login('YOUR BOTS TOKEN');
}
catch(err) {
    console.log(err);
}
