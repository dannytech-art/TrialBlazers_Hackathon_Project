require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 1010;
const router = require('./router/paymentRouter')
const sequelize = require('./database/databases');
app.use(express.json());
app.use('/payment',router)


const startServer = async () => {
    try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully');
     app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});    
  } catch (error) {
    console.error(`Unable to connect to the database: ${error.message}`);
  }
};

startServer();
