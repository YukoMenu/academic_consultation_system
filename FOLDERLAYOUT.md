[Folder Layout of Project]

|root-project/
├─── cert/
|   |   server.cert
|   |   server.key
├─── data/
|   |   courses.json
├─── db/
|   |   database.db
|   |   database.js
|
├─── frontend/
|   ├─── admin/
|   |   ├─── activity-logs/
|   |   |   |   activity-logs.css           [comment]: # Same content with appointment files (dashboard.html, css, you get the gist), along with other folders
|   |   |   |   activity-logs.html
|   |   |   |   activity-logs.js
|   |   ├─── class-management/
|   |   ├─── dashboard/
|   |   ├─── settings/
|   |   ├─── user-management/
|   |
|   |   index.html
|   |   main.js
|   |   styles.css
|   |
|   ├───faculty/
|   |   ├─── appointment/
|   |   ├─── availability/
|   |   ├─── class-list/
|   |   ├─── dashboard/                          
|   |   ├─── documents/
|   |   ├─── feedback/
|   |   ├─── form/
|   |   ├─── history/
|   |   ├─── img/
|   |   ├─── inbox/
|   |   ├─── notifications/
|   |   ├─── profile/
|   |   
|   |   index.html
|   |   main.js
|   |   styles.css
|   |
|   ├─── login/
|   |   |   login.css
|   |   |   login.html
|   |   |   login.js
|   |
|   ├─── student/
|   |   ├─── appointment/
|   |   ├─── dashboard/
|   |   ├─── documents/
|   |   ├─── feedback/
|   |   ├─── history/
|   |   ├─── img/
|   |   ├─── inbox/
|   |   ├─── notifications/
|   |   ├─── profile/
|   |   
|   |   index.html
|   |   main.js
|   |   styles.css
|
├─── routes/
|   |   auth.js
|   |   classes.js
|   |   consultation.js
|   |   faculty-availability.js
|   |   getuser.js
|   |   setuser.js
|   |   users.js
|
|   .gitignore
|   package-lock.json
|   package.json
|   README.md
|   server.js
