import express from "express"
import morgan from "morgan"
import {createProxyMiddleware} from "http-proxy-middleware"

const app = express()
app.use(morgan("combined"))

app.get("/api/status/healthz", (req,res)=>{
   res.status(200).json({status: 'ok'})
}) // batata hai server zinda hai ya nhi 

app.get("/api/status/readyz", (req,res)=>{
   res.status(200).json({status: 'ready'})
}) // batata haii ki server ready(traffic ko aage forward kr sakti hai ya nhi) hai ya nhi


// pod1.preview.localhost
// pod1.agent.localhost
// ye dono type ki url aarhi hogi hamare same server(router-server) ke pass!!!

const proxies = {}
const agentProxies = {}

function getProxy(sandboxId){

    const target = `http://sandbox-service-${sandboxId}`; // construct target URL based on sandboxId

    if(!proxies[sandboxId]){
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true, // enable WebSocket proxying
        })
    }
    return proxies[sandboxId]
}

function getAgentProxy(sandboxId){

    const target = `http://sandbox-service-${sandboxId}:3000`; // construct target URL based on sandboxId

    if(!agentProxies[sandboxId]){
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true, // enable WebSocket proxying
        })
    }
    return agentProxies[sandboxId]
}

app.use((req, res, next) =>{
    const host = req.headers.host;
    const sandboxId = host.split('.')[0]; // extract sandboxId from subdomain
    
    
    if(host.split('.')[1] === 'agent'){
        return getAgentProxy(sandboxId)(req,res,next);
    }
    else if(host.split('.')[1] === 'preview'){
        return getProxy(sandboxId)(req,res,next);
    }

})

export default app