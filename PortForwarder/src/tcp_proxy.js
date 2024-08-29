const util = require('util');
const net = require("net");

const httpProxy = require('http-proxy');

function set_portforward2(proxyPort, targetHost, targetPort) {
    var options = {
        hostnameOnly:false,
        router: {
            'localhost': targetHost+":"+targetPort,
        }
    
    }
    httpProxy.createServer(options).listen(proxyPort);
}

function set_portforward(proxyPort, targetHost, targetPort) {

    net.createServer(function (proxySocket) {
        var connected = false;
        var buffers = new Array();
        var targetSocket = new net.Socket();
        targetSocket.connect(parseInt(targetPort), targetHost, function() {
          connected = true;
          if (buffers.length > 0) {
            for (i = 0; i < buffers.length; i++) {
              console.log(buffers[i].toString());
              targetSocket.write(buffers[i]);
            }
          }
        });
      
        proxySocket.on("error", function (e) {
          targetSocket.end();
        });
        targetSocket.on("error", function (e) {
          console.log("targethost not connected. " + targetHost + ', port ' + targetPort);
          proxySocket.end();
        });
      
        proxySocket.on("data", function (data) {
          alert("send: "+data.toString()); //送信データ
          if (connected) {
            targetSocket.write(data);
          } else {
            buffers[buffers.length] = data;
          }
        });
        targetSocket.on("data", function(data) {
          alert("rec: " + data.toString());  //受信データ
          proxySocket.write(data);
        });
      
        proxySocket.on("close", function(had_error) {
          targetSocket.end();
        });
        targetSocket.on("close", function(had_error) {
          proxySocket.end();
        });
      
      }).listen(proxyPort);
}
