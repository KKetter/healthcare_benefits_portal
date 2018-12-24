Github: https://github.com/KKetter/healthcare_calc
Heroku Link: healthcare-calc.herokuapp.com

---17 DEC 2018---
0920 - Initial Planning
  - API Listing
  - Website Navigation Wireframe
  - Intital View Wireframe
  - Page Scaffolding

1005 - Stand Up
  - HIPA Pivot: Due to federal law we can not store any PHI so value added must come from information org not personal reccomendations
  - Page Scaffold Complete - index, tracker, finder pages
  - server setup:
  - Create a package for JSON file	
  - Enable Javascript framework that allows us to run npi
  - Enable Cross origin resource sharing to allow sharing in the same domain.	
  - Create Basic Server
  - Database Config
  - Connect to DB
  - Handle Middleware
  - Setup view engine
  - Set up error management
  - branch "server"

1030 - github setup
  - final updates w/ readme setup.  ACP into github repo and local machines pulled w/ packages installed
  - branch "page-scaffold"

1100 - heroku
  - heroku deployment setup , push all updates into master

1150 - EJS
  - added ejs to head, header, footer w/ jquery script added
  - started work on index page

1200-1300 Lunch Break
  - discussion about value added with HIPA pivot. touched base with BN to discuss this afternoon

1400 - Routes
  - server.js routes now operational

1400-1630 - Healthcare.gov API setup Failure
  - .gov API (XML) giving us issues with setup. Contact BN about further plans
  - betterdoctor API might work better - try this on 18 Dec

  ---18 DEC 2018---

  0900-1030 Swapped to BD API, appears the team tried to both resolve BD API issues and location issues at the same time.  Front end wireframes improved, discussion of colors/comparison to healthcare sites.  "Healthcare Blue" discovered and finalized as primary colorway

  1030-1145 Identified location routes were not working, unable to assign any location information to hit google API.  Mocking data to try to push past front end issues discussed but not yet implemented.  Hide/Show styling added to front page

  1200-1300 Lunch

  1300 Swapped programming pairs to Mike/Joe to try to resolve back end issues.  Front end team continued to drop in containers/fill in content on pages

  1400-1600 dropping try to resolve both APIs and "solved" location issues.  Loc funcational is "working" at this time.  Mock data implemented

  ---19 DEC 2018---

  0900 Mike F swapped to front end team to knock out styling asap.  index page 95% finalized

  0900-1100 Tried to resolve BD routing issues unsuccessfully.  finderForm.ejs created

  1100-1230 Mandatory team lunch because we are all code blind on the back end - Karaage + Beer communal meal trying to get back on the same page

  1300-1700 Back end failures mounting, realization at 1900 that the "working" Location function was very "hacky" and was the core issue with progressing BD API integration

---20 DEC 2019---

0900-1200 Location issues working after restarting from book_app

1200-1600 BD API now providing objects with information, adjusting routes in ejs files to populate results page.

1600-1700 Implemented forEach loop for providers to show 10.  MVP reached

---21 DEC 2019---

0900-1030 Finalized presentation format/flow


