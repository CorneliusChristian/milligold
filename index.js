const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require("fs")
const app = express();
const server = createServer(app);
const io = new Server(server);
const twofactor = require("node-2fa")
var aes256 = require("aes256")
app.use("/src", express.static("src/"))
const masterkey = "K9wtY2oGxSCn3lHTBoAPkm8REBAB8Hkj9XJWJ3xhtUb2KJYUA8kdeCfb/9z6NDNf"
function makeid(length) {
    let result = '';
    const characters = '01';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname+"/index.html")
})

io.on('connection', (socket) => {
    socket.on("getBlocks", () => {
        var k = JSON.stringify(require("./src/blocks.json"))
        socket.emit("blocks", k)
        console.log(k)
    })
    socket.on("produce", (m) => {
        if (twofactor.verifyToken(aes256.decrypt(m[2], masterkey), m[3])){
            var k = require("./src/blocks.json")
            k.push({
                "amount":parseInt(m[0]),
                "production":m[1],
                "ID":k.length+2,
                "verification":makeid(9),
                "redeemable":"true"
            })
            fs.writeFileSync(__dirname+"/src/blocks.json", JSON.stringify(k))
        }else{

        }
    })
    socket.on("redeem", (m) => {
        if (twofactor.verifyToken(aes256.decrypt(m[1], masterkey), m[2])){
            var k = require("./src/blocks.json")
            k[m[0]-2].redeemable = false
            fs.writeFileSync(__dirname+"/src/blocks.json", JSON.stringify(k))
        }
    })
})

server.listen(3030)