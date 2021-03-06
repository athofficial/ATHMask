const path=require('path')
const express=require('express')
const createBundle=require('./util').createBundle
const serveBundle=require('./util').serveBundle
module.exports=createMetamascaraServer
function createMetamascaraServer(){const metamascaraBundle=createBundle(path.join(__dirname,'/../src/mascara.js'))
const proxyBundle=createBundle(path.join(__dirname,'/../src/proxy.js'))
const uiBundle=createBundle(path.join(__dirname,'/../src/ui.js'))
const backgroundBuild=createBundle(path.join(__dirname,'/../src/background.js'))
const server=express()
serveBundle(server,'/ui.js',uiBundle)
server.use(express.static(path.join(__dirname,'/../ui/'),{setHeaders:(res)=>res.set('X-Frame-Options','DENY')}))
server.use(express.static(path.join(__dirname,'/../../dist/chrome')))
serveBundle(server,'/metamascara.js',metamascaraBundle)
serveBundle(server,'/proxy/proxy.js',proxyBundle)
server.use('/proxy/',express.static(path.join(__dirname,'/../proxy')))
serveBundle(server,'/background.js',backgroundBuild)
return server}