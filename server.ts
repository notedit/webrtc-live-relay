import Server from './src/server'

const server = new Server({})

server.listen(4999, '0.0.0.0', () => {
    console.log('listen on port ', 4999)
})
