import { Router } from "express";
import {createPod} from "../kubernetes/pod.js"
import {createService} from "../kubernetes/service.js"
import { createSandboxKey } from "../config/redis.js"
import { v7 as uuid } from "uuid"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import project from "../models/project.model.js";

const router = Router()

router.post("/project", authMiddleware, async(req,res)=>{
    const {title} = req.body

    const newProject = new project({
        user: req.user.id,
        title
    })

    await newProject.save();

    return res.status(201).json({
        message: "project created successfully",
        project: newProject
    })
})

router.post("/start",authMiddleware , async (req,res) => {

    const projectId = req.body.projectId;

    const project = await project.findOne({ _id: projectId, user: req.user.id});

    if(!project){
        return res.status(404).json({ message: 'Project not found or access denied'});
    }

  const sandboxId = uuid()

  await Promise.all([
    createPod(sandboxId, projectId),
    createService(sandboxId),
    createSandboxKey(sandboxId)
  ])

  return res.status(201).json({
    message: "sandbox environment created successfully",
    sandboxId,
    previewURL: `http://${sandboxId}.preview.localhost`
  })
})

router.get("/project",authMiddleware, async(req,res)=>{
    const projects = await project.find({user: req.user.id})

    return res.status(200).json({
        message: "projects retrieved successfully",
        projects
    })
})

export default router;