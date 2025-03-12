import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readline from "readline";

// Charger les variables d'environnement
config();
const apiKey = process.env.APP_KEY;

if (!apiKey) {
  throw new Error("❌ APP_KEY est manquant dans le fichier .env !");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Création de l'interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Historique des messages (sans rôle "system")
const chatHistory = [];

// Fonction pour poser une question avec une promesse
const askQuestion = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Fonction principale du chatbot
const chat = async () => {
  console.log("💬 Chatbot activé ! Tape 'exit' pour quitter.\n");

  while (true) {
    // Attendre la question de l'utilisateur
    const userInput = await askQuestion("👤 Toi : ");

    if (userInput.toLowerCase() === "exit") {
      console.log("👋 Fin de la conversation !");
      rl.close();
      break;
    }

    // Ajouter l'entrée de l'utilisateur à l'historique
    chatHistory.push({ role: "user", parts: [{ text: userInput }] });

    try {
      // Envoyer l'historique complet à l'API (sans "system")
      const result = await model.generateContent({ contents: chatHistory });
      const botResponse = result.response.text();

      console.log("🤖 Chatbot :", botResponse, "\n");

      // Ajouter la réponse du bot à l'historique
      chatHistory.push({ role: "model", parts: [{ text: botResponse }] });

    } catch (error) {
      console.error("❌ Erreur API :", error.message);
    }
  }
};

// Lancer le chatbot
chat();