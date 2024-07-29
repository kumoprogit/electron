//import { set_portforward } from "./sudo.js"

const bodyParser = require("body-parser");
const express = require('express');
const http = express();
const ip = require('ip');
const os = require('os');


http.use(bodyParser.urlencoded({ extended: true }));
//HTTPリクエストのボディをjsonで扱えるようになる
http.use(bodyParser.json());

const LISTENPORT = 80;
const BASEPORT = 5000;
const IPNUM = 10;
const listen_address = new Array(IPNUM);
const device_address = new Array(IPNUM);
var SELFIP = "";

function server_listen() {
    http.get('/regist', (req, res) => {
        console.log("[Server]: Received from "+req.ip);
        let no = this.add_address(req.ip);
        let listen_port = BASEPORT+no;

        if (no>=0) {
            this.update();
            res.json({
                result: true,
                ipaddr: listen_address[no],
                port: listen_port
            });
        } else if (no == -1) {
            res = "Existed.";
        } else if (no == -2) {
            res = "Overflowed.";
        }
    });
    http.listen(LISTENPORT, '0.0.0.0', () => {
        this.init();
        //SELFIP = ip.address();
        var ifaces = os.networkInterfaces();
        let i = 0;

        Object.keys(ifaces).forEach(function (ifname) {
            ifaces[ifname].forEach(function (iface) {
                if ("IPv4" === iface.family && iface.internal === false) {
                    device_address[i] = iface.address;
                    i = i + 1;
                    console.log(iface);
                }
            });
        });
        if (i > 1) {
            select_dialog();
        }
        console.log('[Server]: Start. ' + SELFIP + ' listening on port '+LISTENPORT);
    });
}


function init() {
    for (let i = 0; i < 10; i++) {
        listen_address[i] = 0;
        device_address[i] = 0;
    }
}

function add_address(ipaddr) {
    var remoteAddress;
    for (let i = 0; i < 10; i++) {
        if (listen_address[i] == 0 ) continue;
        if (ipaddr == listen_address[i]) {
            return -1;
        } 
    }
    for (let i = 0; i < 10; i++) {
        if( listen_address[i] == 0 ) {
            listen_address[i] = ipaddr;
            set_portforward(BASEPORT+i, ipaddr, 9515);
            //forward('localhost', String(BASEPORT+i), ipaddr, String(9515));
            return i;
        }
    }
    return -2;
}
function update() {
    const tbl = document.getElementById('tbl');
    const ipa = document.getElementById('self');
    ipa.innerHTML = SELFIP;

    if(tbl.rows.length>3) {
    for(let i=tbl.rows.length;i>3;i--){
//      let last = tbl.rows.length
      tbl.deleteRow(-1);
    }
  }
  for(let i=0;i<IPNUM;i++){
    if ( listen_address[i] == 0 ) continue;
    var row = tbl.insertRow(-1);
    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);
    var cell4 = row.insertCell(-1);
    cell1.innerHTML = '127.0.0.1';
    cell2.innerHTML = BASEPORT + i;
    cell3.innerHTML = listen_address[i];
    cell4.innerHTML = 9515;
  }
}
