const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

// Maak een nieuwe Express app
const app = express();

// Gebruik body-parser om JSON-gegevens te verwerken
app.use(bodyParser.json());

// Maak een verbinding met je Azure SQL Database (vervang de gegevens met je eigen informatie)
const sequelize = new Sequelize('mssql://username:password@your-server.database.windows.net:1433/your-database', {
  dialect: 'mssql',
  dialectOptions: {
    encrypt: true, // Dit is nodig voor Azure SQL Database
  },
  logging: false, // Zet logging uit voor nettere uitvoer
});

// Maak een model voor de taak
const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Synchroniseer de database
sequelize.sync()
  .then(() => console.log('Database is gesynchroniseerd!'))
  .catch((err) => console.log('Fout bij synchronisatie: ', err));

// Route om een nieuwe taak toe te voegen
app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    const newTask = await Task.create({ title });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Er is iets misgegaan bij het toevoegen van de taak.' });
  }
});

// Route om alle taken op te halen
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Er is iets misgegaan bij het ophalen van de taken.' });
  }
});

// Route om een taak te markeren als voltooid
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Taak niet gevonden.' });
    }
    task.completed = true;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Er is iets misgegaan bij het bijwerken van de taak.' });
  }
});

// Route om een taak te verwijderen
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Taak niet gevonden.' });
    }
    await task.destroy();
    res.status(200).json({ message: 'Taak verwijderd!' });
  } catch (error) {
    res.status(500).json({ error: 'Er is iets misgegaan bij het verwijderen van de taak.' });
  }
});

// Start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
