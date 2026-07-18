import Redis from "ioredis"
import { deletePod } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

const redis = new Redis(process.env.REDIS_URL); // kuch bhi data ko redis pe likhne ke liye 

const subscriber = new Redis(process.env.REDIS_URL); // redis ko fire krne ke liye or event ko listen ke liye

export async function createSandboxKey(sandboxId){
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status: 'active'
    }), "EX", 60*20); // TTL: 120 seconds
}

subscriber.config('SET', 'notify-keyspace-events', 'Ex'); // redis jo event fire kr rha hoga usko hum listen krenge

subscriber.subscribe('__keyevent@0__:expired')

subscriber.on('message', async (channel,key)=>{
    console.log(`Key expired: ${key}`);

    const sandboxId = key.split(':')[1];

    await deletePod(sandboxId);
    await deleteService(sandboxId);
})

export default { subscriber }