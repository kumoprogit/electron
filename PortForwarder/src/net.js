//import { set_portforward } from "./sudo.js"

const bodyParser = require("body-parser");
const express = require('express');
const http = express();
const ip = require('ip');
const os = require('os');
const { ipcRenderer } = require('electron');

const IPNUM = 10;
var data = {
    listen_port: 3000,
    base_port: 5000,
    listen_address: "",
    connect_address: ["", "", "", "", "", "", "", "", "", ""],
    device_address:  ["", "", "", "", "", "", "", "", "", ""],
    status: 0
};

http.use(bodyParser.urlencoded({ extended: true }));
//HTTPリクエストのボディをjsonで扱えるようになる
http.use(bodyParser.json());
//http.use('/', express.static(__dirname));
http.use('/css', express.static('css'));

function server_listen() {
    http.set('view engine', 'ejs');
    http.get('/regist', (req, res) => {
        console.log("[Server]: Received from "+req.ip);
        let no = this.add_address(req.ip);
        let connect_port = data.base_port+no;

        if (no>=0) {
            data.status = 0;
            //this.update();
            /*
            res.json({
                result: true,
                ipaddr: listen_address[no],
                port: listen_port
            });
            */
        } else if (no == -1) {
            data.status = -1;
            console.log("Existed.");
        } else if (no == -2) {
            data.status = -2;
            console.log("Overflowed.");
        }
        res.render('index.ejs', data);
    });

    http.listen(data.listen_port, '0.0.0.0', () => {
        //this.init();
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
/*
        if (i > 1) {
            console.log(device_address);
            ipcRenderer.send('select', device_address);
        }
*/
        //this.server_address();
        //this.update();
        ipcRenderer.send('show', data);
        console.log('[Server]: Start. listening on port:'+data.listen_port);
    });
    http.get('/list', (req, res) => {
        console.log("[Server]: Received from "+req.ip);
        res.render('list.ejs', data.device_address);
    });

}


function init() {
    for (let i = 0; i < 10; i++) {
        data.device_address[i] = 0;
    }
}

function add_address(ipaddr) {
    var remoteAddress;
    for (let i = 0; i < 10; i++) {
        if (data.connect_address[i] === "" ) continue;
        if (ipaddr == data.connect_address[i]) {
            return -1;
        } 
    }
    for (let i = 0; i < IPNUM; i++) {
        if( data.connect_address[i] === "" ) {
            data.connect_address[i] = ipaddr;
            set_portforward(data.base_port+i, ipaddr, 9515);
            //forward('localhost', String(BASEPORT+i), ipaddr, String(9515));
            return i;
        }
    }
    return -2;
}
/*
function server_address() {
    data.server_str = "Address:";
    for (let i = 0; i < IPNUM-1; i++) {
        if (data.device_address[i] == "") continue;
        data.server_str += " " + device_address[i];
        if (data.device_address[i+1] != "") {
            data.server_str += ",";
        }
    }
    data.server_str += " Port:" + data.listen_port; 
    return data.server_str;
}
*/
function update() {
    const tbl = document.getElementById('tbl');
    const ipa = document.getElementById('self');
    
    ipa.innerHTML = data.device_address[0];

    if(tbl.rows.length>3) {
    for(let i=tbl.rows.length;i>3;i--){
//      let last = tbl.rows.length
      tbl.deleteRow(-1);
    }
  }
  for(let i=0;i<IPNUM;i++){
    if ( data.connect_address[i] === "" ) continue;
    var row = tbl.insertRow(-1);
    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);
    var cell4 = row.insertCell(-1);
    cell1.innerHTML = '127.0.0.1';
    cell2.innerHTML = data.base_port + i;
    cell3.innerHTML = data.connect_address[i];
    cell4.innerHTML = 9515;
  }
}
ipcRenderer.on('select', (event,arg) => {
    data.listen_address = device_address[arg];
    update();
    //console.log("arg=" + arg);
});