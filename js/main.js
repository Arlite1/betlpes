// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website loaded successfully!');
    
    // Add smooth scrolling to navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Here you would typically send the form data to a server
            // For now, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
});

// Define Alpine.js data and functions
document.addEventListener('alpine:init', () => {
    Alpine.data('battlepassCreator', () => ({
        checkpoints: [
            {
                title: 'Level 1',
                description: 'Starting point',
                reward: 'Basic Skin',
                color: '#2563eb',
                shape: 'circle',
                showTooltip: false
            },
            {
                title: 'Level 5',
                description: 'Bronze tier',
                reward: 'Bronze Pack',
                color: '#854d0e',
                shape: 'diamond',
                showTooltip: false
            },
            {
                title: 'Level 10',
                description: 'Silver tier',
                reward: 'Silver Pack',
                color: '#71717a',
                shape: 'star',
                showTooltip: false
            }
        ],
        showEditor: false,
        editingIndex: null,
        editingCheckpoint: {},
        showLoader: false,
        savedBattlepasses: {},

        init() {
            this.loadSavedBattlepasses();
        },

        loadSavedBattlepasses() {
            this.savedBattlepasses = JSON.parse(localStorage.getItem('battlepasses') || '{}');
        },

        showLoadModal() {
            this.loadSavedBattlepasses(); // Refresh the list
            this.showLoader = true;
        },

        closeLoadModal() {
            this.showLoader = false;
        },

        loadBattlepass(id) {
            if (confirm('Loading a battlepass will replace your current work. Continue?')) {
                const battlepass = this.savedBattlepasses[id];
                this.checkpoints = battlepass.checkpoints;
                this.closeLoadModal();
            }
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        },

        addCheckpoint() {
            this.checkpoints.push({
                title: `Level ${this.checkpoints.length + 1}`,
                description: 'New checkpoint',
                reward: 'Mystery Reward',
                color: '#2563eb',
                shape: 'circle',
                showTooltip: false
            });
        },

        removeLastCheckpoint() {
            if (this.checkpoints.length > 2) {
                this.checkpoints.pop();
            }
        },

        showTooltip(index) {
            this.checkpoints[index].showTooltip = true;
        },

        hideTooltip(index) {
            this.checkpoints[index].showTooltip = false;
        },

        editCheckpoint(index) {
            this.editingIndex = index;
            this.editingCheckpoint = { ...this.checkpoints[index] };
            this.showEditor = true;
        },

        saveCheckpoint() {
            this.checkpoints[this.editingIndex] = { ...this.editingCheckpoint };
            this.closeEditor();
        },

        closeEditor() {
            this.showEditor = false;
            this.editingIndex = null;
            this.editingCheckpoint = {};
        },

        deleteCheckpoint() {
            if (this.checkpoints.length > 2) {
                if (confirm('Are you sure you want to delete this checkpoint?')) {
                    this.checkpoints.splice(this.editingIndex, 1);
                    this.closeEditor();
                }
            } else {
                alert('Cannot delete checkpoint. Minimum 2 checkpoints required.');
            }
        },

        saveBattlepass() {
            const title = prompt('Enter a name for your battlepass:', 'My Battlepass');
            if (title) {
                const battlepass = {
                    id: Date.now().toString(),
                    title: title,
                    checkpoints: this.checkpoints,
                    createdAt: new Date().toISOString()
                };

                const battlepasses = JSON.parse(localStorage.getItem('battlepasses') || '{}');
                battlepasses[battlepass.id] = battlepass;
                localStorage.setItem('battlepasses', JSON.stringify(battlepasses));

                alert(`Battlepass "${title}" saved successfully!`);
            }
        },

        viewBattlepass() {
            // Get the latest saved battlepass
            const battlepasses = JSON.parse(localStorage.getItem('battlepasses') || '{}');
            const latestId = Object.keys(battlepasses).pop();
            
            if (latestId) {
                // Get the current directory path
                const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                window.location.href = `${currentPath}view.html?id=${latestId}`;
            } else {
                alert('No saved battlepass found. Save your battlepass first!');
            }
        }
    }));

    // New component for the viewer
    Alpine.data('battlepassViewer', () => ({
        battlepassFound: false,
        battlepass: null,
        currentLevel: 2, // This could be stored/loaded from somewhere
        progressPercentage: 0,

        init() {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');

            if (id) {
                const battlepasses = JSON.parse(localStorage.getItem('battlepasses') || '{}');
                const battlepass = battlepasses[id];

                if (battlepass) {
                    this.battlepass = battlepass;
                    this.battlepassFound = true;
                    this.calculateProgress();
                }
            }
        },

        calculateProgress() {
            const totalLevels = this.battlepass.checkpoints.length - 1;
            this.progressPercentage = (this.currentLevel / totalLevels) * 100;
        },

        showTooltip(index) {
            this.battlepass.checkpoints[index].showTooltip = true;
        },

        hideTooltip(index) {
            this.battlepass.checkpoints[index].showTooltip = false;
        }
    }));
}); 