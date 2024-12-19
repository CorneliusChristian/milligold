const socket = io();

blocks = []
function reload(){
    socket.emit("getBlocks")
}
function addBlock(amount, date){
    blocks.push({
        "amount":amount,
        "ID":blocks.length+2,
        "production":date
    })
}

socket.on("blocks", (blocksReceived) => {
    var circulatingsupply = 0
    blocks = JSON.parse(blocksReceived)
    console.log(blocks)
    document.querySelector("ul").innerHTML = ""
    blocks.slice().reverse().forEach(token => {
        if (token.redeemable == false){
            document.querySelector("ul").innerHTML += "<li class = 'text-red-500'>"+token.amount+"mg token - ID "+token.ID+" - "+token.production+" - "+token.verification+"</li>"
        }else{
            document.querySelector("ul").innerHTML += "<li>"+token.amount+"mg token - ID "+token.ID+" - "+token.production+" - "+token.verification+"</li>"
            circulatingsupply += token.amount
        }
        document.querySelector(".token").innerHTML = "Circulating Supply: "+circulatingsupply+" mg"
        document.querySelector(".worth").innerHTML = "Net Worth: Rp."+(circulatingsupply*1500)
    });
})
function produce(){
    var amount = prompt("Amount of token: ")
    if (amount == null){
        return;
    }
    var password = prompt("Password: ")
    var twofactor = prompt("2FA: ")
    var date = moment().format("DD/MM/YYYY")
    socket.emit("produce", [amount, date, password, twofactor])
    socket.emit("getBlocks")
}
function redeem(){
    var id = prompt("ID to redeem:")
    if (id == null){
        return;
    }
    var password = prompt("Password: ")
    var twofactor = prompt("2FA: ")
    socket.emit("redeem", [id, password, twofactor])
    socket.emit("getBlocks")
}
reload()
