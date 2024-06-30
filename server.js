const restify = require('restify');
const { exec } = require('child_process');
const pino = require('pino');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const server = restify.createServer({
  name: 'NetworkToolsAPI',
  version: '1.0.0'
});

server.use(restify.plugins.queryParser());

const MAX_CONCURRENT_TASKS = 8;
let activeTasks = 0;
const requestQueue = [];

const executeCommand = (command, res, next) => {
  // Check if the command requires sudo
  if (command.startsWith('sudo')) {
    logger.warn(`Refusing to execute sudo command: ${command}`);
    res.send(403, { error: 'Upgrade to a better plan to perform this operation' });
    return next();
  }

  if (activeTasks >= MAX_CONCURRENT_TASKS) {
    logger.warn('Server is busy. Queuing request.');
    requestQueue.push({ command, res, next });
    return;
  }

  activeTasks++;
  logger.info(`Executing command: ${command}`);

  exec(command, (error, stdout, stderr) => {
    activeTasks--;
    processQueue();

    if (error) {
      logger.error(`Command failed: ${stderr}`);
      res.send(500, { error: stderr });
      return next();
    }

    res.send(200, { result: stdout });
    return next();
  });
};

const processQueue = () => {
  if (requestQueue.length > 0 && activeTasks < MAX_CONCURRENT_TASKS) {
    const { command, res, next } = requestQueue.shift();
    executeCommand(command, res, next);
  }
};

// Endpoint for dig
server.get('/dig', (req, res, next) => {
  const domain = req.query.domain;
  const type = req.query.type || 'A';

  if (!domain) {
    res.send(400, { error: 'Domain query parameter is required' });
    return next();
  }

  const command = `dig ${domain} ${type}`;
  executeCommand(command, res, next);
});

// Endpoint for ping
server.get('/ping', (req, res, next) => {
  const host = req.query.host;

  if (!host) {
    res.send(400, { error: 'Host query parameter is required' });
    return next();
  }

  const command = `ping -c 4 ${host}`;
  executeCommand(command, res, next);
});

// Endpoint for traceroute
server.get('/traceroute', (req, res, next) => {
  const host = req.query.host;

  if (!host) {
    res.send(400, { error: 'Host query parameter is required' });
    return next();
  }

  const command = `traceroute ${host}`;
  executeCommand(command, res, next);
});

// Endpoint for nmap
server.get('/nmap', (req, res, next) => {
  const host = req.query.host;
  const options = req.query.options || '';

  if (!host) {
    res.send(400, { error: 'Host query parameter is required' });
    return next();
  }

  // Check for nmap commands that might require sudo
  if (options.includes('-sS') || options.includes('-sU') || options.includes('-sO')) {
    logger.warn(`Refusing to execute nmap command with sudo-requiring options: nmap ${options} ${host}`);
    res.send(403, { error: 'Upgrade to a better plan to perform this operation' });
    return next();
  }

  const command = `nmap ${options} ${host}`;
  executeCommand(command, res, next);
});

// Health check endpoint
server.get('/health', (req, res, next) => {
  res.send(200, { status: 'OK' });
  return next();
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server shut down.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcing shutdown due to timeout.');
    process.exit(1);
  }, 10000); // Force shutdown after 10 seconds
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(8080, () => {
  logger.info(`${server.name} listening at ${server.url}`);
});
