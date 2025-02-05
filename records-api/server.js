const express = require('express');
const path = require('path');
require('dotenv').config();
const recordsRoutes = require('./routes/records');
const statisticsRoutes = require('./routes/statistics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/records', recordsRoutes);
app.use('/statistics', statisticsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
