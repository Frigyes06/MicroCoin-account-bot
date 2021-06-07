# MicroCoin-account-bot

You can download the JavaScript SDK from here: <br />
https://github.com/MicroCoinHU/MicroCoin-Javacript-SDK

# Installation
First, we install node.js and npm:
```
sudo apt install nodejs npm
```
We have to check if node.js version is above 12.0.0:
```
node -v
```
If it is below version 12.0.0, then we have to update it manually, here is a good tutorial: <br />
https://phoenixnap.com/kb/update-node-js-version <br />
I advise you to install v14.17.0 (LTS) <br />
<br />
Then, we make a folder for the program and pull the repos:
```
mkdir account-bot
cd account-bot
git clone https://github.com/Frigyes06/MicroCoin-account-bot
cd MicroCoin-account-bot
git clone https://github.com/MicroCoinHU/MicroCoin-Javacript-SDK
```
Next, we install the dependencies
```
npm install
```
Now, we have to set our private key (in HEX)
```
nano .env
```
Next, the Discord bot's ID
```
nano +2 .env
```
You can change the channels that the bot will listen on:
```
nano +3 .env
```
After that, we can start the program:
```
node index.js
```
