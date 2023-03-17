const { saveMessage } = require("../io/utils");


module.exports = (io)=>{
        io.on("connection", (socket)=>{
         //console.log("New User Connected");


        socket.on("join", (params, callback)=>{
            socket.join(params.channelID);
            callback();
        });

        socket.on('start-type', name => {
            io.emit('start-type', name);
         });
         
         socket.on('stop-type', name => {

            io.emit('stop-type', name);
         });

        socket.on("createdMessage", (data, callback)=>{
            saveMessage(io, data);
            callback();
        });

        socket.on("disconnect", ()=>{
             //console.log("Diconected");
        });
    });
};
