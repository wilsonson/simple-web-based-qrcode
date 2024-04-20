const QRcode = require('qrcode');
const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 3000;

const ecLevels = ['L', 'M', 'Q', 'H'];

const runtimeSettings = {
    cacheControl: process.env.NODE_ENV==='production' ? 'max-age=604800' : 'no-cache',
    etagEnabled:  process.env.NODE_ENV==='production',
    expressPort: 3000,
    xPoweredBy: false
}

app.use(morgan('combined'));
app.set('x-powered-by', runtimeSettings.xPoweredBy) 
app.set('etag', runtimeSettings.etagEnabled);

app.get('/', (req,res)=>{
    res.send('Hello World!');
});

app.get('/qrcode', (req,res)=>{
    if (req.query.cht && req.query.cht.toLowerCase()==='qr' && req.query.chl && req.query.chs){
        const qrContext = req.query.chl.toString();
        var opts = {
            width: 200,
            errorCorrectionLevel: 'L',
            margin: 4
        };

        opts.width = parseInt(req.query.chs.split('x')[0],10);
        const chldArray = (req.query.chld || '').split('|');        
        if (chldArray.length > 0 && ecLevels.includes(chldArray[0].trim().toUpperCase())){
            opts.errorCorrectionLevel = chldArray[0].trim().toUpperCase();
        }
        if (chldArray.length > 1 ){
            opts.margin = parseInt(chldArray[1]) || 4;
        }        
        QRcode.toBuffer(qrContext, opts, (err,b)=>{                  
            if (err)
                throw err;
            res.type('png');
            res.setHeader('Cache-Control', runtimeSettings.cacheControl);
            let result = res.send(b);
        });    
    }
    else{
        res.status(400).send("Invalid request.");
    }
});

app.listen(runtimeSettings.expressPort,()=>{
    console.log(`Express started on port ${runtimeSettings.expressPort}.`);
    console.log(`Runtime settings: ${JSON.stringify(runtimeSettings)}`);
});
