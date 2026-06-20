// Holds a reference to the single Socket.IO server instance so that
// controllers/services (which don't create the server themselves) can
// emit events without importing server.js (which would be circular).
//
// server.js calls setIO(io) once, right after creating the Server.
// Anything else just does: `import { getIO } from '../socket/io.js'`.

let io = null;

const setIO = (instance) => {
  io = instance;
};

const getIO = () => io;

export { setIO, getIO };
