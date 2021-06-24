import csv
import math
import os
import sys
import time
import requests
import json
import argparse
import datetime
import time
from flask_mail import Mail, Message
from flask import Flask, request, render_template, flash, redirect, url_for, session, Blueprint,jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def run_query(query, variables={}):
    body = {
        'query': query,
        'variables': variables
    }
    response = _make_post_call(body)
    if response.get('data') is not None:
        return response
    raise RuntimeError('query failed: ' + str(response))


def _make_post_call(body):
    url = "https://rkwap-heroku.hasura.app/v1/graphql"
    headers = {
        'Content-type': 'application/json',
        'x-hasura-admin-secret': "ceHA0ixak3z76FC1Nkup6NdCqC6bh6HQd1dMPwT8wbACLwcaiUeDII640FeHhit7"
    }
    # print("HASURA_CLIENT_POST_CALL")
    # print("URL : " + url)
    # print("BODY : " + str(body))
    response = requests.post(url, json=body, headers=headers, timeout=10)
    # print("RESPONSE : " + str(response.json()))
    return response.json()


## Configuring Flask-Mail
app.config.update(
	DEBUG=True,
	#EMAIL SETTINGS
	MAIL_SERVER='smtp.gmail.com',
	MAIL_PORT=465,
	MAIL_USE_SSL=True,
	MAIL_USERNAME = 'admin@gmail.com',
	MAIL_PASSWORD = 'password'
	)
mail = Mail(app)


def send_mail(title,sender,recipients,message_html):
    msg = Message(title,
        sender=sender,
        recipients=recipients)
    msg.html = message_html
    mail.send(msg)
    return ("Mail Sent")





# Importing Blueprints
from app.views.main import main
# Registering Blueprints
app.register_blueprint(main)
