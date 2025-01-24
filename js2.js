// JavaScript for the enhanced game functionality

// API URLs and Keys
const CATEGORY_API_URL = "https://opentdb.com/api_category.php";
const TRIVIA_API_BASE_URL = "https://opentdb.com/api.php";
const PEXELS_API_URL = "https://api.pexels.com/v1/search";
const PEXELS_API_KEY = "PFvrJcB1kFNPv2joOp3WZeLwACHBhlhRNq0aqubxgGk7mQpXiSJG8wMs"; // Replace with your Pexels API key

// Game State Variables
let questions = [];
let currentQuestionIndex = 0;
let isJumping = false;
let isGameOver = false;
let score = 0;

// DOM Elements
const startScreen = document.getElementById("start-screen");
const dino = document.getElementById("dino");
const Body = document.getElementById("body");
const obstacle = document.getElementById("obstacle");
const gameOverScreen = document.getElementById("gameOver");
const questionContainer = document.getElementById("question");
const answersContainer = document.getElementById("answers");

// DOMContentLoaded Listener
document.addEventListener("DOMContentLoaded", () => {
    console.log('if u see this this is updated');

    // Load the Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').then(function (registration) {
                console.log('Service Worker registered with scope:', registration.scope);
            }, function (error) {
                alert("womp womp your wifi not working so no trivia so in honor of the dino game just press space to jump XO XO");
                document.addEventListener("keydown", (event) => {
                    if (event.code === "Space" && !isJumping && !isGameOver) {
                        dinoJump();
                    }
                });
                console.log('Service Worker registration failed:', error);
            });
        });
    }

    // Start Game Button
    document.getElementById("start-button").onclick = () => {
        startgame();
    };

    // Collision Checker Loop
    setInterval(() => {
      if (!isGameOver) checkCollision();
  }, 10);

    // Initialize Categories
    populateCategories();
});
function startCollisionCheck() {
  // Clear any previous intervals to avoid multiple intervals running at the same time
  if (window.collisionInterval) {
      clearInterval(window.collisionInterval);
  }

  // Set a new interval for collision checking
  window.collisionInterval = setInterval(() => {
      if (!isGameOver) {
          checkCollision();
      }
  }, 10); // Adjust the timing based on your needs
}
// Dino Jump Function
function dinoJump() {
    if (isJumping || isGameOver) return;

    isJumping = true;
    dino.classList.add("jump");

    setTimeout(() => {
        dino.classList.remove("jump");//lol jump is a class
        isJumping = false;
    }, 1200); // Longer jump
}

// End Game Function
function endGame() {
    console.log('U lost L loser roger doss would never');
    isGameOver = true;
    gameOverScreen.hidden = false;
    obstacle.style.animationPlayState = "paused";
    document.querySelector(".ground").style.animationPlayState = "paused";

    document.getElementById("game-screen").hidden = true;

    document.getElementById("end-game").innerHTML = `
        <div class="game-over-screen">
            <h1 class="game-over-title">Game Over</h1>
            <p class="game-over-message">lol you lost roger doss would NEVER but you can try again</p>
            <button class="restart-button" onclick="restartGame()">Restart</button>
        </div>`;
}
// JavaScript for Trivia Dino Game

// Obstacle Animation
function startObstacleAnimation() {
  obstacle.style.animation = "moveObstacle 6s linear infinite"; 
}

// Collision Detection
function checkCollision() {
  const dinoRect = dino.getBoundingClientRect();//chat gpt
  const obstacleRect = obstacle.getBoundingClientRect();//chat gpt

  if (
      dinoRect.x < obstacleRect.x + obstacleRect.width &&
      dinoRect.x + dinoRect.width > obstacleRect.x &&
      dinoRect.y < obstacleRect.y + obstacleRect.height &&
      dinoRect.height + dinoRect.y > obstacleRect.y
  ) {
      endGame();
  }
}

// Populate Trivia Categories
function populateCategories() {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = "";

  const triviaCategories = [
      { id: 9, name: "General Knowledge" },
      { id: 10, name: "Books" },
      { id: 11, name: "Film" },
      { id: 12, name: "Music" },
      { id: 13, name: "Musicals & Theatres" },
      { id: 14, name: "Television" },
      { id: 15, name: "Video Games" },
      { id: 16, name: "Board Games" },
      { id: 17, name: "Science & Nature" },
      { id: 18, name: "Computers" },
      { id: 19, name: "Mathematics" },
      { id: 20, name: "Mythology" },
      { id: 21, name: "Sports" },
      { id: 22, name: "Geography" },
      { id: 23, name: "History" },
      { id: 24, name: "Politics" },
      { id: 25, name: "Art" },
      { id: 26, name: "Celebrities" },
      { id: 27, name: "Animals" },
      { id: 28, name: "Vehicles" },
      { id: 29, name: "Comics" },
      { id: 30, name: "Science: Gadgets" },
      { id: 31, name: "Japanese Anime & Manga" },
      { id: 32, name: "Cartoon & Animations" }
  ];

  triviaCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
  });
}

// Fetch Trivia Questions
function fetchQuestions(category) {
  const triviaUrl = `${TRIVIA_API_BASE_URL}?amount=10&category=${category}`;
  return fetch(triviaUrl)
      .then((response) => response.json())
      .then((data) => {
          questions = data.results;
          currentQuestionIndex = 0;
          showQuestion();
      })
      .catch((error) => console.error("Error fetching trivia questions:", error));
}

// Fetch Hint Image from Pexels API
function fetchImage(keyword) {
  fetch(`${PEXELS_API_URL}?query=${keyword}&per_page=1`, {
      headers: { Authorization: PEXELS_API_KEY }
  })
      .then(response => response.json())
      .then(data => {
          const imageElement = document.getElementById("image");
          const photo = data.photos[0];

          if (photo) {
              imageElement.src = photo.src.medium;
              imageElement.hidden = false;
          } else {
              imageElement.hidden = true;
          }
      })
      .catch(error => {
          console.error("Error fetching image:", error);
          document.getElementById("image").hidden = true;
      });
}

// Display a Question
function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
     fetchQuestions()
  }

  const currentQuestion = questions[currentQuestionIndex];
  questionContainer.innerHTML = currentQuestion.question;

  // Fetch image for the correct answer
  fetchImage(currentQuestion.correct_answer);

  // Populate answers
  answersContainer.innerHTML = "";
  const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  answers.sort(() => Math.random() - 0.5);

  answers.forEach((answer) => {
      const button = document.createElement("button");
      button.innerHTML = answer;

      // Handle answer click
      button.onclick = () => {
          if (answer === currentQuestion.correct_answer) {
              dinoJump(); // Jump on correct answer
          } else {
              console.log("Incorrect answer");
          }
          currentQuestionIndex++;
          showQuestion();
      };

      answersContainer.appendChild(button);
  });
}

// Restart the Game
function restartGame() {
    document.getElementById("screen-remover").innerHTML = `
        <div id="start-screen">
            <h1>Trivia Game</h1>
            <div>
                <label for="category">Category:</label>
                <select id="category"></select>
            </div>
            <button id="start-button" onclick="startgame()">Start Game</button>
            <button id="installButton" style="display: none">Install App</button>
        </div>`;
    document.getElementById("end-game").innerHTML = "";

    // Reset game variables
    isGameOver = false; // Reset the game state
    score = 0;          // Reset score

    // Reset obstacle animation
    obstacle.style.animation = "none"; // Clear existing animation
    void obstacle.offsetWidth;         // this is chat gpt 
    obstacle.style.animation = "";     // Reapply animation

    // Repopulate categories
    populateCategories();

    // Restart collision checking
    startCollisionCheck();
}


// Start the Game
function startgame() {
  const category = document.getElementById("category").value;
  document.getElementById("start-screen").hidden = true;
  document.getElementById("screen-remover").innerHTML = "";
  document.getElementById("game-screen").hidden = false;

  fetchQuestions(category).then(() => {
      startObstacleAnimation();
  });


  startCollisionCheck();
}

// Handle App Installation
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
      installButton.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
          console.log(choiceResult.outcome === 'accepted' ? 
              'User accepted the install prompt' : 
              'User dismissed the install prompt');
          deferredPrompt = null;
      });
  });
});
//most of the commenting was done by chat gpt bc im really bad at orgnizing my code but im confident i could explain all of them 
//the innitial code for the game was done by chat gpt but i had to change it bc it wasnt working properly so i had to msotly chamnge it
