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

try{
client.on('message', message => {
    if(message.channel.id !== "465583027217760266" && message.channel.id !== "477490233370214400") {     //channel id is set to Microcoin's 
        console.log("sent into wrong channel " + message.channel.id);
        return;
    }

    if(message.author.bot) {
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
        try{
		    var decoded = hexFromBase58(msg)
	    }
	    catch(err){
	    	message.channel.send("Rossz a kulcsod!")
	    	console.log(err)
	    	return
	    }
    
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
                    accountApi.commitChangeKey(transaction).then((response)=>console.log(response)).catch(err => {console.log("Api error: " + err)
                        console.log("Api error: " + err);
                        message.channel.send("Hoppá! Valami hipa volt a tranzakció feldolgozásában. Kérlek próbálkozz újra kb. 4 perc múlva!")
                        return;
                    });
                });
                console.log("executed transaction")
                message.channel.send("A " + AccToChange + " számla mostantól a tied!")
            }
            catch(err){
                console.log("Error" + err)
                return;
            }

        }).catch(err => {
            console.log("ERROR! " + err );
            message.channel.send("Hoppá! Valami hipa volt a tranzakció feldolgozásában. Kérlek próbálkozz újra kb. 4 perc múlva!");
            return;
        });
    }
});
}
catch(err){
    console.log(err);
    return;
}

try {
    client.login('YOUR BOTS TOKEN');
}
catch(err) {
    console.log(err);
}
