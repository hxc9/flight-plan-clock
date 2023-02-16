import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';

const app = express();

app.use(morgan('combined'));

app.use('/ar-mock', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true,
  pathRewrite: {
    '^/ar-mock' : '/'
  },
}));
app.use('/ar-mock-gui', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true,
}))
app.use('/api', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true,
}))
app.use('/', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true,
}))


const port = process.env.GATEWAY_PORT || 3004;

const server =  app.listen(port);

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
