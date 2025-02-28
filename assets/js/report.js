document.addEventListener("DOMContentLoaded", () => {
    const blockSelect = document.getElementById("blockSelect");
    const floorSelect = document.getElementById("floorSelect");
    const areaSelect = document.getElementById("areaSelect");

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
            areas.push(`${block.charAt(0)}${floor[0]}0${i}`); // Example: M101, E202
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

    // Submit Trash Report to Firebase
    document.getElementById("reportForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const block = blockSelect.value;
        const floor = floorSelect.value;
        const area = areaSelect.value;
        const additionalDetails = document.getElementById("additionalDetails").value.trim();

        if (!block || !floor || !area) {
            alert("Please select block, floor, and area.");
            return;
        }

        // Save report in Firestore
        await addDoc(collection(db, "reports"), {
            block: block,
            floor: floor,
            area: area,
            additionalDetails: additionalDetails || "None",
            status: "Pending",
            timestamp: serverTimestamp()
        });

        alert("Trash report submitted successfully!");
        window.location.href = "../public/index.html"; // Redirect back to dashboard
    });
});