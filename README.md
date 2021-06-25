# marvel-api

Steps to run:
1. Download redis (https://redis.io/download) and unzip it in your local machine. Execute redis-server.exe
2. Copy secret file provided in the email and paste in just outside the project folder ![image](https://user-images.githubusercontent.com/35554291/123448517-9654f080-d60d-11eb-9a00-f37ae8ae1d78.png)
3. Navigate to project folder.
4. Run "yarn" or "npm i"
5. Run "node app.js"
6. List of api samples: 
  i. http://localhost:8080/characters
  ii. http://localhost:8080/characters/1017100
6. To run unit test, make sure that "node app.js" is not running. run "npm test"
7. Swagger UI is available at "http://localhost:8080/api-docs"
8. To clear the cache, go to the redis folder and run redis-cli.exe. Execute "flushall".

Note: 
I used Redis as the caching method. First, I recursively call the api, concating all individual API response in a temporary array, until all the data has been retrieved. Then I set the cache. To prepare for the possibility of new characters added at the source in the future, I set an expiration timer for the cache. For testing purposes, the period is set at 60,000 seconds. 

The first call to the characters API took around 40 - 55 seconds suring my dev test. 

![image](https://user-images.githubusercontent.com/35554291/123450688-9229d280-d60f-11eb-8444-d5f2e08316f6.png)

The subsequent call to the cache took around 15-25 milliseconds.

![image](https://user-images.githubusercontent.com/35554291/123450841-ba193600-d60f-11eb-9549-5b60ae315e09.png)
