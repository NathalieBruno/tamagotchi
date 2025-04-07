class Tamagotchi {
  constructor(name, animalType) {
    this.name = name;
    this.animalType = animalType;
    this.energy = 50;
    this.fullness = 50;
    this.happiness = 50;
    this.id = Date.now().toString();
    this.timer = null;
  }

  updateStatus(status, change) {
    let newValue = this[status] + change;
    this[status] = Math.max(0, Math.min(100, newValue));
  }

  decreaseStatus() {
    this.updateStatus("energy", -15);
    this.updateStatus("fullness", -15);
    this.updateStatus("happiness", -15);
  }

  nap() {
    this.updateStatus("energy", 40);
    this.updateStatus("happiness", -10);
    this.updateStatus("fullness", -10);
    return `Du vilade med ${this.name}`;
  }

  play() {
    this.updateStatus("happiness", 30);
    this.updateStatus("energy", -10);
    this.updateStatus("fullness", -10);
    return `Du lekte med ${this.name}`;
  }

  eat() {
    this.updateStatus("fullness", 30);
    this.updateStatus("happiness", 5);
    this.updateStatus("energy", -15);
    return `Du matade ${this.name}`;
  }

  hasRunAway() {
    return this.energy === 0 || this.fullness === 0 || this.happiness === 0;
  }

  getEmoji() {
    let emojis = {
      chicken: "🐣",
      fish: "🐠",
      panda: "🐼",
      bird: "🦜",
    };
    return emojis[this.animalType];
  }
}

class Game {
  constructor() {
    this.pets = [];
    this.maxPets = 4;

    document.querySelector("#create-pet-form").addEventListener("submit", (event) => {
      event.preventDefault();
      this.choosePet();
    });
  }

  choosePet() {
    // Deklarerar och hämtar värdena från mina input-fält
    let nameInput = document.querySelector("#pet-name");
    let typeSelect = document.querySelector("#pet-type");
    let name = nameInput.value.trim();
    let animalType = typeSelect.value;

    if (this.pets.length >= this.maxPets) {
      this.logActivity("Du kan inte adoptera fler än 4 st husdjur åt gången!");
      return;
    }

    let pet = new Tamagotchi(name, animalType);
    this.pets.push(pet);
    this.logActivity(`Välkommen till familjen ${pet.name} ${pet.getEmoji()} `);
    this.startTimer(pet);
    this.renderPets();
    document.querySelector("#create-pet-form").reset();
  }

  startTimer(pet) {
    pet.timer = setInterval(() => {
      pet.decreaseStatus();

      if (pet.hasRunAway()) {
        this.petRunsAway(pet);
      } else {
        this.updatePetUI(pet);
      }
    }, 10000);
  }

  petRunsAway(pet) {
    clearInterval(pet.timer);
    this.logActivity(`Å nej ${pet.name} sprang iväg! 💨`);
    // Använd filter för att inte förändra orginalarrayen
    this.pets = this.pets.filter((currentPet) => currentPet.id !== pet.id);
    this.renderPets();
  }

  performActivity(petId, activity) {
    let pet = this.pets.find((currentPet) => currentPet.id === petId);
    let message = pet[activity]();
    this.logActivity(message);

    if (pet.hasRunAway()) {
      this.petRunsAway(pet);
    } else {
      this.updatePetUI(pet);
    }
  }

  //mina UI-metoder

  logActivity(message) {
    let activityLog = document.querySelector(".activity-log");
    let entry = document.createElement("p");
    entry.textContent = message;
    activityLog.prepend(entry);
  }

  renderPets() {
    let petsContainer = document.querySelector("#pets-container");
    petsContainer.innerHTML = "";
    if (this.pets.length === 0) {
      let emptyState = document.createElement("p");
      emptyState.textContent = "Alla dina husdjur har sprungit iväg, adoptera nya för att börja om spelet :)";
      emptyState.classList.add("empty-state");
      petsContainer.append(emptyState);
      return;
    }
    this.pets.forEach((pet) => {
      let petDevice = this.createPet(pet);
      petsContainer.append(petDevice);
    });
  }

  updatePetStatus(petDevice, pet) {
    petDevice.querySelector(".status-fill.energy").style.width = pet.energy + "%";
    petDevice.querySelector(".status-fill.fullness").style.width = pet.fullness + "%";
    petDevice.querySelector(".status-fill.happiness").style.width = pet.happiness + "%";
  }

  createPet(pet) {
    let petTemplate = document.querySelector("#pet-template");
    let petDevice = petTemplate.content.cloneNode(true).querySelector(".pet-device");

    petDevice.classList.add(pet.animalType);
    petDevice.dataset.petId = pet.id;

    petDevice.querySelector(".pet-name").textContent = pet.name;
    petDevice.querySelector(".pet-icon").textContent = pet.getEmoji();

    this.updatePetStatus(petDevice, pet);

    petDevice.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        this.performActivity(pet.id, button.dataset.action);
      });
    });

    return petDevice;
  }

  updatePetUI(pet) {
    let petDevice = document.querySelector(`.pet-device[data-pet-id="${pet.id}"]`);
    if (!petDevice) return;
    this.updatePetStatus(petDevice, pet);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let game = new Game();
});
