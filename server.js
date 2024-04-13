require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRoute = require('./routes/user-route')
const path = require('path')
const cors = require('cors')


const PORT = 8080 || process.env.PORT;

app.use(cors());

//Function to connect the db
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(`${error}`);
  }
};


//Middleware
app.use((req, res, next)=>{
    console.log(req.path, req.method);
    next();
})

app.get('/', (req, res) => res.send("Hello World"));


//Routes
app.use('/api/user',userRoute);

// app.use(express.static(path.join(__dirname, './client/build')))

// app.get("*", function (req, res) {
//     res.sendFile(path.join(__dirname, "./client/build/index.html"));
// });
//Connect to the database


try{
  connectDb().then(() =>{
    app.listen(PORT, ()=>{
      console.log('server is running on the port and connected to db', process.env.PORT);
      
  })
  }
    
  ).catch((error)=>{
    app.listen(PORT, ()=>{
      console.log('server is running on the port', process.env.PORT);
      
  })
  console.log(error);
  })


  }catch(error){
  console.log(error);
}

