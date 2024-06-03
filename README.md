# nest-next

# API
Create .env file and put database creds there
example:
DB_DIALECT="postgres"
DB_HOST="localhost"
DB_PORT=5432
DB_USER="postgres"
DB_PASS="postgres"
DB_NAME="db_name"

Run nest app locally with 'npm run start:dev -- -b swc'

# UI
Create .env.local file with following line
example:
NEXT_PUBLIC_API_URL=http://localhost:8000

Run nextJS app with 'npm run dev'

# User experience
Click 'Add independent user' to add new root user
You can drag'n'drop users to change ordering and to assign a supervisor. 
Simply drag record under desired supervisor with identation.

![image](https://github.com/petr-istratov/nest-next/assets/11350849/6796f21c-2e1b-41de-9b36-6ffe8a6012b1)

On the right side you can also see the total count of subordinates for each supervisor
By using context menu there are options to add a new user under selected supervisor or delete* user.

*Note that the user cannot be deleted unless he doesn't have any child records

