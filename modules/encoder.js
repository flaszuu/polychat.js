const protobuf = require("protobufjs");


module.exports = {
    encodeMessage: async function (clients, encodedMessage) {
        protobuf.load("./protos/polychat.proto", function (err, root) {
            if (err)
                throw err;

            let newMessage = {
                serverId: '[Discord]',
                message: encodedMessage,
                messageOffset: encodedMessage.length
            };

            var type = root.lookupType("polychat.ChatMessage");

            var payload = type.create(newMessage);

            //console.log(newMessage);

            var buffer = type.encode(payload).finish();

            protobuf.load("./protos/any.proto", function (err, root) {
                if (err)
                    throw err;
    
                let encodedMessage = {
                    typeUrl: 'type.googleapis.com/polychat.ChatMessage',
                    value: buffer
                };

                //console.log(encodedMessage);
    
                var anytype = root.lookupType("google.protobuf.Any");
    
                var encodedPayload = anytype.create(encodedMessage);
    
                var data = anytype.encode(encodedPayload).finish();

                //console.log(anytype.decode(data));
                //console.log(data.length);

                
                var datalen = new Buffer.alloc(4);
                datalen.writeUInt32BE(data.length, 0);

                data = Buffer.concat([datalen, data]);



                //console.log("datalen: ",data);

    
                
                return clients.forEach(function (client) {
                    client.write(data);
                });

            });
    


        });

    }
};