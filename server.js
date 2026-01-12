require('dotenv').config()
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Room management
const rooms = new Map()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`)

    socket.on('join-room', (roomId) => {
      // Leave previous room
      const previousRoom = [...socket.rooms].find((r) => r !== socket.id)
      if (previousRoom) {
        socket.leave(previousRoom)
        socket.to(previousRoom).emit('user-left', { userId: socket.id })
        if (rooms.has(previousRoom)) {
          rooms.get(previousRoom).delete(socket.id)
        }
      }

      // Join new room
      socket.join(roomId)

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
      }

      const isInitiator = rooms.get(roomId).size === 0
      rooms.get(roomId).add(socket.id)

      const roomSize = rooms.get(roomId).size
      console.log(`[Socket] ${socket.id} joined room ${roomId} (${roomSize} users, initiator: ${isInitiator})`)

      // Send room info to the joining user
      socket.emit('room-info', { count: roomSize, isInitiator })

      // Notify other users in the room
      socket.to(roomId).emit('user-joined', { userId: socket.id })

      // If 2 users, signal ready
      if (roomSize === 2) {
        io.to(roomId).emit('room-ready', { roomId })
      }
    })

    socket.on('offer', ({ offer, roomId }) => {
      console.log(`[Socket] Offer from ${socket.id} in room ${roomId}`)
      socket.to(roomId).emit('offer', { offer, from: socket.id })
    })

    socket.on('answer', ({ answer, roomId }) => {
      console.log(`[Socket] Answer from ${socket.id} in room ${roomId}`)
      socket.to(roomId).emit('answer', { answer, from: socket.id })
    })

    socket.on('ice-candidate', ({ candidate, roomId }) => {
      socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id })
    })

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId)
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id)
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId)
        }
      }
      socket.to(roomId).emit('user-left', { userId: socket.id })
      console.log(`[Socket] ${socket.id} left room ${roomId}`)
    })

    socket.on('disconnect', () => {
      // Clean up all rooms
      rooms.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id)
          socket.to(roomId).emit('user-left', { userId: socket.id })
          if (users.size === 0) {
            rooms.delete(roomId)
          }
        }
      })
      console.log(`[Socket] Client disconnected: ${socket.id}`)
    })
  })

  httpServer.listen(port, hostname, () => {
    console.log('═══════════════════════════════════════════════════════════')
    console.log('   КОНВЕРГЕНЦИЯ - Web Application')
    console.log('   Телефония, Видеобайланыс және Деректер Тасымалы')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`   🌐 Server: http://${hostname}:${port}`)
    console.log(`   📡 Socket.IO: ws://${hostname}:${port}/api/socket`)
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`   Mode: ${dev ? 'Development' : 'Production'}`)
    console.log('═══════════════════════════════════════════════════════════')
  })
})
