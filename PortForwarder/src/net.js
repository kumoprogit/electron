//import { set_portforward } from "./sudo.js"
//const bodyParser = require('body-parser');
const express = require('express');
const http = express();
const ip = require('ip');
const os = require('os');
//const io = require('socket.io');
const path = require('node:path');


const IPNUM = 10;
var data = {
    status: 0,
    path: "",
    listen_port: 3000,
    base_port: 5000,
    connect_address: ["", "", "", "", "", "", "", "", "", ""],
    device_address:  ["", "", "", "", "", "", "", "", "", ""],
    bcast_address:   ["", "", "", "", "", "", "", "", "", ""],
};

//http.use(bodyParser.urlencoded({ extended: true }));
//HTTPリクエストのボディをjsonで扱えるようになる
//http.use(bodyParser.json());
//http.use(express.static("public"));
//http.use('/public', express.static('/../public'));
http.use('/', express.static(__dirname+"/../../"));
http.use('/css', express.static("../../css"));

function server_listen(mode) {
    http.set('view engine', 'ejs');

    http.get('/regist', (req, res) => {
        alert("[Server]: Received from "+req.ip);
        let no = this.add_address(req.ip);
        let connect_port = data.base_port+no;

        if (no>=0) {
            data.status = 1;
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
        } else if (no == -2) {
            data.status = -2;
        }
        var s = data.status;
        data.status = 0;
        res.render('index.ejs', data);
        data.status = s;
        window.show(data);
    });
    /*
    http.get('/list', (req, res) => {
        data.status = 1;
        console.log("[Server]: Received from "+req.ip);
        res.render('list.ejs', data.device_address);
    });
    */
    http.get('/manual', (req, res) => {
        data.status = 1;
        console.log("[Server]: Received from "+req.ip);
        res.render('manual.ejs', "");
    });
    http.get('/select_chromedriver', (req, res) => {
        data.status = 1;
        console.log("[Server]: Received from "+req.ip);
        window.select();
    });
    http.listen(data.listen_port, '0.0.0.0', () => {
        //this.init();
        var ifaces = os.networkInterfaces();
        let i = 0;

        Object.keys(ifaces).forEach(function (ifname) {
            ifaces[ifname].forEach(function (iface) {
                if ("IPv4" === iface.family && iface.internal === false) {
                    data.device_address[i] = iface.address;
                    data.bcast_address[i] = ip.or(iface.address, ip.not(iface.netmask));
                    //iface.netmask;
                    i = i + 1;
                    console.log(iface);
                }
            });
        });
        console.log('[Server]: Start. listening on port:'+data.listen_port);
/*
        if (i > 1) {
            console.log(device_address);
            ipcRenderer.send('select', device_address);
        }
*/
        //this.server_address();
        //this.update();
        if (mode == true) {
            data.status = 1;
            data.path = path.resolve();
            window.show(data);
        }
      
    });

}


function init() {
    for (let i = 0; i < IPNUM; i++) {
        data.device_address[i] = 0;
        data.bcast_address[i] = 0;
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
            console.log("local:"+(data.base_port+i)+" -> "+ipaddr+":9515");
            set_portforward(data.base_port+i, ipaddr, 9515);
            //forward('localhost', String(BASEPORT+i), ipaddr, String(9515));
            return i;
        }
    }
    return -2;
}

/*
ipcRenderer.on('select', (event,arg) => {
    data.listen_address = device_address[arg];
    update();
    //console.log("arg=" + arg);
});
*/
