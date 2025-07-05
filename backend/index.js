const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const routes = require('./routes');
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ status: 'RSC Backend API running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend RSC escuchando en puerto ${PORT}`);
}); 