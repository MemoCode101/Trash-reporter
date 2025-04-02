import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    GeoPoint
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNqPyu-TDSiLWTNY-54DiwEq6zKuPGnwQ",
    authDomain: "trash-detector-58bb6.firebaseapp.com",
    projectId: "trash-detector-58bb6",
    storageBucket: "trash-detector-58bb6.appspot.com",
    messagingSenderId: "989108826823",
    appId: "1:989108826823:web:ea4230111588a87a7ec4e2",
    measurementId: "G-HH0N5V6N7R"
};

// Initialize Firebase only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Make available globally
window.db = db;
window.auth = auth;
window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = "../public/login.html";
    }).catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const blockSelect = document.getElementById("blockSelect");
    const floorSelect = document.getElementById("floorSelect");
    const areaSelect = document.getElementById("areaSelect");
    const reportForm = document.getElementById("reportForm");
    const submitBtn = document.getElementById("submitBtn");

    // Floor Mapping for Each Block
    const floorOptions = {
        "M Block": ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"],
        "E Block": ["1st Floor", "2nd Floor", "3rd Floor"]
    };

    // Area Mapping for Each Floor
    function getAreas(block, floor) {
        if (!block || !floor) return [];
        const areas = [];
        for (let i = 1; i <= 6; i++) {
            areas.push(`${block.charAt(0)}${floor[0]}0${i}`);
        }
        areas.push("Toilet Area");
        return areas;
    }

    // Populate Floors Based on Block Selection
    blockSelect.addEventListener("change", () => {
        const selectedBlock = blockSelect.value;
        floorSelect.innerHTML = '<option value="" disabled selected>Select a Floor</option>';
        floorSelect.disabled = false;
        areaSelect.innerHTML = '<option value="" disabled selected>Select an Area</option>';
        areaSelect.disabled = true;

        floorOptions[selectedBlock].forEach(floor => {
            const option = document.createElement("option");
            option.value = floor;
            option.textContent = floor;
            floorSelect.appendChild(option);
        });
    });

    // Populate Areas Based on Floor Selection
    floorSelect.addEventListener("change", () => {
        const selectedBlock = blockSelect.value;
        const selectedFloor = floorSelect.value;

        areaSelect.innerHTML = '<option value="" disabled selected>Select an Area</option>';
        areaSelect.disabled = false;

        getAreas(selectedBlock, selectedFloor).forEach(area => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    });

    // Extract GPS data from image
    async function extractGPS(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    try {
                        EXIF.getData(img, function() {
                            const lat = EXIF.getTag(this, "GPSLatitude");
                            const lon = EXIF.getTag(this, "GPSLongitude");
                            const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
                            const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

                            if (lat && lon) {
                                const latitude = convertDMSToDD(lat) * (latRef === "N" ? 1 : -1);
                                const longitude = convertDMSToDD(lon) * (lonRef === "E" ? 1 : -1);
                                resolve({ latitude, longitude });
                            } else {
                                resolve(null);
                            }
                        });
                    } catch (error) {
                        console.error("EXIF error:", error);
                        resolve(null);
                    }
                };
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }

    function convertDMSToDD(dms) {
        return dms[0] + (dms[1] / 60) + (dms[2] / 3600);
    }

    // Form submission
    reportForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const block = blockSelect.value;
        const floor = floorSelect.value;
        const area = areaSelect.value;
        const additionalDetails = document.getElementById("additionalDetails").value.trim();
        const file = document.getElementById("trashPhoto").files[0];

        // Validate required fields
        if (!block || !floor || !area) {
            alert("Please select block, floor, and area.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {
            let imageUrl = null;
            let geoPoint = null;

            // Handle file upload if exists
            if (file) {
                try {
                    // Upload file
                    const fileRef = ref(storage, `trash_reports/${Date.now()}_${file.name}`);
                    await uploadBytes(fileRef, file);
                    imageUrl = await getDownloadURL(fileRef);

                    // Extract GPS data
                    const gpsData = await extractGPS(file);
                    if (gpsData) {
                        geoPoint = new GeoPoint(gpsData.latitude, gpsData.longitude);
                    }
                } catch (uploadError) {
                    console.error("Upload failed:", uploadError);
                    // Continue without photo if upload fails
                }
            }

            // Save report
            await addDoc(collection(db, "reports"), {
                block,
                floor,
                area,
                additionalDetails: additionalDetails || "None",
                imageUrl,
                location: geoPoint,
                status: "Pending",
                timestamp: serverTimestamp(),
                userId: auth.currentUser.uid
            });

            alert("Report submitted successfully!");
            window.location.href = "../public/index.html";
        } catch (error) {
            console.error("Submission error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Report";
        }
    });
});