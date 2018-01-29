import http from 'http'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { port, hostname, pathRoot } from '../config'
import { promisify } from 'util'

const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

const server = http.createServer(async (req, res) => {
    const filePath = path.join(pathRoot, req.url)

    try {
        const stats = await stat(filePath)
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
    
        if (stats.isFile()) {
            fs.createReadStream(filePath).pipe(res)
        } else if (stats.isDirectory()) {
            const files = await readdir(filePath)
            res.end(files.join(','))
        }   
    } catch (error) {
        console.error(error)
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain')
        res.end(`${filePath} is not a directory or file\n ${error}`)
    }
})

server.listen(port, hostname, () => {
    console.info(chalk.green(`Server running at http://${hostname}:${port}`))
})