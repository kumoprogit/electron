//import { set_portforward } from "./sudo.js"

const bodyParser = require("body-parser");
const express = require('express');
const http = express();
const ip = require('ip');
const os = require('os');
const { ipcRenderer } = require('electron');
const remote = require('electron').remote;

http.use(bodyParser.urlencoded({ extended: true }));
//HTTPリクエストのボディをjsonで扱えるようになる
http.use(bodyParser.json());

var data = {
    listen_port: 3000,
    base_port: 5000,
    listen_address: [],
    device_address: [],
    ipno: 0
};

function server_listen() {
//    http.use('/', express.static(__dirname));
    http.set('view engine', 'ejs');
    http.get('/regist', (req, res) => {
        console.log("[Server]: Received from "+req.ip);
        let no = this.add_address(req.ip);
        let listen_port = data.base_port+no;

        if (no>=0) {
            this.update();
            res.render('./index.ejs', data);
            /*
            res.json({
                result: true,
                ipaddr: listen_address[no],
                port: listen_port
            });
            */
        } else if (no == -1) {
            res = "Existed.";
        } else if (no == -2) {
            res = "Overflowed.";
        }
    });
    http.listen(data.listen_port, '0.0.0.0', () => {
        this.init();
        var ifaces = os.networkInterfaces();
        let i = 0;

        Object.keys(ifaces).forEach(function (ifname) {
            ifaces[ifname].forEach(function (iface) {
                if ("IPv4" === iface.family && iface.internal === false) {
                    data.device_address[i] = iface.address;
                    i = i + 1;
                    console.log(iface);
                }
            });
        });
        if (i > 1) {
            console.log(data.device_address);
            ipcRenderer.send('select', data.device_address);

        }
        console.log('[Server]: Start. ' + data.device_address[data.ipno] + ' listening on port '+data.listen_port);
    });
}


function init() {
    for (let i = 0; i < 10; i++) {
        data.listen_address[i] = 0;
        data.device_address[i] = 0;
    }
}

function add_address(ipaddr) {
    var remoteAddress;
    for (let i = 0; i < 10; i++) {
        if (data.listen_address[i] == 0 ) continue;
        if (ipaddr == data.listen_address[i]) {
            return -1;
        } 
    }
    for (let i = 0; i < 10; i++) {
        if( data.listen_address[i] == 0 ) {
            data.listen_address[i] = ipaddr;
            set_portforward(data.base_port+i, ipaddr, 9515);
            //forward('localhost', String(BASEPORT+i), ipaddr, String(9515));
            return i;
        }
    }
    return -2;
}
function update() {
    const tbl = document.getElementById('tbl');
    const ipa = document.getElementById('self');
    ipa.innerHTML = data.device_address[data.ipno] + ":" + data.listen_port;

    if(tbl.rows.length>3) {
    for(let i=tbl.rows.length;i>3;i--){
//      let last = tbl.rows.length
      tbl.deleteRow(-1);
    }
  }
  for(let i=0;i<data.listen_address.length;i++){
    if ( data.listen_address[i] == 0 ) continue;
    var row = tbl.insertRow(-1);
    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);
    var cell4 = row.insertCell(-1);
    cell1.innerHTML = '127.0.0.1';
    cell2.innerHTML = data.base_port + i;
    cell3.innerHTML = data.listen_address[i];
    cell4.innerHTML = 9515;
  }
}
ipcRenderer.on('select', (event,arg) => {
    data.ipno = arg;
    update();
    //console.log("arg=" + arg);
});