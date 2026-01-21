document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Inspirational quotes for students
  const quotes = [
    { text: "O sucesso é a soma de pequenos esforços repetidos dia após dia", author: "Robert Collier" },
    { text: "Acredite em si mesmo e tudo será possível", author: "Anônimo" },
    { text: "O único lugar onde o sucesso vem antes do trabalho é no dicionário", author: "Vidal Sassoon" },
    { text: "A educação é a arma mais poderosa que você pode usar para mudar o mundo", author: "Nelson Mandela" },
    { text: "Não espere por oportunidades extraordinárias. Agarre ocasiões comuns e faça delas grandes", author: "Orison Swett Marden" },
    { text: "Você é mais corajoso do que acredita, mais forte do que parece e mais inteligente do que pensa", author: "A.A. Milne" },
    { text: "O futuro pertence àqueles que acreditam na beleza de seus sonhos", author: "Eleanor Roosevelt" },
    { text: "Sua única limitação é você mesmo", author: "Anônimo" },
    { text: "Comece de onde você está. Use o que você tem. Faça o que você pode", author: "Arthur Ashe" },
    { text: "A persistência é o caminho do êxito", author: "Charles Chaplin" },
    { text: "Sonhe grande, trabalhe duro, mantenha o foco e cerque-se de boas pessoas", author: "Anônimo" },
    { text: "O conhecimento é poder, mas o entusiasmo puxa o interruptor", author: "Ivern Ball" },
    { text: "Não deixe o que você não pode fazer interferir no que você pode fazer", author: "John Wooden" },
    { text: "A diferença entre ganhar e perder é, na maioria das vezes, não desistir", author: "Walt Disney" },
    { text: "Seja a mudança que você quer ver no mundo", author: "Mahatma Gandhi" }
  ];

  // Function to display quote of the day
  function displayQuoteOfTheDay() {
    const quoteText = document.getElementById("quote-text");
    const quoteAuthor = document.getElementById("quote-author");
    
    // Get a random quote each time the page is refreshed
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[quoteIndex];
    
    quoteText.textContent = quote.text;
    quoteAuthor.textContent = `- ${quote.author}`;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants.length > 0
          ? `<ul class="participants-list">
              ${details.participants.map(email => `
                <li>
                  <span class="participant-email">${email}</span>
                  <button class="delete-icon" data-activity="${name}" data-email="${email}" title="Remove participant">🗑️</button>
                </li>
              `).join('')}
            </ul>`
          : '<p class="no-participants">No participants yet</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-header"><strong>Participants:</strong></p>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle delete participant
  async function deleteParticipant(activity, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");
        
        // Refresh activities list
        await fetchActivities();
        
        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }
    } catch (error) {
      messageDiv.textContent = "Failed to unregister participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering participant:", error);
    }
  }

  // Add event listener for delete icons
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-icon")) {
      const activity = event.target.dataset.activity;
      const email = event.target.dataset.email;
      
      if (confirm(`Are you sure you want to unregister ${email} from ${activity}?`)) {
        deleteParticipant(activity, email);
      }
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        
        // Refresh activities list
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  displayQuoteOfTheDay();
  fetchActivities();
});
