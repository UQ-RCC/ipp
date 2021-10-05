
# Dev environment
## Setup ipp-userinfo
* Setup a postgres server (does not matter whether it is container or not)
* Clone https://github.com/UQ-RCC/ipp-userinfo
* >cd ipp-userinfo
* >python3 -m venv venv
* >pip3 install -r requirements.txt
* >cp conf/ippuserinfo.conf.example conf/ippuserinfo.conf 
* replace xxx with real values
* To test run
>uvicorn userinfo.main:userinfoapi --port 8000

## Setup ipp
* To use UQ backend, make sure you are inside UQ VPN
* Clone this repo
* Make sure you have yarn (1.2.xx) installed
* >yarn install
* >yarn serve
