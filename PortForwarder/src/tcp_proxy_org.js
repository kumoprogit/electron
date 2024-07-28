var util = require('util');
var net = require("net");

process.on("uncaughtException", function(e) {
	console.log(e);
});

if (process.argv.length != 5) {
  console.log("引数が正しく入力されていません:" +　" proxy_port target_host target_port");
    console.log("node scriptfile 3000 www.google.com 80");
  process.exit();
}

var proxyPort = process.argv[2];
var targetHost = process.argv[3];
var targetPort = process.argv[4];

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
    console.log("targethostに接続できません " + targetHost + ', port ' + targetPort);
    proxySocket.end();
  });

  proxySocket.on("data", function (data) {
	console.log("send: "+data.toString()); //送信データ
    if (connected) {
      targetSocket.write(data);
    } else {
      buffers[buffers.length] = data;
    }
  });
  targetSocket.on("data", function(data) {
	console.log("rec: " + data.toString());  //受信データ
    proxySocket.write(data);
  });

  proxySocket.on("close", function(had_error) {
    targetSocket.end();
  });
  targetSocket.on("close", function(had_error) {
    proxySocket.end();
  });

}).listen(proxyPort);
