import mongoose from "mongoose"

const projectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        default: "Untitled Project"
    }
})

const project = mongoose.model('project', projectSchema)

export default project;