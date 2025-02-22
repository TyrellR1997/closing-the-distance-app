import { db, storage, collection, addDoc, getDocs, orderBy, query, deleteDoc } from "./firebase.js";
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
    alert("Saving note...");
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
});

async function loadNotes() {
    console.log("Loading notes...");
    const q = query(collection(db, "notes"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    notesSection.innerHTML = "";
    const notesByDate = {};

    querySnapshot.forEach(doc => {
        const noteData = doc.data();
        const noteTimestamp = new Date(noteData.timestamp.seconds * 1000);
        const dateKey = noteTimestamp.toLocaleDateString();

        if (!notesByDate[dateKey]) {
            notesByDate[dateKey] = [];
        }

        notesByDate[dateKey].push({ id: doc.id, ...noteData });
    });

    for (const date in notesByDate) {
        const dateHeader = document.createElement("h3");
        dateHeader.textContent = date;
        notesSection.appendChild(dateHeader);

        notesByDate[date].forEach(noteData => {
            const noteDiv = document.createElement("div");
            noteDiv.classList.add("note-envelope");

            const noteDate = document.createElement("div");
            noteDate.classList.add("note-date");
            const noteTimestamp = new Date(noteData.timestamp.seconds * 1000);
            noteDate.textContent = noteTimestamp.toLocaleDateString() + " " + noteTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            const noteContent = document.createElement("div");
            noteContent.classList.add("note-content");
            noteContent.textContent = noteData.text.length > 100 ? noteData.text.substring(0, 100) + "..." : noteData.text;

            const viewNoteBtn = document.createElement("button");
            viewNoteBtn.classList.add("view-note-btn");
            viewNoteBtn.textContent = "View Note";
            viewNoteBtn.addEventListener("click", () => {
                if (noteContent.textContent === noteData.text) {
                    noteContent.textContent = noteData.text.length > 100 ? noteData.text.substring(0, 100) + "..." : noteData.text;
                    viewNoteBtn.textContent = "View Note";
                } else {
                    noteContent.textContent = noteData.text;
                    viewNoteBtn.textContent = "Collapse Note";
                }
            });

            const deleteNoteBtn = document.createElement("button");
            deleteNoteBtn.classList.add("delete-note-btn");
            deleteNoteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash can icon
            deleteNoteBtn.addEventListener("click", async () => {
                if (confirm("Are you sure you want to delete this note?")) {
                    await deleteDoc(doc.ref);
                    loadNotes();
                }
            });

            noteDiv.appendChild(noteDate);
            noteDiv.appendChild(noteContent);
            noteDiv.appendChild(viewNoteBtn);
            noteDiv.appendChild(deleteNoteBtn);
            notesSection.appendChild(noteDiv);
        });
    }
}

// Event listeners for opening modals
viewGalleryBtn.addEventListener("click", function() {
    loadImages();
    galleryModal.style.display = "block";
});

viewNotesBtn.addEventListener("click", function() {
    alert("Viewing Notes");
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