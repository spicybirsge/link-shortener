//require('dotenv').config()
require('./mongo')()
const express = require("express")
const app = express()
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
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
                    return res.send("Redirecting process was cancelled since the url to be redirected is a scam/phishing/ip grabber URL.")
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
      
      const ID = Math.floor(Math.random() * Date.now()).toString(36)
      links.findOne({name:name}, async (err, data) => {
          if(data) {
              return res.render('error.ejs', { error: 'This name is already claimed by someone else!' })
          } else {
              new links({link: link, name: name, ID: ID, created: Date.now()}).save()
              return res.render('success.ejs', { link: `${url}${name}` })
          }
      })
   
  })
  
  app.listen(5000, () => { 
      console.log('App Started!') 
    });
