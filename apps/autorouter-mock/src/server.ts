import app from './index'


const port = process.env.MOCK_PORT || 3000;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
