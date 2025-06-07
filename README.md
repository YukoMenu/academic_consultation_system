# Academic-Consultation-System

This project was done as one of our requirements to complete Software Design.

How to operate

1. Paste the commands onto the terminal and install the following

    npm install express
    npm install express-session
    npm install puppeteer handlebars


2. Create a server.cert and server.key

    Open a new terminal, Git Bash
    mkdir -p cert
    openssl req -nodes -new -x509 -keyout cert/server.key -out cert/server.cert -days 365


3. For summarizer dependencies

    npm install dotenv
    npm install dotenv axios
    npm install ibm-watson@7 ibm-cloud-sdk-core


4. Create an empty .env file on the root project, and inside:
    HF_API_KEY=your_huggingface_api_key_here


5. To start the server, type "node server.js" in terminal


6. https://your-local-ipv4:3000/login  -- to access the login page in your browser, which will show up in your terminal anyway


7. Make sure to allow incoming traffic through your system firewall.

    Open Control Panel → Windows Defender Firewall.

    Click Advanced Settings (left pane).

    In Inbound Rules, click New Rule.

    Select Port → Click Next.

    Choose TCP and enter your port (e.g., 3000).

    Allow the connection.

    Choose the profiles (Private, Public, Domain) — select Private for LAN.

    Name the rule anything you want (e.g., Node.js LAN Server).