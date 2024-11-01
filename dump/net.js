const net = require("node:net");

const server = net.createServer((socket)=>{

    let data = [];
    socket.on("data" , (chunk)=>{
         data.push(chunk);     
    })

    socket.on("end" , ()=>{
        console.log(data.toString("utf-8"));

        socket.end(JSON.stringify({
            message : "This is my response"
        }))

    })

});


server.listen(3001 , ()=>{
    console.log("Net Server is listning");
})