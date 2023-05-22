require('dotenv').config()
require('./mongo')()
const express = require("express")
const app = express()
const logger = require('morgan');
app.set('view-engine', 'ejs')
app.use(logger('dev'));
const error = require('./middleware/error');
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(error)
const links = require('./database/links')
const fetch = require('node-fetch')
app.get('/', (req, res) => {
 
    res.render('index.ejs')
  })
  app.get('/:id', (req, res) => {
    const name = req.params.id
    links.findOne({name:name}, async (err, data) => {
        if(data) {
            const f = await fetch('https://anti-fish.bitflow.dev/check', {
                    method: 'POST',
                    body: JSON.stringify({
                        message: data.link
                    }),
          headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "https://linkshrt.cf/ - Just a redirect service checking if a url is a scam.",
                    
                    }
                })
                if(f.status === 200) {
                    return res.status(451).send("Redirecting process was cancelled since the url to be redirected is a scam/phishing/ip grabber URL.")
                }
            const link1 = data.link
            if(data.link.startsWith("https://")) {
                link = link1
                return res.redirect(link)
               
            } else {
                if(data.link.startsWith("http://")) {
                    link = link1
                    return res.redirect(link)
                } else {
                    link = `https://${data.link}`
                    return res.redirect(link)
                }
            }
            
        } else {
            res.status(404)
            return res.send("Error 404: Page Not Found")
        }
    })
  })
  app.post('/', (req, res) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl
      const link = req.body.link
      const name = req.body.name
      const regex =   /([-a-zA-Z0-9_-]{2,256}\.[a-z]{2,10})(?:\/(\S*))?\b/g;
      if(!regex.test(link)) {
          return res.render('error.ejs', { error: 'Error: Please enter a valid link!' })
      }
      const ID = Math.floor(Math.random() * Date.now()).toString(36)
      links.findOne({name:name}, async (err, data) => {
          if(data) {
              return res.render('error.ejs', { error: 'Error: This URL is already taken by someone else!' })
          } else {
              new links({link: link, name: name, ID: ID, created: Date.now()}).save()
              return res.render('success.ejs', { link: `${url}${name}` })
          }
      })
   
  })
  
  app.listen(process.env.PORT || 5000, () => { 
      console.log('App Started!') 
    });
