const express = require('express');
const mongoose = require('mongoose');
const Log = require('./modules/Log.js');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());


URI = "mongodb+srv://jayaraj:5october2003@cluster0.1kzk6ik.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));

app.post('/logs', async (req, res) => {
    // console.log("Inside Server.js");
    // console.log('Log Data:', req.body);
  const { address, caseName, event, timestamp, result } = req.body;
  try {
    const log = new Log({ address, caseName, event, timestamp, result });
    await log.save();
    res.status(201).json({ message: 'Log saved successfully' });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ message: 'Error saving log' });
  }
});

app.get('/', (req, res) => {
    res.send({'status': 'Server is running'});
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// https://192.168.0.110:5000/