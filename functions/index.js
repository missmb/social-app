const functions = require('firebase-functions');
const admin = require('firebase-admin');

const app = require('express')();
admin.initializeApp();

const config = {
        apiKey: "AIzaSyBi2ajq3skca_pEDJpySfTl-aGSiIowb58",
        authDomain: "quickstart-1556501178330.firebaseapp.com",
        databaseURL: "https://quickstart-1556501178330.firebaseio.com",
        projectId: "quickstart-1556501178330",
        storageBucket: "quickstart-1556501178330.appspot.com",
        messagingSenderId: "355587390362",
        appId: "1:355587390362:web:703c9560b5cd87b76f5823",
        measurementId: "G-CWQNJJC53H"
};


const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req, res) => {
    // admin
    // .firestore()
    db
    .collection('screams')
    .orderBy('createAt', 'desc')
    .get()
    .then((data) => {
        let screams = [];
        data.forEach((doc) => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createAt: doc.data().createAt
            });
        });
        return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post('/scream', (req, res) => {
    const newScream = {
        body : req.body.body,
        userHandle : req.body.userHandle,
        createAt : new Date().toISOString()
    };

    // admin
    // .firestore()
    db
    .collection('screams')
    .add(newScream)
    .then((doc) => {
        res.json({ message: `documen ${doc.id} create successfully`});
    })
    .catch((err) => {
        res.status(500).json({ error : 'something went wrong'});
        console.error(err);
    });
});

//signup route
app.post('/signup', (req, res)=> {
    const newUser = {
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle : req.body.handle
    };

    // TODO validate data
    let token, userId;
    db.doc(`/user/${newUser.hendle}`).get()
    .then((doc) => {
        if(doc.exists){
            return res.status(400).json({handle: 'this handle is already token'});
        }else{
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    })
    .then((data) => {
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then((idToken) => {
        token = idToken;
        const userCredentials = {
            handle : newUser.handle,
            email : newUser.email,
            createAt : new Date().toISOString(),
            userId //can because same name
        };
        return db.doc(`/users/${newUser.handle}`).set (userCredentials);
    })
    .then(()=>{
        return res.status(201).json({token});
    })
    .catch((err) =>{
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({ email: 'Email is already is use'});
        }else{
            return res.status(500).json({ error: err.code});
        }
    });
});
//https://baseurl.com/api/

exports.api = functions.region('asia-east2').https.onRequest(app)
/*
"email" : "user@gmail.com",
"password" : "use1234",
"confirmPassword" : "use1234",
"handle" : "user"
*/