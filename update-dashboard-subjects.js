const fs = require('fs');

// Read current dashboard.html
let dashboard = fs.readFileSync('dashboard.html', 'utf8');

// Subject list exactly matching your Firebase subject_id values
const subjectsList = [
    { id: "medical-surgical-nursing", name: "Medical Surgical Nursing", icon: "🩺", count: "87+" },
    { id: "first-aid-and-emergency", name: "First Aid & Emergency", icon: "🚑", count: "390+" },
    { id: "anatomy-and-physiology", name: "Anatomy & Physiology", icon: "🫀", count: "600+" },
    { id: "pharmacology", name: "Pharmacology", icon: "💊", count: "740+" },
    { id: "pediatric-nursing", name: "Pediatric Nursing", icon: "🧒", count: "780+" },
    { id: "obstetrics-and-gynaecology", name: "Obstetrics & Gynaecology", icon: "👶", count: "850+" },
    { id: "mental-health-nursing", name: "Mental Health Nursing", icon: "🧠", count: "670+" },
    { id: "community-health-nursing", name: "Community Health Nursing", icon: "🏘️", count: "920+" },
    { id: "nursing-management", name: "Nursing Management", icon: "📊", count: "540+" },
    { id: "microbiology", name: "Microbiology", icon: "🔬", count: "510+" },
    { id: "research-and-statistics", name: "Research & Statistics", icon: "📈", count: "420+" },
    { id: "nursing-foundation", name: "Nursing Foundation", icon: "🏛️", count: "980+" },
    { id: "nutrition", name: "Nutrition", icon: "🥗", count: "360+" },
    { id: "biochemistry", name: "Biochemistry", icon: "🧪", count: "300+" },
    { id: "pathology", name: "Pathology", icon: "🔍", count: "440+" },
    { id: "infection-control", name: "Infection Control", icon: "🧼", count: "260+" }
];

// Generate subjects grid HTML
let subjectsGridHTML = '<div class="subjects-grid">';
subjectsList.forEach(sub => {
    subjectsGridHTML += `
        <div class="subject-card" onclick="window.location.href='subjects.html?subject=${sub.id}&name=${encodeURIComponent(sub.name)}'">
            <div>
                <div class="subject-name">${sub.icon} ${sub.name}</div>
                <div class="subject-count">${sub.count} MCQs available</div>
            </div>
            <i class="fas fa-chevron-right" style="color:#e74c3c;"></i>
        </div>
    `;
});
subjectsGridHTML += '<div class="subject-card" onclick="window.location.href=\'doubt.html\'"><div><div class="subject-name">❓ Doubt Section</div><div class="subject-count">Ask doubts related to nursing subjects</div></div><i class="fas fa-chevron-right" style="color:#e74c3c;"></i></div>';
subjectsGridHTML += '<div class="subject-card" onclick="window.location.href=\'contact.html\'"><div><div class="subject-name">🆘 Support</div><div class="subject-count">Contact support for help and assistance</div></div><i class="fas fa-chevron-right" style="color:#e74c3c;"></i></div>';
subjectsGridHTML += '</div>';

// Find and replace subjects grid in dashboard.html
const startMarker = '<div class="subjects-grid" id="subjectsGrid">';
const endMarker = '</div>';
const oldGridRegex = /<div class="subjects-grid" id="subjectsGrid">[\s\S]*?<\/div>/;
const newGrid = `<div class="subjects-grid" id="subjectsGrid">${subjectsGridHTML.substring(22)}`;

if (dashboard.includes(startMarker)) {
    dashboard = dashboard.replace(oldGridRegex, newGrid);
    fs.writeFileSync('dashboard.html', dashboard);
    console.log('✅ Dashboard subjects list updated successfully!');
} else {
    console.log('⚠️ Could not find subjects grid in dashboard.html');
}
