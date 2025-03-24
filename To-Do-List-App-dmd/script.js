document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM entièrement chargé et analysé");
    await fetchTasks(); // Charger les tâches existantes au démarrage

    // Diminuer la vitesse de lecture de la vidéo
    const video = document.getElementById('backgroundVideo');
    video.playbackRate = 1.2; // Ajustez cette valeur pour changer la vitesse (1.0 est la vitesse normale)

    // Ajouter une nouvelle tâche en cliquant sur le bouton
    document.getElementById('addTask').addEventListener('click', (event) => {
        event.preventDefault(); // Empêche le comportement par défaut
        addTask();
    });

    // Ajouter une nouvelle tâche en appuyant sur la touche "Entrée"
    document.getElementById('taskInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêche le comportement par défaut
            addTask();
        }
    });

    // Initialiser l'animation Lottie pour le fond
    const lottieBackground = lottie.loadAnimation({
        container: document.getElementById('lottieBackground'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'animations/Hacker icon Lottie 02.json' // Chemin vers votre fichier JSON Lottie
    });

    // Rendre l'animation responsive
    window.addEventListener('resize', () => {
        lottieBackground.resize();
    });
});

// Fonction pour récupérer et afficher les tâches depuis l'API
async function fetchTasks() {
    try {
        const response = await fetch("http://localhost:3000/tasks");
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const tasks = await response.json();
        console.log("Tâches récupérées :", tasks);

        const taskList = document.getElementById("taskList");
        taskList.innerHTML = ""; // Nettoie la liste avant d'ajouter les nouvelles tâches

        tasks.forEach(task => addTaskToDOM(task));
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
    }
}

// Fonction pour ajouter une tâche à la base de données et l'afficher
async function addTask() {
    const input = document.getElementById("taskInput");
    const descriptionInput = document.getElementById("descriptionInput");
    const title = input.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        console.log("Champ vide, rien à ajouter.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur du serveur :", errorText);
            throw new Error("Erreur lors de l'ajout de la tâche");
        }

        const newTask = await response.json();
        addTaskToDOM(newTask);
        input.value = ""; // Réinitialiser l'input
        descriptionInput.value = ""; // Réinitialiser l'input de description

        // Jouer l'animation Lottie et afficher le message
        const animationOverlay = document.getElementById('animationOverlay');
        const lottiePlayer = document.getElementById('lottiePlayer');
        const message = document.getElementById('message');
        animationOverlay.style.display = 'flex';
        message.style.display = 'block';
        lottiePlayer.loop = true;
        lottiePlayer.play();

        // Masquer l'animation et le message après 0,5 secondes
        setTimeout(() => {
            animationOverlay.style.display = 'none';
            message.style.display = 'none';
        }, 1200);

    } catch (error) {
        console.error("Erreur :", error);
    }
}

// Fonction pour ajouter une tâche au DOM
function addTaskToDOM(task) {
    const taskList = document.getElementById("taskList");

    // Création de l'élément conteneur
    const taskItem = document.createElement("div");
    taskItem.classList.add("task");
    taskItem.setAttribute("data-id", task._id); // Ajouter l'ID de la tâche comme attribut de données
    if (task.completed) taskItem.classList.add("completed"); // Ajoute le style si la tâche est terminée

    // Création du conteneur pour le texte de la tâche et la description
    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");

    // Création du nom de la tâche
    const taskName = document.createElement("h2");
    taskName.classList.add("task-name");
    taskName.textContent = task.title;

    // Création de la description de la tâche
    const taskDescription = document.createElement("p");
    taskDescription.classList.add("task-description");
    taskDescription.textContent = task.description;

    // Ajout du nom de la tâche et de la description au conteneur de texte
    taskContent.appendChild(taskName);
    taskContent.appendChild(taskDescription);

    // Création du conteneur pour les boutons
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Bouton pour marquer comme terminé
    const completeBtn = document.createElement("button");
    completeBtn.classList.add("complete-btn");
    completeBtn.innerHTML = "✔";
    completeBtn.addEventListener("click", async () => {
        await toggleTaskCompletion(task._id, taskItem);
    });

    // Bouton pour éditer la tâche
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.innerHTML = "✏️";
    editBtn.addEventListener("click", () => {
        editTask(task._id, taskName, taskDescription);
    });

    // Bouton pour supprimer la tâche
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = "❌";
    deleteBtn.addEventListener("click", async () => {
        await deleteTask(task._id, taskItem);
    });

    // Ajout des boutons au conteneur
    buttonContainer.appendChild(completeBtn);
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);

    // Ajout des éléments au conteneur de la tâche
    taskItem.appendChild(taskContent);
    taskItem.appendChild(buttonContainer);
    taskList.appendChild(taskItem);

    // Ajout de l'événement de sélection de la tâche
    taskItem.addEventListener("click", () => {
        document.querySelectorAll(".task").forEach(item => item.classList.remove("selected"));
        taskItem.classList.add("selected");
    });
}

// Fonction pour basculer l'état complété d'une tâche
async function toggleTaskCompletion(taskId, taskItem) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}/toggle`, { method: "PATCH" });
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const updatedTask = await response.json();
        console.log("Tâche mise à jour :", updatedTask);

        if (updatedTask.completed) {
            taskItem.classList.add("completed");
        } else {
            taskItem.classList.remove("completed");
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche :", error);
    }
}

// Fonction pour supprimer une tâche
async function deleteTask(taskId, taskItem) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, { method: "DELETE" });
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        taskItem.remove(); // Retirer la tâche et la description du DOM
    } catch (error) {
        console.error("Erreur lors de la suppression de la tâche :", error);
    }
}

// Fonction pour éditer une tâche
async function editTask(taskId, taskTextElement, taskDescriptionElement) {
    // Afficher la boîte de dialogue
    const modal = document.getElementById("editTaskModal");
    const closeModal = document.getElementsByClassName("close")[0];
    const saveChangesBtn = document.getElementById("saveTaskChanges");
    const editTaskTitle = document.getElementById("editTaskTitle");
    const editTaskDescription = document.getElementById("editTaskDescription");

    // Pré-remplir les champs de saisie avec les valeurs actuelles
    editTaskTitle.value = taskTextElement.textContent;
    editTaskDescription.value = taskDescriptionElement.textContent;

    modal.style.display = "block";

    // Fermer la boîte de dialogue lorsque l'utilisateur clique sur (x)
    closeModal.onclick = function() {
        modal.style.display = "none";
    }

    // Fermer la boîte de dialogue lorsque l'utilisateur clique en dehors de la boîte de dialogue
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Enregistrer les modifications lorsque l'utilisateur clique sur le bouton "Enregistrer"
    saveChangesBtn.onclick = async function() {
        const newTitle = editTaskTitle.value.trim();
        const newDescription = editTaskDescription.value.trim();

        if (newTitle === "" || newDescription === "") {
            alert("Les champs ne peuvent pas être vides");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle, description: newDescription })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut : ${response.status}`);
            }

            const updatedTask = await response.json();
            taskTextElement.textContent = updatedTask.title; // Mettre à jour le texte de la tâche dans le DOM
            taskDescriptionElement.textContent = updatedTask.description; // Mettre à jour la description de la tâche dans le DOM

            modal.style.display = "none"; // Fermer la boîte de dialogue
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la tâche :", error);
        }
    }
}