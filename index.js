const express=require('express');
const app=express();
const port=6777;
var mdns = require('multicast-dns')()
const arpScan = require('arpscan');
const arp = require('node-arp');
const { exec } = require('child_process');
const axios=require('axios')
const net=require('net')



app.use('/print',async (req,res,next)=>{


    const isIPAddress = (str) => {
        const ipAddressRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
        return ipAddressRegex.test(str);
      };
      
      const getAliveIPs = async () => {
        return new Promise(async (resolve, reject) => {
          exec('arp -a', async (error, stdout, stderr) => {
            if (error) {
              console.error(`Error: ${error.message}`);
              return reject(error.message);
            }
      
            if (stderr) {
              console.error(`Command execution error: ${stderr}`);
              return reject(stderr);
            }
      
            const lines = stdout.split('\n').map(line => line.trim());
            const arpEntries = lines.slice(3).filter(line => line !== '');
            const ipAddresses = arpEntries.map(entry => entry.split(/\s+/)[0]);
            const filteredIPs = ipAddresses.filter(entry => isIPAddress(entry));
      
            const aliveIps = await Promise.all(filteredIPs.map(async ip => {
              return new Promise(resolveSocket => {
                const socket = new net.Socket();
                socket.setTimeout(1000); // Set a timeout for the socket connection attempt
      
                socket.on('error', () => {
                  console.log('Error connecting to', ip);
                  resolveSocket(false); // Resolve with false for IPs that are not alive
                });
      
                socket.connect(9100, ip, () => {
                  console.log('Connected to', ip);
                  socket.destroy(); // Close the socket connection
                  resolveSocket(ip); // Resolve with the alive IP
                });
              });
            }));
      
            resolve(aliveIps.filter(Boolean)); // Filter out false (not alive) values from the resolved array
          });
        });
      };
      
      // Example usage
      getAliveIPs()
        .then(aliveIps => {
            res.json(aliveIps)
          console.log('Alive IPs:', aliveIps);
        })
        .catch(error => {
          console.error('Error:', error);
        });



    // let ipAddress;
    // for (let ip = 0; ip < ips.length; ip++) {
    //     try {
            
    //         const response=await axios.get(`http://${}:9100`);
            

    
    //         if (response.status === 200) {
    //             console.log(`Request to ${ips[0]} successful!`);
    //             // console.log('Response data:', response.data);
    //             ipAddress=ips[ip];
    //           } else {


    //           }
    //     } catch (error) {
    //         console.log(error)            
    //     }        
    // }
    
    // ips.forEach(async ip=> {

    //     // const response=await fetch('http://192.168.0.210/');        
    //     // console.log(response)
    // });

    // await res.json(ips);

})

app.listen(port,()=>{
    console.log('.............port.....................',port)
})