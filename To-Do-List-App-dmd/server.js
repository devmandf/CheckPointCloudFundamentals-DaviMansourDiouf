const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Ajouter ces lignes pour servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Modifier la route '/' pour servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('💾 Connecté à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion:', err));

const TaskSchema = new mongoose.Schema({
    title: String,
    description: String, // Ajoutez ce champ
    completed: Boolean
});
const Task = mongoose.model('Task', TaskSchema);

// Route pour récupérer toutes les tâches
app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.get('/', (req, res) => {
    res.send('🚀 API To-Do List opérationnelle ! Utilise /tasks pour voir les tâches.');
});

// Route pour ajouter une tâche
app.post("/tasks", async (req, res) => {
    try {
        const { title, description } = req.body; // Récupérez la description
        if (!title) return res.status(400).json({ error: "Le titre est requis" });

        const newTask = new Task({ title, description, completed: false }); // Incluez la description
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour marquer une tâche comme terminée
app.put('/tasks/:id', async (req, res) => {
    try {
        const { title, description } = req.body; // Récupérez la description
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, { title, description }, { new: true }); // Incluez la description
        if (!updatedTask) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }
        res.json(updatedTask);
    } catch (error) {
        res.status500.json({ error: "Erreur serveur" });
    }
});

// Route pour basculer l'état complété d'une tâche
app.patch('/tasks/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }
        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }
        await Task.findByIdAndDelete(req.params.id); // Supprimer définitivement la tâche
        res.json({ message: 'Tâche supprimée' });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Change this line at the bottom of the file
app.listen(process.env.PORT, () => console.log(`Serveur démarré sur http://localhost:${process.env.PORT} 🚀`));