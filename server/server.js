require('dotenv').config();

const app = require('./app');
const adminModel = require('./models/adminModel');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await adminModel.ensureAdminExists();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
