# Overview

The main goal of this project is to learn and gain experience in developing a web app from scratch. This project was created based on the code-alongs on Udemy's `Web Developer Bootcamp` course by Colt Steele.

There are some bugs/improvements I still have to address as shown in the `Issues` tab, so I will try to improve this web app as time goes on!

## Technologies Used

- HTML/CSS/Javascript/EJS
- Bootstrap
- NodeJS & NPM
- Express
- MongoDB & Mongoose
- Other notable APIs/services/libraries:
  - Passport
  - Cloudinary
  - MapBox
  - Helmet

The course uses slightly older versions of tools mentioned above, but I made sure to use the most recent versions as of January 2022. A lot of research/troubleshooting involved to change the syntax/usages, but definitely worth it. :)

## Key concepts that I have learned from this project

- Using frontend tools
- RESTful APIs: Basic CRUD
- Working with NoSQL databases
- Applying authentication & authorization
- Using sessions & cookies
- Importance of security
- Using APIs/libs/frameworks & documentation

## Deploying on Heroku

Go to local app's top level folder

    cd <path-to-local-app-repo>

Login and follow instructions in the browser

    heroku login

If this is the first deployment, create an empty app

    heroku create

Check if heroku remote repo was added

    git remote -v

Generally, I commit any changes to my personal account first

    git add .
    git commit -m "commit message"
    git push origin main

And deploy!

    git push heroku main

## Tests

This project does not have any unit/integration tests. Most of the tests I have done is through the browser and console. For behind the scenes testing, I used `python`'s `requests` lib.

Eg., Some "bad" POST/PATCH requests are not possible through the browser due to client-side validation I have set up. So to test server-side validation, I have to send requests without the browser:

    import requests
    r = requests.post('http://localhost:3000/campgrounds', {'bad_key': 'bad_value'})
    r.content   # Show page contents
