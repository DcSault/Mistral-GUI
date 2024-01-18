require('dotenv').config();
const express = require('express');

let MistralClient; 

// Dynamically import MistralClient
import('@mistralai/mistralai').then(({ default: Client }) => {
  MistralClient = Client;
  console.log("MistralClient loaded successfully");
}).catch(error => {
  console.error('Error loading MistralClient:', error);
});

const app = express();
const port = process.env.PORT || 3000; 

app.use(express.json()); // Middleware to parse JSON
app.use(express.static('public')); 

const sessions = {}; 

// Route to handle chat requests
app.post('/chat', async (req, res) => {
    try {
      const userMessage = req.body.message;
      const sessionId = req.body.sessionId;
      const modelName = req.body.modelName;
  
      console.log("Message reçu de l'utilisateur :", userMessage);
  
      if (!modelNameValid(modelName)) {
        console.error("Nom de modèle invalide :", modelName);
        return res.status(400).send('Nom de modèle invalide');
      }
  
      if (!MistralClient) {
        console.error("MistralClient n'est pas chargé");
        return res.status(500).send('Erreur de chargement de MistralClient');
      }
  
      const apiKey = process.env.MISTRAL_API_KEY;
      const client = new MistralClient(apiKey);
  
      if (!sessions[sessionId]) {
        console.log("Création d'une nouvelle session :", sessionId);
        sessions[sessionId] = [];
      }
  
      const lastMessage = sessions[sessionId][sessions[sessionId].length - 1];
  
      if (lastMessage && lastMessage.content === userMessage) {
        console.log("Message dupliqué détecté, ignorant la requête...");
        return res.status(200).send('Message dupliqué détecté, ignorant la requête...');
      }
  
      sessions[sessionId].push({ role: 'user', content: userMessage });
  
      console.log(`Envoi de la demande à Mistral avec les données suivantes pour la session ${sessionId} :`, sessions[sessionId]);
  
      const chatResponse = await client.chat({
        model: modelName,
        messages: sessions[sessionId],
      });
  
      console.log(`Réponse reçue de Mistral pour la session ${sessionId} :`, chatResponse);
  
      let replyContent;
  
      if (chatResponse.choices && chatResponse.choices.length > 0) {
        replyContent = chatResponse.choices[0].message.content;
        sessions[sessionId][sessions[sessionId].length - 1].content = replyContent;
        res.json({ reply: replyContent });
      } else {
        throw new Error('Réponse invalide ou manquante de Mistral');
      }
    } catch (error) {
      console.error('Erreur lors de la communication avec Mistral AI :', error);
      res.status(400).send('Réponse invalide ou manquante de Mistral');
    }
  });
    

function modelNameValid(modelName) {
    return ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-embed'].includes(modelName);
}

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
