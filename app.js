import { db, storage, collection, addDoc, getDocs, orderBy, query } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const imageGallery = document.getElementById("imageGallery");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const noteInput = document.getElementById("noteInput");
const notesSection = document.getElementById("notesSection");
const viewGalleryBtn = document.getElementById("viewGalleryBtn");
const viewNotesBtn = document.getElementById("viewNotesBtn");
const galleryModal = document.getElementById("galleryModal");
const notesModal = document.getElementById("notesModal");
const closeGalleryModal = document.getElementById("closeGalleryModal");
const closeNotesModal = document.getElementById("closeNotesModal");

// Upload Image to Firebase Storage
uploadBtn.addEventListener("click", async function() {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }

    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Save Image URL to Firestore
    await addDoc(collection(db, "images"), {
        url: downloadURL,
        timestamp: new Date()
    });

    loadImages();
});

// Load Images from Firestore
async function loadImages() {
    const q = query(collection(db, "images"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    imageGallery.innerHTML = "";
    querySnapshot.forEach(doc => {
        const img = document.createElement("img");
        img.src = doc.data().url;
        img.width = 100;
        imageGallery.appendChild(img);
    });
}

// Save Note to Firestore
saveNoteBtn.addEventListener("click", async function() {
    const noteText = noteInput.value.trim();
    if (noteText === "") {
        alert("Please write something.");
        return;
    }

    await addDoc(collection(db, "notes"), {
        text: noteText,
        timestamp: new Date()
    });

    noteInput.value = "";
    loadNotes();
});

// Load Notes from Firestore
async function loadNotes() {
    const q = query(collection(db, "notes"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    notesSection.innerHTML = "";
    querySnapshot.forEach(doc => {
        const noteDiv = document.createElement("div");
        noteDiv.textContent = doc.data().text;
        notesSection.appendChild(noteDiv);
    });
}

// Event listeners for opening modals
viewGalleryBtn.addEventListener("click", function() {
    loadImages();
    galleryModal.style.display = "block";
});

viewNotesBtn.addEventListener("click", function() {
    loadNotes();
    notesModal.style.display = "block";
});

// Event listeners for closing modals
closeGalleryModal.addEventListener("click", function() {
    galleryModal.style.display = "none";
});

closeNotesModal.addEventListener("click", function() {
    notesModal.style.display = "none";
});

// Close modals when clicking outside of them
window.addEventListener("click", function(event) {
    if (event.target == galleryModal) {
        galleryModal.style.display = "none";
    }
    if (event.target == notesModal) {
        notesModal.style.display = "none";
    }
});

// Load Data on Page Load
loadImages();
loadNotes();