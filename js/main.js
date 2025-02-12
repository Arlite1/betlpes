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
                xpRequired: 20,
                showTooltip: false
            },
            {
                title: 'Level 5',
                description: 'Bronze tier',
                reward: 'Bronze Pack',
                color: '#854d0e',
                shape: 'diamond',
                xpRequired: 50,
                showTooltip: false
            },
            {
                title: 'Level 10',
                description: 'Silver tier',
                reward: 'Silver Pack',
                color: '#71717a',
                shape: 'star',
                xpRequired: 100,
                showTooltip: false
            }
        ],
        showEditor: false,
        editingIndex: null,
        editingCheckpoint: {},
        showLoader: false,
        savedBattlepasses: {},
        currentLevel: 0,
        progressPercentage: 0,
        currentBattlepassId: null,
        currentXP: 0,

        get maxXP() {
            return Math.max(...this.checkpoints.map(cp => cp.xpRequired));
        },

        init() {
            this.loadSavedBattlepasses();
            this.calculateProgress();
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
                this.currentXP = battlepass.currentXP || 0;
                this.currentBattlepassId = id;
                this.calculateProgress();
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
                xpRequired: this.checkpoints.length * 20, // Default XP requirement
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
            const saveOptions = this.currentBattlepassId ? 
                ['Create New', 'Overwrite Current', 'Cancel'] : 
                ['Save', 'Cancel'];

            const choice = this.currentBattlepassId ?
                confirm('Do you want to overwrite the current battlepass?\nClick OK to overwrite, Cancel to create new.') :
                true;

            if (choice === null) return; // User clicked Cancel

            const title = prompt('Enter a name for your battlepass:', 
                choice && this.currentBattlepassId ? 
                    this.savedBattlepasses[this.currentBattlepassId].title : 
                    'My Battlepass'
            );

            if (title) {
                const battlepass = {
                    id: choice ? this.currentBattlepassId || Date.now().toString() : Date.now().toString(),
                    title: title,
                    checkpoints: this.checkpoints,
                    currentXP: this.currentXP,
                    createdAt: choice && this.currentBattlepassId ? 
                        this.savedBattlepasses[this.currentBattlepassId].createdAt : 
                        new Date().toISOString()
                };

                const battlepasses = JSON.parse(localStorage.getItem('battlepasses') || '{}');
                battlepasses[battlepass.id] = battlepass;
                localStorage.setItem('battlepasses', JSON.stringify(battlepasses));

                // Update current ID if we created a new save
                if (!choice) {
                    this.currentBattlepassId = battlepass.id;
                }

                alert(`Battlepass "${title}" ${choice ? 'updated' : 'saved'} successfully!`);
            }
        },

        viewBattlepass() {
            if (this.currentBattlepassId) {
                const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                window.location.href = `${currentPath}view.html?id=${this.currentBattlepassId}`;
            } else {
                alert('Please save your battlepass first!');
            }
        },

        deleteBattlepass(id) {
            if (confirm('Are you sure you want to delete this battlepass? This action cannot be undone.')) {
                const battlepasses = JSON.parse(localStorage.getItem('battlepasses') || '{}');
                delete battlepasses[id];
                localStorage.setItem('battlepasses', JSON.stringify(battlepasses));
                this.loadSavedBattlepasses(); // Refresh the list
            }
        },

        calculateProgress() {
            // Calculate XP progress using the highest XP requirement
            this.progressPercentage = (this.currentXP / this.maxXP) * 100;
            
            // Calculate current level based on completed checkpoints
            const completedCheckpoints = this.checkpoints.filter(cp => this.currentXP >= cp.xpRequired).length;
            this.currentLevel = Math.max(0, completedCheckpoints - 1);
        }
    }));

    // New component for the viewer
    Alpine.data('battlepassViewer', () => ({
        battlepassFound: false,
        battlepass: null,
        currentXP: 0,
        currentLevel: 0,
        progressPercentage: 0,

        init() {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');

            if (id) {
                const battlepasses = JSON.parse(localStorage.getItem('battlepasses') || '{}');
                const battlepass = battlepasses[id];

                if (battlepass) {
                    this.battlepass = battlepass;
                    this.currentXP = battlepass.currentXP || 0;
                    this.battlepassFound = true;
                    this.calculateProgress();
                }
            }
        },

        get maxXP() {
            return this.battlepass ? Math.max(...this.battlepass.checkpoints.map(cp => cp.xpRequired)) : 0;
        },

        calculateProgress() {
            if (this.battlepass) {
                this.progressPercentage = (this.currentXP / this.maxXP) * 100;
                
                const completedCheckpoints = this.battlepass.checkpoints.filter(cp => this.currentXP >= cp.xpRequired).length;
                this.currentLevel = Math.max(0, completedCheckpoints - 1);
            }
        },

        showTooltip(index) {
            this.battlepass.checkpoints[index].showTooltip = true;
        },

        hideTooltip(index) {
            this.battlepass.checkpoints[index].showTooltip = false;
        }
    }));
}); 