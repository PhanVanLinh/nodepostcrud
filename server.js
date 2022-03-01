import express  from 'express'
import bodyParser from 'body-parser'
import { v4 as uuidv4 } from 'uuid'

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

app.get('/posts', async (req, res) => {
  await db.read()
  const { posts } = db.data 
  res.send({"data":posts})
})

app.post('/posts', async (req, res) => {
  await db.read()
  let id = uuidv4()
  let author = req.body.author
  let content = req.body.content
  if(!author || !content) {
    res.status(400).send({"error": "EMPTY_AUTHOR_OR_CONTENT"})
    return
  }
  let post = {
    "id": id,
  	"author": author,
  	"content": content
  }
  db.data.posts.push(post)
  await db.write()
  res.status(201).send({"data": {postId: id}})
})

app.delete('/posts/:id', async (req, res) => {
  let id = req.params.id
  await db.read()
  let posts = db.data.posts
  let postPosition = posts.findIndex(element => element.id == id);
  if(postPosition == -1) {
    res.status(400).send({"error": "NO_POST_FOUND"})
    return
  }
  posts.splice(postPosition, 1)
  await db.write()
  res.status(200).send({"data": {postPosition}})
})

app.put('/posts/:id', async (req, res) => {
  let id = req.params.id
  await db.read()
  let posts = db.data.posts
  let postPosition = posts.findIndex(element => element.id == id);
  if(postPosition == -1) {
    res.status(400).send({"error": "NO_POST_FOUND"})
    return
  }

  let author = req.body.author
  let content = req.body.content
  if(!author || !content) {
    res.status(400).send({"error": "EMPTY_AUTHOR_OR_CONTENT"})
    return
  }
  posts[postPosition].author = author
  posts[postPosition].content = content
  await db.write()
  res.status(200).send({"data": { "message": "Update post successfully"}})
})

const port = process.env.PORT || 3000
app.listen(port, function() {
	console.log("Listen on "+port)
});